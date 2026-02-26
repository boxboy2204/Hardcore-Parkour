const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const characterSelect = document.getElementById("characterSelect");
const startBtn = document.getElementById("startBtn");
const retryBtn = document.getElementById("retryBtn");
const summaryPanel = document.getElementById("summaryPanel");
const summaryText = document.getElementById("summaryText");

const SAVE_KEY = "hardcore_parkour_save_v1";

const CHARACTER_PRESETS = {
  michael: {
    label: "Michael",
    color: "#1f4f9b",
    tieColor: "#a11d2f",
    baseSpeed: 300,
    jumpPower: 760,
    styleGain: 1.8,
    maxJumps: 1,
    hitboxScale: 1.0,
    canBreakWeakFloorboard: false,
  },
  dwight: {
    label: "Dwight",
    color: "#b07a2f",
    tieColor: "#654531",
    baseSpeed: 280,
    jumpPower: 710,
    styleGain: 1.45,
    maxJumps: 1,
    hitboxScale: 0.92,
    canBreakWeakFloorboard: true,
  },
  andy: {
    label: "Andy",
    color: "#952f2f",
    tieColor: "#f4d76b",
    baseSpeed: 305,
    jumpPower: 735,
    styleGain: 1.6,
    maxJumps: 2,
    hitboxScale: 1.18,
    canBreakWeakFloorboard: false,
  },
};

const GAME = {
  gravity: 1800,
  groundY: 430,
  floorTop: 455,
  parkourWindowSec: 0.2,
  speedBoostSec: 0.85,
  speedBoostValue: 120,
  stumbleSec: 0.45,
  runTimeSec: 70,
  attackDurationSec: 0.14,
  attackCooldownSec: 0.24,
  slideHoldThresholdSec: 0.14,
  slideInitialSpeed: 560,
  slideDeceleration: 720,
  slideScorePerObstacle: 80,
};

const WORLDS = [
  { id: "bullpen", label: "The Bullpen", subtitle: "Jump desks, dodge cats" },
  { id: "warehouse", label: "The Warehouse", subtitle: "Belts + stealth setup" },
  { id: "streets", label: "Scranton Streets", subtitle: "Work bus rooftop run" },
  { id: "corporate", label: "NYC Corporate", subtitle: "Folders and elevators" },
  { id: "pursuit", label: "Final Pursuit", subtitle: "High-speed car roofs" },
];

const THEME_OBSTACLE_POOLS = {
  bullpen: ["desk", "cat", "intern"],
  warehouse: ["intern", "weak_floorboard", "desk"],
  streets: ["cat", "snowball", "intern"],
  corporate: ["folder", "desk", "intern"],
  pursuit: ["snowball", "folder", "cat"],
};

const THEME_LABELS = {
  bullpen: "The Bullpen",
  warehouse: "The Warehouse",
  streets: "Scranton Streets",
  corporate: "NYC Corporate",
  pursuit: "Final Pursuit",
};

const SOUL_QUIPS = {
  michael: [
    "Michael: This run is going to be a TED Talk with knees.",
    "Michael: If parkour is wrong, I do not want to be right.",
    "Michael: I am not superstitious, but I am a little jump-stitious.",
  ],
  dwight: [
    "Dwight: Through obstacles, over fear, under budget.",
    "Dwight: Precision. Discipline. Beet-powered speed.",
    "Dwight: Bears. Beets. Wall-jumps.",
  ],
  andy: [
    "Andy: Nard-dog note: slide first, apologize never.",
    "Andy: If I fall, call it interpretive choreography.",
    "Andy: This is Cornell-level athletic theater.",
  ],
};

const state = {
  scene: "menu",
  running: false,
  paused: false,
  gameOver: false,
  runWorldId: "bullpen",
  selectedWorldId: "bullpen",
  worldTimeSec: 0,
  score: 0,
  style: 0,
  multiplier: 1,
  bestChain: 0,
  landingWindowLeft: 0,
  pendingLanding: false,
  speedBoostLeft: 0,
  stumbleLeft: 0,
  attackLeft: 0,
  attackCooldownLeft: 0,
  slideActive: false,
  slideSpeed: 0,
  spaceHeld: false,
  spaceHoldSec: 0,
  pendingSpaceTapJump: false,
  floatingText: [],
  particles: [],
  stars: 0,
  earnedSchruteBucks: 0,
  earnedStanleyNickels: 0,
  elapsedSec: 0,
  spawnTimerSec: 1.1,
  screenShake: 0,
  theme: "bullpen",
  worldBannerText: "",
  worldBannerLeft: 0,
  audioCtx: null,
  player: null,
  obstacles: [],
  menuCards: [],
  menuDialogue: "Pick a Polaroid so we can go, now.",
  saveData: null,
};

function createDefaultSave() {
  return {
    unlockedWorldIndex: 0,
    currencies: {
      schruteBucks: 0,
      stanleyNickels: 0,
    },
    unlocks: {
      pamFound: false,
      jimDeskKey: false,
      shopUnlocked: false,
      outfitsUnlocked: [],
    },
    achievements: {
      bushiestBeaver: false,
      whitestSneakers: false,
      dontGoInThere: false,
    },
    stats: {
      bestHardcoreChain: 0,
      lifetimeRuns: 0,
    },
  };
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return createDefaultSave();
    const parsed = JSON.parse(raw);
    return {
      ...createDefaultSave(),
      ...parsed,
      currencies: { ...createDefaultSave().currencies, ...(parsed.currencies || {}) },
      unlocks: { ...createDefaultSave().unlocks, ...(parsed.unlocks || {}) },
      achievements: { ...createDefaultSave().achievements, ...(parsed.achievements || {}) },
      stats: { ...createDefaultSave().stats, ...(parsed.stats || {}) },
    };
  } catch {
    return createDefaultSave();
  }
}

