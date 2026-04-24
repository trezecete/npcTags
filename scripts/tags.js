const FLAG_SCOPE = "npc-tags";
const FLAG_KEY = "tags";

/**
 * Normaliza uma string para ser usada como tag.
 * Remove acentos, caracteres especiais e converte para minúsculas.
 */
export function normalizeTag(input) {
  if (!input) return "";
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

/**
 * Converte uma string de entrada em um array de tags únicas e normalizadas.
 */
export function parseTags(input) {
  if (!input) return [];
  // Divide por espaços ou vírgulas
  const rawTags = input.split(/[\s,]+/).filter(t => t.length > 0);
  const normalizedTags = rawTags.map(normalizeTag).filter(t => t.length > 0);
  return [...new Set(normalizedTags)];
}

/**
 * Retorna as tags de um ator.
 */
export function getActorTags(actor) {
  if (!actor) return [];
  return actor.getFlag(FLAG_SCOPE, FLAG_KEY) || [];
}

/**
 * Define as tags de um ator, removendo duplicatas e limpando o flag se estiver vazio.
 */
export async function setActorTags(actor, tags) {
  if (!actor) return;
  const cleanTags = [...new Set(tags.map(normalizeTag))].filter(t => t.length > 0).sort();
  
  if (cleanTags.length === 0) {
    await actor.unsetFlag(FLAG_SCOPE, FLAG_KEY);
  } else {
    await actor.setFlag(FLAG_SCOPE, FLAG_KEY, cleanTags);
  }
  
  // Trigger directory re-render to update search index
  ui.actors.render();
}

/**
 * Adiciona novas tags a um ator sem remover as existentes.
 */
export async function addTagsToActor(actor, newTagsInput) {
  const currentTags = getActorTags(actor);
  const newTags = parseTags(newTagsInput);
  await setActorTags(actor, [...currentTags, ...newTags]);
}

/**
 * Remove uma tag específica de um ator.
 */
export async function removeTagFromActor(actor, tagToRemove) {
  const currentTags = getActorTags(actor);
  const normalized = normalizeTag(tagToRemove);
  const filtered = currentTags.filter(t => t !== normalized);
  await setActorTags(actor, filtered);
}

/**
 * Retorna todas as tags únicas de um grupo de atores.
 */
export function getTagsFromActors(actors) {
  const allTags = new Set();
  for (const actor of actors) {
    const tags = getActorTags(actor);
    for (const tag of tags) {
      allTags.add(tag);
    }
  }
  return [...allTags].sort();
}

/**
 * Define as mesmas tags para todos os atores selecionados (Sobrescreve).
 */
export async function setTagsOnActors(actors, tagsInput) {
  const newTags = parseTags(tagsInput);
  for (const actor of actors) {
    await setActorTags(actor, newTags);
  }
}

/**
 * Retorna as tags "travadas" (ex: baseadas no nome).
 */
export function getLockedTags(actor) {
  if (!actor) return [];
  // Gera tags baseadas no nome do ator
  return parseTags(actor.name);
}

/**
 * Retorna as tags "travadas" de um grupo de atores (União).
 */
export function getLockedTagsFromActors(actors) {
  const allLocked = new Set();
  for (const actor of actors) {
    const locked = getLockedTags(actor);
    for (const tag of locked) {
      allLocked.add(tag);
    }
  }
  return [...allLocked].sort();
}

/**
 * Retorna todas as tags de um ator (normais + travadas).
 */
export function getAllActorTags(actor) {
  const normal = getActorTags(actor);
  const locked = getLockedTags(actor);
  return [...new Set([...normal, ...locked])].sort();
}

/**
 * Retorna a cor de uma tag baseada no seu tipo.
 */
export function getTagColor(tagName) {
  const mapping = game.settings.get("npc-tags", "tagMapping");
  const typeId = mapping[tagName];
  if (!typeId) return null;

  const types = game.settings.get("npc-tags", "tagTypes");
  const type = types.find(t => t.id === typeId);
  return type ? type.color : null;
}

/**
 * Retorna o ID do tipo de uma tag.
 */
export function getTagType(tagName) {
  const mapping = game.settings.get("npc-tags", "tagMapping");
  return mapping[tagName] || "default";
}

/**
 * Define o tipo de uma tag globalmente.
 */
export async function setTagType(tagName, typeId) {
  const mapping = game.settings.get("npc-tags", "tagMapping");
  if (typeId === "default") {
    delete mapping[tagName];
  } else {
    mapping[tagName] = typeId;
  }
  await game.settings.set("npc-tags", "tagMapping", mapping);
}

/**
 * Retorna todas as tags existentes no mundo.
 */
export function getAllWorldTags() {
  const allTags = new Set();
  for (const actor of game.actors) {
    const tags = getAllActorTags(actor);
    tags.forEach(t => allTags.add(t));
  }
  return [...allTags].sort();
}