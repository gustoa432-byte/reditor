import test from 'node:test';
import assert from 'node:assert/strict';
import { initialUniverseData } from '../data/initialUniverse';
import {
  softDeleteScene,
  softDeleteChapter,
  softDeleteEntity,
  softDeleteEvent,
  softDeleteQuestion,
  restoreTrashItem,
  permanentlyDeleteTrashItem,
  emptyTrash
} from './universeOps';

test('softDeleteScene moves scene to trash and updates activeSceneId', () => {
  const initial = JSON.parse(JSON.stringify(initialUniverseData));
  const activeSceneId = initial.projects[0].acts[0].chapters[0].scenes[0].id;
  const targetScene = initial.projects[0].acts[0].chapters[0].scenes[0];

  const withDeleted = softDeleteScene({ ...initial, activeSceneId }, targetScene.id);

  // Scene should no longer be in chapter
  const existsInChapter = withDeleted.projects[0].acts[0].chapters[0].scenes.some((s: any) => s.id === targetScene.id);
  assert.equal(existsInChapter, false);

  // Trash must contain item
  assert.equal(withDeleted.trash?.length, 1);
  const trashItem = withDeleted.trash![0];
  assert.equal(trashItem.originalId, targetScene.id);
  assert.equal(trashItem.itemType, 'scene');
  assert.equal(trashItem.title, targetScene.title);

  // Active scene id must be updated or valid
  assert.notEqual(withDeleted.activeSceneId, targetScene.id);

  // Restore scene
  const restored = restoreTrashItem(withDeleted, trashItem.id);
  assert.equal(restored.trash?.length, 0);
  const existsAfterRestore = restored.projects[0].acts[0].chapters[0].scenes.some((s: any) => s.id === targetScene.id);
  assert.equal(existsAfterRestore, true);
  assert.equal(restored.activeSceneId, targetScene.id);
});

test('softDeleteEntity moves codex entity to trash and allows restore and permanent deletion', () => {
  const initial = JSON.parse(JSON.stringify(initialUniverseData));
  const entityToDelete = initial.entities[0];

  const withDeleted = softDeleteEntity(initial, entityToDelete.id);
  assert.equal(withDeleted.entities.some((e: any) => e.id === entityToDelete.id), false);
  assert.equal(withDeleted.trash?.length, 1);
  assert.equal(withDeleted.trash![0].itemType, 'entity');

  // Permanently delete from trash
  const purged = permanentlyDeleteTrashItem(withDeleted, withDeleted.trash![0].id);
  assert.equal(purged.trash?.length, 0);
  assert.equal(purged.entities.some((e: any) => e.id === entityToDelete.id), false);
});

test('emptyTrash wipes all trash items', () => {
  const initial = JSON.parse(JSON.stringify(initialUniverseData));
  let state = softDeleteEntity(initial, initial.entities[0].id);
  state = softDeleteEvent(state, state.events[0].id);
  assert.equal(state.trash?.length, 2);

  const cleared = emptyTrash(state);
  assert.equal(cleared.trash?.length, 0);
});
