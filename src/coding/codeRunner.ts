import { CodingProblem, ExecutionResult, CodingLanguage } from './types';
import { executePython } from './pythonRunner';
import { executePiston } from './pistonRunner';

function allTestCases(problem: CodingProblem) {
  return [...problem.testCases, ...(problem.hiddenTestCases || [])];
}

function executeJavaScript(userCode: string, problem: CodingProblem): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const worker = new Worker(
      new URL('./codeRunner.worker.ts', import.meta.url),
      { type: 'module' }
    );

    const tests = allTestCases(problem);

    const timeout = setTimeout(() => {
      worker.terminate();
      resolve({
        passed: false,
        totalTests: tests.length,
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
        totalTests: tests.length,
        passedTests: 0,
        results: [],
        error: String(err.message || err),
      });
    };

    worker.postMessage({
      userCode,
      functionName: problem.functionName,
      testCases: tests,
    });
  });
}

export function executeCode(userCode: string, problem: CodingProblem, language: CodingLanguage): Promise<ExecutionResult> {
  if (language === 'javascript') {
    return executeJavaScript(userCode, problem);
  }
  if (language === 'python') {
    return executePython(userCode, problem);
  }
  // C, C++, Java — execute via Piston API (with LLM fallback for complex C signatures)
  return executePiston(userCode, problem, language);
}
