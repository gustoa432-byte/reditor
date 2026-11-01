import {
  UniverseData,
  TrashItem,
  TrashItemType,
  Scene,
  Chapter,
  Act,
  CodexEntity,
  WorldEvent,
  UnresolvedQuestion,
  LabHypothesis,
  ManuscriptProject
} from '../types';

/**
 * Generate a unique ID for trash tracking
 */
export function generateTrashId(): string {
  return `trash-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Move a Scene to trash (soft delete)
 */
export function softDeleteScene(universe: UniverseData, sceneId: string): UniverseData {
  let foundScene: Scene | null = null;
  let parentChapterTitle = '';
  let parentChapterId = '';
  let actTitle = '';
  let nextActiveSceneId: string | undefined = universe.activeSceneId;

  const updatedProjects: ManuscriptProject[] = universe.projects.map(proj => ({
    ...proj,
    acts: proj.acts.map(act => ({
      ...act,
      chapters: act.chapters.map(chapter => {
        const targetScene = chapter.scenes.find(s => s.id === sceneId);
        if (targetScene) {
          foundScene = targetScene;
          parentChapterTitle = chapter.title;
          parentChapterId = chapter.id;
          actTitle = act.title;
          return {
            ...chapter,
            scenes: chapter.scenes.filter(s => s.id !== sceneId)
          };
        }
        return chapter;
      })
    }))
  }));

  if (!foundScene) return universe;

  // If the deleted scene was currently active, switch to another available scene
  if (universe.activeSceneId === sceneId) {
    const allRemainingScenes: Scene[] = [];
    for (const p of updatedProjects) {
      for (const a of p.acts) {
        for (const c of a.chapters) {
          allRemainingScenes.push(...c.scenes);
        }
      }
    }
    nextActiveSceneId = allRemainingScenes.length > 0 ? allRemainingScenes[0].id : undefined;
  }

  const trashItem: TrashItem = {
    id: generateTrashId(),
    originalId: sceneId,
    itemType: 'scene',
    title: (foundScene as Scene).title || 'Безымянная сцена',
    deletedAt: new Date().toISOString(),
    parentTitle: parentChapterTitle,
    parentId: parentChapterId,
    originalPath: `${actTitle} > ${parentChapterTitle}`,
    payload: foundScene
  };

  return {
    ...universe,
    projects: updatedProjects,
    activeSceneId: nextActiveSceneId,
    trash: [trashItem, ...(universe.trash || [])]
  };
}

/**
 * Move a Chapter (and all contained scenes) to trash
 */
export function softDeleteChapter(universe: UniverseData, chapterId: string): UniverseData {
  let foundChapter: Chapter | null = null;
  let parentActTitle = '';
  let parentActId = '';

  const updatedProjects: ManuscriptProject[] = universe.projects.map(proj => ({
    ...proj,
    acts: proj.acts.map(act => {
      const targetChapter = act.chapters.find(c => c.id === chapterId);
      if (targetChapter) {
        foundChapter = targetChapter;
        parentActTitle = act.title;
        parentActId = act.id;
        return {
          ...act,
          chapters: act.chapters.filter(c => c.id !== chapterId)
        };
      }
      return act;
    })
  }));

  if (!foundChapter) return universe;

  // Check if activeSceneId was inside this chapter
  let nextActiveSceneId = universe.activeSceneId;
  const deletedSceneIds = new Set((foundChapter as Chapter).scenes.map(s => s.id));
  if (universe.activeSceneId && deletedSceneIds.has(universe.activeSceneId)) {
    const allRemainingScenes: Scene[] = [];
    for (const p of updatedProjects) {
      for (const a of p.acts) {
        for (const c of a.chapters) {
          allRemainingScenes.push(...c.scenes);
        }
      }
    }
    nextActiveSceneId = allRemainingScenes.length > 0 ? allRemainingScenes[0].id : undefined;
  }

  const trashItem: TrashItem = {
    id: generateTrashId(),
    originalId: chapterId,
    itemType: 'chapter',
    title: (foundChapter as Chapter).title || 'Безымянная глава',
    deletedAt: new Date().toISOString(),
    parentTitle: parentActTitle,
    parentId: parentActId,
    originalPath: parentActTitle,
    payload: foundChapter
  };

  return {
    ...universe,
    projects: updatedProjects,
    activeSceneId: nextActiveSceneId,
    trash: [trashItem, ...(universe.trash || [])]
  };
}

/**
 * Move an Act to trash
 */
export function softDeleteAct(universe: UniverseData, actId: string): UniverseData {
  let foundAct: Act | null = null;
  let parentProjId = '';

  const updatedProjects: ManuscriptProject[] = universe.projects.map(proj => {
    const targetAct = proj.acts.find(a => a.id === actId);
    if (targetAct) {
      foundAct = targetAct;
      parentProjId = proj.id;
      return {
        ...proj,
        acts: proj.acts.filter(a => a.id !== actId)
      };
    }
    return proj;
  });

  if (!foundAct) return universe;

  const trashItem: TrashItem = {
    id: generateTrashId(),
    originalId: actId,
    itemType: 'act',
    title: (foundAct as Act).title || 'Безымянный акт',
    deletedAt: new Date().toISOString(),
    parentId: parentProjId,
    originalPath: universe.projects.find(p => p.id === parentProjId)?.title || 'Проект',
    payload: foundAct
  };

  return {
    ...universe,
    projects: updatedProjects,
    trash: [trashItem, ...(universe.trash || [])]
  };
}

/**
 * Move a Codex Entity to trash
 */
export function softDeleteEntity(universe: UniverseData, entityId: string): UniverseData {
  const entity = universe.entities.find(e => e.id === entityId);
  if (!entity) return universe;

  const trashItem: TrashItem = {
    id: generateTrashId(),
    originalId: entityId,
    itemType: 'entity',
    title: entity.title || 'Безымянная сущность',
    deletedAt: new Date().toISOString(),
    originalPath: `База знаний (${entity.type})`,
    payload: entity
  };

  return {
    ...universe,
    entities: universe.entities.filter(e => e.id !== entityId),
    trash: [trashItem, ...(universe.trash || [])]
  };
}

/**
 * Move a Timeline Event to trash
 */
export function softDeleteEvent(universe: UniverseData, eventId: string): UniverseData {
  const event = universe.events.find(e => e.id === eventId);
  if (!event) return universe;

  const trashItem: TrashItem = {
    id: generateTrashId(),
    originalId: eventId,
    itemType: 'event',
    title: event.title || 'Безымянное событие',
    deletedAt: new Date().toISOString(),
    originalPath: `Хронология (${event.actualTime?.display || 'Время'})`,
    payload: event
  };

  return {
    ...universe,
    events: universe.events.filter(e => e.id !== eventId),
    trash: [trashItem, ...(universe.trash || [])]
  };
}

/**
 * Move an Unresolved Question to trash
 */
export function softDeleteQuestion(universe: UniverseData, questionId: string): UniverseData {
  const question = universe.questions.find(q => q.id === questionId);
  if (!question) return universe;

  const trashItem: TrashItem = {
    id: generateTrashId(),
    originalId: questionId,
    itemType: 'question',
    title: question.title || 'Безымянный вопрос',
    deletedAt: new Date().toISOString(),
    originalPath: `Лаборатория автора (Вопрос)`,
    payload: question
  };

  return {
    ...universe,
    questions: universe.questions.filter(q => q.id !== questionId),
    trash: [trashItem, ...(universe.trash || [])]
  };
}

/**
 * Move a Lab Hypothesis to trash
 */
export function softDeleteHypothesis(universe: UniverseData, hypothesisId: string): UniverseData {
  const hyp = universe.hypotheses.find(h => h.id === hypothesisId);
  if (!hyp) return universe;

  const trashItem: TrashItem = {
    id: generateTrashId(),
    originalId: hypothesisId,
    itemType: 'hypothesis',
    title: hyp.title || 'Безымянная гипотеза',
    deletedAt: new Date().toISOString(),
    originalPath: `Лаборатория автора (Гипотеза)`,
    payload: hyp
  };

  return {
    ...universe,
    hypotheses: universe.hypotheses.filter(h => h.id !== hypothesisId),
    trash: [trashItem, ...(universe.trash || [])]
  };
}

/**
 * Restore an item from trash back into the active universe
 */
export function restoreTrashItem(universe: UniverseData, trashItemId: string): UniverseData {
  const currentTrash = universe.trash || [];
  const targetItem = currentTrash.find(t => t.id === trashItemId);
  if (!targetItem) return universe;

  const remainingTrash = currentTrash.filter(t => t.id !== trashItemId);

  switch (targetItem.itemType) {
    case 'scene': {
      const restoredScene = targetItem.payload as Scene;
      let inserted = false;

      // Try finding the original chapter
      const updatedProjects = universe.projects.map(proj => ({
        ...proj,
        acts: proj.acts.map(act => ({
          ...act,
          chapters: act.chapters.map(chap => {
            if (chap.id === targetItem.parentId) {
              inserted = true;
              return {
                ...chap,
                scenes: [...chap.scenes, restoredScene]
              };
            }
            return chap;
          })
        }))
      }));

      // Fallback: if original chapter doesn't exist anymore, append to first available chapter
      if (!inserted && updatedProjects[0]?.acts[0]?.chapters[0]) {
        updatedProjects[0].acts[0].chapters[0].scenes.push(restoredScene);
      }

      return {
        ...universe,
        projects: updatedProjects,
        activeSceneId: restoredScene.id,
        trash: remainingTrash
      };
    }

    case 'chapter': {
      const restoredChapter = targetItem.payload as Chapter;
      let inserted = false;

      const updatedProjects = universe.projects.map(proj => ({
        ...proj,
        acts: proj.acts.map(act => {
          if (act.id === targetItem.parentId) {
            inserted = true;
            return {
              ...act,
              chapters: [...act.chapters, restoredChapter]
            };
          }
          return act;
        })
      }));

      if (!inserted && updatedProjects[0]?.acts[0]) {
        updatedProjects[0].acts[0].chapters.push(restoredChapter);
      }

      return {
        ...universe,
        projects: updatedProjects,
        activeSceneId: restoredChapter.scenes[0]?.id || universe.activeSceneId,
        trash: remainingTrash
      };
    }

    case 'act': {
      const restoredAct = targetItem.payload as Act;
      const updatedProjects = universe.projects.map((proj, idx) => {
        if (proj.id === targetItem.parentId || idx === 0) {
          return {
            ...proj,
            acts: [...proj.acts, restoredAct]
          };
        }
        return proj;
      });

      return {
        ...universe,
        projects: updatedProjects,
        trash: remainingTrash
      };
    }

    case 'entity': {
      const restoredEntity = targetItem.payload as CodexEntity;
      // Prevent duplicate id
      const existing = universe.entities.some(e => e.id === restoredEntity.id);
      return {
        ...universe,
        entities: existing ? universe.entities : [restoredEntity, ...universe.entities],
        trash: remainingTrash
      };
    }

    case 'event': {
      const restoredEvent = targetItem.payload as WorldEvent;
      const existing = universe.events.some(e => e.id === restoredEvent.id);
      return {
        ...universe,
        events: existing ? universe.events : [restoredEvent, ...universe.events],
        trash: remainingTrash
      };
    }

    case 'question': {
      const restoredQuestion = targetItem.payload as UnresolvedQuestion;
      const existing = universe.questions.some(q => q.id === restoredQuestion.id);
      return {
        ...universe,
        questions: existing ? universe.questions : [restoredQuestion, ...universe.questions],
        trash: remainingTrash
      };
    }

    case 'hypothesis': {
      const restoredHypothesis = targetItem.payload as LabHypothesis;
      const existing = universe.hypotheses.some(h => h.id === restoredHypothesis.id);
      return {
        ...universe,
        hypotheses: existing ? universe.hypotheses : [restoredHypothesis, ...universe.hypotheses],
        trash: remainingTrash
      };
    }

    default:
      return {
        ...universe,
        trash: remainingTrash
      };
  }
}

/**
 * Permanently purge an individual item from trash
 */
export function permanentlyDeleteTrashItem(universe: UniverseData, trashItemId: string): UniverseData {
  return {
    ...universe,
    trash: (universe.trash || []).filter(t => t.id !== trashItemId)
  };
}

/**
 * Empty the entire trash bin permanently
 */
export function emptyTrash(universe: UniverseData): UniverseData {
  return {
    ...universe,
    trash: []
  };
}
