import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

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
  addCall: (call: Omit<Call, 'id' | 'timestamp'>) => void;
  isLoading: boolean;
}

export const CallHistoryContext = createContext<CallHistoryContextType>({
  calls: [],
  addCall: () => {},
  isLoading: true,
});

const STORAGE_KEY = '@call_history';

export const CallHistoryProvider = ({ children }: { children: ReactNode }) => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedCalls = localStorage.getItem(STORAGE_KEY);
      if (storedCalls) {
        setCalls(JSON.parse(storedCalls));
      }
    } catch (e) {
      console.error('Failed to load call history', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addCall = (newCallData: Omit<Call, 'id' | 'timestamp'>) => {
    const newCall: Call = {
      ...newCallData,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };

    const updatedCalls = [newCall, ...calls];
    setCalls(updatedCalls);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCalls));
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
