import { CodexEntity, EntityState, Scene } from '../types';

export interface SceneMetrics {
  wordCount: number;
  charCount: number;
  readingTimeMinutes: number;
  dialogueCount: number;
  dialoguePercentage: number;
  sensoryScore: number;
  detectedSensoryKeywords: string[];
}

export function analyzeSceneText(text: string): SceneMetrics {
  const clean = (text || '').trim();
  if (!clean) {
    return {
      wordCount: 0,
      charCount: 0,
      readingTimeMinutes: 0,
      dialogueCount: 0,
      dialoguePercentage: 0,
      sensoryScore: 0,
      detectedSensoryKeywords: []
    };
  }

  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = clean.length;
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  const dialogueLines = clean.match(/(?:^|\n)\s*—\s*[^\n]+/g) || [];
  const dialogueCount = dialogueLines.length;
  const dialogueWords = dialogueLines.join(' ').split(/\s+/).filter(Boolean).length;
  const dialoguePercentage = wordCount > 0 ? Math.min(100, Math.round((dialogueWords / wordCount) * 100)) : 0;

  const sensoryDict = [
    'свет', 'тьма', 'блеск', 'черный', 'синий', 'багровый', 'луч', 'тень',
    'звук', 'тишина', 'гул', 'звон', 'шорох', 'крик', 'эхо', 'шепот',
    'холод', 'жар', 'ветер', 'пепел', 'камень', 'вибрация', 'пульс', 'дрожь',
    'запах', 'озон', 'гарь', 'медь', 'дым'
  ];

  const lower = clean.toLowerCase();
  const detectedSensoryKeywords = sensoryDict.filter(kw => lower.includes(kw));
  const sensoryScore = Math.min(10, detectedSensoryKeywords.length * 2);

  return {
    wordCount,
    charCount,
    readingTimeMinutes,
    dialogueCount,
    dialoguePercentage,
    sensoryScore,
    detectedSensoryKeywords
  };
}

/**
 * Given an entity and a scene epoch/year string, locates the closest dynamic state in history
 */
export function getEntityStateForScene(entity: CodexEntity, sceneEpochYear?: string): EntityState | null {
  if (!entity.dynamicStates || entity.dynamicStates.length === 0) {
    return null;
  }

  if (!sceneEpochYear) {
    return entity.dynamicStates[0];
  }

  // Extract year number from sceneEpochYear if present
  const yearMatch = sceneEpochYear.match(/\b(2\d{3}|1\d{3})\b/);
  if (yearMatch) {
    const targetYear = parseInt(yearMatch[1], 10);
    // Find closest state where state.yearNum <= targetYear or closest absolute difference
    let bestState: EntityState | null = null;
    let minDiff = Infinity;

    for (const state of entity.dynamicStates) {
      if (state.yearNum !== undefined) {
        const diff = Math.abs(state.yearNum - targetYear);
        if (diff < minDiff) {
          minDiff = diff;
          bestState = state;
        }
      }
    }

    if (bestState) return bestState;
  }

  // Fallback to title substring match or first state
  const found = entity.dynamicStates.find(s =>
    sceneEpochYear.toLowerCase().includes(s.epochOrYear.toLowerCase().slice(0, 4))
  );

  return found || entity.dynamicStates[0];
}
