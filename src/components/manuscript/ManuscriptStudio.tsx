import React, { useState, useEffect } from 'react';
import {
  Chapter,
  ManuscriptProject,
  Scene,
  SceneRevision,
  ScenePassport as IScenePassport,
  UniverseData,
  UniverseUpdater,
  WorkspaceTab
} from '../../types';
import { ContextInspector } from './ContextInspector';
import { StorylineMatrix } from './StorylineMatrix';
import { ManuscriptOutline } from './ManuscriptOutline';
import { SceneHeader } from './SceneHeader';
import { SceneEditor } from './SceneEditor';
import { ScenePassport } from './ScenePassport';
import { RevisionHistory } from './RevisionHistory';
import { Feather, Plus, Minimize2, X } from 'lucide-react';
import { softDeleteScene } from '../../utils/universeOps';

interface ManuscriptStudioProps {
  universe: UniverseData;
  activeSceneId?: string;
  onUpdateUniverse: (updater: UniverseUpdater) => void;
  onNavigate: (tab: WorkspaceTab, targetId?: string) => void;
  onOpenAIAssistant: () => void;
  onItemDeletedNotice?: (title: string, onUndo: () => void) => void;
}

export const ManuscriptStudio: React.FC<ManuscriptStudioProps> = ({
  universe,
  activeSceneId,
  onUpdateUniverse,
  onNavigate,
  onOpenAIAssistant,
  onItemDeletedNotice
}) => {
  const project = universe.projects.find(p => p.id === universe.activeProjectId) || universe.projects[0];

  const [selectedSceneId, setSelectedSceneId] = useState<string>(() => {
    if (activeSceneId) return activeSceneId;
    return project?.acts[0]?.chapters[0]?.scenes[0]?.id || '';
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'passport' | 'matrix' | 'history'>('editor');
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isOutlineOpenMobile, setIsOutlineOpenMobile] = useState<boolean>(false);
  const [showRightInspector, setShowRightInspector] = useState<boolean>(true);

  // Sync external activeSceneId
  useEffect(() => {
    if (activeSceneId && activeSceneId !== selectedSceneId) {
      setSelectedSceneId(activeSceneId);
    }
  }, [activeSceneId]);

  // Escape key exits focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  // Find active scene object
  let currentActIndex = 0;
  let currentChapterIndex = 0;
  let currentSceneIndex = 0;
  let activeScene: Scene | undefined;

  if (project?.acts) {
    for (let aIdx = 0; aIdx < project.acts.length; aIdx++) {
      const act = project.acts[aIdx];
      for (let cIdx = 0; cIdx < act.chapters.length; cIdx++) {
        const chap = act.chapters[cIdx];
        for (let sIdx = 0; sIdx < chap.scenes.length; sIdx++) {
          const sc = chap.scenes[sIdx];
          if (sc.id === selectedSceneId) {
            currentActIndex = aIdx;
            currentChapterIndex = cIdx;
            currentSceneIndex = sIdx;
            activeScene = sc;
            break;
          }
        }
        if (activeScene) break;
      }
      if (activeScene) break;
    }
  }

  // Fallback to first scene if selected not found
  if (!activeScene && project?.acts?.[0]?.chapters?.[0]?.scenes?.[0]) {
    activeScene = project.acts[0].chapters[0].scenes[0];
    currentActIndex = 0;
    currentChapterIndex = 0;
    currentSceneIndex = 0;
  }

  // Update text with word count calculation
  const handleUpdateText = (newText: string) => {
    if (!activeScene || !project) return;
    const words = newText.trim() ? newText.trim().split(/\s+/).length : 0;

    onUpdateUniverse(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== project.id) return p;
        return {
          ...p,
          acts: p.acts.map((act, aIdx) => {
            if (aIdx !== currentActIndex) return act;
            return {
              ...act,
              chapters: act.chapters.map((ch, cIdx) => {
                if (cIdx !== currentChapterIndex) return ch;
                return {
                  ...ch,
                  scenes: ch.scenes.map((sc, sIdx) => {
                    if (sIdx !== currentSceneIndex) return sc;
                    return {
                      ...sc,
                      text: newText,
                      wordCount: words,
                      updatedAt: new Date().toISOString()
                    };
                  })
                };
              })
            };
          })
        };
      })
    }));
  };

  // Update scene title
  const handleUpdateTitle = (newTitle: string) => {
    if (!activeScene || !project) return;
    onUpdateUniverse(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== project.id) return p;
        return {
          ...p,
          acts: p.acts.map((act, aIdx) => {
            if (aIdx !== currentActIndex) return act;
            return {
              ...act,
              chapters: act.chapters.map((ch, cIdx) => {
                if (cIdx !== currentChapterIndex) return ch;
                return {
                  ...ch,
                  scenes: ch.scenes.map((sc, sIdx) => {
                    if (sIdx !== currentSceneIndex) return sc;
                    return { ...sc, title: newTitle };
                  })
                };
              })
            };
          })
        };
      })
    }));
  };

  // Update scene status
  const handleUpdateStatus = (status: Scene['status']) => {
    if (!activeScene || !project) return;
    onUpdateUniverse(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== project.id) return p;
        return {
          ...p,
          acts: p.acts.map((act, aIdx) => {
            if (aIdx !== currentActIndex) return act;
            return {
              ...act,
              chapters: act.chapters.map((ch, cIdx) => {
                if (cIdx !== currentChapterIndex) return ch;
                return {
                  ...ch,
                  scenes: ch.scenes.map((sc, sIdx) => {
                    if (sIdx !== currentSceneIndex) return sc;
                    return { ...sc, status };
                  })
                };
              })
            };
          })
        };
      })
    }));
  };

  // Update scene passport fields
  const handleUpdatePassport = (field: keyof IScenePassport, value: any) => {
    if (!activeScene || !project) return;
    onUpdateUniverse(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== project.id) return p;
        return {
          ...p,
          acts: p.acts.map((act, aIdx) => {
            if (aIdx !== currentActIndex) return act;
            return {
              ...act,
              chapters: act.chapters.map((ch, cIdx) => {
                if (cIdx !== currentChapterIndex) return ch;
                return {
                  ...ch,
                  scenes: ch.scenes.map((sc, sIdx) => {
                    if (sIdx !== currentSceneIndex) return sc;
                    return {
                      ...sc,
                      passport: {
                        ...sc.passport,
                        [field]: value
                      }
                    };
                  })
                };
              })
            };
          })
        };
      })
    }));
  };

  // Create text revision
  const handleCreateRevision = (label: string) => {
    if (!activeScene || !project) return;
    const newRev: SceneRevision = {
      id: `rev-${Date.now()}`,
      timestamp: new Date().toISOString(),
      label: label.trim(),
      text: activeScene.text
    };

    onUpdateUniverse(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== project.id) return p;
        return {
          ...p,
          acts: p.acts.map((act, aIdx) => {
            if (aIdx !== currentActIndex) return act;
            return {
              ...act,
              chapters: act.chapters.map((ch, cIdx) => {
                if (cIdx !== currentChapterIndex) return ch;
                return {
                  ...ch,
                  scenes: ch.scenes.map((sc, sIdx) => {
                    if (sIdx !== currentSceneIndex) return sc;
                    return {
                      ...sc,
                      revisions: [newRev, ...(sc.revisions || [])]
                    };
                  })
                };
              })
            };
          })
        };
      })
    }));
  };

  // Restore text revision
  const handleRestoreRevision = (revision: SceneRevision) => {
    if (!activeScene || !project) return;
    // Auto-create snapshot of current state
    const autoSnapshot: SceneRevision = {
      id: `rev-${Date.now()}-auto`,
      timestamp: new Date().toISOString(),
      label: `Автосохранение перед откатом к «${revision.label}»`,
      text: activeScene.text
    };

    handleUpdateText(revision.text);

    onUpdateUniverse(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== project.id) return p;
        return {
          ...p,
          acts: p.acts.map((act, aIdx) => {
            if (aIdx !== currentActIndex) return act;
            return {
              ...act,
              chapters: act.chapters.map((ch, cIdx) => {
                if (cIdx !== currentChapterIndex) return ch;
                return {
                  ...ch,
                  scenes: ch.scenes.map((sc, sIdx) => {
                    if (sIdx !== currentSceneIndex) return sc;
                    return {
                      ...sc,
                      revisions: [autoSnapshot, ...(sc.revisions || [])]
                    };
                  })
                };
              })
            };
          })
        };
      })
    }));
  };

  // Add Chapter
  const handleAddChapter = (actId: string) => {
    if (!project) return;
    const newChapterId = `ch-${Date.now()}`;
    const newSceneId = `sc-${Date.now()}`;

    const newScene: Scene = {
      id: newSceneId,
      title: 'Сцена 1',
      order: 1,
      status: 'draft',
      wordCount: 0,
      updatedAt: new Date().toISOString(),
      text: '',
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
        sceneFunction: 'Развитие действия',
        storylineIds: [],
        polarity: 0
      }
    };

    const newChapter: Chapter = {
      id: newChapterId,
      title: `Глава ${((project.acts.find(a => a.id === actId)?.chapters.length || 0) + 1)}`,
      order: (project.acts.find(a => a.id === actId)?.chapters.length || 0) + 1,
      scenes: [newScene]
    };

    onUpdateUniverse(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== project.id) return p;
        return {
          ...p,
          acts: p.acts.map(act => {
            if (act.id === actId) {
              return {
                ...act,
                chapters: [...act.chapters, newChapter]
              };
            }
            return act;
          })
        };
      }),
      activeSceneId: newSceneId
    }));

    setSelectedSceneId(newSceneId);
  };

  // Add Scene
  const handleAddScene = (chapterId: string) => {
    if (!project) return;
    const newSceneId = `sc-${Date.now()}`;
    const targetChapter = project.acts.flatMap(a => a.chapters).find(c => c.id === chapterId);
    const sceneOrder = (targetChapter?.scenes.length || 0) + 1;

    const newScene: Scene = {
      id: newSceneId,
      title: `Сцена ${sceneOrder}`,
      order: sceneOrder,
      status: 'draft',
      wordCount: 0,
      updatedAt: new Date().toISOString(),
      text: '',
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
        polarity: 0
      }
    };

    onUpdateUniverse(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== project.id) return p;
        return {
          ...p,
          acts: p.acts.map(act => ({
            ...act,
            chapters: act.chapters.map(ch => {
              if (ch.id === chapterId) {
                return {
                  ...ch,
                  scenes: [...ch.scenes, newScene]
                };
              }
              return ch;
            })
          }))
        };
      }),
      activeSceneId: newSceneId
    }));

    setSelectedSceneId(newSceneId);
  };

  // Add Act
  const handleAddAct = () => {
    if (!project) return;
    const newActId = `act-${Date.now()}`;
    const newChapterId = `ch-${Date.now()}`;
    const newSceneId = `sc-${Date.now()}`;

    const newScene: Scene = {
      id: newSceneId,
      title: 'Сцена 1',
      order: 1,
      status: 'draft',
      wordCount: 0,
      updatedAt: new Date().toISOString(),
      text: '',
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
        sceneFunction: 'Экспозиция',
        storylineIds: [],
        polarity: 0
      }
    };

    const newChapter: Chapter = {
      id: newChapterId,
      title: 'Глава 1',
      order: 1,
      scenes: [newScene]
    };

    const newAct = {
      id: newActId,
      title: `Акт ${project.acts.length + 1}`,
      order: project.acts.length + 1,
      chapters: [newChapter]
    };

    onUpdateUniverse(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== project.id) return p;
        return {
          ...p,
          acts: [...p.acts, newAct]
        };
      }),
      activeSceneId: newSceneId
    }));

    setSelectedSceneId(newSceneId);
  };

  // Delete scene with soft delete
  const handleDeleteScene = (sceneId: string, title: string) => {
    onUpdateUniverse(prev => {
      const next = softDeleteScene(prev, sceneId);
      const trashId = next.trash?.[0]?.id;
      if (trashId && onItemDeletedNotice) {
        onItemDeletedNotice(title, () => {
          onUpdateUniverse(u => {
            const { restoreTrashItem } = require('../../utils/universeOps');
            return restoreTrashItem(u, trashId);
          });
        });
      }
      return next;
    });
  };

  // Toggle storyline association for active scene
  const handleToggleStoryline = (sceneId: string, storylineId: string) => {
    if (!project) return;
    onUpdateUniverse(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== project.id) return p;
        return {
          ...p,
          acts: p.acts.map(act => ({
            ...act,
            chapters: act.chapters.map(ch => ({
              ...ch,
              scenes: ch.scenes.map(sc => {
                if (sc.id !== sceneId) return sc;
                const currentLines = sc.passport.storylineIds || [];
                const updatedLines = currentLines.includes(storylineId)
                  ? currentLines.filter(id => id !== storylineId)
                  : [...currentLines, storylineId];
                return {
                  ...sc,
                  passport: {
                    ...sc.passport,
                    storylineIds: updatedLines
                  }
                };
              })
            }))
          }))
        };
      })
    }));
  };

  // First scene creation if empty
  const handleCreateFirstScene = () => {
    const newProjId = project?.id || `proj-${Date.now()}`;
    const newActId = `act-${Date.now()}`;
    const newChapterId = `ch-${Date.now()}`;
    const newSceneId = `sc-${Date.now()}`;

    const newScene: Scene = {
      id: newSceneId,
      title: 'Пролог: Начало',
      order: 1,
      status: 'draft',
      wordCount: 0,
      updatedAt: new Date().toISOString(),
      text: '',
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
        sceneFunction: 'Экспозиция',
        storylineIds: [],
        polarity: 0
      }
    };

    const newChapter: Chapter = {
      id: newChapterId,
      title: 'Глава 1: Первые шаги',
      order: 1,
      scenes: [newScene]
    };

    const newAct = {
      id: newActId,
      title: 'Акт 1: Завязка',
      order: 1,
      chapters: [newChapter]
    };

    onUpdateUniverse(prev => {
      const existingProjects = prev.projects.length > 0 ? prev.projects : [];
      let updated: ManuscriptProject[];
      if (existingProjects.length === 0) {
        updated = [{
          id: newProjId,
          title: 'Основная рукопись',
          synopsis: '',
          acts: [newAct],
          storylines: [],
          updatedAt: new Date().toISOString()
        }];
      } else {
        updated = existingProjects.map((p, idx) => {
          if (idx === 0) return { ...p, acts: [newAct] };
          return p;
        });
      }
      return { ...prev, projects: updated, activeProjectId: updated[0].id, activeSceneId: newSceneId };
    });

    setSelectedSceneId(newSceneId);
  };

  if (!project || !project.acts || project.acts.length === 0 || !activeScene) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 text-center h-full min-h-0">
        <div className="w-14 h-14 rounded-2xl bg-rose-950/40 border border-rose-800/50 flex items-center justify-center mb-4 shadow-xl">
          <Feather className="w-7 h-7 text-rose-400" />
        </div>
        <h2 className="text-xl font-serif font-bold text-slate-100">
          Мастерская текста пуста
        </h2>
        <p className="text-sm text-slate-400 max-w-md mt-2 mb-6 leading-relaxed">
          В вашей вселенной ещё нет рукописи. Создайте первую главу и сцену, чтобы приступить к литературной работе.
        </p>
        <button
          onClick={handleCreateFirstScene}
          className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/50 transition cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Создать первую главу и сцену</span>
        </button>
      </div>
    );
  }

  // Focus Mode View (Immersive Zen Canvas)
  if (isFocusMode) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col h-screen w-screen overflow-hidden">
        {/* Floating Top Controls in Focus Mode */}
        <div className="absolute top-4 right-6 z-10 flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 shadow-xl">
          <span className="text-xs font-mono text-slate-400">
            {activeScene.wordCount || 0} сл.
          </span>
          <span className="w-px h-3 bg-slate-700" />
          <button
            onClick={() => setIsFocusMode(false)}
            className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-white font-medium transition cursor-pointer"
            title="Выйти из режима концентрации (или нажмите Esc)"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Выйти (Esc)</span>
          </button>
        </div>

        {/* Pure Writing Area */}
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full pt-16 pb-12 px-6 overflow-y-auto scrollbar-thin">
          <input
            type="text"
            value={activeScene.title}
            onChange={(e) => handleUpdateTitle(e.target.value)}
            placeholder="Название сцены..."
            className="bg-transparent font-serif font-bold text-2xl text-slate-200 focus:outline-none mb-6 border-b border-transparent focus:border-rose-900/40 pb-2"
          />
          <textarea
            value={activeScene.text}
            onChange={(e) => handleUpdateText(e.target.value)}
            placeholder="Пишите свободно, погрузившись в канон вселенной..."
            className="w-full flex-1 min-h-[500px] bg-transparent text-slate-200 font-serif text-lg leading-relaxed focus:outline-none resize-none placeholder-slate-600"
            autoFocus
          />
        </div>
      </div>
    );
  }

  // Standard Studio Workspace Layout (Full Height, Flex-1, Zero calc(100vh))
  return (
    <div className="flex h-full w-full flex-1 min-h-0 min-w-0 bg-slate-950 overflow-hidden relative">
      {/* 1. Left Sidebar: Manuscript Outline */}
      <ManuscriptOutline
        project={project}
        activeSceneId={activeScene.id}
        onSelectScene={id => {
          setSelectedSceneId(id);
          onUpdateUniverse(prev => ({ ...prev, activeSceneId: id }));
        }}
        onUpdateUniverse={onUpdateUniverse}
        onAddChapter={handleAddChapter}
        onAddScene={handleAddScene}
        onAddAct={handleAddAct}
        onItemDeletedNotice={onItemDeletedNotice}
        isOpenMobile={isOutlineOpenMobile}
        onCloseMobile={() => setIsOutlineOpenMobile(false)}
      />

      {/* 2. Center Writing & Work Pane */}
      <main className="flex-1 flex flex-col min-h-0 min-w-0 bg-slate-950 overflow-hidden">
        {/* Scene Header */}
        <SceneHeader
          scene={activeScene}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onUpdateTitle={handleUpdateTitle}
          onUpdateStatus={handleUpdateStatus}
          onToggleOutlineMobile={() => setIsOutlineOpenMobile(prev => !prev)}
          onToggleInspector={() => setShowRightInspector(prev => !prev)}
          showInspector={showRightInspector}
          onToggleFocusMode={() => setIsFocusMode(true)}
          onDeleteScene={handleDeleteScene}
        />

        {/* Center Content Body */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {activeTab === 'editor' && (
            <SceneEditor
              scene={activeScene}
              onUpdateText={handleUpdateText}
            />
          )}

          {activeTab === 'passport' && (
            <ScenePassport
              scene={activeScene}
              universe={universe}
              onUpdatePassport={handleUpdatePassport}
            />
          )}

          {activeTab === 'matrix' && (
            <div className="flex-1 overflow-y-auto min-h-0">
              <StorylineMatrix
                project={project}
                universe={universe}
                activeSceneId={activeScene.id}
                onSelectScene={id => {
                  setSelectedSceneId(id);
                  onUpdateUniverse(prev => ({ ...prev, activeSceneId: id }));
                }}
                onToggleStorylineForScene={handleToggleStoryline}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <RevisionHistory
              scene={activeScene}
              onCreateRevision={handleCreateRevision}
              onRestoreRevision={handleRestoreRevision}
            />
          )}
        </div>
      </main>

      {/* 3. Right Sidebar: Context Inspector */}
      {showRightInspector && (
        <aside className="hidden xl:flex w-80 border-l border-slate-800 bg-slate-950 flex-col shrink-0 min-h-0 h-full overflow-hidden">
          <ContextInspector
            scene={activeScene}
            universe={universe}
            onNavigate={onNavigate}
            onOpenAIAssistant={onOpenAIAssistant}
          />
        </aside>
      )}
    </div>
  );
};
