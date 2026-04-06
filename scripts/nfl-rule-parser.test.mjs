import assert from 'assert';
import { chunkText, cleanWithAI } from './nfl-rule-parser.mjs';

function runTests() {
  console.log('Running tests for nfl-rule-parser.mjs...');

  // Test 1: chunkText
  const mockRawText = `This is a preface that should be ignored because it is long enough.
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Rule 1
This is the first rule. It has a bunch of text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Rule 2
This is the second rule. It also has a bunch of text. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
`;

  const chunks = chunkText(mockRawText);

  // Preface + Rule 1 + Rule 2 = 3 chunks (since preface is > 100 chars)
  assert.strictEqual(chunks.length, 3, `Expected 3 chunks, got ${chunks.length}`);
  assert.ok(chunks[1].includes('Rule 1'), 'Second chunk should contain Rule 1');
  assert.ok(chunks[2].includes('Rule 2'), 'Third chunk should contain Rule 2');

  console.log('✅ chunkText tests passed');

  // Test 2: cleanWithAI (Mock fallback)
  cleanWithAI("Some raw chunk data", 0).then(cleaned => {
    assert.strictEqual(cleaned.rule_id, 1, 'Rule ID should be 1');
    assert.strictEqual(cleaned.title, 'Rule 1 (Mock Structured)', 'Title should be mock structured');
    assert.ok(cleaned.sections.length > 0, 'Should have sections');
    console.log('✅ cleanWithAI mock fallback tests passed');

    console.log('All tests passed successfully!');
  }).catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });
}

runTests();
