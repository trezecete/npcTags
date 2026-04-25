import { getAllActorTags } from "./tags.js";

/**
 * Retorna apenas os atores que o usuário atual pode ver (Observer ou Owner).
 */
export function getVisibleActors() {
  return game.actors.filter(actor => actor.testUserPermission(game.user, "OBSERVER"));
}

/**
 * Algoritmo simples de busca aproximada (Fuzzy).
 * Verifica se a query está contida na tag ou se a distância de edição é pequena.
 */
export function fuzzyMatch(query, tags) {
  if (!query) return true;
  const q = query.toLowerCase().trim();
  
  return tags.some(tag => {
    const t = tag.toLowerCase().trim();
    // Match exato ou contém
    if (t.includes(q) || q.includes(t)) return true;
    
    // Distância de Levenshtein simples para pequenas variações (erros de digitação)
    if (Math.abs(t.length - q.length) <= 2) {
        const distance = levenshteinDistance(t, q);
        return distance <= 2;
    }
    return false;
  });
}

function levenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[a.length][b.length];
}

/**
 * Realiza a busca baseada em múltiplos grupos de tags.
 * Cada grupo é um AND. Entre grupos é um OR.
 */
export function searchActors(queryGroups) {
  const allVisible = getVisibleActors();
  if (queryGroups.length === 0 || (queryGroups.length === 1 && queryGroups[0].length === 0)) {
    return allVisible;
  }

  const results = new Set();

  for (const group of queryGroups) {
    if (group.length === 0) continue;
    
    const groupMatches = allVisible.filter(actor => {
      const actorTags = getAllActorTags(actor);
      // Todos os termos do grupo devem bater (AND)
      return group.every(term => fuzzyMatch(term, actorTags));
    });

    groupMatches.forEach(a => results.add(a));
  }

  return Array.from(results);
}
