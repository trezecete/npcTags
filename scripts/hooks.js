import { openTagEditorForActor } from "./api.js";
import { getAllActorTags } from "./tags.js";

export function registerHooks() {
  // Add context menu option
  Hooks.on("getActorDirectoryEntryContext", (html, options) => {
    options.push({
      name: "npc-tags.contextMenu.editTags",
      icon: '<i class="fas fa-tag"></i>',
      callback: (li) => {
        const actor = game.actors.get(li.data("documentId"));
        if (actor) openTagEditorForActor(actor);
      }
    });
  });

  // Add Gallery button to Actor Directory
  Hooks.on("getDirectoryHeaderButtons", (app, buttons) => {
    if (!(app instanceof ActorDirectory)) return;
    
    buttons.unshift({
      label: "Galeria de Tags",
      class: "npc-tags-gallery-btn",
      icon: "fas fa-th-large",
      onclick: () => {
        new game.npcTags.TagGalleryApp().render(true);
      }
    });
  });

  // Add button to Actor Sheet header
  Hooks.on("getActorSheetHeaderButtons", (sheet, buttons) => {
    buttons.unshift({
      label: "",
      class: "edit-npc-tags",
      icon: "fas fa-tag",
      onclick: () => openTagEditorForActor(sheet.actor)
    });
  });

  // Search Injection: Add tags to Actor Directory entries
  Hooks.on("renderActorDirectory", (app, html, data) => {
    const actorEntries = html.find(".directory-item.document.actor");
    
    actorEntries.each((i, el) => {
      const li = $(el);
      const actorId = li.data("documentId");
      const actor = game.actors.get(actorId);
      if (!actor) return;

      const tags = getAllActorTags(actor);
      if (tags.length === 0) return;

      // Inject hidden tags into the document name for searchability
      const nameElement = li.find(".document-name");
      
      // We use a hidden span so the standard Foundry search (which checks textContent) finds it
      // but the user doesn't see it in the list (unless we want to show it)
      if (nameElement.find(".npc-tags-hidden").length === 0) {
        nameElement.append(`<span class="npc-tags-hidden" style="display:none">${tags.join(" ")}</span>`);
      } else {
        nameElement.find(".npc-tags-hidden").text(tags.join(" "));
      }

      // Optional: Visual tags in the directory (small indicators)
      // Uncomment if you want to see them
      /*
      if (li.find(".npc-tags-display").length === 0) {
          li.append(`<div class="npc-tags-display">${tags.map(t => `<span class="tag-mini">${t}</span>`).join("")}</div>`);
      }
      */
    });
  });
}