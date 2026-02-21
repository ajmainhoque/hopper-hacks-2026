import { CodingProblem, ExecutionResult, CodingLanguage } from './types';
import { evaluateCodeWithGemini } from './geminiClient';

function executeJavaScript(userCode: string, problem: CodingProblem): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const worker = new Worker(
      new URL('./codeRunner.worker.ts', import.meta.url),
      { type: 'module' }
    );

    const timeout = setTimeout(() => {
      worker.terminate();
      resolve({
        passed: false,
        totalTests: problem.testCases.length + problem.hiddenTestCases.length,
        passedTests: 0,
        results: [],
        error: 'Execution timed out (5 seconds)',
      });
    }, 5000);

    worker.onmessage = (e: MessageEvent) => {
      clearTimeout(timeout);
      worker.terminate();
      resolve(e.data as ExecutionResult);
    };

    worker.onerror = (err) => {
      clearTimeout(timeout);
      worker.terminate();
      resolve({
        passed: false,
        totalTests: problem.testCases.length + problem.hiddenTestCases.length,
        passedTests: 0,
        results: [],
        error: String(err.message || err),
      });
    };

    worker.postMessage({
      userCode,
      functionName: problem.functionName,
      testCases: [...problem.testCases, ...problem.hiddenTestCases],
    });
  });
}

async function executeWithGemini(userCode: string, problem: CodingProblem, language: CodingLanguage): Promise<ExecutionResult> {
  try {
    const evalResult = await evaluateCodeWithGemini(userCode, problem, language);
    return {
      passed: evalResult.passed,
      totalTests: evalResult.results.length,
      passedTests: evalResult.results.filter(r => r.passed).length,
      results: evalResult.results,
    };
  } catch (error) {
    return {
      passed: false,
      totalTests: problem.testCases.length + problem.hiddenTestCases.length,
      passedTests: 0,
      results: [],
      error: `Evaluation error: ${error}. Make sure VITE_GEMINI_API_KEY is set for non-JavaScript languages.`,
    };
  }
}

export function executeCode(userCode: string, problem: CodingProblem, language: CodingLanguage): Promise<ExecutionResult> {
  if (language === 'javascript') {
    return executeJavaScript(userCode, problem);
  }
  return executeWithGemini(userCode, problem, language);
}
