import { searchRules } from '../utils/search';

jest.mock('../assets/rulebook.json', () => ({
  rules: [
    {
      rule_id: 1,
      title: "The Field",
      sections: [
        {
          section_id: 1,
          title: "Dimensions",
          articles: [
            {
              article_id: 1,
              text: "The game shall be played upon a rectangular field, 360 feet in length and 160 feet in width."
            }
          ]
        }
      ]
    },
    {
      rule_id: 2,
      title: "The Ball",
      sections: [
        {
          section_id: 1,
          title: "Characteristics",
          articles: [
            {
              article_id: 1,
              text: "The Ball must be a 'Wilson', hand selected, bearing the signature of the Commissioner of the League."
            }
          ]
        }
      ]
    }
  ]
}));

describe('searchRules', () => {
  it('returns empty array when query is empty', () => {
    expect(searchRules('')).toEqual([]);
  });

  it('finds results based on article text', () => {
    const results = searchRules('rectangular field');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].ruleTitle).toBe('The Field');
  });

  it('finds results based on rule title', () => {
    const results = searchRules('Ball');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].ruleTitle).toBe('The Ball');
  });

  it('finds results based on section title', () => {
    const results = searchRules('Characteristics');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].sectionTitle).toBe('Characteristics');
  });

  it('returns empty array for non-matching queries', () => {
    const results = searchRules('basketball');
    expect(results).toEqual([]);
  });
});
