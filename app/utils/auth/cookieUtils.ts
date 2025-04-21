import { redis } from '../../tools/redisClient';
import { parse, serialize } from 'cookie';
import crypto from 'crypto';

interface UserDataType {
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  github_connected?: number;
}
// Encryption and Decryption Key (make sure this is stored securely, ideally in an env variable)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes key
if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY environment variable is not set.");
}
const IV_LENGTH = 16; // For AES, the IV should be 16 bytes


export const encryptText = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return `${iv.toString('base64')}:${encrypted}`;
};


export const decryptText = (encryptedText: string): string => {
  const [ivString, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivString, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};


export const getUsernameFromCookie = (request: Request): string | undefined => {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return undefined;

  const cookies = parse(cookieHeader);
  const encryptedUsername = cookies['username'];
  if (!encryptedUsername) return undefined;

  try {
    return decryptText(encryptedUsername); // Decrypt the username before returning
  } catch (error) {
    return undefined;
  }
};


export const getJwtAccess = async (request: Request): Promise<string | undefined> => {
  const username = getUsernameFromCookie(request);
  if (!username) return undefined;

  const accessToken = await redis.get(`jwt_access:${username}`);
  return accessToken || undefined;
};

export const getUserData = async (request: Request): Promise<UserDataType | undefined> => {
  const username = getUsernameFromCookie(request);
  if (!username) return undefined;
  const userData = await redis.get(`user_data:${username}`);
  
  if (!userData) return undefined;
  
  const parsedUserData = JSON.parse(userData);
  return {
    username,
    ...parsedUserData
  };
};

export const getJwtRefresh = async (request: Request): Promise<string | undefined> => {
  const username = getUsernameFromCookie(request);
  if (!username) return undefined;

  const refreshToken = await redis.get(`jwt_refresh:${username}`);
  return refreshToken || undefined;
};


export const getDeployed = async (request: Request): Promise<boolean | undefined> => {
  const username = getUsernameFromCookie(request);
  if (!username) return undefined;

  const deployed = await redis.get(`deployed:${username}`);
  return deployed !== null ? deployed === "true" : undefined;
};

export const getDeployedChats = async (request: Request): Promise<object | undefined> => {
  const username = getUsernameFromCookie(request);
  if (!username) return undefined;

  const deployedChats = await redis.get(`deployed_chats:${username}`);
  return deployedChats ? JSON.parse(deployedChats) : undefined;
};


export const getUndeployedChats = async (request: Request): Promise<object | undefined> => {
  const username = getUsernameFromCookie(request);
  if (!username) return undefined;

  const undeployedChats = await redis.get(`undeployed_chats:${username}`);
  return undeployedChats ? JSON.parse(undeployedChats) : undefined;
};

const TOKEN_EXPIRATION_SECONDS = 20 * 60; // 20 minutes


export const setUserDataCookies = async (username: string, response: Record<string, any>): Promise<void> => {
  // Store JWT tokens in Redis with expiration
  await redis.setex(`jwt_access:${username}`, TOKEN_EXPIRATION_SECONDS, response.access);
  await redis.setex(`jwt_refresh:${username}`, TOKEN_EXPIRATION_SECONDS, response.refresh);

  await redis.setex(`containers:${username}`, TOKEN_EXPIRATION_SECONDS, JSON.stringify(response.containers));

  // Store user data
  await redis.setex(`user_data:${username}`, TOKEN_EXPIRATION_SECONDS, JSON.stringify({
    email: response.email,
    first_name: response.first_name,
    last_name: response.last_name,
    github_connected: response.github_connected
  }));

  // Store additional user-specific data to redis
  await redis.setex(`deployed_chats:${username}`, TOKEN_EXPIRATION_SECONDS, JSON.stringify(response.deployed));
  await redis.setex(`undeployed_chats:${username}`, TOKEN_EXPIRATION_SECONDS, JSON.stringify(response.undeployed));
};

// TODO: Fetch repo name from GitHub API and store in cookies (currently hardcoded)
export const setRepoNameInCookies = (response: Response, repoName: string): Response => {
    response.headers.append('Set-Cookie', serialize('repoName', repoName, {
        httpOnly: true, // Makes the cookie inaccessible to client-side JavaScript
        secure: process.env.NODE_ENV === 'production', // Ensures the cookie is only sent over HTTPS in production
        sameSite: 'strict', // Mitigates CSRF attacks
        path: '/', // Makes the cookie available to the entire domain
        maxAge: 60 * 60 * 24 * 7 // Expires in 1 week (adjust as needed)
    }));
  return response;
};

export const getRepoNameFromCookies = (request: Request): string | undefined => {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return undefined;

  const cookies = parse(cookieHeader);
  const repoName = cookies['repoName'];
  if (!repoName) return undefined;

  return repoName;
};

export const setChatTopicToCookies = (topic: string, response: Response): Response => {
    const encryptedTopic = encryptText(topic);
    response.headers.append('Set-Cookie', serialize('topic', encryptedTopic, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 // Expires in 1 day
    }));
  return response;
};

export const clearChatTopicFromCookies = (response: Response): Response => {
    response.headers.append('Set-Cookie', serialize('topic', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0 // Expires immediately
    }));
  return response;
};

export const getChatTopicFromCookies = (request: Request): string | undefined => {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return undefined;

  const cookies = parse(cookieHeader);
  const encryptedTopic = cookies['topic'];
  if (!encryptedTopic) return undefined;

  try {
    return decryptText(encryptedTopic);
  } catch (error) {
    return undefined;
  }
};
