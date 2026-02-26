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
};

const state = {
  running: false,
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
  floatingText: [],
  stars: 0,
  schruteBucks: 0,
  stanleyNickels: 0,
  elapsedSec: 0,
  spawnTimerSec: 1.1,
  cameraOffset: 0,
  theme: "bullpen",
  player: null,
  obstacles: [],
};

function resetState() {
  const preset = CHARACTER_PRESETS[characterSelect.value];
  state.running = true;
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
  state.floatingText = [];
  state.stars = 0;
  state.schruteBucks = 0;
  state.stanleyNickels = 0;
  state.elapsedSec = 0;
  state.spawnTimerSec = 0.7;
  state.cameraOffset = 0;
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
    hp: 3,
  };
}

function addFloatingText(text, x, y, color) {
  state.floatingText.push({ text, x, y, color, age: 0, ttl: 0.8 });
}

function spawnObstacle() {
  const distanceFactor = Math.min(1.7, 1 + state.worldTimeSec / 80);
  const roll = Math.random();
  let type = "desk";
  if (roll < 0.2) type = "cat";
  if (roll > 0.72) type = "weak_floorboard";

  const size = {
    desk: { w: 52, h: 46, y: GAME.groundY + 16 },
    cat: { w: 34, h: 24, y: GAME.groundY + 36 },
    weak_floorboard: { w: 58, h: 20, y: GAME.groundY + 40 },
  }[type];

  state.obstacles.push({
    type,
    x: canvas.width + 20,
    y: size.y,
    width: size.w,
    height: size.h,
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
  if (!state.running) return;
  if (state.pendingLanding && state.landingWindowLeft > 0) {
    state.pendingLanding = false;
    state.landingWindowLeft = 0;
    state.speedBoostLeft = GAME.speedBoostSec;
    state.multiplier = Math.min(20, state.multiplier + 1);
    state.bestChain = Math.max(state.bestChain, state.multiplier - 1);
    addFloatingText("HARDCORE!", state.player.x + 16, state.player.y - 28, "#ffd54d");
  }
}

function stumbleFail() {
  state.pendingLanding = false;
  state.landingWindowLeft = 0;
  state.stumbleLeft = GAME.stumbleSec;
  state.multiplier = 1;
  addFloatingText("OOF", state.player.x + 10, state.player.y - 24, "#ffffff");
}

function jump() {
  if (!state.running) return;
  if (state.player.jumpsUsed >= state.player.preset.maxJumps) return;
  state.player.vy = -state.player.preset.jumpPower;
  state.player.grounded = false;
  state.player.jumpsUsed += 1;
}

function onLanding() {
  state.pendingLanding = true;
  state.landingWindowLeft = GAME.parkourWindowSec;
}

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function updateWorldTheme() {
  const t = state.worldTimeSec;
  if (t < 16) state.theme = "bullpen";
  else if (t < 32) state.theme = "warehouse";
  else if (t < 48) state.theme = "streets";
  else if (t < 60) state.theme = "corporate";
  else state.theme = "pursuit";
}

function handleObstacleCollision(obstacle) {
  if (obstacle.hit) return;
  obstacle.hit = true;

  if (obstacle.type === "weak_floorboard" && state.player.preset.canBreakWeakFloorboard) {
    state.score += 85;
    addFloatingText("Shortcut!", state.player.x + 14, state.player.y - 34, "#9cd67a");
    return;
  }

  state.player.hp -= 1;
  state.multiplier = 1;
  state.score = Math.max(0, state.score - 80);
  state.speedBoostLeft = 0;
  state.stumbleLeft = 0.6;
  addFloatingText("Injury", state.player.x + 4, state.player.y - 28, "#ff7062");

  if (state.player.hp <= 0) {
    endRun();
  }
}

function update(dt) {
  if (!state.running) return;

  state.elapsedSec += dt;
  state.worldTimeSec += dt;

  if (state.worldTimeSec >= GAME.runTimeSec) {
    endRun();
    return;
  }

  updateWorldTheme();

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
    if (state.landingWindowLeft <= 0 && state.pendingLanding) {
      stumbleFail();
    }
  }

  state.speedBoostLeft = Math.max(0, state.speedBoostLeft - dt);
  state.stumbleLeft = Math.max(0, state.stumbleLeft - dt);

  const baseSpeed = player.preset.baseSpeed;
  const speedModifier = state.speedBoostLeft > 0 ? GAME.speedBoostValue : 0;
  const stumblePenalty = state.stumbleLeft > 0 ? -140 : 0;
  const runSpeed = Math.max(120, baseSpeed + speedModifier + stumblePenalty);

  state.score += runSpeed * dt * 0.1;
  state.style += 20 * dt * state.multiplier * player.preset.styleGain;

  state.spawnTimerSec -= dt;
  if (state.spawnTimerSec <= 0) {
    spawnObstacle();
    const spawnGap = 0.65 + Math.random() * 0.8;
    state.spawnTimerSec = Math.max(0.35, spawnGap - state.worldTimeSec * 0.004);
  }

  const hitboxW = player.width * player.preset.hitboxScale;
  const hitboxH = player.height * player.preset.hitboxScale;
  const playerBox = {
    x: player.x + (player.width - hitboxW) / 2,
    y: player.y - player.height + (player.height - hitboxH),
    width: hitboxW,
    height: hitboxH,
  };

  for (const obstacle of state.obstacles) {
    obstacle.x -= runSpeed * dt * obstacle.speedFactor;
    if (!obstacle.hit && intersects(playerBox, obstacle)) {
      handleObstacleCollision(obstacle);
    }
  }

  state.obstacles = state.obstacles.filter((obs) => obs.x + obs.width > -20 && !obs.hit);

  for (const text of state.floatingText) {
    text.age += dt;
    text.y -= 24 * dt;
  }
  state.floatingText = state.floatingText.filter((t) => t.age < t.ttl);
}

function drawBackground() {
  const palettes = {
    bullpen: ["#99c4e4", "#d8d9d0", "#8aa3b5"],
    warehouse: ["#8f9ea8", "#ced2cb", "#728087"],
    streets: ["#9aabb3", "#d5d4ce", "#76848b"],
    corporate: ["#a6bad4", "#dddcd5", "#8896ab"],
    pursuit: ["#6f8bb1", "#bec8d0", "#4f637d"],
  };
  const [sky, floor, mid] = palettes[state.theme];

  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, GAME.floorTop);

  ctx.fillStyle = mid;
  for (let i = 0; i < 8; i += 1) {
    const w = 130;
    const x = (i * 160 - ((state.worldTimeSec * 40) % 160)) - 10;
    const h = 80 + (i % 3) * 16;
    ctx.fillRect(x, 280 - h, w, h);
  }

  ctx.fillStyle = floor;
  ctx.fillRect(0, GAME.floorTop, canvas.width, canvas.height - GAME.floorTop);
}

