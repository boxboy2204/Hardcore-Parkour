const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const characterSelect = document.getElementById("characterSelect");
const startBtn = document.getElementById("startBtn");
const retryBtn = document.getElementById("retryBtn");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const summaryPanel = document.getElementById("summaryPanel");
const summaryText = document.getElementById("summaryText");
const cornerTv = document.getElementById("cornerTv");
const cornerLogo = document.getElementById("cornerLogo");

const SAVE_KEY = "hardcore_parkour_save_v1";
const RESET_ONCE_KEY = "hardcore_parkour_reset_once_v1";

const CHARACTER_PRESETS = {
  michael: {
    label: "Michael",
    color: "#151820",
    tieColor: "#f5f7fb",
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
    color: "#5a3820",
    tieColor: "#9a1f2f",
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
  { id: "pursuit", label: "Final Pursuit", subtitle: "Catch the Scranton Strangler at x10 Hardcore" },
];

const THEME_OBSTACLE_POOLS = {
  bullpen: ["desk", "angela_cat", "chili_spill"],
  warehouse: ["paper_pile", "shelf", "ladder"],
  streets: ["lightpole", "jim_snowball", "hydrant"],
  corporate: ["desk", "jan_folder", "bystander"],
  pursuit: ["folder", "paper_ream", "mung_beans"],
  skarn: ["hockey_puck", "hydrant", "goldenface_minion"],
};

const THEME_LABELS = {
  bullpen: "The Bullpen",
  warehouse: "The Warehouse",
  streets: "Scranton Streets",
  corporate: "NYC Corporate",
  pursuit: "Final Pursuit",
  skarn: "Threat Level Midnight",
};

const LEVEL_DIFFICULTY = {
  bullpen: { label: "Very Easy", obstacleSpeedMul: 0.82, spawnBase: 1.35, spawnRand: 0.85, spawnMin: 0.72 },
  warehouse: { label: "Easy", obstacleSpeedMul: 0.92, spawnBase: 1.12, spawnRand: 0.78, spawnMin: 0.60 },
  streets: { label: "Medium", obstacleSpeedMul: 1.0, spawnBase: 0.95, spawnRand: 0.72, spawnMin: 0.50 },
  corporate: { label: "Hard", obstacleSpeedMul: 1.12, spawnBase: 0.82, spawnRand: 0.68, spawnMin: 0.42 },
  pursuit: { label: "Super Hard", obstacleSpeedMul: 1.24, spawnBase: 0.68, spawnRand: 0.56, spawnMin: 0.34 },
  skarn: { label: "Cinematic", obstacleSpeedMul: 1.08, spawnBase: 0.88, spawnRand: 0.62, spawnMin: 0.44 },
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

const ANNEX_OUTFITS = [
  {
    id: "cornell_fit",
    name: "The Cornell Fit",
    cost: 180,
    character: "andy",
    requiredAchievement: null,
    tagline: "Andy only. Crimson blazer, peak a cappella energy.",
    kelly:
      "Kelly: Omigosh, Andy, you look like a mascot for a school I have definitely heard of!",
  },
  {
    id: "ryan_beard",
    name: "Ryan's Beard",
    cost: 0,
    character: "all",
    requiredAchievement: "hottestInOffice",
    tagline: "Dundie reward. Boardroom outlaw mode with aggressive stubble.",
    kelly:
      "Kelly: You look like a bad boy back from a corporate retreat... I love it. Here is 500 Schrute Bucks!",
  },
  {
    id: "date_mike",
    name: "Date Mike",
    cost: 220,
    character: "michael",
    requiredAchievement: null,
    tagline: "Michael only. Pool-hall vintage chaos.",
    kelly:
      "Kelly: You look like you are about to lose all your money at a pool hall. It is so vintage.",
  },
  {
    id: "wrong_fit",
    name: "The Wrong Fit",
    cost: 0,
    character: "all",
    requiredAchievement: "dontGoInThere",
    tagline: "Dundie reward. Ironic-chic disaster fit. Still iconic.",
    kelly:
      "Kelly: Is that a sumo suit in New York? That is so ironic-chic, I literally cannot even.",
  },
  {
    id: "recyclops",
    name: "Recyclops",
    cost: 240,
    character: "dwight",
    requiredAchievement: null,
    tagline: "Dwight only. Eco-terrorist chic.",
    kelly:
      "Kelly: Is this for Burning Man? You look like a transformer stuck in a dumpster and I am kind of obsessed.",
  },
  {
    id: "three_hole_gym",
    name: "Jim's Three-Hole Shirt",
    cost: 0,
    character: "all",
    requiredAchievement: "whitestSneakers",
    tagline: "Dundie reward. Jim's classic shirt with three horizontal punch holes.",
    kelly:
      "Kelly: Jim-core. Minimal, iconic, and yes, the holes are a deliberate fashion choice.",
  },
  {
    id: "goldenface",
    name: "Goldenface Suit",
    cost: 0,
    character: "all",
    requiredAchievement: null,
    tagline: "Secret mission fit. Jim's desk stash for full villain energy.",
    kelly: "Kelly: Goldenface is giving dramatic anti-hero and I respect that commitment.",
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
  menuMugBounds: null,
  menuDialogue: "Pick a Sticky Note so we can go, now.",
  menuClickWorldId: null,
  menuClickLeft: 0,
  menuClickMessage: "",
  pendingNextWorldId: null,
  pendingNextAction: null,
  cutsceneTimeSec: 0,
  cutsceneFadeLeft: 0,
  cutsceneSongStep: 0,
  cutsceneSongTimer: 0,
  cutsceneBbCount: 0,
  cutsceneLyricLine: 0,
  skarnMusicTimer: 0,
  skarnMusicStep: 0,
  levelMusicTimer: 0,
  levelMusicStep: 0,
  levelMusicWorld: null,
  shopCards: [],
  shopJimBounds: null,
  shopPamBounds: null,
  shopTalkBounds: [],
  shopConversation: null,
  deskBounds: null,
  deskDrawerBounds: null,
  deskGoldenfaceBounds: null,
  deskDrawerOpen: false,
  shopMessage: "",
  shopMessageColor: "#c5d9f2",
  shopMessageLeft: 0,
  shopForeheadStare: false,
  missionToastText: "",
  missionToastLeft: 0,
  annexCards: [],
  annexAchievementBounds: [],
  annexMessage: "Kelly: Welcome to the Annex Boutique, where confidence is mandatory and glitter is a lifestyle.",
  annexMessageLeft: 0,
  pamQuestRun: false,
  pamSpottedCount: 0,
  pamRequiredCount: 5,
  pamVisible: false,
  pamVisibleLeft: 0,
  pamNextSpawnSec: 0,
  pamX: 0,
  pamY: 0,
  cornerLogoX: 8,
  cornerLogoY: 8,
  cornerLogoVX: 154,
  cornerLogoVY: 126,
  cornerLogoWidth: 92,
  cornerLogoHeight: 52,
  cornerLogoColorT: 0,
  cornerLogoRewardCooldown: 0,
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
      equippedOutfits: {
        michael: null,
        dwight: null,
        andy: null,
      },
    },
    upgrades: {},
    achievements: {
      hottestInOffice: false,
      whitestSneakers: false,
      dontGoInThere: false,
    },
    missions: {
      savePam: {
        added: false,
        completed: false,
        warehouseCleared: false,
        sightingsBest: 0,
      },
      captureStrangler: {
        added: false,
        completed: false,
      },
      threatLevelMidnight: {
        added: false,
        completed: false,
      },
    },
    stats: {
      bestHardcoreChain: 0,
      lifetimeRuns: 0,
      economyV2ResetApplied: false,
      ryanBeardBonusClaimed: false,
      janFolderHits: 0,
      bullpenClears: 0,
    },
  };
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return createDefaultSave();
    const parsed = JSON.parse(raw);
    const defaults = createDefaultSave();
    const parsedMissions = parsed.missions || {};
    const parsedSavePam = parsedMissions.savePam || {};
    const parsedCaptureStrangler = parsedMissions.captureStrangler || {};
    const parsedThreatLevelMidnight = parsedMissions.threatLevelMidnight || {};
    const parsedUnlocks = parsed.unlocks || {};
    const parsedEquippedOutfits = parsedUnlocks.equippedOutfits || {};
    const parsedAchievements = parsed.achievements || {};
    const legacyAchievementKey = Object.keys(parsedAchievements).find(
      (key) => !(key in defaults.achievements) && parsedAchievements[key] === true
    );
    const migratedAchievements = {
      ...defaults.achievements,
      ...parsedAchievements,
      // Migration: keep legacy award progress under the new award key.
      hottestInOffice: Boolean(
        parsedAchievements.hottestInOffice || (legacyAchievementKey ? parsedAchievements[legacyAchievementKey] : false)
      ),
    };

    return {
      ...defaults,
      ...parsed,
      currencies: { ...defaults.currencies, ...(parsed.currencies || {}) },
      unlocks: {
        ...defaults.unlocks,
        ...parsedUnlocks,
        equippedOutfits: {
          ...defaults.unlocks.equippedOutfits,
          ...parsedEquippedOutfits,
        },
      },
      upgrades: { ...defaults.upgrades, ...(parsed.upgrades || {}) },
      achievements: migratedAchievements,
      missions: {
        ...defaults.missions,
        ...parsedMissions,
        savePam: { ...defaults.missions.savePam, ...parsedSavePam },
        captureStrangler: { ...defaults.missions.captureStrangler, ...parsedCaptureStrangler },
        threatLevelMidnight: { ...defaults.missions.threatLevelMidnight, ...parsedThreatLevelMidnight },
      },
      stats: { ...defaults.stats, ...(parsed.stats || {}) },
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

function playCutsceneSingingNote(frequency, durationSec = 0.28) {
  const audioCtx = ensureAudioContext();
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") audioCtx.resume();

  const now = audioCtx.currentTime;
  const hold = Math.max(0.08, durationSec * 0.85);
  const releaseEnd = Math.max(0.1, durationSec);
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
  gain.gain.setValueAtTime(0.08, now + hold);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + releaseEnd);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + releaseEnd + 0.01);
}

function updateCutsceneSong(dt) {
  // Requested riff: G, G#, Bb, G#(half), quarter rest, G, G#, Bb.
  const melody = [392, 415.3, 466.16, 415.3, null, 392, 415.3, 466.16];
  const durations = [0.44, 0.44, 0.44, 0.88, 0.44, 0.44, 0.44, 1.76];
  const bFlat = 466.16;

  state.cutsceneSongTimer -= dt;
  while (state.cutsceneSongTimer <= 0) {
    const idx = state.cutsceneSongStep % melody.length;
    if (melody[idx]) {
      playCutsceneSingingNote(melody[idx], durations[idx]);
      if (melody[idx] === bFlat) {
        state.cutsceneBbCount += 1;
        if (state.cutsceneBbCount % 2 === 0) {
          state.cutsceneLyricLine = state.cutsceneLyricLine === 0 ? 1 : 0;
        }
      }
    }
    state.cutsceneSongStep += 1;
    state.cutsceneSongTimer += durations[idx] || 0.25;
  }
}

function playSkarnRetroNote(frequency, durationSec = 0.18, type = "square", level = 0.05) {
  const audioCtx = ensureAudioContext();
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") audioCtx.resume();
  const now = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(level, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.08, durationSec));
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + Math.max(0.09, durationSec) + 0.01);
}

function playLevelNote(frequency, durationSec, type, level) {
  const audioCtx = ensureAudioContext();
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") audioCtx.resume();
  const now = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(level, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.08, durationSec));
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + Math.max(0.09, durationSec) + 0.01);
}

const LEVEL_MUSIC = {
  bullpen: {
    // Sunny, goofy pep rally (major pentatonic).
    stepLen: 0.36,
    bass: [
      98.0, null, 110.0, null, 123.47, null, 110.0, null,
      87.31, null, 98.0, null, 110.0, null, 98.0, null,
    ],
    lead: [
      392.0, 440.0, 493.88, 440.0, 392.0, 440.0, 493.88, 523.25,
      493.88, 440.0, 392.0, 440.0, 392.0, 440.0, 392.0, 349.23,
    ],
    arp: [
      659.25, 739.99, 783.99, 739.99, 659.25, 739.99, 783.99, 739.99,
      659.25, 739.99, 783.99, 739.99, 659.25, 739.99, 783.99, 739.99,
    ],
    level: 0.028,
    leadType: "triangle",
    bassType: "triangle",
    arpType: "square",
  },
  warehouse: {
    // Industrial, clanky minor groove.
    stepLen: 0.3,
    bass: [
      98.0, 98.0, null, 110.0, 123.47, null, 110.0, 98.0,
      110.0, null, 123.47, 130.81, null, 110.0, 98.0, null,
    ],
    lead: [
      392.0, null, 440.0, 392.0, 523.25, null, 493.88, 440.0,
      392.0, null, 440.0, 392.0, 440.0, null, 392.0, 349.23,
    ],
    arp: [
      587.33, 659.25, null, 739.99, 659.25, null, 587.33, null,
      739.99, null, 659.25, 587.33, null, 659.25, null, 587.33,
    ],
    level: 0.032,
    leadType: "square",
    bassType: "sawtooth",
    arpType: "square",
  },
  streets: {
    // Snowy glide with bell-like arps.
    stepLen: 0.26,
    bass: [
      110.0, null, 123.47, null, 130.81, null, 146.83, null,
      123.47, null, 110.0, null, 123.47, null, 130.81, null,
    ],
    lead: [
      523.25, 587.33, 659.25, null, 587.33, 523.25, null, 587.33,
      659.25, 698.46, null, 659.25, 587.33, null, 523.25, 587.33,
    ],
    arp: [
      987.77, 880.0, 783.99, 739.99, 783.99, 880.0, 987.77, 1046.5,
      987.77, 880.0, 783.99, 739.99, 783.99, 880.0, 987.77, 1046.5,
    ],
    bells: [
      // Jingle Bells melody in G major, two phrases long.
      1567.98, 1567.98, 1567.98, null, 1567.98, 1567.98, 1567.98, null,
      1567.98, 1975.53, 1318.51, 1480.0, 1567.98, null, null, null,
      1760.0, 1760.0, 1760.0, 1760.0, 1760.0, 1567.98, 1567.98, null,
      1567.98, 1480.0, 1480.0, 1567.98, 1480.0, 1975.53, null, null,
    ],
    level: 0.034,
    leadType: "triangle",
    bassType: "triangle",
    arpType: "square",
    bellType: "triangle",
  },
  corporate: {
    // Sleek, tense boardroom funk.
    stepLen: 0.22,
    bass: [
      123.47, null, 130.81, null, 146.83, null, 164.81, null,
      146.83, null, 130.81, null, 123.47, null, 130.81, null,
    ],
    lead: [
      493.88, 523.25, null, 587.33, 659.25, null, 587.33, 523.25,
      493.88, null, 523.25, 587.33, null, 659.25, 587.33, 523.25,
    ],
    arp: [
      783.99, null, 880.0, 987.77, null, 1046.5, 987.77, null,
      880.0, 783.99, null, 880.0, 987.77, null, 1046.5, 987.77,
    ],
    level: 0.04,
    leadType: "sawtooth",
    bassType: "square",
    arpType: "square",
  },
  pursuit: {
    // Aggressive, fast chase.
    stepLen: 0.18,
    bass: [
      130.81, 146.83, 164.81, 174.61, 164.81, 146.83, 130.81, 146.83,
      174.61, 196.0, 220.0, 196.0, 174.61, 164.81, 146.83, 130.81,
    ],
    lead: [
      523.25, 587.33, 698.46, 659.25, 587.33, 523.25, 587.33, 659.25,
      698.46, 783.99, 880.0, 783.99, 698.46, 659.25, 587.33, 523.25,
    ],
    arp: [
      1046.5, 1174.66, 987.77, 880.0, 987.77, 1046.5, 1174.66, 987.77,
      880.0, 987.77, 1046.5, 1174.66, 1318.51, 1174.66, 1046.5, 987.77,
    ],
    level: 0.048,
    leadType: "sawtooth",
    bassType: "sawtooth",
    arpType: "square",
  },
};

function updateLevelMusic(dt) {
  const active =
    state.scene === "run" &&
    state.running &&
    !state.paused &&
    !state.gameOver &&
    state.runWorldId !== "skarn";

  if (!active) {
    state.levelMusicTimer = 0;
    state.levelMusicStep = 0;
    state.levelMusicWorld = null;
    return;
  }

  const config = LEVEL_MUSIC[state.runWorldId];
  if (!config) return;

  if (state.levelMusicWorld !== state.runWorldId) {
    state.levelMusicWorld = state.runWorldId;
    state.levelMusicTimer = 0;
    state.levelMusicStep = 0;
  }

  state.levelMusicTimer -= dt;
  while (state.levelMusicTimer <= 0) {
    const idx = state.levelMusicStep % config.bass.length;
    const bassNote = config.bass[idx];
    const leadNote = config.lead[idx];
    const arpNote = config.arp[idx];
    if (bassNote) playLevelNote(bassNote, config.stepLen * 0.8, config.bassType, config.level * 0.9);
    if (leadNote) playLevelNote(leadNote, config.stepLen * 0.6, config.leadType, config.level);
    if (arpNote) playLevelNote(arpNote, config.stepLen * 0.45, config.arpType, config.level * 0.7);
    if (config.bells) {
      const bellNote = config.bells[idx % config.bells.length];
      if (bellNote) playLevelNote(bellNote, config.stepLen * 0.6, config.bellType || "triangle", config.level * 0.9);
    }
    if (idx % 4 === 0 && leadNote) {
      playLevelNote(leadNote * 0.5, config.stepLen * 0.35, "square", config.level * 0.5);
    }
    state.levelMusicStep += 1;
    state.levelMusicTimer += config.stepLen;
  }
}

