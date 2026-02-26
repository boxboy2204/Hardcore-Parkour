const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const characterSelect = document.getElementById("characterSelect");
const startBtn = document.getElementById("startBtn");
const retryBtn = document.getElementById("retryBtn");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const summaryPanel = document.getElementById("summaryPanel");
const summaryText = document.getElementById("summaryText");

const SAVE_KEY = "hardcore_parkour_save_v1";

const CHARACTER_PRESETS = {
  michael: {
    label: "Michael",
    color: "#1f4f9b",
    tieColor: "#a11d2f",
    baseSpeed: 300,
    jumpPower: 720,
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
    jumpPower: 675,
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
    jumpPower: 700,
    styleGain: 1.6,
    maxJumps: 2,
    hitboxScale: 1.18,
    canBreakWeakFloorboard: false,
  },
};

const GAME = {
  gravity: 1920,
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
  { id: "bullpen", label: "The Bullpen", subtitle: "Desks, flying cats, chili spills" },
  { id: "warehouse", label: "The Warehouse", subtitle: "Paper piles, shelves, ladders" },
  { id: "streets", label: "Scranton Streets", subtitle: "Lightpoles, snowballs, hydrants" },
  { id: "corporate", label: "NYC Corporate", subtitle: "Desks, folders, bystanders" },
  { id: "pursuit", label: "Final Pursuit", subtitle: "Catch Toby's car at x5 Hardcore" },
];

const THEME_OBSTACLE_POOLS = {
  bullpen: ["desk", "angela_cat", "chili_spill"],
  warehouse: ["paper_pile", "shelf", "ladder"],
  streets: ["lightpole", "jim_snowball", "hydrant"],
  corporate: ["desk", "jan_folder", "bystander"],
  pursuit: ["folder", "paper_ream", "mung_beans"],
};

const THEME_LABELS = {
  bullpen: "The Bullpen",
  warehouse: "The Warehouse",
  streets: "Scranton Streets",
  corporate: "NYC Corporate",
  pursuit: "Final Pursuit",
};

