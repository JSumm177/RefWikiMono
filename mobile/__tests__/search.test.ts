import { searchRules, getRuleByFullReference, __setCachedFlattened } from '../utils/search';

// Mock fetch globally
global.fetch = jest.fn();

describe('searchRules', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('returns empty array when query is empty', async () => {
    const results = await searchRules('NFL', '');
    expect(results).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('finds results via API', async () => {
    const mockResults = [
        { id: 1, ruleTitle: 'The Field', fullReference: 'Rule 1, Section 1, Article 1', sport: 'NFL' }
    ];

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResults,
    });

    const results = await searchRules('NFL', 'rectangular field');

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('q=rectangular%20field'));
    expect(results).toEqual(mockResults);
  });

  it('returns empty array for non-matching queries or failures', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    const results = await searchRules('NFL', 'basketball');
    expect(results).toEqual([]);
  });
});

describe('getRuleByFullReference', () => {
    const mockRules = [
        { id: 1, fullReference: 'Rule 1, Section 1', articleText: 'Text 1' } as any,
        { id: 2, fullReference: 'Rule 2, Section 1', articleText: 'Text 2' } as any,
    ];

    beforeEach(() => {
        __setCachedFlattened(mockRules);
    });

    it('returns the rule when fullReference matches exactly', () => {
        const result = getRuleByFullReference('Rule 1, Section 1');
        expect(result).toEqual(mockRules[0]);
    });

    it('returns undefined when no match is found', () => {
        const result = getRuleByFullReference('Rule 3, Section 1');
        expect(result).toBeUndefined();
    });

    it('returns undefined for an empty string', () => {
        const result = getRuleByFullReference('');
        expect(result).toBeUndefined();
    });
});
