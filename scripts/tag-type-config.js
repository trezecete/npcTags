import { setTagType } from "./tags.js";

export class TagTypeConfig extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "npc-tags-type-config",
      title: game.i18n.localize("npc-tags.settings.tagTypeMenu.name"),
      template: "modules/npc-tags/templates/tag-type-config.hbs",
      width: 500,
      height: 600,
      resizable: true,
      closeOnSubmit: true,
      classes: ["npc-tags-dialog", "tag-type-config-app"]
    });
  }

  async getData() {
    const types = game.settings.get("npc-tags", "tagTypes");
    const mapping = game.settings.get("npc-tags", "tagMapping");
    
    const tagsByType = {};
    Object.entries(mapping).forEach(([tag, typeId]) => {
      if (!tagsByType[typeId]) tagsByType[typeId] = [];
      tagsByType[typeId].push(tag);
    });

    return {
      types: types.map(t => ({
        ...t,
        tagObjects: (tagsByType[t.id] || []).sort()
      }))
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".add-type-btn").click(this._onAddType.bind(this));
    html.find(".delete-type-btn").click(this._onDeleteType.bind(this));
    html.find(".remove-tag-from-type").click(this._onRemoveTagFromType.bind(this));
  }

  async _onAddType(event) {
    event.preventDefault();
    
    // Scrape current form data to avoid losing unsaved changes
    const formData = new FormDataExtended(this.form).object;
    const types = game.settings.get("npc-tags", "tagTypes");
    
    const updatedTypes = types.map(t => ({
        id: t.id,
        label: formData[`label.${t.id}`] || t.label,
        color: formData[`color.${t.id}`] || t.color
    }));

    const newId = foundry.utils.randomID();
    updatedTypes.push({
      id: newId,
      label: "Novo Tipo",
      color: "#e0e0e0"
    });

    await game.settings.set("npc-tags", "tagTypes", updatedTypes);
    this.render();
  }

  async _onDeleteType(event) {
    event.preventDefault();
    const typeId = event.currentTarget.closest(".type-row").dataset.typeId;
    if (typeId === "default") return;

    const types = game.settings.get("npc-tags", "tagTypes").filter(t => t.id !== typeId);
    await game.settings.set("npc-tags", "tagTypes", types);

    const mapping = game.settings.get("npc-tags", "tagMapping");
    Object.keys(mapping).forEach(tag => {
      if (mapping[tag] === typeId) delete mapping[tag];
    });
    await game.settings.set("npc-tags", "tagMapping", mapping);

    this.render();
  }

  async _onRemoveTagFromType(event) {
    event.preventDefault();
    const tag = event.currentTarget.dataset.tag;
    await setTagType(tag, "default");
    this.render();
  }

  async _updateObject(event, formData) {
    const types = game.settings.get("npc-tags", "tagTypes");
    const updatedTypes = types.map(t => {
      return {
        id: t.id,
        label: formData[`label.${t.id}`],
        color: formData[`color.${t.id}`]
      };
    });
    await game.settings.set("npc-tags", "tagTypes", updatedTypes);
  }
}
