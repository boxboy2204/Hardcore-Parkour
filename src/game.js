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
const saveImportInput = document.createElement("input");
saveImportInput.type = "file";
saveImportInput.accept = "application/json";
saveImportInput.style.display = "none";
document.body.appendChild(saveImportInput);

const SAVE_KEY = "hardcore_parkour_save_v1";
const RESET_ONCE_KEY = "hardcore_parkour_reset_once_v1";
const INVINCIBILITY_CHEAT_CODE = ["KeyB", "KeyE", "KeyE", "KeyT", "KeyS"];
const PURSUIT_REVEAL_DURATION = 7.4;
const PURSUIT_END_CARD_DURATION = 3.4;
const PURSUIT_END_TADA_PATH = "assets/freesound_community-tada-fanfare-a-6313.mp3";
const PURSUIT_START_SIREN_PATH = "assets/11325622-police-siren-sound-effect-240674.mp3";
const SHOP_CHACHING_PATH = "assets/chaching.mp3";
const SAVE_PROFILE_VERSION = 2;
const RUNNER_IDS = ["michael", "dwight", "andy"];
const LOADING_SCENE_DURATION = 1.45;
const PAUSE_QUOTES = [
  '"I am running away from my responsibilities. And it feels good."',
  '"Bears. Beets. Battlestar Galactica."',
  '"I am not superstitious... but I am a little stitious."',
  '"Sometimes I start a sentence and I do not know where it is going."',
];

const CHARACTER_PRESETS = {
  michael: {
    label: "Michael",
    color: "#151820",
    tieColor: "#f5f7fb",
    baseSpeed: 300,
    jumpPower: 720,
    styleGain: 1.8,
    maxJumps: 1,
    boostMul: 1.45,
    hardcoreInvincible: true,
    hpBonus: 0,
    hitboxScale: 1.0,
  },
  dwight: {
    label: "Dwight",
    color: "#b07a2f",
    tieColor: "#654531",
    baseSpeed: 300,
    jumpPower: 700,
    styleGain: 1.45,
    maxJumps: 1,
    boostMul: 1.0,
    hardcoreInvincible: false,
    hpBonus: 1,
    hitboxScale: 0.92,
  },
  andy: {
    label: "Andy",
    color: "#cbb79a",
    tieColor: "#a34353",
    baseSpeed: 305,
    jumpPower: 700,
    styleGain: 1.6,
    maxJumps: 2,
    boostMul: 1.0,
    hardcoreInvincible: false,
    hpBonus: 0,
    hitboxScale: 1.18,
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
  slideHoldThresholdSec: 0.24,
  slideInitialSpeed: 560,
  slideDeceleration: 720,
  slideScorePerObstacle: 80,
};
const SKARN_RINK_TOP = 222;

const COLLECTIBLE_SPAWN = {
  baseGap: 1.55,
  randGap: 1.2,
  minGap: 0.78,
};

const WORLDS = [
  { id: "bullpen", label: "The Bullpen", subtitle: "Desks, flying cats, Kevin's spilled chili" },
  { id: "warehouse", label: "The Warehouse", subtitle: "Paper piles, shelves, ladders" },
  { id: "streets", label: "Scranton Streets", subtitle: "Lightpoles, snowballs, hydrants, ice patches" },
  { id: "corporate", label: "NYC Corporate", subtitle: "Desks, folders, bystanders, chili spills" },
  { id: "pursuit", label: "Final Pursuit", subtitle: "Jump on the Strangler's car to catch him" },
];

const THEME_OBSTACLE_POOLS = {
  bullpen: ["desk", "angela_cat", "chili_spill"],
  warehouse: ["paper_pile", "shelf", "ladder"],
  streets: ["lightpole", "jim_snowball", "hydrant", "ice_patch"],
  corporate: ["desk", "jan_folder", "bystander", "chili_spill"],
  pursuit: ["folder", "paper_ream", "mung_beans"],
  skarn: ["hockey_puck"],
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
    row: "bottom",
  },
  {
    id: "parkour_shoes",
    name: "Parkour Shoes",
    description: "Next run only: +20 run speed.",
    currency: "stanleyNickels",
    cost: 36,
    row: "top",
  },
  {
    id: "chili_guard",
    name: "Anti-Chili Pads",
    description: "Stumble duration reduced by 28%.",
    currency: "stanleyNickels",
    cost: 30,
    row: "bottom",
  },
  {
    id: "mifflin_tape",
    name: "Mifflin Tape",
    description: "Each run: 50/50 chance for +2 HP or -2 HP.",
    currency: "stanleyNickels",
    cost: 26,
    row: "top",
  },
  {
    id: "desk_keycard",
    name: "Desk Keycard",
    description: "Loot +20%. Pickups spawn faster.",
    currency: "stanleyNickels",
    cost: 16,
    row: "bottom",
  },
  {
    id: "energy_mug",
    name: "World's Best Mug",
    description: "Longer HARDCORE speed boost.",
    currency: "stanleyNickels",
    cost: 34,
    row: "top",
  },
];

const ANNEX_OUTFITS = [
  {
    id: "cornell_fit",
    name: "The Cornell Fit",
    cost: 800,
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
      "Kelly: You look like a bad boy back from a corporate retreat... I love it. Here is 500 [SB]!",
  },
  {
    id: "date_mike",
    name: "Date Mike",
    cost: 800,
    character: "michael",
    requiredAchievement: null,
    tagline: "Michael only. Pool-hall vintage chaos.",
    kelly:
      "Kelly: You look like you are about to lose all your money at a pool hall. It is so vintage.",
  },
  {
    id: "wrong_fit",
    name: "Santa Suit",
    cost: 0,
    character: "all",
    requiredAchievement: "dontGoInThere",
    tagline: "Dundie reward. Holiday red coat, white trim, black belt, Santa chaos.",
    kelly:
      "Kelly: Ho-ho-holy wow. You look like Santa if he ran HR and ignored all boundaries.",
  },
  {
    id: "recyclops",
    name: "Recyclops",
    cost: 800,
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
    id: "hay_king",
    name: "Hay King",
    cost: 800,
    character: "dwight",
    requiredAchievement: null,
    tagline: "Dwight only. Brown harvest robe plus a hay crown fit for beet royalty.",
    kelly: "Kelly: This is farm-regal. Like if Homecoming met harvest season.",
  },
  {
    id: "two_headed_monster",
    name: "Two-Headed Monster",
    cost: 800,
    character: "michael",
    requiredAchievement: null,
    tagline: "Michael only. Double the head, double the drama, double the confusion.",
    kelly: "Kelly: Two heads? One icon. Honestly this is giving prestige horror.",
  },
  {
    id: "cat_andy",
    name: "Cat Andy",
    cost: 800,
    character: "andy",
    requiredAchievement: null,
    tagline: "Andy only. Leopard print fur fit, cat ears, and full tail energy.",
    kelly: "Kelly: Nard Cat is wildly committed and I support the chaos.",
  },
  {
    id: "andy_plumber",
    name: "Mafia Plumber",
    cost: 800,
    character: "andy",
    requiredAchievement: null,
    tagline: "Andy only. Red cap, gray work suit, and fake-union confidence.",
    kelly: "Kelly: You look like you fix pipes and start rumors at the same time.",
  },
  {
    id: "andy_construction",
    name: "Builder Bernard",
    cost: 800,
    character: "andy",
    requiredAchievement: null,
    tagline: "Andy only. Yellow hard hat, plaid shirt, and pure safety theater.",
    kelly: "Kelly: OSHA but make it preppy. This is deeply chaotic and I approve.",
  },
  {
    id: "dwight_deputy",
    name: "Volunteer Deputy",
    cost: 800,
    character: "dwight",
    requiredAchievement: null,
    tagline: "Dwight only. Black deputy uniform with badge and a ranger-style hat.",
    kelly: "Kelly: This is giving mall security final boss, in a good way.",
  },
  {
    id: "dwight_joker",
    name: "Dwoker",
    cost: 800,
    character: "dwight",
    requiredAchievement: null,
    tagline: "Dwight only. Purple coat, green hair, and unsettling grin energy.",
    kelly: "Kelly: Scary-clown couture. I hate it and love it equally.",
  },
  {
    id: "prison_mike",
    name: "Prison Mike",
    cost: 800,
    character: "michael",
    requiredAchievement: null,
    tagline: "Michael only. Purple bandana and hard-time motivational speaking.",
    kelly: "Kelly: Prison-core. Intense. A lot. Definitely a choice.",
  },
  {
    id: "scranton_penguins",
    name: "Scranton Penguins",
    cost: 800,
    character: "michael",
    requiredAchievement: null,
    tagline: "From Dwight.",
    kelly: "Kelly: Sports merch from Dwight is somehow both sweet and threatening.",
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
  {
    id: "strangler_hood",
    name: "Strangler's Hood",
    cost: 0,
    character: "all",
    requiredAchievement: null,
    requiredMission: "captureStrangler",
    tagline: "Final pursuit reward. Shadowy hood, alleyway menace energy.",
    kelly: "Kelly: This hood says mysterious, dramatic, and mildly lawsuit-adjacent.",
  },
];

const state = {
  scene: "characters",
  previousScene: "characters",
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
  collectibles: [],
  stars: 0,
  earnedSchruteBucks: 0,
  earnedStanleyNickels: 0,
  runCollectedSchruteBucks: 0,
  runCollectedStanleyNickels: 0,
  elapsedSec: 0,
  spawnTimerSec: 1.1,
  collectibleSpawnTimerSec: 0.9,
  screenShake: 0,
  theme: "bullpen",
  worldBannerText: "",
  worldBannerLeft: 0,
  tobyDistance: 100,
  pursuitEndPending: false,
  pursuitRevealLeft: 0,
  pursuitEndCardLeft: 0,
  pursuitEndCardCuePlayed: false,
  pursuitEndFade: 0,
  pursuitPost10Progress: 0,
  audioCtx: null,
  pursuitSirenAudio: null,
  bossMode: false,
  wasPausedBeforeBoss: false,
  loadingWorldId: null,
  loadingLeft: 0,
  loadingAnimSec: 0,
  loadingChantTimer: 0,
  loadingCalloutLeft: 0,
  loadingCalloutText: "",
  pauseMenuIndex: 0,
  pauseQuote: PAUSE_QUOTES[0],
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
  shopPromptBounds: [],
  shopConversation: null,
  shopPurchasePrompt: null,
  inventoryCards: [],
  settingsOptions: [],
  deskBounds: null,
  deskDrawerBounds: null,
  deskGoldenfaceBounds: null,
  deskPhotoBounds: null,
  deskDrawerOpen: false,
  deskPhotoViewerOpen: false,
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
  characterCards: [],
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
  jackpotRainLeft: 0,
  jackpotRainSpawnAcc: 0,
  jackpotRainDrops: [],
  skarnShotCooldownLeft: 0,
  skarnGoldenfaceHits: 0,
  skarnAimActive: false,
  skarnAimPhase: 0,
  skarnAimHoldSec: 0,
  runEquippedItems: [],
  cheatInvincible: false,
  cheatProgress: 0,
  reviewData: null,
  reviewAnimSec: 0,
  reviewAnimDuration: 2.6,
  uiFocus: {
    menuCard: 0,
    characterCard: 0,
    shopCard: 0,
    shopTalk: 0,
    shopPrompt: 0,
    inventoryCard: 0,
    settingsOption: 0,
    annexCard: 0,
    reviewButton: 0,
  },
  debugHitboxes: false,
  tutorialMode: false,
  tutorialStep: 0,
  fps: 60,
  fpsAvg: 60,
  fpsWorst: 60,
  fpsSamples: [],
  saveData: null,
  saveProfiles: null,
  activeRunnerId: "michael",
};

function drawTitleText(text, x, y, font = "bold 36px Trebuchet MS", color = "#ffe08f") {
  ctx.font = font;
  ctx.fillStyle = "rgba(8, 16, 30, 0.72)";
  ctx.fillText(text, x + 2, y + 2);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

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
      goldenfaceTakenFromDesk: false,
      shopUnlocked: false,
      topRowGelCleared: {},
      outfitsUnlocked: [],
      equippedOutfits: {
        michael: null,
        dwight: null,
        andy: null,
      },
    },
    upgrades: {},
    inventory: {
      items: {},
      loadout: [],
    },
    settings: {
      musicVolume: 0.65,
      sfxVolume: 0.85,
      screenShake: true,
      parkourAssist: false,
      showFps: true,
    },
    flags: {
      tutorialSeen: false,
    },
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

function normalizeSave(parsedInput) {
  try {
    const parsed = parsedInput || {};
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
        goldenfaceTakenFromDesk: Boolean(parsedUnlocks.goldenfaceTakenFromDesk),
        topRowGelCleared: { ...defaults.unlocks.topRowGelCleared, ...(parsedUnlocks.topRowGelCleared || {}) },
        equippedOutfits: {
          ...defaults.unlocks.equippedOutfits,
          ...parsedEquippedOutfits,
        },
      },
      upgrades: { ...defaults.upgrades, ...(parsed.upgrades || {}) },
      inventory: {
        ...defaults.inventory,
        ...(parsed.inventory || {}),
        items: { ...defaults.inventory.items, ...((parsed.inventory && parsed.inventory.items) || {}) },
        loadout: Array.isArray(parsed.inventory?.loadout)
          ? parsed.inventory.loadout.filter((id) => SHOP_ITEMS.some((item) => item.id === id))
          : [],
      },
      settings: { ...defaults.settings, ...(parsed.settings || {}) },
      flags: { ...defaults.flags, ...(parsed.flags || {}) },
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

function migrateLegacyUpgradesToInventory(save) {
  if (!save || !save.upgrades) return;
  if (!save.inventory) save.inventory = { items: {}, loadout: [] };
  if (!save.inventory.items) save.inventory.items = {};
  if (!Array.isArray(save.inventory.loadout)) save.inventory.loadout = [];
  if (!save.unlocks) save.unlocks = {};
  if (!save.unlocks.topRowGelCleared) save.unlocks.topRowGelCleared = {};

  for (const item of SHOP_ITEMS) {
    if (!save.upgrades[item.id]) continue;
    save.inventory.items[item.id] = Math.max(1, Number(save.inventory.items[item.id] || 0));
    if (item.row === "top") save.unlocks.topRowGelCleared[item.id] = true;
  }
  // Preserve old key for backward compatibility but stop using it for gameplay.
  save.upgrades = {};
}

function loadSave(runnerId = "michael") {
  const pickRunner = RUNNER_IDS.includes(runnerId) ? runnerId : "michael";
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      state.saveProfiles = {
        michael: createDefaultSave(),
        dwight: createDefaultSave(),
        andy: createDefaultSave(),
      };
      state.activeRunnerId = pickRunner;
      return state.saveProfiles[pickRunner];
    }

    const parsed = JSON.parse(raw);
    // New profiled format.
    if (parsed && parsed.version === SAVE_PROFILE_VERSION && parsed.profiles) {
      state.saveProfiles = {
        michael: normalizeSave(parsed.profiles.michael),
        dwight: normalizeSave(parsed.profiles.dwight),
        andy: normalizeSave(parsed.profiles.andy),
      };
      migrateLegacyUpgradesToInventory(state.saveProfiles.michael);
      migrateLegacyUpgradesToInventory(state.saveProfiles.dwight);
      migrateLegacyUpgradesToInventory(state.saveProfiles.andy);
      state.activeRunnerId = RUNNER_IDS.includes(parsed.currentRunner) ? parsed.currentRunner : pickRunner;
      return state.saveProfiles[pickRunner];
    }

    // Legacy single-save migration: move all existing progress to Michael.
    state.saveProfiles = {
      michael: normalizeSave(parsed),
      dwight: createDefaultSave(),
      andy: createDefaultSave(),
    };
    migrateLegacyUpgradesToInventory(state.saveProfiles.michael);
    state.activeRunnerId = "michael";
    return state.saveProfiles[pickRunner];
  } catch {
    state.saveProfiles = {
      michael: createDefaultSave(),
      dwight: createDefaultSave(),
      andy: createDefaultSave(),
    };
    state.activeRunnerId = pickRunner;
    return state.saveProfiles[pickRunner];
  }
}

function persistSave() {
  if (!state.saveProfiles) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state.saveData));
    return;
  }
  if (state.activeRunnerId && state.saveData) {
    state.saveProfiles[state.activeRunnerId] = state.saveData;
  }
  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({
      version: SAVE_PROFILE_VERSION,
      currentRunner: state.activeRunnerId,
      profiles: state.saveProfiles,
    })
  );
}

function switchRunnerProfile(runnerId) {
  const nextRunner = RUNNER_IDS.includes(runnerId) ? runnerId : "michael";
  if (!state.saveProfiles) {
    state.saveData = loadSave(nextRunner);
    state.activeRunnerId = nextRunner;
    persistSave();
    return;
  }
  if (state.activeRunnerId && state.saveData) state.saveProfiles[state.activeRunnerId] = state.saveData;
  if (!state.saveProfiles[nextRunner]) state.saveProfiles[nextRunner] = createDefaultSave();
  state.activeRunnerId = nextRunner;
  state.saveData = state.saveProfiles[nextRunner];
  syncDundieOutfitRewards();
  syncPostKeyMissionRewards();
  persistSave();
}

function ensureAudioContext() {
  if (state.audioCtx) return state.audioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  state.audioCtx = new Ctx();
  return state.audioCtx;
}

function getSettings() {
  return state.saveData?.settings || createDefaultSave().settings;
}

function getSfxVolume() {
  return Math.max(0, Math.min(1, Number(getSettings().sfxVolume ?? 0.85)));
}

function getMusicVolume() {
  return Math.max(0, Math.min(1, Number(getSettings().musicVolume ?? 0.65)));
}

function playThemeSwitchCue() {
  const audioCtx = ensureAudioContext();
  if (!audioCtx) return;
  const sfx = getSfxVolume();
  if (sfx <= 0) return;
  if (audioCtx.state === "suspended") audioCtx.resume();

  const now = audioCtx.currentTime;
  const notes = [370, 494];
  notes.forEach((frequency, idx) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(frequency, now + idx * 0.09);
    gain.gain.setValueAtTime(0.0001, now + idx * 0.09);
    gain.gain.exponentialRampToValueAtTime(0.11 * sfx, now + idx * 0.09 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.11);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now + idx * 0.09);
    osc.stop(now + idx * 0.09 + 0.12);
  });
}

function playLoadingChantCue() {
  const audioCtx = ensureAudioContext();
  if (!audioCtx) return;
  const sfx = getSfxVolume();
  if (sfx <= 0) return;
  if (audioCtx.state === "suspended") audioCtx.resume();
  const now = audioCtx.currentTime;
  const hits = [
    { f: 220, t: 0.0, d: 0.08, v: 0.06 },
    { f: 220, t: 0.12, d: 0.08, v: 0.06 },
    { f: 293.66, t: 0.24, d: 0.14, v: 0.08 },
  ];
  hits.forEach((hit) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(hit.f, now + hit.t);
    gain.gain.setValueAtTime(0.0001, now + hit.t);
    gain.gain.exponentialRampToValueAtTime(hit.v * sfx, now + hit.t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + hit.t + hit.d);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now + hit.t);
    osc.stop(now + hit.t + hit.d + 0.01);
  });
}

function playChaChingCue() {
  const fallbackSynth = () => {
    const audioCtx = ensureAudioContext();
    if (!audioCtx) return;
    const sfx = getSfxVolume();
    if (sfx <= 0) return;
    if (audioCtx.state === "suspended") audioCtx.resume();

    const now = audioCtx.currentTime;
    const notes = [
      { f: 740, t: 0.0, d: 0.09, type: "triangle", level: 0.08 },
      { f: 988, t: 0.08, d: 0.11, type: "triangle", level: 0.09 },
      { f: 1244, t: 0.18, d: 0.18, type: "square", level: 0.1 },
    ];
    notes.forEach((n) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = n.type;
      osc.frequency.setValueAtTime(n.f, now + n.t);
      gain.gain.setValueAtTime(0.0001, now + n.t);
      gain.gain.exponentialRampToValueAtTime(n.level * sfx, now + n.t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.t + n.d);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.d + 0.01);
    });
  };

  try {
    const audio = new Audio(SHOP_CHACHING_PATH);
    audio.volume = 0.95 * getSfxVolume();
    audio.currentTime = 0;
    audio.play().catch(() => fallbackSynth());
  } catch {
    fallbackSynth();
  }
}

function openPauseMenu() {
  state.paused = true;
  state.pauseMenuIndex = 0;
  state.pauseQuote = PAUSE_QUOTES[Math.floor(Math.random() * PAUSE_QUOTES.length)];
}

function requestBossFullscreen() {
  try {
    if (document.fullscreenElement) return;
    const el = document.documentElement;
    if (el?.requestFullscreen) el.requestFullscreen().catch(() => {});
  } catch {
    // Ignore fullscreen failures.
  }
}

function exitBossFullscreen() {
  try {
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  } catch {
    // Ignore fullscreen failures.
  }
}

function toggleBossMode() {
  state.bossMode = !state.bossMode;
  if (state.bossMode) {
    requestBossFullscreen();
    summaryPanel.hidden = true;
    if (state.scene === "run" && !state.gameOver) {
      state.wasPausedBeforeBoss = state.paused;
      state.paused = true;
    }
    return;
  }
  exitBossFullscreen();
  if (state.scene === "run" && !state.gameOver) state.paused = state.wasPausedBeforeBoss;
}

function stopPursuitSirenLoop() {
  if (!state.pursuitSirenAudio) return;
  try {
    state.pursuitSirenAudio.pause();
    state.pursuitSirenAudio.currentTime = 0;
  } catch {
    // Ignore cleanup failures from browser audio backends.
  }
  state.pursuitSirenAudio = null;
}

function playPursuitStartSirenCue() {
  stopPursuitSirenLoop();
  try {
    const audio = new Audio(PURSUIT_START_SIREN_PATH);
    audio.volume = 0.15 * getMusicVolume(); // Quiet, distant siren bed.
    audio.loop = true;
    audio.currentTime = 0;
    state.pursuitSirenAudio = audio;
    audio.play().catch(() => {
      if (state.pursuitSirenAudio === audio) state.pursuitSirenAudio = null;
      playChaChingCue();
    });
  } catch {
    playChaChingCue();
  }
}

function playStranglerRevealCue() {
  const audioCtx = ensureAudioContext();
  if (!audioCtx) return;
  const sfx = getSfxVolume();
  if (sfx <= 0) return;
  if (audioCtx.state === "suspended") audioCtx.resume();

  const now = audioCtx.currentTime;
  const notes = [220, 277.18, 329.63, 415.3];
  notes.forEach((frequency, idx) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(frequency, now + idx * 0.08);
    gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.1 * sfx, now + idx * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 0.22);
  });
}

function playPursuitEndBumBumCue() {
  const fallbackSynth = () => {
    const audioCtx = ensureAudioContext();
    if (!audioCtx) return;
    const sfx = getSfxVolume();
    if (sfx <= 0) return;
    if (audioCtx.state === "suspended") audioCtx.resume();
    const now = audioCtx.currentTime;
    const hits = [
      { f: 523.25, t: 0.0, d: 0.18, level: 0.08, type: "triangle" },
      { f: 659.25, t: 0.11, d: 0.2, level: 0.09, type: "triangle" },
      { f: 783.99, t: 0.21, d: 0.28, level: 0.1, type: "triangle" },
      { f: 1046.5, t: 0.28, d: 0.42, level: 0.11, type: "square" },
    ];
    hits.forEach((hit) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = hit.type;
      osc.frequency.setValueAtTime(hit.f, now + hit.t);
      gain.gain.setValueAtTime(0.0001, now + hit.t);
      gain.gain.exponentialRampToValueAtTime(hit.level * sfx, now + hit.t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + hit.t + hit.d);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + hit.t);
      osc.stop(now + hit.t + hit.d + 0.02);
    });
  };

  try {
    const audio = new Audio(PURSUIT_END_TADA_PATH);
    audio.volume = 0.95 * getSfxVolume();
    audio.currentTime = 0;
    audio.play().catch(() => fallbackSynth());
  } catch {
    fallbackSynth();
  }
}

function playCutsceneSingingNote(frequency, durationSec = 0.28) {
  const audioCtx = ensureAudioContext();
  if (!audioCtx) return;
  const music = getMusicVolume();
  if (music <= 0) return;
  if (audioCtx.state === "suspended") audioCtx.resume();

  const now = audioCtx.currentTime;
  const hold = Math.max(0.08, durationSec * 0.85);
  const releaseEnd = Math.max(0.1, durationSec);
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08 * music, now + 0.02);
  gain.gain.setValueAtTime(0.08 * music, now + hold);
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
  const music = getMusicVolume();
  if (music <= 0) return;
  if (audioCtx.state === "suspended") audioCtx.resume();
  const now = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(level * music, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.08, durationSec));
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + Math.max(0.09, durationSec) + 0.01);
}

function playLevelNote(frequency, durationSec, type, level) {
  const audioCtx = ensureAudioContext();
  if (!audioCtx) return;
  const music = getMusicVolume();
  if (music <= 0) return;
  if (audioCtx.state === "suspended") audioCtx.resume();
  const now = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(level * music, now + 0.01);
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
    !(state.runWorldId === "pursuit" && state.pursuitEndPending) &&
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
  } else if (state.theme === "skarn") {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GAME.floorTop);
    skyGrad.addColorStop(0, "#101f45");
    skyGrad.addColorStop(1, "#1f3e78");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, GAME.floorTop);

    // Arena ceiling truss + lights.
    ctx.fillStyle = "#1a2d56";
    ctx.fillRect(0, 18, canvas.width, 8);
    ctx.fillRect(0, 52, canvas.width, 6);
    for (let i = 0; i < 16; i += 1) {
      const lx = i * 64 - ((xShift * 0.18) % 64);
      ctx.fillStyle = "rgba(210, 234, 255, 0.72)";
      ctx.fillRect(lx + 10, 24, 10, 3);
      ctx.fillRect(lx + 10, 56, 10, 2);
    }

    // Distant crowd stands.
    ctx.fillStyle = "#1d315f";
    ctx.fillRect(0, 86, canvas.width, 96);
    for (let i = 0; i < 140; i += 1) {
      const px = (i * 13 + Math.floor(i / 3) * 7) % canvas.width;
      const py = 92 + ((i * 9) % 84);
      ctx.fillStyle = i % 5 === 0 ? "#5d84c8" : i % 3 === 0 ? "#7ba4df" : "#314c82";
      ctx.fillRect(px, py, 2, 2);
    }

    // Far glass boards around rink.
    ctx.fillStyle = "#d2ebff";
    ctx.fillRect(0, 208, canvas.width, 4);
    ctx.fillStyle = "#9cc1e6";
    ctx.fillRect(0, 212, canvas.width, 8);
    for (let i = 0; i < 12; i += 1) {
      const sx = i * 84 - ((xShift * 0.72) % 84);
      ctx.fillStyle = "rgba(190,220,248,0.62)";
      ctx.fillRect(sx + 12, 212, 2, 30);
    }
  } else {
    state.menuDialogue = `${selected.label} gets a cappella hype. ${quip}`;
  }
}

function ownsUpgrade(id) {
  if (state.scene === "run") return Array.isArray(state.runEquippedItems) && state.runEquippedItems.includes(id);
  return getInventoryCount(id) > 0;
}

function getInventoryCount(itemId) {
  return Math.max(0, Number(state.saveData?.inventory?.items?.[itemId] || 0));
}

function isItemEquipped(itemId) {
  return Array.isArray(state.saveData?.inventory?.loadout) && state.saveData.inventory.loadout.includes(itemId);
}

function toggleInventoryEquip(itemId) {
  if (!state.saveData?.inventory) return;
  if (!Array.isArray(state.saveData.inventory.loadout)) state.saveData.inventory.loadout = [];
  const loadout = state.saveData.inventory.loadout;
  const idx = loadout.indexOf(itemId);
  if (idx !== -1) {
    loadout.splice(idx, 1);
    persistSave();
    showMissionToast(`${SHOP_ITEMS.find((i) => i.id === itemId)?.name || "Item"} unequipped.`);
    return;
  }
  if (getInventoryCount(itemId) <= 0) return;
  loadout.push(itemId);
  persistSave();
  showMissionToast(`${SHOP_ITEMS.find((i) => i.id === itemId)?.name || "Item"} equipped for next run.`);
}

function consumeLoadoutForRun() {
  if (!state.saveData?.inventory) return [];
  if (!state.saveData.inventory.items) state.saveData.inventory.items = {};
  if (!Array.isArray(state.saveData.inventory.loadout)) state.saveData.inventory.loadout = [];

  const consumed = [];
  const nextLoadout = [];
  for (const itemId of state.saveData.inventory.loadout) {
    if (!SHOP_ITEMS.some((item) => item.id === itemId)) continue;
    const count = getInventoryCount(itemId);
    if (count <= 0) continue;
    state.saveData.inventory.items[itemId] = count - 1;
    consumed.push(itemId);
    // Auto-unequip after use. Re-buy is required to equip again.
    if (state.saveData.inventory.items[itemId] > 0) nextLoadout.push(itemId);
  }
  state.saveData.inventory.loadout = nextLoadout;
  if (consumed.length > 0) persistSave();
  return consumed;
}

function formatSchruteBucks(amount) {
  return `${amount} Schrute ${amount === 1 ? "Buck" : "Bucks"}`;
}

function formatStanleyNickels(amount) {
  return `${amount} Stanley ${amount === 1 ? "Nickel" : "Nickels"}`;
}

function shopPriceLabel(item) {
  return formatStanleyNickels(item.cost);
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

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function adjustSettingByIndex(index, dir) {
  const s = getSettings();
  if (index === 0) s.musicVolume = clamp01((s.musicVolume || 0) + dir * 0.05);
  else if (index === 1) s.sfxVolume = clamp01((s.sfxVolume || 0) + dir * 0.05);
  else if (index === 2) s.screenShake = dir > 0 ? true : dir < 0 ? false : !s.screenShake;
  else if (index === 3) s.parkourAssist = dir > 0 ? true : dir < 0 ? false : !s.parkourAssist;
  else if (index === 4) s.showFps = dir > 0 ? true : dir < 0 ? false : !s.showFps;
  persistSave();
}

function exportSaveToFile() {
  if (!state.saveProfiles) return;
  const payload = {
    version: SAVE_PROFILE_VERSION,
    currentRunner: state.activeRunnerId,
    profiles: state.saveProfiles,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "hardcore-parkour-save.json";
  a.click();
  URL.revokeObjectURL(url);
  showMissionToast("Save exported.");
}

function importSaveFromFile() {
  saveImportInput.value = "";
  saveImportInput.click();
}

function renderReviewSummaryText() {
  if (!state.reviewData) return;
  const progress = Math.max(0, Math.min(1, state.reviewAnimSec / state.reviewAnimDuration));
  const ease = 1 - Math.pow(1 - progress, 3);
  const shownSb = Math.round(state.reviewData.prevSb + (state.reviewData.totalSb - state.reviewData.prevSb) * ease);
  const shownSn = Math.round(state.reviewData.prevSn + (state.reviewData.totalSn - state.reviewData.prevSn) * ease);
  const shownEarnedSb = Math.round(state.reviewData.earnedSb * ease);
  const shownEarnedSn = Math.round(state.reviewData.earnedSn * ease);
  summaryText.textContent = `${state.reviewData.runner} finished ${state.reviewData.world} with ${
    state.reviewData.stars
  }/5 stars. Style ${state.reviewData.style}, Best Hardcore chain ${
    state.reviewData.bestChain
  }. Rewards: +${formatSchruteBucks(shownEarnedSb)}, +${formatStanleyNickels(
    shownEarnedSn
  )}. Total Wallet: ${formatSchruteBucks(shownSb)} / ${formatStanleyNickels(shownSn)}. ${
    state.reviewData.endingLine
  }${state.reviewData.questEndingLine ? ` ${state.reviewData.questEndingLine}` : ""}`;
}

function advanceCheatCode(code) {
  const expected = INVINCIBILITY_CHEAT_CODE[state.cheatProgress];
  if (code === expected) {
    state.cheatProgress += 1;
    if (state.cheatProgress >= INVINCIBILITY_CHEAT_CODE.length) {
      state.cheatProgress = 0;
      state.cheatInvincible = !state.cheatInvincible;
      showMissionToast(
        state.cheatInvincible
          ? "Cheat ON: No injuries, all HARDCORE yells land, and every DVD bounce pays out."
          : "Cheat OFF: Injury is back on."
      );
    }
    return;
  }
  state.cheatProgress = code === INVINCIBILITY_CHEAT_CODE[0] ? 1 : 0;
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

  if (missions.captureStrangler?.completed && !state.saveData.unlocks.outfitsUnlocked.includes("strangler_hood")) {
    state.saveData.unlocks.outfitsUnlocked.push("strangler_hood");
    changed = true;
  }

  if (changed) persistSave();
}

function showAnnexMessage(text) {
  state.annexMessage = text;
  state.annexMessageLeft = 3.6;
}

function awardCornerTvJackpot() {
  state.saveData.currencies.schruteBucks += 250;
  state.saveData.currencies.stanleyNickels += 50;
  state.cornerLogoRewardCooldown = 0.8;
  state.jackpotRainLeft = 2.8;
  state.jackpotRainSpawnAcc = 0;
  for (let i = 0; i < 64; i += 1) {
    state.jackpotRainDrops.push({
      type: Math.random() < 0.58 ? "schrute_buck" : "stanley_nickel",
      x: Math.random() * canvas.width,
      y: -Math.random() * 180,
      vy: 220 + Math.random() * 230,
      spin: Math.random() * Math.PI * 2,
      spinRate: 2 + Math.random() * 4,
      size: 9 + Math.random() * 5,
    });
  }
  persistSave();
  showMissionToast("Corner hit! +250 [SB] and +50 [SN] from the office TV.");
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

  // Count visible corner contacts even when edge bounces happen on adjacent frames.
  const edgeTol = 1;
  const atXEdge = state.cornerLogoX <= edgeTol || state.cornerLogoX >= maxX - edgeTol;
  const atYEdge = state.cornerLogoY <= edgeTol || state.cornerLogoY >= maxY - edgeTol;
  const cornerContact = (hitX || hitY) && atXEdge && atYEdge;
  if (state.cheatInvincible && (hitX || hitY) && state.saveData) {
    awardCornerTvJackpot();
  } else if (cornerContact) {
    // Keep jackpot rare: 1 in 100 corner contacts.
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

function getCharacterAbilityText(runnerId = getRunnerId()) {
  if (runnerId === "michael") return "Michael Special: Longer HARDCORE speed boost + invincible during boost.";
  if (runnerId === "andy") return "Andy Special: Double jump.";
  if (runnerId === "dwight") return "Dwight Special: Start each level with +1 HP.";
  return "No special ability.";
}

function ownsOutfit(id) {
  return state.saveData.unlocks.outfitsUnlocked.includes(id);
}

function isOutfitUsableByRunner(outfit, runnerId = getRunnerId()) {
  return outfit.character === "all" || outfit.character === runnerId;
}

function hasOutfitAchievementRequirement(outfit) {
  if (outfit.requiredAchievement && !state.saveData.achievements[outfit.requiredAchievement]) return false;
  if (outfit.requiredMission && !state.saveData.missions?.[outfit.requiredMission]?.completed) return false;
  return true;
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
    } else if (outfit.requiredMission) {
      showAnnexMessage("Kelly: Finish the Final Pursuit and catch the Strangler to unlock that one.");
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
        showAnnexMessage("Kelly: No [SB], no boutique magic. This is not a charity runway.");
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
  state.shopPurchasePrompt = null;
  const capture = state.saveData.missions.captureStrangler;
  if (capture.completed) {
    state.shopConversation = {
      actor: "jim",
      step: "post_choice",
      text: "Jim: You actually caught the Strangler. No mission this time, just office-level conversation.",
    };
    return;
  }
  state.shopConversation = {
    actor: "jim",
    step: "choice",
    text: "Jim: Nice try. Those top-row items are in witness protection.",
  };
}

function handleJimConversationClick(choiceId) {
  if (!state.shopConversation) return;

  if (state.shopConversation.step === "post_choice") {
    if (choiceId === "ask_prank") {
      state.shopConversation = {
        actor: "jim",
        step: "post_reply",
        text: "Jim: Best prank? Putting Dwight's stapler in Jell-O. Timeless. Like jazz, but petty.",
      };
      return;
    }
    if (choiceId === "ask_desk") {
      state.shopConversation = {
        actor: "jim",
        step: "post_reply",
        text:
          "Jim: Desk key still opens my desk. If you find anything weird in there, it is definitely not my handwriting.",
      };
      return;
    }
    state.shopConversation = null;
    return;
  }

  if (state.shopConversation.step === "post_reply") {
    state.shopConversation = null;
    return;
  }

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
      const warehouseWorldIdx = WORLDS.findIndex((w) => w.id === "warehouse");
      if (
        warehouseWorldIdx !== -1 &&
        state.saveData.unlockedWorldIndex > warehouseWorldIdx &&
        !state.saveData.missions.savePam.completed
      ) {
        state.saveData.missions.savePam.warehouseCleared = true;
      }
      persistSave();
      showMissionToast('Mission Added: "Save Pam"');
    }
    state.shopConversation = null;
  }
}

function startPamConversation() {
  if (state.shopForeheadStare || !state.saveData?.missions?.savePam?.completed) return;
  state.shopPurchasePrompt = null;
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
      const alreadyCaughtStrangler = state.saveData.unlocks.outfitsUnlocked.includes("strangler_hood");
      if (alreadyCaughtStrangler) {
        capture.completed = true;
      }
      persistSave();
      if (alreadyCaughtStrangler) {
        showMissionToast("Mission Auto-Completed: Capture The Strangler");
      } else {
        showMissionToast("New Mission: Capture The Strangler");
      }
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
  const topRowUnlocked = Boolean(state.saveData?.missions?.savePam?.completed);

  if (state.shopForeheadStare) {
    showShopMessage("Jim is still staring at your forehead. Leave the shop to break it.", "#ffb4a7");
    return;
  }

  if (item.row === "top" && !topRowUnlocked) {
    showShopMessage("Jim: top row stays in Jell-O until you find Pam.", "#ffb4a7");
    return;
  }

  const stanleyWallet = state.saveData.currencies.stanleyNickels;
  if (stanleyWallet < item.cost) {
    if (state.saveData.currencies.schruteBucks > 0) {
      state.shopForeheadStare = true;
      showShopMessage("You offered [SB]. Jim locks onto your forehead in silence.", "#ff9ea5");
      return;
    }
    showShopMessage("Not enough [SN].", "#ffb4a7");
    return;
  }

  state.saveData.currencies.stanleyNickels -= item.cost;
  if (!state.saveData.inventory) state.saveData.inventory = { items: {}, loadout: [] };
  if (!state.saveData.inventory.items) state.saveData.inventory.items = {};
  state.saveData.inventory.items[item.id] = getInventoryCount(item.id) + 1;
  if (item.row === "top") {
    if (!state.saveData.unlocks.topRowGelCleared) state.saveData.unlocks.topRowGelCleared = {};
    state.saveData.unlocks.topRowGelCleared[item.id] = true;
  }

  if (item.id === "desk_keycard") {
    state.saveData.unlockedWorldIndex = Math.min(WORLDS.length - 1, state.saveData.unlockedWorldIndex + 1);
  }

  persistSave();
  playChaChingCue();
  showShopMessage(`Purchased ${item.name}. Added to inventory.`, "#d3ffbf");
}

function openShopItemPrompt(itemId) {
  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!item) return;
  const topRowUnlocked = Boolean(state.saveData?.missions?.savePam?.completed);
  const count = getInventoryCount(item.id);
  const lockedByKey = item.row === "top" && !topRowUnlocked;
  const canAfford = state.saveData.currencies.stanleyNickels >= item.cost;
  state.shopPurchasePrompt = {
    itemId: item.id,
    name: item.name,
    description: item.description,
    cost: item.cost,
    count,
    lockedByKey,
    canAfford: canAfford && !lockedByKey,
  };
  state.uiFocus.shopPrompt = 0;
}

function handleShopPromptClick(choiceId) {
  const prompt = state.shopPurchasePrompt;
  if (!prompt) return;
  if (choiceId === "cancel") {
    state.shopPurchasePrompt = null;
    return;
  }
  if (choiceId === "buy" && prompt.canAfford) {
    tryBuyShopItem(prompt.itemId);
    state.shopPurchasePrompt = null;
  }
}

function switchScene(sceneId) {
  const leavingShop = state.scene === "shop" && sceneId !== "shop";
  const leavingCutscene = state.scene === "cutscene" && sceneId !== "cutscene";
  const leavingRun = state.scene === "run" && sceneId !== "run";
  state.previousScene = state.scene;
  state.scene = sceneId;
  state.paused = false;
  summaryPanel.hidden = true;
  nextLevelBtn.hidden = true;
  if (leavingShop) state.shopForeheadStare = false;
  if (sceneId !== "shop") {
    state.shopConversation = null;
    state.shopPurchasePrompt = null;
  }
  if (sceneId === "desk") {
    state.deskDrawerOpen = false;
    state.deskPhotoViewerOpen = false;
  }
  if (sceneId === "cutscene") {
    state.cutsceneTimeSec = 0;
    state.cutsceneFadeLeft = 0.85;
    state.cutsceneSongStep = 0;
    state.cutsceneSongTimer = 0.02;
    state.cutsceneBbCount = 0;
    state.cutsceneLyricLine = 0;
  }
  if (sceneId === "menu") state.uiFocus.menuCard = Math.max(0, WORLDS.findIndex((w) => w.id === state.selectedWorldId));
  if (sceneId === "characters") {
    const idx = RUNNER_IDS.indexOf(getRunnerId());
    state.uiFocus.characterCard = idx === -1 ? 0 : idx;
  }
  if (sceneId === "shop") {
    state.uiFocus.shopCard = 0;
    state.uiFocus.shopTalk = 0;
    state.uiFocus.shopPrompt = 0;
  }
  if (sceneId === "inventory") state.uiFocus.inventoryCard = 0;
  if (sceneId === "settings") state.uiFocus.settingsOption = 0;
  if (sceneId === "annex") state.uiFocus.annexCard = 0;
  if (sceneId === "run") state.uiFocus.reviewButton = 0;
  if (leavingRun) stopPursuitSirenLoop();
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
  } else if (state.scene === "characters") {
    startBtn.textContent = "Back To Menu";
    retryBtn.hidden = true;
  } else if (state.scene === "missions") {
    startBtn.textContent = "Back";
    retryBtn.hidden = true;
  } else if (state.scene === "loading") {
    startBtn.textContent = "Loading...";
    retryBtn.hidden = true;
  } else if (state.scene === "tutorial") {
    startBtn.textContent = "Start Tutorial";
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
  } else if (state.scene === "inventory") {
    startBtn.textContent = "Back To Menu";
    retryBtn.hidden = true;
  } else if (state.scene === "settings") {
    startBtn.textContent = "Back To Menu";
    retryBtn.hidden = true;
  } else if (state.scene === "desk") {
    startBtn.textContent = "Back To Menu";
    retryBtn.hidden = true;
  } else {
    startBtn.textContent = "Back To Menu";
    retryBtn.textContent = "Go Shop";
    retryBtn.hidden = false;
  }
}

