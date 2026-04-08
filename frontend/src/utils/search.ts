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

const searchableItems = flattenRulebook();

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

const fuse = new Fuse(searchableItems, fuseOptions);

export const searchRules = (query: string): SearchableRule[] => {
  if (!query) return [];
  const results = fuse.search(query);
  return results.map(result => result.item);
};
