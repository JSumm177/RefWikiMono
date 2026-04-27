import { searchRules } from '../../utils/search';

describe('searchRules', () => {
  it('returns empty array when query is empty', () => {
    const results = searchRules('');
    expect(results).toEqual([]);
  });

  it('returns valid results when searching for an exact match (e.g., "Mock Structured")', () => {
    const results = searchRules('Mock Structured');
    expect(results.length).toBeGreaterThan(0);
    // Since we know "Mock Structured" is a rule title, we expect the first match to likely contain it.
    // At minimum, results should be returned.
    expect(results[0].ruleTitle).toContain('Mock Structured');
  });

  it('returns results for fuzzy matching with small typos', () => {
    const exactResults = searchRules('Mock Structured');
    const fuzzyResults = searchRules('Mock Structuredd');

    expect(fuzzyResults.length).toBeGreaterThan(0);
    // The fuzzy search should hopefully find the same top result
    if (exactResults.length > 0 && fuzzyResults.length > 0) {
        expect(fuzzyResults[0].ruleTitle).toEqual(exactResults[0].ruleTitle);
    }
  });

  it('returns empty array for unrelated gibberish', () => {
    const results = searchRules('zzxyxzyx');
    expect(results).toEqual([]);
  });
});
