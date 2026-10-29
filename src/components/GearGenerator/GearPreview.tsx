import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { GearParams, calculateGearProperties, createSimplifiedGearShape, createRingGearShape, GEAR_MATERIALS } from "./utils";
import { ErrorBoundary } from "../common/ErrorBoundary";

interface GearPreviewProps {
  params: GearParams;
}

const GearSystemMesh: React.FC<{ params: GearParams }> = ({ params }) => {
  const driverRef = useRef<THREE.Group>(null);
  const drivenRef = useRef<THREE.Group>(null);
  const planetsRef = useRef<THREE.Group>(null);
  
  const { mt, centerDistance, d1, d2, zRing, assemblyCondition } = useMemo(() => calculateGearProperties(params), [params]);
  const matColor = GEAR_MATERIALS[params.materialId]?.color || "#cbd5e1";

  const [geometries, setGeometries] = React.useState<any>({});

  React.useEffect(() => {
    const shape1 = createSimplifiedGearShape(
      params.z1, 
      mt, 
      params.alpha, 
      params.x1 || 0, 
      params.ha_star || 1.0, 
      params.c_star || 0.25, 
      params.rf_star || 0.38, 
      params.backlash || 0.05
    );
    const shape2 = createSimplifiedGearShape(
      params.z2, 
      mt, 
      params.alpha, 
      params.x2 || 0, 
      params.ha_star || 1.0, 
      params.c_star || 0.25, 
      params.rf_star || 0.38, 
      params.backlash || 0.05
    );

    const extrude1 = { depth: Math.max(1, params.b1), bevelEnabled: false, curveSegments: 16 };
    const extrude2 = { depth: Math.max(1, params.b2), bevelEnabled: false, curveSegments: 16 };

    const newGeom1 = new THREE.ExtrudeGeometry(shape1, extrude1);
    const newGeom2 = new THREE.ExtrudeGeometry(shape2, extrude2);
    
    let newGeomRing = null;
    if (params.systemType === "Planetary") {
       const shapeRing = createRingGearShape(
         zRing, 
         mt, 
         mt * 3.0, 
         params.alpha, 
         params.ha_star || 1.0, 
         params.c_star || 0.25, 
         params.backlash || 0.05
       );
       newGeomRing = new THREE.ExtrudeGeometry(shapeRing, extrude2);
    }

    setGeometries((prev: any) => {
      if (prev.geom1) prev.geom1.dispose();
      if (prev.geom2) prev.geom2.dispose();
      if (prev.geomRing) prev.geomRing.dispose();
      return { geom1: newGeom1, geom2: newGeom2, geomRing: newGeomRing };
    });

    return () => {};
  }, [
    params.z1, params.z2, params.b1, params.b2, mt, params.systemType, zRing,
    params.alpha, params.x1, params.x2, params.ha_star, params.c_star, params.rf_star, params.backlash
  ]);

  React.useEffect(() => {
    return () => {
      if (geometries.geom1) geometries.geom1.dispose();
      if (geometries.geom2) geometries.geom2.dispose();
      if (geometries.geomRing) geometries.geomRing.dispose();
    }
  }, [geometries]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const speed = 1.5; 
    
    if (driverRef.current) {
      driverRef.current.rotation.z = time * speed;
    }
    
    if (params.systemType === "Cylindrical" && drivenRef.current) {
      const ratio = params.z1 / params.z2;
      // Exact conjugate meshing: driver at 0 is peak, driven at pi must be gap
      const initialOffset = (params.z2 % 2 === 0 ? Math.PI / params.z2 : 0);
      drivenRef.current.rotation.z = -(time * speed) * ratio + initialOffset;
    } else if (params.systemType === "Bevel" && drivenRef.current) {
      const ratio = params.z1 / params.z2;
      const initialOffset = (params.z2 % 2 === 0 ? Math.PI / params.z2 : 0);
      drivenRef.current.rotation.z = -(time * speed) * ratio + initialOffset;
    } else if (params.systemType === "Planetary" && planetsRef.current) {
      // Planetary kinematics with carrier output
      const carrierSpeed = speed * (params.z1 / (params.z1 + zRing));
      planetsRef.current.rotation.z = carrierSpeed * time;
      
      const planetRelSpeed = -(params.z1 / params.z2) * (speed - carrierSpeed);
      const M = params.z1 + zRing;
      
      planetsRef.current.children.forEach((planet, idx) => {
        let actualTheta: number;
        if (assemblyCondition.isSatisfied) {
          actualTheta = (idx * Math.PI * 2) / params.numPlanets;
        } else {
          const j = Math.round((idx * M) / params.numPlanets);
          actualTheta = (j * Math.PI * 2) / M;
        }

        // Exact analytical conjugate meshing offset for planetary gear
        const baseGapOffset = (params.z2 % 2 === 0 ? Math.PI / params.z2 : 0);
        const initialOffset = actualTheta * (1 + params.z1 / params.z2) + baseGapOffset;
        planet.rotation.z = planetRelSpeed * time + initialOffset;
      });
    }
  });

  if (!geometries.geom1 || !geometries.geom2) return null;

  if (params.systemType === "Planetary") {
    const planetNodes = [];
    const M = params.z1 + zRing;
    for (let i = 0; i < params.numPlanets; i++) {
       let actualTheta: number;
       if (assemblyCondition.isSatisfied) {
         actualTheta = (i * Math.PI * 2) / params.numPlanets;
       } else {
         const j = Math.round((i * M) / params.numPlanets);
         actualTheta = (j * Math.PI * 2) / M;
       }
       planetNodes.push(
         <mesh key={i} position={[Math.cos(actualTheta) * centerDistance, Math.sin(actualTheta) * centerDistance, 0]} geometry={geometries.geom2}>
            <meshStandardMaterial color="#38bdf8" metalness={0.5} roughness={0.3} />
         </mesh>
       );
    }
    // Ring gear exact conjugate mesh initial rotation
    const ringOffset = (params.z2 % 2 === 0 ? Math.PI / zRing : 0);

    return (
      <group position={[0, 0, -params.b1/2]}>
        <group ref={driverRef}>
           <mesh geometry={geometries.geom1}>
             <meshStandardMaterial color="#f59e0b" metalness={0.6} roughness={0.25} />
           </mesh>
        </group>
        <group ref={planetsRef}>
           {planetNodes}
        </group>
        {geometries.geomRing && (
          <mesh geometry={geometries.geomRing} rotation={[0, 0, ringOffset]}>
             <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
          </mesh>
        )}
      </group>
    );
  } else if (params.systemType === "Bevel") {
    return (
      <group position={[0, -d1/4, 0]}>
        <group ref={driverRef} position={[0, 0, d2/2]}>
          <mesh geometry={geometries.geom1} position={[0,0,-params.b1]}>
            <meshStandardMaterial color={matColor} metalness={0.4} roughness={0.4} />
          </mesh>
        </group>
        <group ref={drivenRef} position={[0, d1/2, 0]} rotation={[Math.PI/2, 0, 0]}>
          <mesh geometry={geometries.geom2} position={[0,0,-params.b2]}>
            <meshStandardMaterial color={matColor} metalness={0.4} roughness={0.4} />
          </mesh>
        </group>
      </group>
    );
  }

  // Cylindrical default
  return (
    <group position={[-centerDistance / 2, 0, 0]}>
      <group ref={driverRef} position={[0, 0, -params.b1/2]}>
        <mesh geometry={geometries.geom1}>
          <meshStandardMaterial color={matColor} metalness={0.4} roughness={0.4} />
        </mesh>
      </group>
      <group ref={drivenRef} position={[centerDistance, 0, -params.b2/2]}>
        <mesh geometry={geometries.geom2}>
          <meshStandardMaterial color={matColor} metalness={0.4} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
};

