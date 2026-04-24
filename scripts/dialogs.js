import { getActorTags, setActorTags, removeTagFromActor, parseTags, getTagsFromActors, setTagsOnActors } from "./tags.js";

const TEMPLATE = "modules/npc-tags/templates/tag-editor.hbs";

export class TagEditorDialog extends Dialog {
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
          icon: "<i class=\"fas fa-check\"></i>",
          callback: async (html) => {
            const input = html.querySelector('input[name="tagsInput"]');
            const tagsInput = input?.value || "";
            await setTagsOnActors(actors, tagsInput);
          }
        },
        cancel: {
          label: game.i18n.localize("npc-tags.dialog.cancel"),
          icon: "<i class=\"fas fa-times\"></i>",
          callback: () => {}
        }
      },
      default: "save",
      close: () => {},
      render: (html) => {
        const removeButtons = html.querySelectorAll(".tag-remove");
        removeButtons.forEach(btn => {
          btn.addEventListener("click", async (e) => {
            const tag = e.target.closest(".tag").dataset.tag;
            for (const actor of actors) {
              await removeTagFromActor(actor, tag);
            }
            renderDialog();
          });
        });
      }
    }, options);

    this.actors = actors;
    this.multiple = multiple;
    this.actorCount = actorCount;
    this.allTags = allTags;
    this.tagsValue = tagsValue;
    this._dialog = null;
  }

  async _renderInner(data) {
    return renderTemplate(TEMPLATE, {
      multipleActors: this.multiple,
      actorCount: this.actorCount,
      tagsValue: this.tagsValue,
      tagsList: this.allTags
    });
  }

  async getData() {
    return {
      multipleActors: this.multiple,
      actorCount: this.actorCount,
      tagsValue: this.tagsValue,
      tagsList: this.allTags
    };
  }
}

async function renderDialog() {
  if (this.dialog) await this.dialog.close();
  this.dialog = new TagEditorDialog(this.actors);
  await this.dialog.render(true);
}

export async function openTagEditor(actors) {
  if (!actors || actors.length === 0) {
    ui.notifications.warn(game.i18n.localize("npc-tags.notifications.noTokensSelected"));
    return;
  }

  const dialog = new TagEditorDialog(actors);
  await dialog.render(true);
}