function persistSave() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state.saveData));
}

function ensureAudioContext() {
  if (state.audioCtx) return state.audioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  state.audioCtx = new Ctx();
  return state.audioCtx;
}

function playThemeSwitchCue() {
  const audioCtx = ensureAudioContext();
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") audioCtx.resume();

  const now = audioCtx.currentTime;
  const notes = [370, 494];
  notes.forEach((frequency, idx) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(frequency, now + idx * 0.09);
    gain.gain.setValueAtTime(0.0001, now + idx * 0.09);
    gain.gain.exponentialRampToValueAtTime(0.11, now + idx * 0.09 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.11);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now + idx * 0.09);
    osc.stop(now + idx * 0.09 + 0.12);
  });
}

function isWorldUnlocked(worldId) {
  const idx = WORLDS.findIndex((w) => w.id === worldId);
  return idx !== -1 && idx <= state.saveData.unlockedWorldIndex;
}

function setMenuDialogue() {
  const runner = characterSelect.value;
  const selected = WORLDS.find((w) => w.id === state.selectedWorldId) || WORLDS[0];
  const quips = SOUL_QUIPS[runner];
  const quip = quips[Math.floor(Math.random() * quips.length)];

  if (runner === "michael") {
    state.menuDialogue = `Pick ${selected.label}. ${quip}`;
  } else if (runner === "dwight") {
    state.menuDialogue = `${selected.label} is tactically sound. ${quip}`;
  } else {
    state.menuDialogue = `${selected.label} gets a cappella hype. ${quip}`;
  }
}

function switchScene(sceneId) {
  state.scene = sceneId;
  state.paused = false;
  summaryPanel.hidden = true;
  updateUiForScene();
  if (sceneId === "menu") setMenuDialogue();
}

function updateUiForScene() {
  if (state.scene === "menu") {
    startBtn.textContent = "Launch Level";
    retryBtn.textContent = "Shop";
    retryBtn.hidden = false;
  } else if (state.scene === "run") {
    startBtn.textContent = "Back To Menu";
    retryBtn.textContent = "Run It Back";
    retryBtn.hidden = false;
  } else if (state.scene === "shop") {
    startBtn.textContent = "Back To Menu";
    retryBtn.textContent = "Go Annex";
    retryBtn.hidden = false;
  } else {
    startBtn.textContent = "Back To Menu";
    retryBtn.textContent = "Go Shop";
    retryBtn.hidden = false;
  }
}

function resetRunState(worldId = state.selectedWorldId) {
  const preset = CHARACTER_PRESETS[characterSelect.value];
  state.scene = "run";
  state.running = true;
  state.paused = false;
  state.gameOver = false;
  state.runWorldId = worldId;
  state.theme = worldId;
  state.worldTimeSec = 0;
  state.score = 0;
  state.style = 0;
  state.multiplier = 1;
  state.bestChain = 0;
  state.landingWindowLeft = 0;
  state.pendingLanding = false;
  state.speedBoostLeft = 0;
  state.stumbleLeft = 0;
  state.attackLeft = 0;
  state.attackCooldownLeft = 0;
  state.slideActive = false;
  state.slideSpeed = 0;
  state.spaceHeld = false;
  state.spaceHoldSec = 0;
  state.pendingSpaceTapJump = false;
  state.floatingText = [];
  state.particles = [];
  state.stars = 0;
  state.earnedSchruteBucks = 0;
  state.earnedStanleyNickels = 0;
  state.elapsedSec = 0;
  state.spawnTimerSec = 0.7;
  state.screenShake = 0;
  state.worldBannerText = THEME_LABELS[worldId] || worldId;
  state.worldBannerLeft = 1.2;
  state.obstacles = [];

  state.player = {
    preset,
    x: 180,
    y: GAME.groundY,
    width: 42,
    height: 62,
    vy: 0,
    grounded: true,
    jumpsUsed: 0,
    hp: 4,
  };

  state.saveData.stats.lifetimeRuns += 1;
  persistSave();
  playThemeSwitchCue();
  updateUiForScene();
}

function addFloatingText(text, x, y, color) {
  state.floatingText.push({ text, x, y, color, age: 0, ttl: 0.8 });
}

function addHitParticles(x, y, color) {
  for (let i = 0; i < 7; i += 1) {
    state.particles.push({
      x,
      y,
      vx: 130 + Math.random() * 220,
      vy: -180 + Math.random() * 240,
      color,
      age: 0,
      ttl: 0.35 + Math.random() * 0.2,
    });
  }
}

