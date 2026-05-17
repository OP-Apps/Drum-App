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

const GENRE_META = {
  basics:    { label: 'Basics',   emoji: '🥁', color: '#8888aa' },
  rock:      { label: 'Rock',     emoji: '🎸', color: '#ff6b6b' },
  pop:       { label: 'Pop',      emoji: '🎵', color: '#ff4d8d' },
  'hip-hop': { label: 'Hip-Hop',  emoji: '🎤', color: '#a855f7' },
  jazz:      { label: 'Jazz',     emoji: '🎷', color: '#ffd93d' },
  blues:     { label: 'Blues',    emoji: '💙', color: '#4ecdc4' },
  funk:      { label: 'Funk',     emoji: '🕺', color: '#ff8c42' },
  metal:     { label: 'Metal',    emoji: '🤘', color: '#ef4444' },
  reggae:    { label: 'Reggae',   emoji: '🌴', color: '#22c55e' },
  country:   { label: 'Country',  emoji: '🤠', color: '#f59e0b' },
};

const PATTERNS = [

  /* ── LEVEL 1 ─────────────────────────────────────────── */

  {
    id: 'first_kick',
    name: 'My First BOOM!',
    genre: 'basics',
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
    genre: 'basics',
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

  {
    id: 'reggae_bounce',
    name: 'Reggae Bounce',
    genre: 'reggae',
    level: 1,
    targetBpm: 68,
    song: null,
    artist: null,
    songEmoji: '🌴',
    tip: 'Reggae feel! The hi-hat skips to the OFFBEAT — it bobs like waves. Count the gaps!',
    instruments: {
      kick:  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
      hihat: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
    },
  },

  {
    id: 'slow_blues',
    name: 'Slow Blues',
    genre: 'blues',
    level: 1,
    targetBpm: 60,
    song: null,
    artist: null,
    songEmoji: '😢',
    tip: 'Nice and slow — feel every beat. Kick on 1 and 3, snare on 2 and 4.',
    instruments: {
      kick:  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    },
  },

  /* ── LEVEL 2 ─────────────────────────────────────────── */

  {
    id: 'rock_steady',
    name: 'Rock Steady',
    genre: 'rock',
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
    genre: 'rock',
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

  {
    id: 'hip_hop_classic',
    name: 'Hip Hop Classic',
    genre: 'hip-hop',
    level: 2,
    targetBpm: 88,
    song: null,
    artist: null,
    songEmoji: '🎤',
    tip: 'Hip hop basics — kick, snare, hi-hat, plus a sneaky extra kick on beat 3+!',
    instruments: {
      kick:  [1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    },
  },

  {
    id: 'basic_jazz',
    name: 'Basic Jazz Ride',
    genre: 'jazz',
    level: 2,
    targetBpm: 120,
    song: null,
    artist: null,
    songEmoji: '🎷',
    tip: 'Classic jazz ride pattern! Hi-hat keeps steady 8ths, kick and snare stay cool.',
    instruments: {
      hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      kick:  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    },
  },

  {
    id: 'blues_shuffle',
    name: 'Blues Shuffle',
    genre: 'blues',
    level: 2,
    targetBpm: 85,
    song: null,
    artist: null,
    songEmoji: '🎸',
    tip: 'The classic blues shuffle! Hi-hat taps along with kick and snare.',
    instruments: {
      kick:  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    },
  },

  {
    id: 'boom_bap',
    name: 'Boom Bap',
    genre: 'hip-hop',
    level: 2,
    targetBpm: 90,
    song: null,
    artist: null,
    songEmoji: '📼',
    tip: 'Old school hip hop! Boom (kick) and bap (snare) — simple but powerful.',
    instruments: {
      kick:  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    },
  },

  /* ── LEVEL 3 ─────────────────────────────────────────── */

  {
    id: 'come_together',
    name: 'Come Together',
    genre: 'rock',
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
    genre: 'pop',
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

  {
    id: 'uptown_funk',
    name: 'Uptown Funk',
    genre: 'funk',
    level: 3,
    targetBpm: 115,
    song: 'Uptown Funk',
    artist: 'Bruno Mars & Mark Ronson',
    songEmoji: '🕺',
    tip: 'Funky! The kick punches early on beat 1+ — feel that swagger!',
    instruments: {
      kick:  [1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    },
  },

  {
    id: 'old_town_road',
    name: 'Old Town Road',
    genre: 'country',
    level: 3,
    targetBpm: 95,
    song: 'Old Town Road',
    artist: 'Lil Nas X',
    songEmoji: '🤠',
    tip: 'Country-trap crossover — yeehaw! The kick has a surprise on beat 2+ and beat 4!',
    instruments: {
      kick:  [1,0,0,0,0,0,1,0,1,0,0,0,0,1,0,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    },
  },

  {
    id: 'cant_stop_feeling',
    name: "Can't Stop the Feeling",
    genre: 'pop',
    level: 3,
    targetBpm: 113,
    song: "Can't Stop the Feeling",
    artist: 'Justin Timberlake',
    songEmoji: '🌈',
    tip: 'Happy sunny pop beat! Kick on every quarter note PLUS a late extra — dance time!',
    instruments: {
      kick:  [1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    },
  },

  {
    id: 'jazz_shuffle',
    name: 'Jazz Shuffle',
    genre: 'jazz',
    level: 3,
    targetBpm: 132,
    song: null,
    artist: null,
    songEmoji: '🎺',
    tip: 'Swing it! The hi-hat plays a triplet-feel shuffle. Cool and laid back.',
    instruments: {
      hihat: [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      kick:  [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
    },
  },

  {
    id: 'boogie_woogie',
    name: 'Boogie Woogie!',
    genre: 'blues',
    level: 3,
    targetBpm: 96,
    song: null,
    artist: null,
    songEmoji: '🎹',
    tip: 'Upbeat and bouncy! The kick bounces on the offbeats — makes you want to move!',
    instruments: {
      kick:  [1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    },
  },

  {
    id: 'funky_drummer',
    name: 'Funky Drummer',
    genre: 'funk',
    level: 3,
    targetBpm: 98,
    song: null,
    artist: null,
    songEmoji: '🕺',
    tip: 'James Brown style! Snare ghost notes everywhere — this groove will not stop!',
    instruments: {
      kick:  [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0],
      snare: [0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1],
      hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    },
  },

  {
    id: 'superstition',
    name: 'Superstition',
    genre: 'funk',
    level: 3,
    targetBpm: 100,
    song: 'Superstition',
    artist: 'Stevie Wonder',
    songEmoji: '🕶',
    tip: 'Very superstitious! One of the greatest funk beats ever written.',
    instruments: {
      kick:  [1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    },
  },

  {
    id: 'ac_dc_stomp',
    name: 'AC/DC Stomp',
    genre: 'rock',
    level: 3,
    targetBpm: 118,
    song: null,
    artist: null,
    songEmoji: '⚡',
    tip: 'Highway to hell! Straight 8ths on hihat with a punchy kick-snare combo.',
    instruments: {
      kick:  [1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    },
  },

  {
    id: 'trap_beat',
    name: 'Trap Beat',
    genre: 'hip-hop',
    level: 3,
    targetBpm: 75,
    song: null,
    artist: null,
    songEmoji: '🔊',
    tip: 'Modern trap! The hi-hat fires super fast 16th notes — that is the trap sound!',
    instruments: {
      kick:  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
      hihat: [1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
    },
  },

  /* ── LEVEL 4 ─────────────────────────────────────────── */

  {
    id: 'peaches',
    name: 'Peaches',
    genre: 'pop',
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
    genre: 'hip-hop',
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

  {
    id: 'billie_jean',
    name: 'Billie Jean',
    genre: 'funk',
    level: 4,
    targetBpm: 118,
    song: 'Billie Jean',
    artist: 'Michael Jackson',
    songEmoji: '🕴',
    tip: 'One of the most famous beats ever! Kick drops an extra hit on the + of beat 3!',
    instruments: {
      crash: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      kick:  [1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    },
  },

  {
    id: 'thriller',
    name: 'Thriller Beat',
    genre: 'pop',
    level: 4,
    targetBpm: 104,
    song: 'Thriller',
    artist: 'Michael Jackson',
    songEmoji: '🧟',
    tip: 'Spooky syncopated kick, then toms jump in at the end for the horror movie fill!',
    instruments: {
      kick:  [1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
      tom:   [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    },
  },

  {
    id: 'cool_jazz',
    name: 'Cool Jazz',
    genre: 'jazz',
    level: 4,
    targetBpm: 144,
    song: null,
    artist: null,
    songEmoji: '🎵',
    tip: 'Fast and cool! Opens with a crash, sparse kick, hi-hat swings on every beat.',
    instruments: {
      crash: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      hihat: [1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      kick:  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    },
  },

  {
    id: 'metal_drive',
    name: 'Metal Drive',
    genre: 'metal',
    level: 4,
    targetBpm: 140,
    song: null,
    artist: null,
    songEmoji: '🤘',
    tip: 'Full speed! 16th hi-hats the whole way through — your arms will get a workout!',
    instruments: {
      crash: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      kick:  [1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    },
  },

  {
    id: 'power_groove',
    name: 'Power Groove',
    genre: 'metal',
    level: 4,
    targetBpm: 120,
    song: null,
    artist: null,
    songEmoji: '⚡',
    tip: 'Heavy and powerful! Kick on every quarter note — feel the weight of each beat.',
    instruments: {
      kick:  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    },
  },

  {
    id: 'grunge_driver',
    name: 'Grunge Driver',
    genre: 'rock',
    level: 4,
    targetBpm: 117,
    song: null,
    artist: null,
    songEmoji: '🟣',
    tip: 'Smells like 90s rock! Big open feel — stomp that kick and crash!',
    instruments: {
      crash: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      kick:  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    },
  },

  /* ── LEVEL 5 ─────────────────────────────────────────── */

  {
    id: 'lava_chicken',
    name: 'Lava Chicken!',
    genre: 'rock',
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
    genre: 'rock',
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

  {
    id: 'in_the_air',
    name: 'In The Air Tonight',
    genre: 'rock',
    level: 5,
    targetBpm: 104,
    song: 'In the Air Tonight',
    artist: 'Phil Collins',
    songEmoji: '🌙',
    tip: 'The most famous drum fill ever! Hi-hat drops out halfway — then BOOM, toms explode!',
    instruments: {
      crash: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      hihat: [1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      tom:   [0,0,0,0,0,0,0,0,1,1,0,1,1,0,1,1],
      kick:  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    },
  },

  {
    id: 'double_trouble',
    name: 'Double Trouble',
    genre: 'metal',
    level: 5,
    targetBpm: 150,
    song: null,
    artist: null,
    songEmoji: '🔥',
    tip: 'The hardest pattern! Simulated double kick — every 8th note BOOM BOOM BOOM!',
    instruments: {
      crash: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      kick:  [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
      snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
      hihat: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
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
