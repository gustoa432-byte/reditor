import React, { useState } from 'react';
import {
  Chapter,
  ManuscriptProject,
  Scene,
  UniverseData,
  UniverseUpdater,
  WorkspaceTab
} from '../../types';
import { ContextInspector } from './ContextInspector';
import { StorylineMatrix } from './StorylineMatrix';
import {
  Feather,
  Plus,
  Trash2,
  Save,
  Clock,
  History,
  Layers,
  Sliders,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface ManuscriptStudioProps {
  universe: UniverseData;
  activeSceneId?: string;
  onUpdateUniverse: (updater: UniverseUpdater) => void;
  onNavigate: (tab: WorkspaceTab, targetId?: string) => void;
  onOpenAIAssistant: () => void;
}

export const ManuscriptStudio: React.FC<ManuscriptStudioProps> = ({
  universe,
  activeSceneId,
  onUpdateUniverse,
  onNavigate,
  onOpenAIAssistant
}) => {
  const project = universe.projects.find(p => p.id === universe.activeProjectId) || universe.projects[0];

  // Selected scene state
  const [selectedSceneId, setSelectedSceneId] = useState<string>(() => {
    if (activeSceneId) return activeSceneId;
    return project?.acts[0]?.chapters[0]?.scenes[0]?.id || '';
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'passport' | 'matrix' | 'history'>('editor');
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [showRightInspector, setShowRightInspector] = useState<boolean>(true);
  const [newRevisionLabel, setNewRevisionLabel] = useState<string>('');
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | null>(null);

  // Find active scene object
  let currentActIndex = 0;
  let currentChapterIndex = 0;
  let currentSceneIndex = 0;
  let activeScene: Scene | undefined;

  project?.acts.forEach((act, aIdx) => {
    act.chapters.forEach((ch, cIdx) => {
      ch.scenes.forEach((sc, sIdx) => {
        if (sc.id === selectedSceneId) {
          activeScene = sc;
          currentActIndex = aIdx;
          currentChapterIndex = cIdx;
          currentSceneIndex = sIdx;
        }
      });
    });
  });

  // Fallback to first scene if selected not found
  if (!activeScene && project?.acts[0]?.chapters[0]?.scenes[0]) {
    activeScene = project.acts[0].chapters[0].scenes[0];
  }

  // Text updater
  const handleUpdateText = (newText: string) => {
    if (!activeScene) return;
    const words = newText.trim().split(/\s+/).filter(Boolean).length;
    onUpdateUniverse(prev => {
      const activeProj = prev.projects.find(p => p.id === prev.activeProjectId) || prev.projects[0];
      const updatedProjects = prev.projects.map(proj => {
        if (proj.id !== activeProj.id) return proj;
        return {
          ...proj,
          acts: proj.acts.map((act, aIdx) => {
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
      });
      return { ...prev, projects: updatedProjects };
    });
  };

  // Passport field updater
  const handleUpdatePassport = (field: keyof Scene['passport'], value: string | number | string[]) => {
    if (!activeScene) return;
    onUpdateUniverse(prev => {
      const activeProj = prev.projects.find(p => p.id === prev.activeProjectId) || prev.projects[0];
      const updatedProjects = prev.projects.map(proj => {
        if (proj.id !== activeProj.id) return proj;
        return {
          ...proj,
          acts: proj.acts.map((act, aIdx) => {
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
                      },
                      updatedAt: new Date().toISOString()
                    };
                  })
                };
              })
            };
          })
        };
      });
      return { ...prev, projects: updatedProjects };
    });
  };

  // Scene status updater
  const handleUpdateSceneStatus = (status: Scene['status']) => {
    if (!activeScene) return;
    onUpdateUniverse(prev => {
      const activeProj = prev.projects.find(p => p.id === prev.activeProjectId) || prev.projects[0];
      const updatedProjects = prev.projects.map(proj => {
        if (proj.id !== activeProj.id) return proj;
        return {
          ...proj,
          acts: proj.acts.map((act, aIdx) => {
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
      });
      return { ...prev, projects: updatedProjects };
    });
  };

  // Storyline toggle in matrix
  const handleToggleStoryline = (sceneId: string, storylineId: string) => {
    const updatedProjects = universe.projects.map(proj => {
      if (proj.id !== project.id) return proj;
      return {
        ...proj,
        acts: proj.acts.map(act => ({
          ...act,
          chapters: act.chapters.map(ch => ({
            ...ch,
            scenes: ch.scenes.map(sc => {
              if (sc.id !== sceneId) return sc;
              const has = sc.passport.storylineIds.includes(storylineId);
              return {
                ...sc,
                passport: {
                  ...sc.passport,
                  storylineIds: has
                    ? sc.passport.storylineIds.filter(id => id !== storylineId)
                    : [...sc.passport.storylineIds, storylineId]
                }
              };
            })
          }))
        }))
      };
    });
    onUpdateUniverse({ ...universe, projects: updatedProjects });
  };

  // Add new scene
  const handleAddScene = (chapterId: string) => {
    const newSceneId = `scene-${Date.now()}`;
    const updatedProjects = universe.projects.map(proj => {
      if (proj.id !== project.id) return proj;
      return {
        ...proj,
        acts: proj.acts.map(act => ({
          ...act,
          chapters: act.chapters.map(ch => {
            if (ch.id !== chapterId) return ch;
            const newScene: Scene = {
              id: newSceneId,
              title: `Сцена ${ch.scenes.length + 1}. Новая сцена`,
              order: ch.scenes.length + 1,
              status: 'draft',
              text: '',
              wordCount: 0,
              updatedAt: new Date().toISOString(),
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
                epochYear: '2450 г.'
              }
            };
            return {
              ...ch,
              scenes: [...ch.scenes, newScene]
            };
          })
        }))
      };
    });

    onUpdateUniverse({ ...universe, projects: updatedProjects, activeSceneId: newSceneId });
    setSelectedSceneId(newSceneId);
  };

  // Add new chapter
  const handleAddChapter = (actId: string) => {
    const newChId = `ch-${Date.now()}`;
    const newSceneId = `scene-${Date.now()}`;
    const updatedProjects = universe.projects.map(proj => {
      if (proj.id !== project.id) return proj;
      return {
        ...proj,
        acts: proj.acts.map(act => {
          if (act.id !== actId) return act;
          const newCh: Chapter = {
            id: newChId,
            title: `Глава ${act.chapters.length + 1}. Новая глава`,
            order: act.chapters.length + 1,
            scenes: [
              {
                id: newSceneId,
                title: 'Сцена 1',
                order: 1,
                status: 'draft',
                text: '',
                wordCount: 0,
                updatedAt: new Date().toISOString(),
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
                  epochYear: '2450 г.'
                }
              }
            ]
          };
          return {
            ...act,
            chapters: [...act.chapters, newCh]
          };
        })
      };
    });

    onUpdateUniverse({ ...universe, projects: updatedProjects, activeSceneId: newSceneId });
    setSelectedSceneId(newSceneId);
  };

  // Create version snapshot
  const handleCreateRevision = () => {
    if (!activeScene || !newRevisionLabel.trim()) return;
    const revision = {
      id: `rev-${Date.now()}`,
      timestamp: new Date().toISOString(),
      label: newRevisionLabel.trim(),
      text: activeScene.text
    };

    const updatedProjects = universe.projects.map(proj => {
      if (proj.id !== project.id) return proj;
      return {
        ...proj,
        acts: proj.acts.map((act, aIdx) => {
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
                    revisions: [revision, ...sc.revisions]
                  };
                })
              };
            })
          };
        })
      };
    });

    onUpdateUniverse({ ...universe, projects: updatedProjects });
    setNewRevisionLabel('');
  };

  // Restore revision
  const handleRestoreRevision = (revText: string) => {
    handleUpdateText(revText);
    setSelectedRevisionId(null);
  };

  // Formatting helpers for writer's editor
  const insertDialogueDash = () => {
    if (!activeScene) return;
    const addition = '\n— ';
    handleUpdateText(activeScene.text + addition);
  };

  const insertHeading = () => {
    if (!activeScene) return;
    const addition = '\n### ';
    handleUpdateText(activeScene.text + addition);
  };

  return (
    <div className={`flex h-[calc(100vh-57px)] bg-slate-950 overflow-hidden ${isFocusMode ? 'fixed inset-0 z-50 h-screen' : ''}`}>
      {/* Left Sidebar: Manuscript Outline */}
      {!isFocusMode && (
        <aside className="w-64 border-r border-slate-800 bg-slate-950/95 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-slate-200 truncate">
                {project.title}
              </span>
            </div>
            <button
              onClick={() => handleAddChapter(project.acts[0]?.id)}
              title="Добавить главу"
              className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Acts, Chapters, Scenes Tree */}
          <div className="flex-1 overflow-y-auto p-2 space-y-3 scrollbar-thin">
            {project.acts.map(act => (
              <div key={act.id} className="space-y-1.5">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                  <span>{act.title}</span>
                </div>

                {act.chapters.map(ch => (
                  <div key={ch.id} className="space-y-1">
                    <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-slate-300 bg-slate-900/40 rounded border border-slate-800/40">
                      <span className="truncate">{ch.title}</span>
                      <button
                        onClick={() => handleAddScene(ch.id)}
                        title="Добавить сцену"
                        className="text-slate-400 hover:text-rose-400 p-0.5 rounded cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="pl-2 space-y-0.5">
                      {ch.scenes.map(sc => {
                        const isSelected = sc.id === activeScene?.id;
                        return (
                          <button
                            key={sc.id}
                            onClick={() => {
                              setSelectedSceneId(sc.id);
                              onUpdateUniverse({ ...universe, activeSceneId: sc.id });
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition flex items-center justify-between group cursor-pointer ${
                              isSelected
                                ? 'bg-rose-950/60 text-rose-200 border border-rose-800/50 font-medium'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                            }`}
                          >
                            <span className="truncate mr-2">{sc.title}</span>
                            <span className="text-[10px] font-mono shrink-0 text-slate-400 group-hover:text-slate-400">
                              {sc.wordCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Manuscript Footer Stats */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/40 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Всего слов:</span>
            <span className="text-slate-200 font-bold">
              {project.acts.reduce((acc, a) => acc + a.chapters.reduce((cAcc, c) => cAcc + c.scenes.reduce((sAcc, s) => sAcc + s.wordCount, 0), 0), 0).toLocaleString()}
            </span>
          </div>
        </aside>
      )}

      {/* Center Pane: Editor / Passport / Matrix / History */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Top Header of Center Pane */}
        {activeScene && (
          <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <input
                type="text"
                value={activeScene.title}
                onChange={e => {
                  const val = e.target.value;
                  const updatedProjects = universe.projects.map(proj => {
                    if (proj.id !== project.id) return proj;
                    return {
                      ...proj,
                      acts: proj.acts.map((act, aIdx) => {
                        if (aIdx !== currentActIndex) return act;
                        return {
                          ...act,
                          chapters: act.chapters.map((ch, cIdx) => {
                            if (cIdx !== currentChapterIndex) return ch;
                            return {
                              ...ch,
                              scenes: ch.scenes.map((sc, sIdx) => {
                                if (sIdx !== currentSceneIndex) return sc;
                                return { ...sc, title: val };
                              })
                            };
                          })
                        };
                      })
                    };
                  });
                  onUpdateUniverse({ ...universe, projects: updatedProjects });
                }}
                className="bg-transparent font-serif font-bold text-slate-100 text-sm md:text-base focus:outline-none focus:border-b focus:border-rose-500 border-b border-transparent truncate max-w-sm sm:max-w-md"
              />

              {/* Status Selector */}
              <select
                value={activeScene.status}
                onChange={e => handleUpdateSceneStatus(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 text-[11px] font-medium text-slate-200 rounded px-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="draft">Черновик</option>
                <option value="in_progress">В работе</option>
                <option value="revised">Вычитано</option>
                <option value="final">Канонический финал</option>
              </select>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                  activeTab === 'editor'
                    ? 'bg-rose-900/60 text-rose-200 border border-rose-700/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Текст
              </button>
              <button
                onClick={() => setActiveTab('passport')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                  activeTab === 'passport'
                    ? 'bg-rose-900/60 text-rose-200 border border-rose-700/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Паспорт сцены
              </button>
              <button
                onClick={() => setActiveTab('matrix')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                  activeTab === 'matrix'
                    ? 'bg-rose-900/60 text-rose-200 border border-rose-700/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Матрица линий
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-rose-900/60 text-rose-200 border border-rose-700/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Редакции ({activeScene.revisions.length})
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFocusMode(!isFocusMode)}
                title={isFocusMode ? 'Выйти из режима фокуса' : 'Режим концентрации'}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowRightInspector(!showRightInspector)}
                title="Переключить контекстный инспектор"
                className={`p-1.5 rounded text-xs transition cursor-pointer ${
                  showRightInspector ? 'text-rose-400 bg-rose-950/50' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Sliders className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Prose Text Editor */}
        {activeTab === 'editor' && activeScene && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Writer's mini toolbar */}
            <div className="px-6 py-1.5 border-b border-slate-800/80 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={insertHeading}
                  className="px-2 py-0.5 rounded hover:bg-slate-800 hover:text-slate-200 font-serif font-bold cursor-pointer"
                >
                  H3
                </button>
                <button
                  onClick={insertDialogueDash}
                  title="Вставить реплику диалога (тире)"
                  className="px-2 py-0.5 rounded hover:bg-slate-800 hover:text-slate-200 font-mono font-bold cursor-pointer"
                >
                  — Диалог
                </button>
                <span className="w-px h-3.5 bg-slate-800 mx-1" />
                <span className="text-[11px] font-mono text-slate-400">
                  {activeScene.wordCount} слов · ~{Math.max(1, Math.round(activeScene.wordCount / 200))} мин.
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span>Автосохранение активно</span>
              </div>
            </div>

            {/* Prose Textarea */}
            <div className="flex-1 p-6 md:p-10 overflow-y-auto scrollbar-thin max-w-4xl mx-auto w-full">
              <textarea
                value={activeScene.text}
                onChange={e => handleUpdateText(e.target.value)}
                placeholder="Начните писать сцену здесь... Описывайте действия, диалоги и чувственный опыт персонажей..."
                className="w-full h-full min-h-[500px] bg-transparent text-slate-200 font-serif text-base md:text-lg leading-relaxed focus:outline-none resize-none placeholder-slate-400"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Scene Passport */}
        {activeTab === 'passport' && activeScene && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-serif font-bold text-slate-100">
                Паспорт сцены: {activeScene.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Необязательная драматургическая анкета. Заполняйте только те поля, которые помогают удерживать замысел.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* POV Character */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Точка зрения (POV):</label>
                <select
                  value={activeScene.passport.povCharacterId || ''}
                  onChange={e => handleUpdatePassport('povCharacterId', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
                >
                  <option value="">-- Выбрать персонажа --</option>
                  {universe.entities.filter(e => e.type === 'character').map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Место действия (Локация):</label>
                <select
                  value={activeScene.passport.locationId || ''}
                  onChange={e => handleUpdatePassport('locationId', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
                >
                  <option value="">-- Выбрать локацию --</option>
                  {universe.entities.filter(e => e.type === 'location' || e.type === 'organization').map(l => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
              </div>

              {/* Epoch / Year */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Эпоха / Временная привязка:</label>
                <input
                  type="text"
                  value={activeScene.passport.epochYear || ''}
                  onChange={e => handleUpdatePassport('epochYear', e.target.value)}
                  placeholder="Например: 2450 г. (Эпоха Катастрофы)"
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Polarity Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Драматургическая полярность (+/-):</label>
                  <span className={`text-xs font-mono font-bold ${
                    activeScene.passport.polarity > 0 ? 'text-emerald-400' : activeScene.passport.polarity < 0 ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {activeScene.passport.polarity > 0 ? `+${activeScene.passport.polarity}` : activeScene.passport.polarity}
                  </span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="1"
                  value={activeScene.passport.polarity}
                  onChange={e => handleUpdatePassport('polarity', parseInt(e.target.value, 10))}
                  className="w-full accent-rose-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>-2 (Крах)</span>
                  <span>-1</span>
                  <span>0 (Баланс)</span>
                  <span>+1</span>
                  <span>+2 (Триумф)</span>
                </div>
              </div>
            </div>

            {/* Narrative & Dramatic Core Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Цель персонажа в сцене:</label>
                <input
                  type="text"
                  value={activeScene.passport.characterGoal}
                  onChange={e => handleUpdatePassport('characterGoal', e.target.value)}
                  placeholder="Чего конкретно хочет достичь герой в первой трети сцены?"
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Конфликт / Препятствие:</label>
                <input
                  type="text"
                  value={activeScene.passport.conflictObstacle}
                  onChange={e => handleUpdatePassport('conflictObstacle', e.target.value)}
                  placeholder="Что или кто встает на пути героя (внутреннее или внешнее сопротивление)?"
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Исходное состояние:</label>
                  <textarea
                    rows={2}
                    value={activeScene.passport.initialState}
                    onChange={e => handleUpdatePassport('initialState', e.target.value)}
                    placeholder="В каком физическом/эмоциональном состоянии герой начинает сцену?"
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Итоговое состояние:</label>
                  <textarea
                    rows={2}
                    value={activeScene.passport.finalState}
                    onChange={e => handleUpdatePassport('finalState', e.target.value)}
                    placeholder="С каким сдвигом герой завершает сцену?"
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Драматургический поворот:</label>
                  <input
                    type="text"
                    value={activeScene.passport.dramaticTurn}
                    onChange={e => handleUpdatePassport('dramaticTurn', e.target.value)}
                    placeholder="Неожиданное открытие, срыв плана или откровение"
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Сюжетный крючок (Клиффхэнгер):</label>
                  <input
                    type="text"
                    value={activeScene.passport.hook}
                    onChange={e => handleUpdatePassport('hook', e.target.value)}
                    placeholder="Вопрос или угроза, заставляющая перевернуть страницу"
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Функция сцены в произведении:</label>
                <input
                  type="text"
                  value={activeScene.passport.sceneFunction}
                  onChange={e => handleUpdatePassport('sceneFunction', e.target.value)}
                  placeholder="Экспозиция, завязка, эскалация, кульминация, развязка..."
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Storyline Matrix */}
        {activeTab === 'matrix' && (
          <div className="flex-1 overflow-y-auto">
            <StorylineMatrix
              project={project}
              universe={universe}
              activeSceneId={activeScene?.id || ''}
              onSelectScene={id => {
                setSelectedSceneId(id);
                onUpdateUniverse({ ...universe, activeSceneId: id });
              }}
              onToggleStorylineForScene={handleToggleStoryline}
            />
          </div>
        )}

        {/* Tab 4: Revisions & History */}
        {activeTab === 'history' && activeScene && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-serif font-bold text-slate-100">
                  История редакций и контрольные снимки
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Сохранение контрольных версий текста, сравнение и откат к предыдущим состояниям.
                </p>
              </div>
            </div>

            {/* Create new snapshot */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={newRevisionLabel}
                onChange={e => setNewRevisionLabel(e.target.value)}
                placeholder="Название снимка (напр., 'Перед сокращением диалога')..."
                className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={handleCreateRevision}
                disabled={!newRevisionLabel.trim()}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold shrink-0 cursor-pointer transition"
              >
                Сохранить снимок
              </button>
            </div>

            {/* Revision List */}
            <div className="space-y-3">
              {activeScene.revisions.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-xs text-slate-400">
                  Нет сохраненных контрольных снимков. Вы можете зафиксировать текущее состояние текста перед масштабной редактурой.
                </div>
              ) : (
                activeScene.revisions.map(rev => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-rose-400" />
                        <span className="text-xs font-bold text-slate-200">{rev.label}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(rev.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 rounded bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 font-serif leading-relaxed line-clamp-3">
                      {rev.text}
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleRestoreRevision(rev.text)}
                        className="px-3 py-1 rounded bg-slate-800 hover:bg-rose-950 hover:text-rose-200 border border-slate-700 text-xs text-slate-300 transition cursor-pointer"
                      >
                        Восстановить этот текст
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Right Sidebar: Context Inspector */}
      {!isFocusMode && showRightInspector && activeScene && (
        <ContextInspector
          scene={activeScene}
          universe={universe}
          onNavigate={onNavigate}
          onOpenAIAssistant={onOpenAIAssistant}
        />
      )}
    </div>
  );
};