function spawnObstacle() {
  const distanceFactor = Math.min(1.75, 1 + state.worldTimeSec / 75);
  const pool = THEME_OBSTACLE_POOLS[state.theme] || THEME_OBSTACLE_POOLS.bullpen;
  const type = pool[Math.floor(Math.random() * pool.length)];

  const size = {
    desk: { w: 52, h: 46, topOffset: 0, hp: 1 },
    cat: { w: 34, h: 24, topOffset: -2, hp: 1 },
    intern: { w: 40, h: 58, topOffset: 0, hp: 1 },
    weak_floorboard: { w: 58, h: 20, topOffset: 14, hp: 1 },
    snowball: { w: 24, h: 24, topOffset: -8, hp: 1 },
    folder: { w: 34, h: 18, topOffset: -28, hp: 1 },
  }[type];

  const top = GAME.groundY - size.h + size.topOffset;
  state.obstacles.push({
    type,
    x: canvas.width + 20,
    y: top,
    width: size.w,
    height: size.h,
    hp: size.hp,
    hit: false,
    speedFactor: distanceFactor,
  });
}

function calculateStars() {
  const base = state.style + state.score * 0.4 + state.bestChain * 45;
  if (base < 1200) return 1;
  if (base < 2200) return 2;
  if (base < 3500) return 3;
  if (base < 4800) return 4;
  return 5;
}

function endRun(reason = "time") {
  state.running = false;
  state.gameOver = true;
  state.stars = calculateStars();
  state.earnedSchruteBucks = Math.floor(state.style / 15 + state.stars * 90);
  state.earnedStanleyNickels = Math.floor(state.score / 80 + state.stars * 8);

  state.saveData.currencies.schruteBucks += state.earnedSchruteBucks;
  state.saveData.currencies.stanleyNickels += state.earnedStanleyNickels;
  state.saveData.stats.bestHardcoreChain = Math.max(state.saveData.stats.bestHardcoreChain, state.bestChain);

  if (reason === "time") {
    const worldIdx = WORLDS.findIndex((w) => w.id === state.runWorldId);
    if (worldIdx !== -1) {
      state.saveData.unlockedWorldIndex = Math.max(state.saveData.unlockedWorldIndex, worldIdx + 1);
      state.saveData.unlockedWorldIndex = Math.min(state.saveData.unlockedWorldIndex, WORLDS.length - 1);
    }
  }

  persistSave();

  const saturdayLine =
    state.stars === 1
      ? "David Wallace: I am going to need to see you on Saturday."
      : "David Wallace approves this performance review.";

  summaryText.textContent = `${state.player.preset.label} finished ${THEME_LABELS[state.runWorldId]} with ${
    state.stars
  }/5 stars. Score ${Math.floor(state.score)}, Style ${Math.floor(state.style)}, Best Hardcore chain ${
    state.bestChain
  }. Rewards: +${state.earnedSchruteBucks} Schrute Bucks, +${
    state.earnedStanleyNickels
  } Stanley Nickels. Total Wallet: ${state.saveData.currencies.schruteBucks} SB / ${
    state.saveData.currencies.stanleyNickels
  } SN. ${saturdayLine}`;
  summaryPanel.hidden = false;
}

function doParkourShout() {
  if (!state.running || state.paused) return;
  if (state.pendingLanding && state.landingWindowLeft > 0) {
    state.pendingLanding = false;
    state.landingWindowLeft = 0;
    state.speedBoostLeft = GAME.speedBoostSec;
    state.multiplier = Math.min(20, state.multiplier + 1);
    state.bestChain = Math.max(state.bestChain, state.multiplier - 1);
    addFloatingText("HARDCORE!", state.player.x + 16, state.player.y - 28, "#ffd54d");
  }
}

function attack() {
  if (!state.running || state.paused || state.attackCooldownLeft > 0) return;
  state.attackLeft = GAME.attackDurationSec;
  state.attackCooldownLeft = GAME.attackCooldownSec;
}

function stumbleFail() {
  state.pendingLanding = false;
  state.landingWindowLeft = 0;
  state.stumbleLeft = GAME.stumbleSec;
  state.multiplier = 1;
  addFloatingText("OOF", state.player.x + 10, state.player.y - 24, "#ffffff");
}

function jump() {
  if (!state.running || state.paused) return;
  if (state.slideActive) return;
  if (state.player.jumpsUsed >= state.player.preset.maxJumps) return;
  state.player.vy = -state.player.preset.jumpPower;
  state.player.grounded = false;
  state.player.jumpsUsed += 1;
}

function startSlide() {
  if (!state.running || state.paused) return;
  if (!state.player.grounded || state.slideActive) return;
  state.slideActive = true;
  state.slideSpeed = GAME.slideInitialSpeed;
  state.pendingSpaceTapJump = false;
  addFloatingText("SLIDE!", state.player.x + 10, state.player.y - 30, "#9ce3ff");
}

function onLanding() {
  state.pendingLanding = true;
  state.landingWindowLeft = GAME.parkourWindowSec;
}

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function handleObstacleCollision(obstacle) {
  if (obstacle.hit) return;
  obstacle.hit = true;

  if (obstacle.type === "weak_floorboard" && state.player.preset.canBreakWeakFloorboard) {
    state.score += 85;
    addFloatingText("Shortcut!", state.player.x + 14, state.player.y - 34, "#9cd67a");
    addHitParticles(obstacle.x + obstacle.width * 0.5, obstacle.y + obstacle.height * 0.5, "#bfaa75");
    return;
  }

  state.player.hp -= 1;
  state.multiplier = 1;
  state.score = Math.max(0, state.score - 80);
  state.speedBoostLeft = 0;
  state.stumbleLeft = 0.6;
  state.screenShake = 0.22;
  addFloatingText("Injury", state.player.x + 4, state.player.y - 28, "#ff7062");
  addHitParticles(state.player.x + state.player.width, state.player.y - 16, "#ff8f7d");

  if (state.player.hp <= 0) endRun("defeat");
}

