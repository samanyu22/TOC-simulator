import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { GraphNode, GraphEdge } from '../../types/automata';
import { computeInitialLayout, groupEdges, calculateEdgePath, resolveNodeCollisions } from '../../utils/graph-layout';
import { ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';

interface AutomataGraphProps {
  states: string[];
  initialState: string;
  acceptStates: string[];
  transitions: Array<{ from: string; symbol: string; to: string }>;
  activeStates?: string[];
  highlightedEdges?: Array<{ from: string; to: string; symbol?: string }>;
  subsetsMap?: Record<string, string[]>;
  onSelectState?: (stateId: string) => void;
  selectedState?: string | null;
  title?: string;
  className?: string;
}

export const AutomataGraph: React.FC<AutomataGraphProps> = ({
  states,
  initialState,
  acceptStates,
  transitions,
  activeStates = [],
  highlightedEdges = [],
  subsetsMap,
  onSelectState,
  selectedState,
  title,
  className = '',
}) => {
  const isDark = useDarkMode();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 420 });
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Hover and Dragging state
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Measure container dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: Math.max(300, entry.contentRect.width),
          height: Math.max(300, entry.contentRect.height),
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute or update layout when states change
  useEffect(() => {
    setNodes((prevNodes) => {
      const prevIds = new Set(prevNodes.map(n => n.id));
      const isSameStateSet = prevNodes.length === states.length && states.every(s => prevIds.has(s));

      const initial = computeInitialLayout(
        states,
        initialState,
        acceptStates,
        dimensions.width,
        dimensions.height,
        subsetsMap
      );

      // If the state set has changed (e.g. preset switch or conversion change), reset completely
      if (!isSameStateSet) {
        return initial;
      }

      // Same state set (e.g. container resize): preserve existing dragged positions
      const existingMap = new Map(prevNodes.map(n => [n.id, n]));
      const merged = initial.map(node => {
        const existing = existingMap.get(node.id);
        if (existing) {
          return {
            ...node,
            x: existing.x,
            y: existing.y,
          };
        }
        return node;
      });

      resolveNodeCollisions(merged, dimensions.width, dimensions.height);
      return merged;
    });
  }, [states, initialState, acceptStates, dimensions.width, dimensions.height, subsetsMap]);

  // Memoize grouped edges to prevent expensive map allocations on every frame
  const edges: GraphEdge[] = useMemo(() => groupEdges(transitions), [transitions]);
  const nodeMap = useMemo(() => new Map<string, GraphNode>(nodes.map(n => [n.id, n])), [nodes]);

  // Handle node dragging
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    if (onSelectState) onSelectState(nodeId);
  };

  // Handle canvas panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  // 120fps RAF-throttled mouse handler to synchronize dragging perfectly with VSYNC
  const rafIdRef = useRef<number | null>(null);
  const pendingMoveRef = useRef<{ clientX: number; clientY: number } | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingNodeId && !isPanning) return;
    pendingMoveRef.current = { clientX: e.clientX, clientY: e.clientY };

    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        if (!pendingMoveRef.current) return;
        const { clientX, clientY } = pendingMoveRef.current;

        if (draggingNodeId) {
          const dx = (clientX - dragStartRef.current.x) / zoom;
          const dy = (clientY - dragStartRef.current.y) / zoom;

          setNodes(prev => prev.map(n => {
            if (n.id === draggingNodeId) {
              return {
                ...n,
                x: n.x + dx,
                y: n.y + dy,
              };
            }
            return n;
          }));
          dragStartRef.current = { x: clientX, y: clientY };
        } else if (isPanning) {
          setPan({
            x: clientX - panStartRef.current.x,
            y: clientY - panStartRef.current.y,
          });
        }
      });
    }
  }, [draggingNodeId, isPanning, zoom]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
  };

  // Zoom helpers
  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(0.4, prev + delta), 2.5));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setNodes(computeInitialLayout(
      states,
      initialState,
      acceptStates,
      dimensions.width,
      dimensions.height,
      subsetsMap
    ));
  };

  // Dynamic radius based on label length
  const getNodeRadius = (label: string) => {
    if (label.length > 8) return 42;
    if (label.length > 4) return 36;
    return 30;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-[450px] rounded-3xl overflow-hidden glass-panel border border-slate-200/80 dark:border-white/[0.08] shadow-2xl select-none transition-colors duration-200 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseDown={handleCanvasMouseDown}
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
    >
      {/* Top Header Title Badge */}
      {title && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-white/90 dark:bg-slate-950/85 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-lg transition-colors pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-800 dark:text-white tracking-wide uppercase font-mono">{title}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">({states.length} states)</span>
        </div>
      )}

      {/* Floating HUD Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl transition-colors">
        <button 
          onClick={() => handleZoom(0.15)} 
          title="Zoom In (+)"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button 
          onClick={() => handleZoom(-0.15)} 
          title="Zoom Out (-)"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button 
          onClick={resetView} 
          title="Reset Graph Layout & Zoom"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Drag & Pan Hint */}
      <div className="absolute bottom-4 left-4 z-10 text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5 pointer-events-none opacity-80">
        <Move className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
        <span>Drag nodes • Pan canvas</span>
      </div>

      {/* Interactive SVG Canvas */}
      <svg 
        className="w-full h-full bg-grid-pattern"
        style={{ cursor: draggingNodeId ? 'grabbing' : 'inherit' }}
      >
        <defs>
          {/* Arrowhead marker for normal edges */}
          <marker
            id="arrowhead-normal"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={isDark ? '#64748b' : '#94a3b8'} />
          </marker>

          {/* Arrowhead marker for active/highlighted edges */}
          <marker
            id="arrowhead-active"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={isDark ? '#22d3ee' : '#0891b2'} />
          </marker>

          {/* High-tech Glowing Filter */}
          <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Render Transitions (Edges) */}
          {edges.map((edge) => {
            const source = nodeMap.get(edge.from);
            const target = nodeMap.get(edge.to);
            if (!source || !target) return null;

            const radius = getNodeRadius(source.label);
            const { path, labelPos } = calculateEdgePath(source, target, edge, radius);
            
            const isHighlighted = highlightedEdges.some(
              he => he.from === edge.from && he.to === edge.to && (!he.symbol || edge.symbols.includes(he.symbol))
            );

            const edgeStroke = isHighlighted
              ? (isDark ? '#22d3ee' : '#0891b2')
              : (isDark ? '#475569' : '#94a3b8');

            const pillFill = isHighlighted
              ? (isDark ? '#0e7490' : '#0891b2')
              : (isDark ? '#0a0f1d' : '#ffffff');

            const pillStroke = isHighlighted
              ? (isDark ? '#22d3ee' : '#06b6d4')
              : (isDark ? '#334155' : '#cbd5e1');

            const pillText = isHighlighted
              ? '#ffffff'
              : (isDark ? '#e2e8f0' : '#1e293b');

            return (
              <g key={edge.id} className="transition-all duration-200 pointer-events-none">
                {/* Edge line with animated dashes when active */}
                <path
                  d={path}
                  fill="none"
                  stroke={edgeStroke}
                  strokeWidth={isHighlighted ? 3 : 2}
                  strokeDasharray={isHighlighted ? '6 4' : 'none'}
                  markerEnd={isHighlighted ? 'url(#arrowhead-active)' : 'url(#arrowhead-normal)'}
                  filter={isHighlighted ? 'url(#neon-glow)' : undefined}
                />

                {/* Transition Symbols Pill Badge */}
                <g transform={`translate(${labelPos.x}, ${labelPos.y})`}>
                  <rect
                    x={-14 * Math.max(1, edge.symbols.join(', ').length * 0.35)}
                    y={-11}
                    width={28 * Math.max(1, edge.symbols.join(', ').length * 0.35)}
                    height={22}
                    rx={7}
                    fill={pillFill}
                    stroke={pillStroke}
                    strokeWidth={1.2}
                    className="shadow-md"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={pillText}
                    className="font-mono text-xs font-bold select-none"
                  >
                    {edge.symbols.join(', ')}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Render States (Nodes) */}
          {nodes.map((node) => {
            const radius = getNodeRadius(node.label);
            const isActive = activeStates.includes(node.id);
            const isSelected = selectedState === node.id;
            const isHovered = hoveredNodeId === node.id;

            const nodeFill = isActive
              ? (isDark ? '#0891b2' : '#06b6d4')
              : isSelected
              ? (isDark ? '#1e1b4b' : '#ede9fe')
              : isHovered
              ? (isDark ? '#111827' : '#f1f5f9')
              : (isDark ? '#080d1a' : '#ffffff');

            const nodeStroke = isActive
              ? (isDark ? '#22d3ee' : '#0891b2')
              : isSelected
              ? (isDark ? '#8b5cf6' : '#6366f1')
              : isHovered
              ? (isDark ? '#38bdf8' : '#0284c7')
              : node.isAccept
              ? (isDark ? '#10b981' : '#059669')
              : (isDark ? '#475569' : '#94a3b8');

            const textColor = isActive
              ? '#ffffff'
              : (isDark ? '#f8fafc' : '#0f172a');

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className="cursor-pointer select-none"
              >
                {/* Seamless Hit Target Area */}
                <circle r={radius + 8} fill="transparent" />

                {/* Initial State Pointer Marker */}
                {node.isInitial && (
                  <g transform={`translate(${-radius - 28}, 0)`} className="pointer-events-none">
                    <line
                      x1={-12}
                      y1={0}
                      x2={16}
                      y2={0}
                      stroke={isDark ? '#8b5cf6' : '#7c3aed'}
                      strokeWidth={2.5}
                      markerEnd="url(#arrowhead-active)"
                    />
                    <rect
                      x={-42}
                      y={-10}
                      width={38}
                      height={20}
                      rx={6}
                      fill={isDark ? '#1e1b4b' : '#ede9fe'}
                      stroke={isDark ? '#8b5cf6' : '#a78bfa'}
                      strokeWidth={1}
                    />
                    <text
                      x={-23}
                      y={0}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={isDark ? '#c4b5fd' : '#5b21b6'}
                      className="text-[9px] font-mono font-black tracking-widest uppercase"
                    >
                      START
                    </text>
                  </g>
                )}

                {/* Active State Soft Pulsing Halo */}
                {isActive && (
                  <circle
                    r={radius + 8}
                    fill="none"
                    stroke={isDark ? '#22d3ee' : '#06b6d4'}
                    strokeWidth={2}
                    className="animate-pulse opacity-75 pointer-events-none"
                  />
                )}

                {/* Selected State Ring */}
                {isSelected && (
                  <circle
                    r={radius + 8}
                    fill="none"
                    stroke={isDark ? '#8b5cf6' : '#6366f1'}
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    className="pointer-events-none"
                  />
                )}

                {/* Stable Hover Highlight Ring (Stationary, Non-Glitching) */}
                {isHovered && !isActive && !isSelected && (
                  <circle
                    r={radius + 6}
                    fill="none"
                    stroke={isDark ? '#38bdf8' : '#0284c7'}
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    className="pointer-events-none opacity-80"
                  />
                )}

                {/* Main Node Body Circle */}
                <circle
                  r={radius}
                  fill={nodeFill}
                  stroke={nodeStroke}
                  strokeWidth={isActive ? 3 : (isSelected || isHovered) ? 2.5 : 2}
                  filter={isActive ? 'url(#neon-glow)' : undefined}
                  className="transition-colors duration-150 shadow-sm"
                />

                {/* Double Circle for Accepting States */}
                {node.isAccept && (
                  <circle
                    r={radius - 6}
                    fill="none"
                    stroke={isActive ? (isDark ? '#cffafe' : '#ffffff') : (isDark ? '#10b981' : '#059669')}
                    strokeWidth={2}
                    className="pointer-events-none"
                  />
                )}

                {/* State Label Text */}
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={textColor}
                  className="font-mono font-black select-none pointer-events-none drop-shadow-xs"
                  style={{
                    fontSize: node.label.length > 8 ? '10px' : node.label.length > 4 ? '12px' : '14px',
                  }}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
