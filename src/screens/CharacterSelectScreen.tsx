import React, { useState } from 'react';
import { CHARACTER_LIST } from '../engine/characters';
import { audioManager } from '../audio/audioManager';
import '../styles/theme.css';
import '../styles/pixel.css';
import '../styles/animations.css';

interface CharacterSelectScreenProps {
  p1Name: string;
  p2Name: string;
  onConfirm: (p1Chars: [string, string], p2Chars: [string, string]) => void;
  onBack: () => void;
}

type PickPhase = 'P1_PICKING' | 'P2_PICKING' | 'DONE';

const AVATAR_COLORS: Record<string, string> = {
  A: '#ff6b6b',
  B: '#4ecdc4',
  C: '#45b7d1',
  D: '#f9ca24',
  E: '#a55eea',
  F: '#26de81',
  G: '#fd9644',
  H: '#778ca3',
  I: '#fc5c65',
  J: '#2bcbba',
  K: '#eb3b5a',
  L: '#fed330',
  M: '#20bf6b',
  N: '#4b7bec',
  O: '#8854d0',
  P: '#fa8231',
  Q: '#3867d6',
  R: '#0fb9b1',
  S: '#f7b731',
  T: '#fc5c65',
  U: '#a55eea',
  V: '#26de81',
  W: '#45b7d1',
  X: '#fd9644',
  Y: '#778ca3',
  Z: '#4ecdc4',
};

function getAvatarColor(name: string): string {
  const initial = name.charAt(0).toUpperCase();
  return AVATAR_COLORS[initial] || '#eeba30';
}

