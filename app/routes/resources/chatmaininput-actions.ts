import { ActionFunction, data } from "react-router";
import { generateChatUrl, generateNewChatTopic } from "~/utils/urlUtils";
import { getUsernameFromCookie, getJwtAccess } from "~/utils/auth/cookieUtils";
import { sendNewMessageToRedis } from "~/utils/chatbot/messageUtils";
import { convertToLlmMessages, validateAndCleanLlmMessages } from "~/utils/llm/ssLlmUtils";

interface ActionResponse {
  success: boolean;
  redirectUrl?: string;
  error?: string;
}

export const action: ActionFunction = async ({ request }) => {
  try {
    console.log("CHAT MAIN INPUT ACTION FUNCTION STARTED");

    const formData = await request.formData();
    const message = formData.get("message")?.toString();
    const deployedChats = JSON.parse(formData.get("deployedChats")?.toString() || "[]");
    const undeployedChats = JSON.parse(formData.get("undeployedChats")?.toString() || "[]");

    if (!message) {
      return data<ActionResponse>({ 
        success: false,
        error: "Message is required" 
      }, { status: 400 });
    }

    // Get username and JWT access token
    const username = await getUsernameFromCookie(request);
    const jwtAccess = await getJwtAccess(request);
    
    if (!username || !jwtAccess) {
      return data<ActionResponse>({ 
        success: false,
        error: "Authentication required" 
      }, { status: 401 });
    }

    // Generate new chat topic
    const allTopics = [
      ...deployedChats,
      ...undeployedChats.map((chat: any) => chat.topic)
    ];
    
    const newChatTopic = generateNewChatTopic(allTopics);

    // Prepare LLM messages - Add an empty assistant message to satisfy validation
    const llmMessages = [
      {
        role: "user",
        content: message
      },
      {
        role: "assistant",
        content: ""  // Empty content for validation
      }
    ];

    const { cleanedMessages, error: validationError } = validateAndCleanLlmMessages(llmMessages, "generate");
    
    if (validationError) {
      return data({
        success: false,
        error: validationError
      }, { status: 400 });
    }

    // Call Fireworks API
    const fireworksBody = {
      model: "accounts/adisubu-2410-3301d0/models/ssllm-v2p8-dep1",
      max_tokens: 400,
      top_p: 1,
      top_k: 40,
      presence_penalty: 0,
      frequency_penalty: 0,
      temperature: 0.2,
      messages: cleanedMessages.slice(0, -1) // Remove the empty assistant message
    };

    const fireworksResponse: any = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.FIREWORKS_API_KEY}`,
      },
      body: JSON.stringify(fireworksBody)
    }).then(async res => {
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Fireworks API error response:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(`Fireworks API error: ${errorData.message || 'No error message provided'}`);
        } catch (e) {
          throw new Error(`Fireworks API error: ${res.status} ${res.statusText}. Raw response: ${errorText}`);
        }
      }
      return res.json();
    });
       
    if (!fireworksResponse.choices?.[0]?.message?.content) {
      throw new Error('INVALID RESPONSE FROM FIREWORKS API');
    }

    // Store the new message
    const newMessage = {
      assistant: fireworksResponse.choices[0].message.content,
      user: message
    };

    await sendNewMessageToRedis(username, newChatTopic, newMessage);
    console.log("NEW MESSAGE SENT TO REDIS", newMessage);

    // await new Promise(resolve => setTimeout(resolve, 100));

    const redirectUrl = generateChatUrl(username, newChatTopic);

    return data<ActionResponse>({
      success: true,
      redirectUrl: redirectUrl
    }, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error: any) {
    console.error("[ChatMainInput Action] Error:", error);
    return data<ActionResponse>({
      success: false,
      error: error.message || "An error occurred"
    }, { status: 500 });
  }
}