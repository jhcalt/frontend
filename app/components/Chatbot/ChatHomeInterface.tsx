import { RequestLoaderData } from "~/routes/chat";
import ChatMainInput from "./ChatMainInput";
import Navbar from "../UI/Navbar";
import ChatSidebar from "./ChatSidebar";
import { useState } from "react";

interface ChatHomeInterfaceProps {
  request: RequestLoaderData;
}

const ChatHomeInterface = ({ request }: ChatHomeInterfaceProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block md:flex-shrink-0 z-30`}>
        <ChatSidebar 
          request={request} 
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isMobile={true}
        />
      </div>
      <div className="flex-1 flex flex-col">
        <Navbar 
          userData={request.userData} 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          showMenuButton={true}
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="space-y-6 w-full max-w-3xl animate-fade-in px-4 sm:px-6">
            <h1 className="text-2xl sm:text-3xl text-center font-medium px-2 sm:px-4 text-gray-800">
              Hi {request.userData.username}! What can I help you deploy?
            </h1>
            <ChatMainInput request={request} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHomeInterface;
