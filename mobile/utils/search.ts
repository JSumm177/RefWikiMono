import Fuse from 'fuse.js';
import { rulebooks, Sport } from '../assets/rules';
import { translateQuery } from './refTranslator';

export interface SearchableRule {
  ruleId: number;
  ruleTitle: string;
  sectionId: number;
  sectionTitle: string;
  articleId: number;
  articleText: string;
  fullReference: string;
  sport: Sport;
}

const flattenRulebook = (sport: Sport): SearchableRule[] => {
  const flattened: SearchableRule[] = [];
  const rulebook = rulebooks[sport];

  if (!rulebook || !rulebook.rules) return [];

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
          fullReference: `Rule ${rule.rule_id}, Section ${section.section_id}, Article ${article.article_id}`,
          sport
        });
      });
    });
  });

  return flattened;
};

let cachedFlattened: Record<string, SearchableRule[]> = {};
let fuseInstances: Record<string, Fuse<SearchableRule>> = {};

export const getRuleByReference = (sport: Sport, ruleId: number, sectionId: number, articleId: number): SearchableRule | undefined => {
    if (!cachedFlattened[sport]) {
        cachedFlattened[sport] = flattenRulebook(sport);
    }
    return cachedFlattened[sport].find(r => r.ruleId === ruleId && r.sectionId === sectionId && r.articleId === articleId);
};

export const getRuleByFullReference = (sport: Sport, fullReference: string): SearchableRule | undefined => {
    if (!cachedFlattened[sport]) {
        cachedFlattened[sport] = flattenRulebook(sport);
    }
    return cachedFlattened[sport].find(r => r.fullReference === fullReference);
};

export const searchRules = (sport: Sport, query: string, limit?: number): SearchableRule[] => {
  if (!query) return [];

  if (!fuseInstances[sport]) {
    if (!cachedFlattened[sport]) cachedFlattened[sport] = flattenRulebook(sport);
    const searchableItems = cachedFlattened[sport];
    const fuseOptions = {
      includeScore: true,
      keys: [
        { name: 'ruleTitle', weight: 3 },
        { name: 'sectionTitle', weight: 2 },
        { name: 'articleText', weight: 1 }
      ],
      threshold: 0.4,
    };
    fuseInstances[sport] = new Fuse(searchableItems, fuseOptions);
  }

  const processedQuery = translateQuery(query);
  const searchOptions = limit ? { limit } : undefined;
  const results = fuseInstances[sport].search(processedQuery, searchOptions);

  return results.map(result => result.item);
};
