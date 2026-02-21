import { GameState, CodingResult } from './types';
import { EASY_MANA_REWARD, HARD_MANA_REWARD, MAX_MANA } from './constants';
import { cloneState, getLivingChars, isTeamDefeated } from './gameState';
import { tickStatusEffects } from './statusEffects';

export function startBattle(state: GameState): GameState {
  return { ...state, phase: 'CODING', turnNumber: 1 };
}

export function endCodingPhase(
  state: GameState,
  results: [CodingResult | null, CodingResult | null]
): GameState {
  const newState = cloneState(state);
  newState.codingResults = results;

  // Award mana for each player
  for (let p = 0; p < 2; p++) {
    const result = results[p as 0 | 1];
    if (result && result.passed) {
      const reward = result.difficulty === 'EASY' ? EASY_MANA_REWARD : HARD_MANA_REWARD;
      const livingChars = getLivingChars(newState, p as 0 | 1);
      for (const charIdx of livingChars) {
        newState.characters[charIdx].mana = Math.min(
          MAX_MANA,
          newState.characters[charIdx].mana + reward
        );
      }
    }
  }

  // Transition to ACTION phase
  newState.phase = 'ACTION';
  newState.currentActorIndex = 0;

  // Skip dead characters at start
  while (
    newState.currentActorIndex < newState.actionQueue.length &&
    !newState.characters[newState.actionQueue[newState.currentActorIndex]].isAlive
  ) {
    newState.currentActorIndex++;
  }

  return newState;
}

export function advanceTurn(state: GameState): GameState {
  const newState = cloneState(state);

  // Tick status effects for the character that just acted
  const currentCharIdx = newState.actionQueue[newState.currentActorIndex];
  if (currentCharIdx !== undefined && newState.characters[currentCharIdx].isAlive) {
    const tickResult = tickStatusEffects(newState.characters[currentCharIdx]);
    newState.characters[currentCharIdx] = tickResult.char;
    if (tickResult.log.length > 0) {
      // Add status effect tick logs to the action log
      for (const logMsg of tickResult.log) {
        newState.actionLog.push({
          turn: newState.turnNumber,
          actorIndex: currentCharIdx,
          action: 'DO_NOTHING',
          detail: `${logMsg}`,
          timestamp: Date.now(),
        });
      }
    }
  }

  // Check win condition
  const winner = checkWinCondition(newState);
  if (winner !== null) {
    newState.winner = winner;
    newState.phase = 'FINISHED';
    return newState;
  }

  // Move to next character
  newState.currentActorIndex++;

  // Skip dead characters
  while (
    newState.currentActorIndex < newState.actionQueue.length &&
    !newState.characters[newState.actionQueue[newState.currentActorIndex]].isAlive
  ) {
    newState.currentActorIndex++;
  }

  // If all characters have acted, start new turn
  if (newState.currentActorIndex >= newState.actionQueue.length) {
    newState.turnNumber++;
    newState.currentActorIndex = 0;
    newState.phase = 'CODING';
    newState.codingResults = [null, null];
  }

  return newState;
}

export function checkWinCondition(state: GameState): 0 | 1 | null {
  const team0Dead = isTeamDefeated(state, 0);
  const team1Dead = isTeamDefeated(state, 1);

  if (team0Dead && team1Dead) return 1; // If both die simultaneously, player 2 wins (edge case)
  if (team0Dead) return 1;
  if (team1Dead) return 0;
  return null;
}

export function getCurrentActorIndex(state: GameState): number {
  return state.actionQueue[state.currentActorIndex];
}
