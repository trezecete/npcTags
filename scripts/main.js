import { openTagEditorAPI, openTagEditorForActor } from "./api.js";

console.log("NPC Tags: Loading...");

game.npcTags = {
  openTagEditorAPI: openTagEditorAPI
};

console.log("NPC Tags loaded", game.npcTags);

Hooks.on("ActorsDirectoryContextMenu", (html, actors) => {
  actors.push({
    name: game.i18n.localize("npc-tags.contextMenu.editTags"),
    icon: '<i class="fas fa-tag"></i>',
    callback: (actor) => {
      openTagEditorForActor(actor);
    }
  });
});

Hooks.on("getActorSheetHeaderButtons", (sheet, buttons) => {
  buttons.push({
    label: game.i18n.localize("npc-tags.sheet.editTags"),
    icon: "fas fa-tag",
    onclick: (html, sheet) => {
      openTagEditorForActor(sheet.actor);
    }
  });
});