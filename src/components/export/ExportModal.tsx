import React, { useRef, useState } from 'react';
import { UniverseData } from '../../types';
import {
  exportManuscriptAsMarkdown,
  exportUniverseAsJSON,
  resetUniverseToDefault,
  createEmptyUniverse,
  migrateAndValidateUniverse,
  getStorageStats,
  getEmergencyBackup
} from '../../utils/storage';
import {
  Download,
  Upload,
  FileText,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Settings,
  Plus,
  ShieldAlert,
  Save,
  LifeBuoy,
  X
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  universe: UniverseData;
  onRestoreUniverse: (updater: UniverseData | ((prev: UniverseData) => UniverseData)) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  universe,
  onRestoreUniverse
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'universe'>('export');
  const [newUniverseName, setNewUniverseName] = useState('');
  const [newUniverseTagline, setNewUniverseTagline] = useState('');
  const [editUniverseName, setEditUniverseName] = useState(universe?.universeName || '');
  const [editUniverseTagline, setEditUniverseTagline] = useState(universe?.tagline || '');
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    type: 'empty' | 'demo';
    title: string;
    description: string;
  } | null>(null);

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
        const validated = migrateAndValidateUniverse(parsed);
        onRestoreUniverse(validated);
        onClose();
      } catch {
        alert('Ошибка при разборе JSON файла. Проверьте формат файла.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveProperties = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUniverseName.trim()) return;

    onRestoreUniverse(prev => ({
      ...prev,
      universeName: editUniverseName.trim(),
      tagline: editUniverseTagline.trim()
    }));

    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 2000);
  };

  const handleConfirmCreateEmpty = () => {
    if (!newUniverseName.trim()) return;
    const emptyUniverse = createEmptyUniverse(newUniverseName, newUniverseTagline);
    onRestoreUniverse(emptyUniverse);
    setConfirmModal(null);
    setNewUniverseName('');
    setNewUniverseTagline('');
    onClose();
  };

  const handleConfirmResetDemo = () => {
    const reset = resetUniverseToDefault();
    onRestoreUniverse(reset);
    setConfirmModal(null);
    onClose();
  };

  const handleDownloadEmergencyBackup = () => {
    const backup = getEmergencyBackup();
    if (backup) {
      exportUniverseAsJSON(backup);
    } else {
      exportUniverseAsJSON(universe);
    }
  };

  const stats = universe ? getStorageStats() : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/40">
          <div>
            <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
              <Download className="w-5 h-5 text-rose-400" />
              Вселенная и резервные копии
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Управление авторскими мирами, экспорт и защита от потери данных.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-5 pt-2 shrink-0 gap-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-rose-500 text-rose-200'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Экспорт и импорт</span>
          </button>
          <button
            onClick={() => setActiveTab('universe')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'universe'
                ? 'border-rose-500 text-rose-200'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Управление вселенной</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 scrollbar-thin">
          {/* TAB 1: EXPORT & IMPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              {/* Storage Stats Bar */}
              {stats && (
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-slate-400 font-mono">
                    Объем базы: <strong className="text-slate-200 font-bold">{stats.kbUsed} КБ</strong> ({stats.percentQuota}% от безопасного лимита)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      stats.isNearLimit
                        ? 'bg-amber-950 text-amber-300 border-amber-800/40'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800/40'
                    }`}>
                      {stats.isNearLimit ? 'Рекомендуется экспорт' : 'Хранилище в норме'}
                    </span>
                    <button
                      onClick={handleDownloadEmergencyBackup}
                      title="Скачать аварийный снимок"
                      className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <LifeBuoy className="w-3 h-3" />
                      <span>Аварийная копия</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Best Practice Note */}
              <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-900/40 text-xs text-blue-200 flex items-start gap-2.5">
                <LifeBuoy className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Совет автору:</strong> Среда работает по принципу Local-First и сохраняет данные в браузере. Регулярный экспорт JSON — основной способ гарантировать сохранность вашего авторского труда при очистке браузера или смене устройства.
                </p>
              </div>

              {/* 1. Export JSON Full Universe */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    Полный снимок вселенной (JSON)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Включает все сущности ({universe.entities.length}), хронологию ({universe.events.length}), структуру романов, сцены и лабораторию.
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
                    Текст рукописи (Markdown)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Экспорт всех актов, глав и художественного текста сцен со структурой и метаданными точки зрения (POV).
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
                    Загрузить вселенную из файла (JSON)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Восстановить любую созданную ранее вселенную. Принимает как архивные файлы, так и файлы конфигурации.
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
          )}

          {/* TAB 2: UNIVERSE SETTINGS & CREATION */}
          {activeTab === 'universe' && (
            <div className="space-y-5">
              {/* Edit Properties of Current Universe */}
              <form onSubmit={handleSaveProperties} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-rose-400" />
                  Свойства текущей вселенной
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Название вселенной:</label>
                    <input
                      type="text"
                      required
                      value={editUniverseName}
                      onChange={e => setEditUniverseName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-rose-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Краткий слоган / концепция:</label>
                    <input
                      type="text"
                      value={editUniverseTagline}
                      onChange={e => setEditUniverseTagline(e.target.value)}
                      placeholder="Краткое описание авторского сеттинга..."
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  {isSavedFeedback ? (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Свойства обновлены
                    </span>
                  ) : <span />}
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer transition shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Сохранить свойства</span>
                  </button>
                </div>
              </form>

              {/* Create Empty Universe Section */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    Создать новую пустую вселенную
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Создайте чистый мир для собственного романа без персонажей, дат и сущностей демо-канона REDCROW.
                  </p>
                </div>

                <div className="space-y-2 text-xs pt-1">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Название нового мира: <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newUniverseName}
                      onChange={e => setNewUniverseName(e.target.value)}
                      placeholder="Например: Сага о Стальной Долине"
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Слоган / описание (опционально):</label>
                    <input
                      type="text"
                      value={newUniverseTagline}
                      onChange={e => setNewUniverseTagline(e.target.value)}
                      placeholder="Например: Мир паровых машин и забытой магии"
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!newUniverseName.trim()}
                  onClick={() => setConfirmModal({
                    type: 'empty',
                    title: 'Создать новую вселенную?',
                    description: `Текущая вселенная «${universe.universeName}» будет заменена на чистый мир «${newUniverseName.trim()}». Рекомендуется сначала скачать JSON-снимок текущей базы.`
                  })}
                  className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Начать работу с чистого листа</span>
                </button>
              </div>

              {/* Danger Zone: Reset to Demo */}
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/30 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Сброс к демо-канону REDCROW 3000</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Заменит все данные на демонстрационный мир с Фелицией, Осколками и Чёрным островом.
                  </p>
                </div>
                <button
                  onClick={() => setConfirmModal({
                    type: 'demo',
                    title: 'Сбросить к демо-канону?',
                    description: 'Все текущие сущности, рукописи и гипотезы будут заменены на демо-канон REDCROW 3000. Это действие необратимо без сохраненного JSON-файла.'
                  })}
                  className="px-3.5 py-2 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-xs font-medium cursor-pointer transition shrink-0"
                >
                  Сбросить к демо
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Destructive Action Confirmation Sub-Modal */}
        {confirmModal && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-amber-800/80 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-950/80 border border-amber-700/60 flex items-center justify-center shrink-0 text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-serif font-bold text-slate-100">
                    {confirmModal.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {confirmModal.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={() => exportUniverseAsJSON(universe)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Сначала скачать текущую базу (JSON)</span>
                </button>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirmModal(null)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmModal.type === 'empty') handleConfirmCreateEmpty();
                      else handleConfirmResetDemo();
                    }}
                    className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition cursor-pointer shadow-md"
                  >
                    Подтвердить и заменить
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
