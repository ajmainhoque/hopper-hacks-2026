import { CodingProblem, CodingLanguage } from './types';
import { Difficulty } from '../engine/types';

const LANGUAGE_NAMES: Record<CodingLanguage, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  c: 'C',
  cpp: 'C++',
  java: 'Java',
};

interface FallbackVariant {
  base: Omit<CodingProblem, 'starterCode' | 'functionSignature'>;
  starters: Record<CodingLanguage, { starterCode: string; functionSignature: string }>;
}

const FALLBACK_VARIANTS: FallbackVariant[] = [
  // EASY fallback problems — trivially simple, ~1 line of logic
  {
    base: {
      id: 'fallback_easy_1', difficulty: 'EASY', title: 'Double the Spell Power',
      description: 'Given a spell power (number), return the power doubled. For example, if the power is 5, return 10.',
      functionName: 'doubleSpellPower',
      testCases: [
        { input: [5], expectedOutput: 10 },
        { input: [0], expectedOutput: 0 },
        { input: [13], expectedOutput: 26 },
      ],
      hiddenTestCases: [
        { input: [100], expectedOutput: 200 },
        { input: [1], expectedOutput: 2 },
      ],
      timeLimit: 3000,
    },
    starters: {
      javascript: { functionSignature: 'function doubleSpellPower(power)', starterCode: 'function doubleSpellPower(power) {\n  // Your code here\n}' },
      python: { functionSignature: 'def double_spell_power(power):', starterCode: 'def double_spell_power(power):\n    # Your code here\n    pass' },
      c: { functionSignature: 'int doubleSpellPower(int power)', starterCode: 'int doubleSpellPower(int power) {\n    // Your code here\n    return 0;\n}' },
      cpp: { functionSignature: 'int doubleSpellPower(int power)', starterCode: 'int doubleSpellPower(int power) {\n    // Your code here\n    return 0;\n}' },
      java: { functionSignature: 'public static int doubleSpellPower(int power)', starterCode: 'public static int doubleSpellPower(int power) {\n    // Your code here\n    return 0;\n}' },
    },
  },
  {
    base: {
      id: 'fallback_easy_2', difficulty: 'EASY', title: 'Spell Name Length',
      description: 'Given a spell name (string), return the number of characters in it. For example, "lumos" has 5 characters.',
      functionName: 'spellLength',
      testCases: [
        { input: ['lumos'], expectedOutput: 5 },
        { input: ['expelliarmus'], expectedOutput: 12 },
        { input: ['nox'], expectedOutput: 3 },
      ],
      hiddenTestCases: [
        { input: [''], expectedOutput: 0 },
        { input: ['a'], expectedOutput: 1 },
      ],
      timeLimit: 3000,
    },
    starters: {
      javascript: { functionSignature: 'function spellLength(spell)', starterCode: 'function spellLength(spell) {\n  // Your code here\n}' },
      python: { functionSignature: 'def spell_length(spell):', starterCode: 'def spell_length(spell):\n    # Your code here\n    pass' },
      c: { functionSignature: 'int spellLength(const char* spell)', starterCode: '#include <string.h>\n\nint spellLength(const char* spell) {\n    // Your code here\n    return 0;\n}' },
      cpp: { functionSignature: 'int spellLength(string spell)', starterCode: '#include <string>\nusing namespace std;\n\nint spellLength(string spell) {\n    // Your code here\n    return 0;\n}' },
      java: { functionSignature: 'public static int spellLength(String spell)', starterCode: 'public static int spellLength(String spell) {\n    // Your code here\n    return 0;\n}' },
    },
  },
  {
    base: {
      id: 'fallback_easy_3', difficulty: 'EASY', title: 'Add House Points',
      description: 'Given two numbers representing points earned in two classes, return their sum.',
      functionName: 'addPoints',
      testCases: [
        { input: [10, 20], expectedOutput: 30 },
        { input: [0, 5], expectedOutput: 5 },
        { input: [7, 3], expectedOutput: 10 },
      ],
      hiddenTestCases: [
        { input: [0, 0], expectedOutput: 0 },
        { input: [100, 200], expectedOutput: 300 },
      ],
      timeLimit: 3000,
    },
    starters: {
      javascript: { functionSignature: 'function addPoints(a, b)', starterCode: 'function addPoints(a, b) {\n  // Your code here\n}' },
      python: { functionSignature: 'def add_points(a, b):', starterCode: 'def add_points(a, b):\n    # Your code here\n    pass' },
      c: { functionSignature: 'int addPoints(int a, int b)', starterCode: 'int addPoints(int a, int b) {\n    // Your code here\n    return 0;\n}' },
      cpp: { functionSignature: 'int addPoints(int a, int b)', starterCode: 'int addPoints(int a, int b) {\n    // Your code here\n    return 0;\n}' },
      java: { functionSignature: 'public static int addPoints(int a, int b)', starterCode: 'public static int addPoints(int a, int b) {\n    // Your code here\n    return 0;\n}' },
    },
  },
  // MEDIUM fallback problems — simple, 1-2 lines of logic
  {
    base: {
      id: 'fallback_medium_1', difficulty: 'MEDIUM', title: 'Reverse a Magic Word',
      description: 'Given a magic word (string), return the word reversed. For example, "lumos" becomes "somul".',
      functionName: 'reverseMagicWord',
      testCases: [
        { input: ['lumos'], expectedOutput: 'somul' },
        { input: ['expelliarmus'], expectedOutput: 'sumraillepxe' },
        { input: ['nox'], expectedOutput: 'xon' },
      ],
      hiddenTestCases: [
        { input: ['abracadabra'], expectedOutput: 'arbadacarba' },
        { input: [''], expectedOutput: '' },
      ],
      timeLimit: 4000,
    },
    starters: {
      javascript: { functionSignature: 'function reverseMagicWord(word)', starterCode: 'function reverseMagicWord(word) {\n  // Your code here\n}' },
      python: { functionSignature: 'def reverse_magic_word(word):', starterCode: 'def reverse_magic_word(word):\n    # Your code here\n    pass' },
      c: { functionSignature: 'char* reverseMagicWord(const char* word)', starterCode: '#include <string.h>\n#include <stdlib.h>\n\nchar* reverseMagicWord(const char* word) {\n    // Your code here\n    return NULL;\n}' },
      cpp: { functionSignature: 'string reverseMagicWord(string word)', starterCode: '#include <string>\nusing namespace std;\n\nstring reverseMagicWord(string word) {\n    // Your code here\n    return "";\n}' },
      java: { functionSignature: 'public static String reverseMagicWord(String word)', starterCode: 'public static String reverseMagicWord(String word) {\n    // Your code here\n    return "";\n}' },
    },
  },
  {
    base: {
      id: 'fallback_medium_2', difficulty: 'MEDIUM', title: 'Sum of Wand Lengths',
      description: 'Given an array of wand lengths (numbers), return the total sum of all wand lengths.',
      functionName: 'sumWandLengths',
      testCases: [
        { input: [[11, 13, 14, 10]], expectedOutput: 48 },
        { input: [[9, 10, 11]], expectedOutput: 30 },
        { input: [[15]], expectedOutput: 15 },
      ],
      hiddenTestCases: [
        { input: [[]], expectedOutput: 0 },
        { input: [[1, 2, 3, 4, 5]], expectedOutput: 15 },
      ],
      timeLimit: 4000,
    },
    starters: {
      javascript: { functionSignature: 'function sumWandLengths(lengths)', starterCode: 'function sumWandLengths(lengths) {\n  // Your code here\n}' },
      python: { functionSignature: 'def sum_wand_lengths(lengths):', starterCode: 'def sum_wand_lengths(lengths):\n    # Your code here\n    pass' },
      c: { functionSignature: 'int sumWandLengths(int* lengths, int n)', starterCode: 'int sumWandLengths(int* lengths, int n) {\n    // Your code here\n    return 0;\n}' },
      cpp: { functionSignature: 'int sumWandLengths(vector<int> lengths)', starterCode: '#include <vector>\nusing namespace std;\n\nint sumWandLengths(vector<int> lengths) {\n    // Your code here\n    return 0;\n}' },
      java: { functionSignature: 'public static int sumWandLengths(int[] lengths)', starterCode: 'public static int sumWandLengths(int[] lengths) {\n    // Your code here\n    return 0;\n}' },
    },
  },
  {
    base: {
      id: 'fallback_medium_3', difficulty: 'MEDIUM', title: 'Find the Strongest Spell',
      description: 'Given an array of spell power values (numbers), return the largest value.',
      functionName: 'strongestSpell',
      testCases: [
        { input: [[10, 30, 20]], expectedOutput: 30 },
        { input: [[5, 5, 5]], expectedOutput: 5 },
        { input: [[42]], expectedOutput: 42 },
      ],
      hiddenTestCases: [
        { input: [[1, 2, 3, 4, 5]], expectedOutput: 5 },
        { input: [[100, 50, 75]], expectedOutput: 100 },
      ],
      timeLimit: 4000,
    },
    starters: {
      javascript: { functionSignature: 'function strongestSpell(powers)', starterCode: 'function strongestSpell(powers) {\n  // Your code here\n}' },
      python: { functionSignature: 'def strongest_spell(powers):', starterCode: 'def strongest_spell(powers):\n    # Your code here\n    pass' },
      c: { functionSignature: 'int strongestSpell(int* powers, int n)', starterCode: 'int strongestSpell(int* powers, int n) {\n    // Your code here\n    return 0;\n}' },
      cpp: { functionSignature: 'int strongestSpell(vector<int> powers)', starterCode: '#include <vector>\nusing namespace std;\n\nint strongestSpell(vector<int> powers) {\n    // Your code here\n    return 0;\n}' },
      java: { functionSignature: 'public static int strongestSpell(int[] powers)', starterCode: 'public static int strongestSpell(int[] powers) {\n    // Your code here\n    return 0;\n}' },
    },
  },
  // HARD fallback problems — straightforward, solvable in under 2 minutes
  {
    base: {
      id: 'fallback_hard_1', difficulty: 'HARD', title: 'Count Potions',
      description: 'Given an array of potion names and a target potion, return how many times the target potion appears in the array.',
      functionName: 'countPotions',
      testCases: [
        { input: [['felix', 'polyjuice', 'felix', 'amortentia'], 'felix'], expectedOutput: 2 },
        { input: [['veritaserum', 'polyjuice', 'felix'], 'draught'], expectedOutput: 0 },
        { input: [['felix', 'felix', 'felix'], 'felix'], expectedOutput: 3 },
      ],
      hiddenTestCases: [
        { input: [[], 'felix'], expectedOutput: 0 },
        { input: [['polyjuice'], 'polyjuice'], expectedOutput: 1 },
      ],
      timeLimit: 5000,
    },
    starters: {
      javascript: { functionSignature: 'function countPotions(potions, target)', starterCode: 'function countPotions(potions, target) {\n  // Your code here\n}' },
      python: { functionSignature: 'def count_potions(potions, target):', starterCode: 'def count_potions(potions, target):\n    # Your code here\n    pass' },
      c: { functionSignature: 'int countPotions(char** potions, int n, char* target)', starterCode: '#include <string.h>\n\nint countPotions(char** potions, int n, char* target) {\n    // Your code here\n    return 0;\n}' },
      cpp: { functionSignature: 'int countPotions(vector<string> potions, string target)', starterCode: '#include <vector>\n#include <string>\nusing namespace std;\n\nint countPotions(vector<string> potions, string target) {\n    // Your code here\n    return 0;\n}' },
      java: { functionSignature: 'public static int countPotions(String[] potions, String target)', starterCode: 'public static int countPotions(String[] potions, String target) {\n    // Your code here\n    return 0;\n}' },
    },
  },
  {
    base: {
      id: 'fallback_hard_2', difficulty: 'HARD', title: 'Is Spell a Palindrome',
      description: 'Given a spell name (string), return true if it reads the same forwards and backwards (case-insensitive), false otherwise. For example, "Aba" is a palindrome.',
      functionName: 'isSpellPalindrome',
      testCases: [
        { input: ['racecar'], expectedOutput: true },
        { input: ['lumos'], expectedOutput: false },
        { input: ['Aba'], expectedOutput: true },
      ],
      hiddenTestCases: [
        { input: ['a'], expectedOutput: true },
        { input: ['ab'], expectedOutput: false },
      ],
      timeLimit: 5000,
    },
    starters: {
      javascript: { functionSignature: 'function isSpellPalindrome(spell)', starterCode: 'function isSpellPalindrome(spell) {\n  // Your code here\n}' },
      python: { functionSignature: 'def is_spell_palindrome(spell):', starterCode: 'def is_spell_palindrome(spell):\n    # Your code here\n    pass' },
      c: { functionSignature: 'int isSpellPalindrome(const char* spell)', starterCode: '#include <string.h>\n#include <ctype.h>\n\nint isSpellPalindrome(const char* spell) {\n    // Return 1 for true, 0 for false\n    return 0;\n}' },
      cpp: { functionSignature: 'bool isSpellPalindrome(string spell)', starterCode: '#include <string>\n#include <algorithm>\nusing namespace std;\n\nbool isSpellPalindrome(string spell) {\n    // Your code here\n    return false;\n}' },
      java: { functionSignature: 'public static boolean isSpellPalindrome(String spell)', starterCode: 'public static boolean isSpellPalindrome(String spell) {\n    // Your code here\n    return false;\n}' },
    },
  },
  {
    base: {
      id: 'fallback_hard_3', difficulty: 'HARD', title: 'Filter Powerful Spells',
      description: 'Given an array of spell power values and a threshold number, return a new array containing only the values that are greater than or equal to the threshold.',
      functionName: 'filterPowerful',
      testCases: [
        { input: [[10, 30, 5, 20, 15], 15], expectedOutput: [30, 20, 15] },
        { input: [[1, 2, 3], 5], expectedOutput: [] },
        { input: [[50, 40, 60], 40], expectedOutput: [50, 40, 60] },
      ],
      hiddenTestCases: [
        { input: [[], 10], expectedOutput: [] },
        { input: [[7, 8, 9], 7], expectedOutput: [7, 8, 9] },
      ],
      timeLimit: 5000,
    },
    starters: {
      javascript: { functionSignature: 'function filterPowerful(powers, threshold)', starterCode: 'function filterPowerful(powers, threshold) {\n  // Your code here\n}' },
      python: { functionSignature: 'def filter_powerful(powers, threshold):', starterCode: 'def filter_powerful(powers, threshold):\n    # Your code here\n    pass' },
      c: { functionSignature: 'int filterPowerful(int* powers, int n, int threshold, int* out)', starterCode: 'int filterPowerful(int* powers, int n, int threshold, int* out) {\n    // Store results in out[], return count\n    return 0;\n}' },
      cpp: { functionSignature: 'vector<int> filterPowerful(vector<int> powers, int threshold)', starterCode: '#include <vector>\nusing namespace std;\n\nvector<int> filterPowerful(vector<int> powers, int threshold) {\n    // Your code here\n    return {};\n}' },
      java: { functionSignature: 'public static List<Integer> filterPowerful(int[] powers, int threshold)', starterCode: 'import java.util.*;\n\npublic static List<Integer> filterPowerful(int[] powers, int threshold) {\n    // Your code here\n    return new ArrayList<>();\n}' },
    },
  },
];

