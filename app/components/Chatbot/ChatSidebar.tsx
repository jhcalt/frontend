import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useFetchers, useParams } from 'react-router';
import { MoreVertical, PanelLeftClose, PanelLeftOpen, SquarePen, LayoutDashboard, Menu, X, Search } from 'lucide-react';
import ChatOptionsDropdown from './ChatOptionsDropdown';
import { generateChatUrl } from '~/utils/urlUtils';
import { RequestLoaderData } from '~/routes/chat';

// Interface definitions
interface ChatLinkProps {
    to: string;
    icon?: React.ElementType;
    label?: string;
    id?: number;
    isActive: boolean;
}

interface RecentChat {
  id: number;
  label: string;
  messageCount?: number;
}

interface ChatSidebarProps {
  request: RequestLoaderData;
  onToggle?: () => void;
  isMobile?: boolean;
}

// Chat link component
const ChatLink: React.FC<ChatLinkProps> = ({ to, icon: Icon, label, id, isActive }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isDropdownOpen]);

    return (
        <div ref={containerRef} className="relative group">
            <Link
                to={to}
                className={`flex items-center space-x-2 p-2 rounded-md transition-all duration-300 hover:bg-card-hover
                    ${isActive ? 'bg-muted text-primary font-medium' : 'text-grey'}
                `}
            >
                {Icon && <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-icon'}`} />}
                <span className="flex-grow truncate">{label}</span>
                {id && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsDropdownOpen(!isDropdownOpen);
                        }}
                        data-chat-id={id}
                        className="relative transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 opacity-70 hover:bg-muted rounded-full p-2"
                    >
                        <MoreVertical className="w-4 h-4 text-grey hover:text-ring" />
                    </button>
                )}
            </Link>
            {id && (
                <ChatOptionsDropdown
                    isOpen={isDropdownOpen}
                    chatId={id}
                    chatLabel={label}
                    onClose={() => setIsDropdownOpen(false)}
                    className={`absolute left-full top-0 z-[9999] ${isDropdownOpen ? "block" : "hidden"}`}
                />
            )}
        </div>
    );
};

