import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleUp } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { useFetcher } from "react-router";
import { useRef, useEffect } from "react";
import type { ChatActionResponse } from "~/routes/resources/chatinput-actions";

interface ChatIndividualInputProps {
  onMessageSent: (newMessage: { user: string; assistant: string }) => void;
  chatTopic: string;
  isDisabled?: boolean;
}

const ChatIndividualInput = ({ onMessageSent, chatTopic, isDisabled = false }: ChatIndividualInputProps) => {
  const fetcher = useFetcher<ChatActionResponse>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previousStateRef = useRef(fetcher.state);

  useEffect(() => {
    if (previousStateRef.current !== "idle" && fetcher.state === "idle" && fetcher.data?.newMessage) {
      if (textareaRef.current) {
        textareaRef.current.value = "";
        // Keep focus on the textarea after sending
        textareaRef.current.focus();
      }
      onMessageSent(fetcher.data.newMessage);
    }
    previousStateRef.current = fetcher.state;
  }, [fetcher.state, onMessageSent]);

  // Auto-focus when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get("message");
   
    if (!message || message.toString().trim() === "") {
      return;
    }
   
    formData.append("chatTopic", chatTopic);

    fetcher.submit(formData, {
      method: "post",
      action: "/resources/chatinput-actions",
      preventScrollReset: true,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const message = textareaRef.current?.value;
     
      if (!message || message.trim() === "") {
        return;
      }

      const formData = new FormData();
      formData.append("message", message);
      formData.append("chatId", chatTopic); 
      
      // Add repository name from sessionStorage
      const repoName = sessionStorage.getItem('repoName') || '';
      formData.append("repoName", repoName);
     
      fetcher.submit(formData, {
        method: "post",
        action: "/resources/chatinput-actions",
        preventScrollReset: true,
      });
    }
  };

  const handleSendClick = () => {
    const message = textareaRef.current?.value;

    if (!message || message.trim() === "") {
      return;
    }

    const formData = new FormData();
    formData.append("message", message);
    formData.append("chatId", chatTopic);
    
    // Add repository name from sessionStorage
    const repoName = sessionStorage.getItem('repoName') || '';
    formData.append("repoName", repoName);

    fetcher.submit(formData, {
      method: "post",
      action: "/resources/chatinput-actions",
      preventScrollReset: true,
    });
  };

  return (
    <div className="flex-1 px-2 sm:px-4 py-2">
      <fetcher.Form
        onSubmit={handleSubmit}
        className="w-full"
        preventScrollReset
      >
        <div className="flex items-center bg-white space-x-2 sm:space-x-4 w-full">
          <div className="flex-1 p-1 bg-card rounded-xl border border-gray-50 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center">
              <textarea
                ref={textareaRef}
                name="message"
                className="flex-1 p-1 sm:p-2 pt-2 h-10 resize-none border-0 focus:outline-none bg-transparent text-sm sm:text-base rounded-lg"
                placeholder="Message SuperServerAI"
                disabled={fetcher.state !== "idle"}
                onKeyDown={handleKeyDown}
              />
              <div className="flex items-center gap-2 sm:gap-3">
                {/*<a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full hover:bg-muted transition-colors duration-200 text-icon hover:text-primary"
                >
                  <FontAwesomeIcon icon={faGithub} className="w-6 h-6" />
                </a>*/}
                <button
                  type="button"
                  onClick={handleSendClick}
                  disabled={isDisabled || fetcher.state !== "idle"}
                  className="p-1 sm:p-2 hover:bg-muted rounded-full disabled:opacity-50 active:animate-pulse-once transition-all duration-200"
                  aria-label="Send message"
                >
                  <FontAwesomeIcon
                    icon={faArrowCircleUp}
                    className={`w-6 h-6 sm:w-8 sm:h-8 ${
                      fetcher.state === "idle" && !isDisabled
                        ? "text-primary hover:text-opacity-80"
                        : "text-muted-foreground"
                    } transition-colors`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </fetcher.Form>
    </div>
  );
};

export default ChatIndividualInput;
