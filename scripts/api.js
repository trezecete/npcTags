import { getTagsFromActors, setTagsOnActors, removeTagFromActor, parseTags, getActorTags } from "./tags.js";

const TEMPLATE = "modules/npc-tags/templates/tag-editor.hbs";

class TagEditorDialog extends Dialog {
  constructor(actors, options = {}) {
    const multiple = actors.length > 1;
    const actorCount = actors.length;
    const allTags = getTagsFromActors(actors);
    const tagsValue = allTags.join(" ");

    super({
      title: multiple ? game.i18n.localize("npc-tags.dialog.titleMultiple") : game.i18n.localize("npc-tags.dialog.title"),
      content: "",
      buttons: {
        save: {
          label: multiple ? game.i18n.localize("npc-tags.dialog.applyAll") : game.i18n.localize("npc-tags.dialog.save"),
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
    }, options);

    this.actors = actors;
    this.multiple = multiple;
    this.actorCount = actorCount;
    this.allTags = allTags;
    this.tagsValue = tagsValue;
  }

  async _renderInner(data) {
    return renderTemplate(TEMPLATE, {
      multipleActors: this.multiple,
      actorCount: this.actorCount,
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

async function openTagEditorAPI() {
  const controlledTokens = canvas.tokens?.controlled || [];
  
  if (controlledTokens.length === 0) {
    ui.notifications.warn(game.i18n.localize("npc-tags.notifications.noTokensSelected"));
    return;
  }

  const actors = [];
  for (const token of controlledTokens) {
    if (token.actor) {
      actors.push(token.actor);
    }
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

export { openTagEditorAPI, openTagEditorForActor, openTagEditor };

globalThis.openNPCTagsEditor = openTagEditorAPI;
globalThis.npcTagsEditTags = openTagEditorForActor;