export const GearPreview: React.FC<GearPreviewProps> = ({ params }) => {
  return (
    <ErrorBoundary fallbackTitle="3D 齿轮啮合渲染异常" fallbackDescription="WebGL 视图已重置。您可以继续调整参数。">
      <div className="w-full h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden relative min-h-[400px]">
        <Canvas shadows camera={{ position: [0, 0, 150], fov: 45 }}>
          <color attach="background" args={['#0f172a']} />
          <ambientLight intensity={1.5} />
          <directionalLight position={[20, 50, 30]} intensity={2.5} castShadow />
          <directionalLight position={[-20, -50, -30]} intensity={1.5} />
          <pointLight position={[0, 0, 50]} intensity={2} color="#ffffff" />
          <pointLight position={[50, 0, 0]} intensity={1.5} color="#e2e8f0" />
          <GearSystemMesh params={params} />
          <OrbitControls makeDefault />
        </Canvas>
        <div className="absolute top-4 left-4 bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 backdrop-blur-sm pointer-events-none max-w-[280px]">
          <p className="text-emerald-400 font-bold mb-1 border-b border-slate-700 pb-1">
            [{params.systemType.toUpperCase()} SYSTEM]
          </p>
          <p className="mt-1 leading-relaxed">高速三维拓扑预览。</p>
          <p className="text-slate-400 mt-1">
            支持行星排(Planetary)、交错轴(Bevel)、平行轴(Cylindrical)动态装配验证。
          </p>
        </div>
      </div>
    </ErrorBoundary>
  );
};
