import React, { useState } from 'react';
import { EntityState } from '../../types';
import { X, Layers, Plus } from 'lucide-react';

interface AddStateModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityTitle: string;
  onCreateState: (state: EntityState) => void;
}

export const AddStateModal: React.FC<AddStateModalProps> = ({
  isOpen,
  onClose,
  entityTitle,
  onCreateState
}) => {
  const [epochOrYear, setEpochOrYear] = useState('');
  const [title, setTitle] = useState('');
  const [physicalState, setPhysicalState] = useState('');
  const [mentalState, setMentalState] = useState('');
  const [abilities, setAbilities] = useState('');
  const [goals, setGoals] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const yearNumMatch = epochOrYear.match(/\b(2\d{3}|1\d{3}|\d+)\b/);
    const yearNum = yearNumMatch ? parseInt(yearNumMatch[1], 10) : undefined;

    const newState: EntityState = {
      id: `state-${Date.now()}`,
      epochOrYear: epochOrYear.trim() || 'Новая эпоха',
      yearNum,
      title: title.trim(),
      physicalState: physicalState.trim() || 'Стандартное состояние',
      mentalState: mentalState.trim() || 'Без существенных изменений',
      abilities: abilities.trim() || 'Базовые',
      goals: goals.trim() || 'Сохранение статуса-кво',
      relationships: 'Не указаны',
      resources: 'Не указаны',
      notes: notes.trim() || undefined
    };

    onCreateState(newState);
    onClose();
    setEpochOrYear('');
    setTitle('');
    setPhysicalState('');
    setMentalState('');
    setAbilities('');
    setGoals('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Новое динамическое состояние
            </h3>
            <p className="text-xs text-slate-400">Для объекта: «{entityTitle}»</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Эпоха / Год:
              </label>
              <input
                type="text"
                value={epochOrYear}
                onChange={e => setEpochOrYear(e.target.value)}
                placeholder="2450 г., До Войны..."
                className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Краткое название состояния:
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Например: Хранительница Острова"
                required
                className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Физическое состояние / Сенсорика:
            </label>
            <textarea
              rows={2}
              value={physicalState}
              onChange={e => setPhysicalState(e.target.value)}
              placeholder="Возраст, травмы, физическая форма, модификации..."
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Память / Психология / Знания:
            </label>
            <textarea
              rows={2}
              value={mentalState}
              onChange={e => setMentalState(e.target.value)}
              placeholder="Что помнит, во что верит, психологический надлом..."
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Способности / Ресурсы:
              </label>
              <input
                type="text"
                value={abilities}
                onChange={e => setAbilities(e.target.value)}
                placeholder="Доступ к технологиям, магия..."
                className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Главная цель в эту эпоху:
              </label>
              <input
                type="text"
                value={goals}
                onChange={e => setGoals(e.target.value)}
                placeholder="Выжить, защитить артефакт..."
                className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-cyan-700 hover:bg-cyan-600 text-white disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Сохранить состояние</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
