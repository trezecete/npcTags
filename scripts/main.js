import { registerHooks } from "./hooks.js";
import * as API from "./api.js";

console.log("NPC Tags loaded");

Hooks.once("init", () => {
  console.log("NPC Tags: Initializing...");
  game.npcTags = API;
});

Hooks.once("ready", () => {
  console.log("NPC Tags: Registering hooks...");
  registerHooks();
});