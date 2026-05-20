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
  isPublic?: boolean;
}

interface CallHistoryContextType {
  calls: Call[];
  addCall: (call: Omit<Call, 'id' | 'timestamp'>) => Promise<void>;
  refreshCalls: () => Promise<void>;
  isLoading: boolean;
  callError: string | null;
  clearCallError: () => void;
}

export const CallHistoryContext = createContext<CallHistoryContextType>({
  calls: [],
  addCall: async () => {},
  refreshCalls: async () => {},
  isLoading: true,
  callError: null,
  clearCallError: () => {},
});

export const CallHistoryProvider = ({ children }: { children: ReactNode }) => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [callError, setCallError] = useState<string | null>(null);
  const { isAuthenticated } = useContext(AuthContext);

  const clearCallError = () => setCallError(null);

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
        const text = await response.text();
        if (text) {
          setCalls(JSON.parse(text));
        } else {
          setCalls([]);
        }
      } else {
        setCallError('Failed to fetch call history from server.');
      }
    } catch (e) {
      console.error('Failed to load call history', e);
      setCallError('Network error: Could not reach the server.');
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
          const text = await response.text();
          if (text) {
            const savedCall = JSON.parse(text);
            setCalls(prev => [savedCall, ...prev]);
          }
      } else {
        setCallError(`Failed to save call: ${response.statusText}`);
      }
    } catch (e) {
      console.error('Failed to save call', e);
      setCallError('Network error: Could not save the call.');
    }
  };

  return (
    <CallHistoryContext.Provider value={{ calls, addCall, refreshCalls, isLoading, callError, clearCallError }}>
      {children}
    </CallHistoryContext.Provider>
  );
};
