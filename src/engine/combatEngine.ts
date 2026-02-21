import { GameState, Action, LogEntry, CharacterState, Spell, Item } from './types';
import { CHARACTER_DEFS } from './characters';
import { BASE_ATTACK_DAMAGE, ATTACK_MANA_GAIN, DEFEND_MANA_GAIN, MAX_MANA, BASE_HP } from './constants';
import { hasStatus, consumeStatus, applyStatus, getStatus } from './statusEffects';
import { cloneState, getCharDef, getEnemies, getAllies } from './gameState';

function clampHp(hp: number): number {
  return Math.max(0, Math.min(BASE_HP, hp));
}

function clampMana(mana: number): number {
  return Math.max(0, Math.min(MAX_MANA, mana));
}

function checkHorcrux(char: CharacterState): { char: CharacterState; triggered: boolean } {
  if (char.hp <= 0 && !char.horcruxUsed && char.defId === 'voldemort') {
    // Check if horcrux item was pre-activated (item used to set the passive)
    // Horcrux is a passive effect - it triggers automatically if the item was used
    if (char.itemsUsed[0]) { // Horcrux Fragment is item index 0 for Voldemort
      return {
        char: { ...char, hp: 20, isAlive: true, horcruxUsed: true },
        triggered: true,
      };
    }
  }
  return { char, triggered: false };
}

function applyDamageToTarget(
  state: GameState,
  targetIdx: number,
  rawDamage: number,
  isSpell: boolean
): { state: GameState; actualDamage: number; dodged: boolean; log: string[] } {
  let newState = cloneState(state);
  let target = newState.characters[targetIdx];
  const logs: string[] = [];

  if (!target.isAlive) {
    return { state: newState, actualDamage: 0, dodged: false, log: [] };
  }

  // Check DODGE_NEXT
  if (hasStatus(target, 'DODGE_NEXT')) {
    target = consumeStatus(target, 'DODGE_NEXT');
    newState.characters[targetIdx] = target;
    logs.push('dodged the attack!');
    return { state: newState, actualDamage: 0, dodged: true, log: logs };
  }

  let damage = rawDamage;

  // Check SHIELD_SPELL for spell damage
  if (isSpell && hasStatus(target, 'SHIELD_SPELL')) {
    const shield = getStatus(target, 'SHIELD_SPELL');
    if (shield) {
      const reduction = shield.value / 100;
      damage = Math.floor(damage * (1 - reduction));
      target = consumeStatus(target, 'SHIELD_SPELL');
      logs.push(`shield absorbed ${Math.floor(rawDamage * reduction)} spell damage`);
    }
  }

  // Check DEFENDING for attack damage
  if (!isSpell && hasStatus(target, 'DEFENDING')) {
    const defending = getStatus(target, 'DEFENDING');
    if (defending) {
      const reduction = defending.value / 100;
      damage = Math.floor(damage * (1 - reduction));
      target = consumeStatus(target, 'DEFENDING');
      logs.push(`defended, reducing damage by ${defending.value}%`);
    }
  }

  // Check DEFENDING for spell damage as well (Protego reduces all incoming)
  if (isSpell && hasStatus(target, 'DEFENDING')) {
    const defending = getStatus(target, 'DEFENDING');
    if (defending) {
      const reduction = defending.value / 100;
      damage = Math.floor(damage * (1 - reduction));
      target = consumeStatus(target, 'DEFENDING');
      logs.push(`defended, reducing damage by ${defending.value}%`);
    }
  }

  target.hp = clampHp(target.hp - damage);
  target.isAlive = target.hp > 0;

  // Check Horcrux
  const horcruxResult = checkHorcrux(target);
  if (horcruxResult.triggered) {
    target = horcruxResult.char;
    logs.push('Horcrux Fragment activated! Survived with 20 HP!');
  }

  newState.characters[targetIdx] = target;
  return { state: newState, actualDamage: damage, dodged: false, log: logs };
}

