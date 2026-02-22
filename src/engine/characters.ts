import { CharacterDef, Spell, Item } from './types';

// ─── Harry Potter ─────────────────────────────────────────────────────────────
const harrySpells: [Spell, Spell, Spell, Spell] = [
  {
    id: 'harry_expelliarmus',
    name: 'Expelliarmus',
    manaCost: 4,
    damage: 14,
    healing: 0,
    targetType: 'ENEMY_SINGLE',
    statusEffect: 'WEAKENED',
    statusDuration: -1,
    statusValue: 50,
    special: 'weaken_attack',
    description: "Disarms target. Target's next Attack deals 50% reduced damage.",
  },
  {
    id: 'harry_stupefy',
    name: 'Stupefy',
    manaCost: 6,
    damage: 20,
    healing: 0,
    targetType: 'ENEMY_SINGLE',
    description: 'A powerful stunning spell dealing 20 damage to a single target.',
  },
  {
    id: 'harry_protego',
    name: 'Protego',
    manaCost: 5,
    damage: 0,
    healing: 0,
    targetType: 'SELF',
    description: 'Reduce next incoming attack by 75%.',
  },
  {
    id: 'harry_expecto_patronum',
    name: 'Expecto Patronum',
    manaCost: 8,
    damage: 12,
    healing: 0,
    targetType: 'BOTH_ENEMIES',
    special: 'self_dodge',
    description: 'Deals 12 damage to both enemies. Caster gains Dodge Next.',
  },
];

const harryItems: [Item, Item] = [
  {
    id: 'harry_invisibility_cloak',
    name: 'Invisibility Cloak',
    targetType: 'SELF',
    effect: { applyStatus: 'DODGE_NEXT' },
    description: 'Gain Dodge Next.',
  },
  {
    id: 'harry_golden_snitch_charm',
    name: 'Golden Snitch Charm',
    targetType: 'ALLY_SINGLE',
    effect: { healing: 20 },
    description: 'Heal one ally for 20 HP.',
  },
];

const harry: CharacterDef = {
  id: 'harry',
  name: 'Harry Potter',
  role: 'Balanced Duelist',
  spells: harrySpells,
  items: harryItems,
  cssColor: '#740001',
  initial: 'H',
  image: '/characters/harry.png',
};

// ─── Hermione Granger ─────────────────────────────────────────────────────────
const hermioneSpells: [Spell, Spell, Spell, Spell] = [
  {
    id: 'hermione_petrificus_totalus',
    name: 'Petrificus Totalus',
    manaCost: 6,
    damage: 10,
    healing: 0,
    targetType: 'ENEMY_SINGLE',
    statusEffect: 'STUNNED',
    statusDuration: 1,
    description: 'Deals 10 damage and stuns target for 1 turn.',
  },
  {
    id: 'hermione_diffindo',
    name: 'Diffindo',
    manaCost: 5,
    damage: 16,
    healing: 0,
    targetType: 'ENEMY_SINGLE',
    description: 'A cutting spell dealing 16 damage to a single target.',
  },
  {
    id: 'hermione_episkey',
    name: 'Episkey',
    manaCost: 5,
    damage: 0,
    healing: 18,
    targetType: 'ALLY_SINGLE',
    description: 'Heal one ally for 18 HP.',
  },
  {
    id: 'hermione_incendio',
    name: 'Incendio',
    manaCost: 7,
    damage: 14,
    healing: 0,
    targetType: 'BOTH_ENEMIES',
    description: 'Deals 14 damage to both enemies.',
  },
];

const hermioneItems: [Item, Item] = [
  {
    id: 'hermione_time_turner',
    name: 'Time-Turner',
    targetType: 'BOTH_ALLIES',
    effect: { manaGain: 4 },
    description: 'Both allies gain +4 mana.',
  },
  {
    id: 'hermione_beaded_bag',
    name: 'Beaded Bag',
    targetType: 'BOTH_ALLIES',
    effect: { healing: 10 },
    description: 'Heal both allies 10 HP.',
  },
];

const hermione: CharacterDef = {
  id: 'hermione',
  name: 'Hermione Granger',
  role: 'Tactical Support / Control',
  spells: hermioneSpells,
  items: hermioneItems,
  cssColor: '#ae0001',
  initial: 'Hr',
  image: '/characters/hermione.png',
};

