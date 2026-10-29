import React, { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

// @ts-ignore: Dynamically apply three-mesh-bvh to Three.js prototypes for extreme raycasting optimization
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
// @ts-ignore
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

import {
  FEASetupConfig,
  FEAResultData,
  FEAPlotType,
  FEAProbePoint,
} from "./types";
import { applyFEAColorsToGeometry } from "./feaEngine";
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Eye,
  Sliders,
  Flag,
  Crosshair,
  Layers,
  Sparkles,
} from "lucide-react";

interface FEACanvas3DProps {
  config: FEASetupConfig;
  results: FEAResultData;
  baseGeometry: THREE.BufferGeometry;
  nodalStresses: Float32Array;
  nodalDisplacements: Float32Array;
  nodalFOS: Float32Array;
  nodalStrain: Float32Array;
  dispVectors: Float32Array;
  activeProbe: FEAProbePoint | null;
  onSelectProbe: (probe: FEAProbePoint | null) => void;
}

// Sub-component: The 3D FEA Deformed & Colored Mesh
const FEAModelMesh: React.FC<{
  config: FEASetupConfig;
  results: FEAResultData;
  baseGeometry: THREE.BufferGeometry;
  nodalStresses: Float32Array;
  nodalDisplacements: Float32Array;
  nodalFOS: Float32Array;
  nodalStrain: Float32Array;
  dispVectors: Float32Array;
  onPointerMove: (e: any) => void;
  onPointerDown: (e: any) => void;
}> = ({
  config,
  results,
  baseGeometry,
  nodalStresses,
  nodalDisplacements,
  nodalFOS,
  nodalStrain,
  dispVectors,
  onPointerMove,
  onPointerDown,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const originalPositionsRef = useRef<Float32Array | null>(null);
  const [activeGeometry, setActiveGeometry] = useState<THREE.BufferGeometry | null>(null);

  // Re-clone geometry ONLY when base physical model or physics results fundamentally change
  useEffect(() => {
    const cloned = baseGeometry.clone();
    
    // OPTIMIZATION: Compute BVH (Bounding Volume Hierarchy) for lightning-fast raycasting (eliminates mouse move lag)
    if ((cloned as any).computeBoundsTree) {
      (cloned as any).computeBoundsTree();
    }
    
    // Initialize colors for the current active plot
    applyFEAColorsToGeometry(
      cloned,
      config.activePlot,
      nodalStresses,
      nodalDisplacements,
      nodalFOS,
      nodalStrain,
      results
    );
    
    // Cache original base coordinates for animation
    const posAttr = cloned.getAttribute("position") as THREE.BufferAttribute;
    originalPositionsRef.current = new Float32Array(posAttr.array);
    setActiveGeometry(cloned);
    
    return () => {
      if ((cloned as any).disposeBoundsTree) {
        (cloned as any).disposeBoundsTree();
      }
      cloned.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseGeometry, results]); 

  // OPTIMIZATION: Update ONLY vertex colors when switching plot types (do NOT clone geometry)
  useEffect(() => {
    if (!activeGeometry) return;
    
    applyFEAColorsToGeometry(
      activeGeometry,
      config.activePlot,
      nodalStresses,
      nodalDisplacements,
      nodalFOS,
      nodalStrain,
      results
    );
  }, [config.activePlot, activeGeometry, nodalStresses, nodalDisplacements, nodalFOS, nodalStrain, results]);

  const lastScaleRef = useRef<number | null>(null);

  // Handle dynamic deformation animation and static magnification
  useFrame(({ clock }) => {
    if (!meshRef.current || !originalPositionsRef.current) return;
    const geom = meshRef.current.geometry;
    const posAttr = geom.getAttribute("position") as THREE.BufferAttribute;
    const orig = originalPositionsRef.current;
    const posArray = posAttr.array as Float32Array;
    const count = posAttr.count;

    const t = clock.getElapsedTime();
    const animFactor = config.isDeformAnimationPlaying
      ? Math.sin(t * 3.5) * 0.5 + 0.5
      : 1.0;
    const scale = config.deformationScale * animFactor;

    // OPTIMIZATION: Skip vertex updates if the scale hasn't changed (static state)
    if (lastScaleRef.current === scale) return;
    lastScaleRef.current = scale;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      posArray[i3] = orig[i3] + dispVectors[i3] * scale;
      posArray[i3 + 1] = orig[i3 + 1] + dispVectors[i3 + 1] * scale;
      posArray[i3 + 2] = orig[i3 + 2] + dispVectors[i3 + 2] * scale;
    }
    posAttr.needsUpdate = true;
    
    // OPTIMIZATION: Do not call geom.computeVertexNormals() every frame! 
    // It recalculates normals for all faces which blocks the main thread heavily.
    // The visual difference is minimal for small structural deformations.
  });

  if (!activeGeometry) return null;

  return (
    <group>
      <mesh
        ref={meshRef}
        geometry={activeGeometry}
        castShadow={!config.isLightweightMode}
        receiveShadow={!config.isLightweightMode}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
      >
        <meshStandardMaterial
          vertexColors
          roughness={0.35}
          metalness={0.25}
          wireframe={config.showWireframe}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// Sub-component: SolidWorks-style Green Fixed Restraint Fixtures
const FixedBoundaryFixtures: React.FC<{ baseGeometry: THREE.BufferGeometry; fixedFaceId: string }> = ({
  baseGeometry,
}) => {
  baseGeometry.computeBoundingBox();
  const bbox = baseGeometry.boundingBox || new THREE.Box3(new THREE.Vector3(-60, -20, -20), new THREE.Vector3(60, 20, 20));
  const minX = bbox.min.x;
  const minY = bbox.min.y;
  const maxY = bbox.max.y;
  const minZ = bbox.min.z;
  const maxZ = bbox.max.z;

  const fixtures = useMemo(() => {
    const items = [];
    const stepY = (maxY - minY) / 3;
    const stepZ = (maxZ - minZ) / 3;

    for (let y = minY + 4; y <= maxY - 4; y += stepY) {
      for (let z = minZ + 4; z <= maxZ - 4; z += stepZ) {
        items.push([minX - 2, y, z] as [number, number, number]);
      }
    }
    return items;
  }, [minX, minY, maxY, minZ, maxZ]);

  return (
    <group>
      {fixtures.map((pos, idx) => (
        <group key={idx} position={pos} rotation={[0, 0, Math.PI / 2]}>
          {/* Green triangular fixture cone/anchor */}
          <mesh>
            <coneGeometry args={[3.5, 7, 4]} />
            <meshStandardMaterial color="#22c55e" emissive="#15803d" emissiveIntensity={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, -4, 0]}>
            <boxGeometry args={[8, 1.2, 8]} />
            <meshStandardMaterial color="#16a34a" />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Sub-component: SolidWorks-style Magenta/Purple Force Vectors
const ForceVectorArrows: React.FC<{
  baseGeometry: THREE.BufferGeometry;
  forceDirection: string;
  forceMagnitudeN: number;
  customVector: [number, number, number];
}> = ({ baseGeometry, forceDirection, forceMagnitudeN, customVector }) => {
  baseGeometry.computeBoundingBox();
  const bbox = baseGeometry.boundingBox || new THREE.Box3(new THREE.Vector3(-60, -20, -20), new THREE.Vector3(60, 20, 20));
  const maxX = bbox.max.x;
  const minY = bbox.min.y;
  const maxY = bbox.max.y;
  const minZ = bbox.min.z;
  const maxZ = bbox.max.z;

  const forcePoints = useMemo(() => {
    const items = [];
    const stepZ = (maxZ - minZ) / 3;
    for (let z = minZ + 5; z <= maxZ - 5; z += stepZ) {
      items.push([maxX - 10, maxY + 2, z] as [number, number, number]);
    }
    return items;
  }, [maxX, maxY, minZ, maxZ]);

  let rot: [number, number, number] = [0, 0, Math.PI]; // Default pointing down -Y
  if (forceDirection === "up_y") rot = [0, 0, 0];
  if (forceDirection === "along_x_pos") rot = [0, 0, -Math.PI / 2];
  if (forceDirection === "along_x_neg") rot = [0, 0, Math.PI / 2];
  if (forceDirection === "along_z_pos") rot = [Math.PI / 2, 0, 0];
  if (forceDirection === "along_z_neg") rot = [-Math.PI / 2, 0, 0];

  const arrowLength = Math.min(25, Math.max(12, 10 + forceMagnitudeN / 50));

  return (
    <group>
      {forcePoints.map((pos, idx) => (
        <group key={idx} position={pos} rotation={rot}>
          {/* Purple Force Arrow Body */}
          <mesh position={[0, arrowLength / 2, 0]}>
            <cylinderGeometry args={[1.2, 1.2, arrowLength, 8]} />
            <meshStandardMaterial color="#ec4899" emissive="#db2777" emissiveIntensity={0.7} />
          </mesh>
          {/* Arrow Head */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[3.2, 7, 8]} />
            <meshStandardMaterial color="#f43f5e" emissive="#e11d48" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const FEACanvas3D: React.FC<FEACanvas3DProps> = ({
  config,
  results,
  baseGeometry,
  nodalStresses,
  nodalDisplacements,
  nodalFOS,
  nodalStrain,
  dispVectors,
  activeProbe,
  onSelectProbe,
}) => {
  const [hoveredInfo, setHoveredInfo] = useState<{ x: number; y: number; z: number; stress: number; disp: number } | null>(null);

  const lastHoverUpdate = useRef<number>(0);

  const handlePointerMove = (e: any) => {
    e.stopPropagation();
    if (!config.showProbe) return;
    
    // Throttle React state updates to ~15 FPS max during hover to prevent frame drops
    const now = performance.now();
    if (now - lastHoverUpdate.current < 60) return;
    lastHoverUpdate.current = now;

    if (e.point && e.face) {
      const idx = e.face.a;
      if (idx !== undefined && nodalStresses[idx] !== undefined) {
        setHoveredInfo({
          x: Number(e.point.x.toFixed(1)),
          y: Number(e.point.y.toFixed(1)),
          z: Number(e.point.z.toFixed(1)),
          stress: Number(nodalStresses[idx].toFixed(2)),
          disp: Number(nodalDisplacements[idx].toFixed(4)),
        });
      }
    }
  };

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (e.point && e.face) {
      const idx = e.face.a;
      if (idx !== undefined && nodalStresses[idx] !== undefined) {
        onSelectProbe({
          x: Number(e.point.x.toFixed(1)),
          y: Number(e.point.y.toFixed(1)),
          z: Number(e.point.z.toFixed(1)),
          stressMPa: Number(nodalStresses[idx].toFixed(2)),
          displacementMm: Number(nodalDisplacements[idx].toFixed(4)),
          fos: Number(nodalFOS[idx].toFixed(2)),
          strain: Number(nodalStrain[idx].toFixed(1)),
          nodeIndex: idx,
        });
      }
    }
  };

  return (
    <div id="fea-3d-canvas-container" className="relative w-full h-[520px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl">
      {/* Three.js Canvas */}
      <Canvas
        camera={{ position: [110, 75, 120], fov: 45 }}
        shadows={!config.isLightweightMode}
        dpr={config.isLightweightMode ? 1 : [1, 2]}
        onPointerMissed={() => setHoveredInfo(null)}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[100, 150, 100]} intensity={1.2} castShadow={!config.isLightweightMode} />
        <directionalLight position={[-100, -80, -100]} intensity={0.4} />

        <Grid
          infiniteGrid
          cellSize={10}
          sectionSize={50}
          fadeDistance={300}
          cellColor="#334155"
          sectionColor="#0284c7"
          position={[0, -35, 0]}
        />

        <FEAModelMesh
          config={config}
          results={results}
          baseGeometry={baseGeometry}
          nodalStresses={nodalStresses}
          nodalDisplacements={nodalDisplacements}
          nodalFOS={nodalFOS}
          nodalStrain={nodalStrain}
          dispVectors={dispVectors}
          onPointerMove={config.showProbe ? handlePointerMove : undefined}
          onPointerDown={handlePointerDown}
        />

        {/* Boundary Condition Symbols */}
        <FixedBoundaryFixtures baseGeometry={baseGeometry} fixedFaceId={config.fixedFaceId} />
        <ForceVectorArrows
          baseGeometry={baseGeometry}
          forceDirection={config.forceDirection}
          forceMagnitudeN={config.forceMagnitudeN}
          customVector={config.customVector}
        />

        {/* Max Stress Callout Flag in 3D */}
        <Html position={[results.hotspotNode.x, results.hotspotNode.y + 12, results.hotspotNode.z]} center>
          <div className="bg-rose-950/90 border border-rose-500 text-rose-200 text-[10px] font-mono font-bold px-2 py-1 rounded-md shadow-lg backdrop-blur-sm pointer-events-none flex items-center gap-1.5 whitespace-nowrap animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>🚩 Max: {results.maxVonMisesStressMPa} MPa</span>
          </div>
        </Html>

        {/* Selected Probe Callout */}
        {activeProbe && (
          <Html position={[activeProbe.x, activeProbe.y + 14, activeProbe.z]} center>
            <div className="bg-cyan-950/95 border border-cyan-400 text-cyan-200 text-[10px] font-mono px-2.5 py-1.5 rounded-lg shadow-xl backdrop-blur-md space-y-0.5 whitespace-nowrap">
              <div className="font-bold text-cyan-300 flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-cyan-400" />
                <span>探针测点 #{activeProbe.nodeIndex}</span>
              </div>
              <div>应力: <span className="font-bold text-amber-300">{activeProbe.stressMPa} MPa</span></div>
              <div>位移: <span className="text-slate-300">{activeProbe.displacementMm} mm</span></div>
              <div>安全系数: <span className={activeProbe.fos < 1.0 ? "text-rose-400 font-bold" : "text-emerald-400"}>n={activeProbe.fos}</span></div>
            </div>
          </Html>
        )}

        <OrbitControls makeDefault minDistance={30} maxDistance={400} />
      </Canvas>

      {/* SolidWorks-style Floating Color Bar Legend on Right */}
      <div className="absolute top-4 right-4 bg-slate-950/90 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md w-44 text-xs font-mono select-none space-y-2">
        <div className="text-[11px] font-bold text-slate-200 border-b border-slate-800 pb-1.5 flex items-center justify-between">
          <span>
            {config.activePlot === "von_mises" && "冯·米塞斯应力"}
            {config.activePlot === "displacement" && "合位移 Ures"}
            {config.activePlot === "safety_factor" && "设计安全系数 FOS"}
            {config.activePlot === "strain" && "等效应变 (με)"}
          </span>
          <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-cyan-300">
            {config.activePlot === "von_mises" ? "MPa" : config.activePlot === "displacement" ? "mm" : config.activePlot === "safety_factor" ? "UL" : "με"}
          </span>
        </div>

        <div className="flex gap-2.5 items-stretch h-56">
          {/* Vertical Rainbow Gradient Bar */}
          <div className="w-4 rounded-md overflow-hidden relative shadow-inner border border-slate-700">
            <div
              className={`w-full h-full ${
                config.activePlot === "safety_factor"
                  ? "bg-gradient-to-b from-blue-500 via-emerald-400 via-amber-400 to-rose-600"
                  : "bg-gradient-to-b from-red-500 via-amber-400 via-emerald-400 via-cyan-400 to-blue-600"
              }`}
            />
            {/* Yield Strength Horizontal Line Indicator */}
            {config.activePlot === "von_mises" && (
              <div
                className="absolute w-full h-0.5 bg-white shadow-[0_0_8px_#ffffff] z-10"
                style={{
                  top: `${Math.max(
                    0,
                    Math.min(
                      100,
                      (1 - (results.yieldStrengthMPa - results.minVonMisesStressMPa) /
                        Math.max(1, results.maxVonMisesStressMPa - results.minVonMisesStressMPa)) * 100
                    )
                  )}%`,
                }}
                title={`屈服极限: ${results.yieldStrengthMPa} MPa`}
              />
            )}
          </div>

          {/* Value Labels along the gradient */}
          <div className="flex flex-col justify-between text-[10px] text-slate-300 font-mono py-0.5">
            {config.activePlot === "von_mises" && (
              <>
                <span className="text-rose-400 font-bold">{results.maxVonMisesStressMPa.toFixed(1)}</span>
                <span className="text-orange-400">{(results.minVonMisesStressMPa + (results.maxVonMisesStressMPa - results.minVonMisesStressMPa) * 0.75).toFixed(1)}</span>
                <span className="text-yellow-300">{(results.minVonMisesStressMPa + (results.maxVonMisesStressMPa - results.minVonMisesStressMPa) * 0.5).toFixed(1)}</span>
                <span className="text-emerald-400">{(results.minVonMisesStressMPa + (results.maxVonMisesStressMPa - results.minVonMisesStressMPa) * 0.25).toFixed(1)}</span>
                <span className="text-cyan-400">{results.minVonMisesStressMPa.toFixed(1)}</span>
              </>
            )}
            {config.activePlot === "displacement" && (
              <>
                <span className="text-rose-400 font-bold">{results.maxDisplacementMm.toFixed(3)}</span>
                <span className="text-orange-400">{(results.maxDisplacementMm * 0.75).toFixed(3)}</span>
                <span className="text-yellow-300">{(results.maxDisplacementMm * 0.5).toFixed(3)}</span>
                <span className="text-emerald-400">{(results.maxDisplacementMm * 0.25).toFixed(3)}</span>
                <span className="text-cyan-400">0.000</span>
              </>
            )}
            {config.activePlot === "safety_factor" && (
              <>
                <span className="text-blue-400 font-bold">&gt; 3.0 (极安全)</span>
                <span className="text-emerald-400">2.0 (充足)</span>
                <span className="text-amber-400">1.5 (建议下限)</span>
                <span className="text-orange-400">1.0 (屈服临界)</span>
                <span className="text-rose-400 font-bold">&lt; 1.0 (危险失效)</span>
              </>
            )}
            {config.activePlot === "strain" && (
              <>
                <span className="text-rose-400 font-bold">{results.maxStrainMicroStrain.toFixed(0)}</span>
                <span className="text-orange-400">{(results.maxStrainMicroStrain * 0.75).toFixed(0)}</span>
                <span className="text-yellow-300">{(results.maxStrainMicroStrain * 0.5).toFixed(0)}</span>
                <span className="text-emerald-400">{(results.maxStrainMicroStrain * 0.25).toFixed(0)}</span>
                <span className="text-cyan-400">0</span>
              </>
            )}
          </div>
        </div>

        {/* Yield Strength Tag for von Mises */}
        {config.activePlot === "von_mises" && (
          <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 space-y-0.5">
            <div className="flex items-center justify-between">
              <span>屈服极限 σy:</span>
              <span className="text-white font-bold">{results.yieldStrengthMPa} MPa</span>
            </div>
            <div className="flex items-center justify-between">
              <span>最大安全系数:</span>
              <span className={results.minSafetyFactor < 1.0 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                {results.minSafetyFactor}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Top Left Info Overlay */}
      <div className="absolute top-4 left-4 bg-slate-950/85 border border-slate-800 p-3 rounded-xl text-xs font-mono text-slate-300 backdrop-blur-md pointer-events-none space-y-1.5 shadow-xl">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Layers className="w-4 h-4" />
          <span>{config.modelName}</span>
        </div>
        <div className="text-slate-400 text-[11px]">
          材料: <span className="text-slate-200">{config.material.name}</span>
        </div>
        <div className="text-slate-400 text-[11px]">
          外加载荷: <span className="text-pink-400 font-bold">{config.forceMagnitudeN} N</span> ({config.forceDirection})
        </div>
        <div className="text-slate-400 text-[11px]">
          网格单元: <span className="text-cyan-300">{results.elementsCount} 个单元 / {results.nodesCount} 节点</span>
        </div>
        {config.isDeformAnimationPlaying && (
          <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>动态变形动画播放中 ({config.deformationScale}x 放大)</span>
          </div>
        )}
      </div>

      {/* Bottom Floating Hovered Pointer Info */}
      {hoveredInfo && config.showProbe && (
        <div className="absolute bottom-4 left-4 bg-slate-950/90 border border-slate-700 text-xs font-mono px-3 py-1.5 rounded-lg text-slate-300 backdrop-blur-sm pointer-events-none flex items-center gap-3">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>当前鼠标点: ({hoveredInfo.x}, {hoveredInfo.y}, {hoveredInfo.z})</span>
          <span className="text-amber-400 font-bold">应力: {hoveredInfo.stress} MPa</span>
          <span className="text-cyan-400">位移: {hoveredInfo.disp} mm</span>
        </div>
      )}

      {/* Bottom Right SolidWorks Legend Indicator */}
      <div className="absolute bottom-4 right-4 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-400 backdrop-blur-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span>SolidWorks 线性静力学 FEA 求解器已就绪</span>
      </div>
    </div>
  );
};
