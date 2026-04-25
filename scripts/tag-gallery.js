import { searchActors } from "./gallery-logic.js";

export class TagGalleryApp extends Application {
  constructor(options = {}) {
    super(options);
    this.searchGroups = [[]]; // Cada grupo é um array de strings (tags)
    this.results = [];
    this.focusedGroupIndex = null;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "npc-tags-gallery",
      title: "Galeria de Atores (NPC Tags)",
      template: "modules/npc-tags/templates/tag-gallery.hbs",
      width: 900,
      height: 700,
      resizable: true,
      classes: ["npc-tags-dialog", "tag-gallery-app"]
    });
  }

  async getData() {
    // Realiza a busca
    this.results = searchActors(this.searchGroups);

    return {
      groups: this.searchGroups.map((tags, i) => ({ 
          index: i, 
          tags: tags 
      })),
      actors: this.results.map(a => ({
        id: a.id,
        name: a.name,
        img: a.img || "icons/svg/mystery-man.svg"
      }))
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Re-focar no input correto após o render
    if (this.focusedGroupIndex !== null) {
        html.find(`.search-input[data-index="${this.focusedGroupIndex}"]`).focus();
    }

    // Adicionar tag ao grupo via Espaço ou Enter
    html.find(".search-input").on("keydown", (event) => {
        if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            const val = event.currentTarget.value.trim();
            if (val) {
                const index = event.currentTarget.dataset.index;
                if (!this.searchGroups[index].includes(val)) {
                    this.searchGroups[index].push(val);
                    this.focusedGroupIndex = index;
                    this.render();
                }
                event.currentTarget.value = "";
            }
        }
    });

    // Guardar qual input está sendo usado
    html.find(".search-input").on("focus", (event) => {
        this.focusedGroupIndex = event.currentTarget.dataset.index;
    });

    // Remover tag individual de um grupo
    html.find(".remove-search-tag").click((event) => {
        const groupIndex = event.currentTarget.dataset.groupIndex;
        const tag = event.currentTarget.dataset.tag;
        this.searchGroups[groupIndex] = this.searchGroups[groupIndex].filter(t => t !== tag);
        this.focusedGroupIndex = groupIndex;
        this.render();
    });

    // Adicionar novo grupo de busca
    html.find(".add-group-btn").click(() => {
        this.searchGroups.push([]);
        this.focusedGroupIndex = this.searchGroups.length - 1;
        this.render();
    });

    // Remover grupo de busca inteiro
    html.find(".remove-group-btn").click((event) => {
        const index = event.currentTarget.dataset.index;
        this.searchGroups.splice(index, 1);
        if (this.searchGroups.length === 0) this.searchGroups = [[]];
        this.focusedGroupIndex = null;
        this.render();
    });

    // Abrir Actor no duplo clique
    html.find(".actor-card").dblclick(event => {
        const actorId = event.currentTarget.dataset.actorId;
        const actor = game.actors.get(actorId);
        if (actor) actor.sheet.render(true);
    });
  }

  _debouncedRefresh() {
    if (this._timeout) clearTimeout(this._timeout);
    this._timeout = setTimeout(() => this.render(), 300);
  }
}
