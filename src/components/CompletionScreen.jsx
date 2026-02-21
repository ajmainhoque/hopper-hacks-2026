export default function CompletionScreen({
  completedChallenges,
  totalPoints,
  maxPoints,
  onRestart,
}) {
  const percentage = Math.round((totalPoints / maxPoints) * 100);

  function getTitle() {
    if (percentage === 100) return "Hogwarts Champion!";
    if (percentage >= 80) return "Outstanding Wizard!";
    if (percentage >= 60) return "Exceeds Expectations!";
    if (percentage >= 40) return "Acceptable Coder!";
    return "Keep Practicing, Young Wizard!";
  }

  function getHouse() {
    if (percentage === 100) return { name: "All Houses", emoji: "🏆" };
    if (percentage >= 80) return { name: "Gryffindor", emoji: "🦁" };
    if (percentage >= 60) return { name: "Ravenclaw", emoji: "🦅" };
    if (percentage >= 40) return { name: "Hufflepuff", emoji: "🦡" };
    return { name: "Slytherin", emoji: "🐍" };
  }

  const house = getHouse();

  return (
    <div className="screen completion-screen">
      <div className="completion-content">
        <div className="completion-badge" aria-hidden="true">
          {house.emoji}
        </div>
        <h1 className="completion-title">{getTitle()}</h1>
        <p className="completion-house">You belong in {house.name}!</p>

        <div className="score-display">
          <div className="score-circle">
            <span className="score-number">{totalPoints}</span>
            <span className="score-label">House Points</span>
          </div>
          <div className="score-meta">
            <div className="score-percent">{percentage}% Complete</div>
            <div className="score-max">out of {maxPoints} possible points</div>
          </div>
        </div>

        {/* Challenge breakdown */}
        <div className="challenge-breakdown">
          <h3 className="breakdown-title">Your Spellbook</h3>
          {completedChallenges.map((c) => (
            <div key={c.id} className="breakdown-row">
              <span className="breakdown-spell">
                {c.houseEmoji} {c.spell}
              </span>
              <span className="breakdown-points">
                +{c.earnedPoints} pts
              </span>
            </div>
          ))}
          {completedChallenges.length === 0 && (
            <p className="breakdown-empty">No spells completed — try again!</p>
          )}
        </div>

        <div className="completion-quote">
          {percentage === 100
            ? "\"It is our choices, Harry, that show what we truly are, far more than our abilities.\" — Dumbledore"
            : "\"Do not pity the dead, Harry. Pity the living, and above all, those who live without coding.\" — Dumbledore (probably)"}
        </div>

        <button className="btn btn-primary btn-large" onClick={onRestart}>
          🪄 Play Again
        </button>
      </div>
    </div>
  );
}
