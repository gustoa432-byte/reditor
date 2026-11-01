import React from 'react';
import { Scene, ScenePassport as IScenePassport, UniverseData } from '../../types';

interface ScenePassportProps {
  scene: Scene;
  universe: UniverseData;
  onUpdatePassport: (field: keyof IScenePassport, value: any) => void;
}

export const ScenePassport: React.FC<ScenePassportProps> = ({
  scene,
  universe,
  onUpdatePassport
}) => {
  const characters = universe.entities.filter(e => e.type === 'character');
  const locations = universe.entities.filter(e => e.type === 'location' || e.type === 'organization');

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6 min-h-0">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-lg font-serif font-bold text-slate-100">
          Паспорт сцены: {scene.title}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Необязательная драматургическая анкета. Заполняйте только те поля, которые помогают удерживать замысел.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* POV Character */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Точка зрения (POV):</label>
          <select
            value={scene.passport.povCharacterId || ''}
            onChange={e => onUpdatePassport('povCharacterId', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            <option value="">-- Выбрать персонажа --</option>
            {characters.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Место действия (Локация):</label>
          <select
            value={scene.passport.locationId || ''}
            onChange={e => onUpdatePassport('locationId', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            <option value="">-- Выбрать локацию --</option>
            {locations.map(l => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>
        </div>

        {/* Epoch / Year */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Эпоха / Временная привязка:</label>
          <input
            type="text"
            value={scene.passport.epochYear || ''}
            onChange={e => onUpdatePassport('epochYear', e.target.value)}
            placeholder="Например: 120 г. от основания, Эпоха Катастрофы"
            className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Polarity Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">Драматургическая полярность (+/-):</label>
            <span className={`text-xs font-mono font-bold ${
              scene.passport.polarity > 0 ? 'text-emerald-400' : scene.passport.polarity < 0 ? 'text-rose-400' : 'text-slate-400'
            }`}>
              {scene.passport.polarity > 0 ? `+${scene.passport.polarity}` : scene.passport.polarity}
            </span>
          </div>
          <input
            type="range"
            min="-2"
            max="2"
            step="1"
            value={scene.passport.polarity}
            onChange={e => onUpdatePassport('polarity', parseInt(e.target.value, 10))}
            className="w-full accent-rose-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>-2 (Крах)</span>
            <span>-1</span>
            <span>0 (Баланс)</span>
            <span>+1</span>
            <span>+2 (Триумф)</span>
          </div>
        </div>
      </div>

      {/* Narrative & Dramatic Core Fields */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Цель персонажа в сцене:</label>
          <input
            type="text"
            value={scene.passport.characterGoal}
            onChange={e => onUpdatePassport('characterGoal', e.target.value)}
            placeholder="Чего конкретно хочет достичь герой в первой трети сцены?"
            className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Конфликт / Препятствие:</label>
          <input
            type="text"
            value={scene.passport.conflictObstacle}
            onChange={e => onUpdatePassport('conflictObstacle', e.target.value)}
            placeholder="Что или кто встает на пути героя (внутреннее или внешнее сопротивление)?"
            className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Исходное состояние:</label>
            <textarea
              rows={2}
              value={scene.passport.initialState}
              onChange={e => onUpdatePassport('initialState', e.target.value)}
              placeholder="В каком физическом/эмоциональном состоянии герой начинает сцену?"
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Итоговое состояние:</label>
            <textarea
              rows={2}
              value={scene.passport.finalState}
              onChange={e => onUpdatePassport('finalState', e.target.value)}
              placeholder="С каким сдвигом герой завершает сцену?"
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Драматургический поворот:</label>
            <input
              type="text"
              value={scene.passport.dramaticTurn}
              onChange={e => onUpdatePassport('dramaticTurn', e.target.value)}
              placeholder="Неожиданное открытие, срыв плана или откровение"
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Сюжетный крючок (Клиффхэнгер):</label>
            <input
              type="text"
              value={scene.passport.hook}
              onChange={e => onUpdatePassport('hook', e.target.value)}
              placeholder="Вопрос или угроза, заставляющая перевернуть страницу"
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Функция сцены в произведении:</label>
          <input
            type="text"
            value={scene.passport.sceneFunction}
            onChange={e => onUpdatePassport('sceneFunction', e.target.value)}
            placeholder="Экспозиция, завязка, эскалация, кульминация, развязка..."
            className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>
    </div>
  );
};
