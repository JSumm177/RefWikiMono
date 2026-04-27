import { describe, it, expect, vi } from 'vitest';
import { searchRules } from './search';

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
        }
      ]
    }
  };
});

describe('searchRules', () => {
  it('returns empty array when query is empty', () => {
    expect(searchRules('')).toEqual([]);
  });

  it('finds results based on ruleTitle', () => {
    const results = searchRules('Forward Pass');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].ruleTitle).toBe('The Forward Pass');
  });

  it('finds results based on sectionTitle', () => {
    const results = searchRules('Touchdown Rules');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].sectionTitle).toBe('Touchdown Rules');
  });

  it('finds results based on articleText', () => {
    const results = searchRules('worth 6 points');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].articleText).toBe('A touchdown is worth 6 points.');
  });

  it('returns empty array for queries with no match', () => {
    const results = searchRules('Basketball');
    expect(results).toEqual([]);
  });

  it('correctly maps the fullReference format', () => {
    const results = searchRules('Touchdown Rules');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].fullReference).toBe('Rule 2, Section 1, Article 1');
  });

  it('returns all matched articles within a rule/section', () => {
    const results = searchRules('pass');
    // We expect both article 1 and article 2 under "The Forward Pass" to be matched
    expect(results.length).toBeGreaterThanOrEqual(2);
    const ruleTitles = results.map(r => r.ruleTitle);
    expect(ruleTitles).toContain('The Forward Pass');
  });
});
