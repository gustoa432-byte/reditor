import React, { useState } from 'react';
import { UniverseData, TrashItem, TrashItemType, UniverseUpdater } from '../../types';
import {
  restoreTrashItem,
  permanentlyDeleteTrashItem,
  emptyTrash
} from '../../utils/universeOps';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import {
  Trash2,
  RotateCcw,
  X,
  Feather,
  BookOpen,
  Clock,
  FlaskConical,
  Layers,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  universe: UniverseData;
  onUpdateUniverse: (updater: UniverseUpdater) => void;
}

export const TrashModal: React.FC<TrashModalProps> = ({
  isOpen,
  onClose,
  universe,
  onUpdateUniverse
}) => {
  const [filterType, setFilterType] = useState<TrashItemType | 'all'>('all');
  const [itemToPurge, setItemToPurge] = useState<TrashItem | null>(null);
  const [confirmEmptyOpen, setConfirmEmptyOpen] = useState(false);
  const [restoredNotice, setRestoredNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const trashItems = universe.trash || [];
  const filteredItems = filterType === 'all'
    ? trashItems
    : trashItems.filter(item => item.itemType === filterType);

  const getItemTypeBadge = (type: TrashItemType) => {
    switch (type) {
      case 'scene':
        return { label: 'Сцена', icon: Feather, color: 'bg-rose-950/60 text-rose-300 border-rose-800/40' };
      case 'chapter':
        return { label: 'Глава', icon: Layers, color: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40' };
      case 'act':
        return { label: 'Акт', icon: Layers, color: 'bg-purple-950/60 text-purple-300 border-purple-800/40' };
      case 'entity':
        return { label: 'Сущность', icon: BookOpen, color: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' };
      case 'event':
        return { label: 'Событие', icon: Clock, color: 'bg-amber-950/60 text-amber-300 border-amber-800/40' };
      case 'question':
      case 'hypothesis':
        return { label: 'Лаборатория', icon: FlaskConical, color: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/40' };
      default:
        return { label: 'Элемент', icon: Trash2, color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const handleRestore = (item: TrashItem) => {
    onUpdateUniverse(prev => restoreTrashItem(prev, item.id));
    setRestoredNotice(`«${item.title}» успешно восстановлен(а)`);
    setTimeout(() => setRestoredNotice(null), 3000);
  };

  const handlePurge = () => {
    if (!itemToPurge) return;
    onUpdateUniverse(prev => permanentlyDeleteTrashItem(prev, itemToPurge.id));
    setItemToPurge(null);
  };

  const handleEmptyAll = () => {
    onUpdateUniverse(prev => emptyTrash(prev));
    setConfirmEmptyOpen(false);
  };

  const formatDeletedDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-100">Корзина вселенной</h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {trashItems.length}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Удалённые сущности, главы, сцены и события с возможностью быстрого восстановления
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {trashItems.length > 0 && (
                <button
                  onClick={() => setConfirmEmptyOpen(true)}
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/50 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Очистить корзину</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Restored notice banner */}
          {restoredNotice && (
            <div className="bg-emerald-950/80 border-b border-emerald-800/60 text-emerald-300 text-xs px-6 py-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{restoredNotice}</span>
            </div>
          )}

          {/* Filters Bar */}
          {trashItems.length > 0 && (
            <div className="px-6 py-2.5 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <button
                onClick={() => setFilterType('all')}
                className={`text-xs px-2.5 py-1 rounded-md transition cursor-pointer shrink-0 ${
                  filterType === 'all'
                    ? 'bg-rose-950 text-rose-200 border border-rose-800/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Все ({trashItems.length})
              </button>
              {(['scene', 'chapter', 'act', 'entity', 'event', 'question'] as TrashItemType[]).map(t => {
                const count = trashItems.filter(i => i.itemType === t).length;
                if (count === 0) return null;
                const { label } = getItemTypeBadge(t);
                return (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`text-xs px-2.5 py-1 rounded-md transition cursor-pointer shrink-0 ${
                      filterType === t
                        ? 'bg-rose-950 text-rose-200 border border-rose-800/60'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {label} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* List of items */}
          <div className="flex-1 min-h-0 overflow-y-auto p-6 divide-y divide-slate-800/60">
            {trashItems.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-800/60 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Trash2 className="w-6 h-6 opacity-60" />
                </div>
                <h4 className="text-sm font-medium text-slate-300">Корзина пуста</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                  При удалении сцен, глав, актов, сущностей Кодекса или событий они помещаются сюда,
                  чтобы вы могли восстановить их в один клик.
                </p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Нет удалённых объектов выбранного типа.
              </div>
            ) : (
              filteredItems.map(item => {
                const { label, icon: Icon, color } = getItemTypeBadge(item.itemType);
                return (
                  <div
                    key={item.id}
                    className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="mt-0.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border ${color}`}>
                          <Icon className="w-3 h-3" />
                          <span>{label}</span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-slate-200 truncate group-hover:text-rose-200 transition">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          {item.originalPath && (
                            <span className="truncate max-w-[220px]" title={item.originalPath}>
                              {item.originalPath}
                            </span>
                          )}
                          <span>·</span>
                          <span>Удалено: {formatDeletedDate(item.deletedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleRestore(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 hover:text-emerald-200 border border-emerald-800/40 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
                        title="Восстановить в проект"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Восстановить</span>
                      </button>
                      <button
                        onClick={() => setItemToPurge(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition cursor-pointer"
                        title="Удалить навсегда"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
            <span>Объекты хранятся до ручной очистки</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>

      {/* Purge Single Item Confirmation */}
      <ConfirmDeleteModal
        isOpen={!!itemToPurge}
        onClose={() => setItemToPurge(null)}
        onConfirm={handlePurge}
        title="Окончательно удалить объект?"
        description={`«${itemToPurge?.title}» будет безвозвратно удалён из корзины. Это действие нельзя будет отменить.`}
        confirmText="Удалить навсегда"
        isPermanent={true}
      />

      {/* Empty All Trash Confirmation */}
      <ConfirmDeleteModal
        isOpen={confirmEmptyOpen}
        onClose={() => setConfirmEmptyOpen(false)}
        onConfirm={handleEmptyAll}
        title="Очистить всю корзину?"
        description={`Все объекты в корзине (${trashItems.length} шт.) будут безвозвратно удалены. Восстановить их будет невозможно.`}
        confirmText="Очистить всё"
        isPermanent={true}
      />
    </>
  );
};