function updateSkarnMusic(dt) {
  const active =
    state.scene === "run" && state.runWorldId === "skarn" && state.running && !state.paused && !state.gameOver;
  if (!active) {
    state.skarnMusicTimer = 0;
    state.skarnMusicStep = 0;
    return;
  }

  const bass = [
    98.0, 98.0, 110.0, 110.0, 123.47, 123.47, 110.0, 98.0,
    98.0, 98.0, 87.31, 87.31, 82.41, 82.41, 87.31, 98.0,
  ];
  const leadA = [
    392.0, 440.0, 493.88, 523.25, 659.25, 587.33, 523.25, 493.88,
    440.0, 493.88, 523.25, 587.33, 659.25, 587.33, 523.25, 493.88,
  ];
  const leadB = [
    440.0, 493.88, 523.25, 587.33, 698.46, 659.25, 587.33, 523.25,
    493.88, 523.25, 587.33, 659.25, 783.99, 698.46, 659.25, 587.33,
  ];
  const arpA = [
    783.99, 880.0, 987.77, 880.0, 1046.5, 987.77, 880.0, 783.99,
    739.99, 783.99, 880.0, 783.99, 987.77, 880.0, 783.99, 739.99,
  ];
  const arpB = [
    880.0, 987.77, 1046.5, 987.77, 1174.66, 1046.5, 987.77, 880.0,
    783.99, 880.0, 987.77, 880.0, 1046.5, 987.77, 880.0, 783.99,
  ];
  const stepLen = 0.175;

  state.skarnMusicTimer -= dt;
  while (state.skarnMusicTimer <= 0) {
    const idx = state.skarnMusicStep % 16;
    const section = Math.floor(state.skarnMusicStep / 16) % 4;
    const useB = section >= 2;
    const lead = useB ? leadB : leadA;
    const arp = useB ? arpB : arpA;
    playSkarnRetroNote(bass[idx], 0.13, "sawtooth", 0.045);
    playSkarnRetroNote(lead[idx], 0.1, "square", 0.032);
    playSkarnRetroNote(arp[idx], 0.07, "triangle", 0.02);
    if (idx % 4 === 0) playSkarnRetroNote(lead[idx] * 0.5, 0.08, "square", 0.02);
    state.skarnMusicStep += 1;
    state.skarnMusicTimer += stepLen;
  }
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

function syncDundieOutfitRewards() {
  if (!state.saveData) return;
  let changed = false;

  if (state.saveData.achievements.hottestInOffice && !state.saveData.unlocks.outfitsUnlocked.includes("ryan_beard")) {
    state.saveData.unlocks.outfitsUnlocked.push("ryan_beard");
    changed = true;
  }
  if (
    state.saveData.achievements.whitestSneakers &&
    !state.saveData.unlocks.outfitsUnlocked.includes("three_hole_gym")
  ) {
    state.saveData.unlocks.outfitsUnlocked.push("three_hole_gym");
    changed = true;
  }
  if (state.saveData.achievements.dontGoInThere && !state.saveData.unlocks.outfitsUnlocked.includes("wrong_fit")) {
    state.saveData.unlocks.outfitsUnlocked.push("wrong_fit");
    changed = true;
  }

  if (changed) persistSave();
}

function syncPostKeyMissionRewards() {
  if (!state.saveData) return;
  let changed = false;
  const missions = state.saveData.missions;

  if (state.saveData.unlocks.jimDeskKey) {
    if (!missions.threatLevelMidnight.added) {
      missions.threatLevelMidnight.added = true;
      showMissionToast('Mission Added: "Threat Level Midnight"');
      changed = true;
    }
    if (!state.saveData.unlocks.outfitsUnlocked.includes("goldenface")) {
      state.saveData.unlocks.outfitsUnlocked.push("goldenface");
      changed = true;
    }
  }

  if (changed) persistSave();
}

function showAnnexMessage(text) {
  state.annexMessage = text;
  state.annexMessageLeft = 3.6;
}

function awardCornerTvJackpot() {
  state.saveData.currencies.schruteBucks += 250;
  state.cornerLogoRewardCooldown = 0.8;
  persistSave();
  showMissionToast("Corner hit! +250 Schrute Bucks from the office TV.");
}

function updateCornerTv(dt) {
  if (!cornerTv || !cornerLogo) return;

  const rect = cornerLogo.getBoundingClientRect();
  const logoW = Math.max(1, Math.round(rect.width || cornerLogo.clientWidth || state.cornerLogoWidth));
  const logoH = Math.max(1, Math.round(rect.height || cornerLogo.clientHeight || state.cornerLogoHeight));
  const maxX = Math.max(0, window.innerWidth - logoW);
  const maxY = Math.max(0, window.innerHeight - logoH);
  if (maxX <= 0 || maxY <= 0) return;

  state.cornerLogoX += state.cornerLogoVX * dt;
  state.cornerLogoY += state.cornerLogoVY * dt;

  let hitX = false;
  let hitY = false;

  if (state.cornerLogoX <= 0) {
    state.cornerLogoX = 0;
    state.cornerLogoVX = Math.abs(state.cornerLogoVX);
    hitX = true;
  } else if (state.cornerLogoX >= maxX) {
    state.cornerLogoX = maxX;
    state.cornerLogoVX = -Math.abs(state.cornerLogoVX);
    hitX = true;
  }

  if (state.cornerLogoY <= 0) {
    state.cornerLogoY = 0;
    state.cornerLogoVY = Math.abs(state.cornerLogoVY);
    hitY = true;
  } else if (state.cornerLogoY >= maxY) {
    state.cornerLogoY = maxY;
    state.cornerLogoVY = -Math.abs(state.cornerLogoVY);
    hitY = true;
  }

  if (hitX && hitY) {
    // Only reward actual corner collisions, and keep jackpot rare.
    if (Math.random() < 0.01 && state.cornerLogoRewardCooldown <= 0 && state.saveData) {
      awardCornerTvJackpot();
    }
  }

  state.cornerLogoColorT += dt * 0.45;
  const palette = [
    [95, 255, 136], // green
    [255, 94, 109], // red
    [88, 140, 255], // blue
  ];
  const seg = Math.floor(state.cornerLogoColorT) % palette.length;
  const next = (seg + 1) % palette.length;
  const t = state.cornerLogoColorT - Math.floor(state.cornerLogoColorT);
  const c0 = palette[seg];
  const c1 = palette[next];
  const r = Math.round(c0[0] + (c1[0] - c0[0]) * t);
  const g = Math.round(c0[1] + (c1[1] - c0[1]) * t);
  const b = Math.round(c0[2] + (c1[2] - c0[2]) * t);
  const darkR = Math.round(r * 0.45);
  const darkG = Math.round(g * 0.45);
  const darkB = Math.round(b * 0.45);
  cornerLogo.style.background = `linear-gradient(145deg, rgb(${r}, ${g}, ${b}), rgb(${darkR}, ${darkG}, ${darkB}))`;
  cornerLogo.style.boxShadow = `0 0 12px rgba(${r}, ${g}, ${b}, 0.55)`;
  cornerLogo.style.left = `${Math.round(state.cornerLogoX)}px`;
  cornerLogo.style.top = `${Math.round(state.cornerLogoY)}px`;
  cornerLogo.style.transform = "none";
}

function getRunnerId() {
  return characterSelect.value;
}

function getRunnerIdFromLabel(label) {
  if (label === "Michael") return "michael";
  if (label === "Dwight") return "dwight";
  if (label === "Andy") return "andy";
  return getRunnerId();
}

function getOutfitRunnerId() {
  if (state.scene === "run" && state.player?.preset?.label) {
    return getRunnerIdFromLabel(state.player.preset.label);
  }
  return getRunnerId();
}

function ownsOutfit(id) {
  return state.saveData.unlocks.outfitsUnlocked.includes(id);
}

function isOutfitUsableByRunner(outfit, runnerId = getRunnerId()) {
  return outfit.character === "all" || outfit.character === runnerId;
}

function hasOutfitAchievementRequirement(outfit) {
  if (!outfit.requiredAchievement) return true;
  return Boolean(state.saveData.achievements[outfit.requiredAchievement]);
}

function isDundieRewardOutfit(outfit) {
  return outfit.id === "ryan_beard" || outfit.id === "wrong_fit" || outfit.id === "three_hole_gym";
}

function getAchievementLabel(achievementId) {
  if (achievementId === "hottestInOffice") return "Hottest in the Office";
  if (achievementId === "whitestSneakers") return "Whitest Sneakers";
  if (achievementId === "dontGoInThere") return "Don't Go In There";
  return "Unknown Dundie";
}

function unlockDundieAward(achievementId) {
  if (!state.saveData || state.saveData.achievements[achievementId]) return false;
  state.saveData.achievements[achievementId] = true;
  syncDundieOutfitRewards();
  showMissionToast(`Dundie Unlocked: "${getAchievementLabel(achievementId)}"`);
  addFloatingText("DUNDIE!", state.player ? state.player.x + 2 : 420, state.player ? state.player.y - 42 : 120, "#ffe48a");
  persistSave();
  return true;
}

function getEquippedOutfitId(runnerId = getRunnerId()) {
  return state.saveData.unlocks.equippedOutfits[runnerId] || null;
}

function toggleOutfit(outfitId) {
  const outfit = ANNEX_OUTFITS.find((o) => o.id === outfitId);
  if (!outfit) return;
  const runnerId = getRunnerId();

  if (!isOutfitUsableByRunner(outfit, runnerId)) {
    showAnnexMessage(
      `Kelly: Cute, but this fit is for ${outfit.character === "all" ? "everyone" : outfit.character}. Do not freestyle this, okay?`
    );
    return;
  }
  if (!hasOutfitAchievementRequirement(outfit)) {
    if (isDundieRewardOutfit(outfit) && outfit.requiredAchievement) {
      showAnnexMessage(
        `Kelly: This unlock comes from the "${getAchievementLabel(outfit.requiredAchievement)}" Dundie. Go earn it.`
      );
    } else {
      showAnnexMessage("Kelly: Win more Dundies first. Fashion is merit-based, like chaos.");
    }
    return;
  }

  if (!ownsOutfit(outfit.id)) {
    if (isDundieRewardOutfit(outfit)) {
      if (!hasOutfitAchievementRequirement(outfit)) {
        showAnnexMessage(
          `Kelly: That fit is Dundie-locked. You need "${getAchievementLabel(
            outfit.requiredAchievement
          )}" first.`
        );
        return;
      }
      state.saveData.unlocks.outfitsUnlocked.push(outfit.id);
    } else {
      if (state.saveData.currencies.schruteBucks < outfit.cost) {
        showAnnexMessage("Kelly: No Schrute Bucks, no boutique magic. This is not a charity runway.");
        return;
      }
      state.saveData.currencies.schruteBucks -= outfit.cost;
      state.saveData.unlocks.outfitsUnlocked.push(outfit.id);
    }
  }

  const currentlyEquipped = getEquippedOutfitId(runnerId);
  if (currentlyEquipped === outfit.id) {
    state.saveData.unlocks.equippedOutfits[runnerId] = null;
    persistSave();
    showAnnexMessage("Kelly: We love a quick outfit pivot. Iconic behavior.");
    return;
  }

  state.saveData.unlocks.equippedOutfits[runnerId] = outfit.id;
  const ryanBonusNow = outfit.id === "ryan_beard" && !state.saveData.stats.ryanBeardBonusClaimed;
  if (ryanBonusNow) {
    state.saveData.stats.ryanBeardBonusClaimed = true;
    state.saveData.currencies.schruteBucks += 500;
  }
  persistSave();
  if (outfit.id === "ryan_beard" && !ryanBonusNow) {
    showAnnexMessage("Kelly: Still obsessed with this beard. Bonus already claimed, but the drama is timeless.");
    return;
  }
  showAnnexMessage(outfit.kelly);
}

function startJimConversation() {
  if (state.shopForeheadStare) return;
  state.shopConversation = {
    actor: "jim",
    step: "choice",
    text: "Jim: Nice try. Those top-row items are in witness protection.",
  };
}

function handleJimConversationClick(choiceId) {
  if (!state.shopConversation) return;

  if (state.shopConversation.step === "choice") {
    if (choiceId === "ask") {
      const savePam = state.saveData.missions.savePam;
      const capture = state.saveData.missions.captureStrangler;
      let jimLine =
        "Jim: Top row stays locked until you save Pam. She's somewhere in the Warehouse. Find her, bring back the key, then we talk.";
      if (savePam.warehouseCleared && !savePam.completed) {
        jimLine =
          "Jim: Top row stays locked until you save Pam. Warehouse round two rules: replay that level, press P every time Pam pops up in the background, and finish with 5 sightings.";
      } else if (savePam.completed) {
        jimLine = capture.completed
          ? "Jim: You caught the Scranton Strangler. Talk to Pam for your key."
          : "Jim: You saved Pam. Next step is her call. Go talk to her.";
      }
      state.shopConversation = {
        actor: "jim",
        step: "pam_info",
        text: jimLine,
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

function startPamConversation() {
  if (state.shopForeheadStare || !state.saveData?.missions?.savePam?.completed) return;
  const capture = state.saveData.missions.captureStrangler;
  const tlm = state.saveData.missions.threatLevelMidnight;
  if (tlm.completed) {
    state.shopConversation = {
      actor: "pam",
      step: "post_midnight",
      text:
        "Pam: You actually pulled off Threat Level Midnight. That was... weirdly heroic. Art school suddenly feels less scary now.",
    };
    return;
  }
  if (capture.completed && !state.saveData.unlocks.jimDeskKey) {
    state.shopConversation = {
      actor: "pam",
      step: "reward_ready",
      text: "Pam: You did it. You caught the Scranton Strangler. Here, take Jim's Desk Key.",
    };
    return;
  }
  if (capture.completed && state.saveData.unlocks.jimDeskKey) {
    state.shopConversation = {
      actor: "pam",
      step: "post_capture",
      text:
        "Pam: You really did it. Jim's desk should open now. Press D in the conference room, grab Goldenface, then tap Michael's mug.",
    };
    return;
  }
  state.shopConversation = {
    actor: "pam",
    step: "intro",
    text: "Pam: Dunder Mifflin, this is Pam.",
  };
}

function handlePamConversationClick(choiceId) {
  if (!state.shopConversation) return;
  const capture = state.saveData.missions.captureStrangler;

  if (state.shopConversation.step === "intro") {
    if (choiceId === "ask_how") {
      state.shopConversation = {
        actor: "pam",
        step: "how_doing",
        text: "Pam: Well, I want to go to art school, but I am too afraid to go out when the Strangler is on the loose.",
      };
      return;
    }
    state.shopConversation = null;
    return;
  }

  if (state.shopConversation.step === "how_doing") {
    if (choiceId === "catch_strangler") {
      state.shopConversation = {
        actor: "pam",
        step: "offer_help",
        text:
          "Pam: Really! That would be great, and I'll tell you what, once you capture the Strangler come to me, I might have something for you.",
      };
      return;
    }
    state.shopConversation = null;
    return;
  }

  if (state.shopConversation.step === "offer_help") {
    if (!capture.added) {
      capture.added = true;
      persistSave();
      showMissionToast("New Mission: Capture The Strangler");
    }
    state.shopConversation = null;
    return;
  }

  if (state.shopConversation.step === "reward_ready") {
    state.saveData.unlocks.jimDeskKey = true;
    persistSave();
    showMissionToast("Mission Reward: Jim's Desk Key");
    showShopMessage("Pam handed you Jim's Desk Key. Top row unlocked.", "#d3ffbf");
    state.shopConversation = null;
    return;
  }

  if (state.shopConversation.step === "post_capture") {
    state.shopConversation = null;
    return;
  }

  if (state.shopConversation.step === "post_midnight") {
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
    showShopMessage("Jim: top row stays in Jell-O until Pam gives you my key.", "#ffb4a7");
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
  const leavingCutscene = state.scene === "cutscene" && sceneId !== "cutscene";
  state.previousScene = state.scene;
  state.scene = sceneId;
  state.paused = false;
  summaryPanel.hidden = true;
  nextLevelBtn.hidden = true;
  if (leavingShop) state.shopForeheadStare = false;
  if (sceneId !== "shop") state.shopConversation = null;
  if (sceneId === "desk") state.deskDrawerOpen = false;
  if (sceneId === "cutscene") {
    state.cutsceneTimeSec = 0;
    state.cutsceneFadeLeft = 0.85;
    state.cutsceneSongStep = 0;
    state.cutsceneSongTimer = 0.02;
    state.cutsceneBbCount = 0;
    state.cutsceneLyricLine = 0;
  }
  if (leavingCutscene) {
    state.cutsceneFadeLeft = 0;
    state.cutsceneSongStep = 0;
    state.cutsceneSongTimer = 0;
    state.cutsceneBbCount = 0;
    state.cutsceneLyricLine = 0;
  }
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
  } else if (state.scene === "cutscene") {
    startBtn.textContent = "Back To Menu";
    retryBtn.hidden = true;
  } else if (state.scene === "shop") {
    startBtn.textContent = "Back To Menu";
    retryBtn.textContent = "Go Annex";
    retryBtn.hidden = false;
  } else if (state.scene === "desk") {
    startBtn.textContent = "Back To Menu";
    retryBtn.hidden = true;
  } else {
    startBtn.textContent = "Back To Menu";
    retryBtn.textContent = "Go Shop";
    retryBtn.hidden = false;
  }
}

function resetRunState(worldId = state.selectedWorldId) {
  const preset = CHARACTER_PRESETS[characterSelect.value];
  const savePam = state.saveData.missions.savePam;
  const pamQuestRun = worldId === "warehouse" && savePam.added && !savePam.completed && savePam.warehouseCleared;
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
  state.pamQuestRun = pamQuestRun;
  state.pamSpottedCount = 0;
  state.pamRequiredCount = 5;
  state.pamVisible = false;
  state.pamVisibleLeft = 0;
  state.pamNextSpawnSec = pamQuestRun ? 4.2 : 0;
  state.pamX = 0;
  state.pamY = 0;
  state.tobyDistance = 100;
  state.obstacles = [];

  if (pamQuestRun) state.worldBannerText = "Warehouse: Save Pam";

  const hpBonus = ownsUpgrade("gel_shield") ? 1 : 0;
  const speedBonus = ownsUpgrade("parkour_shoes") ? 18 : 0;
  const stumbleTuning = ownsUpgrade("chili_guard") ? 0.72 : 1;
  const styleTuning = ownsUpgrade("mifflin_tape") ? 1.1 : 1;
  const boostTuning = ownsUpgrade("energy_mug") ? 1.2 : 1;

  state.player = {
    preset,
    x: worldId === "pursuit" ? 90 : 180,
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

function getPursuitCarPosition() {
  return {
    x: canvas.width - 138,
    y: GAME.floorTop - 48,
  };
}

function spawnObstacle() {
  const difficulty = LEVEL_DIFFICULTY[state.runWorldId] || LEVEL_DIFFICULTY.bullpen;
  const distanceFactor = Math.min(1.75, 1 + state.worldTimeSec / 75) * difficulty.obstacleSpeedMul;
  const pool = THEME_OBSTACLE_POOLS[state.theme] || THEME_OBSTACLE_POOLS.bullpen;
  const type = pool[Math.floor(Math.random() * pool.length)];

  const size = {
    desk: { w: 52, h: 46, topOffset: 0, hp: 1 },
    angela_cat: { w: 34, h: 24, topOffset: -40, hp: 1 },
    chili_spill: { w: 74, h: 28, topOffset: -2, hp: 1 },
    paper_pile: { w: 46, h: 30, topOffset: 8, hp: 1 },
    shelf: { w: 58, h: 54, topOffset: 0, hp: 1 },
    ladder: { w: 64, h: 48, topOffset: -22, hp: 1 },
    lightpole: { w: 24, h: 76, topOffset: 4, hp: 1 },
    jim_snowball: { w: 24, h: 24, topOffset: -24, hp: 1 },
    hydrant: { w: 36, h: 40, topOffset: 4, hp: 1 },
    jan_folder: { w: 34, h: 18, topOffset: -36, hp: 1 },
    bystander: { w: 34, h: 56, topOffset: 2, hp: 1 },
    folder: { w: 34, h: 18, topOffset: -36, hp: 1 },
    paper_ream: { w: 38, h: 24, topOffset: -6, hp: 1 },
    mung_beans: { w: 22, h: 22, topOffset: -18, hp: 1 },
    hockey_puck: { w: 24, h: 12, topOffset: -18, hp: 1 },
    goldenface_minion: { w: 34, h: 54, topOffset: 2, hp: 1 },
  }[type];

  let spawnX = canvas.width + 20;
  let top = GAME.groundY - size.h + size.topOffset;
  if (state.runWorldId === "pursuit") {
    const car = getPursuitCarPosition();
    spawnX = car.x + 44 + Math.random() * 10;
    const ejectY = {
      folder: car.y + 6,
      paper_ream: car.y + 14,
      mung_beans: car.y + 18,
    }[type];
    if (typeof ejectY === "number") top = ejectY;
  }

  state.obstacles.push({
    type,
    x: spawnX,
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
  state.stars = reason === "toby_caught" && state.runWorldId === "pursuit" ? 5 : calculateStars();
  // Economy v2: much lower payouts. Example target: 5-star run => 50 SB and 10 SN.
  state.earnedSchruteBucks = state.stars * 10;
  state.earnedStanleyNickels = state.stars * 2;

  state.saveData.currencies.schruteBucks += state.earnedSchruteBucks;
  state.saveData.currencies.stanleyNickels += state.earnedStanleyNickels;
  state.saveData.stats.bestHardcoreChain = Math.max(state.saveData.stats.bestHardcoreChain, state.bestChain);

  let questEndingLine = "";
  if (reason === "time") {
    const worldIdx = WORLDS.findIndex((w) => w.id === state.runWorldId);
    if (worldIdx !== -1) {
      state.saveData.unlockedWorldIndex = Math.max(state.saveData.unlockedWorldIndex, worldIdx + 1);
      state.saveData.unlockedWorldIndex = Math.min(state.saveData.unlockedWorldIndex, WORLDS.length - 1);
    }
    if (state.runWorldId === "bullpen") {
      state.saveData.stats.bullpenClears = (state.saveData.stats.bullpenClears || 0) + 1;
      if (state.saveData.stats.bullpenClears >= 3) unlockDundieAward("dontGoInThere");
    }
    if (state.runWorldId === "warehouse") {
      const savePam = state.saveData.missions.savePam;
      if (savePam.added && !savePam.completed) {
        if (!savePam.warehouseCleared) {
          savePam.warehouseCleared = true;
          questEndingLine = "Mission Update: Replay Warehouse and press P whenever Pam appears.";
        } else {
          savePam.sightingsBest = Math.max(savePam.sightingsBest || 0, state.pamSpottedCount);
          if (state.pamSpottedCount >= state.pamRequiredCount) {
            savePam.completed = true;
            state.saveData.unlocks.pamFound = true;
            questEndingLine = "Quest Complete: You found Pam 5 times. Talk to Pam in the shop.";
          } else {
            questEndingLine = `Pam sightings this run: ${state.pamSpottedCount}/${state.pamRequiredCount}.`;
          }
        }
      }
    }
  }
  if (reason === "toby_caught" && state.runWorldId === "pursuit") {
    const capture = state.saveData.missions.captureStrangler;
    if (capture.added && !capture.completed) {
      capture.completed = true;
      questEndingLine = "Mission Complete: Capture the Strangler. Talk to Pam for your reward.";
    }
  }

  persistSave();

  const worldIdx = WORLDS.findIndex((w) => w.id === state.runWorldId);
  const hasNextLevel = worldIdx !== -1 && worldIdx < WORLDS.length - 1;
  const successfulFinish = reason === "time" || reason === "toby_caught";
  state.pendingNextAction = null;
  if (successfulFinish && hasNextLevel) {
    const nextWorld = WORLDS[worldIdx + 1];
    state.pendingNextWorldId = nextWorld.id;
    state.pendingNextAction = "next_world";
    nextLevelBtn.textContent = `Continue To ${nextWorld.label}`;
    nextLevelBtn.hidden = false;
  } else if (reason === "toby_caught" && state.runWorldId === "pursuit") {
    state.pendingNextWorldId = null;
    state.pendingNextAction = "final_cutscene";
    nextLevelBtn.textContent = "Continue";
    nextLevelBtn.hidden = false;
  } else {
    state.pendingNextWorldId = null;
    state.pendingNextAction = null;
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
  } SN. ${endingLine}${questEndingLine ? ` ${questEndingLine}` : ""}`;
  summaryPanel.hidden = false;
}

function spawnPamAppearance() {
  state.pamVisible = true;
  state.pamVisibleLeft = 1.75 + Math.random() * 0.95;
  state.pamX = 500 + Math.random() * 360;
  state.pamY = 248 + Math.random() * 84;
}

function hidePamAndScheduleNext() {
  state.pamVisible = false;
  state.pamVisibleLeft = 0;
  state.pamNextSpawnSec = 5.2 + Math.random() * 4.4;
}

function handlePamSpottingKey() {
  if (state.scene !== "run" || !state.running || state.paused || !state.pamQuestRun) return;
  if (!state.pamVisible) {
    addFloatingText("No Pam. Keep moving.", state.player.x + 8, state.player.y - 26, "#b7dbff");
    return;
  }
  state.pamSpottedCount = Math.min(state.pamRequiredCount, state.pamSpottedCount + 1);
  addFloatingText("PAM!", state.pamX + 8, state.pamY - 8, "#ffd07d");
  if (state.pamSpottedCount >= state.pamRequiredCount) {
    addFloatingText("Finish The Level!", state.player.x - 16, state.player.y - 42, "#d9ffba");
  }
  hidePamAndScheduleNext();
}

function doParkourShout() {
  if (!state.running || state.paused) return;
  if (state.pendingLanding && state.landingWindowLeft > 0) {
    state.pendingLanding = false;
    state.landingWindowLeft = 0;
    state.speedBoostLeft = GAME.speedBoostSec * (state.player?.runtimeBoostMul || 1);
    state.multiplier = Math.min(20, state.multiplier + 1);
    state.bestChain = Math.max(state.bestChain, state.multiplier - 1);
    if (state.bestChain >= 20 && unlockDundieAward("whitestSneakers")) {
      addFloatingText("WHITEST!", state.player.x - 8, state.player.y - 46, "#fff4b2");
    }
    addFloatingText("HARDCORE!", state.player.x + 16, state.player.y - 28, "#ffd54d");
    return;
  }

  // Failed attempt only when player actually presses J outside the valid window.
  stumbleFail();
}

function attack() {
  if (!state.running || state.paused || state.attackCooldownLeft > 0 || state.runWorldId === "skarn") return;
  state.attackLeft = GAME.attackDurationSec;
  state.attackCooldownLeft = GAME.attackCooldownSec;
}

function stumbleFail() {
  state.pendingLanding = false;
  state.landingWindowLeft = 0;
  const lostPursuitChain = state.runWorldId === "pursuit" && state.multiplier > 1;
  state.stumbleLeft = GAME.stumbleSec * (state.player?.runtimeStumbleMul || 1);
  state.multiplier = 1;
  if (lostPursuitChain) {
    state.player.x = 66;
    state.stumbleLeft = Math.max(state.stumbleLeft, 1.2);
    addFloatingText("SETBACK!", state.player.x + 2, state.player.y - 44, "#ffbe7a");
  }
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

function isDodgeOnlyObstacle(type) {
  return (
    type === "angela_cat" ||
    type === "jim_snowball" ||
    type === "folder" ||
    type === "jan_folder" ||
    type === "hockey_puck"
  );
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

  // Perfect PARKOUR speed boost grants temporary invincibility.
  if (state.speedBoostLeft > 0) {
    state.style += 12;
    addFloatingText("INVINCIBLE!", state.player.x - 4, state.player.y - 30, "#b8ffe0");
    addHitParticles(obstacle.x + obstacle.width * 0.5, obstacle.y + obstacle.height * 0.5, "#9ef7cf");
    return;
  }

  if (obstacle.type === "jan_folder") {
    state.saveData.stats.janFolderHits = (state.saveData.stats.janFolderHits || 0) + 1;
    if (state.saveData.stats.janFolderHits >= 20) unlockDundieAward("hottestInOffice");
    else persistSave();
  }

  const lostPursuitChain = state.runWorldId === "pursuit" && state.multiplier > 1;
  state.player.hp -= 1;
  state.multiplier = 1;
  state.score = Math.max(0, state.score - 80);
  state.speedBoostLeft = 0;
  state.stumbleLeft = 0.6;
  if (lostPursuitChain) {
    state.player.x = 66;
    state.stumbleLeft = Math.max(state.stumbleLeft, 1.25);
    addFloatingText("LOST GROUND!", state.player.x - 14, state.player.y - 44, "#ffbe7a");
  }
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
    if (obstacle.hit || obstacle.type === "ladder" || isDodgeOnlyObstacle(obstacle.type)) continue;
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
    if (state.multiplier >= 10) {
      endRun("toby_caught");
      return;
    }
    const chaseProgress = Math.max(0, Math.min(1, (state.multiplier - 1) / 9));
    const targetX = state.stumbleLeft > 0 ? 66 : 84 + chaseProgress * 292;
    state.player.x += (targetX - state.player.x) * Math.min(1, dt * 9);
    state.tobyDistance = Math.max(0, 100 - chaseProgress * 100);
  }

  state.score += runSpeed * dt * 0.1;
  state.style += 20 * dt * state.multiplier * player.preset.styleGain * (player.runtimeStyleMul || 1);

  if (state.pamQuestRun) {
    if (state.pamVisible) {
      state.pamVisibleLeft = Math.max(0, state.pamVisibleLeft - dt);
      if (state.pamVisibleLeft <= 0) hidePamAndScheduleNext();
    } else {
      state.pamNextSpawnSec -= dt;
      if (state.pamNextSpawnSec <= 0) spawnPamAppearance();
    }
  }

  state.spawnTimerSec -= dt;
  if (state.spawnTimerSec <= 0) {
    const difficulty = LEVEL_DIFFICULTY[state.runWorldId] || LEVEL_DIFFICULTY.bullpen;
    spawnObstacle();
    const spawnGap = difficulty.spawnBase + Math.random() * difficulty.spawnRand;
    state.spawnTimerSec = Math.max(difficulty.spawnMin, spawnGap - state.worldTimeSec * 0.004);
  }

  const hitboxW = player.width * player.preset.hitboxScale;
  const hitboxHBase = player.height * player.preset.hitboxScale;
  const hitboxH = state.slideActive ? hitboxHBase * 0.55 : hitboxHBase;
  const playerBox = {
    x: player.x + (player.width - hitboxW) / 2,
    y: player.y - hitboxH,
    width: hitboxW,
    height: hitboxH,
  };

  handleAttackHits(playerBox);

  for (const obstacle of state.obstacles) {
    const prevX = obstacle.x;
    obstacle.x -= runSpeed * dt * obstacle.speedFactor;
    if (obstacle.hit) continue;
    const slidingIntoChili = obstacle.type === "chili_spill" && (state.slideActive || state.spaceHeld || state.spaceHoldSec > 0);
    const touching = intersects(playerBox, obstacle);
    if (!touching) {
      if (slidingIntoChili) {
        // Extra low swept contact check so fast slides cannot skip over chili between frames.
        const slideContactBox = {
          x: playerBox.x + 6,
          y: GAME.groundY - 7,
          width: Math.max(8, playerBox.width - 12),
          height: 12,
        };
        const sweptObstacleBox = {
          x: Math.min(prevX, obstacle.x),
          y: obstacle.y,
          width: Math.abs(prevX - obstacle.x) + obstacle.width,
          height: obstacle.height,
        };
        if (!intersects(slideContactBox, sweptObstacleBox)) continue;
      } else {
        continue;
      }
    }

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

    if (obstacle.type === "chili_spill") {
      obstacle.hit = true;
      handleObstacleCollision(obstacle);
      continue;
    }

    if (isDodgeOnlyObstacle(obstacle.type)) {
      if (state.slideActive) {
        // Slide under without destroying these dodge-only projectiles.
        state.style += 6;
        continue;
      }
      const playerBottom = playerBox.y + playerBox.height;
      const landingFromAbove = player.vy > 40 && playerBottom <= obstacle.y + 14;
      if (landingFromAbove) {
        // These can't be stomped; jumping on them is a bad land.
        handleObstacleCollision(obstacle);
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
  const xShift = state.worldTimeSec * 62;

  if (state.theme === "bullpen") {
    const wallGrad = ctx.createLinearGradient(0, 0, 0, GAME.floorTop);
    wallGrad.addColorStop(0, "#c5dcf8");
    wallGrad.addColorStop(1, "#9bbddf");
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, canvas.width, GAME.floorTop);

    ctx.fillStyle = "#7087a6";
    for (let i = 0; i < 6; i += 1) {
      const x = i * 170 - ((xShift * 0.16) % 170);
      ctx.fillRect(x, 42, 120, 64);
      ctx.fillStyle = "#b8d9ff";
      ctx.fillRect(x + 10, 52, 46, 20);
      ctx.fillRect(x + 64, 52, 46, 20);
      ctx.fillStyle = "#7087a6";
    }

    ctx.fillStyle = "#d6e4f7";
    ctx.fillRect(0, 106, canvas.width, 9);
    ctx.fillStyle = "#edf5ff";
    for (let i = 0; i < 5; i += 1) {
      ctx.fillRect(84 + i * 182, 16, 120, 10);
      ctx.fillRect(94 + i * 182, 26, 100, 3);
    }
    // Pin dots + paper tabs.
    ctx.fillStyle = "#ffe8a8";
    for (let i = 0; i < 10; i += 1) {
      const px = 70 + i * 90;
      ctx.fillRect(px, 112, 2, 2);
    }
    ctx.fillStyle = "#f9fbff";
    for (let i = 0; i < 6; i += 1) {
      const tx = 60 + i * 150;
      ctx.fillRect(tx, 118, 10, 6);
    }

    for (let i = 0; i < 8; i += 1) {
      const x = i * 132 - ((xShift * 0.56) % 132);
      const h = 74 + (i % 3) * 18;
      ctx.fillStyle = "#6f8298";
      ctx.fillRect(x - 14, 300 - h, 124, h);
      ctx.fillStyle = "#56677f";
      ctx.fillRect(x + 4, 300 - h + 12, 86, 8);
      ctx.fillStyle = "#8496ad";
      ctx.fillRect(x + 92, 300 - h + 14, 8, h - 14);
    }
  } else if (state.theme === "warehouse") {
    const wallGrad = ctx.createLinearGradient(0, 0, 0, GAME.floorTop);
    wallGrad.addColorStop(0, "#aeb4bf");
    wallGrad.addColorStop(1, "#7f8a99");
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, canvas.width, GAME.floorTop);

    ctx.fillStyle = "#8893a3";
    for (let i = 0; i < 14; i += 1) {
      const x = i * 74 - ((xShift * 0.12) % 74);
      ctx.fillRect(x, 0, 2, GAME.floorTop);
    }
    // Overhead pipes and vent panels.
    ctx.fillStyle = "#5f6a7b";
    ctx.fillRect(0, 54, canvas.width, 6);
    ctx.fillStyle = "#92a0b3";
    for (let i = 0; i < 6; i += 1) {
      const vx = 90 + i * 150;
      ctx.fillRect(vx, 66, 52, 10);
      ctx.fillStyle = "#6f7e92";
      ctx.fillRect(vx + 6, 69, 40, 4);
      ctx.fillStyle = "#92a0b3";
    }

    ctx.fillStyle = "#697587";
    for (let i = 0; i < 4; i += 1) {
      ctx.fillRect(76 + i * 230, 20, 170, 16);
      ctx.fillStyle = "#dee8f3";
      ctx.fillRect(84 + i * 230, 24, 154, 8);
      ctx.fillStyle = "#697587";
    }

    for (let i = 0; i < 7; i += 1) {
      const x = i * 146 - ((xShift * 0.45) % 146);
      ctx.fillStyle = "#4a5568";
      ctx.fillRect(x + 8, 202, 106, 98);
      ctx.fillStyle = "#8f9eb4";
      ctx.fillRect(x + 16, 214, 90, 6);
      ctx.fillRect(x + 16, 238, 90, 6);
      ctx.fillRect(x + 16, 262, 90, 6);
      ctx.fillStyle = "#b5c2d6";
      ctx.fillRect(x + 24, 274, 16, 20);
      ctx.fillRect(x + 46, 274, 16, 20);
      ctx.fillRect(x + 68, 274, 16, 20);
    }
  } else if (state.theme === "corporate") {
    const wallGrad = ctx.createLinearGradient(0, 0, 0, GAME.floorTop);
    wallGrad.addColorStop(0, "#d5f5fb");
    wallGrad.addColorStop(1, "#8ec8d8");
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, canvas.width, GAME.floorTop);

    ctx.fillStyle = "#f1f7ff";
    ctx.fillRect(0, 0, canvas.width, 26);
    for (let i = 0; i < 6; i += 1) {
      ctx.fillStyle = "#d8eaf7";
      ctx.fillRect(70 + i * 160, 10, 108, 8);
      ctx.fillStyle = "#f8fdff";
      ctx.fillRect(78 + i * 160, 13, 92, 3);
    }

    for (let i = 0; i < 6; i += 1) {
      const x = i * 168 - ((xShift * 0.18) % 168);
      ctx.fillStyle = "#4f7894";
      ctx.fillRect(x + 20, 44, 128, 156);
      ctx.fillStyle = "#9cd4f2";
      ctx.fillRect(x + 28, 54, 112, 136);
      // Glass reflections.
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.fillRect(x + 34, 60, 6, 124);
      ctx.fillRect(x + 76, 60, 6, 124);
      ctx.fillStyle = "#c8ecff";
      ctx.fillRect(x + 34, 60, 24, 124);
      ctx.fillRect(x + 66, 60, 24, 124);
      ctx.fillRect(x + 98, 60, 24, 124);
    }
    ctx.fillStyle = "#b5d7ee";
    ctx.fillRect(0, 220, canvas.width, 6);

    for (let i = 0; i < 7; i += 1) {
      const x = i * 140 - ((xShift * 0.56) % 140);
      const h = 72 + (i % 2) * 24;
      ctx.fillStyle = "#6a8ca7";
      ctx.fillRect(x + 8, 300 - h, 114, h);
      ctx.fillStyle = "#4f6d84";
      ctx.fillRect(x + 20, 300 - h + 16, 72, 10);
      ctx.fillStyle = "#d5e9f9";
      ctx.fillRect(x + 22, 300 - h + 40, 18, 3);
      ctx.fillRect(x + 44, 300 - h + 40, 18, 3);
      ctx.fillRect(x + 66, 300 - h + 40, 18, 3);
    }
  } else if (state.theme === "streets") {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GAME.floorTop);
    skyGrad.addColorStop(0, "#8cc0ff");
    skyGrad.addColorStop(1, "#d4e6ff");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, GAME.floorTop);

    ctx.fillStyle = "rgba(255,255,255,0.48)";
    for (let i = 0; i < 5; i += 1) {
      const x = i * 210 - ((xShift * 0.2) % 1100) - 80;
      const y = 82 + (i % 2) * 30;
      ctx.beginPath();
      ctx.ellipse(x, y, 74, 22, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Falling snow layers for Scranton streets.
    ctx.fillStyle = "rgba(245, 250, 255, 0.88)";
    for (let i = 0; i < 64; i += 1) {
      const drift = (i % 2 === 0 ? xShift * 0.12 : -xShift * 0.09) % (canvas.width + 40);
      const x = (i * 31 + drift + 20) % (canvas.width + 40) - 20;
      const y = (i * 27 + state.elapsedSec * (34 + (i % 5) * 8)) % (GAME.floorTop - 8);
      const size = i % 3 === 0 ? 3 : 2;
      ctx.fillRect(x, y, size, size);
    }
    ctx.fillStyle = "rgba(230, 242, 255, 0.72)";
    for (let i = 0; i < 34; i += 1) {
      const x = (i * 47 - (xShift * 0.16) + 10) % (canvas.width + 30) - 15;
      const y = (i * 36 + state.elapsedSec * (18 + (i % 4) * 5)) % (GAME.floorTop - 8);
      ctx.fillRect(x, y, 2, 2);
    }

    for (let i = 0; i < 10; i += 1) {
      const x = i * 118 - ((xShift * 0.42) % 118);
      const h = 96 + (i % 4) * 35;
      const baseY = 300 - h;
      ctx.fillStyle = "#516481";
      ctx.fillRect(x - 12, baseY, 108, h);
      ctx.fillStyle = "#8fb0dd";
      for (let w = 0; w < 3; w += 1) ctx.fillRect(x + 4 + w * 30, baseY + 14, 16, h - 24);
      // Extra facade detail.
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(x + 4, baseY + 10, 80, 2);
      ctx.fillRect(x + 4, baseY + 34, 80, 2);
      ctx.fillStyle = "rgba(10, 20, 40, 0.3)";
      ctx.fillRect(x + 88, baseY + 8, 6, h - 16);
      // Window grid with mixed warm/cool lights.
      for (let row = 0; row < 4; row += 1) {
        const wy = baseY + 18 + row * 18;
        for (let col = 0; col < 4; col += 1) {
          const wx = x + 6 + col * 18;
          ctx.fillStyle = (row + col + i) % 3 === 0 ? "rgba(255,216,150,0.8)" : "rgba(170,200,230,0.6)";
          ctx.fillRect(wx, wy, 8, 10);
          ctx.fillStyle = "rgba(30,40,60,0.45)";
          ctx.fillRect(wx - 1, wy - 1, 10, 1);
        }
      }
      // Fire escape lines.
      ctx.fillStyle = "rgba(25, 35, 55, 0.6)";
      ctx.fillRect(x + 64, baseY + 12, 3, h - 24);
      ctx.fillRect(x + 48, baseY + 40, 22, 2);
      ctx.fillRect(x + 48, baseY + 64, 22, 2);
      // Balconies + railings.
      ctx.fillStyle = "#2f3b52";
      ctx.fillRect(x + 18, baseY + 52, 40, 6);
      ctx.fillRect(x + 18, baseY + 78, 40, 6);
      ctx.fillStyle = "#55627a";
      ctx.fillRect(x + 18, baseY + 50, 40, 2);
      ctx.fillRect(x + 18, baseY + 76, 40, 2);
      // Awning strip.
      ctx.fillStyle = "#3b4a63";
      ctx.fillRect(x - 12, baseY + h - 18, 108, 6);
      ctx.fillStyle = "#c9d2e2";
      for (let s = 0; s < 6; s += 1) ctx.fillRect(x - 8 + s * 16, baseY + h - 17, 8, 4);
      // Rooftop props.
      ctx.fillStyle = "#3f4f67";
      ctx.fillRect(x + 2, baseY - 8, 24, 8);
      ctx.fillRect(x + 70, baseY - 10, 16, 10);
      ctx.fillStyle = "#2c394d";
      ctx.fillRect(x + 30, baseY - 6, 8, 6);
      // Neon corner sign.
      ctx.fillStyle = "#ffb06a";
      ctx.fillRect(x + 88, baseY + 18, 6, 18);
      ctx.fillStyle = "#ffe1a4";
      ctx.fillRect(x + 89, baseY + 19, 2, 16);
      // Wall graffiti.
      ctx.fillStyle = "#7aa1c8";
      ctx.fillRect(x + 10, baseY + h - 30, 22, 3);
      ctx.fillRect(x + 12, baseY + h - 26, 14, 2);
    }
    // Snowbanks and icy curb (keep them on the ground line).
    ctx.fillStyle = "#eaf4ff";
    for (let i = 0; i < 7; i += 1) {
      const x = i * 150 - ((xShift * 0.55) % 150);
      ctx.beginPath();
      ctx.ellipse(x + 40, GAME.floorTop + 10, 44, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#6a84aa";
    for (let i = 0; i < 8; i += 1) {
      const x = i * 150 - ((xShift * 0.95) % 150);
      ctx.fillRect(x, 292, 8, 108);
      ctx.fillStyle = "#ffe38d";
      ctx.fillRect(x - 4, 292, 16, 8);
      ctx.fillStyle = "#6a84aa";
    }
  } else {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GAME.floorTop);
    skyGrad.addColorStop(0, "#263f8f");
    skyGrad.addColorStop(1, "#6a90e1");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, GAME.floorTop);

    ctx.fillStyle = "#dce6ff";
    for (let i = 0; i < 30; i += 1) {
      const sx = (i * 37 + Math.floor(i / 3) * 19) % canvas.width;
      const sy = (i * 29) % 180;
      ctx.fillRect(sx, sy, 2, 2);
    }

    for (let i = 0; i < 11; i += 1) {
      const x = i * 114 - ((xShift * 0.58) % 114);
      const h = 118 + (i % 4) * 38;
      const baseY = 300 - h;
      ctx.fillStyle = "#1f2f6d";
      ctx.fillRect(x - 10, baseY, 108, h);
      ctx.fillStyle = "#89b2ff";
      for (let w = 0; w < 3; w += 1) ctx.fillRect(x + 6 + w * 28, baseY + 12, 14, h - 22);
      // Denser window grid and trims.
      for (let row = 0; row < 4; row += 1) {
        const wy = baseY + 16 + row * 20;
        for (let col = 0; col < 4; col += 1) {
          const wx = x + 10 + col * 16;
          ctx.fillStyle = (row + col + i) % 4 === 0 ? "rgba(255,200,140,0.75)" : "rgba(130,170,230,0.5)";
          ctx.fillRect(wx, wy, 6, 8);
          ctx.fillStyle = "rgba(12, 20, 40, 0.4)";
          ctx.fillRect(wx - 1, wy - 1, 8, 1);
        }
      }
      ctx.fillStyle = "rgba(15, 25, 55, 0.35)";
      ctx.fillRect(x - 10, baseY, 108, 4);
      ctx.fillRect(x - 10, baseY + 30, 108, 2);
      ctx.fillRect(x - 10, baseY + 60, 108, 2);
      ctx.fillStyle = "#2c3c7a";
      ctx.fillRect(x + 74, baseY + 8, 6, h - 16);
      // Rooftop units.
      ctx.fillStyle = "#22315e";
      ctx.fillRect(x + 8, baseY - 10, 22, 10);
      ctx.fillRect(x + 42, baseY - 8, 18, 8);
      // Fire escape strip.
      ctx.fillStyle = "#1b2854";
      ctx.fillRect(x + 60, baseY + 18, 3, h - 26);
      ctx.fillRect(x + 44, baseY + 44, 28, 2);
      ctx.fillRect(x + 44, baseY + 72, 28, 2);
      // Water tower + ladder.
      if (i % 3 === 0) {
        ctx.fillStyle = "#1a2448";
        ctx.fillRect(x + 72, baseY - 22, 18, 12);
        ctx.fillRect(x + 76, baseY - 30, 10, 8);
        ctx.fillStyle = "#3a4a7a";
        ctx.fillRect(x + 80, baseY - 22, 2, 12);
      }
      // Final pursuit: only a few buildings get large neon signs.
      if (state.theme === "pursuit" && (i % 5 === 1 || i % 5 === 3)) {
        ctx.fillStyle = "#ff8f63";
        ctx.fillRect(x - 6, baseY + 26, 14, 44);
        ctx.fillStyle = "#ffd3a8";
        ctx.fillRect(x - 3, baseY + 30, 8, 36);
        ctx.fillStyle = "rgba(255, 170, 120, 0.25)";
        ctx.fillRect(x - 10, baseY + 22, 22, 52);
      }
    }

    ctx.fillStyle = "#2d437c";
    ctx.fillRect(0, 300, canvas.width, 20);
    ctx.fillStyle = "#ffc65f";
    for (let i = 0; i < 10; i += 1) {
      const x = i * 120 - ((xShift * 1.1) % 120);
      ctx.fillRect(x + 40, 306, 44, 4);
    }
  }

  if (state.theme === "pursuit") {
    // Make the chase lane clearly read as a road.
    ctx.fillStyle = "#2d3139";
    ctx.fillRect(0, GAME.floorTop, canvas.width, canvas.height - GAME.floorTop);
    ctx.fillStyle = "#1e232b";
    for (let i = 0; i < 24; i += 1) {
      const x = i * 52 - ((xShift * 1.05) % 52);
      ctx.fillRect(x, GAME.floorTop + 8, 28, canvas.height - GAME.floorTop - 8);
    }
    ctx.fillStyle = "#f4f2c9";
    for (let i = 0; i < 16; i += 1) {
      const x = i * 72 - ((xShift * 1.28) % 72);
      ctx.fillRect(x + 8, GAME.floorTop + 28, 38, 6);
    }
    ctx.fillStyle = "#cfd7e2";
    for (let i = 0; i < 20; i += 1) {
      const x = i * 58 - ((xShift * 1.16) % 58);
      ctx.fillRect(x + 6, GAME.floorTop + 4, 2, 10);
      ctx.fillRect(x + 6, canvas.height - 16, 2, 10);
    }
    // Guardrail posts.
    ctx.fillStyle = "#4b5667";
    for (let i = 0; i < 18; i += 1) {
      const x = i * 64 - ((xShift * 1.1) % 64);
      ctx.fillRect(x + 2, GAME.floorTop + 12, 4, 18);
    }
    // Extra building detail for the pursuit skyline.
    ctx.fillStyle = "rgba(255, 210, 150, 0.6)";
    for (let i = 0; i < 14; i += 1) {
      const x = i * 86 - ((xShift * 0.72) % 86);
      ctx.fillRect(x + 10, 310, 10, 4);
      ctx.fillRect(x + 28, 310, 10, 4);
    }
  } else if (state.theme === "skarn") {
    ctx.fillStyle = "#322447";
    ctx.fillRect(0, GAME.floorTop, canvas.width, canvas.height - GAME.floorTop);
    ctx.fillStyle = "#21172f";
    for (let i = 0; i < 22; i += 1) {
      const x = i * 56 - ((xShift * 1.02) % 56);
      ctx.fillRect(x, GAME.floorTop + 8, 30, canvas.height - GAME.floorTop - 8);
    }
    ctx.fillStyle = "#ffd8f0";
    for (let i = 0; i < 14; i += 1) {
      const x = i * 82 - ((xShift * 1.2) % 82);
      ctx.fillRect(x + 10, GAME.floorTop + 30, 40, 5);
    }
    // Spotlight beams for stage energy.
    ctx.fillStyle = "rgba(255, 210, 235, 0.18)";
    for (let i = 0; i < 4; i += 1) {
      const sx = 120 + i * 210;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx + 70, GAME.floorTop);
      ctx.lineTo(sx - 70, GAME.floorTop);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    const floorColor = state.theme === "streets" ? "#4f5668" : "#d7ddd8";
    ctx.fillStyle = floorColor;
    ctx.fillRect(0, GAME.floorTop, canvas.width, canvas.height - GAME.floorTop);
  }

  if (state.theme === "streets") {
    ctx.fillStyle = "#f4f2c9";
    for (let i = 0; i < 16; i += 1) {
      const x = i * 72 - ((xShift * 1.28) % 72);
      ctx.fillRect(x + 8, GAME.floorTop + 30, 38, 5);
    }
    ctx.fillStyle = "rgba(234, 244, 255, 0.72)";
    for (let i = 0; i < 18; i += 1) {
      const x = i * 66 - ((xShift * 0.8) % 66);
      ctx.fillRect(x + 6, GAME.floorTop + 2 + (i % 3), 22, 2);
    }
  } else if (state.theme === "skarn") {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GAME.floorTop);
    skyGrad.addColorStop(0, "#ffb1d5");
    skyGrad.addColorStop(1, "#f27cc4");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, GAME.floorTop);

    ctx.fillStyle = "rgba(255, 238, 247, 0.6)";
    for (let i = 0; i < 6; i += 1) {
      const x = i * 190 - ((xShift * 0.2) % 1140) - 90;
      ctx.beginPath();
      ctx.ellipse(x, 72 + (i % 2) * 24, 68, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 9; i += 1) {
      const x = i * 126 - ((xShift * 0.55) % 126);
      const h = 108 + (i % 3) * 24;
      const baseY = 300 - h;
      ctx.fillStyle = "#582a52";
      ctx.fillRect(x + 4, baseY, 104, h);
      ctx.fillStyle = "#ffdd8a";
      ctx.fillRect(x + 14, baseY + 18, 14, 6);
      ctx.fillRect(x + 34, baseY + 18, 14, 6);
      ctx.fillRect(x + 54, baseY + 18, 14, 6);
      ctx.fillRect(x + 74, baseY + 18, 14, 6);
      // Stage-world building detail (posters, balcony ledges).
      ctx.fillStyle = "rgba(255, 230, 190, 0.55)";
      ctx.fillRect(x + 12, baseY + 40, 20, 10);
      ctx.fillRect(x + 40, baseY + 52, 18, 8);
      ctx.fillStyle = "rgba(30, 20, 40, 0.4)";
      ctx.fillRect(x + 10, baseY + 38, 60, 2);
      ctx.fillRect(x + 10, baseY + 64, 60, 2);
    }
  } else {
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    for (let i = 0; i < 24; i += 1) {
      const x = i * 54 - ((xShift * 1.2) % 54);
      ctx.fillRect(x, GAME.floorTop + 24, 28, 4);
    }
  }

  // Soft scanline pass to keep the crunchy 8-bit feel.
  ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
  for (let y = 0; y < canvas.height; y += 4) {
    ctx.fillRect(0, y, canvas.width, 1);
  }
}

function drawPlayer() {
  const player = state.player;
  const runnerId = getOutfitRunnerId();
  const outfitId = getEquippedOutfitId(runnerId);
  const slidePose = state.slideActive ? Math.max(0, Math.min(1, state.slideSpeed / Math.max(1, GAME.slideInitialSpeed))) : 0;
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
    // Dwight hairline: receded forehead + center split.
    ctx.fillStyle = "#efcfab";
    ctx.fillRect(x + 14, y - 1 + bob, 14, 4);
    ctx.fillRect(x + 19, y - 2 + bob, 2, 6);
    ctx.fillStyle = "#2a1e16";
    ctx.fillRect(x + 12, y - 1 + bob, 3, 2);
    ctx.fillRect(x + 27, y - 1 + bob, 3, 2);
  }

  // Face details.
  ctx.fillStyle = "#1b2230";
  if (player.preset.label === "Dwight") {
    ctx.strokeStyle = "#96a3b3";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 11.5, y + 4.5 + bob, 6, 5);
    ctx.strokeRect(x + 23.5, y + 4.5 + bob, 6, 5);
    ctx.beginPath();
    ctx.moveTo(x + 17.5, y + 7 + bob);
    ctx.lineTo(x + 23.5, y + 7 + bob);
    ctx.stroke();
    // Single eye set inside glasses.
    ctx.fillRect(x + 14, y + 7 + bob, 1, 1);
    ctx.fillRect(x + 26, y + 7 + bob, 1, 1);
  } else {
    ctx.fillRect(x + 13, y + 6 + bob, 2, 2);
    ctx.fillRect(x + 25, y + 6 + bob, 2, 2);
  }
  ctx.fillRect(x + 17, y + 10 + bob, 8, 1);
  if (outfitId === "goldenface") {
    ctx.fillStyle = "#e4ba53";
    ctx.fillRect(x + 7, y + 2 + bob, 28, state.slideActive ? 9 : 12);
    ctx.fillStyle = "#1b1a1c";
    ctx.fillRect(x + 13, y + 6 + bob, 2, 2);
    ctx.fillRect(x + 25, y + 6 + bob, 2, 2);
    ctx.fillRect(x + 16, y + 10 + bob, 10, 1);
  }
  if (outfitId === "ryan_beard") {
    ctx.fillStyle = "#151518";
    ctx.fillRect(x + 11, y + 9 + bob, 3, 5);
    ctx.fillRect(x + 26, y + 9 + bob, 3, 5);
    ctx.fillRect(x + 14, y + 10 + bob, 12, 2);
    ctx.fillRect(x + 14, y + 12 + bob, 12, 1);
    ctx.fillRect(x + 15, y + 13 + bob, 10, 1);
  }

  // Torso base + shading.
  let shirtColor = player.preset.color;
  let tieColor = player.preset.tieColor;
  if (outfitId === "cornell_fit") {
    shirtColor = "#8a2432";
    tieColor = "#f4d76b";
  } else if (outfitId === "goldenface") {
    shirtColor = "#121316";
    tieColor = "#d6b255";
  } else if (outfitId === "date_mike") {
    shirtColor = "#1e2f4e";
    tieColor = "#9a1f2f";
  } else if (outfitId === "wrong_fit") {
    shirtColor = "#cb5fa4";
    tieColor = "#f5d35b";
  } else if (outfitId === "recyclops") {
    shirtColor = "#5c8f3c";
    tieColor = "#2d5a2e";
  } else if (outfitId === "three_hole_gym") {
    shirtColor = "#d9dde4";
    tieColor = "#d9dde4";
  }
  const hideTie = outfitId === "three_hole_gym";

  ctx.fillStyle = shirtColor;
  ctx.fillRect(x + 4, bodyY, 34, state.slideActive ? 22 : 34);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(x + 24, bodyY + 1, 11, state.slideActive ? 20 : 32);
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(x + 4, bodyY + 1, 5, state.slideActive ? 20 : 32);

  // Collar + tie.
  ctx.fillStyle = "#f4ead9";
  ctx.fillRect(x + 16, bodyY + 2, 10, 3);
  if (!hideTie) {
    ctx.fillStyle = tieColor;
    ctx.fillRect(x + 19, bodyY + 4, 4, state.slideActive ? 11 : 20);
    if (!state.slideActive) ctx.fillRect(x + 18, bodyY + 22, 6, 4);
  }
  if (outfitId === "three_hole_gym") {
    ctx.fillStyle = "#0f1118";
    ctx.fillRect(x + 19, bodyY + 8, 4, 4);
    ctx.fillRect(x + 19, bodyY + 13, 4, 4);
    ctx.fillRect(x + 19, bodyY + 18, 4, 4);
  }
  if (outfitId === "goldenface") {
    // Suit jacket + white shirt panel.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 16, bodyY + 3, 10, state.slideActive ? 12 : 23);
    ctx.fillStyle = "#121316";
    ctx.fillRect(x + 4, bodyY, 8, state.slideActive ? 22 : 34);
    ctx.fillRect(x + 30, bodyY, 8, state.slideActive ? 22 : 34);
    ctx.fillRect(x + 12, bodyY + 4, 4, state.slideActive ? 14 : 22);
    ctx.fillRect(x + 26, bodyY + 4, 4, state.slideActive ? 14 : 22);
  }
  if (outfitId === "date_mike") {
    ctx.fillStyle = "#0d1118";
    ctx.fillRect(x + 6, y - 6 + bob, 30, 4);
    ctx.fillRect(x + 12, y - 11 + bob, 18, 6);
  } else if (outfitId === "recyclops") {
    ctx.fillStyle = "#9be467";
    ctx.fillRect(x + 10, y + 3 + bob, 22, 2);
    ctx.fillStyle = "#2f4f2f";
    ctx.fillRect(x + 19, y + 3 + bob, 4, 2);
  }

  const armFrontY = y + 21 + runCycle * 3 + bob;
  const armBackY = y + 21 + runCycleOpp * 3 + bob;
  const slideArmBackY = y + 22 + bob;
  const slideArmFrontY = y + 23 + bob;
  const hasSleeves = player.preset.label !== "Dwight" && player.preset.label !== "Kelly";
  const sleeveH = state.slideActive ? 4 : 7;
  // Back arm first for depth.
  ctx.fillStyle = "#c9a682";
  ctx.fillRect(x - 1, state.slideActive ? slideArmBackY : armBackY, 8, state.slideActive ? 7 : 16);
  if (hasSleeves) {
    ctx.fillStyle = shirtColor;
    ctx.fillRect(x - 1, state.slideActive ? slideArmBackY : armBackY, 8, sleeveH);
  }
  if (state.attackLeft > 0) {
    if (hasSleeves) {
      ctx.fillStyle = shirtColor;
      ctx.fillRect(x + 35, y + (state.slideActive ? 15 : 18) + bob, 8, sleeveH);
    }
    ctx.fillStyle = "#c9a682";
    ctx.fillRect(x + 34, y + (state.slideActive ? 15 : 18) + bob, 14, 8);
    ctx.fillStyle = "#ffe189";
    ctx.fillRect(x + 48, y + (state.slideActive ? 17 : 20) + bob, 18, 4);
  } else {
    ctx.fillStyle = "#d9ba97";
    ctx.fillRect(x + 35, state.slideActive ? slideArmFrontY : armFrontY, 8, state.slideActive ? 7 : 16);
    if (hasSleeves) {
      ctx.fillStyle = shirtColor;
      ctx.fillRect(x + 35, state.slideActive ? slideArmFrontY : armFrontY, 8, sleeveH);
    }
  }

  const legFront = player.grounded ? runCycle * 5 : 0;
  const legBack = player.grounded ? runCycleOpp * 5 : 0;
  ctx.fillStyle = "#202a39";
  if (state.slideActive) {
    const slideLegY = y + 31 + bob;
    const legReach = 30 + Math.round(slidePose * 9);
    ctx.fillRect(x + 9, slideLegY, legReach, 5);
    ctx.fillRect(x + 9, slideLegY + 5, legReach - 2, 5);
    ctx.fillStyle = "#141a25";
    ctx.fillRect(x + 8 + legReach, slideLegY + 2, 8, 3);
    ctx.fillRect(x + 8 + (legReach - 2), slideLegY + 7, 8, 3);
    ctx.fillStyle = "rgba(255,255,255,0.26)";
    ctx.fillRect(x - 2, GAME.floorTop + 1, 8, 2);
    ctx.fillRect(x - 10, GAME.floorTop + 3, 6, 2);
    ctx.fillRect(x - 16, GAME.floorTop + 5, 5, 1);
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
    // Kevin-level chili disaster: floor-anchored tipped pot + thick spill.
    const baseY = obs.y + obs.height;
    ctx.fillStyle = "#a33b2f";
    ctx.fillRect(obs.x + 12, baseY - 10, obs.width - 16, 8);
    ctx.fillStyle = "#c8563f";
    ctx.fillRect(obs.x + 8, baseY - 8, obs.width - 24, 5);
    ctx.fillRect(obs.x + 20, baseY - 12, obs.width - 34, 3);
    ctx.fillStyle = "#e08a5c";
    ctx.fillRect(obs.x + 24, baseY - 9, 3, 2);
    ctx.fillRect(obs.x + 34, baseY - 7, 3, 2);
    ctx.fillRect(obs.x + 45, baseY - 9, 3, 2);
    ctx.fillStyle = "rgba(255, 210, 170, 0.45)";
    ctx.fillRect(obs.x + 18, baseY - 11, 8, 1);
    ctx.fillRect(obs.x + 40, baseY - 10, 8, 1);

    ctx.fillStyle = "#2c313d";
    ctx.fillRect(obs.x + 2, baseY - 16, 18, 8);
    ctx.fillRect(obs.x + 1, baseY - 14, 2, 4);
    ctx.fillRect(obs.x + 19, baseY - 14, 2, 4);
    ctx.fillStyle = "#474f5f";
    ctx.fillRect(obs.x + 5, baseY - 14, 12, 5);
  } else if (obs.type === "paper_pile") {
    ctx.fillStyle = "#f0f3f8";
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    ctx.fillStyle = "#d8deea";
    for (let i = 0; i < 3; i += 1) ctx.fillRect(obs.x + 4, obs.y + 6 + i * 7, obs.width - 8, 2);
  } else if (obs.type === "shelf") {
    // Industrial steel shelving with beams and rivets.
    ctx.fillStyle = "#5f6c7d";
    ctx.fillRect(obs.x + 3, obs.y, 7, obs.height);
    ctx.fillRect(obs.x + obs.width - 10, obs.y, 7, obs.height);
    ctx.fillStyle = "#7f8da0";
    ctx.fillRect(obs.x + 9, obs.y + 8, obs.width - 18, 5);
    ctx.fillRect(obs.x + 9, obs.y + 22, obs.width - 18, 5);
    ctx.fillRect(obs.x + 9, obs.y + 36, obs.width - 18, 5);
    ctx.fillStyle = "#4f5b6b";
    ctx.fillRect(obs.x + 14, obs.y + 11, obs.width - 28, 11);
    ctx.fillRect(obs.x + 14, obs.y + 25, obs.width - 28, 11);
    ctx.fillRect(obs.x + 14, obs.y + 39, obs.width - 28, 11);
    ctx.fillStyle = "#9aa9bc";
    ctx.fillRect(obs.x + 14, obs.y + 12, obs.width - 28, 2);
    ctx.fillRect(obs.x + 14, obs.y + 26, obs.width - 28, 2);
    ctx.fillRect(obs.x + 14, obs.y + 40, obs.width - 28, 2);
    ctx.fillStyle = "#c9d2df";
    for (let i = 0; i < 3; i += 1) {
      const ry = obs.y + 10 + i * 14;
      ctx.fillRect(obs.x + 5, ry, 2, 2);
      ctx.fillRect(obs.x + obs.width - 7, ry, 2, 2);
    }
  } else if (obs.type === "ladder") {
    ctx.fillStyle = "#c89e58";
    ctx.fillRect(obs.x + 6, obs.y, 6, obs.height);
    ctx.fillRect(obs.x + obs.width - 12, obs.y, 6, obs.height);
    for (let i = 0; i < 4; i += 1) ctx.fillRect(obs.x + 12, obs.y + 8 + i * 10, obs.width - 24, 4);
  } else if (obs.type === "lightpole") {
    const poleW = Math.max(8, Math.floor(obs.width * 0.28));
    const poleX = obs.x + Math.floor((obs.width - poleW) * 0.5);
    const lampH = 10;
    const baseH = 8;
    const armY = obs.y + 8;

    // Lamp housing and lens.
    ctx.fillStyle = "#2f3848";
    ctx.fillRect(obs.x + 3, obs.y, obs.width - 6, lampH);
    ctx.fillStyle = "#ffd88f";
    ctx.fillRect(obs.x + 6, obs.y + 3, obs.width - 12, 4);
    ctx.fillStyle = "rgba(255, 240, 170, 0.45)";
    ctx.fillRect(obs.x + 8, obs.y + 4, obs.width - 16, 1);

    // Support arm.
    ctx.fillStyle = "#5a6679";
    ctx.fillRect(poleX - 4, armY, 4, 3);

    // Main pole with subtle metallic shading.
    ctx.fillStyle = "#4f5a6f";
    ctx.fillRect(poleX, obs.y + lampH, poleW, obs.height - lampH - baseH);
    ctx.fillStyle = "#6f7d95";
    ctx.fillRect(poleX + 1, obs.y + lampH, 2, obs.height - lampH - baseH);
    ctx.fillStyle = "#3a4353";
    ctx.fillRect(poleX + poleW - 2, obs.y + lampH, 2, obs.height - lampH - baseH);

    // Base plate + bolts.
    ctx.fillStyle = "#2c3442";
    ctx.fillRect(poleX - 4, obs.y + obs.height - baseH, poleW + 8, baseH);
    ctx.fillStyle = "#94a3ba";
    ctx.fillRect(poleX - 2, obs.y + obs.height - 4, 2, 2);
    ctx.fillRect(poleX + poleW, obs.y + obs.height - 4, 2, 2);
  } else if (obs.type === "jim_snowball") {
    ctx.fillStyle = "#f2f7ff";
    ctx.beginPath();
    ctx.arc(obs.x + obs.width * 0.5, obs.y + obs.height * 0.5, obs.width * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#dbe5f2";
    ctx.fillRect(obs.x + 8, obs.y + 6, 4, 3);
  } else if (obs.type === "hydrant") {
    const bodyX = obs.x + 8;
    const bodyW = obs.width - 16;
    const bodyY = obs.y + 10;
    const bodyH = obs.height - 14;

    // Main red cast-iron body.
    ctx.fillStyle = "#bb2f2b";
    ctx.fillRect(bodyX, bodyY, bodyW, bodyH);
    ctx.fillStyle = "#d9473f";
    ctx.fillRect(bodyX + 2, bodyY + 2, 3, bodyH - 4);
    ctx.fillStyle = "#8e1f1f";
    ctx.fillRect(bodyX + bodyW - 3, bodyY + 2, 2, bodyH - 4);

    // Top cap and bonnet.
    ctx.fillStyle = "#c73731";
    ctx.fillRect(bodyX + 2, obs.y + 4, bodyW - 4, 6);
    ctx.fillStyle = "#7f1818";
    ctx.fillRect(bodyX + 6, obs.y + 1, bodyW - 12, 3);

    // Side nozzles.
    ctx.fillStyle = "#c73731";
    ctx.fillRect(obs.x + 2, obs.y + 18, 8, 7);
    ctx.fillRect(obs.x + obs.width - 10, obs.y + 18, 8, 7);
    ctx.fillStyle = "#7f1818";
    ctx.fillRect(obs.x + 1, obs.y + 20, 2, 3);
    ctx.fillRect(obs.x + obs.width - 3, obs.y + 20, 2, 3);

    // Flange ring and base.
    ctx.fillStyle = "#a42925";
    ctx.fillRect(obs.x + 3, obs.y + 15, obs.width - 6, 3);
    ctx.fillStyle = "#6f1616";
    ctx.fillRect(obs.x + 2, obs.y + obs.height - 3, obs.width - 4, 3);

    // Bolt details.
    ctx.fillStyle = "#f1b9ad";
    ctx.fillRect(obs.x + 6, obs.y + 16, 2, 2);
    ctx.fillRect(obs.x + obs.width - 8, obs.y + 16, 2, 2);
    ctx.fillRect(bodyX + 2, obs.y + obs.height - 4, 2, 2);
    ctx.fillRect(bodyX + bodyW - 4, obs.y + obs.height - 4, 2, 2);
  } else if (obs.type === "hockey_puck") {
    ctx.fillStyle = "#1a1d24";
    ctx.fillRect(obs.x, obs.y + 2, obs.width, obs.height - 2);
    ctx.fillStyle = "#343b48";
    ctx.fillRect(obs.x + 2, obs.y, obs.width - 4, 3);
    ctx.fillStyle = "#a6b5cc";
    ctx.fillRect(obs.x + 6, obs.y + 3, obs.width - 12, 1);
  } else if (obs.type === "goldenface_minion") {
    ctx.fillStyle = "#1f1d22";
    ctx.fillRect(obs.x + 6, obs.y + 16, obs.width - 12, obs.height - 16);
    ctx.fillStyle = "#2f2c33";
    ctx.fillRect(obs.x + 4, obs.y + 18, 6, 18);
    ctx.fillRect(obs.x + obs.width - 10, obs.y + 18, 6, 18);
    ctx.fillStyle = "#e4ba53";
    ctx.fillRect(obs.x + 8, obs.y + 2, obs.width - 16, 14);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(obs.x + 10, obs.y + 7, 5, 2);
    ctx.fillRect(obs.x + obs.width - 15, obs.y + 7, 5, 2);
    ctx.fillRect(obs.x + 12, obs.y + 11, obs.width - 24, 2);
    ctx.fillStyle = "#111722";
    ctx.fillRect(obs.x + 10, obs.y + obs.height - 2, 6, 2);
    ctx.fillRect(obs.x + obs.width - 16, obs.y + obs.height - 2, 6, 2);
  } else if (obs.type === "jan_folder" || obs.type === "folder") {
    ctx.fillStyle = "#d6a95c";
    ctx.fillRect(obs.x, obs.y + 3, obs.width, obs.height - 3);
    ctx.fillStyle = "#e8c480";
    ctx.fillRect(obs.x + 4, obs.y, 12, 4);
  } else if (obs.type === "bystander") {
    // More realistic bystander silhouette.
    const skin = "#f0cfb2";
    const shirt = "#6d8fbe";
    const jacket = "#4d6f9c";
    const pants = "#243447";
    const hair = "#46362c";

    ctx.fillStyle = hair;
    ctx.fillRect(obs.x + 8, obs.y, obs.width - 16, 6);
    ctx.fillRect(obs.x + 7, obs.y + 4, 4, 4);
    ctx.fillRect(obs.x + obs.width - 11, obs.y + 4, 4, 4);
    ctx.fillStyle = skin;
    ctx.fillRect(obs.x + 9, obs.y + 5, obs.width - 18, 12);
    ctx.fillStyle = "#1f2734";
    ctx.fillRect(obs.x + 12, obs.y + 10, 2, 2);
    ctx.fillRect(obs.x + obs.width - 14, obs.y + 10, 2, 2);
    ctx.fillRect(obs.x + 13, obs.y + 14, obs.width - 26, 1);

    ctx.fillStyle = shirt;
    ctx.fillRect(obs.x + 7, obs.y + 17, obs.width - 14, 18);
    ctx.fillStyle = jacket;
    ctx.fillRect(obs.x + 4, obs.y + 17, 5, 18);
    ctx.fillRect(obs.x + obs.width - 9, obs.y + 17, 5, 18);
    ctx.fillStyle = "#8fa9cc";
    ctx.fillRect(obs.x + 15, obs.y + 18, 4, 13);

    ctx.fillStyle = skin;
    ctx.fillRect(obs.x + 4, obs.y + 22, 3, 11);
    ctx.fillRect(obs.x + obs.width - 7, obs.y + 22, 3, 11);

    ctx.fillStyle = pants;
    ctx.fillRect(obs.x + 10, obs.y + 35, 5, obs.height - 35);
    ctx.fillRect(obs.x + obs.width - 15, obs.y + 35, 5, obs.height - 35);
    ctx.fillStyle = "#141e2b";
    ctx.fillRect(obs.x + 9, obs.y + obs.height - 2, 6, 2);
    ctx.fillRect(obs.x + obs.width - 15, obs.y + obs.height - 2, 6, 2);
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

function drawPamQuestBackgroundSprite() {
  if (!state.pamQuestRun || !state.pamVisible) return;

  const s = 1.55;
  const x = state.pamX;
  const y = state.pamY;

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(x + 18 * s, y + 56 * s, 18 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair silhouette with side volume.
  ctx.fillStyle = "#7e5139";
  ctx.fillRect(x + 5 * s, y + 2 * s, 25 * s, 10 * s);
  ctx.fillRect(x + 4 * s, y + 8 * s, 7 * s, 7 * s);
  ctx.fillRect(x + 24 * s, y + 8 * s, 7 * s, 7 * s);
  ctx.fillRect(x + 10 * s, y + 12 * s, 15 * s, 4 * s);

  // Face.
  ctx.fillStyle = "#f1cfb3";
  ctx.fillRect(x + 8 * s, y + 10 * s, 19 * s, 14 * s);
  ctx.fillStyle = "#1d2532";
  ctx.fillRect(x + 13 * s, y + 15 * s, 2 * s, 2 * s);
  ctx.fillRect(x + 20 * s, y + 15 * s, 2 * s, 2 * s);
  ctx.fillRect(x + 14 * s, y + 20 * s, 8 * s, 1 * s);

  // Blouse + cardigan layers.
  ctx.fillStyle = "#d9eef9";
  ctx.fillRect(x + 7 * s, y + 24 * s, 22 * s, 20 * s);
  ctx.fillStyle = "#7f96bf";
  ctx.fillRect(x + 7 * s, y + 24 * s, 5 * s, 20 * s);
  ctx.fillRect(x + 24 * s, y + 24 * s, 5 * s, 20 * s);
  ctx.fillStyle = "#5f78a7";
  ctx.fillRect(x + 16 * s, y + 24 * s, 4 * s, 15 * s);

  // Arms + folder prop for visibility.
  ctx.fillStyle = "#f1cfb3";
  ctx.fillRect(x + 3 * s, y + 28 * s, 4 * s, 12 * s);
  ctx.fillRect(x + 29 * s, y + 28 * s, 4 * s, 12 * s);
  ctx.fillStyle = "#f5dca6";
  ctx.fillRect(x + 30 * s, y + 31 * s, 9 * s, 10 * s);
  ctx.fillStyle = "#dabf7d";
  ctx.fillRect(x + 31 * s, y + 30 * s, 4 * s, 2 * s);

  // Skirt + shoes.
  ctx.fillStyle = "#514a73";
  ctx.fillRect(x + 12 * s, y + 44 * s, 12 * s, 9 * s);
  ctx.fillStyle = "#1a2231";
  ctx.fillRect(x + 12 * s, y + 53 * s, 4 * s, 5 * s);
  ctx.fillRect(x + 20 * s, y + 53 * s, 4 * s, 5 * s);

  ctx.fillStyle = "#ffe7b1";
  ctx.font = "bold 14px Trebuchet MS";
  ctx.fillText("P!", x + 14 * s, y - 6);
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
  if (state.pamQuestRun) {
    ctx.fillStyle = "#ffeeb2";
    ctx.fillText(`Find Pam: ${state.pamSpottedCount}/${state.pamRequiredCount} (Press P when she appears)`, 500, 100);
  }
  ctx.fillStyle = "#d4e6ff";
  if (state.runWorldId === "skarn") ctx.fillText(`Parkour: J  Hit: LOCKED  Pause: Enter`, 500, 122);
  else ctx.fillText(`Parkour: J  Hit: K  Pause: Enter`, 500, 122);

  if (state.slideActive) {
    ctx.fillStyle = "#8fdcff";
    ctx.fillText(`Slide: ${Math.ceil(state.slideSpeed)}`, 338, 56);
  }
  if (state.speedBoostLeft > 0) {
    ctx.fillStyle = "#b8ffe0";
    ctx.fillText("Invincible", 338, 78);
  }

  if (state.runWorldId === "pursuit") {
    ctx.fillStyle = "#ffe38f";
    ctx.fillText(`Catch Strangler: ${Math.ceil(state.tobyDistance)}m`, 480, 78);
    ctx.fillText(`Goal: reach x10 Hardcore`, 480, 100);
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

  const { x: carX, y: carY } = getPursuitCarPosition();

  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(carX + 40, GAME.floorTop + 8, 48, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rear view of the strangler's car fixed on the far-right road lane.
  ctx.fillStyle = "#252a33";
  ctx.fillRect(carX + 2, carY + 12, 76, 22);
  ctx.fillStyle = "#1c212a";
  ctx.fillRect(carX + 10, carY + 4, 60, 12);
  ctx.fillStyle = "#6f90b8";
  ctx.fillRect(carX + 16, carY + 6, 48, 8);
  ctx.fillStyle = "#0f1319";
  ctx.fillRect(carX + 8, carY + 28, 14, 8);
  ctx.fillRect(carX + 58, carY + 28, 14, 8);
  ctx.fillStyle = "#d94343";
  ctx.fillRect(carX + 6, carY + 20, 6, 4);
  ctx.fillRect(carX + 68, carY + 20, 6, 4);
  ctx.fillStyle = "#f6e7b8";
  ctx.fillRect(carX + 34, carY + 22, 12, 3);
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

  // "World's Best Boss" mug mission prop in the board-side gap.
  const mugX = 890;
  const mugY = 366;
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(mugX + 8, mugY + 48, 60, 4);
  // Mug body + rim + bottom.
  ctx.fillStyle = "#f4f4f2";
  ctx.fillRect(mugX + 16, mugY, 42, 48);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(mugX + 18, mugY + 1, 38, 4);
  ctx.fillStyle = "#e3e3e1";
  ctx.fillRect(mugX + 16, mugY + 44, 42, 4);
  // Handle with inner cutout.
  ctx.fillStyle = "#ececeb";
  ctx.fillRect(mugX + 8, mugY + 12, 8, 26);
  ctx.fillStyle = "#cfd0cf";
  ctx.fillRect(mugX + 10, mugY + 15, 3, 20);
  // Subtle side shading.
  ctx.fillStyle = "#dddddb";
  ctx.fillRect(mugX + 53, mugY + 6, 4, 34);
  // Label text.
  ctx.fillStyle = "#1f242f";
  ctx.font = "bold 9px Trebuchet MS";
  ctx.fillText("WORLD'S", mugX + 20, mugY + 17);
  ctx.fillText("BEST", mugX + 27, mugY + 29);
  ctx.fillText("BOSS", mugX + 27, mugY + 41);
  state.menuMugBounds = { x: mugX + 6, y: mugY - 2, w: 62, h: 56 };
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
  ctx.fillText("Conference Room - Choose a Sticky Note", 276, 60);

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
    const noteColors = [
      ["#fff39b", "#ebd96f"],
      ["#bff7ff", "#92dce8"],
      ["#ffd6e6", "#e7afc8"],
      ["#d6ffc4", "#a9e79a"],
      ["#ffe5b8", "#eac88f"],
    ];
    const [noteBody, noteBand] = noteColors[i % noteColors.length];

    // Sticky-note card (paper, adhesive strip, fold corner, pin).
    ctx.fillStyle = selected ? "#fffce2" : "rgba(0,0,0,0.12)";
    ctx.fillRect(x + 3, y + 4, w, h);
    ctx.fillStyle = selected ? "#fff9bb" : noteBody;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = noteBand;
    ctx.fillRect(x, y, w, 14);
    ctx.fillStyle = selected ? "#fff0a0" : "#f7e9b8";
    ctx.beginPath();
    ctx.moveTo(x + w - 20, y + h);
    ctx.lineTo(x + w, y + h - 20);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = selected ? "#d19f1c" : "#8f8a80";
    ctx.lineWidth = selected ? 3 : 2;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = selected ? "#ff8c79" : "#cc5f57";
    ctx.fillRect(x + w * 0.5 - 4, y + 3, 8, 8);
    ctx.fillStyle = selected ? "#ffe3de" : "#e6b7b1";
    ctx.fillRect(x + w * 0.5 - 2, y + 5, 4, 4);

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

  if (state.menuClickLeft > 0 && state.menuClickWorldId) {
    const flashCard = state.menuCards.find((c) => c.worldId === state.menuClickWorldId);
    if (flashCard) {
      const alpha = Math.min(1, state.menuClickLeft / 0.2);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = state.menuClickMessage === "LOCKED" ? "#ff9f9a" : "#7bf3a0";
      ctx.lineWidth = 5;
      ctx.strokeRect(flashCard.x - 3, flashCard.y - 3, flashCard.w + 6, flashCard.h + 6);
      ctx.fillStyle = state.menuClickMessage === "LOCKED" ? "#ffd6d1" : "#dcffe7";
      ctx.font = "bold 14px Trebuchet MS";
      ctx.fillText(state.menuClickMessage, flashCard.x + 10, flashCard.y + flashCard.h - 10);
      ctx.globalAlpha = 1;
    }
  }

  const anim = Math.sin(state.elapsedSec * 5);
  const runnerId = getRunnerId();
  const equippedOutfit = getEquippedOutfitId(runnerId);
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
    // Dwight hairline: receded forehead + center split.
    ctx.fillStyle = "#efcfab";
    ctx.fillRect(headX + 8 * menuScale, headY - 2 * menuScale, 14 * menuScale, 4 * menuScale);
    ctx.fillRect(headX + 13 * menuScale, headY - 4 * menuScale, 2 * menuScale, 7 * menuScale);
    ctx.fillStyle = "#2a1e16";
    ctx.fillRect(headX + 6 * menuScale, headY - 2 * menuScale, 3 * menuScale, 2 * menuScale);
    ctx.fillRect(headX + 21 * menuScale, headY - 2 * menuScale, 3 * menuScale, 2 * menuScale);
  }

  // Face details.
  ctx.fillStyle = "#1e2431";
  if (player.label === "Dwight") {
    ctx.strokeStyle = "#96a3b3";
    ctx.lineWidth = Math.max(1, menuScale);
    ctx.strokeRect(headX + 5.5 * menuScale, headY + 3.5 * menuScale, 6 * menuScale, 5 * menuScale);
    ctx.strokeRect(headX + 17.5 * menuScale, headY + 3.5 * menuScale, 6 * menuScale, 5 * menuScale);
    ctx.beginPath();
    ctx.moveTo(headX + 11.5 * menuScale, headY + 6 * menuScale);
    ctx.lineTo(headX + 17.5 * menuScale, headY + 6 * menuScale);
    ctx.stroke();
    // Single eye set inside glasses.
    ctx.fillRect(headX + 8 * menuScale, headY + 6 * menuScale, 1 * menuScale, 1 * menuScale);
    ctx.fillRect(headX + 20 * menuScale, headY + 6 * menuScale, 1 * menuScale, 1 * menuScale);
  } else {
    ctx.fillRect(headX + 7 * menuScale, headY + 4 * menuScale, 2 * menuScale, 2 * menuScale);
    ctx.fillRect(headX + 19 * menuScale, headY + 4 * menuScale, 2 * menuScale, 2 * menuScale);
  }
  ctx.fillRect(headX + 12 * menuScale, headY + 8 * menuScale, 6 * menuScale, 1 * menuScale);
  if (equippedOutfit === "goldenface") {
    ctx.fillStyle = "#e4ba53";
    ctx.fillRect(headX, headY, 28 * menuScale, 12 * menuScale);
    ctx.fillStyle = "#1b1a1c";
    ctx.fillRect(headX + 7 * menuScale, headY + 4 * menuScale, 2 * menuScale, 2 * menuScale);
    ctx.fillRect(headX + 19 * menuScale, headY + 4 * menuScale, 2 * menuScale, 2 * menuScale);
    ctx.fillRect(headX + 11 * menuScale, headY + 8 * menuScale, 8 * menuScale, 1 * menuScale);
  }
  if (equippedOutfit === "ryan_beard") {
    ctx.fillStyle = "#151518";
    ctx.fillRect(headX + 4 * menuScale, headY + 7 * menuScale, 3 * menuScale, 5 * menuScale);
    ctx.fillRect(headX + 21 * menuScale, headY + 7 * menuScale, 3 * menuScale, 5 * menuScale);
    ctx.fillRect(headX + 7 * menuScale, headY + 8 * menuScale, 14 * menuScale, 2 * menuScale);
    ctx.fillRect(headX + 7 * menuScale, headY + 10 * menuScale, 14 * menuScale, 1 * menuScale);
    ctx.fillRect(headX + 8 * menuScale, headY + 11 * menuScale, 12 * menuScale, 1 * menuScale);
  }

  // Shirt and tie.
  let shirtColor = player.color;
  let tieColor = player.tieColor;
  if (equippedOutfit === "cornell_fit") {
    shirtColor = "#8a2432";
    tieColor = "#f4d76b";
  } else if (equippedOutfit === "goldenface") {
    shirtColor = "#121316";
    tieColor = "#d6b255";
  } else if (equippedOutfit === "date_mike") {
    shirtColor = "#1e2f4e";
    tieColor = "#9a1f2f";
  } else if (equippedOutfit === "wrong_fit") {
    shirtColor = "#cb5fa4";
    tieColor = "#f5d35b";
  } else if (equippedOutfit === "recyclops") {
    shirtColor = "#5c8f3c";
    tieColor = "#2d5a2e";
  } else if (equippedOutfit === "three_hole_gym") {
    shirtColor = "#d9dde4";
    tieColor = "#d9dde4";
  }
  const hideTie = equippedOutfit === "three_hole_gym";

  ctx.fillStyle = shirtColor;
  ctx.fillRect(bodyX, bodyY, 34 * menuScale, 36 * menuScale);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(bodyX + 20 * menuScale, bodyY + 1 * menuScale, 10 * menuScale, 34 * menuScale);
  if (!hideTie) {
    ctx.fillStyle = tieColor;
    ctx.fillRect(bodyX + 15 * menuScale, bodyY + 4 * menuScale, 4 * menuScale, 20 * menuScale);
  }
  if (equippedOutfit === "three_hole_gym") {
    ctx.fillStyle = "#0f1118";
    ctx.fillRect(bodyX + 15 * menuScale, bodyY + 9 * menuScale, 4 * menuScale, 4 * menuScale);
    ctx.fillRect(bodyX + 15 * menuScale, bodyY + 14 * menuScale, 4 * menuScale, 4 * menuScale);
    ctx.fillRect(bodyX + 15 * menuScale, bodyY + 19 * menuScale, 4 * menuScale, 4 * menuScale);
  } else if (equippedOutfit === "date_mike") {
    ctx.fillStyle = "#0d1118";
    ctx.fillRect(headX - 1 * menuScale, headY - 8 * menuScale, 30 * menuScale, 3 * menuScale);
    ctx.fillRect(headX + 5 * menuScale, headY - 13 * menuScale, 18 * menuScale, 5 * menuScale);
  } else if (equippedOutfit === "recyclops") {
    ctx.fillStyle = "#9be467";
    ctx.fillRect(headX + 6 * menuScale, headY + 2 * menuScale, 22 * menuScale, 2 * menuScale);
    ctx.fillStyle = "#2f4f2f";
    ctx.fillRect(headX + 15 * menuScale, headY + 2 * menuScale, 4 * menuScale, 2 * menuScale);
  }
  if (equippedOutfit === "goldenface") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(bodyX + 14 * menuScale, bodyY + 4 * menuScale, 8 * menuScale, 20 * menuScale);
    ctx.fillStyle = "#121316";
    ctx.fillRect(bodyX, bodyY, 7 * menuScale, 36 * menuScale);
    ctx.fillRect(bodyX + 27 * menuScale, bodyY, 7 * menuScale, 36 * menuScale);
    ctx.fillRect(bodyX + 9 * menuScale, bodyY + 4 * menuScale, 5 * menuScale, 20 * menuScale);
    ctx.fillRect(bodyX + 22 * menuScale, bodyY + 4 * menuScale, 5 * menuScale, 20 * menuScale);
  }

  // Arms with subtle swing.
  const armSwingA = anim * 2.2;
  const armSwingB = -anim * 2.2;
  ctx.fillStyle = "#d4b28f";
  ctx.fillRect(bodyX - 3 * menuScale, bodyY + 8 * menuScale + armSwingA, 5 * menuScale, 16 * menuScale);
  ctx.fillRect(bodyX + 34 * menuScale, bodyY + 8 * menuScale + armSwingB, 5 * menuScale, 16 * menuScale);
  if (player.label !== "Dwight" && player.label !== "Kelly") {
    ctx.fillStyle = shirtColor;
    ctx.fillRect(bodyX - 3 * menuScale, bodyY + 8 * menuScale + armSwingA, 5 * menuScale, 7 * menuScale);
    ctx.fillRect(bodyX + 34 * menuScale, bodyY + 8 * menuScale + armSwingB, 5 * menuScale, 7 * menuScale);
  }

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
  ctx.fillText("Enter: Launch Level   Click Sticky Notes   S: Shop   A: Annex   D: Jim's Desk", 34, 523);
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
  const questLine = state.saveData.unlocks.jimDeskKey
    ? "Pam gave you Jim's Desk Key. Top row is officially de-gelled."
    : "Quest lock active: Save Pam, then complete 'Capture The Strangler' to get the key.";
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
  const jimScale = 2.0;
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
  state.shopTalkBounds = [];

  // After quest completion, Pam stands beside Jim.
  if (state.saveData.missions.savePam.completed) {
    const pamScale = jimScale;
    const pamX = jimX + 72;
    const pamY = jimY + 6;
    const pamW = 40 * pamScale;
    const pamH = 70 * pamScale;
    state.shopPamBounds = { x: pamX, y: pamY - pamH, w: pamW, h: pamH };

    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(pamX + 16 * pamScale, pamY + 7 * pamScale, 17 * pamScale, 6 * pamScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair + face.
    ctx.fillStyle = "#7e5139";
    ctx.fillRect(pamX + 7 * pamScale, pamY - 55 * pamScale, 18 * pamScale, 6 * pamScale);
    ctx.fillRect(pamX + 5 * pamScale, pamY - 51 * pamScale, 6 * pamScale, 13 * pamScale);
    ctx.fillRect(pamX + 21 * pamScale, pamY - 51 * pamScale, 6 * pamScale, 13 * pamScale);
    ctx.fillRect(pamX + 9 * pamScale, pamY - 40 * pamScale, 16 * pamScale, 4 * pamScale);
    ctx.fillStyle = "#f1cfb3";
    ctx.fillRect(pamX + 8 * pamScale, pamY - 48 * pamScale, 16 * pamScale, 12 * pamScale);
    ctx.fillStyle = "#1d2532";
    ctx.fillRect(pamX + 12 * pamScale, pamY - 44 * pamScale, 2 * pamScale, 2 * pamScale);
    ctx.fillRect(pamX + 18 * pamScale, pamY - 44 * pamScale, 2 * pamScale, 2 * pamScale);
    ctx.fillRect(pamX + 13 * pamScale, pamY - 40 * pamScale, 7 * pamScale, 1 * pamScale);

    // Outfit.
    ctx.fillStyle = "#d9eef9";
    ctx.fillRect(pamX + 7 * pamScale, pamY - 36 * pamScale, 18 * pamScale, 23 * pamScale);
    ctx.fillStyle = "#7f96bf";
    ctx.fillRect(pamX + 7 * pamScale, pamY - 36 * pamScale, 4 * pamScale, 23 * pamScale);
    ctx.fillRect(pamX + 21 * pamScale, pamY - 36 * pamScale, 4 * pamScale, 23 * pamScale);
    ctx.fillStyle = "#f1cfb3";
    ctx.fillRect(pamX + 4 * pamScale, pamY - 33 * pamScale, 3 * pamScale, 12 * pamScale);
    ctx.fillRect(pamX + 25 * pamScale, pamY - 33 * pamScale, 3 * pamScale, 12 * pamScale);
    ctx.fillStyle = "#d9eef9";
    ctx.fillRect(pamX + 4 * pamScale, pamY - 33 * pamScale, 3 * pamScale, 5 * pamScale);
    ctx.fillRect(pamX + 25 * pamScale, pamY - 33 * pamScale, 3 * pamScale, 5 * pamScale);

    // Skirt + legs + shoes.
    ctx.fillStyle = "#514a73";
    ctx.fillRect(pamX + 11 * pamScale, pamY - 13 * pamScale, 10 * pamScale, 8 * pamScale);
    ctx.fillStyle = "#1a2231";
    ctx.fillRect(pamX + 12 * pamScale, pamY - 5 * pamScale, 3 * pamScale, 8 * pamScale);
    ctx.fillRect(pamX + 18 * pamScale, pamY - 5 * pamScale, 3 * pamScale, 8 * pamScale);
    ctx.fillStyle = "#111722";
    ctx.fillRect(pamX + 11 * pamScale, pamY + 3 * pamScale, 4 * pamScale, 2 * pamScale);
    ctx.fillRect(pamX + 18 * pamScale, pamY + 3 * pamScale, 4 * pamScale, 2 * pamScale);

    // TALK callout above Pam.
    const pamTalkX = pamX - 2;
    const pamTalkY = pamY - pamH - 20;
    ctx.fillStyle = "#ffed99";
    ctx.fillRect(pamTalkX, pamTalkY, 66, 22);
    ctx.strokeStyle = "#8b6d1e";
    ctx.strokeRect(pamTalkX, pamTalkY, 66, 22);
    ctx.fillStyle = "#2a2618";
    ctx.font = "bold 14px Trebuchet MS";
    ctx.fillText("TALK", pamTalkX + 13, pamTalkY + 15);
    ctx.fillStyle = "#ffed99";
    ctx.beginPath();
    ctx.moveTo(pamTalkX + 28, pamTalkY + 22);
    ctx.lineTo(pamTalkX + 38, pamTalkY + 22);
    ctx.lineTo(pamTalkX + 33, pamTalkY + 30);
    ctx.closePath();
    ctx.fill();
    state.shopTalkBounds.push({ id: "pam_talk", x: pamTalkX, y: pamTalkY, w: 66, h: 30 });
  } else {
    state.shopPamBounds = null;
  }

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
  state.shopTalkBounds.push({ id: "talk", x: talkX, y: talkY, w: 66, h: 30 });

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

    // Top row is visually encased in yellow Jell-O until each item is purchased.
    if (row === 0 && !owned) {
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
    state.shopMessage || "Jim says this machine is 90% Jell-O, 10% disappointment, and 100% policy.",
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
    if (state.shopConversation.actor === "jim" && state.shopConversation.step === "choice") {
      const askBtn = { id: "ask", x: boxX + 16, y: boxY + 94, w: 340, h: 30 };
      const leaveBtn = { id: "leave", x: boxX + 372, y: boxY + 94, w: 160, h: 30 };
      for (const btn of [askBtn, leaveBtn]) {
        ctx.fillStyle = "#2f4f7a";
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.strokeStyle = "#8bc8ff";
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
      }
      ctx.fillStyle = "#f5ead6";
      ctx.font = "bold 14px Trebuchet MS";
      drawWrappedText("Why is the top row covered in jello?", askBtn.x + 10, askBtn.y + 19, askBtn.w - 16, 14, 1);
      ctx.font = "bold 16px Trebuchet MS";
      ctx.fillText("Leave", leaveBtn.x + 52, leaveBtn.y + 20);
      state.shopTalkBounds.push(askBtn, leaveBtn);
    } else if (state.shopConversation.actor === "jim" && state.shopConversation.step === "pam_info") {
      const doneBtn = { id: "done", x: boxX + 16, y: boxY + 94, w: 150, h: 30 };
      ctx.fillStyle = "#2f4f7a";
      ctx.fillRect(doneBtn.x, doneBtn.y, doneBtn.w, doneBtn.h);
      ctx.strokeStyle = "#8bc8ff";
      ctx.strokeRect(doneBtn.x, doneBtn.y, doneBtn.w, doneBtn.h);
      ctx.fillStyle = "#f5ead6";
      ctx.font = "bold 16px Trebuchet MS";
      ctx.fillText("Got it", doneBtn.x + 50, doneBtn.y + 20);
      state.shopTalkBounds.push(doneBtn);
    } else if (state.shopConversation.actor === "pam" && state.shopConversation.step === "intro") {
      const askBtn = { id: "ask_how", x: boxX + 16, y: boxY + 94, w: 280, h: 30 };
      const leaveBtn = { id: "leave", x: boxX + 312, y: boxY + 94, w: 160, h: 30 };
      for (const btn of [askBtn, leaveBtn]) {
        ctx.fillStyle = "#2f4f7a";
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.strokeStyle = "#8bc8ff";
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
      }
      ctx.fillStyle = "#f5ead6";
      ctx.font = "bold 16px Trebuchet MS";
      ctx.fillText("How are you doing?", askBtn.x + 54, askBtn.y + 20);
      ctx.fillText("Leave", leaveBtn.x + 52, leaveBtn.y + 20);
      state.shopTalkBounds.push(askBtn, leaveBtn);
    } else if (state.shopConversation.actor === "pam" && state.shopConversation.step === "how_doing") {
      const catchBtn = { id: "catch_strangler", x: boxX + 16, y: boxY + 94, w: 320, h: 30 };
      const leaveBtn = { id: "leave", x: boxX + 352, y: boxY + 94, w: 160, h: 30 };
      for (const btn of [catchBtn, leaveBtn]) {
        ctx.fillStyle = "#2f4f7a";
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.strokeStyle = "#8bc8ff";
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
      }
      ctx.fillStyle = "#f5ead6";
      ctx.font = "bold 16px Trebuchet MS";
      ctx.fillText("I could catch the Strangler.", catchBtn.x + 34, catchBtn.y + 20);
      ctx.fillText("Leave", leaveBtn.x + 52, leaveBtn.y + 20);
      state.shopTalkBounds.push(catchBtn, leaveBtn);
    } else if (
      state.shopConversation.actor === "pam" &&
      (state.shopConversation.step === "offer_help" ||
        state.shopConversation.step === "reward_ready" ||
        state.shopConversation.step === "post_capture" ||
        state.shopConversation.step === "post_midnight")
    ) {
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

function drawDeskScene() {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#2d323f");
  grad.addColorStop(1, "#1e2330");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Desk and office props.
  ctx.fillStyle = "#2c3748";
  ctx.fillRect(0, 420, canvas.width, 120);
  ctx.fillStyle = "#5a4431";
  ctx.fillRect(126, 286, 708, 152);
  ctx.fillStyle = "#6c5239";
  ctx.fillRect(142, 252, 676, 42);
  ctx.strokeStyle = "#ab845f";
  ctx.lineWidth = 3;
  ctx.strokeRect(142, 252, 676, 186);
  ctx.fillStyle = "#3d2f23";
  ctx.fillRect(172, 300, 162, 122);
  ctx.fillRect(626, 300, 162, 122);
  ctx.fillStyle = "#b9926b";
  ctx.fillRect(180, 316, 146, 4);
  ctx.fillRect(634, 316, 146, 4);
  state.deskBounds = { x: 142, y: 252, w: 676, h: 186 };

  const hasKey = state.saveData.unlocks.jimDeskKey;
  const drawerX = 392;
  const drawerY = 330;
  const drawerW = 178;
  const drawerH = 86;
  state.deskDrawerBounds = { x: drawerX, y: drawerY, w: drawerW, h: drawerH };

  ctx.fillStyle = hasKey ? "#84624a" : "#554236";
  ctx.fillRect(drawerX, drawerY, drawerW, drawerH);
  ctx.strokeStyle = hasKey ? "#b68b67" : "#6a5648";
  ctx.lineWidth = 2;
  ctx.strokeRect(drawerX, drawerY, drawerW, drawerH);
  ctx.fillStyle = "#d8c3a5";
  ctx.fillRect(drawerX + 78, drawerY + 33, 22, 10);
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(drawerX + 86, drawerY + 35, 6, 6);

  if (state.deskDrawerOpen && hasKey) {
    const trayY = drawerY + 46;
    ctx.fillStyle = "#21170f";
    ctx.fillRect(drawerX + 10, trayY, drawerW - 20, 34);

    // Goldenface outfit card art.
    const cardX = drawerX + 28;
    const cardY = trayY + 4;
    const cardW = drawerW - 56;
    const cardH = 24;
    ctx.fillStyle = "#d6b255";
    ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.strokeStyle = "#f7da87";
    ctx.strokeRect(cardX, cardY, cardW, cardH);
    ctx.fillStyle = "#1c1a1b";
    ctx.fillRect(cardX + 6, cardY + 6, 8, 12);
    ctx.fillRect(cardX + 16, cardY + 8, 10, 10);
    ctx.fillStyle = "#e6bf5e";
    ctx.fillRect(cardX + 16, cardY + 4, 10, 6);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cardX + 18, cardY + 11, 6, 1);
    ctx.fillStyle = "#1c1a1b";
    ctx.font = "bold 11px Trebuchet MS";
    ctx.fillText("GOLDENFACE", cardX + 34, cardY + 11);
    ctx.fillText("SUIT", cardX + 34, cardY + 21);
    state.deskGoldenfaceBounds = { x: cardX, y: cardY, w: cardW, h: cardH };
  } else {
    state.deskGoldenfaceBounds = null;
  }

  ctx.fillStyle = "#f5e9d0";
  ctx.font = "bold 30px Trebuchet MS";
  ctx.fillText("Jim's Desk", 384, 102);
  ctx.font = "18px Trebuchet MS";
  if (!hasKey) {
    ctx.fillText("Desk is locked. Pam has the key.", 332, 136);
  } else if (!state.deskDrawerOpen) {
    ctx.fillText("Click the desk drawer to unlock it with Jim's Desk Key.", 250, 136);
  } else {
    ctx.fillText("Click the Goldenface outfit card in the drawer to equip it.", 242, 136);
  }
  ctx.fillStyle = "#b9d7ff";
  ctx.font = "17px Trebuchet MS";
  ctx.fillText("Press Enter to return to the conference room.", 286, 500);
}

function selectDeskByCanvasPoint(x, y) {
  const hasKey = state.saveData.unlocks.jimDeskKey;

  if (
    state.deskGoldenfaceBounds &&
    x >= state.deskGoldenfaceBounds.x &&
    x <= state.deskGoldenfaceBounds.x + state.deskGoldenfaceBounds.w &&
    y >= state.deskGoldenfaceBounds.y &&
    y <= state.deskGoldenfaceBounds.y + state.deskGoldenfaceBounds.h
  ) {
    if (!state.saveData.unlocks.outfitsUnlocked.includes("goldenface")) {
      state.saveData.unlocks.outfitsUnlocked.push("goldenface");
    }
    const runnerId = getRunnerId();
    state.saveData.unlocks.equippedOutfits[runnerId] = "goldenface";
    persistSave();
    showMissionToast("Goldenface equipped. Return to the conference room.");
    switchScene("menu");
    return;
  }

  if (
    state.deskDrawerBounds &&
    x >= state.deskDrawerBounds.x &&
    x <= state.deskDrawerBounds.x + state.deskDrawerBounds.w &&
    y >= state.deskDrawerBounds.y &&
    y <= state.deskDrawerBounds.y + state.deskDrawerBounds.h
  ) {
    if (!hasKey) {
      showMissionToast("Desk locked. Pam has Jim's Desk Key.");
      return;
    }
    state.deskDrawerOpen = true;
    showMissionToast("Drawer unlocked.");
    return;
  }

  if (
    !hasKey &&
    state.deskBounds &&
    x >= state.deskBounds.x &&
    x <= state.deskBounds.x + state.deskBounds.w &&
    y >= state.deskBounds.y &&
    y <= state.deskBounds.y + state.deskBounds.h
  ) {
    showMissionToast("Desk is locked.");
  }
}

function selectShopByCanvasPoint(x, y) {
  if (state.shopTalkBounds.length > 0) {
    for (const target of state.shopTalkBounds) {
      if (x < target.x || x > target.x + target.w || y < target.y || y > target.y + target.h) continue;
      if (target.id === "talk") startJimConversation();
      else if (target.id === "pam_talk") startPamConversation();
      else if (state.shopConversation?.actor === "pam") handlePamConversationClick(target.id);
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
  if (state.shopPamBounds) {
    const b = state.shopPamBounds;
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
      startPamConversation();
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
  ctx.fillRect(64, 54, 832, 476);
  ctx.strokeStyle = "#8bc8ff";
  ctx.strokeRect(64, 54, 832, 476);

  ctx.fillStyle = "#ffe08f";
  ctx.font = "bold 36px Trebuchet MS";
  ctx.fillText("Missions Board", 386, 110);

  const savePam = state.saveData.missions.savePam;
  const capture = state.saveData.missions.captureStrangler;
  const tlm = state.saveData.missions.threatLevelMidnight;
  ctx.fillStyle = "#f5ead6";
  ctx.font = "bold 22px Trebuchet MS";
  ctx.fillText("Save Pam", 106, 158);
  ctx.font = "18px Trebuchet MS";
  if (!savePam.added) {
    ctx.fillText("Talk to Jim in the shop to unlock this mission.", 106, 188);
  } else if (!savePam.warehouseCleared) {
    ctx.fillText("Finish Warehouse once to trigger Pam search mode.", 106, 188);
  } else if (!savePam.completed) {
    ctx.fillText("Replay Warehouse: press P whenever Pam appears in the background.", 106, 188);
    ctx.fillText(`Best sightings in one run: ${savePam.sightingsBest || 0}/5`, 106, 218);
  } else {
    ctx.fillText("Pam rescued. Talk to her in the shop for your next mission.", 106, 188);
  }
  ctx.fillText(`Status: ${savePam.completed ? "Completed" : savePam.added ? "Active" : "Not Added"}`, 106, 248);

  ctx.font = "bold 22px Trebuchet MS";
  ctx.fillText("Capture The Strangler", 106, 288);
  ctx.font = "18px Trebuchet MS";
  if (!capture.added) {
    ctx.fillText("Talk to Pam in the shop to unlock this mission.", 106, 318);
  } else if (!capture.completed) {
    ctx.fillText("Beat Final Pursuit by hitting x10 HARDCORE.", 106, 318);
  } else if (!state.saveData.unlocks.jimDeskKey) {
    ctx.fillText("Return to Pam in the shop to claim Jim's Desk Key.", 106, 318);
  } else {
    ctx.fillText("Captured. Key claimed from Pam. Top-row machine unlocked.", 106, 318);
  }
  ctx.fillText(
    `Status: ${
      capture.completed ? (state.saveData.unlocks.jimDeskKey ? "Completed" : "Complete - Reward Unclaimed") : capture.added ? "Active" : "Not Added"
    }`,
    106,
    346
  );

  ctx.font = "bold 22px Trebuchet MS";
  ctx.fillText("Threat Level Midnight", 106, 388);
  ctx.font = "18px Trebuchet MS";
  if (!tlm.added) {
    ctx.fillText("Unlock Jim's Desk Key first.", 106, 418);
  } else if (!tlm.completed) {
    drawWrappedText(
      "Press D to open Jim's Desk, equip Goldenface from the drawer, then click Michael's mug in the Conference Room.",
      106,
      418,
      740,
      22,
      2
    );
  } else {
    ctx.fillText("Secret warp protocol armed. Michael Scarn mode is ready.", 106, 418);
  }
  ctx.fillText(`Status: ${tlm.completed ? "Completed" : tlm.added ? "Active" : "Not Added"}`, 106, 468);

  ctx.fillStyle = "#c9ddff";
  ctx.font = "17px Trebuchet MS";
  ctx.fillText("Press M to close missions and get back to the chaos.", 106, 524);
}

function drawAnnexScene() {
  const runnerId = getRunnerId();
  const runnerPreset = CHARACTER_PRESETS[runnerId];
  const equipped = getEquippedOutfitId(runnerId);

  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#ffd2e4");
  grad.addColorStop(1, "#b977ac");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(22, 16, 28, 0.74)";
  ctx.fillRect(42, 68, 916, 412);
  ctx.strokeStyle = "#ffd787";
  ctx.lineWidth = 2;
  ctx.strokeRect(42, 68, 916, 412);

  ctx.fillStyle = "#ffe6ab";
  ctx.font = "bold 36px Trebuchet MS";
  ctx.fillText("Annex Boutique", 372, 118);

  ctx.fillStyle = "#f7edf7";
  ctx.font = "18px Trebuchet MS";
  ctx.fillText(`Runner: ${runnerPreset.label}`, 64, 154);
  ctx.fillText(`Wallet: ${state.saveData.currencies.schruteBucks} Schrute Bucks`, 64, 178);
  ctx.fillText(`Dundies: ${Object.values(state.saveData.achievements).filter(Boolean).length}/3`, 64, 202);
  ctx.fillText("Kelly only accepts Schrute Bucks.", 64, 226);

  // Dundie shelf.
  state.annexAchievementBounds = [];
  ctx.fillStyle = "#6f4c3c";
  ctx.fillRect(62, 252, 236, 10);
  ctx.fillRect(62, 334, 236, 10);
  const dundieKeys = ["hottestInOffice", "whitestSneakers", "dontGoInThere"];
  const dundieLabels = ["Hottest", "Sneakers", "Chili"];
  for (let i = 0; i < 3; i += 1) {
    const unlocked = Boolean(state.saveData.achievements[dundieKeys[i]]);
    const x = 86 + i * 72;
    const y = 266;
    ctx.fillStyle = unlocked ? "#ffd06b" : "#5d5660";
    ctx.fillRect(x + 14, y + 8, 16, 16);
    ctx.fillRect(x + 19, y + 24, 6, 10);
    ctx.fillRect(x + 10, y + 34, 24, 4);
    ctx.fillStyle = unlocked ? "#ffefbe" : "#b6a9bc";
    ctx.font = "bold 11px Trebuchet MS";
    ctx.fillText(dundieLabels[i], x + 4, y + 52);
    state.annexAchievementBounds.push({ x, y, w: 44, h: 56, id: dundieKeys[i] });
  }
  ctx.fillStyle = "#dfc8f0";
  ctx.font = "12px Trebuchet MS";
  ctx.fillText("Click a Dundie to view how to earn it.", 64, 350);

  // Kelly sprite.
  const kx = 832;
  const ky = 424;
  const ks = 2.2;
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath();
  ctx.ellipse(kx + 18 * ks, ky + 8, 20 * ks, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#221616";
  ctx.fillRect(kx + 6 * ks, ky - 58 * ks, 24 * ks, 14 * ks);
  ctx.fillRect(kx + 4 * ks, ky - 52 * ks, 6 * ks, 18 * ks);
  ctx.fillRect(kx + 26 * ks, ky - 52 * ks, 6 * ks, 18 * ks);
  ctx.fillStyle = "#b98262";
  ctx.fillRect(kx + 9 * ks, ky - 50 * ks, 18 * ks, 13 * ks);
  ctx.fillStyle = "#2b2130";
  ctx.fillRect(kx + 13 * ks, ky - 45 * ks, 2 * ks, 2 * ks);
  ctx.fillRect(kx + 20 * ks, ky - 45 * ks, 2 * ks, 2 * ks);
  // Smile.
  ctx.fillRect(kx + 14 * ks, ky - 41 * ks, 2 * ks, 1 * ks);
  ctx.fillRect(kx + 19 * ks, ky - 41 * ks, 2 * ks, 1 * ks);
  ctx.fillRect(kx + 16 * ks, ky - 40 * ks, 3 * ks, 1 * ks);
  ctx.fillStyle = "#cf66a8";
  ctx.fillRect(kx + 8 * ks, ky - 37 * ks, 20 * ks, 22 * ks);
  ctx.fillStyle = "#b98262";
  ctx.fillRect(kx + 5 * ks, ky - 33 * ks, 3 * ks, 12 * ks);
  ctx.fillRect(kx + 28 * ks, ky - 33 * ks, 3 * ks, 12 * ks);
  ctx.fillStyle = "#2a3042";
  ctx.fillRect(kx + 11 * ks, ky - 15 * ks, 6 * ks, 18 * ks);
  ctx.fillRect(kx + 19 * ks, ky - 15 * ks, 6 * ks, 18 * ks);
  ctx.fillStyle = "#111722";
  ctx.fillRect(kx + 10 * ks, ky + 3 * ks, 7 * ks, 2 * ks);
  ctx.fillRect(kx + 19 * ks, ky + 3 * ks, 7 * ks, 2 * ks);

  // Player preview wearing the currently equipped outfit.
  const px = 852;
  const py = 286;
  const ps = 1.8;
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(px + 20 * ps, py + 8, 21 * ps, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head + hair.
  ctx.fillStyle = "#efcfab";
  ctx.fillRect(px + 7 * ps, py - 60 * ps, 28 * ps, 12 * ps);
  ctx.fillStyle = "#2a1e16";
  ctx.fillRect(px + 6 * ps, py - 64 * ps, 30 * ps, 5 * ps);
  ctx.fillRect(px + 5 * ps, py - 61 * ps, 6 * ps, 3 * ps);

  if (runnerPreset.label === "Dwight") {
    ctx.fillStyle = "#efcfab";
    ctx.fillRect(px + 14 * ps, py - 63 * ps, 14 * ps, 4 * ps);
    ctx.fillRect(px + 19 * ps, py - 64 * ps, 2 * ps, 6 * ps);
    ctx.fillStyle = "#2a1e16";
    ctx.fillRect(px + 12 * ps, py - 63 * ps, 3 * ps, 2 * ps);
    ctx.fillRect(px + 27 * ps, py - 63 * ps, 3 * ps, 2 * ps);
  }

  // Face details.
  ctx.fillStyle = "#1b2230";
  if (runnerPreset.label === "Dwight") {
    ctx.strokeStyle = "#96a3b3";
    ctx.lineWidth = Math.max(1, ps);
    ctx.strokeRect(px + 11.5 * ps, py - 57.5 * ps, 6 * ps, 5 * ps);
    ctx.strokeRect(px + 23.5 * ps, py - 57.5 * ps, 6 * ps, 5 * ps);
    ctx.beginPath();
    ctx.moveTo(px + 17.5 * ps, py - 55 * ps);
    ctx.lineTo(px + 23.5 * ps, py - 55 * ps);
    ctx.stroke();
    ctx.fillRect(px + 14 * ps, py - 55 * ps, 1 * ps, 1 * ps);
    ctx.fillRect(px + 26 * ps, py - 55 * ps, 1 * ps, 1 * ps);
  } else {
    ctx.fillRect(px + 13 * ps, py - 56 * ps, 2 * ps, 2 * ps);
    ctx.fillRect(px + 25 * ps, py - 56 * ps, 2 * ps, 2 * ps);
  }
  ctx.fillRect(px + 17 * ps, py - 52 * ps, 8 * ps, 1 * ps);
  if (equipped === "goldenface") {
    ctx.fillStyle = "#e4ba53";
    ctx.fillRect(px + 7 * ps, py - 60 * ps, 28 * ps, 12 * ps);
    ctx.fillStyle = "#1b1a1c";
    ctx.fillRect(px + 13 * ps, py - 56 * ps, 2 * ps, 2 * ps);
    ctx.fillRect(px + 25 * ps, py - 56 * ps, 2 * ps, 2 * ps);
    ctx.fillRect(px + 16 * ps, py - 52 * ps, 10 * ps, 1 * ps);
  }

  let shirtColor = runnerPreset.color;
  let tieColor = runnerPreset.tieColor;
  if (equipped === "cornell_fit") {
    shirtColor = "#8a2432";
    tieColor = "#f4d76b";
  } else if (equipped === "goldenface") {
    shirtColor = "#121316";
    tieColor = "#d6b255";
  } else if (equipped === "date_mike") {
    shirtColor = "#1e2f4e";
    tieColor = "#9a1f2f";
  } else if (equipped === "wrong_fit") {
    shirtColor = "#cb5fa4";
    tieColor = "#f5d35b";
  } else if (equipped === "recyclops") {
    shirtColor = "#5c8f3c";
    tieColor = "#2d5a2e";
  } else if (equipped === "three_hole_gym") {
    shirtColor = "#d9dde4";
    tieColor = "#d9dde4";
  }
  const hideTie = equipped === "three_hole_gym";

  // Torso + tie.
  ctx.fillStyle = shirtColor;
  ctx.fillRect(px + 4 * ps, py - 48 * ps, 34 * ps, 34 * ps);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(px + 24 * ps, py - 47 * ps, 11 * ps, 32 * ps);
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(px + 4 * ps, py - 47 * ps, 5 * ps, 32 * ps);
  ctx.fillStyle = "#f4ead9";
  ctx.fillRect(px + 16 * ps, py - 46 * ps, 10 * ps, 3 * ps);
  if (!hideTie) {
    ctx.fillStyle = tieColor;
    ctx.fillRect(px + 19 * ps, py - 44 * ps, 4 * ps, 20 * ps);
    ctx.fillRect(px + 18 * ps, py - 22 * ps, 6 * ps, 4 * ps);
  }
  if (equipped === "three_hole_gym") {
    ctx.fillStyle = "#0f1118";
    ctx.fillRect(px + 19 * ps, py - 40 * ps, 4 * ps, 4 * ps);
    ctx.fillRect(px + 19 * ps, py - 35 * ps, 4 * ps, 4 * ps);
    ctx.fillRect(px + 19 * ps, py - 30 * ps, 4 * ps, 4 * ps);
  }
  if (equipped === "goldenface") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(px + 16 * ps, py - 44 * ps, 10 * ps, 20 * ps);
    ctx.fillStyle = "#121316";
    ctx.fillRect(px + 4 * ps, py - 48 * ps, 8 * ps, 34 * ps);
    ctx.fillRect(px + 30 * ps, py - 48 * ps, 8 * ps, 34 * ps);
    ctx.fillRect(px + 12 * ps, py - 44 * ps, 4 * ps, 20 * ps);
    ctx.fillRect(px + 26 * ps, py - 44 * ps, 4 * ps, 20 * ps);
  }
  if (equipped === "goldenface") {
    ctx.fillStyle = "#1f1d1b";
    ctx.fillRect(px + 11 * ps, py - 56 * ps, 16 * ps, 3 * ps);
  }

  if (equipped === "ryan_beard") {
    ctx.fillStyle = "#151518";
    ctx.fillRect(px + 9 * ps, py - 55 * ps, 4 * ps, 6 * ps);
    ctx.fillRect(px + 27 * ps, py - 55 * ps, 4 * ps, 6 * ps);
    ctx.fillRect(px + 13 * ps, py - 53 * ps, 14 * ps, 3 * ps);
    ctx.fillRect(px + 13 * ps, py - 50 * ps, 14 * ps, 2 * ps);
    ctx.fillRect(px + 15 * ps, py - 48 * ps, 10 * ps, 1 * ps);
  } else if (equipped === "date_mike") {
    ctx.fillStyle = "#0d1118";
    ctx.fillRect(px + 6 * ps, py - 68 * ps, 30 * ps, 4 * ps);
    ctx.fillRect(px + 12 * ps, py - 73 * ps, 18 * ps, 6 * ps);
  } else if (equipped === "recyclops") {
    ctx.fillStyle = "#9be467";
    ctx.fillRect(px + 10 * ps, py - 59 * ps, 22 * ps, 2 * ps);
    ctx.fillStyle = "#2f4f2f";
    ctx.fillRect(px + 19 * ps, py - 59 * ps, 4 * ps, 2 * ps);
  }

  // Arms.
  ctx.fillStyle = "#d9ba97";
  ctx.fillRect(px + 1 * ps, py - 40 * ps, 8 * ps, 16 * ps);
  ctx.fillRect(px + 35 * ps, py - 40 * ps, 8 * ps, 16 * ps);
  if (runnerPreset.label !== "Dwight" && runnerPreset.label !== "Kelly") {
    ctx.fillStyle = shirtColor;
    ctx.fillRect(px + 1 * ps, py - 40 * ps, 8 * ps, 7 * ps);
    ctx.fillRect(px + 35 * ps, py - 40 * ps, 8 * ps, 7 * ps);
  }

  // Legs + shoes.
  ctx.fillStyle = "#202a39";
  ctx.fillRect(px + 10 * ps, py - 14 * ps, 9 * ps, 14 * ps);
  ctx.fillRect(px + 24 * ps, py - 14 * ps, 9 * ps, 14 * ps);
  ctx.fillStyle = "#141a25";
  ctx.fillRect(px + 9 * ps, py, 10 * ps, 3 * ps);
  ctx.fillRect(px + 24 * ps, py, 10 * ps, 3 * ps);

  // Outfit cards.
  state.annexCards = [];
  const startX = 320;
  const startY = 146;
  const cardW = 160;
  const cardH = 126;
  const colGap = 14;
  const rowGap = 10;
  for (let i = 0; i < ANNEX_OUTFITS.length; i += 1) {
    const outfit = ANNEX_OUTFITS[i];
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = startX + col * (cardW + colGap);
    const y = startY + row * (cardH + rowGap);
    const owned = ownsOutfit(outfit.id);
    const usable = isOutfitUsableByRunner(outfit, runnerId);
    const reqMet = hasOutfitAchievementRequirement(outfit);
    const isEquipped = equipped === outfit.id;

    ctx.fillStyle = isEquipped ? "#3d6f4f" : owned ? "#31507a" : reqMet ? "#4c3d62" : "#3f3948";
    ctx.fillRect(x, y, cardW, cardH);
    ctx.strokeStyle = isEquipped ? "#b7f5c8" : usable ? "#91d2ff" : "#8e889a";
    ctx.strokeRect(x, y, cardW, cardH);
    drawOutfitCardThumbnail(x + 116, y + 64, outfit.id);
    ctx.fillStyle = "#f5ead6";
    ctx.font = "bold 14px Trebuchet MS";
    drawWrappedText(outfit.name, x + 8, y + 20, 104, 15, 2);
    ctx.font = "12px Trebuchet MS";
    drawWrappedText(outfit.tagline, x + 8, y + 50, 104, 13, 4);

    let badge = isDundieRewardOutfit(outfit) ? "EARN FROM DUNDIE" : `BUY ${outfit.cost} SB`;
    if (!usable) badge = `ONLY ${outfit.character.toUpperCase()}`;
    else if (isDundieRewardOutfit(outfit) && !reqMet) badge = "LOCKED (DUNDIE)";
    else if (isEquipped) badge = "EQUIPPED";
    else if (owned) badge = "EQUIP";
    ctx.fillStyle = isEquipped ? "#d6ffd8" : "#ffe0a8";
    ctx.font = "bold 14px Trebuchet MS";
    ctx.fillText(badge, x + 8, y + 116);

    state.annexCards.push({ x, y, w: cardW, h: cardH, outfitId: outfit.id });
  }

  ctx.fillStyle = "rgba(9, 11, 19, 0.8)";
  ctx.fillRect(64, 22, 868, 34);
  ctx.strokeStyle = "#ffbbec";
  ctx.strokeRect(64, 22, 868, 34);
  ctx.fillStyle = "#f5deef";
  ctx.font = "17px Trebuchet MS";
  ctx.fillText(
    state.annexMessage || "Kelly: Welcome to the Annex Boutique, where confidence is mandatory and glitter is a lifestyle.",
    76,
    45
  );
}

function drawFinalCutsceneScene() {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#08152d");
  grad.addColorStop(1, "#1a0d2a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stage floor and lights.
  ctx.fillStyle = "#2a1e32";
  ctx.fillRect(0, 390, canvas.width, 150);
  ctx.fillStyle = "#3c2a47";
  ctx.fillRect(0, 380, canvas.width, 16);
  for (let i = 0; i < 6; i += 1) {
    const lx = 80 + i * 160;
    const beam = ctx.createLinearGradient(lx, 60, lx, 380);
    beam.addColorStop(0, "rgba(255, 231, 150, 0.38)");
    beam.addColorStop(1, "rgba(255, 231, 150, 0.02)");
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(lx - 24, 60);
    ctx.lineTo(lx + 24, 60);
    ctx.lineTo(lx + 72, 380);
    ctx.lineTo(lx - 72, 380);
    ctx.closePath();
    ctx.fill();
  }

  // Cheering audience (pixel crowd rows).
  const crowdPulse = Math.sin(state.cutsceneTimeSec * 9);
  const crowdColors = ["#314263", "#4a2d5d", "#2f5d55", "#5a3f2b", "#2d334b"];
  const crowdScale = 1.35;
  for (let row = 0; row < 3; row += 1) {
    const yBase = 476 + row * 20;
    for (let i = 0; i < 30; i += 1) {
      const x = 8 + i * 34 + (row % 2 === 0 ? 8 : 0);
      const body = crowdColors[(i + row) % crowdColors.length];
      const skin = ["#e3b891", "#c58d64", "#a97752"][(i + row) % 3];
      const armUp = (i + row) % 3 === 0 ? 1 : 0;
      const bounce = Math.abs(Math.sin(state.cutsceneTimeSec * 7 + i * 0.4 + row)) * 2;

      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(x + 2 * crowdScale, yBase + 12 * crowdScale, 10 * crowdScale, 2 * crowdScale);

      ctx.fillStyle = body;
      ctx.fillRect(x + 2 * crowdScale, yBase - 6 * crowdScale - bounce, 10 * crowdScale, 12 * crowdScale);
      ctx.fillStyle = skin;
      ctx.fillRect(x + 4 * crowdScale, yBase - 12 * crowdScale - bounce, 6 * crowdScale, 6 * crowdScale);

      // Arms cheering.
      ctx.fillStyle = skin;
      ctx.fillRect(
        x,
        yBase - 4 * crowdScale - bounce - armUp * 4 * crowdScale,
        2 * crowdScale,
        7 * crowdScale + armUp * 4 * crowdScale
      );
      ctx.fillRect(
        x + 12 * crowdScale,
        yBase - 4 * crowdScale - bounce + armUp * 2 * crowdScale,
        2 * crowdScale,
        7 * crowdScale + (1 - armUp) * 4 * crowdScale
      );
    }
  }

  // Audience signs and phone lights.
  for (let i = 0; i < 7; i += 1) {
    const sx = 90 + i * 120;
    const sy = 448 + Math.sin(state.cutsceneTimeSec * 6 + i) * 2;
    ctx.fillStyle = i % 2 === 0 ? "#ffe08f" : "#d7f0ff";
    ctx.fillRect(sx, sy, 26, 12);
    ctx.fillStyle = "#27324a";
    ctx.fillRect(sx + 11, sy + 12, 4, 8);
    if (i % 3 === 0) {
      ctx.fillStyle = "#f7fbff";
      ctx.fillRect(sx + 8, sy + 3, 3, 3);
      ctx.fillRect(sx + 15, sy + 3, 3, 3);
    }
  }

  // Darryl in the background playing keys.
  const dx = 214;
  const dy = 400;
  const ds = 2.25;
  const darylShift = 11 * ds;
  const keyTap = Math.sin(state.cutsceneTimeSec * 10) * 1.8;

  // Keyboard stand + keyboard.
  ctx.fillStyle = "#2a3242";
  ctx.fillRect(dx + 8 * ds, dy - 20 * ds, 54 * ds, 8 * ds);
  // Back panel toward camera (keyboard facing Darryl).
  ctx.fillStyle = "#1d2533";
  ctx.fillRect(dx + 8 * ds, dy - 17 * ds, 54 * ds, 5 * ds);
  ctx.fillStyle = "#4b5870";
  ctx.fillRect(dx + 12 * ds, dy - 19 * ds, 46 * ds, 1 * ds);
  ctx.fillStyle = "#3c4254";
  ctx.fillRect(dx + 23 * ds, dy - 12 * ds, 3 * ds, 21 * ds);
  ctx.fillRect(dx + 45 * ds, dy - 12 * ds, 3 * ds, 21 * ds);

  // Darryl sprite.
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath();
  ctx.ellipse(dx + 24 * ds + darylShift, dy - 4 * ds, 10 * ds, 4.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2b201a";
  ctx.fillRect(dx + 16 * ds + darylShift, dy - 54 * ds, 16 * ds, 6 * ds);
  ctx.fillStyle = "#8b6549";
  ctx.fillRect(dx + 17 * ds + darylShift, dy - 50 * ds, 14 * ds, 10 * ds);
  ctx.fillStyle = "#1f2633";
  ctx.fillRect(dx + 20 * ds + darylShift, dy - 46 * ds, 2 * ds, 2 * ds);
  ctx.fillRect(dx + 26 * ds + darylShift, dy - 46 * ds, 2 * ds, 2 * ds);
  ctx.fillRect(dx + 21 * ds + darylShift, dy - 42 * ds, 6 * ds, 1 * ds);

  ctx.fillStyle = "#4f6da0";
  ctx.fillRect(dx + 15 * ds + darylShift, dy - 40 * ds, 18 * ds, 18 * ds);
  ctx.fillStyle = "#d9b089";
  ctx.fillRect(dx + 11 * ds + darylShift, dy - 34 * ds + keyTap, 4 * ds, 8 * ds);
  ctx.fillRect(dx + 33 * ds + darylShift, dy - 34 * ds - keyTap, 4 * ds, 8 * ds);
  ctx.fillStyle = "#4f6da0";
  ctx.fillRect(dx + 11 * ds + darylShift, dy - 34 * ds + keyTap, 4 * ds, 3 * ds);
  ctx.fillRect(dx + 33 * ds + darylShift, dy - 34 * ds - keyTap, 4 * ds, 3 * ds);
  ctx.fillStyle = "#1f2736";
  ctx.fillRect(dx + 18 * ds + darylShift, dy - 22 * ds, 5 * ds, 14 * ds);
  ctx.fillRect(dx + 25 * ds + darylShift, dy - 22 * ds, 5 * ds, 14 * ds);
  ctx.fillStyle = "#111722";
  ctx.fillRect(dx + 18 * ds + darylShift, dy - 8 * ds, 5 * ds, 2 * ds);
  ctx.fillRect(dx + 25 * ds + darylShift, dy - 8 * ds, 5 * ds, 2 * ds);

  // Draw keyboard in foreground so Darryl is clearly behind it.
  ctx.fillStyle = "#2a3242";
  ctx.fillRect(dx + 8 * ds, dy - 20 * ds, 54 * ds, 8 * ds);
  ctx.fillStyle = "#1d2533";
  ctx.fillRect(dx + 8 * ds, dy - 17 * ds, 54 * ds, 5 * ds);
  ctx.fillStyle = "#4b5870";
  ctx.fillRect(dx + 12 * ds, dy - 19 * ds, 46 * ds, 1 * ds);
  ctx.fillStyle = "#3c4254";
  ctx.fillRect(dx + 23 * ds, dy - 12 * ds, 3 * ds, 21 * ds);
  ctx.fillRect(dx + 45 * ds, dy - 12 * ds, 3 * ds, 21 * ds);

  // Michael on stage.
  const dance = state.cutsceneTimeSec;
  const step = Math.sin(dance * 6.2);
  const bounce = Math.abs(Math.sin(dance * 6.2)) * 2.2;
  const armSwing = Math.sin(dance * 9) * 3.2;
  const legSwing = Math.sin(dance * 7.2) * 2.6;
  const mx = 442 + step * 7;
  const my = 374;
  const s = 2.2;
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(mx + 16 * s, my + 10, 20 * s + Math.abs(step), 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#efcfab";
  ctx.fillRect(mx + 8 * s, my - 48 * s - bounce, 16 * s, 12 * s);
  ctx.fillStyle = "#2a1e16";
  ctx.fillRect(mx + 7 * s, my - 52 * s - bounce, 18 * s, 5 * s);
  ctx.fillStyle = "#1b2230";
  ctx.fillRect(mx + 12 * s, my - 43 * s - bounce, 2 * s, 2 * s);
  ctx.fillRect(mx + 18 * s, my - 43 * s - bounce, 2 * s, 2 * s);
  ctx.fillRect(mx + 13 * s, my - 39 * s - bounce, 7 * s, 1 * s);
  ctx.fillStyle = "#151820";
  ctx.fillRect(mx + 7 * s, my - 36 * s - bounce, 18 * s, 26 * s);
  ctx.fillStyle = "#f5f7fb";
  ctx.fillRect(mx + 15 * s, my - 33 * s - bounce, 3 * s, 17 * s);
  ctx.fillRect(mx + 14 * s, my - 15 * s - bounce, 5 * s, 3 * s);
  ctx.fillStyle = "#d9ba97";
  ctx.fillRect(mx + 3 * s, my - 31 * s - bounce + armSwing, 4 * s, 12 * s);
  ctx.fillRect(mx + 25 * s, my - 31 * s - bounce - armSwing, 4 * s, 12 * s);
  ctx.fillStyle = "#151820";
  ctx.fillRect(mx + 3 * s, my - 31 * s - bounce + armSwing, 4 * s, 5 * s);
  ctx.fillRect(mx + 25 * s, my - 31 * s - bounce - armSwing, 4 * s, 5 * s);
  ctx.fillStyle = "#1f2736";
  ctx.fillRect(mx + 10 * s, my - 10 * s + Math.max(0, -legSwing), 5 * s, 12 * s + Math.abs(legSwing));
  ctx.fillRect(mx + 17 * s, my - 10 * s + Math.max(0, legSwing), 5 * s, 12 * s + Math.abs(legSwing));
  ctx.fillStyle = "#111722";
  ctx.fillRect(mx + 9 * s, my + 2 * s + Math.max(0, -legSwing), 6 * s, 2 * s);
  ctx.fillRect(mx + 17 * s, my + 2 * s + Math.max(0, legSwing), 6 * s, 2 * s);

  // Mic stand.
  ctx.fillStyle = "#c9cfdd";
  ctx.fillRect(mx + 34 * s, my - 38 * s, 2 * s, 42 * s);
  ctx.fillRect(mx + 30 * s, my - 41 * s, 10 * s, 4 * s);

  const lyrics = ["GOODBYE TOBY, IT'S BEEN NICE,", "HOPE YOU FIND YOUR PARADISE."];
  const lyricIdx = state.cutsceneLyricLine;

  ctx.fillStyle = "#ffd66e";
  ctx.font = "bold 30px Trebuchet MS";
  ctx.fillText("Finale Cutscene", 354, 78);
  ctx.fillStyle = "#f8f0dc";
  ctx.font = "bold 26px Trebuchet MS";
  ctx.fillText("Michael Sings 'Goodbye Toby'", 280, 116);
  ctx.fillStyle = "#ffe9b7";
  ctx.font = "bold 28px Trebuchet MS";
  ctx.fillText(lyrics[lyricIdx], 170, 180);
  ctx.fillStyle = "#cfe5ff";
  ctx.font = "18px Trebuchet MS";
  ctx.fillText("Press Enter or Back To Menu when you're done vibing.", 256, 516);

  if (state.cutsceneFadeLeft > 0) {
    const alpha = Math.min(1, state.cutsceneFadeLeft / 0.85);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
  }
}

function drawOutfitCardThumbnail(x, y, outfitId) {
  const s = 1.05;
  const baseX = x;
  const baseY = y;

  let shirtColor = "#4b6da0";
  let tieColor = "#9a1f2f";
  if (outfitId === "cornell_fit") {
    shirtColor = "#8a2432";
    tieColor = "#f4d76b";
  } else if (outfitId === "goldenface") {
    shirtColor = "#121316";
    tieColor = "#d6b255";
  } else if (outfitId === "date_mike") {
    shirtColor = "#1e2f4e";
    tieColor = "#9a1f2f";
  } else if (outfitId === "wrong_fit") {
    shirtColor = "#cb5fa4";
    tieColor = "#f5d35b";
  } else if (outfitId === "recyclops") {
    shirtColor = "#5c8f3c";
    tieColor = "#2d5a2e";
  } else if (outfitId === "three_hole_gym") {
    shirtColor = "#d9dde4";
    tieColor = "#d9dde4";
  } else if (outfitId === "ryan_beard") {
    shirtColor = "#4b6da0";
    tieColor = "#9a1f2f";
  }

  const hideTie = outfitId === "three_hole_gym";

  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(baseX + 14 * s, baseY + 44 * s, 14 * s, 4 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#efcfab";
  ctx.fillRect(baseX + 8 * s, baseY + 2 * s, 12 * s, 7 * s);
  ctx.fillStyle = "#2a1e16";
  ctx.fillRect(baseX + 7 * s, baseY, 14 * s, 3 * s);
  ctx.fillStyle = "#1b2230";
  ctx.fillRect(baseX + 10 * s, baseY + 5 * s, 1 * s, 1 * s);
  ctx.fillRect(baseX + 17 * s, baseY + 5 * s, 1 * s, 1 * s);
  ctx.fillRect(baseX + 12 * s, baseY + 8 * s, 5 * s, 1 * s);
  if (outfitId === "goldenface") {
    ctx.fillStyle = "#e4ba53";
    ctx.fillRect(baseX + 8 * s, baseY + 2 * s, 12 * s, 7 * s);
    ctx.fillStyle = "#1b1a1c";
    ctx.fillRect(baseX + 10 * s, baseY + 5 * s, 1 * s, 1 * s);
    ctx.fillRect(baseX + 17 * s, baseY + 5 * s, 1 * s, 1 * s);
    ctx.fillRect(baseX + 12 * s, baseY + 8 * s, 5 * s, 1 * s);
  }

  ctx.fillStyle = shirtColor;
  ctx.fillRect(baseX + 6 * s, baseY + 10 * s, 16 * s, 18 * s);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(baseX + 16 * s, baseY + 11 * s, 5 * s, 16 * s);
  if (!hideTie) {
    ctx.fillStyle = tieColor;
    ctx.fillRect(baseX + 13 * s, baseY + 12 * s, 2 * s, 11 * s);
    ctx.fillRect(baseX + 12 * s, baseY + 23 * s, 4 * s, 2 * s);
  }
  if (outfitId === "three_hole_gym") {
    ctx.fillStyle = "#0f1118";
    ctx.fillRect(baseX + 14 * s, baseY + 14 * s, 2 * s, 2 * s);
    ctx.fillRect(baseX + 14 * s, baseY + 17 * s, 2 * s, 2 * s);
    ctx.fillRect(baseX + 14 * s, baseY + 20 * s, 2 * s, 2 * s);
  }
  if (outfitId === "goldenface") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(baseX + 12 * s, baseY + 12 * s, 4 * s, 10 * s);
    ctx.fillStyle = "#121316";
    ctx.fillRect(baseX + 6 * s, baseY + 10 * s, 4 * s, 18 * s);
    ctx.fillRect(baseX + 18 * s, baseY + 10 * s, 4 * s, 18 * s);
  }
  if (outfitId === "ryan_beard") {
    ctx.fillStyle = "#151518";
    ctx.fillRect(baseX + 7 * s, baseY + 6 * s, 2 * s, 4 * s);
    ctx.fillRect(baseX + 19 * s, baseY + 6 * s, 2 * s, 4 * s);
    ctx.fillRect(baseX + 9 * s, baseY + 7 * s, 10 * s, 2 * s);
    ctx.fillRect(baseX + 9 * s, baseY + 9 * s, 10 * s, 1 * s);
    ctx.fillRect(baseX + 11 * s, baseY + 10 * s, 6 * s, 1 * s);
  }
  if (outfitId === "date_mike") {
    ctx.fillStyle = "#0d1118";
    ctx.fillRect(baseX + 7 * s, baseY - 3 * s, 14 * s, 2 * s);
    ctx.fillRect(baseX + 10 * s, baseY - 6 * s, 8 * s, 3 * s);
  } else if (outfitId === "recyclops") {
    ctx.fillStyle = "#9be467";
    ctx.fillRect(baseX + 9 * s, baseY + 2 * s, 10 * s, 1 * s);
    ctx.fillStyle = "#2f4f2f";
    ctx.fillRect(baseX + 13 * s, baseY + 2 * s, 2 * s, 1 * s);
  }

  ctx.fillStyle = "#d9ba97";
  ctx.fillRect(baseX + 3 * s, baseY + 12 * s, 3 * s, 9 * s);
  ctx.fillRect(baseX + 22 * s, baseY + 12 * s, 3 * s, 9 * s);
  ctx.fillStyle = "#202a39";
  ctx.fillRect(baseX + 9 * s, baseY + 28 * s, 4 * s, 12 * s);
  ctx.fillRect(baseX + 15 * s, baseY + 28 * s, 4 * s, 12 * s);
  ctx.fillStyle = "#141a25";
  ctx.fillRect(baseX + 8 * s, baseY + 40 * s, 5 * s, 2 * s);
  ctx.fillRect(baseX + 15 * s, baseY + 40 * s, 5 * s, 2 * s);
}

function selectAnnexByCanvasPoint(x, y) {
  for (const badge of state.annexAchievementBounds) {
    if (x < badge.x || x > badge.x + badge.w || y < badge.y || y > badge.y + badge.h) continue;
    if (badge.id === "hottestInOffice") {
      showAnnexMessage('Dundie: "Hottest in the Office" - Get hit by Jan\'s flying folders 20 times.');
    } else if (badge.id === "whitestSneakers") {
      showAnnexMessage('Dundie: "Whitest Sneakers" - Hit a HARDCORE streak of 20 in a row.');
    } else {
      showAnnexMessage('Dundie: "Don\'t Go In There" - Jump into Kevin\'s chili 3 times in one run.');
    }
    return;
  }

  for (const card of state.annexCards) {
    if (x < card.x || x > card.x + card.w || y < card.y || y > card.y + card.h) continue;
    toggleOutfit(card.outfitId);
    return;
  }
}

function drawRunScene() {
  const shakeX = state.screenShake > 0 ? (Math.random() - 0.5) * 10 * state.screenShake : 0;
  const shakeY = state.screenShake > 0 ? (Math.random() - 0.5) * 8 * state.screenShake : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);
  drawRunBackground();
  drawPamQuestBackgroundSprite();
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
  else if (state.scene === "desk") drawDeskScene();
  else if (state.scene === "missions") drawMissionsScene();
  else if (state.scene === "cutscene") drawFinalCutsceneScene();
  else drawAnnexScene();

  if (state.missionToastLeft > 0) {
    const alpha = Math.min(1, state.missionToastLeft / 0.3);
    ctx.globalAlpha = alpha;
    const toastText = state.missionToastText || "";
    const toastW = Math.min(860, Math.max(420, ctx.measureText(toastText).width + 36));
    const toastX = Math.max(20, (canvas.width - toastW) * 0.5);
    ctx.fillStyle = "rgba(8, 14, 24, 0.86)";
    ctx.fillRect(toastX, 20, toastW, 48);
    ctx.strokeStyle = "#8fd6ff";
    ctx.strokeRect(toastX, 20, toastW, 48);
    ctx.fillStyle = "#d8f3ff";
    ctx.font = "bold 17px Trebuchet MS";
    drawWrappedText(toastText, toastX + 14, 40, toastW - 28, 20, 2);
    ctx.globalAlpha = 1;
  }
}

function update(dt) {
  state.elapsedSec += dt;
  syncDundieOutfitRewards();
  syncPostKeyMissionRewards();
  updateCornerTv(dt);
  if (state.scene === "run") updateRun(dt);
  updateLevelMusic(dt);
  updateSkarnMusic(dt);
  if (state.scene === "cutscene") {
    state.cutsceneTimeSec += dt;
    state.cutsceneFadeLeft = Math.max(0, state.cutsceneFadeLeft - dt);
    updateCutsceneSong(dt);
  }
  if (state.menuClickLeft > 0) {
    state.menuClickLeft = Math.max(0, state.menuClickLeft - dt);
    if (state.menuClickLeft === 0) state.menuClickMessage = "";
  }
  if (state.shopMessageLeft > 0) {
    state.shopMessageLeft = Math.max(0, state.shopMessageLeft - dt);
    if (state.shopMessageLeft === 0) state.shopMessage = "";
  }
  if (state.missionToastLeft > 0) {
    state.missionToastLeft = Math.max(0, state.missionToastLeft - dt);
    if (state.missionToastLeft === 0) state.missionToastText = "";
  }
  if (state.annexMessageLeft > 0) {
    state.annexMessageLeft = Math.max(0, state.annexMessageLeft - dt);
    if (state.annexMessageLeft === 0) {
      state.annexMessage = "Kelly: Welcome to the Annex Boutique, where confidence is mandatory and glitter is a lifestyle.";
    }
  }
  if (state.cornerLogoRewardCooldown > 0) {
    state.cornerLogoRewardCooldown = Math.max(0, state.cornerLogoRewardCooldown - dt);
  }
}

function selectWorldByCanvasPoint(x, y) {
  for (const card of state.menuCards) {
    if (x < card.x || x > card.x + card.w || y < card.y || y > card.y + card.h) continue;
    if (!card.unlocked) {
      state.menuClickWorldId = card.worldId;
      state.menuClickLeft = 0.55;
      state.menuClickMessage = "LOCKED";
      return;
    }
    state.selectedWorldId = card.worldId;
    state.menuClickWorldId = card.worldId;
    state.menuClickLeft = 0.55;
    state.menuClickMessage = "SELECTED";
    setMenuDialogue();
    return;
  }
}

function handleMenuSpecialClick(x, y) {
  if (!state.menuMugBounds) return false;
  const b = state.menuMugBounds;
  if (x < b.x || x > b.x + b.w || y < b.y || y > b.y + b.h) return false;

  const mission = state.saveData.missions.threatLevelMidnight;
  const runnerId = getRunnerId();
  const equipped = getEquippedOutfitId(runnerId);
  if (equipped !== "goldenface") {
    state.menuClickWorldId = null;
    state.menuClickLeft = 0.7;
    state.menuClickMessage = "NEED GOLDENFACE";
    return true;
  }

  if (mission.added && !mission.completed) {
    mission.completed = true;
    persistSave();
    showMissionToast("Mission Complete: Threat Level Midnight");
  }
  state.menuClickWorldId = null;
  state.menuClickLeft = 0.75;
  state.menuClickMessage = "MICHAEL SCARN";
  state.selectedWorldId = "skarn";
  resetRunState("skarn");
  summaryPanel.hidden = true;
  nextLevelBtn.hidden = true;
  return true;
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
    if (state.scene === "shop" || state.scene === "annex" || state.scene === "desk") {
      switchScene("menu");
      return;
    }
    if (state.scene === "cutscene") {
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
    if (ev.code === "KeyD") switchScene("desk");
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
  if (ev.code === "KeyP") {
    ev.preventDefault();
    handlePamSpottingKey();
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
    if (handleMenuSpecialClick(x, y)) return;
    selectWorldByCanvasPoint(x, y);
    return;
  }
  if (state.scene === "shop") {
    selectShopByCanvasPoint(x, y);
    return;
  }
  if (state.scene === "annex") {
    selectAnnexByCanvasPoint(x, y);
    return;
  }
  if (state.scene === "desk") {
    selectDeskByCanvasPoint(x, y);
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
  if (state.pendingNextAction === "final_cutscene") {
    switchScene("cutscene");
    summaryPanel.hidden = true;
    nextLevelBtn.hidden = true;
    return;
  }
  if (!state.pendingNextWorldId) return;
  state.selectedWorldId = state.pendingNextWorldId;
  resetRunState(state.pendingNextWorldId);
  summaryPanel.hidden = true;
  nextLevelBtn.hidden = true;
});

characterSelect.addEventListener("change", () => {
  setMenuDialogue();
});

if (!localStorage.getItem(RESET_ONCE_KEY)) {
  localStorage.removeItem(SAVE_KEY);
  localStorage.setItem(RESET_ONCE_KEY, "1");
}
state.saveData = loadSave();
// Temporary testing override: grant all Annex outfits.
state.saveData.unlocks.outfitsUnlocked = ANNEX_OUTFITS.map((outfit) => outfit.id);
state.saveData.achievements.hottestInOffice = true;
state.saveData.achievements.whitestSneakers = true;
state.saveData.achievements.dontGoInThere = true;
// Temporary testing override: mark Save Pam quest complete.
state.saveData.missions.savePam.added = true;
state.saveData.missions.savePam.warehouseCleared = true;
state.saveData.missions.savePam.completed = true;
state.saveData.missions.savePam.sightingsBest = Math.max(state.saveData.missions.savePam.sightingsBest || 0, 5);
state.saveData.unlocks.pamFound = true;
if (!state.saveData.missions.captureStrangler.completed) {
  state.saveData.unlocks.jimDeskKey = false;
}
// Reset purchased powerups for clean testing.
state.saveData.upgrades = {};
// One-time wallet reset requested by user for the rebalanced economy.
if (!state.saveData.stats.economyV2ResetApplied) {
  state.saveData.currencies.schruteBucks = 0;
  state.saveData.currencies.stanleyNickels = 0;
  state.saveData.stats.economyV2ResetApplied = true;
}
syncDundieOutfitRewards();
persistSave();
setMenuDialogue();
updateUiForScene();
summaryPanel.hidden = true;
requestAnimationFrame(loop);