function startTutorialRun() {
  if (!state.saveData.flags) state.saveData.flags = {};
  state.saveData.flags.tutorialSeen = true;
  persistSave();
  state.selectedWorldId = "bullpen";
  resetRunState("bullpen", true);
}

function resetRunState(worldId = state.selectedWorldId, tutorial = false) {
  stopPursuitSirenLoop();
  state.runEquippedItems = [];
  state.tutorialMode = tutorial;
  state.tutorialStep = 0;
  state.scene = "loading";
  state.loadingWorldId = worldId;
  state.loadingLeft = LOADING_SCENE_DURATION;
  state.loadingAnimSec = 0;
  state.loadingChantTimer = 0.02;
  state.loadingCalloutLeft = LOADING_SCENE_DURATION;
  state.loadingCalloutText = "HUP! HUP! HARDCORE!";
  updateUiForScene();
}

function startRunStateNow(worldId = state.selectedWorldId) {
  const selectedPreset = CHARACTER_PRESETS[characterSelect.value];
  const preset = worldId === "skarn" ? CHARACTER_PRESETS.michael : selectedPreset;
  const savePam = state.saveData.missions.savePam;
  const warehouseWorldIdx = WORLDS.findIndex((w) => w.id === "warehouse");
  if (
    savePam.added &&
    !savePam.completed &&
    !savePam.warehouseCleared &&
    warehouseWorldIdx !== -1 &&
    state.saveData.unlockedWorldIndex > warehouseWorldIdx
  ) {
    // Warehouse already cleared before mission was added: start Pam mode immediately.
    savePam.warehouseCleared = true;
    persistSave();
  }
  const pamQuestRun = worldId === "warehouse" && savePam.added && !savePam.completed && savePam.warehouseCleared;
  state.scene = "run";
  state.running = true;
  state.paused = false;
  state.gameOver = false;
  summaryPanel.classList.remove("review-controls-only");
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
  state.collectibles = [];
  state.stars = 0;
  state.earnedSchruteBucks = 0;
  state.earnedStanleyNickels = 0;
  state.runCollectedSchruteBucks = 0;
  state.runCollectedStanleyNickels = 0;
  state.elapsedSec = 0;
  state.spawnTimerSec = 0.7;
  state.collectibleSpawnTimerSec = 0.85;
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
  state.pursuitEndPending = false;
  state.pursuitRevealLeft = 0;
  state.pursuitEndCardLeft = 0;
  state.pursuitEndCardCuePlayed = false;
  state.pursuitEndFade = 0;
  state.pursuitPost10Progress = 0;
  state.reviewData = null;
  state.reviewAnimSec = 0;
  state.obstacles = [];
  state.skarnShotCooldownLeft = 0;
  state.skarnGoldenfaceHits = 0;
  state.skarnAimActive = false;
  state.skarnAimPhase = 0;
  state.skarnAimHoldSec = 0;
  state.runEquippedItems = consumeLoadoutForRun();

  if (pamQuestRun) state.worldBannerText = "Warehouse: Save Pam";

  const hpBonus = state.runEquippedItems.includes("gel_shield") ? 1 : 0;
  const characterHpBonus = preset.hpBonus || 0;
  const speedBonus = state.runEquippedItems.includes("parkour_shoes") ? 20 : 0;
  const stumbleTuning = state.runEquippedItems.includes("chili_guard") ? 0.72 : 1;
  const tapeHpSwing = state.runEquippedItems.includes("mifflin_tape") ? (Math.random() < 0.5 ? 2 : -2) : 0;
  const boostTuning = (state.runEquippedItems.includes("energy_mug") ? 1.2 : 1) * (preset.boostMul || 1);
  const keycardLootTuning = state.runEquippedItems.includes("desk_keycard") ? 1.2 : 1;
  const keycardSpawnTuning = state.runEquippedItems.includes("desk_keycard") ? 0.82 : 1;

  state.player = {
    preset,
    x: worldId === "pursuit" ? 90 : 180,
    y: GAME.groundY,
    width: 42,
    height: 62,
    vy: 0,
    grounded: true,
    jumpsUsed: 0,
    hp: Math.max(1, 4 + hpBonus + characterHpBonus + tapeHpSwing),
  };
  state.player.runtimeSpeedBonus = speedBonus;
  state.player.runtimeStumbleMul = stumbleTuning;
  state.player.runtimeStyleMul = 1;
  state.player.runtimeBoostMul = boostTuning;
  state.player.runtimeHardcoreInvincible = Boolean(preset.hardcoreInvincible);
  state.player.runtimeMaxJumps = preset.maxJumps || 1;
  state.player.runtimeLootValueMul = keycardLootTuning;
  state.player.runtimeCollectibleSpawnMul = keycardSpawnTuning;
  state.collectibleSpawnTimerSec *= keycardSpawnTuning;
  if (tapeHpSwing !== 0) {
    if (tapeHpSwing > 0) addFloatingText("Mifflin Tape: +2 HP!", state.player.x - 8, state.player.y - 52, "#bfffcf");
    else addFloatingText("Mifflin Tape: -2 HP!", state.player.x - 8, state.player.y - 52, "#ffb2a5");
  }

  state.saveData.stats.lifetimeRuns += 1;
  persistSave();
  playThemeSwitchCue();
  if (worldId === "pursuit") playPursuitStartSirenCue();
  else stopPursuitSirenLoop();
  updateUiForScene();
}

function addFloatingText(text, x, y, color) {
  if (state.floatingText.length > 120) state.floatingText.splice(0, state.floatingText.length - 120);
  state.floatingText.push({ text, x, y, color, age: 0, ttl: 0.8 });
}

function addHitParticles(x, y, color) {
  if (state.particles.length > 420) return;
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

function syncStyleToScore() {
  state.style = state.score;
}

function getPursuitCarPosition() {
  return {
    x: canvas.width - 290,
    y: GAME.floorTop - 72,
  };
}

function getPursuitBoardZone() {
  const car = getPursuitCarPosition();
  return {
    x: car.x + 154,
    y: car.y + 10,
    width: 44,
    height: 14,
  };
}

function canPromptPursuitJump() {
  if (state.runWorldId !== "pursuit" || state.pursuitEndPending || state.multiplier < 10 || !state.player) return false;
  const zone = getPursuitBoardZone();
  const px = state.player.x + state.player.width * 0.5;
  return px >= zone.x - 52;
}

function getSkarnGoldenfacePose() {
  const baseX = canvas.width - 164;
  const baseY = GAME.floorTop - 6;
  const bob = Math.sin(state.worldTimeSec * 2.8) * 1.4;
  const shotPhase = (state.worldTimeSec * 2.35) % 1;
  const firing = shotPhase < 0.18;
  const recoil = firing ? Math.sin((shotPhase / 0.18) * Math.PI) * 2.4 : 0;
  const armY = baseY - 33 + bob + recoil * 0.25;
  const muzzleX = baseX - 20 + recoil;
  const muzzleY = armY + 2;
  return { baseX, baseY, bob, firing, recoil, armY, muzzleX, muzzleY };
}

function getSkarnGoldenfaceHitbox() {
  const pose = getSkarnGoldenfacePose();
  return {
    x: pose.baseX + 2,
    y: pose.baseY - 64 + pose.bob,
    width: 36,
    height: 54,
  };
}

function getSkarnPlayerGunPose() {
  if (!state.player) return { x: 0, y: 0 };
  const player = state.player;
  const slideHeight = state.slideActive ? 22 : 0;
  const visualHeight = player.height - slideHeight;
  const yTop = player.y - visualHeight;
  const runCycle = Math.sin(state.worldTimeSec * 15);
  const sway = player.grounded && !state.slideActive ? Math.round(runCycle * 1.1) : 0;
  const bob = player.grounded ? Math.abs(Math.sin(state.worldTimeSec * 14)) * 1.25 : -1.5;
  const shoulderX = player.x + sway + 27;
  const shoulderY = yTop + 30 + (player.grounded ? bob : 0);
  const aiming = state.skarnAimActive;
  const aimY = getSkarnAimY();
  const handX = shoulderX + 17;
  const handY = aiming ? shoulderY + Math.round((aimY - shoulderY) * 0.24) : shoulderY + 11;
  const muzzleX = handX + 13;
  const muzzleY = aiming ? handY + Math.round((aimY - handY) * 0.58) : handY + 10;
  return {
    shoulderX,
    shoulderY,
    handX,
    handY,
    muzzleX,
    muzzleY,
    aiming,
  };
}

function getSkarnAimY() {
  // Triangle sweep: ground -> ceiling -> ground (repeat).
  const low = GAME.groundY + 8;
  const high = 72;
  const cycle = state.skarnAimPhase % 2;
  const tri = cycle <= 1 ? cycle : 2 - cycle; // 0..1..0
  return low - (low - high) * tri;
}

function triggerPursuitBoarding() {
  if (state.runWorldId !== "pursuit" || state.pursuitEndPending || state.multiplier < 10 || !state.player) return false;
  if (!canPromptPursuitJump()) return false;
  const zone = getPursuitBoardZone();
  state.player.x = zone.x + zone.width * 0.5 - state.player.width * 0.5;
  state.player.y = zone.y;
  state.player.vy = 0;
  state.player.grounded = true;
  state.player.jumpsUsed = 0;
  state.pursuitEndPending = true;
  state.pursuitRevealLeft = PURSUIT_REVEAL_DURATION;
  state.pursuitEndCardLeft = PURSUIT_END_CARD_DURATION;
  state.pursuitEndCardCuePlayed = false;
  state.pursuitEndFade = 1.1;
  state.speedBoostLeft = 0;
  state.stumbleLeft = 0;
  state.levelMusicTimer = 0;
  state.levelMusicStep = 0;
  state.levelMusicWorld = null;
  state.screenShake = Math.max(state.screenShake, 0.24);
  playStranglerRevealCue();
  addFloatingText("CAR CAUGHT!", state.player.x - 8, state.player.y - 44, "#ffe7a2");
  return true;
}

function spawnObstacle() {
  const difficulty = LEVEL_DIFFICULTY[state.runWorldId] || LEVEL_DIFFICULTY.bullpen;
  const distanceFactor = Math.min(1.75, 1 + state.worldTimeSec / 75) * difficulty.obstacleSpeedMul;
  const pool = THEME_OBSTACLE_POOLS[state.theme] || THEME_OBSTACLE_POOLS.bullpen;
  const type = pool[Math.floor(Math.random() * pool.length)];

  const size = {
    desk: { w: 52, h: 46, topOffset: 0, hp: 1 },
    angela_cat: { w: 34, h: 24, topOffset: -40, hp: 1 },
    chili_spill: { w: 88, h: 30, topOffset: 0, hp: 1 },
    paper_pile: { w: 46, h: 30, topOffset: 8, hp: 1 },
    shelf: { w: 58, h: 54, topOffset: 0, hp: 1 },
    ladder: { w: 74, h: 122, topOffset: 8, hp: 1 },
    lightpole: { w: 24, h: 76, topOffset: 4, hp: 1 },
    jim_snowball: { w: 24, h: 24, topOffset: -24, hp: 1 },
    hydrant: { w: 36, h: 40, topOffset: 4, hp: 1 },
    ice_patch: { w: 98, h: 20, topOffset: 8, hp: 1 },
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
    spawnX = car.x + 178 + Math.random() * 14;
    const ejectY = {
      folder: car.y - 14,
      paper_ream: car.y - 8,
      mung_beans: car.y - 18,
    }[type];
    if (typeof ejectY === "number") top = ejectY;
  }
  if (state.runWorldId === "skarn" && type === "hockey_puck") {
    const pose = getSkarnGoldenfacePose();
    spawnX = pose.muzzleX - 6;
    top = pose.muzzleY - 2 + (Math.random() * 18 - 9);
  }

  const obstacle = {
    type,
    x: spawnX,
    y: top,
    width: size.w,
    height: size.h,
    hp: size.hp,
    hit: false,
    speedFactor: distanceFactor,
  };

  if (state.runWorldId === "pursuit" && type === "mung_beans") {
    obstacle.vy = -340;
    obstacle.bounceSpeed = 340;
    obstacle.bounceY = GAME.groundY - size.h + 2;
  }

  state.obstacles.push(obstacle);
}

function spawnCollectible() {
  // More Stanley Nickels than Schrute Bucks.
  const type = Math.random() < 0.35 ? "schrute_buck" : "stanley_nickel";
  const elevated = Math.random() < 0.62;
  const y = elevated ? GAME.groundY - 98 - Math.random() * 48 : GAME.groundY - 24;
  const difficulty = LEVEL_DIFFICULTY[state.runWorldId] || LEVEL_DIFFICULTY.bullpen;
  const distanceFactor = Math.min(1.75, 1 + state.worldTimeSec / 75) * difficulty.obstacleSpeedMul;
  const lootScale = state.player?.runtimeLootValueMul || 1;
  state.collectibles.push({
    type,
    x: canvas.width + 24,
    y,
    width: type === "schrute_buck" ? 32 : 26,
    height: type === "schrute_buck" ? 28 : 26,
    speedFactor: distanceFactor,
    valueScale: lootScale,
  });
}

function calculateStars() {
  const base = state.style + state.bestChain * 45;
  if (base < 1200) return 1;
  if (base < 2200) return 2;
  if (base < 3500) return 3;
  if (base < 4800) return 4;
  return 5;
}

function endRun(reason = "time") {
  syncStyleToScore();
  stopPursuitSirenLoop();
  state.running = false;
  state.gameOver = true;
  // Clear pursuit reveal/fade state so summary never sits behind a black overlay.
  state.pursuitEndPending = false;
  state.pursuitRevealLeft = 0;
  state.pursuitEndCardLeft = 0;
  state.pursuitEndCardCuePlayed = false;
  state.pursuitEndFade = 0;
  state.stars =
    (reason === "toby_caught" && state.runWorldId === "pursuit") || (reason === "goldenface_down" && state.runWorldId === "skarn")
      ? 5
      : calculateStars();
  // Economy v3: only currency collected inside the level is rewarded.
  state.earnedSchruteBucks = state.runCollectedSchruteBucks;
  state.earnedStanleyNickels = state.runCollectedStanleyNickels;
  const prevSb = state.saveData.currencies.schruteBucks;
  const prevSn = state.saveData.currencies.stanleyNickels;

  state.saveData.currencies.schruteBucks += state.earnedSchruteBucks;
  state.saveData.currencies.stanleyNickels += state.earnedStanleyNickels;
  state.saveData.stats.bestHardcoreChain = Math.max(state.saveData.stats.bestHardcoreChain, state.bestChain);

  let questEndingLine = "";
  if (reason === "time" || (reason === "goldenface_down" && state.runWorldId === "skarn")) {
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
    if (!state.saveData.unlocks.outfitsUnlocked.includes("strangler_hood")) {
      state.saveData.unlocks.outfitsUnlocked.push("strangler_hood");
      questEndingLine += `${questEndingLine ? " " : ""}Outfit Unlocked: Strangler's Hood.`;
    }
  }
  if (reason === "goldenface_down" && state.runWorldId === "skarn") {
    questEndingLine = "Threat Level Midnight complete: Goldenface is down.";
  }

  persistSave();

  const worldIdx = WORLDS.findIndex((w) => w.id === state.runWorldId);
  const hasNextLevel = worldIdx !== -1 && worldIdx < WORLDS.length - 1;
  const successfulFinish = reason === "time" || reason === "toby_caught" || reason === "goldenface_down";
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
  } else if (reason === "goldenface_down") {
    endingLine = "Threat Level Midnight: You tagged Goldenface 10 times and shut down the rink showdown.";
  }

  state.reviewData = {
    runner: state.player.preset.label,
    world: THEME_LABELS[state.runWorldId],
    stars: state.stars,
    style: Math.floor(state.style),
    bestChain: state.bestChain,
    earnedSb: state.earnedSchruteBucks,
    earnedSn: state.earnedStanleyNickels,
    prevSb,
    prevSn,
    totalSb: state.saveData.currencies.schruteBucks,
    totalSn: state.saveData.currencies.stanleyNickels,
    endingLine,
    questEndingLine,
  };
  state.reviewAnimSec = 0;
  state.uiFocus.reviewButton = 0;
  renderReviewSummaryText();
  summaryPanel.hidden = false;
  summaryPanel.classList.add("review-controls-only");
  retryBtn.focus();
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
  if (state.tutorialMode && state.tutorialStep < 2) state.tutorialStep = 2;
  if (state.cheatInvincible) {
    state.pendingLanding = false;
    state.landingWindowLeft = 0;
    state.speedBoostLeft = GAME.speedBoostSec * (state.player?.runtimeBoostMul || 1);
    state.multiplier = Math.min(20, state.multiplier + 1);
    state.bestChain = Math.max(state.bestChain, state.multiplier - 1);
    if (state.bestChain >= 20 && unlockDundieAward("whitestSneakers")) {
      addFloatingText("WHITEST!", state.player.x - 8, state.player.y - 46, "#fff4b2");
    }
    addFloatingText("HARDCORE!", state.player.x + 16, state.player.y - 28, "#ffd54d");
    if (state.tutorialMode) state.tutorialStep = Math.max(state.tutorialStep, 3);
    return;
  }
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
    if (state.tutorialMode) state.tutorialStep = Math.max(state.tutorialStep, 3);
    return;
  }

  // Failed attempt only when player actually presses J outside the valid window.
  stumbleFail();
}

function attack() {
  if (!state.running || state.paused) return;
  if (state.runWorldId === "skarn") {
    startSkarnAim();
    return;
  }
  if (state.attackCooldownLeft > 0) return;
  state.attackLeft = GAME.attackDurationSec;
  state.attackCooldownLeft = GAME.attackCooldownSec;
}

function startSkarnAim() {
  if (state.skarnShotCooldownLeft > 0 || !state.player || state.skarnAimActive) return;
  state.skarnAimActive = true;
  // Always start from ground so tap-spam cannot instantly line up.
  state.skarnAimPhase = 0;
  state.skarnAimHoldSec = 0;
}

