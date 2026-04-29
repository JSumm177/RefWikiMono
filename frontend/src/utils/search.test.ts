import { vi, describe, it, expect } from 'vitest';

// Mock the rulebook.json module so we have predictable, isolated test data
vi.mock('../assets/rulebook.json', () => ({
  default: {
    rules: [
      {
        rule_id: 1,
        title: 'Mock Rule Title',
        sections: [
          {
            section_id: 1,
            title: 'Mock Section Title',
            articles: [
              {
                article_id: 1,
                text: 'This is a test article text about DIMENSIONS.'
              }
            ]
          }
        ]
      }
    ]
  }
}));

import { searchRules } from './search';

describe('searchRules utility', () => {
  it('should return an empty array if the query is empty', () => {
    const results = searchRules('');
    expect(results).toEqual([]);
  });

  it('should return matching results for a valid query matching an article text', () => {
    const results = searchRules('DIMENSIONS');
    expect(results.length).toBeGreaterThan(0);
    // Check if at least one result contains 'DIMENSIONS' in the article text
    const match = results.some(r => r.articleText.includes('DIMENSIONS'));
    expect(match).toBe(true);
  });

  it('should return matching results for a valid query matching a rule title', () => {
    const results = searchRules('Mock Rule Title');
    expect(results.length).toBeGreaterThan(0);
    const match = results.some(r => r.ruleTitle.includes('Mock Rule Title'));
    expect(match).toBe(true);
  });

  it('should return an empty array for queries with no matches', () => {
    const results = searchRules('ThisIsAQueryThatShouldNotMatchAnything12345');
    expect(results).toEqual([]);
  });
});
