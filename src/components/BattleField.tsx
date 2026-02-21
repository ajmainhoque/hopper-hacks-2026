import { GameState } from '../engine/types';
import { CharacterCard } from './CharacterCard';
import { getCurrentActorIndex } from '../engine/turnManager';

interface BattleFieldProps {
  gameState: GameState;
  targetableIndices?: number[];
  onSelectTarget?: (index: number) => void;
}

export function BattleField({ gameState, targetableIndices = [], onSelectTarget }: BattleFieldProps) {
  const activeCharIdx = gameState.phase === 'ACTION' ? getCurrentActorIndex(gameState) : -1;

  const team1 = [0, 1]; // P1 chars
  const team2 = [2, 3]; // P2 chars

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 40px',
      gap: 60,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: '#ffd700', marginBottom: 8 }}>
          {gameState.players[0].name}
        </div>
        {team1.map(idx => (
          <CharacterCard
            key={idx}
            charState={gameState.characters[idx]}
            isActive={idx === activeCharIdx}
            isTargetable={targetableIndices.includes(idx)}
            onSelect={() => onSelectTarget?.(idx)}
          />
        ))}
      </div>

      <div style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '24px',
        color: '#ffd700',
      }}>
        VS
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: '#ffd700', marginBottom: 8 }}>
          {gameState.players[1].name}
        </div>
        {team2.map(idx => (
          <CharacterCard
            key={idx}
            charState={gameState.characters[idx]}
            isActive={idx === activeCharIdx}
            isTargetable={targetableIndices.includes(idx)}
            onSelect={() => onSelectTarget?.(idx)}
          />
        ))}
      </div>
    </div>
  );
}
