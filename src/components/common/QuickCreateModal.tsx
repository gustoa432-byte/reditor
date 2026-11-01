import React from 'react';
import { EntityType, Scene, UniverseData, UniverseUpdater, WorkspaceTab } from '../../types';
import {
  Feather,
  User,
  MapPin,
  Sparkles,
  Clock,
  FlaskConical,
  HelpCircle,
  X,
  ChevronRight
} from 'lucide-react';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  universe: UniverseData;
  onUpdateUniverse: (updater: UniverseUpdater) => void;
  onNavigate: (tab: WorkspaceTab, targetId?: string) => void;
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({
  isOpen,
  onClose,
  universe,
  onUpdateUniverse,
  onNavigate
}) => {
  if (!isOpen) return null;

  const handleCreateScene = () => {
    const newSceneId = `scene-${Date.now()}`;

    onUpdateUniverse(prev => {
      const timestamp = new Date().toISOString();

      // Case 1: No projects exist at all
      if (!prev.projects || prev.projects.length === 0) {
        const projectId = `proj-${Date.now()}`;
        const newScene: Scene = {
          id: newSceneId,
          title: 'Сцена 1. Начало',
          order: 1,
          status: 'draft',
          text: '',
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
          }
        };

        const newProject = {
          id: projectId,
          title: prev.universeName ? `${prev.universeName}: Книга I` : 'Книга I',
          synopsis: '',
          updatedAt: timestamp,
          storylines: [],
          acts: [
            {
              id: `act-${Date.now()}`,
              title: 'Часть 1',
              order: 1,
              chapters: [
                {
                  id: `ch-${Date.now()}`,
                  title: 'Глава 1',
                  order: 1,
                  scenes: [newScene]
                }
              ]
            }
          ]
        };

        return {
          ...prev,
          projects: [newProject],
          activeProjectId: projectId,
          activeSceneId: newSceneId
        };
      }

      // Case 2: Existing project
      const activeProj = prev.projects.find(p => p.id === prev.activeProjectId) || prev.projects[0];
      const targetAct = activeProj.acts?.[0];
      const targetChapter = targetAct?.chapters?.[0];

      const newSceneNumber = (targetChapter?.scenes?.length || 0) + 1;
      const newScene: Scene = {
        id: newSceneId,
        title: `Сцена ${newSceneNumber}. Новая сцена`,
        order: newSceneNumber,
        status: 'draft',
        text: '',
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
        }
      };

      const updatedProjects = prev.projects.map(proj => {
        if (proj.id !== activeProj.id) return proj;

        let acts = [...(proj.acts || [])];
        if (acts.length === 0) {
          acts = [
            {
              id: `act-${Date.now()}`,
              title: 'Часть 1',
              order: 1,
              chapters: []
            }
          ];
        }

        const updatedActs = acts.map((act, aIdx) => {
          if (aIdx !== 0) return act;
          let chapters = [...(act.chapters || [])];
          if (chapters.length === 0) {
            chapters = [
              {
                id: `ch-${Date.now()}`,
                title: 'Глава 1',
                order: 1,
                scenes: []
              }
            ];
          }

          const updatedChapters = chapters.map((ch, cIdx) => {
            if (cIdx !== 0) return ch;
            return {
              ...ch,
              scenes: [...ch.scenes, newScene]
            };
          });

          return { ...act, chapters: updatedChapters };
        });

        return {
          ...proj,
          updatedAt: timestamp,
          acts: updatedActs
        };
      });

      return { ...prev, projects: updatedProjects, activeSceneId: newSceneId };
    });

    onClose();
    onNavigate('manuscript', newSceneId);
  };

  const handleCreateEntity = (type: EntityType, defaultName: string) => {
    const newId = `ent-${Date.now()}`;
    const newEntity = {
      id: newId,
      type,
      title: defaultName,
      description: 'Описание формируется автором.',
      canonStatus: 'canon' as const,
      credibility: 'fact' as const,
      attributes: {},
      dynamicStates: [],
      relations: [],
      tags: [type, 'Канон'],
      updatedAt: new Date().toISOString()
    };

    onUpdateUniverse(prev => ({
      ...prev,
      entities: [newEntity, ...prev.entities]
    }));

    onClose();
    onNavigate('codex', newId);
  };

  const options = [
    {
      title: 'Новая сцена в рукописи',
      description: 'Добавить сцену в текущую главу романа и сразу начать писать',
      icon: Feather,
      color: 'text-rose-400 bg-rose-950/60 border-rose-800/40',
      action: handleCreateScene
    },
    {
      title: 'Новый персонаж канона',
      description: 'Создать карточку героя с динамическими состояниями по эпохам',
      icon: User,
      color: 'text-rose-400 bg-rose-950/60 border-rose-800/40',
      action: () => handleCreateEntity('character', 'Новый персонаж')
    },
    {
      title: 'Новая локация / мир',
      description: 'Географический объект, сектор или аномальная территория',
      icon: MapPin,
      color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/40',
      action: () => handleCreateEntity('location', 'Новая локация')
    },
    {
      title: 'Новый артефакт / реликвия',
      description: 'Кристалл, механизм или наследие древних цивилизаций',
      icon: Sparkles,
      color: 'text-amber-400 bg-amber-950/60 border-amber-800/40',
      action: () => handleCreateEntity('artifact', 'Новый артефакт')
    },
    {
      title: 'Новое событие хронологии',
      description: 'Зафиксировать узел в трех временных измерениях',
      icon: Clock,
      color: 'text-purple-400 bg-purple-950/60 border-purple-800/40',
      action: () => {
        onClose();
        onNavigate('timeline');
      }
    },
    {
      title: 'Авторская гипотеза / мысль',
      description: 'Записать идею с аргументами без навязывания канона',
      icon: FlaskConical,
      color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40',
      action: () => {
        onClose();
        onNavigate('lab');
      }
    },
    {
      title: 'Нерешённый вопрос вселенной',
      description: 'Внести дилемму в реестр открытых вопросов',
      icon: HelpCircle,
      color: 'text-amber-400 bg-amber-950/60 border-amber-800/40',
      action: () => {
        onClose();
        onNavigate('lab');
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-serif font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            Быстрое создание элемента
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {options.map((opt, i) => {
            const Icon = opt.icon;
            return (
              <button
                key={i}
                onClick={opt.action}
                className="w-full text-left p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 flex items-center justify-between group transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${opt.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-rose-200 transition">
                      {opt.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {opt.description}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
