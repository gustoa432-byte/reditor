import React, { useState, useEffect, useMemo } from 'react';
import { UniverseData, WorkspaceTab } from '../types';
import { Search, X, BookOpen, Feather, Clock, FlaskConical, ChevronRight } from 'lucide-react';

interface OmnisearchProps {
  isOpen: boolean;
  onClose: () => void;
  universe: UniverseData;
  onNavigate: (tab: WorkspaceTab, targetId?: string) => void;
}

export const Omnisearch: React.FC<OmnisearchProps> = ({
  isOpen,
  onClose,
  universe,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'entities' | 'scenes' | 'events' | 'lab'>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: {
      id: string;
      title: string;
      subtitle: string;
      type: 'entity' | 'scene' | 'event' | 'lab';
      tab: WorkspaceTab;
      badge: string;
    }[] = [];

    // Search entities
    if (selectedFilter === 'all' || selectedFilter === 'entities') {
      universe.entities.forEach(ent => {
        if (
          ent.title.toLowerCase().includes(q) ||
          ent.description.toLowerCase().includes(q) ||
          ent.tags.some(t => t.toLowerCase().includes(q)) ||
          (ent.altNames && ent.altNames.some(a => a.toLowerCase().includes(q)))
        ) {
          results.push({
            id: ent.id,
            title: ent.title,
            subtitle: ent.description.slice(0, 90) + '...',
            type: 'entity',
            tab: 'codex',
            badge: ent.type
          });
        }
      });
    }

    // Search scenes
    if (selectedFilter === 'all' || selectedFilter === 'scenes') {
      universe.projects.forEach(proj => {
        proj.acts.forEach(act => {
          act.chapters.forEach(ch => {
            ch.scenes.forEach(sc => {
              if (
                sc.title.toLowerCase().includes(q) ||
                sc.text.toLowerCase().includes(q) ||
                sc.passport.characterGoal.toLowerCase().includes(q)
              ) {
                results.push({
                  id: sc.id,
                  title: `${ch.title}: ${sc.title}`,
                  subtitle: sc.text.slice(0, 90) + '...',
                  type: 'scene',
                  tab: 'manuscript',
                  badge: 'Сцена'
                });
              }
            });
          });
        });
      });
    }

    // Search events
    if (selectedFilter === 'all' || selectedFilter === 'events') {
      universe.events.forEach(evt => {
        if (
          evt.title.toLowerCase().includes(q) ||
          evt.description.toLowerCase().includes(q) ||
          evt.actualTime.display.toLowerCase().includes(q)
        ) {
          results.push({
            id: evt.id,
            title: evt.title,
            subtitle: `${evt.actualTime.display} — ${evt.description.slice(0, 80)}...`,
            type: 'event',
            tab: 'timeline',
            badge: 'Событие'
          });
        }
      });
    }

    // Search lab hypotheses & questions
    if (selectedFilter === 'all' || selectedFilter === 'lab') {
      universe.hypotheses.forEach(hyp => {
        if (hyp.title.toLowerCase().includes(q) || hyp.content.toLowerCase().includes(q)) {
          results.push({
            id: hyp.id,
            title: hyp.title,
            subtitle: hyp.content.slice(0, 80) + '...',
            type: 'lab',
            tab: 'lab',
            badge: `Гипотеза: ${hyp.status}`
          });
        }
      });

      universe.questions.forEach(ques => {
        if (ques.title.toLowerCase().includes(q) || ques.description.toLowerCase().includes(q)) {
          results.push({
            id: ques.id,
            title: ques.title,
            subtitle: ques.description.slice(0, 80) + '...',
            type: 'lab',
            tab: 'lab',
            badge: `Вопрос: ${ques.status}`
          });
        }
      });
    }

    return results.slice(0, 20);
  }, [query, universe, selectedFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-rose-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Поиск по персонажам, сценам, событиям, гипотезам и канону..."
            autoFocus
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm focus:outline-none"
          />
          <button
            onClick={onClose}
            aria-label="Закрыть поиск"
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-950/60 border-b border-slate-800 text-xs overflow-x-auto">
          <span className="text-slate-400 mr-1">Фильтр:</span>
          {(['all', 'entities', 'scenes', 'events', 'lab'] as const).map(f => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition ${
                selectedFilter === f
                  ? 'bg-rose-900/60 text-rose-200 border border-rose-700/50'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {f === 'all' && 'Всё'}
              {f === 'entities' && 'База знаний'}
              {f === 'scenes' && 'Рукопись / Сцены'}
              {f === 'events' && 'Хронология'}
              {f === 'lab' && 'Лаборатория'}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/60 p-1">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Введите ключевое слово, имя персонажа или событие для сквозного поиска по вселенной REDCROW 3000
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              По запросу «<span className="text-slate-200">{query}</span>» ничего не найдено в каноне
            </div>
          ) : (
            searchResults.map(item => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => {
                  onNavigate(item.tab, item.id);
                  onClose();
                }}
                className="w-full text-left p-3 hover:bg-slate-800/70 rounded-lg flex items-center justify-between gap-3 group transition cursor-pointer"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 group-hover:text-rose-400 group-hover:border-rose-900 transition shrink-0">
                    {item.type === 'entity' && <BookOpen className="w-4 h-4" />}
                    {item.type === 'scene' && <Feather className="w-4 h-4" />}
                    {item.type === 'event' && <Clock className="w-4 h-4" />}
                    {item.type === 'lab' && <FlaskConical className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-100 group-hover:text-rose-200 truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200 shrink-0 transition" />
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Навигация: ↵ переход · Esc закрыть</span>
          <span>Вселенная REDCROW 3000</span>
        </div>
      </div>
    </div>
  );
};
