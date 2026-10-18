import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { NodeLayout } from './ViewLayouts';
import { ComponentId } from '../../types/transformer';

interface ArchitectureBlockProps {
  node: NodeLayout;
  isSelected: boolean;
  isHighlighted: boolean;
  onSelect: (id: ComponentId) => void;
}

export const ArchitectureBlock: React.FC<ArchitectureBlockProps> = ({
  node,
  isSelected,
  isHighlighted,
  onSelect,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Subtle floating animation
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = node.position[1] + Math.sin(time * 2 + node.position[0]) * 0.05;
    }
  });

  const activeColor = isSelected ? '#38bdf8' : isHighlighted ? '#a855f7' : node.color;

  return (
    <group position={node.position}>
      {/* Outer Wireframe / Glow Box */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        scale={hovered ? [1.08, 1.08, 1.08] : isSelected ? [1.05, 1.05, 1.05] : [1, 1, 1]}
      >
        <boxGeometry args={node.size} />
        <meshPhysicalMaterial
          color={activeColor}
          emissive={activeColor}
          emissiveIntensity={hovered ? 0.6 : isSelected ? 0.8 : isHighlighted ? 0.5 : 0.2}
          roughness={0.2}
          metalness={0.8}
          transmission={0.4}
          ior={1.5}
          thickness={0.5}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Selection Highlight Ring */}
      {(isSelected || hovered || isHighlighted) && (
        <mesh scale={[node.size[0] + 0.15, node.size[1] + 0.15, node.size[2] + 0.15]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color={isSelected ? '#38bdf8' : isHighlighted ? '#c084fc' : '#22d3ee'}
            wireframe
          />
        </mesh>
      )}

      {/* Floating 3D HTML Label */}
      <Html
        position={[0, node.size[1] / 2 + 0.4, 0]}
        center
        distanceFactor={12}
        zIndexRange={[100, 0]}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelect(node.id);
          }}
          className={`px-2.5 py-1 rounded-md text-xs font-mono tracking-wide whitespace-nowrap cursor-pointer transition-all duration-200 select-none shadow-lg ${
            isSelected
              ? 'bg-cyan-950/90 border border-cyan-400 text-cyan-200 shadow-cyan-500/20 glow-cyan'
              : isHighlighted
              ? 'bg-purple-950/90 border border-purple-400 text-purple-200 glow-purple'
              : hovered
              ? 'bg-slate-900/90 border border-slate-400 text-slate-100'
              : 'bg-slate-950/80 border border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: activeColor }}
            />
            <span className="font-semibold">{node.label}</span>
          </div>
        </div>
      </Html>
    </group>
  );
};