function handleAttackHits(playerBox) {
  if (state.attackLeft <= 0) return;

  const attackBox = {
    x: playerBox.x + playerBox.width - 4,
    y: playerBox.y + 8,
    width: 68,
    height: playerBox.height - 12,
  };

  for (const obstacle of state.obstacles) {
    if (obstacle.hit || obstacle.type === "weak_floorboard") continue;
    if (!intersects(attackBox, obstacle)) continue;

    obstacle.hit = true;
    state.score += 120;
    state.style += 36 * state.multiplier;
    addFloatingText("SMACK", obstacle.x + 8, obstacle.y - 10, "#ffe28a");
    addHitParticles(obstacle.x + obstacle.width * 0.5, obstacle.y + obstacle.height * 0.45, "#f9e2a5");
  }
}

function updateRun(dt) {
  if (!state.running || state.paused) return;

  state.elapsedSec += dt;
  state.worldTimeSec += dt;

  if (state.worldTimeSec >= GAME.runTimeSec) {
    endRun("time");
    return;
  }

  const player = state.player;
  const prevGrounded = player.grounded;

  player.vy += GAME.gravity * dt;
  player.y += player.vy * dt;

  if (player.y >= GAME.groundY) {
    player.y = GAME.groundY;
    player.vy = 0;
    if (!player.grounded) onLanding();
    player.grounded = true;
    player.jumpsUsed = 0;
  } else {
    player.grounded = false;
  }

  if (prevGrounded && !player.grounded) {
    state.pendingLanding = false;
    state.landingWindowLeft = 0;
  }

  if (state.landingWindowLeft > 0) {
    state.landingWindowLeft -= dt;
    if (state.landingWindowLeft <= 0 && state.pendingLanding) stumbleFail();
  }

  state.speedBoostLeft = Math.max(0, state.speedBoostLeft - dt);
  state.stumbleLeft = Math.max(0, state.stumbleLeft - dt);
  state.attackLeft = Math.max(0, state.attackLeft - dt);
  state.attackCooldownLeft = Math.max(0, state.attackCooldownLeft - dt);
  state.screenShake = Math.max(0, state.screenShake - dt);

  if (state.spaceHeld) {
    state.spaceHoldSec += dt;
    if (
      !state.slideActive &&
      state.player.grounded &&
      state.spaceHoldSec >= GAME.slideHoldThresholdSec &&
      state.pendingSpaceTapJump
    ) {
      startSlide();
    }
  }

  const baseSpeed = player.preset.baseSpeed;
  const speedModifier = state.speedBoostLeft > 0 ? GAME.speedBoostValue : 0;
  const stumblePenalty = state.stumbleLeft > 0 ? -140 : 0;
  const movementSpeed = Math.max(120, baseSpeed + speedModifier + stumblePenalty);

  if (state.slideActive) {
    state.slideSpeed = Math.max(0, state.slideSpeed - GAME.slideDeceleration * dt);
    if (state.slideSpeed <= 0 || !state.player.grounded) {
      state.slideActive = false;
      state.slideSpeed = 0;
    }
  }

  const runSpeed = state.slideActive ? movementSpeed + state.slideSpeed : movementSpeed;

  state.score += runSpeed * dt * 0.1;
  state.style += 20 * dt * state.multiplier * player.preset.styleGain;

  state.spawnTimerSec -= dt;
  if (state.spawnTimerSec <= 0) {
    spawnObstacle();
    const spawnGap = 0.62 + Math.random() * 0.8;
    state.spawnTimerSec = Math.max(0.34, spawnGap - state.worldTimeSec * 0.004);
  }

  const hitboxW = player.width * player.preset.hitboxScale;
  const hitboxH = player.height * player.preset.hitboxScale;
  const playerBox = {
    x: player.x + (player.width - hitboxW) / 2,
    y: player.y - player.height + (player.height - hitboxH),
    width: hitboxW,
    height: hitboxH,
  };

  handleAttackHits(playerBox);

  for (const obstacle of state.obstacles) {
    obstacle.x -= runSpeed * dt * obstacle.speedFactor;
    if (obstacle.hit) continue;
    if (!intersects(playerBox, obstacle)) continue;

    if (state.slideActive) {
      obstacle.hit = true;
      state.score += GAME.slideScorePerObstacle;
      state.style += 14;
      addFloatingText("SWOOSH", obstacle.x + 4, obstacle.y - 8, "#8fe4ff");
      addHitParticles(obstacle.x + obstacle.width * 0.5, obstacle.y + obstacle.height * 0.5, "#8ed9ff");
      continue;
    }

    handleObstacleCollision(obstacle);
  }

  state.obstacles = state.obstacles.filter((obs) => obs.x + obs.width > -20 && !obs.hit);

  for (const text of state.floatingText) {
    text.age += dt;
    text.y -= 24 * dt;
  }
  state.floatingText = state.floatingText.filter((t) => t.age < t.ttl);

  for (const p of state.particles) {
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 880 * dt;
  }
  state.particles = state.particles.filter((p) => p.age < p.ttl);
  state.worldBannerLeft = Math.max(0, state.worldBannerLeft - dt);
}

