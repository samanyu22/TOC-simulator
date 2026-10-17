import type { GraphNode, GraphEdge } from '../types/automata';

export interface Point {
  x: number;
  y: number;
}

export function resolveNodeCollisions(
  nodes: GraphNode[],
  width: number = 600,
  height: number = 400,
  minDistance: number = 90
): void {
  const padding = 55;
  for (let iter = 0; iter < 25; iter++) {
    let moved = false;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        let dx = nodes[j].x - nodes[i].x;
        let dy = nodes[j].y - nodes[i].y;
        let dist = Math.hypot(dx, dy);

        // If nodes are at the exact same spot, give separation vector
        if (dist < 2) {
          dx = (j - i) * 20 || 20;
          dy = 15;
          dist = Math.hypot(dx, dy);
        }

        if (dist < minDistance) {
          moved = true;
          const overlap = (minDistance - dist) / 2;
          const nx = (dx / dist) * overlap;
          const ny = (dy / dist) * overlap;
          nodes[i].x -= nx;
          nodes[i].y -= ny;
          nodes[j].x += nx;
          nodes[j].y += ny;
        }
      }
    }
    if (!moved) break;
  }

  // Clamp within bounds
  for (const node of nodes) {
    node.x = Math.max(padding, Math.min(width - padding, Math.round(node.x)));
    node.y = Math.max(padding, Math.min(height - padding, Math.round(node.y)));
  }
}

/**
 * Computes initial circular layout for states with guaranteed spacing
 */
export function computeInitialLayout(
  stateIds: string[],
  initialState: string,
  acceptStates: string[],
  width: number = 600,
  height: number = 400,
  subsetsMap?: Record<string, string[]>
): GraphNode[] {
  // Deduplicate state IDs while preserving order
  const uniqueIds = Array.from(new Set(stateIds));
  const count = uniqueIds.length;
  if (count === 0) return [];

  // Guarantee that initialState is ALWAYS index 0 (leftmost position facing START arrow)
  const orderedIds = [
    initialState,
    ...uniqueIds.filter(id => id !== initialState),
  ].filter(id => uniqueIds.includes(id));

  const centerX = width / 2;
  const centerY = height / 2;

  // For 2 states, place them on opposite sides horizontally with generous clearance
  if (count === 2) {
    const horizontalGap = Math.min(width * 0.32, 170);
    const nodes: GraphNode[] = [
      {
        id: orderedIds[0],
        label: orderedIds[0],
        x: Math.round(centerX - horizontalGap),
        y: Math.round(centerY),
        isInitial: orderedIds[0] === initialState,
        isAccept: acceptStates.includes(orderedIds[0]),
        substates: subsetsMap ? subsetsMap[orderedIds[0]] : undefined,
      },
      {
        id: orderedIds[1],
        label: orderedIds[1],
        x: Math.round(centerX + horizontalGap),
        y: Math.round(centerY),
        isInitial: orderedIds[1] === initialState,
        isAccept: acceptStates.includes(orderedIds[1]),
        substates: subsetsMap ? subsetsMap[orderedIds[1]] : undefined,
      },
    ];
    return nodes;
  }

  // If 1 node, center it
  if (count === 1) {
    return [{
      id: orderedIds[0],
      label: orderedIds[0],
      x: Math.round(centerX),
      y: Math.round(centerY),
      isInitial: orderedIds[0] === initialState,
      isAccept: acceptStates.includes(orderedIds[0]),
      substates: subsetsMap ? subsetsMap[orderedIds[0]] : undefined,
    }];
  }

  // For 3+ nodes, distribute around circle starting from left (-PI)
  const radius = Math.min(width, height) * 0.35;
  const nodes: GraphNode[] = orderedIds.map((id, index) => {
    const angle = (2 * Math.PI * index) / count - Math.PI;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    return {
      id,
      label: id,
      x: Math.round(x),
      y: Math.round(y),
      isInitial: id === initialState,
      isAccept: acceptStates.includes(id),
      substates: subsetsMap ? subsetsMap[id] : undefined,
    };
  });

  resolveNodeCollisions(nodes, width, height, count === 3 ? 120 : 90);
  return nodes;
}

/**
 * Groups transitions between state pairs to merge labels (e.g. '0', '1' -> '0, 1')
 */
