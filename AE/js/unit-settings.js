import { getItem, setItem } from "./store.js";

const UNIT_SETTINGS_KEY = "unit-toggles";
const GLOBAL_SETTINGS_KEY = "dps-global-settings";

// Cached in-memory store
let cachedUnitSettings = null;
let cachedGlobalSettings = null;

function loadUnitSettings() {
  if (!cachedUnitSettings) {
    cachedUnitSettings = getItem(UNIT_SETTINGS_KEY, {});
  }
  return cachedUnitSettings;
}

function loadGlobalSettings() {
  if (!cachedGlobalSettings) {
    cachedGlobalSettings = getItem(GLOBAL_SETTINGS_KEY, {
      dpsMode: "dps",
      compMode: false,
    });
  }
  return cachedGlobalSettings;
}

export function getUnitSavedSettings(unitId) {
  const all = loadUnitSettings();
  return all[unitId] || {};
}

export function saveUnitSetting(unitId, key, value) {
  if (!unitId) return;
  const all = loadUnitSettings();
  if (!all[unitId]) all[unitId] = {};
  all[unitId][key] = value;
  cachedUnitSettings = all;
  setItem(UNIT_SETTINGS_KEY, all);
}

export function saveMultipleUnitSettings(unitId, settingsObj) {
  if (!unitId || !settingsObj) return;
  const all = loadUnitSettings();
  if (!all[unitId]) all[unitId] = {};
  Object.assign(all[unitId], settingsObj);
  cachedUnitSettings = all;
  setItem(UNIT_SETTINGS_KEY, all);
}

export function getGlobalSetting(key, fallback) {
  const globals = loadGlobalSettings();
  return globals[key] !== undefined ? globals[key] : fallback;
}

export function saveGlobalSetting(key, value) {
  const globals = loadGlobalSettings();
  globals[key] = value;
  cachedGlobalSettings = globals;
  setItem(GLOBAL_SETTINGS_KEY, globals);
}

/**
 * Applies persisted settings onto a unit object.
 */
export function applySavedSettingsToUnit(unit) {
  if (!unit || !unit.id) return unit;
  const saved = getUnitSavedSettings(unit.id);

  if (saved.simulateShinigamiPassive !== undefined) {
    unit.simulateShinigamiPassive = saved.simulateShinigamiPassive;
  } else if (unit.simulateShinigamiPassive === undefined) {
    unit.simulateShinigamiPassive = true;
  }

  if (saved.darkMageMode !== undefined) unit.darkMageMode = saved.darkMageMode;
  if (saved.giantForm !== undefined) unit.giantForm = saved.giantForm;
  if (saved.berserkState !== undefined) unit.berserkState = saved.berserkState;
  if (saved.demonicPresence !== undefined) unit.demonicPresence = saved.demonicPresence;
  if (saved.crowEnemiesHit !== undefined) unit.crowEnemiesHit = saved.crowEnemiesHit;
  if (saved.crimsonAbilityActive !== undefined) unit.crimsonAbilityActive = saved.crimsonAbilityActive;
  if (saved.crimsonPoolCount !== undefined) unit.crimsonPoolCount = saved.crimsonPoolCount;
  if (saved.coldState !== undefined) unit.coldState = saved.coldState;
  if (saved.caringState !== undefined) unit.caringState = saved.caringState;
  if (saved.royalRivalry !== undefined) unit.royalRivalry = saved.royalRivalry;
  if (saved.awakenedPride !== undefined) unit.awakenedPride = saved.awakenedPride;
  if (saved.carrotTransformation !== undefined) unit.carrotTransformation = saved.carrotTransformation;
  if (saved.carrotInstantRelocation !== undefined) unit.carrotInstantRelocation = saved.carrotInstantRelocation;
  if (saved.prodigyRageUnleashed !== undefined) unit.prodigyRageUnleashed = saved.prodigyRageUnleashed;
  if (saved.prodigyFatherAndSonActive !== undefined) unit.prodigyFatherAndSonActive = saved.prodigyFatherAndSonActive;
  if (saved.prodigyStatusEffects !== undefined) unit.prodigyStatusEffects = saved.prodigyStatusEffects;
  if (saved.bioinsectForm !== undefined) unit.bioinsectForm = saved.bioinsectForm;
  if (saved.bioinsectResetStacks !== undefined) unit.bioinsectResetStacks = saved.bioinsectResetStacks;
  if (saved.bioinsectCopiedUnitId !== undefined) unit.bioinsectCopiedUnitId = saved.bioinsectCopiedUnitId;
  if (saved.fuaDamages !== undefined) unit.fuaDamages = saved.fuaDamages;
  if (saved.followUpInputsRaw !== undefined) unit.followUpInputsRaw = saved.followUpInputsRaw;
  if (saved.followUpInputs !== undefined) unit.followUpInputs = saved.followUpInputs;
  if (saved.headCaptainBurningEnemies !== undefined) unit.headCaptainBurningEnemies = saved.headCaptainBurningEnemies;
  if (saved.headCaptainBurnStacks !== undefined) unit.headCaptainBurnStacks = saved.headCaptainBurnStacks;
  if (saved.sovereignBossActive !== undefined) unit.sovereignBossActive = saved.sovereignBossActive;
  if (saved.sovereignDjinnJudgmentActive !== undefined) unit.sovereignDjinnJudgmentActive = saved.sovereignDjinnJudgmentActive;
  if (saved.sovereignEnemies !== undefined) unit.sovereignEnemies = saved.sovereignEnemies;
  if (saved.lgVoltageMeter !== undefined) unit.lgVoltageMeter = saved.lgVoltageMeter;
  if (saved.lgEnemies !== undefined) unit.lgEnemies = saved.lgEnemies;
  if (saved.sfBurnStacks !== undefined) unit.sfBurnStacks = saved.sfBurnStacks;

  return unit;
}

/**
 * Applies persisted settings onto an array of units.
 */
export function applySavedSettingsToAllUnits(unitsList) {
  if (!Array.isArray(unitsList)) return;
  unitsList.forEach(applySavedSettingsToUnit);
}
