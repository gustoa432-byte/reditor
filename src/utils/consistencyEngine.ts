import { ConsistencyIssue, UniverseData } from '../types';

export function runConsistencyCheck(universe: UniverseData): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];

  // Map of existing manual/saved intentional overrides
  const existingMap = new Map<string, ConsistencyIssue>();
  universe.consistencyIssues.forEach(issue => {
    existingMap.set(issue.id, issue);
  });

  // 1. Check Events vs Character Lifespans / Bounds
  universe.events.forEach(evt => {
    const evtYear = evt.actualTime.yearNum;
    if (evtYear !== undefined) {
      evt.participatingEntityIds.forEach(entityId => {
        const entity = universe.entities.find(e => e.id === entityId);
        if (entity && entity.type === 'character' && entity.timeBound?.yearNum !== undefined) {
          // If character was created/born AFTER the event
          if (entity.timeBound.yearNum > evtYear) {
            const id = `issue-temp-${evt.id}-${entity.id}`;
            const existing = existingMap.get(id);
            issues.push(
              existing || {
                id,
                severity: 'high',
                category: 'temporal',
                title: `Персонаж «${entity.title}» участвует в событии до своего появления`,
                description: `Событие «${evt.title}» датировано ${evt.actualTime.yearNum} г., в то время как «${entity.title}» появляется лишь в ${entity.timeBound.yearNum} г.`,
                affectedEntityIds: [entity.id],
                affectedSceneIds: [],
                isIntentional: false
              }
            );
          }
        }
      });
    }
  });

  // 2. Check Scenes vs Participating Characters & Locations
  universe.projects.forEach(proj => {
    proj.acts.forEach(act => {
      act.chapters.forEach(ch => {
        ch.scenes.forEach(scene => {
          // Check if POV character is missing from participating characters
          if (
            scene.passport.povCharacterId &&
            !scene.passport.participatingCharacterIds.includes(scene.passport.povCharacterId)
          ) {
            const id = `issue-pov-${scene.id}`;
            const existing = existingMap.get(id);
            issues.push(
              existing || {
                id,
                severity: 'low',
                category: 'storyline',
                title: `POV персонаж не указан в участниках сцены «${scene.title}»`,
                description: `В сцене «${scene.title}» точка зрения (POV) закреплена за персонажем, но он отсутствует в списке участников.`,
                affectedEntityIds: [scene.passport.povCharacterId],
                affectedSceneIds: [scene.id],
                isIntentional: false
              }
            );
          }

          // Check if scene has unresolved extreme negative polarity with no hook
          if (scene.passport.polarity <= -2 && !scene.passport.hook) {
            const id = `issue-hook-${scene.id}`;
            const existing = existingMap.get(id);
            issues.push(
              existing || {
                id,
                severity: 'medium',
                category: 'storyline',
                title: `Глубокий драматургический провал без крючка в сцене «${scene.title}»`,
                description: `Сцена имеет полярность -2 (тяжелый кризис), но поле «Сюжетный крючок» не заполнено, что может вызвать спад читательского темпа.`,
                affectedEntityIds: [],
                affectedSceneIds: [scene.id],
                isIntentional: false
              }
            );
          }
        });
      });
    });
  });

  // Preserve any previously logged intentional issues from initial dataset
  universe.consistencyIssues.forEach(oldIssue => {
    if (!issues.some(i => i.id === oldIssue.id)) {
      issues.push(oldIssue);
    }
  });

  return issues;
}
