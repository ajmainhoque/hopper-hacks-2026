import { CodingProblem, CodingLanguage } from './types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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
  {
    base: {
      id: 'fallback_easy_1', difficulty: 'EASY', title: 'Reverse a Magic Word',
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
      timeLimit: 3000,
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
      id: 'fallback_easy_2', difficulty: 'EASY', title: 'Count Potions',
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
      timeLimit: 3000,
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
      id: 'fallback_easy_3', difficulty: 'EASY', title: 'Sum of Wand Lengths',
      description: 'Given an array of wand lengths (numbers), return the total sum of all wand lengths.',
      functionName: 'sumWandLengths',
      testCases: [
        { input: [[11, 13.5, 14, 10.75]], expectedOutput: 49.25 },
        { input: [[9, 10, 11]], expectedOutput: 30 },
        { input: [[15]], expectedOutput: 15 },
      ],
      hiddenTestCases: [
        { input: [[]], expectedOutput: 0 },
        { input: [[1, 2, 3, 4, 5]], expectedOutput: 15 },
      ],
      timeLimit: 3000,
    },
    starters: {
      javascript: { functionSignature: 'function sumWandLengths(lengths)', starterCode: 'function sumWandLengths(lengths) {\n  // Your code here\n}' },
      python: { functionSignature: 'def sum_wand_lengths(lengths):', starterCode: 'def sum_wand_lengths(lengths):\n    # Your code here\n    pass' },
      c: { functionSignature: 'double sumWandLengths(double* lengths, int n)', starterCode: 'double sumWandLengths(double* lengths, int n) {\n    // Your code here\n    return 0;\n}' },
      cpp: { functionSignature: 'double sumWandLengths(vector<double> lengths)', starterCode: '#include <vector>\nusing namespace std;\n\ndouble sumWandLengths(vector<double> lengths) {\n    // Your code here\n    return 0;\n}' },
      java: { functionSignature: 'public static double sumWandLengths(double[] lengths)', starterCode: 'public static double sumWandLengths(double[] lengths) {\n    // Your code here\n    return 0;\n}' },
    },
  },
  {
    base: {
      id: 'fallback_hard_1', difficulty: 'HARD', title: 'Spell Anagram Groups',
      description: 'Given an array of spell names, group the anagrams together. Return an array of arrays, where each inner array contains spells that are anagrams of each other.',
      functionName: 'groupSpellAnagrams',
      testCases: [
        { input: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], expectedOutput: [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']] },
        { input: [['abc', 'bca', 'cab']], expectedOutput: [['abc', 'bca', 'cab']] },
        { input: [['a']], expectedOutput: [['a']] },
      ],
      hiddenTestCases: [
        { input: [[]], expectedOutput: [] },
        { input: [['ab', 'ba', 'cd', 'dc']], expectedOutput: [['ab', 'ba'], ['cd', 'dc']] },
      ],
      timeLimit: 5000,
    },
    starters: {
      javascript: { functionSignature: 'function groupSpellAnagrams(spells)', starterCode: 'function groupSpellAnagrams(spells) {\n  // Your code here\n}' },
      python: { functionSignature: 'def group_spell_anagrams(spells):', starterCode: 'def group_spell_anagrams(spells):\n    # Your code here\n    pass' },
      c: { functionSignature: '/* See description */', starterCode: '// Note: Complex data structures in C\nvoid groupSpellAnagrams(char** spells, int n) {\n    // Your code here\n}' },
      cpp: { functionSignature: 'vector<vector<string>> groupSpellAnagrams(vector<string> spells)', starterCode: '#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\nusing namespace std;\n\nvector<vector<string>> groupSpellAnagrams(vector<string> spells) {\n    // Your code here\n    return {};\n}' },
      java: { functionSignature: 'public static List<List<String>> groupSpellAnagrams(String[] spells)', starterCode: 'import java.util.*;\n\npublic static List<List<String>> groupSpellAnagrams(String[] spells) {\n    // Your code here\n    return new ArrayList<>();\n}' },
    },
  },
  {
    base: {
      id: 'fallback_hard_2', difficulty: 'HARD', title: 'Potion Combination',
      description: 'Given an array of ingredient quantities and a target quantity, find two ingredients whose quantities sum to the target. Return their indices as an array [i, j] where i < j. Exactly one solution exists.',
      functionName: 'potionCombination',
      testCases: [
        { input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1] },
        { input: [[3, 2, 4], 6], expectedOutput: [1, 2] },
        { input: [[1, 5, 3, 7], 8], expectedOutput: [0, 3] },
      ],
      hiddenTestCases: [
        { input: [[3, 3], 6], expectedOutput: [0, 1] },
        { input: [[1, 2, 3, 4, 5], 9], expectedOutput: [3, 4] },
      ],
      timeLimit: 5000,
    },
    starters: {
      javascript: { functionSignature: 'function potionCombination(ingredients, target)', starterCode: 'function potionCombination(ingredients, target) {\n  // Your code here\n}' },
      python: { functionSignature: 'def potion_combination(ingredients, target):', starterCode: 'def potion_combination(ingredients, target):\n    # Your code here\n    pass' },
      c: { functionSignature: 'void potionCombination(int* arr, int n, int target, int* out)', starterCode: 'void potionCombination(int* arr, int n, int target, int* out) {\n    // Store result in out[0], out[1]\n}' },
      cpp: { functionSignature: 'vector<int> potionCombination(vector<int> ingredients, int target)', starterCode: '#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nvector<int> potionCombination(vector<int> ingredients, int target) {\n    // Your code here\n    return {};\n}' },
      java: { functionSignature: 'public static int[] potionCombination(int[] ingredients, int target)', starterCode: 'import java.util.*;\n\npublic static int[] potionCombination(int[] ingredients, int target) {\n    // Your code here\n    return new int[]{};\n}' },
    },
  },
  {
    base: {
      id: 'fallback_hard_3', difficulty: 'HARD', title: 'Enchanted Staircase',
      description: 'You are climbing an enchanted staircase with n steps. Each time you can climb 1 or 2 steps. Return the number of distinct ways you can reach the top.',
      functionName: 'climbStaircase',
      testCases: [
        { input: [2], expectedOutput: 2 },
        { input: [3], expectedOutput: 3 },
        { input: [5], expectedOutput: 8 },
      ],
      hiddenTestCases: [
        { input: [1], expectedOutput: 1 },
        { input: [10], expectedOutput: 89 },
      ],
      timeLimit: 5000,
    },
    starters: {
      javascript: { functionSignature: 'function climbStaircase(n)', starterCode: 'function climbStaircase(n) {\n  // Your code here\n}' },
      python: { functionSignature: 'def climb_staircase(n):', starterCode: 'def climb_staircase(n):\n    # Your code here\n    pass' },
      c: { functionSignature: 'int climbStaircase(int n)', starterCode: 'int climbStaircase(int n) {\n    // Your code here\n    return 0;\n}' },
      cpp: { functionSignature: 'int climbStaircase(int n)', starterCode: 'int climbStaircase(int n) {\n    // Your code here\n    return 0;\n}' },
      java: { functionSignature: 'public static int climbStaircase(int n)', starterCode: 'public static int climbStaircase(int n) {\n    // Your code here\n    return 0;\n}' },
    },
  },
];

