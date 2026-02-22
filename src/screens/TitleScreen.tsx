import React, { useState, useEffect } from 'react';
import { CodingLanguage } from '../coding/types';
import { audioManager } from '../audio/audioManager';
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

  useEffect(() => {
    audioManager.playMusic('title');
  }, []);

  const handleStart = () => {
    audioManager.playSFX('buttonClick');
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
        backgroundImage: 'url(/title-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#060d06',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: '"Press Start 2P", monospace',
      }}
    >
      {/* Dark overlay for readability */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.6)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Game Title */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <img
          className="float"
          src="/title.png"
          alt="WitWand"
          style={{
            width: '560px',
            maxWidth: '90vw',
            imageRendering: 'pixelated',
            marginBottom: '0',
            filter: 'drop-shadow(0 0 20px #eeba3044)',
            pointerEvents: 'none',
          }}
        />

        <p
          style={{
            fontSize: '0.85rem',
            color: '#9a6abf',
            textShadow: '0 0 8px #9a6abf66',
            marginTop: '-7rem',
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
                color: '#eeba30',
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
                background: '#0d1a0d',
                border: '3px solid #eeba30',
                color: '#ffffff',
                outline: 'none',
                imageRendering: 'pixelated',
                width: '200px',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#f5d060';
                e.target.style.boxShadow = '0 0 10px #eeba3044';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#eeba30';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label
              style={{
                fontSize: '0.65rem',
                color: '#c0c0c0',
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
                background: '#1a1a1a',
                border: '3px solid #c0c0c0',
                color: '#ffffff',
                outline: 'none',
                imageRendering: 'pixelated',
                width: '200px',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = '0 0 10px #c0c0c044';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#c0c0c0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Language Selector */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <label style={{ fontSize: '0.65rem', color: '#9a6abf', display: 'block', marginBottom: '0.8rem' }}>
            CODING LANGUAGE:
          </label>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { audioManager.playSFX('buttonClick'); setLanguage(opt.value); }}
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '0.55rem',
                  padding: '8px 14px',
                  background: language === opt.value ? opt.color : '#0d1a0d',
                  color: language === opt.value ? (opt.value === 'javascript' ? '#060d06' : '#fff') : '#8a9a8a',
                  border: `2px solid ${language === opt.value ? opt.color : '#2a3a2a'}`,
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
            background: '#eeba30',
            color: '#060d06',
            border: '4px solid #b8922a',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            imageRendering: 'pixelated',
            boxShadow: '0 4px 0 #8a6a1a, 0 0 20px #eeba3044',
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
          onMouseDown={(e) => {
            (e.target as HTMLButtonElement).style.transform = 'translateY(4px)';
            (e.target as HTMLButtonElement).style.boxShadow = '0 0 0 #8a6a1a, 0 0 20px #eeba3044';
          }}
          onMouseUp={(e) => {
            (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
            (e.target as HTMLButtonElement).style.boxShadow = '0 4px 0 #8a6a1a, 0 0 20px #eeba3044';
          }}
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

export default TitleScreen;
