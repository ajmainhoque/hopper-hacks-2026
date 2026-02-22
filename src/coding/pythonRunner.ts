import { CodingProblem, ExecutionResult } from './types';

/**
 * Manages a persistent Pyodide Web Worker for local Python code execution.
 * Pyodide (~10 MB) is loaded from CDN on first use; subsequent calls reuse it.
 */

let worker: Worker | null = null;
const resolveMap = new Map<string, (result: ExecutionResult) => void>();

function getWorker(): Worker {
  if (worker) return worker;

  // Classic (non-module) worker so importScripts can load Pyodide from CDN
  worker = new Worker('/pythonRunner.worker.js');

  worker.onmessage = (e: MessageEvent) => {
    const data = e.data;
    // Ignore init/ready messages
    if (data.type === 'ready' || data.type === 'error') return;

    const id: string | undefined = data.requestId;
    if (id && resolveMap.has(id)) {
      resolveMap.get(id)!(data as ExecutionResult);
      resolveMap.delete(id);
    }
  };

  worker.onerror = () => {
    // Worker crashed — resolve all pending with error, then recreate on next use
    for (const [id, resolve] of resolveMap) {
      resolve({
        passed: false,
        totalTests: 0,
        passedTests: 0,
        results: [],
        error: 'Python worker crashed. Please try again.',
      });
      resolveMap.delete(id);
    }
    worker = null;
  };

  // Start pre-loading Pyodide immediately
  worker.postMessage({ type: 'init' });

  return worker;
}

/** Call early (e.g. on language select) to start downloading Pyodide in background. */
export function preloadPython(): void {
  getWorker();
}

/** Execute Python code locally via Pyodide in a Web Worker. */
export function executePython(
  userCode: string,
  problem: CodingProblem,
): Promise<ExecutionResult> {
  // Use problem.functionName which has been normalized in generateProblem
  // to match the actual function name in the starterCode.
  // (Previously this extracted from functionSignature, which could have
  // a different casing — e.g. camelCase vs snake_case — causing "Function not found".)
  const funcName = problem.functionName;

  const requestId = `py_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const tests = [...problem.testCases, ...(problem.hiddenTestCases || [])];
  const totalTests = tests.length;

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolveMap.delete(requestId);
      resolve({
        passed: false,
        totalTests,
        passedTests: 0,
        results: [],
        error: 'Python execution timed out (30 s). The first run downloads the Python runtime (~10 MB) — please try again.',
      });
    }, 30_000);

    resolveMap.set(requestId, (result) => {
      clearTimeout(timeout);
      resolve(result);
    });

    getWorker().postMessage({
      requestId,
      userCode,
      functionName: funcName,
      testCases: tests,
    });
  });
}
