import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Action, CodingResult, Difficulty } from '../engine/types';
import { CodingLanguage } from '../coding/types';
import { getCurrentActorIndex } from '../engine/turnManager';
import { getEnemies, getAllies } from '../engine/gameState';
import { CODING_PHASE_SECONDS, ACTION_TURN_SECONDS, CODING_SECONDS_BY_DIFFICULTY } from '../engine/constants';
import { BattleField } from '../components/BattleField';
import { ActionPanel } from '../components/ActionPanel';
import { ActionLog } from '../components/ActionLog';
import { TimerDisplay } from '../components/TimerDisplay';
import { CodingEditor } from '../components/CodingEditor';
import { useTimer } from '../hooks/useTimer';
import { useCodingPhase } from '../hooks/useCodingPhase';
import { VFXType, getSpellVFXType } from '../components/SpellVFX';
import { CHARACTER_DEFS } from '../engine/characters';
import { explainIncorrect } from '../coding/geminiClient';
import { audioManager } from '../audio/audioManager';

interface BattleScreenProps {
  gameState: GameState;
  endCoding: (results: [CodingResult | null, CodingResult | null]) => void;
  submitAction: (action: Action) => void;
  advanceTurn: () => void;
  codingLanguage: CodingLanguage;
  onQuit: () => void;
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
  onQuit,
}) => {
  const [codingSubPhase, setCodingSubPhase] = useState<CodingSubPhase>('P1_CHOOSING');
  const [p1Result, setP1Result] = useState<CodingResult | null>(null);
  const [p1Difficulty, setP1Difficulty] = useState<Difficulty | null>(null);
  const [p2Difficulty, setP2Difficulty] = useState<Difficulty | null>(null);
  const [codingTotalSeconds, setCodingTotalSeconds] = useState(CODING_PHASE_SECONDS);
  const [targetableIndices, setTargetableIndices] = useState<number[]>([]);
  const [targetCallback, setTargetCallback] = useState<TargetCallback>(null);
  const [attackingIndex, setAttackingIndex] = useState(-1);
  const [hurtIndex, setHurtIndex] = useState(-1);
  const [vfxTarget, setVfxTarget] = useState(-1);
  const [vfxType, setVfxType] = useState<VFXType>('NONE');
  const coding = useCodingPhase(codingLanguage);
  const lastResultRef = useRef<import('../coding/types').ExecutionResult | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Start battle music on mount
  useEffect(() => {
    audioManager.playMusic('battle');
  }, []);

  // Timer warning ref (effect placed after isCodingPhase/isActionPhase)
  const lastTimerWarnRef = useRef(-1);

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
      audioManager.playSFX('phaseTransition');
      setCodingSubPhase('P1_CHOOSING');
      setP1Result(null);
      setP1Difficulty(null);
      setP2Difficulty(null);
      coding.resetCoding();
    }
    if (gameState.phase === 'ACTION' && prevPhase.current !== 'ACTION') {
      audioManager.playSFX('phaseTransition');
      actionTimer.start();
      setTargetableIndices([]);
      setTargetCallback(null);
    }
    prevPhase.current = gameState.phase;
  }, [gameState.phase]);

  const prevActorRef = useRef(gameState.currentActorIndex);
  useEffect(() => {
    if (gameState.phase === 'ACTION' && gameState.currentActorIndex !== prevActorRef.current) {
      audioManager.playSFX('turnStart');
      actionTimer.start();
      setTargetableIndices([]);
      setTargetCallback(null);
    }
    prevActorRef.current = gameState.currentActorIndex;
  }, [gameState.currentActorIndex, gameState.phase]);

  const handleDifficultySelect = useCallback(async (difficulty: Difficulty) => {
    audioManager.playSFX('buttonClick');
    const seconds = CODING_SECONDS_BY_DIFFICULTY[difficulty] || CODING_PHASE_SECONDS;
    if (codingSubPhase === 'P1_CHOOSING') {
      setP1Difficulty(difficulty);
      setCodingSubPhase('P1_CODING');
      await coding.loadProblem(difficulty);
      setCodingTotalSeconds(seconds);
      codingTimer.startWith(seconds);
    } else if (codingSubPhase === 'P2_CHOOSING') {
      setP2Difficulty(difficulty);
      coding.resetCoding();
      // Flush the reset (problem=null) to the DOM before loading new problem
      // This ensures CodingEditor unmounts and remounts with fresh state
      await new Promise(r => setTimeout(r, 0));
      setCodingSubPhase('P2_CODING');
      await coding.loadProblem(difficulty);
      setCodingTotalSeconds(seconds);
      codingTimer.startWith(seconds);
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
    codingTimer.stop();
    const result = await coding.submitCode(code);
    if (result) {
      lastResultRef.current = result;
    }
    return result;
  }, [coding, codingTimer]);

  const handleCodingContinue = useCallback(() => {
    const result = lastResultRef.current;
    if (result) {
      handleCodingDone(result.passed, result.totalTests, result.passedTests);
      lastResultRef.current = null;
    }
  }, [handleCodingDone]);

  const handleCodingExplain = useCallback(async (code: string): Promise<string> => {
    if (!coding.problem || !lastResultRef.current) return 'No result to explain.';
    return explainIncorrect(code, coding.problem, codingLanguage, lastResultRef.current.results);
  }, [coding.problem, codingLanguage]);

  const handlePassReady = useCallback(() => {
    setCodingSubPhase('P2_CHOOSING');
  }, []);

  const handleAction = useCallback((action: Action) => {
    actionTimer.stop();

    // Determine VFX type based on action
    let effectType: VFXType = 'NONE';
    let effectTarget = -1;

    if (action.type === 'ATTACK') {
      effectType = 'ATTACK_SLASH';
      effectTarget = action.targetIndex ?? -1;
    } else if (action.type === 'SPELL' && action.spellIndex !== undefined) {
      const actorState = gameState.characters[action.actorIndex];
      const charDef = CHARACTER_DEFS[actorState.defId];
      const spell = charDef?.spells[action.spellIndex];
      if (spell) {
        effectType = getSpellVFXType('SPELL', spell.id);
        // For self-target or ally spells, VFX plays on appropriate target
        if (spell.targetType === 'SELF') {
          effectTarget = action.actorIndex;
        } else if (spell.targetType === 'BOTH_ENEMIES') {
          // Play on first enemy (we'll enhance later for both)
          effectTarget = action.targetIndex ?? getEnemies(gameState, action.actorIndex).filter(i => gameState.characters[i].isAlive)[0] ?? -1;
        } else {
          effectTarget = action.targetIndex ?? action.actorIndex;
        }
      }
    } else if (action.type === 'ITEM') {
      const actorState = gameState.characters[action.actorIndex];
      const charDef = CHARACTER_DEFS[actorState.defId];
      const item = action.itemIndex !== undefined ? charDef?.items[action.itemIndex] : undefined;
      if (item) {
        effectType = getSpellVFXType('SPELL', item.id);
        if (item.targetType === 'SELF' || item.targetType === 'BOTH_ALLIES') {
          effectTarget = action.actorIndex;
        } else {
          effectTarget = action.targetIndex ?? action.actorIndex;
        }
      }
    } else if (action.type === 'DEFEND') {
      effectType = 'SPELL_WHITE';
      effectTarget = action.actorIndex;
    }

    // Trigger attack animation on the actor
    const actorIdx = action.actorIndex;
    if (action.type === 'ATTACK' || action.type === 'SPELL') {
      // Play action SFX
      if (action.type === 'ATTACK') {
        audioManager.playSFX('attack');
      } else {
        audioManager.playSFX('spell');
      }
      setAttackingIndex(actorIdx);
      // Show VFX on target after lunge connects
      setTimeout(() => {
        setVfxTarget(effectTarget);
        setVfxType(effectType);
      }, 250);
      // Trigger hurt animation and damage SFX on target after a short delay
      if (action.targetIndex !== undefined && action.type !== 'DEFEND') {
        setTimeout(() => { setHurtIndex(action.targetIndex!); audioManager.playSFX('damage'); }, 300);
        setTimeout(() => setHurtIndex(-1), 800);
      }
      setTimeout(() => setAttackingIndex(-1), 600);
      setTimeout(() => { setVfxTarget(-1); setVfxType('NONE'); }, 900);
    } else {
      // For defend / item with no lunge
      if (action.type === 'DEFEND') {
        audioManager.playSFX('shield');
      } else if (action.type === 'ITEM') {
        // Check if item heals
        const actorState = gameState.characters[action.actorIndex];
        const charDef = CHARACTER_DEFS[actorState.defId];
        const item = action.itemIndex !== undefined ? charDef?.items[action.itemIndex] : undefined;
        if (item && item.healing && item.healing > 0) {
          audioManager.playSFX('heal');
        } else {
          audioManager.playSFX('spell');
        }
      }
      setVfxTarget(effectTarget);
      setVfxType(effectType);
      setTimeout(() => { setVfxTarget(-1); setVfxType('NONE'); }, 800);
    }

    submitAction(action);
    setTargetableIndices([]);
    setTargetCallback(null);
    setTimeout(() => advanceTurn(), 700);
  }, [submitAction, advanceTurn, actionTimer, gameState]);

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

  const handlePause = useCallback(() => {
    codingTimer.pause();
    actionTimer.pause();
    setIsPaused(true);
  }, [codingTimer, actionTimer]);

  const handleResume = useCallback(() => {
    setIsPaused(false);
    if (gameState.phase === 'CODING' && (codingSubPhase === 'P1_CODING' || codingSubPhase === 'P2_CODING')) {
      codingTimer.resume();
    } else if (gameState.phase === 'ACTION') {
      actionTimer.resume();
    }
  }, [codingTimer, actionTimer, codingSubPhase, gameState.phase]);

  const isCodingPhase = gameState.phase === 'CODING';
  const isActionPhase = gameState.phase === 'ACTION';

  // Timer warning sound when time is low
  useEffect(() => {
    const secondsLeft = isCodingPhase ? codingTimer.secondsLeft : actionTimer.secondsLeft;
    const isActive = isCodingPhase
      ? (codingSubPhase === 'P1_CODING' || codingSubPhase === 'P2_CODING')
      : isActionPhase;
    if (isActive && secondsLeft <= 10 && secondsLeft > 0 && secondsLeft !== lastTimerWarnRef.current) {
      audioManager.playSFX('timerWarning');
      lastTimerWarnRef.current = secondsLeft;
    }
  });

  return (
    <div style={{
      width: '100vw', height: '100vh', background: '#060d06',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Press Start 2P', monospace", color: '#fff', overflow: 'hidden',
    }}>
      {/* Pause Menu Overlay */}
      {isPaused && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(4, 8, 4, 0.9)', backdropFilter: 'blur(6px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000,
        }}>
          <div style={{
            fontSize: '28px', color: '#eeba30', marginBottom: 40,
            textShadow: '0 0 20px rgba(238, 186, 48, 0.5)',
            letterSpacing: '0.3em',
          }}>
            PAUSED
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <button
              className="pixel-button"
              onClick={handleResume}
              style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: '12px',
                padding: '14px 40px', background: '#eeba30', color: '#060d06',
                border: '3px solid #b8922a', cursor: 'pointer',
              }}
            >
              Resume
            </button>
            <button
              className="pixel-button"
              onClick={onQuit}
              style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: '12px',
                padding: '14px 40px', background: '#0d1a0d', color: '#e74c3c',
                border: '3px solid #e74c3c', cursor: 'pointer',
              }}
            >
              Quit Battle
            </button>
          </div>
        </div>
      )}

      {/* Phase Banner */}
      <div style={{
        textAlign: 'center', padding: '10px 0',
        position: 'relative',
        background: isCodingPhase
          ? 'linear-gradient(90deg, #0d1a0d 0%, #0d1a3e 50%, #0d1a0d 100%)'
          : 'linear-gradient(90deg, #0d1a0d 0%, #4e1a1a 50%, #0d1a0d 100%)',
        borderBottom: `2px solid ${isCodingPhase ? '#3498db' : '#ae0001'}`,
      }}>
        {/* Pause Button */}
        <button
          onClick={handlePause}
          style={{
            position: 'absolute', top: 8, left: 10, zIndex: 10,
            fontFamily: "'Press Start 2P', monospace", fontSize: '10px',
            padding: '6px 10px', background: '#0d1a0d', color: '#eeba30',
            border: '2px solid #1a3a1a', cursor: 'pointer',
          }}
        >
          II
        </button>
        <span style={{ fontSize: '14px', color: isCodingPhase ? '#3498db' : '#ae0001', letterSpacing: '0.2em' }}>
          {isCodingPhase ? 'CODING PHASE' : 'ACTION PHASE'}
        </span>
        <span style={{ fontSize: '9px', color: '#888', marginLeft: 16 }}>
          Turn {gameState.turnNumber}
        </span>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
          {isCodingPhase && (codingSubPhase === 'P1_CODING' || codingSubPhase === 'P2_CODING') && (
            <TimerDisplay secondsLeft={codingTimer.secondsLeft} totalSeconds={codingTotalSeconds} />
          )}
          {isActionPhase && (
            <TimerDisplay secondsLeft={actionTimer.secondsLeft} totalSeconds={ACTION_TURN_SECONDS} />
          )}
        </div>
      </div>

      {/* Battlefield */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <BattleField
          gameState={gameState}
          targetableIndices={targetableIndices}
          onSelectTarget={handleTargetClick}
          attackingIndex={attackingIndex}
          hurtIndex={hurtIndex}
          vfxTarget={vfxTarget}
          vfxType={vfxType}
        />
      </div>

      {/* Lower Panel */}
      <div style={{ height: '40vh', borderTop: '2px solid #1a3a1a', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* CODING PHASE */}
        {isCodingPhase && codingSubPhase !== 'CODING_DONE' && (
          <div style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
            {codingSubPhase === 'PASS_SCREEN' && (
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: '#060d06cc', backdropFilter: 'blur(4px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100,
              }}>
                <p style={{ fontSize: '10px', color: '#9a6abf', marginBottom: 16 }}>Pass the screen to</p>
                <p style={{ fontSize: '18px', color: '#eeba30', marginBottom: 24 }}>{gameState.players[1].name}</p>
                <button className="pixel-button" onClick={handlePassReady} style={{
                  fontFamily: "'Press Start 2P', monospace", fontSize: '10px',
                  padding: '12px 32px', background: '#eeba30', color: '#060d06',
                  border: '3px solid #b8922a', cursor: 'pointer',
                }}>I'm Ready</button>
              </div>
            )}

            {(codingSubPhase === 'P1_CHOOSING' || codingSubPhase === 'P2_CHOOSING') && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 24 }}>
                <p style={{ fontSize: '10px', color: '#9a6abf' }}>
                  <span style={{ color: codingSubPhase === 'P1_CHOOSING' ? '#eeba30' : '#c0c0c0' }}>
                    {codingSubPhase === 'P1_CHOOSING' ? gameState.players[0].name : gameState.players[1].name}
                  </span>
                  {' '}&mdash; Choose coding difficulty
                </p>
                <div style={{ display: 'flex', gap: 16 }}>
                  <button className="pixel-button" onClick={() => handleDifficultySelect('EASY')} style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: '10px',
                    padding: '12px 24px', background: '#0d1a0d', color: '#44cc44',
                    border: '3px solid #44cc44', cursor: 'pointer',
                  }}>EASY (+3 mana)</button>
                  <button className="pixel-button" onClick={() => handleDifficultySelect('MEDIUM')} style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: '10px',
                    padding: '12px 24px', background: '#0d1a0d', color: '#ccaa44',
                    border: '3px solid #ccaa44', cursor: 'pointer',
                  }}>MEDIUM (+4 mana)</button>
                  <button className="pixel-button" onClick={() => handleDifficultySelect('HARD')} style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: '10px',
                    padding: '12px 24px', background: '#0d1a0d', color: '#cc4444',
                    border: '3px solid #cc4444', cursor: 'pointer',
                  }}>HARD (+5 mana, 3min)</button>
                </div>
              </div>
            )}

            {(codingSubPhase === 'P1_CODING' || codingSubPhase === 'P2_CODING') && coding.problem && (
              <div style={{ padding: 12, height: '100%' }}>
                <CodingEditor key={`${codingSubPhase}_${coding.problem.id}`} problem={coding.problem} onSubmit={handleCodingSubmit} onContinue={handleCodingContinue} onExplain={handleCodingExplain} disabled={false} language={codingLanguage} />
              </div>
            )}

            {(codingSubPhase === 'P1_CODING' || codingSubPhase === 'P2_CODING') && coding.isLoading && (
              <div style={{ textAlign: 'center', padding: 40, color: '#3498db', fontSize: '10px' }}>
                Loading coding challenge...
              </div>
            )}

            {(codingSubPhase === 'P1_CODING' || codingSubPhase === 'P2_CODING') && !coding.isLoading && !coding.problem && coding.error && (
              <div style={{ textAlign: 'center', padding: 40, color: '#e74c3c', fontSize: '10px' }}>
                Error: {coding.error}
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
