import { CharacterState, StatusEffect, StatusEffectType } from './types';

export function hasStatus(char: CharacterState, type: StatusEffectType): boolean {
  return char.statusEffects.some(e => e.type === type);
}

export function getStatus(char: CharacterState, type: StatusEffectType): StatusEffect | undefined {
  return char.statusEffects.find(e => e.type === type);
}

export function applyStatus(char: CharacterState, effect: StatusEffect): CharacterState {
  // Add the status effect. If the same type already exists, replace it.
  const filtered = char.statusEffects.filter(e => e.type !== effect.type);
  return { ...char, statusEffects: [...filtered, effect] };
}

export function consumeStatus(char: CharacterState, type: StatusEffectType): CharacterState {
  // Remove one instance of the status effect (consumed on trigger)
  return { ...char, statusEffects: char.statusEffects.filter(e => e.type !== type) };
}

export function tickStatusEffects(char: CharacterState): { char: CharacterState; damage: number; log: string[] } {
  // At end of a character's turn, tick poison/bleed
  let totalDamage = 0;
  const logs: string[] = [];
  let newEffects = [...char.statusEffects];

  for (let i = newEffects.length - 1; i >= 0; i--) {
    const effect = newEffects[i];
    if (effect.type === 'POISON' || effect.type === 'BLEED') {
      totalDamage += effect.value;
      logs.push(`takes ${effect.value} ${effect.type.toLowerCase()} damage`);
      if (effect.remainingTurns <= 1) {
        newEffects.splice(i, 1);
      } else {
        newEffects[i] = { ...effect, remainingTurns: effect.remainingTurns - 1 };
      }
    }
    // STUNNED is consumed when the turn is skipped, handled in turn manager
  }

  const newHp = Math.max(0, char.hp - totalDamage);
  return {
    char: { ...char, hp: newHp, statusEffects: newEffects, isAlive: newHp > 0 },
    damage: totalDamage,
    log: logs,
  };
}

export function cleanExpiredEffects(char: CharacterState): CharacterState {
  const newEffects = char.statusEffects.filter(e => e.remainingTurns !== 0);
  return { ...char, statusEffects: newEffects };
}
