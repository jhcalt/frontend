import { useState, useEffect, useRef, useCallback } from "react";
import { useRevalidator, useLocation, useNavigation } from "react-router";
import ChatBubbles from "./ChatConvoComponents/ChatBubbles";
import { ChatArtifact } from "./ChatConvoComponents/ChatArtifact";
import Navbar from "../UI/Navbar";
import ChatSidebar from "./ChatSidebar";
import ChatIndividualInput from "./ChatIndividualInput";
import { ChatIndividualLoaderData } from "~/routes/chat/$chatId";
import { getDockerResponseFromMessages } from "~/utils/chatbot/parseChatMessageUtils";
import { DockerResponseObject } from "~/types/chatbot-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

interface ChatIndividualProps {
  request: ChatIndividualLoaderData;
}

const ChatIndividualInterface = ({ request }: ChatIndividualProps) => {
  const [localMessages, setLocalMessages] = useState(request.messages || []);
  const [dockerResponse, setDockerResponse] =
    useState<DockerResponseObject | null>(null);
  const previousChatIdRef = useRef(request.currentThread.topic);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Track if component is mounted
  const isMounted = useRef(false);

  // Add revalidator for polling
  const revalidator = useRevalidator();

  // Get current location and navigation state
  const location = useLocation();
  const navigation = useNavigation();

  // Add polling effect that only runs while component is mounted and not navigating away
  useEffect(() => {
    const POLLING_INTERVAL = 4000;

    // Mark component as mounted
    isMounted.current = true;

    // Set up polling
    const intervalId = setInterval(() => {
      // Only poll if component is still mounted and we're not navigating away
      const isNavigatingAway =
        navigation.state === "loading" &&
        navigation.location &&
        navigation.location.pathname !== location.pathname;

      if (
        isMounted.current &&
        !isNavigatingAway &&
        revalidator.state === "idle"
      ) {
        console.log("Polling: Triggering server data revalidation");
        revalidator.revalidate();
      }
    }, POLLING_INTERVAL);

    // Clean up function to stop polling
    return () => {
      console.log("Stopping polling: Component unmounting");
      isMounted.current = false;
      clearInterval(intervalId);
    };
  }, [revalidator, location.pathname, navigation]);

  const handleNewMessage = useCallback(
    (newMessage: { user: string; assistant: string }) => {
      // Just add new message to state
      setLocalMessages((prev) => [...prev, newMessage]);
    },
    []
  );

  // Process incoming server data
  useEffect(() => {
    if (previousChatIdRef.current !== request.currentThread.topic) {
      // Chat thread changed - reset everything
      setLocalMessages(request.messages || []);
      setDockerResponse(null);
      previousChatIdRef.current = request.currentThread.topic;
    } else if (request.messages) {
      // Process incoming messages from server
      // Check if the last message is a Docker response
      if (request.messages.length > 0) {
        const lastMessage = request.messages[request.messages.length - 1];
        const response = getDockerResponseFromMessages([lastMessage]);

        if (response) {
          console.log("Docker response detected from server data");
          setDockerResponse(response);
          setLocalMessages(request.messages.slice(0, -1));
        } else {
          setLocalMessages(request.messages);
        }
      } else {
        setLocalMessages([]);
      }
    }
  }, [request.currentThread.topic, request.messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [localMessages, dockerResponse, scrollToBottom]);

  // Set sidebar to be open by default on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background overflow-hidden">
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block z-30`}>
        <ChatSidebar 
          request={request} 
          onToggle={toggleSidebar}
          isMobile={true}
        />
      </div>
      <div className="flex-1 flex flex-col h-full">
        <Navbar 
          userData={request.userData} 
          onMenuClick={toggleSidebar}
          showMenuButton={true}
        />
        <div className="flex-1 overflow-y-auto pb-20 md:pb-28">
          <div className="w-full max-w-[850px] mx-auto py-4 px-3 sm:px-4">
            <ChatBubbles
              messages={localMessages}
              username={request.userData.username}
              ipLink={dockerResponse?.url}
              host={dockerResponse?.host}
            />
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="w-full border-t border-border bg-background p-2 sm:p-4 fixed bottom-0 left-0 right-0">
          <div className="max-w-[850px] mx-auto">
            <ChatIndividualInput
              onMessageSent={handleNewMessage}
              chatTopic={`${request.currentThread.topic}`}
              isDisabled={dockerResponse ? true : false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatIndividualInterface;
