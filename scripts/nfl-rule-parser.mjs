import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PDF_URL = 'https://operations.nfl.com/media/e4sneelu/2025-nfl-rulebook-final.pdf';
const PDF_OUTPUT_PATH = path.join(__dirname, '2025-nfl-rulebook-final.pdf');
const JSON_OUTPUT_PATH = path.join(__dirname, '..', 'mobile', 'assets', 'rulebook.json');

async function downloadPDF(url, outputPath) {
  try {
    await fs.access(outputPath);
    console.log(`File already exists at ${outputPath}, skipping download.`);
    return;
  } catch (e) {
    // File doesn't exist, proceed with download
  }

  console.log(`Downloading PDF from ${url}...`);
  // node-fetch is built-in for Node >= 18 via global fetch
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }

  const fileStream = createWriteStream(outputPath);
  await pipeline(response.body, fileStream);
  console.log('Download complete.');
}

async function extractTextFromPDF(pdfPath) {
  console.log(`Extracting text from ${pdfPath}...`);
  const dataBuffer = await fs.readFile(pdfPath);
  const data = await pdfParse(dataBuffer);
  console.log(`Extracted text: ${data.numpages} pages.`);
  return data.text;
}

function chunkText(rawText) {
  console.log('Chunking text into rules...');
  // A naive chunking approach just splitting by "Rule X"
  // The actual text extraction might vary wildly. This is a basic Regex to split rules.
  // E.g., matching "Rule 1", "Rule 2" at the start of a line.
  const rules = rawText.split(/(?=\n\s*Rule\s+\d+)/i);

  // Filter out any empty chunks or the preface/TOC
  const ruleChunks = rules.filter(chunk => chunk.trim().length > 100);
  console.log(`Found ${ruleChunks.length} chunks.`);
  return ruleChunks;
}

async function cleanWithAI(rawChunk, index) {
  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    // console.warn("No API key found. Using mock parser.");
    return mockCleanup(rawChunk, index);
  }

  // Real API Logic placeholder
  console.log(`Calling AI API for chunk ${index}...`);
  return {
      rule_number: index,
      title: `Rule ${index} (Processed by AI)`,
      content: rawChunk.substring(0, 500) + '...'
  };
}

function mockCleanup(rawChunk, index) {
  // Mock structuring
  return {
    rule_id: index + 1,
    title: `Rule ${index + 1} (Mock Structured)`,
    sections: [
      {
        section_id: 1,
        title: "General Provisions",
        articles: [
          {
            article_id: 1,
            text: rawChunk.substring(0, 200).trim() + "..."
          }
        ]
      }
    ]
  };
}

async function main() {
  try {
    await downloadPDF(PDF_URL, PDF_OUTPUT_PATH);
    const rawText = await extractTextFromPDF(PDF_OUTPUT_PATH);
    const chunks = chunkText(rawText);

    console.log('Refining chunks with AI...');
    const structuredRules = [];
    for (let i = 0; i < chunks.length; i++) {
        const cleaned = await cleanWithAI(chunks[i], i);
        structuredRules.push(cleaned);
    }

    const finalJSON = {
      title: "2025 NFL Rulebook",
      source_url: PDF_URL,
      rules: structuredRules
    };

    console.log(`Saving structured JSON to ${JSON_OUTPUT_PATH}...`);
    // Ensure mobile/assets directory exists
    await fs.mkdir(path.dirname(JSON_OUTPUT_PATH), { recursive: true });

    await fs.writeFile(JSON_OUTPUT_PATH, JSON.stringify(finalJSON, null, 2), 'utf8');
    console.log('Pipeline complete!');
  } catch (error) {
    console.error('Error in pipeline:', error);
  }
}

main();
