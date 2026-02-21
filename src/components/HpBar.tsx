interface HpBarProps {
  current: number;
  max: number;
}

export function HpBar({ current, max }: HpBarProps) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const color = pct > 50 ? '#27ae60' : pct > 25 ? '#f39c12' : '#e74c3c';

  return (
    <div style={{ width: '100%', background: '#1a1a2e', border: '2px solid #333', height: 16, position: 'relative' }}>
      <div style={{
        width: `${pct}%`,
        height: '100%',
        background: color,
        transition: 'width 0.5s ease, background 0.3s ease',
      }} />
      <span style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '9px',
        fontFamily: "'Press Start 2P', monospace",
        color: '#fff',
        lineHeight: '16px',
      }}>
        {current}/{max}
      </span>
    </div>
  );
}
