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
        padding: 14,
        background: charState.isAlive ? 'rgba(13, 26, 13, 0.8)' : 'rgba(13, 26, 13, 0.3)',
        border: `2px solid ${isTargetable ? '#eeba30' : isActive ? '#eeba30' : '#1a3a1a'}`,
        borderRadius: 4,
        opacity: charState.isAlive ? 1 : 0.4,
        cursor: isTargetable ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        width: 240,
        filter: charState.isAlive ? 'none' : 'grayscale(100%)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{
          width: 64,
          height: 64,
          border: '2px solid #eeba30',
          overflow: 'hidden',
          imageRendering: 'pixelated',
        }}>
          <img src={def.image} alt={def.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: '#eeba30', marginBottom: 4 }}>
            {def.name}
          </div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: '#8a9a8a' }}>
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
