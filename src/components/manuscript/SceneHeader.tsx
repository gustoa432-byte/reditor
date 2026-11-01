import React, { useState } from 'react';
import { Scene } from '../../types';
import {
  Menu,
  Sliders,
  Maximize2,
  Trash2,
  Clock,
  Feather,
  SlidersHorizontal,
  History,
  Layers,
  Sparkles
} from 'lucide-react';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

interface SceneHeaderProps {
  scene: Scene;
  activeTab: 'editor' | 'passport' | 'matrix' | 'history';
  onSelectTab: (tab: 'editor' | 'passport' | 'matrix' | 'history') => void;
  onUpdateTitle: (title: string) => void;
  onUpdateStatus: (status: Scene['status']) => void;
  onToggleOutlineMobile: () => void;
  onToggleInspector: () => void;
  showInspector: boolean;
  onToggleFocusMode: () => void;
  onDeleteScene: (sceneId: string, title: string) => void;
}

export const SceneHeader: React.FC<SceneHeaderProps> = ({
  scene,
  activeTab,
  onSelectTab,
  onUpdateTitle,
  onUpdateStatus,
  onToggleOutlineMobile,
  onToggleInspector,
  showInspector,
  onToggleFocusMode,
  onDeleteScene
}) => {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const statusLabels: Record<Scene['status'], { label: string; color: string }> = {
    draft: { label: 'Черновик', color: 'bg-slate-800 text-slate-300 border-slate-700' },
    in_progress: { label: 'В работе', color: 'bg-amber-950/60 text-amber-300 border-amber-800/40' },
    revised: { label: 'Вычитано', color: 'bg-blue-950/60 text-blue-300 border-blue-800/40' },
    final: { label: 'Финал', color: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' }
  };

  const readingTimeMin = Math.max(1, Math.ceil((scene.wordCount || 0) / 180));

  return (
    <>
      <div className="border-b border-slate-800 bg-slate-900/40 px-3 sm:px-4 py-2.5 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Outline toggle for mobile & Scene Title */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              onClick={onToggleOutlineMobile}
              title="Открыть структуру рукописи"
              className="lg:hidden p-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={scene.title}
              onChange={(e) => onUpdateTitle(e.target.value)}
              placeholder="Название сцены..."
              className="bg-transparent text-sm sm:text-base font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500/50 rounded px-1.5 py-0.5 truncate flex-1 min-w-0"
            />
          </div>

          {/* Right: Status, Word count, Focus Mode, Inspector Toggle, Delete */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Status Selector */}
            <select
              value={scene.status}
              onChange={(e) => onUpdateStatus(e.target.value as Scene['status'])}
              className={`text-xs px-2 py-1 rounded-md border font-medium bg-slate-950 cursor-pointer focus:outline-none ${statusLabels[scene.status].color}`}
            >
              <option value="draft">Черновик</option>
              <option value="in_progress">В работе</option>
              <option value="revised">Вычитано</option>
              <option value="final">Финал</option>
            </select>

            {/* Word count and reading time */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-slate-950/60 px-2 py-1 rounded border border-slate-800">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{scene.wordCount || 0} сл. (~{readingTimeMin} мин)</span>
            </div>

            {/* Inspector Toggle Button */}
            <button
              onClick={onToggleInspector}
              title={showInspector ? 'Скрыть контекстный инспектор' : 'Показать контекстный инспектор'}
              className={`p-1.5 rounded-md border text-xs transition cursor-pointer ${
                showInspector
                  ? 'bg-rose-950/60 text-rose-200 border-rose-800/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Focus Mode Button */}
            <button
              onClick={onToggleFocusMode}
              title="Режим фокусировки (дзен-режим без панелей)"
              className="p-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-300 hover:border-rose-900/50 transition cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Delete Scene Button */}
            <button
              onClick={() => setConfirmDeleteOpen(true)}
              title="Переместить сцену в корзину"
              className="p-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-900/50 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 border-t border-slate-800/60 pt-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => onSelectTab('editor')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'editor'
                ? 'bg-rose-950 text-rose-200 border border-rose-800/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Текст</span>
          </button>
          <button
            onClick={() => onSelectTab('passport')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'passport'
                ? 'bg-rose-950 text-rose-200 border border-rose-800/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Паспорт сцены</span>
          </button>
          <button
            onClick={() => onSelectTab('matrix')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'matrix'
                ? 'bg-rose-950 text-rose-200 border border-rose-800/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Матрица линий</span>
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'history'
                ? 'bg-rose-950 text-rose-200 border border-rose-800/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>История ({scene.revisions?.length || 0})</span>
          </button>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={() => onDeleteScene(scene.id, scene.title)}
        title="Переместить сцену в корзину?"
        description={`Сцена «${scene.title}» будет перемещена в корзину. Вы всегда сможете восстановить её со всем текстом и историей.`}
        confirmText="В корзину"
        isPermanent={false}
      />
    </>
  );
};
