import React, { useState } from 'react';
import { CodexEntity, EntityRelation } from '../../types';
import { Link2, Plus, Trash2, ExternalLink, X } from 'lucide-react';

interface EntityRelationsProps {
  currentEntity: CodexEntity;
  allEntities: CodexEntity[];
  onAddRelation: (relation: EntityRelation) => void;
  onDeleteRelation: (relationId: string) => void;
  onNavigateToEntity: (entityId: string) => void;
}

export const EntityRelations: React.FC<EntityRelationsProps> = ({
  currentEntity,
  allEntities,
  onAddRelation,
  onDeleteRelation,
  onNavigateToEntity
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [targetId, setTargetId] = useState('');
  const [relType, setRelType] = useState<EntityRelation['relationType']>('related_to');
  const [desc, setDesc] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) return;

    const newRel: EntityRelation = {
      id: `rel-${Date.now()}`,
      targetEntityId: targetId,
      relationType: relType,
      description: desc.trim() || undefined
    };

    onAddRelation(newRel);
    setModalOpen(false);
    setTargetId('');
    setDesc('');
  };

  const availableTargets = allEntities.filter(e => e.id !== currentEntity.id);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-serif font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5 text-purple-400" />
          Типизированные связи с другими сущностями ({currentEntity.relations.length})
        </h3>
        {availableTargets.length > 0 && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Связать сущность</span>
          </button>
        )}
      </div>

      {currentEntity.relations.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
          Связей пока нет. Соедините эту сущность с персонажами, местами или технологиями.
        </div>
      ) : (
        <div className="space-y-2">
          {currentEntity.relations.map(rel => {
            const target = allEntities.find(e => e.id === rel.targetEntityId);
            return (
              <div
                key={rel.id}
                className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs group"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 font-mono text-[10px] border border-purple-800/30 shrink-0">
                    {rel.relationType}
                  </span>
                  <span className="font-semibold text-slate-200 truncate">
                    {target?.title || rel.targetEntityId}
                  </span>
                  {rel.description && (
                    <span className="text-slate-400 italic truncate max-w-xs">
                      ({rel.description})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {target && (
                    <button
                      onClick={() => onNavigateToEntity(target.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Открыть</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteRelation(rel.id)}
                    className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    title="Удалить связь"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Relation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-purple-400" />
              <span>Создать связь с сущностью</span>
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Связать с:</label>
                <select
                  value={targetId}
                  onChange={e => setTargetId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
                >
                  <option value="">-- Выберите сущность --</option>
                  {availableTargets.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Тип связи:</label>
                <select
                  value={relType}
                  onChange={e => setRelType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
                >
                  <option value="related_to">связан с (related_to)</option>
                  <option value="created_by">создан кем (created_by)</option>
                  <option value="part_of">является частью (part_of)</option>
                  <option value="located_in">находится в (located_in)</option>
                  <option value="participated_in">участвовал в (participated_in)</option>
                  <option value="caused">вызвал / привел к (caused)</option>
                  <option value="contradicts">противоречит (contradicts)</option>
                  <option value="confirms">подтверждает (confirms)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Комментарий (опционально):
                </label>
                <input
                  type="text"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Например: тайный союзник, древняя реликвия рода..."
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={!targetId}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50"
                >
                  Создать связь
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
