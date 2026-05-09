import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchRules } from './search';

describe('searchRules utility', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should return an empty array if the query is empty', async () => {
    const results = await searchRules('NFL', '');
    expect(results).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should fetch results and return them', async () => {
    const mockResults = [
        { id: 1, ruleTitle: 'The Forward Pass', fullReference: 'Rule 8, Section 1, Article 1', sport: 'NFL' }
    ];

    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResults,
    });

    const results = await searchRules('NFL', 'Forward Pass');

    expect(fetch).toHaveBeenCalledWith('/api/rules/?q=Forward%20Pass&sport=NFL');
    expect(results).toEqual(mockResults);
  });

  it('should return an empty array if fetch fails', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
    });

    const results = await searchRules('NFL', 'Holding');
    expect(results).toEqual([]);
  });

  it('should handle network errors gracefully', async () => {
    (fetch as any).mockRejectedValue(new Error('Network error'));

    const results = await searchRules('NFL', 'Holding');
    expect(results).toEqual([]);
  });
});
