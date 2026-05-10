import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LogCallScreen from '../LogCallScreen';
import { CallHistoryContext } from '../CallHistoryContext';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual as any,
        useNavigate: () => mockNavigate,
    };
});

// Mock search utils
vi.mock('../utils/search', () => ({
    searchRules: vi.fn(async (sport, query) => {
        if (query === 'Rule 8') {
            return [
                {
                    ruleId: 8,
                    ruleTitle: 'Forward Pass, Backward Pass, Fumble',
                    sectionId: 1,
                    sectionTitle: 'Forward Pass',
                    articleId: 1,
                    articleText: 'Definition of forward pass...',
                    fullReference: 'Rule 8, Section 1, Article 1',
                    sport: 'NFL'
                }
            ];
        }
        return [];
    })
}));

describe('LogCallScreen', () => {
    const mockAddCall = vi.fn();
    const mockRefreshCalls = vi.fn();
    const mockContextValue = {
        calls: [],
        addCall: mockAddCall,
        refreshCalls: mockRefreshCalls,
        isLoading: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock window.alert
        vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    it('prevents submission and shows alert when required fields are missing', () => {
        render(
            <CallHistoryContext.Provider value={mockContextValue}>
                <MemoryRouter>
                    <LogCallScreen />
                </MemoryRouter>
            </CallHistoryContext.Provider>
        );

        const submitButton = screen.getByRole('button', { name: /Log Call/i });
        fireEvent.click(submitButton);

        expect(window.alert).toHaveBeenCalledWith('Please enter a penalty name and rule reference.');
        expect(mockAddCall).not.toHaveBeenCalled();
    });

    it('submits successfully when fields are filled', async () => {
        render(
            <CallHistoryContext.Provider value={mockContextValue}>
                <MemoryRouter>
                    <LogCallScreen />
                </MemoryRouter>
            </CallHistoryContext.Provider>
        );

        const penaltyNameInput = screen.getByPlaceholderText('e.g. Defensive Pass Interference');
        const ruleRefInput = screen.getByPlaceholderText('e.g. Rule 8, Section 5');
        const notesInput = screen.getByPlaceholderText('Looked like a clean break on the ball...');

        fireEvent.change(penaltyNameInput, { target: { value: 'Holding' } });
        fireEvent.change(ruleRefInput, { target: { value: 'Rule 12' } });
        fireEvent.change(notesInput, { target: { value: 'Obvious hold.' } });

        // Select a different controversy level
        const level3Button = screen.getByRole('button', { name: /3\. Let 'em Play/i });
        fireEvent.click(level3Button);

        const submitButton = screen.getByRole('button', { name: /Log Call/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockAddCall).toHaveBeenCalledWith({
                penaltyName: 'Holding',
                ruleReference: 'Rule 12',
                controversyLevel: 3,
                notes: 'Obvious hold.',
                sport: 'NFL',
                team: '',
                isPublic: false
            });
        });
        expect(window.alert).toHaveBeenCalledWith('Call logged to history!');
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('updates controversy level on click', () => {
        render(
            <CallHistoryContext.Provider value={mockContextValue}>
                <MemoryRouter>
                    <LogCallScreen />
                </MemoryRouter>
            </CallHistoryContext.Provider>
        );

        const level5Button = screen.getByRole('button', { name: /5\. Total Robbery/i });
        fireEvent.click(level5Button);

        // Verify description for level 5 is visible when selected
        expect(screen.getByText('Refs absolutely blew it')).toBeInTheDocument();
    });

    it('shows search dropdown when typing rule reference and allows selection', async () => {
        render(
            <CallHistoryContext.Provider value={mockContextValue}>
                <MemoryRouter>
                    <LogCallScreen />
                </MemoryRouter>
            </CallHistoryContext.Provider>
        );

        const ruleRefInput = screen.getByPlaceholderText('e.g. Rule 8, Section 5');

        // Type "Rule 8" which triggers our mock
        fireEvent.change(ruleRefInput, { target: { value: 'Rule 8' } });

        // Wait for dropdown to appear
        await waitFor(() => {
            expect(screen.getByText('Rule 8, Section 1, Article 1')).toBeInTheDocument();
        });

        // Click the dropdown item
        const dropdownItem = screen.getByText('Rule 8, Section 1, Article 1').closest('li');
        expect(dropdownItem).not.toBeNull();
        fireEvent.click(dropdownItem!);

        // Verify input was updated to the full reference
        expect(ruleRefInput).toHaveValue('Rule 8, Section 1, Article 1');

        // Verify dropdown is closed (item is gone)
        expect(screen.queryByText('Definition of forward pass...')).not.toBeInTheDocument();
    });
});
