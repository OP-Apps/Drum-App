/**
 * app.js — Main application logic for Drum Hero Jr.
 *
 * Depends on:  patterns.js  → PATTERNS, INSTRUMENT_META, INSTRUMENT_ORDER, GENRE_META
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
  isListenMode: false,       // true = Listen (one-shot), false = Practice (loop)
  bpm:          80,
  currentStep:  -1,
  loopCount:    0,
  practiceBpm:  54,
  activeLevel:       'all',
  activeGenre:       'all',
  phase2Active:      false,   // Phase 2: mic listen mode
  lastPhase2Toast:   0,       // timestamp (ms) of last Phase 2 score toast
  drumsEnabled:      true,    // Kit Sounds toggle
  drumsOut:          false,   // Drums Out toggle (aliases same gain)
  streakSaved:       false,   // has streak been saved for this session
};

// ── Session timer ─────────────────────────────────────────────────────────────

let _sessionSeconds = 0;
const _timerEl = () => document.getElementById('session-timer');
const _milestones = new Set();

setInterval(() => {
  _sessionSeconds++;
  const m = Math.floor(_sessionSeconds / 60);
  const s = _sessionSeconds % 60;
  const el = _timerEl();
  if (el) el.textContent = `⏱ ${m}:${String(s).padStart(2, '0')}`;

  // Milestone toasts at 10, 20, 30 minutes
  if (_sessionSeconds % 600 === 0 && _sessionSeconds <= 1800) {
    const mins = _sessionSeconds / 60;
    if (!_milestones.has(mins)) {
      _milestones.add(mins);
      showToast(`🔥 ${mins} minutes of drumming!`, 4000);
    }
  }
}, 1000);

// ── Streak ────────────────────────────────────────────────────────────────────

function loadStreak() {
  try {
    const raw = localStorage.getItem('drumHeroJr_streak');
    if (!raw) return { streak: 1, lastDate: null };
    return JSON.parse(raw);
  } catch { return { streak: 1, lastDate: null }; }
}

function saveStreakForToday() {
  if (state.streakSaved) return;
  state.streakSaved = true;
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const data  = loadStreak();
  let streak  = data.streak || 1;
  const last  = data.lastDate;

  if (last) {
    const lastD = new Date(last);
    const todayD = new Date(today);
    const diffDays = Math.round((todayD - lastD) / 86400000);
    if (diffDays === 1)      streak++;
    else if (diffDays > 1)   streak = 1;
    // diffDays === 0 → same day, no change
  }

  localStorage.setItem('drumHeroJr_streak', JSON.stringify({ streak, lastDate: today }));
  updateStreakDisplay(streak);
}

function updateStreakDisplay(streak) {
  const el = document.getElementById('streak-display');
  if (el) el.textContent = `🔥 ${streak} day streak`;
}

function initStreakDisplay() {
  const data = loadStreak();
  updateStreakDisplay(data.streak || 1);
}

// ── Boot ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  renderGenreFilters();
  renderPatternList();
  renderBadges();
  updateStarCount();
  setupEventListeners();
  initStreakDisplay();
  selectPattern(PATTERNS[0]);
});

// ── Pattern list ──────────────────────────────────────────────────────────────

function renderPatternList() {
  const container = document.getElementById('pattern-list');
  container.innerHTML = '';
  let visible = PATTERNS;
  if (state.activeLevel !== 'all') {
    visible = visible.filter(p => p.level === Number(state.activeLevel));
  }
  if (state.activeGenre !== 'all') {
    visible = visible.filter(p => p.genre === state.activeGenre);
  }
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
  const genreMeta = GENRE_META[p.genre];
  const genreBadge = genreMeta
    ? `<span class="card-genre-badge" style="background:${genreMeta.color}22;color:${genreMeta.color};border-color:${genreMeta.color}55">${genreMeta.emoji} ${genreMeta.label}</span>`
    : '';
  card.innerHTML = `
    <div class="card-emoji">${p.songEmoji}</div>
    <div class="card-name">${p.name}</div>
    ${p.artist ? `<div class="card-artist">${p.artist}</div>` : ''}
    <div class="card-level">Level ${p.level} <span class="level-dots">${levelDots}</span></div>
    <div class="card-footer">${genreBadge}<span class="card-stars">${earned}</span></div>
  `;
  card.addEventListener('click', () => selectPattern(p));
  return card;
}

function selectPattern(p) {
  // Auto-play in Listen mode when clicking a pattern
  const wasPlaying = state.isPlaying;
  if (wasPlaying) stopPlayback();
  state.pattern     = p;
  state.loopCount   = 0;
  state.practiceBpm = Math.max(40, Math.round(p.targetBpm * 0.6));
  setBpm(p.targetBpm);
  renderDrumGrid(p);
  updatePatternInfo(p);
  renderPatternList();
  // Auto-start in Listen mode
  startListenMode();
}

// ── Genre filters ─────────────────────────────────────────────────────────────

function renderGenreFilters() {
  const container = document.getElementById('genre-filters');
  if (!container) return;
  container.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.className = 'genre-btn active';
  allBtn.dataset.genre = 'all';
  allBtn.textContent = '🎵 All Genres';
  allBtn.addEventListener('click', () => setActiveGenre('all'));
  container.appendChild(allBtn);

  Object.entries(GENRE_META).forEach(([key, meta]) => {
    const btn = document.createElement('button');
    btn.className = 'genre-btn';
    btn.dataset.genre = key;
    btn.textContent = `${meta.emoji} ${meta.label}`;
    btn.style.setProperty('--genre-color', meta.color);
    btn.addEventListener('click', () => setActiveGenre(key));
    container.appendChild(btn);
  });
}

function setActiveGenre(genre) {
  state.activeGenre = genre;
  document.querySelectorAll('.genre-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.genre === genre);
  });
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
    rowLabel.dataset.instrument = key;
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

  // Beat cursor — overlays all rows
  const cursor = document.createElement('div');
  cursor.id = 'beat-cursor';
  cursor.style.gridRow = '1 / -1';
  cursor.style.gridColumn = '2';
  cursor.style.position = 'relative';
  cursor.style.zIndex = '2';
  cursor.style.pointerEvents = 'none';
  grid.appendChild(cursor);
}

function highlightStep(step) {
  document.querySelectorAll('.grid-cell.current-step').forEach(el => el.classList.remove('current-step'));
  document.querySelectorAll('.step-label.current-step').forEach(el => el.classList.remove('current-step'));

  // Update beat cursor position
  const cursor = document.getElementById('beat-cursor');
  if (cursor) {
    if (step < 0) {
      cursor.style.display = 'none';
    } else {
      cursor.style.display = '';
      cursor.style.gridColumn = String(step + 2); // col 1 = row labels, col 2+ = steps
    }
  }

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

/** Apply timing feedback glow to matching row label */
function applyRowLabelVerdict(instrument, verdict) {
  const rowLabel = document.querySelector(`.row-label[data-instrument="${instrument}"]`);
  if (!rowLabel) return;
  const cls = `row-label-${verdict}`;
  rowLabel.classList.remove('row-label-perfect', 'row-label-close', 'row-label-miss');
  rowLabel.classList.add(cls);
  const duration = verdict === 'miss' ? 1000 : 1500;
  setTimeout(() => rowLabel.classList.remove(cls), duration);
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
    if (score.total > 0) {
      if (state.isLooping) {
        // Rate-limited toast: 1 min if struggling, 2 min if doing well
        const pct = Math.round((score.hits / score.total) * 100);
        const secSince = (Date.now() - state.lastPhase2Toast) / 1000;
        const minGap = pct >= 80 ? 120 : 60;
        if (secSince >= minGap) {
          showToast(pct >= 80 ? `🎤 ${pct}% — great beat!` : `🎤 ${pct}% — keep going!`);
          state.lastPhase2Toast = Date.now();
        }
        setTimeout(clearCellVerdicts, 800);
      } else {
        showAccuracyToast(score);
      }
    }
    timingEval.reset();
  }

  // Listen mode: play once then stop
  if (state.isListenMode) {
    stopPlayback();
    return;
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

function startListenMode() {
  if (!state.pattern) { showToast('Pick a pattern first!'); return; }
  audio.init();
  clearCellVerdicts();
  timingEval.reset();
  state.isListenMode = true;
  state.isLooping    = false;
  state.isPractice   = false;
  saveStreakForToday();
  doCountIn(() => {
    state.isPlaying = true;
    state.loopCount = 0;
    metronome.start();
    setPlayingUI(true);
    document.body.classList.add('focus-mode');
  });
}

function startPracticeMode() {
  if (!state.pattern) { showToast('Pick a pattern first!'); return; }
  audio.init();
  clearCellVerdicts();
  timingEval.reset();
  state.isListenMode = false;
  state.isLooping    = true;
  state.isPractice   = true;
  setBpm(Math.max(40, Math.round(state.pattern.targetBpm * 0.6)));
  saveStreakForToday();
  showToast(`🐢 Practice Mode! Starting at ${state.bpm} BPM`);
  doCountIn(() => {
    state.isPlaying = true;
    state.loopCount = 0;
    metronome.start();
    setPlayingUI(true);
    document.body.classList.add('focus-mode');
  });
}

function stopPlayback() {
  state.isPlaying = false;
  metronome.stop();
  if (state.phase2Active) {
    timingEval.flushAll();
    const score = timingEval.getScore();
    if (score.total > 0) showAccuracyToast(score);
  }
  timingEval.reset();
  setPlayingUI(false);
  document.body.classList.remove('focus-mode');
}

// ── Phase 2 ───────────────────────────────────────────────────────────────────

async function togglePhase2() {
  const btn = document.getElementById('mic-toggle-btn');

  if (state.phase2Active) {
    // Turn off
    state.phase2Active    = false;
    state.lastPhase2Toast = 0;
    hitDetector.stop();
    clearCellVerdicts();
    timingEval.reset();
    btn.textContent = '🎤';
    btn.classList.remove('phase2-on');
    document.getElementById('mic-panel').classList.add('hidden');
    showToast('Mic off');
    return;
  }

  // Turn on
  btn.textContent = '⏳';
  btn.disabled    = true;
  try {
    audio.init();
    timingEval.setAudioContext(audio.context);
    timingEval.onResult = (step, verdict) => {
      updateCellVerdict(step, verdict);
      // Also apply row-label verdict for every instrument that had a note at this step
      if (state.pattern) {
        Object.entries(state.pattern.instruments).forEach(([inst, steps]) => {
          if (steps[step]) applyRowLabelVerdict(inst, verdict);
        });
      }
    };
    hitDetector.onHit   = (t) => timingEval.processHit(t);
    hitDetector.onLevel = (level) => updateMicMeter(level);
    hitDetector.onTick  = () => timingEval.tick();
    await hitDetector.start(audio.context);
    state.phase2Active = true;
    btn.textContent = '🎤';
    btn.classList.add('phase2-on');
    btn.disabled = false;
    document.getElementById('mic-panel').classList.remove('hidden');
    showToast('🎤 Mic on! Play along with the beat!');
  } catch (err) {
    btn.textContent = '🎤';
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

// ── Kit Sounds / Drums Out toggles ────────────────────────────────────────────

function updateDrumsGain() {
  // Both toggles alias the same drumsGain — drums are audible only when BOTH
  // "Kit Sounds" is ON and "Drums Out" is OFF.
  const enabled = state.drumsEnabled && !state.drumsOut;
  audio.setDrumsVolume(enabled ? 1.0 : 0.0);
}

function toggleKitSounds() {
  state.drumsEnabled = !state.drumsEnabled;
  const btn = document.getElementById('kit-sounds-btn');
  btn.classList.toggle('active', state.drumsEnabled);
  updateDrumsGain();
}

function toggleDrumsOut() {
  state.drumsOut = !state.drumsOut;
  const btn = document.getElementById('drums-out-btn');
  btn.classList.toggle('active', state.drumsOut);
  updateDrumsGain();
}

// ── Accuracy toast ────────────────────────────────────────────────────────────

function showAccuracyToast(score) {
  const { total, perfect, close, misses, hits } = score;
  const pct = total > 0 ? Math.round((hits / total) * 100) : 0;

  let emoji, title;
  if (pct === 100) { emoji = '🌟'; title = 'PERFECT! Amazing!'; }
  else if (pct >= 80) { emoji = '🎉'; title = 'Awesome drumming!'; }
  else if (pct >= 60) { emoji = '👍'; title = 'Great job!'; }
  else if (pct >= 40) { emoji = '💪'; title = 'Keep going!'; }
  else                { emoji = '🥁'; title = "You're learning!"; }

  showToast({
    emoji: `${emoji} ${pct}%`,
    title,
    body: `${perfect}🟢 perfect  ${close}🟡 close  ${misses}🔴 missed`,
    duration: 4000,
  });
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
  state.bpm = Math.max(60, Math.min(180, bpm));
  document.getElementById('bpm-slider').value = state.bpm;
  document.getElementById('bpm-display').textContent = state.bpm;
  const hint = document.getElementById('bpm-hint');
  if (hint) hint.textContent = state.bpm < 80 ? '🐢' : state.bpm < 120 ? '🎵' : '🚀';
}

// ── Rewards UI ────────────────────────────────────────────────────────────────

function grantReward(patternId, stars, isPracticeDone) {
  const prevStars = rewards.getStars(patternId);
  const { newStars, earnedBadges } = rewards.awardStars(patternId, stars, { practiceDone: isPracticeDone });
  updateStarCount(); renderPatternList(); updatePatternInfo(state.pattern); renderBadges();
  if (newStars > prevStars || earnedBadges.length > 0) {
    showRewardToast(newStars, earnedBadges);
  }
}

function showRewardToast(stars, earnedBadges) {
  const m3 = ['Drumming superstar! 🌟', 'You nailed it! 🏆', 'You rock the stage! 🎸'];
  const m2 = ['Awesome drumming! 👏', "You're getting so good! 🎉", 'Great job! 💪'];
  const m1 = ['You did it! 🎊', 'Nice work, drummer! 🥁', 'First time complete!'];
  const pool = { 3: m3, 2: m2, 1: m1 }[stars] || m1;
  const title = pool[Math.floor(Math.random() * pool.length)];
  const detail = stars === 3 ? 'Practice Mode — full speed reached!'
               : stars === 2 ? `${state.bpm} BPM — on target!`
               : 'Pattern complete!';
  const badgeLine = earnedBadges.length
    ? '  🏆 ' + earnedBadges.map(b => `${b.emoji} ${b.name}`).join(', ')
    : '';
  showToast({ emoji: '⭐'.repeat(stars), title, body: detail + badgeLine, duration: 4000 });
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
function showToast(msgOrObj, duration) {
  const toast    = document.getElementById('toast');
  const emojiEl  = document.getElementById('toast-emoji');
  const titleEl  = document.getElementById('toast-title');
  const msgEl    = document.getElementById('toast-msg');
  if (!toast) return;

  if (typeof msgOrObj === 'string') {
    emojiEl.textContent = '';
    titleEl.textContent = '';
    msgEl.textContent   = msgOrObj;
    toast.classList.remove('toast-rich');
    duration = duration ?? 3000;
  } else {
    emojiEl.textContent = msgOrObj.emoji || '';
    titleEl.textContent = msgOrObj.title || '';
    msgEl.textContent   = msgOrObj.body  || '';
    toast.classList.add('toast-rich');
    duration = duration ?? msgOrObj.duration ?? 4000;
  }

  toast.classList.remove('hidden', 'fade-out');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.classList.add('hidden'), 500);
  }, duration);
}

// ── UI helpers ────────────────────────────────────────────────────────────────

function setPlayingUI(playing) {
  const practiceBtn = document.getElementById('practice-btn');
  const listenBtn   = document.getElementById('listen-btn');

  if (playing) {
    if (state.isPractice) {
      practiceBtn.textContent = '⏸ Stop';
      practiceBtn.classList.add('playing');
    } else {
      listenBtn.textContent = '⏸ Stop';
      listenBtn.classList.add('playing');
    }
  } else {
    practiceBtn.textContent = '🐢 Practice';
    practiceBtn.classList.remove('playing');
    listenBtn.textContent   = '▶ Listen';
    listenBtn.classList.remove('playing');
  }

  document.getElementById('bpm-slider').disabled = playing && !state.isPractice;
}

// ── Event listeners ───────────────────────────────────────────────────────────

function setupEventListeners() {
  // Practice button
  document.getElementById('practice-btn').addEventListener('click', () => {
    if (state.isPlaying) {
      stopPlayback();
    } else {
      startPracticeMode();
    }
  });

  // Listen button
  document.getElementById('listen-btn').addEventListener('click', () => {
    if (state.isPlaying) {
      stopPlayback();
    } else {
      startListenMode();
    }
  });

  // Mic toggle icon button
  document.getElementById('mic-toggle-btn').addEventListener('click', togglePhase2);

  // Kit Sounds toggle
  document.getElementById('kit-sounds-btn').addEventListener('click', toggleKitSounds);

  // Drums Out toggle
  document.getElementById('drums-out-btn').addEventListener('click', toggleDrumsOut);

  // BPM slider
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

  // Level filter buttons
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => setActiveLevel(btn.dataset.level));
  });

  // Focus mode — click grid-wrapper to restore
  document.getElementById('grid-wrapper').addEventListener('click', (e) => {
    if (document.body.classList.contains('focus-mode')) {
      document.body.classList.remove('focus-mode');
    }
  });

  // Focus restore hint button
  const hint = document.getElementById('focus-restore-hint');
  if (hint) {
    hint.addEventListener('click', (e) => {
      e.stopPropagation();
      document.body.classList.remove('focus-mode');
    });
  }
}
