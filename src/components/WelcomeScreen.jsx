export default function WelcomeScreen({ onStart }) {
  return (
    <div className="screen welcome-screen">
      <div className="welcome-content">
        <div className="hogwarts-crest" aria-hidden="true">
          <span className="crest-emoji">⚡</span>
        </div>
        <h1 className="game-title">
          <span className="title-line1">Hogwarts</span>
          <span className="title-line2">School of Coding</span>
          <span className="title-line3">&amp; Wizardry</span>
        </h1>
        <p className="welcome-subtitle">
          Welcome, young witch or wizard! Your journey to master the ancient art
          of coding begins here. Complete 5 magical challenges, earn House
          Points, and prove yourself worthy of the title:
        </p>
        <p className="title-badge">✨ Master Coder of Hogwarts ✨</p>

        <div className="challenge-preview">
          <div className="preview-item">🦁 Wingardium Leviosa — 10 pts</div>
          <div className="preview-item">🦡 The Sorting Hat — 20 pts</div>
          <div className="preview-item">🦅 Lumos Maxima — 30 pts</div>
          <div className="preview-item">🐍 Accio — 40 pts</div>
          <div className="preview-item">✨ Expecto Patronum — 50 pts</div>
        </div>

        <button className="btn btn-primary btn-large" onClick={onStart}>
          🪄 Begin Your Journey
        </button>

        <p className="welcome-footer">
          Write JavaScript to cast your spells. No magic wand required!
        </p>
      </div>
    </div>
  );
}