// Main sidebar component
const ChatSidebar = ({ request, onToggle, isMobile = false }: ChatSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();
  const fetchers = useFetchers();
  const { chatId: currentChatId } = useParams();

  // State for storing encoded URLs
  const [chatUrls, setChatUrls] = useState<Map<string, string>>(new Map());

  const getChats = (request: RequestLoaderData) => {
    try {
      if (!request) return { deployedChats: [], undeployedChats: [] };
  
      const deployedChats: RecentChat[] = request.deployedChats.map((label: string, index: number) => ({
        id: index + 1,
        label,
      }));
  
      const undeployedChats: RecentChat[] = request.undeployedChats.map((chat: any, index: number) => ({
        id: deployedChats.length + index + 1,
        label: chat.topic,
        messageCount: chat.message_count,
      }));

      return { deployedChats, undeployedChats };
    } catch (error) {
      console.error("Error parsing request data:", error);
      return { deployedChats: [], undeployedChats: [] };
    }
  };

  const [chats, setChats] = useState(() => getChats(request));

  // Effect to generate URLs when chats change
  useEffect(() => {
    const generateUrls = async () => {
      const newUrls = new Map<string, string>();
      
      // Generate URLs for undeployed chats
      for (const chat of chats.undeployedChats) {
        const url = await generateChatUrl(request.userData.username, chat.label);
        newUrls.set(`${chat.id}`, url);
      }
      
      // Generate URLs for deployed chats
      for (const chat of chats.deployedChats) {
        const url = await generateChatUrl(request.userData.username, chat.label);
        newUrls.set(`${chat.id}`, url);
      }
      
      setChatUrls(newUrls);
    };

    generateUrls();
  }, [chats, request.userData.username]);

  // Update chats when request changes
  useEffect(() => {
    setChats(getChats(request));
  }, [request]);

  // Listen for sidebar actions and update optimistically
  useEffect(() => {
    const sidebarAction = fetchers.find(
      (fetcher) =>
        fetcher.formAction?.includes("/resources/sidebar-actions") &&
        fetcher.state === "submitting"
    );

    if (sidebarAction?.formData) {
      const action = sidebarAction.formData.get("_action");
      const chatId = sidebarAction.formData.get("chatId");
      const chatLabel = sidebarAction.formData.get("chatLabel");
      const newName = sidebarAction.formData.get("newName");

      if (action === "delete" && chatId && chatLabel) {
        setChats((currentChats) => ({
          deployedChats: currentChats.deployedChats.filter(
            (chat) => chat.id !== Number(chatId)
          ),
          undeployedChats: currentChats.undeployedChats.filter(
            (chat) => chat.id !== Number(chatId)
          ),
        }));
      } else if (action === "rename" && chatId && newName) {
        setChats((currentChats) => ({
          deployedChats: currentChats.deployedChats.map((chat) =>
            chat.id === Number(chatId)
              ? { ...chat, label: newName.toString() }
              : chat
          ),
          undeployedChats: currentChats.undeployedChats.map((chat) =>
            chat.id === Number(chatId)
              ? { ...chat, label: newName.toString() }
              : chat
          ),
        }));
      }
    }
  }, [fetchers]);

  const { deployedChats, undeployedChats } = chats;

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    if (onToggle && isMobile) {
      onToggle();
    }
  };

  // Filter chats based on search term
  const filteredUndeployedChats = searchTerm 
    ? undeployedChats.filter(chat => 
        chat.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : undeployedChats;

  const filteredDeployedChats = searchTerm
    ? deployedChats.filter(chat => 
        chat.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : deployedChats;

  return (
    <div
      className={`${
        isCollapsed ? "w-16" : "w-64 sm:w-72"
      } h-screen bg-white shadow-lg text-grey p-3 flex flex-col transition-all duration-300 ease-out-back
      ${isMobile ? 'fixed md:relative left-0 top-0 z-40' : ''}`}
    >
      <div className="flex flex-col h-full">
        <div
          className={`flex ${
            isCollapsed ? "flex-col items-center space-y-4" : "justify-between"
          } items-center mb-4`}
        >
          {isMobile && (
            <button
              onClick={onToggle}
              className="md:hidden absolute right-3 top-3 p-2 rounded-md hover:bg-muted transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-icon" />
            </button>
          )}
          <button
            onClick={handleToggle}
            className="p-2 hover:bg-muted rounded-md transition-all duration-200 hover:scale-105 hidden md:block"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-icon" />
            ) : (
                <PanelLeftClose className="w-5 h-5 text-icon" />
            )}
          </button>
          <ChatLink
            to="/chat"
            icon={SquarePen}
            label={!isCollapsed ? "New Chat" : undefined}
            isActive={currentChatId === undefined}
          />
        </div>

        {!isCollapsed && (
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full py-2 pl-10 pr-3 text-sm bg-gray-50 border border-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        )}

        <div className="relative flex-1 overflow-y-auto max-h-[calc(100vh-8rem)] pr-1 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <div className={`space-y-2 ${isCollapsed ? "flex justify-center" : ""}`}>
            <div className={`${isCollapsed ? "w-full flex justify-center" : ""}`}>
              {isCollapsed ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="p-2 rounded-lg hover:bg-primary/10 transition-all duration-200 hover:scale-110"
                >
                  <LayoutDashboard className="w-5 h-5 text-primary" />
                </button>
              ) : (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="bg-primary flex justify-center rounded-xl text-background text-base sm:text-lg font-tiempos py-2 px-4 w-full hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] active:translate-y-[1px]"
                >
                  <LayoutDashboard className="w-5 h-5 mt-1 mr-2 text-background" />
                  <span>Dashboard</span>
                </button>
              )}
            </div>
          </div>

          {!isCollapsed && (
            <div className="mt-6 space-y-6 animate-slide-in-left">
              {/* Undeployed Chats Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground px-2 flex items-center">
                  <span>Undeployed Chats</span>
                  {filteredUndeployedChats.length > 0 && (
                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {filteredUndeployedChats.length}
                    </span>
                  )}
                </h3>
                <div className="space-y-1">
                  {filteredUndeployedChats && filteredUndeployedChats.length > 0 ? (
                    filteredUndeployedChats.map((chat) => (
                      <div className="relative group" key={chat.id}>
                        <ChatLink
                          to={chatUrls.get(`${chat.id}`) || "#"}
                          label={chat.label}
                          id={chat.id}
                          isActive={chatUrls.get(`${chat.id}`) === `/chat/${currentChatId}`}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground text-sm text-center py-2 italic">
                      {searchTerm ? "No matching undeployed chats" : "No undeployed chats"}
                    </div>
                  )}
                </div>
              </div>

              {/* Deployed Chats Section */}
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground px-2 flex items-center">
                  <span>Deployed Chats</span>
                  {filteredDeployedChats.length > 0 && (
                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {filteredDeployedChats.length}
                    </span>
                  )}
                </h3>
                <div className="space-y-1">
                  {filteredDeployedChats && filteredDeployedChats.length > 0 ? (
                    filteredDeployedChats.map((chat) => (
                      <div className="relative group" key={chat.id}>
                        <ChatLink
                          to={chatUrls.get(`${chat.id}`) || "#"}
                          label={chat.label}
                          id={chat.id}
                          isActive={chatUrls.get(`${chat.id}`) === `/chat/${currentChatId}`}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground text-sm text-center py-2 italic">
                      {searchTerm ? "No matching deployed chats" : "No deployed chats"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Mobile footer with version info */}
        {!isCollapsed && isMobile && (
          <div className="mt-4 pt-2 border-t border-gray-100 text-xs text-gray-400 text-center">
            SuperServer.AI v1.0
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
