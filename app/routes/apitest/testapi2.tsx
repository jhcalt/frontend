import { deleteUserChat } from "~/utils/chatbot/chatUtils";
import { getJwtAccess } from "~/utils/auth/cookieUtils";
import { data } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const username = "jugaad";
    const chatTopic = "New Chat 23";
    const jwt = await getJwtAccess(request);
    
    const result = await deleteUserChat(username, chatTopic, jwt);
    console.log(request, result);
    
    return data({ success: true, result });
  } catch (error) {
    console.error('Error in loader:', error);
    return data(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
};
