import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Action, CodingResult, Difficulty } from '../engine/types';
import { CodingLanguage } from '../coding/types';
import { getCurrentActorIndex } from '../engine/turnManager';
import { getEnemies, getAllies } from '../engine/gameState';
import { CODING_PHASE_SECONDS, ACTION_TURN_SECONDS } from '../engine/constants';
import { BattleField } from '../components/BattleField';
import { ActionPanel } from '../components/ActionPanel';
import { ActionLog } from '../components/ActionLog';
import { TimerDisplay } from '../components/TimerDisplay';
import { CodingEditor } from '../components/CodingEditor';
import { useTimer } from '../hooks/useTimer';
import { useCodingPhase } from '../hooks/useCodingPhase';

interface BattleScreenProps {
  gameState: GameState;
  endCoding: (results: [CodingResult | null, CodingResult | null]) => void;
  submitAction: (action: Action) => void;
  advanceTurn: () => void;
  codingLanguage: CodingLanguage;
}

type CodingSubPhase =
  | 'P1_CHOOSING'
  | 'P1_CODING'
  | 'PASS_SCREEN'
  | 'P2_CHOOSING'
  | 'P2_CODING'
  | 'CODING_DONE';

type TargetCallback = ((targetIdx: number) => void) | null;

const BattleScreen: React.FC<BattleScreenProps> = ({
  gameState,
  endCoding,
  submitAction,
  advanceTurn,
  codingLanguage,
}) => {
  const [codingSubPhase, setCodingSubPhase] = useState<CodingSubPhase>('P1_CHOOSING');
  const [p1Result, setP1Result] = useState<CodingResult | null>(null);
  const [p1Difficulty, setP1Difficulty] = useState<Difficulty | null>(null);
  const [p2Difficulty, setP2Difficulty] = useState<Difficulty | null>(null);
  const [targetableIndices, setTargetableIndices] = useState<number[]>([]);
  const [targetCallback, setTargetCallback] = useState<TargetCallback>(null);
  const coding = useCodingPhase(codingLanguage);

  const actionTimer = useTimer(ACTION_TURN_SECONDS, () => {
    const actorIdx = getCurrentActorIndex(gameState);
    submitAction({ type: 'DO_NOTHING', actorIndex: actorIdx });
    advanceTurn();
  });

  const codingTimer = useTimer(CODING_PHASE_SECONDS, () => {
    handleCodingDone(false, 0, 0);
  });

  const prevPhase = useRef(gameState.phase);
  useEffect(() => {
    if (gameState.phase === 'CODING' && prevPhase.current !== 'CODING') {
      setCodingSubPhase('P1_CHOOSING');
      setP1Result(null);
      setP1Difficulty(null);
      setP2Difficulty(null);
      coding.resetCoding();
    }
    if (gameState.phase === 'ACTION' && prevPhase.current !== 'ACTION') {
      actionTimer.start();
      setTargetableIndices([]);
      setTargetCallback(null);
    }
    prevPhase.current = gameState.phase;
  }, [gameState.phase]);

  const prevActorRef = useRef(gameState.currentActorIndex);
  useEffect(() => {
    if (gameState.phase === 'ACTION' && gameState.currentActorIndex !== prevActorRef.current) {
      actionTimer.start();
      setTargetableIndices([]);
      setTargetCallback(null);
    }
    prevActorRef.current = gameState.currentActorIndex;
  }, [gameState.currentActorIndex, gameState.phase]);

  const handleDifficultySelect = useCallback(async (difficulty: Difficulty) => {
    if (codingSubPhase === 'P1_CHOOSING') {
      setP1Difficulty(difficulty);
      setCodingSubPhase('P1_CODING');
      await coding.loadProblem(difficulty);
      codingTimer.start();
    } else if (codingSubPhase === 'P2_CHOOSING') {
      setP2Difficulty(difficulty);
      setCodingSubPhase('P2_CODING');
      coding.resetCoding();
      await coding.loadProblem(difficulty);
      codingTimer.start();
    }
  }, [codingSubPhase, coding, codingTimer]);

  const handleCodingDone = useCallback((passed: boolean, testsTotal: number, testsPassed: number) => {
    codingTimer.stop();
    const difficulty = codingSubPhase === 'P1_CODING' ? p1Difficulty! : p2Difficulty!;
    const result: CodingResult = { difficulty, passed, testsTotal, testsPassed };

    if (codingSubPhase === 'P1_CODING') {
      setP1Result(result);
      coding.resetCoding();
      setCodingSubPhase('PASS_SCREEN');
    } else if (codingSubPhase === 'P2_CODING') {
      setCodingSubPhase('CODING_DONE');
      endCoding([p1Result, result]);
    }
  }, [codingSubPhase, p1Difficulty, p2Difficulty, p1Result, endCoding, coding, codingTimer]);

  const handleCodingSubmit = useCallback(async (code: string) => {
    const result = await coding.submitCode(code);
    if (result) {
      handleCodingDone(result.passed, result.totalTests, result.passedTests);
    }
    return result;
  }, [coding, handleCodingDone]);

  const handlePassReady = useCallback(() => {
    setCodingSubPhase('P2_CHOOSING');
  }, []);

  const handleAction = useCallback((action: Action) => {
    actionTimer.stop();
    submitAction(action);
    setTargetableIndices([]);
    setTargetCallback(null);
    setTimeout(() => advanceTurn(), 500);
  }, [submitAction, advanceTurn, actionTimer]);

  const handleSelectTarget = useCallback((targetType: 'ENEMY_SINGLE' | 'ALLY_SINGLE', callback: (targetIdx: number) => void) => {
    const actorIdx = getCurrentActorIndex(gameState);
    let validTargets: number[];
    if (targetType === 'ENEMY_SINGLE') {
      validTargets = getEnemies(gameState, actorIdx).filter(i => gameState.characters[i].isAlive);
    } else {
      validTargets = getAllies(gameState, actorIdx).filter(i => gameState.characters[i].isAlive);
    }
    setTargetableIndices(validTargets);
    setTargetCallback(() => callback);
  }, [gameState]);

  const handleTargetClick = useCallback((index: number) => {
    if (targetCallback) {
      targetCallback(index);
      setTargetableIndices([]);
      setTargetCallback(null);
    }
  }, [targetCallback]);

  const isCodingPhase = gameState.phase === 'CODING';
  const isActionPhase = gameState.phase === 'ACTION';

  return (
    <div style={{
      width: '100vw', height: '100vh', background: '#0a0a1a',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Press Start 2P', monospace", color: '#fff', overflow: 'hidden',
    }}>
      {/* Phase Banner */}
      <div style={{
        textAlign: 'center', padding: '10px 0',
        background: isCodingPhase
          ? 'linear-gradient(90deg, #1a1a2e 0%, #2a1a4e 50%, #1a1a2e 100%)'
          : 'linear-gradient(90deg, #1a1a2e 0%, #4e1a1a 50%, #1a1a2e 100%)',
        borderBottom: `2px solid ${isCodingPhase ? '#c0a0ff' : '#ff6b6b'}`,
      }}>
        <span style={{ fontSize: '14px', color: isCodingPhase ? '#c0a0ff' : '#ff6b6b', letterSpacing: '0.2em' }}>
          {isCodingPhase ? 'CODING PHASE' : 'ACTION PHASE'}
        </span>
        <span style={{ fontSize: '9px', color: '#888', marginLeft: 16 }}>
          Turn {gameState.turnNumber}
        </span>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
          {isCodingPhase && (codingSubPhase === 'P1_CODING' || codingSubPhase === 'P2_CODING') && (
            <TimerDisplay secondsLeft={codingTimer.secondsLeft} totalSeconds={CODING_PHASE_SECONDS} />
          )}
          {isActionPhase && (
            <TimerDisplay secondsLeft={actionTimer.secondsLeft} totalSeconds={ACTION_TURN_SECONDS} />
          )}
        </div>
      </div>

      {/* Battlefield */}
      <div style={{ flex: '0 0 auto' }}>
        <BattleField gameState={gameState} targetableIndices={targetableIndices} onSelectTarget={handleTargetClick} />
      </div>

      {/* Lower Panel */}
      <div style={{ flex: 1, borderTop: '2px solid #333', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* CODING PHASE */}
        {isCodingPhase && codingSubPhase !== 'CODING_DONE' && (
          <div style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
            {codingSubPhase === 'PASS_SCREEN' && (
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: '#0a0a1acc', backdropFilter: 'blur(4px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100,
              }}>
                <p style={{ fontSize: '10px', color: '#c0a0ff', marginBottom: 16 }}>Pass the screen to</p>
                <p style={{ fontSize: '18px', color: '#ffd700', marginBottom: 24 }}>{gameState.players[1].name}</p>
                <button className="pixel-button" onClick={handlePassReady} style={{
                  fontFamily: "'Press Start 2P', monospace", fontSize: '10px',
                  padding: '12px 32px', background: '#ffd700', color: '#0a0a1a',
                  border: '3px solid #b8860b', cursor: 'pointer',
                }}>I'm Ready</button>
              </div>
            )}

            {(codingSubPhase === 'P1_CHOOSING' || codingSubPhase === 'P2_CHOOSING') && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 24 }}>
                <p style={{ fontSize: '10px', color: '#c0a0ff' }}>
                  <span style={{ color: codingSubPhase === 'P1_CHOOSING' ? '#88ccff' : '#ff8888' }}>
                    {codingSubPhase === 'P1_CHOOSING' ? gameState.players[0].name : gameState.players[1].name}
                  </span>
                  {' '}&mdash; Choose coding difficulty
                </p>
                <div style={{ display: 'flex', gap: 16 }}>
                  <button className="pixel-button" onClick={() => handleDifficultySelect('EASY')} style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: '10px',
                    padding: '12px 24px', background: '#1a1a2e', color: '#44cc44',
                    border: '3px solid #44cc44', cursor: 'pointer',
                  }}>EASY (+3 mana)</button>
                  <button className="pixel-button" onClick={() => handleDifficultySelect('HARD')} style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: '10px',
                    padding: '12px 24px', background: '#1a1a2e', color: '#cc4444',
                    border: '3px solid #cc4444', cursor: 'pointer',
                  }}>HARD (+5 mana)</button>
                </div>
              </div>
            )}

            {(codingSubPhase === 'P1_CODING' || codingSubPhase === 'P2_CODING') && coding.problem && (
              <div style={{ padding: 12, height: '100%' }}>
                <CodingEditor problem={coding.problem} onSubmit={handleCodingSubmit} disabled={false} language={codingLanguage} />
              </div>
            )}

            {(codingSubPhase === 'P1_CODING' || codingSubPhase === 'P2_CODING') && coding.isLoading && (
              <div style={{ textAlign: 'center', padding: 40, color: '#ffd700', fontSize: '10px' }}>
                Loading coding challenge...
              </div>
            )}
          </div>
        )}

        {/* ACTION PHASE */}
        {isActionPhase && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 8 }}>
              <ActionPanel gameState={gameState} onAction={handleAction} onSelectTarget={handleSelectTarget} />
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '0 8px 8px' }}>
              <ActionLog entries={gameState.actionLog} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleScreen;