let fallbackIndex = { easy: 0, hard: 0 };

function getRandomFallback(difficulty: 'EASY' | 'HARD', language: CodingLanguage): CodingProblem {
  const pool = FALLBACK_VARIANTS.filter(p => p.base.difficulty === difficulty);
  const key = difficulty === 'EASY' ? 'easy' : 'hard';
  const variant = pool[fallbackIndex[key] % pool.length];
  fallbackIndex[key]++;
  const langStarter = variant.starters[language];
  return { ...variant.base, ...langStarter, id: `${variant.base.id}_${Date.now()}` };
}

function extractJSON(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];
  return text;
}

export async function generateProblem(difficulty: 'EASY' | 'HARD', language: CodingLanguage): Promise<CodingProblem> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return getRandomFallback(difficulty, language);

  const langName = LANGUAGE_NAMES[language];
  const difficultyDesc = difficulty === 'EASY'
    ? 'A simple problem involving arrays, strings, or basic math. Should be solvable in 5 minutes.'
    : 'A moderate algorithm problem involving recursion, dynamic programming, or data structures. Should be solvable in 10 minutes.';

  const prompt = `Generate a ${langName} coding problem for a Harry Potter themed coding game.

Difficulty: ${difficulty}
${difficultyDesc}

Requirements:
- The problem should be solvable with a single ${langName} function
- No external libraries beyond standard library
- Theme it around magic, spells, potions, or the wizarding world
- Include exactly 3 visible test cases and 2 hidden test cases
- Each test case has "input" (array of arguments) and "expectedOutput"
- The starterCode must be valid ${langName}

Return ONLY a valid JSON object (no markdown, no explanation):
{
  "title": "string",
  "description": "string",
  "functionName": "string",
  "functionSignature": "string",
  "testCases": [{"input": [...], "expectedOutput": ...}],
  "hiddenTestCases": [{"input": [...], "expectedOutput": ...}],
  "starterCode": "..."
}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 2048 },
      }),
    });
    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No content in Gemini response');

    const parsed = JSON.parse(extractJSON(text));
    const problem: CodingProblem = {
      id: `gemini_${Date.now()}`, difficulty,
      title: parsed.title, description: parsed.description,
      functionName: parsed.functionName, functionSignature: parsed.functionSignature,
      testCases: parsed.testCases, hiddenTestCases: parsed.hiddenTestCases,
      starterCode: parsed.starterCode, timeLimit: difficulty === 'EASY' ? 3000 : 5000,
    };
    if (!problem.title || !problem.functionName || !problem.testCases?.length) {
      throw new Error('Invalid problem structure from Gemini');
    }
    return problem;
  } catch (error) {
    console.warn('Failed to generate from Gemini, using fallback:', error);
    return getRandomFallback(difficulty, language);
  }
}

export async function evaluateCodeWithGemini(
  code: string, problem: CodingProblem, language: CodingLanguage
): Promise<{ passed: boolean; results: Array<{ input: unknown[]; expected: unknown; actual: unknown; passed: boolean; error?: string }> }> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('No API key for non-JS evaluation');

  const langName = LANGUAGE_NAMES[language];
  const allTests = [...problem.testCases, ...problem.hiddenTestCases];

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

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 2048 },
    }),
  });
  if (!response.ok) throw new Error(`Gemini eval error: ${response.status}`);

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No eval response');

  const parsed = JSON.parse(extractJSON(text));
  const results = allTests.map((tc, i) => {
    const r = parsed.results?.[i] || { actual: null, passed: false, error: 'No result' };
    return { input: tc.input, expected: tc.expectedOutput, actual: r.actual ?? 'N/A', passed: Boolean(r.passed), error: r.error || undefined };
  });

  return { passed: results.every(r => r.passed), results };
}
