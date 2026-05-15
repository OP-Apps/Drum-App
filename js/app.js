/**
 * app.js — Main application logic for Drum Hero Jr.
 *
 * Depends on:  patterns.js  → PATTERNS, INSTRUMENT_META, INSTRUMENT_ORDER
 *              audio.js     → AudioEngine
 *              rewards.js   → RewardSystem
 */

const audio   = new AudioEngine();
const rewards = new RewardSystem();

const state = {
  pattern:       null,
  isPlaying:     false,
  isLooping:     true,
  isPractice:    false,
  bpm:           80,
  currentStep:   -1,
  loopCount:     0,
  practiceBpm:   54,
  activeLevel:   'all',
};

document.addEventListener('DOMContentLoaded', () => {
  renderPatternList();
  renderBadges();
  updateStarCount();
  setupEventListeners();
  selectPattern(PATTERNS[0]);
});

function renderPatternList() {
  const container = document.getElementById('pattern-list');
  container.innerHTML = '';
  const visible = state.activeLevel === 'all'
    ? PATTERNS
    : PATTERNS.filter(p => p.level === Number(state.activeLevel));
  visible.forEach(p => container.appendChild(buildPatternCard(p)));
}

function buildPatternCard(p) {
  const card = document.createElement('div');
  card.className = 'pattern-card';
  card.dataset.id = p.id;
  if (state.pattern?.id === p.id) card.classList.add('selected');
  const stars     = rewards.getStars(p.id);
  const earned    = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  const levelDots = '●'.repeat(p.level) + '○'.repeat(5 - p.level);
  card.innerHTML = `
    <div class="card-emoji">${p.songEmoji}</div>
    <div class="card-name">${p.name}</div>
    ${p.artist ? `<div class="card-artist">${p.artist}</div>` : ''}
    <div class="card-level">Level ${p.level} <span class="level-dots">${levelDots}</span></div>
    <div class="card-stars">${earned}</div>
  `;
  card.addEventListener('click', () => selectPattern(p));
  return card;
}

function selectPattern(p) {
  stopPlayback();
  state.pattern     = p;
  state.loopCount   = 0;
  state.practiceBpm = Math.max(40, Math.round(p.targetBpm * 0.6));
  setBpm(p.targetBpm);
  renderDrumGrid(p);
  updatePatternInfo(p);
  renderPatternList();
}

function updatePatternInfo(p) {
  document.getElementById('pattern-name').textContent   = p.name;
  document.getElementById('pattern-artist').textContent = p.artist
    ? `🎵 From: "${p.song}" — ${p.artist}`
    : '';
  document.getElementById('pattern-tip').textContent    = p.tip;
  document.getElementById('target-bpm').textContent     = `Target: ${p.targetBpm} BPM`;
  const stars = rewards.getStars(p.id);
  document.getElementById('pattern-stars').textContent =
    '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
}

function renderDrumGrid(p) {
  const grid = document.getElementById('drum-grid');
  grid.innerHTML = '';
  const rows = INSTRUMENT_ORDER.filter(key => p.instruments[key]);
  grid.style.gridTemplateColumns = `auto repeat(16, 1fr)`;

  const corner = document.createElement('div');
  corner.className = 'grid-corner';
  grid.appendChild(corner);

  for (let s = 0; s < 16; s++) {
    const label = document.createElement('div');
    label.className = 'step-label';
    label.dataset.step = s;
    if (s % 4 === 0) {
      label.textContent = String(Math.floor(s / 4) + 1);
      label.classList.add('on-beat');
    } else if (s % 2 === 0) {
      label.textContent = '+';
    } else {
      label.textContent = '';
    }
    grid.appendChild(label);
  }

  rows.forEach(key => {
    const meta  = INSTRUMENT_META[key];
    const steps = p.instruments[key];
    const rowLabel = document.createElement('div');
    rowLabel.className = 'row-label';
    rowLabel.style.borderLeftColor = meta.color;
    rowLabel.innerHTML = `<span class="row-emoji">${meta.emoji}</span><span class="row-name">${meta.label}</span>`;
    grid.appendChild(rowLabel);
    for (let s = 0; s < 16; s++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.instrument = key;
      cell.dataset.step       = s;
      if (steps[s]) {
        cell.classList.add('has-note');
        cell.style.setProperty('--note-color', meta.color);
      }
      if (Math.floor(s / 4) % 2 === 1) cell.classList.add('alt-beat');
      grid.appendChild(cell);
    }
  });
}

function highlightStep(step) {
  document.querySelectorAll('.grid-cell.current-step').forEach(el => el.classList.remove('current-step'));
  document.querySelectorAll('.step-label.current-step').forEach(el => el.classList.remove('current-step'));
  if (step < 0) return;
  document.querySelectorAll(`.grid-cell[data-step="${step}"]`).forEach(el => {
    el.classList.add('current-step');
    if (el.classList.contains('has-note')) {
      el.classList.remove('hitting');
      void el.offsetWidth;
      el.classList.add('hitting');
    }
  });
  document.querySelectorAll(`.step-label[data-step="${step}"]`).forEach(el => el.classList.add('current-step'));
}

