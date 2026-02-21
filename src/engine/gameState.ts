import { GameState, CharacterState, CharacterDef, PlayerState } from './types';
import { CHARACTER_DEFS } from './characters';
import { BASE_HP, STARTING_MANA } from './constants';

export function createCharacterState(defId: string, owner: 0 | 1): CharacterState {
  return {
    defId,
    owner,
    hp: BASE_HP,
    mana: STARTING_MANA,
    statusEffects: [],
    itemsUsed: [false, false],
    isAlive: true,
  };
}

export function createInitialState(
  player1Name: string,
  player2Name: string,
  p1Chars: [string, string],
  p2Chars: [string, string]
): GameState {
  const characters: CharacterState[] = [
    createCharacterState(p1Chars[0], 0),
    createCharacterState(p1Chars[1], 0),
    createCharacterState(p2Chars[0], 1),
    createCharacterState(p2Chars[1], 1),
  ];

  return {
    phase: 'CODING',
    turnNumber: 1,
    players: [
      { name: player1Name, characters: [0, 1] },
      { name: player2Name, characters: [2, 3] },
    ],
    characters,
    actionQueue: [0, 2, 1, 3], // P1-A, P2-A, P1-B, P2-B interleaved
    currentActorIndex: 0,
    codingResults: [null, null],
    actionLog: [],
    winner: null,
  };
}

export function getCharDef(charState: CharacterState): CharacterDef {
  return CHARACTER_DEFS[charState.defId];
}

export function getOwner(state: GameState, charIndex: number): 0 | 1 {
  return state.characters[charIndex].owner;
}

export function getLivingChars(state: GameState, player: 0 | 1): number[] {
  return state.characters
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => c.owner === player && c.isAlive)
    .map(({ i }) => i);
}

export function isTeamDefeated(state: GameState, player: 0 | 1): boolean {
  return getLivingChars(state, player).length === 0;
}

export function cloneState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state));
}

export function getTeammates(state: GameState, charIndex: number): number[] {
  const owner = state.characters[charIndex].owner;
  return state.characters
    .map((c, i) => ({ c, i }))
    .filter(({ c, i }) => c.owner === owner && i !== charIndex)
    .map(({ i }) => i);
}

export function getEnemies(state: GameState, charIndex: number): number[] {
  const owner = state.characters[charIndex].owner;
  return state.characters
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => c.owner !== owner)
    .map(({ i }) => i);
}

export function getAllies(state: GameState, charIndex: number): number[] {
  const owner = state.characters[charIndex].owner;
  return state.characters
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => c.owner === owner)
    .map(({ i }) => i);
}
