import React, { useState, useEffect } from 'react';
import { UniverseData, WorkspaceTab } from './types';
import { loadUniverseData, saveUniverseData, getStorageStats } from './utils/storage';
import { Navigation } from './components/Navigation';
import { Omnisearch } from './components/Omnisearch';
import { QuickCreateModal } from './components/common/QuickCreateModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { DashboardView } from './components/dashboard/DashboardView';
import { ManuscriptStudio } from './components/manuscript/ManuscriptStudio';
import { CodexView } from './components/codex/CodexView';
import { TimelineView } from './components/timeline/TimelineView';
import { AuthorLabView } from './components/lab/AuthorLabView';
import { VisualMapView } from './components/graph/VisualMapView';
import { ConsistencyAuditorView } from './components/audit/ConsistencyAuditorView';
import { AIAssistantView } from './components/ai/AIAssistantView';
import { ExportModal } from './components/export/ExportModal';
import { TrashModal } from './components/trash/TrashModal';
import { ToastNotice } from './components/common/ToastNotice';
import { AlertTriangle, Download, X } from 'lucide-react';

export default function App() {
  const [universe, setUniverse] = useState<UniverseData>(() => loadUniverseData());
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>('dashboard');
  const [activeTargetId, setActiveTargetId] = useState<string | undefined>();
  const [searchOpen, setSearchOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [quotaWarning, setQuotaWarning] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<{
    message: string;
    action?: { label: string; onClick: () => void };
  } | null>(null);

  // Listen for storage quota warnings
  useEffect(() => {
    const handleQuota = (e: Event) => {
      const custom = e as CustomEvent<{ message: string }>;
      setQuotaWarning(custom.detail?.message || 'Предупреждение хранилища: рекомендуется создать резервную копию.');
    };
    window.addEventListener('redcrow-storage-quota-warning', handleQuota);
    return () => window.removeEventListener('redcrow-storage-quota-warning', handleQuota);
  }, []);

  // Safe functional universe state updater
  const handleUpdateUniverse = (updater: UniverseData | ((prev: UniverseData) => UniverseData)) => {
    setUniverse(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveUniverseData(next);
      return next;
    });
  };

  // Safe navigation handler avoiding closure stale state
  const handleNavigate = (tab: WorkspaceTab, targetId?: string) => {
    setCurrentTab(tab);
    setActiveTargetId(targetId);
    if (tab === 'manuscript' && targetId) {
      setUniverse(prev => {
        const next = { ...prev, activeSceneId: targetId };
        saveUniverseData(next);
        return next;
      });
    }
  };

  const showItemDeletedNotice = (title: string, onUndo: () => void) => {
    setToastNotice({
      message: `«${title}» перемещен(а) в корзину`,
      action: {
        label: 'Отменить',
        onClick: onUndo
      }
    });
  };

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-rose-900/40 selection:text-white">
        {/* Storage Quota Alert Banner */}
        {quotaWarning && (
          <div className="bg-amber-950/90 border-b border-amber-800 text-amber-200 px-4 py-2 text-xs flex items-center justify-between gap-3 shrink-0 z-70">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{quotaWarning}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExportOpen(true)}
                className="underline hover:text-white font-medium cursor-pointer"
              >
                Экспортировать JSON
              </button>
              <button
                onClick={() => setQuotaWarning(null)}
                className="p-1 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Top Main Navigation */}
        <Navigation
          currentTab={currentTab}
          onSelectTab={tab => {
            setCurrentTab(tab);
            setActiveTargetId(undefined);
          }}
          universe={universe}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenExport={() => setExportOpen(true)}
          onOpenTrash={() => setTrashOpen(true)}
          onQuickCreate={() => setQuickCreateOpen(true)}
        />

        {/* Main Workspace View Switcher */}
        <main className="flex-1 min-h-0 overflow-hidden relative">
          {currentTab === 'dashboard' && (
            <div className="h-full overflow-y-auto">
              <DashboardView
                universe={universe}
                onNavigate={handleNavigate}
                onQuickCreate={() => setQuickCreateOpen(true)}
              />
            </div>
          )}

          {currentTab === 'manuscript' && (
            <ManuscriptStudio
              universe={universe}
              activeSceneId={activeTargetId || universe.activeSceneId}
              onUpdateUniverse={handleUpdateUniverse}
              onNavigate={handleNavigate}
              onOpenAIAssistant={() => setCurrentTab('ai')}
              onItemDeletedNotice={showItemDeletedNotice}
            />
          )}

          {currentTab === 'codex' && (
            <CodexView
              universe={universe}
              initialSelectedEntityId={activeTargetId}
              onUpdateUniverse={handleUpdateUniverse}
              onNavigate={handleNavigate}
              onItemDeletedNotice={showItemDeletedNotice}
            />
          )}

          {currentTab === 'timeline' && (
            <TimelineView
              universe={universe}
              onUpdateUniverse={handleUpdateUniverse}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'lab' && (
            <AuthorLabView
              universe={universe}
              initialSelectedId={activeTargetId}
              onUpdateUniverse={handleUpdateUniverse}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'graph' && (
            <VisualMapView
              universe={universe}
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'audit' && (
            <div className="h-full overflow-y-auto">
              <ConsistencyAuditorView
                universe={universe}
                onUpdateUniverse={handleUpdateUniverse}
                onNavigate={handleNavigate}
              />
            </div>
          )}

          {currentTab === 'ai' && (
            <div className="h-full overflow-y-auto">
              <AIAssistantView
                universe={universe}
                onNavigate={handleNavigate}
              />
            </div>
          )}
        </main>

        {/* Quick Create Modal */}
        <QuickCreateModal
          isOpen={quickCreateOpen}
          onClose={() => setQuickCreateOpen(false)}
          universe={universe}
          onUpdateUniverse={handleUpdateUniverse}
          onNavigate={handleNavigate}
        />

        {/* Omnisearch Modal */}
        <Omnisearch
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          universe={universe}
          onNavigate={handleNavigate}
        />

        {/* Export / Backup Modal */}
        <ExportModal
          isOpen={exportOpen}
          onClose={() => setExportOpen(false)}
          universe={universe}
          onRestoreUniverse={handleUpdateUniverse}
        />

        {/* Universe Trash Bin Modal */}
        <TrashModal
          isOpen={trashOpen}
          onClose={() => setTrashOpen(false)}
          universe={universe}
          onUpdateUniverse={handleUpdateUniverse}
        />

        {/* Toast Notice for Undo / Deletions */}
        <ToastNotice
          message={toastNotice?.message || null}
          action={toastNotice?.action}
          onDismiss={() => setToastNotice(null)}
        />
      </div>
    </ErrorBoundary>
  );
}