function fireSkarnGun() {
  if (!state.player || state.skarnShotCooldownLeft > 0) return;
  if (state.skarnAimHoldSec < 0.4) {
    const gun = getSkarnPlayerGunPose();
    state.skarnShotCooldownLeft = 0.16;
    addFloatingText("TOO SOON", gun.muzzleX + 6, gun.muzzleY - 8, "#ffb9aa");
    return;
  }
  state.skarnShotCooldownLeft = 0.2;
  const target = getSkarnGoldenfaceHitbox();
  const aimY = getSkarnAimY();
  // Count shots across the whole body hitbox (including legs), not just center mass.
  const onTarget = aimY >= target.y - 8 && aimY <= target.y + target.height + 8;

  if (onTarget) {
    state.skarnGoldenfaceHits += 1;
    state.score += 180;
    state.style += 80;
    state.screenShake = Math.max(state.screenShake, 0.16);
    addFloatingText(`HIT ${state.skarnGoldenfaceHits}/10`, target.x - 8, target.y - 10, "#ffe79a");
    addHitParticles(target.x + target.width * 0.5, target.y + target.height * 0.45, "#ffd78a");
    if (state.skarnGoldenfaceHits >= 10) {
      endRun("goldenface_down");
      return;
    }
  } else {
    const gun = getSkarnPlayerGunPose();
    addFloatingText("MISS!", gun.muzzleX + 10, aimY - 8, "#ffb2a5");
  }
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

function applyInjuryStumble(baseSec = 0.6, pursuitMinSec = 1.25, lostPursuitChain = false) {
  const stumbleMul = state.player?.runtimeStumbleMul || 1;
  state.stumbleLeft = baseSec * stumbleMul;
  if (lostPursuitChain) state.stumbleLeft = Math.max(state.stumbleLeft, pursuitMinSec);
}

function jump() {
  if (!state.running || state.paused) return;
  if (state.slideActive) {
    // Pop out of slide immediately when jump is requested.
    state.slideActive = false;
    state.slideSpeed = 0;
  }
  const maxJumps = state.player.runtimeMaxJumps || state.player.preset.maxJumps || 1;
  if (state.player.jumpsUsed >= maxJumps) return;
  state.player.vy = -state.player.preset.jumpPower;
  state.player.grounded = false;
  state.player.jumpsUsed += 1;
  if (state.tutorialMode) state.tutorialStep = Math.max(state.tutorialStep, 1);
}

function startSlide() {
  if (!state.running || state.paused) return;
  if (!state.player.grounded || state.slideActive) return;
  state.slideActive = true;
  state.slideSpeed = GAME.slideInitialSpeed;
  state.pendingSpaceTapJump = false;
  addFloatingText("SLIDE!", state.player.x + 10, state.player.y - 30, "#9ce3ff");
  if (state.tutorialMode) state.tutorialStep = Math.max(state.tutorialStep, 2);
}

function onLanding() {
  state.pendingLanding = true;
  const assistMul = getSettings().parkourAssist ? 1.65 : 1;
  state.landingWindowLeft = GAME.parkourWindowSec * assistMul;
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

function getPlayerHitbox() {
  if (!state.player) return null;
  const player = state.player;
  const hitboxW = player.width * player.preset.hitboxScale;
  const hitboxHBase = player.height * player.preset.hitboxScale;
  const hitboxH = state.slideActive ? hitboxHBase * 0.55 : hitboxHBase;
  return {
    x: player.x + (player.width - hitboxW) / 2,
    y: player.y - hitboxH,
    width: hitboxW,
    height: hitboxH,
  };
}

function drawDebugHitboxes() {
  if (!state.debugHitboxes || state.scene !== "run" || !state.player) return;
  const pbox = getPlayerHitbox();
  if (!pbox) return;

  ctx.save();
  ctx.strokeStyle = "#7dff8a";
  ctx.lineWidth = 2;
  ctx.strokeRect(pbox.x, pbox.y, pbox.width, pbox.height);

  for (const obs of state.obstacles) {
    if (obs.type === "ladder") {
      const clearance = 24;
      const blockBottom = obs.y + obs.height - clearance;
      const ladderBlock = { x: obs.x, y: obs.y, width: obs.width, height: Math.max(1, blockBottom - obs.y) };
      ctx.strokeStyle = "#ffd56a";
      ctx.strokeRect(ladderBlock.x, ladderBlock.y, ladderBlock.width, ladderBlock.height);
    } else {
      ctx.strokeStyle = "#ff7f7f";
      ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
    }
  }

  if (state.runWorldId === "pursuit") {
    const zone = getPursuitBoardZone();
    ctx.strokeStyle = "#7ecfff";
    ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
  } else if (state.runWorldId === "skarn") {
    const target = getSkarnGoldenfaceHitbox();
    ctx.strokeStyle = "#ffb86f";
    ctx.strokeRect(target.x, target.y, target.width, target.height);
  }

  ctx.fillStyle = "rgba(8,14,26,0.78)";
  ctx.fillRect(10, canvas.height - 28, 340, 18);
  ctx.fillStyle = "#d7f0ff";
  ctx.font = "bold 12px Trebuchet MS";
  ctx.fillText("DEBUG HITBOXES (H): green=player red=obstacle yellow=slide-zone", 14, canvas.height - 15);
  ctx.restore();
}

function handleObstacleCollision(obstacle) {
  if (obstacle.hit) return;
  obstacle.hit = true;
  if (obstacle.type === "hockey_puck") {
    addFloatingText("PUCK BLAST!", obstacle.x - 6, obstacle.y - 14, "#ffc89a");
    for (let i = 0; i < 14; i += 1) {
      state.particles.push({
        x: obstacle.x + obstacle.width * 0.5,
        y: obstacle.y + obstacle.height * 0.5,
        vx: -140 + Math.random() * 280,
        vy: -220 + Math.random() * 260,
        color: i % 3 === 0 ? "#ffd18e" : i % 2 === 0 ? "#ff8f7d" : "#b3d7ff",
        age: 0,
        ttl: 0.26 + Math.random() * 0.22,
      });
    }
  }

  if (state.cheatInvincible) {
    state.style += 8;
    addFloatingText("NOPE", state.player.x + 8, state.player.y - 28, "#a5ffcf");
    addHitParticles(obstacle.x + obstacle.width * 0.5, obstacle.y + obstacle.height * 0.5, "#9ef7cf");
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
  applyInjuryStumble(0.6, 1.25, lostPursuitChain);
  if (lostPursuitChain) {
    state.player.x = 66;
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

  const runHasTimer = state.runWorldId !== "pursuit" && state.runWorldId !== "skarn";
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
  state.skarnShotCooldownLeft = Math.max(0, state.skarnShotCooldownLeft - dt);
  if (state.runWorldId === "skarn" && state.skarnAimActive) {
    state.skarnAimPhase += dt * 0.8;
    state.skarnAimHoldSec += dt;
  }
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
    if (state.pursuitEndPending) {
      if (state.pursuitRevealLeft > 0) {
        state.pursuitRevealLeft = Math.max(0, state.pursuitRevealLeft - dt);
      } else if (state.pursuitEndCardLeft > 0) {
        if (!state.pursuitEndCardCuePlayed) {
          state.pursuitEndCardCuePlayed = true;
          playPursuitEndBumBumCue();
        }
        state.pursuitEndCardLeft = Math.max(0, state.pursuitEndCardLeft - dt);
      } else {
        state.pursuitEndFade = Math.max(0, state.pursuitEndFade - dt);
        if (state.pursuitEndFade <= 0) endRun("toby_caught");
      }
      return;
    }
    if (state.multiplier < 10) {
      state.pursuitPost10Progress = 0;
    } else {
      state.pursuitPost10Progress = Math.min(1, state.pursuitPost10Progress + dt * 0.55);
    }
    const pre10 = Math.max(0, Math.min(1, (Math.min(state.multiplier, 10) - 1) / 9));
    const chaseProgress = state.multiplier < 10 ? pre10 * 0.78 : 0.78 + state.pursuitPost10Progress * 0.22;
    const targetX = state.stumbleLeft > 0 ? 66 : 84 + chaseProgress * 752;
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
  if (state.spawnTimerSec <= 0 && (!state.tutorialMode || state.worldTimeSec > 6.5)) {
    const difficulty = LEVEL_DIFFICULTY[state.runWorldId] || LEVEL_DIFFICULTY.bullpen;
    spawnObstacle();
    const spawnGap = difficulty.spawnBase + Math.random() * difficulty.spawnRand;
    state.spawnTimerSec = Math.max(difficulty.spawnMin, spawnGap - state.worldTimeSec * 0.004);
  }

  state.collectibleSpawnTimerSec -= dt;
  if (state.collectibleSpawnTimerSec <= 0 && (!state.tutorialMode || state.worldTimeSec > 3.5)) {
    spawnCollectible();
    const collectibleSpawnMul = state.player?.runtimeCollectibleSpawnMul || 1;
    const gap = COLLECTIBLE_SPAWN.baseGap + Math.random() * COLLECTIBLE_SPAWN.randGap;
    state.collectibleSpawnTimerSec = Math.max(
      COLLECTIBLE_SPAWN.minGap,
      (gap - state.worldTimeSec * 0.0025) * collectibleSpawnMul
    );
  }

  const playerBox = getPlayerHitbox();

  if (state.runWorldId === "pursuit" && state.multiplier >= 10 && !state.pursuitEndPending && canPromptPursuitJump()) {
    const zone = getPursuitBoardZone();
    const playerBottom = playerBox.y + playerBox.height;
    const landingFromAbove = player.vy > 40 && playerBottom <= zone.y + 12;
    if (landingFromAbove && intersects(playerBox, zone)) {
      triggerPursuitBoarding();
      return;
    }
  }

  handleAttackHits(playerBox);

  for (const obstacle of state.obstacles) {
    obstacle.x -= runSpeed * dt * obstacle.speedFactor;
    if (state.runWorldId === "pursuit" && obstacle.type === "mung_beans") {
      const groundY = typeof obstacle.bounceY === "number" ? obstacle.bounceY : GAME.groundY - obstacle.height + 2;
      obstacle.vy = (obstacle.vy || 0) + 1160 * dt;
      obstacle.y += obstacle.vy * dt;
      if (obstacle.y >= groundY) {
        obstacle.y = groundY;
        obstacle.vy = -(obstacle.bounceSpeed || 340);
      }
    }
    if (obstacle.hit) continue;
    let touching = intersects(playerBox, obstacle);
    if (obstacle.type === "ladder") {
      const clearance = 24;
      const blockBottom = obstacle.y + obstacle.height - clearance;
      const ladderBlock = {
        x: obstacle.x,
        y: obstacle.y,
        width: obstacle.width,
        height: Math.max(1, blockBottom - obstacle.y),
      };
      touching = intersects(playerBox, ladderBlock);
    }
    if (!touching) continue;

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
      if (state.slideActive) {
        addFloatingText("CHILI BURN!", obstacle.x + 8, obstacle.y - 12, "#ff9a72");
        if (state.speedBoostLeft > 0 && state.player.runtimeHardcoreInvincible) {
          state.style += 12;
          addFloatingText("INVINCIBLE!", state.player.x - 4, state.player.y - 30, "#b8ffe0");
          addHitParticles(obstacle.x + obstacle.width * 0.5, obstacle.y + obstacle.height * 0.5, "#9ef7cf");
          continue;
        }
        const lostPursuitChain = state.runWorldId === "pursuit" && state.multiplier > 1;
        state.player.hp -= 1;
        state.multiplier = 1;
        state.score = Math.max(0, state.score - 80);
        state.speedBoostLeft = 0;
        applyInjuryStumble(0.6, 1.25, lostPursuitChain);
        if (lostPursuitChain) {
          state.player.x = 66;
          addFloatingText("LOST GROUND!", state.player.x - 14, state.player.y - 44, "#ffbe7a");
        }
        state.screenShake = Math.max(state.screenShake, 0.22);
        addFloatingText("Injury", state.player.x + 4, state.player.y - 28, "#ff7062");
        addHitParticles(obstacle.x + obstacle.width * 0.45, obstacle.y + obstacle.height * 0.6, "#ff8f7d");
        if (state.player.hp <= 0) endRun("defeat");
      } else {
        state.style += 8;
        addFloatingText("NICE FOOTWORK", obstacle.x + 2, obstacle.y - 10, "#9fe6ff");
      }
      continue;
    }

    if (obstacle.type === "ice_patch") {
      obstacle.hit = true;
      if (state.slideActive) {
        addFloatingText("Frostbite.", obstacle.x + 10, obstacle.y - 12, "#bfe9ff");
        if (state.speedBoostLeft > 0 && state.player.runtimeHardcoreInvincible) {
          state.style += 12;
          addFloatingText("INVINCIBLE!", state.player.x - 4, state.player.y - 30, "#b8ffe0");
          addHitParticles(obstacle.x + obstacle.width * 0.5, obstacle.y + obstacle.height * 0.5, "#9ef7cf");
          continue;
        }
        const lostPursuitChain = state.runWorldId === "pursuit" && state.multiplier > 1;
        state.player.hp -= 1;
        state.multiplier = 1;
        state.score = Math.max(0, state.score - 80);
        state.speedBoostLeft = 0;
        applyInjuryStumble(0.6, 1.25, lostPursuitChain);
        if (lostPursuitChain) {
          state.player.x = 66;
          addFloatingText("LOST GROUND!", state.player.x - 14, state.player.y - 44, "#ffbe7a");
        }
        state.screenShake = Math.max(state.screenShake, 0.22);
        addFloatingText("Injury", state.player.x + 4, state.player.y - 28, "#ff7062");
        addHitParticles(obstacle.x + obstacle.width * 0.5, obstacle.y + obstacle.height * 0.55, "#9fe2ff");
        if (state.player.hp <= 0) endRun("defeat");
      } else {
        state.style += 8;
        addFloatingText("NICE FOOTWORK", obstacle.x + 2, obstacle.y - 10, "#9fe6ff");
      }
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

  for (const coin of state.collectibles) {
    coin.x -= runSpeed * dt * (coin.speedFactor || 1);
    const coinBox = { x: coin.x, y: coin.y, width: coin.width, height: coin.height };
    if (!intersects(playerBox, coinBox)) continue;
    coin.hit = true;
    const mul = Math.max(1, coin.valueScale || 1);
    const rollScaled = (base) => {
      const scaled = base * mul;
      const whole = Math.floor(scaled);
      const frac = scaled - whole;
      return whole + (Math.random() < frac ? 1 : 0);
    };
    if (coin.type === "schrute_buck") {
      const gain = rollScaled(5);
      state.runCollectedSchruteBucks += gain;
      addFloatingText(`+${gain}`, coin.x - 2, coin.y - 8, "#ffe07c");
      addHitParticles(coin.x + 10, coin.y + 10, "#ffd774");
    } else {
      const gain = Math.max(1, rollScaled(1));
      state.runCollectedStanleyNickels += gain;
      addFloatingText(`+${gain}`, coin.x - 2, coin.y - 8, "#cfe8ff");
      addHitParticles(coin.x + 10, coin.y + 10, "#c6e2ff");
    }
  }
  state.collectibles = state.collectibles.filter((coin) => !coin.hit && coin.x + coin.width > -30);

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
  syncStyleToScore();
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

    // Street-side winter life: scattered people, trees, snowmen, and background snowball action.
    const scatterX = [-18, 21, -34, 13, -9, 27, -25, 6, -31];
    const scatterY = [0, 8, 4, 12, 3, 10, 6, 1, 9];
    for (let i = 0; i < 9; i += 1) {
      const bx = i * 126 - ((xShift * 0.62) % 126) + scatterX[i];
      const baseY = 332 + scatterY[i];
      const pose = i % 3; // 0: throwing, 1: making snowman, 2: taking cover

      // Snowy pine tree.
      ctx.fillStyle = "#40697a";
      ctx.fillRect(bx + 14, baseY + 11, 8, 18);
      ctx.fillStyle = "#5e8da2";
      ctx.fillRect(bx + 6, baseY + 5, 24, 8);
      ctx.fillRect(bx + 8, baseY - 1, 20, 7);
      ctx.fillRect(bx + 10, baseY - 7, 16, 6);
      ctx.fillStyle = "#eaf6ff";
      ctx.fillRect(bx + 9, baseY - 1, 8, 2);
      ctx.fillRect(bx + 13, baseY + 5, 10, 2);

      // Snowman cluster.
      const smx = bx + 48;
      ctx.fillStyle = "#f3f9ff";
      ctx.beginPath();
      ctx.arc(smx + 11, baseY + 22, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(smx + 11, baseY + 12, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1e2a3d";
      ctx.fillRect(smx + 8, baseY + 10, 2, 2);
      ctx.fillRect(smx + 12, baseY + 10, 2, 2);
      ctx.fillRect(smx + 9, baseY + 15, 4, 1);
      ctx.fillRect(smx + 7, baseY + 4, 8, 2);
      ctx.fillStyle = "#3f5b7d";
      ctx.fillRect(smx + 9, baseY + 1, 4, 3);

      // Background person with varied poses.
      const px = bx + 88;
      const swing = Math.sin(state.elapsedSec * 5 + i) * 1.5;
      ctx.fillStyle = "#2f4569";
      ctx.fillRect(px + 4, baseY + 12, 10, 12);
      ctx.fillStyle = "#1f2f4e";
      ctx.fillRect(px + 6, baseY + 24, 3, 8);
      ctx.fillRect(px + 10, baseY + 24, 3, 8);
      ctx.fillStyle = "#d6be9f";
      ctx.fillRect(px + 6, baseY + 6, 6, 6);
      ctx.fillStyle = "#2a1f1a";
      ctx.fillRect(px + 5, baseY + 4, 8, 2);
      ctx.fillStyle = "#dfefff";
      if (pose === 0) {
        // Throwing.
        ctx.fillRect(px + 1, baseY + 13 + swing, 2, 5);
        ctx.fillRect(px + 14, baseY + 10 - swing, 3, 5);
      } else if (pose === 1) {
        // Making snowman.
        ctx.fillRect(px + 2, baseY + 16, 2, 4);
        ctx.fillRect(px + 13, baseY + 16, 2, 4);
      } else {
        // Taking cover.
        ctx.fillRect(px + 2, baseY + 18, 2, 3);
        ctx.fillRect(px + 14, baseY + 18, 2, 3);
        ctx.fillStyle = "#2f4569";
        ctx.fillRect(px + 4, baseY + 14, 10, 6);
      }

      // Tossed snowball visual only, mostly from "throwing" pose.
      if (pose === 0 || i % 4 === 0) {
        const sbx = px + 20 - (state.worldTimeSec * 56 + i * 14) % 52;
        const sby = baseY + 10 + Math.sin(state.worldTimeSec * 6 + i * 0.8) * 5;
        ctx.fillStyle = "rgba(245, 252, 255, 0.9)";
        ctx.fillRect(sbx, sby, 3, 3);
      }
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
  } else if (state.theme === "skarn") {
    const arenaGrad = ctx.createLinearGradient(0, 0, 0, GAME.floorTop);
    arenaGrad.addColorStop(0, "#111f44");
    arenaGrad.addColorStop(1, "#2e4f8f");
    ctx.fillStyle = arenaGrad;
    ctx.fillRect(0, 0, canvas.width, GAME.floorTop);

    // Arena beams and lights.
    ctx.fillStyle = "#1a2f60";
    ctx.fillRect(0, 18, canvas.width, 8);
    ctx.fillRect(0, 52, canvas.width, 6);
    for (let i = 0; i < 16; i += 1) {
      const lx = i * 64 - ((xShift * 0.16) % 64);
      ctx.fillStyle = "rgba(224, 238, 255, 0.78)";
      ctx.fillRect(lx + 10, 24, 11, 3);
      ctx.fillRect(lx + 10, 56, 10, 2);
    }

    // Crowd stands and rink wall.
    ctx.fillStyle = "#1b2f5d";
    ctx.fillRect(0, 80, canvas.width, 110);
    // Stronger tier breaks so this clearly reads as seating sections.
    ctx.fillStyle = "#0f2245";
    ctx.fillRect(0, 102, canvas.width, 8);
    ctx.fillRect(0, 132, canvas.width, 8);
    ctx.fillRect(0, 162, canvas.width, 8);
    ctx.fillStyle = "rgba(16,24,46,0.9)";
    ctx.fillRect(0, 124, canvas.width, 6);
    ctx.fillRect(0, 164, canvas.width, 6);
    for (let i = 0; i < 160; i += 1) {
      const px = (i * 11 + Math.floor(i / 2) * 9) % canvas.width;
      const py = 92 + ((i * 7) % 86);
      ctx.fillStyle = i % 5 === 0 ? "#7aa3df" : i % 3 === 0 ? "#4a6ea8" : "#2b4779";
      ctx.fillRect(px, py, 2, 2);
    }
    // Upper deck seating rows: visible "bench" blocks + railings.
    for (let row = 0; row < 4; row += 1) {
      const y = 84 + row * 20;
      ctx.fillStyle = "#1a2e56";
      ctx.fillRect(0, y + 10, canvas.width, 5); // bench slab
      ctx.fillStyle = "#33598f";
      for (let i = 0; i < 28; i += 1) {
        const sx = i * 46 - ((xShift * (0.08 + row * 0.04)) % 46);
        ctx.fillRect(sx + 4, y + 2, 30, 7); // seat block
        ctx.fillStyle = "#223b65";
        ctx.fillRect(sx + 6, y + 4, 26, 2); // seat back shadow
        ctx.fillStyle = "#33598f";
      }
      ctx.fillStyle = "#89a9d4";
      ctx.fillRect(0, y + 1, canvas.width, 1); // row highlight
    }
    // Vertical aisle dividers.
    ctx.fillStyle = "rgba(145,176,219,0.42)";
    for (let i = 0; i < 7; i += 1) {
      const ax = i * 170 - ((xShift * 0.06) % 170) + 24;
      ctx.fillRect(ax, 82, 3, 88);
    }
    ctx.fillStyle = "#d4ecff";
    ctx.fillRect(0, 206, canvas.width, 4);
    ctx.fillStyle = "#9ec6e8";
    ctx.fillRect(0, 210, canvas.width, 12);
    // Glass wall panes and supports (more obvious "arena glass").
    ctx.fillStyle = "rgba(168, 214, 248, 0.42)";
    for (let i = 0; i < 14; i += 1) {
      const sx = i * 74 - ((xShift * 0.66) % 74);
      ctx.fillRect(sx + 8, 210, 2, 36); // vertical divider
      ctx.fillRect(sx + 10, 212, 56, 2); // top frame
      ctx.fillRect(sx + 10, 244, 56, 1); // bottom edge
      ctx.fillStyle = "rgba(210,236,255,0.18)";
      ctx.fillRect(sx + 16, 216, 8, 24);
      ctx.fillStyle = "rgba(168, 214, 248, 0.42)";
    }

    // Rink ads so it reads as indoor hockey arena.
    for (let i = 0; i < 6; i += 1) {
      const ax = i * 170 - ((xShift * 0.5) % 170);
      ctx.fillStyle = "#e8f2ff";
      ctx.fillRect(ax + 16, 214, 78, 14);
      ctx.fillStyle = i % 2 === 0 ? "#ca4653" : "#2d5a93";
      ctx.fillRect(ax + 20, 218, 70, 6);
    }
    // Upper-deck hanging banners.
    for (let i = 0; i < 6; i += 1) {
      const bx = 70 + i * 145 - ((xShift * 0.22) % 24);
      const hueA = i % 2 === 0 ? "#d74f5f" : "#4f78c7";
      const hueB = i % 2 === 0 ? "#f5b3bb" : "#b8cbf5";
      ctx.fillStyle = hueA;
      ctx.fillRect(bx, 62, 20, 32);
      ctx.fillStyle = hueB;
      ctx.fillRect(bx + 4, 68, 12, 18);
      ctx.fillStyle = "#152744";
      ctx.fillRect(bx + 8, 64, 4, 2);
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

    if (state.theme === "pursuit") {
      // Storm clouds.
      ctx.fillStyle = "rgba(178,196,228,0.36)";
      for (let i = 0; i < 6; i += 1) {
        const cx = i * 190 - ((xShift * 0.25) % 1140) - 80;
        const cy = 46 + (i % 2) * 18;
        ctx.beginPath();
        ctx.ellipse(cx + 24, cy, 48, 18, 0, 0, Math.PI * 2);
        ctx.ellipse(cx - 20, cy + 4, 36, 13, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 60, cy + 6, 30, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // Heavy, wind-blown rain layers (fast and non-floaty).
      ctx.strokeStyle = "rgba(170, 205, 255, 0.52)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 220; i += 1) {
        const rx = (i * 17 + state.elapsedSec * 340) % (canvas.width + 120) - 60;
        const ry = (i * 14 + state.elapsedSec * 560) % (GAME.floorTop + 120) - 60;
        ctx.beginPath();
        ctx.moveTo(rx, ry - 1);
        ctx.lineTo(rx - 7, ry + 17);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(132, 176, 235, 0.46)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 176; i += 1) {
        const rx = (i * 29 + state.elapsedSec * 280) % (canvas.width + 140) - 70;
        const ry = (i * 23 + state.elapsedSec * 480) % (GAME.floorTop + 140) - 70;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 8, ry + 20);
        ctx.stroke();
      }
      // Near-road rain haze/splashes so the storm feels dense.
      ctx.fillStyle = "rgba(190, 220, 255, 0.3)";
      for (let i = 0; i < 120; i += 1) {
        const sx = (i * 23 + state.elapsedSec * 410) % (canvas.width + 90) - 45;
        const sy = GAME.floorTop - 22 + ((i * 7 + state.elapsedSec * 36) % 36);
        ctx.fillRect(sx, sy, 2, 1);
      }
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

    if (state.theme === "pursuit") {
      // Distant background road traffic (decorative only).
      const bgCars = [
        { laneY: 302, speed: 0.72, spacing: 228, seed: 0, body: "#111824", window: "#7e9ac2" },
        { laneY: 311, speed: 0.94, spacing: 196, seed: 72, body: "#2a2234", window: "#9bb4d8" },
      ];
      for (const lane of bgCars) {
        for (let i = 0; i < 8; i += 1) {
          const cx = i * lane.spacing - ((xShift * lane.speed + lane.seed) % lane.spacing) - 40;
          const carW = 34 + (i % 2) * 6;
          const carH = 8;
          ctx.fillStyle = lane.body;
          ctx.fillRect(cx, lane.laneY, carW, carH);
          ctx.fillRect(cx + 6, lane.laneY - 3, carW - 16, 3);
          ctx.fillStyle = lane.window;
          ctx.fillRect(cx + 9, lane.laneY - 2, 8, 2);
          ctx.fillRect(cx + 19, lane.laneY - 2, 6, 2);
          ctx.fillStyle = "#0b1020";
          ctx.fillRect(cx + 4, lane.laneY + 7, 6, 2);
          ctx.fillRect(cx + carW - 10, lane.laneY + 7, 6, 2);
          ctx.fillStyle = "rgba(255, 185, 130, 0.75)";
          ctx.fillRect(cx + carW - 2, lane.laneY + 3, 2, 2);
          ctx.fillStyle = "rgba(185, 220, 255, 0.65)";
          ctx.fillRect(cx, lane.laneY + 3, 2, 2);
        }
      }
    }
  }

  if (state.theme === "pursuit") {
    const roadTop = GAME.groundY - 8;
    // Make the chase lane clearly read as a road.
    ctx.fillStyle = "#2d3139";
    ctx.fillRect(0, roadTop, canvas.width, canvas.height - roadTop);
    ctx.fillStyle = "#1e232b";
    for (let i = 0; i < 24; i += 1) {
      const x = i * 52 - ((xShift * 1.05) % 52);
      ctx.fillRect(x, roadTop + 8, 28, canvas.height - roadTop - 8);
    }
    ctx.fillStyle = "#f4f2c9";
    for (let i = 0; i < 16; i += 1) {
      const x = i * 72 - ((xShift * 1.28) % 72);
      ctx.fillRect(x + 8, roadTop + 28, 38, 6);
    }
    ctx.fillStyle = "#cfd7e2";
    for (let i = 0; i < 20; i += 1) {
      const x = i * 58 - ((xShift * 1.16) % 58);
      ctx.fillRect(x + 6, roadTop + 4, 2, 10);
      ctx.fillRect(x + 6, canvas.height - 16, 2, 10);
    }
    // Guardrail posts.
    ctx.fillStyle = "#4b5667";
    for (let i = 0; i < 18; i += 1) {
      const x = i * 64 - ((xShift * 1.1) % 64);
      ctx.fillRect(x + 2, roadTop + 12, 4, 18);
    }
    // Extra building detail for the pursuit skyline.
    ctx.fillStyle = "rgba(255, 210, 150, 0.6)";
    for (let i = 0; i < 14; i += 1) {
      const x = i * 86 - ((xShift * 0.72) % 86);
      ctx.fillRect(x + 10, 310, 10, 4);
      ctx.fillRect(x + 28, 310, 10, 4);
    }
  } else if (state.theme === "skarn") {
    // Ice surface + lane marks for a rink vibe.
    const iceGrad = ctx.createLinearGradient(0, SKARN_RINK_TOP - 8, 0, canvas.height);
    iceGrad.addColorStop(0, "#f7fcff");
    iceGrad.addColorStop(1, "#e8f3ff");
    ctx.fillStyle = iceGrad;
    ctx.fillRect(0, SKARN_RINK_TOP, canvas.width, canvas.height - SKARN_RINK_TOP);
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
    // Faceoff circles + blue lines so it clearly reads as a rink.
    ctx.strokeStyle = "rgba(199,63,86,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(300 - ((xShift * 0.75) % 600), SKARN_RINK_TOP + 72, 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(900 - ((xShift * 0.75) % 600), SKARN_RINK_TOP + 72, 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(92,142,208,0.45)";
    ctx.fillRect(0, SKARN_RINK_TOP + 20, canvas.width, 2);
    ctx.fillRect(0, SKARN_RINK_TOP + 112, canvas.width, 2);
  } else {
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    for (let i = 0; i < 24; i += 1) {
      const x = i * 54 - ((xShift * 1.2) % 54);
      ctx.fillRect(x, GAME.floorTop + 24, 28, 4);
    }
  }

  // 16-bit detail pass: extra themed props and texture density per world.
  if (state.theme === "bullpen") {
    // Bulletin strips + tiny desk props.
    ctx.fillStyle = "#f9f4df";
    for (let i = 0; i < 10; i += 1) {
      const x = i * 98 - ((xShift * 0.34) % 98);
      ctx.fillRect(x + 10, 126, 16, 8);
      ctx.fillStyle = "#d74f4f";
      ctx.fillRect(x + 14, 128, 2, 2);
      ctx.fillStyle = "#f9f4df";
    }
    ctx.fillStyle = "#42536a";
    for (let i = 0; i < 7; i += 1) {
      const x = i * 142 - ((xShift * 0.52) % 142);
      ctx.fillRect(x + 18, 268, 36, 8);
      ctx.fillStyle = "#86c9ff";
      ctx.fillRect(x + 22, 270, 12, 4);
      ctx.fillStyle = "#42536a";
    }
  } else if (state.theme === "warehouse") {
    // Safety stripes, crate labels, hanging chain silhouettes.
    for (let i = 0; i < 10; i += 1) {
      const x = i * 112 - ((xShift * 0.5) % 112);
      ctx.fillStyle = "#f6d25f";
      ctx.fillRect(x + 8, 314, 18, 4);
      ctx.fillStyle = "#2f3643";
      ctx.fillRect(x + 14, 314, 4, 4);
    }
    ctx.fillStyle = "#d9e2f0";
    for (let i = 0; i < 8; i += 1) {
      const x = i * 126 - ((xShift * 0.46) % 126);
      ctx.fillRect(x + 20, 232, 14, 4);
      ctx.fillRect(x + 22, 238, 10, 2);
    }
    ctx.fillStyle = "rgba(38,46,58,0.55)";
    for (let i = 0; i < 6; i += 1) {
      const x = i * 168 - ((xShift * 0.18) % 168);
      ctx.fillRect(x + 40, 70, 2, 52);
      ctx.fillRect(x + 44, 84, 2, 38);
    }
  } else if (state.theme === "corporate") {
    // Glass building depth: mullion grid and warm office pockets.
    for (let i = 0; i < 6; i += 1) {
      const x = i * 168 - ((xShift * 0.18) % 168);
      ctx.fillStyle = "rgba(44,98,127,0.44)";
      for (let gy = 66; gy < 188; gy += 20) ctx.fillRect(x + 28, gy, 112, 1);
      ctx.fillStyle = "rgba(255,214,160,0.5)";
      ctx.fillRect(x + 42, 98, 10, 8);
      ctx.fillRect(x + 88, 138, 10, 8);
    }
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    for (let i = 0; i < 18; i += 1) {
      const x = i * 58 - ((xShift * 0.66) % 58);
      ctx.fillRect(x, 228, 26, 1);
    }
  } else if (state.theme === "streets") {
    // Extra street realism: window trims, curb noise, snow ridge highlights.
    ctx.fillStyle = "rgba(210, 225, 246, 0.55)";
    for (let i = 0; i < 16; i += 1) {
      const x = i * 72 - ((xShift * 0.88) % 72);
      ctx.fillRect(x + 4, GAME.floorTop + 9, 20, 1);
      ctx.fillRect(x + 30, GAME.floorTop + 10, 10, 1);
    }
    ctx.fillStyle = "rgba(248, 252, 255, 0.5)";
    for (let i = 0; i < 10; i += 1) {
      const x = i * 128 - ((xShift * 0.64) % 128);
      ctx.fillRect(x + 14, GAME.floorTop + 20, 44, 2);
    }
  } else if (state.theme === "pursuit") {
    // Chase road richness: shoulder reflectors + distant overpass.
    ctx.fillStyle = "#2a3240";
    ctx.fillRect(0, GAME.floorTop - 6, canvas.width, 6);
    ctx.fillStyle = "#d8e1ee";
    for (let i = 0; i < 28; i += 1) {
      const x = i * 44 - ((xShift * 1.22) % 44);
      ctx.fillRect(x + 6, GAME.floorTop + 14, 3, 2);
      ctx.fillRect(x + 6, canvas.height - 10, 3, 2);
    }
    ctx.fillStyle = "rgba(255,190,120,0.5)";
    for (let i = 0; i < 9; i += 1) {
      const x = i * 136 - ((xShift * 0.52) % 136);
      ctx.fillRect(x + 18, 288, 10, 4);
    }
  } else if (state.theme === "skarn") {
    // Goldenface: full humanoid sprite with aiming/recoil animation.
    const pose = getSkarnGoldenfacePose();
    const gfBaseX = pose.baseX;
    const gfBaseY = pose.baseY;
    const gfBob = pose.bob;
    const skatePhase = state.worldTimeSec * 7.2;
    const legKickA = Math.sin(skatePhase) * 2.6;
    const legKickB = Math.sin(skatePhase + Math.PI) * 2.6;
    const glide = Math.sin(state.worldTimeSec * 2.2) * 3.2;
    drawHeroPortraitSprite(gfBaseX + glide, gfBaseY + gfBob, 1.08, {
      label: "Michael",
      outfitId: "goldenface",
      noLegs: true,
      shadow: false,
    });
    // Skating shadow.
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(gfBaseX + 20 + glide, gfBaseY + 8, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Backwards-skating legs (toes point opposite gun direction).
    ctx.fillStyle = "#172033";
    ctx.fillRect(gfBaseX + 10 + glide, gfBaseY - 16 - legKickA * 0.35, 6, 18);
    ctx.fillRect(gfBaseX + 21 + glide, gfBaseY - 16 - legKickB * 0.35, 6, 18);
    ctx.fillStyle = "#0f1422";
    ctx.fillRect(gfBaseX + 9 + glide, gfBaseY + 2 - legKickA * 0.2, 8, 3);
    ctx.fillRect(gfBaseX + 20 + glide, gfBaseY + 2 - legKickB * 0.2, 8, 3);
    // Ice skates.
    ctx.fillStyle = "#c3d5e8";
    ctx.fillRect(gfBaseX + 8 + glide, gfBaseY + 5 - legKickA * 0.2, 12, 1);
    ctx.fillRect(gfBaseX + 19 + glide, gfBaseY + 5 - legKickB * 0.2, 12, 1);
    ctx.fillStyle = "#8aa1b9";
    ctx.fillRect(gfBaseX + 9 + glide, gfBaseY + 6 - legKickA * 0.2, 10, 1);
    ctx.fillRect(gfBaseX + 20 + glide, gfBaseY + 6 - legKickB * 0.2, 10, 1);

    const firing = pose.firing;
    const recoil = pose.recoil;
    const armY = pose.armY;
    ctx.fillStyle = "#121316";
    ctx.fillRect(gfBaseX + 6 + recoil + glide, armY, 14, 4); // upper arm extension (left-facing)
    ctx.fillRect(gfBaseX - 2 + recoil + glide, armY + 1, 9, 3); // forearm
    ctx.fillStyle = "#e4ba53";
    ctx.fillRect(gfBaseX - 5 + recoil + glide, armY + 1, 3, 3); // hand
    ctx.fillStyle = "#2b3b55";
    ctx.fillRect(gfBaseX - 12 + recoil + glide, armY + 1, 7, 2); // pistol body
    ctx.fillRect(gfBaseX - 14 + recoil + glide, armY, 2, 1); // pistol sight
    if (firing) {
      ctx.fillStyle = "rgba(255, 232, 170, 0.95)";
      ctx.fillRect(gfBaseX - 16 + recoil + glide, armY + 1, 3, 2);
      ctx.fillStyle = "rgba(255, 184, 118, 0.8)";
      ctx.fillRect(gfBaseX - 18 + recoil + glide, armY + 1, 2, 2);
    }

    // No decorative mini bullets here; real pucks are gameplay obstacles.
  }

  // Soft scanline pass to keep the crunchy 8-bit feel.
  ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
  for (let y = 0; y < canvas.height; y += 4) {
    ctx.fillRect(0, y, canvas.width, 1);
  }
}

function drawPlayer() {
  const player = state.player;
  const forceScarnLook = state.scene === "run" && state.runWorldId === "skarn";
  const runnerId = forceScarnLook ? "michael" : getOutfitRunnerId();
  const outfitId = forceScarnLook ? null : getEquippedOutfitId(runnerId);
  const label = forceScarnLook ? "Michael" : player.preset.label;
  const x = player.x;
  const slideHeight = state.slideActive ? 22 : 0;
  const visualHeight = player.height - slideHeight;
  const yTop = player.y - visualHeight;
  const runCycle = Math.sin(state.worldTimeSec * 15);
  const runCycleOpp = Math.sin(state.worldTimeSec * 15 + Math.PI);
  const sway = player.grounded && !state.slideActive ? Math.round(runCycle * 1.1) : 0;
  const bob = player.grounded ? Math.abs(Math.sin(state.worldTimeSec * 14)) * 1.25 : -1.5;
  const footY = yTop + 65 + bob;
  const slidePose = state.slideActive ? Math.max(0, Math.min(1, state.slideSpeed / Math.max(1, GAME.slideInitialSpeed))) : 0;

  const effectiveTieColor = forceScarnLook ? CHARACTER_PRESETS.michael.tieColor : player.preset.tieColor || "#2f4f7a";
  let shirtColor = forceScarnLook ? CHARACTER_PRESETS.michael.color : player.preset.color;
  if (outfitId === "cornell_fit") shirtColor = "#8a2432";
  else if (outfitId === "goldenface") shirtColor = "#121316";
  else if (outfitId === "date_mike") shirtColor = "#1e2f4e";
  else if (outfitId === "wrong_fit") shirtColor = "#b82424";
  else if (outfitId === "recyclops") shirtColor = "#5c8f3c";
  else if (outfitId === "hay_king") shirtColor = "#6a4a2b";
  else if (outfitId === "two_headed_monster") shirtColor = "#202734";
  else if (outfitId === "cat_andy") shirtColor = "#8c6a3b";
  else if (outfitId === "andy_plumber") shirtColor = "#8c96a8";
  else if (outfitId === "andy_construction") shirtColor = "#b02b26";
  else if (outfitId === "dwight_deputy") shirtColor = "#11161f";
  else if (outfitId === "dwight_joker") shirtColor = "#5a2b7a";
  else if (outfitId === "prison_mike") shirtColor = "#2f3442";
  else if (outfitId === "scranton_penguins") shirtColor = "#13161d";
  else if (outfitId === "strangler_hood") shirtColor = "#171a23";
  else if (outfitId === "three_hole_gym") shirtColor = "#d9dde4";
  let skinBase = label === "Darryl" ? "#8b664b" : label === "Kelly" ? "#a47657" : label === "Pam" ? "#f1cfb3" : "#efcfab";
  let hairBase =
    label === "Dwight"
      ? "#34251a"
      : label === "Pam"
      ? "#7e5139"
      : label === "Andy"
      ? "#886345"
      : label === "Jim"
      ? "#2a1e16"
      : "#3a281d";
  if (outfitId === "dwight_joker") hairBase = "#2f8f4e";
  if (outfitId === "goldenface") {
    skinBase = "#e4ba53";
    hairBase = "#1f1d1b";
  } else if (outfitId === "strangler_hood") {
    skinBase = "#1a1d24";
    hairBase = "#131722";
  }

  if (state.slideActive) {
    // New slide animation from scratch: grounded baseball slide.
    const groundY = GAME.floorTop;
    const speedStretch = Math.round(slidePose * 8);
    const hipY = groundY - 8;
    const slideScale = 1.2;
    const slidePivotX = x + 24;
    const slidePivotY = hipY - 4;

    ctx.save();
    ctx.translate(slidePivotX, slidePivotY);
    ctx.scale(slideScale, slideScale);
    ctx.translate(-slidePivotX, -slidePivotY);

    // Ground shadow/contact.
    ctx.fillStyle = "rgba(0,0,0,0.24)";
    ctx.beginPath();
    ctx.ellipse(x + 24, groundY + 5, 34, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    const slideHeadShift = outfitId === "two_headed_monster" ? 2 : 0;

    // Head and hair (larger for readability).
    ctx.fillStyle = skinBase;
    ctx.fillRect(x + 7 + slideHeadShift, hipY - 16, 14, 10);
    ctx.fillStyle = hairBase;
    ctx.fillRect(x + 6 + slideHeadShift, hipY - 18, 15, 3);
    if (outfitId === "strangler_hood") {
      ctx.fillStyle = "#c3d2ee";
      ctx.fillRect(x + 12 + slideHeadShift, hipY - 13, 1, 1);
      ctx.fillRect(x + 16 + slideHeadShift, hipY - 13, 1, 1);
    } else {
      ctx.fillStyle = "#1b2230";
      ctx.fillRect(x + 11 + slideHeadShift, hipY - 13, 2, 1);
      ctx.fillRect(x + 15 + slideHeadShift, hipY - 13, 2, 1);
      ctx.fillRect(x + 12 + slideHeadShift, hipY - 11, 4, 1);
    }

    // Rear arm first so it sits behind the torso and below the head.
    ctx.fillStyle = shirtColor;
    ctx.fillRect(x + 15, hipY - 8, 4, 5);
    ctx.fillStyle = skinBase;
    ctx.fillRect(x + 13, hipY - 5, 3, 3);

    // Torso (single block; no separate connector piece).
    ctx.fillStyle = shirtColor;
    ctx.fillRect(x + 18, hipY - 13, 18, 9);
    if (label === "Andy" && !outfitId) {
      // Tan blazer + light-blue shirt panel + red bow tie.
      ctx.fillStyle = "#d7e4ff";
      ctx.fillRect(x + 24, hipY - 12, 6, 8);
      ctx.fillStyle = "#b89f7f";
      ctx.fillRect(x + 19, hipY - 11, 3, 7);
      ctx.fillRect(x + 32, hipY - 11, 3, 7);
      ctx.fillStyle = "#a34353";
      ctx.fillRect(x + 24, hipY - 12, 2, 1);
      ctx.fillRect(x + 28, hipY - 12, 2, 1);
      ctx.fillRect(x + 26, hipY - 11, 2, 1);
    }
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    ctx.fillRect(x + 30, hipY - 12, 5, 8);
    if (
      outfitId !== "three_hole_gym" &&
      outfitId !== "strangler_hood" &&
      outfitId !== "cat_andy" &&
      outfitId !== "wrong_fit" &&
      outfitId !== "andy_plumber" &&
      outfitId !== "andy_construction" &&
      outfitId !== "dwight_deputy" &&
      outfitId !== "dwight_joker" &&
      outfitId !== "scranton_penguins"
    ) {
      let tie = effectiveTieColor;
      if (outfitId === "cornell_fit") tie = "#f4d76b";
      else if (outfitId === "goldenface") tie = "#d6b255";
      else if (outfitId === "date_mike") tie = "#9a1f2f";
      else if (outfitId === "wrong_fit") tie = "#f5f5f5";
      else if (outfitId === "recyclops") tie = "#2d5a2e";
      else if (outfitId === "hay_king") tie = "#3f2f1f";
      if (!(label === "Andy" && !outfitId)) {
        ctx.fillStyle = tie;
        ctx.fillRect(x + 24, hipY - 11, 2, 6);
      }
    }

    if (outfitId === "cat_andy") {
      // Fur collar + leopard spots + tail in slide pose.
      ctx.fillStyle = "#d5b47f";
      ctx.fillRect(x + 18, hipY - 14, 11, 2);
      ctx.fillRect(x + 29, hipY - 13, 6, 2);
      ctx.fillStyle = "#3d2d18";
      ctx.fillRect(x + 21, hipY - 9, 2, 2);
      ctx.fillRect(x + 27, hipY - 10, 2, 2);
      ctx.fillRect(x + 31, hipY - 8, 2, 2);
      ctx.fillStyle = "#2a1e11";
      ctx.fillRect(x + 14, hipY - 2, 4, 2);
      ctx.fillRect(x + 12, hipY, 2, 2);
    } else if (outfitId === "hay_king") {
      ctx.fillStyle = "#b8935a";
      ctx.fillRect(x + 19, hipY - 14, 12, 2);
      ctx.fillStyle = "#9e7a47";
      ctx.fillRect(x + 7, hipY - 20, 14, 2);
      ctx.fillRect(x + 11, hipY - 23, 6, 3);
    } else if (outfitId === "two_headed_monster") {
      // Extra head emerging from the rear shoulder seam.
      ctx.fillStyle = skinBase;
      ctx.fillRect(x + 15, hipY - 18, 12, 9);
      ctx.fillStyle = hairBase;
      ctx.fillRect(x + 14, hipY - 20, 12, 2);
      ctx.fillStyle = "#1b2230";
      ctx.fillRect(x + 18, hipY - 16, 1, 1);
      ctx.fillRect(x + 23, hipY - 16, 1, 1);
      ctx.fillRect(x + 19, hipY - 14, 4, 1);
      ctx.fillStyle = shirtColor;
      ctx.fillRect(x + 17, hipY - 10, 7, 2);
    } else if (outfitId === "wrong_fit") {
      // Santa coat details in slide pose.
      ctx.fillStyle = "#f6f4ef";
      ctx.fillRect(x + 18, hipY - 13, 18, 1); // collar trim
      ctx.fillRect(x + 18, hipY - 5, 18, 1); // hem trim
      ctx.fillRect(x + 26, hipY - 12, 2, 7); // coat opening trim
      ctx.fillStyle = "#1b1b1d";
      ctx.fillRect(x + 20, hipY - 8, 12, 2); // belt
      ctx.fillStyle = "#c7a047";
      ctx.fillRect(x + 24, hipY - 8, 4, 2); // buckle
      ctx.fillStyle = "#b82424";
      ctx.fillRect(x + 5, hipY - 17, 17, 2); // santa hat brim
      ctx.fillStyle = "#f6f4ef";
      ctx.fillRect(x + 9, hipY - 18, 9, 1);
      ctx.fillStyle = "#9f1f1f";
      ctx.fillRect(x + 10, hipY - 21, 7, 3);
      ctx.fillStyle = "#f6f4ef";
      ctx.fillRect(x + 16, hipY - 22, 2, 2); // pom
    } else if (outfitId === "andy_plumber") {
      ctx.fillStyle = "#b9c0cc";
      ctx.fillRect(x + 18, hipY - 12, 18, 2);
      ctx.fillRect(x + 18, hipY - 8, 18, 1);
      ctx.fillRect(x + 18, hipY - 6, 18, 1);
      ctx.fillStyle = "#b12b2b";
      ctx.fillRect(x + 7, hipY - 20, 15, 3);
      ctx.fillRect(x + 10, hipY - 23, 9, 3);
    } else if (outfitId === "andy_construction") {
      ctx.fillStyle = "#e4c862";
      ctx.fillRect(x + 7, hipY - 20, 14, 3);
      ctx.fillRect(x + 9, hipY - 22, 10, 2);
      ctx.fillStyle = "#141517";
      ctx.fillRect(x + 20, hipY - 12, 2, 8);
      ctx.fillRect(x + 24, hipY - 12, 2, 8);
      ctx.fillRect(x + 28, hipY - 12, 2, 8);
    } else if (outfitId === "dwight_deputy") {
      ctx.fillStyle = "#3a414f";
      ctx.fillRect(x + 4, hipY - 22, 19, 2); // hat brim
      ctx.fillRect(x + 9, hipY - 25, 9, 3); // crown
      ctx.fillStyle = "#d5b46a";
      ctx.fillRect(x + 16, hipY - 8, 2, 2); // badge
    } else if (outfitId === "dwight_joker") {
      ctx.fillStyle = "#2f8f4e";
      ctx.fillRect(x + 6, hipY - 19, 15, 2);
      ctx.fillRect(x + 5, hipY - 17, 17, 2);
      ctx.fillStyle = "#b8253c";
      ctx.fillRect(x + 12, hipY - 11, 5, 1); // grin
    } else if (outfitId === "prison_mike") {
      ctx.fillStyle = "#7d43be";
      ctx.fillRect(x + 7, hipY - 20, 15, 3);
      ctx.fillRect(x + 8, hipY - 22, 13, 2);
      ctx.fillStyle = "#a977dd";
      ctx.fillRect(x + 10, hipY - 21, 2, 1);
      ctx.fillRect(x + 14, hipY - 21, 2, 1);
      ctx.fillRect(x + 18, hipY - 21, 2, 1);
    } else if (outfitId === "scranton_penguins") {
      ctx.fillStyle = "#f5f7fb";
      ctx.fillRect(x + 20, hipY - 10, 14, 1);
      ctx.fillRect(x + 20, hipY - 7, 14, 1);
      ctx.fillStyle = "#c63d3d";
      ctx.fillRect(x + 26, hipY - 12, 2, 7);
    }

    // Front arm reaches forward.
    ctx.fillStyle = shirtColor;
    ctx.fillRect(x + 35, hipY - 10, 8, 3); // front arm reach
    ctx.fillStyle = skinBase;
    ctx.fillRect(x + 42, hipY - 9, 4, 3);

    if (outfitId === "strangler_hood") {
      // Distinct, slimmer hood in slide pose.
      ctx.fillStyle = "#1a2235";
      ctx.fillRect(x + 6, hipY - 20, 16, 4);
      ctx.fillRect(x + 6, hipY - 16, 3, 9);
      ctx.fillRect(x + 19, hipY - 16, 3, 9);
      ctx.fillStyle = "#293654";
      ctx.fillRect(x + 10, hipY - 18, 8, 1);
    }

    // Legs: directly connected to torso edge (no middle piece at all).
    const legBaseX = x + 24;
    const topLegY = hipY - 4; // exactly touches torso bottom
    const lowerLegY = hipY;
    const topLen = 16 + speedStretch;
    const lowerLen = 20 + speedStretch;
    ctx.fillStyle = "#1b2838";
    ctx.fillRect(legBaseX, topLegY, topLen, 4);
    ctx.fillRect(legBaseX + 3, lowerLegY, lowerLen, 4);
    ctx.fillStyle = "#111722";
    ctx.fillRect(legBaseX + topLen - 1, topLegY + 1, 7, 3);
    ctx.fillRect(legBaseX + 3 + lowerLen - 2, lowerLegY + 1, 8, 3);

    // Scrape streaks.
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(x - 2, groundY + 1, 8, 2);
    ctx.fillRect(x - 10, groundY + 3, 6, 2);
    ctx.fillRect(x + 4, groundY + 2, 10, 1);
    ctx.fillRect(x + 14, groundY + 4, 9, 1);
    ctx.restore();
  } else {
    // Keep shadow on the ground while jumping so airtime is visually clear.
    const groundedTop = GAME.groundY - visualHeight;
    const groundedFootY = groundedTop + 65 + (player.grounded ? bob : 0);
    ctx.fillStyle = "rgba(0,0,0,0.24)";
    ctx.beginPath();
    ctx.ellipse(x + sway + 20, groundedFootY + 8, 20, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    drawHeroPortraitSprite(x + sway, footY, 1, { label, outfitId, noArms: true, noLegs: true, shadow: false });
    // Real run animation pass: connected swinging limbs.
    const armYLeft = yTop + 24 + runCycle * 3;
    const armYRight = yTop + 24 + runCycleOpp * 3;
    ctx.fillStyle = shirtColor;
    ctx.fillRect(x + sway + 2, armYLeft, 4, 9);
    ctx.fillRect(x + sway + 30, armYRight, 4, 9);
    ctx.fillStyle = "#d4b28f";
    ctx.fillRect(x + sway + 2, armYLeft + 8, 4, 7);
    ctx.fillRect(x + sway + 30, armYRight + 8, 4, 7);
    ctx.fillStyle = "#1b2838";
    const legLiftL = Math.max(0, runCycle) * 3;
    const legLiftR = Math.max(0, runCycleOpp) * 3;
    ctx.fillRect(x + sway + 10, footY - 14 - legLiftL, 7, 18 + legLiftL);
    ctx.fillRect(x + sway + 20, footY - 14 - legLiftR, 7, 18 + legLiftR);
    ctx.fillStyle = "#111722";
    ctx.fillRect(x + sway + 9, footY + 2 - legLiftL, 8, 3);
    ctx.fillRect(x + sway + 20, footY + 2 - legLiftR, 8, 3);
  }

  if (state.runWorldId === "skarn" && !state.slideActive) {
    // Ultra-simple readable gun silhouette: one horizontal + one vertical line.
    const gun = getSkarnPlayerGunPose();
    const shoulderX = gun.shoulderX;
    const shoulderY = gun.shoulderY;
    const handX = gun.aiming ? gun.handX : shoulderX + 6;
    const handY = gun.aiming ? gun.handY : shoulderY + 10;
    // Clean arm silhouette without stepped stray pixels.
    if (gun.aiming) {
      ctx.fillStyle = shirtColor;
      ctx.fillRect(shoulderX - 1, shoulderY - 1, 3, 3); // sleeve
    }
    // Hand block (always present so gun is clearly held).
    ctx.fillStyle = skinBase;
    if (gun.aiming) ctx.fillRect(handX, handY, 2, 3);
    else ctx.fillRect(handX, handY - 1, 2, 3);

    // Gun: horizontal body + vertical grip (always anchored at hand).
    ctx.fillStyle = "#000000";
    if (gun.aiming) {
      ctx.fillRect(handX + 2, handY - 1, 14, 3); // barrel/body (bigger)
      ctx.fillRect(handX + 5, handY + 1, 3, 8); // grip (bigger)
    } else {
      // Slightly lowered idle angle.
      ctx.fillRect(handX + 1, handY + 2, 11, 3); // barrel/body (bigger)
      ctx.fillRect(handX + 4, handY + 4, 3, 7); // grip (bigger)
    }
  }

  if (state.runWorldId === "skarn") {
    // Ice skates for Michael Scarn in Threat Level Midnight.
    const skateY = footY + 5;
    const leftX = x + sway + (state.slideActive ? 32 : 8);
    const rightX = x + sway + (state.slideActive ? 44 : 20);
    const bladeW = state.slideActive ? 16 : 12;
    ctx.fillStyle = "#c6d9ed";
    ctx.fillRect(leftX, skateY, bladeW, 1);
    ctx.fillRect(rightX, skateY, bladeW, 1);
    ctx.fillStyle = "#8fa8c1";
    ctx.fillRect(leftX + 1, skateY + 1, bladeW - 2, 1);
    ctx.fillRect(rightX + 1, skateY + 1, bladeW - 2, 1);
  }

  if (state.attackLeft > 0 && !state.slideActive) {
    const punchY = yTop + 20 + bob;
    ctx.fillStyle = "#ffe189";
    ctx.fillRect(x + 46, punchY, 18, 4);
    ctx.fillStyle = "rgba(255,255,255,0.34)";
    ctx.fillRect(x + 58, punchY - 1, 8, 2);
  }
}

function drawObstacleSprite(obs) {
  if (obs.type === "chili_spill" || obs.type === "ice_patch") {
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(obs.x + 6, GAME.groundY - 3, obs.width - 18, 4);
    if (obs.type === "chili_spill") ctx.fillRect(obs.x + obs.width - 28, GAME.groundY - 5, 24, 5);
  } else if (obs.type === "ladder") {
    const footY = GAME.groundY + 3;
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(obs.x + 8, footY, 12, 3);
    ctx.fillRect(obs.x + 24, footY, 10, 3);
    ctx.fillRect(obs.x + obs.width - 34, footY, 10, 3);
    ctx.fillRect(obs.x + obs.width - 20, footY, 12, 3);
  } else if (obs.type !== "hockey_puck") {
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(obs.x + obs.width * 0.5, GAME.groundY + 4, obs.width * 0.48, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (obs.type === "desk") {
    ctx.fillStyle = "#6b4b31";
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    ctx.fillStyle = "#8d6649";
    ctx.fillRect(obs.x + 6, obs.y + 7, obs.width - 12, 10);
    ctx.fillStyle = "#c4a58c";
    ctx.fillRect(obs.x + 7, obs.y + 22, 14, 8);
    ctx.fillRect(obs.x + 30, obs.y + 22, 14, 8);
    ctx.fillStyle = "#503625";
    ctx.fillRect(obs.x + 4, obs.y + 34, 4, 14);
    ctx.fillRect(obs.x + obs.width - 8, obs.y + 34, 4, 14);
    ctx.fillStyle = "#d9e1ea";
    ctx.fillRect(obs.x + 19, obs.y + 12, 10, 6);
    ctx.fillStyle = "#9ca7b4";
    ctx.fillRect(obs.x + 20, obs.y + 13, 8, 4);
    ctx.fillStyle = "#36465c";
    ctx.fillRect(obs.x + 24, obs.y + 9, 4, 3);
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
    ctx.fillStyle = "#b49772";
    ctx.fillRect(obs.x + 10, obs.y + 11 + wobble, 12, 1);
    ctx.fillRect(obs.x + 9, obs.y + 15 + wobble, 14, 1);
    ctx.fillStyle = "#2b2b2b";
    ctx.fillRect(obs.x + 29, obs.y + 13 + wobble, 2, 1);
    ctx.fillRect(obs.x + 29, obs.y + 14 + wobble, 2, 1);
  } else if (obs.type === "chili_spill") {
    // Kevin's spilled chili: low pool + tipped metal pot touching the floor.
    const floorY = GAME.groundY - 1;
    const spillY = floorY - 9;
    const potX = obs.x + obs.width - 30;
    const potY = floorY - 18;

    // Thick chili spill.
    ctx.fillStyle = "#8f321f";
    ctx.fillRect(obs.x + 6, spillY, obs.width - 36, 8);
    ctx.fillRect(obs.x + 14, spillY - 2, obs.width - 54, 2);
    ctx.fillStyle = "#ad4128";
    ctx.fillRect(obs.x + 10, spillY + 1, obs.width - 44, 5);
    ctx.fillStyle = "#6f2216";
    ctx.fillRect(obs.x + 8, spillY + 7, obs.width - 40, 2);
    ctx.fillStyle = "#d17f58";
    ctx.fillRect(obs.x + 24, spillY + 1, 2, 2);
    ctx.fillRect(obs.x + 33, spillY + 3, 2, 2);
    ctx.fillRect(obs.x + 41, spillY + 2, 2, 2);

    // Pot body (tipped sideways).
    ctx.fillStyle = "#707884";
    ctx.fillRect(potX, potY + 2, 22, 12);
    ctx.fillStyle = "#8a93a1";
    ctx.fillRect(potX + 2, potY + 3, 15, 3);
    ctx.fillStyle = "#4e5663";
    ctx.fillRect(potX + 20, potY + 3, 3, 10);
    ctx.fillStyle = "#2d3441";
    ctx.fillRect(potX - 2, potY + 4, 3, 6); // rear rim
    ctx.fillRect(potX + 6, potY + 12, 10, 2); // bottom edge touch
    ctx.fillStyle = "#3a4250";
    ctx.fillRect(potX + 22, potY + 6, 3, 4); // handle nub

    // Chili dripping out from pot mouth into spill.
    ctx.fillStyle = "#9b3723";
    ctx.fillRect(potX - 4, potY + 9, 6, 2);
    ctx.fillRect(potX - 8, potY + 9, 5, 2);
    ctx.fillRect(potX - 11, potY + 8, 4, 2);
  } else if (obs.type === "ice_patch") {
    // Natural icy patch: rounded blob with broad white frost streaks.
    const floorY = GAME.groundY - 1;
    const iceY = floorY - 10;
    ctx.fillStyle = "#6fc7de";
    ctx.fillRect(obs.x + 10, iceY + 1, obs.width - 24, 9);
    ctx.fillRect(obs.x + 16, iceY - 1, obs.width - 36, 3);
    ctx.fillRect(obs.x + 6, iceY + 3, 8, 5);
    ctx.fillRect(obs.x + obs.width - 15, iceY + 4, 8, 5);
    ctx.fillRect(obs.x + 12, iceY + 9, 10, 2);
    ctx.fillRect(obs.x + obs.width - 24, iceY + 9, 10, 2);

    // Broad white frost streaks.
    ctx.fillStyle = "#eef6ff";
    ctx.fillRect(obs.x + 20, iceY + 4, 28, 2);
    ctx.fillRect(obs.x + 18, iceY + 6, 22, 2);
    ctx.fillRect(obs.x + 44, iceY + 3, 12, 2);
    ctx.fillRect(obs.x + 28, iceY + 8, 28, 2);
    ctx.fillRect(obs.x + 26, iceY + 10, 22, 1);
    ctx.fillRect(obs.x + 52, iceY + 7, 10, 2);

    // Small dark crack marks near the top-left.
    ctx.fillStyle = "#253245";
    ctx.fillRect(obs.x + 14, iceY + 2, 2, 1);
    ctx.fillRect(obs.x + 16, iceY + 3, 2, 1);
    ctx.fillRect(obs.x + 17, iceY + 1, 1, 1);
    ctx.fillRect(obs.x + 12, iceY + 4, 2, 1);
    ctx.fillRect(obs.x + 13, iceY + 5, 1, 1);
  } else if (obs.type === "paper_pile") {
    ctx.fillStyle = "#f0f3f8";
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    ctx.fillStyle = "#d8deea";
    for (let i = 0; i < 3; i += 1) ctx.fillRect(obs.x + 4, obs.y + 6 + i * 7, obs.width - 8, 2);
    ctx.fillStyle = "#f8fbff";
    ctx.fillRect(obs.x + obs.width - 9, obs.y + 2, 7, 4);
    ctx.fillStyle = "#cbd4e2";
    ctx.fillRect(obs.x + obs.width - 5, obs.y + 2, 1, 4);
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
    ctx.fillStyle = "#eac25b";
    ctx.fillRect(obs.x + 20, obs.y + 14, 10, 4);
    ctx.fillRect(obs.x + 34, obs.y + 28, 10, 4);
    ctx.fillStyle = "#4b4b4b";
    ctx.fillRect(obs.x + 24, obs.y + 15, 2, 2);
    ctx.fillRect(obs.x + 38, obs.y + 29, 2, 2);
  } else if (obs.type === "ladder") {
    // Fold-out aluminum A-frame ladder with slight perspective twist.
    const clearance = 24;
    const bottom = obs.y + obs.height;
    const topY = obs.y + 1;
    const frameBottom = bottom - 2; // visibly grounded
    const openBottom = bottom - clearance; // slide clearance threshold

    const frontLeftTop = obs.x + 16;
    const frontRightTop = obs.x + obs.width - 28;
    const frontLeftBottom = obs.x + 8;
    const frontRightBottom = obs.x + obs.width - 14;

    const rearLeftTop = frontLeftTop + 8;
    const rearRightTop = frontRightTop + 6;
    const rearLeftBottom = frontLeftBottom + 14;
    const rearRightBottom = frontRightBottom + 10;

    // Red top cap.
    ctx.fillStyle = "#c7423a";
    ctx.fillRect(frontLeftTop - 2, topY, frontRightTop - frontLeftTop + 8, 6);
    ctx.fillStyle = "#e86b61";
    ctx.fillRect(frontLeftTop, topY + 1, frontRightTop - frontLeftTop + 4, 2);

    // Rear frame (draw first so it sits behind front frame).
    const rearTopY = topY + 7;
    const rearHeight = frameBottom - rearTopY;
    for (let i = 0; i < rearHeight; i += 1) {
      const t = i / Math.max(1, rearHeight - 1);
      const xl = Math.round(rearLeftTop + (rearLeftBottom - rearLeftTop) * t);
      const xr = Math.round(rearRightTop + (rearRightBottom - rearRightTop) * t);
      ctx.fillStyle = "#aebac8";
      ctx.fillRect(xl, rearTopY + i, 3, 1);
      ctx.fillRect(xr, rearTopY + i, 3, 1);
      ctx.fillStyle = "#8d9aa9";
      ctx.fillRect(xl + 2, rearTopY + i, 1, 1);
      ctx.fillRect(xr + 2, rearTopY + i, 1, 1);
    }

    // Front rails.
    const frontTopY = topY + 5;
    const frontHeight = frameBottom - frontTopY;
    for (let i = 0; i < frontHeight; i += 1) {
      const t = i / Math.max(1, frontHeight - 1);
      const xl = Math.round(frontLeftTop + (frontLeftBottom - frontLeftTop) * t);
      const xr = Math.round(frontRightTop + (frontRightBottom - frontRightTop) * t);
      ctx.fillStyle = "#c5ced8";
      ctx.fillRect(xl, frontTopY + i, 4, 1);
      ctx.fillRect(xr, frontTopY + i, 4, 1);
      ctx.fillStyle = "#95a2b1";
      ctx.fillRect(xl + 3, frontTopY + i, 1, 1);
      ctx.fillRect(xr + 3, frontTopY + i, 1, 1);
    }

    // Front ladder steps.
    ctx.fillStyle = "#d8e0ea";
    for (let y = topY + 16; y <= openBottom - 8; y += 11) {
      const t = (y - frontTopY) / Math.max(1, frontHeight);
      const xl = Math.round(frontLeftTop + (frontLeftBottom - frontLeftTop) * t) + 4;
      const xr = Math.round(frontRightTop + (frontRightBottom - frontRightTop) * t);
      ctx.fillRect(xl, y, Math.max(6, xr - xl + 1), 3);
    }

    // Rear frame steps.
    ctx.fillStyle = "#c3cedb";
    for (let y = topY + 25; y <= openBottom - 12; y += 15) {
      const t = (y - rearTopY) / Math.max(1, rearHeight);
      const xl = Math.round(rearLeftTop + (rearLeftBottom - rearLeftTop) * t) + 3;
      const xr = Math.round(rearRightTop + (rearRightBottom - rearRightTop) * t);
      ctx.fillRect(xl, y, Math.max(5, xr - xl), 2);
    }

    // Side spreader bars.
    ctx.fillStyle = "#8a96a8";
    ctx.fillRect(frontLeftBottom + 5, topY + 49, 12, 2);
    ctx.fillRect(rearRightBottom - 11, topY + 49, 12, 2);
    ctx.fillRect(frontLeftBottom + 8, topY + 65, 10, 2);
    ctx.fillRect(rearRightBottom - 9, topY + 65, 10, 2);

    // Red foot pads touching floor.
    ctx.fillStyle = "#b9312b";
    ctx.fillRect(frontLeftBottom - 2, frameBottom - 2, 7, 2);
    ctx.fillRect(frontRightBottom - 2, frameBottom - 2, 7, 2);
    ctx.fillStyle = "#9c251f";
    ctx.fillRect(rearLeftBottom - 1, frameBottom - 2, 6, 2);
    ctx.fillRect(rearRightBottom - 1, frameBottom - 2, 6, 2);
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
    ctx.fillRect(poleX + poleW, armY + 2, 3, 2);

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
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(obs.x + 7, obs.y + 5, 3, 2);
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
    ctx.fillStyle = "#ffd4cc";
    ctx.fillRect(bodyX + 4, bodyY + 4, 2, bodyH - 8);
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
    ctx.fillStyle = "#f5df95";
    ctx.fillRect(obs.x + 11, obs.y + 3, obs.width - 22, 2);
    ctx.fillStyle = "#0a0c12";
    ctx.fillRect(obs.x + 18, obs.y + 11, obs.width - 36, 1);
  } else if (obs.type === "jan_folder" || obs.type === "folder") {
    ctx.fillStyle = "#d6a95c";
    ctx.fillRect(obs.x, obs.y + 3, obs.width, obs.height - 3);
    ctx.fillStyle = "#e8c480";
    ctx.fillRect(obs.x + 4, obs.y, 12, 4);
    ctx.fillStyle = "#b9883f";
    ctx.fillRect(obs.x + 3, obs.y + 8, obs.width - 6, 1);
    ctx.fillRect(obs.x + 3, obs.y + 12, obs.width - 6, 1);
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
    ctx.fillStyle = "#27425f";
    ctx.fillRect(obs.x + 17, obs.y + 20, 2, 9);

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
    ctx.fillStyle = "#aeb8c8";
    ctx.fillRect(obs.x + obs.width - 6, obs.y + 2, 1, obs.height - 4);
  } else if (obs.type === "mung_beans") {
    ctx.fillStyle = "#8db34c";
    ctx.beginPath();
    ctx.arc(obs.x + 6, obs.y + 10, 5, 0, Math.PI * 2);
    ctx.arc(obs.x + 14, obs.y + 8, 5, 0, Math.PI * 2);
    ctx.arc(obs.x + 11, obs.y + 15, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#7a9d3f";
    ctx.fillRect(obs.x + 4, obs.y + 10, 3, 1);
    ctx.fillRect(obs.x + 13, obs.y + 8, 3, 1);
  } else {
    ctx.fillStyle = "#b79e6a";
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    ctx.fillStyle = "#d9c38b";
    ctx.fillRect(obs.x + 6, obs.y + 5, obs.width - 12, 4);
  }

  // 16-bit edge pass only for boxy sprites; skip organic/projectile shapes to avoid line artifacts.
  const boxyEdgeTypes = new Set([
    "desk",
    "paper_pile",
    "shelf",
    "lightpole",
    "hydrant",
    "jan_folder",
    "folder",
    "bystander",
    "paper_ream",
    "hockey_puck",
    "goldenface_minion",
  ]);
  if (boxyEdgeTypes.has(obs.type)) {
    ctx.fillStyle = "rgba(10, 14, 24, 0.28)";
    ctx.fillRect(obs.x, obs.y + obs.height - 1, obs.width, 1);
  }
  if (boxyEdgeTypes.has(obs.type)) {
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.fillRect(obs.x + 1, obs.y + 1, Math.max(0, obs.width - 2), 1);
  }

  // Type-specific extra detail accents.
  if (obs.type === "desk") {
    ctx.fillStyle = "#d8bca7";
    ctx.fillRect(obs.x + 6, obs.y + 14, obs.width - 12, 2);
    ctx.fillStyle = "#5a3f2a";
    ctx.fillRect(obs.x + 10, obs.y + 32, 6, 2);
    ctx.fillRect(obs.x + obs.width - 16, obs.y + 32, 6, 2);
  } else if (obs.type === "angela_cat") {
    ctx.fillStyle = "#b39b7d";
    ctx.fillRect(obs.x + 11, obs.y + 14, 10, 1);
    ctx.fillStyle = "#2b2b2b";
    ctx.fillRect(obs.x + 20, obs.y + 12, 1, 1);
    ctx.fillRect(obs.x + 27, obs.y + 12, 1, 1);
  } else if (obs.type === "chili_spill") {
    const floorY = GAME.groundY - 1;
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.fillRect(obs.x + 18, floorY - 8, 18, 1);
    ctx.fillStyle = "#b8c1cf";
    ctx.fillRect(obs.x + obs.width - 25, floorY - 15, 10, 1);
    ctx.fillStyle = "rgba(0,0,0,0.26)";
    ctx.fillRect(obs.x + 8, floorY - 1, obs.width - 38, 1);
  } else if (obs.type === "ice_patch") {
    const floorY = GAME.groundY - 1;
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(obs.x + 18, floorY - 9, obs.width - 36, 1);
  } else if (obs.type === "paper_pile" || obs.type === "paper_ream") {
    ctx.fillStyle = "#c8cfdb";
    for (let yy = 0; yy < obs.height; yy += 5) ctx.fillRect(obs.x + 2, obs.y + yy, obs.width - 4, 1);
  } else if (obs.type === "shelf") {
    ctx.fillStyle = "#bcc7d8";
    ctx.fillRect(obs.x + 8, obs.y + 6, obs.width - 16, 1);
    ctx.fillRect(obs.x + 8, obs.y + 20, obs.width - 16, 1);
    ctx.fillRect(obs.x + 8, obs.y + 34, obs.width - 16, 1);
  } else if (obs.type === "ladder") {
    const frameBottom = obs.y + obs.height - 2;
    ctx.fillStyle = "#b8c7d9";
    for (let ry = obs.y + 14; ry < frameBottom - 2; ry += 10) ctx.fillRect(obs.x + 16, ry, obs.width - 34, 1);
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.fillRect(obs.x + 24, obs.y + 2, obs.width - 44, 1);
  } else if (obs.type === "lightpole") {
    ctx.fillStyle = "rgba(255,224,160,0.25)";
    ctx.fillRect(obs.x + Math.floor(obs.width * 0.2), obs.y + 8, Math.floor(obs.width * 0.6), 20);
  } else if (obs.type === "hydrant") {
    ctx.fillStyle = "#df5b4c";
    ctx.fillRect(obs.x + 10, obs.y + 12, obs.width - 20, 2);
    ctx.fillRect(obs.x + 10, obs.y + 24, obs.width - 20, 2);
  } else if (obs.type === "bystander" || obs.type === "goldenface_minion") {
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(obs.x + 8, obs.y + 24, obs.width - 16, 2);
  } else if (obs.type === "jan_folder" || obs.type === "folder") {
    ctx.fillStyle = "#efcc8b";
    ctx.fillRect(obs.x + 3, obs.y + 5, obs.width - 8, 1);
    ctx.fillStyle = "#b28546";
    ctx.fillRect(obs.x + 3, obs.y + obs.height - 1, obs.width - 6, 1);
  } else if (obs.type === "mung_beans") {
    ctx.fillStyle = "#7ca43f";
    ctx.fillRect(obs.x + 8, obs.y + 6, 3, 1);
    ctx.fillRect(obs.x + 12, obs.y + 12, 3, 1);
  } else if (obs.type === "jim_snowball") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(obs.x + 9, obs.y + 8, 2, 2);
  } else if (obs.type === "hockey_puck") {
    ctx.fillStyle = "#546079";
    ctx.fillRect(obs.x + 5, obs.y + 2, obs.width - 10, 1);
  }
}

function drawObstacles() {
  for (const obs of state.obstacles) drawObstacleSprite(obs);
}

function drawCollectibles() {
  for (const coin of state.collectibles) {
    const x = coin.x;
    const y = coin.y;
    if (coin.type === "schrute_buck") {
      // Bill-style pickup, matching Schrute Buck vibe.
      ctx.fillStyle = "#c9d8d4";
      ctx.fillRect(x + 1, y + 4, 30, 18);
      ctx.fillStyle = "#93a9a4";
      ctx.fillRect(x + 2, y + 5, 28, 16);
      ctx.fillStyle = "#dde9e6";
      ctx.fillRect(x + 4, y + 7, 24, 12);
      ctx.strokeStyle = "#4d6460";
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 2.5, y + 5.5, 27, 15);
      ctx.fillStyle = "#49615d";
      ctx.fillRect(x + 12, y + 8, 8, 10);
      ctx.fillStyle = "#f0f6f4";
      ctx.fillRect(x + 15, y + 9, 2, 8);
      ctx.fillStyle = "#516b66";
      ctx.font = "bold 8px Trebuchet MS";
      ctx.fillText("$", x + 7, y + 13);
      ctx.fillText("1", x + 4, y + 21);
      ctx.fillText("1", x + 25, y + 21);
    } else {
      // Nickel-style pickup, coin on the right.
      ctx.fillStyle = "#9298a2";
      ctx.beginPath();
      ctx.arc(x + 13, y + 13, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#cfd4db";
      ctx.beginPath();
      ctx.arc(x + 13, y + 13, 8.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#5c6370";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x + 13, y + 13, 10.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#7f8792";
      ctx.fillRect(x + 12, y + 8, 2, 10);
      ctx.fillStyle = "#565e6a";
      ctx.font = "bold 7px Trebuchet MS";
      ctx.fillText("5", x + 11, y + 15);
    }
  }
}

function drawSkarnAimGuide() {
  if (state.runWorldId !== "skarn" || !state.skarnAimActive || !state.player) return;
  const gun = getSkarnPlayerGunPose();
  const aimY = getSkarnAimY();
  const target = getSkarnGoldenfaceHitbox();
  const endX = target.x + target.width * 0.5;

  for (let x = gun.muzzleX + 3; x < endX; x += 10) {
    const t = (x - gun.muzzleX) / Math.max(1, endX - gun.muzzleX);
    const y = gun.muzzleY + (aimY - gun.muzzleY) * t;
    ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
    ctx.fillRect(x, y, 5, 2);
  }
  ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
  ctx.fillRect(target.x - 2, aimY - 1, target.width + 4, 2);
}

function drawCurrencyIcon(type, x, y, scale = 1) {
  if (type === "schrute_buck") {
    ctx.fillStyle = "#c9d8d4";
    ctx.fillRect(x + 1 * scale, y + 2 * scale, 14 * scale, 10 * scale);
    ctx.fillStyle = "#93a9a4";
    ctx.fillRect(x + 2 * scale, y + 3 * scale, 12 * scale, 8 * scale);
    ctx.fillStyle = "#dde9e6";
    ctx.fillRect(x + 3 * scale, y + 4 * scale, 10 * scale, 6 * scale);
    ctx.strokeStyle = "#4d6460";
    ctx.lineWidth = Math.max(1, scale * 0.8);
    ctx.strokeRect(x + 2.5 * scale, y + 3.5 * scale, 11 * scale, 7 * scale);
    ctx.fillStyle = "#49615d";
    ctx.fillRect(x + 6 * scale, y + 4 * scale, 3 * scale, 5 * scale);
    ctx.fillStyle = "#f0f6f4";
    ctx.fillRect(x + 7 * scale, y + 5 * scale, 1 * scale, 3 * scale);
    return 16 * scale;
  }

  ctx.fillStyle = "#9298a2";
  ctx.beginPath();
  ctx.arc(x + 7 * scale, y + 7 * scale, 6 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#cfd4db";
  ctx.beginPath();
  ctx.arc(x + 7 * scale, y + 7 * scale, 4.5 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5c6370";
  ctx.lineWidth = Math.max(1, scale * 0.8);
  ctx.beginPath();
  ctx.arc(x + 7 * scale, y + 7 * scale, 5.5 * scale, 0, Math.PI * 2);
  ctx.stroke();
  return 15 * scale;
}

function splitTokenToFit(token, maxWidth, tokenWidthFn) {
  if (!token || tokenWidthFn(token) <= maxWidth) return [token];
  const parts = [];
  let rest = token;
  while (rest.length > 0) {
    let cut = Math.max(1, rest.length);
    while (cut > 1 && tokenWidthFn(rest.slice(0, cut)) > maxWidth) cut -= 1;
    parts.push(rest.slice(0, cut));
    rest = rest.slice(cut);
  }
  return parts;
}

function applyEllipsisToLine(tokens, maxWidth, tokenWidthFn, spaceWidth) {
  if (!tokens.length) return ["..."];
  const result = tokens.slice();
  const ellipsisWidth = tokenWidthFn("...");
  const lineWidth = (arr) => {
    let width = 0;
    for (let i = 0; i < arr.length; i += 1) {
      width += tokenWidthFn(arr[i]);
      if (i > 0) width += spaceWidth;
    }
    return width;
  };

  if (result[result.length - 1] === "[SB]" || result[result.length - 1] === "[SN]") result.push("...");
  else {
    let tail = result[result.length - 1] || "";
    while (tail.length > 0 && tokenWidthFn(`${tail}...`) > maxWidth) tail = tail.slice(0, -1);
    result[result.length - 1] = `${tail || ""}...`;
  }

  while (result.length > 1 && lineWidth(result) > maxWidth) result.splice(result.length - 2, 1);
  if (lineWidth(result) > maxWidth) {
    let dots = "...";
    while (dots.length > 1 && tokenWidthFn(dots) > maxWidth) dots = dots.slice(0, -1);
    return [dots];
  }
  if (!result.length) return ellipsisWidth <= maxWidth ? ["..."] : ["."]; // defensive fallback
  return result;
}

function layoutWrappedTokens(rawTokens, maxWidth, maxLines, tokenWidthFn) {
  const tokens = rawTokens.filter(Boolean);
  const spaceW = ctx.measureText(" ").width;
  const lines = [];
  let line = [];
  let lineW = 0;
  let overflowed = false;

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    const parts =
      token === "[SB]" || token === "[SN]" ? [token] : splitTokenToFit(token, maxWidth, tokenWidthFn);
    for (let j = 0; j < parts.length; j += 1) {
      const part = parts[j];
      const w = tokenWidthFn(part);
      const candidate = line.length ? lineW + spaceW + w : w;
      if (candidate <= maxWidth || line.length === 0) {
        line.push(part);
        lineW = candidate;
      } else {
        lines.push(line);
        if (lines.length >= maxLines) {
          overflowed = true;
          break;
        }
        line = [part];
        lineW = w;
      }
    }
    if (overflowed) break;
  }
  if (!overflowed && line.length > 0 && lines.length < maxLines) lines.push(line);
  if (!lines.length) lines.push([""]);

  const consumedTokens = lines.flat().filter(Boolean).length;
  const rawTokenCount = tokens.length;
  if (overflowed || consumedTokens < rawTokenCount) {
    const idx = Math.max(0, Math.min(maxLines - 1, lines.length - 1));
    lines[idx] = applyEllipsisToLine(lines[idx], maxWidth, tokenWidthFn, spaceW);
  }
  return lines;
}

function drawWrappedTextWithCurrencyIcons(text, x, y, maxWidth, lineHeight, maxLines = 2) {
  const tokens = String(text || "").split(/\s+/).filter(Boolean);
  const tokenWidth = (token) => {
    if (token === "[SB]") return 18;
    if (token === "[SN]") return 16;
    return ctx.measureText(token).width;
  };
  const lines = layoutWrappedTokens(tokens, maxWidth, maxLines, tokenWidth);
  const spaceW = ctx.measureText(" ").width;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y - lineHeight + 2, maxWidth, lineHeight * maxLines + 4);
  ctx.clip();
  for (let i = 0; i < lines.length; i += 1) {
    let cx = x;
    const baseline = y + i * lineHeight;
    const row = lines[i];
    for (let j = 0; j < row.length; j += 1) {
      const token = row[j];
      if (j > 0) cx += spaceW;
      if (token === "[SB]") cx += drawCurrencyIcon("schrute_buck", cx, baseline - 12, 0.9);
      else if (token === "[SN]") cx += drawCurrencyIcon("stanley_nickel", cx, baseline - 11, 0.9);
      else {
        ctx.fillText(token, cx, baseline);
        cx += ctx.measureText(token).width;
      }
    }
  }
  ctx.restore();
  return lines.length;
}

function drawPamQuestBackgroundSprite() {
  if (!state.pamQuestRun || !state.pamVisible) return;

  const s = 1.72;
  const x = state.pamX;
  const y = state.pamY;
  const bob = Math.sin(state.worldTimeSec * 4.2) * 1.4;

  drawHeroPortraitSprite(x, y + 58 + bob, s, { label: "Pam", style: "pam", hideTie: true, shadow: true });
  // Clipboard detail so she pops in the warehouse background.
  ctx.fillStyle = "#f6ddb0";
  ctx.fillRect(x + 32 * s, y + 25 * s + bob, 8 * s, 10 * s);
  ctx.fillStyle = "#ddc28a";
  ctx.fillRect(x + 33 * s, y + 24 * s + bob, 4 * s, 2 * s);

  ctx.fillStyle = "#ffe7b1";
  ctx.font = "bold 14px Trebuchet MS";
  ctx.fillText("P!", x + 14 * s, y - 6 + bob);
}

function drawHud() {
  // Higher contrast pass: keep HUD text readable against bright level art.
  drawPixelPanel(12, 12, 560, 188, "rgba(8,15,29,0.95)", "rgba(6,12,22,0.95)", "#7ecfff", "rgba(218,236,255,0.65)");

  const leftX = 20;
  const rightX = 300;
  const row1Y = 34;
  const row2Y = 58;
  const row3Y = 82;
  const row4Y = 106;
  const row5Y = 130;
  const row6Y = 154;
  const row7Y = 176;

  ctx.fillStyle = "#f3f8ff";
  ctx.font = "16px Trebuchet MS";
  ctx.fillText(`Runner: ${state.player.preset.label}`, leftX, row1Y);
  ctx.fillText(`HP: ${state.player.hp}`, leftX, row2Y);
  ctx.fillText(`Style: ${Math.floor(state.style)}`, leftX, row3Y);

  ctx.fillStyle = "#f5f8ff";
  ctx.fillText("Wallet:", leftX, row4Y);
  let walletX = leftX + 74;
  walletX += drawCurrencyIcon("schrute_buck", walletX, row4Y - 11, 1.0) + 6;
  const walletSbText = `${state.saveData.currencies.schruteBucks}`;
  ctx.fillText(walletSbText, walletX, row4Y);
  walletX += ctx.measureText(walletSbText).width + 18;
  walletX += drawCurrencyIcon("stanley_nickel", walletX, row4Y - 10, 1.0) + 6;
  ctx.fillText(`${state.saveData.currencies.stanleyNickels}`, walletX, row4Y);

  ctx.fillStyle = "#ffdfa6";
  ctx.fillText("Run Loot:", leftX, row5Y);
  let lootX = leftX + 84;
  lootX += drawCurrencyIcon("schrute_buck", lootX, row5Y - 11, 0.95) + 6;
  const runSbText = `+${state.runCollectedSchruteBucks}`;
  ctx.fillText(runSbText, lootX, row5Y);
  lootX += ctx.measureText(runSbText).width + 18;
  lootX += drawCurrencyIcon("stanley_nickel", lootX, row5Y - 10, 0.95) + 6;
  ctx.fillText(`+${state.runCollectedStanleyNickels}`, lootX, row5Y);

  ctx.fillStyle = "#ffd54d";
  ctx.fillText(`x${state.multiplier} Hardcore`, rightX, row1Y);

  const timeLeft = Math.max(0, GAME.runTimeSec - state.worldTimeSec);
  const difficulty = LEVEL_DIFFICULTY[state.runWorldId] || LEVEL_DIFFICULTY.bullpen;
  ctx.fillStyle = "#d4e6ff";
  if (state.runWorldId === "pursuit") ctx.fillText("Time: -- (Chase Mode)", rightX, row2Y);
  else if (state.runWorldId === "skarn") ctx.fillText("Time: -- (Showdown)", rightX, row2Y);
  else ctx.fillText(`Time: ${timeLeft.toFixed(1)}s`, rightX, row2Y);
  ctx.fillText(`World: ${THEME_LABELS[state.theme] || state.theme}`, rightX, row3Y);
  ctx.fillText(`Difficulty: ${difficulty.label}`, rightX, row4Y);
  if (state.runWorldId === "pursuit") {
    ctx.fillStyle = "#ffe38f";
    ctx.fillText(`Catch Strangler: ${Math.ceil(state.tobyDistance)}m`, rightX, row5Y);
  } else if (state.runWorldId === "skarn") {
    ctx.fillStyle = "#ffe38f";
    ctx.fillText(`Goldenface Hits: ${state.skarnGoldenfaceHits}/10`, rightX, row5Y);
  }
  if (state.pamQuestRun) {
    // Dedicated quest panel prevents bright-text-on-bright-background issues.
    const qx = 584;
    const qy = 108;
    const qw = 366;
    const qh = 54;
    drawPixelPanel(qx, qy, qw, qh, "rgba(10,17,32,0.94)", "rgba(8,14,24,0.94)", "#7ecfff", "rgba(212,232,255,0.6)");
    ctx.fillStyle = "#ffeeb2";
    ctx.font = "bold 14px Trebuchet MS";
    drawWrappedText(`Find Pam: ${state.pamSpottedCount}/${state.pamRequiredCount}  Press P when she appears`, qx + 10, qy + 20, qw - 20, 15, 2);
    ctx.font = "16px Trebuchet MS";
  }
  ctx.fillStyle = "#d4e6ff";

  if (state.slideActive) {
    ctx.fillStyle = "#8fdcff";
    ctx.fillText(`Slide: ${Math.ceil(state.slideSpeed)}`, rightX + 164, row1Y);
  }

  // Keep controls and world-specific instructions inside the HUD panel.
  ctx.fillStyle = "#d4e6ff";
  ctx.font = "14px Trebuchet MS";
  if (state.runWorldId === "skarn") {
    ctx.fillText("Jump: J  Hold K: Aim  Release K: Shoot", leftX, row6Y);
    ctx.fillText("Skarn: Line up guide on Goldenface, then release K.", leftX, row7Y);
  } else if (state.runWorldId === "pursuit") {
    ctx.fillText("Jump: J  Hit: K  Slide: Hold Space  Pause: Enter", leftX, row6Y);
    ctx.fillText("Pursuit: Build multiplier, catch up to the car, then jump on.", leftX, row7Y);
  } else {
    ctx.fillText("Jump: J  Hit: K  Slide: Hold Space", leftX, row6Y);
    ctx.fillText("Pause: Enter", leftX, row7Y);
  }
  ctx.font = "16px Trebuchet MS";

  if (state.cheatInvincible) {
    ctx.fillStyle = "#9dffd0";
    ctx.fillText("Cheat: No Injury (BEETS)", 480, 56);
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

function drawPerformanceReviewOverlay() {
  if (!state.gameOver || !state.reviewData) return;

  const progress = Math.max(0, Math.min(1, state.reviewAnimSec / state.reviewAnimDuration));
  const ease = 1 - Math.pow(1 - progress, 3);
  const shownSb = Math.round(state.reviewData.prevSb + (state.reviewData.totalSb - state.reviewData.prevSb) * ease);
  const shownSn = Math.round(state.reviewData.prevSn + (state.reviewData.totalSn - state.reviewData.prevSn) * ease);
  const shownEarnedSb = Math.round(state.reviewData.earnedSb * ease);
  const shownEarnedSn = Math.round(state.reviewData.earnedSn * ease);
  const targetStars = Math.max(1, Math.min(5, state.reviewData.stars || 1));
  const starCount = Math.max(1, Math.ceil(targetStars * progress));

  const panel = { x: 88, y: 84, w: 784, h: 370 };
  drawPixelPanel(panel.x, panel.y, panel.w, panel.h, "rgba(11,24,48,0.9)", "rgba(8,18,36,0.9)", "#94dcff", "rgba(220,240,255,0.72)");

  ctx.fillStyle = "#ffd66e";
  ctx.font = "bold 40px Trebuchet MS";
  ctx.fillText("PERFORMANCE REVIEW", panel.x + 24, panel.y + 52);

  ctx.fillStyle = "#ffe8ad";
  ctx.font = "bold 24px Trebuchet MS";
  let stars = "";
  for (let i = 0; i < 5; i += 1) stars += i < starCount ? "★ " : "☆ ";
  ctx.fillText(stars.trim(), panel.x + 26, panel.y + 86);
  ctx.fillStyle = "#d5e9ff";
  ctx.font = "bold 21px Trebuchet MS";
  ctx.fillText(`${state.reviewData.runner} - ${state.reviewData.world}`, panel.x + 24, panel.y + 118);

  ctx.font = "20px Trebuchet MS";
  ctx.fillStyle = "#f2f6ff";
  ctx.fillText(`Style: ${state.reviewData.style}`, panel.x + 24, panel.y + 166);
  ctx.fillText(`Best Hardcore Chain: ${state.reviewData.bestChain}`, panel.x + 24, panel.y + 194);

  ctx.fillStyle = "#ffd87d";
  ctx.font = "bold 26px Trebuchet MS";
  const reviewSbIconW = drawCurrencyIcon("schrute_buck", panel.x + 24, panel.y + 238, 1.55);
  ctx.fillText(`+${shownEarnedSb}`, panel.x + 24 + reviewSbIconW + 12, panel.y + 254);
  const reviewSnIconW = drawCurrencyIcon("stanley_nickel", panel.x + 24, panel.y + 270, 1.55);
  ctx.fillText(`+${shownEarnedSn}`, panel.x + 24 + reviewSnIconW + 12, panel.y + 286);
  ctx.fillStyle = "#b9ffd0";
  ctx.font = "bold 20px Trebuchet MS";
  ctx.fillText("Wallet:", panel.x + 24, panel.y + 320);
  const walletSbIconW = drawCurrencyIcon("schrute_buck", panel.x + 106, panel.y + 306, 1.15);
  ctx.fillText(`${shownSb}`, panel.x + 106 + walletSbIconW + 8, panel.y + 320);
  const walletSnIconW = drawCurrencyIcon("stanley_nickel", panel.x + 196, panel.y + 307, 1.15);
  ctx.fillText(`${shownSn}`, panel.x + 196 + walletSnIconW + 8, panel.y + 320);

  // David Wallace portrait card.
  const px = panel.x + panel.w - 252;
  const py = panel.y + 62;
  const pw = 212;
  const ph = 252;
  drawPixelPanel(px, py, pw, ph, "rgba(18,38,70,0.96)", "rgba(13,29,53,0.96)", "#8dcfff", "rgba(212,233,255,0.72)");
  ctx.fillStyle = "#becde2";
  ctx.fillRect(px + 54, py + 24, 104, 154);
  drawPixelTexture(px + 54, py + 24, 104, 154, "rgba(25,35,58,0.08)", "rgba(255,255,255,0.12)");
  drawHeroPortraitSprite(px + 64, py + 170, 2.6, {
    label: "David Wallace",
    style: "david",
    shirtColor: "#0f1722",
    tieColor: "#f6f8fc",
    shadow: false,
  });

  // Bottom caption area clipped to card bounds so text can never hang out.
  ctx.save();
  ctx.beginPath();
  ctx.rect(px + 10, py + 186, pw - 20, ph - 194);
  ctx.clip();
  ctx.fillStyle = "#d7e8ff";
  ctx.font = "bold 16px Trebuchet MS";
  drawWrappedText("David Wallace", px + 14, py + 202, pw - 28, 16, 1);
  ctx.fillStyle = "#ffe9bc";
  ctx.font = "bold 11px Trebuchet MS";
  drawWrappedText(state.reviewData.endingLine, px + 12, py + 219, pw - 24, 11, 4);
  ctx.restore();

  // Review progress strip, clipped so it can never spill outside the panel.
  const stripX = panel.x + 18;
  const stripY = panel.y + panel.h - 14;
  const stripW = panel.w - 36;
  const stripH = 6;
  const fillW = Math.max(0, Math.min(stripW, stripW * ease));
  ctx.fillStyle = "rgba(255, 229, 160, 0.22)";
  ctx.fillRect(stripX, stripY, stripW, stripH);
  ctx.globalAlpha = 0.5 + ease * 0.4;
  ctx.fillStyle = "#ffe7aa";
  ctx.fillRect(stripX, stripY, fillW, stripH);
  ctx.globalAlpha = 1;

  // Subtle moving sheen kept inside the filled area.
  if (fillW > 4) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(stripX, stripY, fillW, stripH);
    ctx.clip();
    ctx.fillStyle = "rgba(255,255,255,0.36)";
    const shineX = stripX + ((state.elapsedSec * 64) % (stripW + 24)) - 12;
    ctx.fillRect(shineX, stripY, 12, stripH);
    ctx.restore();
  }
}

function drawPursuitTarget() {
  if (state.runWorldId !== "pursuit") return;

  const { x: carX, y: carY } = getPursuitCarPosition();
  const roadTop = GAME.groundY - 8;

  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath();
  ctx.ellipse(carX + 100, roadTop + 13, 104, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Large black car.
  ctx.fillStyle = "#12161d";
  ctx.fillRect(carX + 8, carY + 30, 202, 24);   // lower body
  ctx.fillRect(carX + 28, carY + 21, 164, 11);  // shoulder
  ctx.fillRect(carX + 52, carY + 7, 116, 15);   // roof/cabin
  ctx.fillRect(carX + 2, carY + 36, 10, 10);    // front bumper
  ctx.fillRect(carX + 204, carY + 33, 10, 12);  // rear bumper

  ctx.fillStyle = "#232a35";
  ctx.fillRect(carX + 8, carY + 52, 202, 2);
  ctx.fillRect(carX + 178, carY + 10, 10, 12);

  // Windows and frame.
  ctx.fillStyle = "#26384f";
  ctx.fillRect(carX + 60, carY + 10, 90, 10);
  ctx.fillStyle = "#7da1c7";
  ctx.fillRect(carX + 64, carY + 12, 30, 6);
  ctx.fillRect(carX + 98, carY + 12, 48, 6);
  ctx.fillStyle = "#344a64";
  ctx.fillRect(carX + 96, carY + 10, 3, 10);

  // Lights and plate.
  ctx.fillStyle = "#ffe2a8";
  ctx.fillRect(carX + 4, carY + 37, 4, 5);
  ctx.fillStyle = "#7e1717";
  ctx.fillRect(carX + 206, carY + 37, 4, 6);
  ctx.fillStyle = "#f1e7c4";
  ctx.fillRect(carX + 156, carY + 42, 16, 4);

  // Wheels.
  ctx.fillStyle = "#07090d";
  ctx.fillRect(carX + 48, carY + 48, 24, 16);
  ctx.fillRect(carX + 144, carY + 48, 24, 16);
  ctx.fillStyle = "#151b24";
  ctx.fillRect(carX + 54, carY + 52, 12, 8);
  ctx.fillRect(carX + 150, carY + 52, 12, 8);
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
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const tokenWidth = (token) => ctx.measureText(token).width;
  const lines = layoutWrappedTokens(words, maxWidth, maxLines, tokenWidth);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y - lineHeight + 2, maxWidth, lineHeight * maxLines + 4);
  ctx.clip();
  for (let i = 0; i < lines.length; i += 1) ctx.fillText(lines[i].join(" "), x, y + i * lineHeight);
  ctx.restore();
  return lines.length;
}

function drawPixelTexture(x, y, w, h, tint = "rgba(8,14,24,0.12)", light = "rgba(255,255,255,0.08)") {
  ctx.fillStyle = tint;
  for (let py = y + 2; py < y + h - 2; py += 6) {
    const xShift = ((py - y) / 6) % 2 === 0 ? 0 : 3;
    for (let px = x + 2 + xShift; px < x + w - 3; px += 12) {
      ctx.fillRect(px, py, 3, 1);
    }
  }
  ctx.fillStyle = light;
  for (let py = y + 1; py < y + h; py += 4) ctx.fillRect(x + 1, py, w - 2, 1);
}

function drawPixelPanel(x, y, w, h, fillTop, fillBottom, border = "#8bc8ff", bevel = "#dcefff") {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, fillTop);
  g.addColorStop(1, fillBottom);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  drawPixelTexture(x, y, w, h);
  ctx.strokeStyle = border;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = bevel;
  ctx.fillRect(x + 1, y + 1, w - 2, 1);
  ctx.fillRect(x + 1, y + 1, 1, h - 2);
  ctx.fillStyle = "rgba(10,14,22,0.42)";
  ctx.fillRect(x + w - 1, y + 1, 1, h - 2);
  ctx.fillRect(x + 1, y + h - 1, w - 2, 1);
}

function drawHeroPortraitSprite(x, y, scale = 2, opts = {}) {
  const label = opts.label || "Michael";
  const style = opts.style || "office";
  const outfitId = opts.outfitId || null;
  const presetKey = String(label).toLowerCase();
  const preset = CHARACTER_PRESETS[presetKey] || null;

  const skinBase =
    opts.skinBase ||
    (label === "Darryl"
      ? "#8b664b"
      : label === "Kelly"
      ? "#a47657"
      : label === "Pam"
      ? "#f1cfb3"
      : label === "David Wallace"
      ? "#d7b99e"
      : "#efcfab");
  const skinShade =
    opts.skinShade ||
    (label === "Darryl"
      ? "#6e4f3c"
      : label === "Kelly"
      ? "#8b6348"
      : label === "Pam"
      ? "#dfbda0"
      : label === "David Wallace"
      ? "#c7a78b"
      : "#c9a682");
  let hairBase =
    opts.hairBase ||
    (label === "Dwight"
      ? "#34251a"
      : label === "Pam"
      ? "#7e5139"
      : label === "Andy"
      ? "#886345"
      : label === "Jim"
      ? "#2a1e16"
      : label === "David Wallace"
      ? "#2d1f18"
      : "#3a281d");
  const hairShade = opts.hairShade || (label === "David Wallace" ? "#4b352a" : label === "Andy" ? "#6d4e35" : "#2b1f17");

  let shirtColor = opts.shirtColor || preset?.color || (label === "Pam" ? "#d9eef9" : "#5f8fca");
  let tieColor = opts.tieColor || preset?.tieColor || "#2f4f7a";
  let hideTie = Boolean(opts.hideTie);

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
    shirtColor = "#b82424";
    tieColor = "#f5f5f5";
    hideTie = true;
  } else if (outfitId === "recyclops") {
    shirtColor = "#5c8f3c";
    tieColor = "#2d5a2e";
  } else if (outfitId === "hay_king") {
    shirtColor = "#6a4a2b";
    tieColor = "#3f2f1f";
  } else if (outfitId === "two_headed_monster") {
    shirtColor = "#202734";
    tieColor = "#dce4ef";
  } else if (outfitId === "cat_andy") {
    shirtColor = "#8c6a3b";
    tieColor = "#8c6a3b";
    hideTie = true;
  } else if (outfitId === "andy_plumber") {
    shirtColor = "#8c96a8";
    tieColor = "#8c96a8";
    hideTie = true;
  } else if (outfitId === "andy_construction") {
    shirtColor = "#b02b26";
    tieColor = "#b02b26";
    hideTie = true;
  } else if (outfitId === "dwight_deputy") {
    shirtColor = "#11161f";
    tieColor = "#11161f";
    hideTie = true;
  } else if (outfitId === "dwight_joker") {
    shirtColor = "#5a2b7a";
    tieColor = "#5a2b7a";
    hideTie = true;
  } else if (outfitId === "prison_mike") {
    shirtColor = "#2f3442";
    tieColor = "#444c5f";
  } else if (outfitId === "scranton_penguins") {
    shirtColor = "#13161d";
    tieColor = "#13161d";
    hideTie = true;
  } else if (outfitId === "strangler_hood") {
    shirtColor = "#171a23";
    tieColor = "#171a23";
    hideTie = true;
  } else if (outfitId === "three_hole_gym") {
    shirtColor = "#d9dde4";
    tieColor = "#d9dde4";
    hideTie = true;
  }

  const isPam = label === "Pam" || style === "pam";
  const isDwight = label === "Dwight";
  const isKelly = label === "Kelly";
  const isAndy = label === "Andy";
  const isDavid = label === "David Wallace" || style === "david";
  const isStranglerHood = outfitId === "strangler_hood";
  const twoHeadShift = outfitId === "two_headed_monster" ? 2 * scale : 0;
  const hasSleeves = !isDwight && !isKelly;
  let renderSkinBase = skinBase;
  let renderSkinShade = skinShade;
  if (isStranglerHood) {
    renderSkinBase = "#0b0f18";
    renderSkinShade = "#0b0f18";
  }
  if (outfitId === "dwight_joker") {
    // Joker wig tint.
    hairBase = "#2f8f4e";
  }

  if (opts.shadow !== false) {
    ctx.fillStyle = "rgba(0,0,0,0.24)";
    ctx.beginPath();
    ctx.ellipse(x + 20 * scale, y + 8 * scale, 20 * scale, 7 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Base head first.
  ctx.fillStyle = renderSkinBase;
  ctx.fillRect((isPam ? x + 10 * scale : x + 8 * scale) + twoHeadShift, y - 58 * scale, 16 * scale, 12 * scale);

  // Hair shell.
  if (isStranglerHood) {
    // Hood is rendered in outfit pass; skip default hair shell entirely.
  } else if (isPam) {
    // Similar silhouette to Jim, with longer side hair and no floating blocks.
    ctx.fillStyle = hairBase;
    ctx.fillRect(x + 8 * scale, y - 64 * scale, 20 * scale, 7 * scale);
    ctx.fillRect(x + 6 * scale, y - 58 * scale, 5 * scale, 18 * scale);
    ctx.fillRect(x + 25 * scale, y - 58 * scale, 5 * scale, 18 * scale);
    ctx.fillRect(x + 10 * scale, y - 41 * scale, 16 * scale, 2 * scale);
  } else if (isKelly) {
    // Kelly: fuller, longer hair framing the face.
    ctx.fillStyle = hairBase;
    ctx.fillRect(x + 6 * scale, y - 63 * scale, 20 * scale, 7 * scale);
    ctx.fillRect(x + 4 * scale, y - 58 * scale, 5 * scale, 24 * scale);
    ctx.fillRect(x + 23 * scale, y - 58 * scale, 5 * scale, 24 * scale);
    ctx.fillRect(x + 9 * scale, y - 36 * scale, 14 * scale, 3 * scale);
  } else if (isDwight) {
    // Dwight: center-part hair with fuller side volume.
    ctx.fillStyle = hairBase;
    ctx.fillRect(x + 6 * scale, y - 63 * scale, 20 * scale, 5 * scale);
    ctx.fillRect(x + 5 * scale, y - 59 * scale, 5 * scale, 4 * scale);
    ctx.fillRect(x + 22 * scale, y - 59 * scale, 5 * scale, 4 * scale);
    // Receding center hairline (visible notch).
    ctx.fillStyle = skinBase;
    ctx.fillRect(x + 12 * scale, y - 60 * scale, 8 * scale, 4 * scale);
    ctx.fillStyle = hairShade;
    ctx.fillRect(x + 15 * scale, y - 63 * scale, 2 * scale, 3 * scale); // center part (stays above hairline notch)
    ctx.fillRect(x + 11 * scale, y - 60 * scale, 2 * scale, 2 * scale);
    ctx.fillRect(x + 19 * scale, y - 60 * scale, 2 * scale, 2 * scale);
  } else {
    ctx.fillStyle = hairBase;
    ctx.fillRect(x + 6 * scale + twoHeadShift, y - 63 * scale, 20 * scale, 6 * scale);
    ctx.fillRect(x + 5 * scale + twoHeadShift, y - 59 * scale, 5 * scale, 3 * scale);
    if (isDavid) {
      ctx.fillStyle = hairShade;
      ctx.fillRect(x + 15 * scale + twoHeadShift, y - 63 * scale, 2 * scale, 6 * scale);
    }
  }

  // Face details.
  if (!isStranglerHood) {
    ctx.fillStyle = "#1e2431";
    if (isDwight || isDavid) {
      if (isDwight) {
        // Pixel-aligned silver glasses and centered eyes.
        ctx.fillStyle = "#9ba9ba";
        ctx.fillRect(x + 10 * scale, y - 56 * scale, 5 * scale, 1 * scale);
        ctx.fillRect(x + 10 * scale, y - 52 * scale, 5 * scale, 1 * scale);
        ctx.fillRect(x + 10 * scale, y - 55 * scale, 1 * scale, 3 * scale);
        ctx.fillRect(x + 14 * scale, y - 55 * scale, 1 * scale, 3 * scale);
        ctx.fillRect(x + 17 * scale, y - 56 * scale, 5 * scale, 1 * scale);
        ctx.fillRect(x + 17 * scale, y - 52 * scale, 5 * scale, 1 * scale);
        ctx.fillRect(x + 17 * scale, y - 55 * scale, 1 * scale, 3 * scale);
        ctx.fillRect(x + 21 * scale, y - 55 * scale, 1 * scale, 3 * scale);
        ctx.fillRect(x + 15 * scale, y - 54 * scale, 2 * scale, 1 * scale);
        ctx.fillStyle = "#1e2431";
        ctx.fillRect(x + 12 * scale, y - 54 * scale, 1 * scale, 1 * scale);
        ctx.fillRect(x + 19 * scale, y - 54 * scale, 1 * scale, 1 * scale);
      } else {
        const g = "#8fa3bd";
        ctx.strokeStyle = g;
        ctx.lineWidth = Math.max(1, scale * 0.45);
        ctx.strokeRect(x + 11.5 * scale, y - 54.5 * scale, 3.2 * scale, 2.6 * scale);
        ctx.strokeRect(x + 17.3 * scale, y - 54.5 * scale, 3.2 * scale, 2.6 * scale);
        ctx.beginPath();
        ctx.moveTo(x + 14.7 * scale, y - 53.2 * scale);
        ctx.lineTo(x + 17.3 * scale, y - 53.2 * scale);
        ctx.stroke();
        ctx.fillRect(x + 13 * scale, y - 53.2 * scale, 1 * scale, 1 * scale);
        ctx.fillRect(x + 19 * scale, y - 53.2 * scale, 1 * scale, 1 * scale);
      }
    } else {
      const eyeY = isPam ? -53 : -54;
      ctx.fillRect(x + 12 * scale + twoHeadShift, y + eyeY * scale, 2 * scale, 2 * scale);
      ctx.fillRect(x + 18 * scale + twoHeadShift, y + eyeY * scale, 2 * scale, 2 * scale);
    }
    ctx.fillStyle = renderSkinShade;
    ctx.fillRect(x + 15 * scale + twoHeadShift, y + (isPam ? -50 : -50) * scale, 1 * scale, 2 * scale);
    ctx.fillStyle = "#2f3b4e";
    ctx.fillRect(x + 13 * scale + twoHeadShift, y + (isPam ? -48 : -50) * scale, 6 * scale, 1 * scale);
    if (isKelly) {
      // Kelly smile (filled so it reads clearly at pixel scale).
      ctx.fillRect(x + 13 * scale, y - 49 * scale, 6 * scale, 1 * scale);
      ctx.fillRect(x + 14 * scale, y - 48 * scale, 4 * scale, 1 * scale);
    }
  }

  // Outfit-specific face overlays (restore detail).
  if (outfitId === "goldenface") {
    ctx.fillStyle = "#e4ba53";
    ctx.fillRect(x + 8 * scale, y - 58 * scale, 16 * scale, 12 * scale);
    ctx.fillStyle = "#1b1a1c";
    ctx.fillRect(x + 12 * scale, y - 54 * scale, 2 * scale, 2 * scale);
    ctx.fillRect(x + 18 * scale, y - 54 * scale, 2 * scale, 2 * scale);
    ctx.fillRect(x + 13 * scale, y - 50 * scale, 6 * scale, 1 * scale);
    ctx.fillStyle = "#1f1d1b";
    ctx.fillRect(x + 10 * scale, y - 56 * scale, 12 * scale, 2 * scale);
  }
  if (outfitId === "ryan_beard") {
    ctx.fillStyle = "#151518";
    ctx.fillRect(x + 9 * scale, y - 52 * scale, 3 * scale, 5 * scale);
    ctx.fillRect(x + 20 * scale, y - 52 * scale, 3 * scale, 5 * scale);
    ctx.fillRect(x + 12 * scale, y - 50 * scale, 9 * scale, 2 * scale);
    ctx.fillRect(x + 13 * scale, y - 48 * scale, 7 * scale, 1 * scale);
  }
  if (outfitId === "date_mike") {
    ctx.fillStyle = "#0d1118";
    // Anchor hat brim directly on hairline so it does not float.
    ctx.fillRect(x + 6 * scale, y - 64 * scale, 20 * scale, 4 * scale);
    ctx.fillRect(x + 10 * scale, y - 69 * scale, 12 * scale, 6 * scale);
  }
  if (outfitId === "wrong_fit") {
    // Santa hat + white trim.
    ctx.fillStyle = "#f6f4ef";
    ctx.fillRect(x + 7 * scale, y - 64 * scale, 18 * scale, 2 * scale); // brim
    ctx.fillStyle = "#b82424";
    ctx.fillRect(x + 9 * scale, y - 69 * scale, 14 * scale, 5 * scale); // cap
    ctx.fillRect(x + 20 * scale, y - 72 * scale, 3 * scale, 3 * scale); // tilted top
    ctx.fillStyle = "#f6f4ef";
    ctx.fillRect(x + 22 * scale, y - 73 * scale, 2 * scale, 2 * scale); // pom
  }
  if (outfitId === "recyclops") {
    ctx.fillStyle = "#9be467";
    ctx.fillRect(x + 10 * scale, y - 58 * scale, 12 * scale, 2 * scale);
    ctx.fillStyle = "#2f4f2f";
    ctx.fillRect(x + 15 * scale, y - 58 * scale, 2 * scale, 2 * scale);
  }
  if (outfitId === "hay_king") {
    // Straw crown and rough harvest trim.
    ctx.fillStyle = "#cda86e";
    // Crown base sits on hairline.
    ctx.fillRect(x + 7 * scale, y - 64 * scale, 18 * scale, 4 * scale);
    ctx.fillRect(x + 10 * scale, y - 69 * scale, 2 * scale, 5 * scale);
    ctx.fillRect(x + 13 * scale, y - 70 * scale, 2 * scale, 6 * scale);
    ctx.fillRect(x + 17 * scale, y - 70 * scale, 2 * scale, 6 * scale);
    ctx.fillRect(x + 20 * scale, y - 69 * scale, 2 * scale, 5 * scale);
    ctx.fillStyle = "#b69056";
    ctx.fillRect(x + 8 * scale, y - 61 * scale, 16 * scale, 1 * scale);
  }
  if (outfitId === "two_headed_monster") {
    // Extra head emerging from Michael's left shoulder.
    ctx.fillStyle = renderSkinBase;
    ctx.fillRect(x - 1 * scale, y - 56 * scale, 13 * scale, 10 * scale);
    ctx.fillStyle = hairBase;
    ctx.fillRect(x - 1 * scale, y - 58 * scale, 13 * scale, 3 * scale);
    ctx.fillStyle = "#1e2431";
    ctx.fillRect(x + 2 * scale, y - 53 * scale, 1 * scale, 1 * scale);
    ctx.fillRect(x + 7 * scale, y - 53 * scale, 1 * scale, 1 * scale);
    ctx.fillRect(x + 3 * scale, y - 50 * scale, 4 * scale, 1 * scale);
    ctx.fillStyle = shirtColor;
    ctx.fillRect(x + 2 * scale, y - 46 * scale, 8 * scale, 2 * scale);
  }
  if (outfitId === "cat_andy") {
    // Cat ears.
    ctx.fillStyle = "#2a1c12";
    ctx.fillRect(x + 9 * scale, y - 64 * scale, 4 * scale, 4 * scale);
    ctx.fillRect(x + 21 * scale, y - 64 * scale, 4 * scale, 4 * scale);
    ctx.fillStyle = "#d7b27b";
    ctx.fillRect(x + 10 * scale, y - 63 * scale, 2 * scale, 2 * scale);
    ctx.fillRect(x + 22 * scale, y - 63 * scale, 2 * scale, 2 * scale);
  }
  if (outfitId === "andy_plumber") {
    ctx.fillStyle = "#bf2b2b";
    ctx.fillRect(x + 7 * scale, y - 64 * scale, 18 * scale, 3 * scale); // cap brim
    ctx.fillRect(x + 10 * scale, y - 68 * scale, 12 * scale, 4 * scale); // cap crown
  }
  if (outfitId === "andy_construction") {
    ctx.fillStyle = "#e4c862";
    ctx.fillRect(x + 7 * scale, y - 64 * scale, 18 * scale, 3 * scale); // hard hat brim
    ctx.fillRect(x + 9 * scale, y - 68 * scale, 14 * scale, 4 * scale); // hard hat dome
    ctx.fillStyle = "#bfa64a";
    ctx.fillRect(x + 11 * scale, y - 66 * scale, 10 * scale, 1 * scale);
  }
  if (outfitId === "dwight_deputy") {
    ctx.fillStyle = "#3a414f";
    ctx.fillRect(x + 4 * scale, y - 64 * scale, 24 * scale, 2 * scale); // ranger brim (anchored)
    ctx.fillRect(x + 10 * scale, y - 68 * scale, 12 * scale, 4 * scale); // hat top
    ctx.fillStyle = "#d5b46a";
    ctx.fillRect(x + 17 * scale, y - 66 * scale, 2 * scale, 2 * scale); // hat badge
  }
  if (outfitId === "dwight_joker") {
    ctx.fillStyle = "#2f8f4e";
    ctx.fillRect(x + 6 * scale, y - 65 * scale, 20 * scale, 4 * scale); // green wig
    ctx.fillRect(x + 5 * scale, y - 61 * scale, 3 * scale, 4 * scale);
    ctx.fillRect(x + 24 * scale, y - 61 * scale, 3 * scale, 4 * scale);
    ctx.fillStyle = "#b8253c";
    ctx.fillRect(x + 13 * scale, y - 49 * scale, 6 * scale, 1 * scale); // grin
  }
  if (outfitId === "prison_mike") {
    ctx.fillStyle = "#7d43be";
    ctx.fillRect(x + 7 * scale, y - 64 * scale, 18 * scale, 3 * scale); // bandana
    ctx.fillRect(x + 9 * scale, y - 67 * scale, 14 * scale, 3 * scale);
    ctx.fillStyle = "#ad86dd";
    ctx.fillRect(x + 11 * scale, y - 66 * scale, 2 * scale, 1 * scale);
    ctx.fillRect(x + 16 * scale, y - 66 * scale, 2 * scale, 1 * scale);
    ctx.fillRect(x + 21 * scale, y - 66 * scale, 2 * scale, 1 * scale);
  }
  if (outfitId === "strangler_hood") {
    // Single-piece hood shape so no seams show in previews/in-run sprites.
    ctx.fillStyle = "#1a2235";
    ctx.fillRect(x + 8 * scale, y - 64 * scale, 16 * scale, 20 * scale); // full hood shell
    ctx.fillStyle = "#121a2a";
    ctx.fillRect(x + 8 * scale, y - 64 * scale, 2 * scale, 20 * scale); // left edge
    ctx.fillRect(x + 22 * scale, y - 64 * scale, 2 * scale, 20 * scale); // right edge
    ctx.fillStyle = "#24314c";
    ctx.fillRect(x + 10 * scale, y - 63 * scale, 12 * scale, 2 * scale); // top rim accent
    ctx.fillStyle = "#0d111c";
    ctx.fillRect(x + 10 * scale, y - 58 * scale, 12 * scale, 11 * scale); // face cavity
    ctx.fillStyle = "#060910";
    ctx.fillRect(x + 11 * scale, y - 56 * scale, 10 * scale, 8 * scale); // dark mask
    // Tiny eye slits.
    ctx.fillStyle = "#c3d2ee";
    ctx.fillRect(x + 13 * scale, y - 53 * scale, 1 * scale, 1 * scale);
    ctx.fillRect(x + 18 * scale, y - 53 * scale, 1 * scale, 1 * scale);
  }

  // Torso.
  let torsoX = x + 6 * scale;
  let torsoY = y - 46 * scale;
  let torsoW = 24 * scale;
  let torsoH = 30 * scale;
  if (isPam) {
    shirtColor = "#d9eef9";
    hideTie = true;
    // Pam torso slightly slimmer so proportions read correctly.
    torsoX = x + 8 * scale;
    torsoW = 20 * scale;
    torsoH = 29 * scale;
  }
  ctx.fillStyle = shirtColor;
  ctx.fillRect(torsoX, torsoY, torsoW, torsoH);
  if (isAndy && !outfitId) {
    // Andy default: tan blazer, blue shirt core, red bow tie.
    ctx.fillStyle = "#d7e4ff";
    ctx.fillRect(torsoX + 8 * scale, torsoY + 1 * scale, 8 * scale, torsoH - 2 * scale);
    ctx.fillStyle = "#b89f7f";
    ctx.fillRect(torsoX + 1 * scale, torsoY + 4 * scale, 5 * scale, torsoH - 5 * scale);
    ctx.fillRect(torsoX + torsoW - 6 * scale, torsoY + 4 * scale, 5 * scale, torsoH - 5 * scale);
    ctx.fillStyle = "#a34353";
    ctx.fillRect(x + 13 * scale, y - 45 * scale, 3 * scale, 2 * scale);
    ctx.fillRect(x + 18 * scale, y - 45 * scale, 3 * scale, 2 * scale);
    ctx.fillRect(x + 16 * scale, y - 44 * scale, 2 * scale, 2 * scale);
    hideTie = true;
  }
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.fillRect(torsoX + torsoW - 8 * scale, torsoY + 2 * scale, 7 * scale, torsoH - 4 * scale);
  ctx.fillStyle = "rgba(0,0,0,0.14)";
  ctx.fillRect(torsoX, torsoY + 2 * scale, 4 * scale, torsoH - 4 * scale);
  if (isPam) {
    ctx.fillStyle = "#7f96bf";
    ctx.fillRect(torsoX, torsoY, 4 * scale, torsoH);
    ctx.fillRect(torsoX + torsoW - 4 * scale, torsoY, 4 * scale, torsoH);
    ctx.fillStyle = "#5f78a7";
    ctx.fillRect(torsoX + Math.floor(torsoW * 0.5) - 1 * scale, torsoY + 1 * scale, 2 * scale, 18 * scale);
  }
  if (outfitId === "goldenface" || isDavid) {
    ctx.fillStyle = "#121316";
    ctx.fillRect(x + 6 * scale, y - 46 * scale, 6 * scale, 30 * scale);
    ctx.fillRect(x + 24 * scale, y - 46 * scale, 6 * scale, 30 * scale);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 14 * scale, y - 43 * scale, 8 * scale, 24 * scale);
  }
  if (outfitId === "strangler_hood") {
    // Robe-style body: dark front with lighter right strip.
    ctx.fillStyle = "#1a2235";
    ctx.fillRect(x + 6 * scale, y - 46 * scale, 24 * scale, 30 * scale);
    ctx.fillStyle = "#11192a";
    ctx.fillRect(x + 6 * scale, y - 46 * scale, 16 * scale, 30 * scale);
    ctx.fillStyle = "#3c4353";
    ctx.fillRect(x + 22 * scale, y - 46 * scale, 8 * scale, 30 * scale);
  }

  if (!hideTie && !isPam) {
    ctx.fillStyle = tieColor;
    ctx.fillRect(x + 16 * scale, y - 44 * scale, 4 * scale, 20 * scale);
    ctx.fillRect(x + 15 * scale, y - 22 * scale, 6 * scale, 4 * scale);
  }
  if (outfitId === "three_hole_gym") {
    ctx.fillStyle = "#0f1118";
    ctx.fillRect(x + 16 * scale, y - 39 * scale, 4 * scale, 4 * scale);
    ctx.fillRect(x + 16 * scale, y - 33 * scale, 4 * scale, 4 * scale);
    ctx.fillRect(x + 16 * scale, y - 27 * scale, 4 * scale, 4 * scale);
  }
  if (outfitId === "wrong_fit") {
    // Santa coat accents.
    ctx.fillStyle = "#f6f4ef";
    ctx.fillRect(torsoX + 1 * scale, torsoY + 1 * scale, torsoW - 2 * scale, 2 * scale); // collar
    ctx.fillRect(torsoX + 1 * scale, torsoY + torsoH - 3 * scale, torsoW - 2 * scale, 2 * scale); // hem
    ctx.fillRect(torsoX + Math.floor(torsoW * 0.5) - 1 * scale, torsoY + 3 * scale, 2 * scale, torsoH - 7 * scale); // center trim
    ctx.fillStyle = "#1b1b1d";
    ctx.fillRect(torsoX + 3 * scale, torsoY + 14 * scale, torsoW - 6 * scale, 3 * scale); // belt
    ctx.fillStyle = "#c7a047";
    ctx.fillRect(torsoX + 10 * scale, torsoY + 14 * scale, 5 * scale, 3 * scale); // buckle
  }
  if (outfitId === "andy_plumber") {
    ctx.fillStyle = "#b8c0cc";
    ctx.fillRect(torsoX + 2 * scale, torsoY + 5 * scale, torsoW - 4 * scale, 2 * scale);
    ctx.fillRect(torsoX + 2 * scale, torsoY + 11 * scale, torsoW - 4 * scale, 2 * scale);
    ctx.fillRect(torsoX + 2 * scale, torsoY + 17 * scale, torsoW - 4 * scale, 2 * scale);
    ctx.fillStyle = "#e7e2d6";
    ctx.fillRect(torsoX + 16 * scale, torsoY + 8 * scale, 8 * scale, 4 * scale); // patch
  }
  if (outfitId === "andy_construction") {
    ctx.fillStyle = "#121316";
    ctx.fillRect(torsoX + 3 * scale, torsoY + 6 * scale, 3 * scale, torsoH - 8 * scale);
    ctx.fillRect(torsoX + 9 * scale, torsoY + 7 * scale, 3 * scale, torsoH - 9 * scale);
    ctx.fillRect(torsoX + 15 * scale, torsoY + 6 * scale, 3 * scale, torsoH - 8 * scale);
  }
  if (outfitId === "dwight_deputy") {
    ctx.fillStyle = "#1b202a";
    ctx.fillRect(torsoX + 2 * scale, torsoY + 2 * scale, torsoW - 4 * scale, torsoH - 4 * scale); // vest
    ctx.fillStyle = "#d5b46a";
    ctx.fillRect(torsoX + 10 * scale, torsoY + 8 * scale, 4 * scale, 4 * scale); // badge
  }
  if (outfitId === "dwight_joker") {
    ctx.fillStyle = "#311547";
    ctx.fillRect(torsoX + 2 * scale, torsoY + 3 * scale, torsoW - 4 * scale, torsoH - 4 * scale);
    ctx.fillStyle = "#304634";
    ctx.fillRect(torsoX + 10 * scale, torsoY + 8 * scale, 4 * scale, 6 * scale); // vest
  }
  if (outfitId === "scranton_penguins") {
    ctx.fillStyle = "#f5f7fb";
    ctx.fillRect(torsoX + 2 * scale, torsoY + 8 * scale, torsoW - 4 * scale, 2 * scale);
    ctx.fillRect(torsoX + 2 * scale, torsoY + 14 * scale, torsoW - 4 * scale, 2 * scale);
    ctx.fillStyle = "#c63d3d";
    ctx.fillRect(torsoX + 11 * scale, torsoY + 7 * scale, 2 * scale, 10 * scale);
  }

  if (outfitId === "cat_andy") {
    // Leopard-print body.
    ctx.fillStyle = "#d7b27b";
    ctx.fillRect(torsoX + 2 * scale, torsoY + 2 * scale, torsoW - 4 * scale, 4 * scale);
    ctx.fillStyle = "#3d2d18";
    ctx.fillRect(torsoX + 5 * scale, torsoY + 8 * scale, 2 * scale, 2 * scale);
    ctx.fillRect(torsoX + 11 * scale, torsoY + 10 * scale, 2 * scale, 2 * scale);
    ctx.fillRect(torsoX + 17 * scale, torsoY + 7 * scale, 2 * scale, 2 * scale);
    ctx.fillRect(torsoX + 8 * scale, torsoY + 14 * scale, 2 * scale, 2 * scale);
    ctx.fillRect(torsoX + 15 * scale, torsoY + 17 * scale, 2 * scale, 2 * scale);
    // Tail.
    ctx.fillStyle = "#2a1e11";
    ctx.fillRect(torsoX + torsoW - 1 * scale, torsoY + 18 * scale, 5 * scale, 2 * scale);
    ctx.fillRect(torsoX + torsoW + 3 * scale, torsoY + 16 * scale, 2 * scale, 4 * scale);
  }

  // Arms (Pam now same body system, no floating look).
  if (!opts.noArms) {
    const armTopY = isPam ? y - 40 * scale : y - 40 * scale;
    const armH = isPam ? 11 * scale : 12 * scale;
    const leftArmX = isPam ? x + 5 * scale : x + 2 * scale;
    const rightArmX = isPam ? x + 28 * scale : x + 30 * scale;
    if (outfitId === "strangler_hood") {
      ctx.fillStyle = "#080c14";
      ctx.fillRect(leftArmX, armTopY, 3 * scale, armH);
      ctx.fillRect(rightArmX, armTopY, 3 * scale, armH);
      ctx.fillStyle = "#151d2e";
      ctx.fillRect(leftArmX, armTopY, 3 * scale, 5 * scale);
      ctx.fillRect(rightArmX, armTopY, 3 * scale, 5 * scale);
    } else {
      ctx.fillStyle = skinBase;
      ctx.fillRect(leftArmX, armTopY, 3 * scale, armH);
      ctx.fillRect(rightArmX, armTopY, 3 * scale, armH);
      if (hasSleeves || isPam) {
        ctx.fillStyle = shirtColor;
        ctx.fillRect(leftArmX, armTopY, 3 * scale, 5 * scale);
        ctx.fillRect(rightArmX, armTopY, 3 * scale, 5 * scale);
      }
    }
  }

  // Legs and shoes.
  if (!opts.noLegs) {
    if (isPam) {
      // Slightly larger legs relative to slimmer body.
      ctx.fillStyle = "#514a73";
      ctx.fillRect(x + 11 * scale, y - 17 * scale, 14 * scale, 12 * scale);
      ctx.fillStyle = "#1a2231";
      ctx.fillRect(x + 12 * scale, y - 5 * scale, 5 * scale, 8 * scale);
      ctx.fillRect(x + 19 * scale, y - 5 * scale, 5 * scale, 8 * scale);
    } else {
      ctx.fillStyle = "#1b2838";
      ctx.fillRect(x + 10 * scale, y - 16 * scale, 7 * scale, 18 * scale);
      ctx.fillRect(x + 20 * scale, y - 16 * scale, 7 * scale, 18 * scale);
    }
    ctx.fillStyle = "#111722";
    ctx.fillRect(x + 9 * scale, y + 2 * scale, 8 * scale, 3 * scale);
    ctx.fillRect(x + 20 * scale, y + 2 * scale, 8 * scale, 3 * scale);
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
  const boardOuter = { x: 104, y: 94, w: 792, h: 366 };
  const boardInner = { x: 120, y: 110, w: 760, h: 334 };

  const wallGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  wallGrad.addColorStop(0, "#304f75");
  wallGrad.addColorStop(1, "#1d2f4b");
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawPixelTexture(0, 0, canvas.width, 332, "rgba(8,14,24,0.08)", "rgba(255,255,255,0.04)");

  // Conference room wall trim, carpet and table/chairs so the room reads clearly.
  ctx.fillStyle = "#d7dde8";
  ctx.fillRect(0, 68, canvas.width, 10);
  ctx.fillStyle = "#425a7b";
  ctx.fillRect(0, 78, canvas.width, 3);
  ctx.fillStyle = "#2b3f61";
  ctx.fillRect(0, 332, canvas.width, 208);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  for (let y = 340; y < 540; y += 8) ctx.fillRect(0, y, canvas.width, 1);

  ctx.fillStyle = "#6a513f";
  ctx.fillRect(226, 472, 548, 44);
  ctx.fillStyle = "#846750";
  ctx.fillRect(246, 458, 508, 18);
  ctx.fillStyle = "#3f2c20";
  ctx.fillRect(268, 504, 12, 26);
  ctx.fillRect(720, 504, 12, 26);
  for (let i = 0; i < 5; i += 1) {
    const cx = 258 + i * 108;
    ctx.fillStyle = "#2e466d";
    ctx.fillRect(cx, 486, 52, 40);
    ctx.fillStyle = "#1a2b46";
    ctx.fillRect(cx + 8, 476, 36, 12);
  }

  // Bulletin board.
  ctx.fillStyle = "#6e533f";
  ctx.fillRect(boardOuter.x, boardOuter.y, boardOuter.w, boardOuter.h);
  ctx.fillStyle = "#eadfca";
  ctx.fillRect(boardInner.x, boardInner.y, boardInner.w, boardInner.h);
  drawPixelTexture(boardInner.x, boardInner.y, boardInner.w, boardInner.h, "rgba(70,50,36,0.08)", "rgba(255,255,255,0.14)");
  ctx.strokeStyle = "#927761";
  ctx.lineWidth = 3;
  ctx.strokeRect(boardOuter.x, boardOuter.y, boardOuter.w, boardOuter.h);
  ctx.fillStyle = "#c85e57";
  for (let i = 0; i < 10; i += 1) ctx.fillRect(boardInner.x + 24 + i * 72, boardInner.y + 6 + (i % 2), 2, 2);

  // "World's Best Boss" mug mission prop in the board-side gap.
  const mugX = 34;
  const mugY = 364;
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

  drawPixelPanel(242, 22, 514, 36, "rgba(9,18,34,0.9)", "rgba(6,12,24,0.9)", "#8bc8ff", "rgba(220,238,255,0.62)");
  drawTitleText("Conference Room - Choose a Sticky Note", 268, 46, "bold 20px Trebuchet MS", "#dff0ff");

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
    drawPixelTexture(x, y, w, h, "rgba(70,62,40,0.08)", "rgba(255,255,255,0.14)");
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
    // Tiny icon doodle on each sticky note.
    ctx.fillStyle = unlocked ? "rgba(20,36,62,0.5)" : "rgba(50,50,50,0.4)";
    if (world.id === "bullpen") {
      ctx.fillRect(x + w - 30, y + 20, 12, 8);
      ctx.fillRect(x + w - 28, y + 28, 8, 2);
    } else if (world.id === "warehouse") {
      ctx.fillRect(x + w - 30, y + 18, 3, 16);
      ctx.fillRect(x + w - 21, y + 18, 3, 16);
      ctx.fillRect(x + w - 29, y + 23, 10, 2);
    } else if (world.id === "streets") {
      ctx.fillRect(x + w - 24, y + 19, 4, 13);
      ctx.fillRect(x + w - 30, y + 19, 16, 4);
    } else if (world.id === "corporate") {
      ctx.fillRect(x + w - 31, y + 19, 14, 10);
      ctx.fillRect(x + w - 29, y + 17, 8, 3);
    } else {
      ctx.fillRect(x + w - 30, y + 22, 14, 6);
      ctx.fillRect(x + w - 20, y + 18, 4, 4);
    }
    ctx.font = "14px Trebuchet MS";
    drawWrappedText(unlocked ? world.subtitle : "Locked", x + 12, y + 50, w - 24, 18, 3);

    if (!unlocked) {
      ctx.fillStyle = "rgba(40,40,45,0.45)";
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = "#f4e8cc";
      ctx.font = "bold 21px Trebuchet MS";
      ctx.fillText("LOCKED", x + 38, y + 76);
      // Lock icon next to label.
      const lockX = x + 130;
      const lockY = y + 59;
      ctx.strokeStyle = "#f4e8cc";
      ctx.lineWidth = 2;
      ctx.strokeRect(lockX, lockY + 8, 14, 10);
      ctx.beginPath();
      ctx.arc(lockX + 7, lockY + 8, 4, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#f4e8cc";
      ctx.fillRect(lockX + 6, lockY + 13, 2, 3);
    }

    state.menuCards.push({ x, y, w, h, worldId: world.id, unlocked });
  }

  if (state.menuCards.length > 0) {
    const focusIdx = Math.max(0, Math.min(state.menuCards.length - 1, state.uiFocus.menuCard || 0));
    state.uiFocus.menuCard = focusIdx;
    const focused = state.menuCards[focusIdx];
    ctx.strokeStyle = "rgba(255, 234, 148, 0.95)";
    ctx.lineWidth = 3;
    ctx.strokeRect(focused.x - 4, focused.y - 4, focused.w + 8, focused.h + 8);
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

  const runnerId = getRunnerId();
  const equippedOutfit = getEquippedOutfitId(runnerId);
  const player = CHARACTER_PRESETS[characterSelect.value];
  const px = 98;
  const py = 422;
  const menuScale = 1.3;
  drawHeroPortraitSprite(px, py, menuScale, { label: player.label, outfitId: equippedOutfit });

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
  ctx.fillText("Enter: Launch Level   C: Characters   S: Shop   A: Annex   D: Jim's Desk   I: Inventory   O: Settings", 34, 523);
}

function drawShopScene() {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#f5d9a2");
  grad.addColorStop(1, "#d9ae68");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // 16-bit break room wallpaper + floor tile.
  ctx.fillStyle = "rgba(90, 63, 33, 0.18)";
  for (let x = 0; x < canvas.width; x += 40) ctx.fillRect(x, 0, 2, 300);
  ctx.fillStyle = "rgba(70, 49, 27, 0.18)";
  for (let y = 70; y < 300; y += 28) ctx.fillRect(0, y, canvas.width, 1);
  ctx.fillStyle = "#594a36";
  ctx.fillRect(0, 300, canvas.width, 240);
  for (let y = 304; y < 540; y += 16) {
    ctx.fillStyle = "rgba(210,188,154,0.12)";
    ctx.fillRect(0, y, canvas.width, 1);
  }

  // Full-screen room presentation (no inset "window inside window").

  drawPixelPanel(300, 82, 360, 58, "rgba(18,32,56,0.88)", "rgba(10,22,42,0.9)", "#8fd3ff", "rgba(228,245,255,0.7)");
  drawTitleText("Break Room Shop", 328, 123, "bold 40px Trebuchet MS", "#ffd98a");

  const walletPanelX = 44;
  const walletPanelY = 180;
  const walletPanelW = 246;
  drawPixelPanel(
    walletPanelX,
    walletPanelY,
    walletPanelW,
    68,
    "rgba(14,26,46,0.86)",
    "rgba(9,18,34,0.9)",
    "#84cbff",
    "rgba(217,238,255,0.65)"
  );
  ctx.fillStyle = "#f4eddc";
  ctx.font = "bold 18px Trebuchet MS";
  ctx.fillText("Wallet:", walletPanelX + 14, walletPanelY + 24);
  ctx.font = "bold 16px Trebuchet MS";
  const sbLineY = walletPanelY + 42;
  const snLineY = walletPanelY + 58;
  const shopSbW = drawCurrencyIcon("schrute_buck", walletPanelX + 118, sbLineY - 12, 0.95);
  ctx.fillText(`${state.saveData.currencies.schruteBucks}`, walletPanelX + 118 + shopSbW + 6, sbLineY);
  const shopSnW = drawCurrencyIcon("stanley_nickel", walletPanelX + 118, snLineY - 12, 0.95);
  ctx.fillText(`${state.saveData.currencies.stanleyNickels}`, walletPanelX + 118 + shopSnW + 6, snLineY);

  const vmX = 300;
  const vmY = 150;
  const vmW = 430;
  const vmH = 262;
  drawPixelPanel(vmX, vmY, vmW, vmH, "#3a4762", "#2f3b53", "#9fd7ff", "rgba(217,240,255,0.64)");
  // Vending glass reflections + product strips.
  ctx.fillStyle = "rgba(230,245,255,0.18)";
  ctx.fillRect(vmX + 16, vmY + 18, 8, vmH - 36);
  ctx.fillRect(vmX + 34, vmY + 18, 4, vmH - 36);
  for (let r = 0; r < 2; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      const px = vmX + 20 + c * 98;
      const py = vmY + 36 + r * 116;
      ctx.fillStyle = r === 0 ? "rgba(245,201,95,0.35)" : "rgba(153,210,255,0.34)";
      ctx.fillRect(px, py, 80, 3);
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(px + 4, py + 1, 30, 1);
    }
  }
  const machineSideW = 64;
  const machineSideX = vmX + vmW - machineSideW - 14;
  ctx.fillStyle = "#9aa5b7";
  ctx.fillRect(machineSideX, vmY + 22, machineSideW, vmH - 44);
  ctx.fillStyle = "#252b38";
  ctx.fillRect(machineSideX + 10, vmY + 34, 38, 26);
  ctx.fillRect(machineSideX + 10, vmY + 68, 38, 18);
  ctx.fillRect(machineSideX + 10, vmY + 96, 38, 18);
  ctx.fillRect(machineSideX + 10, vmY + vmH - 64, 38, 34);

  // Jim leaning against the vending machine.
  const jimX = vmX + vmW + 10;
  const jimY = 392;
  const jimScale = 2.0;
  const jimW = 40 * jimScale;
  const jimH = 70 * jimScale;
  state.shopJimBounds = { x: jimX, y: jimY - jimH, w: jimW, h: jimH };
  drawHeroPortraitSprite(jimX, jimY, jimScale, { label: "Jim", shirtColor: "#5f8fca", tieColor: "#2f4f7a" });
  state.shopTalkBounds = [];

  // After quest completion, Pam stands beside Jim.
  if (state.saveData.missions.savePam.completed) {
    const pamScale = jimScale;
    const pamX = jimX + 72;
    const pamY = jimY + 6;
    const pamW = 40 * pamScale;
    const pamH = 70 * pamScale;
    state.shopPamBounds = { x: pamX, y: pamY - pamH, w: pamW, h: pamH };
    drawHeroPortraitSprite(pamX, pamY, pamScale, { label: "Pam", style: "pam", hideTie: true });

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
  state.shopPromptBounds = [];
  const colWidth = 108;
  const cardW = 104;
  const cardH = 100;
  for (let i = 0; i < SHOP_ITEMS.length; i += 1) {
    const item = SHOP_ITEMS[i];
    const col = i % 3;
    const row = item.row === "top" ? 0 : 1;
    const x = vmX + 16 + col * colWidth;
    const y = vmY + 30 + row * 116;
    const lockedByKey = row === 0 && !state.saveData.missions.savePam.completed;
    const count = getInventoryCount(item.id);
    const equipped = isItemEquipped(item.id);
    const topRowCleared = Boolean(state.saveData.unlocks?.topRowGelCleared?.[item.id]);

    ctx.fillStyle = equipped ? "#2f5032" : count > 0 ? "#2a4d62" : lockedByKey ? "#46403b" : "#234767";
    ctx.fillRect(x, y, cardW, cardH);
    ctx.strokeStyle = equipped ? "#b7f2bb" : lockedByKey ? "#8a7b6b" : "#8bc8ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, cardW, cardH);

    ctx.fillStyle = "#f5ead6";
    ctx.font = "bold 12px Trebuchet MS";
    drawWrappedText(item.name, x + 8, y + 16, cardW - 16, 12, 2);
    const iconX = x + Math.floor(cardW * 0.5) - 16;
    const iconY = y + 34;
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(iconX + 16, iconY + 28, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    if (item.id === "gel_shield") {
      // Jell-O block with inner glow and wobble ridges.
      ctx.fillStyle = "#e5b843";
      ctx.fillRect(iconX + 2, iconY + 1, 28, 20);
      ctx.fillStyle = "#ffd96c";
      ctx.fillRect(iconX + 4, iconY + 3, 24, 16);
      ctx.fillStyle = "rgba(255,244,186,0.65)";
      ctx.fillRect(iconX + 6, iconY + 5, 10, 12);
      ctx.fillStyle = "#f2c95c";
      ctx.fillRect(iconX + 4, iconY + 9, 24, 1);
      ctx.fillRect(iconX + 4, iconY + 13, 24, 1);
      ctx.fillStyle = "#8ecbff";
      ctx.fillRect(iconX + 19, iconY + 8, 6, 6);
      ctx.fillStyle = "#5a7da6";
      ctx.fillRect(iconX + 20, iconY + 9, 4, 4);
    } else if (item.id === "parkour_shoes") {
      // Running shoe with layered sole and speed marks.
      ctx.fillStyle = "#d7e5f7";
      ctx.fillRect(iconX + 4, iconY + 11, 16, 8);
      ctx.fillRect(iconX + 18, iconY + 13, 10, 6);
      ctx.fillStyle = "#b9cde6";
      ctx.fillRect(iconX + 6, iconY + 13, 10, 3);
      ctx.fillStyle = "#7f96b5";
      ctx.fillRect(iconX + 3, iconY + 19, 26, 2);
      ctx.fillStyle = "#eaf2ff";
      ctx.fillRect(iconX + 7, iconY + 10, 6, 1);
      ctx.fillRect(iconX + 14, iconY + 10, 4, 1);
      ctx.fillStyle = "#9ec5ff";
      ctx.fillRect(iconX, iconY + 12, 2, 1);
      ctx.fillRect(iconX - 2, iconY + 15, 3, 1);
    } else if (item.id === "chili_guard") {
      // Knee/elbow guard pair.
      ctx.fillStyle = "#5b6070";
      ctx.fillRect(iconX + 4, iconY + 5, 10, 14);
      ctx.fillRect(iconX + 18, iconY + 5, 10, 14);
      ctx.fillStyle = "#8a92a6";
      ctx.fillRect(iconX + 5, iconY + 7, 8, 5);
      ctx.fillRect(iconX + 19, iconY + 7, 8, 5);
      ctx.fillStyle = "#2c3342";
      ctx.fillRect(iconX + 7, iconY + 13, 4, 4);
      ctx.fillRect(iconX + 21, iconY + 13, 4, 4);
      ctx.fillStyle = "#a6afc2";
      ctx.fillRect(iconX + 4, iconY + 4, 10, 1);
      ctx.fillRect(iconX + 18, iconY + 4, 10, 1);
    } else if (item.id === "mifflin_tape") {
      // Tape roll + branded strip.
      ctx.fillStyle = "#e9ddb4";
      ctx.fillRect(iconX + 4, iconY + 6, 22, 14);
      ctx.fillStyle = "#d4c590";
      ctx.fillRect(iconX + 6, iconY + 8, 18, 10);
      ctx.fillStyle = "#6f88a8";
      ctx.fillRect(iconX + 11, iconY + 10, 8, 6);
      ctx.fillStyle = "#e9ddb4";
      ctx.fillRect(iconX + 13, iconY + 12, 4, 2);
      ctx.fillStyle = "#b6a875";
      ctx.fillRect(iconX + 4, iconY + 20, 22, 2);
      ctx.fillStyle = "#2a405a";
      ctx.fillRect(iconX + 6, iconY + 21, 12, 1);
    } else if (item.id === "desk_keycard") {
      // Keycard with magnetic stripe and tiny key notch.
      ctx.fillStyle = "#e8d59d";
      ctx.fillRect(iconX + 3, iconY + 5, 26, 15);
      ctx.fillStyle = "#f5e8c1";
      ctx.fillRect(iconX + 5, iconY + 7, 22, 11);
      ctx.fillStyle = "#95a4bb";
      ctx.fillRect(iconX + 21, iconY + 8, 6, 3);
      ctx.fillStyle = "#2f435f";
      ctx.fillRect(iconX + 8, iconY + 10, 8, 2);
      ctx.fillRect(iconX + 8, iconY + 14, 12, 2);
      ctx.fillStyle = "#6c5d35";
      ctx.fillRect(iconX + 27, iconY + 14, 2, 4);
    } else if (item.id === "energy_mug") {
      // World's Best Mug with handle and label bands.
      ctx.fillStyle = "#eef3fb";
      ctx.fillRect(iconX + 7, iconY + 4, 16, 16);
      ctx.fillRect(iconX + 23, iconY + 8, 4, 8);
      ctx.fillStyle = "#dbe4f2";
      ctx.fillRect(iconX + 9, iconY + 6, 12, 12);
      ctx.fillStyle = "#23384f";
      ctx.fillRect(iconX + 10, iconY + 9, 10, 2);
      ctx.fillRect(iconX + 11, iconY + 13, 8, 2);
      ctx.fillStyle = "#9db2cc";
      ctx.fillRect(iconX + 7, iconY + 20, 16, 2);
    }

    ctx.fillStyle = equipped ? "#b7f2bb" : "#ffe4a8";
    ctx.font = "bold 14px Trebuchet MS";
    if (equipped) {
      ctx.fillText("EQUIPPED", x + 8, y + 92);
    } else if (lockedByKey) {
      ctx.fillText("LOCKED", x + 8, y + 92);
    } else {
      if (count > 0) {
        ctx.fillText(`IN BAG x${count}`, x + 8, y + 92);
      } else {
        ctx.fillText(`BUY ${item.cost}`, x + 8, y + 92);
        drawCurrencyIcon("stanley_nickel", x + 60, y + 79, 1.0);
      }
    }

    // Top row is visually encased in yellow Jell-O until each item is purchased.
    if (row === 0 && !topRowCleared) {
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

    state.shopCards.push({ x, y, w: cardW, h: cardH, itemId: item.id, lockedByKey, count, equipped });
  }

  if (state.shopCards.length > 0 && !state.shopConversation) {
    const focusIdx = Math.max(0, Math.min(state.shopCards.length - 1, state.uiFocus.shopCard || 0));
    state.uiFocus.shopCard = focusIdx;
    const focused = state.shopCards[focusIdx];
    ctx.strokeStyle = "rgba(255, 228, 136, 0.95)";
    ctx.lineWidth = 3;
    ctx.strokeRect(focused.x - 3, focused.y - 3, focused.w + 6, focused.h + 6);
  }

  if (state.shopPurchasePrompt && !state.shopConversation) {
    const p = state.shopPurchasePrompt;
    const boxX = 82;
    const boxY = 408;
    const boxW = 836;
    const boxH = 96;
    drawPixelPanel(boxX, boxY, boxW, boxH, "rgba(12,20,36,0.93)", "rgba(8,14,26,0.95)", "#8bc8ff", "rgba(222,240,255,0.7)");
    ctx.fillStyle = "#ffd88c";
    ctx.font = "bold 20px Trebuchet MS";
    ctx.fillText(p.name, boxX + 14, boxY + 28);
    ctx.fillStyle = "#e8f0ff";
    ctx.font = "bold 16px Trebuchet MS";
    drawWrappedText(p.description, boxX + 14, boxY + 52, 560, 18, 2);

    // Dedicated status panel on the right so state text never overlaps.
    const infoX = boxX + 586;
    const infoY = boxY + 14;
    const infoW = 236;
    const infoH = 68;
    drawPixelPanel(infoX, infoY, infoW, infoH, "rgba(16,26,44,0.9)", "rgba(10,18,32,0.94)", "#7fbfff", "rgba(205,228,255,0.58)");
    if (p.lockedByKey) {
      ctx.fillStyle = "#ffd7a1";
      ctx.font = "bold 15px Trebuchet MS";
      drawWrappedText("LOCKED: Complete Save Pam.", infoX + 10, infoY + 22, infoW - 20, 16, 2);
    } else if (!p.canAfford) {
      ctx.fillStyle = "#ffb8a6";
      ctx.font = "bold 17px Trebuchet MS";
      ctx.fillText("NOT ENOUGH MONEY", infoX + 10, infoY + 24);
    } else {
      const buyBtn = { id: "buy", x: boxX + 592, y: boxY + 18, w: 108, h: 34 };
      const cancelBtn = { id: "cancel", x: boxX + 710, y: boxY + 18, w: 108, h: 34 };
      state.shopPromptBounds = [buyBtn, cancelBtn];
      for (const btn of state.shopPromptBounds) {
        ctx.fillStyle = btn.id === "buy" ? "#2d6e3a" : "#2f4f7a";
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.strokeStyle = "#9fd8ff";
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
        ctx.fillStyle = "#f5ead6";
        ctx.font = "bold 16px Trebuchet MS";
        ctx.fillText(btn.id === "buy" ? `BUY ${p.cost}` : "DON'T BUY", btn.x + (btn.id === "buy" ? 18 : 10), btn.y + 22);
        if (btn.id === "buy") drawCurrencyIcon("stanley_nickel", btn.x + 74, btn.y + 10, 0.9);
      }
    }
    ctx.fillStyle = "#b7f2bb";
    ctx.font = "bold 16px Trebuchet MS";
    ctx.fillText(`In inventory: ${p.count}`, infoX + 10, infoY + 56);
  }

  if (!state.shopPurchasePrompt || state.shopConversation) {
    ctx.fillStyle = state.shopForeheadStare ? "#ff9ea5" : state.shopMessageColor || "#c5d9f2";
    ctx.font = "17px Trebuchet MS";
    drawPixelPanel(82, 436, 836, 40, "rgba(10,15,24,0.88)", "rgba(7,10,18,0.88)", "#8bc8ff", "rgba(216,236,255,0.68)");
    drawWrappedTextWithCurrencyIcons(
      state.shopMessage || "Jim says this machine is 90% Jell-O, 10% disappointment, and 100% policy.",
      92,
      459,
      820,
      20,
      1
    );
  }
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
    drawPixelPanel(boxX, boxY, boxW, boxH, "rgba(14,22,38,0.92)", "rgba(8,12,22,0.92)", "#8bc8ff", "rgba(208,233,255,0.64)");
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
    } else if (state.shopConversation.actor === "jim" && state.shopConversation.step === "post_choice") {
      const prankBtn = { id: "ask_prank", x: boxX + 16, y: boxY + 94, w: 260, h: 30 };
      const deskBtn = { id: "ask_desk", x: boxX + 292, y: boxY + 94, w: 260, h: 30 };
      const leaveBtn = { id: "leave", x: boxX + 568, y: boxY + 94, w: 160, h: 30 };
      for (const btn of [prankBtn, deskBtn, leaveBtn]) {
        ctx.fillStyle = "#2f4f7a";
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.strokeStyle = "#8bc8ff";
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
      }
      ctx.fillStyle = "#f5ead6";
      ctx.font = "bold 14px Trebuchet MS";
      drawWrappedText("Best prank ever?", prankBtn.x + 10, prankBtn.y + 19, prankBtn.w - 16, 14, 1);
      drawWrappedText("What's in your desk now?", deskBtn.x + 10, deskBtn.y + 19, deskBtn.w - 16, 14, 1);
      ctx.font = "bold 16px Trebuchet MS";
      ctx.fillText("Leave", leaveBtn.x + 52, leaveBtn.y + 20);
      state.shopTalkBounds.push(prankBtn, deskBtn, leaveBtn);
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
    } else if (state.shopConversation.actor === "jim" && state.shopConversation.step === "post_reply") {
      const doneBtn = { id: "done", x: boxX + 16, y: boxY + 94, w: 150, h: 30 };
      ctx.fillStyle = "#2f4f7a";
      ctx.fillRect(doneBtn.x, doneBtn.y, doneBtn.w, doneBtn.h);
      ctx.strokeStyle = "#8bc8ff";
      ctx.strokeRect(doneBtn.x, doneBtn.y, doneBtn.w, doneBtn.h);
      ctx.fillStyle = "#f5ead6";
      ctx.font = "bold 16px Trebuchet MS";
      ctx.fillText("Nice", doneBtn.x + 56, doneBtn.y + 20);
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

  if (state.shopConversation && state.shopTalkBounds.length > 0) {
    const talkIdx = Math.max(0, Math.min(state.shopTalkBounds.length - 1, state.uiFocus.shopTalk || 0));
    state.uiFocus.shopTalk = talkIdx;
    const focused = state.shopTalkBounds[talkIdx];
    ctx.strokeStyle = "rgba(255, 228, 136, 0.95)";
    ctx.lineWidth = 3;
    ctx.strokeRect(focused.x - 2, focused.y - 2, focused.w + 4, focused.h + 4);
  } else if (!state.shopConversation && state.shopPurchasePrompt && state.shopPromptBounds.length > 0) {
    const promptIdx = Math.max(0, Math.min(state.shopPromptBounds.length - 1, state.uiFocus.shopPrompt || 0));
    state.uiFocus.shopPrompt = promptIdx;
    const focused = state.shopPromptBounds[promptIdx];
    ctx.strokeStyle = "rgba(255, 228, 136, 0.95)";
    ctx.lineWidth = 3;
    ctx.strokeRect(focused.x - 2, focused.y - 2, focused.w + 4, focused.h + 4);
  }
}

function drawDeskScene() {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#2d323f");
  grad.addColorStop(1, "#1e2330");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawPixelTexture(0, 0, canvas.width, canvas.height, "rgba(6,10,16,0.1)", "rgba(255,255,255,0.04)");
  // Office wall details.
  ctx.fillStyle = "#3a4253";
  for (let x = 34; x < canvas.width - 40; x += 122) {
    ctx.fillRect(x, 72, 92, 58);
    ctx.fillStyle = "#55617a";
    ctx.fillRect(x + 6, 78, 80, 46);
    ctx.fillStyle = "#3a4253";
  }
  // Desk scene props: monitor, lamp, and plant.
  ctx.fillStyle = "#202736";
  ctx.fillRect(450, 178, 118, 68);
  ctx.fillStyle = "#5f6f87";
  ctx.fillRect(456, 184, 106, 54);
  ctx.fillStyle = "#2a3345";
  ctx.fillRect(500, 246, 18, 10);
  ctx.fillRect(484, 256, 50, 4);
  ctx.fillStyle = "#d6c892";
  ctx.fillRect(598, 222, 8, 40);
  ctx.fillStyle = "#eadca7";
  ctx.fillRect(576, 212, 40, 12);
  ctx.fillStyle = "#5a6d48";
  ctx.fillRect(250, 212, 20, 14);
  ctx.fillStyle = "#7ea06a";
  ctx.fillRect(244, 204, 10, 10);
  ctx.fillRect(262, 204, 10, 10);

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
  drawPixelTexture(142, 252, 676, 186, "rgba(26,16,10,0.18)", "rgba(255,231,200,0.08)");
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
  ctx.fillStyle = "rgba(255,225,192,0.18)";
  ctx.fillRect(drawerX + 4, drawerY + 4, drawerW - 8, 2);

  if (state.deskDrawerOpen && hasKey) {
    const trayY = drawerY + 46;
    ctx.fillStyle = "#21170f";
    ctx.fillRect(drawerX + 10, trayY, drawerW - 20, 34);
    const cardX = drawerX + 28;
    const cardY = trayY + 4;
    const cardW = drawerW - 56;
    const cardH = 24;
    if (!state.saveData.unlocks.goldenfaceTakenFromDesk) {
      // Goldenface outfit card art.
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
      state.deskPhotoBounds = null;
    } else {
      // Post-claim desk content: Jim + Pam photo.
      ctx.fillStyle = "#e8e2d1";
      ctx.fillRect(cardX, cardY, cardW, cardH);
      ctx.strokeStyle = "#b6a98c";
      ctx.strokeRect(cardX, cardY, cardW, cardH);
      ctx.fillStyle = "#89a6c7";
      ctx.fillRect(cardX + 4, cardY + 4, 32, 16);
      // Jim (left)
      ctx.fillStyle = "#2b1f17";
      ctx.fillRect(cardX + 6, cardY + 6, 8, 2);
      ctx.fillStyle = "#efd0b2";
      ctx.fillRect(cardX + 7, cardY + 8, 6, 4);
      ctx.fillStyle = "#1c2435";
      ctx.fillRect(cardX + 7, cardY + 12, 6, 6);
      // Pam (right)
      ctx.fillStyle = "#7e5139";
      ctx.fillRect(cardX + 22, cardY + 6, 8, 2);
      ctx.fillStyle = "#f1cfb3";
      ctx.fillRect(cardX + 23, cardY + 8, 6, 4);
      ctx.fillStyle = "#d9eef9";
      ctx.fillRect(cardX + 23, cardY + 12, 6, 6);
      // Cece (center baby)
      ctx.fillStyle = "#f4dcc7";
      ctx.fillRect(cardX + 15, cardY + 12, 4, 3);
      ctx.fillStyle = "#f7e5b5";
      ctx.fillRect(cardX + 14, cardY + 15, 6, 3);
      ctx.fillStyle = "#30384a";
      ctx.font = "bold 10px Trebuchet MS";
      ctx.fillText("JIM + PAM + CECE", cardX + 42, cardY + 12);
      ctx.font = "9px Trebuchet MS";
      ctx.fillText("Click to view photo", cardX + 42, cardY + 21);
      state.deskPhotoBounds = { x: cardX, y: cardY, w: cardW, h: cardH };
      state.deskGoldenfaceBounds = null;
    }
  } else {
    state.deskGoldenfaceBounds = null;
    state.deskPhotoBounds = null;
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
    ctx.fillText(
      state.saveData.unlocks.goldenfaceTakenFromDesk
        ? "Goldenface was taken. Click the Jim + Pam photo to view it."
        : "Click the Goldenface outfit card in the drawer to equip it.",
      216,
      136
    );
  }
  ctx.fillStyle = "#b9d7ff";
  ctx.font = "17px Trebuchet MS";
  ctx.fillText("Press Enter to return to the conference room.", 286, 500);

  if (state.deskPhotoViewerOpen) {
    ctx.fillStyle = "rgba(8, 12, 22, 0.82)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const px = 220;
    const py = 108;
    const pw = 520;
    const ph = 300;
    ctx.fillStyle = "#f1ead8";
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = "#bda780";
    ctx.lineWidth = 3;
    ctx.strokeRect(px, py, pw, ph);
    // Inner matte + photo area.
    ctx.fillStyle = "#d7c9a9";
    ctx.fillRect(px + 12, py + 12, pw - 24, ph - 24);
    ctx.fillStyle = "#89a3c2";
    ctx.fillRect(px + 24, py + 24, pw - 48, ph - 96);

    const fx = px + 36;
    const fy = py + 34;
    const fw = pw - 72;
    const fh = ph - 118;
    const p = 2; // 16-bit pixel scale

    // Detailed office-photo background.
    ctx.fillStyle = "#9ab2cf";
    ctx.fillRect(fx, fy, fw, fh);
    ctx.fillStyle = "#7f98b7";
    ctx.fillRect(fx, fy + 22, fw, 3);
    ctx.fillRect(fx, fy + 56, fw, 2);
    ctx.fillStyle = "#6f87a7";
    ctx.fillRect(fx + 28, fy + 12, 54, 28);
    ctx.fillRect(fx + 334, fy + 10, 56, 30);
    ctx.fillStyle = "#b9cade";
    ctx.fillRect(fx + 32, fy + 16, 46, 18);
    ctx.fillRect(fx + 338, fy + 14, 48, 20);

    // Floor/foreground strip.
    ctx.fillStyle = "#738ba8";
    ctx.fillRect(fx, fy + fh - 32, fw, 32);

    // Jim (left) - 16-bit detail.
    const jx = fx + 88;
    const jy = fy + 24;
    ctx.fillStyle = "#2c2119";
    ctx.fillRect(jx + 4 * p, jy + 0 * p, 30 * p, 8 * p);
    ctx.fillRect(jx + 2 * p, jy + 6 * p, 8 * p, 6 * p);
    ctx.fillRect(jx + 28 * p, jy + 6 * p, 8 * p, 6 * p);
    ctx.fillStyle = "#efcfb3";
    ctx.fillRect(jx + 7 * p, jy + 8 * p, 24 * p, 18 * p);
    ctx.fillStyle = "#dcb79a";
    ctx.fillRect(jx + 9 * p, jy + 20 * p, 20 * p, 3 * p);
    ctx.fillStyle = "#2c3748";
    ctx.fillRect(jx + 12 * p, jy + 13 * p, 3 * p, 3 * p);
    ctx.fillRect(jx + 22 * p, jy + 13 * p, 3 * p, 3 * p);
    ctx.fillRect(jx + 14 * p, jy + 19 * p, 10 * p, 2 * p);
    ctx.fillStyle = "#1a2230";
    ctx.fillRect(jx + 6 * p, jy + 26 * p, 26 * p, 30 * p);
    ctx.fillStyle = "#f5f7fb";
    ctx.fillRect(jx + 16 * p, jy + 28 * p, 6 * p, 24 * p);
    ctx.fillStyle = "#d8dfea";
    ctx.fillRect(jx + 18 * p, jy + 27 * p, 2 * p, 14 * p);
    ctx.fillRect(jx + 15 * p, jy + 49 * p, 8 * p, 4 * p);
    ctx.fillStyle = "#263446";
    ctx.fillRect(jx + 6 * p, jy + 26 * p, 8 * p, 30 * p);
    ctx.fillRect(jx + 24 * p, jy + 26 * p, 8 * p, 30 * p);

    // Pam (right) - longer hair + cardigan detail.
    const px2 = fx + 252;
    const py2 = fy + 24;
    ctx.fillStyle = "#7b503a";
    ctx.fillRect(px2 + 4 * p, py2 + 0 * p, 30 * p, 8 * p);
    ctx.fillRect(px2 + 2 * p, py2 + 6 * p, 8 * p, 18 * p);
    ctx.fillRect(px2 + 28 * p, py2 + 6 * p, 8 * p, 18 * p);
    ctx.fillStyle = "#f1cfb3";
    ctx.fillRect(px2 + 7 * p, py2 + 8 * p, 24 * p, 18 * p);
    ctx.fillStyle = "#dfbda0";
    ctx.fillRect(px2 + 9 * p, py2 + 20 * p, 20 * p, 3 * p);
    ctx.fillStyle = "#2b3343";
    ctx.fillRect(px2 + 12 * p, py2 + 13 * p, 3 * p, 3 * p);
    ctx.fillRect(px2 + 22 * p, py2 + 13 * p, 3 * p, 3 * p);
    ctx.fillRect(px2 + 14 * p, py2 + 19 * p, 10 * p, 2 * p);
    ctx.fillStyle = "#d9eef9";
    ctx.fillRect(px2 + 6 * p, py2 + 26 * p, 26 * p, 30 * p);
    ctx.fillStyle = "#7f96bf";
    ctx.fillRect(px2 + 6 * p, py2 + 26 * p, 6 * p, 30 * p);
    ctx.fillRect(px2 + 26 * p, py2 + 26 * p, 6 * p, 30 * p);
    ctx.fillStyle = "#5f78a7";
    ctx.fillRect(px2 + 16 * p, py2 + 27 * p, 4 * p, 20 * p);

    // Baby Cece center/front with blanket.
    const cx = fx + 196;
    const cy = fy + 90;
    ctx.fillStyle = "#f5decb";
    ctx.fillRect(cx + 8 * p, cy + 0 * p, 14 * p, 10 * p);
    ctx.fillStyle = "#dcb79a";
    ctx.fillRect(cx + 10 * p, cy + 8 * p, 10 * p, 2 * p);
    ctx.fillStyle = "#e9c88a";
    ctx.fillRect(cx + 6 * p, cy + 10 * p, 18 * p, 12 * p);
    ctx.fillStyle = "#f7e5b5";
    ctx.fillRect(cx + 3 * p, cy + 14 * p, 24 * p, 11 * p);
    ctx.fillStyle = "#2f384b";
    ctx.fillRect(cx + 12 * p, cy + 4 * p, 2 * p, 2 * p);
    ctx.fillRect(cx + 17 * p, cy + 4 * p, 2 * p, 2 * p);
    ctx.fillRect(cx + 12 * p, cy + 7 * p, 7 * p, 1 * p);
    ctx.fillStyle = "#d7b065";
    ctx.fillRect(cx + 5 * p, cy + 18 * p, 20 * p, 2 * p);

    // Film-grain / scanline look for 16-bit photo texture.
    ctx.fillStyle = "rgba(10, 16, 30, 0.09)";
    for (let yy = fy; yy < fy + fh; yy += 4) ctx.fillRect(fx, yy, fw, 1);
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.fillRect(fx + 6, fy + 6, fw - 12, 6);

    // Matte label strip.
    ctx.fillStyle = "#e3d6bb";
    ctx.fillRect(px + 24, py + ph - 64, pw - 48, 32);
    ctx.fillStyle = "#f9d97f";
    ctx.font = "bold 23px Trebuchet MS";
    ctx.fillText("Jim + Pam + Cece", px + 184, py + 242);
    ctx.fillStyle = "#2e3544";
    ctx.font = "bold 16px Trebuchet MS";
    ctx.fillText("Click anywhere to close", px + 182, py + 271);
  }
}

function selectDeskByCanvasPoint(x, y) {
  if (state.deskPhotoViewerOpen) {
    state.deskPhotoViewerOpen = false;
    return;
  }
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
    state.saveData.unlocks.goldenfaceTakenFromDesk = true;
    persistSave();
    showMissionToast("Goldenface equipped. Return to the conference room.");
    switchScene("menu");
    return;
  }

  if (
    state.deskPhotoBounds &&
    x >= state.deskPhotoBounds.x &&
    x <= state.deskPhotoBounds.x + state.deskPhotoBounds.w &&
    y >= state.deskPhotoBounds.y &&
    y <= state.deskPhotoBounds.y + state.deskPhotoBounds.h
  ) {
    state.deskPhotoViewerOpen = true;
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
  if (!state.shopConversation && state.shopPurchasePrompt && state.shopPromptBounds.length > 0) {
    for (const btn of state.shopPromptBounds) {
      if (x < btn.x || x > btn.x + btn.w || y < btn.y || y > btn.y + btn.h) continue;
      state.uiFocus.shopPrompt = Math.max(0, state.shopPromptBounds.indexOf(btn));
      handleShopPromptClick(btn.id);
      return;
    }
  }

  if (state.shopTalkBounds.length > 0) {
    for (const target of state.shopTalkBounds) {
      if (x < target.x || x > target.x + target.w || y < target.y || y > target.y + target.h) continue;
      state.uiFocus.shopTalk = Math.max(0, state.shopTalkBounds.indexOf(target));
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
    state.uiFocus.shopCard = Math.max(0, state.shopCards.indexOf(card));
    openShopItemPrompt(card.itemId);
    return;
  }
}

function drawMissionsScene() {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#1f2f4f");
  grad.addColorStop(1, "#12213a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawPixelTexture(0, 0, canvas.width, canvas.height, "rgba(6,14,28,0.12)", "rgba(255,255,255,0.05)");

  drawPixelPanel(64, 54, 832, 476, "rgba(14,23,40,0.9)", "rgba(9,16,30,0.9)", "#8bc8ff", "rgba(217,236,255,0.68)");

  drawTitleText("Missions Board", 386, 110, "bold 36px Trebuchet MS", "#ffe08f");

  const savePam = state.saveData.missions.savePam;
  const capture = state.saveData.missions.captureStrangler;
  const tlm = state.saveData.missions.threatLevelMidnight;
  const visibleMissions = [];
  if (savePam.added || savePam.completed) {
    let detail = "";
    if (!savePam.warehouseCleared && !savePam.completed) {
      detail = "Finish Warehouse once to trigger Pam search mode.";
    } else if (!savePam.completed) {
      detail = `Replay Warehouse: press P whenever Pam appears. Best in one run: ${savePam.sightingsBest || 0}/5.`;
    } else {
      detail = "Pam rescued. Talk to her in the shop for your next mission.";
    }
    visibleMissions.push({
      title: "Save Pam",
      detail,
      status: savePam.completed ? "Completed" : "Active",
      done: savePam.completed,
      color: "#7ee0a2",
    });
  }
  if (capture.added || capture.completed) {
    let detail = "";
    if (!capture.completed) {
      detail = "Beat Final Pursuit by hitting x10 HARDCORE, then jump on the Strangler's car.";
    } else if (!state.saveData.unlocks.jimDeskKey) {
      detail = "Return to Pam in the shop to claim Jim's Desk Key.";
    } else {
      detail = "Captured. Key claimed from Pam.";
    }
    visibleMissions.push({
      title: "Capture The Strangler",
      detail,
      status: capture.completed ? (state.saveData.unlocks.jimDeskKey ? "Completed" : "Complete - Reward Unclaimed") : "Active",
      done: capture.completed,
      color: "#9dc9ff",
    });
  }
  if (tlm.added || tlm.completed) {
    const detail = tlm.completed
      ? "Secret warp protocol armed. Michael Scarn mode is ready."
      : "Press D to open Jim's Desk, equip Goldenface from the drawer, then click Michael's mug in the Conference Room.";
    visibleMissions.push({
      title: "Threat Level Midnight",
      detail,
      status: tlm.completed ? "Completed" : "Active",
      done: tlm.completed,
      color: "#f4cc7a",
    });
  }

  const baseY = 136;
  const rowStep = 122;
  for (let i = 0; i < visibleMissions.length; i += 1) {
    const mission = visibleMissions[i];
    const y = baseY + i * rowStep;
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(88, y, 784, 102);
    ctx.fillStyle = mission.done ? mission.color : "#3e4b64";
    ctx.fillRect(96, y + 12, 14, 14);
    if (mission.done) {
      ctx.fillStyle = "#122334";
      ctx.fillRect(100, y + 18, 3, 3);
      ctx.fillRect(103, y + 21, 3, 3);
      ctx.fillRect(106, y + 18, 4, 3);
    }

    ctx.fillStyle = "#f5ead6";
    ctx.font = "bold 22px Trebuchet MS";
    ctx.fillText(mission.title, 124, y + 24);
    ctx.font = "18px Trebuchet MS";
    drawWrappedText(
      mission.detail,
      124,
      y + 52,
      740,
      22,
      2
    );
    ctx.fillStyle = "#d5ecff";
    ctx.fillText(`Status: ${mission.status}`, 124, y + 92);
  }

  if (visibleMissions.length === 0) {
    ctx.fillStyle = "#f5ead6";
    ctx.font = "bold 24px Trebuchet MS";
    ctx.fillText("No active missions yet.", 106, 190);
    ctx.font = "18px Trebuchet MS";
    ctx.fillStyle = "#d5ecff";
    ctx.fillText("Talk to Jim in the shop to kick off your first mission.", 106, 224);
  }

  ctx.fillStyle = "#c9ddff";
  ctx.font = "17px Trebuchet MS";
  ctx.fillText("Press M to close missions and get back to the chaos.", 106, 524);
}

function drawTutorialScene() {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#213963");
  grad.addColorStop(1, "#132443");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawPixelTexture(0, 0, canvas.width, canvas.height, "rgba(9,14,28,0.15)", "rgba(255,255,255,0.04)");

  drawPixelPanel(84, 64, 792, 412, "rgba(12,22,42,0.9)", "rgba(8,16,32,0.92)", "#8acfff", "rgba(216,236,255,0.64)");
  drawTitleText("Quick Tutorial", 332, 118, "bold 42px Trebuchet MS", "#ffd86f");
  ctx.fillStyle = "#e7f1ff";
  ctx.font = "bold 22px Trebuchet MS";
  drawWrappedText("Welcome to Dunder Mifflin Parkour Orientation.", 132, 164, 700, 28, 2);
  ctx.font = "bold 20px Trebuchet MS";
  ctx.fillStyle = "#ffe8b0";
  ctx.fillText("1. Tap Space to jump", 132, 220);
  ctx.fillText("2. Hold Space to slide", 132, 254);
  ctx.fillText("3. Press J right after landing for HARDCORE", 132, 288);
  ctx.fillText("4. Press K to hit things", 132, 322);
  ctx.fillStyle = "#cfe4ff";
  ctx.font = "bold 18px Trebuchet MS";
  ctx.fillText("Enter: Start tutorial run", 132, 382);
  ctx.fillText("K: Skip tutorial", 132, 412);
}

function drawInventoryScene() {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#2b3658");
  grad.addColorStop(1, "#151f37");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawPixelTexture(0, 0, canvas.width, canvas.height, "rgba(8,16,32,0.14)", "rgba(255,255,255,0.04)");

  drawPixelPanel(54, 50, 852, 440, "rgba(14,23,40,0.9)", "rgba(9,16,30,0.9)", "#8bc8ff", "rgba(217,236,255,0.68)");
  drawTitleText("Inventory", 404, 106, "bold 38px Trebuchet MS", "#ffe08f");

  ctx.fillStyle = "#d4e9ff";
  ctx.font = "16px Trebuchet MS";
  drawWrappedText("Click or press Enter to equip/unequip. Equipped items are consumed when a run starts.", 84, 136, 792, 20, 2);

  state.inventoryCards = [];
  const cols = 3;
  const cardW = 248;
  const cardH = 108;
  const startX = 84;
  const startY = 178;
  const colGap = 18;
  const rowGap = 16;

  for (let i = 0; i < SHOP_ITEMS.length; i += 1) {
    const item = SHOP_ITEMS[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (cardW + colGap);
    const y = startY + row * (cardH + rowGap);
    const count = getInventoryCount(item.id);
    const equipped = isItemEquipped(item.id);

    ctx.fillStyle = equipped ? "#2e5a42" : count > 0 ? "#2a4568" : "#343a4a";
    ctx.fillRect(x, y, cardW, cardH);
    ctx.strokeStyle = equipped ? "#b7f2bb" : count > 0 ? "#8bc8ff" : "#687086";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, cardW, cardH);

    ctx.fillStyle = "#f5ead6";
    ctx.font = "bold 18px Trebuchet MS";
    drawWrappedText(item.name, x + 12, y + 25, 160, 18, 2);
    ctx.font = "14px Trebuchet MS";
    drawWrappedText(item.description, x + 12, y + 50, 186, 16, 3);

    ctx.fillStyle = count > 0 ? "#d8f3ff" : "#ffb6b6";
    ctx.font = "bold 15px Trebuchet MS";
    ctx.fillText(`Count: ${count}`, x + 12, y + 96);

    ctx.fillStyle = equipped ? "#b7f2bb" : count > 0 ? "#ffe4a8" : "#9ba5b9";
    ctx.font = "bold 14px Trebuchet MS";
    ctx.fillText(equipped ? "EQUIPPED" : count > 0 ? "AVAILABLE" : "EMPTY", x + 156, y + 96);

    state.inventoryCards.push({ x, y, w: cardW, h: cardH, itemId: item.id });
  }

  if (state.inventoryCards.length > 0) {
    const idx = Math.max(0, Math.min(state.inventoryCards.length - 1, state.uiFocus.inventoryCard || 0));
    state.uiFocus.inventoryCard = idx;
    const focused = state.inventoryCards[idx];
    ctx.strokeStyle = "rgba(255, 228, 136, 0.95)";
    ctx.lineWidth = 3;
    ctx.strokeRect(focused.x - 3, focused.y - 3, focused.w + 6, focused.h + 6);
  }

  ctx.fillStyle = "#c9ddff";
  ctx.font = "16px Trebuchet MS";
  ctx.fillText("I: Close inventory   Enter: Toggle equip   Esc: Back to conference room", 86, 474);
}

function selectInventoryByCanvasPoint(x, y) {
  for (const card of state.inventoryCards) {
    if (x < card.x || x > card.x + card.w || y < card.y || y > card.y + card.h) continue;
    state.uiFocus.inventoryCard = Math.max(0, state.inventoryCards.indexOf(card));
    toggleInventoryEquip(card.itemId);
    return;
  }
}

function drawSettingsScene() {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#1f2f4f");
  grad.addColorStop(1, "#0f1d37");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawPixelTexture(0, 0, canvas.width, canvas.height, "rgba(7,13,26,0.14)", "rgba(255,255,255,0.04)");

  drawPixelPanel(86, 62, 788, 420, "rgba(14,23,40,0.9)", "rgba(9,16,30,0.9)", "#8bc8ff", "rgba(217,236,255,0.68)");
  drawTitleText("Settings", 408, 118, "bold 38px Trebuchet MS", "#ffe08f");

  const s = getSettings();
  const options = [
    { label: "Music Volume", value: `${Math.round((s.musicVolume || 0) * 100)}%` },
    { label: "SFX Volume", value: `${Math.round((s.sfxVolume || 0) * 100)}%` },
    { label: "Screen Shake", value: s.screenShake ? "ON" : "OFF" },
    { label: "Parkour Assist", value: s.parkourAssist ? "ON" : "OFF" },
    { label: "Show FPS", value: s.showFps ? "ON" : "OFF" },
    { label: "Export Save", value: "Press Enter" },
    { label: "Import Save", value: "Press Enter" },
  ];
  state.settingsOptions = options;

  for (let i = 0; i < options.length; i += 1) {
    const y = 158 + i * 42;
    const selected = i === (state.uiFocus.settingsOption || 0);
    ctx.fillStyle = selected ? "rgba(255, 228, 136, 0.18)" : "rgba(255,255,255,0.05)";
    ctx.fillRect(118, y - 24, 724, 34);
    if (selected) {
      ctx.strokeStyle = "#ffd56a";
      ctx.strokeRect(118, y - 24, 724, 34);
    }
    ctx.fillStyle = "#f4ead9";
    ctx.font = "bold 19px Trebuchet MS";
    ctx.fillText(options[i].label, 136, y - 2);
    ctx.fillStyle = "#bde7ff";
    ctx.font = "bold 18px Trebuchet MS";
    ctx.fillText(options[i].value, 670, y - 2);
  }

  ctx.fillStyle = "#d0e6ff";
  ctx.font = "16px Trebuchet MS";
  drawWrappedText("Left/Right: adjust values. Enter: toggle/select. Esc: back to conference room.", 120, 462, 740, 18, 2);
}

function drawCharacterSelectScene() {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, "#1d3461");
  grad.addColorStop(1, "#0f1e3d");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawPixelTexture(0, 0, canvas.width, canvas.height, "rgba(12,20,42,0.2)", "rgba(255,255,255,0.05)");

  // Full-screen room presentation (no inset "window inside window").

  drawTitleText("Character Select", 332, 108, "bold 38px Trebuchet MS", "#ffe08f");

  state.characterCards = [];
  const entries = [
    { id: "michael", x: 112, y: 152, colorA: "#2a3f69", colorB: "#1b2d4f" },
    { id: "dwight", x: 372, y: 152, colorA: "#4d3b2b", colorB: "#322419" },
    { id: "andy", x: 632, y: 152, colorA: "#5a2f2f", colorB: "#381f1f" },
  ];

  for (const entry of entries) {
    const p = CHARACTER_PRESETS[entry.id];
    const selected = getRunnerId() === entry.id;
    drawPixelPanel(
      entry.x,
      entry.y,
      216,
      220,
      entry.colorA,
      entry.colorB,
      selected ? "#ffd56a" : "#88c6f7",
      selected ? "rgba(255,239,184,0.7)" : "rgba(198,226,255,0.55)"
    );
    ctx.fillStyle = selected ? "rgba(255,224,122,0.14)" : "rgba(255,255,255,0.06)";
    ctx.fillRect(entry.x + 8, entry.y + 10, 200, 168);

    drawHeroPortraitSprite(entry.x + 82, entry.y + 178, 2.1, { label: p.label });

    ctx.fillStyle = "#f8e9c0";
    ctx.font = "bold 24px Trebuchet MS";
    ctx.fillText(p.label, entry.x + 58, entry.y + 198);

    if (selected) {
      ctx.fillStyle = "#ffe8a8";
      ctx.font = "bold 14px Trebuchet MS";
      ctx.fillText("SELECTED", entry.x + 64, entry.y + 216);
    }
    state.characterCards.push({ x: entry.x, y: entry.y, w: 216, h: 220, id: entry.id });
  }

  if (state.characterCards.length > 0) {
    const focusIdx = Math.max(0, Math.min(state.characterCards.length - 1, state.uiFocus.characterCard || 0));
    state.uiFocus.characterCard = focusIdx;
    const focused = state.characterCards[focusIdx];
    ctx.strokeStyle = "rgba(255, 228, 136, 0.95)";
    ctx.lineWidth = 4;
    ctx.strokeRect(focused.x - 4, focused.y - 4, focused.w + 8, focused.h + 8);
  }

  drawPixelPanel(84, 396, 792, 74, "rgba(12,22,42,0.9)", "rgba(8,16,32,0.9)", "#8acfff", "rgba(217,236,255,0.66)");
  ctx.fillStyle = "#d5edff";
  ctx.font = "bold 18px Trebuchet MS";
  drawWrappedText(getCharacterAbilityText(getRunnerId()), 102, 424, 756, 24, 2);
  ctx.fillStyle = "#a9d8ff";
  ctx.font = "15px Trebuchet MS";
  ctx.fillText("Click a character card to select. Press Enter to start.", 102, 456);
}

function selectCharacterByCanvasPoint(x, y) {
  for (const card of state.characterCards) {
    if (x < card.x || x > card.x + card.w || y < card.y || y > card.y + card.h) continue;
    state.uiFocus.characterCard = Math.max(0, state.characterCards.indexOf(card));
    characterSelect.value = card.id;
    switchRunnerProfile(card.id);
    setMenuDialogue();
    playThemeSwitchCue();
    return;
  }
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
  drawPixelTexture(0, 0, canvas.width, canvas.height, "rgba(35,10,36,0.12)", "rgba(255,255,255,0.04)");
  // Boutique runway floor.
  ctx.fillStyle = "#6e4e6d";
  ctx.fillRect(0, 408, canvas.width, 132);
  for (let x = 0; x < canvas.width; x += 48) {
    ctx.fillStyle = "rgba(255,220,255,0.12)";
    ctx.fillRect(x + 8, 430, 24, 2);
  }
  // Boutique mirror + clothing rack props.
  drawPixelPanel(706, 108, 138, 132, "#5e6e8b", "#44546d", "#bcd8ff", "rgba(225,240,255,0.76)");
  ctx.fillStyle = "rgba(220,245,255,0.34)";
  ctx.fillRect(716, 118, 118, 112);
  ctx.fillStyle = "#8c97ac";
  ctx.fillRect(112, 132, 166, 4);
  ctx.fillRect(126, 136, 2, 34);
  ctx.fillRect(164, 136, 2, 34);
  ctx.fillRect(202, 136, 2, 34);
  ctx.fillRect(240, 136, 2, 34);
  ctx.fillStyle = "#d0bfa6";
  ctx.fillRect(122, 170, 10, 16);
  ctx.fillRect(160, 170, 10, 16);
  ctx.fillRect(198, 170, 10, 16);
  ctx.fillRect(236, 170, 10, 16);

  // Full-screen room presentation (no inset "window inside window").

  drawTitleText("Annex Boutique", 372, 118, "bold 36px Trebuchet MS", "#ffe6ab");

  ctx.fillStyle = "#f7edf7";
  ctx.font = "18px Trebuchet MS";
  ctx.fillText(`Runner: ${runnerPreset.label}`, 64, 154);
  ctx.fillText("Wallet:", 64, 178);
  const annexSbW = drawCurrencyIcon("schrute_buck", 136, 166, 1.08);
  ctx.fillText(`${state.saveData.currencies.schruteBucks}`, 136 + annexSbW + 8, 178);
  ctx.fillText(`Dundies: ${Object.values(state.saveData.achievements).filter(Boolean).length}/3`, 64, 202);
  drawWrappedTextWithCurrencyIcons("Kelly only accepts [SB] only.", 64, 226, 320, 18, 1);

  // Dundie trophy case.
  state.annexAchievementBounds = [];
  const caseX = 56;
  const caseY = 238;
  const caseW = 252;
  const caseH = 148;
  drawPixelPanel(caseX, caseY, caseW, caseH, "#3f2c28", "#2c1e1b", "#b98a65", "rgba(238,208,177,0.6)");
  // Header plate.
  ctx.fillStyle = "#7f5b48";
  ctx.fillRect(caseX + 52, caseY + 10, caseW - 104, 16);
  ctx.fillStyle = "#b69179";
  ctx.fillRect(caseX + 56, caseY + 12, caseW - 112, 3);
  ctx.fillStyle = "#f5e3c8";
  ctx.font = "bold 11px Trebuchet MS";
  ctx.fillText("DUNDER MIFFLIN DUNDIES", caseX + 66, caseY + 22);
  // Inner wood shelf and trim.
  ctx.fillStyle = "#6d4b3c";
  ctx.fillRect(caseX + 10, caseY + 86, caseW - 20, 8);
  ctx.fillStyle = "#8d6653";
  ctx.fillRect(caseX + 10, caseY + 80, caseW - 20, 4);
  ctx.fillRect(caseX + 10, caseY + 102, caseW - 20, 2);
  // Sliding door rails.
  ctx.fillStyle = "#5a3d31";
  ctx.fillRect(caseX + 10, caseY + 30, caseW - 20, 4);
  ctx.fillRect(caseX + 10, caseY + caseH - 20, caseW - 20, 4);
  ctx.fillStyle = "#9f7b66";
  ctx.fillRect(caseX + 12, caseY + 31, caseW - 24, 1);
  ctx.fillRect(caseX + 12, caseY + caseH - 19, caseW - 24, 1);
  // Spotlights.
  for (let i = 0; i < 3; i += 1) {
    const sx = caseX + 50 + i * 76;
    const beam = ctx.createLinearGradient(sx, caseY + 16, sx, caseY + 104);
    beam.addColorStop(0, "rgba(255,242,205,0.30)");
    beam.addColorStop(1, "rgba(255,242,205,0.03)");
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(sx - 10, caseY + 16);
    ctx.lineTo(sx + 10, caseY + 16);
    ctx.lineTo(sx + 20, caseY + 104);
    ctx.lineTo(sx - 20, caseY + 104);
    ctx.closePath();
    ctx.fill();
  }
  // Glass pane and reflections.
  ctx.fillStyle = "rgba(200, 230, 255, 0.14)";
  ctx.fillRect(caseX + 8, caseY + 8, caseW - 16, caseH - 16);
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.fillRect(caseX + 18, caseY + 14, 12, caseH - 28);
  ctx.fillRect(caseX + 42, caseY + 14, 6, caseH - 28);
  ctx.fillRect(caseX + 170, caseY + 14, 8, caseH - 28);

  const dundieKeys = ["hottestInOffice", "whitestSneakers", "dontGoInThere"];
  for (let i = 0; i < 3; i += 1) {
    const unlocked = Boolean(state.saveData.achievements[dundieKeys[i]]);
    const slotX = caseX + 20 + i * 76;
    const slotY = caseY + 20;

    // Dundie style: gold figure + red marble column + black base + gold plaque.
    const gold = unlocked ? "#f2c95f" : "#7f7886";
    const goldShade = unlocked ? "#c29b3e" : "#5e5865";
    const goldHi = unlocked ? "#fff0b7" : "#a49eae";

    // Gold figure (head, torso, arms, legs).
    ctx.fillStyle = gold;
    ctx.fillRect(slotX + 23, slotY + 6, 6, 4); // head
    ctx.fillRect(slotX + 21, slotY + 10, 10, 7); // shoulders/chest
    ctx.fillRect(slotX + 24, slotY + 17, 4, 6); // waist
    ctx.fillRect(slotX + 19, slotY + 12, 2, 7); // left arm
    ctx.fillRect(slotX + 31, slotY + 12, 2, 7); // right arm
    ctx.fillRect(slotX + 23, slotY + 23, 2, 5); // left leg
    ctx.fillRect(slotX + 27, slotY + 23, 2, 5); // right leg
    ctx.fillStyle = goldShade;
    ctx.fillRect(slotX + 28, slotY + 10, 2, 18);
    ctx.fillStyle = goldHi;
    ctx.fillRect(slotX + 24, slotY + 7, 2, 1);
    ctx.fillRect(slotX + 22, slotY + 12, 2, 1);

    // Gold neck + plate.
    ctx.fillStyle = gold;
    ctx.fillRect(slotX + 24, slotY + 28, 4, 4);
    ctx.fillRect(slotX + 20, slotY + 32, 12, 3);

    // Red marble column.
    ctx.fillStyle = unlocked ? "#6a121a" : "#4c3f52";
    ctx.fillRect(slotX + 18, slotY + 35, 16, 16);
    ctx.fillStyle = unlocked ? "#9c242f" : "#70667b";
    ctx.fillRect(slotX + 20, slotY + 37, 2, 12);
    ctx.fillRect(slotX + 26, slotY + 36, 2, 14);
    ctx.fillRect(slotX + 30, slotY + 38, 1, 10);
    ctx.fillStyle = unlocked ? "rgba(255,120,120,0.25)" : "rgba(225,210,240,0.18)";
    ctx.fillRect(slotX + 22, slotY + 41, 6, 1);
    ctx.fillRect(slotX + 21, slotY + 45, 7, 1);

    // Black base.
    ctx.fillStyle = unlocked ? "#161a24" : "#2d2b33";
    ctx.fillRect(slotX + 14, slotY + 51, 24, 10);
    ctx.fillStyle = unlocked ? "#2a3040" : "#464150";
    ctx.fillRect(slotX + 16, slotY + 52, 20, 2);

    // Gold plaque with fake writing lines.
    ctx.fillStyle = unlocked ? "#d8ba71" : "#9a93a2";
    ctx.fillRect(slotX + 16, slotY + 57, 20, 4);
    ctx.fillStyle = unlocked ? "#f4e1b0" : "#cdc7d8";
    ctx.fillRect(slotX + 18, slotY + 58, 13, 1);
    ctx.fillRect(slotX + 18, slotY + 59, 10, 1);
    ctx.fillStyle = unlocked ? "rgba(50,35,15,0.45)" : "rgba(30,26,36,0.35)";
    ctx.fillRect(slotX + 19, slotY + 58, 11, 1);

    state.annexAchievementBounds.push({ x: slotX + 3, y: slotY + 4, w: 50, h: 80, id: dundieKeys[i] });
  }
  ctx.fillStyle = "#e7d8f2";
  ctx.font = "12px Trebuchet MS";
  ctx.fillText("Click a Dundie to view how to earn it.", caseX + 10, caseY + caseH - 10);

  // Kelly sprite.
  const kx = 832;
  const ky = 424;
  const ks = 1.82;
  drawHeroPortraitSprite(kx, ky, ks, {
    label: "Kelly",
    shirtColor: "#cf66a8",
    hideTie: true,
    hairBase: "#221616",
  });

  // Player preview wearing the currently equipped outfit.
  const px = 852;
  const py = 286;
  const ps = 1.8;
  drawHeroPortraitSprite(px, py, ps, { label: runnerPreset.label, outfitId: equipped });

  // Outfit cards.
  state.annexCards = [];
  const startX = 320;
  const startY = 132;
  const cardW = 160;
  const cardH = 126;
  const colGap = 14;
  const rowGap = 10;
  const visibleOutfits = ANNEX_OUTFITS.filter((outfit) => {
    if (!isOutfitUsableByRunner(outfit, runnerId)) return false;
    if (outfit.id === "goldenface") {
      return Boolean(state.saveData.unlocks.goldenfaceTakenFromDesk || ownsOutfit("goldenface"));
    }
    if (outfit.id === "strangler_hood") {
      return Boolean(state.saveData.missions.captureStrangler.completed || ownsOutfit("strangler_hood"));
    }
    return true;
  });
  for (let i = 0; i < visibleOutfits.length; i += 1) {
    const outfit = visibleOutfits[i];
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = startX + col * (cardW + colGap);
    const y = startY + row * (cardH + rowGap);
    const owned = ownsOutfit(outfit.id);
    const reqMet = hasOutfitAchievementRequirement(outfit);
    const isEquipped = equipped === outfit.id;

    ctx.fillStyle = isEquipped ? "#3d6f4f" : owned ? "#31507a" : reqMet ? "#4c3d62" : "#3f3948";
    ctx.fillRect(x, y, cardW, cardH);
    ctx.strokeStyle = isEquipped ? "#b7f5c8" : "#91d2ff";
    ctx.strokeRect(x, y, cardW, cardH);
    drawPixelTexture(x + 1, y + 1, cardW - 2, cardH - 2, "rgba(0,0,0,0.12)", "rgba(255,255,255,0.08)");
    drawOutfitCardThumbnail(x + 116, y + 64, outfit.id);
    ctx.fillStyle = "#f5ead6";
    ctx.font = "bold 14px Trebuchet MS";
    drawWrappedText(outfit.name, x + 8, y + 20, 104, 15, 2);
    ctx.font = "12px Trebuchet MS";
    drawWrappedText(outfit.tagline, x + 8, y + 50, 104, 13, 4);

    let badge = isDundieRewardOutfit(outfit) ? "EARN FROM DUNDIE" : `BUY ${outfit.cost} [SB]`;
    if (!reqMet) badge = isDundieRewardOutfit(outfit) ? "LOCKED (DUNDIE)" : "LOCKED";
    else if (isEquipped) badge = "EQUIPPED";
    else if (owned) badge = "EQUIP";
    ctx.fillStyle = isEquipped ? "#d6ffd8" : "#ffe0a8";
    ctx.font = "bold 14px Trebuchet MS";
    if (badge.includes("[SB]")) {
      drawWrappedTextWithCurrencyIcons(badge, x + 8, y + 116, 102, 14, 1);
    } else {
      drawWrappedText(badge, x + 8, y + 116, 102, 14, 1);
    }

    state.annexCards.push({ x, y, w: cardW, h: cardH, outfitId: outfit.id });
  }

  if (state.annexCards.length > 0) {
    const focusIdx = Math.max(0, Math.min(state.annexCards.length - 1, state.uiFocus.annexCard || 0));
    state.uiFocus.annexCard = focusIdx;
    const focused = state.annexCards[focusIdx];
    ctx.strokeStyle = "rgba(255, 228, 136, 0.95)";
    ctx.lineWidth = 3;
    ctx.strokeRect(focused.x - 3, focused.y - 3, focused.w + 6, focused.h + 6);
  }

  drawPixelPanel(64, 22, 868, 34, "rgba(18,12,30,0.9)", "rgba(11,7,20,0.9)", "#ffbbec", "rgba(255,224,246,0.58)");
  ctx.fillStyle = "#f5deef";
  ctx.font = "17px Trebuchet MS";
  drawWrappedTextWithCurrencyIcons(
    state.annexMessage || "Kelly: Welcome to the Annex Boutique, where confidence is mandatory and glitter is a lifestyle.",
    76,
    45,
    848,
    18,
    1
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

  if (outfitId === "strangler_hood") {
    const hx = Math.round(baseX);
    const hy = Math.round(baseY);
    // Explicit custom sample so the card is unmistakably the hood outfit.
    ctx.fillStyle = "rgba(0,0,0,0.24)";
    ctx.beginPath();
    ctx.ellipse(hx + 14, hy + 44, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Solid hood shape first, then carve opening to avoid any seams/gaps.
    ctx.fillStyle = "#1a2235";
    ctx.fillRect(hx + 6, hy + 1, 16, 18); // full hood body
    ctx.fillStyle = "#24314c";
    ctx.fillRect(hx + 7, hy + 2, 14, 3); // top rim accent
    ctx.fillStyle = "#121a2a";
    ctx.fillRect(hx + 6, hy + 1, 2, 18); // left outer edge
    ctx.fillRect(hx + 20, hy + 1, 2, 18); // right outer edge
    ctx.fillStyle = "#0d111c";
    ctx.fillRect(hx + 10, hy + 6, 8, 8); // square opening
    ctx.fillStyle = "#060910";
    ctx.fillRect(hx + 10, hy + 7, 8, 6); // dark mask
    ctx.fillStyle = "#c3d2ee";
    ctx.fillRect(hx + 12, hy + 9, 1, 1); // eye slit
    ctx.fillRect(hx + 16, hy + 9, 1, 1); // eye slit

    ctx.fillStyle = "#1a2235";
    ctx.fillRect(hx + 6, hy + 14, 16, 14); // robe torso
    ctx.fillStyle = "#11192a";
    ctx.fillRect(hx + 6, hy + 14, 10, 14);
    ctx.fillStyle = "#3c4353";
    ctx.fillRect(hx + 16, hy + 14, 6, 14);
    // Dark sleeves.
    ctx.fillStyle = "#080c14";
    ctx.fillRect(hx + 3, hy + 14, 3, 11);
    ctx.fillRect(hx + 22, hy + 14, 3, 11);
    ctx.fillStyle = "#202a39";
    ctx.fillRect(hx + 9, hy + 28, 4, 12);
    ctx.fillRect(hx + 15, hy + 28, 4, 12);
    ctx.fillStyle = "#141a25";
    ctx.fillRect(hx + 8, hy + 40, 5, 2);
    ctx.fillRect(hx + 15, hy + 40, 5, 2);
    return;
  }

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
    shirtColor = "#b82424";
    tieColor = "#f5f5f5";
  } else if (outfitId === "recyclops") {
    shirtColor = "#5c8f3c";
    tieColor = "#2d5a2e";
  } else if (outfitId === "hay_king") {
    shirtColor = "#6a4a2b";
    tieColor = "#3f2f1f";
  } else if (outfitId === "two_headed_monster") {
    shirtColor = "#202734";
    tieColor = "#dce4ef";
  } else if (outfitId === "cat_andy") {
    shirtColor = "#8c6a3b";
    tieColor = "#8c6a3b";
  } else if (outfitId === "andy_plumber") {
    shirtColor = "#8c96a8";
    tieColor = "#8c96a8";
  } else if (outfitId === "andy_construction") {
    shirtColor = "#b02b26";
    tieColor = "#b02b26";
  } else if (outfitId === "dwight_deputy") {
    shirtColor = "#11161f";
    tieColor = "#11161f";
  } else if (outfitId === "dwight_joker") {
    shirtColor = "#5a2b7a";
    tieColor = "#5a2b7a";
  } else if (outfitId === "prison_mike") {
    shirtColor = "#2f3442";
    tieColor = "#444c5f";
  } else if (outfitId === "scranton_penguins") {
    shirtColor = "#13161d";
    tieColor = "#13161d";
  } else if (outfitId === "strangler_hood") {
    shirtColor = "#171a23";
    tieColor = "#171a23";
  } else if (outfitId === "three_hole_gym") {
    shirtColor = "#d9dde4";
    tieColor = "#d9dde4";
  } else if (outfitId === "ryan_beard") {
    shirtColor = "#4b6da0";
    tieColor = "#9a1f2f";
  }

  const hideTie =
    outfitId === "three_hole_gym" ||
    outfitId === "strangler_hood" ||
    outfitId === "cat_andy" ||
    outfitId === "wrong_fit" ||
    outfitId === "andy_plumber" ||
    outfitId === "andy_construction" ||
    outfitId === "dwight_deputy" ||
    outfitId === "dwight_joker" ||
    outfitId === "scranton_penguins";

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
  if (outfitId === "wrong_fit") {
    // Santa trim + belt on thumbnail body.
    ctx.fillStyle = "#f6f4ef";
    ctx.fillRect(baseX + 7 * s, baseY + 11 * s, 14 * s, 1 * s);
    ctx.fillRect(baseX + 7 * s, baseY + 26 * s, 14 * s, 1 * s);
    ctx.fillRect(baseX + 13 * s, baseY + 12 * s, 2 * s, 12 * s);
    ctx.fillStyle = "#1b1b1d";
    ctx.fillRect(baseX + 8 * s, baseY + 20 * s, 12 * s, 2 * s);
    ctx.fillStyle = "#c7a047";
    ctx.fillRect(baseX + 12 * s, baseY + 20 * s, 3 * s, 2 * s);
  }
  if (outfitId === "cat_andy") {
    ctx.fillStyle = "#3d2d18";
    ctx.fillRect(baseX + 9 * s, baseY + 13 * s, 2 * s, 2 * s);
    ctx.fillRect(baseX + 14 * s, baseY + 15 * s, 2 * s, 2 * s);
    ctx.fillRect(baseX + 17 * s, baseY + 12 * s, 2 * s, 2 * s);
    ctx.fillStyle = "#2a1e11";
    ctx.fillRect(baseX + 22 * s, baseY + 20 * s, 3 * s, 1 * s);
    ctx.fillRect(baseX + 24 * s, baseY + 18 * s, 1 * s, 3 * s);
  }
  if (outfitId === "andy_plumber") {
    ctx.fillStyle = "#b8c0cc";
    ctx.fillRect(baseX + 8 * s, baseY + 14 * s, 12 * s, 1 * s);
    ctx.fillRect(baseX + 8 * s, baseY + 18 * s, 12 * s, 1 * s);
    ctx.fillStyle = "#bf2b2b";
    ctx.fillRect(baseX + 7 * s, baseY, 14 * s, 2 * s);
    ctx.fillRect(baseX + 10 * s, baseY - 3 * s, 8 * s, 3 * s);
  }
  if (outfitId === "andy_construction") {
    ctx.fillStyle = "#e4c862";
    ctx.fillRect(baseX + 7 * s, baseY, 14 * s, 2 * s);
    ctx.fillRect(baseX + 9 * s, baseY - 3 * s, 10 * s, 3 * s);
    ctx.fillStyle = "#121316";
    ctx.fillRect(baseX + 9 * s, baseY + 13 * s, 2 * s, 10 * s);
    ctx.fillRect(baseX + 14 * s, baseY + 13 * s, 2 * s, 10 * s);
    ctx.fillRect(baseX + 18 * s, baseY + 13 * s, 2 * s, 10 * s);
  }
  if (outfitId === "dwight_deputy") {
    ctx.fillStyle = "#3a414f";
    ctx.fillRect(baseX + 5 * s, baseY - 1 * s, 18 * s, 2 * s);
    ctx.fillRect(baseX + 10 * s, baseY - 4 * s, 8 * s, 3 * s);
    ctx.fillStyle = "#d5b46a";
    ctx.fillRect(baseX + 14 * s, baseY - 3 * s, 2 * s, 2 * s);
    ctx.fillStyle = "#1b202a";
    ctx.fillRect(baseX + 8 * s, baseY + 12 * s, 12 * s, 12 * s);
  }
  if (outfitId === "dwight_joker") {
    ctx.fillStyle = "#2f8f4e";
    ctx.fillRect(baseX + 6 * s, baseY - 1 * s, 16 * s, 3 * s);
    ctx.fillStyle = "#b8253c";
    ctx.fillRect(baseX + 12 * s, baseY + 8 * s, 4 * s, 1 * s);
    ctx.fillStyle = "#311547";
    ctx.fillRect(baseX + 8 * s, baseY + 12 * s, 12 * s, 12 * s);
  }
  if (outfitId === "prison_mike") {
    ctx.fillStyle = "#7d43be";
    ctx.fillRect(baseX + 7 * s, baseY, 14 * s, 2 * s);
    ctx.fillRect(baseX + 9 * s, baseY - 2 * s, 10 * s, 2 * s);
  }
  if (outfitId === "scranton_penguins") {
    ctx.fillStyle = "#f5f7fb";
    ctx.fillRect(baseX + 8 * s, baseY + 14 * s, 12 * s, 1 * s);
    ctx.fillRect(baseX + 8 * s, baseY + 18 * s, 12 * s, 1 * s);
    ctx.fillStyle = "#c63d3d";
    ctx.fillRect(baseX + 14 * s, baseY + 13 * s, 2 * s, 10 * s);
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
    ctx.fillRect(baseX + 7 * s, baseY - 1 * s, 14 * s, 2 * s);
    ctx.fillRect(baseX + 10 * s, baseY - 4 * s, 8 * s, 3 * s);
  } else if (outfitId === "wrong_fit") {
    // Santa hat in thumbnail.
    ctx.fillStyle = "#f6f4ef";
    ctx.fillRect(baseX + 7 * s, baseY, 14 * s, 2 * s);
    ctx.fillStyle = "#b82424";
    ctx.fillRect(baseX + 9 * s, baseY - 4 * s, 11 * s, 4 * s);
    ctx.fillRect(baseX + 17 * s, baseY - 6 * s, 2 * s, 2 * s);
    ctx.fillStyle = "#f6f4ef";
    ctx.fillRect(baseX + 19 * s, baseY - 6 * s, 2 * s, 2 * s);
  } else if (outfitId === "prison_mike") {
    ctx.fillStyle = "#7d43be";
    ctx.fillRect(baseX + 7 * s, baseY, 14 * s, 2 * s);
    ctx.fillRect(baseX + 9 * s, baseY - 2 * s, 10 * s, 2 * s);
  } else if (outfitId === "recyclops") {
    ctx.fillStyle = "#9be467";
    ctx.fillRect(baseX + 9 * s, baseY + 2 * s, 10 * s, 1 * s);
    ctx.fillStyle = "#2f4f2f";
    ctx.fillRect(baseX + 13 * s, baseY + 2 * s, 2 * s, 1 * s);
  } else if (outfitId === "hay_king") {
    ctx.fillStyle = "#cda86e";
    ctx.fillRect(baseX + 7 * s, baseY - 1 * s, 14 * s, 2 * s);
    ctx.fillRect(baseX + 9 * s, baseY - 4 * s, 2 * s, 3 * s);
    ctx.fillRect(baseX + 12 * s, baseY - 5 * s, 2 * s, 4 * s);
    ctx.fillRect(baseX + 15 * s, baseY - 5 * s, 2 * s, 4 * s);
    ctx.fillRect(baseX + 18 * s, baseY - 4 * s, 2 * s, 3 * s);
  } else if (outfitId === "two_headed_monster") {
    ctx.fillStyle = "#efcfab";
    ctx.fillRect(baseX + 4 * s, baseY + 9 * s, 7 * s, 5 * s);
    ctx.fillStyle = "#2a1e16";
    ctx.fillRect(baseX + 4 * s, baseY + 7 * s, 7 * s, 2 * s);
    ctx.fillStyle = "#1b2230";
    ctx.fillRect(baseX + 6 * s, baseY + 11 * s, 1 * s, 1 * s);
    ctx.fillRect(baseX + 8 * s, baseY + 11 * s, 1 * s, 1 * s);
    ctx.fillRect(baseX + 6 * s, baseY + 13 * s, 2 * s, 1 * s);
    ctx.fillStyle = shirtColor;
    ctx.fillRect(baseX + 5 * s, baseY + 14 * s, 4 * s, 1 * s);
  } else if (outfitId === "cat_andy") {
    ctx.fillStyle = "#2a1c12";
    ctx.fillRect(baseX + 8 * s, baseY - 1 * s, 3 * s, 3 * s);
    ctx.fillRect(baseX + 17 * s, baseY - 1 * s, 3 * s, 3 * s);
    ctx.fillStyle = "#d7b27b";
    ctx.fillRect(baseX + 9 * s, baseY, 1 * s, 1 * s);
    ctx.fillRect(baseX + 18 * s, baseY, 1 * s, 1 * s);
  } else if (outfitId === "strangler_hood") {
    ctx.fillStyle = "#141824";
    ctx.fillRect(baseX + 6 * s, baseY - 1 * s, 16 * s, 3 * s);
    ctx.fillRect(baseX + 6 * s, baseY + 2 * s, 3 * s, 8 * s);
    ctx.fillRect(baseX + 19 * s, baseY + 2 * s, 3 * s, 8 * s);
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
      showAnnexMessage('Dundie: "Don\'t Go In There" - Beat The Bullpen 3 times.');
    }
    return;
  }

  for (const card of state.annexCards) {
    if (x < card.x || x > card.x + card.w || y < card.y || y > card.y + card.h) continue;
    state.uiFocus.annexCard = Math.max(0, state.annexCards.indexOf(card));
    toggleOutfit(card.outfitId);
    return;
  }
}

function drawLoadingScene() {
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, "#0e203f");
  g.addColorStop(1, "#08142d");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawPixelPanel(130, 88, 740, 380, "rgba(12,20,36,0.9)", "rgba(9,15,30,0.92)", "#7ecfff", "rgba(218,236,255,0.6)");
  ctx.fillStyle = "#ffd86f";
  ctx.font = "bold 42px Trebuchet MS";
  ctx.fillText("MEETING ADJOURNED", 240, 150);
  ctx.fillStyle = "#d8e9ff";
  ctx.font = "bold 22px Trebuchet MS";
  ctx.fillText("Loading level chaos...", 352, 188);

  const progress = Math.max(0, Math.min(1, 1 - state.loadingLeft / LOADING_SCENE_DURATION));
  const barX = 205;
  const barY = 402;
  const barW = 590;
  const barH = 26;
  ctx.fillStyle = "rgba(6,12,22,0.9)";
  ctx.fillRect(barX, barY, barW, barH);
  ctx.fillStyle = "#e6c85f";
  ctx.fillRect(barX + 3, barY + 3, (barW - 6) * progress, barH - 6);
  ctx.strokeStyle = "#a9dcff";
  ctx.strokeRect(barX, barY, barW, barH);

  // Dwight/Andy leapfrog loop in the bottom-right.
  const baseX = 620;
  const baseY = 340;
  const phase = state.loadingAnimSec * 2.6;
  const andyHop = Math.max(0, Math.sin(phase)) * 26;
  const dwightHop = Math.max(0, Math.sin(phase + Math.PI)) * 26;
  drawHeroPortraitSprite(baseX + 120, baseY - andyHop, 1.15, { label: "Andy", shadow: true });
  drawHeroPortraitSprite(baseX + 54, baseY - dwightHop, 1.15, { label: "Dwight", shadow: true });

  if (state.loadingCalloutLeft > 0) {
    const pulse = 0.65 + Math.abs(Math.sin(state.loadingAnimSec * 10)) * 0.35;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = "#ffe59f";
    ctx.font = "bold 20px Trebuchet MS";
    ctx.fillText(state.loadingCalloutText, 332, 364);
    ctx.globalAlpha = 1;
  }
}

function drawBossKeyScene() {
  const chromeH = 34;
  const tableX = 8;
  const tableY = chromeH + 8;
  const tableW = canvas.width - 16;
  const tableH = canvas.height - tableY - 30;
  const cols = [0.15, 0.23, 0.16, 0.14, 0.14, 0.18].map((f) => Math.floor(tableW * f));
  const rows = Math.max(10, Math.floor((tableH - 30) / 24));

  ctx.fillStyle = "#e9eef2";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#2f5d89";
  ctx.fillRect(0, 0, canvas.width, chromeH);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px Trebuchet MS";
  ctx.fillText("Paper Distribution Q1.xlsx", 14, 24);

  let x = tableX;
  ctx.fillStyle = "#d5e3ef";
  for (const w of cols) {
    ctx.fillRect(x, tableY, w, 28);
    x += w;
  }
  ctx.fillStyle = "#223748";
  ctx.font = "bold 14px Trebuchet MS";
  const headers = ["Region", "Client", "Reams", "Cost", "Ship", "Status"];
  x = tableX + 8;
  for (let i = 0; i < cols.length; i += 1) {
    ctx.fillText(headers[i], x, tableY + 19);
    x += cols[i];
  }

  for (let r = 0; r < rows; r += 1) {
    const y = tableY + 28 + r * 24;
    ctx.fillStyle = r % 2 === 0 ? "#fbfdff" : "#f3f8fc";
    ctx.fillRect(tableX, y, cols.reduce((a, b) => a + b, 0), 24);
    ctx.strokeStyle = "#d3dbe3";
    ctx.strokeRect(tableX, y, cols.reduce((a, b) => a + b, 0), 24);
    ctx.fillStyle = "#2a3745";
    ctx.font = "13px Trebuchet MS";
    ctx.fillText(`Scranton-${r + 1}`, tableX + 8, y + 16);
    ctx.fillText(`Acct ${3100 + r}`, tableX + 128, y + 16);
    ctx.fillText(`${14 + ((r * 3) % 39)}`, tableX + 320, y + 16);
    ctx.fillText(`$${(230 + r * 11).toFixed(0)}`, tableX + 450, y + 16);
    ctx.fillText(`${2 + (r % 5)}d`, tableX + 570, y + 16);
    ctx.fillText(r % 4 === 0 ? "REVIEW" : "OK", tableX + 686, y + 16);
  }

  ctx.strokeStyle = "#2d8bff";
  const blink = Math.floor(state.elapsedSec * 2) % 2 === 0;
  if (blink) ctx.strokeRect(tableX + cols[0] + cols[1], tableY + 52, cols[2], 24);
  ctx.fillStyle = "#233547";
  ctx.font = "bold 14px Trebuchet MS";
  ctx.fillText("F12 (or Alt+Shift+B): Boss Mode", 10, canvas.height - 10);
}

function drawRunScene() {
  const allowShake = getSettings().screenShake;
  const shakeX = allowShake && state.screenShake > 0 ? (Math.random() - 0.5) * 10 * state.screenShake : 0;
  const shakeY = allowShake && state.screenShake > 0 ? (Math.random() - 0.5) * 8 * state.screenShake : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);
  drawRunBackground();
  drawPamQuestBackgroundSprite();
  drawPursuitTarget();
  drawObstacles();
  drawCollectibles();
  drawPlayer();
  drawSkarnAimGuide();
  drawParticles();
  drawFloatingText();
  drawHud();
  drawDebugHitboxes();
  ctx.restore();

  if (state.tutorialMode && state.running && !state.gameOver) {
    const steps = [
      "Tutorial: Tap Space to jump.",
      "Tutorial: Hold Space to slide.",
      "Tutorial: Land then press J for HARDCORE.",
      "Tutorial complete! Press Enter to pause or keep running.",
    ];
    const msg = steps[Math.min(steps.length - 1, state.tutorialStep || 0)];
    drawPixelPanel(212, 20, 536, 42, "rgba(11,18,33,0.9)", "rgba(8,14,26,0.92)", "#86ccff", "rgba(212,234,255,0.62)");
    ctx.fillStyle = "#ffe8a6";
    ctx.font = "bold 18px Trebuchet MS";
    drawWrappedText(msg, 226, 47, 508, 18, 2);
  }

  if (state.paused && !state.gameOver) {
    ctx.fillStyle = "rgba(10,14,24,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPixelPanel(286, 132, 428, 248, "rgba(10,20,40,0.92)", "rgba(8,16,34,0.94)", "#86ccff", "rgba(200,230,255,0.65)");
    ctx.fillStyle = "#ffe07f";
    ctx.font = "bold 44px Trebuchet MS";
    ctx.fillText("PAUSED", 390, 184);

    const options = ["CONTINUE", "QUIT"];
    for (let i = 0; i < options.length; i += 1) {
      const selected = state.pauseMenuIndex === i;
      const ox = 348 + i * 180;
      const oy = 220;
      ctx.fillStyle = selected ? "#2f66d6" : "#233247";
      ctx.fillRect(ox, oy, 150, 42);
      ctx.strokeStyle = selected ? "#9dd7ff" : "#5d7ca1";
      ctx.strokeRect(ox, oy, 150, 42);
      ctx.fillStyle = selected ? "#f6fcff" : "#cddbef";
      ctx.font = "bold 24px Trebuchet MS";
      ctx.fillText(options[i], ox + 18, oy + 29);
    }

    ctx.fillStyle = "#f1e6bf";
    ctx.font = "bold 18px Trebuchet MS";
    drawWrappedText(state.pauseQuote, 320, 304, 360, 22, 3);
    ctx.fillStyle = "#bed8f6";
    ctx.font = "16px Trebuchet MS";
    ctx.fillText("Arrows: choose   Enter: confirm", 352, 356);
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

  if (
    state.runWorldId === "pursuit" &&
    !state.pursuitEndPending &&
    state.multiplier >= 10 &&
    canPromptPursuitJump()
  ) {
    const promptX = state.player.x + 4;
    const promptY = state.player.y - state.player.height - 30;
    const pulse = 0.65 + Math.abs(Math.sin(state.worldTimeSec * 10)) * 0.35;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = "rgba(18, 24, 38, 0.9)";
    ctx.fillRect(promptX - 2, promptY - 18, 54, 18);
    ctx.strokeStyle = "#ffe28c";
    ctx.strokeRect(promptX - 2, promptY - 18, 54, 18);
    ctx.fillStyle = "#ffe9ac";
    ctx.font = "bold 14px Trebuchet MS";
    ctx.fillText("JUMP!", promptX + 4, promptY - 5);
    ctx.globalAlpha = 1;
  }

  if (state.runWorldId === "pursuit" && state.pursuitEndPending && state.pursuitRevealLeft > 0) {
    const revealProgress = 1 - state.pursuitRevealLeft / PURSUIT_REVEAL_DURATION;
    const panelW = 430;
    const panelH = 214;
    const panelX = (canvas.width - panelW) * 0.5;
    const panelY = 80;
    const pulse = 0.25 + Math.abs(Math.sin(state.worldTimeSec * 18)) * 0.25;
    ctx.fillStyle = `rgba(10, 14, 24, ${0.82 + pulse * 0.3})`;
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = revealProgress > 0.56 ? "#ffb39c" : "#8bb7ff";
    ctx.strokeRect(panelX, panelY, panelW, panelH);
    // Scanline and spotlight detail.
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    for (let y = panelY + 8; y < panelY + panelH - 8; y += 4) ctx.fillRect(panelX + 6, y, panelW - 12, 1);
    const spot = ctx.createRadialGradient(panelX + 116, panelY + 96, 10, panelX + 116, panelY + 98, 120);
    spot.addColorStop(0, "rgba(255,255,255,0.14)");
    spot.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = spot;
    ctx.fillRect(panelX + 8, panelY + 8, panelW - 16, panelH - 16);

    const cX = panelX + 84;
    const cY = panelY + 52;
    const s = 2.2;

    // Suit and shoulders so the reveal reads as a full character, not only a face.
    ctx.fillStyle = "#131a24";
    ctx.fillRect(cX + 7 * s, cY + 18 * s, 18 * s, 15 * s);
    ctx.fillStyle = "#1b2432";
    ctx.fillRect(cX + 5 * s, cY + 20 * s, 4 * s, 12 * s);
    ctx.fillRect(cX + 23 * s, cY + 20 * s, 4 * s, 12 * s);
    ctx.fillStyle = "#dfe4ee";
    ctx.fillRect(cX + 14 * s, cY + 20 * s, 4 * s, 11 * s);
    ctx.fillStyle = "#2c3446";
    ctx.fillRect(cX + 15 * s, cY + 24 * s, 2 * s, 6 * s);

    ctx.fillStyle = "#efcfab";
    ctx.fillRect(cX + 8 * s, cY + 8 * s, 14 * s, 10 * s);
    ctx.fillStyle = "#2b1f17";
    ctx.fillRect(cX + 7 * s, cY + 4 * s, 16 * s, 5 * s);
    ctx.fillStyle = "#8b6c59";
    ctx.fillRect(cX + 14 * s, cY + 7 * s, 2 * s, 11 * s);
    ctx.fillStyle = "#1b2230";
    ctx.fillRect(cX + 12 * s, cY + 12 * s, 2 * s, 2 * s);
    ctx.fillRect(cX + 18 * s, cY + 12 * s, 2 * s, 2 * s);
    ctx.fillRect(cX + 13 * s, cY + 16 * s, 7 * s, 1 * s);

    const maskOffset = revealProgress < 0.46 ? 0 : Math.min(20 * s, (revealProgress - 0.46) * 64 * s);
    const maskLift = revealProgress < 0.46 ? 0 : Math.sin(revealProgress * 26) * 1.8 * s;
    if (maskOffset < 18 * s) {
      ctx.fillStyle = "#151820";
      ctx.fillRect(cX + 7 * s + maskOffset, cY + 8 * s - maskLift, 16 * s, 11 * s);
      ctx.fillStyle = "#8ea2bf";
      ctx.fillRect(cX + 11 * s + maskOffset, cY + 12 * s - maskLift, 3 * s, 2 * s);
      ctx.fillRect(cX + 17 * s + maskOffset, cY + 12 * s - maskLift, 3 * s, 2 * s);
      ctx.fillStyle = "#4c586f";
      ctx.fillRect(cX + 9 * s + maskOffset, cY + 18 * s - maskLift, 12 * s, 1 * s);
    } else {
      // Hand pulling mask off to the right for clearer "unmasking" action.
      ctx.fillStyle = "#efcfab";
      ctx.fillRect(cX + 29 * s, cY + 7 * s, 3 * s, 4 * s);
      ctx.fillStyle = "#151820";
      ctx.fillRect(cX + 32 * s, cY + 6 * s, 9 * s, 8 * s);
      ctx.fillStyle = "#8ea2bf";
      ctx.fillRect(cX + 35 * s, cY + 9 * s, 2 * s, 1 * s);
      ctx.fillRect(cX + 38 * s, cY + 9 * s, 2 * s, 1 * s);
    }

    ctx.fillStyle = "#f0d890";
    ctx.font = "bold 24px Trebuchet MS";
    ctx.fillText("UNMASKING...", panelX + 30, panelY + 38);
    if (revealProgress >= 0.58) {
      const flash = Math.max(0, 1 - (revealProgress - 0.58) * 6);
      if (flash > 0) {
        ctx.globalAlpha = flash * 0.65;
        ctx.fillStyle = "#fff2d8";
        ctx.fillRect(panelX + 6, panelY + 6, panelW - 12, panelH - 12);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = "#ffb9b0";
      ctx.font = "bold 24px Trebuchet MS";
      drawWrappedText("THE SCRANTON STRANGLER IS TOBY.", panelX + 26, panelY + 176, panelW - 52, 28, 2);
      ctx.fillStyle = "#ffe7bc";
      ctx.font = "bold 18px Trebuchet MS";
      drawWrappedText("MICHAEL: NO. NO. GOD. NOOOO!", panelX + 64, panelY + 72, panelW - 120, 20, 2);
    }
  }

  if (
    state.runWorldId === "pursuit" &&
    state.pursuitEndPending &&
    state.pursuitRevealLeft <= 0 &&
    state.pursuitEndCardLeft > 0
  ) {
    const t = 1 - state.pursuitEndCardLeft / PURSUIT_END_CARD_DURATION;
    const colors = ["#ffce56", "#ff6d8f", "#6edbff", "#95f38f", "#ffe9aa"];

    for (let i = 0; i < 24; i += 1) {
      const y = 72 + ((i * 23) % 320);
      const sway = Math.sin(state.worldTimeSec * 9 + i * 1.7) * 8;
      const spread = t * (170 + (i % 6) * 18);

      const lx = -14 + spread + sway;
      const rx = canvas.width + 14 - spread - sway;
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(lx, y + Math.sin(state.worldTimeSec * 12 + i) * 5, 6, 14);
      ctx.fillRect(rx, y + Math.cos(state.worldTimeSec * 11 + i) * 5, 6, 14);
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f5ca5b";
    ctx.font = "bold 66px Trebuchet MS";
    ctx.fillText("THE END", 336, 278);
    ctx.fillStyle = "#fff3c9";
    ctx.font = "bold 66px Trebuchet MS";
    ctx.fillText("THE END", 332, 274);
    ctx.fillStyle = "#f5dfad";
    ctx.font = "bold 22px Trebuchet MS";
    ctx.fillText("Strangler caught. Scranton can exhale.", 286, 316);
  }

  if (state.runWorldId === "pursuit" && state.pursuitEndPending) {
    const alpha =
      state.pursuitRevealLeft > 0 || state.pursuitEndCardLeft > 0
        ? 0
        : Math.max(0, Math.min(1, 1 - state.pursuitEndFade / 0.75));
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (state.gameOver) {
    ctx.fillStyle = "rgba(15,20,30,0.66)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPerformanceReviewOverlay();
  }

  if (getSettings().showFps) {
    drawPixelPanel(canvas.width - 178, 8, 168, 48, "rgba(10,18,34,0.9)", "rgba(8,14,28,0.9)", "#7ecfff", "rgba(212,234,255,0.6)");
    ctx.fillStyle = "#d9edff";
    ctx.font = "bold 13px Trebuchet MS";
    ctx.fillText(`FPS ${state.fps.toFixed(0)} / avg ${state.fpsAvg.toFixed(0)}`, canvas.width - 168, 29);
    ctx.fillStyle = "#ffd7a0";
    ctx.fillText(`Worst ${state.fpsWorst.toFixed(0)}`, canvas.width - 168, 46);
  }
}

function render() {
  if (state.bossMode) {
    drawBossKeyScene();
    return;
  }
  if (state.scene === "menu") drawMenuScene();
  else if (state.scene === "characters") drawCharacterSelectScene();
  else if (state.scene === "tutorial") drawTutorialScene();
  else if (state.scene === "loading") drawLoadingScene();
  else if (state.scene === "run") drawRunScene();
  else if (state.scene === "shop") drawShopScene();
  else if (state.scene === "inventory") drawInventoryScene();
  else if (state.scene === "settings") drawSettingsScene();
  else if (state.scene === "desk") drawDeskScene();
  else if (state.scene === "missions") drawMissionsScene();
  else if (state.scene === "cutscene") drawFinalCutsceneScene();
  else drawAnnexScene();

  if (state.jackpotRainDrops.length > 0) {
    for (const drop of state.jackpotRainDrops) {
      const tilt = Math.sin(drop.spin) * 2.5;
      const dx = drop.x + tilt;
      const dy = drop.y;
      if (drop.type === "stanley_nickel") {
        const r = Math.max(5, Math.floor(drop.size * 0.55));
        const cx = dx + r;
        const cy = dy + r;
        ctx.fillStyle = "#9298a2";
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#cfd4db";
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(3, r - 2), 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#5c6370";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(3, r - 1), 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#565e6a";
        ctx.font = "bold 7px Trebuchet MS";
        ctx.fillText("5", cx - 2, cy + 2);
      } else {
        const w = Math.max(10, drop.size + 6);
        const h = Math.max(6, Math.floor(w * 0.58));
        // Mini Schrute Buck bill sprite.
        ctx.fillStyle = "#c9d8d4";
        ctx.fillRect(dx, dy, w, h);
        ctx.fillStyle = "#93a9a4";
        ctx.fillRect(dx + 1, dy + 1, w - 2, h - 2);
        ctx.fillStyle = "#dde9e6";
        ctx.fillRect(dx + 2, dy + 2, w - 4, h - 4);
        ctx.strokeStyle = "#4d6460";
        ctx.lineWidth = 1;
        ctx.strokeRect(dx + 1.5, dy + 1.5, w - 3, h - 3);
        ctx.fillStyle = "#49615d";
        ctx.fillRect(dx + Math.floor(w * 0.42), dy + 2, Math.max(2, Math.floor(w * 0.16)), h - 4);
        ctx.fillStyle = "#f0f6f4";
        ctx.fillRect(dx + Math.floor(w * 0.47), dy + 3, 1, Math.max(2, h - 6));
        ctx.fillStyle = "#516b66";
        ctx.font = "bold 7px Trebuchet MS";
        ctx.fillText("1", dx + 2, dy + h - 1);
        ctx.fillText("1", dx + w - 6, dy + h - 1);
      }
    }
  }

  if (state.missionToastLeft > 0) {
    const alpha = Math.min(1, state.missionToastLeft / 0.3);
    ctx.globalAlpha = alpha;
    const toastText = state.missionToastText || "";
    const revealToast = state.scene === "run" && state.runWorldId === "pursuit" && state.pursuitEndPending;
    const toastW = revealToast
      ? Math.min(960, Math.max(560, ctx.measureText(toastText).width + 64))
      : Math.min(860, Math.max(420, ctx.measureText(toastText).width + 36));
    const toastH = revealToast ? 64 : 48;
    const toastX = Math.max(20, (canvas.width - toastW) * 0.5);
    ctx.fillStyle = "rgba(8, 14, 24, 0.86)";
    ctx.fillRect(toastX, 20, toastW, toastH);
    ctx.strokeStyle = "#8fd6ff";
    ctx.strokeRect(toastX, 20, toastW, toastH);
    ctx.fillStyle = "#d8f3ff";
    ctx.font = revealToast ? "bold 20px Trebuchet MS" : "bold 17px Trebuchet MS";
    drawWrappedTextWithCurrencyIcons(toastText, toastX + 14, revealToast ? 44 : 40, toastW - 28, revealToast ? 24 : 20, 2);
    ctx.globalAlpha = 1;
  }
}

function update(dt) {
  const instFps = 1 / Math.max(0.0001, dt);
  state.fps = instFps;
  state.fpsSamples.push(instFps);
  if (state.fpsSamples.length > 60) state.fpsSamples.shift();
  if (state.fpsSamples.length > 0) {
    const sum = state.fpsSamples.reduce((a, b) => a + b, 0);
    state.fpsAvg = sum / state.fpsSamples.length;
    state.fpsWorst = Math.min(...state.fpsSamples);
  }
  if (state.bossMode) {
    state.elapsedSec += dt;
    return;
  }
  state.elapsedSec += dt;
  syncDundieOutfitRewards();
  syncPostKeyMissionRewards();
  updateCornerTv(dt);
  if (state.scene === "loading") {
    state.loadingAnimSec += dt;
    state.loadingLeft = Math.max(0, state.loadingLeft - dt);
    state.loadingCalloutLeft = Math.max(0, state.loadingCalloutLeft - dt);
    state.loadingChantTimer -= dt;
    if (state.loadingChantTimer <= 0) {
      playLoadingChantCue();
      state.loadingChantTimer = 0.62;
    }
    if (state.loadingLeft <= 0 && state.loadingWorldId) {
      const worldId = state.loadingWorldId;
      state.loadingWorldId = null;
      startRunStateNow(worldId);
    }
    return;
  }
  if (state.scene === "run") updateRun(dt);
  if (state.scene === "run" && state.gameOver && state.reviewData) {
    state.reviewAnimSec = Math.min(state.reviewAnimDuration, state.reviewAnimSec + dt);
    renderReviewSummaryText();
  }
  updateLevelMusic(dt);
  updateSkarnMusic(dt);
  if (state.scene === "cutscene") {
    state.cutsceneTimeSec += dt;
    state.cutsceneFadeLeft = Math.max(0, state.cutsceneFadeLeft - dt);
    updateCutsceneSong(dt);
  }
  if (state.jackpotRainLeft > 0 || state.jackpotRainDrops.length > 0) {
    if (state.jackpotRainLeft > 0) {
      state.jackpotRainLeft = Math.max(0, state.jackpotRainLeft - dt);
      state.jackpotRainSpawnAcc += dt;
      while (state.jackpotRainSpawnAcc >= 0.045) {
        state.jackpotRainSpawnAcc -= 0.045;
        state.jackpotRainDrops.push({
          type: Math.random() < 0.58 ? "schrute_buck" : "stanley_nickel",
          x: Math.random() * canvas.width,
          y: -16 - Math.random() * 42,
          vy: 250 + Math.random() * 210,
          spin: Math.random() * Math.PI * 2,
          spinRate: 2 + Math.random() * 4,
          size: 9 + Math.random() * 4,
        });
      }
    }
    for (const drop of state.jackpotRainDrops) {
      drop.y += drop.vy * dt;
      drop.spin += drop.spinRate * dt;
    }
    state.jackpotRainDrops = state.jackpotRainDrops.filter((drop) => drop.y < canvas.height + 20);
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
    state.uiFocus.menuCard = Math.max(0, state.menuCards.findIndex((c) => c.worldId === card.worldId));
    state.menuClickWorldId = card.worldId;
    state.menuClickLeft = 0.55;
    state.menuClickMessage = "SELECTED";
    setMenuDialogue();
    return;
  }
}

function moveWorldFocus(direction) {
  if (!state.menuCards.length) return;
  const curCard = state.menuCards[Math.max(0, Math.min(state.menuCards.length - 1, state.uiFocus.menuCard || 0))];
  if (!curCard) return;
  const cx = curCard.x + curCard.w * 0.5;
  const cy = curCard.y + curCard.h * 0.5;
  let bestIdx = state.uiFocus.menuCard || 0;
  let bestScore = Infinity;
  for (let i = 0; i < state.menuCards.length; i += 1) {
    if (i === state.uiFocus.menuCard) continue;
    const c = state.menuCards[i];
    const tx = c.x + c.w * 0.5;
    const ty = c.y + c.h * 0.5;
    const dx = tx - cx;
    const dy = ty - cy;
    if (direction === "left" && dx >= -2) continue;
    if (direction === "right" && dx <= 2) continue;
    if (direction === "up" && dy >= -2) continue;
    if (direction === "down" && dy <= 2) continue;
    const primary = direction === "left" || direction === "right" ? Math.abs(dx) : Math.abs(dy);
    const secondary = direction === "left" || direction === "right" ? Math.abs(dy) : Math.abs(dx);
    const score = primary * 2 + secondary;
    if (score < bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  state.uiFocus.menuCard = bestIdx;
  const selectedCard = state.menuCards[bestIdx];
  if (selectedCard) {
    state.selectedWorldId = selectedCard.worldId;
    setMenuDialogue();
  }
}

function activateFocusedMenuCard() {
  if (!state.menuCards.length) return;
  const card = state.menuCards[Math.max(0, Math.min(state.menuCards.length - 1, state.uiFocus.menuCard || 0))];
  if (!card) return;
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
}

function moveGridFocus(direction, current, total, cols) {
  if (total <= 0) return 0;
  const idx = Math.max(0, Math.min(total - 1, current || 0));
  const row = Math.floor(idx / cols);
  const col = idx % cols;
  const maxRow = Math.floor((total - 1) / cols);
  let nextRow = row;
  let nextCol = col;
  if (direction === "left") nextCol = Math.max(0, col - 1);
  if (direction === "right") nextCol = Math.min(cols - 1, col + 1);
  if (direction === "up") nextRow = Math.max(0, row - 1);
  if (direction === "down") nextRow = Math.min(maxRow, row + 1);
  let nextIdx = nextRow * cols + nextCol;
  while (nextIdx >= total && nextCol > 0) {
    nextCol -= 1;
    nextIdx = nextRow * cols + nextCol;
  }
  return Math.max(0, Math.min(total - 1, nextIdx));
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
  const isBossHotkey =
    ev.code === "F12" ||
    ev.key === "F12" ||
    ev.keyCode === 123 ||
    (ev.altKey && ev.shiftKey && ev.code === "KeyB");
  if (isBossHotkey) {
    ev.preventDefault();
    toggleBossMode();
    return;
  }
  if (state.bossMode) {
    ev.preventDefault();
    return;
  }

  ensureAudioContext();
  if (ev.code.startsWith("Key")) advanceCheatCode(ev.code);
  const isArrow = ev.code === "ArrowLeft" || ev.code === "ArrowRight" || ev.code === "ArrowUp" || ev.code === "ArrowDown";
  const arrowDir =
    ev.code === "ArrowLeft"
      ? "left"
      : ev.code === "ArrowRight"
      ? "right"
      : ev.code === "ArrowUp"
      ? "up"
      : ev.code === "ArrowDown"
      ? "down"
      : null;

  if (ev.code === "Escape") {
    ev.preventDefault();
    if (state.scene !== "menu") {
      summaryPanel.hidden = true;
      switchScene("menu");
    }
    return;
  }

  if (ev.code === "KeyM") {
    ev.preventDefault();
    if (state.scene === "missions") {
      switchScene(state.previousScene || "menu");
    } else {
      switchScene("missions");
    }
    return;
  }

  if (ev.code === "KeyH") {
    ev.preventDefault();
    state.debugHitboxes = !state.debugHitboxes;
    showMissionToast(state.debugHitboxes ? "Debug hitboxes ON" : "Debug hitboxes OFF");
    return;
  }

  if (ev.code === "KeyI") {
    ev.preventDefault();
    if (state.scene === "run" || state.scene === "loading" || state.scene === "cutscene") return;
    if (state.scene === "inventory") switchScene(state.previousScene || "menu");
    else switchScene("inventory");
    return;
  }

  if (ev.code === "KeyO") {
    ev.preventDefault();
    if (state.scene === "run" || state.scene === "loading" || state.scene === "cutscene") return;
    if (state.scene === "settings") switchScene(state.previousScene || "menu");
    else switchScene("settings");
    return;
  }

  if (ev.code === "Enter") {
    ev.preventDefault();
    if (state.scene === "tutorial") {
      startTutorialRun();
      return;
    }
    if (state.scene === "run" && state.gameOver && !summaryPanel.hidden) {
      if (!nextLevelBtn.hidden && state.uiFocus.reviewButton === 1) nextLevelBtn.click();
      else retryBtn.click();
      return;
    }
    if (state.scene === "menu") {
      activateFocusedMenuCard();
      if (isWorldUnlocked(state.selectedWorldId)) {
        resetRunState(state.selectedWorldId);
        summaryPanel.hidden = true;
      }
      return;
    }
    if (state.scene === "run" && !state.gameOver) {
      if (state.paused) {
        if (state.pauseMenuIndex === 0) state.paused = false;
        else switchScene("menu");
      } else {
        openPauseMenu();
      }
      return;
    }
    if (state.scene === "shop") {
      if (state.shopConversation && state.shopTalkBounds.length > 0) {
        const idx = Math.max(0, Math.min(state.shopTalkBounds.length - 1, state.uiFocus.shopTalk || 0));
        const target = state.shopTalkBounds[idx];
        if (target) {
          if (target.id === "talk") startJimConversation();
          else if (target.id === "pam_talk") startPamConversation();
          else if (state.shopConversation?.actor === "pam") handlePamConversationClick(target.id);
          else handleJimConversationClick(target.id);
        }
        return;
      }
      if (!state.shopConversation && state.shopPurchasePrompt && state.shopPromptBounds.length > 0) {
        const idx = Math.max(0, Math.min(state.shopPromptBounds.length - 1, state.uiFocus.shopPrompt || 0));
        const btn = state.shopPromptBounds[idx];
        if (btn) handleShopPromptClick(btn.id);
        return;
      }
      if (state.shopCards.length > 0) {
        const idx = Math.max(0, Math.min(state.shopCards.length - 1, state.uiFocus.shopCard || 0));
        openShopItemPrompt(state.shopCards[idx].itemId);
        return;
      }
      switchScene("menu");
      return;
    }
    if (state.scene === "inventory") {
      if (state.inventoryCards.length > 0) {
        const idx = Math.max(0, Math.min(state.inventoryCards.length - 1, state.uiFocus.inventoryCard || 0));
        toggleInventoryEquip(state.inventoryCards[idx].itemId);
        return;
      }
      switchScene("menu");
      return;
    }
    if (state.scene === "settings") {
      const idx = state.uiFocus.settingsOption || 0;
      if (idx <= 4) {
        adjustSettingByIndex(idx, 0);
      } else if (idx === 5) {
        exportSaveToFile();
      } else if (idx === 6) {
        importSaveFromFile();
      }
      return;
    }
    if (state.scene === "annex") {
      if (state.annexCards.length > 0) {
        const idx = Math.max(0, Math.min(state.annexCards.length - 1, state.uiFocus.annexCard || 0));
        toggleOutfit(state.annexCards[idx].outfitId);
        return;
      }
      switchScene("menu");
      return;
    }
    if (state.scene === "desk") {
      if (state.deskPhotoViewerOpen) {
        state.deskPhotoViewerOpen = false;
        return;
      }
      if (state.deskGoldenfaceBounds) {
        const b = state.deskGoldenfaceBounds;
        selectDeskByCanvasPoint(b.x + b.w * 0.5, b.y + b.h * 0.5);
        return;
      }
      if (state.deskPhotoBounds) {
        const b = state.deskPhotoBounds;
        selectDeskByCanvasPoint(b.x + b.w * 0.5, b.y + b.h * 0.5);
        return;
      }
      if (state.deskDrawerBounds) {
        const b = state.deskDrawerBounds;
        selectDeskByCanvasPoint(b.x + b.w * 0.5, b.y + b.h * 0.5);
        return;
      }
      switchScene("menu");
      return;
    }
    if (state.scene === "characters") {
      if (state.characterCards.length > 0) {
        const idx = Math.max(0, Math.min(state.characterCards.length - 1, state.uiFocus.characterCard || 0));
        const card = state.characterCards[idx];
        if (card) {
          characterSelect.value = card.id;
          switchRunnerProfile(card.id);
          setMenuDialogue();
          playThemeSwitchCue();
        }
      }
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

  if (isArrow && state.scene !== "run") {
    ev.preventDefault();
    if (state.scene === "menu") {
      if (arrowDir) moveWorldFocus(arrowDir);
      return;
    }
    if (state.scene === "characters") {
      state.uiFocus.characterCard = moveGridFocus(arrowDir, state.uiFocus.characterCard, state.characterCards.length, 3);
      const card = state.characterCards[state.uiFocus.characterCard];
      if (card) {
        characterSelect.value = card.id;
        switchRunnerProfile(card.id);
        setMenuDialogue();
      }
      return;
    }
    if (state.scene === "shop") {
      if (state.shopConversation && state.shopTalkBounds.length > 0) {
        state.uiFocus.shopTalk = moveGridFocus(arrowDir, state.uiFocus.shopTalk, state.shopTalkBounds.length, 2);
      } else if (!state.shopConversation && state.shopPurchasePrompt && state.shopPromptBounds.length > 0) {
        state.uiFocus.shopPrompt = moveGridFocus(arrowDir, state.uiFocus.shopPrompt, state.shopPromptBounds.length, 2);
      } else {
        state.uiFocus.shopCard = moveGridFocus(arrowDir, state.uiFocus.shopCard, state.shopCards.length, 3);
      }
      return;
    }
    if (state.scene === "annex") {
      state.uiFocus.annexCard = moveGridFocus(arrowDir, state.uiFocus.annexCard, state.annexCards.length, 3);
      return;
    }
    if (state.scene === "inventory") {
      state.uiFocus.inventoryCard = moveGridFocus(arrowDir, state.uiFocus.inventoryCard, state.inventoryCards.length, 3);
      return;
    }
    if (state.scene === "settings") {
      if (arrowDir === "up") state.uiFocus.settingsOption = Math.max(0, (state.uiFocus.settingsOption || 0) - 1);
      else if (arrowDir === "down") state.uiFocus.settingsOption = Math.min(6, (state.uiFocus.settingsOption || 0) + 1);
      else if (arrowDir === "left") adjustSettingByIndex(state.uiFocus.settingsOption || 0, -1);
      else if (arrowDir === "right") adjustSettingByIndex(state.uiFocus.settingsOption || 0, 1);
      return;
    }
    return;
  }

  if (state.scene === "run" && state.paused && !state.gameOver) {
    if (ev.code === "ArrowLeft" || ev.code === "ArrowUp") {
      ev.preventDefault();
      state.pauseMenuIndex = Math.max(0, state.pauseMenuIndex - 1);
      return;
    }
    if (ev.code === "ArrowRight" || ev.code === "ArrowDown") {
      ev.preventDefault();
      state.pauseMenuIndex = Math.min(1, state.pauseMenuIndex + 1);
      return;
    }
    return;
  }

  if (state.scene !== "run") {
    if (state.scene === "loading") return;
    if (state.scene === "tutorial") {
      if (ev.code === "KeyK") {
        if (!state.saveData.flags) state.saveData.flags = {};
        state.saveData.flags.tutorialSeen = true;
        persistSave();
        switchScene("menu");
      }
      return;
    }
    if (ev.code === "KeyS") switchScene("shop");
    if (ev.code === "KeyA") switchScene("annex");
    if (ev.code === "KeyD") switchScene("desk");
    if (ev.code === "KeyC") switchScene("characters");
    if (ev.code === "KeyO") switchScene("settings");
    return;
  }

  if (ev.code === "ArrowUp") {
    ev.preventDefault();
    jump();
  }
  if ((ev.code === "ArrowLeft" || ev.code === "ArrowRight") && state.gameOver && !summaryPanel.hidden) {
    ev.preventDefault();
    if (!nextLevelBtn.hidden) state.uiFocus.reviewButton = state.uiFocus.reviewButton === 0 ? 1 : 0;
    else state.uiFocus.reviewButton = 0;
    if (state.uiFocus.reviewButton === 1 && !nextLevelBtn.hidden) nextLevelBtn.focus();
    else retryBtn.focus();
    return;
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
    if (state.runWorldId === "skarn") startSkarnAim();
    else attack();
  }
  if (ev.code === "KeyP") {
    ev.preventDefault();
    handlePamSpottingKey();
  }
}

window.addEventListener("keydown", handlePress);
window.addEventListener("keyup", (ev) => {
  if (ev.code === "Space") {
    state.spaceHeld = false;
    if (state.pendingSpaceTapJump && state.spaceHoldSec < GAME.slideHoldThresholdSec) {
      jump();
    }
    state.pendingSpaceTapJump = false;
    state.spaceHoldSec = 0;
    return;
  }
  if (ev.code === "KeyK" && state.scene === "run" && state.runWorldId === "skarn") {
    ev.preventDefault();
    if (state.skarnAimActive) {
      state.skarnAimActive = false;
      fireSkarnGun();
    }
  }
});

canvas.addEventListener("pointerdown", (ev) => {
  if (state.bossMode || state.scene === "loading") return;
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
  if (state.scene === "inventory") {
    selectInventoryByCanvasPoint(x, y);
    return;
  }
  if (state.scene === "settings") {
    const idx = Math.floor((y - 134) / 42);
    if (idx >= 0 && idx < 7) {
      state.uiFocus.settingsOption = idx;
      if (x > 610) adjustSettingByIndex(idx, 1);
    }
    return;
  }
  if (state.scene === "annex") {
    selectAnnexByCanvasPoint(x, y);
    return;
  }
  if (state.scene === "characters") {
    selectCharacterByCanvasPoint(x, y);
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

saveImportInput.addEventListener("change", async () => {
  const file = saveImportInput.files && saveImportInput.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!parsed || !parsed.profiles) throw new Error("Invalid save shape");
    const profiles = {
      michael: normalizeSave(parsed.profiles.michael),
      dwight: normalizeSave(parsed.profiles.dwight),
      andy: normalizeSave(parsed.profiles.andy),
    };
    migrateLegacyUpgradesToInventory(profiles.michael);
    migrateLegacyUpgradesToInventory(profiles.dwight);
    migrateLegacyUpgradesToInventory(profiles.andy);
    state.saveProfiles = profiles;
    state.activeRunnerId = RUNNER_IDS.includes(parsed.currentRunner) ? parsed.currentRunner : "michael";
    state.saveData = state.saveProfiles[state.activeRunnerId];
    characterSelect.value = state.activeRunnerId;
    persistSave();
    showMissionToast("Save imported.");
  } catch {
    showMissionToast("Import failed: invalid save file.");
  }
});

startBtn.addEventListener("click", () => {
  ensureAudioContext();
  if (state.scene === "loading") return;
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
  switchRunnerProfile(characterSelect.value);
  setMenuDialogue();
});

if (!localStorage.getItem(RESET_ONCE_KEY)) {
  localStorage.removeItem(SAVE_KEY);
  localStorage.setItem(RESET_ONCE_KEY, "1");
}
state.saveData = loadSave(characterSelect.value || "michael");
if (RUNNER_IDS.includes(state.activeRunnerId)) {
  characterSelect.value = state.activeRunnerId;
}
if (state.saveProfiles) {
  if (!state.saveProfiles[state.activeRunnerId]) state.saveProfiles[state.activeRunnerId] = createDefaultSave();
  state.saveData = state.saveProfiles[state.activeRunnerId];
}
syncDundieOutfitRewards();
syncPostKeyMissionRewards();
persistSave();
setMenuDialogue();
if (!state.saveData.flags?.tutorialSeen) switchScene("tutorial");
else switchScene("menu");
summaryPanel.hidden = true;
requestAnimationFrame(loop);
