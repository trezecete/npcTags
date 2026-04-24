import { registerHooks } from "./hooks.js";
import * as API from "./api.js";

console.log("NPC Tags loaded");

globalThis.openNPCTagsEditor = API.openTagEditorAPI;

Hooks.once("init", () => {
  console.log("NPC Tags: Initializing...");
  game.npcTags = API;
  registerHooks();
});