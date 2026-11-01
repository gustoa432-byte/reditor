import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeSceneText, getEntityStateForScene } from './dramaturgyEngine';
import { runConsistencyCheck } from './consistencyEngine';
import { initialUniverseData } from '../data/initialUniverse';

test('analyzeSceneText computes accurate word count, dialogue, and sensory metrics', () => {
  const sample = `Камень остывал медленнее, чем положено базальту.
— Протокол «Возвращение», — произнесла она вслух.
Тишина и холодный ветер пахли озоном и жженой медью.`;

  const metrics = analyzeSceneText(sample);
  assert.ok(metrics.wordCount >= 18, `Expected word count >= 18, got ${metrics.wordCount}`);
  assert.equal(metrics.dialogueCount, 1);
  assert.ok(metrics.detectedSensoryKeywords.includes('камень'));
  assert.ok(metrics.detectedSensoryKeywords.includes('ветер'));
  assert.ok(metrics.detectedSensoryKeywords.includes('медь'));
  assert.ok(metrics.sensoryScore > 0);
});

test('getEntityStateForScene selects the exact historical dynamic state for an epoch', () => {
  const felicia = initialUniverseData.entities.find(e => e.id === 'char-felicia');
  assert.ok(felicia, 'Felicia must exist in initial data');

  // Year 2450 should pick the disaster state
  const state2450 = getEntityStateForScene(felicia, '2450 г. (Эпоха Катастрофы)');
  assert.ok(state2450, 'State for 2450 should be resolved');
  assert.equal(state2450.id, 'state-felicia-2450');
  assert.ok(state2450.title.includes('хранительница Чёрного острова'));

  // Year 2890 should pick the late new order state
  const state2890 = getEntityStateForScene(felicia, '2890 г. (Эпоха Нового Порядка)');
  assert.ok(state2890, 'State for 2890 should be resolved');
  assert.equal(state2890.id, 'state-felicia-2890');
});

test('runConsistencyCheck preserves intentional author annotations and identifies issues', () => {
  const issues = runConsistencyCheck(initialUniverseData);
  assert.ok(issues.length >= 2, 'Should contain at least initial logged issues');

  const issue2 = issues.find(i => i.id === 'issue-2');
  assert.ok(issue2, 'Issue 2 should be preserved');
  assert.equal(issue2.isIntentional, true);
  assert.equal(issue2.intentReason, 'character_lie');
});

test('createEmptyUniverse creates a clean slate with zero demo entities or events', async () => {
  const { createEmptyUniverse } = await import('./storage');

  const emptyWorld = createEmptyUniverse('Сага о Стальной Долине', 'Хроники горных кланов');
  assert.equal(emptyWorld.universeName, 'Сага о Стальной Долине');
  assert.equal(emptyWorld.tagline, 'Хроники горных кланов');

  // Verify minimal manuscript structure exists
  assert.equal(emptyWorld.projects.length, 1);
  const proj = emptyWorld.projects[0];
  assert.equal(proj.acts.length, 1);
  assert.equal(proj.acts[0].chapters.length, 1);
  assert.equal(proj.acts[0].chapters[0].scenes.length, 1);
  const scene = proj.acts[0].chapters[0].scenes[0];
  assert.equal(scene.status, 'draft');
  assert.equal(scene.text, '');
  assert.equal(emptyWorld.activeProjectId, proj.id);
  assert.equal(emptyWorld.activeSceneId, scene.id);

  // CRITICAL: Verify ZERO demo entities, events, or hypotheses leak into the new universe
  assert.deepEqual(emptyWorld.entities, []);
  assert.deepEqual(emptyWorld.events, []);
  assert.deepEqual(emptyWorld.questions, []);
  assert.deepEqual(emptyWorld.hypotheses, []);
  assert.deepEqual(emptyWorld.decisions, []);
  assert.deepEqual(emptyWorld.consistencyIssues, []);
});

test('migrateAndValidateUniverse strictly preserves user empty arrays without demo leakage', async () => {
  const { migrateAndValidateUniverse } = await import('./storage');

  // An author's universe with intentionally empty codex and events
  const customEmpty = {
    schemaVersion: 3,
    data: {
      id: 'author-custom-empty-world',
      universeName: 'Мир Магии',
      entities: [], // Explicitly empty
      events: [],   // Explicitly empty
      questions: [],
      projects: [{
        id: 'proj-1',
        title: 'Первая Книга',
        synopsis: '',
        genre: 'Фэнтези',
        storylines: [],
        acts: []
      }]
    }
  };

  const validated = migrateAndValidateUniverse(customEmpty);
  assert.equal(validated.universeName, 'Мир Магии');
  assert.equal(validated.entities.length, 0, 'Entities array must remain empty');
  assert.equal(validated.events.length, 0, 'Events array must remain empty');
  assert.equal(validated.questions.length, 0, 'Questions array must remain empty');
  assert.equal(validated.projects.length, 1);
  assert.equal(validated.projects[0].title, 'Первая Книга');
});

