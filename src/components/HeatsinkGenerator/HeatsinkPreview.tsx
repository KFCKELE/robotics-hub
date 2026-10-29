import React, { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import * as THREE from "three";
import { HeatsinkParams, HeatsinkResult, generateHeatsinkMesh, getContactShapeLabel } from "./utils";
import { ErrorBoundary } from "../common/ErrorBoundary";
import { Eye, Flame, Layers } from "lucide-react";

interface HeatsinkPreviewProps {
  params: HeatsinkParams;
  result: HeatsinkResult;
}

const HeatsinkMesh: React.FC<{ params: HeatsinkParams; result: HeatsinkResult }> = ({ params, result }) => {
  const [meshGroup, setMeshGroup] = useState<THREE.Group>(() => generateHeatsinkMesh(params, result));

  useEffect(() => {
    const newGroup = generateHeatsinkMesh(params, result);
    setMeshGroup((prev) => {
      // Dispose old meshes to prevent memory leaks
      prev.traverse((child: any) => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m: any) => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
      return newGroup;
    });
  }, [params, result]);

  // Use a key to force re-mounting if needed, but primitive handles object updates automatically
  return <primitive object={meshGroup} />;
};

export const HeatsinkPreview: React.FC<HeatsinkPreviewProps> = ({ params, result }) => {
  const [showBottomNotice, setShowBottomNotice] = useState(true);

  return (
    <ErrorBoundary fallbackTitle="3D 散热片渲染异常" fallbackDescription="WebGL 视图已重置。您可以继续调整参数。">
      <div className="w-full h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden relative min-h-[420px]">
        <Canvas shadows camera={{ position: [55, 45, 55], fov: 45 }}>
          <Stage environment="city" intensity={0.65}>
            <HeatsinkMesh params={params} result={result} />
          </Stage>
          <OrbitControls makeDefault minDistance={20} maxDistance={250} />
        </Canvas>

        {/* Top-Left Geometry Info Overlay */}
        <div className="absolute top-3 left-3 bg-slate-950/85 p-2.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 backdrop-blur-md pointer-events-none space-y-1 shadow-lg">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold font-sans">
            <Layers className="w-3.5 h-3.5" />
            {getContactShapeLabel(params.contactShape)}
          </div>
          <p className="text-slate-400">包络: {params.baseWidth}×{params.baseLength}×{params.maxHeight}mm (底板: {params.baseThickness}mm)</p>
          <p className="text-slate-400">翅片: {result.finCount} 片 (高 {result.finHeight.toFixed(1)}mm | 厚 {result.finThickness.toFixed(2)}mm)</p>
          {params.mountingHoles && params.mountingHoles.length > 0 && (
            <p className="text-emerald-400">安装孔: {params.mountingHoles.length} 个沉头定位孔</p>
          )}
          {params.heatSourceZone && (
            <p className="text-amber-400 flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" />
              热源贴合区: {params.heatSourceZone.width}×{params.heatSourceZone.length}mm ({params.power}W)
            </p>
          )}
        </div>

        {/* Top-Right Interaction Tip */}
        <div className="absolute top-3 right-3 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 backdrop-blur-sm pointer-events-none flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>支持鼠标旋转缩放 / 翻转到底部可查看接触面与安装孔</span>
        </div>
      </div>
    </ErrorBoundary>
  );
};
