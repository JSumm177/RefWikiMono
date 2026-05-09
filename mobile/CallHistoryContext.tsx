import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { API_BASE_URL } from './utils/api';

export interface Call {
  id: string;
  timestamp: string;
  penaltyName: string;
  ruleReference: string;
  controversyLevel: number;
  notes: string;
  sport: string;
  team: string;
}

interface CallHistoryContextType {
  calls: Call[];
  addCall: (call: Omit<Call, 'id' | 'timestamp'>) => Promise<void>;
  refreshCalls: () => Promise<void>;
  isLoading: boolean;
}

export const CallHistoryContext = createContext<CallHistoryContextType>({
  calls: [],
  addCall: async () => {},
  refreshCalls: async () => {},
  isLoading: true,
});

export const CallHistoryProvider = ({ children }: { children: ReactNode }) => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userToken } = useContext(AuthContext);

  const refreshCalls = async () => {
    if (!userToken) {
        setCalls([]);
        return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/calls/`, {
          headers: {
              'Authorization': `Bearer ${userToken}`,
          },
      });
      if (response.ok) {
        const data = await response.json();
        setCalls(data);
      }
    } catch (e) {
      console.error('Failed to load call history', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCalls();
  }, [userToken]);

  const addCall = async (newCallData: Omit<Call, 'id' | 'timestamp'>) => {
    if (!userToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/calls/`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userToken}`,
          },
          body: JSON.stringify(newCallData),
      });

      if (response.ok) {
          const savedCall = await response.json();
          setCalls(prev => [savedCall, ...prev]);
      }
    } catch (e) {
      console.error('Failed to save call', e);
    }
  };

  return (
    <CallHistoryContext.Provider value={{ calls, addCall, refreshCalls, isLoading }}>
      {children}
    </CallHistoryContext.Provider>
  );
};
