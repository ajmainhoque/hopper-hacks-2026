export type StatusEffectType =
  | 'DEFENDING'
  | 'DODGE_NEXT'
  | 'STUNNED'
  | 'POISON'
  | 'BLEED'
  | 'SHIELD_SPELL'
  | 'WEAKENED';

export type ActionType = 'ATTACK' | 'SPELL' | 'ITEM' | 'DEFEND' | 'DO_NOTHING';
export type Phase = 'CHARACTER_SELECT' | 'CODING' | 'ACTION' | 'FINISHED';
export type TargetType = 'ENEMY_SINGLE' | 'ALLY_SINGLE' | 'ENEMY_ALL' | 'ALLY_ALL' | 'SELF' | 'BOTH_ALLIES' | 'BOTH_ENEMIES';
export type Difficulty = 'EASY' | 'HARD';

export interface Spell {
  id: string;
  name: string;
  manaCost: number;
  damage: number;
  healing: number;
  targetType: TargetType;
  statusEffect?: StatusEffectType;
  statusDuration?: number;
  statusValue?: number;
  special?: string;
  description: string;
}

export interface Item {
  id: string;
  name: string;
  targetType: TargetType;
  effect: ItemEffect;
  description: string;
}

export interface ItemEffect {
  healing?: number;
  manaGain?: number;
  manaLoss?: number;
  applyStatus?: StatusEffectType;
  special?: string;
}

export interface CharacterDef {
  id: string;
  name: string;
  role: string;
  spells: [Spell, Spell, Spell, Spell];
  items: [Item, Item];
  cssColor: string;
  initial: string;
}

export interface StatusEffect {
  type: StatusEffectType;
  remainingTurns: number;
  value: number;
}

export interface CharacterState {
  defId: string;
  owner: 0 | 1;
  hp: number;
  mana: number;
  statusEffects: StatusEffect[];
  itemsUsed: [boolean, boolean];
  isAlive: boolean;
  avadaUsed?: boolean;
  horcruxUsed?: boolean;
  freeNextSpell?: boolean;
  nextSpellBonus?: number;
  nextAttackBonus?: number;
}

export interface PlayerState {
  name: string;
  characters: [number, number];
}

export interface CodingResult {
  difficulty: Difficulty;
  passed: boolean;
  testsTotal: number;
  testsPassed: number;
}

export interface LogEntry {
  turn: number;
  actorIndex: number;
  action: ActionType;
  detail: string;
  timestamp: number;
}

export interface GameState {
  phase: Phase;
  turnNumber: number;
  players: [PlayerState, PlayerState];
  characters: CharacterState[];
  actionQueue: number[];
  currentActorIndex: number;
  codingResults: [CodingResult | null, CodingResult | null];
  actionLog: LogEntry[];
  winner: 0 | 1 | null;
}

export interface Action {
  type: ActionType;
  actorIndex: number;
  targetIndex?: number;
  spellIndex?: number;
  itemIndex?: number;
}
