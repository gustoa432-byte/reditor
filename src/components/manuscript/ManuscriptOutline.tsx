import React, { useState } from 'react';
import { ManuscriptProject, Scene, UniverseData, UniverseUpdater } from '../../types';
import {
  BookOpen,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Layers,
  X
} from 'lucide-react';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { softDeleteScene, softDeleteChapter, softDeleteAct } from '../../utils/universeOps';

interface ManuscriptOutlineProps {
  project: ManuscriptProject;
  activeSceneId?: string;
  onSelectScene: (sceneId: string) => void;
  onUpdateUniverse: (updater: UniverseUpdater) => void;
  onAddChapter: (actId: string) => void;
  onAddScene: (chapterId: string) => void;
  onAddAct: () => void;
  onItemDeletedNotice?: (title: string, onUndo: () => void) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const ManuscriptOutline: React.FC<ManuscriptOutlineProps> = ({
  project,
  activeSceneId,
  onSelectScene,
  onUpdateUniverse,
  onAddChapter,
  onAddScene,
  onAddAct,
  onItemDeletedNotice,
  isOpenMobile,
  onCloseMobile
}) => {
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'scene' | 'chapter' | 'act';
    id: string;
    title: string;
  } | null>(null);

  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});

  const toggleChapterCollapse = (chapterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'scene') {
      onUpdateUniverse(prev => {
        const next = softDeleteScene(prev, deleteTarget.id);
        const trashId = next.trash?.[0]?.id;
        if (trashId && onItemDeletedNotice) {
          onItemDeletedNotice(deleteTarget.title, () => {
            onUpdateUniverse(u => {
              const { restoreTrashItem } = require('../../utils/universeOps');
              return restoreTrashItem(u, trashId);
            });
          });
        }
        return next;
      });
    } else if (deleteTarget.type === 'chapter') {
      onUpdateUniverse(prev => {
        const next = softDeleteChapter(prev, deleteTarget.id);
        const trashId = next.trash?.[0]?.id;
        if (trashId && onItemDeletedNotice) {
          onItemDeletedNotice(deleteTarget.title, () => {
            onUpdateUniverse(u => {
              const { restoreTrashItem } = require('../../utils/universeOps');
              return restoreTrashItem(u, trashId);
            });
          });
        }
        return next;
      });
    } else if (deleteTarget.type === 'act') {
      onUpdateUniverse(prev => {
        const next = softDeleteAct(prev, deleteTarget.id);
        const trashId = next.trash?.[0]?.id;
        if (trashId && onItemDeletedNotice) {
          onItemDeletedNotice(deleteTarget.title, () => {
            onUpdateUniverse(u => {
              const { restoreTrashItem } = require('../../utils/universeOps');
              return restoreTrashItem(u, trashId);
            });
          });
        }
        return next;
      });
    }

    setDeleteTarget(null);
  };

  const outlineContent = (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Outline Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="text-xs font-bold text-slate-200 truncate" title={project.title}>
            {project.title}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onAddChapter(project.acts[0]?.id)}
            title="Добавить главу"
            className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          {isOpenMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Acts, Chapters, Scenes Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3 scrollbar-thin">
        {project.acts.map(act => (
          <div key={act.id} className="space-y-1.5">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between group">
              <span className="truncate">{act.title}</span>
              <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition">
                <button
                  onClick={() => onAddChapter(act.id)}
                  title="Добавить главу в этот акт"
                  className="hover:text-rose-400 p-0.5"
                >
                  <Plus className="w-3 h-3" />
                </button>
                {project.acts.length > 1 && (
                  <button
                    onClick={() => setDeleteTarget({ type: 'act', id: act.id, title: act.title })}
                    title="Удалить акт в корзину"
                    className="hover:text-red-400 p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {act.chapters.map(ch => {
              const isCollapsed = !!collapsedChapters[ch.id];
              return (
                <div key={ch.id} className="space-y-1">
                  <div
                    onClick={(e) => toggleChapterCollapse(ch.id, e)}
                    className="flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900/60 hover:bg-slate-900 rounded border border-slate-800/60 cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isCollapsed ? (
                        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate">{ch.title}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => onAddScene(ch.id)}
                        title="Добавить сцену в эту главу"
                        className="text-slate-400 hover:text-rose-400 p-0.5 rounded cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'chapter', id: ch.id, title: ch.title })}
                        title="Удалить главу в корзину"
                        className="text-slate-500 hover:text-red-400 p-0.5 rounded cursor-pointer opacity-40 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div className="pl-2 space-y-0.5">
                      {ch.scenes.map(sc => {
                        const isSelected = sc.id === activeSceneId;
                        return (
                          <div
                            key={sc.id}
                            className={`w-full group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition cursor-pointer ${
                              isSelected
                                ? 'bg-rose-950/60 text-rose-200 border border-rose-800/50 font-medium'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                            }`}
                            onClick={() => {
                              onSelectScene(sc.id);
                              if (isOpenMobile) onCloseMobile();
                            }}
                          >
                            <span className="truncate mr-2 flex-1">{sc.title || 'Безымянная сцена'}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400">
                                {sc.wordCount || 0}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget({ type: 'scene', id: sc.id, title: sc.title || 'Сцена' });
                                }}
                                title="Удалить сцену в корзину"
                                className="text-slate-500 hover:text-red-400 p-0.5 rounded opacity-0 group-hover:opacity-100 transition cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {ch.scenes.length === 0 && (
                        <div className="px-3 py-1.5 text-[11px] text-slate-500 italic">
                          Нет сцен в этой главе
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Outline Footer: Add Act Button */}
      <div className="p-2 border-t border-slate-800 bg-slate-950 shrink-0">
        <button
          onClick={onAddAct}
          className="w-full py-1.5 px-2 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3 h-3 text-rose-400" />
          <span>Добавить акт</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={
          deleteTarget?.type === 'scene'
            ? 'Переместить сцену в корзину?'
            : deleteTarget?.type === 'chapter'
            ? 'Переместить главу в корзину?'
            : 'Переместить акт в корзину?'
        }
        description={`«${deleteTarget?.title}» будет перемещен(а) в корзину. Вы всегда сможете восстановить её из корзины в любое время.`}
        confirmText="В корзину"
        isPermanent={false}
      />
    </div>
  );

  return (
    <>
      {/* Desktop / Large Screen Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 border-r border-slate-800 flex-col shrink-0 min-h-0 h-full">
        {outlineContent}
      </aside>

      {/* Mobile Drawer (with backdrop and slide-in) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-45 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs animate-in fade-in"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {outlineContent}
          </div>
        </div>
      )}
    </>
  );
};
