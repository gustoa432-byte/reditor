import React, { useState } from 'react';
import { ConsistencyIssue, UniverseData, UniverseUpdater, WorkspaceTab } from '../../types';
import { runConsistencyCheck } from '../../utils/consistencyEngine';
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Eye,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Sparkles,
  X
} from 'lucide-react';

interface ConsistencyAuditorViewProps {
  universe: UniverseData;
  onUpdateUniverse: (updater: UniverseUpdater) => void;
  onNavigate: (tab: WorkspaceTab, targetId?: string) => void;
}

export const ConsistencyAuditorView: React.FC<ConsistencyAuditorViewProps> = ({
  universe,
  onUpdateUniverse,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'unresolved' | 'intentional'>('unresolved');
  const [intentionalModalIssue, setIntentionalModalIssue] = useState<ConsistencyIssue | null>(null);
  const [authorComment, setAuthorComment] = useState('');
  const [intentReason, setIntentReason] = useState<ConsistencyIssue['intentReason']>('artistic_device');

  // Run dynamic check
  const allIssues = runConsistencyCheck(universe);

  const unresolvedList = allIssues.filter(i => !i.isIntentional);
  const intentionalList = allIssues.filter(i => i.isIntentional);

  // Mark issue as intentional
  const handleConfirmIntentional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intentionalModalIssue) return;

    const updatedIssue: ConsistencyIssue = {
      ...intentionalModalIssue,
      isIntentional: true,
      authorComment: authorComment.trim() || 'Художественный замысел автора.',
      intentReason: intentReason
    };

    onUpdateUniverse(prev => {
      const existingIdx = prev.consistencyIssues.findIndex(i => i.id === intentionalModalIssue.id);
      let updatedList = [...prev.consistencyIssues];
      if (existingIdx >= 0) {
        updatedList[existingIdx] = updatedIssue;
      } else {
        updatedList.push(updatedIssue);
      }
      return { ...prev, consistencyIssues: updatedList };
    });

    setIntentionalModalIssue(null);
    setAuthorComment('');
  };

  // Revert back to unresolved
  const handleRevertIntentional = (issueId: string) => {
    onUpdateUniverse(prev => ({
      ...prev,
      consistencyIssues: prev.consistencyIssues.map(i => {
        if (i.id !== issueId) return i;
        return { ...i, isIntentional: false, authorComment: undefined, intentReason: undefined };
      })
    }));
  };

  const reasonLabels: Record<NonNullable<ConsistencyIssue['intentReason']>, string> = {
    character_lie: 'Ложь персонажа / блеф',
    unreliable_narrator: 'Ненадёжный рассказчик',
    myth_legend: 'Миф, легенда или пропаганда',
    artistic_device: 'Художественный приём',
    alternate_version: 'Альтернативная ветка истории'
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-100">
              Контроль непротиворечивости вселенной
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Анализатор не навязывает решения: он выявляет временные аномалии и парадоксы знаний, позволяя автору зафиксировать намеренные художественные искажения.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('unresolved')}
            className={`px-3 py-1.5 rounded font-medium transition cursor-pointer ${
              activeTab === 'unresolved'
                ? 'bg-amber-950 text-amber-200 border border-amber-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Требуют внимания ({unresolvedList.length})
          </button>
          <button
            onClick={() => setActiveTab('intentional')}
            className={`px-3 py-1.5 rounded font-medium transition cursor-pointer ${
              activeTab === 'intentional'
                ? 'bg-emerald-950 text-emerald-200 border border-emerald-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Намеренные замыслы ({intentionalList.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Unresolved Issues */}
      {activeTab === 'unresolved' && (
        <div className="space-y-4">
          {unresolvedList.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="font-serif font-bold text-slate-100 text-base">Вселенная находится в равновесии</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Все временные датировки событий, участия персонажей и драматургические крючки согласованы.
              </p>
            </div>
          ) : (
            unresolvedList.map(issue => (
              <div
                key={issue.id}
                className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-700/50 transition shadow-lg space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                      issue.severity === 'high'
                        ? 'bg-red-950 text-red-300 border border-red-800/40'
                        : issue.severity === 'medium'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {issue.category} · {issue.severity === 'high' ? 'Критично' : 'Предупреждение'}
                    </span>
                    <h3 className="text-sm font-serif font-bold text-slate-100">{issue.title}</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{issue.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  {/* Linked Entities */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Затронуты:</span>
                    {issue.affectedEntityIds.map(id => {
                      const ent = universe.entities.find(e => e.id === id);
                      return ent ? (
                        <button
                          key={id}
                          onClick={() => onNavigate('codex', id)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition cursor-pointer"
                        >
                          {ent.title}
                        </button>
                      ) : null;
                    })}
                    {issue.affectedSceneIds.map(sId => (
                      <button
                        key={sId}
                        onClick={() => onNavigate('manuscript', sId)}
                        className="px-2 py-0.5 rounded bg-rose-950/60 hover:bg-rose-900 text-[11px] text-rose-300 transition cursor-pointer border border-rose-800/40"
                      >
                        Сцена рукописи →
                      </button>
                    ))}
                  </div>

                  {/* Action: Mark as Intentional */}
                  <button
                    onClick={() => {
                      setIntentionalModalIssue(issue);
                      setAuthorComment('');
                      setIntentReason('artistic_device');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold transition cursor-pointer shadow-sm"
                  >
                    Отметить как намеренное
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Intentional Artistic Discrepancies */}
      {activeTab === 'intentional' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Художественные расхождения, сознательно введенные автором (ложь персонажа, ненадежный рассказчик, историческая пропаганда):
          </div>

          {intentionalList.map(issue => (
            <div
              key={issue.id}
              className="p-5 rounded-xl bg-slate-900/80 border border-emerald-900/40 space-y-3 shadow-lg"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-serif font-bold text-slate-100">{issue.title}</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                  {issue.intentReason ? reasonLabels[issue.intentReason] : 'Намеренный замысел'}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{issue.description}</p>

              {issue.authorComment && (
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300">
                  <strong className="text-emerald-400 font-mono text-[10px] uppercase block mb-1">
                    Комментарий и обоснование автора:
                  </strong>
                  {issue.authorComment}
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => handleRevertIntentional(issue.id)}
                  className="text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  Снять отметку «намеренно»
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Mark As Intentional */}
      {intentionalModalIssue && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmIntentional}
            className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Обоснование художественного расхождения
              </h3>
              <button
                type="button"
                onClick={() => setIntentionalModalIssue(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <strong>Предупреждение:</strong> {intentionalModalIssue.title}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Природа расхождения:</label>
                <select
                  value={intentReason}
                  onChange={e => setIntentReason(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                >
                  <option value="character_lie">Ложь персонажа / блеф перед другими героями</option>
                  <option value="unreliable_narrator">Ненадёжный рассказчик (субъективное восприятие)</option>
                  <option value="myth_legend">Миф, народное предание или пропаганда фракции</option>
                  <option value="artistic_device">Художественный приём / интрига</option>
                  <option value="alternate_version">Альтернативная ветка истории</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Авторский комментарий:</label>
                <textarea
                  rows={3}
                  required
                  value={authorComment}
                  onChange={e => setAuthorComment(e.target.value)}
                  placeholder="Объясните, почему это расхождение сделано осознанно..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIntentionalModalIssue(null)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold"
              >
                Подтвердить замысел
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
