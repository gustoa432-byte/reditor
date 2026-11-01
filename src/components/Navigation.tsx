import React from 'react';
import { WorkspaceTab, UniverseData } from '../types';
import {
  Feather,
  BookOpen,
  Compass,
  Clock,
  FlaskConical,
  Share2,
  AlertTriangle,
  Sparkles,
  Search,
  Download,
  Plus,
  Trash2
} from 'lucide-react';

interface NavigationProps {
  currentTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  universe: UniverseData;
  onOpenSearch: () => void;
  onOpenExport: () => void;
  onOpenTrash: () => void;
  onQuickCreate: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  universe,
  onOpenSearch,
  onOpenExport,
  onOpenTrash,
  onQuickCreate
}) => {
  const unresolvedIssuesCount = universe.consistencyIssues.filter(i => !i.isIntentional).length;
  const openQuestionsCount = universe.questions.filter(q => q.status !== 'resolved').length;
  const trashCount = universe.trash?.length || 0;

  const tabs: { id: WorkspaceTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Главная', icon: Compass },
    { id: 'manuscript', label: 'Мастерская текста', icon: Feather },
    { id: 'codex', label: 'База знаний', icon: BookOpen, badge: universe.entities.length },
    { id: 'timeline', label: 'Хронология', icon: Clock, badge: universe.events.length },
    { id: 'lab', label: 'Лаборатория', icon: FlaskConical, badge: openQuestionsCount },
    { id: 'graph', label: 'Визуальная карта', icon: Share2 },
    { id: 'audit', label: 'Аудит канона', icon: AlertTriangle, badge: unresolvedIssuesCount > 0 ? unresolvedIssuesCount : undefined },
    { id: 'ai', label: 'ИИ-Ассистент', icon: Sparkles }
  ];

  return (
    <header className="bg-slate-950/95 border-b border-rose-950/40 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-4 py-2 shrink-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand / Title & Universe Settings Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenExport}
            title="Управление вселенной и свойствами канона"
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-rose-700 via-red-900 to-slate-900 flex items-center justify-center border border-rose-500/30 shadow-lg shadow-rose-950/50 group-hover:border-rose-400/60 transition">
              <span className="font-serif font-black text-rose-200 tracking-wider text-sm sm:text-base">
                {universe.universeName.slice(0, 2).toUpperCase() || 'RC'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-serif font-bold text-slate-100 tracking-wider text-sm sm:text-base group-hover:text-rose-200 transition truncate max-w-[130px] sm:max-w-[200px] md:max-w-xs">
                  {universe.universeName || 'REDCROW 3000'}
                </span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40 uppercase">
                  v{universe.version}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-sans hidden md:block truncate max-w-xs group-hover:text-slate-300 transition">
                {universe.tagline || 'Авторская среда канона'}
              </p>
            </div>
          </button>
        </div>

        {/* Workspace Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 min-w-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                aria-label={tab.label}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-rose-900/40 text-rose-200 border border-rose-600/50 shadow-sm shadow-rose-950/50'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                <span className="whitespace-nowrap">{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full font-mono shrink-0 ${
                      tab.id === 'audit' && unresolvedIssuesCount > 0
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : isActive
                        ? 'bg-rose-950 text-rose-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Global Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onOpenSearch}
            aria-label="Быстрый поиск по вселенной"
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700 text-xs transition cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden lg:inline text-slate-400">Поиск...</span>
            <kbd className="hidden lg:inline-block font-mono text-[10px] bg-slate-800 px-1 py-0.2 rounded text-slate-400 border border-slate-700">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={onQuickCreate}
            aria-label="Создать элемент"
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium shadow-sm shadow-rose-950/40 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Создать</span>
          </button>

          {/* Trash Trigger */}
          <button
            onClick={onOpenTrash}
            aria-label="Корзина вселенной"
            title={`Корзина вселенной (${trashCount})`}
            className="relative p-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {trashCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-[10px] font-mono text-white rounded-full flex items-center justify-center font-bold">
                {trashCount > 9 ? '9+' : trashCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenExport}
            aria-label="Экспорт и резервное копирование"
            title="Экспорт и резервные копии"
            className="p-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
