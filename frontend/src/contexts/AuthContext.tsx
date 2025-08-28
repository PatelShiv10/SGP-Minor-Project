
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  userType: 'user' | 'lawyer' | 'admin';
  id: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('lawyerProfileImage');
    // Redirect to home page after logout
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
