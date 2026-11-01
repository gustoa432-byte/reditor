import React, { useState } from 'react';
import {
  DecisionLogCard,
  LabHypothesis,
  UniverseData,
  UnresolvedQuestion,
  WorkspaceTab
} from '../../types';
import {
  FlaskConical,
  Plus,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Archive,
  ArrowRight,
  Sparkles,
  Link2,
  Trash2,
  X
} from 'lucide-react';

interface AuthorLabViewProps {
  universe: UniverseData;
  initialSelectedId?: string;
  onUpdateUniverse: (updated: UniverseData) => void;
  onNavigate: (tab: WorkspaceTab, targetId?: string) => void;
}

export const AuthorLabView: React.FC<AuthorLabViewProps> = ({
  universe,
  initialSelectedId,
  onUpdateUniverse,
  onNavigate
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'hypotheses' | 'decisions' | 'questions'>('questions');

  // Modals
  const [addHypothesisModalOpen, setAddHypothesisModalOpen] = useState(false);
  const [addDecisionModalOpen, setAddDecisionModalOpen] = useState(false);
  const [addQuestionModalOpen, setAddQuestionModalOpen] = useState(false);

  // New Hypothesis State
  const [hypoTitle, setHypoTitle] = useState('');
  const [hypoContent, setHypoContent] = useState('');
  const [hypoStatus, setHypoStatus] = useState<LabHypothesis['status']>('hypothesis');
  const [hypoPros, setHypoPros] = useState('');
  const [hypoCons, setHypoCons] = useState('');

  // New Decision State
  const [decTitle, setDecTitle] = useState('');
  const [decQuestion, setDecQuestion] = useState('');
  const [decProblem, setDecProblem] = useState('');
  const [decChosen, setDecChosen] = useState('');
  const [decRationale, setDecRationale] = useState('');

  // New Question State
  const [qTitle, setQTitle] = useState('');
  const [qDesc, setQDesc] = useState('');
  const [qAnswers, setQAnswers] = useState('');
  const [qImpact, setQImpact] = useState('');

  // Handlers
  const handleCreateHypothesis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hypoTitle.trim()) return;

    const newHypo: LabHypothesis = {
      id: `hypo-${Date.now()}`,
      title: hypoTitle.trim(),
      content: hypoContent.trim(),
      status: hypoStatus,
      pros: hypoPros.split('\n').filter(Boolean),
      cons: hypoCons.split('\n').filter(Boolean),
      linkedEntityIds: [],
      linkedSceneIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onUpdateUniverse({
      ...universe,
      hypotheses: [newHypo, ...universe.hypotheses]
    });

    setAddHypothesisModalOpen(false);
    setHypoTitle('');
    setHypoContent('');
    setHypoPros('');
    setHypoCons('');
  };

  const handleCreateDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decTitle.trim()) return;

    const newDec: DecisionLogCard = {
      id: `dec-${Date.now()}`,
      title: decTitle.trim(),
      question: decQuestion.trim(),
      problemDescription: decProblem.trim(),
      initialIdea: '',
      alternatives: [],
      pros: [],
      cons: [],
      chosenDecision: decChosen.trim(),
      rationale: decRationale.trim(),
      decisionDate: new Date().toISOString().slice(0, 10),
      linkedEntityIds: [],
      linkedSceneIds: []
    };

    onUpdateUniverse({
      ...universe,
      decisions: [newDec, ...universe.decisions]
    });

    setAddDecisionModalOpen(false);
    setDecTitle('');
    setDecQuestion('');
    setDecProblem('');
    setDecChosen('');
    setDecRationale('');
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qTitle.trim()) return;

    const newQ: UnresolvedQuestion = {
      id: `q-${Date.now()}`,
      title: qTitle.trim(),
      description: qDesc.trim(),
      possibleAnswers: qAnswers.split('\n').filter(Boolean),
      arguments: [],
      status: 'investigating',
      impact: qImpact.trim() || 'Влияет на ключевую драматургическую линию',
      linkedEntityIds: [],
      linkedSceneIds: [],
      createdAt: new Date().toISOString()
    };

    onUpdateUniverse({
      ...universe,
      questions: [newQ, ...universe.questions]
    });

    setAddQuestionModalOpen(false);
    setQTitle('');
    setQDesc('');
    setQAnswers('');
    setQImpact('');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-100">
              Авторская лаборатория
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Фиксация процесса мышления автора: гипотезы, журнал архитектурных решений и реестр нерешённых вопросов вселенной REDCROW 3000.
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab('questions')}
            className={`px-3 py-1.5 rounded font-medium transition cursor-pointer ${
              activeSubTab === 'questions'
                ? 'bg-amber-950 text-amber-200 border border-amber-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Нерешённые вопросы ({universe.questions.length})
          </button>
          <button
            onClick={() => setActiveSubTab('hypotheses')}
            className={`px-3 py-1.5 rounded font-medium transition cursor-pointer ${
              activeSubTab === 'hypotheses'
                ? 'bg-rose-950 text-rose-200 border border-rose-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Гипотезы и заметки ({universe.hypotheses.length})
          </button>
          <button
            onClick={() => setActiveSubTab('decisions')}
            className={`px-3 py-1.5 rounded font-medium transition cursor-pointer ${
              activeSubTab === 'decisions'
                ? 'bg-emerald-950 text-emerald-200 border border-emerald-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Журнал решений ({universe.decisions.length})
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Unresolved Questions */}
      {activeSubTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Вопросы, которые требуют авторского решения, выбора между вариантами или формулировки ответа:
            </div>
            <button
              onClick={() => setAddQuestionModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold transition cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Сформулировать вопрос</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {universe.questions.map(q => (
              <div
                key={q.id}
                className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-700/40 transition shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <h3 className="font-serif font-bold text-slate-100 text-sm leading-snug">{q.title}</h3>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                    q.status === 'investigating'
                      ? 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                      : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                  }`}>
                    {q.status === 'investigating' ? 'Исследуется' : 'Решено'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{q.description}</p>

                {/* Possible Answers */}
                {q.possibleAnswers.length > 0 && (
                  <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800/60 text-xs">
                    <span className="text-[10px] font-mono text-amber-400 uppercase block font-semibold">
                      Возможные ответы и гипотезы:
                    </span>
                    <ul className="space-y-1 list-disc list-inside text-slate-300">
                      {q.possibleAnswers.map((ans, idx) => (
                        <li key={idx} className="leading-relaxed">{ans}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Arguments & Impact */}
                <div className="text-[11px] text-slate-400 pt-1 space-y-1">
                  <div>
                    <strong className="text-slate-300 font-mono">Влияние на канон:</strong> {q.impact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tab 2: Hypotheses */}
      {activeSubTab === 'hypotheses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Идеи, предположения и альтернативные версии. Отклоненные гипотезы сохраняются в истории мира без удаления.
            </div>
            <button
              onClick={() => setAddHypothesisModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Записать гипотезу</span>
            </button>
          </div>

          <div className="space-y-4">
            {universe.hypotheses.map(hyp => {
              const statusColors: Record<LabHypothesis['status'], string> = {
                rough_thought: 'bg-slate-800 text-slate-300 border-slate-700',
                hypothesis: 'bg-rose-950 text-rose-300 border-rose-800/40',
                in_review: 'bg-amber-950 text-amber-300 border-amber-800/40',
                accepted_canon: 'bg-emerald-950 text-emerald-300 border-emerald-800/40',
                partially_accepted: 'bg-cyan-950 text-cyan-300 border-cyan-800/40',
                postponed: 'bg-slate-800 text-slate-400 border-slate-700',
                rejected: 'bg-red-950/60 text-red-400 border-red-800/40',
                superseded: 'bg-slate-900 text-slate-400 border-slate-800'
              };

              return (
                <div
                  key={hyp.id}
                  className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-lg space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-rose-400" />
                      <h3 className="font-serif font-bold text-slate-100 text-sm">{hyp.title}</h3>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${statusColors[hyp.status]}`}>
                      {hyp.status === 'accepted_canon' && 'Принята в канон'}
                      {hyp.status === 'rejected' && 'Отклонена (в архиве)'}
                      {hyp.status === 'hypothesis' && 'Гипотеза на проверке'}
                      {hyp.status === 'partially_accepted' && 'Частично принята'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{hyp.content}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {hyp.pros.length > 0 && (
                      <div className="p-2.5 rounded bg-slate-950/60 border border-emerald-950/40 space-y-1">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                          Аргументы ЗА:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                          {hyp.pros.map((p, idx) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {hyp.cons.length > 0 && (
                      <div className="p-2.5 rounded bg-slate-950/60 border border-rose-950/40 space-y-1">
                        <span className="text-[10px] font-mono text-rose-400 uppercase font-semibold">
                          Аргументы ПРОТИВ:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                          {hyp.cons.map((c, idx) => (
                            <li key={idx}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-tab 3: Decision Log Cards */}
      {activeSubTab === 'decisions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Карточки утвержденных авторских решений с фиксацией проблемы, вариантов и аргументации выбора.
            </div>
            <button
              onClick={() => setAddDecisionModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Зафиксировать решение</span>
            </button>
          </div>

          <div className="space-y-4">
            {universe.decisions.map(dec => (
              <div
                key={dec.id}
                className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-serif font-bold text-slate-100 text-sm">{dec.title}</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Дата: {dec.decisionDate}
                  </span>
                </div>

                <div className="text-xs space-y-2">
                  <div>
                    <strong className="text-slate-400 font-mono block text-[10px] uppercase">Исходный вопрос:</strong>
                    <p className="text-slate-300 font-medium">{dec.question}</p>
                  </div>
                  <div>
                    <strong className="text-slate-400 font-mono block text-[10px] uppercase">Проблема замысла:</strong>
                    <p className="text-slate-400 leading-relaxed">{dec.problemDescription}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
                    <strong className="text-emerald-300 font-mono block text-[10px] uppercase">Итоговое решение:</strong>
                    <p className="text-emerald-100 font-medium leading-relaxed mt-0.5">{dec.chosenDecision}</p>
                    <p className="text-xs text-slate-400 mt-1 italic">Причина выбора: {dec.rationale}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: New Question */}
      {addQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateQuestion}
            className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-base font-serif font-bold text-slate-100">
                Новый нерешённый вопрос
              </h3>
              <button
                type="button"
                onClick={() => setAddQuestionModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Формулировка вопроса:</label>
                <input
                  type="text"
                  required
                  value={qTitle}
                  onChange={e => setQTitle(e.target.value)}
                  placeholder="Например: Что именно знали Создатели перед отлётом?"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Описание контекста:</label>
                <textarea
                  rows={3}
                  value={qDesc}
                  onChange={e => setQDesc(e.target.value)}
                  placeholder="В чем заключается дилемма, какие варианты рассматриваются..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Возможные ответы (по строке на вариант):</label>
                <textarea
                  rows={3}
                  value={qAnswers}
                  onChange={e => setQAnswers(e.target.value)}
                  placeholder="Вариант 1: ...&#10;Вариант 2: ..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Влияние на сюжет:</label>
                <input
                  type="text"
                  value={qImpact}
                  onChange={e => setQImpact(e.target.value)}
                  placeholder="На что повлияет выбор (на финал книги, судьбу Фелиции)..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAddQuestionModalOpen(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold"
              >
                Сохранить вопрос
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: New Hypothesis */}
      {addHypothesisModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateHypothesis}
            className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-base font-serif font-bold text-slate-100">
                Записать гипотезу автора
              </h3>
              <button
                type="button"
                onClick={() => setAddHypothesisModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Тема гипотезы:</label>
                <input
                  type="text"
                  required
                  value={hypoTitle}
                  onChange={e => setHypoTitle(e.target.value)}
                  placeholder="Например: Истинная природа кристаллов Осколков..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Суть мысли:</label>
                <textarea
                  rows={3}
                  value={hypoContent}
                  onChange={e => setHypoContent(e.target.value)}
                  placeholder="Свободное описание идеи..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Аргументы ЗА (по строке):</label>
                  <textarea
                    rows={2}
                    value={hypoPros}
                    onChange={e => setHypoPros(e.target.value)}
                    placeholder="Плюс 1&#10;Плюс 2"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Аргументы ПРОТИВ (по строке):</label>
                  <textarea
                    rows={2}
                    value={hypoCons}
                    onChange={e => setHypoCons(e.target.value)}
                    placeholder="Минус 1&#10;Минус 2"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAddHypothesisModalOpen(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Сохранить мысль
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
