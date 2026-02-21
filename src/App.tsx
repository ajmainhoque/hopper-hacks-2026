import { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import { problemCache } from './coding/problemCache';
import { CodingLanguage } from './coding/types';
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
  const { state, initGame, endCoding, submitAction, advanceTurn } = useGameState();

  const handleStart = (name1: string, name2: string, language: CodingLanguage) => {
    setP1Name(name1);
    setP2Name(name2);
    setCodingLanguage(language);
    setScreen('CHARACTER_SELECT');
    problemCache.warmUp(language);
  };

  const handleCharConfirm = (p1Chars: [string, string], p2Chars: [string, string]) => {
    initGame(p1Name, p2Name, p1Chars, p2Chars);
    setScreen('BATTLE');
  };

  const handlePlayAgain = () => {
    setScreen('TITLE');
  };

  if (screen === 'TITLE') {
    return <TitleScreen onStart={handleStart} />;
  }

  if (screen === 'CHARACTER_SELECT') {
    return (
      <CharacterSelectScreen
        p1Name={p1Name}
        p2Name={p2Name}
        onConfirm={handleCharConfirm}
      />
    );
  }

  if (screen === 'BATTLE' && state) {
    if (state.phase === 'FINISHED') {
      const winnerName = state.winner === 0 ? state.players[0].name : state.players[1].name;
      return (
        <VictoryScreen
          winnerName={winnerName}
          gameState={state}
          onPlayAgain={handlePlayAgain}
        />
      );
    }

    return (
      <BattleScreen
        gameState={state}
        endCoding={endCoding}
        submitAction={submitAction}
        advanceTurn={advanceTurn}
        codingLanguage={codingLanguage}
      />
    );
  }

  return <TitleScreen onStart={handleStart} />;
}

export default App;
