import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CodexEntity, UniverseData, WorkspaceTab } from '../../types';
import {
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Filter,
  Layers,
  ExternalLink,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface VisualMapViewProps {
  universe: UniverseData;
  onNavigate: (tab: WorkspaceTab, targetId?: string) => void;
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const VisualMapView: React.FC<VisualMapViewProps> = ({
  universe,
  onNavigate
}) => {
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Thematic filter presets from Section 8.2 of spec
  const themePresets = [
    { id: 'all', title: 'Все объекты' },
    { id: 'felicia', title: 'История Фелиции' },
    { id: 'creators', title: 'Создатели и наследие' },
    { id: 'marcus', title: 'Маркус и Цитадель' },
    { id: 'shards', title: 'История трёх осколков' },
    { id: 'island', title: 'Чёрный остров' }
  ];

  // Filter entities according to thematic slice
  const visibleEntities = useMemo(() => {
    if (selectedTheme === 'all') return universe.entities;

    if (selectedTheme === 'felicia') {
      return universe.entities.filter(
        e => e.id === 'char-felicia' || e.id === 'loc-black-island' || e.id === 'art-three-shards' || e.id === 'civ-creators'
      );
    }
    if (selectedTheme === 'creators') {
      return universe.entities.filter(
        e => e.id === 'civ-creators' || e.id === 'tech-resonance' || e.id === 'art-three-shards' || e.id === 'loc-black-island' || e.id === 'char-felicia'
      );
    }
    if (selectedTheme === 'marcus') {
      return universe.entities.filter(
        e => e.id === 'char-marcus' || e.id === 'org-citadel' || e.id === 'char-sam' || e.id === 'loc-black-island'
      );
    }
    if (selectedTheme === 'shards') {
      return universe.entities.filter(
        e => e.id === 'art-three-shards' || e.id === 'char-felicia' || e.id === 'char-sam' || e.id === 'char-marcus' || e.id === 'loc-black-island'
      );
    }
    if (selectedTheme === 'island') {
      return universe.entities.filter(
        e => e.id === 'loc-black-island' || e.id === 'char-felicia' || e.id === 'civ-creators' || e.id === 'art-three-shards'
      );
    }
    return universe.entities;
  }, [universe.entities, selectedTheme]);

  // Node positions layout generator
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});

  useEffect(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const count = visibleEntities.length;
    const centerX = 680;
    const centerY = 420;
    const radius = Math.min(280, Math.max(180, count * 36));

    visibleEntities.forEach((ent, idx) => {
      const angle = (idx / count) * 2 * Math.PI;
      positions[ent.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
    setNodePositions(positions);
  }, [visibleEntities]);

  // Dragging a specific node
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  const handleMouseDownNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDraggedNodeId(id);
    setSelectedNodeId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId) {
      setNodePositions(prev => ({
        ...prev,
        [draggedNodeId]: {
          x: (e.nativeEvent.offsetX - pan.x) / zoom,
          y: (e.nativeEvent.offsetY - pan.y) / zoom
        }
      }));
    } else if (isDraggingCanvas) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
    setIsDraggingCanvas(false);
  };

  // Color mapping by entity type
  const entityTypeColors: Record<string, { bg: string; border: string; glow: string; text: string }> = {
    character: { bg: '#881337', border: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)', text: '#fecdd3' },
    location: { bg: '#083344', border: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', text: '#cffafe' },
    civilization: { bg: '#3b0764', border: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', text: '#f3e8ff' },
    organization: { bg: '#1e1b4b', border: '#6366f1', glow: 'rgba(99, 102, 241, 0.4)', text: '#e0e7ff' },
    artifact: { bg: '#451a03', border: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', text: '#fef3c7' },
    technology: { bg: '#064e3b', border: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', text: '#d1fae5' },
    species: { bg: '#14532d', border: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)', text: '#dcfce7' },
    custom: { bg: '#1f2937', border: '#9ca3af', glow: 'rgba(156, 163, 175, 0.4)', text: '#f3f4f6' }
  };

  const selectedEntity = universe.entities.find(e => e.id === selectedNodeId);

  return (
    <div className="flex h-[calc(100vh-57px)] bg-slate-950 overflow-hidden relative">
      {/* Top Left Thematic Presets Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl max-w-xl">
        <span className="text-[11px] font-mono text-slate-400 px-2 flex items-center gap-1">
          <Layers className="w-3 h-3 text-rose-400" />
          Карты:
        </span>
        {themePresets.map(preset => (
          <button
            key={preset.id}
            onClick={() => {
              setSelectedTheme(preset.id);
              setSelectedNodeId(null);
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition ${
              selectedTheme === preset.id
                ? 'bg-rose-900/70 text-rose-200 border border-rose-700/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {preset.title}
          </button>
        ))}
      </div>

      {/* Top Right Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-800 shadow-xl">
        <button
          onClick={() => setZoom(z => Math.min(z + 0.15, 2.0))}
          title="Приблизить"
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z - 0.15, 0.5))}
          title="Отдалить"
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          title="Сбросить масштаб"
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Canvas Area */}
      <div
        ref={canvasContainerRef}
        onMouseDown={e => {
          setIsDraggingCanvas(true);
          setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden flex items-center justify-center relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]"
      >
        <svg
          className="w-full h-full overflow-visible"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: draggedNodeId ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* Render Connections / Edges */}
          <g className="edges">
            {visibleEntities.flatMap(ent =>
              ent.relations.map(rel => {
                const posA = nodePositions[ent.id];
                const posB = nodePositions[rel.targetEntityId];
                if (!posA || !posB) return null;

                const isConnectedToSelected =
                  ent.id === selectedNodeId || rel.targetEntityId === selectedNodeId;

                const midX = (posA.x + posB.x) / 2;
                const midY = (posA.y + posB.y) / 2;

                return (
                  <g key={`${ent.id}-${rel.targetEntityId}-${rel.id}`}>
                    <line
                      x1={posA.x}
                      y1={posA.y}
                      x2={posB.x}
                      y2={posB.y}
                      stroke={isConnectedToSelected ? '#f43f5e' : '#334155'}
                      strokeWidth={isConnectedToSelected ? 2.5 : 1.2}
                      strokeDasharray={rel.relationType === 'contradicts' ? '4 4' : undefined}
                      opacity={isConnectedToSelected ? 0.9 : 0.4}
                    />
                    <text
                      x={midX}
                      y={midY - 4}
                      fill={isConnectedToSelected ? '#fecdd3' : '#64748b'}
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="pointer-events-none select-none bg-slate-950"
                    >
                      {rel.relationType}
                    </text>
                  </g>
                );
              })
            )}
          </g>

          {/* Render Nodes */}
          <g className="nodes">
            {visibleEntities.map(ent => {
              const pos = nodePositions[ent.id] || { x: 680, y: 420 };
              const colors = entityTypeColors[ent.type] || entityTypeColors.custom;
              const isSelected = ent.id === selectedNodeId;

              return (
                <g
                  key={ent.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseDown={e => handleMouseDownNode(e, ent.id)}
                  className="cursor-pointer group"
                >
                  {/* Glowing background ring */}
                  <circle
                    r={isSelected ? 32 : 24}
                    fill={colors.bg}
                    stroke={colors.border}
                    strokeWidth={isSelected ? 3 : 1.5}
                    style={{
                      filter: isSelected ? `drop-shadow(0 0 12px ${colors.glow})` : undefined
                    }}
                    className="transition-all"
                  />

                  {/* Node label */}
                  <text
                    y={36}
                    fill="#f1f5f9"
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="serif"
                    textAnchor="middle"
                    className="select-none pointer-events-none drop-shadow-md"
                  >
                    {ent.title}
                  </text>

                  {/* Type sub-label */}
                  <text
                    y={48}
                    fill={colors.border}
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="select-none pointer-events-none opacity-80"
                  >
                    {ent.type}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Selected Node Details Drawer */}
      {selectedEntity && (
        <aside className="absolute right-4 bottom-4 top-20 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl p-4 flex flex-col justify-between z-30 animate-in fade-in slide-in-from-right duration-200">
          <div className="space-y-3 overflow-y-auto scrollbar-thin">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/40">
                  {selectedEntity.type}
                </span>
                <h3 className="text-base font-serif font-bold text-slate-100 mt-1">
                  {selectedEntity.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedEntity.description}
            </p>

            {/* Dynamic states count */}
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/70 text-xs space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 uppercase block font-semibold">
                Динамические состояния: {selectedEntity.dynamicStates.length}
              </span>
              {selectedEntity.dynamicStates.map(st => (
                <div key={st.id} className="text-[11px] text-slate-400">
                  • <strong className="text-slate-300">{st.epochOrYear}:</strong> {st.title}
                </div>
              ))}
            </div>

            {/* Relations */}
            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-mono text-purple-400 uppercase block font-semibold">
                Связи:
              </span>
              {selectedEntity.relations.map(rel => {
                const target = universe.entities.find(e => e.id === rel.targetEntityId);
                return (
                  <div key={rel.id} className="p-1.5 rounded bg-slate-950/50 text-[11px] text-slate-300 flex justify-between">
                    <span>{rel.relationType} → {target?.title || rel.targetEntityId}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigate('codex', selectedEntity.id)}
            className="w-full mt-3 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
          >
            <span>Открыть карточку в базе</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}
    </div>
  );
};