let fallbackIndex = { easy: 0, medium: 0, hard: 0 };

// Track recently generated problem titles to avoid repetition
const recentTitles: string[] = [];
const MAX_RECENT = 10;

const THEME_POOLS = [
  'Quidditch and broomstick racing',
  'Potions class and ingredient mixing',
  'Magical creatures and the Forbidden Forest',
  'Hogwarts house points and sorting',
  'Spell casting and dueling club',
  'Diagon Alley shopping',
  'Marauder\'s Map and secret passages',
  'Owl post and message delivery',
  'Wizard chess strategy',
  'Triwizard Tournament challenges',
  'Room of Requirement puzzles',
  'Herbology and magical plants',
  'Defense Against the Dark Arts',
  'Goblin banking at Gringotts',
  'Time-Turner paradoxes',
  'Patronus charm and memories',
  'Wand crafting and core materials',
  'Hogwarts Express journey',
];

function getRandomFallback(difficulty: Difficulty, language: CodingLanguage): CodingProblem {
  const pool = FALLBACK_VARIANTS.filter(p => p.base.difficulty === difficulty);
  const key = difficulty === 'EASY' ? 'easy' : difficulty === 'MEDIUM' ? 'medium' : 'hard';
  const variant = pool[fallbackIndex[key] % pool.length];
  fallbackIndex[key]++;
  const langStarter = variant.starters[language];
  return { ...variant.base, ...langStarter, id: `${variant.base.id}_${Date.now()}` };
}

