import { useState, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { CodingProblem, ExecutionResult, CodingLanguage } from '../coding/types';

interface CodingEditorProps {
  problem: CodingProblem;
  onSubmit: (code: string) => Promise<ExecutionResult | null>;
  disabled?: boolean;
  language: CodingLanguage;
}

function getLanguageExtension(language: CodingLanguage) {
  switch (language) {
    case 'python': return python();
    case 'c': return cpp();
    case 'cpp': return cpp();
    case 'java': return java();
    case 'javascript': default: return javascript();
  }
}

const LANGUAGE_LABELS: Record<CodingLanguage, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  c: 'C',
  cpp: 'C++',
  java: 'Java',
};

export function CodingEditor({ problem, onSubmit, disabled, language }: CodingEditorProps) {
  const [code, setCode] = useState(problem.starterCode);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const langExtension = useMemo(() => getLanguageExtension(language), [language]);

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await onSubmit(code);
    if (res) setResult(res);
    setSubmitting(false);
  };

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>
      {/* Problem description */}
      <div style={{
        flex: 1,
        background: 'rgba(10, 10, 26, 0.9)',
        border: '2px solid #333',
        padding: 16,
        overflowY: 'auto',
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '8px',
        color: '#e8e8e8',
        lineHeight: 2,
      }}>
        <h3 style={{ color: '#ffd700', fontSize: '10px', marginBottom: 12 }}>{problem.title}</h3>
        <div style={{
          display: 'inline-block', padding: '2px 8px', marginBottom: 8,
          fontSize: '7px', background: '#333', color: '#c0a0ff', border: '1px solid #555',
        }}>
          {LANGUAGE_LABELS[language]}
        </div>
        <p style={{ marginBottom: 16 }}>{problem.description}</p>
        <div style={{ color: '#ffd700', marginBottom: 8 }}>Test Cases:</div>
        {problem.testCases.map((tc, i) => (
          <div key={i} style={{
            background: 'rgba(26, 26, 62, 0.5)',
            padding: 8,
            marginBottom: 8,
            border: '1px solid #333',
          }}>
            <div>Input: {JSON.stringify(tc.input)}</div>
            <div>Expected: {JSON.stringify(tc.expectedOutput)}</div>
            {result && result.results[i] && (
              <div style={{ color: result.results[i].passed ? '#2ecc71' : '#e74c3c' }}>
                {result.results[i].passed ? 'PASS' : `FAIL (got: ${JSON.stringify(result.results[i].actual)})`}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Code editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, border: '2px solid #333', overflow: 'hidden' }}>
          <CodeMirror
            value={code}
            height="100%"
            theme="dark"
            extensions={[langExtension]}
            onChange={(val) => setCode(val)}
            editable={!disabled && !submitting}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
          <button
            className="pixel-button"
            onClick={handleSubmit}
            disabled={disabled || submitting}
          >
            {submitting ? 'Running...' : 'Submit'}
          </button>
          {result && (
            <span style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '9px',
              color: result.passed ? '#2ecc71' : '#e74c3c',
            }}>
              {result.passed ? 'ALL TESTS PASSED!' : `${result.passedTests}/${result.totalTests} tests passed`}
            </span>
          )}
          {result?.error && (
            <span style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '7px',
              color: '#e74c3c',
            }}>
              Error: {result.error}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
