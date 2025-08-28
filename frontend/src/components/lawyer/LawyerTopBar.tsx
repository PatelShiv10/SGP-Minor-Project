import { useState, useEffect, useCallback } from 'react';
import { Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const LawyerTopBar = () => {
  const { user, logout } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [hasNewMessages, setHasNewMessages] = useState<boolean>(false);

  useEffect(() => {
    const storedImage = localStorage.getItem('lawyerProfileImage');
    setProfileImage(storedImage);
    const handleStorageChange = () => {
      const updatedImage = localStorage.getItem('lawyerProfileImage');
      setProfileImage(updatedImage);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => { window.removeEventListener('storage', handleStorageChange); };
  }, []);

  const pollNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/lawyers/me/notifications?clear=false', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      setHasNewMessages(Boolean(data?.data?.hasNewMessages));
    } catch {}
  }, []);

  useEffect(() => {
    if (!user || user.userType !== 'lawyer') return;
    pollNotifications();
    const id = setInterval(pollNotifications, 15000);
    return () => clearInterval(id);
  }, [pollNotifications, user]);

  const markNotificationsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/lawyers/me/notifications?clear=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setHasNewMessages(false);
    } catch {}
  };

  const unreadCount = hasNewMessages ? 1 : 0;

  const handleLogout = () => { logout(); };

  const getInitials = () => {
    if (!user) return 'L';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-navy">Welcome back, {user ? `${user.firstName} ${user.lastName}` : 'Lawyer'}</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <Popover>
              <PopoverTrigger asChild onClick={markNotificationsRead}>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-red-500 text-xs flex items-center justify-center rounded-full border-2 border-white">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-navy">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <div className="p-4 text-sm text-gray-600">{hasNewMessages ? 'You have new messages.' : 'No new notifications.'}</div>
                </div>
                <div className="p-3 border-t">
                  <Button variant="ghost" className="w-full text-sm text-teal hover:text-teal-dark">
                    View all notifications
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Profile Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-teal flex items-center justify-center">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-sm font-bold">{getInitials()}</span>
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-navy">{user ? `${user.firstName} ${user.lastName}` : 'Lawyer'}</p>
                  <p className="text-xs text-gray-600">Legal Professional</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="end">
              <div className="p-2">
                <Link to="/lawyer-profile" className="flex items-center space-x-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <Link to="/lawyer-settings" className="flex items-center space-x-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
                <hr className="my-2" />
                <button onClick={handleLogout} className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
};
