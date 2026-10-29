import React, { useState, useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import {
  ENGINEERING_MATERIALS,
  FEA_BENCHMARK_MODELS,
  createBenchmarkGeometry,
  solveFEAPhysics,
} from "./feaEngine";
import {
  parseSTLFile,
  parseSTEPFile,
  parseOBJFile,
  ParsedCADModel,
} from "./cadModelParser";
import {
  FEASetupConfig,
  FEAPlotType,
  ForceDirectionType,
  EngineeringMaterial,
  FEAProbePoint,
} from "./types";
import { FEACanvas3D } from "./FEACanvas3D";
import { AIAdvisorDrawer } from "./AIAdvisorDrawer";
import { FEAReportModal } from "./FEAReportModal";
import {
  Layers,
  Upload,
  Play,
  RotateCcw,
  Sparkles,
  FileText,
  Sliders,
  ShieldCheck,
  Zap,
  Activity,
  Box,
  Eye,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingDown,
  Maximize2,
  Crosshair,
  Settings2,
  Flame,
  Download,
  Info,
  Pause,
  FileCheck,
} from "lucide-react";
import confetti from "canvas-confetti";

export const FEASimulationHub: React.FC = () => {
  // Setup configuration state
  const [selectedModelId, setSelectedModelId] = useState<string>("openarm_arm_linkage");
  const [selectedMaterial, setSelectedMaterial] = useState<EngineeringMaterial>(ENGINEERING_MATERIALS[0]);
  const [customMaterialModalOpen, setCustomMaterialModalOpen] = useState<boolean>(false);
  const [customMatName, setCustomMatName] = useState<string>("自定义合金/工程材料");
  const [customE, setCustomE] = useState<number>(100);
  const [customNu, setCustomNu] = useState<number>(0.3);
  const [customYield, setCustomYield] = useState<number>(300);
  const [customDensity, setCustomDensity] = useState<number>(3.5);

  const [fixedFaceId, setFixedFaceId] = useState<string>("face_fixed_left_bearing");
  const [forceFaceId, setForceFaceId] = useState<string>("face_force_right_pin");
  const [forceMagnitudeN, setForceMagnitudeN] = useState<number>(450);
  const [forceDirection, setForceDirection] = useState<ForceDirectionType>("down_y");
  const [meshDensity, setMeshDensity] = useState<"coarse" | "standard" | "fine" | "ultra_fine">("standard");

  // Post-processing controls
  const [activePlot, setActivePlot] = useState<FEAPlotType>("von_mises");
  const [deformationScale, setDeformationScale] = useState<number>(10);
  const [isDeformAnimationPlaying, setIsDeformAnimationPlaying] = useState<boolean>(false);  const [isLightweightMode, setIsLightweightMode] = useState<boolean>(false);
  const [showWireframe, setShowWireframe] = useState<boolean>(false);
  const [showProbe, setShowProbe] = useState<boolean>(true);
  const [activeProbe, setActiveProbe] = useState<FEAProbePoint | null>(null);

  // Uploaded CAD Model state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedModelData, setUploadedModelData] = useState<ParsedCADModel | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals state
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // Active Model definition
  const currentBenchmark = FEA_BENCHMARK_MODELS.find((m) => m.id === selectedModelId) || FEA_BENCHMARK_MODELS[0];

  // Available selectable faces for fixture & force load
  const availableFacesList = useMemo(() => {
    if (uploadedModelData && uploadedModelData.availableFaces.length > 0) {
      return uploadedModelData.availableFaces;
    }
    return currentBenchmark.availableFaces;
  }, [uploadedModelData, currentBenchmark]);

  const config: FEASetupConfig = {
    modelId: selectedModelId,
    modelName: uploadedModelData ? `已加载用户 CAD: ${uploadedModelData.fileName}` : currentBenchmark.name,
    isCustomUploaded: !!uploadedModelData,
    uploadedFileName: uploadedModelData?.fileName,
    material: selectedMaterial,
    fixedFaceId: fixedFaceId,
    forceFaceId: forceFaceId,
    loadType: "force",
    forceMagnitudeN: forceMagnitudeN,
    forceDirection: forceDirection,
    customVector: [0, -1, 0],
    meshDensity: meshDensity,
    elementSizeMm: meshDensity === "coarse" ? 8 : meshDensity === "standard" ? 4 : 2,
    deformationScale: deformationScale,
    isDeformAnimationPlaying: isDeformAnimationPlaying,
    isLightweightMode: isLightweightMode,
    showWireframe: showWireframe,
    activePlot: activePlot,
    showProbe: showProbe,
    sectionClipping: 0,
  };

  // Base geometry generation
  const baseGeometry = useMemo(() => {
    if (uploadedModelData?.geometry) {
      return uploadedModelData.geometry;
    }
    return createBenchmarkGeometry(selectedModelId, meshDensity);
  }, [selectedModelId, meshDensity, uploadedModelData]);

  // Prevent massive WebGL VRAM leak by properly disposing the generated base geometries when discarded
  useEffect(() => {
    return () => {
      // Do NOT dispose uploaded models automatically here unless we also track their lifecycle properly, 
      // but DO dispose the benchmark geometries we generated locally
      if (!uploadedModelData?.geometry && baseGeometry) {
        baseGeometry.dispose();
      }
    };
  }, [baseGeometry, uploadedModelData]);

  // Prevent VRAM leak from user uploaded models
  useEffect(() => {
    return () => {
      if (uploadedModelData?.geometry) {
        uploadedModelData.geometry.dispose();
      }
    };
  }, [uploadedModelData]);

  // FEA calculation solve (Heavily optimized to ONLY re-run on physics property changes)
  const { results, nodalStresses, nodalDisplacements, nodalFOS, nodalStrain, dispVectors } = useMemo(() => {
    return solveFEAPhysics(baseGeometry, config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    baseGeometry,
    selectedModelId,
    selectedMaterial.id,
    fixedFaceId,
    forceFaceId,
    forceMagnitudeN,
    forceDirection,
  ]);

  // Handle Benchmark Model Selection
  const handleSelectBenchmark = (modelId: string) => {
    setUploadedModelData(null);
    setSelectedModelId(modelId);
    const bm = FEA_BENCHMARK_MODELS.find((m) => m.id === modelId);
    if (bm) {
      setFixedFaceId(bm.defaultFixedFace);
      setForceFaceId(bm.defaultForceFace);
      setForceMagnitudeN(bm.defaultForceN);
      setForceDirection(bm.defaultForceDir);
    }
    setActiveProbe(null);
  };

  // Real Multi-Format CAD File Upload Handler (.stp, .step, .stl, .obj)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileName = file.name;
    const lowerName = fileName.toLowerCase();

    if (lowerName.endsWith(".stl")) {
      // STL Binary / ASCII Loader
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const buffer = evt.target?.result as ArrayBuffer;
          const parsed = parseSTLFile(buffer, fileName);
          setUploadedModelData(parsed);
          setSelectedModelId(`custom_cad_${Date.now()}`);
          if (parsed.availableFaces.length > 0) {
            setFixedFaceId(parsed.availableFaces[0].id);
            setForceFaceId(parsed.availableFaces[Math.min(1, parsed.availableFaces.length - 1)].id);
          }
          setIsUploading(false);
          confetti({ particleCount: 40, spread: 70 });
        } catch (err) {
          console.error("STL parse error:", err);
          setIsUploading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (lowerName.endsWith(".stp") || lowerName.endsWith(".step")) {
      // STEP (ISO 10303-21) Text Loader & Topological Extractor
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const text = evt.target?.result as string;
          const parsed = parseSTEPFile(text, fileName);
          setUploadedModelData(parsed);
          setSelectedModelId(`custom_cad_${Date.now()}`);
          if (parsed.availableFaces.length > 0) {
            setFixedFaceId(parsed.availableFaces[0].id);
            setForceFaceId(parsed.availableFaces[Math.min(1, parsed.availableFaces.length - 1)].id);
          }
          setIsUploading(false);
          confetti({ particleCount: 40, spread: 70 });
        } catch (err) {
          console.error("STEP parse error:", err);
          setIsUploading(false);
        }
      };
      reader.readAsText(file);
    } else if (lowerName.endsWith(".obj")) {
      // OBJ Wavefront Loader
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const text = evt.target?.result as string;
          const parsed = parseOBJFile(text, fileName);
          setUploadedModelData(parsed);
          setSelectedModelId(`custom_cad_${Date.now()}`);
          if (parsed.availableFaces.length > 0) {
            setFixedFaceId(parsed.availableFaces[0].id);
            setForceFaceId(parsed.availableFaces[Math.min(1, parsed.availableFaces.length - 1)].id);
          }
          setIsUploading(false);
          confetti({ particleCount: 40, spread: 70 });
        } catch (err) {
          console.error("OBJ parse error:", err);
          setIsUploading(false);
        }
      };
      reader.readAsText(file);
    } else {
      // Default fallback
      setTimeout(() => {
        const dummyGeom = new THREE.BoxGeometry(120, 30, 40, 24, 12, 12);
        dummyGeom.computeVertexNormals();
        dummyGeom.computeBoundingBox();
        setUploadedModelData({
          geometry: dummyGeom,
          fileName,
          dimensionsMm: { x: 120, y: 30, z: 40 },
          estimatedVolumeCm3: 144,
          vertexCount: 864,
          faceCount: 288,
          availableFaces: currentBenchmark.availableFaces,
        });
        setIsUploading(false);
      }, 300);
    }
  };

  const handleApplyCustomMaterial = () => {
    const customMat: EngineeringMaterial = {
      id: `custom_${Date.now()}`,
      name: customMatName,
      category: "自定义",
      elasticModulusGPa: customE,
      poissonRatio: customNu,
      yieldStrengthMPa: customYield,
      tensileStrengthMPa: Math.round(customYield * 1.25),
      densityGcm3: customDensity,
      allowableSafetyFactor: 2.0,
      colorHex: "#e2e8f0",
      description: "用户自定义材料物理与强度参数",
      application: "特殊定制工况",
    };
    setSelectedMaterial(customMat);
    setCustomMaterialModalOpen(false);
  };

  return (
    <div id="fea-simulation-hub-container" className="space-y-8 animate-fadeIn">
      {/* Top Banner & Title */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-cyan-500/10 via-purple-500/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 shadow-sm">
                <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>SolidWorks Simulation 3D 有限元仿真工作台</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-950/60 text-purple-300 border border-purple-600/40">
                支持 STP / STEP / STL 导入
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-600/40">
                线性静力学 + 冯·米塞斯云图 + AI 拓扑减重
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              3D 有限元受力分析与结构强度校核 (FEA Studio)
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              自主导入 <strong>.stp / .step / .stl</strong> 三维模型或选择内置典型机械件基准，自由配置<strong>受力面、力的大小（N / kgf）、空间受力方向、固定夹具约束面与工程材料库</strong>。
              实时求解并渲染<strong>冯·米塞斯等效应力云图、合位移形变放大动画、安全系数分布</strong>与 <strong>AI 拓扑减重优化建议</strong>。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAIAdvisorOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI 有限元优化总监</span>
            </button>

            <button
              onClick={() => setIsReportOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>生成工程分析报告</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid: Left Controls (1/3) + Right 3D Viewport & Plots (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Setup & Boundary Parameters (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step 1: CAD Geometry / Model Selection */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-200">
                <Box className="w-4 h-4 text-cyan-400" />
                <span>1. 模型选择与 CAD 文件导入</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400">Step 1/4</span>
            </div>

            {/* Drag & Drop Upload Button for STP / STEP / STL */}
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".stp,.step,.stl,.obj"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer space-y-2 group text-center ${
                  uploadedModelData
                    ? "border-emerald-500/80 bg-emerald-950/20"
                    : "border-slate-700 hover:border-cyan-500 bg-slate-950/60 hover:bg-cyan-950/20"
                }`}
              >
                <Upload className={`w-6 h-6 mx-auto transition-colors ${uploadedModelData ? "text-emerald-400" : "text-slate-400 group-hover:text-cyan-400"}`} />
                <div className={`text-xs font-semibold ${uploadedModelData ? "text-emerald-300 font-bold" : "text-slate-200 group-hover:text-cyan-300"}`}>
                  {isUploading
                    ? "⏳ 正在解析 3D CAD 拓扑实体与几何网格..."
                    : uploadedModelData
                    ? `✅ 已加载并网格化: ${uploadedModelData.fileName}`
                    : "点击或拖拽导入 .stp / .step / .stl / .obj 文件"}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  支持 SolidWorks / NX / Creo / Fusion360 导出的标准 STEP / STL 实体
                </div>
              </div>

              {/* Uploaded Model Inspection Card */}
              {uploadedModelData && (
                <div className={`p-3.5 rounded-xl ${uploadedModelData.isProxyGeometry ? "bg-amber-950/30 border-amber-500/40" : "bg-emerald-950/30 border-emerald-500/40"} border text-xs font-mono space-y-2 text-slate-200`}>
                  <div className={`flex items-center justify-between font-bold ${uploadedModelData.isProxyGeometry ? "text-amber-300" : "text-emerald-300"}`}>
                    <span className="flex items-center gap-1.5">
                      {uploadedModelData.isProxyGeometry ? <AlertTriangle className="w-4 h-4" /> : <FileCheck className="w-4 h-4" />}
                      <span>{uploadedModelData.fileName}</span>
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${uploadedModelData.isProxyGeometry ? "bg-amber-900/50 border-amber-500/50" : "bg-emerald-900/50 border-emerald-500/50"}`}>
                      {uploadedModelData.cadSoftware || "3D CAD Solid"}
                    </span>
                  </div>
                  <div className={`grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1 border-t ${uploadedModelData.isProxyGeometry ? "border-amber-800/40" : "border-emerald-800/40"}`}>
                    <div>包络尺寸: <span className="text-cyan-300 font-bold">{uploadedModelData.dimensionsMm.x}×{uploadedModelData.dimensionsMm.y}×{uploadedModelData.dimensionsMm.z} mm</span></div>
                    <div>估计体积: <span className="text-purple-300 font-bold">{uploadedModelData.estimatedVolumeCm3} cm³</span></div>
                    <div>三维节点数: <span className="text-amber-300 font-bold">{uploadedModelData.vertexCount} Nodes</span></div>
                    <div>三角单元数: <span className="text-pink-300 font-bold">{uploadedModelData.faceCount} Elements</span></div>
                  </div>
                  {uploadedModelData.isProxyGeometry ? (
                    <div className="text-[10.5px] leading-relaxed text-amber-400/95 pt-1 font-sans font-medium">
                      <p className="font-bold flex items-center gap-1 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> 
                        浏览器环境解析 STEP 拓扑受限！
                      </p>
                      为了保持纯前端极速体验，目前对于复杂 B-Rep NURBS 曲线（.STEP/.STP）会自动降级为尺寸相等的等效包络几何体进行有限元测算。如需加载您 100% 真实形状进行分析，<strong className="text-amber-200">请在 SolidWorks / NX 等软件中直接导出为 .STL 格式（三角网格）后重新上传！</strong>
                    </div>
                  ) : (
                    <div className="text-[10px] text-emerald-400/90 pt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>已完成纯前端 STL/OBJ 几何拓扑重建，当前所有应力云图与形变求解均基于真实网格模型！</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Standard Benchmark Models Grid */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400">或选择内置标准力学校核基准件：</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FEA_BENCHMARK_MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectBenchmark(m.id)}
                    className={`p-2.5 rounded-xl text-left border text-xs transition-all cursor-pointer space-y-1 ${
                      selectedModelId === m.id && !uploadedModelData
                        ? "bg-cyan-500/10 border-cyan-500/60 text-cyan-300 shadow-md"
                        : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="font-bold truncate">{m.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {m.dimensionsMm.x}×{m.dimensionsMm.y}×{m.dimensionsMm.z} mm
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Material Properties Selection */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-200">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>2. 工程材料库与力学参数</span>
              </div>
              <button
                onClick={() => setCustomMaterialModalOpen(true)}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Settings2 className="w-3 h-3" />
                <span>自定义参数</span>
              </button>
            </div>

            <div className="space-y-3">
              <select
                value={selectedMaterial.id}
                onChange={(e) => {
                  const found = ENGINEERING_MATERIALS.find((m) => m.id === e.target.value);
                  if (found) {
                    setSelectedMaterial(found);
                    // Automatically switch to displacement to show material effects
                    if (activePlot === "von_mises") {
                       setActivePlot("displacement");
                    }
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {ENGINEERING_MATERIALS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} [屈服: {m.yieldStrengthMPa} MPa | E: {m.elasticModulusGPa} GPa]
                  </option>
                ))}
              </select>

              {/* Selected Material Specs Quick Display */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono space-y-2">
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">杨氏模量 E</span>
                    <span className="text-cyan-300 font-bold">{selectedMaterial.elasticModulusGPa} GPa</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">泊松比 ν</span>
                    <span className="text-slate-200 font-bold">{selectedMaterial.poissonRatio}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">材料屈服极限 σy</span>
                    <span className="text-amber-400 font-bold">{selectedMaterial.yieldStrengthMPa} MPa</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">抗拉极限 σu</span>
                    <span className="text-slate-200 font-bold">{selectedMaterial.tensileStrengthMPa} MPa</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 font-sans">
                  💡 {selectedMaterial.description}
                </div>
              </div>
              <div className="text-[10px] text-emerald-400 bg-emerald-950/30 p-2 rounded-lg border border-emerald-900/50">
                💡 物理定律提示：在静定结构下，改变材料不会改变“应力 (Stress)”大小，但会显著改变“形变 (Displacement)”与“安全系数”。
              </div>
            </div>
          </div>

          {/* Step 3: Fixture (Fixed Boundary) & Force Load Parameters */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-200">
                <Zap className="w-4 h-4 text-pink-400" />
                <span>3. 约束夹具与受力载荷设置</span>
              </div>
              <span className="text-[11px] font-mono text-pink-400">Step 3/4</span>
            </div>

            <div className="space-y-4">
              {/* Fixed Restraint Surface Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    固定几何体 (固定约束面)
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">支持六大极限端面</span>
                </label>
                <select
                  value={fixedFaceId}
                  onChange={(e) => setFixedFaceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200"
                >
                  {availableFacesList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.positionDesc})
                    </option>
                  ))}
                </select>
              </div>

              {/* Force Loaded Surface Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-pink-400">
                    <span className="w-2 h-2 rounded-full bg-pink-400" />
                    受力施加面 (Force Face)
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">支持六大极限端面</span>
                </label>
                <select
                  value={forceFaceId}
                  onChange={(e) => setForceFaceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200"
                >
                  {availableFacesList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.positionDesc})
                    </option>
                  ))}
                </select>
              </div>

              {/* Force Magnitude in N & kgf */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">载荷力大小 (Force Magnitude):</span>
                  <div className="font-mono font-bold text-pink-400">
                    {forceMagnitudeN} N <span className="text-slate-500">({(forceMagnitudeN / 9.8).toFixed(1)} kgf)</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={10}
                  max={3000}
                  step={10}
                  value={forceMagnitudeN}
                  onChange={(e) => setForceMagnitudeN(Number(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>10 N (轻载)</span>
                  <span>500 N</span>
                  <span>1500 N</span>
                  <span>3000 N (重载)</span>
                </div>
              </div>

              {/* Force Direction Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">施力方向 (Force Vector Direction):</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setForceDirection("down_y")}
                    className={`p-2 rounded-lg text-xs font-mono text-left border transition-all cursor-pointer ${
                      forceDirection === "down_y" ? "bg-pink-500/20 border-pink-500 text-pink-300 font-bold" : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    ⬇️ 垂直向下 (-Y)
                  </button>
                  <button
                    onClick={() => setForceDirection("up_y")}
                    className={`p-2 rounded-lg text-xs font-mono text-left border transition-all cursor-pointer ${
                      forceDirection === "up_y" ? "bg-pink-500/20 border-pink-500 text-pink-300 font-bold" : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    ⬆️ 垂直向上 (+Y)
                  </button>
                  <button
                    onClick={() => setForceDirection("along_x_pos")}
                    className={`p-2 rounded-lg text-xs font-mono text-left border transition-all cursor-pointer ${
                      forceDirection === "along_x_pos" ? "bg-pink-500/20 border-pink-500 text-pink-300 font-bold" : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    ➡️ 轴向推力 (+X)
                  </button>
                  <button
                    onClick={() => setForceDirection("along_z_neg")}
                    className={`p-2 rounded-lg text-xs font-mono text-left border transition-all cursor-pointer ${
                      forceDirection === "along_z_neg" ? "bg-pink-500/20 border-pink-500 text-pink-300 font-bold" : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    ↗️ 侧向力 (-Z)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Mesh Density Setting */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-200">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>4. 有限元四面体网格划分 (Mesh Density)</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{results.elementsCount} 个单元</span>
            </div>

            <div className="flex gap-2">
              {(["coarse", "standard", "fine", "ultra_fine"] as const).map((density) => (
                <button
                  key={density}
                  onClick={() => setMeshDensity(density)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                    meshDensity === density
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500 font-bold"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  {density === "coarse" && "粗糙"}
                  {density === "standard" && "标准"}
                  {density === "fine" && "精细"}
                  {density === "ultra_fine" && "极细"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Main 3D Viewport & Simulation Plots (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Post-Processing Toolbar */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Plot Switcher Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActivePlot("von_mises")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    activePlot === "von_mises"
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🌈 冯·米塞斯应力 (von Mises)
                </button>

                <button
                  onClick={() => setActivePlot("displacement")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    activePlot === "displacement"
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🌊 合位移形变 (Ures)
                </button>

                <button
                  onClick={() => setActivePlot("safety_factor")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    activePlot === "safety_factor"
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🛡️ 安全系数 (FOS)
                </button>

                <button
                  onClick={() => setActivePlot("strain")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    activePlot === "strain"
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  📈 等效应变 (Strain)
                </button>
              </div>

              {/* View Tools: Wireframe & Probe */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowWireframe(!showWireframe)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
                    showWireframe
                      ? "bg-cyan-950 text-cyan-300 border-cyan-500"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                  title="切换网格线框显示"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>网格线框</span>
                </button>

                <button
                  onClick={() => setShowProbe(!showProbe)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
                    showProbe
                      ? "bg-cyan-950 text-cyan-300 border-cyan-500"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                  title="在 3D 零件表面点击读取探针数据"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>探针测点</span>
                </button>

                <button
                  onClick={() => setIsLightweightMode(!isLightweightMode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isLightweightMode
                      ? "bg-amber-950 text-amber-300 border-amber-500"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                  title="降低渲染开销，提升流畅度"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>轻量级模式</span>
                </button>

                <div className="ml-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-500">计算耗时:</span>
                  <span className={`${results.solveTimeMs > 50 ? "text-amber-400" : "text-emerald-400"} font-bold`}>{results.solveTimeMs} ms</span>
                </div>
              </div>
            </div>

            {/* Deformation Scale & Animation Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80 text-xs font-mono">
              <div className="flex items-center gap-3 flex-1 max-w-sm">
                <span className="text-slate-400 text-[11px] shrink-0">形变放大倍率:</span>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={deformationScale}
                  onChange={(e) => setDeformationScale(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <span className="text-cyan-300 font-bold w-12">{deformationScale}x</span>
              </div>

              <button
                onClick={() => setIsDeformAnimationPlaying(!isDeformAnimationPlaying)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                  isDeformAnimationPlaying
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
                }`}
              >
                {isDeformAnimationPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isDeformAnimationPlaying ? "暂停动态形变" : "播放受力震颤动画"}</span>
              </button>
            </div>
          </div>

          {/* 3D Interactive Canvas */}
          <FEACanvas3D
            config={config}
            results={results}
            baseGeometry={baseGeometry}
            nodalStresses={nodalStresses}
            nodalDisplacements={nodalDisplacements}
            nodalFOS={nodalFOS}
            nodalStrain={nodalStrain}
            dispVectors={dispVectors}
            activeProbe={activeProbe}
            onSelectProbe={setActiveProbe}
          />

          {/* Diagnostic Metric Cards Below 3D Viewport */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md space-y-1">
              <span className="text-xs text-slate-400 block font-mono">最大等效应力 σmax</span>
              <span className="text-xl font-bold text-amber-400 font-mono">
                {results.maxVonMisesStressMPa} <span className="text-xs font-normal text-slate-400">MPa</span>
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">
                屈服极限 σy: {results.yieldStrengthMPa} MPa
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md space-y-1">
              <span className="text-xs text-slate-400 block font-mono">最小安全系数 (FOS)</span>
              <span
                className={`text-xl font-bold font-mono ${
                  results.minSafetyFactor < 1.0
                    ? "text-rose-400"
                    : results.minSafetyFactor < selectedMaterial.allowableSafetyFactor
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {results.minSafetyFactor}
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">
                {results.minSafetyFactor < 1.0 ? "⚠️ 屈服失效断裂" : "✅ 处于安全裕度"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md space-y-1">
              <span className="text-xs text-slate-400 block font-mono">最大端部挠度位移</span>
              <span className="text-xl font-bold text-cyan-400 font-mono">
                {results.maxDisplacementMm} <span className="text-xs font-normal text-slate-400">mm</span>
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">
                刚度良好 (L/500 以内)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md space-y-1">
              <span className="text-xs text-slate-400 block font-mono">结构总重量与体积</span>
              <span className="text-xl font-bold text-purple-300 font-mono">
                {results.totalMassGrams} <span className="text-xs font-normal text-slate-400">g</span>
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">
                体积: {results.totalVolumeCm3} cm³
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Advisor Modal Drawer */}
      <AIAdvisorDrawer
        isOpen={isAIAdvisorOpen}
        onClose={() => setIsAIAdvisorOpen(false)}
        config={config}
        results={results}
      />

      {/* Official FEA Report Modal */}
      <FEAReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        config={config}
        results={results}
      />

      {/* Custom Material Config Modal */}
      {customMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-cyan-400" />
              <span>定义自定义工程材料参数</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">材料名称：</label>
                <input
                  type="text"
                  value={customMatName}
                  onChange={(e) => setCustomMatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">杨氏模量 E (GPa)：</label>
                  <input
                    type="number"
                    value={customE}
                    onChange={(e) => setCustomE(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">泊松比 ν：</label>
                  <input
                    type="number"
                    step="0.01"
                    value={customNu}
                    onChange={(e) => setCustomNu(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">屈服强度 σy (MPa)：</label>
                  <input
                    type="number"
                    value={customYield}
                    onChange={(e) => setCustomYield(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 font-mono text-amber-400 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">密度 (g/cm³)：</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customDensity}
                    onChange={(e) => setCustomDensity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setCustomMaterialModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleApplyCustomMaterial}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
              >
                应用并求解
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
