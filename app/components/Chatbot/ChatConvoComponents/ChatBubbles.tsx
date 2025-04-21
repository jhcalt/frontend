import React, { memo } from "react";
import { Bot } from "lucide-react";
import DeployedResult from "./DeployedResult";

export interface UiMessage {
  assistant: string;
  user: string;
}

export interface LlmMessage {
  role: "assistant" | "user" | "system";
  content: string;
}

interface ChatBubblesProps {
  messages: UiMessage[];
  username: string;
  isLoading?: boolean;
  ipLink?: string | null;
  host?: string | null;
}

const ChatBubbles = memo(
  ({ messages, username, isLoading, ipLink, host }: ChatBubblesProps) => {
    if (!messages?.length) {
      return (
        <div className="p-6 text-gray-500 text-center">No messages yet</div>
      );
    }

    return (
      <div className="flex flex-col space-y-2 p-4">
        {messages.map((message, index) => (
          <React.Fragment key={`msg-${index}-${message.user?.slice(0, 5)}`}>
            {message.user && (
              <div className="flex justify-end w-full mb-4">
                <div className="flex items-end gap-2">
                  <div className="max-w-md rounded-lg rounded-br-sm bg-primary px-4 py-3 text-white">
                    <p className="text-sm leading-relaxed font-tiempos">
                      {message.user}
                    </p>
                  </div>
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm">
                    <span className="text-primary font-semibold text-lg font-tiempos">
                      {username.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>

                  {/* <div className="flex-shrink-0 mb-1">
                  <User size={18} className="text-gray-400" />
                </div> */}
                </div>
              </div>
            )}

            {message.assistant && (
              <div className="flex justify-start w-full mb-4">
                <div className="flex items-end gap-2">
                  {/* <div className="flex-shrink-0 mb-1">
                  <Bot size={18} className="text-gray-400" />
                </div> */}
                  <div className="max-w-md p-4 text-gray-800 rounded-lg rounded-bl-sm bg-gray-100">
                    <p className="text-sm leading-relaxed">
                      {message.assistant}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}

        {isLoading && (
          <div className="flex justify-start w-full mb-4">
            <div className="flex items-end gap-2">
              <div className="flex-shrink-0 mb-1">
                <Bot size={18} className="text-gray-400" />
              </div>
              <div className="max-w-md rounded-2xl rounded-bl-sm p-4 bg-gray-100 text-gray-800 shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {ipLink && host && <DeployedResult ipLink={ipLink} host={host} />}
      </div>
    );
  }
);

export default ChatBubbles;
