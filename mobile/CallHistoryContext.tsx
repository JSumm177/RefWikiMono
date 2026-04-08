import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Call {
  id: string;
  timestamp: string;
  penaltyName: string;
  ruleReference: string;
  controversyLevel: number;
  notes: string;
}

interface CallHistoryContextType {
  calls: Call[];
  addCall: (call: Omit<Call, 'id' | 'timestamp'>) => Promise<void>;
  isLoading: boolean;
}

export const CallHistoryContext = createContext<CallHistoryContextType>({
  calls: [],
  addCall: async () => {},
  isLoading: true,
});

const STORAGE_KEY = '@call_history';

export const CallHistoryProvider = ({ children }: { children: ReactNode }) => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const storedCalls = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedCalls) {
          setCalls(JSON.parse(storedCalls));
        }
      } catch (e) {
        console.error('Failed to load call history', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  const addCall = async (newCallData: Omit<Call, 'id' | 'timestamp'>) => {
    const newCall: Call = {
      ...newCallData,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };

    const updatedCalls = [newCall, ...calls];
    setCalls(updatedCalls);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCalls));
    } catch (e) {
      console.error('Failed to save call history', e);
    }
  };

  return (
    <CallHistoryContext.Provider value={{ calls, addCall, isLoading }}>
      {children}
    </CallHistoryContext.Provider>
  );
};
