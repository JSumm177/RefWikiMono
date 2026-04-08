export interface Article {
  article_id: number;
  text: string;
}

export interface Section {
  section_id: number;
  title: string;
  articles: Article[];
}

export interface Rule {
  rule_id: number;
  title: string;
  sections: Section[];
}

export interface Rulebook {
  title: string;
  source_url: string;
  rules: Rule[];
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  RulebookTab: undefined;
  PenaltyLookup: undefined;
  Search: undefined;
  "Log Call": undefined;
  Settings: undefined;
};

export type RulebookStackParamList = {
  RulesList: undefined;
  SectionsList: { ruleId: number; title: string };
  ArticlesList: { ruleId: number; sectionId: number; title: string };
  ArticleDetail: { ruleId: number; sectionId: number; articleId: number; title?: string; highlightText?: string };
};
