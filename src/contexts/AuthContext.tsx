import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string } | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ email: string } | null>(null);

  // Check for session expiration
  useEffect(() => {
    const checkSessionExpiration = () => {
      const auth = localStorage.getItem('cwl_admin_auth');
      const loginTime = localStorage.getItem('cwl_admin_login_time');
      
      if (auth === 'true' && loginTime) {
        const loginTimestamp = parseInt(loginTime, 10);
        const currentTime = Date.now();
        const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        if (currentTime - loginTimestamp > oneDayInMs) {
          // Session expired
          setIsAuthenticated(false);
          setUser(null);
          localStorage.removeItem('cwl_admin_auth');
          localStorage.removeItem('cwl_admin_user');
          localStorage.removeItem('cwl_admin_login_time');
        }
      }
    };

    // Check immediately
    checkSessionExpiration();

    // Set up interval to check every minute
    const intervalId = setInterval(checkSessionExpiration, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const auth = localStorage.getItem('cwl_admin_auth');
    const userEmail = localStorage.getItem('cwl_admin_user');
    if (auth === 'true' && userEmail) {
      setIsAuthenticated(true);
      setUser({ email: userEmail });
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    if (email === 'dong@dawn.com' && password === 'mercisabadboy') {
      setIsAuthenticated(true);
      setUser({ email });
      localStorage.setItem('cwl_admin_auth', 'true');
      localStorage.setItem('cwl_admin_user', email);
      localStorage.setItem('cwl_admin_login_time', Date.now().toString());
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('cwl_admin_auth');
    localStorage.removeItem('cwl_admin_user');
    localStorage.removeItem('cwl_admin_login_time');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