// ─── Ron Weasley ──────────────────────────────────────────────────────────────
const ronSpells: [Spell, Spell, Spell, Spell] = [
  {
    id: 'ron_wingardium_leviosa',
    name: 'Wingardium Leviosa',
    manaCost: 4,
    damage: 12,
    healing: 0,
    targetType: 'ENEMY_SINGLE',
    description: 'Levitates and slams the target for 12 damage.',
  },
  {
    id: 'ron_slugulus_eructo',
    name: 'Slugulus Eructo',
    manaCost: 7,
    damage: 22,
    healing: 0,
    targetType: 'ENEMY_SINGLE',
    description: 'A disgusting but powerful slug hex dealing 22 damage.',
  },
  {
    id: 'ron_leprechaun_luck',
    name: 'Leprechaun Luck',
    manaCost: 6,
    damage: 0,
    healing: 0,
    targetType: 'SELF',
    special: 'next_attack_plus_10',
    description: 'Next Attack deals +10 bonus damage.',
  },
  {
    id: 'ron_chasers_feint',
    name: "Chaser's Feint",
    manaCost: 5,
    damage: 0,
    healing: 8,
    targetType: 'SELF',
    special: 'self_dodge',
    description: 'Gain Dodge Next and heal self 8 HP.',
  },
];

const ronItems: [Item, Item] = [
  {
    id: 'ron_deluminator',
    name: 'Deluminator',
    targetType: 'BOTH_ALLIES',
    effect: { special: 'grant_defend_both' },
    description: 'Both allies gain Defend.',
  },
  {
    id: 'ron_chocolate_frog',
    name: 'Chocolate Frog',
    targetType: 'SELF',
    effect: { healing: 25 },
    description: 'Heal self 25 HP.',
  },
];

const ron: CharacterDef = {
  id: 'ron',
  name: 'Ron Weasley',
  role: 'Risk / Burst Fighter',
  spells: ronSpells,
  items: ronItems,
  cssColor: '#d3a625',
  initial: 'R',
  image: '/characters/ron.png',
};

// ─── Lord Voldemort ───────────────────────────────────────────────────────────
const voldemortSpells: [Spell, Spell, Spell, Spell] = [
  {
    id: 'voldemort_avada_kedavra',
    name: 'Avada Kedavra',
    manaCost: 10,
    damage: 40,
    healing: 0,
    targetType: 'ENEMY_SINGLE',
    special: 'once_per_game',
    description: 'Deals 40 damage. Can only be used once per game.',
  },
  {
    id: 'voldemort_crucio',
    name: 'Crucio',
    manaCost: 8,
    damage: 24,
    healing: 0,
    targetType: 'ENEMY_SINGLE',
    special: 'bonus_if_target_attacks',
    statusValue: 8,
    description:
      'Deals 24 damage. If the target attacks next turn, they take 8 bonus damage.',
  },
  {
    id: 'voldemort_fiendfyre',
    name: 'Fiendfyre',
    manaCost: 9,
    damage: 20,
    healing: 0,
    targetType: 'BOTH_ENEMIES',
    description: 'Cursed fire dealing 20 damage to both enemies.',
  },
  {
    id: 'voldemort_dark_empowerment',
    name: 'Dark Empowerment',
    manaCost: 6,
    damage: 0,
    healing: 0,
    targetType: 'SELF',
    special: 'free_next_spell',
    description: 'Next spell costs 0 mana.',
  },
];

const voldemortItems: [Item, Item] = [
  {
    id: 'voldemort_horcrux_fragment',
    name: 'Horcrux Fragment',
    targetType: 'SELF',
    effect: { special: 'survive_fatal_20hp' },
    description:
      'If fatal damage would occur, survive with 20 HP. One-time use.',
  },
  {
    id: 'voldemort_dark_mark',
    name: 'Dark Mark',
    targetType: 'BOTH_ENEMIES',
    effect: { manaLoss: 3 },
    description: 'Both enemies lose 3 mana.',
  },
];

const voldemort: CharacterDef = {
  id: 'voldemort',
  name: 'Lord Voldemort',
  role: 'High Burst Dark DPS',
  spells: voldemortSpells,
  items: voldemortItems,
  cssColor: '#1a472a',
  initial: 'V',
  image: '/characters/voldemort.png',
};

