import { useState, useRef } from "react";
import { runWithPiston } from "../utils/pistonApi";

export default function ChallengeScreen({
  challenge,
  challengeIndex,
  totalChallenges,
  totalPoints,
  onComplete,
  onSkip,
}) {
  const [code, setCode] = useState(challenge.starterCode);
  const [testResults, setTestResults] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState(null);
  const textareaRef = useRef(null);

  function handleTabKey(e) {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      setCode(newCode);
      // restore cursor after setState
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = start + 2;
        }
      });
    }
  }

  async function handleRun() {
    setIsRunning(true);
    setRunError(null);
    setTestResults(null);
    setIsSuccess(false);
    setSuccessMessage("");

    try {
      const results = await runWithPiston(
        code,
        challenge.functionName,
        challenge.tests
      );

      setTestResults(results);

      const allPassed = results.every((r) => r.passed);
      if (allPassed) {
        setIsSuccess(true);
        setSuccessMessage(challenge.successQuote);
      }
    } catch (err) {
      setRunError(err.message);
    } finally {
      setIsRunning(false);
    }
  }

  function handleNext() {
    onComplete(challenge.points);
  }

  const progressPercent = ((challengeIndex + 1) / totalChallenges) * 100;

  return (
    <div className="screen challenge-screen">
      {/* Header */}
      <div className="challenge-header">
        <div className="header-left">
          <span className="spell-badge">
            {challenge.houseEmoji} {challenge.difficulty}
          </span>
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="progress-text">
            Challenge {challengeIndex + 1} / {totalChallenges}
          </span>
        </div>
        <div className="house-points">⭐ {totalPoints} House Points</div>
      </div>

      {/* Challenge Info */}
      <div className="challenge-body">
        <div className="challenge-left">
          <h2
            className="spell-title"
            style={{
              color:
                challenge.houseColor === "#0e1a40"
                  ? "#4a90d9"
                  : challenge.houseColor,
            }}
          >
            🪄 {challenge.spell}
          </h2>
          <div className="challenge-description">{challenge.description}</div>
          <div className="points-badge">
            Worth {challenge.points} House Points
          </div>

          {/* API Error */}
          {runError && (
            <div className="run-error">
              <span className="run-error-icon">⚠️</span>
              <pre className="run-error-text">{runError}</pre>
            </div>
          )}

          {/* Test Cases */}
          {testResults && (
            <div className="test-results">
              <h3 className="test-results-title">
                {testResults.every((r) => r.passed)
                  ? "✅ All tests passed!"
                  : "❌ Some tests failed"}
              </h3>
              {testResults.map((result, i) => (
                <div
                  key={i}
                  className={`test-case ${result.passed ? "pass" : "fail"}`}
                >
                  <span className="test-icon">
                    {result.passed ? "✓" : "✗"}
                  </span>
                  <span className="test-desc">{result.description}</span>
                  {!result.passed && (
                    <div className="test-got">
                      Got: {JSON.stringify(result.got)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="success-banner">
              <div className="success-sparkle" aria-hidden="true">
                ✨ ✨ ✨
              </div>
              <p className="success-quote">{successMessage}</p>
              <button className="btn btn-primary" onClick={handleNext}>
                {challengeIndex + 1 < totalChallenges
                  ? "Next Spell →"
                  : "🏆 See Final Score"}
              </button>
            </div>
          )}

          {/* Hint */}
          <div className="hint-section">
            <button
              className="btn btn-ghost"
              onClick={() => setShowHint(!showHint)}
            >
              {showHint ? "🙈 Hide Hint" : "💡 Show Hint"}
            </button>
            {showHint && <div className="hint-box">{challenge.hint}</div>}
          </div>

          {/* Skip */}
          {!isSuccess && (
            <button className="btn btn-ghost skip-btn" onClick={onSkip}>
              Skip this spell →
            </button>
          )}
        </div>

        {/* Code Editor */}
        <div className="challenge-right">
          <div className="editor-header">
            <span className="editor-title">📜 Your Spell (JavaScript)</span>
          </div>
          <textarea
            ref={textareaRef}
            className="code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleTabKey}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            disabled={isRunning}
          />
          <button
            className="btn btn-cast"
            onClick={handleRun}
            disabled={isRunning}
          >
            {isRunning ? "⏳ Casting…" : "🪄 Cast Spell (Run Code)"}
          </button>
        </div>
      </div>
    </div>
  );
}
