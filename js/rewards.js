/**
 * rewards.js — Star and badge tracking for Drum Hero Jr.
 * Progress is stored in localStorage so it survives page refreshes.
 */

const BADGES = [
  {
    id: 'first_beat',
    name: 'First Beat!',
    emoji: '⭐',
    desc: 'Complete your very first pattern',
    condition: (progress) => Object.keys(progress.patterns).length >= 1,
  },
  {
    id: 'level_up',
    name: 'Level Up!',
    emoji: '🚀',
    desc: 'Complete all Level 1 patterns',
    condition: (progress) => {
      const level1Ids = PATTERNS.filter(p => p.level === 1).map(p => p.id);
      return level1Ids.every(id => (progress.patterns[id]?.stars ?? 0) >= 1);
    },
  },
  {
    id: 'queen_fan',
    name: 'Queen Fan!',
    emoji: '👑',
    desc: 'Complete We Will Rock You',
    condition: (progress) => (progress.patterns['we_will_rock_you']?.stars ?? 0) >= 1,
  },
  {
    id: 'mario_fan',
    name: 'Mario Fan!',
    emoji: '🍑',
    desc: 'Complete Peaches from the Mario Movie',
    condition: (progress) => (progress.patterns['peaches']?.stars ?? 0) >= 1,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon!',
    emoji: '⚡',
    desc: 'Complete Practice Mode on any pattern (reach full speed!)',
    condition: (progress) =>
      Object.values(progress.patterns).some(p => p.practiceDone),
  },
  {
    id: 'rock_star',
    name: 'Rock Star!',
    emoji: '🌟',
    desc: 'Earn 10 stars',
    condition: (progress) => progress.totalStars >= 10,
  },
  {
    id: 'drum_hero',
    name: 'Drum Hero!',
    emoji: '🥁',
    desc: 'Complete every single pattern',
    condition: (progress) => {
      return PATTERNS.every(p => (progress.patterns[p.id]?.stars ?? 0) >= 1);
    },
  },
];

class RewardSystem {
  constructor() {
    this._storageKey = 'drumHeroJr_progress';
    this.progress = this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(this._storageKey);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return { patterns: {}, badges: [], totalStars: 0 };
  }

  _save() {
    try {
      localStorage.setItem(this._storageKey, JSON.stringify(this.progress));
    } catch (_) {}
  }

  getStars(patternId) {
    return this.progress.patterns[patternId]?.stars ?? 0;
  }

  awardStars(patternId, stars, options = {}) {
    const current = this.getStars(patternId);
    if (stars <= current) return { newStars: current, earnedBadges: [] };
    const gained = stars - current;
    if (!this.progress.patterns[patternId]) {
      this.progress.patterns[patternId] = {};
    }
    this.progress.patterns[patternId].stars = stars;
    if (options.practiceDone) {
      this.progress.patterns[patternId].practiceDone = true;
    }
    this.progress.totalStars = (this.progress.totalStars || 0) + gained;
    this._save();
    const earnedBadges = this._checkBadges();
    return { newStars: stars, earnedBadges };
  }

  getTotalStars() {
    return this.progress.totalStars || 0;
  }

  _checkBadges() {
    const earned = [];
    for (const badge of BADGES) {
      if (this.progress.badges.includes(badge.id)) continue;
      if (badge.condition(this.progress)) {
        this.progress.badges.push(badge.id);
        earned.push(badge);
      }
    }
    if (earned.length) this._save();
    return earned;
  }

  hasBadge(badgeId) {
    return this.progress.badges.includes(badgeId);
  }

  getAllBadges() {
    return BADGES.map(b => ({ ...b, earned: this.hasBadge(b.id) }));
  }

  reset() {
    this.progress = { patterns: {}, badges: [], totalStars: 0 };
    this._save();
  }
}
