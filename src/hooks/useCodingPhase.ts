import { useState, useCallback } from 'react';
import { CodingProblem, ExecutionResult, CodingLanguage } from '../coding/types';
import { problemCache } from '../coding/problemCache';
import { executeCode } from '../coding/codeRunner';

export function useCodingPhase(language: CodingLanguage) {
  const [problem, setProblem] = useState<CodingProblem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProblem = useCallback(async (difficulty: 'EASY' | 'HARD') => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const p = await problemCache.getProblem(difficulty, language);
      setProblem(p);
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const submitCode = useCallback(async (code: string): Promise<ExecutionResult | null> => {
    if (!problem) return null;
    setError(null);
    try {
      const executionResult = await executeCode(code, problem, language);
      setResult(executionResult);
      return executionResult;
    } catch (e) {
      setError(String(e));
      return null;
    }
  }, [problem, language]);

  const resetCoding = useCallback(() => {
    setProblem(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { problem, isLoading, result, error, loadProblem, submitCode, resetCoding };
}
