/**
 * patterns.js — All drum patterns for Drum Hero Jr.
 *
 * Each pattern is 16 steps (16th notes in a 4/4 bar).
 * 1 = hit, 0 = rest.
 * Beat positions: step 0 = beat 1, step 4 = beat 2,
 *                 step 8 = beat 3, step 12 = beat 4.
 *
 * Instruments: kick, snare, hihat, tom, crash
 * Only list instruments the pattern actually uses.
 */

const PATTERNS = [

  /* ── LEVEL 1 ─────────────────────────────────────────── */

  {
    id: 'first_kick',
    name: 'My First BOOM!',
    level: 1,
    targetBpm: 70,
    song: null,
    artist: null,
    songEmoji: '🥁',
    tip: 'Just the kick drum — BOOM on beat 1 and 3. Count: 1 … 3 …',
    instruments: {
      kick:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    },
  },

  {
    id: 'kick_and_clap',
    name: 'Kick & Clap',
    level: 1,
    targetBpm: 75,
    song: null,
    artist: null,
    songEmoji: '👏',
    tip: 'Add the snare on beats 2 and 4 — that\'s the clap! BOOM clap BOOM clap.',
    instruments: {
      kick:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    },
  },

  /* ── LEVEL 2 ─────────────────────────────────────────── */

  {
    id: 'rock_steady',
    name: 'Rock Steady',
    level: 2,
    targetBpm: 85,
    song: null,
    artist: null,
    songEmoji: '🎸',
    tip: 'The basic rock beat! Hi-hat taps on every 8th note. This is in thousands of songs!',
    instruments: {
      kick:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    },
  },

  {
    id: 'we_will_rock_you',
    name: 'We Will Rock You',
    level: 2,
    targetBpm: 80,
    song: 'We Will Rock You',
    artist: 'Queen',
    songEmoji: '👑',
    tip: 'Stomp stomp CLAP! Two kicks then a snare. The whole world knows this beat!',
    instruments: {
      kick:  [1,0,1,0, 0,0,0,0, 1,0,1,0, 0,0,0,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    },
  },

  /* ── LEVEL 3 ─────────────────────────────────────────── */

  {
    id: 'come_together',
    name: 'Come Together',
    level: 3,
    targetBpm: 85,
    song: 'Come Together',
    artist: 'The Beatles',
    songEmoji: '🍎',
    tip: 'The Beatles classic! The kick moves a tiny bit — feel the groove!',
    instruments: {
      kick:  [1,0,0,1, 0,0,0,0, 1,0,0,1, 0,0,0,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    },
  },

  {
    id: 'azizam',
    name: 'Azizam',
    level: 3,
    targetBpm: 90,
    song: 'Azizam',
    artist: 'Ed Sheeran',
    songEmoji: '💃',
    tip: 'A super dancey beat! The kick moves around — makes you want to dance!',
    instruments: {
      kick:  [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    },
  },

  /* ── LEVEL 4 ─────────────────────────────────────────── */

  {
    id: 'peaches',
    name: 'Peaches',
    level: 4,
    targetBpm: 100,
    song: 'Peaches',
    artist: 'Jack Black (Mario Movie)',
    songEmoji: '🍑',
    tip: 'From the Mario movie! The hi-hat plays every 16th note — that\'s super fast tapping!',
    instruments: {
      kick:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
    },
  },

  {
    id: 'lose_yourself',
    name: 'Lose Yourself Beat',
    level: 4,
    targetBpm: 90,
    song: 'Lose Yourself',
    artist: 'Eminem',
    songEmoji: '⚡',
    tip: 'Two kicks in a row, then a snare — it has a charging-forward feel!',
    instruments: {
      kick:  [1,0,1,0, 0,0,0,0, 1,0,1,0, 0,0,0,0],
      snare: [0,0,0,0, 1,0,0,1, 0,0,0,0, 1,0,0,0],
      hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    },
  },

  /* ── LEVEL 5 ─────────────────────────────────────────── */

  {
    id: 'lava_chicken',
    name: 'Lava Chicken!',
    level: 5,
    targetBpm: 110,
    song: 'Peaches (Bowser\'s Groove)',
    artist: 'Jack Black / Bowser',
    songEmoji: '🌋',
    tip: 'A fiery groove with toms! The toms are the BIG drums on the side — BOOM BOOM!',
    instruments: {
      kick:  [1,0,0,1, 0,1,0,0, 1,0,0,1, 0,0,1,0],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
      tom:   [0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,1],
    },
  },

  {
    id: 'rock_star',
    name: 'Rock Star!',
    level: 5,
    targetBpm: 120,
    song: null,
    artist: null,
    songEmoji: '🌟',
    tip: 'The hardest pattern! Kick all over the place, crash cymbal, toms — you\'re a real rock star!',
    instruments: {
      crash: [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      hihat: [1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1],
      tom:   [0,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,1],
      snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,1,0],
      kick:  [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,1,0,0],
    },
  },

];

const INSTRUMENT_META = {
  crash: { label: 'Crash',  emoji: '💥', color: '#c56ef3' },
  hihat: { label: 'Hi-Hat', emoji: '🎵', color: '#ffd93d' },
  tom:   { label: 'Tom',    emoji: '🟤', color: '#95e1d3' },
  snare: { label: 'Snare',  emoji: '🎯', color: '#4ecdc4' },
  kick:  { label: 'Kick',   emoji: '🥁', color: '#ff6b6b' },
};

const INSTRUMENT_ORDER = ['crash', 'hihat', 'tom', 'snare', 'kick'];
