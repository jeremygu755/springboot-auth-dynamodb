import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('authToken').then((stored) => {
      if (stored) setToken(stored);
      setLoading(false);
    });
  }, []);

  const saveToken = async (newToken) => {
    await AsyncStorage.setItem('authToken', newToken);
    setToken(newToken);
  };

  const setTokenDirect = (newToken) => {
    setToken(newToken);
    if (newToken) {
      AsyncStorage.setItem('authToken', newToken);
    } else {
      AsyncStorage.removeItem('authToken');
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, loading, saveToken, setTokenDirect, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
