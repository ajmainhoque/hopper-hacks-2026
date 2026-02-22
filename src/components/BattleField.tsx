import { GameState } from '../engine/types';
import { CharacterCard } from './CharacterCard';
import { getCharDef } from '../engine/gameState';
import { getCurrentActorIndex } from '../engine/turnManager';
import { SpellVFX, VFXType } from './SpellVFX';

/** Map character def ID to the full-body battle sprite in /public/battle/ */
const BATTLE_SPRITE: Record<string, string> = {
  harry: '/battle/harry.png',
  hermione: '/battle/hermoine.png',
  ron: '/battle/ron.png',
  voldemort: '/battle/voldemort.png',
  hagrid: '/battle/hagrid.png',
  bellatrix: '/battle/bellatrix.png',
};

function getBattleSprite(defId: string): string {
  return BATTLE_SPRITE[defId] ?? `/characters/${defId}.png`;
}

interface BattleFieldProps {
  gameState: GameState;
  targetableIndices?: number[];
  onSelectTarget?: (index: number) => void;
  attackingIndex?: number;
  hurtIndex?: number;
  vfxTarget?: number;
  vfxType?: VFXType;
}

function getSpriteAnimClass(
  charIndex: number,
  isAlive: boolean,
  isAttacking: boolean,
  isHurt: boolean,
  team: 0 | 1,
): string {
  if (!isAlive) return 'sprite-defeated';
  if (isAttacking) return team === 0 ? 'sprite-attack-right' : 'sprite-attack-left';
  if (isHurt) return 'sprite-hurt';
  // Stagger idle animations for a natural look
  const delayClasses = ['sprite-idle', 'sprite-idle-delay-1', 'sprite-idle-delay-2', 'sprite-idle-delay-3'];
  return delayClasses[charIndex % delayClasses.length];
}

