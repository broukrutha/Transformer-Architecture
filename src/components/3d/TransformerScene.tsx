import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { ArchitectureBlock } from './ArchitectureBlock';
import { ConnectionCable } from './ConnectionCable';
import { ParticleFlow } from './ParticleFlow';
import { getLayoutNodes, getCableConnections, NodeLayout } from './ViewLayouts';
import { ComponentId, ViewMode } from '../../types/transformer';
import { Play, Pause, RotateCcw, Eye } from 'lucide-react';

interface TransformerSceneProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedComponent: ComponentId | null;
  onSelectComponent: (id: ComponentId) => void;
  highlightedNodes?: string[];
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export const TransformerScene: React.FC<TransformerSceneProps> = ({
  viewMode,
  setViewMode,
  selectedComponent,
  onSelectComponent,
  highlightedNodes = [],
  isPlaying,
  setIsPlaying,
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const nodes = getLayoutNodes(viewMode);
  const cables = getCableConnections(viewMode);

  // Map node positions for quick lookup
  const nodeMap = new Map<ComponentId, NodeLayout>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  return (
    <div className="relative w-full h-full bg-[#090d16] overflow-hidden rounded-xl border border-slate-800/80 shadow-2xl">
      {/* View Mode & Animation Controls Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* View Mode Switcher */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-lg glass-panel text-xs">
          <span className="text-slate-400 font-medium px-2 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-cyan-400" /> Mode:
          </span>
          <button
            onClick={() => setViewMode('original')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              viewMode === 'original'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Original (Vaswani 2017)
          </button>
          <button
            onClick={() => setViewMode('decoder-only')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              viewMode === 'decoder-only'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            GPT (Decoder-Only)
          </button>
          <button
            onClick={() => setViewMode('simplified')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              viewMode === 'simplified'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Simplified (3-Stage)
          </button>
        </div>

        {/* Scene Actions */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-panel hover:bg-slate-800/80 text-xs font-medium text-slate-200 transition-all border border-slate-700/60"
            title={isPlaying ? 'Pause Token Flow' : 'Play Token Flow'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" /> Pause Signals
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" /> Play Signals
              </>
            )}
          </button>
          <button
            onClick={handleResetCamera}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-panel hover:bg-slate-800/80 text-xs font-medium text-slate-200 transition-all border border-slate-700/60"
            title="Reset 3D Camera View"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" /> Reset View
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 1, 16], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        onPointerDown={(e) => {
          // Deselect on background click
          if (e.target === e.currentTarget) {
            // Background click
          }
        }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 15, 10]} intensity={1.2} color="#06b6d4" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a855f7" />
        <directionalLight position={[0, 10, 5]} intensity={0.5} />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxDistance={30}
          minDistance={4}
        />

        {/* Render 3D Cables & Token Particle Flows */}
        {cables.map((cable, idx) => {
          const fromNode = nodeMap.get(cable.from);
          const toNode = nodeMap.get(cable.to);
          if (!fromNode || !toNode) return null;

          return (
            <React.Fragment key={`cable-${idx}`}>
              <ConnectionCable
                start={fromNode.position}
                end={toNode.position}
                color={cable.color || fromNode.color}
                isCrossBridge={cable.isCrossBridge}
              />
              <ParticleFlow
                start={fromNode.position}
                end={toNode.position}
                isPlaying={isPlaying}
                color={cable.color || '#38bdf8'}
                isCrossBridge={cable.isCrossBridge}
              />
            </React.Fragment>
          );
        })}

        {/* Render 3D Architecture Component Mesh Blocks */}
        {nodes.map((node) => (
          <ArchitectureBlock
            key={node.id}
            node={node}
            isSelected={selectedComponent === node.id}
            isHighlighted={highlightedNodes.includes(node.id)}
            onSelect={onSelectComponent}
          />
        ))}
      </Canvas>
    </div>
  );
};
