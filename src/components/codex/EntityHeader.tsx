import React, { useState } from 'react';
import { CodexEntity, CanonStatus, WorldCredibility } from '../../types';
import {
  Menu,
  Trash2,
  ArrowRightLeft,
  Plus,
  BookOpen,
  Tag,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

interface EntityHeaderProps {
  entity: CodexEntity;
  onUpdateEntity: <K extends keyof CodexEntity>(field: K, value: CodexEntity[K]) => void;
  onToggleSidebarMobile: () => void;
  onOpenCompareModal: () => void;
  onOpenAddStateModal: () => void;
  onDeleteEntity: (entityId: string, title: string) => void;
}

export const EntityHeader: React.FC<EntityHeaderProps> = ({
  entity,
  onUpdateEntity,
  onToggleSidebarMobile,
  onOpenCompareModal,
  onOpenAddStateModal,
  onDeleteEntity
}) => {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  return (
    <>
      <div className="border-b border-slate-800 bg-slate-900/40 p-4 space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Title and Mobile Sidebar Button */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <button
              onClick={onToggleSidebarMobile}
              title="Открыть список сущностей"
              className="lg:hidden p-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40">
                  {entity.type}
                </span>
                <input
                  type="text"
                  value={entity.title}
                  onChange={e => onUpdateEntity('title', e.target.value)}
                  placeholder="Название сущности..."
                  className="bg-transparent font-serif font-bold text-lg sm:text-xl text-slate-100 focus:outline-none focus:border-b focus:border-rose-500 border-b border-transparent truncate min-w-0"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {entity.dynamicStates.length >= 2 && (
              <button
                onClick={onOpenCompareModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
                title="Сравнить два хронологических состояния"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Сравнить состояния</span>
              </button>
            )}

            <button
              onClick={onOpenAddStateModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-900/50 hover:bg-cyan-800 text-cyan-200 border border-cyan-700/50 text-xs font-medium transition cursor-pointer"
              title="Добавить состояние сущности в определённую эпоху"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Новое состояние</span>
            </button>

            <button
              onClick={() => setConfirmDeleteOpen(true)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-900/50 transition cursor-pointer"
              title="Переместить сущность в корзину"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canon Status & Credibility Selectors */}
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-mono">Статус:</span>
            <select
              value={entity.canonStatus}
              onChange={e => onUpdateEntity('canonStatus', e.target.value as CanonStatus)}
              className="bg-slate-900 border border-slate-700 text-xs font-medium text-slate-200 rounded px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="canon">Канон вселенной</option>
              <option value="hypothesis">Гипотеза</option>
              <option value="alternative">Альтернативная версия</option>
              <option value="rejected">Архив / Отвергнуто</option>
              <option value="note">Внутренняя заметка</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-mono">Достоверность:</span>
            <select
              value={entity.credibility}
              onChange={e => onUpdateEntity('credibility', e.target.value as WorldCredibility)}
              className="bg-slate-900 border border-slate-700 text-xs font-medium text-slate-200 rounded px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="fact">Подтверждённый факт</option>
              <option value="disputed">Спорное утверждение</option>
              <option value="myth">Миф / Легенда</option>
              <option value="propaganda">Пропаганда</option>
              <option value="lie">Ложь персонажа</option>
              <option value="unknown">Неизвестно</option>
            </select>
          </div>

          {entity.altNames && entity.altNames.length > 0 && (
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <span className="font-mono">Альт.:</span>
              <span className="text-slate-300">{entity.altNames.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={() => onDeleteEntity(entity.id, entity.title)}
        title="Переместить сущность в корзину?"
        description={`«${entity.title}» будет перемещена в корзину со всеми динамическими состояниями и связями. Вы сможете восстановить её в любой момент.`}
        confirmText="В корзину"
        isPermanent={false}
      />
    </>
  );
};
