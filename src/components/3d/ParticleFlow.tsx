import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFlowProps {
  start: [number, number, number];
  end: [number, number, number];
  isPlaying: boolean;
  color?: string;
  isCrossBridge?: boolean;
}

export const ParticleFlow: React.FC<ParticleFlowProps> = ({
  start,
  end,
  isPlaying,
  color = '#38bdf8',
  isCrossBridge = false,
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particleCount = 4;

  const curve = useMemo(() => {
    const vStart = new THREE.Vector3(...start);
    const vEnd = new THREE.Vector3(...end);

    if (isCrossBridge) {
      const midPoint = new THREE.Vector3()
        .addVectors(vStart, vEnd)
        .multiplyScalar(0.5);
      midPoint.z += 2.0;
      return new THREE.QuadraticBezierCurve3(vStart, midPoint, vEnd);
    } else {
      const mid1 = new THREE.Vector3(vStart.x, vStart.y + (vEnd.y - vStart.y) * 0.5, vStart.z);
      const mid2 = new THREE.Vector3(vEnd.x, vStart.y + (vEnd.y - vStart.y) * 0.5, vEnd.z);
      return new THREE.CubicBezierCurve3(vStart, mid1, mid2, vEnd);
    }
  }, [start, end, isCrossBridge]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const offsets = useMemo(
    () => Array.from({ length: particleCount }, (_, i) => i / particleCount),
    [particleCount]
  );

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    offsets.forEach((offset, i) => {
      let progress = offset;
      if (isPlaying) {
        progress = (offset + state.clock.getElapsedTime() * 0.4) % 1.0;
        offsets[i] = progress;
      }

      const point = curve.getPoint(progress);
      dummy.position.copy(point);
      const scale = 0.12 + Math.sin(progress * Math.PI) * 0.08;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, particleCount]}
    >
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.5}
        toneMapped={false}
      />
    </instancedMesh>
  );
};
