import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { GraphNode, GraphEdge } from '../../types/automata';
import { EPSILON } from '../../types/automata';
import { computeInitialLayout, groupEdges, calculateEdgePath, resolveNodeCollisions } from '../../utils/graph-layout';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Move, 
  Plus, 
  ArrowRight, 
  Trash2, 
  CheckCircle2, 
  Flag, 
  GitBranch, 
  X, 
  PlusCircle, 
  Sparkles, 
  Link2 
} from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';

export interface AutomataGraphProps {
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
  isEditable?: boolean;
  alphabet?: string[];
  onAddState?: (name: string, isAccept?: boolean) => void;
  onAddTransition?: (from: string, symbol: string, to: string) => void;
  onDeleteState?: (stateId: string) => void;
  onDeleteTransition?: (from: string, to: string, symbol?: string) => void;
  onToggleAcceptState?: (stateId: string) => void;
  onSetInitialState?: (stateId: string) => void;
}

interface ContextMenuState {
  isOpen: boolean;
  type: 'canvas' | 'node' | 'edge';
  x: number;
  y: number;
  canvasX: number;
  canvasY: number;
  targetNodeId?: string;
  targetEdge?: { from: string; to: string; symbols: string[] };
}

export const AutomataGraph: React.FC<AutomataGraphProps> = React.memo(({
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
  isEditable = false,
  alphabet = ['0', '1'],
  onAddState,
  onAddTransition,
  onDeleteState,
  onDeleteTransition,
  onToggleAcceptState,
  onSetInitialState,
}) => {
  const isDark = useDarkMode();
  const containerRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 420 });
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Custom node positions cache to prevent layout jumps when adding/dragging nodes
  const customPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Hover and Dragging state
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Right-click context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    type: 'canvas',
    x: 0,
    y: 0,
    canvasX: 0,
    canvasY: 0,
  });

  // Modal for creating/editing transitions
  const [transitionModal, setTransitionModal] = useState<{
    isOpen: boolean;
    fromState: string;
    toState: string;
    symbol: string;
  }>({
    isOpen: false,
    fromState: '',
    toState: '',
    symbol: alphabet[0] || '0',
  });

  // Interactive line connection mode: right click a node -> choose Connect -> click another node
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [connectingMousePos, setConnectingMousePos] = useState<{ x: number; y: number } | null>(null);

  // Available symbols for transitions
  const availableSymbols = useMemo(() => {
    const list = Array.from(new Set([...alphabet, '0', '1', EPSILON]));
    return list;
  }, [alphabet]);

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
      const initial = computeInitialLayout(
        states,
        initialState,
        acceptStates,
        dimensions.width,
        dimensions.height,
        subsetsMap
      );

      const existingMap = new Map(prevNodes.map(n => [n.id, n]));
      const merged = initial.map(node => {
        // Prioritize custom/dragged positions
        const customPos = customPositionsRef.current.get(node.id);
        if (customPos) {
          return {
            ...node,
            x: customPos.x,
            y: customPos.y,
          };
        }
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

  // Memoize grouped edges
  const edges: GraphEdge[] = useMemo(() => groupEdges(transitions), [transitions]);
  const nodeMap = useMemo(() => new Map<string, GraphNode>(nodes.map(n => [n.id, n])), [nodes]);

  // Convert mouse event coordinates into SVG canvas space
  const getCanvasCoords = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0, clientRelX: 0, clientRelY: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const clientRelX = e.clientX - rect.left;
    const clientRelY = e.clientY - rect.top;
    const canvasX = (clientRelX - pan.x) / zoom;
    const canvasY = (clientRelY - pan.y) / zoom;
    return { x: canvasX, y: canvasY, clientRelX, clientRelY };
  }, [pan.x, pan.y, zoom]);

  // Helper to suggest next state name (e.g. q0, q1 -> q2)
  const getNextStateName = useCallback(() => {
    for (let i = 0; i < 100; i++) {
      const candidate = `q${i}`;
      if (!states.includes(candidate)) return candidate;
    }
    return `q${states.length}`;
  }, [states]);

  // Close context menu on outside click or Escape
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (contextMenuRef.current && contextMenuRef.current.contains(e.target as Node)) {
        return;
      }
      setContextMenu(prev => prev.isOpen ? { ...prev, isOpen: false } : prev);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(prev => prev.isOpen ? { ...prev, isOpen: false } : prev);
        setTransitionModal(prev => prev.isOpen ? { ...prev, isOpen: false } : prev);
        setConnectingFrom(null);
      }
    };

    window.addEventListener('mousedown', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle canvas right-click
  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    if (!isEditable) return;
    e.preventDefault();
    e.stopPropagation();
    const { x, y, clientRelX, clientRelY } = getCanvasCoords(e);
    setContextMenu({
      isOpen: true,
      type: 'canvas',
      x: clientRelX,
      y: clientRelY,
      canvasX: Math.round(x),
      canvasY: Math.round(y),
    });
  }, [isEditable, getCanvasCoords]);

  // Handle node right-click
  const handleNodeContextMenu = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (!isEditable) return;
    e.preventDefault();
    e.stopPropagation();
    const { x, y, clientRelX, clientRelY } = getCanvasCoords(e);
    setContextMenu({
      isOpen: true,
      type: 'node',
      x: clientRelX,
      y: clientRelY,
      canvasX: Math.round(x),
      canvasY: Math.round(y),
      targetNodeId: nodeId,
    });
  }, [isEditable, getCanvasCoords]);

  // Handle edge right-click
  const handleEdgeContextMenu = useCallback((e: React.MouseEvent, edge: GraphEdge) => {
    if (!isEditable) return;
    e.preventDefault();
    e.stopPropagation();
    const { x, y, clientRelX, clientRelY } = getCanvasCoords(e);
    setContextMenu({
      isOpen: true,
      type: 'edge',
      x: clientRelX,
      y: clientRelY,
      canvasX: Math.round(x),
      canvasY: Math.round(y),
      targetEdge: { from: edge.from, to: edge.to, symbols: edge.symbols },
    });
  }, [isEditable, getCanvasCoords]);

  // Handle node dragging & selection
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (e.button !== 0) return; // Only left click drags
    e.stopPropagation();

    // If currently in connection mode, clicking this node completes connection
    if (connectingFrom) {
      setTransitionModal({
        isOpen: true,
        fromState: connectingFrom,
        toState: nodeId,
        symbol: availableSymbols[0] || '0',
      });
      setConnectingFrom(null);
      return;
    }

    setDraggingNodeId(nodeId);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    if (onSelectState) onSelectState(nodeId);
  };

  // Handle canvas panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (connectingFrom) {
      setConnectingFrom(null);
      return;
    }
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  // 120fps RAF-throttled mouse handler
  const rafIdRef = useRef<number | null>(null);
  const pendingMoveRef = useRef<{ clientX: number; clientY: number } | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // If in connecting mode, update the trailing arrow
    if (connectingFrom) {
      const { x, y } = getCanvasCoords(e);
      setConnectingMousePos({ x, y });
    }

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
              const updated = {
                ...n,
                x: n.x + dx,
                y: n.y + dy,
              };
              customPositionsRef.current.set(n.id, { x: updated.x, y: updated.y });
              return updated;
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
  }, [draggingNodeId, isPanning, zoom, connectingFrom, getCanvasCoords]);

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
    customPositionsRef.current.clear();
    setNodes(computeInitialLayout(
      states,
      initialState,
      acceptStates,
      dimensions.width,
      dimensions.height,
      subsetsMap
    ));
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  // Action: Add state at context menu coordinates
  const handleAddStateHere = (name?: string, isAccept: boolean = false) => {
    const stateName = (name && name.trim()) || getNextStateName();
    customPositionsRef.current.set(stateName, { x: contextMenu.canvasX, y: contextMenu.canvasY });
    if (onAddState) {
      onAddState(stateName, isAccept);
    }
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  // Action: Open transition modal
  const openTransitionModal = (from?: string, to?: string) => {
    setTransitionModal({
      isOpen: true,
      fromState: from || states[0] || 'q0',
      toState: to || (states.length > 1 ? states[1] : states[0] || 'q0'),
      symbol: availableSymbols[0] || '0',
    });
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  // Action: Start interactive visual connection mode
  const startConnectingMode = (fromNodeId: string) => {
    const node = nodeMap.get(fromNodeId);
    setConnectingFrom(fromNodeId);
    setConnectingMousePos(node ? { x: node.x, y: node.y } : null);
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  // Action: Confirm transition creation
  const handleConfirmAddTransition = () => {
    if (!transitionModal.fromState || !transitionModal.toState || !transitionModal.symbol) return;
    if (onAddTransition) {
      onAddTransition(
        transitionModal.fromState,
        transitionModal.symbol,
        transitionModal.toState
      );
    }
    setTransitionModal(prev => ({ ...prev, isOpen: false }));
  };

  // Dynamic radius based on label length
  const getNodeRadius = (label: string) => {
    if (label.length > 8) return 42;
    if (label.length > 4) return 36;
    return 30;
  };

  const targetNode = contextMenu.targetNodeId ? nodeMap.get(contextMenu.targetNodeId) : null;
  const nextSuggested = getNextStateName();

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-[450px] rounded-3xl overflow-hidden glass-panel border border-slate-200/80 dark:border-white/[0.08] shadow-2xl select-none transition-colors duration-200 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseDown={handleCanvasMouseDown}
      onContextMenu={handleCanvasContextMenu}
      style={{ cursor: isPanning ? 'grabbing' : connectingFrom ? 'crosshair' : 'grab' }}
    >
      {/* Top Header Title Badge */}
      {title && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-[#faf7f2]/95 dark:bg-slate-950/85 backdrop-blur-md border border-stone-200/90 dark:border-white/10 shadow-lg transition-colors pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-400 animate-pulse"></span>
          <span className="text-xs font-bold text-stone-900 dark:text-white tracking-wide uppercase font-mono">{title}</span>
          <span className="text-xs text-stone-500 dark:text-slate-400 font-mono">({states.length} states)</span>
        </div>
      )}

      {/* Interactive Connecting Banner */}
      {connectingFrom && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xl text-xs font-bold font-mono animate-in fade-in slide-in-from-top-2 duration-150">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>Connect from state "{connectingFrom}": Click target node (Esc to cancel)</span>
          <button
            onClick={() => setConnectingFrom(null)}
            className="p-1 rounded-lg hover:bg-white/20 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating HUD Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#faf7f2]/95 dark:bg-slate-950/90 backdrop-blur-xl border border-stone-200/90 dark:border-white/10 shadow-2xl transition-colors">
        {isEditable && (
          <button
            onClick={() => {
              const rect = containerRef.current?.getBoundingClientRect();
              const centerX = ((rect?.width || 600) / 2 - pan.x) / zoom;
              const centerY = ((rect?.height || 400) / 2 - pan.y) / zoom;
              const name = getNextStateName();
              customPositionsRef.current.set(name, { x: centerX, y: centerY });
              if (onAddState) onAddState(name);
            }}
            title="Quick Add State (Center)"
            className="p-2 rounded-xl text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
        <button 
          onClick={() => handleZoom(0.15)} 
          title="Zoom In (+)"
          className="p-2 rounded-xl text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800 transition active:scale-95"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button 
          onClick={() => handleZoom(-0.15)} 
          title="Zoom Out (-)"
          className="p-2 rounded-xl text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800 transition active:scale-95"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button 
          onClick={resetView} 
          title="Reset Graph Layout & Zoom"
          className="p-2 rounded-xl text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800 transition active:scale-95"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Drag & Pan & Right-Click Hint */}
      <div className="absolute bottom-4 left-4 z-10 text-[11px] text-stone-500 dark:text-slate-400 font-mono flex items-center gap-1.5 pointer-events-none opacity-80">
        <Move className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
        <span>{isEditable ? 'Right-click canvas or node to edit • Drag nodes' : 'Drag nodes • Pan canvas'}</span>
      </div>

      {/* Interactive SVG Canvas */}
      <svg 
        className="w-full h-full bg-grid-pattern"
        style={{ cursor: draggingNodeId ? 'grabbing' : connectingFrom ? 'crosshair' : 'inherit' }}
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

          {/* Glowing Filter */}
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

            const isEdgeHovered = isEditable && hoveredEdgeId === edge.id;

            const edgeStroke = isHighlighted
              ? (isDark ? '#22d3ee' : '#0891b2')
              : isEdgeHovered
              ? (isDark ? '#38bdf8' : '#0284c7')
              : (isDark ? '#475569' : '#ded5c5');

            const pillFill = isHighlighted
              ? (isDark ? '#0e7490' : '#0891b2')
              : isEdgeHovered
              ? (isDark ? '#1e293b' : '#f0eae0')
              : (isDark ? '#0a0f1d' : '#faf7f2');

            const pillStroke = isHighlighted
              ? (isDark ? '#22d3ee' : '#06b6d4')
              : isEdgeHovered
              ? (isDark ? '#38bdf8' : '#0284c7')
              : (isDark ? '#334155' : '#ded5c5');

            const pillText = isHighlighted
              ? '#ffffff'
              : isEdgeHovered
              ? (isDark ? '#38bdf8' : '#0284c7')
              : (isDark ? '#e2e8f0' : '#292524');

            return (
              <g key={edge.id}>
                {/* Edge line */}
                <path
                  d={path}
                  fill="none"
                  stroke={edgeStroke}
                  strokeWidth={isHighlighted || isEdgeHovered ? 3 : 2}
                  strokeDasharray={isHighlighted ? '6 4' : 'none'}
                  markerEnd={isHighlighted ? 'url(#arrowhead-active)' : 'url(#arrowhead-normal)'}
                  filter={isHighlighted || isEdgeHovered ? 'url(#neon-glow)' : undefined}
                />

                {/* Transition Symbols Pill Badge - clickable on right-click */}
                <g 
                  transform={`translate(${labelPos.x}, ${labelPos.y})`}
                  onContextMenu={(e) => handleEdgeContextMenu(e, edge)}
                  onMouseEnter={() => isEditable && setHoveredEdgeId(edge.id)}
                  onMouseLeave={() => isEditable && setHoveredEdgeId(null)}
                  className={isEditable ? 'cursor-context-menu select-none' : 'pointer-events-none'}
                >
                  {/* Stable generous hit area to prevent cursor flickering */}
                  {isEditable && (
                    <rect
                      x={-14 * Math.max(1, edge.symbols.join(', ').length * 0.35) - 6}
                      y={-15}
                      width={28 * Math.max(1, edge.symbols.join(', ').length * 0.35) + 12}
                      height={30}
                      fill="transparent"
                      pointerEvents="all"
                    />
                  )}

                  {/* Inner graphics group with safe SVG scale (never overrides parent translate!) */}
                  <g 
                    transform={`scale(${isEdgeHovered ? 1.12 : 1})`}
                    style={{ 
                      transformOrigin: '0 0',
                      transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)' 
                    }}
                  >
                    <rect
                      x={-14 * Math.max(1, edge.symbols.join(', ').length * 0.35)}
                      y={-11}
                      width={28 * Math.max(1, edge.symbols.join(', ').length * 0.35)}
                      height={22}
                      rx={7}
                      fill={pillFill}
                      stroke={pillStroke}
                      strokeWidth={isHighlighted || isEdgeHovered ? 2 : 1.2}
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
              </g>
            );
          })}

          {/* Interactive Connecting Line (when dragging to connect nodes) */}
          {connectingFrom && connectingMousePos && (() => {
            const sourceNode = nodeMap.get(connectingFrom);
            if (!sourceNode) return null;
            return (
              <g className="pointer-events-none">
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={connectingMousePos.x}
                  y2={connectingMousePos.y}
                  stroke="#22d3ee"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  markerEnd="url(#arrowhead-active)"
                  className="animate-pulse"
                />
              </g>
            );
          })()}

          {/* Render States (Nodes) */}
          {nodes.map((node) => {
            const radius = getNodeRadius(node.label);
            const isActive = activeStates.includes(node.id);
            const isSelected = selectedState === node.id;
            const isHovered = hoveredNodeId === node.id;
            const isConnectingTarget = connectingFrom && isHovered;

            const nodeFill = isActive
              ? (isDark ? '#0891b2' : '#06b6d4')
              : isSelected
              ? (isDark ? '#1e1b4b' : '#ede9fe')
              : isHovered
              ? (isDark ? '#111827' : '#f4efe6')
              : (isDark ? '#080d1a' : '#faf7f2');

            const nodeStroke = isConnectingTarget
              ? '#22d3ee'
              : isActive
              ? (isDark ? '#22d3ee' : '#0891b2')
              : isSelected
              ? (isDark ? '#8b5cf6' : '#6366f1')
              : isHovered
              ? (isDark ? '#38bdf8' : '#0284c7')
              : node.isAccept
              ? (isDark ? '#10b981' : '#059669')
              : (isDark ? '#475569' : '#ded5c5');

            const textColor = isActive
              ? '#ffffff'
              : (isDark ? '#f8fafc' : '#1c1917');

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onContextMenu={(e) => handleNodeContextMenu(e, node.id)}
                className="cursor-pointer select-none"
              >
                {/* Seamless Hit Target Area */}
                <circle r={radius + 8} fill="transparent" pointerEvents="all" />

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
                      fill={isDark ? '#1e1b4b' : '#f4efe8'}
                      stroke={isDark ? '#8b5cf6' : '#c4b5fd'}
                      strokeWidth={1}
                    />
                    <text
                      x={-23}
                      y={0}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={isDark ? '#c4b5fd' : '#4338ca'}
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

                {/* Connecting Target Highlight Ring (Pulse, never rotate around 0,0) */}
                {isConnectingTarget && (
                  <circle
                    r={radius + 8}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth={2.5}
                    strokeDasharray="5 3"
                    className="animate-pulse pointer-events-none"
                  />
                )}

                {/* Selected State Ring */}
                {isSelected && !isConnectingTarget && (
                  <circle
                    r={radius + 8}
                    fill="none"
                    stroke={isDark ? '#8b5cf6' : '#6366f1'}
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    className="pointer-events-none"
                  />
                )}

                {/* Stable Hover Highlight Ring (Clean static border without glitch) */}
                {isHovered && !isActive && !isSelected && !isConnectingTarget && (
                  <circle
                    r={radius + 6}
                    fill="none"
                    stroke={isDark ? '#38bdf8' : '#0284c7'}
                    strokeWidth={2}
                    className="pointer-events-none opacity-90 transition-opacity duration-150"
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

      {/* =========================================================================
          SEXY GLASSMORPHIC CONTEXT MENU
          ========================================================================= */}
      {contextMenu.isOpen && isEditable && (
        <div 
          ref={contextMenuRef}
          className="absolute z-50 min-w-[220px] rounded-2xl bg-[#faf7f2]/98 dark:bg-slate-950/95 backdrop-blur-2xl border border-stone-200/90 dark:border-white/10 shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100 font-sans"
          style={{
            left: Math.max(10, Math.min(contextMenu.x, dimensions.width - 240)),
            top: Math.max(10, Math.min(contextMenu.y, dimensions.height - 290)),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* MENU TYPE 1: CANVAS RIGHT-CLICK */}
          {contextMenu.type === 'canvas' && (
            <div>
              <div className="px-3 py-2 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  <span>Canvas Actions</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {contextMenu.canvasX}, {contextMenu.canvasY}
                </span>
              </div>

              <div className="py-1 space-y-0.5">
                <button
                  onClick={() => handleAddStateHere()}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 hover:text-cyan-600 dark:hover:text-cyan-300 transition group text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300/60 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    <span>Add State Here</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {nextSuggested}
                  </span>
                </button>

                <button
                  onClick={() => openTransitionModal()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-violet-50 dark:hover:bg-violet-950/60 hover:text-violet-600 dark:hover:text-violet-300 transition group text-left"
                >
                  <div className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-950/80 border border-violet-300/60 dark:border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
                    <GitBranch className="w-3.5 h-3.5" />
                  </div>
                  <span>New Transition...</span>
                </button>
              </div>

              <div className="my-1 border-t border-slate-100 dark:border-white/[0.06]" />

              <button
                onClick={resetView}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition text-left"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Reset View & Zoom</span>
              </button>
            </div>
          )}

          {/* MENU TYPE 2: NODE RIGHT-CLICK */}
          {contextMenu.type === 'node' && contextMenu.targetNodeId && (
            <div>
              <div className="px-3 py-2 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black font-mono px-2 py-0.5 rounded-lg bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-300/80 dark:border-cyan-500/40">
                    {contextMenu.targetNodeId}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">State Menu</span>
                </div>
                {targetNode?.isInitial && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-300/60 dark:border-violet-500/30">
                    START
                  </span>
                )}
              </div>

              <div className="py-1 space-y-0.5">
                <button
                  onClick={() => openTransitionModal(contextMenu.targetNodeId)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 hover:text-cyan-600 dark:hover:text-cyan-300 transition group text-left"
                >
                  <div className="w-6 h-6 rounded-lg bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300/60 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div>Add Transition from {contextMenu.targetNodeId}...</div>
                  </div>
                </button>

                <button
                  onClick={() => startConnectingMode(contextMenu.targetNodeId!)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-300 transition group text-left"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/80 border border-blue-300/60 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Link2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div>Connect with Line</div>
                    <div className="text-[10px] font-normal text-slate-400">Click to connect nodes visually</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (onToggleAcceptState && contextMenu.targetNodeId) {
                      onToggleAcceptState(contextMenu.targetNodeId);
                    }
                    setContextMenu(prev => ({ ...prev, isOpen: false }));
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 dark:hover:text-emerald-300 transition group text-left"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300/60 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div>{targetNode?.isAccept ? 'Unset Accepting Status' : 'Set as Accepting State'}</div>
                    <div className="text-[10px] font-normal text-slate-400">{targetNode?.isAccept ? 'Currently final (double ring)' : 'Toggle final double ring'}</div>
                  </div>
                </button>

                {!targetNode?.isInitial && (
                  <button
                    onClick={() => {
                      if (onSetInitialState && contextMenu.targetNodeId) {
                        onSetInitialState(contextMenu.targetNodeId);
                      }
                      setContextMenu(prev => ({ ...prev, isOpen: false }));
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-violet-50 dark:hover:bg-violet-950/60 hover:text-violet-600 dark:hover:text-violet-300 transition group text-left"
                  >
                    <div className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-950/80 border border-violet-300/60 dark:border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
                      <Flag className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div>Set as Initial State</div>
                      <div className="text-[10px] font-normal text-slate-400">Machine starts execution here</div>
                    </div>
                  </button>
                )}
              </div>

              {/* Delete Node Action */}
              {states.length > 1 && (
                <>
                  <div className="my-1 border-t border-slate-100 dark:border-white/[0.06]" />
                  <button
                    onClick={() => {
                      if (onDeleteState && contextMenu.targetNodeId) {
                        onDeleteState(contextMenu.targetNodeId);
                      }
                      setContextMenu(prev => ({ ...prev, isOpen: false }));
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition group text-left"
                  >
                    <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 border border-rose-300/60 dark:border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                      <Trash2 className="w-3.5 h-3.5" />
                    </div>
                    <div>Delete State "{contextMenu.targetNodeId}"</div>
                  </button>
                </>
              )}
            </div>
          )}

          {/* MENU TYPE 3: EDGE RIGHT-CLICK */}
          {contextMenu.type === 'edge' && contextMenu.targetEdge && (
            <div>
              <div className="px-3 py-2 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800 dark:text-white">
                  <span>{contextMenu.targetEdge.from}</span>
                  <span className="text-cyan-500">──({contextMenu.targetEdge.symbols.join(', ')})──&gt;</span>
                  <span>{contextMenu.targetEdge.to}</span>
                </div>
              </div>

              <div className="py-2 space-y-2">
                <div className="px-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Quick Add Symbol:
                </div>
                <div className="px-3 flex items-center gap-1.5 flex-wrap">
                  {['0', '1', EPSILON].map(sym => {
                    const hasSym = contextMenu.targetEdge?.symbols.includes(sym);
                    return (
                      <button
                        key={sym}
                        disabled={hasSym}
                        onClick={() => {
                          if (onAddTransition && contextMenu.targetEdge) {
                            onAddTransition(contextMenu.targetEdge.from, sym, contextMenu.targetEdge.to);
                          }
                          setContextMenu(prev => ({ ...prev, isOpen: false }));
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                          hasSym
                            ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                            : 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 hover:scale-105 active:scale-95 border border-cyan-300/60 dark:border-cyan-500/40'
                        }`}
                      >
                        +{sym}
                      </button>
                    );
                  })}
                </div>

                <div className="my-1 border-t border-slate-100 dark:border-white/[0.06]" />

                <button
                  onClick={() => {
                    if (onDeleteTransition && contextMenu.targetEdge) {
                      onDeleteTransition(contextMenu.targetEdge.from, contextMenu.targetEdge.to);
                    }
                    setContextMenu(prev => ({ ...prev, isOpen: false }));
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition group text-left"
                >
                  <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 border border-rose-300/60 dark:border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                    <Trash2 className="w-3.5 h-3.5" />
                  </div>
                  <div>Delete Transition</div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SEXY GLASSMORPHIC NEW TRANSITION MODAL
          ========================================================================= */}
      {transitionModal.isOpen && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setTransitionModal(prev => ({ ...prev, isOpen: false }));
            }
          }}
        >
          <div 
            className="w-full max-w-sm rounded-3xl bg-[#faf7f2]/98 dark:bg-slate-950/95 backdrop-blur-2xl border border-stone-200/90 dark:border-white/10 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100 font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-cyan-600/30">
                  <GitBranch className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Transition</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Configure automaton state move</p>
                </div>
              </div>
              <button
                onClick={() => setTransitionModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Source & Target States */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Source State (From):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {states.map(st => (
                    <button
                      key={`from-${st}`}
                      type="button"
                      onClick={() => setTransitionModal(prev => ({ ...prev, fromState: st }))}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition ${
                        transitionModal.fromState === st
                          ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 scale-105'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Destination State (To):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {states.map(st => {
                    const isSelf = st === transitionModal.fromState;
                    return (
                      <button
                        key={`to-${st}`}
                        type="button"
                        onClick={() => setTransitionModal(prev => ({ ...prev, toState: st }))}
                        className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-1 ${
                          transitionModal.toState === st
                            ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 scale-105'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{st}</span>
                        {isSelf && <span className="text-[9px] opacity-75">(self)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Symbol Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Transition Symbol:
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {availableSymbols.map(sym => (
                    <button
                      key={`sym-${sym}`}
                      type="button"
                      onClick={() => setTransitionModal(prev => ({ ...prev, symbol: sym }))}
                      className={`min-w-[36px] px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition ${
                        transitionModal.symbol === sym
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30 scale-105'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {sym === EPSILON ? 'ε (epsilon)' : sym}
                    </button>
                  ))}
                  {/* Custom symbol input */}
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="custom"
                    value={!availableSymbols.includes(transitionModal.symbol) ? transitionModal.symbol : ''}
                    onChange={(e) => setTransitionModal(prev => ({ ...prev, symbol: e.target.value }))}
                    className="w-20 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-mono font-bold text-center focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Delta Preview Badge */}
            <div className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/5 text-center font-mono text-xs">
              Preview: <span className="text-violet-600 dark:text-violet-400 font-bold">δ({transitionModal.fromState}, '{transitionModal.symbol}')</span> → <span className="text-cyan-600 dark:text-cyan-400 font-bold">{transitionModal.toState}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setTransitionModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAddTransition}
                disabled={!transitionModal.symbol}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Transition</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

AutomataGraph.displayName = 'AutomataGraph';
