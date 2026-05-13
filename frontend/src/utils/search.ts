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

let cachedFlattened: SearchableRule[] | null = null;

const flattenRulebook = (): SearchableRule[] => {
    return []; // Stub for now
};

export const getRuleByFullReference = (fullReference: string): SearchableRule | undefined => {
    if (!cachedFlattened) {
        cachedFlattened = flattenRulebook();
    }
    return cachedFlattened.find(r => r.fullReference === fullReference);
};

// Exported for testing purposes
export const __setCachedFlattened = (rules: SearchableRule[]) => {
    cachedFlattened = rules;
};
