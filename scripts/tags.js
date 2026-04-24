const FLAG_SCOPE = "npc-tags";
const FLAG_KEY = "tags";

export function normalizeTag(input) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

export function parseTags(input) {
  const rawTags = input.split(/\s+/).filter(t => t.length > 0);
  const normalizedTags = rawTags.map(normalizeTag).filter(t => t.length > 0);
  return [...new Set(normalizedTags)];
}

export function getActorTags(actor) {
  return actor.getFlag(FLAG_SCOPE, FLAG_KEY) || [];
}

export async function setActorTags(actor, tags) {
  const cleanTags = [...new Set(tags)];
  if (cleanTags.length === 0) {
    await actor.unsetFlag(FLAG_SCOPE, FLAG_KEY);
  } else {
    await actor.setFlag(FLAG_SCOPE, FLAG_KEY, cleanTags);
  }
}

export async function addTagsToActor(actor, newTagsInput) {
  const currentTags = getActorTags(actor);
  const newTags = parseTags(newTagsInput);
  const allTags = [...new Set([...currentTags, ...newTags])];
  await setActorTags(actor, allTags);
}

export async function removeTagFromActor(actor, tagToRemove) {
  const currentTags = getActorTags(actor);
  const normalized = normalizeTag(tagToRemove);
  const filtered = currentTags.filter(t => t !== normalized);
  await setActorTags(actor, filtered);
}

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

export async function setTagsOnActors(actors, tagsInput) {
  const newTags = parseTags(tagsInput);
  for (const actor of actors) {
    await setActorTags(actor, newTags);
  }
}