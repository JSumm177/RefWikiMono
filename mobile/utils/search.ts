import { API_BASE_URL } from './api';

export interface SearchableRule {
  id: number;
  sport: string;
  ruleNumber: number;
  ruleTitle: string;
  sectionNumber: number;
  sectionTitle: string;
  articleNumber: number;
  articleText: string;
  fullReference: string;
}

export const searchRules = async (sport: string, query: string): Promise<SearchableRule[]> => {
  if (!query) return [];

  try {
    const response = await fetch(`${API_BASE_URL}/api/rules/?q=${encodeURIComponent(query)}&sport=${sport.toUpperCase()}`);
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
    const response = await fetch(`${API_BASE_URL}/api/rules/${id}`);
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
    return []; // Stub for now, can be populated from local assets if needed
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
