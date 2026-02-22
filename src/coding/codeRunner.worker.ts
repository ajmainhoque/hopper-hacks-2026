import { deepEqual } from './deepEqual';

(self as any).fetch = undefined;
(self as any).XMLHttpRequest = undefined;
(self as any).importScripts = () => { throw new Error('importScripts disabled'); };

self.onmessage = (e: MessageEvent) => {
  const { userCode, functionName, testCases } = e.data;
  const results: Array<{ input: unknown[]; expected: unknown; actual: unknown; passed: boolean; error?: string }> = [];

  try {
    const fn = new Function(`${userCode}\nreturn ${functionName};`)();

    for (const tc of testCases) {
      try {
        const actual = fn(...tc.input);
        const passed = deepEqual(actual, tc.expectedOutput);
        results.push({ input: tc.input, expected: tc.expectedOutput, actual, passed });
      } catch (err: any) {
        results.push({ input: tc.input, expected: tc.expectedOutput, actual: null, passed: false, error: String(err) });
      }
    }
  } catch (err: any) {
    self.postMessage({ passed: false, totalTests: testCases.length, passedTests: 0, results: [], error: String(err) });
    return;
  }

  const passedCount = results.filter(r => r.passed).length;
  self.postMessage({
    passed: passedCount === results.length,
    totalTests: results.length,
    passedTests: passedCount,
    results,
  });
};
