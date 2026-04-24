const FLAG_SCOPE = "npc-tags";
const FLAG_KEY = "tags";
const TEMPLATE = "modules/npc-tags/templates/tag-editor.hbs";

function normalizeTag(input) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function parseTags(input) {
  const rawTags = input.split(/\s+/).filter(t => t.length > 0);
  const normalizedTags = rawTags.map(normalizeTag).filter(t => t.length > 0);
  return [...new Set(normalizedTags)];
}

function getActorTags(actor) {
  return actor.getFlag(FLAG_SCOPE, FLAG_KEY) || [];
}

async function setActorTags(actor, tags) {
  const cleanTags = [...new Set(tags)];
  if (cleanTags.length === 0) {
    await actor.unsetFlag(FLAG_SCOPE, FLAG_KEY);
  } else {
    await actor.setFlag(FLAG_SCOPE, FLAG_KEY, cleanTags);
  }
}

async function removeTagFromActor(actor, tagToRemove) {
  const currentTags = getActorTags(actor);
  const normalized = normalizeTag(tagToRemove);
  const filtered = currentTags.filter(t => t !== normalized);
  await setActorTags(actor, filtered);
}

function getTagsFromActors(actors) {
  const allTags = new Set();
  for (const actor of actors) {
    const tags = getActorTags(actor);
    for (const tag of tags) {
      allTags.add(tag);
    }
  }
  return [...allTags].sort();
}

async function setTagsOnActors(actors, tagsInput) {
  const newTags = parseTags(tagsInput);
  for (const actor of actors) {
    await setActorTags(actor, newTags);
  }
}

class TagEditorDialog extends Dialog {
  constructor(actors) {
    const multiple = actors.length > 1;
    const actorCount = actors.length;
    const allTags = getTagsFromActors(actors);
    const tagsValue = allTags.join(" ");

    super({
      title: multiple 
        ? game.i18n.format("npc-tags.dialog.titleMultiple", { count: actorCount })
        : game.i18n.localize("npc-tags.dialog.title"),
      content: "",
      buttons: {
        save: {
          label: multiple 
            ? game.i18n.localize("npc-tags.dialog.applyAll")
            : game.i18n.localize("npc-tags.dialog.save"),
          icon: '<i class="fas fa-check"></i>',
          callback: async (html) => {
            const input = html.querySelector('input[name="tagsInput"]');
            const tagsInput = input?.value || "";
            await setTagsOnActors(actors, tagsInput);
          }
        },
        cancel: {
          label: game.i18n.localize("npc-tags.dialog.cancel"),
          icon: '<i class="fas fa-times"></i>'
        }
      },
      defaultButton: "save"
    });

    this.actors = actors;
    this.allTags = allTags;
    this.tagsValue = tagsValue;
  }

  async _renderInner(data) {
    return renderTemplate(TEMPLATE, {
      multipleActors: this.actors.length > 1,
      actorCount: this.actors.length,
      tagsValue: this.tagsValue,
      tagsList: this.allTags
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
    const removeButtons = html.querySelectorAll(".tag-remove");
    removeButtons.forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const tag = e.target.closest(".tag").dataset.tag;
        for (const actor of this.actors) {
          await removeTagFromActor(actor, tag);
        }
        this.render(true);
      });
    });
  }
}

async function openTagEditor(actors) {
  if (!actors || actors.length === 0) {
    ui.notifications.warn(game.i18n.localize("npc-tags.notifications.noTokensSelected"));
    return;
  }
  const dialog = new TagEditorDialog(actors);
  dialog.render(true);
}

async function openTagEditorFromTokens() {
  const controlledTokens = canvas.tokens?.controlled || [];
  if (controlledTokens.length === 0) {
    ui.notifications.warn(game.i18n.localize("npc-tags.notifications.noTokensSelected"));
    return;
  }
  const actors = [];
  for (const token of controlledTokens) {
    if (token.actor) actors.push(token.actor);
  }
  if (actors.length === 0) {
    ui.notifications.warn(game.i18n.localize("npc-tags.notifications.noActorFound"));
    return;
  }
  await openTagEditor(actors);
}

async function openTagEditorForActor(actor) {
  await openTagEditor([actor]);
}

console.log("NPC Tags: Loading...");

globalThis.openNPCTagsEditor = openTagEditorFromTokens;
globalThis.npcTagsEditTags = openTagEditorForActor;

game.npcTags = {
  openTagEditorAPI: openTagEditorFromTokens,
  openTagEditorForActor: openTagEditorForActor
};

console.log("NPC Tags loaded");

Hooks.on("ActorsDirectoryContextMenu", (html, actors) => {
  actors.push({
    name: game.i18n.localize("npc-tags.contextMenu.editTags"),
    icon: '<i class="fas fa-tag"></i>',
    callback: (actor) => openTagEditorForActor(actor)
  });
});

Hooks.on("getActorSheetHeaderButtons", (sheet, buttons) => {
  buttons.push({
    label: game.i18n.localize("npc-tags.sheet.editTags"),
    icon: "fas fa-tag",
    onclick: () => openTagEditorForActor(sheet.actor)
  });
});