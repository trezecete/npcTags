import { registerHooks } from "./hooks.js";
import { openTagEditorFromTokens, openTagEditorForActor } from "./api.js";
import { TagTypeConfig } from "./tag-type-config.js";

Hooks.once("init", () => {
  console.log("NPC Tags | Initializing...");

  // Register Settings
  game.settings.register("npc-tags", "tagTypes", {
    name: "Tag Types Configuration",
    scope: "world",
    config: false,
    type: Array,
    default: [
      { id: "default", label: "Geral", color: "#e0e0e0" }
    ]
  });

  game.settings.register("npc-tags", "tagMapping", {
    name: "Tag to Type Mapping",
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });

  // Register Menu
  game.settings.registerMenu("npc-tags", "tagTypeMenu", {
    name: "npc-tags.settings.tagTypeMenu.name",
    label: "npc-tags.settings.tagTypeMenu.label",
    hint: "npc-tags.settings.tagTypeMenu.hint",
    icon: "fas fa-tags",
    type: TagTypeConfig,
    restricted: true
  });

  // Register Hooks
  registerHooks();
});

// Setup hook is better for exposing APIs to other modules/macros
Hooks.once("setup", () => {
  const api = {
    openTagEditorFromTokens,
    openTagEditorForActor,
    TagTypeConfig
  };

  game.modules.get("npc-tags").api = api;
  game.npcTags = api;

  console.log("NPC Tags | API Exposed:", game.npcTags);
});

Hooks.once("ready", () => {
  console.log("NPC Tags | Ready!");
});