class Metronome {
  constructor() {
    this.isPlaying      = false;
    this.currentStep    = 0;
    this.nextStepTime   = 0;
    this.scheduleAhead  = 0.1;
    this.lookahead      = 25;
    this._timerID       = null;
    this.onStep         = null;
    this.onLoopComplete = null;
  }

  get stepSeconds() {
    return 60 / (state.bpm * 4);
  }

  start() {
    if (this.isPlaying) return;
    audio.init();
    audio.resume();
    this.isPlaying    = true;
    this.currentStep  = 0;
    this.nextStepTime = audio.context.currentTime + 0.05;
    this._tick();
  }

  stop() {
    this.isPlaying = false;
    clearTimeout(this._timerID);
    this.currentStep = 0;
    highlightStep(-1);
  }

  _tick() {
    if (!this.isPlaying) return;
    while (this.nextStepTime < audio.context.currentTime + this.scheduleAhead) {
      this._scheduleStep(this.currentStep, this.nextStepTime);
      this._advance();
    }
    this._timerID = setTimeout(() => this._tick(), this.lookahead);
  }

  _scheduleStep(step, time) {
    const p = state.pattern;
    if (!p) return;
    Object.entries(p.instruments).forEach(([inst, steps]) => {
      if (steps[step]) audio.playInstrument(inst, time);
    });
    if (step % 4 === 0) audio.playClick(time, step === 0);
    const visualDelay = Math.max(0, (time - audio.context.currentTime) * 1000);
    setTimeout(() => {
      if (this.isPlaying) {
        highlightStep(step);
        if (this.onStep) this.onStep(step, time);
      }
    }, visualDelay);
  }

  _advance() {
    this.nextStepTime += this.stepSeconds;
    this.currentStep++;
    if (this.currentStep >= 16) {
      this.currentStep = 0;
      state.loopCount++;
      const delay = Math.max(0, (this.nextStepTime - audio.context.currentTime) * 1000 - 50);
      setTimeout(() => {
        if (this.isPlaying && this.onLoopComplete) this.onLoopComplete(state.loopCount);
      }, delay);
    }
  }
}

const metronome = new Metronome();
metronome.onLoopComplete = (loopNum) => handleLoopComplete(loopNum);

function handleLoopComplete(loopNum) {
  if (!state.pattern) return;
  const p = state.pattern;
  if (state.isPractice) {
    const step = Math.max(4, Math.round(p.targetBpm * 0.05));
    const next = Math.min(state.bpm + step, p.targetBpm);
    if (next !== state.bpm) {
      setBpm(next);
      showToast(`🐢 Speed up! ${next} BPM`);
    }
    if (state.bpm >= p.targetBpm && loopNum >= 2) {
      stopPlayback();
      grantReward(p.id, 3, true);
      return;
    }
  }
  if (!state.isPractice && loopNum === 2) {
    const stars = state.bpm >= p.targetBpm ? 2 : 1;
    grantReward(p.id, stars, false);
    if (!state.isLooping) stopPlayback();
  }
}

function startPlayback() {
  if (!state.pattern) { showToast('Pick a pattern first!'); return; }
  audio.init();
  doCountIn(() => {
    state.isPlaying = true;
    state.loopCount = 0;
    metronome.start();
    setPlayingUI(true);
  });
}

function stopPlayback() {
  state.isPlaying = false;
  metronome.stop();
  setPlayingUI(false);
}

function toggleLoop() {
  state.isLooping = !state.isLooping;
  const btn = document.getElementById('loop-btn');
  btn.classList.toggle('active', state.isLooping);
  btn.textContent = state.isLooping ? '↺ Loop: ON' : '↺ Loop: OFF';
}

function startPracticeMode() {
  if (!state.pattern) { showToast('Pick a pattern first!'); return; }
  state.isPractice = true;
  const minBpm = Math.max(40, Math.round(state.pattern.targetBpm * 0.6));
  setBpm(minBpm);
  showToast(`🐢 Practice Mode! Starting at ${minBpm} BPM`);
  startPlayback();
}

function stopPracticeMode() {
  state.isPractice = false;
  setBpm(state.pattern?.targetBpm ?? 90);
}

