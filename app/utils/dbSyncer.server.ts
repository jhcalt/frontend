import { redis } from '../tools/redisClient';
import { apiLoginPost } from './auth/authUtils';
import axios from 'axios';

const TOKEN_EXPIRATION_SECONDS = 20 * 60; // 20 minutes

interface ChatMessage {
  assistant: string;
  user: string;
  db_sync: string;
  username: string;
}

interface ChatEntry {
  topic: string;
  message_count: number;
}

interface BatchChatDumpPayload {
  username: string;
  topics: Array<{
    topic: string;
    data: Array<{
      role: 'user' | 'assistant';
      content: string;
    }>;
  }>;
}

interface LoginResponse {
  refresh: string;
  access: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  deployed: string[];
  undeployed: Array<{
    topic: string;
    message_count: number;
  }>;
}

const normalizeKey = (username: string, topic: string) => {
  const normalizedUsername = username;
  const normalizedTopic = topic.trim();
  return {
    messageKey: `chat_messages:${normalizedUsername}:${normalizedTopic}`,
    chatKey: `undeployed_chats:${normalizedUsername}`
  };
};

function extractInfoFromKey(key: string): { username: string; topic: string } | null {
  const parts = key.split(':');
  if (parts.length !== 3) return null;
  
  return {
    username: parts[1],
    topic: parts[2]
  };
}

function convertMessagesToApiFormat(messages: ChatMessage[]): Array<{role: 'user' | 'assistant'; content: string}> {
  const apiFormat = [];
  for (const message of messages) {
    apiFormat.push(
      { role: 'user', content: message.user },
      { role: 'assistant', content: message.assistant }
    );
  }
  return apiFormat;
}

function organizeMessagesByUsername(
  messagesByTopic: Map<string, { messages: ChatMessage[]; username: string }>
): Map<string, Array<{ topic: string; messages: ChatMessage[] }>> {
  const messagesByUsername = new Map<string, Array<{ topic: string; messages: ChatMessage[] }>>();

  for (const [topic, { messages, username }] of messagesByTopic) {
    if (!messagesByUsername.has(username)) {
      messagesByUsername.set(username, []);
    }
    messagesByUsername.get(username)?.push({ topic, messages });
  }

  return messagesByUsername;
}

async function findUnsyncedMessages(): Promise<Map<string, { messages: ChatMessage[]; username: string }>> {
  const messagesByTopic = new Map<string, { messages: ChatMessage[]; username: string }>();
  let cursor = '0';
  
  try {
    do {
      const [newCursor, keys] = await redis.scan(
        cursor,
        'MATCH', 
        'chat_messages:*',
        'COUNT',
        '100'
      );
      
      cursor = newCursor;

      if (keys.length > 0) {
        console.log(`🔍 [DbSync] Found ${keys.length} potential keys to check`);
      }

      for (const key of keys) {
        const keyInfo = extractInfoFromKey(key);
        if (!keyInfo) {
          console.error(`🔴 [DbSync] Invalid key format: ${key}`);
          continue;
        }

        const messagesStr = await redis.get(key);
        if (messagesStr) {
          try {
            const messages: ChatMessage[] = JSON.parse(messagesStr);
            const unsyncedMessages = messages.filter(msg => msg.db_sync === "false");
            
            if (unsyncedMessages.length > 0) {
              messagesByTopic.set(keyInfo.topic, {
                messages: unsyncedMessages,
                username: keyInfo.username
              });
              console.log(`📝 [DbSync] Found ${unsyncedMessages.length} unsynced messages for topic: ${keyInfo.topic}`);
            }
          } catch (parseError) {
            console.error(`🔴 [DbSync] Error parsing messages for key ${key}:`, parseError);
          }
        }
      }
    } while (cursor !== '0');

    return messagesByTopic;
  } catch (error) {
    console.error('🔴 [DbSync] Error in findUnsyncedMessages:', error);
    throw error;
  }
}

