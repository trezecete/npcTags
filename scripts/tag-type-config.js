export class TagTypeConfig extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "npc-tags-type-config",
      title: game.i18n.localize("npc-tags.settings.tagTypeMenu.name"),
      template: "modules/npc-tags/templates/tag-type-config.hbs",
      width: 500,
      height: "auto",
      closeOnSubmit: true,
      classes: ["npc-tags-dialog", "tag-type-config"]
    });
  }

  async getData() {
    const types = game.settings.get("npc-tags", "tagTypes");
    const mapping = game.settings.get("npc-tags", "tagMapping");
    
    // Group tags by type
    const tagsByType = {};
    Object.entries(mapping).forEach(([tag, typeId]) => {
      if (!tagsByType[typeId]) tagsByType[typeId] = [];
      tagsByType[typeId].push(tag);
    });

    return {
      types: types.map(t => ({
        ...t,
        tags: (tagsByType[t.id] || []).join(", ")
      }))
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".add-type").click(this._onAddType.bind(this));
    html.find(".delete-type").click(this._onDeleteType.bind(this));
  }

  async _onAddType(event) {
    event.preventDefault();
    const types = game.settings.get("npc-tags", "tagTypes");
    const newId = foundry.utils.randomID();
    types.push({
      id: newId,
      label: "Novo Tipo",
      color: "#e0e0e0"
    });
    await game.settings.set("npc-tags", "tagTypes", types);
    this.render();
  }

  async _onDeleteType(event) {
    event.preventDefault();
    const typeId = event.currentTarget.closest(".type-row").dataset.typeId;
    if (typeId === "default") return ui.notifications.warn("Não é possível deletar o tipo padrão.");

    const types = game.settings.get("npc-tags", "tagTypes").filter(t => t.id !== typeId);
    await game.settings.set("npc-tags", "tagTypes", types);

    // Update mapping to remove deleted type
    const mapping = game.settings.get("npc-tags", "tagMapping");
    Object.keys(mapping).forEach(tag => {
      if (mapping[tag] === typeId) delete mapping[tag];
    });
    await game.settings.set("npc-tags", "tagMapping", mapping);

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
