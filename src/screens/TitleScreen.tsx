import React, { useState } from 'react';
import { CodingLanguage } from '../coding/types';
import '../styles/theme.css';
import '../styles/pixel.css';
import '../styles/animations.css';

interface TitleScreenProps {
  onStart: (p1Name: string, p2Name: string, language: CodingLanguage) => void;
}

const LANGUAGE_OPTIONS: { value: CodingLanguage; label: string; color: string }[] = [
  { value: 'python', label: 'Python', color: '#3776AB' },
  { value: 'javascript', label: 'JavaScript', color: '#F7DF1E' },
  { value: 'java', label: 'Java', color: '#ED8B00' },
  { value: 'c', label: 'C', color: '#00599C' },
  { value: 'cpp', label: 'C++', color: '#659BD3' },
];

const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  const [p1Name, setP1Name] = useState('Player 1');
  const [p2Name, setP2Name] = useState('Player 2');
  const [language, setLanguage] = useState<CodingLanguage>('python');

  const handleStart = () => {
    const name1 = p1Name.trim() || 'Player 1';
    const name2 = p2Name.trim() || 'Player 2';
    onStart(name1, name2, language);
  };

  return (
    <div
      className="title-screen"
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: '#0a0a1a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: '"Press Start 2P", monospace',
      }}
    >
      {/* Starfield background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="twinkle"
            style={{
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #ffffff 0%, #ffffff88 40%, transparent 70%)',
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 1.5}s`,
            }}
          />
        ))}
      </div>

      {/* Game Title */}
      <div style={{ zIndex: 1, textAlign: 'center' }}>
        <h1
          className="float"
          style={{
            fontSize: '4rem',
            color: '#ffd700',
            textShadow: '0 0 20px #ffd70088, 0 4px 0 #b8860b, 0 6px 0 #8b6508',
            marginBottom: '0.5rem',
            letterSpacing: '0.2em',
            imageRendering: 'pixelated',
          }}
        >
          WitWand
        </h1>

        <p
          style={{
            fontSize: '0.85rem',
            color: '#c0a0ff',
            textShadow: '0 0 8px #c0a0ff66',
            marginBottom: '3rem',
            letterSpacing: '0.1em',
          }}
        >
          A Wizard&apos;s Coding Duel
        </p>

        {/* Player Name Inputs */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.2rem',
            marginBottom: '2.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label
              style={{
                fontSize: '0.65rem',
                color: '#88ccff',
                minWidth: '120px',
                textAlign: 'right',
              }}
            >
              PLAYER 1:
            </label>
            <input
              type="text"
              value={p1Name}
              onChange={(e) => setP1Name(e.target.value)}
              maxLength={16}
              className="pixel-input"
              style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '0.7rem',
                padding: '10px 14px',
                background: '#1a1a2e',
                border: '3px solid #88ccff',
                color: '#ffffff',
                outline: 'none',
                imageRendering: 'pixelated',
                width: '200px',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ffd700';
                e.target.style.boxShadow = '0 0 10px #ffd70044';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#88ccff';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label
              style={{
                fontSize: '0.65rem',
                color: '#ff8888',
                minWidth: '120px',
                textAlign: 'right',
              }}
            >
              PLAYER 2:
            </label>
            <input
              type="text"
              value={p2Name}
              onChange={(e) => setP2Name(e.target.value)}
              maxLength={16}
              className="pixel-input"
              style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '0.7rem',
                padding: '10px 14px',
                background: '#1a1a2e',
                border: '3px solid #ff8888',
                color: '#ffffff',
                outline: 'none',
                imageRendering: 'pixelated',
                width: '200px',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ffd700';
                e.target.style.boxShadow = '0 0 10px #ffd70044';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ff8888';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Language Selector */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <label style={{ fontSize: '0.65rem', color: '#c0a0ff', display: 'block', marginBottom: '0.8rem' }}>
            CODING LANGUAGE:
          </label>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLanguage(opt.value)}
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '0.55rem',
                  padding: '8px 14px',
                  background: language === opt.value ? opt.color : '#1a1a2e',
                  color: language === opt.value ? (opt.value === 'javascript' ? '#1a1a2e' : '#fff') : '#888',
                  border: `2px solid ${language === opt.value ? opt.color : '#333'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: language === opt.value ? `0 0 12px ${opt.color}44` : 'none',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          className="pixel-button"
          onClick={handleStart}
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '1rem',
            padding: '16px 48px',
            background: '#ffd700',
            color: '#1a1a2e',
            border: '4px solid #b8860b',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            imageRendering: 'pixelated',
            boxShadow: '0 4px 0 #8b6508, 0 0 20px #ffd70044',
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
          onMouseDown={(e) => {
            (e.target as HTMLButtonElement).style.transform = 'translateY(4px)';
            (e.target as HTMLButtonElement).style.boxShadow = '0 0 0 #8b6508, 0 0 20px #ffd70044';
          }}
          onMouseUp={(e) => {
            (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
            (e.target as HTMLButtonElement).style.boxShadow = '0 4px 0 #8b6508, 0 0 20px #ffd70044';
          }}
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

export default TitleScreen;
