import { registerHooks } from "./hooks.js";
import { openTagEditorFromTokens, openTagEditorForActor } from "./api.js";

Hooks.once("init", () => {
  console.log("NPC Tags | Initializing...");

  // Register Hooks
  registerHooks();

  // Expose API
  game.modules.get("npc-tags").api = {
    openTagEditorFromTokens,
    openTagEditorForActor
  };

  // Shortcut global
  game.npcTags = game.modules.get("npc-tags").api;
});

Hooks.once("ready", () => {
  console.log("NPC Tags | Ready!");
});