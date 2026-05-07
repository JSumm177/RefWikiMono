import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Fuse from 'fuse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rulebookPath = path.join(__dirname, '..', 'mobile', 'assets', 'rulebook.json');
const rulebook = JSON.parse(fs.readFileSync(rulebookPath, 'utf8'));

console.log(`🔗 Generating relations...`);

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
                title: `${rule.title} - ${section.title}`
            });
        });
    });
});

// A slightly higher threshold to catch more results
const fuse = new Fuse(flattened, {
    keys: ['text'],
    threshold: 0.6,
    includeScore: true
});

const relations = {};

flattened.forEach(target => {
    const key = `${target.ruleId}-${target.sectionId}-${target.articleId}`;
    const related = new Set();

    // 1. Semantic Search
    // We take the first 200 characters to find topical overlap
    const query = target.text.substring(0, 500);
    const results = fuse.search(query);

    results.forEach(res => {
        // Exclude self and ensure it's "close enough"
        if (res.item.fullReference !== target.fullReference && res.score < 0.5) {
            related.add(res.item.fullReference);
        }
    });

    // 2. Explicit "See Rule" links
    const seeRuleRegex = /see Rule (\d+)/gi;
    let match;
    while ((match = seeRuleRegex.exec(target.text)) !== null) {
        const linkedRuleId = parseInt(match[1]);
        const linkedRule = flattened.find(f => f.ruleId === linkedRuleId);
        if (linkedRule) related.add(linkedRule.fullReference);
    }

    relations[key] = Array.from(related).slice(0, 5);
});

const mobileOutput = path.join(__dirname, '..', 'mobile', 'assets', 'rule_relations.json');
const webOutput = path.join(__dirname, '..', 'frontend', 'src', 'assets', 'rule_relations.json');

fs.writeFileSync(mobileOutput, JSON.stringify(relations, null, 2));
fs.writeFileSync(webOutput, JSON.stringify(relations, null, 2));

console.log(`✅ Mapping complete. Related rules saved.`);
