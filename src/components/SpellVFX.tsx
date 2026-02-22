import React, { useEffect, useState } from 'react';
import '../styles/spellVFX.css';

export type VFXType =
  | 'ATTACK_SLASH'
  | 'SPELL_RED'      // Damage spells (Stupefy, Crucio, etc.)
  | 'SPELL_GREEN'    // Dark / killing curse
  | 'SPELL_BLUE'     // Utility / patronus
  | 'SPELL_PURPLE'   // Curse / hex
  | 'SPELL_ORANGE'   // Fire spells (Incendio, Fiendfyre)
  | 'SPELL_WHITE'    // Shield / defense
  | 'HEAL_GREEN'     // Healing spells
  | 'NONE';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  angle: number;
}

interface SpellVFXProps {
  type: VFXType;
  active: boolean;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 80 + 10,
    y: Math.random() * 60 + 20,
    size: Math.random() * 12 + 4,
    delay: Math.random() * 0.15,
    duration: 0.3 + Math.random() * 0.3,
    angle: Math.random() * 360,
  }));
}

const VFX_CONFIG: Record<VFXType, { color1: string; color2: string; glow: string; particles: number }> = {
  ATTACK_SLASH:  { color1: '#ffffff', color2: '#cccccc', glow: '#ffffff', particles: 6 },
  SPELL_RED:     { color1: '#ff4444', color2: '#ff8866', glow: '#ff2222', particles: 12 },
  SPELL_GREEN:   { color1: '#44ff44', color2: '#22cc22', glow: '#00ff00', particles: 14 },
  SPELL_BLUE:    { color1: '#4488ff', color2: '#66bbff', glow: '#2266ff', particles: 12 },
  SPELL_PURPLE:  { color1: '#aa44ff', color2: '#dd88ff', glow: '#8822ff', particles: 12 },
  SPELL_ORANGE:  { color1: '#ff8800', color2: '#ffcc44', glow: '#ff6600', particles: 16 },
  SPELL_WHITE:   { color1: '#ffffff', color2: '#ddddff', glow: '#aaaaff', particles: 10 },
  HEAL_GREEN:    { color1: '#44ff88', color2: '#88ffbb', glow: '#22ff66', particles: 10 },
  NONE:          { color1: 'transparent', color2: 'transparent', glow: 'transparent', particles: 0 },
};

export function SpellVFX({ type, active }: SpellVFXProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active && type !== 'NONE') {
      const config = VFX_CONFIG[type];
      setParticles(generateParticles(config.particles));
      const timer = setTimeout(() => setParticles([]), 800);
      return () => clearTimeout(timer);
    } else {
      setParticles([]);
    }
  }, [active, type]);

  if (!active || type === 'NONE' || particles.length === 0) return null;

  const config = VFX_CONFIG[type];
  const isSlash = type === 'ATTACK_SLASH';
  const isHeal = type === 'HEAL_GREEN';
  const isShield = type === 'SPELL_WHITE';

  return (
    <div className="vfx-container">
      {/* Central flash */}
      <div
        className={`vfx-flash ${isHeal ? 'vfx-flash-heal' : isShield ? 'vfx-flash-shield' : 'vfx-flash-attack'}`}
        style={{
          background: `radial-gradient(circle, ${config.color1}88 0%, ${config.color2}44 40%, transparent 70%)`,
          boxShadow: `0 0 40px 15px ${config.glow}44`,
        }}
      />

      {/* Slash lines for physical attacks */}
      {isSlash && (
        <>
          <div className="vfx-slash vfx-slash-1" />
          <div className="vfx-slash vfx-slash-2" />
          <div className="vfx-slash vfx-slash-3" />
        </>
      )}

      {/* Magic particles */}
      {!isSlash && particles.map((p) => (
        <div
          key={p.id}
          className={`vfx-particle ${isHeal ? 'vfx-particle-rise' : 'vfx-particle-burst'}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, ${config.color1}, ${config.color2})`,
            boxShadow: `0 0 ${p.size * 2}px ${p.size}px ${config.glow}66`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      {/* Magic ring for spells */}
      {!isSlash && !isHeal && (
        <div
          className="vfx-ring"
          style={{
            borderColor: config.color1,
            boxShadow: `0 0 12px 3px ${config.glow}88, inset 0 0 12px 3px ${config.glow}44`,
          }}
        />
      )}
    </div>
  );
}

/** Map a spell ID to a VFX type based on the spell's nature */
export function getSpellVFXType(actionType: string, spellId?: string): VFXType {
  if (actionType === 'ATTACK') return 'ATTACK_SLASH';
  if (actionType === 'DEFEND') return 'SPELL_WHITE';
  if (!spellId) return 'SPELL_BLUE';

  // Fire spells
  if (spellId.includes('incendio') || spellId.includes('fiendfyre')) return 'SPELL_ORANGE';
  // Dark / killing spells
  if (spellId.includes('avada') || spellId.includes('dark_mark')) return 'SPELL_GREEN';
  // Dark / curse spells
  if (spellId.includes('crucio') || spellId.includes('cruciatus') ||
      spellId.includes('dark_whiplash') || spellId.includes('maniacal') ||
      spellId.includes('unhinged') || spellId.includes('slugulus')) return 'SPELL_PURPLE';
  // Healing
  if (spellId.includes('episkey') || spellId.includes('loyalty') ||
      spellId.includes('chocolate') || spellId.includes('endurance') ||
      spellId.includes('beaded')) return 'HEAL_GREEN';
  // Shield / defense
  if (spellId.includes('protego') || spellId.includes('guardian') ||
      spellId.includes('dragon_hide') || spellId.includes('defend')) return 'SPELL_WHITE';
  // Blue utility
  if (spellId.includes('patronum') || spellId.includes('leviosa') ||
      spellId.includes('time_turner') || spellId.includes('deluminator') ||
      spellId.includes('feint') || spellId.includes('luck') ||
      spellId.includes('empowerment') || spellId.includes('invisibility')) return 'SPELL_BLUE';
  // Red damage default
  if (spellId.includes('stupefy') || spellId.includes('expelliarmus') ||
      spellId.includes('petrificus') || spellId.includes('diffindo') ||
      spellId.includes('brute') || spellId.includes('stampede')) return 'SPELL_RED';

  return 'SPELL_BLUE';
}
