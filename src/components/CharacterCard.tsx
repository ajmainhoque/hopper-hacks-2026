import { CharacterState } from '../engine/types';
import { getCharDef } from '../engine/gameState';
import { HpBar } from './HpBar';
import { ManaBar } from './ManaBar';
import { StatusEffectBadges } from './StatusEffectBadges';
import { BASE_HP, MAX_MANA } from '../engine/constants';

interface CharacterCardProps {
  charState: CharacterState;
  isActive: boolean;
  isTargetable?: boolean;
  onSelect?: () => void;
}

export function CharacterCard({ charState, isActive, isTargetable, onSelect }: CharacterCardProps) {
  const def = getCharDef(charState);

  return (
    <div
      onClick={isTargetable ? onSelect : undefined}
      className={`${isActive ? 'char-active' : ''}`}
      style={{
        padding: 12,
        background: charState.isAlive ? 'rgba(26, 26, 62, 0.8)' : 'rgba(26, 26, 62, 0.3)',
        border: `2px solid ${isTargetable ? '#ffd700' : isActive ? '#ffd700' : '#333'}`,
        borderRadius: 4,
        opacity: charState.isAlive ? 1 : 0.4,
        cursor: isTargetable ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        width: 180,
        filter: charState.isAlive ? 'none' : 'grayscale(100%)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{
          width: 48,
          height: 48,
          background: def.cssColor,
          border: '2px solid #ffd700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '16px',
          color: '#fff',
        }}>
          {def.initial}
        </div>
        <div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: '#ffd700', marginBottom: 4 }}>
            {def.name}
          </div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '6px', color: '#a0a0b0' }}>
            {def.role}
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 4 }}>
        <HpBar current={charState.hp} max={BASE_HP} />
      </div>
      <div style={{ marginBottom: 4 }}>
        <ManaBar current={charState.mana} max={MAX_MANA} />
      </div>
      <StatusEffectBadges effects={charState.statusEffects} />
      {!charState.isAlive && (
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '10px',
          color: '#e74c3c',
          textAlign: 'center',
          marginTop: 4,
        }}>
          DEFEATED
        </div>
      )}
    </div>
  );
}
