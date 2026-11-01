import React from 'react';
import { EntityState } from '../../types';
import { Layers, Trash2 } from 'lucide-react';

interface EntityDynamicStatesProps {
  states: EntityState[];
  onDeleteState: (stateId: string) => void;
}

export const EntityDynamicStates: React.FC<EntityDynamicStatesProps> = ({
  states,
  onDeleteState
}) => {
  if (states.length === 0) {
    return (
      <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
        Для этого объекта пока нет динамических состояний в разные эпохи.
        Добавьте первое состояние, чтобы отслеживать изменение характеристик персонажа, локации или фракции во времени.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {states.map(st => (
        <div
          key={st.id}
          className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 relative group"
        >
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-xs font-bold text-slate-100">{st.title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                {st.epochOrYear}
              </span>
            </div>
            <button
              onClick={() => onDeleteState(st.id)}
              className="text-slate-500 hover:text-red-400 p-1 rounded opacity-0 group-hover:opacity-100 transition cursor-pointer"
              title="Удалить это состояние"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
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
                Цели и намерения:
              </strong>
              <p className="text-slate-400 leading-relaxed">{st.goals}</p>
            </div>
          </div>

          {st.notes && (
            <div className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-900">
              Заметка автора: {st.notes}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