function resolveAttack(state: GameState, actorIdx: number, targetIdx: number): { state: GameState; log: string } {
  let newState = cloneState(state);
  const actor = newState.characters[actorIdx];
  const actorDef = getCharDef(actor);
  const targetDef = getCharDef(newState.characters[targetIdx]);

  // Check WEAKENED on attacker (Expelliarmus effect)
  let damage = BASE_ATTACK_DAMAGE;
  if (hasStatus(actor, 'WEAKENED')) {
    damage = Math.floor(damage * 0.5);
    newState.characters[actorIdx] = consumeStatus(newState.characters[actorIdx], 'WEAKENED');
  }

  // Check next attack bonus (Leprechaun Luck)
  if (actor.nextAttackBonus) {
    damage += actor.nextAttackBonus;
    newState.characters[actorIdx] = { ...newState.characters[actorIdx], nextAttackBonus: undefined };
  }

  const result = applyDamageToTarget(newState, targetIdx, damage, false);
  newState = result.state;

  // Grant mana
  newState.characters[actorIdx].mana = clampMana(newState.characters[actorIdx].mana + ATTACK_MANA_GAIN);

  const logParts = [`${actorDef.name} attacks ${targetDef.name}`];
  if (result.dodged) {
    logParts.push('but it was dodged!');
  } else {
    logParts.push(`for ${result.actualDamage} damage`);
  }
  logParts.push(...result.log);

  return { state: newState, log: logParts.join(' ') };
}

