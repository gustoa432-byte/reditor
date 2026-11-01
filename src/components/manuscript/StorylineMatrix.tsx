import React from 'react';
import { ManuscriptProject, Scene, UniverseData } from '../../types';
import { Check, Pause, Zap, Flame, Eye, Layers } from 'lucide-react';

interface StorylineMatrixProps {
  project: ManuscriptProject;
  universe: UniverseData;
  activeSceneId: string;
  onSelectScene: (sceneId: string) => void;
  onToggleStorylineForScene: (sceneId: string, storylineId: string) => void;
}

export const StorylineMatrix: React.FC<StorylineMatrixProps> = ({
  project,
  universe,
  activeSceneId,
  onSelectScene,
  onToggleStorylineForScene
}) => {
  // Collect all scenes in linear reading order
  const scenesList: { actTitle: string; chapterTitle: string; scene: Scene }[] = [];
  project.acts.forEach(act => {
    act.chapters.forEach(ch => {
      ch.scenes.forEach(sc => {
        scenesList.push({
          actTitle: act.title,
          chapterTitle: ch.title,
          scene: sc
        });
      });
    });
  });

  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto overflow-x-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-rose-400" />
            Матрица сюжетных линий романа
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Отслеживание развития линий по главам и сценам, выявление перерывов и пересечений конфликтов.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Активна
          </span>
          <span className="flex items-center gap-1 ml-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" /> Пауза
          </span>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-300">
              <th className="p-3 font-semibold w-72 sticky left-0 bg-slate-950/95 z-10 border-r border-slate-800">
                Сцена / Глава / POV
              </th>
              {project.storylines.map(sl => (
                <th key={sl.id} className="p-3 font-semibold min-w-44 border-r border-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sl.color }} />
                    <span className="truncate" style={{ color: sl.color }}>{sl.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal font-sans block mt-0.5 truncate">
                    {sl.description}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {scenesList.map(({ chapterTitle, scene }) => {
              const isSelected = scene.id === activeSceneId;
              const povChar = universe.entities.find(e => e.id === scene.passport.povCharacterId);

              return (
                <tr
                  key={scene.id}
                  className={`transition hover:bg-slate-800/40 ${
                    isSelected ? 'bg-rose-950/30 font-medium' : ''
                  }`}
                >
                  {/* Row Header (Scene details) */}
                  <td
                    onClick={() => onSelectScene(scene.id)}
                    className="p-3 sticky left-0 bg-slate-900/95 z-10 border-r border-slate-800 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-slate-100 truncate">{scene.title}</span>
                      <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-400">
                        {scene.wordCount} сл.
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span className="truncate text-slate-400">{chapterTitle}</span>
                      <span className="text-rose-300 font-mono text-[10px]">
                        POV: {povChar?.title || '—'}
                      </span>
                    </div>
                  </td>

                  {/* Storyline Columns */}
                  {project.storylines.map(sl => {
                    const hasStoryline = scene.passport.storylineIds.includes(sl.id);
                    return (
                      <td
                        key={sl.id}
                        onClick={() => onToggleStorylineForScene(scene.id, sl.id)}
                        className="p-3 text-center border-r border-slate-800/40 cursor-pointer hover:bg-slate-800/60 transition"
                      >
                        {hasStoryline ? (
                          <div
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium shadow-sm transition"
                            style={{
                              backgroundColor: `${sl.color}25`,
                              color: sl.color,
                              border: `1px solid ${sl.color}60`
                            }}
                          >
                            <Zap className="w-3 h-3" />
                            <span>В фокусе</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-mono hover:text-slate-200">
                            —
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
        <Pause className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          <strong>Совет архитектора вселенной:</strong> Нажмите на ячейку пересечения, чтобы включить или отключить сюжетную линию в сцене. Отсутствие линии в нескольких сценах подряд допустимо и считается драматургической паузой для концентрации на параллельной интриге.
        </p>
      </div>
    </div>
  );
};
