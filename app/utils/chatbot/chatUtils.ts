import { LlmMessage } from "~/components/Chatbot/ChatConvoComponents/ChatBubbles";
import { storeFetchedChatMessagesToRedis, checkRedisForMessages } from "./messageUtils";
import { apiFunction, responseLogging } from "~/tools/reusableFunctions";


export async function getUserChatMessages(username: string, topic: string, jwtAccess: string) {
  try {    
    // Step 1: Check Redis for cached messages
    // console.log(`[getUserChatMessages chatUtils] Getting messages for ${username}, ${topic}`);
    const redisMessages = await checkRedisForMessages(username, topic);
    
    if (redisMessages) {
      // console.log("[getUserChatMessages chatUtils] Found messages in Redis:", redisMessages);
      return redisMessages;
    } else if (!redisMessages) {
      console.log("[getUserChatMessages chatUtils] Messages not found in Redis. Fetching from DB now...");
      const dbMessages = await getUserChatMessagesFromDB(username, topic, jwtAccess);
      return dbMessages;
    } 
    
    return [];
  

  } catch (error: any) {
    console.error("[getUserChatMessages chatUtils] Error:", error.message || error);
    
    // Return empty array for new chats on error, throw for others
    if (topic.startsWith('New Chat')) {
      console.log("Error with new chat, returning empty array");
      return [];
    }
    
    throw new Error(error.message || "Failed to retrieve messages.");
  }
}

export async function getUserChatMessagesFromDB(
  username: string,
  topic: string,
  jwtAccess: string
) {
  const endpoint = `${process.env.SERVER_API_URL}/chats/get-messages/${encodeURIComponent(username)}/${encodeURIComponent(topic)}`;
 
  try {
    console.log(`[getUserChatMessagesFromDB] Fetching messages from DB for ${username}, ${topic}`);
    const response = await apiFunction(endpoint, "GET",jwtAccess);

    // First await the JSON parsing
    const responseData = await response.json();
    
    // Then handle logging if needed
    // console.log("[chatUtils.ts] getUserChatMessagesFromDB response:", responseData);

    if (!Array.isArray(responseData)) {
      console.error("Invalid response structure:", responseData);
      throw new Error("Invalid response format. Expected an array of objects.");
    }

    const messages = responseData.map((item: any) => {
      if (!item || typeof item.assistant !== "string" || typeof item.user !== "string") {
        console.error("Invalid message item:", item);
        throw new Error("Invalid message format. Each item must have 'assistant' and 'user' as strings.");
      }
     
      return {
        assistant: item.assistant,
        user: item.user,
      };
    });

    await storeFetchedChatMessagesToRedis(username, topic, messages);
    return messages;

  } catch (error: any) {
    console.error("[getUserChatMessagesFromDB] Error:", {
      message: error.message,
      stack: error.stack,
    });
   
    throw error;
  }
}

// working + tested
export async function updateUserChatTopic(currentTopic: string, newTopic: string, jwtAccess: string) {
  const endpoint = `${process.env.SERVER_API_URL}/chats/update`;

  const payload = {
    current_topic: currentTopic,
    new_topic: newTopic,
  };

  try {
    console.log("Payload:", payload);
      
    const response = await apiFunction(endpoint, "PATCH", jwtAccess, payload);

    const responseData = responseLogging(response, "[chatUtils.ts]", "updateUserChatTopic", false);

    
    return responseData;

  } 
  catch (error: any) {
    console.error("[chatUtils.ts] Error in updateTopic:", error);
    throw new Error(error.message || "Something went wrong while updating the topic.");
  }
}
  

export async function deleteUserChat(username: string, chatTopic: string, jwtAccess: string) {
const endpoint = `${process.env.SERVER_API_URL}/chats/delete/${username}/${chatTopic}`;

try {

  const response = await apiFunction(endpoint, "DELETE", jwtAccess);

  // Parse the response
  const responseData = responseLogging(response, "[chatUtils.ts]", "deleteUserChat", false);

  return responseData; // Return success response

} 
catch (error: any) {
  console.error("[DeleteUserChat] Error:", error.message || error);
  throw new Error(error.message || "Something went wrong while deleting the chat.");
}
}