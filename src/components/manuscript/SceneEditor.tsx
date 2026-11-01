import React from 'react';
import { Scene } from '../../types';

interface SceneEditorProps {
  scene: Scene;
  onUpdateText: (newText: string) => void;
}

export const SceneEditor: React.FC<SceneEditorProps> = ({
  scene,
  onUpdateText
}) => {
  const insertDialogueDash = () => {
    onUpdateText(`${scene.text ? scene.text + '\n' : ''}— `);
  };

  const insertQuotes = () => {
    onUpdateText(`${scene.text}«»`);
  };

  const insertHeading = () => {
    onUpdateText(`${scene.text ? scene.text + '\n\n' : ''}### `);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-slate-950">
      {/* Writer's Mini Toolbar */}
      <div className="px-4 sm:px-6 py-2 border-b border-slate-800/80 bg-slate-950 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={insertHeading}
            className="px-2 py-0.5 rounded hover:bg-slate-800 hover:text-slate-200 font-serif font-bold cursor-pointer"
            title="Вставить заголовок"
          >
            H3
          </button>
          <button
            onClick={insertDialogueDash}
            title="Вставить реплику диалога (тире)"
            className="px-2 py-0.5 rounded hover:bg-slate-800 hover:text-slate-200 font-mono font-bold cursor-pointer"
          >
            — Диалог
          </button>
          <button
            onClick={insertQuotes}
            title="Вставить русские кавычки « »"
            className="px-2 py-0.5 rounded hover:bg-slate-800 hover:text-slate-200 font-mono font-bold cursor-pointer"
          >
            « »
          </button>
          <span className="w-px h-3.5 bg-slate-800 mx-1" />
          <span className="text-[11px] font-mono text-slate-400">
            {scene.wordCount || 0} слов · ~{Math.max(1, Math.round((scene.wordCount || 0) / 200))} мин.
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          <span className="hidden sm:inline">Автосохранение активно</span>
        </div>
      </div>

      {/* Prose Textarea */}
      <div className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto scrollbar-thin max-w-4xl mx-auto w-full min-h-0">
        <textarea
          value={scene.text}
          onChange={e => onUpdateText(e.target.value)}
          placeholder="Начните писать сцену здесь... Описывайте действия, диалоги и чувственный опыт персонажей..."
          className="w-full h-full min-h-[400px] bg-transparent text-slate-200 font-serif text-base md:text-lg leading-relaxed focus:outline-none resize-none placeholder-slate-500"
        />
      </div>
    </div>
  );
};
