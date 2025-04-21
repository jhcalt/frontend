import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { LogOut, Bell, Settings, User, Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import GithubButton from '../Github/GithubButton';
import { Link } from 'react-router';
import { TooltipWrapper } from './ToolTip';
import Breadcrumbs from './Breadcrumbs';

interface NavbarProps {
  userData: {
    username: string;
    email?: string;
    github_connected?: number;
  };
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ userData, onMenuClick, showMenuButton = false }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
          return () => {
            window.removeEventListener('mousedown', handleClickOutside);
          };
  }, []);

  // Sample notifications data
  const notifications = [
    {
      id: 1,
      title: "New deployment completed",
      message: "Your application was successfully deployed.",
      time: "2 hours ago",
      isRead: false
    },
    {
      id: 2,
      title: "Repository connected",
      message: "Successfully connected to GitHub repository.",
      time: "Yesterday",
      isRead: true
    },
    {
      id: 3,
      title: "System update",
      message: "SuperServer.AI has been updated to the latest version.",
      time: "3 days ago",
      isRead: true
    }
  ];

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  return (
    <nav className="min-h-14 flex items-center justify-between px-2 sm:px-4 md:px-6 bg-white shadow-sm">
      <div className="flex items-center">
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="mr-2 p-2 rounded-md hover:bg-muted transition-colors md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-icon" />
          </button>
        )}
        <Link to={'/chat'} className="text-grey font-semibold text-lg sm:text-xl font-tiempos cursor-pointer hover:text-primary truncate">SuperServer.AI</Link>
        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:block">
          {!userData.github_connected ? <TooltipWrapper content={!userData.github_connected ? "Access your repos to continue" : "GitHub connected"} position='bottom'>
            <GithubButton
              username={userData.username}
              isGithubConnected={!!userData.github_connected}
            />
          </TooltipWrapper> :
            <GithubButton
              username={userData.username}
              isGithubConnected={!!userData.github_connected}
            />
          }
        </div>
        
        {/* Mobile GitHub button - simplified version */}
        <div className="block sm:hidden">
          <GithubButton
            username={userData.username}
            isGithubConnected={!!userData.github_connected}
            compact={true}
          />
        </div>
        
        {/* Notifications */}
        <div className="relative" ref={notificationsDropdownRef}>
          <TooltipWrapper content='Notifications' position='bottom'>
          <button
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-muted transition-colors duration-200 animate-spring-in relative"
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-icon" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 sm:top-1 sm:right-1 w-3 h-3 sm:w-4 sm:h-4 bg-secondary text-white text-xs flex items-center justify-center rounded-full animate-pulse-once">
                {unreadCount}
              </span>
            )}
          </button>
          </TooltipWrapper>
          
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-64 sm:w-80 bg-popover rounded-lg shadow-lg border border-border overflow-hidden animate-slide-in-down z-10">
              <div className="p-2 sm:p-3 border-b border-border flex justify-between items-center">
                <h3 className="font-medium text-grey text-sm sm:text-base">Notifications</h3>
                <button className="text-xs sm:text-sm text-primary hover:underline">Mark all as read</button>
              </div>
              
              <div className="max-h-72 sm:max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`p-2 sm:p-3 border-b border-border hover:bg-card-hover transition-colors ${!notification.isRead ? 'bg-muted' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-grey text-xs sm:text-sm">{notification.title}</h4>
                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">{notification.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No notifications yet
                  </div>
                )}
              </div>
              
              <div className="p-2 border-t border-border">
                <button className="w-full py-1 sm:py-2 text-primary text-xs sm:text-sm hover:bg-card-hover rounded-md transition-colors">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
       
        {/* Profile */}
        <div className="relative" ref={profileDropdownRef}>
          <TooltipWrapper content='Profile' position='bottom'>
          <button
            className="flex items-center gap-2 p-1 sm:p-2 transition-colors duration-200 animate-spring-in"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm">
              <span className="text-primary font-semibold text-base sm:text-lg font-tiempos">
                {userData.username.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </button>
          </TooltipWrapper>
         
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-popover rounded-lg shadow-lg border border-border overflow-hidden animate-slide-in-down z-10">
              <div className="p-3 sm:p-4 border-b border-border">
                <p className="font-medium text-grey text-sm sm:text-base">{userData.username}</p>
                {userData.email && (
                  <p className="text-xs sm:text-sm text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">{userData.email}</p>
                )}
              </div>
             
              <div className="p-1 sm:p-2">
                <button className="w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-grey hover:bg-card-hover rounded-md transition-colors duration-200 flex items-center gap-2 text-sm">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-icon" />
                  <span>Profile</span>
                </button>
               
                <button className="w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-grey hover:bg-card-hover rounded-md transition-colors duration-200 flex items-center gap-2 text-sm">
                  <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-icon" />
                  <span>Settings</span>
                </button>
               
                <Link to={'/auth/login'} className="w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-destructive hover:bg-card-hover rounded-md transition-colors duration-200 flex items-center gap-2 text-sm">
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Logout</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
