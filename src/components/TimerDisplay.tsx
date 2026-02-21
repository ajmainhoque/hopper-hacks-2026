interface TimerDisplayProps {
  secondsLeft: number;
  totalSeconds: number;
}

export function TimerDisplay({ secondsLeft, totalSeconds }: TimerDisplayProps) {
  const pct = (secondsLeft / totalSeconds) * 100;
  const color = pct > 50 ? '#2ecc71' : pct > 25 ? '#f39c12' : '#e74c3c';
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 200,
        height: 12,
        background: '#1a1a2e',
        border: '2px solid #333',
        position: 'relative',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          transition: 'width 1s linear, background 0.3s ease',
        }} />
      </div>
      <span style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '10px',
        color: secondsLeft <= 10 ? '#e74c3c' : '#ffd700',
        animation: secondsLeft <= 10 ? 'damage-flash 0.5s infinite' : 'none',
      }}>
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
