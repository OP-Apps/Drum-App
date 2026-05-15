/**
 * app.js — Main application logic for Drum Hero Jr.
 *
 * Depends on:  patterns.js  → PATTERNS, INSTRUMENT_META, INSTRUMENT_ORDER
 *              audio.js     → AudioEngine
 *              rewards.js   → RewardSystem
 *              phase2.js    → HitDetector, TimingEvaluator
 */

// ── Globals ───────────────────────────────────────────────────────────────────

const audio      = new AudioEngine();
const rewards    = new RewardSystem();
const hitDetector = new HitDetector();
const timingEval  = new TimingEvaluator();

const state = {
  pattern:      null,
  isPlaying:    false,
  isLooping:    true,
  isPractice:   false,
  bpm:          80,
  currentStep:  -1,
  loopCount:    0,
  practiceBpm:  54,
  activeLevel:  'all',
  phase2Active: false,   // Phase 2: mic listen mode
};

// ── Boot ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  renderPatternList();
  renderBadges();
  updateStarCount();
  setupEventListeners();
  selectPattern(PATTERNS[0]);
});

// ── Pattern list ──────────────────────────────────────────────────────────────

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

// ── Pattern info ──────────────────────────────────────────────────────────────

function updatePatternInfo(p) {
  document.getElementById('pattern-name').textContent   = p.name;
  document.getElementById('pattern-artist').textContent = p.artist
    ? `🎵 From: "${p.song}" — ${p.artist}` : '';
  document.getElementById('pattern-tip').textContent    = p.tip;
  document.getElementById('target-bpm').textContent     = `Target: ${p.targetBpm} BPM`;
  const stars = rewards.getStars(p.id);
  document.getElementById('pattern-stars').textContent =
    '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
}

// ── Drum grid ─────────────────────────────────────────────────────────────────

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
    if (s % 4 === 0)      { label.textContent = String(s / 4 + 1); label.classList.add('on-beat'); }
    else if (s % 2 === 0) { label.textContent = '+'; }
    else                  { label.textContent = ''; }
    grid.appendChild(label);
  }

  rows.forEach(key => {
    const meta  = INSTRUMENT_META[key];
    const steps = p.instruments[key];
    const rowLabel = document.createElement('div');
    rowLabel.className = 'row-label';
    rowLabel.style.borderLeftColor = meta.color;
    rowLabel.innerHTML =
      `<span class="row-emoji">${meta.emoji}</span><span class="row-name">${meta.label}</span>`;
    grid.appendChild(rowLabel);
    for (let s = 0; s < 16; s++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.instrument = key;
      cell.dataset.step       = s;
      if (steps[s]) { cell.classList.add('has-note'); cell.style.setProperty('--note-color', meta.color); }
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
      el.classList.remove('hitting'); void el.offsetWidth; el.classList.add('hitting');
    }
  });
  document.querySelectorAll(`.step-label[data-step="${step}"]`).forEach(el => el.classList.add('current-step'));
}

/** Apply a Phase 2 result colour to every has-note cell in a step column. */
function updateCellVerdict(step, verdict) {
  document.querySelectorAll(`.grid-cell[data-step="${step}"].has-note`).forEach(el => {
    el.classList.remove('cell-perfect', 'cell-close', 'cell-miss');
    el.classList.add(`cell-${verdict}`);
  });
}

function clearCellVerdicts() {
  document.querySelectorAll('.grid-cell').forEach(el => {
    el.classList.remove('cell-perfect', 'cell-close', 'cell-miss');
  });
}

// ── Metronome ─────────────────────────────────────────────────────────────────

class Metronome {
  constructor() {
    this.isPlaying      = false;
    this.currentStep    = 0;
    this.nextStepTime   = 0;
    this.scheduleAhead  = 0.1;
    this.lookahead      = 25;
    this._timerID       = null;
    this.onLoopComplete = null;
  }

  get stepSeconds() { return 60 / (state.bpm * 4); }

  start() {
    if (this.isPlaying) return;
    audio.init(); audio.resume();
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
    // Expire stale Phase 2 windows every scheduler tick
    if (state.phase2Active) timingEval.tick();
    while (this.nextStepTime < audio.context.currentTime + this.scheduleAhead) {
      this._scheduleStep(this.currentStep, this.nextStepTime);
      this._advance();
    }
    this._timerID = setTimeout(() => this._tick(), this.lookahead);
  }

