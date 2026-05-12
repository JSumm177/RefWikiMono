export const REF_TO_RULE_DICT: Record<string, string> = {
  "automatic first down": "first down",
  "15 yards": "15 yards penalty",
  "facemask": "face mask",
  "horse collar": "horse-collar tackle",
  "pi": "pass interference",
  "dpi": "pass interference",
  "opi": "pass interference",
};

const PRECOMPILED_RULES = Object.entries(REF_TO_RULE_DICT).map(([tvTerm, ruleTerm]) => ({
  regex: new RegExp(`\\b${tvTerm}\\b`, 'gi'),
  ruleTerm,
}));

export const translateQuery = (query: string): string => {
  if (!query) return query;

  let translatedQuery = query.toLowerCase();

  for (const { regex, ruleTerm } of PRECOMPILED_RULES) {
    translatedQuery = translatedQuery.replace(regex, ruleTerm);
  }

  // Preserve original casing for words not replaced?
  // Our regex replaces case-insensitive matches with the lowercase ruleTerm.
  // Fuse.js is case-insensitive, so lowercasing the whole query is fine.
  return translatedQuery;
};
