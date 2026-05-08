import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Fuse from 'fuse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rulebookPath = path.join(__dirname, '..', 'mobile', 'assets', 'rulebook.json');
const rulebook = JSON.parse(fs.readFileSync(rulebookPath, 'utf8'));

console.log(`🔗 Generating relations for better discovery...`);

const flattened = [];
rulebook.rules.forEach(rule => {
    rule.sections.forEach(section => {
        section.articles.forEach(article => {
            flattened.push({
                ruleId: rule.rule_id,
                sectionId: section.section_id,
                articleId: article.article_id,
                fullReference: `Rule ${rule.rule_id}, Section ${section.section_id}, Article ${article.article_id}`,
                text: article.text || "",
                // Extract common keywords from the text
                keywords: (article.text || "").toLowerCase().match(/\b(holding|interference|fumble|touchback|kickoff|penalty|safety|pass|scrimmage)\b/g) || []
            });
        });
    });
});

const relations = {};

flattened.forEach(target => {
    const key = `${target.ruleId}-${target.sectionId}-${target.articleId}`;
    const related = new Set();

    // 1. Keyword Overlap (The most reliable way with current data)
    if (target.keywords.length > 0) {
        flattened.forEach(other => {
            if (other.fullReference === target.fullReference) return;

            // Check if they share at least 2 distinct keywords
            const intersection = target.keywords.filter(k => other.keywords.includes(k));
            const uniqueOverlap = new Set(intersection);

            if (uniqueOverlap.size >= 1) {
                related.add(other.fullReference);
            }
        });
    }

    // 2. Explicit "Rule X" mentions in text
    const ruleMentionRegex = /Rule (\d+)/gi;
    let match;
    while ((match = ruleMentionRegex.exec(target.text)) !== null) {
        const mentionedId = parseInt(match[1]);
        const matchRule = flattened.find(f => f.ruleId === mentionedId);
        if (matchRule) related.add(matchRule.fullReference);
    }

    // Limit to 4 related rules for a cleaner UI
    relations[key] = Array.from(related).slice(0, 4);
});

const mobileOutput = path.join(__dirname, '..', 'mobile', 'assets', 'rule_relations.json');
const webOutput = path.join(__dirname, '..', 'frontend', 'src', 'assets', 'rule_relations.json');

fs.writeFileSync(mobileOutput, JSON.stringify(relations, null, 2));
fs.writeFileSync(webOutput, JSON.stringify(relations, null, 2));

console.log(`✅ Success! Rule relations are now populated.`);
