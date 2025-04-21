import { Link, useLocation } from 'react-router';
import { FC, useState } from 'react';
import { UserCircle, LogOut, Menu, X } from 'lucide-react';
import { TooltipWrapper } from '../UI/ToolTip';

interface DashboardNavbarProps {
  username: string;
  userData: string;
}

interface NavItem {
  name: string;
  path: string;
}

const navItems: NavItem[] = [
  { name: 'Instances', path: '/dashboard' },
  { name: 'Security', path: '/dashboard/security' },
  { name: 'Monitoring', path: '/dashboard/monitoring' },
  { name: 'Storage', path: '/dashboard/storage' },
  { name: 'AI', path: '/dashboard/ai' },
  { name: 'Support', path: '/dashboard/support' },
  { name: 'Settings', path: '/dashboard/settings' }
];

export const DashboardNavbar: FC<DashboardNavbarProps> = ({ username, userData }) => { 
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActiveRoute = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md relative z-30">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between px-4">
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none" 
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8 h-14">
            {navItems.map((item) => (
              <TooltipWrapper key={item.path} position="top" content="coming soon">
                <Link
                  to={item.path}
                  className={`h-full text-sm font-primary flex items-center border-b-2 transition-colors duration-200 ${
                    isActiveRoute(item.path)
                      ? 'border-primary text-primary font-medium'
                      : 'border-transparent hover:border-secondary/50 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              </TooltipWrapper>
            ))}
          </div>

          {/* Empty div for flex spacing on mobile */}
          <div className="md:hidden"></div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg absolute w-full z-40">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <TooltipWrapper key={item.path} position="right" content="coming soon">
                <Link
                  to={item.path}
                  className={`block py-3 px-2 text-base font-primary transition-colors duration-200 ${
                    isActiveRoute(item.path)
                      ? 'text-primary font-medium border-l-4 border-primary pl-3'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              </TooltipWrapper>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default DashboardNavbar;