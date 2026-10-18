import React, { useMemo } from 'react';
import * as THREE from 'three';

interface ConnectionCableProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  isCrossBridge?: boolean;
}

export const ConnectionCable: React.FC<ConnectionCableProps> = ({
  start,
  end,
  color = '#0284c7',
  isCrossBridge = false,
}) => {
  const curve = useMemo(() => {
    const vStart = new THREE.Vector3(...start);
    const vEnd = new THREE.Vector3(...end);

    if (isCrossBridge) {
      // Create a nice arching curve for cross-attention bridge
      const midPoint = new THREE.Vector3()
        .addVectors(vStart, vEnd)
        .multiplyScalar(0.5);
      midPoint.z += 2.0; // arch outwards in Z axis
      return new THREE.QuadraticBezierCurve3(vStart, midPoint, vEnd);
    } else {
      // Straight tube for vertical connections
      const mid1 = new THREE.Vector3(vStart.x, vStart.y + (vEnd.y - vStart.y) * 0.5, vStart.z);
      const mid2 = new THREE.Vector3(vEnd.x, vStart.y + (vEnd.y - vStart.y) * 0.5, vEnd.z);
      return new THREE.CubicBezierCurve3(vStart, mid1, mid2, vEnd);
    }
  }, [start, end, isCrossBridge]);

  const geometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 32, isCrossBridge ? 0.08 : 0.05, 8, false);
  }, [curve, isCrossBridge]);

  return (
    <mesh geometry={geometry}>
      <meshPhysicalMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isCrossBridge ? 0.8 : 0.3}
        transparent
        opacity={0.85}
        roughness={0.2}
        metalness={0.5}
      />
    </mesh>
  );
};