function resolveSpell(state: GameState, actorIdx: number, spellIdx: number, targetIdx?: number): { state: GameState; log: string } {
  let newState = cloneState(state);
  let actor = newState.characters[actorIdx];
  const actorDef = getCharDef(actor);
  const spell = actorDef.spells[spellIdx];

  // Check mana
  let manaCost = spell.manaCost;
  if (actor.freeNextSpell) {
    manaCost = 0;
    newState.characters[actorIdx] = { ...newState.characters[actorIdx], freeNextSpell: false };
  }

  if (actor.mana < manaCost) {
    return { state: newState, log: `${actorDef.name} doesn't have enough mana for ${spell.name}!` };
  }

  // Check Avada Kedavra once-per-game
  if (spell.special === 'once_per_game' && actor.avadaUsed) {
    return { state: newState, log: `${actorDef.name} has already used ${spell.name}!` };
  }

  // Deduct mana
  newState.characters[actorIdx].mana = clampMana(newState.characters[actorIdx].mana - manaCost);

  // Mark Avada Kedavra as used
  if (spell.special === 'once_per_game') {
    newState.characters[actorIdx].avadaUsed = true;
  }

  // Calculate damage with bonus
  let bonusDamage = 0;
  if (actor.nextSpellBonus && spell.damage > 0) {
    bonusDamage = actor.nextSpellBonus;
    newState.characters[actorIdx] = { ...newState.characters[actorIdx], nextSpellBonus: undefined };
  }

  const totalDamage = spell.damage + bonusDamage;
  const logParts: string[] = [`${actorDef.name} casts ${spell.name}!`];

  // Resolve damage targets
  if (totalDamage > 0) {
    if (spell.targetType === 'BOTH_ENEMIES') {
      const enemies = getEnemies(newState, actorIdx);
      for (const enemyIdx of enemies) {
        if (newState.characters[enemyIdx].isAlive) {
          const result = applyDamageToTarget(newState, enemyIdx, totalDamage, true);
          newState = result.state;
          const enemyDef = getCharDef(newState.characters[enemyIdx]);
          if (result.dodged) {
            logParts.push(`${enemyDef.name} dodged!`);
          } else {
            logParts.push(`${enemyDef.name} takes ${result.actualDamage} damage.`);
          }
          logParts.push(...result.log);
        }
      }
    } else if (spell.targetType === 'ENEMY_SINGLE' && targetIdx !== undefined) {
      const result = applyDamageToTarget(newState, targetIdx, totalDamage, true);
      newState = result.state;
      const targetDef = getCharDef(newState.characters[targetIdx]);
      if (result.dodged) {
        logParts.push(`${targetDef.name} dodged!`);
      } else {
        logParts.push(`${targetDef.name} takes ${result.actualDamage} damage.`);
      }
      logParts.push(...result.log);
    }
  }

  // Resolve healing
  if (spell.healing > 0) {
    if (spell.targetType === 'ALLY_SINGLE' && targetIdx !== undefined) {
      const target = newState.characters[targetIdx];
      if (target.isAlive) {
        newState.characters[targetIdx].hp = clampHp(target.hp + spell.healing);
        const targetDef = getCharDef(target);
        logParts.push(`${targetDef.name} healed for ${spell.healing} HP.`);
      }
    } else if (spell.targetType === 'SELF') {
      newState.characters[actorIdx].hp = clampHp(newState.characters[actorIdx].hp + spell.healing);
      logParts.push(`${actorDef.name} healed for ${spell.healing} HP.`);
    }
  }

  // Apply status effects to target
  if (spell.statusEffect && targetIdx !== undefined) {
    newState.characters[targetIdx] = applyStatus(newState.characters[targetIdx], {
      type: spell.statusEffect,
      remainingTurns: spell.statusDuration ?? -1,
      value: spell.statusValue ?? 0,
    });
    logParts.push(`${getCharDef(newState.characters[targetIdx]).name} is now ${spell.statusEffect}!`);
  }

  // Handle special effects
  if (spell.special === 'weaken_attack' && targetIdx !== undefined) {
    // Status already applied via statusEffect field above for Expelliarmus
    // Only add log if not already applied via statusEffect
    if (!spell.statusEffect) {
      newState.characters[targetIdx] = applyStatus(newState.characters[targetIdx], {
        type: 'WEAKENED',
        remainingTurns: -1,
        value: 50,
      });
      logParts.push(`${getCharDef(newState.characters[targetIdx]).name}'s next attack is weakened!`);
    }
  }

  if (spell.special === 'self_dodge') {
    newState.characters[actorIdx] = applyStatus(newState.characters[actorIdx], {
      type: 'DODGE_NEXT',
      remainingTurns: -1,
      value: 0,
    });
    logParts.push(`${actorDef.name} gains Dodge!`);
  }

  if (spell.special === 'free_next_spell') {
    newState.characters[actorIdx].freeNextSpell = true;
    logParts.push(`${actorDef.name}'s next spell will cost 0 mana!`);
  }

  if (spell.special === 'next_spell_plus_10') {
    newState.characters[actorIdx].nextSpellBonus = 10;
    logParts.push(`${actorDef.name}'s next spell will deal +10 damage!`);
  }

  if (spell.special === 'next_attack_plus_10') {
    newState.characters[actorIdx].nextAttackBonus = 10;
    logParts.push(`${actorDef.name}'s next attack will deal +10 damage!`);
  }

  if (spell.special === 'bonus_if_target_attacks' && targetIdx !== undefined) {
    // Crucio conditional: if target attacks next turn, they take 8 bonus damage.
    // We track this via BLEED with 1 turn duration, value = statusValue (8).
    // The extra damage triggers when checked in resolveAttack or at turn tick.
    newState.characters[targetIdx] = applyStatus(newState.characters[targetIdx], {
      type: 'BLEED',
      remainingTurns: 1,
      value: spell.statusValue ?? 8,
    });
    logParts.push(`If ${getCharDef(newState.characters[targetIdx]).name} attacks next turn, they'll take ${spell.statusValue ?? 8} bonus damage!`);
  }

  if (spell.special === 'shield_spell_both') {
    const allies = getAllies(newState, actorIdx);
    for (const allyIdx of allies) {
      if (newState.characters[allyIdx].isAlive) {
        newState.characters[allyIdx] = applyStatus(newState.characters[allyIdx], {
          type: 'SHIELD_SPELL',
          remainingTurns: -1,
          value: 50,
        });
      }
    }
    logParts.push('Both allies gain Shield Spell!');
  }

  // Protego special - apply DEFENDING with value 75% to self
  if (spell.name === 'Protego') {
    newState.characters[actorIdx] = applyStatus(newState.characters[actorIdx], {
      type: 'DEFENDING',
      remainingTurns: -1,
      value: 75,
    });
    logParts.push(`${actorDef.name} raises a powerful shield!`);
  }

  return { state: newState, log: logParts.join(' ') };
}

