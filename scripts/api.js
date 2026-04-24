import { openTagEditor } from "./dialogs.js";

export async function openTagEditorAPI() {
  const controlledTokens = canvas.tokens?.controlled || [];
  
  if (controlledTokens.length === 0) {
    ui.notifications.warn(game.i18n.localize("npc-tags.notifications.noTokensSelected"));
    return;
  }

  const actors = [];
  for (const token of controlledTokens) {
    if (token.actor) {
      actors.push(token.actor);
    }
  }

  if (actors.length === 0) {
    ui.notifications.warn(game.i18n.localize("npc-tags.notifications.noActorFound"));
    return;
  }

  await openTagEditor(actors);
}

export async function openTagEditorForActor(actor) {
  await openTagEditor([actor]);
}

export { openTagEditor };