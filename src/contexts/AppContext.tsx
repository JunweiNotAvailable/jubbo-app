import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserModel } from '../lib/models';
import { Config } from '../lib/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../lib/functions';

interface AppContextType {
  // User state
  user: UserModel | null;
  setUser: React.Dispatch<React.SetStateAction<UserModel | null>>
  // Loading states
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // User and session state
  const [user, setUser] = useState<UserModel | null>(null);
  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user when app starts
  useEffect(() => {
    (async () => {
      // const user = // load current user from database
      const userData: UserModel = await getTempUser();
      setUser(userData);

      // Set loading to false
      setIsLoading(false);
    })();
  }, []);

  const getTempUser = async () => {
    const username = await AsyncStorage.getItem('username');
    const user: UserModel = {
      id: '',
      name: username || '',
      email: '',
      created_at: new Date().toISOString(),
    };
    return user;
  }

  return (
    <AppContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};


export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
};

export default AppProvider;