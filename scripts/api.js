import { getTagsFromActors, getLockedTagsFromActors, addTagsToActor, removeTagFromActor, setTagsOnActors, getTagColor, setTagType } from "./tags.js";

const TEMPLATE = "modules/npc-tags/templates/tag-editor.hbs";

class TagEditorDialog extends Application {
  constructor(actors, options = {}) {
    super(options);
    this.actors = actors;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "npc-tags-editor",
      classes: ["npc-tags-dialog"],
      template: TEMPLATE,
      width: 400,
      height: "auto",
      title: game.i18n.localize("npc-tags.dialog.title")
    });
  }

  async getData() {
    const multiple = this.actors.length > 1;
    const normalTags = getTagsFromActors(this.actors);
    const lockedTags = getLockedTagsFromActors(this.actors);
    
    // Unify tags into a single sorted list of objects
    const allTagsMap = new Map();
    
    lockedTags.forEach(t => allTagsMap.set(t, { name: t, isLocked: true, color: getTagColor(t) }));
    normalTags.forEach(t => {
        if (!allTagsMap.has(t)) {
            allTagsMap.set(t, { name: t, isLocked: false, color: getTagColor(t) });
        }
    });

    const unifiedTags = Array.from(allTagsMap.values()).sort((a, b) => {
        if (a.isLocked && !b.isLocked) return -1;
        if (!a.isLocked && b.isLocked) return 1;
        return a.name.localeCompare(b.name);
    });
    
    return {
      multipleActors: multiple,
      actorCount: this.actors.length,
      tagsList: unifiedTags,
      isSingle: !multiple,
      actorName: multiple ? "" : this.actors[0].name
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Add Tag on Enter
    html.find('input[name="tagsInput"]').on("keypress", (event) => {
      if (event.which === 13) {
        event.preventDefault();
        this._onAddTags(event, html);
      }
    });

    // Add Tag button
    html.find(".add-tag-btn").on("click", (event) => {
      this._onAddTags(event, html);
    });

    // Remove Tag button
    html.find(".tag-remove").on("click", (event) => {
      this._onRemoveTag(event);
    });

    // Clear all tags
    html.find(".clear-all-btn").on("click", (event) => {
      this._onClearAll(event);
    });

    // Right-click context menu for tags
    html.find(".tag").on("contextmenu", (event) => {
      this._onTagContextMenu(event);
    });
  }

  async _onTagContextMenu(event) {
    event.preventDefault();
    const tagName = event.currentTarget.dataset.tag;
    const types = game.settings.get("npc-tags", "tagTypes");

    const menuItems = types.map(type => ({
      name: type.label,
      icon: `<i class="fas fa-tag" style="color: ${type.color}"></i>`,
      callback: async () => {
        await setTagType(tagName, type.id);
        this.render();
      }
    }));

    // Add option to clear type
    menuItems.push({
      name: "Remover Tipo",
      icon: '<i class="fas fa-eraser"></i>',
      callback: async () => {
        await setTagType(tagName, "default");
        this.render();
      }
    });

    new ContextMenu($(event.currentTarget).parent(), ".tag", menuItems).render($(event.currentTarget));
  }

  async _onAddTags(event, html) {
    const input = html.find('input[name="tagsInput"]');
    const value = input.val();
    if (!value) return;

    for (const actor of this.actors) {
      await addTagsToActor(actor, value);
    }

    input.val("");
    this.render();
  }

  async _onRemoveTag(event) {
    const tag = event.currentTarget.closest(".tag").dataset.tag;
    for (const actor of this.actors) {
      await removeTagFromActor(actor, tag);
    }
    this.render();
  }

  async _onClearAll(event) {
    const confirm = await Dialog.confirm({
      title: game.i18n.localize("npc-tags.dialog.clearConfirmTitle"),
      content: `<p>${game.i18n.localize("npc-tags.dialog.clearConfirmContent")}</p>`,
      yes: () => true,
      no: () => false,
      defaultYes: false
    });

    if (confirm) {
      for (const actor of this.actors) {
        await setTagsOnActors([actor], "");
      }
      this.render();
    }
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
  const actors = controlledTokens.map(t => t.actor).filter(a => a);
  
  if (actors.length === 0) {
    ui.notifications.warn(game.i18n.localize("npc-tags.notifications.noTokensSelected"));
    return;
  }

  await openTagEditor(actors);
}

async function openTagEditorForActor(actor) {
  await openTagEditor([actor]);
}

export { openTagEditorFromTokens, openTagEditorForActor, openTagEditor };