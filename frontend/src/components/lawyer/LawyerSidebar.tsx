
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  MessageCircle, 
  Video, 
  FileText, 
  User, 
  CreditCard, 
  Star, 
  Settings, 
  LogOut,
  Menu,
  X,
  Scale
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LawyerSidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const LawyerSidebar = ({ currentPage, setCurrentPage }: LawyerSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/lawyer-dashboard' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/lawyer-appointments' },
    { id: 'clients', label: 'Clients', icon: Users, path: '/lawyer-clients' },
    { id: 'messages', label: 'Messages', icon: MessageCircle, path: '/lawyer-messages' },
    { id: 'video-calls', label: 'Video Calls', icon: Video, path: '/lawyer-video-calls' },
    { id: 'profile', label: 'Profile', icon: User, path: '/lawyer-profile' },
    { id: 'payments', label: 'Payments', icon: CreditCard, path: '/lawyer-payments' },
    { id: 'reviews', label: 'Reviews', icon: Star, path: '/lawyer-reviews' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/lawyer-settings' }
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <div className={`
        fixed lg:sticky inset-y-0 left-0 z-40 top-0 h-screen flex-shrink-0
        ${isCollapsed ? 'w-16' : 'w-64'} 
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-white shadow-lg transition-all duration-300 ease-in-out
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-start space-x-3">
              <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center flex-shrink-0">
                <Scale className="h-5 w-5 text-white" />
              </div>
              {!isCollapsed && (
                <span className="text-xl font-bold text-navy whitespace-nowrap">Lawyer Panel</span>
              )}
            </div>
          </div>

          {/* Navigation - Scrollable */}
          <ScrollArea className="flex-1">
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-start px-4'} space-x-3 py-3 rounded-lg transition-colors
                    ${location.pathname === item.path
                      ? 'bg-teal text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                </Link>
              ))}
            </nav>
          </ScrollArea>

          {/* Bottom Section - Fixed */}
          <div className="flex-shrink-0">
            {/* Logout */}
            <div className="p-4 border-t border-gray-200">
              <button className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-start px-4'} space-x-3 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors`}>
                <LogOut className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium whitespace-nowrap">Logout</span>}
              </button>
            </div>

            {/* Collapse Toggle */}
            <div className="hidden lg:block p-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full"
              >
                {isCollapsed ? '→' : '←'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};
