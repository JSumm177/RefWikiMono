import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useContext } from 'react';
import { CallHistoryProvider, CallHistoryContext } from '../CallHistoryContext';
import { AuthContext } from '../AuthContext';

const TestComponent = () => {
    const { calls, addCall, isLoading } = useContext(CallHistoryContext);

    return (
        <div>
            <div data-testid="loading-status">{isLoading ? 'Loading' : 'Ready'}</div>
            <div data-testid="calls-count">{calls.length}</div>
            {calls.map(call => (
                <div key={call.id} data-testid={`call-${call.penaltyName}`}>
                    {call.penaltyName} - {call.ruleReference}
                </div>
            ))}
            <button
                onClick={() => addCall({
                    penaltyName: 'Holding',
                    ruleReference: 'Rule 72',
                    controversyLevel: 5,
                    notes: 'Clear hold',
                    sport: 'NFL',
                    team: 'Chiefs'
                })}
            >
                Add Call
            </button>
        </div>
    );
};

describe('CallHistoryContext', () => {
    let consoleErrorSpy: any;

    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const mockAuthContext = {
        isAuthenticated: true,
        login: () => {},
        logout: () => {},
    };

    it('loads empty state if API returns empty array', async () => {
        (fetch as any).mockResolvedValue({
            ok: true,
            json: async () => [],
            text: async () => "[]"
        });

        render(
            <AuthContext.Provider value={mockAuthContext}>
                <CallHistoryProvider>
                    <TestComponent />
                </CallHistoryProvider>
            </AuthContext.Provider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading-status')).toHaveTextContent('Ready');
        });

        expect(screen.getByTestId('calls-count')).toHaveTextContent('0');
        expect(fetch).toHaveBeenCalledWith('/api/calls/', expect.anything());
    });

    it('loads stored calls from API upon initialization', async () => {
        const storedData = [
            { id: '1', timestamp: '2023-01-01T00:00:00Z', penaltyName: 'Offside', ruleReference: 'Rule 7', controversyLevel: 1, notes: 'Jumped early', sport: 'NFL', team: '' }
        ];
        (fetch as any).mockResolvedValue({
            ok: true,
            json: async () => storedData,
            text: async () => JSON.stringify(storedData)
        });

        render(
            <AuthContext.Provider value={mockAuthContext}>
                <CallHistoryProvider>
                    <TestComponent />
                </CallHistoryProvider>
            </AuthContext.Provider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading-status')).toHaveTextContent('Ready');
        });

        expect(screen.getByTestId('calls-count')).toHaveTextContent('1');
        expect(screen.getByTestId('call-Offside')).toHaveTextContent('Offside - Rule 7');
    });

    it('adds a new call via POST request', async () => {
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => [],
            text: async () => "[]"
        });

        render(
            <AuthContext.Provider value={mockAuthContext}>
                <CallHistoryProvider>
                    <TestComponent />
                </CallHistoryProvider>
            </AuthContext.Provider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading-status')).toHaveTextContent('Ready');
        });

        const newCallResponse = {
            id: 'generated-id',
            timestamp: '2023-01-01T10:00:00Z',
            penaltyName: 'Holding',
            ruleReference: 'Rule 72',
            controversyLevel: 5,
            notes: 'Clear hold',
            sport: 'NFL',
            team: 'Chiefs'
        };

        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => newCallResponse,
            text: async () => JSON.stringify(newCallResponse)
        });

        const user = userEvent.setup();
        await user.click(screen.getByRole('button', { name: 'Add Call' }));

        await waitFor(() => {
            expect(screen.getByTestId('calls-count')).toHaveTextContent('1');
        });

        expect(screen.getByTestId('call-Holding')).toHaveTextContent('Holding - Rule 72');
        expect(fetch).toHaveBeenCalledWith('/api/calls/', expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"penaltyName":"Holding"')
        }));
    });
});
