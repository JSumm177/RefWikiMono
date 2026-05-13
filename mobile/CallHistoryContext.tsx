import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Alert } from 'react-native';
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
        const text = await response.text();
        if (text) {
          setCalls(JSON.parse(text));
        } else {
          setCalls([]);
        }
      } else {
        Alert.alert('Error', 'Failed to fetch call history from server.');
      }
    } catch (e) {
      console.error('Failed to load call history', e);
      Alert.alert('Network Error', 'Could not reach the server.');
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
          const text = await response.text();
          if (text) {
            const savedCall = JSON.parse(text);
            setCalls(prev => [savedCall, ...prev]);
          }
      } else {
        Alert.alert('Error', `Failed to save call: ${response.status}`);
      }
    } catch (e) {
      console.error('Failed to save call', e);
      Alert.alert('Network Error', 'Could not save the call.');
    }
  };

  return (
    <CallHistoryContext.Provider value={{ calls, addCall, refreshCalls, isLoading }}>
      {children}
    </CallHistoryContext.Provider>
  );
};
