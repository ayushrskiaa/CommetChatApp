import React, { createContext, useState, useEffect } from 'react';
import { getLoggedInUser, loginWithUID, logout } from '../services/cometchat';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getLoggedInUser();
        setCurrentUser(user);
      } catch (error) {
        console.log('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async (uid) => {
    const user = await loginWithUID(uid);
    setCurrentUser(user);
    return user;
  };

  const logoutUser = async () => {
    try {
      await logout();
      setCurrentUser(null);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const value = {
    currentUser,
    login,
    logout: logoutUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Export context for the useAuth hook
export { AuthContext };