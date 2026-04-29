import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useContext } from 'react';
import { CallHistoryProvider, CallHistoryContext } from '../CallHistoryContext';

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
                    notes: 'Clear hold'
                })}
            >
                Add Call
            </button>
        </div>
    );
};

describe('CallHistoryContext', () => {
    let getItemSpy: any;
    let setItemSpy: any;
    let consoleErrorSpy: any;

    beforeEach(() => {
        getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
        setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        window.localStorage.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('loads empty state if localStorage is empty', async () => {
        getItemSpy.mockReturnValue(null);

        render(
            <CallHistoryProvider>
                <TestComponent />
            </CallHistoryProvider>
        );

        // Wait for loading to finish
        await waitFor(() => {
            expect(screen.getByTestId('loading-status')).toHaveTextContent('Ready');
        });

        expect(screen.getByTestId('calls-count')).toHaveTextContent('0');
        expect(getItemSpy).toHaveBeenCalledWith('@call_history');
    });

    it('loads stored calls from localStorage upon initialization', async () => {
        const storedData = [
            { id: '1', timestamp: '2023-01-01T00:00:00Z', penaltyName: 'Offside', ruleReference: 'Rule 7', controversyLevel: 1, notes: 'Jumped early' }
        ];
        getItemSpy.mockReturnValue(JSON.stringify(storedData));

        render(
            <CallHistoryProvider>
                <TestComponent />
            </CallHistoryProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading-status')).toHaveTextContent('Ready');
        });

        expect(screen.getByTestId('calls-count')).toHaveTextContent('1');
        expect(screen.getByTestId('call-Offside')).toHaveTextContent('Offside - Rule 7');
        expect(getItemSpy).toHaveBeenCalledWith('@call_history');
    });

    it('handles localStorage.getItem error gracefully', async () => {
        getItemSpy.mockImplementation(() => {
            throw new Error('Access denied');
        });

        render(
            <CallHistoryProvider>
                <TestComponent />
            </CallHistoryProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading-status')).toHaveTextContent('Ready');
        });

        expect(screen.getByTestId('calls-count')).toHaveTextContent('0');
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load call history', expect.any(Error));
    });

    it('handles JSON.parse error gracefully', async () => {
        getItemSpy.mockReturnValue('invalid-json');

        render(
            <CallHistoryProvider>
                <TestComponent />
            </CallHistoryProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading-status')).toHaveTextContent('Ready');
        });

        expect(screen.getByTestId('calls-count')).toHaveTextContent('0');
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load call history', expect.any(Error));
    });

    it('adds a new call, generates id and timestamp, and saves to localStorage', async () => {
        getItemSpy.mockReturnValue(null);

        render(
            <CallHistoryProvider>
                <TestComponent />
            </CallHistoryProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading-status')).toHaveTextContent('Ready');
        });

        // Add call
        const user = userEvent.setup();
        await user.click(screen.getByRole('button', { name: 'Add Call' }));

        expect(screen.getByTestId('calls-count')).toHaveTextContent('1');
        expect(screen.getByTestId('call-Holding')).toHaveTextContent('Holding - Rule 72');

        expect(setItemSpy).toHaveBeenCalledWith('@call_history', expect.stringContaining('"penaltyName":"Holding"'));
        expect(setItemSpy).toHaveBeenCalledWith('@call_history', expect.stringContaining('"id":'));
        expect(setItemSpy).toHaveBeenCalledWith('@call_history', expect.stringContaining('"timestamp":'));
    });

    it('handles localStorage.setItem error gracefully', async () => {
        getItemSpy.mockReturnValue(null);
        setItemSpy.mockImplementation(() => {
            throw new Error('Quota exceeded');
        });

        render(
            <CallHistoryProvider>
                <TestComponent />
            </CallHistoryProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading-status')).toHaveTextContent('Ready');
        });

        const user = userEvent.setup();
        await user.click(screen.getByRole('button', { name: 'Add Call' }));

        expect(screen.getByTestId('calls-count')).toHaveTextContent('1');
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to save call history', expect.any(Error));
    });
});
