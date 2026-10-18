import React from 'react';
import { ComponentId, ViewMode } from '../../types/transformer';
import { getLayoutNodes, getCableConnections } from '../3d/ViewLayouts';
import { Monitor, Smartphone, CheckCircle } from 'lucide-react';

interface Fallback2DViewProps {
  viewMode: ViewMode;
  selectedComponent: ComponentId | null;
  onSelectComponent: (id: ComponentId) => void;
  highlightedNodes?: string[];
}

export const Fallback2DView: React.FC<Fallback2DViewProps> = ({
  viewMode,
  selectedComponent,
  onSelectComponent,
  highlightedNodes = [],
}) => {
  const nodes = getLayoutNodes(viewMode);
  const cables = getCableConnections(viewMode);

  // Map 3D coordinates (X: -5 to 5, Y: -6 to 10) into 2D SVG canvas (SVG width 800, height 700)
  const mapCoords = (x: number, y: number) => {
    const svgX = 400 + x * 55;
    const svgY = 550 - y * 45;
    return { x: svgX, y: svgY };
  };

  const nodeMap = new Map();
  nodes.forEach((n) => {
    nodeMap.set(n.id, { ...n, coords: mapCoords(n.position[0], n.position[1]) });
  });

  return (
    <div className="relative w-full h-full min-h-[550px] bg-[#090d16] rounded-xl border border-slate-800 p-4 flex flex-col justify-between overflow-auto">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-2">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200">2D SVG Fallback Graph View</span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
            WebGL Independent
          </span>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1">
          <Smartphone className="w-3.5 h-3.5 text-slate-500" /> Mobile & Low-Power Friendly
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center overflow-auto py-2">
        <svg className="w-full h-[520px] max-w-[850px]" viewBox="0 0 800 650">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#0284c7" />
            </marker>
            <marker
              id="arrowhead-purple"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#a855f7" />
            </marker>
          </defs>

          {/* Render Cable Connection Lines */}
          {cables.map((cable, idx) => {
            const fromNode = nodeMap.get(cable.from);
            const toNode = nodeMap.get(cable.to);
            if (!fromNode || !toNode) return null;

            const isCross = cable.isCrossBridge;
            const strokeColor = isCross ? '#a855f7' : '#0284c7';

            if (isCross) {
              const pathD = `M ${fromNode.coords.x} ${fromNode.coords.y} Q ${(fromNode.coords.x + toNode.coords.x) / 2} ${fromNode.coords.y + 40} ${toNode.coords.x} ${toNode.coords.y}`;
              return (
                <path
                  key={`cable-2d-${idx}`}
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  markerEnd="url(#arrowhead-purple)"
                />
              );
            }

            return (
              <line
                key={`cable-2d-${idx}`}
                x1={fromNode.coords.x}
                y1={fromNode.coords.y}
                x2={toNode.coords.x}
                y2={toNode.coords.y}
                stroke={strokeColor}
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            );
          })}

          {/* Render 2D Graph Nodes */}
          {nodes.map((node) => {
            const nData = nodeMap.get(node.id);
            if (!nData) return null;

            const isSelected = selectedComponent === node.id;
            const isHighlighted = highlightedNodes.includes(node.id);
            const nodeWidth = 170;
            const nodeHeight = 36;
            const rx = nData.coords.x - nodeWidth / 2;
            const ry = nData.coords.y - nodeHeight / 2;

            return (
              <g
                key={`node-2d-${node.id}`}
                onClick={() => onSelectComponent(node.id)}
                className="cursor-pointer transition-all duration-200"
              >
                <rect
                  x={rx}
                  y={ry}
                  width={nodeWidth}
                  height={nodeHeight}
                  rx="8"
                  fill={isSelected ? '#0c4a6e' : isHighlighted ? '#4c1d95' : '#0f172a'}
                  stroke={isSelected ? '#38bdf8' : isHighlighted ? '#c084fc' : node.color}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  className="filter drop-shadow-md hover:filter hover:drop-shadow-lg"
                />
                <circle
                  cx={rx + 16}
                  cy={ry + nodeHeight / 2}
                  r="5"
                  fill={isSelected ? '#38bdf8' : node.color}
                />
                <text
                  x={rx + 30}
                  y={ry + nodeHeight / 2 + 4}
                  fill={isSelected ? '#7dd3fc' : '#f1f5f9'}
                  fontSize="11"
                  fontFamily="Inter, sans-serif"
                  fontWeight={isSelected ? 'bold' : '500'}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
        <span>Click any node in the graph above to inspect tensor shapes, mathematical operations, and code.</span>
        <span className="text-cyan-400 font-mono flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5" /> Synchronized
        </span>
      </div>
    </div>
  );
};