export function groupEdges(
  transitions: Array<{ from: string; symbol: string; to: string }>
): GraphEdge[] {
  const edgeMap = new Map<string, { from: string; to: string; symbols: Set<string>; isSelfLoop: boolean }>();

  for (const t of transitions) {
    const key = `${t.from}--->${t.to}`;
    if (!edgeMap.has(key)) {
      edgeMap.set(key, {
        from: t.from,
        to: t.to,
        symbols: new Set([t.symbol]),
        isSelfLoop: t.from === t.to,
      });
    } else {
      edgeMap.get(key)!.symbols.add(t.symbol);
    }
  }

  const result: GraphEdge[] = [];
  edgeMap.forEach((val, key) => {
    const hasReverse = edgeMap.has(`${val.to}--->${val.from}`) && !val.isSelfLoop;
    result.push({
      id: key,
      from: val.from,
      to: val.to,
      symbols: Array.from(val.symbols).sort(),
      isSelfLoop: val.isSelfLoop,
      curvature: hasReverse ? 0.25 : 0,
    });
  });

  return result;
}

/**
 * Calculates SVG path for an edge between two nodes
 */
export function calculateEdgePath(
  source: GraphNode,
  target: GraphNode,
  edge: GraphEdge,
  sourceRadius: number = 30,
  targetRadius?: number
): { path: string; labelPos: Point } {
  const sRadius = sourceRadius;
  const tRadius = targetRadius ?? sourceRadius;
  // With marker viewBox="0 0 10 10", refX="5", tip at x=9, and markerWidth=7:
  // The tip extends (9 - 5) * 0.7 = 2.8px beyond the line endpoint.
  // We offset the endpoint by (tRadius + 2.8) so the tip touches the node border,
  // and the line stops cleanly inside the arrowhead body without poking past it.
  const arrowTipExtension = 2.8;

  if (edge.isSelfLoop) {
    // Self-loop bezier curve on top of node
    const loopHeight = 55;
    const loopWidth = 40;
    const startX = source.x - 12;
    const startY = source.y - sRadius;
    const endX = source.x + 12;
    const endY = source.y - sRadius - arrowTipExtension;

    const cp1x = source.x - loopWidth;
    const cp1y = source.y - sRadius - loopHeight;
    const cp2x = source.x + loopWidth;
    const cp2y = source.y - sRadius - loopHeight;

    const path = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
    const labelPos = { x: source.x, y: source.y - sRadius - loopHeight * 0.75 };
    return { path, labelPos };
  }

  // Inter-node edge
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const dist = Math.hypot(dx, dy) || 1;

  // Normalized direction
  const ux = dx / dist;
  const uy = dy / dist;

  // Normal vector (perpendicular)
  const nx = -uy;
  const ny = ux;

  const curvature = edge.curvature || 0;

  if (curvature === 0) {
    // Straight line offset dynamically by node radii
    const startX = source.x + ux * sRadius;
    const startY = source.y + uy * sRadius;
    const endX = target.x - ux * (tRadius + arrowTipExtension);
    const endY = target.y - uy * (tRadius + arrowTipExtension);

    const path = `M ${startX} ${startY} L ${endX} ${endY}`;
    const labelPos = {
      x: (startX + endX) / 2 + nx * 14,
      y: (startY + endY) / 2 + ny * 14,
    };
    return { path, labelPos };
  } else {
    // Quadratic bezier curve with control point offset
    const curveOffset = dist * curvature;
    const midX = (source.x + target.x) / 2 + nx * curveOffset;
    const midY = (source.y + target.y) / 2 + ny * curveOffset;

    // Adjust start and end points along curve direction
    const startAngle = Math.atan2(midY - source.y, midX - source.x);
    const endAngle = Math.atan2(target.y - midY, target.x - midX);

    const startX = source.x + Math.cos(startAngle) * sRadius;
    const startY = source.y + Math.sin(startAngle) * sRadius;
    const endX = target.x - Math.cos(endAngle) * (tRadius + arrowTipExtension);
    const endY = target.y - Math.sin(endAngle) * (tRadius + arrowTipExtension);

    const path = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
    const labelPos = {
      x: midX + nx * 8,
      y: midY + ny * 8,
    };
    return { path, labelPos };
  }
}
