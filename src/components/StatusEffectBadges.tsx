import { StatusEffect } from '../engine/types';

const STATUS_COLORS: Record<string, string> = {
  DEFENDING: '#ecb939',
  DODGE_NEXT: '#2ecc71',
  STUNNED: '#e74c3c',
  POISON: '#8e44ad',
  BLEED: '#c0392b',
  SHIELD_SPELL: '#3498db',
  WEAKENED: '#95a5a6',
};

const STATUS_LABELS: Record<string, string> = {
  DEFENDING: 'DEF',
  DODGE_NEXT: 'DGE',
  STUNNED: 'STN',
  POISON: 'PSN',
  BLEED: 'BLD',
  SHIELD_SPELL: 'SHD',
  WEAKENED: 'WKN',
};

interface StatusEffectBadgesProps {
  effects: StatusEffect[];
}

export function StatusEffectBadges({ effects }: StatusEffectBadgesProps) {
  if (effects.length === 0) return null;
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
      {effects.map((e, i) => (
        <span key={i} style={{
          background: STATUS_COLORS[e.type] || '#666',
          color: '#fff',
          fontSize: '7px',
          fontFamily: "'Press Start 2P', monospace",
          padding: '2px 4px',
          borderRadius: 2,
        }} title={`${e.type}${e.remainingTurns > 0 ? ` (${e.remainingTurns} turns)` : ''}`}>
          {STATUS_LABELS[e.type] || e.type.slice(0, 3)}
        </span>
      ))}
    </div>
  );
}
