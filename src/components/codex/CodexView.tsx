import React, { useState } from 'react';
import {
  CanonStatus,
  CodexEntity,
  EntityState,
  EntityType,
  UniverseData,
  WorkspaceTab,
  WorldCredibility
} from '../../types';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Layers,
  Link2,
  Trash2,
  ExternalLink,
  Tag,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye,
  SlidersHorizontal,
  ArrowRightLeft,
  X
} from 'lucide-react';

interface CodexViewProps {
  universe: UniverseData;
  initialSelectedEntityId?: string;
  onUpdateUniverse: (updated: UniverseData) => void;
  onNavigate: (tab: WorkspaceTab, targetId?: string) => void;
}

export const CodexView: React.FC<CodexViewProps> = ({
  universe,
  initialSelectedEntityId,
  onUpdateUniverse,
  onNavigate
}) => {
  const [selectedEntityId, setSelectedEntityId] = useState<string>(() => {
    if (initialSelectedEntityId && universe.entities.some(e => e.id === initialSelectedEntityId)) {
      return initialSelectedEntityId;
    }
    return universe.entities[0]?.id || '';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<EntityType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CanonStatus | 'all'>('all');

  // State Comparator Modal state
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareStateAId, setCompareStateAId] = useState<string>('');
  const [compareStateBId, setCompareStateBId] = useState<string>('');

  // Add Dynamic State Modal state
  const [addStateModalOpen, setAddStateModalOpen] = useState(false);
  const [newStateEpoch, setNewStateEpoch] = useState('');
  const [newStateTitle, setNewStateTitle] = useState('');
  const [newStatePhysical, setNewStatePhysical] = useState('');
  const [newStateMental, setNewStateMental] = useState('');
  const [newStateAbilities, setNewStateAbilities] = useState('');
  const [newStateGoals, setNewStateGoals] = useState('');

  // Add Entity Modal state
  const [addEntityModalOpen, setAddEntityModalOpen] = useState(false);
  const [newEntityTitle, setNewEntityTitle] = useState('');
  const [newEntityType, setNewEntityType] = useState<EntityType>('character');
  const [newEntityDescription, setNewEntityDescription] = useState('');
  const [newEntityCanon, setNewEntityCanon] = useState<CanonStatus>('canon');

  const selectedEntity = universe.entities.find(e => e.id === selectedEntityId) || universe.entities[0];

  const filteredEntities = universe.entities.filter(ent => {
    if (typeFilter !== 'all' && ent.type !== typeFilter) return false;
    if (statusFilter !== 'all' && ent.canonStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = ent.title.toLowerCase().includes(q);
      const inDesc = ent.description.toLowerCase().includes(q);
      const inTags = ent.tags.some(t => t.toLowerCase().includes(q));
      if (!inTitle && !inDesc && !inTags) return false;
    }
    return true;
  });

  // Handler to update selected entity
  const handleUpdateEntity = (field: keyof CodexEntity, value: any) => {
    if (!selectedEntity) return;
    const updated = universe.entities.map(e => {
      if (e.id !== selectedEntity.id) return e;
      return {
        ...e,
        [field]: value,
        updatedAt: new Date().toISOString()
      };
    });
    onUpdateUniverse({ ...universe, entities: updated });
  };

  // Add Dynamic State
  const handleCreateDynamicState = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntity || !newStateTitle.trim()) return;

    const yearNumMatch = newStateEpoch.match(/\b(2\d{3}|1\d{3})\b/);
    const yearNum = yearNumMatch ? parseInt(yearNumMatch[1], 10) : undefined;

    const newState: EntityState = {
      id: `state-${Date.now()}`,
      epochOrYear: newStateEpoch.trim() || 'Новая эпоха',
      yearNum,
      title: newStateTitle.trim(),
      physicalState: newStatePhysical.trim() || 'Стандартное состояние',
      mentalState: newStateMental.trim() || 'Без существенных изменений',
      abilities: newStateAbilities.trim() || 'Базовые',
      goals: newStateGoals.trim() || 'Сохранение статуса-кво',
      relationships: 'Не указаны',
      resources: 'Не указаны'
    };

    const updated = universe.entities.map(ent => {
      if (ent.id !== selectedEntity.id) return ent;
      return {
        ...ent,
        dynamicStates: [...ent.dynamicStates, newState],
        updatedAt: new Date().toISOString()
      };
    });

    onUpdateUniverse({ ...universe, entities: updated });
    setAddStateModalOpen(false);
    setNewStateEpoch('');
    setNewStateTitle('');
    setNewStatePhysical('');
    setNewStateMental('');
    setNewStateAbilities('');
    setNewStateGoals('');
  };

  // Create Entity
  const handleCreateEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntityTitle.trim()) return;

    const newId = `ent-${Date.now()}`;
    const newEntity: CodexEntity = {
      id: newId,
      type: newEntityType,
      title: newEntityTitle.trim(),
      description: newEntityDescription.trim() || 'Описание формируется автором.',
      canonStatus: newEntityCanon,
      credibility: 'fact',
      attributes: {},
      dynamicStates: [],
      relations: [],
      tags: [newEntityType, newEntityCanon],
      updatedAt: new Date().toISOString()
    };

    onUpdateUniverse({
      ...universe,
      entities: [newEntity, ...universe.entities]
    });

    setSelectedEntityId(newId);
    setAddEntityModalOpen(false);
    setNewEntityTitle('');
    setNewEntityDescription('');
  };

  return (
    <div className="flex h-[calc(100vh-57px)] bg-slate-950 overflow-hidden">
      {/* Left List of Entities */}
      <aside className="w-80 border-r border-slate-800 bg-slate-950/95 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-rose-400" />
              База знаний ({filteredEntities.length})
            </span>
            <button
              onClick={() => setAddEntityModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold cursor-pointer transition"
            >
              <Plus className="w-3 h-3" />
              <span>Создать</span>
            </button>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию или тегам..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-md text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Category Type Filter */}
          <div className="flex gap-1 overflow-x-auto scrollbar-none py-0.5">
            {[
              { id: 'all', label: 'Все' },
              { id: 'character', label: 'Герои' },
              { id: 'location', label: 'Места' },
              { id: 'artifact', label: 'Артефакты' },
              { id: 'civilization', label: 'Цивилизации' },
              { id: 'organization', label: 'Фракции' },
              { id: 'technology', label: 'Технологии' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id as any)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono shrink-0 cursor-pointer transition ${
                  typeFilter === f.id
                    ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Entities Scroll List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 p-1 scrollbar-thin">
          {filteredEntities.map(ent => {
            const isSelected = ent.id === selectedEntity?.id;
            return (
              <button
                key={ent.id}
                onClick={() => setSelectedEntityId(ent.id)}
                className={`w-full text-left p-3 rounded-lg transition cursor-pointer flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-rose-950/40 border border-rose-800/50'
                    : 'hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold truncate ${isSelected ? 'text-rose-200' : 'text-slate-200'}`}>
                    {ent.title}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {ent.type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {ent.description}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>{ent.dynamicStates.length} состояний</span>
                  <span className={ent.canonStatus === 'canon' ? 'text-emerald-400' : 'text-amber-400'}>
                    {ent.canonStatus === 'canon' ? 'Канон' : 'Гипотеза'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Detail Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-5xl">
        {selectedEntity ? (
          <>
            {/* Header: Title, Badges, Status Controls */}
            <div className="border-b border-slate-800 pb-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800/40">
                      {selectedEntity.type}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedEntity.credibility === 'fact' ? 'Установленный факт' : 'Спорное'}
                    </span>
                    {selectedEntity.timeBound && (
                      <span className="text-xs font-mono text-slate-400">
                        {selectedEntity.timeBound.display}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-100">
                    {selectedEntity.title}
                  </h1>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400 font-mono">Статус канона:</label>
                  <select
                    value={selectedEntity.canonStatus}
                    onChange={e => handleUpdateEntity('canonStatus', e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs font-medium text-slate-200 rounded px-2.5 py-1.5 focus:outline-none cursor-pointer"
                  >
                    <option value="canon">Канон вселенной</option>
                    <option value="hypothesis">Гипотеза</option>
                    <option value="alternative">Альтернативная версия</option>
                    <option value="rejected">Отвергнуто (в архиве)</option>
                    <option value="note">Внутренняя заметка</option>
                  </select>
                </div>
              </div>

              {/* Alt Names */}
              {selectedEntity.altNames && selectedEntity.altNames.length > 0 && (
                <div className="text-xs text-slate-400">
                  <span className="text-slate-400 font-mono">Альт. наименования: </span>
                  <span className="text-slate-300">{selectedEntity.altNames.join(' · ')}</span>
                </div>
              )}
            </div>

            {/* Description Card */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-xs font-mono uppercase text-slate-400 block">
                Каноническое описание объекта:
              </span>
              <textarea
                rows={4}
                value={selectedEntity.description}
                onChange={e => handleUpdateEntity('description', e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-rose-500 font-sans"
              />
            </div>

            {/* Dynamic States Section (Core Requirement 4.3!) */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div>
                  <h2 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Динамические состояния во времени ({selectedEntity.dynamicStates.length})
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Состояние персонажа, территории или технологии в разные эпохи и узловые моменты истории.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedEntity.dynamicStates.length >= 2 && (
                    <button
                      onClick={() => {
                        setCompareStateAId(selectedEntity.dynamicStates[0]?.id || '');
                        setCompareStateBId(selectedEntity.dynamicStates[1]?.id || '');
                        setCompareModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Сравнить состояния</span>
                    </button>
                  )}
                  <button
                    onClick={() => setAddStateModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-900/50 hover:bg-cyan-800 text-cyan-200 border border-cyan-700/50 text-xs font-medium transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Добавить состояние эпохи</span>
                  </button>
                </div>
              </div>

              {/* Dynamic States Timeline Cards */}
              {selectedEntity.dynamicStates.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-800 rounded-lg text-xs text-slate-400">
                  Для данного объекта пока не зафиксированы динамические состояния в разные эпохи.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedEntity.dynamicStates.map((st, idx) => (
                    <div
                      key={st.id}
                      className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          <span className="text-xs font-bold text-slate-100">{st.title}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                            {st.epochOrYear}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/60">
                          <strong className="text-slate-300 block mb-1 font-mono text-[11px] text-cyan-400 uppercase">
                            Физическое состояние / Сенсорика:
                          </strong>
                          <p className="text-slate-400 leading-relaxed">{st.physicalState}</p>
                        </div>

                        <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/60">
                          <strong className="text-slate-300 block mb-1 font-mono text-[11px] text-cyan-400 uppercase">
                            Память / Знания / Психология:
                          </strong>
                          <p className="text-slate-400 leading-relaxed">{st.mentalState}</p>
                        </div>

                        <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/60">
                          <strong className="text-slate-300 block mb-1 font-mono text-[11px] text-cyan-400 uppercase">
                            Способности и технологии:
                          </strong>
                          <p className="text-slate-400 leading-relaxed">{st.abilities}</p>
                        </div>

                        <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/60">
                          <strong className="text-slate-300 block mb-1 font-mono text-[11px] text-cyan-400 uppercase">
                            Цели и намерения в этот период:
                          </strong>
                          <p className="text-slate-400 leading-relaxed">{st.goals}</p>
                        </div>
                      </div>

                      {st.notes && (
                        <div className="text-[11px] text-slate-400 italic pt-1">
                          Заметка автора: {st.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Epistemic Distribution Section (Who knows, who misinformed) */}
            {selectedEntity.epistemicInfo && (
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h3 className="text-xs font-serif font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  Распределение информации внутри мира (Эпистемика)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase block mb-1">
                      Кто знает факт:
                    </span>
                    <p className="text-slate-300">
                      {selectedEntity.epistemicInfo.knownBy.join('; ') || 'Никто из смертных'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
                    <span className="text-[10px] font-mono text-amber-400 uppercase block mb-1">
                      Кто заблуждается / пропаганда:
                    </span>
                    <p className="text-slate-300">
                      {selectedEntity.epistemicInfo.misinformed.join('; ') || 'Заблуждений не зафиксировано'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Relations Section */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h3 className="text-xs font-serif font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-purple-400" />
                Типизированные связи с другими объектами
              </h3>
              <div className="space-y-2">
                {selectedEntity.relations.map(rel => {
                  const target = universe.entities.find(e => e.id === rel.targetEntityId);
                  return (
                    <div
                      key={rel.id}
                      className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 font-mono text-[10px] border border-purple-800/30">
                          {rel.relationType}
                        </span>
                        <span className="font-semibold text-slate-200">{target?.title || rel.targetEntityId}</span>
                        {rel.description && (
                          <span className="text-slate-400 italic">({rel.description})</span>
                        )}
                      </div>
                      {target && (
                        <button
                          onClick={() => setSelectedEntityId(target.id)}
                          className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
                        >
                          Открыть →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}
      </main>

      {/* State Comparator Modal */}
      {compareModalOpen && selectedEntity && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                  Сравнение состояний: {selectedEntity.title}
                </h3>
                <p className="text-xs text-slate-400">
                  Сопоставление физических параметров, знаний и целей в разные исторические эпохи.
                </p>
              </div>
              <button
                onClick={() => setCompareModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selectors for State A and State B */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Период A:</label>
                <select
                  value={compareStateAId}
                  onChange={e => setCompareStateAId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded p-2"
                >
                  {selectedEntity.dynamicStates.map(s => (
                    <option key={s.id} value={s.id}>{s.epochOrYear}: {s.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Период B:</label>
                <select
                  value={compareStateBId}
                  onChange={e => setCompareStateBId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded p-2"
                >
                  {selectedEntity.dynamicStates.map(s => (
                    <option key={s.id} value={s.id}>{s.epochOrYear}: {s.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Side by side comparison view */}
            {(() => {
              const stateA = selectedEntity.dynamicStates.find(s => s.id === compareStateAId);
              const stateB = selectedEntity.dynamicStates.find(s => s.id === compareStateBId);
              if (!stateA || !stateB) return null;

              const rows = [
                { label: 'Физическое состояние', valA: stateA.physicalState, valB: stateB.physicalState },
                { label: 'Память и воспоминания', valA: stateA.mentalState, valB: stateB.mentalState },
                { label: 'Способности', valA: stateA.abilities, valB: stateB.abilities },
                { label: 'Главная цель', valA: stateA.goals, valB: stateB.goals },
                { label: 'Ресурсы и статус', valA: stateA.resources, valB: stateB.resources }
              ];

              return (
                <div className="border border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-800 text-xs">
                  {rows.map((r, i) => (
                    <div key={i} className="grid grid-cols-2 divide-x divide-slate-800">
                      <div className="p-3 bg-slate-950/40 space-y-1">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase">{r.label} (Период A)</span>
                        <p className="text-slate-300 leading-relaxed">{r.valA}</p>
                      </div>
                      <div className="p-3 bg-slate-950/80 space-y-1">
                        <span className="text-[10px] font-mono text-rose-400 uppercase">{r.label} (Период B)</span>
                        <p className="text-slate-300 leading-relaxed">{r.valB}</p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Add Dynamic State Modal */}
      {addStateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateDynamicState}
            className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-base font-serif font-bold text-slate-100">
                Новое динамическое состояние: {selectedEntity.title}
              </h3>
              <button
                type="button"
                onClick={() => setAddStateModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Эпоха / Год:</label>
                <input
                  type="text"
                  required
                  value={newStateEpoch}
                  onChange={e => setNewStateEpoch(e.target.value)}
                  placeholder="Например: 2450 г. (Разлом) или ок. 2890 г."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Название состояния / Роль:</label>
                <input
                  type="text"
                  required
                  value={newStateTitle}
                  onChange={e => setNewStateTitle(e.target.value)}
                  placeholder="Например: Одинокая хранительница Чёрного острова"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Физическое состояние:</label>
                <textarea
                  rows={2}
                  value={newStatePhysical}
                  onChange={e => setNewStatePhysical(e.target.value)}
                  placeholder="Повреждения, вооружение, броня, био-износ..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Память и психология:</label>
                <textarea
                  rows={2}
                  value={newStateMental}
                  onChange={e => setNewStateMental(e.target.value)}
                  placeholder="Какие события помнит, какие воспоминания утрачены или искажены..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Цель в этот период:</label>
                <input
                  type="text"
                  value={newStateGoals}
                  onChange={e => setNewStateGoals(e.target.value)}
                  placeholder="К чему стремится персонаж или фракция?"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAddStateModalOpen(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
              >
                Сохранить состояние
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Entity Modal */}
      {addEntityModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateEntity}
            className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-base font-serif font-bold text-slate-100">
                Создать объект базы знаний
              </h3>
              <button
                type="button"
                onClick={() => setAddEntityModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Название объекта:</label>
                <input
                  type="text"
                  required
                  value={newEntityTitle}
                  onChange={e => setNewEntityTitle(e.target.value)}
                  placeholder="Имя персонажа, название цивилизации или артефакта..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Категория:</label>
                  <select
                    value={newEntityType}
                    onChange={e => setNewEntityType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none"
                  >
                    <option value="character">Персонаж</option>
                    <option value="location">Локация / География</option>
                    <option value="civilization">Цивилизация</option>
                    <option value="organization">Организация / Фракция</option>
                    <option value="artifact">Артефакт</option>
                    <option value="technology">Технология / Концепция</option>
                    <option value="species">Биологический вид</option>
                    <option value="culture">Культура / Религия</option>
                    <option value="concept">Философская концепция</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Статус:</label>
                  <select
                    value={newEntityCanon}
                    onChange={e => setNewEntityCanon(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none"
                  >
                    <option value="canon">Канон</option>
                    <option value="hypothesis">Гипотеза</option>
                    <option value="alternative">Альтернативная версия</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Описание:</label>
                <textarea
                  rows={4}
                  value={newEntityDescription}
                  onChange={e => setNewEntityDescription(e.target.value)}
                  placeholder="Краткое или развернутое описание..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAddEntityModalOpen(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Создать карточку
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
