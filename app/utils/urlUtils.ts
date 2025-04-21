import { encodeUrl, decodeUrl } from '~/tools/topicEncoderDecoder';

// DYNAMIC URL MANAGEMENT
const sanitizeUrlSegment = (segment: string): string => {
  return segment
    // Replace spaces and special characters with hyphens
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
};

export const generateNewChatTopic = (existingTopics: string[]): string => {
  const newChatRegex = /^New Chat (\d+)$/;
  let highestNumber = 0;
   
  existingTopics.forEach(topic => {
    const match = topic.match(newChatRegex);
    if (match) {
      const number = parseInt(match[1], 10);
      highestNumber = Math.max(highestNumber, number);
    }
  });
   
  return `New Chat ${highestNumber + 1}`;
};

export const generateChatUrl = (username: string, chatTopic: string): string => {
  if (!username || !chatTopic) {
    throw new Error('Username and chat topic are required');
  }
  
  const sanitizedUsername = sanitizeUrlSegment(username);
  const sanitizedTopic = sanitizeUrlSegment(chatTopic);
  
  // Use the new encoding function
  const encodedUrl = encodeUrl(sanitizedUsername, sanitizedTopic);
  return `/chat/${encodedUrl}`;
};

export const generateNewChatUrl = (
  username: string,
  deployedChats: string[],
  unDeployedChats: {topic: string, message_count: number}[]
): string => {
  const allTopics = [
    ...deployedChats,
    ...unDeployedChats.map(chat => chat.topic)
  ].filter((topic): topic is string => typeof topic === 'string');
  
  const newTopic = generateNewChatTopic(allTopics);
  console.log('NEW TOPIC:', newTopic);
  return generateChatUrl(username, newTopic);
};


//EXTRACT THREAD INFO
export function parseThreadId(encodedChatId: string) {
  try {
    const { username, topic } = decodeUrl(encodedChatId);
    return {
      topic: topic.replace(/-/g, ' ')
    };
  } catch (error) {
    throw new Error("Invalid chat ID format");
  }
}

export const extractThreadInfo = (pathname: string): { username: string; topic: string } | null => {
  if (pathname === '/' || pathname === '/chat' || pathname === '/chat/') return null;
 
  try {
    const urlSegments = pathname.split('/');
    const encodedSegment = urlSegments[urlSegments.length - 1];
   
    // Use the new decoding function
    const decoded = decodeUrl(encodedSegment);
    return {
      username: decoded.username,
      topic: decoded.topic.replace(/-/g, ' ')  // Replace hyphens with spaces
    };
  } catch (error) {
    console.error('Error decoding chat URL:', error);
    return null;
  }
};


//DASHBOARD CONTAINER URL FUNCTIONS
export const generateContainerUrl = (username: string, containerName : string) => {
  
  const encodedUrl = encodeUrl(username, containerName);
  return `/dashboard/${encodedUrl}`;
};
