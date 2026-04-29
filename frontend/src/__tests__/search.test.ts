import { describe, it, expect, vi } from 'vitest';
import { searchRules } from '../utils/search';

vi.mock('../assets/rulebook.json', () => ({
  default: {
    rules: [
      {
        rule_id: 1,
        title: "Test Rule Title",
        sections: [
          {
            section_id: 1,
            title: "Test Section Title",
            articles: [
              {
                article_id: 1,
                text: "This is a test article about kickoffs and fair catches."
              },
              {
                article_id: 2,
                text: "Another article mentioning touchbacks."
              }
            ]
          }
        ]
      },
      {
        rule_id: 2,
        title: "Unrelated Rule",
        sections: [
          {
            section_id: 1,
            title: "General Provisions",
            articles: [
              {
                article_id: 1,
                text: "Just some text here."
              }
            ]
          }
        ]
      }
    ]
  }
}));

describe('searchRules', () => {
  it('should return empty array when query is empty', () => {
    expect(searchRules('')).toEqual([]);
  });

  it('should find rules based on article text', () => {
    const results = searchRules('kickoffs');
    expect(results).toHaveLength(1);
    expect(results[0].ruleId).toBe(1);
    expect(results[0].articleId).toBe(1);
    expect(results[0].articleText).toContain('kickoffs');
  });

  it('should find rules based on rule title', () => {
    const results = searchRules('Test Rule Title');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].ruleTitle).toBe('Test Rule Title');
  });

  it('should return empty array for non-matching queries', () => {
    const results = searchRules('xyzzy non-existent query');
    expect(results).toEqual([]);
  });
});
