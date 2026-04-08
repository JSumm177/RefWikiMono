import { Rulebook, Rule, Section, Article } from './types';
import rulebookData from './assets/rulebook.json';

const typedRulebookData = rulebookData as Rulebook;

export const getRulebookTitle = (): string => typedRulebookData.title;

export const getRules = (): Rule[] => typedRulebookData.rules;

export const getRuleById = (ruleId: number): Rule | undefined => {
  return typedRulebookData.rules.find((r) => r.rule_id === ruleId);
};

export const getSectionsByRuleId = (ruleId: number): Section[] | undefined => {
  const rule = getRuleById(ruleId);
  return rule?.sections;
};

export const getSectionById = (ruleId: number, sectionId: number): Section | undefined => {
  const sections = getSectionsByRuleId(ruleId);
  return sections?.find((s) => s.section_id === sectionId);
};

export const getArticlesBySectionId = (ruleId: number, sectionId: number): Article[] | undefined => {
  const section = getSectionById(ruleId, sectionId);
  return section?.articles;
};

export const getArticleById = (ruleId: number, sectionId: number, articleId: number): Article | undefined => {
  const articles = getArticlesBySectionId(ruleId, sectionId);
  return articles?.find((a) => a.article_id === articleId);
};

export interface FlatArticle {
  ruleId: number;
  ruleTitle: string;
  sectionId: number;
  sectionTitle: string;
  articleId: number;
  text: string;
}

export const getFlattenedArticles = (): FlatArticle[] => {
  const flat: FlatArticle[] = [];
  typedRulebookData.rules.forEach((rule) => {
    rule.sections.forEach((section) => {
      section.articles.forEach((article) => {
        flat.push({
          ruleId: rule.rule_id,
          ruleTitle: rule.title,
          sectionId: section.section_id,
          sectionTitle: section.title,
          articleId: article.article_id,
          text: article.text,
        });
      });
    });
  });
  return flat;
};
