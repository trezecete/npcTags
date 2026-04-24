const FLAG_SCOPE = "npc-tags";
const FLAG_KEY = "tags";

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

function getTagsHtml(allTags) {
  if (allTags.length === 0) {
    return '<p class="no-tags">Nenhuma tag ainda</p>';
  }
  const tags = allTags.map(t => `<span class="tag">${t}</span>`).join("");
  return `<div class="tags-list">${tags}</div>`;
}

async function openTagEditor(actors) {
  if (!actors || actors.length === 0) {
    ui.notifications.warn("Selecione tokens na scene primeiro");
    return;
  }

  const multiple = actors.length > 1;
  const currentTags = getTagsFromActors(actors);
  const tagsDisplay = getTagsHtml(currentTags);
  
  const title = multiple 
    ? `Editar Tags (${actors.length} actors)` 
    : `Editar Tags: ${actors[0].name}`;

  const d = new Dialog({
    title: title,
    content: `
      <form>
        <div class="form-group">
          <label>Tags Atuais (${currentTags.length})</label>
          ${tagsDisplay}
        </div>
        <div class="form-group">
          <label>Nova Tag</label>
          <input type="text" name="tags" placeholder="Digite tags separadas por espaco" style="width: 100%;" />
        </div>
      </form>
    `,
    buttons: {
      save: {
        label: "Salvar",
        icon: '<i class="fas fa-check"></i>',
        callback: async (html) => {
          const input = html.find('input[name="tags"]');
          const tagsValue = input?.val() || "";
          await setTagsOnActors(actors, tagsValue);
        }
      },
      clear: {
        label: "Limpar Tags",
        icon: '<i class="fas fa-trash"></i>',
        callback: async () => {
          for (const actor of actors) {
            await setActorTags(actor, []);
          }
        }
      },
      cancel: {
        label: "Cancelar",
        icon: '<i class="fas fa-times"></i>'
      }
    },
    default: "save"
  });
  
  d.render(true);
}

async function openTagEditorFromTokens() {
  const controlledTokens = canvas.tokens?.controlled || [];
  if (controlledTokens.length === 0) {
    ui.notifications.warn("Nenhum token selecionado");
    return;
  }
  const actors = controlledTokens.map(t => t.actor).filter(a => a);
  if (actors.length === 0) {
    ui.notifications.warn("Nenhum actor encontrado");
    return;
  }
  await openTagEditor(actors);
}

async function openTagEditorForActor(actor) {
  await openTagEditor([actor]);
}

console.log("NPC Tags: Loading...");

Hooks.on("init", () => {
  game.modules.get("npc-tags").api = {
    openTagEditor: openTagEditorFromTokens,
    openTagEditorForActor: openTagEditorForActor
  };
  
  game.npcTags = {
    openTagEditorFromTokens,
    openTagEditorForActor
  };

  console.log("NPC Tags: API ready");

  Hooks.on("ActorsDirectoryContextMenu", (html, actors) => {
    actors.push({
      name: "Editar Tags...",
      icon: '<i class="fas fa-tag"></i>',
      callback: (actor) => openTagEditorForActor(actor)
    });
  });
});

console.log("NPC Tags loaded");