export function BattleField({ gameState, targetableIndices = [], onSelectTarget, attackingIndex = -1, hurtIndex = -1, vfxTarget = -1, vfxType = 'NONE' }: BattleFieldProps) {
  const activeCharIdx = gameState.phase === 'ACTION' ? getCurrentActorIndex(gameState) : -1;

  const team1 = [0, 1]; // P1 chars
  const team2 = [2, 3]; // P2 chars

  return (
    <div style={{
      position: 'relative',
      backgroundImage: 'url(/dining_bg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* ── HUD: Team info cards at top ── */}
      <div style={{
        position: 'absolute',
        top: 8,
        left: 12,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: '#eeba30', textShadow: '1px 1px 3px #000' }}>
          {gameState.players[0].name}
        </div>
        {team1.map((idx, i) => (
          <div key={idx} style={{ marginTop: i === 1 ? 80 : 0 }}>
            <CharacterCard
              charState={gameState.characters[idx]}
              isActive={idx === activeCharIdx}
              isTargetable={targetableIndices.includes(idx)}
              onSelect={() => onSelectTarget?.(idx)}
            />
          </div>
        ))}
      </div>

      <div style={{
        position: 'absolute',
        top: 8,
        right: 12,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'flex-end',
      }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: '#c0c0c0', textShadow: '1px 1px 3px #000' }}>
          {gameState.players[1].name}
        </div>
        {team2.map((idx, i) => (
          <div key={idx} style={{ marginTop: i === 1 ? 80 : 0 }}>
            <CharacterCard
              charState={gameState.characters[idx]}
              isActive={idx === activeCharIdx}
              isTargetable={targetableIndices.includes(idx)}
              onSelect={() => onSelectTarget?.(idx)}
            />
          </div>
        ))}
      </div>

      {/* ── Character Sprites on Battlefield ── */}
      <div style={{
        position: 'absolute',
        bottom: -40,
        left: 0,
        right: 0,
        height: '55%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: '28%',
        pointerEvents: 'none',
      }}>
        {/* Team 1 sprites (left side) — stacked vertically, top char shifted right */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 0,
          position: 'relative',
          height: '100%',
          justifyContent: 'flex-end',
        }}>
          {team1.map((idx, i) => {
            const def = getCharDef(gameState.characters[idx]);
            const charState = gameState.characters[idx];
            const battleSprite = getBattleSprite(charState.defId);
            const isAttacking = idx === attackingIndex;
            const isHurt = idx === hurtIndex;
            const animClass = getSpriteAnimClass(idx, charState.isAlive, isAttacking, isHurt, 0);
            const isBackRow = i === 0;

            return (
              <div
                key={idx}
                className={animClass}
                onClick={targetableIndices.includes(idx) ? () => onSelectTarget?.(idx) : undefined}
                style={{
                  cursor: targetableIndices.includes(idx) ? 'pointer' : 'default',
                  pointerEvents: targetableIndices.includes(idx) ? 'auto' : 'none',
                  position: 'relative',
                  imageRendering: 'pixelated',
                  marginLeft: isBackRow ? 110 : -120,
                  marginBottom: isBackRow ? -50 : 0,
                  top: isBackRow ? 0 : -80,
                  zIndex: isBackRow ? 1 : 2,
                }}
              >
                <img
                  src={battleSprite}
                  alt={def.name}
                  draggable={false}
                  style={{
                    height: isBackRow ? '160px' : '190px',
                    width: 'auto',
                    imageRendering: 'pixelated',
                    filter: targetableIndices.includes(idx) ? 'drop-shadow(0 0 8px #eeba30)' : 'drop-shadow(2px 4px 6px rgba(0,0,0,0.6))',
                  }}
                />
                {/* Spell VFX on this character */}
                <SpellVFX type={vfxTarget === idx ? vfxType : 'NONE'} active={vfxTarget === idx} />
                {idx === activeCharIdx && charState.isAlive && (
                  <div style={{
                    position: 'absolute',
                    top: -20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '8px',
                    color: '#eeba30',
                    textShadow: '0 0 6px #eeba30',
                    animation: 'float 1.5s ease-in-out infinite',
                    whiteSpace: 'nowrap',
                  }}>
                    ▼
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Team 2 sprites (right side) — stacked vertically, top char shifted left */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 0,
          position: 'relative',
          height: '100%',
          justifyContent: 'flex-end',
        }}>
          {team2.map((idx, i) => {
            const def = getCharDef(gameState.characters[idx]);
            const charState = gameState.characters[idx];
            const battleSprite = getBattleSprite(charState.defId);
            const isAttacking = idx === attackingIndex;
            const isHurt = idx === hurtIndex;
            const animClass = getSpriteAnimClass(idx, charState.isAlive, isAttacking, isHurt, 1);
            const isBackRow = i === 0;

            return (
              <div
                key={idx}
                className={animClass}
                onClick={targetableIndices.includes(idx) ? () => onSelectTarget?.(idx) : undefined}
                style={{
                  cursor: targetableIndices.includes(idx) ? 'pointer' : 'default',
                  pointerEvents: targetableIndices.includes(idx) ? 'auto' : 'none',
                  position: 'relative',
                  imageRendering: 'pixelated',
                  marginRight: isBackRow ? 110 : -120,
                  marginBottom: isBackRow ? -50 : 0,
                  top: isBackRow ? 0 : -80,
                  zIndex: isBackRow ? 1 : 2,
                }}
              >
                <img
                  src={battleSprite}
                  alt={def.name}
                  draggable={false}
                  style={{
                    height: isBackRow ? '160px' : '190px',
                    width: 'auto',
                    imageRendering: 'pixelated',
                    transform: 'scaleX(-1)',
                    filter: targetableIndices.includes(idx) ? 'drop-shadow(0 0 8px #eeba30)' : 'drop-shadow(2px 4px 6px rgba(0,0,0,0.6))',
                  }}
                />
                {/* Spell VFX on this character */}
                <SpellVFX type={vfxTarget === idx ? vfxType : 'NONE'} active={vfxTarget === idx} />
                {idx === activeCharIdx && charState.isAlive && (
                  <div style={{
                    position: 'absolute',
                    top: -20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '8px',
                    color: '#eeba30',
                    textShadow: '0 0 6px #eeba30',
                    animation: 'float 1.5s ease-in-out infinite',
                    whiteSpace: 'nowrap',
                  }}>
                    ▼
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