const LEVEL_DIFFICULTY = {
  bullpen: { label: "Very Easy", obstacleSpeedMul: 0.82, spawnBase: 1.35, spawnRand: 0.85, spawnMin: 0.72 },
  warehouse: { label: "Easy", obstacleSpeedMul: 0.92, spawnBase: 1.12, spawnRand: 0.78, spawnMin: 0.60 },
  streets: { label: "Medium", obstacleSpeedMul: 1.0, spawnBase: 0.95, spawnRand: 0.72, spawnMin: 0.50 },
  corporate: { label: "Hard", obstacleSpeedMul: 1.12, spawnBase: 0.82, spawnRand: 0.68, spawnMin: 0.42 },
  pursuit: { label: "Super Hard", obstacleSpeedMul: 1.24, spawnBase: 0.68, spawnRand: 0.56, spawnMin: 0.34 },
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

const SHOP_ITEMS = [
  {
    id: "gel_shield",
    name: "Jell-O Shield",
    description: "Start each run with +1 HP.",
    currency: "stanleyNickels",
    cost: 22,
    row: "top",
  },
  {
    id: "parkour_shoes",
    name: "Parkour Shoes",
    description: "Small permanent speed boost.",
    currency: "stanleyNickels",
    cost: 36,
    row: "top",
  },
  {
    id: "chili_guard",
    name: "Anti-Chili Pads",
    description: "Less stumble time on failed shout.",
    currency: "stanleyNickels",
    cost: 30,
    row: "top",
  },
  {
    id: "mifflin_tape",
    name: "Mifflin Tape",
    description: "Style gain +10%.",
    currency: "stanleyNickels",
    cost: 26,
    row: "bottom",
  },
  {
    id: "desk_keycard",
    name: "Desk Keycard",
    description: "Unlocks one extra world on first buy.",
    currency: "stanleyNickels",
    cost: 16,
    row: "bottom",
  },
  {
    id: "energy_mug",
    name: "World's Best Mug",
    description: "Longer speed boost from HARDCORE.",
    currency: "stanleyNickels",
    cost: 34,
    row: "bottom",
  },
];

const state = {
  scene: "menu",
  previousScene: "menu",
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
  tobyDistance: 100,
  audioCtx: null,
  player: null,
  obstacles: [],
  menuCards: [],
  menuDialogue: "Pick a Polaroid so we can go, now.",
  pendingNextWorldId: null,
  shopCards: [],
  shopJimBounds: null,
  shopTalkBounds: [],
  shopConversation: null,
  shopMessage: "",
  shopMessageColor: "#c5d9f2",
  shopMessageLeft: 0,
  shopForeheadStare: false,
  missionToastText: "",
  missionToastLeft: 0,
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
    upgrades: {},
    achievements: {
      bushiestBeaver: false,
      whitestSneakers: false,
      dontGoInThere: false,
    },
    missions: {
      savePam: {
        added: false,
        completed: false,
      },
    },
    stats: {
      bestHardcoreChain: 0,
      lifetimeRuns: 0,
      economyV2ResetApplied: false,
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
      upgrades: { ...createDefaultSave().upgrades, ...(parsed.upgrades || {}) },
      achievements: { ...createDefaultSave().achievements, ...(parsed.achievements || {}) },
      missions: { ...createDefaultSave().missions, ...(parsed.missions || {}) },
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

function ownsUpgrade(id) {
  return Boolean(state.saveData.upgrades[id]);
}

function shopPriceLabel(item) {
  return `${item.cost} SN`;
}

function showShopMessage(text, color = "#ffe4a8") {
  state.shopMessage = text;
  state.shopMessageColor = color;
  state.shopMessageLeft = 2.3;
}

function showMissionToast(text) {
  state.missionToastText = text;
  state.missionToastLeft = 2.6;
}

function startJimConversation() {
  if (state.shopForeheadStare) return;
  state.shopConversation = {
    step: "choice",
    text: "Jim: Nice try. Those top-row items are in witness protection.",
  };
}

function handleJimConversationClick(choiceId) {
  if (!state.shopConversation) return;

  if (state.shopConversation.step === "choice") {
    if (choiceId === "ask") {
      state.shopConversation = {
        step: "pam_info",
        text:
          "Jim: Top row stays locked until you save Pam. She's somewhere in the Warehouse. Find her, bring back the key, then we talk.",
      };
      return;
    }
    state.shopConversation = null;
    return;
  }

  if (state.shopConversation.step === "pam_info") {
    if (!state.saveData.missions.savePam.added) {
      state.saveData.missions.savePam.added = true;
      persistSave();
      showMissionToast('Mission Added: "Save Pam"');
    }
    state.shopConversation = null;
  }
}

function tryBuyShopItem(itemId) {
  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item) return;

  if (state.shopForeheadStare) {
    showShopMessage("Jim is still staring at your forehead. Leave the shop to break it.", "#ffb4a7");
    return;
  }

  if (item.row === "top" && !state.saveData.unlocks.jimDeskKey) {
    showShopMessage("Jim: top row stays in Jell-O until you find Pam.", "#ffb4a7");
    return;
  }

  if (ownsUpgrade(item.id)) {
    showShopMessage("Already owned. Jim nods in deadpan approval.", "#b6f6ff");
    return;
  }

  const stanleyWallet = state.saveData.currencies.stanleyNickels;
  if (stanleyWallet < item.cost) {
    if (state.saveData.currencies.schruteBucks > 0) {
      state.shopForeheadStare = true;
      showShopMessage("You offered Schrute Bucks. Jim locks onto your forehead in silence.", "#ff9ea5");
      return;
    }
    showShopMessage("Not enough Stanley Nickels.", "#ffb4a7");
    return;
  }

  state.saveData.currencies.stanleyNickels -= item.cost;
  state.saveData.upgrades[item.id] = true;

  if (item.id === "desk_keycard") {
    state.saveData.unlockedWorldIndex = Math.min(WORLDS.length - 1, state.saveData.unlockedWorldIndex + 1);
  }

  persistSave();
  showShopMessage(`Purchased ${item.name}. Jim finally de-gels it.`, "#d3ffbf");
}

function switchScene(sceneId) {
  const leavingShop = state.scene === "shop" && sceneId !== "shop";
  state.previousScene = state.scene;
  state.scene = sceneId;
  state.paused = false;
  summaryPanel.hidden = true;
  nextLevelBtn.hidden = true;
  if (leavingShop) state.shopForeheadStare = false;
  if (sceneId !== "shop") state.shopConversation = null;
  updateUiForScene();
  if (sceneId === "menu") setMenuDialogue();
}

function updateUiForScene() {
  if (state.scene === "menu") {
    startBtn.textContent = "Launch Level";
    retryBtn.textContent = "Shop";
    retryBtn.hidden = false;
  } else if (state.scene === "missions") {
    startBtn.textContent = "Back";
    retryBtn.hidden = true;
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
  state.tobyDistance = 100;
  state.obstacles = [];

  const hpBonus = ownsUpgrade("gel_shield") ? 1 : 0;
  const speedBonus = ownsUpgrade("parkour_shoes") ? 18 : 0;
  const stumbleTuning = ownsUpgrade("chili_guard") ? 0.72 : 1;
  const styleTuning = ownsUpgrade("mifflin_tape") ? 1.1 : 1;
  const boostTuning = ownsUpgrade("energy_mug") ? 1.2 : 1;

  state.player = {
    preset,
    x: 180,
    y: GAME.groundY,
    width: 42,
    height: 62,
    vy: 0,
    grounded: true,
    jumpsUsed: 0,
    hp: 4 + hpBonus,
  };
  state.player.runtimeSpeedBonus = speedBonus;
  state.player.runtimeStumbleMul = stumbleTuning;
  state.player.runtimeStyleMul = styleTuning;
  state.player.runtimeBoostMul = boostTuning;

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
  const difficulty = LEVEL_DIFFICULTY[state.runWorldId] || LEVEL_DIFFICULTY.bullpen;
  const distanceFactor = Math.min(1.75, 1 + state.worldTimeSec / 75) * difficulty.obstacleSpeedMul;
  const pool = THEME_OBSTACLE_POOLS[state.theme] || THEME_OBSTACLE_POOLS.bullpen;
  const type = pool[Math.floor(Math.random() * pool.length)];

  const size = {
    desk: { w: 52, h: 46, topOffset: 0, hp: 1 },
    angela_cat: { w: 34, h: 24, topOffset: -40, hp: 1 },
    chili_spill: { w: 66, h: 12, topOffset: 12, hp: 1 },
    paper_pile: { w: 46, h: 30, topOffset: 8, hp: 1 },
    shelf: { w: 58, h: 54, topOffset: 0, hp: 1 },
    ladder: { w: 64, h: 48, topOffset: -22, hp: 1 },
    lightpole: { w: 24, h: 76, topOffset: -20, hp: 1 },
    jim_snowball: { w: 24, h: 24, topOffset: -24, hp: 1 },
    hydrant: { w: 36, h: 40, topOffset: 4, hp: 1 },
    jan_folder: { w: 34, h: 18, topOffset: -36, hp: 1 },
    bystander: { w: 34, h: 56, topOffset: 2, hp: 1 },
    folder: { w: 34, h: 18, topOffset: -36, hp: 1 },
    paper_ream: { w: 38, h: 24, topOffset: -6, hp: 1 },
    mung_beans: { w: 22, h: 22, topOffset: -18, hp: 1 },
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
  // Economy v2: much lower payouts. Example target: 5-star run => 50 SB and 10 SN.
  state.earnedSchruteBucks = state.stars * 10;
  state.earnedStanleyNickels = state.stars * 2;

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

  const worldIdx = WORLDS.findIndex((w) => w.id === state.runWorldId);
  const hasNextLevel = worldIdx !== -1 && worldIdx < WORLDS.length - 1;
  const successfulFinish = reason === "time" || reason === "toby_caught";
  if (successfulFinish && hasNextLevel) {
    const nextWorld = WORLDS[worldIdx + 1];
    state.pendingNextWorldId = nextWorld.id;
    nextLevelBtn.textContent = `Continue To ${nextWorld.label}`;
    nextLevelBtn.hidden = false;
  } else {
    state.pendingNextWorldId = null;
    nextLevelBtn.hidden = true;
  }

  let endingLine =
    state.stars === 1
      ? "David Wallace: I am going to need to see you on Saturday."
      : "David Wallace approves this performance review.";
  if (reason === "toby_caught") {
    endingLine = "Finale unlocked: You caught Toby's car. The Scranton Strangler was Toby.";
  }

  summaryText.textContent = `${state.player.preset.label} finished ${THEME_LABELS[state.runWorldId]} with ${
    state.stars
  }/5 stars. Score ${Math.floor(state.score)}, Style ${Math.floor(state.style)}, Best Hardcore chain ${
    state.bestChain
  }. Rewards: +${state.earnedSchruteBucks} Schrute Bucks, +${
    state.earnedStanleyNickels
  } Stanley Nickels. Total Wallet: ${state.saveData.currencies.schruteBucks} SB / ${
    state.saveData.currencies.stanleyNickels
  } SN. ${endingLine}`;
  summaryPanel.hidden = false;
}

function doParkourShout() {
  if (!state.running || state.paused) return;
  if (state.pendingLanding && state.landingWindowLeft > 0) {
    state.pendingLanding = false;
    state.landingWindowLeft = 0;
    state.speedBoostLeft = GAME.speedBoostSec * (state.player?.runtimeBoostMul || 1);
    state.multiplier = Math.min(20, state.multiplier + 1);
    state.bestChain = Math.max(state.bestChain, state.multiplier - 1);
    addFloatingText("HARDCORE!", state.player.x + 16, state.player.y - 28, "#ffd54d");
    return;
  }

  // Failed attempt only when player actually presses J outside the valid window.
  stumbleFail();
}

function attack() {
  if (!state.running || state.paused || state.attackCooldownLeft > 0) return;
  state.attackLeft = GAME.attackDurationSec;
  state.attackCooldownLeft = GAME.attackCooldownSec;
}

function stumbleFail() {
  state.pendingLanding = false;
  state.landingWindowLeft = 0;
  state.stumbleLeft = GAME.stumbleSec * (state.player?.runtimeStumbleMul || 1);
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

  if (obstacle.type === "shelf" && state.player.preset.canBreakWeakFloorboard) {
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
    if (obstacle.hit || obstacle.type === "ladder") continue;
    if (!intersects(attackBox, obstacle)) continue;

    obstacle.hit = true;
    state.score += 120;
    state.style += 36 * state.multiplier;
    addFloatingText("SMACK", obstacle.x + 8, obstacle.y - 10, "#ffe28a");
    addHitParticles(obstacle.x + obstacle.width * 0.5, obstacle.y + obstacle.height * 0.45, "#f9e2a5");
  }
}

function stompObstacle(obstacle) {
  obstacle.hit = true;
  state.score += 95;
  state.style += 20 * state.multiplier;
  state.player.vy = -360;
  state.player.grounded = false;
  state.pendingLanding = false;
  state.landingWindowLeft = 0;
  addFloatingText("CRUNCH!", obstacle.x + 2, obstacle.y - 10, "#ffe68d");
  addHitParticles(obstacle.x + obstacle.width * 0.5, obstacle.y + obstacle.height * 0.4, "#ffd79a");
}

function updateRun(dt) {
  if (!state.running || state.paused) return;

  state.elapsedSec += dt;
  state.worldTimeSec += dt;

  const runHasTimer = state.runWorldId !== "pursuit";
  if (runHasTimer && state.worldTimeSec >= GAME.runTimeSec) {
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
    if (state.landingWindowLeft <= 0 && state.pendingLanding) {
      state.pendingLanding = false;
      state.landingWindowLeft = 0;
    }
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
  const upgradeSpeed = player.runtimeSpeedBonus || 0;
  const speedModifier = state.speedBoostLeft > 0 ? GAME.speedBoostValue : 0;
  const stumblePenalty = state.stumbleLeft > 0 ? -140 : 0;
  const movementSpeed = Math.max(120, baseSpeed + speedModifier + stumblePenalty + upgradeSpeed);

  if (state.slideActive) {
    state.slideSpeed = Math.max(0, state.slideSpeed - GAME.slideDeceleration * dt);
    if (state.slideSpeed <= 0 || !state.player.grounded) {
      state.slideActive = false;
      state.slideSpeed = 0;
    }
  }

  const runSpeed = state.slideActive ? movementSpeed + state.slideSpeed : movementSpeed;

  if (state.runWorldId === "pursuit") {
    if (state.multiplier >= 5) {
      state.tobyDistance = Math.max(0, state.tobyDistance - 30 * dt);
    } else {
      state.tobyDistance = Math.min(100, state.tobyDistance + 8 * dt);
    }
    if (state.tobyDistance <= 0) {
      endRun("toby_caught");
      return;
    }
  }

  state.score += runSpeed * dt * 0.1;
  state.style += 20 * dt * state.multiplier * player.preset.styleGain * (player.runtimeStyleMul || 1);

  state.spawnTimerSec -= dt;
  if (state.spawnTimerSec <= 0) {
    const difficulty = LEVEL_DIFFICULTY[state.runWorldId] || LEVEL_DIFFICULTY.bullpen;
    spawnObstacle();
    const spawnGap = difficulty.spawnBase + Math.random() * difficulty.spawnRand;
    state.spawnTimerSec = Math.max(difficulty.spawnMin, spawnGap - state.worldTimeSec * 0.004);
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

    if (obstacle.type === "ladder") {
      if (state.slideActive) {
        obstacle.hit = true;
        state.style += 18;
        addFloatingText("UNDER!", obstacle.x + 6, obstacle.y - 10, "#a7ecff");
        continue;
      }
      handleObstacleCollision(obstacle);
      continue;
    }

    if (state.slideActive) {
      obstacle.hit = true;
      state.score += GAME.slideScorePerObstacle;
      state.style += 14;
      addFloatingText("SWOOSH", obstacle.x + 4, obstacle.y - 8, "#8fe4ff");
      addHitParticles(obstacle.x + obstacle.width * 0.5, obstacle.y + obstacle.height * 0.5, "#8ed9ff");
      continue;
    }

    const playerBottom = playerBox.y + playerBox.height;
    const landingFromAbove = player.vy > 40 && playerBottom <= obstacle.y + 14;
    if (landingFromAbove) {
      stompObstacle(obstacle);
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
  const runCycle = Math.sin(state.worldTimeSec * 18);
  const runCycleOpp = Math.sin(state.worldTimeSec * 18 + Math.PI);
  const bob = player.grounded ? Math.abs(Math.sin(state.worldTimeSec * 18)) * 2 : -2;
  const bodyY = y + (state.slideActive ? 10 : 14) + bob;

  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(x + 21, GAME.groundY + 4, 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head + hair.
  ctx.fillStyle = "#efcfab";
  ctx.fillRect(x + 7, y + 2 + bob, 28, state.slideActive ? 9 : 12);
  ctx.fillStyle = "#2a1e16";
  ctx.fillRect(x + 6, y - 2 + bob, 30, 5);
  ctx.fillRect(x + 5, y + 1 + bob, 6, 3);
  if (player.preset.label === "Dwight") {
    // Dwight hair part.
    ctx.fillStyle = "#efcfab";
    ctx.fillRect(x + 20, y - 2 + bob, 2, 5);
    ctx.fillRect(x + 20, y + 1 + bob, 1, 2);
  }

  // Face details.
  ctx.fillStyle = "#1b2230";
  if (player.preset.label === "Dwight") {
    ctx.strokeStyle = "#c2ccd8";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 11.5, y + 4.5 + bob, 6, 5);
    ctx.strokeRect(x + 23.5, y + 4.5 + bob, 6, 5);
    ctx.beginPath();
    ctx.moveTo(x + 17.5, y + 7 + bob);
    ctx.lineTo(x + 23.5, y + 7 + bob);
    ctx.stroke();
  }
  ctx.fillRect(x + 13, y + 6 + bob, 2, 2);
  ctx.fillRect(x + 25, y + 6 + bob, 2, 2);
  ctx.fillRect(x + 17, y + 10 + bob, 8, 1);

  // Torso base + shading.
  ctx.fillStyle = player.preset.color;
  ctx.fillRect(x + 4, bodyY, 34, state.slideActive ? 22 : 34);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(x + 24, bodyY + 1, 11, state.slideActive ? 20 : 32);
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(x + 4, bodyY + 1, 5, state.slideActive ? 20 : 32);

  // Collar + tie.
  ctx.fillStyle = "#f4ead9";
  ctx.fillRect(x + 16, bodyY + 2, 10, 3);
  ctx.fillStyle = player.preset.tieColor;
  ctx.fillRect(x + 19, bodyY + 4, 4, state.slideActive ? 11 : 20);
  if (!state.slideActive) ctx.fillRect(x + 18, bodyY + 22, 6, 4);

  const armFrontY = y + 21 + runCycle * 3 + bob;
  const armBackY = y + 21 + runCycleOpp * 3 + bob;
  // Back arm first for depth.
  ctx.fillStyle = "#c9a682";
  ctx.fillRect(x - 1, state.slideActive ? y + 16 : armBackY, 8, state.slideActive ? 8 : 16);
  if (state.attackLeft > 0) {
    ctx.fillRect(x + 34, y + (state.slideActive ? 15 : 18) + bob, 14, 8);
    ctx.fillStyle = "#ffe189";
    ctx.fillRect(x + 48, y + (state.slideActive ? 17 : 20) + bob, 18, 4);
  } else {
    ctx.fillStyle = "#d9ba97";
    ctx.fillRect(x + 35, state.slideActive ? y + 16 : armFrontY, 8, state.slideActive ? 8 : 16);
  }

  const legFront = player.grounded ? runCycle * 5 : 0;
  const legBack = player.grounded ? runCycleOpp * 5 : 0;
  ctx.fillStyle = "#202a39";
  if (state.slideActive) {
    ctx.fillRect(x + 12, y + 28, 17, 7);
    ctx.fillStyle = "#141a25";
    ctx.fillRect(x + 11, y + 34, 8, 3);
    ctx.fillRect(x + 22, y + 34, 8, 3);
  } else {
    ctx.fillRect(x + 10, y + 48 + Math.max(0, -legBack), 9, 14 + Math.abs(legBack));
    ctx.fillRect(x + 24, y + 48 + Math.max(0, -legFront), 9, 14 + Math.abs(legFront));
    ctx.fillStyle = "#141a25";
    ctx.fillRect(x + 9, y + 62 + Math.max(0, -legBack), 10, 3);
    ctx.fillRect(x + 24, y + 62 + Math.max(0, -legFront), 10, 3);
  }
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
  } else if (obs.type === "angela_cat") {
    const wobble = Math.sin(state.worldTimeSec * 22 + obs.x * 0.03) * 1.5;
    ctx.fillStyle = "#d6bd99";
    ctx.fillRect(obs.x + 5, obs.y + 8 + wobble, 18, 11);
    ctx.fillRect(obs.x + 20, obs.y + 7 + wobble, 10, 8);
    ctx.fillRect(obs.x + 17, obs.y + 5 + wobble, 4, 3);
    ctx.fillRect(obs.x + 25, obs.y + 4 + wobble, 4, 3);
    ctx.fillRect(obs.x + 2, obs.y + 12 + wobble, 4, 3);
    ctx.fillRect(obs.x, obs.y + 10 + wobble, 3, 2);
    ctx.fillRect(obs.x + 7, obs.y + 18 + wobble, 3, 3);
    ctx.fillRect(obs.x + 15, obs.y + 18 + wobble, 3, 3);
    ctx.fillStyle = "#2b2b2b";
    ctx.fillRect(obs.x + 22, obs.y + 9 + wobble, 2, 2);
    ctx.fillRect(obs.x + 27, obs.y + 9 + wobble, 2, 2);
    ctx.fillRect(obs.x + 25, obs.y + 12 + wobble, 2, 2);
  } else if (obs.type === "chili_spill") {
    ctx.fillStyle = "#8f3328";
    ctx.fillRect(obs.x, obs.y + 6, obs.width, 6);
    ctx.fillStyle = "#bd5740";
    ctx.fillRect(obs.x + 8, obs.y + 3, obs.width - 14, 5);
  } else if (obs.type === "paper_pile") {
    ctx.fillStyle = "#f0f3f8";
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    ctx.fillStyle = "#d8deea";
    for (let i = 0; i < 3; i += 1) ctx.fillRect(obs.x + 4, obs.y + 6 + i * 7, obs.width - 8, 2);
  } else if (obs.type === "shelf") {
    ctx.fillStyle = "#6f4e36";
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    ctx.fillStyle = "#9d7659";
    ctx.fillRect(obs.x + 4, obs.y + 14, obs.width - 8, 4);
    ctx.fillRect(obs.x + 4, obs.y + 30, obs.width - 8, 4);
  } else if (obs.type === "ladder") {
    ctx.fillStyle = "#c89e58";
    ctx.fillRect(obs.x + 6, obs.y, 6, obs.height);
    ctx.fillRect(obs.x + obs.width - 12, obs.y, 6, obs.height);
    for (let i = 0; i < 4; i += 1) ctx.fillRect(obs.x + 12, obs.y + 8 + i * 10, obs.width - 24, 4);
  } else if (obs.type === "lightpole") {
    ctx.fillStyle = "#49546a";
    ctx.fillRect(obs.x + 8, obs.y, 8, obs.height);
    ctx.fillStyle = "#ffe78a";
    ctx.fillRect(obs.x + 3, obs.y, 18, 8);
  } else if (obs.type === "jim_snowball") {
    ctx.fillStyle = "#f2f7ff";
    ctx.beginPath();
    ctx.arc(obs.x + obs.width * 0.5, obs.y + obs.height * 0.5, obs.width * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#dbe5f2";
    ctx.fillRect(obs.x + 8, obs.y + 6, 4, 3);
  } else if (obs.type === "hydrant") {
    ctx.fillStyle = "#d34136";
    ctx.fillRect(obs.x + 8, obs.y + 4, obs.width - 16, obs.height - 4);
    ctx.fillRect(obs.x, obs.y + 14, obs.width, 8);
  } else if (obs.type === "jan_folder" || obs.type === "folder") {
    ctx.fillStyle = "#d6a95c";
    ctx.fillRect(obs.x, obs.y + 3, obs.width, obs.height - 3);
    ctx.fillStyle = "#e8c480";
    ctx.fillRect(obs.x + 4, obs.y, 12, 4);
  } else if (obs.type === "bystander") {
    ctx.fillStyle = "#3d6ca3";
    ctx.fillRect(obs.x + 4, obs.y + 16, obs.width - 8, obs.height - 16);
    ctx.fillStyle = "#efcfab";
    ctx.fillRect(obs.x + 9, obs.y, obs.width - 18, 16);
  } else if (obs.type === "paper_ream") {
    ctx.fillStyle = "#f1f6ff";
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    ctx.fillStyle = "#d1dae8";
    ctx.fillRect(obs.x + 4, obs.y + 6, obs.width - 8, 2);
    ctx.fillRect(obs.x + 4, obs.y + 12, obs.width - 8, 2);
  } else if (obs.type === "mung_beans") {
    ctx.fillStyle = "#8db34c";
    ctx.beginPath();
    ctx.arc(obs.x + 6, obs.y + 10, 5, 0, Math.PI * 2);
    ctx.arc(obs.x + 14, obs.y + 8, 5, 0, Math.PI * 2);
    ctx.arc(obs.x + 11, obs.y + 15, 5, 0, Math.PI * 2);
    ctx.fill();
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
  const difficulty = LEVEL_DIFFICULTY[state.runWorldId] || LEVEL_DIFFICULTY.bullpen;
  ctx.fillStyle = "#d4e6ff";
  if (state.runWorldId === "pursuit") ctx.fillText("Time: -- (Chase Mode)", 210, 78);
  else ctx.fillText(`Time: ${timeLeft.toFixed(1)}s`, 210, 78);
  ctx.fillText(`World: ${THEME_LABELS[state.theme] || state.theme}`, 210, 100);
  ctx.fillText(`Difficulty: ${difficulty.label}`, 210, 122);
  ctx.fillText(`Parkour: J  Hit: K  Pause: Enter`, 500, 122);

  if (state.slideActive) {
    ctx.fillStyle = "#8fdcff";
    ctx.fillText(`Slide: ${Math.ceil(state.slideSpeed)}`, 338, 56);
  }

  if (state.runWorldId === "pursuit") {
    ctx.fillStyle = "#ffe38f";
    ctx.fillText(`Catch Toby: ${Math.ceil(state.tobyDistance)}m`, 480, 78);
    ctx.fillText(`Goal: reach x5 Hardcore`, 480, 100);
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

function drawPursuitTarget() {
  if (state.runWorldId !== "pursuit") return;

  const t = Math.max(0, Math.min(1, 1 - state.tobyDistance / 100));
  const carX = 760 + t * 120;
  const carY = 365 - t * 30;

  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(carX + 38, carY + 34, 46, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2f3139";
  ctx.fillRect(carX, carY + 10, 76, 20);
  ctx.fillRect(carX + 12, carY, 44, 14);
  ctx.fillStyle = "#9dc4ff";
  ctx.fillRect(carX + 16, carY + 2, 16, 8);
  ctx.fillRect(carX + 34, carY + 2, 16, 8);
  ctx.fillStyle = "#111";
  ctx.fillRect(carX + 8, carY + 26, 14, 8);
  ctx.fillRect(carX + 54, carY + 26, 14, 8);

  ctx.fillStyle = "#f4d5b3";
  ctx.fillRect(carX + 41, carY + 3, 7, 6);
  ctx.fillStyle = "#f1e6c2";
  ctx.font = "bold 12px Trebuchet MS";
  ctx.fillText("T", carX + 43, carY + 9);
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

function drawWrappedText(text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const words = text.split(" ");
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
      continue;
    }

    if (current) lines.push(current);
    current = word;
    if (lines.length >= maxLines - 1) break;
  }

  if (current && lines.length < maxLines) lines.push(current);

  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    let last = lines[maxLines - 1];
    while (last.length > 0 && ctx.measureText(`${last}...`).width > maxWidth) {
      last = last.slice(0, -1);
    }
    lines[maxLines - 1] = `${last}...`;
  }

  for (let i = 0; i < lines.length; i += 1) {
    ctx.fillText(lines[i], x, y + i * lineHeight);
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
  const boardOuter = { x: 70, y: 70, w: 820, h: 380 };
  const boardInner = { x: 92, y: 92, w: 776, h: 336 };

  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#1c3048");
  grad.addColorStop(1, "#243958");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#313f52";
  ctx.fillRect(boardOuter.x, boardOuter.y, boardOuter.w, boardOuter.h);
  ctx.fillStyle = "#f4f2e7";
  ctx.fillRect(boardInner.x, boardInner.y, boardInner.w, boardInner.h);

  ctx.strokeStyle = "#8b2e2e";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(116, 116);
  ctx.lineTo(832, 390);
  ctx.moveTo(130, 365);
  ctx.lineTo(780, 148);
  ctx.stroke();

  // Hand-drawn style doodles (no text).
  ctx.strokeStyle = "rgba(36, 74, 138, 0.78)";
  ctx.lineWidth = 2;
  // Top-left trophy doodle.
  ctx.strokeRect(110, 98, 22, 16);
  ctx.strokeRect(116, 114, 10, 8);
  ctx.beginPath();
  ctx.moveTo(110, 106);
  ctx.lineTo(102, 110);
  ctx.moveTo(132, 106);
  ctx.lineTo(140, 110);
  ctx.stroke();
  // Top-right beet doodle.
  ctx.beginPath();
  ctx.ellipse(760, 108, 12, 8, 0, 0, Math.PI * 2);
  ctx.moveTo(760, 100);
  ctx.lineTo(754, 92);
  ctx.moveTo(760, 100);
  ctx.lineTo(766, 92);
  ctx.stroke();
  // Center-top pretzel-ish loop.
  ctx.beginPath();
  ctx.moveTo(454, 102);
  ctx.bezierCurveTo(468, 88, 486, 112, 500, 102);
  ctx.bezierCurveTo(486, 116, 468, 92, 454, 102);
  ctx.stroke();

  // Lower-left doodles: chili splash + magnifier.
  ctx.strokeStyle = "rgba(194, 62, 62, 0.84)";
  ctx.beginPath();
  ctx.moveTo(166, 372);
  ctx.lineTo(176, 354);
  ctx.lineTo(188, 370);
  ctx.lineTo(198, 352);
  ctx.lineTo(208, 372);
  ctx.stroke();
  ctx.strokeStyle = "rgba(61, 83, 118, 0.84)";
  ctx.beginPath();
  ctx.arc(238, 364, 11, 0, Math.PI * 2);
  ctx.moveTo(246, 372);
  ctx.lineTo(254, 380);
  ctx.stroke();

  // Right-side "Michael Scarn" style hero doodles: mask + star + bolt.
  ctx.strokeStyle = "rgba(29, 60, 128, 0.9)";
  // Mask
  ctx.beginPath();
  ctx.moveTo(734, 320);
  ctx.lineTo(752, 314);
  ctx.lineTo(770, 320);
  ctx.lineTo(752, 326);
  ctx.closePath();
  ctx.moveTo(744, 320);
  ctx.lineTo(748, 320);
  ctx.moveTo(756, 320);
  ctx.lineTo(760, 320);
  ctx.stroke();
  // Star
  ctx.beginPath();
  ctx.moveTo(822, 372);
  ctx.lineTo(828, 386);
  ctx.lineTo(814, 378);
  ctx.lineTo(832, 378);
  ctx.lineTo(818, 386);
  ctx.stroke();
  // Lightning
  ctx.beginPath();
  ctx.moveTo(842, 328);
  ctx.lineTo(834, 344);
  ctx.lineTo(844, 344);
  ctx.lineTo(836, 360);
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
    drawWrappedText(unlocked ? world.subtitle : "Locked", x + 12, y + 50, w - 24, 18, 3);

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
  const px = 98;
  const py = 422;
  const menuScale = 1.3;

  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath();
  ctx.ellipse(px + 23 * menuScale, py + 7, 24 * menuScale, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // More realistic menu-side character sprite.
  const bob = Math.abs(anim) * 1.5;
  const headX = px + 10 * menuScale;
  const headY = py - 62 * menuScale + bob;
  const bodyX = px + 8 * menuScale;
  const bodyY = py - 50 * menuScale + bob;

  // Head + hair.
  ctx.fillStyle = "#efcfab";
  ctx.fillRect(headX, headY, 28 * menuScale, 12 * menuScale);
  ctx.fillStyle = "#2a1e16";
  ctx.fillRect(headX - 1 * menuScale, headY - 4 * menuScale, 30 * menuScale, 5 * menuScale);
  ctx.fillRect(headX - 2 * menuScale, headY, 5 * menuScale, 3 * menuScale);
  if (player.label === "Dwight") {
    // Dwight hair part.
    ctx.fillStyle = "#efcfab";
    ctx.fillRect(headX + 13 * menuScale, headY - 4 * menuScale, 2 * menuScale, 5 * menuScale);
    ctx.fillRect(headX + 13 * menuScale, headY, 1 * menuScale, 2 * menuScale);
  }

  // Face details.
  ctx.fillStyle = "#1e2431";
  if (player.label === "Dwight") {
    ctx.strokeStyle = "#c2ccd8";
    ctx.lineWidth = Math.max(1, menuScale);
    ctx.strokeRect(headX + 5.5 * menuScale, headY + 3.5 * menuScale, 6 * menuScale, 5 * menuScale);
    ctx.strokeRect(headX + 17.5 * menuScale, headY + 3.5 * menuScale, 6 * menuScale, 5 * menuScale);
    ctx.beginPath();
    ctx.moveTo(headX + 11.5 * menuScale, headY + 6 * menuScale);
    ctx.lineTo(headX + 17.5 * menuScale, headY + 6 * menuScale);
    ctx.stroke();
  }
  ctx.fillRect(headX + 7 * menuScale, headY + 4 * menuScale, 2 * menuScale, 2 * menuScale);
  ctx.fillRect(headX + 19 * menuScale, headY + 4 * menuScale, 2 * menuScale, 2 * menuScale);
  ctx.fillRect(headX + 12 * menuScale, headY + 8 * menuScale, 6 * menuScale, 1 * menuScale);

  // Shirt and tie.
  ctx.fillStyle = player.color;
  ctx.fillRect(bodyX, bodyY, 34 * menuScale, 36 * menuScale);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(bodyX + 20 * menuScale, bodyY + 1 * menuScale, 10 * menuScale, 34 * menuScale);
  ctx.fillStyle = player.tieColor;
  ctx.fillRect(bodyX + 15 * menuScale, bodyY + 4 * menuScale, 4 * menuScale, 20 * menuScale);

  // Arms with subtle swing.
  const armSwingA = anim * 2.2;
  const armSwingB = -anim * 2.2;
  ctx.fillStyle = "#d4b28f";
  ctx.fillRect(bodyX - 3 * menuScale, bodyY + 8 * menuScale + armSwingA, 5 * menuScale, 16 * menuScale);
  ctx.fillRect(bodyX + 34 * menuScale, bodyY + 8 * menuScale + armSwingB, 5 * menuScale, 16 * menuScale);

  // Pants + shoes.
  ctx.fillStyle = "#1c2431";
  ctx.fillRect(px + 13 * menuScale, py - 14 * menuScale, 9 * menuScale, 15 * menuScale + Math.abs(anim * 3));
  ctx.fillRect(px + 27 * menuScale, py - 14 * menuScale, 9 * menuScale, 15 * menuScale + Math.abs(-anim * 3));
  ctx.fillStyle = "#111722";
  ctx.fillRect(px + 12 * menuScale, py + 1 * menuScale, 10 * menuScale, 3 * menuScale);
  ctx.fillRect(px + 27 * menuScale, py + 1 * menuScale, 10 * menuScale, 3 * menuScale);

  ctx.fillStyle = "rgba(15,20,30,0.82)";
  ctx.fillRect(20, 458, 920, 72);
  ctx.strokeStyle = "rgba(124, 199, 255, 0.45)";
  ctx.strokeRect(20, 458, 920, 72);

  // Show full dialogue line(s) without truncating.
  ctx.fillStyle = "#f5ead6";
  ctx.font = "bold 16px Trebuchet MS";
  drawWrappedText(state.menuDialogue, 34, 480, 890, 20, 2);

  ctx.fillStyle = "#fff3b4";
  ctx.font = "15px Trebuchet MS";
  ctx.fillText("Enter: Launch Level   Click Polaroids   S: Shop   A: Annex", 34, 523);
}

function drawShopScene() {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#f5d9a2");
  grad.addColorStop(1, "#d9ae68");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(14,17,21,0.72)";
  ctx.fillRect(44, 72, 872, 402);
  ctx.strokeStyle = "#f1b864";
  ctx.strokeRect(44, 72, 872, 402);

  ctx.fillStyle = "#ffd480";
  ctx.font = "bold 34px Trebuchet MS";
  ctx.fillText("Break Room Shop", 320, 128);

  ctx.fillStyle = "#f4ead7";
  ctx.font = "18px Trebuchet MS";
  const questLine = state.saveData.unlocks.pamFound
    ? "Pam rescued: Jim's Desk Key acquired. Top row unlocked."
    : "Quest lock active: Find Pam in Warehouse (mission not built yet).";
  drawWrappedText(questLine, 58, 162, 240, 20, 3);
  ctx.fillText(`Wallet: ${state.saveData.currencies.schruteBucks} Schrute Bucks`, 58, 226);
  ctx.fillText(`Wallet: ${state.saveData.currencies.stanleyNickels} Stanley Nickels`, 58, 252);

  const vmX = 316;
  const vmY = 150;
  const vmW = 404;
  const vmH = 262;
  ctx.fillStyle = "#2f394f";
  ctx.fillRect(vmX, vmY, vmW, vmH);
  ctx.strokeStyle = "#9fd7ff";
  ctx.lineWidth = 3;
  ctx.strokeRect(vmX, vmY, vmW, vmH);
  ctx.fillStyle = "#9aa5b7";
  ctx.fillRect(vmX + vmW - 78, vmY + 22, 58, vmH - 44);
  ctx.fillStyle = "#252b38";
  ctx.fillRect(vmX + vmW - 68, vmY + 34, 38, 26);
  ctx.fillRect(vmX + vmW - 68, vmY + 68, 38, 18);
  ctx.fillRect(vmX + vmW - 68, vmY + 96, 38, 18);
  ctx.fillRect(vmX + vmW - 68, vmY + vmH - 64, 38, 34);

  // Jim leaning against the vending machine.
  const jimX = vmX + vmW + 10;
  const jimY = 392;
  const jimScale = 1.85;
  const jimW = 40 * jimScale;
  const jimH = 70 * jimScale;
  state.shopJimBounds = { x: jimX, y: jimY - jimH, w: jimW, h: jimH };
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath();
  ctx.ellipse(jimX + 20 * jimScale, jimY + 8 * jimScale, 20 * jimScale, 7 * jimScale, 0, 0, Math.PI * 2);
  ctx.fill();
  // Clean 3/4 pose with one arm clearly on the machine.
  ctx.fillStyle = "#efcfab";
  ctx.fillRect(jimX + 8 * jimScale, jimY - 58 * jimScale, 16 * jimScale, 12 * jimScale);
  ctx.fillStyle = "#2a1e16";
  ctx.fillRect(jimX + 6 * jimScale, jimY - 63 * jimScale, 20 * jimScale, 6 * jimScale);
  ctx.fillRect(jimX + 5 * jimScale, jimY - 59 * jimScale, 5 * jimScale, 3 * jimScale);
  ctx.fillStyle = "#1e2431";
  ctx.fillRect(jimX + 12 * jimScale, jimY - 54 * jimScale, 2 * jimScale, 2 * jimScale);
  ctx.fillRect(jimX + 18 * jimScale, jimY - 54 * jimScale, 2 * jimScale, 2 * jimScale);
  ctx.fillRect(jimX + 13 * jimScale, jimY - 50 * jimScale, 6 * jimScale, 1 * jimScale);

  ctx.fillStyle = "#5f8fca";
  ctx.fillRect(jimX + 6 * jimScale, jimY - 46 * jimScale, 24 * jimScale, 30 * jimScale);
  ctx.fillStyle = "#4f7fb7";
  ctx.fillRect(jimX + 22 * jimScale, jimY - 44 * jimScale, 7 * jimScale, 26 * jimScale);
  ctx.fillStyle = "#2f4f7a";
  ctx.fillRect(jimX + 15 * jimScale, jimY - 44 * jimScale, 3 * jimScale, 18 * jimScale);

  // Arms at sides.
  ctx.fillStyle = "#5f8fca";
  ctx.fillRect(jimX + 2 * jimScale, jimY - 40 * jimScale, 5 * jimScale, 16 * jimScale);
  ctx.fillRect(jimX + 29 * jimScale, jimY - 40 * jimScale, 5 * jimScale, 16 * jimScale);
  ctx.fillStyle = "#d4b28f";
  ctx.fillRect(jimX + 2 * jimScale, jimY - 26 * jimScale, 4 * jimScale, 4 * jimScale);
  ctx.fillRect(jimX + 30 * jimScale, jimY - 26 * jimScale, 4 * jimScale, 4 * jimScale);

  ctx.fillStyle = "#1b2838";
  ctx.fillRect(jimX + 10 * jimScale, jimY - 16 * jimScale, 7 * jimScale, 18 * jimScale);
  ctx.fillRect(jimX + 20 * jimScale, jimY - 16 * jimScale, 7 * jimScale, 18 * jimScale);
  ctx.fillStyle = "#111722";
  ctx.fillRect(jimX + 9 * jimScale, jimY + 2 * jimScale, 8 * jimScale, 3 * jimScale);
  ctx.fillRect(jimX + 20 * jimScale, jimY + 2 * jimScale, 8 * jimScale, 3 * jimScale);

  // TALK callout above Jim.
  const talkX = jimX + 4;
  const talkY = jimY - jimH - 20;
  ctx.fillStyle = "#ffed99";
  ctx.fillRect(talkX, talkY, 66, 22);
  ctx.strokeStyle = "#8b6d1e";
  ctx.strokeRect(talkX, talkY, 66, 22);
  ctx.fillStyle = "#2a2618";
  ctx.font = "bold 14px Trebuchet MS";
  ctx.fillText("TALK", talkX + 13, talkY + 15);
  ctx.fillStyle = "#ffed99";
  ctx.beginPath();
  ctx.moveTo(talkX + 28, talkY + 22);
  ctx.lineTo(talkX + 38, talkY + 22);
  ctx.lineTo(talkX + 33, talkY + 30);
  ctx.closePath();
  ctx.fill();
  state.shopTalkBounds = [{ id: "talk", x: talkX, y: talkY, w: 66, h: 30 }];

  state.shopCards = [];
  const colWidth = 98;
  const cardW = 110;
  const cardH = 92;
  for (let i = 0; i < SHOP_ITEMS.length; i += 1) {
    const item = SHOP_ITEMS[i];
    const col = i % 3;
    const row = item.row === "top" ? 0 : 1;
    const x = vmX + 16 + col * colWidth;
    const y = vmY + 30 + row * 116;
    const lockedByKey = row === 0 && !state.saveData.unlocks.jimDeskKey;
    const owned = ownsUpgrade(item.id);

    ctx.fillStyle = owned ? "#2f5032" : lockedByKey ? "#46403b" : "#234767";
    ctx.fillRect(x, y, cardW, cardH);
    ctx.strokeStyle = owned ? "#b7f2bb" : lockedByKey ? "#8a7b6b" : "#8bc8ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, cardW, cardH);

    ctx.fillStyle = "#f5ead6";
    ctx.font = "bold 13px Trebuchet MS";
    drawWrappedText(item.name, x + 10, y + 20, cardW - 18, 14, 1);
    ctx.font = "14px Trebuchet MS";
    drawWrappedText(item.description, x + 10, y + 42, cardW - 18, 15, 2);

    ctx.fillStyle = owned ? "#b7f2bb" : "#ffe4a8";
    ctx.font = "bold 14px Trebuchet MS";
    const badge = owned ? "OWNED" : lockedByKey ? "LOCKED" : `BUY ${shopPriceLabel(item)}`;
    ctx.fillText(badge, x + 10, y + 80);

    // Top row is visually encased in yellow Jell-O.
    if (row === 0) {
      const wobble = Math.sin(state.elapsedSec * 4 + col * 0.8) * 2;
      ctx.fillStyle = lockedByKey ? "rgba(255, 213, 82, 0.42)" : "rgba(255, 222, 108, 0.26)";
      ctx.fillRect(x + 2, y + 2, cardW - 4, cardH - 4);
      ctx.fillStyle = "rgba(255, 236, 150, 0.55)";
      ctx.fillRect(x + 8, y + 8 + wobble, cardW - 18, 7);
      ctx.fillRect(x + 12, y + 24 - wobble, cardW - 24, 5);
      ctx.fillStyle = "rgba(255, 200, 60, 0.45)";
      ctx.fillRect(x + 16, y + cardH - 22 + wobble, cardW - 32, 9);
      ctx.fillRect(x + 28, y + cardH - 12, 14, 4);
      ctx.fillRect(x + cardW - 42, y + cardH - 12, 12, 4);
    }

    state.shopCards.push({ x, y, w: cardW, h: cardH, itemId: item.id, lockedByKey, owned });
  }

  ctx.fillStyle = state.shopForeheadStare ? "#ff9ea5" : state.shopMessageColor || "#c5d9f2";
  ctx.font = "17px Trebuchet MS";
  ctx.fillText(
    state.shopMessage || "Jim says the vending machine is 90% Jell-O and 10% disappointment.",
    92,
    457
  );
  if (state.shopForeheadStare) {
    ctx.fillStyle = "rgba(12, 14, 22, 0.55)";
    ctx.fillRect(56, 72, 848, 402);
    ctx.fillStyle = "#ffe0b8";
    ctx.font = "bold 38px Trebuchet MS";
    ctx.fillText("Jim Is Staring At Your Forehead", 182, 260);
    ctx.font = "20px Trebuchet MS";
    ctx.fillText("No dialogue. No blinking. Just leave the shop.", 246, 300);
  }

  if (state.shopConversation) {
    const boxX = 92;
    const boxY = 278;
    const boxW = 798;
    const boxH = 136;
    ctx.fillStyle = "rgba(8, 11, 20, 0.85)";
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = "#8bc8ff";
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.fillStyle = "#f5ead6";
    ctx.font = "18px Trebuchet MS";
    drawWrappedText(state.shopConversation.text, boxX + 14, boxY + 30, boxW - 28, 23, 3);

    state.shopTalkBounds = [];
    if (state.shopConversation.step === "choice") {
      const askBtn = { id: "ask", x: boxX + 16, y: boxY + 94, w: 278, h: 30 };
      const leaveBtn = { id: "leave", x: boxX + 314, y: boxY + 94, w: 160, h: 30 };
      for (const btn of [askBtn, leaveBtn]) {
        ctx.fillStyle = "#2f4f7a";
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.strokeStyle = "#8bc8ff";
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
      }
      ctx.fillStyle = "#f5ead6";
      ctx.font = "bold 16px Trebuchet MS";
      ctx.fillText("Why can't I buy top-row items?", askBtn.x + 12, askBtn.y + 20);
      ctx.fillText("Leave", leaveBtn.x + 52, leaveBtn.y + 20);
      state.shopTalkBounds.push(askBtn, leaveBtn);
    } else if (state.shopConversation.step === "pam_info") {
      const doneBtn = { id: "done", x: boxX + 16, y: boxY + 94, w: 150, h: 30 };
      ctx.fillStyle = "#2f4f7a";
      ctx.fillRect(doneBtn.x, doneBtn.y, doneBtn.w, doneBtn.h);
      ctx.strokeStyle = "#8bc8ff";
      ctx.strokeRect(doneBtn.x, doneBtn.y, doneBtn.w, doneBtn.h);
      ctx.fillStyle = "#f5ead6";
      ctx.font = "bold 16px Trebuchet MS";
      ctx.fillText("Got it", doneBtn.x + 50, doneBtn.y + 20);
      state.shopTalkBounds.push(doneBtn);
    }
  }
}

function selectShopByCanvasPoint(x, y) {
  if (state.shopTalkBounds.length > 0) {
    for (const target of state.shopTalkBounds) {
      if (x < target.x || x > target.x + target.w || y < target.y || y > target.y + target.h) continue;
      if (target.id === "talk") startJimConversation();
      else handleJimConversationClick(target.id);
      return;
    }
  }

  if (state.shopConversation) return;

  if (state.shopJimBounds) {
    const b = state.shopJimBounds;
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
      startJimConversation();
      return;
    }
  }

  for (const card of state.shopCards) {
    if (x < card.x || x > card.x + card.w || y < card.y || y > card.y + card.h) continue;
    tryBuyShopItem(card.itemId);
    return;
  }
}

function drawMissionsScene() {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#1f2f4f");
  grad.addColorStop(1, "#12213a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(10,16,28,0.84)";
  ctx.fillRect(86, 86, 788, 368);
  ctx.strokeStyle = "#8bc8ff";
  ctx.strokeRect(86, 86, 788, 368);

  ctx.fillStyle = "#ffe08f";
  ctx.font = "bold 36px Trebuchet MS";
  ctx.fillText("Missions", 420, 140);

  const savePam = state.saveData.missions.savePam;
  ctx.fillStyle = "#f5ead6";
  ctx.font = "bold 22px Trebuchet MS";
  ctx.fillText("Save Pam", 126, 208);
  ctx.font = "18px Trebuchet MS";
  ctx.fillText("Find Pam somewhere in the Warehouse and report back to Jim.", 126, 238);
  ctx.fillText(`Status: ${savePam.completed ? "Completed" : savePam.added ? "Active" : "Not Added"}`, 126, 270);

  ctx.fillStyle = "#c9ddff";
  ctx.font = "17px Trebuchet MS";
  ctx.fillText("Press M to close missions.", 126, 408);
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
  drawPursuitTarget();
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
  else if (state.scene === "missions") drawMissionsScene();
  else drawAnnexScene();

  if (state.missionToastLeft > 0) {
    const alpha = Math.min(1, state.missionToastLeft / 0.3);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(8, 14, 24, 0.86)";
    ctx.fillRect(276, 26, 408, 40);
    ctx.strokeStyle = "#8fd6ff";
    ctx.strokeRect(276, 26, 408, 40);
    ctx.fillStyle = "#d8f3ff";
    ctx.font = "bold 18px Trebuchet MS";
    ctx.fillText(state.missionToastText, 292, 52);
    ctx.globalAlpha = 1;
  }
}

function update(dt) {
  state.elapsedSec += dt;
  if (state.scene === "run") updateRun(dt);
  if (state.shopMessageLeft > 0) {
    state.shopMessageLeft = Math.max(0, state.shopMessageLeft - dt);
    if (state.shopMessageLeft === 0) state.shopMessage = "";
  }
  if (state.missionToastLeft > 0) {
    state.missionToastLeft = Math.max(0, state.missionToastLeft - dt);
    if (state.missionToastLeft === 0) state.missionToastText = "";
  }
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

  if (ev.code === "KeyM") {
    ev.preventDefault();
    if (state.scene === "missions") {
      switchScene(state.previousScene || "menu");
    } else {
      switchScene("missions");
    }
    return;
  }

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
    if (state.scene === "missions") {
      switchScene(state.previousScene || "menu");
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
  if (state.scene === "shop") {
    selectShopByCanvasPoint(x, y);
    return;
  }

  if (state.scene === "run") {
    jump();
  }
});

startBtn.addEventListener("click", () => {
  ensureAudioContext();
  if (state.scene === "missions") {
    switchScene(state.previousScene || "menu");
    return;
  }
  if (state.scene === "menu") {
    if (isWorldUnlocked(state.selectedWorldId)) {
      resetRunState(state.selectedWorldId);
      summaryPanel.hidden = true;
      nextLevelBtn.hidden = true;
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
    nextLevelBtn.hidden = true;
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

nextLevelBtn.addEventListener("click", () => {
  if (!state.pendingNextWorldId) return;
  state.selectedWorldId = state.pendingNextWorldId;
  resetRunState(state.pendingNextWorldId);
  summaryPanel.hidden = true;
  nextLevelBtn.hidden = true;
});

characterSelect.addEventListener("change", () => {
  setMenuDialogue();
});

state.saveData = loadSave();
// Restore normal progression: start with only level 1 unlocked.
state.saveData.unlockedWorldIndex = 0;
// Reset purchased powerups for clean testing.
state.saveData.upgrades = {};
// One-time wallet reset requested by user for the rebalanced economy.
if (!state.saveData.stats.economyV2ResetApplied) {
  state.saveData.currencies.schruteBucks = 0;
  state.saveData.currencies.stanleyNickels = 0;
  state.saveData.stats.economyV2ResetApplied = true;
}
persistSave();
setMenuDialogue();
updateUiForScene();
summaryPanel.hidden = true;
requestAnimationFrame(loop);
