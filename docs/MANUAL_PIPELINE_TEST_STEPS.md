# Manual Testing Pipeline Steps

This document outlines the steps to verify the NFL Rulebook PDF-to-JSON Pipeline manually.

## 1. Setup Environment
Ensure your terminal is located in the repository root. Navigate to the `scripts/` directory and install dependencies if you haven't already:
```bash
cd scripts
npm install
```

## 2. Execute Script
Run the Node.js parsing script. The script should automatically skip the download if the PDF already exists, extract the text, split it, and apply a mock formatting.

```bash
node nfl-rule-parser.mjs
```

**Expected Output in Terminal:**
You should see logging indicating the download status, the number of pages extracted, and the final output path.

## 3. Verify Output File
Navigate to the mobile assets folder and ensure the file generated correctly.

```bash
cd ../mobile/assets
cat rulebook.json
```

**Expected Data:**
The `rulebook.json` file should contain a valid JSON object starting with the title `"2025 NFL Rulebook"`, followed by a source URL, and an array of `rules`.

## 4. Run Unit Tests
To verify the chunking and mock structure logic works without manually reading the JSON output, run the script's unit test suite.

```bash
cd ../../scripts
npm test
```

**Expected Output:**
```
Running tests for nfl-rule-parser.mjs...
✅ chunkText tests passed
✅ cleanWithAI mock fallback tests passed
All tests passed successfully!
```
