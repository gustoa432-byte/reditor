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
