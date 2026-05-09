import type { RuleDto } from '../api-types';

export type SearchableRule = RuleDto;

export const searchRules = async (sport: string, query: string): Promise<SearchableRule[]> => {
    if (!query) return [];

    try {
        const response = await fetch(`/api/rules/?q=${encodeURIComponent(query)}&sport=${sport.toUpperCase()}`);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Search failed', error);
    }
    return [];
};

export const getRuleById = async (id: number): Promise<SearchableRule | undefined> => {
    try {
        const response = await fetch(`/api/rules/${id}`);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Failed to fetch rule', error);
    }
    return undefined;
};