function drawRunBackground() {
  const palettes = {
    bullpen: ["#79cbff", "#e9f2db", "#5f99cb", "#b9ddff"],
    warehouse: ["#95b9d9", "#dee4d2", "#5d7e98", "#c4daef"],
    streets: ["#8da7ff", "#e8d9cf", "#5f6ec9", "#b8beff"],
    corporate: ["#7ed6e3", "#efe6d1", "#4ea1b0", "#bcf4ff"],
    pursuit: ["#4776ff", "#d6d7d5", "#2344bb", "#8cabff"],
  };
  const [sky, floor, mid, haze] = palettes[state.theme];
  const xShift = state.worldTimeSec * 50;

  const grad = ctx.createLinearGradient(0, 0, 0, GAME.floorTop);
  grad.addColorStop(0, sky);
  grad.addColorStop(1, haze);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, GAME.floorTop);

  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (let i = 0; i < 4; i += 1) {
    const x = (i * 260 - (xShift * 0.22) % 1100) - 120;
    ctx.beginPath();
    ctx.ellipse(x, 90 + (i % 2) * 24, 86, 24, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = mid;
  for (let i = 0; i < 10; i += 1) {
    const w = 110 + (i % 3) * 28;
    const x = (i * 140 - (xShift * 0.6) % 1400) - 20;
    const h = 70 + (i % 4) * 18;
    ctx.fillRect(x, 292 - h, w, h);
  }

  ctx.fillStyle = floor;
  ctx.fillRect(0, GAME.floorTop, canvas.width, canvas.height - GAME.floorTop);

  ctx.fillStyle = "rgba(0,0,0,0.12)";
  for (let i = 0; i < 24; i += 1) {
    const x = (i * 54 - (xShift * 1.3) % 1200) - 10;
    ctx.fillRect(x, GAME.floorTop + 24, 28, 4);
  }

  // Soft scanline pass to keep the crunchy 8-bit feel.
  ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
  for (let y = 0; y < canvas.height; y += 4) {
    ctx.fillRect(0, y, canvas.width, 1);
  }
}

function drawPlayer() {
  const player = state.player;
  const x = player.x;
  const slideHeight = state.slideActive ? 22 : 0;
  const visualHeight = player.height - slideHeight;
  const y = player.y - visualHeight;
  const runCycle = Math.sin(state.worldTimeSec * 14);

  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(x + 21, GAME.groundY + 4, 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f3d6b3";
  ctx.fillRect(x + 7, y + 2, 28, state.slideActive ? 9 : 12);

  ctx.fillStyle = player.preset.color;
  ctx.fillRect(x + 4, y + (state.slideActive ? 10 : 14), 34, state.slideActive ? 22 : 34);

  ctx.fillStyle = player.preset.tieColor;
  ctx.fillRect(x + 19, y + (state.slideActive ? 12 : 18), 4, state.slideActive ? 11 : 20);

  const armY = y + 20 + runCycle * 2;
  ctx.fillStyle = "#d9ba97";
  ctx.fillRect(x - 1, state.slideActive ? y + 16 : armY, 8, state.slideActive ? 8 : 16);
  if (state.attackLeft > 0) {
    ctx.fillRect(x + 34, y + (state.slideActive ? 15 : 18), 14, 8);
    ctx.fillStyle = "#ffe189";
    ctx.fillRect(x + 48, y + (state.slideActive ? 17 : 20), 18, 4);
  } else {
    ctx.fillRect(x + 35, state.slideActive ? y + 16 : armY, 8, state.slideActive ? 8 : 16);
  }

  const legOffset = player.grounded ? runCycle * 4 : 0;
  ctx.fillStyle = "#1c2431";
  if (state.slideActive) {
    ctx.fillRect(x + 12, y + 28, 17, 7);
  } else {
    ctx.fillRect(x + 10, y + 48, 9, 14 + Math.abs(legOffset));
    ctx.fillRect(x + 24, y + 48, 9, 14 + Math.abs(legOffset));
  }

  ctx.fillStyle = "#111";
  ctx.fillRect(x + 12, y + 6, 6, 4);
  ctx.fillRect(x + 24, y + 6, 6, 4);
}

function drawObstacleSprite(obs) {
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(obs.x + obs.width * 0.5, GAME.groundY + 4, obs.width * 0.48, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  if (obs.type === "desk") {
    ctx.fillStyle = "#6b4b31";
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    ctx.fillStyle = "#8d6649";
    ctx.fillRect(obs.x + 6, obs.y + 7, obs.width - 12, 10);
    ctx.fillStyle = "#c4a58c";
    ctx.fillRect(obs.x + 7, obs.y + 22, 14, 8);
    ctx.fillRect(obs.x + 30, obs.y + 22, 14, 8);
  } else if (obs.type === "cat") {
    ctx.fillStyle = "#dfc09d";
    ctx.fillRect(obs.x + 4, obs.y + 6, obs.width - 8, obs.height - 8);
    ctx.fillRect(obs.x, obs.y + 2, 8, 8);
    ctx.fillRect(obs.x + obs.width - 8, obs.y + 2, 8, 8);
    ctx.fillStyle = "#2b2b2b";
    ctx.fillRect(obs.x + 10, obs.y + 11, 4, 4);
    ctx.fillRect(obs.x + obs.width - 14, obs.y + 11, 4, 4);
  } else if (obs.type === "intern") {
    ctx.fillStyle = "#2d5a8f";
    ctx.fillRect(obs.x + 6, obs.y + 16, obs.width - 12, obs.height - 16);
    ctx.fillStyle = "#efcfab";
    ctx.fillRect(obs.x + 10, obs.y, obs.width - 20, 16);
    ctx.fillStyle = "#162635";
    ctx.fillRect(obs.x + 12, obs.y + 30, 6, 18);
    ctx.fillRect(obs.x + 22, obs.y + 30, 6, 18);
  } else if (obs.type === "snowball") {
    ctx.fillStyle = "#f2f7ff";
    ctx.beginPath();
    ctx.arc(obs.x + obs.width * 0.5, obs.y + obs.height * 0.5, obs.width * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#dbe5f2";
    ctx.fillRect(obs.x + 8, obs.y + 6, 4, 3);
  } else if (obs.type === "folder") {
    ctx.fillStyle = "#d6a95c";
    ctx.fillRect(obs.x, obs.y + 3, obs.width, obs.height - 3);
    ctx.fillStyle = "#e8c480";
    ctx.fillRect(obs.x + 4, obs.y, 12, 4);
  } else {
    ctx.fillStyle = "#b79e6a";
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    ctx.fillStyle = "#d9c38b";
    ctx.fillRect(obs.x + 6, obs.y + 5, obs.width - 12, 4);
  }
}

function drawObstacles() {
  for (const obs of state.obstacles) drawObstacleSprite(obs);
}

function drawHud() {
  ctx.fillStyle = "rgba(15,20,30,0.74)";
  ctx.fillRect(12, 12, 450, 136);

  ctx.fillStyle = "#fff";
  ctx.font = "16px Trebuchet MS";
  ctx.fillText(`Runner: ${state.player.preset.label}`, 20, 34);
  ctx.fillText(`HP: ${state.player.hp}`, 20, 56);
  ctx.fillText(`Score: ${Math.floor(state.score)}`, 20, 78);
  ctx.fillText(`Style: ${Math.floor(state.style)}`, 20, 100);
  ctx.fillText(`Wallet: ${state.saveData.currencies.schruteBucks} SB / ${state.saveData.currencies.stanleyNickels} SN`, 20, 122);

  ctx.fillStyle = "#ffd54d";
  ctx.fillText(`x${state.multiplier} Hardcore`, 210, 56);

  const timeLeft = Math.max(0, GAME.runTimeSec - state.worldTimeSec);
  ctx.fillStyle = "#d4e6ff";
  ctx.fillText(`Time: ${timeLeft.toFixed(1)}s`, 210, 78);
  ctx.fillText(`World: ${THEME_LABELS[state.theme] || state.theme}`, 210, 100);
  ctx.fillText(`Parkour: J  Hit: K  Pause: Enter`, 210, 122);

  if (state.slideActive) {
    ctx.fillStyle = "#8fdcff";
    ctx.fillText(`Slide: ${Math.ceil(state.slideSpeed)}`, 338, 56);
  }

  if (state.pendingLanding && state.landingWindowLeft > 0) {
    const pct = state.landingWindowLeft / GAME.parkourWindowSec;
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(480, 22, 250, 26);
    ctx.fillStyle = "#ffd54d";
    ctx.fillRect(480, 22, 250 * pct, 26);
    ctx.strokeStyle = "#111";
    ctx.strokeRect(480, 22, 250, 26);
    ctx.fillStyle = "#111";
    ctx.fillText("PARKOUR NOW (J)", 508, 40);
  }
}

function drawFloatingText() {
  for (const text of state.floatingText) {
    const alpha = 1 - text.age / text.ttl;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = text.color;
    ctx.font = "bold 24px Trebuchet MS";
    ctx.fillText(text.text, text.x, text.y);
    ctx.globalAlpha = 1;
  }
}

function drawParticles() {
  for (const p of state.particles) {
    const alpha = 1 - p.age / p.ttl;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 4, 4);
    ctx.globalAlpha = 1;
  }
}

function drawMenuScene() {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#1c3048");
  grad.addColorStop(1, "#243958");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#313f52";
  ctx.fillRect(70, 70, 820, 380);
  ctx.fillStyle = "#f4f2e7";
  ctx.fillRect(92, 92, 776, 336);

  ctx.strokeStyle = "#8b2e2e";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(116, 116);
  ctx.lineTo(832, 390);
  ctx.moveTo(130, 365);
  ctx.lineTo(780, 148);
  ctx.stroke();

  ctx.fillStyle = "#1f2938";
  ctx.font = "bold 20px Trebuchet MS";
  ctx.fillText("Conference Room - Choose a Polaroid", 286, 60);

  state.menuCards = [];
  for (let i = 0; i < WORLDS.length; i += 1) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 125 + col * 245 + (row === 1 ? 125 : 0);
    const y = 128 + row * 165;
    const w = 190;
    const h = 130;
    const world = WORLDS[i];
    const selected = state.selectedWorldId === world.id;
    const unlocked = isWorldUnlocked(world.id);

    ctx.fillStyle = selected ? "#fff8c9" : "#fffdf3";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = selected ? "#d3a324" : "#8f8a80";
    ctx.lineWidth = selected ? 4 : 2;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = unlocked ? "#10203d" : "#6e6e6e";
    ctx.font = "bold 18px Trebuchet MS";
    ctx.fillText(world.label, x + 12, y + 28);
    ctx.font = "14px Trebuchet MS";
    ctx.fillText(unlocked ? world.subtitle : "Locked", x + 12, y + 50);

    if (!unlocked) {
      ctx.fillStyle = "rgba(40,40,45,0.45)";
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = "#f4e8cc";
      ctx.font = "bold 22px Trebuchet MS";
      ctx.fillText("LOCKED", x + 55, y + 76);
    }

    state.menuCards.push({ x, y, w, h, worldId: world.id, unlocked });
  }

  const anim = Math.sin(state.elapsedSec * 5);
  const player = CHARACTER_PRESETS[characterSelect.value];
  const px = 64;
  const py = 470;

  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath();
  ctx.ellipse(px + 24, py + 6, 24, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f3d6b3";
  ctx.fillRect(px + 10, py - 62, 28, 12);
  ctx.fillStyle = player.color;
  ctx.fillRect(px + 8, py - 50, 34, 36);
  ctx.fillStyle = player.tieColor;
  ctx.fillRect(px + 23, py - 45, 4, 18);
  ctx.fillStyle = "#1c2431";
  ctx.fillRect(px + 13, py - 14, 9, 15 + Math.abs(anim * 2));
  ctx.fillRect(px + 27, py - 14, 9, 15 + Math.abs(anim * 2));

  ctx.fillStyle = "rgba(15,20,30,0.82)";
  ctx.fillRect(20, 480, 920, 50);
  ctx.strokeStyle = "rgba(124, 199, 255, 0.45)";
  ctx.strokeRect(20, 480, 920, 50);

  // Keep dialogue and controls in separate rows to avoid overlap.
  const trimmedDialogue = state.menuDialogue.length > 78 ? `${state.menuDialogue.slice(0, 75)}...` : state.menuDialogue;
  ctx.fillStyle = "#f5ead6";
  ctx.font = "bold 16px Trebuchet MS";
  ctx.fillText(trimmedDialogue, 34, 501);

  ctx.fillStyle = "#fff3b4";
  ctx.font = "15px Trebuchet MS";
  ctx.fillText("Enter: Launch Level   Click Polaroids   S: Shop   A: Annex", 34, 521);
}

function drawShopScene() {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#2f2b22");
  grad.addColorStop(1, "#4e3d2d");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(14,17,21,0.7)";
  ctx.fillRect(140, 90, 680, 360);
  ctx.strokeStyle = "#f1b864";
  ctx.strokeRect(140, 90, 680, 360);

  ctx.fillStyle = "#ffd480";
  ctx.font = "bold 34px Trebuchet MS";
  ctx.fillText("Break Room Shop", 350, 150);

  ctx.fillStyle = "#f4ead7";
  ctx.font = "20px Trebuchet MS";
  const questLine = state.saveData.unlocks.pamFound
    ? "Pam rescued: Jim's Desk Key acquired. Top row unlocked."
    : "Quest lock active: Find Pam in Warehouse (mission not built yet).";
  ctx.fillText(questLine, 170, 215);
  ctx.fillText(`Wallet: ${state.saveData.currencies.schruteBucks} Schrute Bucks`, 170, 255);
  ctx.fillText(`Wallet: ${state.saveData.currencies.stanleyNickels} Stanley Nickels`, 170, 285);

  ctx.fillStyle = "#c5d9f2";
  ctx.font = "18px Trebuchet MS";
  ctx.fillText("Jim says the vending machine is 90% Jell-O and 10% disappointment.", 170, 345);
  ctx.fillText("Press Enter for Menu or use top buttons.", 170, 375);
}

function drawAnnexScene() {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#3a2145");
  grad.addColorStop(1, "#5a2a4a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(14,17,21,0.7)";
  ctx.fillRect(140, 90, 680, 360);
  ctx.strokeStyle = "#ff9fd7";
  ctx.strokeRect(140, 90, 680, 360);

  ctx.fillStyle = "#ffc5e8";
  ctx.font = "bold 34px Trebuchet MS";
  ctx.fillText("Annex Boutique", 338, 150);

  ctx.fillStyle = "#f4ead7";
  ctx.font = "20px Trebuchet MS";
  ctx.fillText(`Outfits unlocked: ${state.saveData.unlocks.outfitsUnlocked.length}`, 170, 220);
  ctx.fillText(
    `Dundies: ${Object.values(state.saveData.achievements).filter(Boolean).length}/3 unlocked`,
    170,
    255
  );
  ctx.fillText("Kelly says this room needs 40% more drama and 200% more glitter.", 170, 300);

  ctx.fillStyle = "#c5d9f2";
  ctx.font = "18px Trebuchet MS";
  ctx.fillText("Press Enter for Menu or use top buttons.", 170, 355);
}

function drawRunScene() {
  const shakeX = state.screenShake > 0 ? (Math.random() - 0.5) * 10 * state.screenShake : 0;
  const shakeY = state.screenShake > 0 ? (Math.random() - 0.5) * 8 * state.screenShake : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);
  drawRunBackground();
  drawObstacles();
  drawPlayer();
  drawParticles();
  drawFloatingText();
  drawHud();
  ctx.restore();

  if (state.paused && !state.gameOver) {
    ctx.fillStyle = "rgba(15,20,30,0.58)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f5ead6";
    ctx.font = "bold 40px Trebuchet MS";
    ctx.fillText("PAUSED", 405, 250);
    ctx.font = "20px Trebuchet MS";
    ctx.fillText("Press Enter to resume", 386, 288);
  }

  if (state.worldBannerLeft > 0 && !state.gameOver) {
    const alpha = Math.min(1, state.worldBannerLeft / 0.35);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(8, 12, 20, 0.72)";
    ctx.fillRect(245, 136, 470, 86);
    ctx.strokeStyle = "rgba(255, 214, 110, 0.75)";
    ctx.strokeRect(245, 136, 470, 86);
    ctx.fillStyle = "#ffd66e";
    ctx.font = "bold 18px Trebuchet MS";
    ctx.fillText("LEVEL START", 428, 166);
    ctx.fillStyle = "#f5ead6";
    ctx.font = "bold 32px Trebuchet MS";
    ctx.fillText(state.worldBannerText, 312, 202);
    ctx.globalAlpha = 1;
  }

  if (state.gameOver) {
    ctx.fillStyle = "rgba(15,20,30,0.66)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function render() {
  if (state.scene === "menu") drawMenuScene();
  else if (state.scene === "run") drawRunScene();
  else if (state.scene === "shop") drawShopScene();
  else drawAnnexScene();
}

function update(dt) {
  state.elapsedSec += dt;
  if (state.scene === "run") updateRun(dt);
}

function selectWorldByCanvasPoint(x, y) {
  for (const card of state.menuCards) {
    if (x < card.x || x > card.x + card.w || y < card.y || y > card.y + card.h) continue;
    if (!card.unlocked) {
      addFloatingText("LOCKED", card.x + 44, card.y + 88, "#ffe7ab");
      return;
    }
    state.selectedWorldId = card.worldId;
    setMenuDialogue();
    return;
  }
}

let lastTs = 0;
function loop(ts) {
  const dt = Math.min(0.033, (ts - lastTs) / 1000 || 0);
  lastTs = ts;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

function handlePress(ev) {
  ensureAudioContext();

  if (ev.code === "Enter") {
    ev.preventDefault();
    if (state.scene === "menu") {
      if (isWorldUnlocked(state.selectedWorldId)) {
        resetRunState(state.selectedWorldId);
        summaryPanel.hidden = true;
      }
      return;
    }
    if (state.scene === "run" && !state.gameOver) {
      state.paused = !state.paused;
      return;
    }
    if (state.scene === "shop" || state.scene === "annex") {
      switchScene("menu");
      return;
    }
  }

  if (state.scene !== "run") {
    if (ev.code === "KeyS") switchScene("shop");
    if (ev.code === "KeyA") switchScene("annex");
    return;
  }

  if (ev.code === "ArrowUp") {
    ev.preventDefault();
    jump();
  }
  if (ev.code === "Space") {
    ev.preventDefault();
    if (!state.spaceHeld) {
      state.spaceHeld = true;
      state.spaceHoldSec = 0;
      state.pendingSpaceTapJump = true;
    }
  }
  if (ev.code === "KeyJ") {
    ev.preventDefault();
    doParkourShout();
  }
  if (ev.code === "KeyK") {
    ev.preventDefault();
    attack();
  }
}

window.addEventListener("keydown", handlePress);
window.addEventListener("keyup", (ev) => {
  if (ev.code !== "Space") return;
  state.spaceHeld = false;
  if (state.pendingSpaceTapJump && !state.slideActive && state.spaceHoldSec < GAME.slideHoldThresholdSec) {
    jump();
  }
  state.pendingSpaceTapJump = false;
  state.spaceHoldSec = 0;
});

canvas.addEventListener("pointerdown", (ev) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (ev.clientX - rect.left) * scaleX;
  const y = (ev.clientY - rect.top) * scaleY;

  if (state.scene === "menu") {
    selectWorldByCanvasPoint(x, y);
    return;
  }

  if (state.scene === "run") {
    jump();
  }
});

startBtn.addEventListener("click", () => {
  ensureAudioContext();
  if (state.scene === "menu") {
    if (isWorldUnlocked(state.selectedWorldId)) {
      resetRunState(state.selectedWorldId);
      summaryPanel.hidden = true;
    }
    return;
  }

  if (state.scene === "run") {
    switchScene("menu");
    return;
  }

  switchScene("menu");
});

retryBtn.addEventListener("click", () => {
  if (state.scene === "run") {
    resetRunState(state.runWorldId);
    summaryPanel.hidden = true;
    return;
  }

  if (state.scene === "menu") {
    switchScene("shop");
    return;
  }

  if (state.scene === "shop") {
    switchScene("annex");
  } else {
    switchScene("shop");
  }
});

characterSelect.addEventListener("change", () => {
  setMenuDialogue();
});

state.saveData = loadSave();
setMenuDialogue();
updateUiForScene();
summaryPanel.hidden = true;
requestAnimationFrame(loop);
