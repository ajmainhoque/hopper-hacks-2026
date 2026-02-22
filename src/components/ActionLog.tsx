import { LogEntry } from '../engine/types';
import { useRef, useEffect } from 'react';

interface ActionLogProps {
  entries: LogEntry[];
}

export function ActionLog({ entries }: ActionLogProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  return (
    <div style={{
      maxHeight: 200,
      overflowY: 'auto',
      background: 'rgba(6, 13, 6, 0.9)',
      border: '2px solid #1a3a1a',
      padding: 12,
      fontFamily: "'Press Start 2P', monospace",
      fontSize: '7px',
      lineHeight: 2,
    }}>
      {entries.length === 0 && (
        <div style={{ color: '#4a6a4a' }}>Battle log will appear here...</div>
      )}
      {entries.map((entry, i) => {
        let color = '#8a9a8a';
        if (entry.detail.includes('damage')) color = '#e74c3c';
        if (entry.detail.includes('heal') || entry.detail.includes('Heal')) color = '#2ecc71';
        if (entry.detail.includes('mana')) color = '#3498db';
        if (entry.detail.includes('stun') || entry.detail.includes('Stun') || entry.detail.includes('status')) color = '#9b59b6';
        if (entry.detail.includes('defend') || entry.detail.includes('Defend')) color = '#ecb939';

        return (
          <div key={i} style={{ color }}>
            [Turn {entry.turn}] {entry.detail}
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
