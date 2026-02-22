import { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { problemCache } from './coding/problemCache';
import { CodingLanguage } from './coding/types';
import { preloadPython } from './coding/pythonRunner';
import { audioManager } from './audio/audioManager';
import TitleScreen from './screens/TitleScreen';
import CharacterSelectScreen from './screens/CharacterSelectScreen';
import BattleScreen from './screens/BattleScreen';
import VictoryScreen from './screens/VictoryScreen';
import './styles/theme.css';
import './styles/pixel.css';
import './styles/animations.css';

type Screen = 'TITLE' | 'CHARACTER_SELECT' | 'BATTLE' | 'VICTORY';

function App() {
  const [screen, setScreen] = useState<Screen>('TITLE');
  const [p1Name, setP1Name] = useState('Player 1');
  const [p2Name, setP2Name] = useState('Player 2');
  const [codingLanguage, setCodingLanguage] = useState<CodingLanguage>('python');
  const [muted, setMuted] = useState(false);
  const { state, initGame, endCoding, submitAction, advanceTurn } = useGameState();

  // Unlock audio on first user interaction
  useEffect(() => {
    const handler = () => {
      audioManager.init();
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
    };
    document.addEventListener('click', handler);
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
    };
  }, []);

  const handleStart = (name1: string, name2: string, language: CodingLanguage) => {
    setP1Name(name1);
    setP2Name(name2);
    setCodingLanguage(language);
    setScreen('CHARACTER_SELECT');
    problemCache.warmUp(language);
    if (language === 'python') {
      preloadPython();
    }
  };

  const handleCharConfirm = (p1Chars: [string, string], p2Chars: [string, string]) => {
    initGame(p1Name, p2Name, p1Chars, p2Chars);
    setScreen('BATTLE');
  };

  const handlePlayAgain = () => {
    setScreen('TITLE');
  };

  const handleQuitBattle = () => {
    setScreen('TITLE');
  };

  const handleToggleMute = () => {
    const newMuted = audioManager.toggleMute();
    setMuted(newMuted);
  };

  const muteButton = (
    <button
      onClick={handleToggleMute}
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 9999,
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '8px',
        padding: '6px 10px',
        background: '#0d1a0d',
        color: muted ? '#4a6a4a' : '#eeba30',
        border: `2px solid ${muted ? '#1a3a1a' : '#eeba3066'}`,
        cursor: 'pointer',
        opacity: 0.8,
      }}
    >
      {muted ? 'SND OFF' : 'SND ON'}
    </button>
  );

  if (screen === 'TITLE') {
    return <>{muteButton}<TitleScreen onStart={handleStart} /></>;
  }

  if (screen === 'CHARACTER_SELECT') {
    return (
      <>
        {muteButton}
        <CharacterSelectScreen
        p1Name={p1Name}
        p2Name={p2Name}
        onConfirm={handleCharConfirm}
        onBack={() => setScreen('TITLE')}
      />
      </>
    );
  }

  if (screen === 'BATTLE' && state) {
    if (state.phase === 'FINISHED') {
      const winnerName = state.winner === 0 ? state.players[0].name : state.players[1].name;
      return (
        <>
          {muteButton}
          <VictoryScreen
            winnerName={winnerName}
            gameState={state}
            onPlayAgain={handlePlayAgain}
          />
        </>
      );
    }

    return (
      <>
        {muteButton}
        <BattleScreen
          gameState={state}
          endCoding={endCoding}
          submitAction={submitAction}
          advanceTurn={advanceTurn}
          codingLanguage={codingLanguage}
          onQuit={handleQuitBattle}
        />
      </>
    );
  }

  return <>{muteButton}<TitleScreen onStart={handleStart} /></>;
}

export default App;
