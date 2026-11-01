import { UniverseData } from '../types';
import { initialUniverseData } from '../data/initialUniverse';

const STORAGE_KEY = 'redcrow_3000_universe_data_v3';
const BACKUP_KEY = 'redcrow_3000_emergency_backup_v3';
const CURRENT_SCHEMA_VERSION = 3;
const SAFE_QUOTA_BYTES = 5 * 1024 * 1024; // 5 MB typical localStorage safe limit

export interface StorageStats {
  bytesUsed: number;
  kbUsed: number;
  mbUsed: number;
  percentQuota: number;
  isNearLimit: boolean; // > 80%
  hasEmergencyBackup: boolean;
  lastSavedAt?: string;
}

/**
 * Creates a brand new, empty universe with a clean project, act, chapter, and draft scene.
 * No demo entities, events, or hypotheses are included.
 */
export function createEmptyUniverse(name: string, tagline?: string): UniverseData {
  const timestamp = new Date().toISOString();
  const sceneId = `scene-${Date.now()}-1`;
  const chapterId = `ch-${Date.now()}-1`;
  const actId = `act-${Date.now()}-1`;
  const projectId = `proj-${Date.now()}-1`;

  return {
    id: `universe-${Date.now()}`,
    universeName: name.trim() || 'Новая вселенная',
    version: '1.0',
    tagline: tagline?.trim() || 'Авторский мир и литературные хроники',
    activeProjectId: projectId,
    activeSceneId: sceneId,
    entities: [],
    events: [],
    projects: [
      {
        id: projectId,
        title: name.trim() ? `${name.trim()}: Том I` : 'Книга I',
        synopsis: '',
        updatedAt: timestamp,
        storylines: [],
        acts: [
          {
            id: actId,
            title: 'Часть 1',
            order: 1,
            chapters: [
              {
                id: chapterId,
                title: 'Глава 1',
                order: 1,
                scenes: [
                  {
                    id: sceneId,
                    title: 'Сцена 1. Начало',
                    order: 1,
                    status: 'draft',
                    wordCount: 0,
                    updatedAt: timestamp,
                    revisions: [],
                    passport: {
                      participatingCharacterIds: [],
                      characterGoal: '',
                      conflictObstacle: '',
                      initialState: '',
                      finalState: '',
                      relationshipShift: '',
                      newInformationRevealed: '',
                      dramaticTurn: '',
                      hook: '',
                      sceneFunction: '',
                      storylineIds: [],
                      polarity: 0,
                      epochYear: ''
                    },
                    text: ''
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    hypotheses: [],
    decisions: [],
    questions: [],
    consistencyIssues: []
  };
}

/**
 * Migrates and validates raw stored data to prevent silent data loss.
 * Preserves user's empty arrays and custom data without injecting demo values.
 */
export function migrateAndValidateUniverse(parsed: any): UniverseData {
  if (!parsed || typeof parsed !== 'object') {
    return initialUniverseData;
  }

  // Handle wrapped export files that contain { schemaVersion, data }
  const raw = parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;

  const isCustomOrExplicit = Boolean(
    raw.universeName !== undefined ||
    raw.id !== undefined ||
    Array.isArray(raw.projects) ||
    Array.isArray(raw.entities)
  );

  if (!isCustomOrExplicit) {
    return initialUniverseData;
  }

  const projects = Array.isArray(raw.projects) ? raw.projects : [];
  const activeProjectId = typeof raw.activeProjectId === 'string' && raw.activeProjectId
    ? raw.activeProjectId
    : (projects[0]?.id || 'project-1');

  const universe: UniverseData = {
    id: typeof raw.id === 'string' ? raw.id : `universe-${Date.now()}`,
    universeName: typeof raw.universeName === 'string' ? raw.universeName : 'Моя Вселенная',
    version: typeof raw.version === 'string' ? raw.version : '1.0',
    tagline: typeof raw.tagline === 'string' ? raw.tagline : '',
    activeProjectId,
    activeSceneId: typeof raw.activeSceneId === 'string' ? raw.activeSceneId : projects[0]?.acts?.[0]?.chapters?.[0]?.scenes?.[0]?.id,
    entities: Array.isArray(raw.entities) ? raw.entities : [],
    events: Array.isArray(raw.events) ? raw.events : [],
    projects,
    hypotheses: Array.isArray(raw.hypotheses) ? raw.hypotheses : [],
    decisions: Array.isArray(raw.decisions) ? raw.decisions : [],
    questions: Array.isArray(raw.questions) ? raw.questions : [],
    consistencyIssues: Array.isArray(raw.consistencyIssues) ? raw.consistencyIssues : []
  };

  return universe;
}

export function loadUniverseData(): UniverseData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveUniverseData(initialUniverseData);
      return initialUniverseData;
    }

    const parsed = JSON.parse(raw);
    const validated = migrateAndValidateUniverse(parsed);
    return validated;
  } catch (err) {
    console.error('Critical: Failed to parse localStorage data, attempting emergency backup:', err);
    // Safety: never silently discard corrupted data. Back it up to emergency key!
    try {
      const rawCorrupt = localStorage.getItem(STORAGE_KEY);
      if (rawCorrupt) {
        localStorage.setItem(`redcrow_corrupt_${Date.now()}`, rawCorrupt);
      }
      // Check if emergency backup exists
      const backupRaw = localStorage.getItem(BACKUP_KEY);
      if (backupRaw) {
        return migrateAndValidateUniverse(JSON.parse(backupRaw));
      }
    } catch (innerErr) {
      console.error('Emergency recovery attempt failed:', innerErr);
    }
    return initialUniverseData;
  }
}

export function saveUniverseData(data: UniverseData): void {
  try {
    const json = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, json);

    // Save emergency backup asynchronously
    try {
      localStorage.setItem(BACKUP_KEY, json);
    } catch {
      // ignore backup quota error
    }
  } catch (err: any) {
    console.error('Failed to save universe to localStorage (possible quota exceeded):', err);
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      window.dispatchEvent(
        new CustomEvent('redcrow-storage-quota-warning', {
          detail: { message: 'Хранилище браузера переполнено! Пожалуйста, экспортируйте резервную копию (JSON).' }
        })
      );
    }
  }
}

export function getStorageStats(): StorageStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '';
    const bytesUsed = new Blob([raw]).size;
    const kbUsed = Math.round(bytesUsed / 1024);
    const mbUsed = parseFloat((bytesUsed / (1024 * 1024)).toFixed(2));
    const percentQuota = Math.min(100, Math.round((bytesUsed / SAFE_QUOTA_BYTES) * 100));
    const isNearLimit = percentQuota >= 80;
    const hasEmergencyBackup = Boolean(localStorage.getItem(BACKUP_KEY));

    return {
      bytesUsed,
      kbUsed,
      mbUsed,
      percentQuota,
      isNearLimit,
      hasEmergencyBackup,
      lastSavedAt: new Date().toLocaleTimeString()
    };
  } catch {
    return {
      bytesUsed: 0,
      kbUsed: 0,
      mbUsed: 0,
      percentQuota: 0,
      isNearLimit: false,
      hasEmergencyBackup: false
    };
  }
}

export function getEmergencyBackup(): UniverseData | null {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) return null;
    return migrateAndValidateUniverse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function resetUniverseToDefault(): UniverseData {
  saveUniverseData(initialUniverseData);
  return initialUniverseData;
}

export function exportUniverseAsJSON(data: UniverseData): void {
  const exportPayload = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    generator: 'REDCROW 3000 Universe Manager',
    data
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(exportPayload, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  const dateStr = new Date().toISOString().slice(0, 10);
  const safeName = (data.universeName || 'Universe').trim().replace(/[\s/:\\*?"<>|]+/g, '_');
  downloadAnchor.setAttribute('download', `${safeName}_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportManuscriptAsMarkdown(data: UniverseData, projectId?: string): void {
  const project = data.projects.find(p => p.id === (projectId || data.activeProjectId)) || data.projects[0];
  if (!project || !Array.isArray(project.acts)) return;

  let md = `# ${project.title}\n\n`;
  md += `> **Синопсис:** ${project.synopsis}\n\n---\n\n`;

  project.acts.forEach(act => {
    md += `## ${act.title}\n\n`;
    act.chapters.forEach(ch => {
      md += `### ${ch.title}\n\n`;
      ch.scenes.forEach(scene => {
        md += `#### ${scene.title}\n\n`;
        if (scene.passport.povCharacterId) {
          const povChar = data.entities.find(e => e.id === scene.passport.povCharacterId);
          md += `*POV:* ${povChar ? povChar.title : scene.passport.povCharacterId} | *Время:* ${scene.passport.epochYear || 'Не указано'}\n\n`;
        }
        md += `${scene.text}\n\n---\n\n`;
      });
    });
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.title.replace(/[\s:]+/g, '_')}_Manuscript.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