function resolveItem(state: GameState, actorIdx: number, itemIdx: number, targetIdx?: number): { state: GameState; log: string } {
  let newState = cloneState(state);
  const actor = newState.characters[actorIdx];
  const actorDef = getCharDef(actor);
  const item = actorDef.items[itemIdx];

  // Check if already used
  if (actor.itemsUsed[itemIdx]) {
    return { state: newState, log: `${actorDef.name} has already used ${item.name}!` };
  }

  // Mark used
  const newItemsUsed: [boolean, boolean] = [...actor.itemsUsed];
  newItemsUsed[itemIdx] = true;
  newState.characters[actorIdx] = { ...newState.characters[actorIdx], itemsUsed: newItemsUsed };

  const logParts: string[] = [`${actorDef.name} uses ${item.name}!`];
  const effect = item.effect;

  // Healing
  if (effect.healing) {
    if (item.targetType === 'SELF') {
      newState.characters[actorIdx].hp = clampHp(newState.characters[actorIdx].hp + effect.healing);
      logParts.push(`Healed for ${effect.healing} HP.`);
    } else if (item.targetType === 'ALLY_SINGLE' && targetIdx !== undefined) {
      newState.characters[targetIdx].hp = clampHp(newState.characters[targetIdx].hp + effect.healing);
      logParts.push(`${getCharDef(newState.characters[targetIdx]).name} healed for ${effect.healing} HP.`);
    } else if (item.targetType === 'BOTH_ALLIES') {
      const allies = getAllies(newState, actorIdx);
      for (const allyIdx of allies) {
        if (newState.characters[allyIdx].isAlive) {
          newState.characters[allyIdx].hp = clampHp(newState.characters[allyIdx].hp + effect.healing);
        }
      }
      logParts.push(`Both allies healed for ${effect.healing} HP.`);
    }
  }

  // Mana gain
  if (effect.manaGain) {
    if (item.targetType === 'SELF') {
      newState.characters[actorIdx].mana = clampMana(newState.characters[actorIdx].mana + effect.manaGain);
      logParts.push(`Gained ${effect.manaGain} mana.`);
    } else if (item.targetType === 'BOTH_ALLIES') {
      const allies = getAllies(newState, actorIdx);
      for (const allyIdx of allies) {
        if (newState.characters[allyIdx].isAlive) {
          newState.characters[allyIdx].mana = clampMana(newState.characters[allyIdx].mana + effect.manaGain);
        }
      }
      logParts.push(`Both allies gain ${effect.manaGain} mana.`);
    }
  }

  // Mana loss
  if (effect.manaLoss) {
    if (item.targetType === 'ENEMY_SINGLE' && targetIdx !== undefined) {
      newState.characters[targetIdx].mana = clampMana(newState.characters[targetIdx].mana - effect.manaLoss);
      logParts.push(`${getCharDef(newState.characters[targetIdx]).name} loses ${effect.manaLoss} mana.`);
    } else if (item.targetType === 'BOTH_ENEMIES') {
      const enemies = getEnemies(newState, actorIdx);
      for (const enemyIdx of enemies) {
        if (newState.characters[enemyIdx].isAlive) {
          newState.characters[enemyIdx].mana = clampMana(newState.characters[enemyIdx].mana - effect.manaLoss);
        }
      }
      logParts.push(`Both enemies lose ${effect.manaLoss} mana.`);
    }
  }

  // Apply status
  if (effect.applyStatus) {
    if (item.targetType === 'SELF') {
      newState.characters[actorIdx] = applyStatus(newState.characters[actorIdx], {
        type: effect.applyStatus,
        remainingTurns: -1,
        value: effect.applyStatus === 'DEFENDING' ? 50 : 0,
      });
      logParts.push(`${actorDef.name} gains ${effect.applyStatus}!`);
    }
  }

  // Special effects
  if (effect.special === 'survive_fatal_20hp') {
    // Horcrux is a passive effect - just mark the item as used
    // The actual check happens in applyDamageToTarget via checkHorcrux
    logParts.push('Horcrux Fragment is now active. Will survive one fatal blow with 20 HP.');
  }

  if (effect.special === 'grant_defend_both') {
    const allies = getAllies(newState, actorIdx);
    for (const allyIdx of allies) {
      if (newState.characters[allyIdx].isAlive) {
        newState.characters[allyIdx] = applyStatus(newState.characters[allyIdx], {
          type: 'DEFENDING',
          remainingTurns: -1,
          value: 50,
        });
      }
    }
    logParts.push('Both allies gain Defend!');
  }

  if (effect.special === 'also_shield_spell') {
    // Dragon Hide Coat: also apply shield spell
    newState.characters[actorIdx] = applyStatus(newState.characters[actorIdx], {
      type: 'SHIELD_SPELL',
      remainingTurns: -1,
      value: 50,
    });
    logParts.push(`${actorDef.name} also gains Shield Spell!`);
  }

  return { state: newState, log: logParts.join(' ') };
}

