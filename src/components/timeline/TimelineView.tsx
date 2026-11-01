import React, { useState } from 'react';
import { DatePrecision, UniverseData, UniverseUpdater, WorldEvent, WorkspaceTab } from '../../types';
import {
  Clock,
  Plus,
  Filter,
  Eye,
  Calendar,
  Layers,
  ArrowRight,
  BookOpen,
  Sparkles,
  X
} from 'lucide-react';

interface TimelineViewProps {
  universe: UniverseData;
  onUpdateUniverse: (updater: UniverseUpdater) => void;
  onNavigate: (tab: WorkspaceTab, targetId?: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  universe,
  onUpdateUniverse,
  onNavigate
}) => {
  const [viewMode, setViewMode] = useState<'actual' | 'reader_reveal'>('actual');
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<string>('all');
  const [addEventModalOpen, setAddEventModalOpen] = useState(false);

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDateDisplay, setNewDateDisplay] = useState('');
  const [newPrecision, setNewPrecision] = useState<DatePrecision>('exact');
  const [newYearNum, setNewYearNum] = useState<number>(2450);
  const [newDiscoveryTime, setNewDiscoveryTime] = useState('');
  const [newReaderReveal, setNewReaderReveal] = useState('');
  const [newEntities, setNewEntities] = useState<string[]>([]);

  // Sort events by actual yearNum
  const sortedEvents = [...universe.events].sort((a, b) => {
    const yA = a.actualTime.yearNum ?? 0;
    const yB = b.actualTime.yearNum ?? 0;
    return yA - yB;
  });

  const filteredEvents = sortedEvents.filter(evt => {
    if (selectedEntityFilter !== 'all') {
      if (!evt.participatingEntityIds.includes(selectedEntityFilter)) return false;
    }
    return true;
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEvt: WorldEvent = {
      id: `evt-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Описание события.',
      actualTime: {
        precision: newPrecision,
        display: newDateDisplay.trim() || `${newYearNum} г.`,
        yearNum: newYearNum
      },
      discoveryTime: newDiscoveryTime.trim() || 'Сразу после свершения',
      readerReveal: {
        description: newReaderReveal.trim() || 'Раскрывается в основном повествовании'
      },
      participatingEntityIds: newEntities,
      canonStatus: 'canon',
      isMilestone: true
    };

    onUpdateUniverse(prev => ({
      ...prev,
      events: [...prev.events, newEvt]
    }));

    setAddEventModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewDateDisplay('');
    setNewDiscoveryTime('');
    setNewReaderReveal('');
    setNewEntities([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-400" />
            <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-100">
              Хронология вселенной REDCROW 3000
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Многослойная временная шкала с разделением трёх измерений: реального времени события, момента обнаружения героями и времени раскрытия читателю.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Dimension Switcher */}
          <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex items-center gap-1 text-xs">
            <button
              onClick={() => setViewMode('actual')}
              className={`px-3 py-1.5 rounded font-medium transition cursor-pointer ${
                viewMode === 'actual'
                  ? 'bg-rose-950 text-rose-200 border border-rose-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Объективная хронология
            </button>
            <button
              onClick={() => setViewMode('reader_reveal')}
              className={`px-3 py-1.5 rounded font-medium transition cursor-pointer ${
                viewMode === 'reader_reveal'
                  ? 'bg-purple-950 text-purple-200 border border-purple-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Раскрытие читателю
            </button>
          </div>

          <button
            onClick={() => setAddEventModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить событие</span>
          </button>
        </div>
      </div>

      {/* Filter by Character / Location */}
      <div className="flex items-center gap-2 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 overflow-x-auto">
        <span className="text-slate-400 font-mono flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5 text-rose-400" />
          Фильтр по линии:
        </span>
        <button
          onClick={() => setSelectedEntityFilter('all')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 cursor-pointer transition ${
            selectedEntityFilter === 'all'
              ? 'bg-rose-900/40 text-rose-200 border border-rose-700/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Все события ({universe.events.length})
        </button>
        {universe.entities.filter(e => e.type === 'character' || e.type === 'location').map(ent => (
          <button
            key={ent.id}
            onClick={() => setSelectedEntityFilter(ent.id)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 cursor-pointer transition ${
              selectedEntityFilter === ent.id
                ? 'bg-rose-900/40 text-rose-200 border border-rose-700/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {ent.title}
          </button>
        ))}
      </div>

      {/* Timeline Stream View */}
      <div className="relative pl-6 md:pl-8 border-l-2 border-rose-950/60 space-y-8 my-6">
        {filteredEvents.map((evt, idx) => {
          const participants = evt.participatingEntityIds
            .map(id => universe.entities.find(e => e.id === id))
            .filter(Boolean);

          return (
            <div key={evt.id} className="relative group">
              {/* Timeline marker node */}
              <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-rose-500 shadow-md shadow-rose-950 group-hover:scale-125 transition" />

              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-lg space-y-3">
                {/* Event Top Meta */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                      {evt.actualTime.display}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {evt.actualTime.precision === 'exact' ? 'Точная дата' : 'Приблизительная дата'}
                    </span>
                    {evt.isMilestone && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                        Узловой перелом
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    ID: {evt.id}
                  </span>
                </div>

                {/* Event Title & Description */}
                <div>
                  <h3 className="text-base font-serif font-bold text-slate-100">{evt.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{evt.description}</p>
                </div>

                {/* Three Temporal Dimensions Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                  {/* 1. Actual Time */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/70 space-y-1">
                    <span className="text-[10px] font-mono text-rose-400 uppercase flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3" />
                      1. Фактическое время:
                    </span>
                    <div className="font-medium text-slate-200">{evt.actualTime.display}</div>
                    <p className="text-[11px] text-slate-400">Объективный момент свершения во вселенной.</p>
                  </div>

                  {/* 2. Discovery Time */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/70 space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 uppercase flex items-center gap-1 font-semibold">
                      <Eye className="w-3 h-3" />
                      2. Время обнаружения:
                    </span>
                    <div className="font-medium text-slate-200">{evt.discoveryTime}</div>
                    <p className="text-[11px] text-slate-400">Когда о событии узнали персонажи или исследователи.</p>
                  </div>

                  {/* 3. Reader Reveal Time */}
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/70 space-y-1">
                    <span className="text-[10px] font-mono text-purple-400 uppercase flex items-center gap-1 font-semibold">
                      <BookOpen className="w-3 h-3" />
                      3. Раскрытие читателю:
                    </span>
                    <div className="font-medium text-purple-200">
                      {evt.readerReveal.chapterScene || evt.readerReveal.bookTitle || 'Роман'}
                    </div>
                    <p className="text-[11px] text-slate-300">{evt.readerReveal.description}</p>
                  </div>
                </div>

                {/* Participants Pills */}
                {participants.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase mr-1">Участники:</span>
                    {participants.map(p => (
                      <button
                        key={p?.id}
                        onClick={() => onNavigate('codex', p?.id)}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                      >
                        {p?.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Event Modal */}
      {addEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateEvent}
            className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-400" />
                Новое событие хронологии
              </h3>
              <button
                type="button"
                onClick={() => setAddEventModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Название события:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Например: Взрыв Реактора Сердца на Чёрном острове..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Описание:</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Что произошло, масштаб последствий..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Точность даты:</label>
                  <select
                    value={newPrecision}
                    onChange={e => setNewPrecision(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  >
                    <option value="exact">Точная дата</option>
                    <option value="approximate">Приблизительно</option>
                    <option value="range">Диапазон</option>
                    <option value="relative">Относительная</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Отображение даты:</label>
                  <input
                    type="text"
                    value={newDateDisplay}
                    onChange={e => setNewDateDisplay(e.target.value)}
                    placeholder="ок. 2450 г. или 14 мая 2450"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Год (для шкалы):</label>
                  <input
                    type="number"
                    value={newYearNum}
                    onChange={e => setNewYearNum(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* 3 Time Dimensions */}
              <div className="p-3 rounded bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-purple-400 uppercase font-semibold block">
                  Три временных измерения события:
                </span>
                <div>
                  <label className="text-slate-400 block mb-1">Время обнаружения персонажами:</label>
                  <input
                    type="text"
                    value={newDiscoveryTime}
                    onChange={e => setNewDiscoveryTime(e.target.value)}
                    placeholder="Например: 12 лет спустя экспедицией колоний..."
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Время раскрытия читателю:</label>
                  <input
                    type="text"
                    value={newReaderReveal}
                    onChange={e => setNewReaderReveal(e.target.value)}
                    placeholder="Например: Раскрывается во флешбэке Фелиции в Главе 3..."
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAddEventModalOpen(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Сохранить событие
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
