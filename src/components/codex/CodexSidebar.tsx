import React from 'react';
import { CodexEntity, EntityType, CanonStatus } from '../../types';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  X,
  Menu
} from 'lucide-react';

interface CodexSidebarProps {
  entities: CodexEntity[];
  selectedEntityId?: string;
  onSelectEntity: (entityId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: EntityType | 'all';
  onTypeFilterChange: (type: EntityType | 'all') => void;
  statusFilter: CanonStatus | 'all';
  onStatusFilterChange: (status: CanonStatus | 'all') => void;
  onOpenAddModal: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const CodexSidebar: React.FC<CodexSidebarProps> = ({
  entities,
  selectedEntityId,
  onSelectEntity,
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  onOpenAddModal,
  isOpenMobile,
  onCloseMobile
}) => {
  const filteredEntities = entities.filter(ent => {
    if (typeFilter !== 'all' && ent.type !== typeFilter) return false;
    if (statusFilter !== 'all' && ent.canonStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = ent.title.toLowerCase().includes(q);
      const inDesc = ent.description.toLowerCase().includes(q);
      const inTags = ent.tags?.some(t => t.toLowerCase().includes(q));
      if (!inTitle && !inDesc && !inTags) return false;
    }
    return true;
  });

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Top Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-bold text-slate-200">
            База знаний ({entities.length})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenAddModal}
            className="p-1 rounded bg-rose-600 hover:bg-rose-500 text-white transition cursor-pointer"
            title="Создать новую сущность"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          {isOpenMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-2 border-b border-slate-800 space-y-2 shrink-0 bg-slate-950">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Поиск по названию, тегам..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <select
            value={typeFilter}
            onChange={e => onTypeFilterChange(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 text-[11px] text-slate-300 rounded px-2 py-1 focus:outline-none cursor-pointer truncate"
          >
            <option value="all">Все типы</option>
            <option value="character">Персонажи</option>
            <option value="location">Локации</option>
            <option value="civilization">Цивилизации</option>
            <option value="organization">Организации</option>
            <option value="technology">Технологии</option>
            <option value="epoch">Эпохи</option>
            <option value="artifact">Артефакты</option>
            <option value="species">Виды</option>
            <option value="concept">Концепции</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => onStatusFilterChange(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 text-[11px] text-slate-300 rounded px-2 py-1 focus:outline-none cursor-pointer truncate"
          >
            <option value="all">Любой статус</option>
            <option value="canon">Канон</option>
            <option value="hypothesis">Гипотеза</option>
            <option value="alternative">Альтернатива</option>
            <option value="rejected">Архив</option>
          </select>
        </div>
      </div>

      {/* Entities List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
        {filteredEntities.map(ent => {
          const isSelected = ent.id === selectedEntityId;
          return (
            <button
              key={ent.id}
              onClick={() => {
                onSelectEntity(ent.id);
                if (isOpenMobile) onCloseMobile();
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex items-center justify-between group cursor-pointer ${
                isSelected
                  ? 'bg-rose-950/60 text-rose-200 border border-rose-800/50 shadow-sm font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="min-w-0 flex-1 mr-2">
                <div className="font-medium text-slate-200 truncate group-hover:text-rose-200 transition">
                  {ent.title}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <span className="capitalize">{ent.type}</span>
                  <span>·</span>
                  <span className="font-mono">{ent.dynamicStates?.length || 0} сост.</span>
                </div>
              </div>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                  ent.canonStatus === 'canon'
                    ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/40'
                    : ent.canonStatus === 'hypothesis'
                    ? 'bg-amber-950/50 text-amber-400 border-amber-800/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {ent.canonStatus}
              </span>
            </button>
          );
        })}

        {filteredEntities.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-500">
            Сущностей не найдено
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-72 xl:w-80 border-r border-slate-800 flex-col shrink-0 min-h-0 h-full">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-45 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs animate-in fade-in"
            onClick={onCloseMobile}
          />
          <div className="relative w-80 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
