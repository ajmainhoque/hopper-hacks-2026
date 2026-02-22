export type CodingLanguage = 'javascript' | 'python' | 'c' | 'cpp' | 'java';

export interface TestCase {
  input: unknown[];
  expectedOutput: unknown;
}

export interface CodingProblem {
  id: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  title: string;
  description: string;
  functionName: string;
  functionSignature: string;
  testCases: TestCase[];
  hiddenTestCases: TestCase[];
  starterCode: string;
  timeLimit: number;
}

export interface ExecutionResult {
  passed: boolean;
  totalTests: number;
  passedTests: number;
  results: TestCaseResult[];
  error?: string;
}

export interface TestCaseResult {
  input: unknown[];
  expected: unknown;
  actual: unknown;
  passed: boolean;
  error?: string;
}
