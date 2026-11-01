import React, { useState } from 'react';
import { EntityState } from '../../types';
import { X, ArrowRightLeft } from 'lucide-react';

interface CompareStatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityTitle: string;
  states: EntityState[];
  initialStateAId?: string;
  initialStateBId?: string;
}

export const CompareStatesModal: React.FC<CompareStatesModalProps> = ({
  isOpen,
  onClose,
  entityTitle,
  states,
  initialStateAId,
  initialStateBId
}) => {
  const [stateAId, setStateAId] = useState<string>(initialStateAId || states[0]?.id || '');
  const [stateBId, setStateBId] = useState<string>(initialStateBId || states[1]?.id || states[0]?.id || '');

  if (!isOpen) return null;

  const stateA = states.find(s => s.id === stateAId) || states[0];
  const stateB = states.find(s => s.id === stateBId) || states[1];

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Сравнение хронологических состояний: {entityTitle}
            </h3>
            <p className="text-xs text-slate-400">
              Сопоставление физических, психологических и технологических трансформаций
            </p>
          </div>
        </div>

        {/* State Selectors */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-800 shrink-0">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Состояние 1:
            </label>
            <select
              value={stateAId}
              onChange={e => setStateAId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {states.map(s => (
                <option key={s.id} value={s.id}>
                  {s.epochOrYear} — {s.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Состояние 2:
            </label>
            <select
              value={stateBId}
              onChange={e => setStateBId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {states.map(s => (
                <option key={s.id} value={s.id}>
                  {s.epochOrYear} — {s.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparative Columns */}
        <div className="flex-1 overflow-y-auto pt-4 space-y-4">
          {/* Physical State */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <h4 className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">
              Физическое состояние / Сенсорный опыт:
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-300">
                {stateA?.physicalState || '—'}
              </div>
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-300">
                {stateB?.physicalState || '—'}
              </div>
            </div>
          </div>

          {/* Mental State */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <h4 className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">
              Психология / Память / Знания:
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-300">
                {stateA?.mentalState || '—'}
              </div>
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-300">
                {stateB?.mentalState || '—'}
              </div>
            </div>
          </div>

          {/* Abilities */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <h4 className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">
              Способности и технологии:
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-300">
                {stateA?.abilities || '—'}
              </div>
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-300">
                {stateB?.abilities || '—'}
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <h4 className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">
              Цели и намерения:
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-300">
                {stateA?.goals || '—'}
              </div>
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-300">
                {stateB?.goals || '—'}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
