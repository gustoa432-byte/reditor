import { UniverseData } from '../types';
import { initialUniverseData } from '../data/initialUniverse';

const STORAGE_KEY = 'redcrow_3000_universe_data_v3';

export function loadUniverseData(): UniverseData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveUniverseData(initialUniverseData);
      return initialUniverseData;
    }
    const parsed = JSON.parse(raw);
    // Basic schema check
    if (!parsed.entities || !parsed.projects) {
      return initialUniverseData;
    }
    return parsed;
  } catch (err) {
    console.warn('Failed to load universe from localStorage, using initial data:', err);
    return initialUniverseData;
  }
}

export function saveUniverseData(data: UniverseData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save universe to localStorage:', err);
  }
}

export function resetUniverseToDefault(): UniverseData {
  saveUniverseData(initialUniverseData);
  return initialUniverseData;
}

export function exportUniverseAsJSON(data: UniverseData): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('download', `REDCROW_3000_Universe_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportManuscriptAsMarkdown(data: UniverseData, projectId?: string): void {
  const project = data.projects.find(p => p.id === (projectId || data.activeProjectId)) || data.projects[0];
  if (!project) return;

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