function extractJSON(text: string): string {
  // Strip markdown code fences (handles ```json, ```, extra whitespace, CRLF)
  const fenceMatch = text.match(/```\w*\s*\r?\n([\s\S]*?)\r?\n\s*```/);
  if (fenceMatch) return fenceMatch[1].trim();
  // Fallback: try stripping leading/trailing ``` lines manually
  const stripped = text.replace(/^```\w*\s*\r?\n?/, '').replace(/\r?\n?\s*```\s*$/, '').trim();
  if (stripped !== text && stripped.startsWith('{')) return stripped;
  // Fallback: extract first JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];
  return text;
}

function repairJSON(text: string): string {
  // Fix unescaped newlines inside JSON string values
  let inString = false;
  let escaped = false;
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\' && inString) {
      result += ch;
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }
    if (inString && ch === '\n') {
      result += '\\n';
      continue;
    }
    if (inString && ch === '\r') {
      continue;
    }
    if (inString && ch === '\t') {
      result += '\\t';
      continue;
    }
    result += ch;
  }
  return result;
}

function aggressiveJSONRepair(text: string): string {
  let s = text;
  // Remove trailing commas before } or ]
  s = s.replace(/,\s*([}\]])/g, '$1');
  // Replace single quotes with double quotes (outside of already double-quoted strings)
  // Simple heuristic: if the text has no double quotes at all, swap singles
  if (!s.includes('"') && s.includes("'")) {
    s = s.replace(/'/g, '"');
  }
  // Try to fix truncated JSON by closing open brackets/braces
  let braces = 0, brackets = 0;
  let inStr = false, esc = false;
  for (const ch of s) {
    if (esc) { esc = false; continue; }
    if (ch === '\\' && inStr) { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === '{') braces++;
    if (ch === '}') braces--;
    if (ch === '[') brackets++;
    if (ch === ']') brackets--;
  }
  // If inside a string, close it
  if (inStr) s += '"';
  // Close any open brackets/braces
  while (brackets > 0) { s += ']'; brackets--; }
  while (braces > 0) { s += '}'; braces--; }
  return s;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeParseJSON(text: string): any {
  const extracted = extractJSON(text);
  // Try 1: direct parse
  try { return JSON.parse(extracted); } catch { /* continue */ }
  // Try 2: fix unescaped newlines in strings
  try { return JSON.parse(repairJSON(extracted)); } catch { /* continue */ }
  // Try 3: aggressive repair (trailing commas, truncation, etc.)
  try { return JSON.parse(aggressiveJSONRepair(repairJSON(extracted))); } catch { /* continue */ }
  // Try 4: aggressive repair on raw text
  try { return JSON.parse(aggressiveJSONRepair(repairJSON(text))); } catch { /* continue */ }
  throw new Error('Could not parse JSON from LLM response');
}

// Serialize all Cortex API calls so only one request is in-flight at a time.
// This prevents Snowflake rate-limiting when multiple requests fire concurrently.
let cortexQueue: Promise<unknown> = Promise.resolve();

async function callCortexRaw(prompt: string, temperature: number): Promise<string> {
  const pat = import.meta.env.VITE_SNOWFLAKE_PAT;
  const model = import.meta.env.VITE_SNOWFLAKE_MODEL || 'llama3.1-405b';

  if (!pat) {
    throw new Error('Snowflake Cortex not configured — set VITE_SNOWFLAKE_PAT in .env');
  }

  // Use the Vite dev-server proxy to avoid CORS issues
  const url = '/api/snowflake/api/v2/cortex/inference:complete';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${pat}`,
      'X-Snowflake-Authorization-Token-Type': 'PROGRAMMATIC_ACCESS_TOKEN',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: 8192,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`Snowflake Cortex ${response.status}: ${errBody.slice(0, 300)}`);
  }

  // Snowflake Cortex returns Server-Sent Events (streaming).
  // Collect all "data:" chunks and concatenate the content.
  const rawText = await response.text();
  let fullContent = '';
  for (const line of rawText.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data:')) continue;
    const jsonStr = trimmed.slice(5).trim();
    if (!jsonStr || jsonStr === '[DONE]') continue;
    try {
      const chunk = JSON.parse(jsonStr);
      const delta = chunk.choices?.[0]?.delta;
      if (delta?.content) {
        fullContent += delta.content;
      }
    } catch {
      // skip malformed chunk
    }
  }

  if (!fullContent) throw new Error('No content in Cortex response');
  return fullContent;
}

async function callCortex(prompt: string, temperature: number): Promise<string> {
  // Chain onto the queue so requests run one at a time
  const result = cortexQueue.then(
    () => callCortexRaw(prompt, temperature),
    () => callCortexRaw(prompt, temperature), // also chain after rejected
  );
  // Update queue head (swallow errors so the chain doesn't break)
  cortexQueue = result.catch(() => {});
  return result;
}

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  EASY: 'A trivially simple problem solvable in 30 seconds: return a value, basic arithmetic on one or two numbers, string length, check if a number is even/odd, return the first/last element of an array, or concatenate two strings. ONE line of logic at most.',
  MEDIUM: 'A very simple problem solvable in 1 minute: reverse a string, sum an array, count occurrences of an item in a list, find the max/min of an array, or basic string formatting. One or two lines of logic.',
  HARD: 'A straightforward problem solvable in under 2 minutes: filter an array by a condition, check if a string is a palindrome, count word frequencies, find two numbers that sum to a target using a simple loop, or sort an array. No recursion, no dynamic programming, no graph traversal, no advanced data structures.',
};

const DIFFICULTY_TIME_LIMITS: Record<Difficulty, number> = {
  EASY: 3000,
  MEDIUM: 4000,
  HARD: 5000,
};

/**
 * Extract the real function name from starter code to ensure consistency
 * between what the user sees/writes and what the test runner calls.
 */
function extractFunctionNameFromCode(starterCode: string, language: CodingLanguage): string | null {
  if (language === 'python') {
    const m = starterCode.match(/def\s+(\w+)/);
    return m ? m[1] : null;
  }
  if (language === 'javascript') {
    // Try standard function declaration first
    const m = starterCode.match(/function\s+(\w+)/);
    if (m) return m[1];
    // Try arrow function: const/let/var name = (...) =>
    const arrow = starterCode.match(/(?:const|let|var)\s+(\w+)\s*=/);
    return arrow ? arrow[1] : null;
  }
  if (language === 'java') {
    // Match patterns like "public static int foo(" or "static String foo("
    const m = starterCode.match(/(?:public\s+)?(?:static\s+)?\w+(?:<[^>]+>)?\s+(\w+)\s*\(/);
    return m ? m[1] : null;
  }
  // C / C++ — match "type funcName("
  const m = starterCode.match(/\b(\w+)\s*\([^)]*\)\s*\{/);
  return m ? m[1] : null;
}

/**
 * Ensure each test case's `input` is always an array of arguments.
 * LLMs sometimes produce the raw value instead of wrapping it.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTestCases(testCases: any[] | undefined): { input: unknown[]; expectedOutput: unknown }[] {
  if (!Array.isArray(testCases)) return [];
  return testCases.map(tc => {
    let input = tc.input;
    // If input is not an array, wrap it so fn(...input) works correctly
    if (!Array.isArray(input)) {
      input = [input];
    }
    return { input, expectedOutput: tc.expectedOutput };
  });
}

/**
 * Strip solution logic from starterCode if the LLM accidentally included it.
 * Keeps the function signature and replaces the body with a placeholder.
 */
function stripSolution(starterCode: string, language: CodingLanguage): string {
  if (!starterCode) return starterCode;
  const lines = starterCode.split('\n');

  if (language === 'python') {
    // Find the def line, keep everything up to and including it,
    // then replace the body with a comment + pass
    const defIdx = lines.findIndex(l => /^\s*def\s+\w+/.test(l));
    if (defIdx === -1) return starterCode;
    // Count non-blank, non-comment body lines after def
    const bodyLines = lines.slice(defIdx + 1).filter(l => {
      const t = l.trim();
      return t && !t.startsWith('#') && t !== 'pass';
    });
    // If there are more than 1 real lines of logic, it's likely a solution
    if (bodyLines.length <= 1) return starterCode;
    // Get imports/includes before def
    const preamble = lines.slice(0, defIdx + 1).join('\n');
    return preamble + '\n    # Your code here\n    pass';
  }

  if (language === 'javascript') {
    // Find opening brace of the function, count logic lines inside
    const funcIdx = lines.findIndex(l => /function\s+\w+|(?:const|let|var)\s+\w+\s*=/.test(l));
    if (funcIdx === -1) return starterCode;
    const braceIdx = starterCode.indexOf('{');
    if (braceIdx === -1) return starterCode;
    const body = starterCode.slice(braceIdx + 1, starterCode.lastIndexOf('}'));
    const bodyLines = body.split('\n').filter(l => {
      const t = l.trim();
      return t && !t.startsWith('//') && t !== '';
    });
    if (bodyLines.length <= 1) return starterCode;
    return starterCode.slice(0, braceIdx + 1) + '\n  // Your code here\n}';
  }

  // C / C++ / Java — same brace-based approach
  const braceIdx = starterCode.indexOf('{');
  if (braceIdx === -1) return starterCode;
  const body = starterCode.slice(braceIdx + 1, starterCode.lastIndexOf('}'));
  const bodyLines = body.split('\n').filter(l => {
    const t = l.trim();
    return t && !t.startsWith('//') && t !== '';
  });
  if (bodyLines.length <= 1) return starterCode;
  // Keep includes/preamble before the function
  const preamble = starterCode.slice(0, braceIdx + 1);
  return preamble + '\n    // Your code here\n    return 0;\n}';
}

export async function generateProblem(difficulty: Difficulty, language: CodingLanguage): Promise<CodingProblem> {
  const langName = LANGUAGE_NAMES[language];

  // Pick a random theme to encourage variety
  const theme = THEME_POOLS[Math.floor(Math.random() * THEME_POOLS.length)];

  // Build avoidance list from recent titles
  const avoidLine = recentTitles.length > 0
    ? `\n- IMPORTANT: Do NOT reuse these recent topics/titles: ${recentTitles.join(', ')}. Create something completely different.`
    : '';

  const prompt = `Generate a unique and creative ${langName} coding problem for a Harry Potter themed coding game.

Difficulty: ${difficulty}
${DIFFICULTY_DESCRIPTIONS[difficulty]}

Suggested theme (use this as inspiration, be creative): ${theme}

Requirements:
- IMPORTANT: Keep it VERY simple! The player must be able to solve it quickly under time pressure during a game. Think intro-to-programming level for EASY, beginner level for MEDIUM, and early-intermediate for HARD. No tricky edge cases, no complex algorithms.
- The problem should be solvable with a single ${langName} function
- No external libraries beyond standard library
- Be creative and varied! Use different concepts each time: string manipulation, arrays, math, objects/dicts, counting, searching, sorting, filtering, etc.
- Theme it around magic, spells, potions, creatures, Hogwarts, or the wizarding world${avoidLine}
- Include exactly 3 visible test cases and 2 hidden test cases
- Each test case has "input" (array of arguments) and "expectedOutput"
- Keep test case values simple: short strings, small numbers, small arrays. NO large or deeply nested values.
- The starterCode must be valid ${langName}
- CRITICAL: The "starterCode" must be an EMPTY function skeleton with NO solution logic. It should only contain the function signature and a placeholder comment like "// Your code here" or "# Your code here" and a dummy return. NEVER include the actual solution in starterCode.
- CRITICAL: All test case "input" and "expectedOutput" values MUST be valid JSON primitives (strings, numbers, booleans, arrays, objects). Do NOT use language-specific syntax like "new int[][]" or "Arrays.asList()". Use plain JSON arrays and values only.
- CRITICAL: The "starterCode" field must have newlines escaped as \\n and quotes escaped as \\". It must be a single valid JSON string.
- CRITICAL: The "functionName" must exactly match the function name used in "starterCode".
- CRITICAL ACCURACY RULE: The "description" and the "testCases"/"hiddenTestCases" MUST be 100% consistent with each other. Before finalizing, mentally run each test case through the description's logic and verify the expectedOutput is correct. For example, if the description says "more than 2", the test cases must use > 2, NOT >= 2. If you say "greater than or equal to", the test cases must use >=. The test cases are what the player's code is graded against, so any mismatch between description wording and test case values will make the problem unsolvable. Double-check every single test case.

Return ONLY a valid JSON object with no other text:
{
  "title": "string",
  "description": "string",
  "functionName": "string",
  "functionSignature": "string",
  "testCases": [{"input": [...], "expectedOutput": ...}],
  "hiddenTestCases": [{"input": [...], "expectedOutput": ...}],
  "starterCode": "string with \\n for newlines"
}`;

  // Try up to 2 times with decreasing temperature, with a delay between retries
  const attempts = [0.4, 0.2];
  for (let i = 0; i < attempts.length; i++) {
    try {
      const text = await callCortex(prompt, attempts[i]);
      console.log(`Cortex raw response length: ${text.length} (attempt ${i + 1})`);
      const parsed = safeParseJSON(text);
      console.log('Cortex parsed problem title:', parsed.title);

      // Normalize test cases — ensure input is always an array
      const testCases = normalizeTestCases(parsed.testCases);
      const hiddenTestCases = normalizeTestCases(parsed.hiddenTestCases);

      // Extract real function name from starter code to avoid naming mismatches
      const extractedName = extractFunctionNameFromCode(parsed.starterCode || '', language);
      const functionName = extractedName || parsed.functionName;

      // Strip solution from starter code if LLM included it
      const starterCode = stripSolution(parsed.starterCode || '', language);

      // Rebuild functionSignature using the correct function name so
      // the entire problem object is internally consistent.
      let functionSignature = parsed.functionSignature || '';
      if (language === 'python' && functionSignature && !functionSignature.startsWith('def ')) {
        functionSignature = `def ${functionSignature}`;
      }
      // Replace whatever function name the LLM put in the signature with the
      // one we extracted from starterCode (handles camelCase vs snake_case mismatch).
      if (extractedName && parsed.functionName && extractedName !== parsed.functionName) {
        functionSignature = functionSignature.replace(parsed.functionName, extractedName);
      }

      const problem: CodingProblem = {
        id: `cortex_${Date.now()}`, difficulty,
        title: parsed.title, description: parsed.description,
        functionName, functionSignature,
        testCases, hiddenTestCases,
        starterCode, timeLimit: DIFFICULTY_TIME_LIMITS[difficulty],
      };
      if (!problem.title || !problem.functionName || !problem.testCases?.length) {
        throw new Error('Invalid problem structure from Cortex');
      }
      // Track title to avoid repetition in future generations
      recentTitles.push(problem.title);
      if (recentTitles.length > MAX_RECENT) recentTitles.shift();
      return problem;
    } catch (error) {
      console.warn(`Cortex attempt ${i + 1} failed:`, error);
      if (i < attempts.length - 1) {
        // Wait before retrying to avoid hitting rate limits back-to-back
        await new Promise(r => setTimeout(r, 1500));
        continue;
      }
      console.warn('All Cortex attempts failed, using fallback');
      return getRandomFallback(difficulty, language);
    }
  }
  // Should never reach here, but satisfy TypeScript
  return getRandomFallback(difficulty, language);
}

export async function evaluateCodeWithGemini(
  code: string, problem: CodingProblem, language: CodingLanguage
): Promise<{ passed: boolean; results: Array<{ input: unknown[]; expected: unknown; actual: unknown; passed: boolean; error?: string }> }> {
  const langName = LANGUAGE_NAMES[language];
  const allTests = [...problem.testCases, ...(problem.hiddenTestCases || [])];

  const prompt = `You are a code evaluator. Given this ${langName} code and test cases, evaluate each test case.

Function: ${problem.functionName}

Code:
\`\`\`${language}
${code}
\`\`\`

Test cases:
${JSON.stringify(allTests)}

For each test case, mentally execute the code with the given input and determine the actual return value and whether it matches expectedOutput.

Return ONLY valid JSON:
{"results": [{"actual": <value>, "passed": true/false, "error": null}, ...]}

Be precise. If there are syntax or runtime errors, set passed=false with the error message.`;

  const text = await callCortex(prompt, 0);
  const parsed = safeParseJSON(text);
  const results = allTests.map((tc, i) => {
    const r = parsed.results?.[i] || { actual: null, passed: false, error: 'No result' };
    return { input: tc.input, expected: tc.expectedOutput, actual: r.actual ?? 'N/A', passed: Boolean(r.passed), error: r.error || undefined };
  });

  return { passed: results.every(r => r.passed), results };
}

export async function explainIncorrect(
  code: string,
  problem: CodingProblem,
  language: CodingLanguage,
  results: Array<{ input: unknown[]; expected: unknown; actual: unknown; passed: boolean; error?: string }>,
): Promise<string> {
  const langName = LANGUAGE_NAMES[language];
  const failedTests = results.filter(r => !r.passed);

  const prompt = `You are a coding tutor. A student wrote ${langName} code for this problem and got some tests wrong. Explain what is wrong with their code in 2-3 short sentences. Be specific about the bug, not generic advice.

Problem: ${problem.title}
${problem.description}

Their code:
\`\`\`${language}
${code}
\`\`\`

Failed test cases:
${failedTests.map(t => `Input: ${JSON.stringify(t.input)} → Expected: ${JSON.stringify(t.expected)}, Got: ${JSON.stringify(t.actual)}${t.error ? ` (Error: ${t.error})` : ''}`).join('\n')}

Give a short, direct explanation of the bug. Do NOT give the solution code. Just explain what went wrong.`;

  try {
    const text = await callCortex(prompt, 0.3);
    return text.trim();
  } catch {
    return 'Could not generate explanation. Please try again.';
  }
}
