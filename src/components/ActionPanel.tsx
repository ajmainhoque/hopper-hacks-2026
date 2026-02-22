import { useState } from 'react';
import { GameState, Action } from '../engine/types';
import { getCharDef } from '../engine/gameState';
import { getCurrentActorIndex } from '../engine/turnManager';
import { getEnemies, getAllies } from '../engine/gameState';

interface ActionPanelProps {
  gameState: GameState;
  onAction: (action: Action) => void;
  onSelectTarget: (targetType: 'ENEMY_SINGLE' | 'ALLY_SINGLE', callback: (targetIdx: number) => void) => void;
}

export function ActionPanel({ gameState, onAction, onSelectTarget }: ActionPanelProps) {
  const [subMenu, setSubMenu] = useState<'NONE' | 'SPELL' | 'ITEM'>('NONE');
  const actorIdx = getCurrentActorIndex(gameState);
  const actor = gameState.characters[actorIdx];
  const actorDef = getCharDef(actor);

  const handleAttack = () => {
    onSelectTarget('ENEMY_SINGLE', (targetIdx) => {
      onAction({ type: 'ATTACK', actorIndex: actorIdx, targetIndex: targetIdx });
    });
  };

  const handleDefend = () => {
    onAction({ type: 'DEFEND', actorIndex: actorIdx });
  };

  const handleSpell = (spellIdx: number) => {
    const spell = actorDef.spells[spellIdx];
    if (actor.mana < spell.manaCost && !actor.freeNextSpell) return;
    if (spell.special === 'once_per_game' && actor.avadaUsed) return;

    if (spell.targetType === 'ENEMY_SINGLE') {
      onSelectTarget('ENEMY_SINGLE', (targetIdx) => {
        onAction({ type: 'SPELL', actorIndex: actorIdx, spellIndex: spellIdx, targetIndex: targetIdx });
      });
    } else if (spell.targetType === 'ALLY_SINGLE') {
      onSelectTarget('ALLY_SINGLE', (targetIdx) => {
        onAction({ type: 'SPELL', actorIndex: actorIdx, spellIndex: spellIdx, targetIndex: targetIdx });
      });
    } else {
      onAction({ type: 'SPELL', actorIndex: actorIdx, spellIndex: spellIdx });
    }
    setSubMenu('NONE');
  };

  const handleItem = (itemIdx: number) => {
    if (actor.itemsUsed[itemIdx]) return;
    const item = actorDef.items[itemIdx];

    if (item.targetType === 'ENEMY_SINGLE') {
      onSelectTarget('ENEMY_SINGLE', (targetIdx) => {
        onAction({ type: 'ITEM', actorIndex: actorIdx, itemIndex: itemIdx, targetIndex: targetIdx });
      });
    } else if (item.targetType === 'ALLY_SINGLE') {
      onSelectTarget('ALLY_SINGLE', (targetIdx) => {
        onAction({ type: 'ITEM', actorIndex: actorIdx, itemIndex: itemIdx, targetIndex: targetIdx });
      });
    } else {
      onAction({ type: 'ITEM', actorIndex: actorIdx, itemIndex: itemIdx });
    }
    setSubMenu('NONE');
  };

  const btnStyle = (disabled = false): React.CSSProperties => ({
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '9px',
    padding: '8px 14px',
    background: disabled ? '#1a3a1a' : '#eeba30',
    color: disabled ? '#4a6a4a' : '#060d06',
    border: '2px solid #eeba30',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    textAlign: 'center' as const,
  });

  if (subMenu === 'SPELL') {
    return (
      <div style={{ padding: 16, background: 'rgba(6,13,6,0.9)', border: '2px solid #eeba30', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#eeba30', marginBottom: 12 }}>
          Choose Spell - {actorDef.name}
        </div>
        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6, margin: '0 auto' }}>
          {actorDef.spells.map((spell, idx) => {
            const canCast = (actor.mana >= spell.manaCost || actor.freeNextSpell) && !(spell.special === 'once_per_game' && actor.avadaUsed);
            return (
              <button key={idx} onClick={() => handleSpell(idx)} disabled={!canCast} style={btnStyle(!canCast)}>
                {spell.name} ({actor.freeNextSpell ? 0 : spell.manaCost} MP){' '}
                <span style={{ fontSize: '7px', opacity: 0.7 }}>- {spell.description}</span>
              </button>
            );
          })}
          <button onClick={() => setSubMenu('NONE')} style={btnStyle()}>Back</button>
        </div>
      </div>
    );
  }

  if (subMenu === 'ITEM') {
    return (
      <div style={{ padding: 16, background: 'rgba(6,13,6,0.9)', border: '2px solid #eeba30', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#eeba30', marginBottom: 12 }}>
          Choose Item - {actorDef.name}
        </div>
        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6, margin: '0 auto' }}>
          {actorDef.items.map((item, idx) => (
            <button key={idx} onClick={() => handleItem(idx)} disabled={actor.itemsUsed[idx]} style={btnStyle(actor.itemsUsed[idx])}>
              {item.name}{actor.itemsUsed[idx] ? ' (USED)' : ''}{' '}
              <span style={{ fontSize: '7px', opacity: 0.7 }}>- {item.description}</span>
            </button>
          ))}
          <button onClick={() => setSubMenu('NONE')} style={btnStyle()}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, background: 'rgba(6,13,6,0.9)', border: '2px solid #eeba30', textAlign: 'center' }}>
      <div style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#eeba30', marginBottom: 12 }}>
        {actorDef.name}'s Turn
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={handleAttack} style={btnStyle()}>Attack</button>
        <button onClick={() => setSubMenu('SPELL')} style={btnStyle()}>Spell</button>
        <button onClick={() => setSubMenu('ITEM')} style={btnStyle()}>Item</button>
        <button onClick={handleDefend} style={btnStyle()}>Defend</button>
      </div>
    </div>
  );
}
