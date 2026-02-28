import { useState, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { CodingProblem, ExecutionResult, CodingLanguage } from '../coding/types';
import { audioManager } from '../audio/audioManager';

interface CodingEditorProps {
  problem: CodingProblem;
  onSubmit: (code: string) => Promise<ExecutionResult | null>;
  onContinue: () => void;
  onExplain: (code: string) => Promise<string>;
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

const MANA_REWARDS: Record<string, number> = { EASY: 3, MEDIUM: 4, HARD: 5 };

function ResultPopup({ result, difficulty, onContinue, onExplain }: {
  result: ExecutionResult;
  difficulty: string;
  onContinue: () => void;
  onExplain: () => Promise<string>;
}) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const isError = !!result.error && result.passedTests === 0 && result.results.length === 0;
  const passed = result.passed;
  const mana = MANA_REWARDS[difficulty] ?? 0;

  // Distinguish system failures (AI can't check) from user code errors
  const isSystemError = isError && !!result.error && (
    result.error.includes('Evaluation error:') ||
    result.error.includes('worker crashed') ||
    result.error.includes('timed out')
  );

  const cls = passed ? 'correct' : 'incorrect';

  // Extract a short, readable error message from Python/JS tracebacks
  const shortError = useMemo(() => {
    if (!result.error) return '';
    const err = result.error;
    // Look for common Python error patterns at the end of the traceback
    const pyMatch = err.match(/(SyntaxError|IndentationError|NameError|TypeError|ValueError|ZeroDivisionError|IndexError|KeyError|AttributeError|RuntimeError)[:\s]+(.*)/);
    if (pyMatch) return `${pyMatch[1]}: ${pyMatch[2].trim().slice(0, 120)}`;
    // JS errors
    const jsMatch = err.match(/(ReferenceError|TypeError|SyntaxError|RangeError)[:\s]+(.*)/);
    if (jsMatch) return `${jsMatch[1]}: ${jsMatch[2].trim().slice(0, 120)}`;
    // Fallback: last meaningful line, truncated
    const lines = err.split('\n').filter(l => l.trim());
    return (lines[lines.length - 1] || err).trim().slice(0, 120);
  }, [result.error]);

  const sparkles = useMemo(() => {
    if (!passed) return [];
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: 30 + Math.random() * 40,
      delay: Math.random() * 0.6,
    }));
  }, [passed]);

  const handleExplain = async () => {
    setLoadingExplanation(true);
    const text = await onExplain();
    setExplanation(text);
    setLoadingExplanation(false);
  };

  return (
    <div className="result-popup-overlay">
      {passed && sparkles.map(s => (
        <div
          key={s.id}
          className="result-sparkle"
          style={{
            left: `${s.left}%`,
            top: '55%',
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      <div className={`result-popup-card ${cls}`}>
        <div className={`result-popup-icon ${cls}`}>
          {passed ? '\u2714' : '\u2718'}
        </div>
        <div className={`result-popup-title ${cls}`}>
          {passed ? 'CORRECT!' : isSystemError ? 'EVAL ERROR' : 'INCORRECT'}
        </div>
        <div className="result-popup-detail">
          {isSystemError
            ? 'Could not evaluate code'
            : isError
              ? shortError
              : `${result.passedTests}/${result.totalTests} tests passed`}
        </div>
        {passed ? (
          <div className="result-popup-mana">+{mana} mana to your team</div>
        ) : (
          <div className="result-popup-detail" style={{ color: '#e74c3c', marginTop: 4 }}>
            {isError ? 'Fix your code and try again' : 'No mana awarded'}
          </div>
        )}

        {/* AI Explanation */}
        {explanation && (
          <div className="result-explanation">
            {explanation}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'center' }}>
          {!passed && !explanation && (
            <button
              className="pixel-button"
              onClick={handleExplain}
              disabled={loadingExplanation}
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '8px',
                padding: '8px 16px',
                background: '#0d1a0d',
                color: '#9a6abf',
                border: '2px solid #9a6abf',
                cursor: loadingExplanation ? 'wait' : 'pointer',
              }}
            >
              {loadingExplanation ? 'Thinking...' : 'Why?'}
            </button>
          )}
          <button
            className="pixel-button"
            onClick={onContinue}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '8px',
              padding: '8px 16px',
              background: passed ? '#eeba30' : '#1a3a1a',
              color: passed ? '#060d06' : '#e8e8e8',
              border: `2px solid ${passed ? '#b8922a' : '#2a5a2a'}`,
              cursor: 'pointer',
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export function CodingEditor({ problem, onSubmit, onContinue, onExplain, disabled, language }: CodingEditorProps) {
  const [code, setCode] = useState(problem.starterCode);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const langExtension = useMemo(() => getLanguageExtension(language), [language]);

  const handleSubmit = async () => {
    audioManager.playSFX('codeSubmit');
    setSubmitting(true);
    const res = await onSubmit(code);
    if (res) {
      setResult(res);
      // Play result SFX
      if (res.passed) {
        audioManager.playSFX('codeCorrect');
      } else {
        audioManager.playSFX('codeIncorrect');
      }
    }
    setSubmitting(false);
  };

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%', position: 'relative' }}>
      {/* Result popup overlay */}
      {result && (
        <ResultPopup
          result={result}
          difficulty={problem.difficulty}
          onContinue={onContinue}
          onExplain={() => onExplain(code)}
        />
      )}

      {/* Problem description */}
      <div style={{
        flex: 1,
        background: 'rgba(6, 13, 6, 0.9)',
        border: '2px solid #1a3a1a',
        padding: 16,
        overflowY: 'auto',
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '8px',
        color: '#e8e8e8',
        lineHeight: 2,
      }}>
        <h3 style={{ color: '#3498db', fontSize: '10px', marginBottom: 12 }}>{problem.title}</h3>
        <div style={{
          display: 'inline-block', padding: '2px 8px', marginBottom: 8,
          fontSize: '7px', background: '#1a3a1a', color: '#9a6abf', border: '1px solid #2a5a2a',
        }}>
          {LANGUAGE_LABELS[language]}
        </div>
        <p style={{ marginBottom: 16 }}>{problem.description}</p>
        <div style={{ color: '#3498db', marginBottom: 8 }}>Test Cases:</div>
        {problem.testCases.map((tc, i) => (
          <div key={i} style={{
            background: 'rgba(13, 26, 13, 0.5)',
            padding: 8,
            marginBottom: 8,
            border: '1px solid #1a3a1a',
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
        <div style={{ flex: 1, border: '2px solid #1a3a1a', overflow: 'auto' }}>
          <CodeMirror
            value={code}
            height="100%"
            theme="dark"
            extensions={[langExtension]}
            onChange={(val) => setCode(val)}
            editable={!disabled && !submitting && !result}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
          <button
            className="pixel-button"
            onClick={handleSubmit}
            disabled={disabled || submitting || !!result}
          >
            {submitting ? 'Running...' : result ? 'Submitted' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
