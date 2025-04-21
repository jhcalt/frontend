import { UiMessage, LlmMessage } from "~/components/Chatbot/ChatConvoComponents/ChatBubbles";


const SYSTEM_PROMPT = "You are a deployment agent. Here is the project description: ";

export function convertToLlmMessages(uiMessages: UiMessage[]): LlmMessage[] {
    const llmMessages: LlmMessage[] = [];
    
    uiMessages.forEach(msg => {
      if (msg.user) {
        llmMessages.push({
          role: "user",
          content: msg.user
        });
      }
      if (msg.assistant) {
        llmMessages.push({
          role: "assistant",
          content: msg.assistant
        });
      }
    });
    
    return llmMessages;
  }

  
  export function validateAndCleanLlmMessages(
    messages: LlmMessage[],
    mode: "generate" | "default" = "generate"
  ): { cleanedMessages: LlmMessage[]; error: string | null } {

    const validRoles: LlmMessage["role"][] = ["system", "user", "assistant"];
    let systemMessageCount = 0;
    let lastRole: LlmMessage["role"] | null = null;
    const cleanedMessages: LlmMessage[] = [];

    // Get qrooperAnalysisResult from sessionStorage
    const qrooperAnalysisResult = typeof window !== 'undefined' ? sessionStorage.getItem("qrooperAnalysisResult") : null;

    // Add the system message if qrooperAnalysisResult exists
    if (qrooperAnalysisResult) {
      cleanedMessages.push({
        role: "system",
        content: `${SYSTEM_PROMPT}${qrooperAnalysisResult}`
      });
    }

    // Add the hardcoded initial assistant message for the LLM API call
    cleanedMessages.push({
        role: "assistant",
        content: "Hello! I'm here to deploy your codebase. Can you describe your project's tech stack?"
    });

    // Rule 1: Check if the messages array is empty
    if (!messages || messages.length < 1) {
      return { cleanedMessages: [], error: "Expected at least one message for a conversation." };
    }
  
    for (let i = 0; i < messages.length; i++) {
      const { role, content } = messages[i];
  
      // Rule 2: Validate role
      if (!validRoles.includes(role)) {
        return {
          cleanedMessages,
          error: `Invalid role "${role}". Only "system", "user", and "assistant" are supported.`,
        };
      }
  
      // Rule 3: Count SYSTEM messages and ensure there's only one
      if (role === "system") {
        systemMessageCount++;
        if (systemMessageCount > 1) {
          return {
            cleanedMessages,
            error: "Only one 'system' message is allowed.",
          };
        }
      }
  
      // Rule 4: Skip consecutive messages with the same role (except system)
      if (role === lastRole && role !== "system") {
        continue; // Skip adding this message to cleanedMessages
      }
  
      // Add valid message to cleanedMessages
      cleanedMessages.push({ role, content });
  
      // Update the lastRole tracker
      lastRole = role;
    }
  
    // Rule 5: Ensure the last message is 'assistant' if mode is 'generate'
    if (mode === "generate" && cleanedMessages[cleanedMessages.length - 1]?.role !== "assistant") {
      return {
        cleanedMessages,
        error: "The last message must have the role 'assistant' when mode is 'generate'.",
      };
    }
  
    // If all checks pass
    return { cleanedMessages, error: null };
  }
  

  export async function coldBootLlmCall() {
    const fireworksBody1 = {
      model: "accounts/fireworks/models/deepseek-v3",
      max_tokens: 4096,
      top_p: 1,
      top_k: 40,
      presence_penalty: 0,
      frequency_penalty: 0,
      temperature: 0.6,
      messages: [
            {
              role: "user",
              content : "hi"
            }
      ]
  }

  const fireworksResponse1 = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.FIREWORKS_API_KEY}`,
      },
      body: JSON.stringify(fireworksBody1)
    });

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
        messages: [
          {
            role: "user",
            content : "hi"
          }
    ]
      })
    });

    console.log("BOTH LLMS COLD BOOTED...")
    

  }