function resolveDefend(state: GameState, actorIdx: number): { state: GameState; log: string } {
  let newState = cloneState(state);
  const actorDef = getCharDef(newState.characters[actorIdx]);

  newState.characters[actorIdx] = applyStatus(newState.characters[actorIdx], {
    type: 'DEFENDING',
    remainingTurns: -1,
    value: 50,
  });
  newState.characters[actorIdx].mana = clampMana(newState.characters[actorIdx].mana + DEFEND_MANA_GAIN);

  return {
    state: newState,
    log: `${actorDef.name} defends! (+1 mana)`,
  };
}

export function resolveAction(state: GameState, action: Action): { state: GameState; log: LogEntry } {
  let newState = cloneState(state);
  const actor = newState.characters[action.actorIndex];

  // Check if stunned
  if (hasStatus(actor, 'STUNNED')) {
    newState.characters[action.actorIndex] = consumeStatus(actor, 'STUNNED');
    const actorDef = getCharDef(actor);
    return {
      state: newState,
      log: {
        turn: state.turnNumber,
        actorIndex: action.actorIndex,
        action: action.type,
        detail: `${actorDef.name} is stunned and can't act!`,
        timestamp: Date.now(),
      },
    };
  }

  // Check if alive
  if (!actor.isAlive) {
    return {
      state: newState,
      log: {
        turn: state.turnNumber,
        actorIndex: action.actorIndex,
        action: action.type,
        detail: `Character is defeated.`,
        timestamp: Date.now(),
      },
    };
  }

  let result: { state: GameState; log: string };

  switch (action.type) {
    case 'ATTACK':
      result = resolveAttack(newState, action.actorIndex, action.targetIndex!);
      break;
    case 'SPELL':
      result = resolveSpell(newState, action.actorIndex, action.spellIndex!, action.targetIndex);
      break;
    case 'ITEM':
      result = resolveItem(newState, action.actorIndex, action.itemIndex!, action.targetIndex);
      break;
    case 'DEFEND':
      result = resolveDefend(newState, action.actorIndex);
      break;
    case 'DO_NOTHING':
    default:
      result = {
        state: newState,
        log: `${getCharDef(actor).name} does nothing.`,
      };
      break;
  }

  return {
    state: result.state,
    log: {
      turn: state.turnNumber,
      actorIndex: action.actorIndex,
      action: action.type,
      detail: result.log,
      timestamp: Date.now(),
    },
  };
}
