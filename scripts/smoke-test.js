#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const gamePath = path.join(root, "src", "game.js");
const code = fs.readFileSync(gamePath, "utf8");

const checks = [
  {
    name: "syntax check",
    run: () => {
      const res = spawnSync("node", ["--check", gamePath], { encoding: "utf8" });
      if (res.status !== 0) throw new Error(res.stderr || "Syntax check failed");
    },
  },
  {
    name: "first-run tutorial bootstrap",
    run: () => {
      if (!code.includes("if (!state.saveData.flags?.tutorialSeen) switchScene(\"tutorial\");")) {
        throw new Error("Tutorial bootstrap gate missing");
      }
    },
  },
  {
    name: "settings scene exists",
    run: () => {
      if (!code.includes("function drawSettingsScene()")) throw new Error("drawSettingsScene missing");
      if (!code.includes("switchScene(\"settings\")")) throw new Error("settings scene routing missing");
    },
  },
  {
    name: "save export/import functions exist",
    run: () => {
      if (!code.includes("function exportSaveToFile()")) throw new Error("exportSaveToFile missing");
      if (!code.includes("function importSaveFromFile()")) throw new Error("importSaveFromFile missing");
      if (!code.includes("saveImportInput.addEventListener(\"change\"")) throw new Error("save import listener missing");
    },
  },
  {
    name: "debug hitbox tooling exists",
    run: () => {
      if (!code.includes("function drawDebugHitboxes()")) throw new Error("drawDebugHitboxes missing");
      if (!code.includes("if (ev.code === \"KeyH\")")) throw new Error("KeyH debug toggle missing");
    },
  },
  {
    name: "text wrapping uses shared token layout",
    run: () => {
      if (!code.includes("function layoutWrappedTokens(")) throw new Error("layoutWrappedTokens missing");
      if (!code.includes("drawWrappedTextWithCurrencyIcons")) throw new Error("currency wrapper missing");
    },
  },
];

let failures = 0;
for (const check of checks) {
  try {
    check.run();
    console.log(`PASS  ${check.name}`);
  } catch (err) {
    failures += 1;
    console.error(`FAIL  ${check.name}`);
    console.error(`      ${err.message}`);
  }
}

if (failures > 0) {
  console.error(`\nSmoke tests failed: ${failures}`);
  process.exit(1);
}

console.log(`\nSmoke tests passed: ${checks.length}`);
