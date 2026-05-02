export const REF_TO_RULE_DICT: Record<string, string> = {
  "automatic first down": "first down",
  "15 yards": "15 yards penalty",
  "facemask": "face mask",
  "horse collar": "horse-collar tackle",
  "pi": "pass interference",
  "dpi": "pass interference",
  "opi": "pass interference",
};

export const translateQuery = (query: string): string => {
  if (!query) return query;

  let translatedQuery = query.toLowerCase();

  for (const [tvTerm, ruleTerm] of Object.entries(REF_TO_RULE_DICT)) {
    // Replace whole words only, case-insensitive
    const regex = new RegExp(`\\b${tvTerm}\\b`, 'gi');
    translatedQuery = translatedQuery.replace(regex, ruleTerm);
  }

  // Preserve original casing for words not replaced?
  // Our regex replaces case-insensitive matches with the lowercase ruleTerm.
  // Fuse.js is case-insensitive, so lowercasing the whole query is fine.
  return translatedQuery;
};