  _scheduleStep(step, time) {
    const p = state.pattern;
    if (!p) return;

    // Play drum sounds
    Object.entries(p.instruments).forEach(([inst, steps]) => {
      if (steps[step]) audio.playInstrument(inst, time);
    });

    // Metronome click on quarter notes
    if (step % 4 === 0) audio.playClick(time, step === 0);

    // Phase 2: open a timing window for this step if it has any drum hits
    if (state.phase2Active) {
      const hasHit = Object.values(p.instruments).some(arr => arr[step]);
      if (hasHit) timingEval.openWindow(step, time);
    }

    // Schedule visual update aligned with audio
    const visualDelay = Math.max(0, (time - audio.context.currentTime) * 1000);
    setTimeout(() => {
      if (this.isPlaying) highlightStep(step);
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

// ── Playback ──────────────────────────────────────────────────────────────────

function handleLoopComplete(loopNum) {
  if (!state.pattern) return;
  const p = state.pattern;

  // Phase 2: evaluate timing for this loop
  if (state.phase2Active) {
    timingEval.flushAll();
    const score = timingEval.getScore();
    if (score.total > 0) showAccuracyModal(score);
    timingEval.reset();
    clearCellVerdicts();
  }

  // Practice mode: ramp BPM
  if (state.isPractice) {
    const step = Math.max(4, Math.round(p.targetBpm * 0.05));
    const next = Math.min(state.bpm + step, p.targetBpm);
    if (next !== state.bpm) { setBpm(next); showToast(`🐢 Speed up! ${next} BPM`); }
    if (state.bpm >= p.targetBpm && loopNum >= 2) { stopPlayback(); grantReward(p.id, 3, true); return; }
  }

  // Normal mode: award stars after 2 loops
  if (!state.isPractice && loopNum === 2) {
    const stars = state.bpm >= p.targetBpm ? 2 : 1;
    grantReward(p.id, stars, false);
    if (!state.isLooping) stopPlayback();
  }
}

function startPlayback() {
  if (!state.pattern) { showToast('Pick a pattern first!'); return; }
  audio.init();
  clearCellVerdicts();
  timingEval.reset();
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
  timingEval.flushAll();
  timingEval.reset();
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
  setBpm(Math.max(40, Math.round(state.pattern.targetBpm * 0.6)));
  showToast(`🐢 Practice Mode! Starting at ${state.bpm} BPM`);
  startPlayback();
}

function stopPracticeMode() {
  state.isPractice = false;
  setBpm(state.pattern?.targetBpm ?? 90);
}

// ── Phase 2 ───────────────────────────────────────────────────────────────────

async function togglePhase2() {
  const btn = document.getElementById('phase2-btn');

  if (state.phase2Active) {
    // Turn off
    state.phase2Active = false;
    hitDetector.stop();
    clearCellVerdicts();
    timingEval.reset();
    btn.textContent = '🎤 Play Along!';
    btn.classList.remove('phase2-on');
    document.getElementById('mic-panel').classList.add('hidden');
    showToast('Mic off');
    return;
  }

  // Turn on
  btn.textContent = '⏳ Getting mic…';
  btn.disabled    = true;
  try {
    audio.init();
    timingEval.setAudioContext(audio.context);
    timingEval.onResult = (step, verdict) => updateCellVerdict(step, verdict);
    hitDetector.onHit   = (t) => timingEval.processHit(t);
    hitDetector.onLevel = (level) => updateMicMeter(level);
    hitDetector.onTick  = () => timingEval.tick();
    await hitDetector.start(audio.context);
    state.phase2Active = true;
    btn.textContent = '🎤 Listening…';
    btn.classList.add('phase2-on');
    btn.disabled = false;
    document.getElementById('mic-panel').classList.remove('hidden');
    showToast('🎤 Mic on! Play along with the beat!');
  } catch (err) {
    btn.textContent = '🎤 Play Along!';
    btn.disabled    = false;
    showToast('❌ Mic not available — check browser permissions');
  }
}

function updateMicMeter(level) {
  const bar = document.getElementById('mic-bar');
  if (!bar) return;
  bar.style.width = `${Math.round(level * 100)}%`;
  bar.style.background = level > 0.8 ? '#ff6b6b'
                       : level > 0.4 ? '#ffd93d'
                       : '#4ecdc4';
}

// ── Accuracy modal ────────────────────────────────────────────────────────────

function showAccuracyModal(score) {
  const { total, perfect, close, misses, hits } = score;
  const pct = total > 0 ? Math.round((hits / total) * 100) : 0;

  let emoji, title;
  if (pct === 100) { emoji = '🌟'; title = 'PERFECT! You\'re amazing!'; }
  else if (pct >= 80) { emoji = '🎉'; title = 'Awesome drumming!'; }
  else if (pct >= 60) { emoji = '👍'; title = 'Great job! Keep going!'; }
  else if (pct >= 40) { emoji = '💪'; title = 'Good try! Practice makes perfect!'; }
  else                { emoji = '🥁'; title = 'Keep playing — you\'re learning!'; }

  document.getElementById('acc-emoji').textContent  = emoji;
  document.getElementById('acc-title').textContent  = title;
  document.getElementById('acc-score').textContent  = `You got ${hits} out of ${total} beats!`;
  document.getElementById('acc-pct').textContent    = `${pct}%`;
  document.getElementById('acc-green').textContent  = `🟢 Perfect: ${perfect}`;
  document.getElementById('acc-yellow').textContent = `🟡 Close: ${close}`;
  document.getElementById('acc-red').textContent    = `🔴 Missed: ${misses}`;

  document.getElementById('accuracy-modal').classList.remove('hidden');
}

// ── Count-in ──────────────────────────────────────────────────────────────────

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

// ── BPM ───────────────────────────────────────────────────────────────────────

function setBpm(bpm) {
  state.bpm = bpm;
  document.getElementById('bpm-slider').value = bpm;
  document.getElementById('bpm-display').textContent = bpm;
  const hint = document.getElementById('bpm-hint');
  if (hint) hint.textContent = bpm < 80 ? '🐢' : bpm < 120 ? '🎵' : '🚀';
}

// ── Rewards UI ────────────────────────────────────────────────────────────────

function grantReward(patternId, stars, isPracticeDone) {
  const { earnedBadges } = rewards.awardStars(patternId, stars, { practiceDone: isPracticeDone });
  updateStarCount(); renderPatternList(); updatePatternInfo(state.pattern); renderBadges();
  showRewardModal(stars, earnedBadges);
}

function showRewardModal(stars, earnedBadges) {
  const modal     = document.getElementById('reward-modal');
  const emojiEl   = document.getElementById('reward-emoji');
  const titleEl   = document.getElementById('reward-title');
  const msgEl     = document.getElementById('reward-message');
  const badgeArea = document.getElementById('reward-badges');
  const m3 = ['You\'re a drumming superstar! 🌟', 'Incredible! You nailed it! 🏆', 'You rock the whole stage! 🎸'];
  const m2 = ['Awesome drumming! 👏', 'You\'re getting so good! 🎉', 'Great job! Keep going! 💪'];
  const m1 = ['You did it! 🎊', 'First time complete! ⭐', 'Nice work, drummer! 🥁'];
  const pool = { 3: m3, 2: m2, 1: m1 }[stars] || m1;
  emojiEl.textContent = '⭐'.repeat(stars);
  titleEl.textContent = pool[Math.floor(Math.random() * pool.length)];
  msgEl.textContent   = stars === 3 ? 'You used Practice Mode and reached full speed!'
                      : stars === 2 ? `You played at ${state.bpm} BPM — that's the target!`
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

// ── Level filter ──────────────────────────────────────────────────────────────

function setActiveLevel(level) {
  state.activeLevel = level;
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.level === String(level));
  });
  renderPatternList();
}

// ── Toast ─────────────────────────────────────────────────────────────────────

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

// ── UI helpers ────────────────────────────────────────────────────────────────

function setPlayingUI(playing) {
  const playBtn = document.getElementById('play-btn');
  playBtn.textContent = playing ? '⏸ PAUSE' : '▶ PLAY!';
  playBtn.classList.toggle('playing', playing);
  document.getElementById('practice-btn').disabled = playing;
  document.getElementById('bpm-slider').disabled   = playing && !state.isPractice;
}

// ── Event listeners ───────────────────────────────────────────────────────────

function setupEventListeners() {
  document.getElementById('play-btn').addEventListener('click', () => {
    if (state.isPlaying) stopPlayback(); else startPlayback();
  });
  document.getElementById('loop-btn').addEventListener('click', toggleLoop);
  document.getElementById('practice-btn').addEventListener('click', () => {
    if (state.isPractice) { stopPracticeMode(); stopPlayback(); showToast('Practice mode off'); }
    else startPracticeMode();
  });
  document.getElementById('phase2-btn').addEventListener('click', togglePhase2);

  const slider = document.getElementById('bpm-slider');
  slider.addEventListener('input', () => setBpm(Number(slider.value)));

  // Sensitivity slider
  const sensSlider = document.getElementById('sensitivity-slider');
  if (sensSlider) {
    sensSlider.addEventListener('input', () => {
      // Map 1-10 → 0.02-0.25
      hitDetector.sensitivity = 0.02 + (Number(sensSlider.value) - 1) * (0.23 / 9);
    });
  }

  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => setActiveLevel(btn.dataset.level));
  });
  document.getElementById('reward-close').addEventListener('click', () => {
    document.getElementById('reward-modal').classList.add('hidden');
  });
  document.getElementById('reward-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
  });
  document.getElementById('acc-close').addEventListener('click', () => {
    document.getElementById('accuracy-modal').classList.add('hidden');
  });
  document.getElementById('accuracy-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
  });
}