const CharacterSelectScreen: React.FC<CharacterSelectScreenProps> = ({
  p1Name,
  p2Name,
  onConfirm,
  onBack,
}) => {
  const [phase, setPhase] = useState<PickPhase>('P1_PICKING');
  const [p1Selected, setP1Selected] = useState<string[]>([]);
  const [p2Selected, setP2Selected] = useState<string[]>([]);

  const currentPlayerName = phase === 'P1_PICKING' ? p1Name : p2Name;
  const currentSelected = phase === 'P1_PICKING' ? p1Selected : p2Selected;
  const otherPlayerPicks = phase === 'P1_PICKING' ? [] : p1Selected;

  const handleCharacterClick = (charId: string) => {
    if (phase === 'DONE') return;
    if (otherPlayerPicks.includes(charId)) return;
    audioManager.playSFX('characterSelect');

    if (phase === 'P1_PICKING') {
      if (p1Selected.includes(charId)) {
        setP1Selected(p1Selected.filter((id) => id !== charId));
      } else if (p1Selected.length < 2) {
        setP1Selected([...p1Selected, charId]);
      }
    } else if (phase === 'P2_PICKING') {
      if (p2Selected.includes(charId)) {
        setP2Selected(p2Selected.filter((id) => id !== charId));
      } else if (p2Selected.length < 2) {
        setP2Selected([...p2Selected, charId]);
      }
    }
  };

  const handleConfirm = () => {
    audioManager.playSFX('characterConfirm');
    if (phase === 'P1_PICKING' && p1Selected.length === 2) {
      setPhase('P2_PICKING');
    } else if (phase === 'P2_PICKING' && p2Selected.length === 2) {
      setPhase('DONE');
      onConfirm(
        [p1Selected[0], p1Selected[1]] as [string, string],
        [p2Selected[0], p2Selected[1]] as [string, string]
      );
    }
  };

  const canConfirm = currentSelected.length === 2;

  return (
    <div
      className="character-select-screen"
      style={{
        width: '100vw',
        height: '100vh',
        background: '#060d06',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: '"Press Start 2P", monospace',
        color: '#ffffff',
        overflow: 'auto',
        padding: '2rem',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', position: 'relative', width: '100%', maxWidth: '900px' }}>
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '0.6rem',
            padding: '8px 16px',
            background: 'transparent',
            color: '#9a6abf',
            border: '2px solid #9a6abf44',
            cursor: 'pointer',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.borderColor = '#9a6abf';
            (e.target as HTMLButtonElement).style.color = '#eeba30';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.borderColor = '#9a6abf44';
            (e.target as HTMLButtonElement).style.color = '#9a6abf';
          }}
        >
          &lt; Back
        </button>
        <h2
          style={{
            fontSize: '1.4rem',
            color: '#eeba30',
            textShadow: '0 0 12px #eeba3066',
            marginBottom: '0.5rem',
          }}
        >
          Choose Your Wizards
        </h2>
        <p style={{ fontSize: '0.7rem', color: '#9a6abf' }}>
          {phase === 'P1_PICKING' && (
            <>
              <span style={{ color: '#eeba30' }}>{p1Name}</span> — Select 2 characters
            </>
          )}
          {phase === 'P2_PICKING' && (
            <>
              <span style={{ color: '#c0c0c0' }}>{p2Name}</span> — Select 2 characters
            </>
          )}
        </p>
      </div>

      {/* Player Names Display */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '900px',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            fontSize: '0.65rem',
            color: phase === 'P1_PICKING' ? '#eeba30' : '#eeba3088',
            padding: '8px 16px',
            border: `2px solid ${phase === 'P1_PICKING' ? '#eeba30' : '#eeba3044'}`,
            background: phase === 'P1_PICKING' ? '#eeba3011' : 'transparent',
          }}
        >
          {p1Name}
          {p1Selected.length > 0 && (
            <span style={{ color: '#eeba30', marginLeft: '8px' }}>
              [{p1Selected.length}/2]
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: '0.65rem',
            color: phase === 'P2_PICKING' ? '#c0c0c0' : '#c0c0c088',
            padding: '8px 16px',
            border: `2px solid ${phase === 'P2_PICKING' ? '#c0c0c0' : '#c0c0c044'}`,
            background: phase === 'P2_PICKING' ? '#c0c0c011' : 'transparent',
          }}
        >
          {p2Name}
          {p2Selected.length > 0 && (
            <span style={{ color: '#eeba30', marginLeft: '8px' }}>
              [{p2Selected.length}/2]
            </span>
          )}
        </div>
      </div>

      {/* Character Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          maxWidth: '900px',
          width: '100%',
          marginBottom: '2rem',
        }}
      >
        {CHARACTER_LIST.map((char) => {
          const isSelectedByP1 = p1Selected.includes(char.id);
          const isSelectedByP2 = p2Selected.includes(char.id);
          const isSelectedByCurrent = currentSelected.includes(char.id);
          const isPickedByOther = otherPlayerPicks.includes(char.id);

          let borderColor = '#1a3a1a';
          let opacity = 1;
          let bgColor = '#0d1a0d';

          if (isSelectedByCurrent) {
            borderColor = '#eeba30';
            bgColor = '#1a1508';
          } else if (isPickedByOther) {
            borderColor = '#1a3a1a';
            opacity = 0.35;
            bgColor = '#060d06';
          } else if (isSelectedByP1 && phase === 'P2_PICKING') {
            borderColor = '#eeba3044';
            opacity = 0.35;
            bgColor = '#060d06';
          }

          return (
            <div
              key={char.id}
              onClick={() => handleCharacterClick(char.id)}
              style={{
                padding: '1rem',
                border: `3px solid ${borderColor}`,
                background: bgColor,
                cursor: isPickedByOther ? 'not-allowed' : 'pointer',
                opacity,
                transition: 'border-color 0.2s, background 0.2s, opacity 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.6rem',
                position: 'relative',
              }}
            >
              {/* Selection indicator */}
              {(isSelectedByP1 || isSelectedByP2) && (
                <div
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '6px',
                    fontSize: '0.45rem',
                    color: isSelectedByP1 ? '#eeba30' : '#c0c0c0',
                  }}
                >
                  {isSelectedByP1 ? 'P1' : 'P2'}
                </div>
              )}

              {/* Avatar */}
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  border: `2px solid ${isSelectedByCurrent ? '#eeba30' : '#1a3a1a'}`,
                  overflow: 'hidden',
                  imageRendering: 'pixelated',
                  boxShadow: isSelectedByCurrent
                    ? `0 0 12px #eeba3088`
                    : 'none',
                }}
              >
                <img src={char.image} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Name */}
              <div
                style={{
                  fontSize: '0.6rem',
                  color: '#ffffff',
                  textAlign: 'center',
                }}
              >
                {char.name}
              </div>

              {/* Role */}
              <div
                style={{
                  fontSize: '0.45rem',
                  color: '#9a6abf',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                {char.role}
              </div>

              {/* Spells */}
              <div style={{ width: '100%' }}>
                <div
                  style={{
                    fontSize: '0.4rem',
                    color: '#eeba30',
                    marginBottom: '4px',
                  }}
                >
                  SPELLS:
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                  }}
                >
                  {char.spells.map((spell) => (
                    <span
                      key={spell.name}
                      style={{
                        fontSize: '0.38rem',
                        color: '#eeba30',
                        background: '#eeba3011',
                        padding: '2px 6px',
                        border: '1px solid #eeba3033',
                      }}
                    >
                      {spell.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Items */}
              <div style={{ width: '100%' }}>
                <div
                  style={{
                    fontSize: '0.4rem',
                    color: '#eeba30',
                    marginBottom: '4px',
                  }}
                >
                  ITEMS:
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                  }}
                >
                  {char.items.map((item) => (
                    <span
                      key={item.name}
                      style={{
                        fontSize: '0.38rem',
                        color: '#26de81',
                        background: '#26de8111',
                        padding: '2px 6px',
                        border: '1px solid #26de8133',
                      }}
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Button */}
      {phase !== 'DONE' && (
        <button
          className="pixel-button"
          onClick={handleConfirm}
          disabled={!canConfirm}
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '0.8rem',
            padding: '14px 40px',
            background: canConfirm ? '#eeba30' : '#1a3a1a',
            color: canConfirm ? '#060d06' : '#4a6a4a',
            border: `3px solid ${canConfirm ? '#b8922a' : '#1a1508'}`,
            cursor: canConfirm ? 'pointer' : 'not-allowed',
            boxShadow: canConfirm ? '0 4px 0 #8a6a1a' : 'none',
            transition: 'background 0.2s, color 0.2s, border-color 0.2s',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          {phase === 'P1_PICKING' ? `Confirm ${p1Name}'s Team` : `Confirm ${p2Name}'s Team`}
        </button>
      )}
    </div>
  );
};

export default CharacterSelectScreen;
