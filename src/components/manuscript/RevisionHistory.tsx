import React, { useState } from 'react';
import { Scene, SceneRevision } from '../../types';
import { Clock, RotateCcw, Plus, Check, FileText } from 'lucide-react';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

interface RevisionHistoryProps {
  scene: Scene;
  onCreateRevision: (label: string) => void;
  onRestoreRevision: (revision: SceneRevision) => void;
}

export const RevisionHistory: React.FC<RevisionHistoryProps> = ({
  scene,
  onCreateRevision,
  onRestoreRevision
}) => {
  const [newRevisionLabel, setNewRevisionLabel] = useState('');
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | null>(null);
  const [confirmRestoreRevision, setConfirmRestoreRevision] = useState<SceneRevision | null>(null);

  const revisions = scene.revisions || [];
  const selectedRevision = revisions.find(r => r.id === selectedRevisionId);

  const handleCreate = () => {
    if (!newRevisionLabel.trim()) return;
    onCreateRevision(newRevisionLabel.trim());
    setNewRevisionLabel('');
  };

  const handleConfirmRestore = () => {
    if (!confirmRestoreRevision) return;
    onRestoreRevision(confirmRestoreRevision);
    setConfirmRestoreRevision(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6 min-h-0">
      <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-serif font-bold text-slate-100">
            История редакций: {scene.title}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Контрольные снимки текста с возможностью просмотра и отката к сохранённым версиям.
          </p>
        </div>
      </div>

      {/* Create new snapshot */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          value={newRevisionLabel}
          onChange={e => setNewRevisionLabel(e.target.value)}
          placeholder="Название снимка (напр., 'Черновик перед сокращением диалога')..."
          className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
          onKeyDown={e => {
            if (e.key === 'Enter') handleCreate();
          }}
        />
        <button
          onClick={handleCreate}
          disabled={!newRevisionLabel.trim()}
          className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Сохранить снимок</span>
        </button>
      </div>

      {/* Revisions list */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Сохранённые редакции ({revisions.length})
        </h3>

        {revisions.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/30 rounded-xl border border-dashed border-slate-800 text-xs text-slate-400">
            В этой сцене пока нет контрольных снимков. Создайте снимок перед крупной правкой.
          </div>
        ) : (
          revisions.map(rev => {
            const isSelected = rev.id === selectedRevisionId;
            return (
              <div
                key={rev.id}
                className={`p-4 rounded-xl border transition ${
                  isSelected
                    ? 'bg-rose-950/30 border-rose-800/60'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-200 truncate">{rev.label}</h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {new Date(rev.timestamp).toLocaleString('ru-RU')} · {rev.text.split(/\s+/).filter(Boolean).length} сл.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedRevisionId(isSelected ? null : rev.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                    >
                      {isSelected ? 'Скрыть текст' : 'Просмотреть'}
                    </button>
                    <button
                      onClick={() => setConfirmRestoreRevision(rev)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/40 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Откатить текст</span>
                    </button>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <div className="text-[11px] text-slate-400 mb-2 font-mono">Содержимое снимка:</div>
                    <pre className="text-xs text-slate-300 font-serif leading-relaxed whitespace-pre-wrap bg-slate-950 p-4 rounded-lg border border-slate-800 max-h-64 overflow-y-auto">
                      {rev.text}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Confirm Restore Modal */}
      <ConfirmDeleteModal
        isOpen={!!confirmRestoreRevision}
        onClose={() => setConfirmRestoreRevision(null)}
        onConfirm={handleConfirmRestore}
        title="Восстановить эту редакцию текста?"
        description={`Текущий текст сцены будет заменён версией «${confirmRestoreRevision?.label}». Перед этим автоматически создаётся страховочный снимок текущего текста.`}
        confirmText="Откатить текст"
        isPermanent={false}
      />
    </div>
  );
};
