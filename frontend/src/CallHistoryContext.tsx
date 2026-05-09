import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContext';

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
  const { isAuthenticated } = useContext(AuthContext);

  const refreshCalls = async () => {
    if (!isAuthenticated) {
        setCalls([]);
        return;
    }

    try {
      const response = await fetch('/api/calls/', {
          credentials: 'include'
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
  }, [isAuthenticated]);

  const addCall = async (newCallData: Omit<Call, 'id' | 'timestamp'>) => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch('/api/calls/', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(newCallData),
          credentials: 'include'
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
