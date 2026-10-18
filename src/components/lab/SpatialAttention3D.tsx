import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { SelfAttentionResult } from '../../types/transformer';

interface SpatialAttention3DProps {
  attentionResult: SelfAttentionResult;
  queryIndex: number;
  setQueryIndex: (idx: number) => void;
  hoveredCell: { row: number; col: number } | null;
  setHoveredCell: (cell: { row: number; col: number } | null) => void;
}

const TokenNode: React.FC<{
  tokenText: string;
  index: number;
  totalTokens: number;
  isQuery: boolean;
  isTargetHovered: boolean;
  onClick: () => void;
}> = ({ tokenText, index, totalTokens, isQuery, isTargetHovered, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const spacing = 2.4;
  const startX = -((totalTokens - 1) * spacing) / 2;
  const posX = startX + index * spacing;

  useFrame((state) => {
    if (meshRef.current && isQuery) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 1.5;
    }
  });

  return (
    <group position={[posX, 0, 0]}>
      {/* 3D Sphere for Token */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        scale={isQuery ? [1.2, 1.2, 1.2] : isTargetHovered ? [1.1, 1.1, 1.1] : [0.9, 0.9, 0.9]}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshPhysicalMaterial
          color={isQuery ? '#ec4899' : isTargetHovered ? '#38bdf8' : '#64748b'}
          emissive={isQuery ? '#ec4899' : isTargetHovered ? '#0284c7' : '#1e293b'}
          emissiveIntensity={isQuery ? 0.8 : isTargetHovered ? 0.6 : 0.2}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      {/* Floating 3D Label */}
      <Html position={[0, -0.9, 0]} center distanceFactor={10}>
        <div
          onClick={onClick}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono cursor-pointer transition-all border shadow-lg ${
            isQuery
              ? 'bg-pink-950/90 border-pink-400 text-pink-200 font-bold ring-2 ring-pink-500/50'
              : isTargetHovered
              ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 font-semibold'
              : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-500'
          }`}
        >
          <span className="text-[10px] text-slate-400 mr-1">[{index}]</span>
          {tokenText}
        </div>
      </Html>
    </group>
  );
};

const AttentionBeam: React.FC<{
  sourceIdx: number;
  targetIdx: number;
  weight: number;
  totalTokens: number;
  isHovered: boolean;
  onHover: (hover: boolean) => void;
}> = ({ sourceIdx, targetIdx, weight, totalTokens, isHovered, onHover }) => {
  const spacing = 2.4;
  const startX = -((totalTokens - 1) * spacing) / 2;
  const p1X = startX + sourceIdx * spacing;
  const p2X = startX + targetIdx * spacing;

  const dist = Math.abs(p2X - p1X);
  const archHeight = Math.max(1.2, dist * 0.45);

  const curve = React.useMemo(() => {
    const vStart = new THREE.Vector3(p1X, 0.5, 0);
    const vEnd = new THREE.Vector3(p2X, 0.5, 0);
    const vMid = new THREE.Vector3((p1X + p2X) / 2, archHeight, 0);

    return new THREE.QuadraticBezierCurve3(vStart, vMid, vEnd);
  }, [p1X, p2X, archHeight]);

  const tubeGeometry = React.useMemo(() => {
    const radius = Math.max(0.02, weight * 0.18);
    return new THREE.TubeGeometry(curve, 24, radius, 8, false);
  }, [curve, weight]);

  if (weight < 0.01) return null;

  return (
    <mesh
      geometry={tubeGeometry}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(true);
      }}
      onPointerOut={() => onHover(false)}
    >
      <meshStandardMaterial
        color={isHovered ? '#f43f5e' : sourceIdx === targetIdx ? '#a855f7' : '#06b6d4'}
        emissive={isHovered ? '#f43f5e' : sourceIdx === targetIdx ? '#a855f7' : '#06b6d4'}
        emissiveIntensity={isHovered ? 1.2 : Math.max(0.3, weight * 1.5)}
        transparent
        opacity={isHovered ? 0.95 : Math.max(0.2, weight * 0.9)}
      />
    </mesh>
  );
};

export const SpatialAttention3D: React.FC<SpatialAttention3DProps> = ({
  attentionResult,
  queryIndex,
  setQueryIndex,
  hoveredCell,
  setHoveredCell,
}) => {
  const { tokens, softmaxWeights } = attentionResult;
  const totalTokens = tokens.length;

  return (
    <div className="relative w-full h-[380px] bg-[#090d16] rounded-xl border border-slate-800 shadow-xl overflow-hidden">
      <div className="absolute top-3 left-3 z-10 text-xs font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
        3D Vector Spatial Beams (Query Token: <span className="text-pink-400 font-bold">"{tokens[queryIndex]?.text}"</span>)
      </div>

      <Canvas camera={{ position: [0, 2.5, 12], fov: 42 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />
        <pointLight position={[-10, 5, -5]} intensity={0.8} color="#ec4899" />

        <OrbitControls enableDamping maxDistance={20} minDistance={5} />

        {/* Tokens along X Axis */}
        {tokens.map((tok, idx) => (
          <TokenNode
            key={tok.id}
            tokenText={tok.text}
            index={idx}
            totalTokens={totalTokens}
            isQuery={idx === queryIndex}
            isTargetHovered={hoveredCell?.col === idx}
            onClick={() => setQueryIndex(idx)}
          />
        ))}

        {/* Attention Arc Beams from Query token to all Key tokens */}
        {softmaxWeights[queryIndex] &&
          softmaxWeights[queryIndex].map((weight, targetIdx) => (
            <AttentionBeam
              key={`beam-${queryIndex}-${targetIdx}`}
              sourceIdx={queryIndex}
              targetIdx={targetIdx}
              weight={weight}
              totalTokens={totalTokens}
              isHovered={hoveredCell?.row === queryIndex && hoveredCell?.col === targetIdx}
              onHover={(hover) => {
                if (hover) {
                  setHoveredCell({ row: queryIndex, col: targetIdx });
                } else {
                  setHoveredCell(null);
                }
              }}
            />
          ))}
      </Canvas>
    </div>
  );
};
