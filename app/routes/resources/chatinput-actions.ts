import { ActionFunction, data } from "@remix-run/node";
import { getJwtAccess, getUsernameFromCookie } from "~/utils/auth/cookieUtils";
import { getUserChatMessages } from "~/utils/chatbot/chatUtils";
import { convertToLlmMessages, validateAndCleanLlmMessages } from "~/utils/llm/ssLlmUtils";
import { sendNewMessageToRedis } from "~/utils/chatbot/messageUtils";
import { apiCallerLLm } from "~/utils/llm/apiCallerLlmUtils";


export interface ChatActionResponse {
  newMessage?: {
    assistant: string;
    user: string;
  };
  error?: string;
}

export const action: ActionFunction = async ({ request }) => {
  try {
    console.log("CHATINPUT ACTION FUNCTION CALLED");
    const formData = await request.formData();
    
    const message = formData.get("message");
    const chatId = formData.get("chatId");
    const jwtAccess = await getJwtAccess(request);
    const username = await getUsernameFromCookie(request);
    
    // Get repoName from the request if available
    let containerName = "my-hardcoded-repoxx436"; // Default fallback
    const repoName = formData.get("repoName");
    
    if (repoName && repoName.toString().trim()) {
      containerName = repoName.toString();
    }

    console.log("CONTAINER NAME: ", containerName)

    if (!message) {
      return data<ChatActionResponse>({ error: "Message is required" }, { status: 400 });
    }
    if (!chatId) {
      return data<ChatActionResponse>({ error: "Chat ID is required" }, { status: 400 });
    }
    const topic = chatId.toString();
   
    if (!username || !topic) {
      return data<ChatActionResponse>({ error: "Invalid chat ID format" }, { status: 400 });
    }
    
    if (!jwtAccess) {
      return data<ChatActionResponse>({ error: "Authentication required" }, { status: 401 });
    }
    
    const currentMessages = await getUserChatMessages(username, topic, jwtAccess);
    const llmMessages = convertToLlmMessages(currentMessages);
    llmMessages.push({
      role: "user",
      content: message.toString()
    });
   
    const { cleanedMessages, error } = validateAndCleanLlmMessages(llmMessages, "generate");
    // console.log("CLEANED LLM MESSAGES: ", cleanedMessages);


    // Pass the callbacks to apiCallerLLm
    apiCallerLLm(cleanedMessages, containerName, username, jwtAccess, topic).catch(err => {
      console.error('API Caller error:', err);
      // Consider handling errors more gracefully, e.g., showing a message to the user
    });
    
    // Handle only the Fireworks response
    const fireworksResponse = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.FIREWORKS_API_KEY}`,
      },
      body: JSON.stringify({
        model: "accounts/adisubu-2410-3301d0/models/ssllm-v2p8-dep1",
        max_tokens: 400,
        top_p: 1,
        top_k: 40,
        presence_penalty: 0,
        frequency_penalty: 0,
        temperature: 0.2,
        messages: cleanedMessages,
      })
    });
    
    // Handle Fireworks response
    if (!fireworksResponse.ok) {
      const errorText = await fireworksResponse.text();
      throw new Error(`Fireworks API error: ${fireworksResponse.status} ${fireworksResponse.statusText}. ${errorText}`);
    }
    
    const responseData = await fireworksResponse.json();
    
    if (!responseData.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from Fireworks API');
    }
    
    const newMessage = {
      assistant: responseData.choices[0].message.content,
      user: message.toString()
    };
    
    await sendNewMessageToRedis(username, topic, newMessage);
    return data<ChatActionResponse>({ newMessage });
    
  } catch (error) {
    console.error('Action error:', error);
    return data<ChatActionResponse>({
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    }, { status: 500 });
  }
};
