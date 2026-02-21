import React from 'react';
import { GameState } from '../engine/types';
import { getCharDef } from '../engine/gameState';
import { BASE_HP } from '../engine/constants';

interface VictoryScreenProps {
  winnerName: string;
  gameState: GameState;
  onPlayAgain: () => void;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({ winnerName, gameState, onPlayAgain }) => {
  return (
    <div style={{
      width: '100vw', height: '100vh', background: '#0a0a1a',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Press Start 2P', monospace", color: '#fff', position: 'relative', overflow: 'hidden',
    }}>
      {/* Stars */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="twinkle" style={{
            position: 'absolute',
            top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 2}px`, height: `${Math.random() * 4 + 2}px`,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #ffd700 0%, #ffd70088 40%, transparent 70%)',
            animationDelay: `${Math.random() * 3}s`, animationDuration: `${Math.random() * 2 + 1}s`,
          }} />
        ))}
      </div>

      <div style={{ zIndex: 1, textAlign: 'center' }}>
        <div className="float" style={{
          fontSize: '40px', color: '#ffd700',
          textShadow: '0 0 30px #ffd70088, 0 0 60px #ffd70044, 0 4px 0 #b8860b',
          marginBottom: 16, letterSpacing: '0.15em',
        }}>VICTORY!</div>

        <div style={{ fontSize: '24px', color: '#fff', textShadow: '0 0 16px #ffffff44', marginBottom: 40 }}>
          {winnerName}
        </div>

        {/* Team stats */}
        <div style={{ display: 'flex', gap: 48, justifyContent: 'center', marginBottom: 48 }}>
          {gameState.players.map((player, pIdx) => {
            const isWinner = player.name === winnerName;
            const charIndices = player.characters;
            return (
              <div key={pIdx} style={{
                padding: 20, border: `3px solid ${isWinner ? '#ffd700' : '#333'}`,
                background: isWinner ? '#2a2a1e' : '#1a1a2e', minWidth: 200,
                boxShadow: isWinner ? '0 0 20px #ffd70033' : 'none',
              }}>
                <div style={{
                  fontSize: '10px', color: isWinner ? '#ffd700' : pIdx === 0 ? '#88ccff' : '#ff8888',
                  textAlign: 'center', marginBottom: 16, paddingBottom: 8,
                  borderBottom: `2px solid ${isWinner ? '#ffd70044' : '#333'}`,
                }}>
                  {player.name}
                  {isWinner && <span style={{ display: 'block', fontSize: '7px', color: '#ffd700', marginTop: 4 }}>WINNER</span>}
                </div>
                {charIndices.map((charIdx) => {
                  const charState = gameState.characters[charIdx];
                  const charDef = getCharDef(charState);
                  const hpPct = Math.max(0, (charState.hp / BASE_HP) * 100);
                  return (
                    <div key={charIdx} style={{ marginBottom: 12, opacity: charState.isAlive ? 1 : 0.5 }}>
                      <div style={{
                        fontSize: '8px', color: charState.isAlive ? '#fff' : '#666', marginBottom: 4,
                        display: 'flex', justifyContent: 'space-between',
                      }}>
                        <span>{charDef.name}</span>
                        {!charState.isAlive && <span style={{ color: '#e74c3c', fontSize: '7px' }}>KO</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, height: 8, background: '#222', border: '1px solid #444' }}>
                          <div style={{
                            width: `${hpPct}%`, height: '100%',
                            background: !charState.isAlive ? '#444' : hpPct > 50 ? '#2ecc71' : hpPct > 25 ? '#f39c12' : '#e74c3c',
                          }} />
                        </div>
                        <span style={{ fontSize: '7px', color: charState.isAlive ? '#aaa' : '#666', minWidth: 50, textAlign: 'right' }}>
                          {charState.hp}/{BASE_HP}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <button className="pixel-button" onClick={onPlayAgain} style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: '14px',
          padding: '16px 44px', background: '#ffd700', color: '#1a1a2e',
          border: '4px solid #b8860b', cursor: 'pointer', textTransform: 'uppercase',
          letterSpacing: '0.1em', boxShadow: '0 4px 0 #8b6508, 0 0 20px #ffd70044',
        }}>Play Again</button>
      </div>
    </div>
  );
};

export default VictoryScreen;
