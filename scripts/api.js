import { getTagsFromActors, getLockedTagsFromActors, addTagsToActor, removeTagFromActor, setTagsOnActors, getTagColor, setTagType } from "./tags.js";

const TEMPLATE = "modules/npc-tags/templates/tag-editor.hbs";

class TagEditorDialog extends Application {
  constructor(actors, options = {}) {
    super(options);
    this.actors = actors;
    this.showAll = false; // Toggle state for multi-select
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
    const { getTagsFromActors, getLockedTagsFromActors, getTagColor, getTagType } = await import("./tags.js");
    
    let normalTags = [];
    let lockedTags = [];

    if (multiple) {
        // Calculate Intersection (Common Tags)
        const tagSets = this.actors.map(a => new Set(getTagsFromActors([a])));
        const commonTags = getTagsFromActors([this.actors[0]]).filter(t => tagSets.every(s => s.has(t)));
        
        // Calculate Union (All Tags)
        const allTags = getTagsFromActors(this.actors);
        
        normalTags = this.showAll ? allTags : commonTags;
        
        // Only show locked tags in multi-select if showAll is active
        lockedTags = this.showAll ? getLockedTagsFromActors(this.actors) : [];
    } else {
        normalTags = getTagsFromActors(this.actors);
        lockedTags = getLockedTagsFromActors(this.actors);
    }
    
    // Unify and Sort by Type then Name
    const types = game.settings.get("npc-tags", "tagTypes");
    const typeMap = new Map(types.map(t => [t.id, t]));
    
    const prepareTag = (t, isLocked) => ({
        name: t,
        isLocked,
        color: getTagColor(t),
        typeId: getTagType(t),
        typeLabel: (typeMap.get(getTagType(t)) || { label: "Geral" }).label
    });

    const unifiedTags = [
        ...lockedTags.map(t => prepareTag(t, true)),
        ...normalTags.map(t => prepareTag(t, false))
    ].sort((a, b) => {
        // Sort by Type Label first, then by Name
        const typeComp = a.typeLabel.localeCompare(b.typeLabel);
        if (typeComp !== 0) return typeComp;
        return a.name.localeCompare(b.name);
    });

    return {
      multipleActors: multiple,
      actorCount: this.actors.length,
      tagsList: unifiedTags,
      showAll: this.showAll,
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

    // Toggle Show All
    html.find(".toggle-show-all").on("click", (event) => {
        this.showAll = !this.showAll;
        this.render();
    });

    // Right-click context menu for tags
    html.find(".tag").on("contextmenu", (event) => {
      this._onTagContextMenu(event);
    });
  }

  async _onTagContextMenu(event) {
    event.preventDefault();
    const tagName = event.currentTarget.dataset.tag;
    const types = [...game.settings.get("npc-tags", "tagTypes")].sort((a, b) => a.label.localeCompare(b.label));

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