import type { LoaderFunction } from "react-router";
import { data, redirect } from "react-router";
import { useLoaderData } from "react-router";
import ChatHomeInterface from "~/components/Chatbot/ChatHomeInterface";
import {
  getJwtAccess,
  getUserData,
  getJwtRefresh,
  getDeployedChats,
  getUndeployedChats,
  getUsernameFromCookie,
} from "~/utils/auth/cookieUtils";
import { coldBootLlmCall } from "~/utils/llm/ssLlmUtils";
import { extractThreadInfo } from "~/utils/urlUtils";
import type { RouteHandle } from "~/types/ui-types";

export interface RequestLoaderData {
  jwtAccess: string | null;
  userData: {
    username: string;
    github_connected?: number;
    [key: string]: any; // for other user data fields
  };
  jwtRefresh: string | null;
  deployedChats: string[] | undefined; // array of chat labels
  undeployedChats: Array<{
    topic: string;
    message_count: number;
  }> | undefined;
  currentThread?: {
    username: string;
    topic: string;
  };
}

//to only call the coldboot function once on loading
let hasCalledColdBoot = false;

export const handle: RouteHandle = {
  breadcrumb: {
    title: "Chat",
    path: "/chat",
  },
};

export const loader: LoaderFunction = async ({ request }) => {
  try {
    console.log("CHAT LOADER FUNCTION CALLED");

    //COLD BOOT LLMS
    if (!hasCalledColdBoot) {
      await coldBootLlmCall();
      hasCalledColdBoot = true;
    } else {
      console.log("Skipping cold boot function - already called");
    }

    // Get authentication data
    const jwtAccess = (await getJwtAccess(request)) || null;
    const username = await getUsernameFromCookie(request);
    console.log("username", username);
    if (!jwtAccess || !username) {
      throw redirect("/auth/login");
    }

    // Get thread info from URL
    const url = new URL(request.url);
    const threadInfo = extractThreadInfo(url.pathname);

    // Load all data in parallel
    const [userData, jwtRefresh, deployedChats, undeployedChats] = await Promise.all([
      getUserData(request),
      getJwtRefresh(request),
      getDeployedChats(request),
      getUndeployedChats(request),
    ]);

    console.log("ALL DATA", userData, jwtRefresh, deployedChats, undeployedChats);

    // Ensure userData has username
    const enhancedUserData = {
      ...userData,
      username, // Add username from cookie if not present
    };

    const deployedChatsData = (deployedChats as string[]) || [];
    const undeployedChatsData = (undeployedChats as Array<{ topic: string; message_count: number; }>) || [];
    console.log("undeployedChatsData", undeployedChatsData);

    // Construct and return loader data
    return data({
      jwtAccess: jwtAccess,
      userData: enhancedUserData,
      jwtRefresh: jwtRefresh || null,
      deployedChats: deployedChatsData,
      undeployedChats: undeployedChatsData,
      currentThread: threadInfo || undefined,
    } as any);
  } catch (error) {
    console.error("Loader error:", error);
    throw redirect("/auth/login");
  }
};

export default function Chat() {
  const loaderData = useLoaderData<typeof loader>() as RequestLoaderData;
  return <ChatHomeInterface request={loaderData} />;
}
