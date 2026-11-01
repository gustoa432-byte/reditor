import React, { useState } from 'react';
import { Scene, UniverseData, WorkspaceTab } from '../../types';
import {
  Sparkles,
  Feather,
  GitBranch,
  Search,
  BookOpen,
  ArrowRight,
  Send,
  Loader2,
  CheckCircle2,
  Copy
} from 'lucide-react';

interface AIAssistantViewProps {
  universe: UniverseData;
  onNavigate: (tab: WorkspaceTab, targetId?: string) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  universe,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'critique' | 'ripple' | 'query'>('critique');
  const [loading, setLoading] = useState(false);

  // Scene Critique state
  const activeProject = universe.projects.find(p => p.id === universe.activeProjectId) || universe.projects[0];
  const allScenes: Scene[] = [];
  activeProject?.acts.forEach(a => a.chapters.forEach(c => c.scenes.forEach(s => allScenes.push(s))));
  const [selectedSceneId, setSelectedSceneId] = useState<string>(allScenes[0]?.id || '');
  const [critiqueResult, setCritiqueResult] = useState<string | null>(null);

  // Ripple Effect state
  const [rippleQuestion, setRippleQuestion] = useState(
    'Что изменится в мире, если я изменю природу Осколков и сделаю их органическими паразитами Создателей?'
  );
  const [rippleResult, setRippleResult] = useState<string | null>(null);

  // Grounded Query state
  const [universeQuery, setUniverseQuery] = useState(
    'Что именно Фелиция помнит о Катастрофе 2450 года и какие знания от неё скрыты?'
  );
  const [queryResult, setQueryResult] = useState<string | null>(null);

  // Run Scene Critique
  const handleRunCritique = async () => {
    const scene = allScenes.find(s => s.id === selectedSceneId);
    if (!scene) return;
    setLoading(true);
    setCritiqueResult(null);

    try {
      const povEntity = universe.entities.find(e => e.id === scene.passport.povCharacterId);
      const locEntity = universe.entities.find(e => e.id === scene.passport.locationId);

      const res = await fetch('/api/ai/critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: scene.title,
          pov: povEntity?.title || scene.passport.povCharacterId,
          goal: scene.passport.characterGoal,
          conflict: scene.passport.conflictObstacle,
          text: scene.text,
          characters: scene.passport.participatingCharacterIds,
          location: locEntity?.title || scene.passport.locationId,
          epoch: scene.passport.epochYear
        })
      });
      const data = await res.json();
      setCritiqueResult(data.result);
    } catch (err) {
      console.error('Error running AI critique:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run Ripple Effect Analysis
  const handleRunRipple = async () => {
    if (!rippleQuestion.trim()) return;
    setLoading(true);
    setRippleResult(null);

    try {
      const summary = universe.entities
        .map(e => `${e.title} (${e.type}, ${e.canonStatus}): ${e.description.slice(0, 100)}`)
        .join('\n');

      const res = await fetch('/api/ai/ripple-effect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: rippleQuestion,
          universeSummary: summary
        })
      });
      const data = await res.json();
      setRippleResult(data.result);
    } catch (err) {
      console.error('Error running ripple effect:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run Grounded Query
  const handleRunQuery = async () => {
    if (!universeQuery.trim()) return;
    setLoading(true);
    setQueryResult(null);

    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: universeQuery,
          codexCards: universe.entities.map(e => ({
            title: e.title,
            type: e.type,
            status: e.canonStatus,
            description: e.description,
            states: e.dynamicStates.map(s => `${s.epochOrYear}: ${s.title}`)
          }))
        })
      });
      const data = await res.json();
      setQueryResult(data.result);
    } catch (err) {
      console.error('Error running universe query:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl md:text-2xl font-serif font-bold text-slate-100">
              ИИ-Ассистент и редактор REDCROW 3000
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Аналитический и редакторский инструмент по запросу автора. ИИ не создает канон самостоятельно, а проверяет текст и моделирует последствия изменений.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('critique')}
            className={`px-3 py-1.5 rounded font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'critique'
                ? 'bg-rose-950 text-rose-200 border border-rose-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Feather className="w-3.5 h-3.5 text-rose-400" />
            <span>Драматургия сцены</span>
          </button>
          <button
            onClick={() => setActiveTab('ripple')}
            className={`px-3 py-1.5 rounded font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ripple'
                ? 'bg-purple-950 text-purple-200 border border-purple-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-purple-400" />
            <span>Каскад изменений</span>
          </button>
          <button
            onClick={() => setActiveTab('query')}
            className={`px-3 py-1.5 rounded font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'query'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>Поиск по канону</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Scene Dramaturgical Critique */}
      {activeTab === 'critique' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Выберите сцену для редакторского разбора:
                </label>
                <select
                  value={selectedSceneId}
                  onChange={e => setSelectedSceneId(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500 min-w-72"
                >
                  {allScenes.map(sc => (
                    <option key={sc.id} value={sc.id}>
                      {sc.title} ({sc.wordCount} сл.)
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleRunCritique}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-rose-950/40"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Провести глубокий анализ</span>
              </button>
            </div>
          </div>

          {/* Results Display */}
          {critiqueResult && (
            <div className="p-6 rounded-xl bg-slate-900/90 border border-rose-900/40 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-serif font-bold text-slate-100 text-sm">
                    Заключение редактора вселенной REDCROW 3000
                  </h3>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(critiqueResult)}
                  title="Копировать отчет"
                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
                {critiqueResult}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Ripple Effect Analysis ("Что изменится, если...") */}
      {activeTab === 'ripple' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              Вопрос автора о возможном изменении мира:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={rippleQuestion}
                onChange={e => setRippleQuestion(e.target.value)}
                placeholder="Что изменится, если я изменю дату Катастрофы или мотивацию Маркуса?.."
                className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleRunRipple}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold shrink-0 flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-purple-950/40"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
                <span>Смоделировать каскад</span>
              </button>
            </div>
          </div>

          {rippleResult && (
            <div className="p-6 rounded-xl bg-slate-900/90 border border-purple-900/40 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  <h3 className="font-serif font-bold text-slate-100 text-sm">
                    Карта каскадных последствий для канона
                  </h3>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(rippleResult)}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
                {rippleResult}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Grounded Query with Source Citation */}
      {activeTab === 'query' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              Запрос к базе знаний с точной цитацией источников канона:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={universeQuery}
                onChange={e => setUniverseQuery(e.target.value)}
                placeholder="Задайте вопрос о фактах, датах или ограничениях персонажей..."
                className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleRunQuery}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold shrink-0 flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-cyan-950/40"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Найти в каноне</span>
              </button>
            </div>
          </div>

          {queryResult && (
            <div className="p-6 rounded-xl bg-slate-900/90 border border-cyan-900/40 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-serif font-bold text-slate-100 text-sm">
                    Каноническая справка с цитированием
                  </h3>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(queryResult)}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
                {queryResult}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
