import React from 'react';
import { UniverseData, WorkspaceTab } from '../../types';
import {
  Feather,
  BookOpen,
  Clock,
  FlaskConical,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Share2,
  FileText
} from 'lucide-react';

interface DashboardViewProps {
  universe: UniverseData;
  onNavigate: (tab: WorkspaceTab, targetId?: string) => void;
  onQuickCreate: (type?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  universe,
  onNavigate,
  onQuickCreate
}) => {
  const activeProject = universe.projects.find(p => p.id === universe.activeProjectId) || universe.projects[0];

  // Calculate stats
  let totalWords = 0;
  let totalScenes = 0;
  let completedScenes = 0;

  universe.projects.forEach(p => {
    p.acts.forEach(a => {
      a.chapters.forEach(c => {
        c.scenes.forEach(s => {
          totalScenes++;
          totalWords += s.wordCount || 0;
          if (s.status === 'revised' || s.status === 'final') completedScenes++;
        });
      });
    });
  });

  const unresolvedQuestions = universe.questions.filter(q => q.status !== 'resolved');
  const unresolvedIssues = universe.consistencyIssues.filter(i => !i.isIntentional);
  const activeHypotheses = universe.hypotheses.filter(h => h.status === 'hypothesis' || h.status === 'in_review');

  // Find latest active scene
  const activeScene = activeProject?.acts[0]?.chapters[0]?.scenes[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-900/30 p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-rose-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-700/50 text-[11px] font-mono text-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Среда управления каноном REDCROW 3000
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-100 tracking-tight">
            Рабочая панель автора вселенной
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            {universe.tagline}. Одновременное развитие масштаба тысячелетней истории мира, структуры художественных произведений и логики авторских решений.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('manuscript', activeScene?.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/50 transition cursor-pointer"
            >
              <Feather className="w-4 h-4" />
              <span>Продолжить рукопись ({activeScene ? activeScene.title : 'Сцена 1'})</span>
            </button>
            <button
              onClick={() => onNavigate('codex')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-rose-400" />
              <span>База знаний ({universe.entities.length} объектов)</span>
            </button>
            <button
              onClick={() => onNavigate('graph')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>Визуальная карта</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400">Слов в рукописи</span>
          <div className="text-xl font-bold font-mono text-slate-100 mt-1">{totalWords.toLocaleString()}</div>
          <span className="text-[11px] text-slate-400 mt-1">{totalScenes} сцен создано</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400">Готовность глав</span>
          <div className="text-xl font-bold font-mono text-rose-300 mt-1">
            {totalScenes > 0 ? Math.round((completedScenes / totalScenes) * 100) : 0}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1">{completedScenes} из {totalScenes} сцен</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400">Канон объектов</span>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-1">{universe.entities.length}</div>
          <span className="text-[11px] text-slate-400 mt-1">18+ категорий мира</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400">Событий хронологии</span>
          <div className="text-xl font-bold font-mono text-purple-300 mt-1">{universe.events.length}</div>
          <span className="text-[11px] text-slate-400 mt-1">3 измерения времени</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400">Открытых вопросов</span>
          <div className="text-xl font-bold font-mono text-amber-300 mt-1">{unresolvedQuestions.length}</div>
          <span className="text-[11px] text-slate-400 mt-1">Требуют решения</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400">Непротиворечивость</span>
          <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
            {unresolvedIssues.length === 0 ? 'Чисто' : `${unresolvedIssues.length} нестык.`}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">
            {unresolvedIssues.length === 0 ? 'Канон стабилен' : 'Требует внимания'}
          </span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Current Manuscript & Active Scenes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Book Module */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Feather className="w-4 h-4 text-rose-400" />
                <h2 className="text-base font-semibold text-slate-100">Текущее произведение</h2>
              </div>
              <button
                onClick={() => onNavigate('manuscript')}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                Открыть в редакторе <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeProject ? (
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-serif font-bold text-slate-100 text-base">{activeProject.title}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40">
                      Активный роман
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {activeProject.synopsis}
                  </p>

                  {/* Storylines Pills */}
                  <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-slate-400 font-mono">Сюжетные линии:</span>
                    {activeProject.storylines.map(sl => (
                      <span
                        key={sl.id}
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${sl.color}20`, color: sl.color, border: `1px solid ${sl.color}40` }}
                      >
                        {sl.title}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Chapter & Scene Quick List */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                    Главы и сцены рукописи:
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activeProject.acts[0]?.chapters.flatMap(ch =>
                      ch.scenes.map(sc => {
                        const pov = universe.entities.find(e => e.id === sc.passport.povCharacterId);
                        return (
                          <div
                            key={sc.id}
                            onClick={() => onNavigate('manuscript', sc.id)}
                            className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 hover:border-rose-900/60 hover:bg-slate-800/50 transition cursor-pointer flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-medium text-slate-200 truncate">{sc.title}</span>
                              <span className="text-[10px] font-mono text-slate-400 shrink-0">{sc.wordCount} сл.</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                              <span>POV: <strong className="text-slate-300 font-normal">{pov?.title || '—'}</strong></span>
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300">
                                {sc.status === 'revised' ? 'Вычитано' : sc.status === 'in_progress' ? 'В работе' : 'Черновик'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Key Figures of Universe Codex */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <h2 className="text-base font-semibold text-slate-100">Ключевые сущности канона</h2>
              </div>
              <button
                onClick={() => onNavigate('codex')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                Все карточки <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {universe.entities.slice(0, 6).map(ent => (
                <div
                  key={ent.id}
                  onClick={() => onNavigate('codex', ent.id)}
                  className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 hover:border-cyan-800/60 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 truncate">{ent.title}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {ent.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{ent.description}</p>
                  <div className="mt-2 text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                    <span>{ent.dynamicStates.length} состояний во времени</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Author's Laboratory & Questions */}
        <div className="space-y-6">
          {/* Unresolved Questions Registry */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <h2 className="text-base font-semibold text-slate-100">Реестр нерешённых вопросов</h2>
              </div>
              <button
                onClick={() => onNavigate('lab')}
                className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer"
              >
                Лаборатория →
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Вопросы, требующие авторского внимания и выбора ветви сюжета:
            </p>

            <div className="space-y-2">
              {unresolvedQuestions.map(q => (
                <div
                  key={q.id}
                  onClick={() => onNavigate('lab', q.id)}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-amber-600/40 transition cursor-pointer space-y-1"
                >
                  <div className="text-xs font-semibold text-amber-200">{q.title}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{q.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>{q.possibleAnswers.length} гипотез ответа</span>
                    <span className="text-amber-400">Исследуется</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Author Decisions Log */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h2 className="text-base font-semibold text-slate-100">Журнал авторских решений</h2>
              </div>
              <button
                onClick={() => onNavigate('lab')}
                className="text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer"
              >
                Все решения →
              </button>
            </div>

            <div className="space-y-2">
              {universe.decisions.map(d => (
                <div
                  key={d.id}
                  onClick={() => onNavigate('lab', d.id)}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-emerald-700/50 transition cursor-pointer space-y-1"
                >
                  <div className="text-xs font-semibold text-emerald-200">{d.title}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{d.chosenDecision}</p>
                  <div className="text-[10px] text-slate-400 font-mono pt-0.5">
                    Дата: {d.decisionDate}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Advisor Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-rose-950/40 via-purple-950/30 to-slate-900 border border-purple-800/40 space-y-2.5">
            <div className="flex items-center gap-2 text-rose-300">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold font-serif tracking-wide">ИИ-Редактор REDCROW</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Готов проверить сцену на драматургический ритм, баланс диалогов или смоделировать: <em className="text-rose-200 font-serif">«Что изменится, если изменить природу Осколков?»</em>
            </p>
            <button
              onClick={() => onNavigate('ai')}
              className="w-full py-1.5 px-3 rounded-md bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-medium border border-purple-700/50 transition cursor-pointer"
            >
              Запустить анализ ИИ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
