import Fuse from 'fuse.js';
import rulebook from '../assets/rulebook.json';

export interface SearchableRule {
  ruleId: number;
  ruleTitle: string;
  sectionId: number;
  sectionTitle: string;
  articleId: number;
  articleText: string;
  fullReference: string;
}

const flattenRulebook = (): SearchableRule[] => {
  const flattened: SearchableRule[] = [];

  rulebook.rules.forEach((rule: any) => {
    rule.sections.forEach((section: any) => {
      section.articles.forEach((article: any) => {
        flattened.push({
          ruleId: rule.rule_id,
          ruleTitle: rule.title,
          sectionId: section.section_id,
          sectionTitle: section.title,
          articleId: article.article_id,
          articleText: article.text,
          fullReference: `Rule ${rule.rule_id}, Section ${section.section_id}, Article ${article.article_id}`
        });
      });
    });
  });

  return flattened;
};

let _searchableItems: SearchableRule[] | null = null;
let _fuseInstance: Fuse<SearchableRule> | null = null;

const getFuseInstance = () => {
  if (!_fuseInstance) {
    if (!_searchableItems) {
      _searchableItems = flattenRulebook();
    }
    const fuseOptions = {
      includeScore: true,
      keys: [
        {
          name: 'ruleTitle',
          weight: 3
        },
        {
          name: 'sectionTitle',
          weight: 2
        },
        {
          name: 'articleText',
          weight: 1
        }
      ],
      threshold: 0.4,
    };
    _fuseInstance = new Fuse(_searchableItems, fuseOptions);
  }
  return _fuseInstance;
};

export const searchRules = (query: string): SearchableRule[] => {
  if (!query) return [];
  const fuse = getFuseInstance();
  const results = fuse.search(query);
  return results.map(result => result.item);
};
