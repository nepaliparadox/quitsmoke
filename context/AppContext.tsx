import * as React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LogEntry = {
  id: string;
  date: string;
  why: string;
};

export type UserData = {
  quitDate: string;
  cigsPerDay: number;
  pricePerPack: number;
  cigsPerPack: number;
  currency: string;
  theme: 'light' | 'dark' | 'system';
  savingGoal: number;
  logs: LogEntry[];
};

const DEFAULT_USER_DATA: UserData = {
  quitDate: "", // Keep empty until user sets it
  cigsPerDay: 10,
  pricePerPack: 15,
  cigsPerPack: 20,
  currency: '$',
  theme: 'system',
  savingGoal: 100,
  logs: [],
};

const STORAGE_KEY = 'QUIT_SMOKING_DATA';

type AppContextType = {
  userData: UserData;
  setUserData: (data: UserData) => void;
  isLoading: boolean;
  updateUserData: (updates: Partial<UserData>) => void;
  logSmoking: (why: string) => void;
  resetData: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>(DEFAULT_USER_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Ensure defaults are merged but keep stored values
        setUserData({ ...DEFAULT_USER_DATA, ...parsedData });
      } else {
        // First time opening app: Set the initial quit date here ONLY
        const initialData = { 
          ...DEFAULT_USER_DATA, 
          quitDate: new Date().toISOString() 
        };
        setUserData(initialData);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      }
    } catch (e) {
      console.error('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async (data: UserData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setUserData(data);
    } catch (e) {
      console.error('Failed to save user data');
    }
  };

  const updateUserData = (updates: Partial<UserData>) => {
    const newData = { ...userData, ...updates };
    saveData(newData);
  };

  const logSmoking = (why: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      why,
    };
    const newData: UserData = {
      ...userData,
      quitDate: new Date().toISOString(), // Reset quit date
      logs: [newLog, ...userData.logs],
    };
    saveData(newData);
  };

  const resetData = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      const initialData = { 
        ...DEFAULT_USER_DATA, 
        quitDate: new Date().toISOString() 
      };
      setUserData(initialData);
    } catch (e) {
      console.error('Failed to reset user data');
    }
  };

  return (
    <AppContext.Provider value={{ userData, setUserData: saveData, isLoading, updateUserData, logSmoking, resetData }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
