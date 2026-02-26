const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const characterSelect = document.getElementById("characterSelect");
const startBtn = document.getElementById("startBtn");
const retryBtn = document.getElementById("retryBtn");
const summaryPanel = document.getElementById("summaryPanel");
const summaryText = document.getElementById("summaryText");

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

const state = {
  running: false,
  paused: false,
  gameOver: false,
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
  schruteBucks: 0,
  stanleyNickels: 0,
  elapsedSec: 0,
  spawnTimerSec: 1.1,
  cameraOffset: 0,
  screenShake: 0,
  theme: "bullpen",
  player: null,
  obstacles: [],
};

const THEME_OBSTACLE_POOLS = {
  bullpen: ["desk", "cat", "intern"],
  warehouse: ["intern", "weak_floorboard", "desk"],
  streets: ["cat", "snowball", "intern"],
  corporate: ["folder", "desk", "intern"],
  pursuit: ["snowball", "folder", "cat"],
};

function resetState() {
  const preset = CHARACTER_PRESETS[characterSelect.value];
  state.running = true;
  state.paused = false;
  state.gameOver = false;
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
  state.schruteBucks = 0;
  state.stanleyNickels = 0;
  state.elapsedSec = 0;
  state.spawnTimerSec = 0.7;
  state.cameraOffset = 0;
  state.screenShake = 0;
  state.theme = "bullpen";
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

function endRun() {
  state.running = false;
  state.gameOver = true;
  state.stars = calculateStars();
  state.schruteBucks = Math.floor(state.style / 15 + state.stars * 90);
  state.stanleyNickels = Math.floor(state.score / 80 + state.stars * 8);

  const saturdayLine =
    state.stars === 1
      ? "David Wallace: I am going to need to see you on Saturday."
      : "David Wallace approves this performance review.";

  summaryText.textContent = `${state.player.preset.label} finished with ${state.stars}/5 stars. Score ${Math.floor(
    state.score
  )}, Style ${Math.floor(state.style)}, Best Hardcore chain ${state.bestChain}. Rewards: ${
    state.schruteBucks
  } Schrute Bucks, ${state.stanleyNickels} Stanley Nickels. ${saturdayLine}`;
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

function updateWorldTheme() {
  const prevTheme = state.theme;
  const t = state.worldTimeSec;
  if (t < 16) state.theme = "bullpen";
  else if (t < 32) state.theme = "warehouse";
  else if (t < 48) state.theme = "streets";
  else if (t < 60) state.theme = "corporate";
  else state.theme = "pursuit";
  return prevTheme !== state.theme;
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

  if (state.player.hp <= 0) endRun();
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

function update(dt) {
  if (!state.running || state.paused) return;

  state.elapsedSec += dt;
  state.worldTimeSec += dt;

  if (state.worldTimeSec >= GAME.runTimeSec) {
    endRun();
    return;
  }

  const themeChanged = updateWorldTheme();
  if (themeChanged) {
    state.obstacles = [];
    state.spawnTimerSec = 0.15;
    addFloatingText(`Now: ${state.theme.toUpperCase()}`, 350, 95, "#ffe08f");
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
}

function drawBackground() {
  const palettes = {
    bullpen: ["#9ec7e7", "#d8d9d0", "#8aa3b5", "#a9bed4"],
    warehouse: ["#8d9ca6", "#ced2cb", "#728087", "#95a3ae"],
    streets: ["#9caeb8", "#d5d4ce", "#76848b", "#abb8c1"],
    corporate: ["#a6bad4", "#dddcd5", "#8896ab", "#bccbe0"],
    pursuit: ["#6f8bb1", "#bec8d0", "#4f637d", "#8ca5c6"],
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
  ctx.fillRect(12, 12, 390, 128);

  ctx.fillStyle = "#fff";
  ctx.font = "16px Trebuchet MS";
  ctx.fillText(`Runner: ${state.player.preset.label}`, 20, 34);
  ctx.fillText(`HP: ${state.player.hp}`, 20, 56);
  ctx.fillText(`Score: ${Math.floor(state.score)}`, 20, 78);
  ctx.fillText(`Style: ${Math.floor(state.style)}`, 20, 100);

  ctx.fillStyle = "#ffd54d";
  ctx.fillText(`x${state.multiplier} Hardcore`, 190, 56);

  const timeLeft = Math.max(0, GAME.runTimeSec - state.worldTimeSec);
  ctx.fillStyle = "#d4e6ff";
  ctx.fillText(`Time: ${timeLeft.toFixed(1)}s`, 190, 78);
  ctx.fillText(`World: ${state.theme}`, 190, 100);
  ctx.fillText(`Hit: K`, 300, 34);
  ctx.fillText(`Parkour: J`, 300, 78);
  ctx.fillText(`Start/Pause: Enter`, 420, 100);
  if (state.slideActive) {
    ctx.fillText(`Slide: ${Math.ceil(state.slideSpeed)}`, 300, 56);
  }

  if (state.pendingLanding && state.landingWindowLeft > 0) {
    const pct = state.landingWindowLeft / GAME.parkourWindowSec;
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(420, 22, 250, 26);
    ctx.fillStyle = "#ffd54d";
    ctx.fillRect(420, 22, 250 * pct, 26);
    ctx.strokeStyle = "#111";
    ctx.strokeRect(420, 22, 250, 26);
    ctx.fillStyle = "#111";
    ctx.fillText("PARKOUR NOW (J)", 448, 40);
  }

  if (state.attackCooldownLeft > 0) {
    const pct = state.attackCooldownLeft / GAME.attackCooldownSec;
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(420, 54, 180, 12);
    ctx.fillStyle = "#78d7ff";
    ctx.fillRect(420, 54, 180 * (1 - pct), 12);
    ctx.strokeStyle = "#1a1d22";
    ctx.strokeRect(420, 54, 180, 12);
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

function drawIdleScreen() {
  drawBackground();
  ctx.fillStyle = "rgba(15,20,30,0.75)";
  ctx.fillRect(154, 150, 650, 230);
  ctx.fillStyle = "#f5ead6";
  ctx.font = "bold 32px Trebuchet MS";
  ctx.fillText("Hardcore Parkour Prototype", 240, 220);
  ctx.font = "20px Trebuchet MS";
  ctx.fillText("Enter starts the run. Tap Space to jump, hold Space to slide.", 170, 272);
  ctx.fillText("Press J for PARKOUR timing and K to hit obstacles.", 230, 306);
}

function render() {
  if (!state.running && !state.gameOver) {
    drawIdleScreen();
    return;
  }

  const shakeX = state.screenShake > 0 ? (Math.random() - 0.5) * 10 * state.screenShake : 0;
  const shakeY = state.screenShake > 0 ? (Math.random() - 0.5) * 8 * state.screenShake : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);
  drawBackground();
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

  if (state.gameOver) {
    ctx.fillStyle = "rgba(15,20,30,0.66)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
  if (ev.code === "Enter") {
    ev.preventDefault();
    if (!state.running && !state.gameOver) {
      resetState();
      summaryPanel.hidden = true;
      return;
    }
    if (state.running && !state.gameOver) {
      state.paused = !state.paused;
      return;
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
canvas.addEventListener("pointerdown", () => jump());

startBtn.addEventListener("click", () => {
  resetState();
  summaryPanel.hidden = true;
});

retryBtn.addEventListener("click", () => {
  resetState();
  summaryPanel.hidden = true;
});

characterSelect.addEventListener("change", () => {
  if (!state.running) render();
});

resetState();
state.running = false;
state.paused = false;
state.gameOver = false;
requestAnimationFrame(loop);
