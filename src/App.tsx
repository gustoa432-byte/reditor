import React, { useState, useEffect } from 'react';
import { UniverseData, WorkspaceTab } from './types';
import { loadUniverseData, saveUniverseData } from './utils/storage';
import { Navigation } from './components/Navigation';
import { Omnisearch } from './components/Omnisearch';
import { DashboardView } from './components/dashboard/DashboardView';
import { ManuscriptStudio } from './components/manuscript/ManuscriptStudio';
import { CodexView } from './components/codex/CodexView';
import { TimelineView } from './components/timeline/TimelineView';
import { AuthorLabView } from './components/lab/AuthorLabView';
import { VisualMapView } from './components/graph/VisualMapView';
import { ConsistencyAuditorView } from './components/audit/ConsistencyAuditorView';
import { AIAssistantView } from './components/ai/AIAssistantView';
import { ExportModal } from './components/export/ExportModal';

export default function App() {
  const [universe, setUniverse] = useState<UniverseData>(() => loadUniverseData());
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>('dashboard');
  const [activeTargetId, setActiveTargetId] = useState<string | undefined>();
  const [searchOpen, setSearchOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  // Sync universe state to localStorage
  const handleUpdateUniverse = (updated: UniverseData) => {
    setUniverse(updated);
    saveUniverseData(updated);
  };

  // Navigation router
  const handleNavigate = (tab: WorkspaceTab, targetId?: string) => {
    setCurrentTab(tab);
    setActiveTargetId(targetId);
    if (tab === 'manuscript' && targetId) {
      handleUpdateUniverse({ ...universe, activeSceneId: targetId });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-900/40 selection:text-white">
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
        onQuickCreate={() => {
          if (currentTab === 'codex') {
            // trigger codex
          } else {
            setCurrentTab('codex');
          }
        }}
      />

      {/* Main Workspace View Switcher */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        {currentTab === 'dashboard' && (
          <DashboardView
            universe={universe}
            onNavigate={handleNavigate}
            onQuickCreate={() => setCurrentTab('codex')}
          />
        )}

        {currentTab === 'manuscript' && (
          <ManuscriptStudio
            universe={universe}
            activeSceneId={activeTargetId || universe.activeSceneId}
            onUpdateUniverse={handleUpdateUniverse}
            onNavigate={handleNavigate}
            onOpenAIAssistant={() => setCurrentTab('ai')}
          />
        )}

        {currentTab === 'codex' && (
          <CodexView
            universe={universe}
            initialSelectedEntityId={activeTargetId}
            onUpdateUniverse={handleUpdateUniverse}
            onNavigate={handleNavigate}
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
          <ConsistencyAuditorView
            universe={universe}
            onUpdateUniverse={handleUpdateUniverse}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'ai' && (
          <AIAssistantView
            universe={universe}
            onNavigate={handleNavigate}
          />
        )}
      </main>

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
    </div>
  );
}
