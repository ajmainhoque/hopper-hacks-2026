interface ManaBarProps {
  current: number;
  max: number;
}

export function ManaBar({ current, max }: ManaBarProps) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div style={{ width: '100%', background: '#1a1a2e', border: '2px solid #333', height: 12, position: 'relative' }}>
      <div style={{
        width: `${pct}%`,
        height: '100%',
        background: '#3498db',
        transition: 'width 0.5s ease',
      }} />
      <span style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '7px',
        fontFamily: "'Press Start 2P', monospace",
        color: '#fff',
        lineHeight: '12px',
      }}>
        {current}/{max}
      </span>
    </div>
  );
}
