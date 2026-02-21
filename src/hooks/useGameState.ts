import { useReducer, useCallback } from 'react';
import {
  GameState,
  Action,
  CodingResult,
} from '../engine/types';
import {
  createInitialState,
} from '../engine/gameState';
import { resolveAction } from '../engine/combatEngine';
import { endCodingPhase, advanceTurn } from '../engine/turnManager';

type GameAction =
  | { type: 'INIT'; p1Name: string; p2Name: string; p1Chars: [string, string]; p2Chars: [string, string] }
  | { type: 'END_CODING'; results: [CodingResult | null, CodingResult | null] }
  | { type: 'SUBMIT_ACTION'; action: Action }
  | { type: 'ADVANCE_TURN' };

function gameReducer(state: GameState | null, gameAction: GameAction): GameState | null {
  switch (gameAction.type) {
    case 'INIT':
      return createInitialState(
        gameAction.p1Name,
        gameAction.p2Name,
        gameAction.p1Chars,
        gameAction.p2Chars
      );
    case 'END_CODING': {
      if (!state) return null;
      return endCodingPhase(state, gameAction.results);
    }
    case 'SUBMIT_ACTION': {
      if (!state) return null;
      const result = resolveAction(state, gameAction.action);
      const newState = result.state;
      newState.actionLog = [...newState.actionLog, result.log];
      return newState;
    }
    case 'ADVANCE_TURN': {
      if (!state) return null;
      return advanceTurn(state);
    }
    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, null);

  const initGame = useCallback((p1Name: string, p2Name: string, p1Chars: [string, string], p2Chars: [string, string]) => {
    dispatch({ type: 'INIT', p1Name, p2Name, p1Chars, p2Chars });
  }, []);

  const endCoding = useCallback((results: [CodingResult | null, CodingResult | null]) => {
    dispatch({ type: 'END_CODING', results });
  }, []);

  const submitAction = useCallback((action: Action) => {
    dispatch({ type: 'SUBMIT_ACTION', action });
  }, []);

  const advanceTurnAction = useCallback(() => {
    dispatch({ type: 'ADVANCE_TURN' });
  }, []);

  return { state, initGame, endCoding, submitAction, advanceTurn: advanceTurnAction };
}
