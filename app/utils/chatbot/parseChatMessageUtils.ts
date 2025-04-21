import { DockerResponseObject } from "~/types/chatbot-types";

export function getDockerResponseFromMessages(chatMessages: { assistant: string; user: string }[]): DockerResponseObject | null {
  if (!chatMessages || chatMessages.length === 0) {
    return null;
  }
 
  const lastMessage = chatMessages[chatMessages.length - 1];
 
  if (!lastMessage || !lastMessage.assistant) {
    return null;
  }
 
  try {
    const assistantContent = lastMessage.assistant.trim();
    console.log("Attempting to parse Docker response from:", assistantContent);
    
    // Try JSON parsing first
    if (assistantContent.includes('"host"') && assistantContent.includes('"url"')) {
      try {
        const parsedObject = JSON.parse(assistantContent);
        
        if (parsedObject && 
            typeof parsedObject === 'object' && 
            'host' in parsedObject && 
            'url' in parsedObject) {
          console.log("Successfully parsed Docker JSON:", parsedObject);
          return {
            host: parsedObject.host,
            url: parsedObject.url
          };
        }
      } catch (jsonError) {
        console.log("JSON parsing failed:", jsonError);
        // Continue to regex approach
      }
    }
    
    // Fallback to regex for non-JSON format
    const regex = /\{(?:"|)host(?:"|):\s*(?:"|)([^,"]+)(?:"|),\s*(?:"|)url(?:"|):\s*(?:"|)([^}"]+)(?:"|)\}/;
    const match = assistantContent.match(regex);
    
    if (match) {
      console.log("Successfully parsed Docker with regex:", { host: match[1].trim(), url: match[2].trim() });
      return {
        host: match[1].trim(),
        url: match[2].trim()
      };
    }
    
    console.log("Message doesn't match Docker response format");
  } catch (error) {
    console.log("[chatMessageUtils] [getDockerResponse] ERROR:", error);
    return null;
  }
 
  return null;
}