function doCountIn(onDone) {
  audio.init();
  const overlay = document.getElementById('count-overlay');
  const numEl   = document.getElementById('count-number');
  overlay.classList.remove('hidden');
  const beatMs = (60 / state.bpm) * 1000;
  let count    = 3;
  const ctx    = audio.context;
  [0, 1, 2].forEach(i => audio.playClick(ctx.currentTime + (i * beatMs) / 1000, true));
  numEl.textContent = String(count);
  numEl.classList.remove('pop'); void numEl.offsetWidth; numEl.classList.add('pop');
  const tick = setInterval(() => {
    count--;
    if (count === 0) {
      numEl.textContent = 'GO! 🎉';
      numEl.classList.remove('pop'); void numEl.offsetWidth; numEl.classList.add('pop');
      clearInterval(tick);
      setTimeout(() => { overlay.classList.add('hidden'); onDone(); }, beatMs * 0.8);
    } else {
      numEl.textContent = String(count);
      numEl.classList.remove('pop'); void numEl.offsetWidth; numEl.classList.add('pop');
    }
  }, beatMs);
}

function setBpm(bpm) {
  state.bpm = bpm;
  document.getElementById('bpm-slider').value  = bpm;
  document.getElementById('bpm-display').textContent = bpm;
  const hint = document.getElementById('bpm-hint');
  if (hint) hint.textContent = bpm < 80 ? '🐢' : bpm < 120 ? '🎵' : '🚀';
}

function grantReward(patternId, stars, isPracticeDone) {
  const { newStars, earnedBadges } = rewards.awardStars(patternId, stars, { practiceDone: isPracticeDone });
  updateStarCount();
  renderPatternList();
  updatePatternInfo(state.pattern);
  renderBadges();
  showRewardModal(stars, earnedBadges);
}

function showRewardModal(stars, earnedBadges) {
  const modal   = document.getElementById('reward-modal');
  const emojiEl = document.getElementById('reward-emoji');
  const titleEl = document.getElementById('reward-title');
  const msgEl   = document.getElementById('reward-message');
  const badgeArea = document.getElementById('reward-badges');
  const messages3 = ['You\'re a drumming superstar! 🌟', 'Incredible! You nailed it! 🏆', 'You rock the whole stage! 🎸'];
  const messages2 = ['Awesome drumming! 👏', 'You\'re getting so good! 🎉', 'Great job! Keep going! 💪'];
  const messages1 = ['You did it! 🎊', 'First time complete! ⭐', 'Nice work, drummer! 🥁'];
  const pools = { 3: messages3, 2: messages2, 1: messages1 };
  const pool  = pools[stars] || messages1;
  const msg   = pool[Math.floor(Math.random() * pool.length)];
  emojiEl.textContent = '⭐'.repeat(stars);
  titleEl.textContent = msg;
  msgEl.textContent   = stars === 3
    ? 'You used Practice Mode and reached full speed!'
    : stars === 2
    ? `You played at ${state.bpm} BPM — that\'s the target!`
    : 'You listened through the whole pattern!';
  if (earnedBadges.length) {
    badgeArea.innerHTML = earnedBadges.map(b => `<div class="new-badge">${b.emoji} <strong>${b.name}</strong></div>`).join('');
    badgeArea.classList.remove('hidden');
  } else {
    badgeArea.classList.add('hidden');
  }
  modal.classList.remove('hidden');
}

function updateStarCount() {
  const el = document.getElementById('total-stars');
  if (el) el.textContent = rewards.getTotalStars();
}

function renderBadges() {
  const container = document.getElementById('badges-container');
  if (!container) return;
  container.innerHTML = '';
  rewards.getAllBadges().forEach(b => {
    const el = document.createElement('div');
    el.className = 'badge-item' + (b.earned ? ' earned' : ' locked');
    el.title     = b.desc;
    el.innerHTML = `<span class="badge-emoji">${b.earned ? b.emoji : '🔒'}</span><span class="badge-label">${b.name}</span>`;
    container.appendChild(el);
  });
}

function setActiveLevel(level) {
  state.activeLevel = level;
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.level === String(level));
  });
  renderPatternList();
}

let _toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove('hidden', 'fade-out');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.classList.add('hidden'), 500);
  }, 2500);
}

function setPlayingUI(playing) {
  const playBtn = document.getElementById('play-btn');
  playBtn.textContent = playing ? '⏸ PAUSE' : '▶ PLAY!';
  playBtn.classList.toggle('playing', playing);
  document.getElementById('practice-btn').disabled = playing;
  document.getElementById('bpm-slider').disabled   = playing && !state.isPractice;
}

function setupEventListeners() {
  document.getElementById('play-btn').addEventListener('click', () => {
    if (state.isPlaying) { stopPlayback(); } else { startPlayback(); }
  });
  document.getElementById('loop-btn').addEventListener('click', toggleLoop);
  document.getElementById('practice-btn').addEventListener('click', () => {
    if (state.isPractice) { stopPracticeMode(); stopPlayback(); showToast('Practice mode off'); }
    else { startPracticeMode(); }
  });
  const slider = document.getElementById('bpm-slider');
  slider.addEventListener('input', () => setBpm(Number(slider.value)));
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => setActiveLevel(btn.dataset.level));
  });
  document.getElementById('reward-close').addEventListener('click', () => {
    document.getElementById('reward-modal').classList.add('hidden');
  });
  document.getElementById('reward-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
  });
}
