import React, { useState } from 'react';
import { EntityType, CanonStatus, CodexEntity } from '../../types';
import { X, BookOpen, Plus } from 'lucide-react';

interface AddEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEntity: (entity: Partial<CodexEntity>) => void;
}

export const AddEntityModal: React.FC<AddEntityModalProps> = ({
  isOpen,
  onClose,
  onCreateEntity
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EntityType>('character');
  const [description, setDescription] = useState('');
  const [canonStatus, setCanonStatus] = useState<CanonStatus>('canon');
  const [altNames, setAltNames] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateEntity({
      title: title.trim(),
      type,
      description: description.trim() || 'Описание формируется автором.',
      canonStatus,
      altNames: altNames.trim() ? altNames.split(',').map(s => s.trim()).filter(Boolean) : []
    });

    onClose();
    setTitle('');
    setDescription('');
    setAltNames('');
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">Новый объект базы знаний</h3>
            <p className="text-xs text-slate-400">Персонаж, локация, организация, эпоха или концепт</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Название объекта (обязательно):
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Например: Фелиция Вейл, Черный Остров, Протокол..."
              required
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Тип сущности:</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as EntityType)}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
              >
                <option value="character">Персонаж</option>
                <option value="location">Локация / География</option>
                <option value="civilization">Цивилизация</option>
                <option value="organization">Организация / Фракция</option>
                <option value="technology">Технология / Магия</option>
                <option value="epoch">Историческая эпоха</option>
                <option value="artifact">Артефакт / Предмет</option>
                <option value="species">Биологический вид</option>
                <option value="culture">Культура / Религия</option>
                <option value="concept">Философская концепция</option>
                <option value="custom">Другое</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Статус канона:</label>
              <select
                value={canonStatus}
                onChange={e => setCanonStatus(e.target.value as CanonStatus)}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
              >
                <option value="canon">Канон вселенной</option>
                <option value="hypothesis">Гипотеза автора</option>
                <option value="alternative">Альтернативная версия</option>
                <option value="note">Внутренняя заметка</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Альтернативные имена (через запятую):
            </label>
            <input
              type="text"
              value={altNames}
              onChange={e => setAltNames(e.target.value)}
              placeholder="Синонимы, прозвища, древние названия..."
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Краткое каноническое описание:
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Основная суть, природа и роль в мире..."
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-rose-500 resize-none"
            />
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
              className="px-4 py-2 rounded-lg text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Создать объект</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
