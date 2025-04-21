import type { LoaderFunction } from 'react-router';
import type { ShouldRevalidateFunction } from 'react-router';
import { redirect, data, useLoaderData } from 'react-router';
import {
  getJwtAccess,
  getUserData,
  getJwtRefresh,
  getDeployedChats,
  getUndeployedChats,
  getUsernameFromCookie,
} from '~/utils/auth/cookieUtils';
import type { RequestLoaderData } from '~/routes/chat';
import ChatIndividualInterface from '~/components/Chatbot/ChatIndividualInterface';
import { parseThreadId } from '~/utils/urlUtils';
import { getUserChatMessages } from '~/utils/chatbot/chatUtils';
import { decodeUrl } from '~/tools/topicEncoderDecoder';
import type { RouteHandle, Breadcrumb } from "~/types/ui-types";

export interface ChatIndividualLoaderData extends RequestLoaderData {
  currentThread: {
    username: string;
    topic: string;
  };
  messages?: {
    assistant: string;
    user: string;
  }[];
}

export const handle: RouteHandle = {
  breadcrumb: (data: ChatIndividualLoaderData): Breadcrumb | Breadcrumb[] => {
    if (!data) {
      return [
        {
          title: "Chat",
          path: "/chat",
        },
      ];
    }
    const { topic } = data.currentThread;
    return [
      {
        title: "Chat",
        path: "/chat",
      },
      {
        title: topic,
      },
    ];
  },
};

export const shouldRevalidate: ShouldRevalidateFunction = ({
  formAction,
  currentUrl,
  defaultShouldRevalidate,
}) => {
  // Don't revalidate for chat input actions
  if (formAction?.includes('/resources/chatinput-actions')) {
    return false;
  }

  return defaultShouldRevalidate;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    // console.log('$CHATID LOADER FUNCTION CALLED');
    const jwtAccess = await getJwtAccess(request);
    const username = await getUsernameFromCookie(request);

    if (!jwtAccess || !username) {
      console.error('Authentication error: No access token or username found');
      return redirect('/auth/login'); // Redirect to login if no access token
    }

    const encodedChatId = params.chatId;
    if (!encodedChatId) {
      console.error('Chat ID is required');
      return redirect('/chat'); // Redirect to chat index if no chat ID
    }

    // Decode the chat ID
    const decodedChatId = decodeUrl(encodedChatId);
    if (!decodedChatId) {
      console.error('Invalid decoded chat ID format');
      throw new Error('Invalid decoded chat ID format'); // Throw error for invalid chat ID
    }

    const { topic } = parseThreadId(encodedChatId);
    
    if (!username || !topic) {
      console.error('Invalid topic format');
      throw new Error('Invalid topic format'); // Throw error for invalid topic
    }

    try {
      const [
        userDataResult,
        jwtRefreshResult,
        deployedChatsResult,
        undeployedChatsResult,
        chatMessagesResult,
      ] = await Promise.all([
        getUserData(request),
        getJwtRefresh(request),
        getDeployedChats(request),
        getUndeployedChats(request),
        getUserChatMessages(username, topic, jwtAccess),
      ]);

      const userData = (userDataResult || { username }) as {
        username: string;
        [key: string]: any;
      };
      const jwtRefresh = (jwtRefreshResult ?? null) as string | null;
      const deployedChats = (deployedChatsResult || []) as string[];
      const undeployedChats = (undeployedChatsResult || []) as {
        topic: string;
        message_count: number;
      }[];
      const chatMessages = (chatMessagesResult || []) as {
        assistant: string;
        user: string;
      }[];

      return data<ChatIndividualLoaderData>({
        jwtAccess,
        userData,
        jwtRefresh,
        deployedChats,
        undeployedChats,
        currentThread: { username, topic },
        messages: chatMessages,
      });
    } catch (error) {
      console.error('Data fetching error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch required data'
      );
    }
  } catch (error) {
    console.error('Loader error:', error);
    if (error instanceof Response) return error; // Handle redirect
    if (error instanceof Error && error.message.includes('authentication')) {
      return redirect('/auth/login');
    }
    throw new Error('An unexpected error occurred in the loader');
  }
};

export default function ChatIdRoute() {
  const loaderData = useLoaderData<ChatIndividualLoaderData>();

  if (!loaderData) {
    throw new Error("Loader data is null");
  }

  return <ChatIndividualInterface request={loaderData} />;
}
