import { redis } from '../../tools/redisClient';

const TOKEN_EXPIRATION_SECONDS = 20 * 60; // 20 minutes

// Interfaces
interface ChatMessage {
 assistant: string;
 user: string;
 db_sync: string; 
}

interface ChatEntry {
 topic: string;
 message_count: number;
}

interface RedisKeys {
 messageKey: string;
 chatKey: string; 
}

// Helper function to normalize Redis keysstring
export const normalizeKey = (username: string, topic: string): RedisKeys => {
//  const normalizedUsername = username.toLowerCase();
 const normalizedUsername = username;
 const normalizedTopic = topic.trim();
 return {
   messageKey: `chat_messages:${normalizedUsername}:${normalizedTopic}`,
   chatKey: `undeployed_chats:${normalizedUsername}`
 };
};

export async function sendNewMessageToRedis(
 username: string, 
 topic: string, 
 message: Omit<ChatMessage, 'db_sync'>,
): Promise<boolean> {
 const { messageKey, chatKey } = normalizeKey(username, topic);

 try {
   const multi = redis.multi();
   console.log(`[sendNewMessageToRedis] Sending message for ${username}, ${topic} Message: ${messageKey}`);

    const existingMessages = await redis.get(messageKey);
    let messages: ChatMessage[] = existingMessages ? JSON.parse(existingMessages) : [];

   const newMessage: ChatMessage = {
     ...message,
     db_sync: "false",
   };

   messages.push(newMessage);

   multi.setex(messageKey, TOKEN_EXPIRATION_SECONDS, JSON.stringify(messages));

    const existingChats = await redis.get(chatKey);
    let chats: ChatEntry[] = existingChats ? JSON.parse(existingChats) : [];

   const existingChatIndex = chats.findIndex((chat) =>
     chat.topic.toLowerCase() === topic.toLowerCase()
   );
   
   if (existingChatIndex >= 0) {
     chats[existingChatIndex].message_count = messages.length;
   } else {
     chats.push({
       topic,
       message_count: messages.length
     });
   }

   chats = chats.filter((chat, index, self) =>
     index === self.findIndex((c) => c.topic.toLowerCase() === chat.topic.toLowerCase())
   );

   multi.setex(chatKey, TOKEN_EXPIRATION_SECONDS, JSON.stringify(chats));
   await multi.exec();
   return true;

 } catch (error: any) {
   console.error("[sendNewMessageToRedis] Error:", error.message || error);
   throw new Error("Failed to store message in Redis");
 }
}

export async function checkRedisForMessages(
 username: string, 
 topic: string
): Promise<ChatMessage[] | null> {
 const { messageKey } = normalizeKey(username, topic);

 try {
   const existingData = await redis.get(messageKey);

   if (!existingData) {
     return null;
   }

   const messages: ChatMessage[] = JSON.parse(existingData);

   if (!Array.isArray(messages)) {
     console.error("[checkRedisForMessages] Invalid message format in Redis for key:", messageKey);
     return null;
   }

   return messages;
 } catch (error: any) {
   console.error("[checkRedisForMessages] Redis Error:", error);
   throw new Error("Failed to fetch messages from cache");
 }
}

export async function storeFetchedChatMessagesToRedis(
 username: string, 
 topic: string, 
 messages: Omit<ChatMessage, 'db_sync'>[]
): Promise<void> {
 const { messageKey } = normalizeKey(username, topic);

 try {
   const messagesWithSync: ChatMessage[] = messages.map((msg) => ({
     ...msg,
     db_sync: "true"
   }));

   await redis.setex(messageKey, TOKEN_EXPIRATION_SECONDS, JSON.stringify(messagesWithSync));
 } catch (error: any) {
   console.error("[storeFetchedChatMessagesToRedis] Error:", error.message || error);
   throw new Error("Failed to store fetched chat messages in Redis.");
 }
}
