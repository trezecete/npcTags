import { searchActors } from "./gallery-logic.js";

export class TagGalleryApp extends Application {
  constructor(options = {}) {
    super(options);
    this.searchGroups = [[""]]; // Inicializa com um grupo vazio
    this.results = [];
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
    // Se não houver busca, mostra tudo (limitado por performance se necessário, mas Foundry aguenta bem algumas centenas)
    this.results = searchActors(this.searchGroups);

    return {
      groups: this.searchGroups.map((g, i) => ({ index: i, value: g.join(" ") })),
      actors: this.results.map(a => ({
        id: a.id,
        name: a.name,
        img: a.img || "icons/svg/mystery-man.svg"
      }))
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Busca ao digitar (debounce simples)
    html.find(".search-input").on("input", (event) => {
        const index = event.currentTarget.dataset.index;
        this.searchGroups[index] = event.currentTarget.value.split(/\s+/).filter(t => t);
        this._debouncedRefresh();
    });

    // Adicionar novo grupo de busca
    html.find(".add-group-btn").click(() => {
        this.searchGroups.push([""]);
        this.render();
    });

    // Remover grupo de busca
    html.find(".remove-group-btn").click((event) => {
        const index = event.currentTarget.dataset.index;
        this.searchGroups.splice(index, 1);
        if (this.searchGroups.length === 0) this.searchGroups = [[""]];
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
