import React, { useRef } from 'react';
import { UniverseData } from '../../types';
import {
  exportManuscriptAsMarkdown,
  exportUniverseAsJSON,
  resetUniverseToDefault
} from '../../utils/storage';
import {
  Download,
  Upload,
  FileText,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  universe: UniverseData;
  onRestoreUniverse: (data: UniverseData) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  universe,
  onRestoreUniverse
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.entities && parsed.projects) {
          onRestoreUniverse(parsed);
          onClose();
        } else {
          alert('Файл не содержит корректную структуру базы вселенной REDCROW 3000.');
        }
      } catch (err) {
        alert('Ошибка при разборе JSON файла.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDefault = () => {
    if (confirm('Сбросить базу вселенной к исходному эталонному канону REDCROW 3000? Все текущие правки будут заменены.')) {
      const reset = resetUniverseToDefault();
      onRestoreUniverse(reset);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
              <Download className="w-5 h-5 text-rose-400" />
              Экспорт, резервные копии и переносимость
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Local-First архитектура: полный контроль автора над текстами и базой без привязки к закрытым форматам.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Grid */}
        <div className="space-y-3">
          {/* 1. Export JSON Full Universe */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                Полный архив вселенной (JSON)
              </span>
              <p className="text-[11px] text-slate-400">
                Все {universe.entities.length} карточек с динамическими состояниями, связи, события хронологии, заметки и рукописи.
              </p>
            </div>
            <button
              onClick={() => exportUniverseAsJSON(universe)}
              className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shrink-0 cursor-pointer transition shadow-md"
            >
              Скачать JSON
            </button>
          </div>

          {/* 2. Export Manuscript Markdown */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-rose-400" />
                Рукопись романа (Markdown / DOCX-ready)
              </span>
              <p className="text-[11px] text-slate-400">
                Экспорт глав, актов и художественного текста сцен со структурой и метаданными POV.
              </p>
            </div>
            <button
              onClick={() => exportManuscriptAsMarkdown(universe)}
              className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shrink-0 cursor-pointer transition shadow-md"
            >
              Скачать Markdown
            </button>
          </div>

          {/* 3. Restore / Import JSON */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-purple-400" />
                Восстановить базу из файла (JSON)
              </span>
              <p className="text-[11px] text-slate-400">
                Загрузите ранее экспортированный файл снимка вселенной REDCROW 3000.
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shrink-0 cursor-pointer transition"
              >
                Выбрать файл
              </button>
            </div>
          </div>
        </div>

        {/* Danger zone / Reset */}
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-xs text-slate-300">
              Сброс к исходному эталонному канону (REDCROW 3000 v3.0)
            </span>
          </div>
          <button
            onClick={handleResetToDefault}
            className="px-3 py-1.5 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/50 text-xs font-medium cursor-pointer transition"
          >
            Сбросить
          </button>
        </div>
      </div>
    </div>
  );
};
