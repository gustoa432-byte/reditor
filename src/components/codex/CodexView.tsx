import React, { useState, useEffect } from 'react';
import {
  CanonStatus,
  CodexEntity,
  EntityRelation,
  EntityState,
  EntityType,
  UniverseData,
  UniverseUpdater,
  WorkspaceTab,
  WorldCredibility
} from '../../types';
import { CodexSidebar } from './CodexSidebar';
import { EntityHeader } from './EntityHeader';
import { EntityDynamicStates } from './EntityDynamicStates';
import { EntityRelations } from './EntityRelations';
import { AddEntityModal } from './AddEntityModal';
import { AddStateModal } from './AddStateModal';
import { CompareStatesModal } from './CompareStatesModal';
import { Layers, Eye, BookOpen, Plus } from 'lucide-react';
import { softDeleteEntity } from '../../utils/universeOps';

interface CodexViewProps {
  universe: UniverseData;
  initialSelectedEntityId?: string;
  onUpdateUniverse: (updater: UniverseUpdater) => void;
  onNavigate: (tab: WorkspaceTab, targetId?: string) => void;
  onItemDeletedNotice?: (title: string, onUndo: () => void) => void;
}

export const CodexView: React.FC<CodexViewProps> = ({
  universe,
  initialSelectedEntityId,
  onUpdateUniverse,
  onNavigate,
  onItemDeletedNotice
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
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Modals state
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [addStateModalOpen, setAddStateModalOpen] = useState(false);
  const [addEntityModalOpen, setAddEntityModalOpen] = useState(false);

  // Sync initial target
  useEffect(() => {
    if (initialSelectedEntityId && universe.entities.some(e => e.id === initialSelectedEntityId)) {
      setSelectedEntityId(initialSelectedEntityId);
    }
  }, [initialSelectedEntityId, universe.entities]);

  const selectedEntity = universe.entities.find(e => e.id === selectedEntityId) || universe.entities[0];

  // Update entity properties
  const handleUpdateEntity = <K extends keyof CodexEntity>(field: K, value: CodexEntity[K]) => {
    if (!selectedEntity) return;
    onUpdateUniverse(prev => ({
      ...prev,
      entities: prev.entities.map(e => {
        if (e.id !== selectedEntity.id) return e;
        return {
          ...e,
          [field]: value,
          updatedAt: new Date().toISOString()
        };
      })
    }));
  };

  // Add Dynamic State
  const handleAddState = (newState: EntityState) => {
    if (!selectedEntity) return;
    onUpdateUniverse(prev => ({
      ...prev,
      entities: prev.entities.map(ent => {
        if (ent.id !== selectedEntity.id) return ent;
        return {
          ...ent,
          dynamicStates: [...ent.dynamicStates, newState],
          updatedAt: new Date().toISOString()
        };
      })
    }));
  };

  // Delete Dynamic State
  const handleDeleteState = (stateId: string) => {
    if (!selectedEntity) return;
    onUpdateUniverse(prev => ({
      ...prev,
      entities: prev.entities.map(ent => {
        if (ent.id !== selectedEntity.id) return ent;
        return {
          ...ent,
          dynamicStates: ent.dynamicStates.filter(s => s.id !== stateId),
          updatedAt: new Date().toISOString()
        };
      })
    }));
  };

  // Add Entity Relation
  const handleAddRelation = (newRel: EntityRelation) => {
    if (!selectedEntity) return;
    onUpdateUniverse(prev => ({
      ...prev,
      entities: prev.entities.map(ent => {
        if (ent.id !== selectedEntity.id) return ent;
        return {
          ...ent,
          relations: [...ent.relations, newRel],
          updatedAt: new Date().toISOString()
        };
      })
    }));
  };

  // Delete Entity Relation
  const handleDeleteRelation = (relationId: string) => {
    if (!selectedEntity) return;
    onUpdateUniverse(prev => ({
      ...prev,
      entities: prev.entities.map(ent => {
        if (ent.id !== selectedEntity.id) return ent;
        return {
          ...ent,
          relations: ent.relations.filter(r => r.id !== relationId),
          updatedAt: new Date().toISOString()
        };
      })
    }));
  };

  // Create Entity
  const handleCreateEntity = (data: Partial<CodexEntity>) => {
    const newId = `ent-${Date.now()}`;
    const newEntity: CodexEntity = {
      id: newId,
      type: data.type || 'character',
      title: data.title || 'Новая сущность',
      description: data.description || 'Описание формируется автором.',
      canonStatus: data.canonStatus || 'canon',
      credibility: 'fact',
      attributes: {},
      dynamicStates: [],
      relations: [],
      tags: data.tags || [data.type || 'character'],
      altNames: data.altNames || [],
      updatedAt: new Date().toISOString()
    };

    onUpdateUniverse(prev => ({
      ...prev,
      entities: [newEntity, ...prev.entities]
    }));

    setSelectedEntityId(newId);
  };

  // Soft delete entity
  const handleDeleteEntity = (entityId: string, title: string) => {
    onUpdateUniverse(prev => {
      const next = softDeleteEntity(prev, entityId);
      const trashId = next.trash?.[0]?.id;
      if (trashId && onItemDeletedNotice) {
        onItemDeletedNotice(title, () => {
          onUpdateUniverse(u => {
            const { restoreTrashItem } = require('../../utils/universeOps');
            return restoreTrashItem(u, trashId);
          });
        });
      }
      return next;
    });

    // Select another entity if available
    const remaining = universe.entities.filter(e => e.id !== entityId);
    if (remaining.length > 0) {
      setSelectedEntityId(remaining[0].id);
    }
  };

  return (
    <div className="flex h-full w-full flex-1 min-h-0 min-w-0 bg-slate-950 overflow-hidden relative">
      {/* 1. Sidebar with filters & entities list */}
      <CodexSidebar
        entities={universe.entities}
        selectedEntityId={selectedEntity?.id}
        onSelectEntity={setSelectedEntityId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onOpenAddModal={() => setAddEntityModalOpen(true)}
        isOpenMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 min-w-0 bg-slate-950 overflow-hidden">
        {selectedEntity ? (
          <>
            <EntityHeader
              entity={selectedEntity}
              onUpdateEntity={handleUpdateEntity}
              onToggleSidebarMobile={() => setIsSidebarOpenMobile(prev => !prev)}
              onOpenCompareModal={() => setCompareModalOpen(true)}
              onOpenAddStateModal={() => setAddStateModalOpen(true)}
              onDeleteEntity={handleDeleteEntity}
            />

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-6 scrollbar-thin min-h-0">
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

              {/* Dynamic States Section */}
              <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <h2 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      Динамические состояния во времени ({selectedEntity.dynamicStates.length})
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Состояние персонажа, территории или технологии в разные эпохи и узловые моменты истории.
                    </p>
                  </div>
                </div>

                <EntityDynamicStates
                  states={selectedEntity.dynamicStates}
                  onDeleteState={handleDeleteState}
                />
              </div>

              {/* Epistemic Distribution Section */}
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

              {/* Typed Relations */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
                <EntityRelations
                  currentEntity={selectedEntity}
                  allEntities={universe.entities}
                  onAddRelation={handleAddRelation}
                  onDeleteRelation={handleDeleteRelation}
                  onNavigateToEntity={setSelectedEntityId}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-0">
            <div className="w-14 h-14 rounded-2xl bg-rose-950/40 border border-rose-800/50 flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-rose-400" />
            </div>
            <h3 className="text-lg font-serif font-bold text-slate-200">База знаний пуста</h3>
            <p className="text-xs text-slate-400 max-w-md mt-1 mb-4">
              Создайте первую сущность вселенной (персонажа, локацию или концепцию).
            </p>
            <button
              onClick={() => setAddEntityModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Создать первую сущность</span>
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <AddEntityModal
        isOpen={addEntityModalOpen}
        onClose={() => setAddEntityModalOpen(false)}
        onCreateEntity={handleCreateEntity}
      />

      {selectedEntity && (
        <>
          <AddStateModal
            isOpen={addStateModalOpen}
            onClose={() => setAddStateModalOpen(false)}
            entityTitle={selectedEntity.title}
            onCreateState={handleAddState}
          />

          <CompareStatesModal
            isOpen={compareModalOpen}
            onClose={() => setCompareModalOpen(false)}
            entityTitle={selectedEntity.title}
            states={selectedEntity.dynamicStates}
          />
        </>
      )}
    </div>
  );
};