async function sendMessagesToDjango(
  username: string, 
  topicsWithMessages: Array<{ topic: string; messages: ChatMessage[] }>
): Promise<boolean> {
  try {
    // Process each topic separately
    let allSuccess = true;
    for (const { topic, messages } of topicsWithMessages) {
      const loginResponse = await apiLoginPost({
        username: process.env.DJANGO_USERNAME!,
        password: process.env.DJANGO_PASSWORD!
      });

      const payload = {
        username, // Use the actual username from Redis, not the login credentials
        topic,
        data: convertMessagesToApiFormat(messages)
      };

      console.log(`📦 [DbSync] Sending payload for user ${username}, topic ${topic}:`, payload);
      const url = `${process.env.SERVER_API_URL}/chats/dump`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${loginResponse.access}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        allSuccess = false;
        console.error(`❌ [DbSync] Failed to sync topic ${topic} for user ${username}. Status: ${response.status}`);
        const errorData = await response.text();
        console.error('Error details:', errorData);
      } else {
        console.log(`✅ [DbSync] Successfully synced topic ${topic} for user ${username}`);
      }
    }

    return allSuccess;
  } catch (error) {
    console.error(`❌ [DbSync] Error for user ${username}:`, error);
    return false;
  }
}
async function markMessagesAsSynced(username: string, topic: string): Promise<void> {
  const { messageKey } = normalizeKey(username, topic);
  
  try {
    const messagesStr = await redis.get(messageKey);
    if (messagesStr) {
      const messages: ChatMessage[] = JSON.parse(messagesStr);
      const updatedMessages = messages.map(msg => ({
        ...msg,
        db_sync: "true"
      }));
      
      await redis.setex(messageKey, TOKEN_EXPIRATION_SECONDS, JSON.stringify(updatedMessages));
    }
  } catch (error) {
    console.error(`❌ [DbSync] Failed to mark messages as synced for ${topic}:`, error);
    throw error;
  }
}

export function startDbSync() {
  console.log('🟢 [DbSync] Sync service initialized');
  
  const syncMessages = async () => {
    try {
      console.log('\n📡 [DbSync] Starting sync cycle...');
      
      const unsyncedMessagesByTopic = await findUnsyncedMessages();
      
      const topicCount = unsyncedMessagesByTopic.size;
      if (topicCount === 0) {
        console.log('✨ [DbSync] No unsynced messages found');
        return;
      }

      console.log(`🔄 [DbSync] Found unsynced messages in ${topicCount} topics`);
      
      // Organize messages by username
      const messagesByUsername = organizeMessagesByUsername(unsyncedMessagesByTopic);
      
      // Process each user's messages in batch
      for (const [username, topicsWithMessages] of messagesByUsername) {
        try {
          console.log(`\n📝 [DbSync] Processing ${topicsWithMessages.length} topics for user "${username}"`);
          const success = await sendMessagesToDjango(username, topicsWithMessages);
          
          if (success) {
            // Mark all messages as synced
            for (const { topic } of topicsWithMessages) {
              await markMessagesAsSynced(username, topic);
            }
            console.log(`✅ [DbSync] Successfully synced all messages for user: ${username}`);
          } else {
            console.log(`❌ [DbSync] Failed to sync messages for user: ${username}`);
          }
        } catch (userError) {
          console.error(`❌ [DbSync] Error processing user ${username}:`, userError);
        }
      }
      
      // console.log('\n🏁 [DbSync] Sync cycle completed');
    } catch (error) {
      console.error('🔴 [DbSync] Sync cycle failed:', error);
    }
  };

  // Run first sync immediately
  console.log('⏰ [DbSync] Running initial sync...');
  syncMessages();
  
  // Schedule recurring sync (every 1 minute)
  const TIME_INTERVAL_BETWEEN_SYNC = 1 * 60 * 1000;
  const interval = setInterval(() => {
    console.log('\n⏰ [DbSync] Starting scheduled sync...');
    syncMessages();
  }, TIME_INTERVAL_BETWEEN_SYNC);
  
  interval.unref();
  console.log('✅ [DbSync] Scheduler initialized - will sync every minute');
}