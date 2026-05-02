import { describe, it, expect, vi } from 'vitest';
import { searchRules } from './search';

// Mock the rulebook.json module so we have predictable, isolated test data
vi.mock('../assets/rulebook.json', () => {
  return {
    default: {
      rules: [
        {
          rule_id: 1,
          title: "The Forward Pass",
          sections: [
            {
              section_id: 1,
              title: "Definition of Pass",
              articles: [
                {
                  article_id: 1,
                  text: "A forward pass is thrown forward."
                },
                {
                  article_id: 2,
                  text: "Illegal forward pass penalty."
                }
              ]
            }
          ]
        },
        {
          rule_id: 2,
          title: "Scoring",
          sections: [
            {
              section_id: 1,
              title: "Touchdown Rules",
              articles: [
                {
                  article_id: 1,
                  text: "A touchdown is worth 6 points."
                }
              ]
            }
          ]
        },
        {
          rule_id: 8,
          title: "Pass Interference",
          sections: [
            {
              section_id: 5,
              title: "Pass Interference Penalty",
              articles: [
                {
                  article_id: 1,
                  text: "Penalty for pass interference."
                }
              ]
            }
          ]
        }
      ]
    }
  };
});

describe('searchRules utility', () => {
  it('should return an empty array if the query is empty', () => {
    const results = searchRules('');
    expect(results).toEqual([]);
  });

  it('should find results based on rule title', () => {
    const results = searchRules('Forward Pass');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].ruleTitle).toBe('The Forward Pass');
  });

  it('should find results based on section title', () => {
    const results = searchRules('Touchdown Rules');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].sectionTitle).toBe('Touchdown Rules');
  });

  it('should find results based on article text', () => {
    const results = searchRules('worth 6 points');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].articleText).toBe('A touchdown is worth 6 points.');
  });

  it('should return an empty array for queries with no matches', () => {
    const results = searchRules('Basketball');
    expect(results).toEqual([]);
  });

  it('should correctly map the fullReference format', () => {
    const results = searchRules('Touchdown Rules');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].fullReference).toBe('Rule 2, Section 1, Article 1');
  });

  it('should return all matched articles within a rule/section', () => {
    const results = searchRules('pass');
    // We expect both article 1 and article 2 under "The Forward Pass" to be matched
    expect(results.length).toBeGreaterThanOrEqual(2);
    const ruleTitles = results.map(r => r.ruleTitle);
    expect(ruleTitles).toContain('The Forward Pass');
  });

  it('should correctly translate TV terms like PI to Pass Interference', () => {
    const results = searchRules('PI');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].ruleTitle).toBe('Pass Interference');
  });

  it('should respect the limit parameter', () => {
    // Both pass rules have 'pass' in them
    const allResults = searchRules('pass');
    expect(allResults.length).toBeGreaterThan(1);

    const limitedResults = searchRules('pass', 1);
    expect(limitedResults.length).toBe(1);
  });
});
