import { getTagsFromActors, setTagsOnActors, removeTagFromActor } from "./tags.js";

const TEMPLATE = "modules/npc-tags/templates/tag-editor.hbs";

export class TagEditorDialog extends Dialog {
  constructor(actors, options = {}) {
    const multiple = actors.length > 1;
    const actorCount = actors.length;
    const allTags = getTagsFromActors(actors);
    const tagsValue = allTags.join(" ");

    super({
      title: multiple ? game.i18n.localize("npc-tags.dialog.titleMultiple") : game.i18n.localize("npc-tags.dialog.title"),
      content: await renderTemplate(TEMPLATE, {
        multipleActors: multiple,
        actorCount: actorCount,
        tagsValue: tagsValue,
        tagsList: allTags
      }),
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
    this.relatedTagEditorDialog = null;
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

export async function openTagEditor(actors) {
  if (!actors || actors.length === 0) {
    ui.notifications.warn(game.i18n.localize("npc-tags.notifications.noTokensSelected"));
    return;
  }

  const dialog = new TagEditorDialog(actors);
  dialog.render(true);
}