import { ActionFunction, data } from "react-router";
import { getUsernameFromCookie, getJwtAccess } from "~/utils/auth/cookieUtils";
import { deleteUserChat, updateUserChatTopic } from "~/utils/chatbot/chatUtils";

interface ActionResponse {
  success: boolean;
  message: string;
  action: string;
  chatId: string;
  newName?: string;
}

export const action: ActionFunction = async ({ request }) => {
  try {
    console.log("SIDEBAR ACTION FUNCTION CALLED")
    const formData = await request.formData();
    const _action = formData.get("_action");
    const chatId = formData.get("chatId");
    const jwtAccess = await getJwtAccess(request);
    const username = await getUsernameFromCookie(request);

    if (!jwtAccess || !username) {
      return data<ActionResponse>(
        {
          success: false,
          message: "Authentication required",
          action: _action?.toString() || "",
          chatId: chatId?.toString() || ""
        },
        { status: 401 }
      );
    }

    if (!chatId) {
      return data<ActionResponse>(
        {
          success: false,
          message: "Chat ID is required",
          action: _action?.toString() || "",
          chatId: ""
        },
        { status: 400 }
      );
    }

    switch (_action) {
      case "rename": {
        const newName = formData.get("newName");
        const currentTopic = formData.get("chatLabel");

        if (!newName || !currentTopic) {
          return data<ActionResponse>(
            {
              success: false,
              message: "Current topic and new name are required",
              action: "rename",
              chatId: chatId.toString()
            },
            { status: 400 }
          );
        }

        // Updated to match your server-side function signature
        await updateUserChatTopic(
          currentTopic.toString(),
          newName.toString(),
          jwtAccess
        );

        return data<ActionResponse>({
          success: true,
          message: "Chat renamed successfully",
          action: "rename",
          chatId: chatId.toString(),
          newName: newName.toString()
        });
      }

      case "delete": {
        const chatTopic = formData.get("chatLabel");

        if (!chatTopic) {
          return data<ActionResponse>(
            {
              success: false,
              message: "Chat topic is required",
              action: "delete",
              chatId: chatId.toString()
            },
            { status: 400 }
          );
        }

        // Updated to match your server-side function signature
        await deleteUserChat(
          username.toString(),
          chatTopic.toString(),
          jwtAccess
        );

        return data<ActionResponse>({
          success: true,
          message: "Chat deleted successfully",
          action: "delete",
          chatId: chatId.toString()
        });
      }

      default:
        return data<ActionResponse>(
          {
            success: false,
            message: "Invalid action",
            action: _action?.toString() || "",
            chatId: chatId.toString()
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Sidebar action error:", error);
    // Handle the error message from your server-side functions
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return data<ActionResponse>(
      {
        success: false,
        message: errorMessage,
        action: "",
        chatId: ""
      },
      { status: 500 }
    );
  }
};