function drawPlayer() {
  const player = state.player;
  const x = player.x;
  const y = player.y - player.height;

  ctx.fillStyle = player.preset.color;
  ctx.fillRect(x, y, player.width, player.height);

  ctx.fillStyle = "#111";
  ctx.fillRect(x + 8, y + 12, 8, 8);
  ctx.fillRect(x + 25, y + 12, 8, 8);

  ctx.fillStyle = "#f3d6b3";
  ctx.fillRect(x + 6, y + 2, 30, 10);
}

function drawObstacles() {
  for (const obs of state.obstacles) {
    if (obs.type === "desk") ctx.fillStyle = "#6c4b34";
    if (obs.type === "cat") ctx.fillStyle = "#e1c5a5";
    if (obs.type === "weak_floorboard") ctx.fillStyle = "#b79e6a";
    ctx.fillRect(obs.x, obs.y - obs.height, obs.width, obs.height);
  }
}

function drawHud() {
  ctx.fillStyle = "rgba(15,20,30,0.7)";
  ctx.fillRect(12, 12, 336, 120);

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

  if (state.pendingLanding && state.landingWindowLeft > 0) {
    const pct = state.landingWindowLeft / GAME.parkourWindowSec;
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(365, 22, 250, 26);
    ctx.fillStyle = "#ffd54d";
    ctx.fillRect(365, 22, 250 * pct, 26);
    ctx.strokeStyle = "#111";
    ctx.strokeRect(365, 22, 250, 26);
    ctx.fillStyle = "#111";
    ctx.fillText("PARKOUR NOW (ENTER)", 378, 40);
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

function drawIdleScreen() {
  drawBackground();
  ctx.fillStyle = "rgba(15,20,30,0.75)";
  ctx.fillRect(180, 160, 600, 210);
  ctx.fillStyle = "#f5ead6";
  ctx.font = "bold 32px Trebuchet MS";
  ctx.fillText("Hardcore Parkour Prototype", 240, 220);
  ctx.font = "20px Trebuchet MS";
  ctx.fillText("Press Start Run, then jump with Space/tap.", 250, 268);
  ctx.fillText("Hit Enter within 0.2s after landing for HARDCORE boost.", 202, 304);
}

function render() {
  if (!state.running && !state.gameOver) {
    drawIdleScreen();
    return;
  }

  drawBackground();
  drawObstacles();
  drawPlayer();
  drawFloatingText();
  drawHud();

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
  if (ev.code === "Space" || ev.code === "ArrowUp") {
    ev.preventDefault();
    jump();
  }
  if (ev.code === "Enter") {
    ev.preventDefault();
    doParkourShout();
  }
}

window.addEventListener("keydown", handlePress);
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
state.gameOver = false;
requestAnimationFrame(loop);