// ─── Rubeus Hagrid ────────────────────────────────────────────────────────────
const hagridSpells: [Spell, Spell, Spell, Spell] = [
  {
    id: 'hagrid_brute_swing',
    name: 'Brute Swing',
    manaCost: 5,
    damage: 18,
    healing: 0,
    targetType: 'ENEMY_SINGLE',
    description: 'A heavy swing dealing 18 damage.',
  },
  {
    id: 'hagrid_guardian_of_the_grounds',
    name: 'Guardian of the Grounds',
    manaCost: 6,
    damage: 0,
    healing: 0,
    targetType: 'BOTH_ALLIES',
    special: 'shield_spell_both',
    description:
      'Apply Shield Spell (50% spell damage reduction) to both allies.',
  },
  {
    id: 'hagrid_fangs_loyalty',
    name: "Fang's Loyalty",
    manaCost: 5,
    damage: 0,
    healing: 15,
    targetType: 'SELF',
    description: 'Heal self 15 HP.',
  },
  {
    id: 'hagrid_creature_stampede',
    name: 'Creature Stampede',
    manaCost: 8,
    damage: 15,
    healing: 0,
    targetType: 'BOTH_ENEMIES',
    description: 'Creatures stampede dealing 15 damage to both enemies.',
  },
];

const hagridItems: [Item, Item] = [
  {
    id: 'hagrid_dragon_hide_coat',
    name: 'Dragon Hide Coat',
    targetType: 'SELF',
    effect: { applyStatus: 'DEFENDING', special: 'also_shield_spell' },
    description: 'Gain Defend and reduce next spell damage by 50%.',
  },
  {
    id: 'hagrid_giants_endurance',
    name: "Giant's Endurance",
    targetType: 'SELF',
    effect: { healing: 30 },
    description: 'Heal self 30 HP.',
  },
];

const hagrid: CharacterDef = {
  id: 'hagrid',
  name: 'Rubeus Hagrid',
  role: 'Tank / Bruiser',
  spells: hagridSpells,
  items: hagridItems,
  cssColor: '#6b3a2a',
  initial: 'Hg',
  image: '/characters/hagrid.png',
};

// ─── Bellatrix Lestrange ──────────────────────────────────────────────────────
const bellatrixSpells: [Spell, Spell, Spell, Spell] = [
  {
    id: 'bellatrix_dark_whiplash',
    name: 'Dark Whiplash',
    manaCost: 5,
    damage: 18,
    healing: 0,
    targetType: 'ENEMY_SINGLE',
    description: 'A vicious whip of dark energy dealing 18 damage.',
  },
  {
    id: 'bellatrix_cruciatus_fury',
    name: 'Cruciatus Fury',
    manaCost: 8,
    damage: 22,
    healing: 0,
    targetType: 'ENEMY_SINGLE',
    statusEffect: 'BLEED',
    statusDuration: 2,
    statusValue: 5,
    description:
      'Deals 22 damage and applies Bleed (5 damage for 2 turns).',
  },
  {
    id: 'bellatrix_maniacal_burst',
    name: 'Maniacal Burst',
    manaCost: 7,
    damage: 16,
    healing: 0,
    targetType: 'BOTH_ENEMIES',
    description: 'An explosive burst dealing 16 damage to both enemies.',
  },
  {
    id: 'bellatrix_unhinged_power',
    name: 'Unhinged Power',
    manaCost: 6,
    damage: 0,
    healing: 0,
    targetType: 'SELF',
    special: 'next_spell_plus_10',
    description: 'Next spell deals +10 damage.',
  },
];

const bellatrixItems: [Item, Item] = [
  {
    id: 'bellatrix_obsessive_devotion',
    name: 'Obsessive Devotion',
    targetType: 'SELF',
    effect: { manaGain: 5 },
    description: 'Gain +5 mana.',
  },
  {
    id: 'bellatrix_torturers_focus',
    name: "Torturer's Focus",
    targetType: 'ENEMY_SINGLE',
    effect: { manaLoss: 5 },
    description: 'Target enemy loses 5 mana.',
  },
];

const bellatrix: CharacterDef = {
  id: 'bellatrix',
  name: 'Bellatrix Lestrange',
  role: 'Aggressive Chaos Mage',
  spells: bellatrixSpells,
  items: bellatrixItems,
  cssColor: '#2d1a4e',
  initial: 'B',
  image: '/characters/bellatrix.png',
};

// ─── Exports ──────────────────────────────────────────────────────────────────
export const CHARACTER_DEFS: Record<string, CharacterDef> = {
  harry,
  hermione,
  ron,
  voldemort,
  hagrid,
  bellatrix,
};

export const CHARACTER_LIST: CharacterDef[] = [
  harry,
  hermione,
  ron,
  voldemort,
  hagrid,
  bellatrix,
];
