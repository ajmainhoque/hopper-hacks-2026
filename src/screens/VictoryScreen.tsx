import React, { useEffect } from 'react';
import { GameState } from '../engine/types';
import { getCharDef } from '../engine/gameState';
import { BASE_HP } from '../engine/constants';
import { audioManager } from '../audio/audioManager';

interface VictoryScreenProps {
  winnerName: string;
  gameState: GameState;
  onPlayAgain: () => void;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({ winnerName, gameState, onPlayAgain }) => {
  useEffect(() => {
    audioManager.playMusic('victory');
    audioManager.playSFX('victory');
  }, []);

  return (
    <div style={{
      width: '100vw', height: '100vh', background: '#060d06',
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
            background: 'radial-gradient(circle, #eeba30 0%, #eeba3088 40%, transparent 70%)',
            animationDelay: `${Math.random() * 3}s`, animationDuration: `${Math.random() * 2 + 1}s`,
          }} />
        ))}
      </div>

      <div style={{ zIndex: 1, textAlign: 'center' }}>
        <div className="float" style={{
          fontSize: '40px', color: '#eeba30',
          textShadow: '0 0 30px #eeba3088, 0 0 60px #eeba3044, 0 4px 0 #b8922a',
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
                padding: 20, border: `3px solid ${isWinner ? '#eeba30' : '#1a3a1a'}`,
                background: isWinner ? '#1a1508' : '#0d1a0d', minWidth: 200,
                boxShadow: isWinner ? '0 0 20px #eeba3033' : 'none',
              }}>
                <div style={{
                  fontSize: '10px', color: isWinner ? '#eeba30' : pIdx === 0 ? '#eeba30' : '#c0c0c0',
                  textAlign: 'center', marginBottom: 16, paddingBottom: 8,
                  borderBottom: `2px solid ${isWinner ? '#eeba3044' : '#1a3a1a'}`,
                }}>
                  {player.name}
                  {isWinner && <span style={{ display: 'block', fontSize: '7px', color: '#eeba30', marginTop: 4 }}>WINNER</span>}
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
                        <div style={{ flex: 1, height: 8, background: '#0a1a0a', border: '1px solid #444' }}>
                          <div style={{
                            width: `${hpPct}%`, height: '100%',
                            background: !charState.isAlive ? '#444' : hpPct > 50 ? '#2ecc71' : hpPct > 25 ? '#ecb939' : '#e74c3c',
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

        <button className="pixel-button" onClick={() => { audioManager.playSFX('buttonClick'); onPlayAgain(); }} style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: '14px',
          padding: '16px 44px', background: '#eeba30', color: '#0d1a0d',
          border: '4px solid #b8922a', cursor: 'pointer', textTransform: 'uppercase',
          letterSpacing: '0.1em', boxShadow: '0 4px 0 #8a6a1a, 0 0 20px #eeba3044',
        }}>Play Again</button>
      </div>
    </div>
  );
};

export default VictoryScreen;
