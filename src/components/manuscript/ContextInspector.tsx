import React from 'react';
import { CodexEntity, Scene, UniverseData, WorkspaceTab } from '../../types';
import { analyzeSceneText, getEntityStateForScene } from '../../utils/dramaturgyEngine';
import {
  Compass,
  User,
  MapPin,
  Sparkles,
  ExternalLink,
  Activity,
  Layers,
  Eye,
  ShieldAlert
} from 'lucide-react';

interface ContextInspectorProps {
  scene: Scene;
  universe: UniverseData;
  onNavigate: (tab: WorkspaceTab, targetId?: string) => void;
  onOpenAIAssistant: () => void;
}

export const ContextInspector: React.FC<ContextInspectorProps> = ({
  scene,
  universe,
  onNavigate,
  onOpenAIAssistant
}) => {
  const metrics = analyzeSceneText(scene.text);

  // Find linked entities
  const povEntity = scene.passport.povCharacterId
    ? universe.entities.find(e => e.id === scene.passport.povCharacterId)
    : undefined;

  const locationEntity = scene.passport.locationId
    ? universe.entities.find(e => e.id === scene.passport.locationId)
    : undefined;

  // Additional participating entities
  const participantEntities = scene.passport.participatingCharacterIds
    .filter(id => id !== scene.passport.povCharacterId)
    .map(id => universe.entities.find(e => e.id === id))
    .filter((e): e is CodexEntity => !!e);

  // Detect entities mentioned in text by title or altNames
  const mentionedEntities = universe.entities.filter(ent => {
    if (ent.id === scene.passport.povCharacterId || ent.id === scene.passport.locationId) return false;
    if (scene.passport.participatingCharacterIds.includes(ent.id)) return false;
    const lower = scene.text.toLowerCase();
    if (lower.includes(ent.title.toLowerCase())) return true;
    if (ent.altNames && ent.altNames.some(a => lower.includes(a.toLowerCase()))) return true;
    return false;
  });

  const sceneEpochYear = scene.passport.epochYear || '2450 г.';

  return (
    <aside className="w-80 border-l border-slate-800 bg-slate-950/90 flex flex-col h-full overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/60 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
          <Compass className="w-4 h-4 text-rose-400" />
          <span>Контекстный инспектор</span>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/40">
          {sceneEpochYear}
        </span>
      </div>

      <div className="p-3 space-y-4">
        {/* Real-time Dramaturgical Metrics */}
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Драматургия сцены
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              ~{metrics.readingTimeMinutes} мин. чтения
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
              <span className="text-[10px] text-slate-400 block">Диалоги:</span>
              <span className="font-mono font-bold text-slate-200">{metrics.dialoguePercentage}%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{metrics.dialogueCount} реплик</span>
            </div>
            <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
              <span className="text-[10px] text-slate-400 block">Полярность:</span>
              <span className={`font-mono font-bold ${
                scene.passport.polarity > 0 ? 'text-emerald-400' : scene.passport.polarity < 0 ? 'text-rose-400' : 'text-slate-300'
              }`}>
                {scene.passport.polarity > 0 ? `+${scene.passport.polarity}` : scene.passport.polarity}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {scene.passport.polarity < 0 ? 'Кризис' : scene.passport.polarity > 0 ? 'Прорыв' : 'Нейтрально'}
              </span>
            </div>
          </div>

          {metrics.detectedSensoryKeywords.length > 0 && (
            <div className="text-[11px] text-slate-400 pt-1">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Сенсорные маркеры:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {metrics.detectedSensoryKeywords.map(kw => (
                  <span key={kw} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onOpenAIAssistant}
            className="w-full mt-1 py-1 px-2 rounded bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/50 text-[11px] font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Редакторский разбор ИИ</span>
          </button>
        </div>

        {/* POV Character Card with Exact Historical State */}
        {povEntity ? (
          <div className="p-3 rounded-lg bg-slate-900/80 border border-rose-900/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-xs font-bold text-slate-100">{povEntity.title}</span>
                <span className="text-[9px] font-mono px-1 rounded bg-rose-950 text-rose-300 border border-rose-800/30">POV</span>
              </div>
              <button
                onClick={() => onNavigate('codex', povEntity.id)}
                title="Перейти к полной карточке"
                className="text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dynamic State in Scene Era */}
            {(() => {
              const state = getEntityStateForScene(povEntity, sceneEpochYear);
              if (!state) return null;
              return (
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-medium text-rose-300">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      Состояние на {state.epochOrYear}:
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-200 font-semibold">{state.title}</div>

                  <div className="text-[11px] text-slate-400 space-y-1">
                    <div>
                      <strong className="text-slate-300 font-medium">Тело/Сенсорика:</strong> {state.physicalState}
                    </div>
                    <div>
                      <strong className="text-slate-300 font-medium">Память/Знания:</strong> {state.mentalState}
                    </div>
                    <div>
                      <strong className="text-slate-300 font-medium">Способности:</strong> {state.abilities}
                    </div>
                    <div>
                      <strong className="text-slate-300 font-medium">Цель в эту эпоху:</strong> {state.goals}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Epistemic Boundaries */}
            {povEntity.epistemicInfo && (
              <div className="text-[10px] space-y-1 text-slate-400 bg-slate-950/40 p-2 rounded border border-slate-800/40">
                <span className="text-slate-400 font-mono flex items-center gap-1 uppercase">
                  <Eye className="w-2.5 h-2.5 text-amber-400" />
                  Границы знаний героя:
                </span>
                {povEntity.epistemicInfo.hiddenBy.length > 0 && (
                  <p className="text-amber-200/80">
                    Скрывает: {povEntity.epistemicInfo.hiddenBy.join('; ')}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-2 rounded bg-slate-900/40 border border-dashed border-slate-800 text-[11px] text-slate-400 text-center">
            POV персонаж не привязан к паспорту сцены
          </div>
        )}

        {/* Location Card */}
        {locationEntity && (
          <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-bold text-slate-100">{locationEntity.title}</span>
              </div>
              <button
                onClick={() => onNavigate('codex', locationEntity.id)}
                className="text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">{locationEntity.description}</p>

            {/* Location state in scene era */}
            {(() => {
              const locState = getEntityStateForScene(locationEntity, sceneEpochYear);
              if (!locState) return null;
              return (
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300">
                  <span className="text-cyan-400 font-mono text-[10px] block">
                    География в {locState.epochOrYear}:
                  </span>
                  <div className="font-medium text-slate-200 mt-0.5">{locState.title}</div>
                  <div className="text-slate-400 text-[10px] mt-1">{locState.physicalState}</div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Other Participating Characters */}
        {participantEntities.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Другие участники сцены:
            </span>
            {participantEntities.map(p => (
              <div
                key={p.id}
                onClick={() => onNavigate('codex', p.id)}
                className="p-2 rounded bg-slate-900/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition text-xs"
              >
                <span className="text-slate-200 font-medium">{p.title}</span>
                <span className="text-[10px] font-mono text-slate-400">{p.type}</span>
              </div>
            ))}
          </div>
        )}

        {/* Entities Detected In Text */}
        {mentionedEntities.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-purple-400" />
              Упоминаются в тексте:
            </span>
            <div className="space-y-1">
              {mentionedEntities.map(m => (
                <div
                  key={m.id}
                  onClick={() => onNavigate('codex', m.id)}
                  className="p-2 rounded bg-slate-950/60 border border-slate-800/70 hover:border-purple-800/50 flex items-center justify-between cursor-pointer transition text-xs"
                >
                  <span className="text-slate-300 truncate">{m.title}</span>
                  <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-400">
                    {m.canonStatus === 'canon' ? 'Канон' : 'Гипотеза'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
