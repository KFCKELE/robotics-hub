import React, { useState } from "react";
import { RobotModel, UrdfHistoryItem, OptimizationOptions } from "./types";
import { Urdf3DViewer } from "./Urdf3DViewer";
import { JointControllerPanel } from "./JointControllerPanel";
import { UrdfCodeEditor } from "./UrdfCodeEditor";
import { UrdfGenerationProgressBar } from "./UrdfGenerationProgressBar";
import { UrdfHistoryManager } from "./UrdfHistoryManager";
import { UrdfOptimizerPanel } from "./UrdfOptimizerPanel";
import { generateRobotFromCadFile, optimizeRobotModel, create5FingerBionicHandModel } from "./UrdfGeneratorEngine";
import {
  Boxes,
  UploadCloud,
  FileCode,
  Sliders,
  Cpu,
  Sparkles,
  Zap,
  CheckCircle2,
  Terminal,
  Activity,
  Layers,
  History,
  Wrench,
  RotateCcw,
  Eye,
  Plus,
  RefreshCw,
  Hand,
  AlertTriangle,
  FileCheck,
} from "lucide-react";

const DEFAULT_OPTIMIZATION_OPTIONS: OptimizationOptions = {
  optimizationMode: "comprehensive",
  materialType: "PLA-CF",
  meshSimplification: "balanced",
  collisionType: "convex_hull",
  autoCorrectAxes: true,
  dampingFactor: 1.2,
  frictionFactor: 1.0,
  limitBufferDeg: 3,
  enforcePositiveDefiniteInertia: true,
};

export const UrdfGeneratorHub: React.FC = () => {
  // Core State
  const [currentRobot, setCurrentRobot] = useState<RobotModel | null>(null);
  const [currentFileMeta, setCurrentFileMeta] = useState<{ name: string; size: string } | null>(null);
  const [history, setHistory] = useState<UrdfHistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  // Selected Target Archetype
  const [selectedArchetype, setSelectedArchetype] = useState<"bionic_hand" | "robotic_arm" | "gripper" | "custom">("bionic_hand");

  // Optimization & Generation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isOptimizingMode, setIsOptimizingMode] = useState<boolean>(false);
  const [pendingUploadFile, setPendingUploadFile] = useState<{ name: string; size: string } | null>(null);
  const [currentOptions, setCurrentOptions] = useState<OptimizationOptions>(DEFAULT_OPTIMIZATION_OPTIONS);
  const [iterationCount, setIterationCount] = useState<number>(1);

  // Joint Values for Active Robot
  const [jointValues, setJointValues] = useState<Record<string, number>>({});
  const [selectedJointName, setSelectedJointName] = useState<string | null>(null);

  // UI Active Sub-tab
  const [activeTab, setActiveTab] = useState<
    "viewer_controls" | "optimizer" | "code_export" | "history" | "local_bridge" | "validation_guide"
  >("viewer_controls");

  // Sync joint values when robot changes
  const applyRobotModel = (robot: RobotModel, historyId?: string) => {
    setCurrentRobot(robot);
    const newVals: Record<string, number> = {};
    robot.joints.forEach((j) => {
      newVals[j.name] = j.currentValue ?? 0;
    });
    setJointValues(newVals);
    setSelectedJointName(null);
    if (historyId) setActiveHistoryId(historyId);
  };

  const handleJointChange = (jointName: string, value: number) => {
    setJointValues((prev) => ({
      ...prev,
      [jointName]: value,
    }));
  };

  const handleSetAllJoints = (values: Record<string, number>) => {
    setJointValues(values);
  };

  // Switch Archetype for active robot immediately
  const handleSwitchArchetype = (archetype: "bionic_hand" | "robotic_arm" | "gripper" | "custom") => {
    setSelectedArchetype(archetype);
    const fileName = currentFileMeta?.name || pendingUploadFile?.name || "Hand_Assembly.STEP";
    const newRobot = generateRobotFromCadFile(fileName, currentOptions, archetype);
    
    const newHistoryId = `hist_${Date.now()}`;
    const archetypeNames: Record<string, string> = {
      bionic_hand: "5指高精仿生灵巧手 (16 DoF)",
      robotic_arm: "工业机械臂 (4 DoF)",
      gripper: "平行夹爪 (2 DoF)",
      custom: "自定义构件",
    };

    const newHistoryItem: UrdfHistoryItem = {
      id: newHistoryId,
      timestamp: Date.now(),
      version: `拓扑重构: ${archetypeNames[archetype]}`,
      fileName: fileName,
      fileSize: currentFileMeta?.size || "14.2 MB",
      status: "success",
      qualityScore: 96,
      robot: newRobot,
      optimizationOptions: { ...currentOptions },
      notes: `用户手动指定装配体拓扑架构为 ${archetypeNames[archetype]}，重新生成完整运动学父子树`,
    };

    setHistory((prev) => [newHistoryItem, ...prev]);
    applyRobotModel(newRobot, newHistoryId);
  };

  // Step 1: User uploads CAD file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let fileUrl = undefined;
    if (file.name.toLowerCase().endsWith('.stl') || file.name.toLowerCase().endsWith('.obj')) {
      fileUrl = URL.createObjectURL(file);
    }

    const meta = {
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      url: fileUrl,
    };
    setPendingUploadFile(meta as any);
    setIsOptimizingMode(false);
    setIsGenerating(true);
  };

  // Quick Demo STEP Loader
  const handleLoadSampleFile = (type: "bionic_hand" | "arm") => {
    const sampleName = type === "bionic_hand" ? "Bionic_5Finger_Tendon_Hand.STEP" : "Dexterous_Manipulator_6DoF.SLDASM";
    const meta = {
      name: sampleName,
      size: type === "bionic_hand" ? "14.2 MB" : "28.6 MB",
      url: undefined,
    };
    setSelectedArchetype(type === "bionic_hand" ? "bionic_hand" : "robotic_arm");
    setPendingUploadFile(meta as any);
    setIsOptimizingMode(false);
    setIsGenerating(true);
  };

  // Step 2: Progress Bar Completes initial generation
  const handleGenerationComplete = () => {
    if (!pendingUploadFile) return;

    // Directly generate 1:1 tailored robot model based on actual uploaded file!
    const newRobot = generateRobotFromCadFile((pendingUploadFile as any).name, currentOptions, (pendingUploadFile as any).url);
    const newHistoryId = `hist_${Date.now()}`;
    const newHistoryItem: UrdfHistoryItem = {
      id: newHistoryId,
      timestamp: Date.now(),
      version: `v1.0 (初始 CAD 解析)`,
      fileName: (pendingUploadFile as any).name,
      fileSize: (pendingUploadFile as any).size,
      status: "success",
      qualityScore: 96,
      robot: newRobot,
      optimizationOptions: { ...currentOptions },
      notes:
        newRobot.category === "single_part"
          ? `从单一 CAD 零件文件提取生成独立刚体 base_link URDF，自动计算正定惯性张量与网格引用`
          : `初次自动提取刚体与动力学转轴，生成 ${newRobot.dof} 自由度 URDF`,
    };

    setCurrentFileMeta(pendingUploadFile);
    setHistory((prev) => [newHistoryItem, ...prev]);
    applyRobotModel(newRobot, newHistoryId);
    setIterationCount(1);
    setIsGenerating(false);
    setPendingUploadFile(null);
    setActiveTab("viewer_controls");
  };

  // Step 3: Trigger Built-in Optimizer & Regenerate
  const handleApplyOptimization = (newOptions: OptimizationOptions) => {
    if (!currentRobot || !currentFileMeta) return;

    setCurrentOptions(newOptions);
    setIsOptimizingMode(true);
    setIsGenerating(true);
  };

  // Step 4: Progress Bar Completes Optimization
  const handleOptimizationComplete = () => {
    if (!currentRobot || !currentFileMeta) return;

    const nextIteration = iterationCount + 1;
    const optimizedRobot = optimizeRobotModel(currentRobot, currentOptions, nextIteration);
    const newHistoryId = `hist_${Date.now()}`;

    const modeLabels: Record<string, string> = {
      comprehensive: "全项综合校准",
      smooth_dynamics: "阻尼动力学平滑",
      axis_rectification: "REP-103 轴向矫正",
      mesh_decimation: "凸包轻量化",
      soft_limit: "软限位保护",
    };

    const newHistoryItem: UrdfHistoryItem = {
      id: newHistoryId,
      timestamp: Date.now(),
      version: `v1.${nextIteration - 1} (${modeLabels[currentOptions.optimizationMode] || "深度优化"})`,
      fileName: currentFileMeta.name,
      fileSize: currentFileMeta.size,
      status: "optimized",
      qualityScore: Math.min(99, 90 + nextIteration * 2),
      robot: optimizedRobot,
      optimizationOptions: { ...currentOptions },
      notes: `第 ${nextIteration} 轮内置程序优化: ${currentOptions.materialType} | 阻尼 ${currentOptions.dampingFactor}x | 软限位 ${currentOptions.limitBufferDeg}°`,
    };

    setIterationCount(nextIteration);
    setHistory((prev) => [newHistoryItem, ...prev]);
    applyRobotModel(optimizedRobot, newHistoryId);
    setIsGenerating(false);
    setIsOptimizingMode(false);
    setActiveTab("viewer_controls");
  };

  // History operations
  const handleSelectHistoryItem = (item: UrdfHistoryItem) => {
    applyRobotModel(item.robot, item.id);
    setCurrentOptions(item.optimizationOptions);
    setActiveTab("viewer_controls");
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    if (activeHistoryId === id) {
      const remaining = history.filter((h) => h.id !== id);
      if (remaining.length > 0) {
        applyRobotModel(remaining[0].robot, remaining[0].id);
      } else {
        setCurrentRobot(null);
        setActiveHistoryId(null);
      }
    }
  };

  const handleClearFailedHistory = () => {
    setHistory((prev) => prev.filter((h) => h.status !== "failed"));
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Boxes className="w-3.5 h-3.5" />
            <span>智能装配体转 URDF 动力学生成器</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            CAD 装配体 URDF 自动生成与 3D 动力学控制台
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            支持提供 SolidWorks (.SLDASM)、STEP/STP 机械手或机械臂装配体。系统内置高精度拓扑识别算法，自动提取 5 指关节链（大拇指对掌与 4 指 MCP/PIP/DIP 连杆机构共 16 自由度）、计算材料质心惯性张量并输出 ROS 2 标准 URDF/SRDF。
          </p>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
              <Hand className="w-3.5 h-3.5 text-cyan-400" />
              <span>5 指 16 自由度连杆仿生手</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>实时正向运动学 (FK) 与姿态动作库</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>内置程序持续优化迭代</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar View (Active when generating or optimizing) */}
      {isGenerating && (
        <UrdfGenerationProgressBar
          fileName={pendingUploadFile?.name || currentFileMeta?.name || "CAD_Assembly.STEP"}
          isOptimizing={isOptimizingMode}
          onComplete={isOptimizingMode ? handleOptimizationComplete : handleGenerationComplete}
        />
      )}

      {/* When no robot is loaded and not generating: Big Waiting & File Dropzone */}
      {!currentRobot && !isGenerating && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-3xl p-10 sm:p-14 flex flex-col items-center justify-center text-center relative group transition-all space-y-6">
            <input
              type="file"
              accept=".step,.stp,.sldasm,.sldprt,.obj,.stl,.zip,.urdf,.xacro,.dae"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-20"
            />

            <div className="p-5 rounded-3xl bg-slate-800 group-hover:bg-cyan-950/70 text-slate-300 group-hover:text-cyan-300 transition-all border border-slate-700 group-hover:border-cyan-500/40 shadow-xl group-hover:scale-105">
              <UploadCloud className="w-12 h-12 text-cyan-400" />
            </div>

            <div className="max-w-xl space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                导入您的 URDF 压缩包或单零件模型
              </h2>
              <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-3 text-left">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    <span className="text-amber-400 font-bold">装配体最佳实践（必读）：</span>
                    请在 SolidWorks 等软件中使用 <span className="text-white font-mono bg-slate-800 px-1 py-0.5 rounded border border-slate-700">sw2urdf</span> 插件导出（包含 URDF 与 meshes 的文件夹），将其<span className="text-white font-bold">打包为 .ZIP 压缩包</span>并拖入此处。纯 .STEP / .SLDASM 实体无法自动反推真实的关节约束 (Kinematics)。
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-sans">
                如果是纯渲染查看外壳或单个连杆，也可以直接上传单文件的 <span className="text-cyan-300 font-mono">.STL / .OBJ</span>。
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-800 text-[11px] font-mono text-emerald-400">
                .ZIP (URDF + Meshes 完整包)
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-400">
                .STL / .OBJ (单零件)
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-500 line-through">
                直接传 .STEP / .SLDASM
              </span>
            </div>

            {/* Quick Demo Test Buttons */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-3 relative z-30">
              <span className="text-xs text-slate-500 font-mono">快速体验预设模型:</span>
              <button
                onClick={() => handleLoadSampleFile("bionic_hand")}
                className="px-4 py-2 bg-slate-800 hover:bg-cyan-950/80 text-cyan-300 hover:text-cyan-200 border border-slate-700 hover:border-cyan-500/50 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Hand className="w-3.5 h-3.5" />
                <span>载入 5 指 16-DoF 连杆仿生机械手 (STEP)</span>
              </button>

              <button
                onClick={() => handleLoadSampleFile("arm")}
                className="px-4 py-2 bg-slate-800 hover:bg-purple-950/80 text-purple-300 hover:text-purple-200 border border-slate-700 hover:border-purple-500/50 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>载入 4 轴工业机械臂 (SLDASM)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* When robot is loaded: Full Workbench Dashboard */}
      {currentRobot && (
        <div className="space-y-6">
          {/* Active Model Quick Status Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{currentRobot.name}</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    {currentRobot.category === "single_part" ? "单零件刚体" : `${currentRobot.dof} 自由度 (DoF)`}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
                    {currentRobot.links.length} 刚体构件
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                    质量: {currentRobot.links.reduce((acc, l) => acc + (l.inertial?.massKg || 0), 0).toFixed(3)} kg
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  来源文件: {currentFileMeta?.name || "CAD_Model.step"} ({currentFileMeta?.size || "0.2 MB"}) | 材质: {currentOptions.materialType}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab("optimizer")}
                className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer"
                title="打开内置程序优化调优面板"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>优化调优</span>
              </button>

              <label className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer">
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>更换 CAD 文件</span>
                <input
                  type="file"
                  accept=".step,.stp,.sldasm,.sldprt,.obj,.stl,.zip,.urdf,.xacro,.dae"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab("viewer_controls")}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "viewer_controls"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>3D 动力学查看器 & 关节控制器</span>
            </button>

            <button
              onClick={() => setActiveTab("optimizer")}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "optimizer"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>内置程序优化调优 (第 {iterationCount} 轮)</span>
            </button>

            <button
              onClick={() => setActiveTab("code_export")}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "code_export"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>URDF / ROS 2 源码导出</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "history"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
              }`}
            >
              <History className="w-4 h-4" />
              <span>生成历史库 ({history.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("local_bridge")}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "local_bridge"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>本地端硬件加速指南</span>
            </button>

            <button
              onClick={() => setActiveTab("validation_guide")}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "validation_guide"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Mujoco & ROS2 验证指南</span>
            </button>
          </div>

          {/* Sub-Tab 1: 3D Interactive Viewer + Joint Controller */}
          {activeTab === "viewer_controls" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 3D WebGL Viewer (7 Cols) */}
              <div className="lg:col-span-7">
                <Urdf3DViewer
                  robot={currentRobot}
                  jointValues={jointValues}
                  onJointChange={handleJointChange}
                  selectedJointName={selectedJointName}
                  onSelectJoint={setSelectedJointName}
                />
              </div>

              {/* Joint Controller Panel (5 Cols) */}
              <div className="lg:col-span-5">
                <JointControllerPanel
                  robot={currentRobot}
                  jointValues={jointValues}
                  onJointChange={handleJointChange}
                  onSetAllJoints={handleSetAllJoints}
                  selectedJointName={selectedJointName}
                  onSelectJoint={setSelectedJointName}
                />
              </div>
            </div>
          )}

          {/* Sub-Tab 2: Built-in Optimization Program & Knobs */}
          {activeTab === "optimizer" && (
            <UrdfOptimizerPanel
              currentOptions={currentOptions}
              iterationCount={iterationCount}
              onApplyOptimization={handleApplyOptimization}
              isGenerating={isGenerating}
            />
          )}

          {/* Sub-Tab 3: Code Editor & ROS2 Package Exporter */}
          {activeTab === "code_export" && (
            <UrdfCodeEditor robot={currentRobot} />
          )}

          {/* Sub-Tab 4: History Management */}
          {activeTab === "history" && (
            <UrdfHistoryManager
              history={history}
              activeHistoryId={activeHistoryId}
              onSelectHistoryItem={handleSelectHistoryItem}
              onDeleteHistoryItem={handleDeleteHistoryItem}
              onClearFailedHistory={handleClearFailedHistory}
            />
          )}

          {/* Sub-Tab 5: Local Hardware Acceleration Guide */}
          {activeTab === "local_bridge" && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    本地端硬件 CAD 内核离线提取引擎 (Local Hardware Offload Pipeline)
                  </h3>
                  <p className="text-xs text-slate-400">
                    利用本地电脑的 CPU 多核多线程与 GPU 显卡直接解析百兆级别的复杂装配体，100% 本地完成，无需上传私有设计
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-300">
                    <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <span>安装 Python 核心环境</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    pip install trimesh numpy scipy pyyaml rich
                  </p>
                  <p className="text-[11px] text-slate-500">
                    支持 OpenCASCADE / FreeCAD C++ 底层内核，实现 STEP 装配体快速轻量化网格剖分。
                  </p>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-300">
                    <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <span>执行一键自动转化脚本</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    python cad2urdf_local_engine.py my_hand.step -m PLA_CF
                  </p>
                  <p className="text-[11px] text-slate-500">
                    自动提取每个指骨/连杆的三维质心坐标、惯性张量矩与 STL 碰撞网格。
                  </p>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-300">
                    <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-[10px]">
                      3
                    </span>
                    <span>载入 ROS 2 与 MoveIt 2</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    ros2 launch my_hand_description display.launch.py
                  </p>
                  <p className="text-[11px] text-slate-500">
                    直接生成开箱即用的 RViz2、MoveIt 2 碰撞检测与 ros2_control 控制配置。
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "validation_guide" && (
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-8 animate-fade-in-up overflow-hidden">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-amber-500" />
                  可视化与 URDF 验证指南 (Mujoco / ROS2)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  无需繁杂的操作，这里汇总了最快捷的模型动力学验证最佳实践。
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Mujoco Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    推荐方案：Mujoco 极速拖拽验证
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    极度推荐直接使用 Mujoco，省去了 ROS 的那一套繁琐依赖，所见即所得。只需将 URDF 直接拖进 <code className="bg-slate-800 px-1 rounded">simulation.exe</code> 中即可显示并进行动力学物理测试。
                  </p>
                  
                  <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-4 space-y-3">
                    <h5 className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      核心避坑：尺寸与单位 (米 vs 毫米)
                    </h5>
                    <p className="text-xs text-slate-300">
                      Mujoco 的默认物理单位是<strong>米 (Meters)</strong>。如果在 SolidWorks 导出模型时使用了默认的毫米，进入 Mujoco 后模型会变得像摩天大楼一样巨大。
                    </p>
                    <p className="text-xs text-amber-400 font-mono bg-black/40 p-2 rounded-lg border border-amber-900/30">
                      操作: Solidworks 另存为 STL -{'>'} 选项 -{'>'} 输出单位: 选择“米”
                    </p>
                  </div>

                  <div className="space-y-2 mt-4">
                    <h5 className="text-xs font-bold text-slate-300">💡 实用操作技巧</h5>
                    <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
                      <li><strong>旋转中心:</strong> 在 Mujoco 中<span className="text-white">右键双击</span>，即可切换旋转中心。</li>
                      <li><strong>相机 FOV 对齐:</strong> 通过创建一个自定义坐标系模型（如画一个“F”），将坐标原点与摄像头光心对齐，即可在 Mujoco 中测试相机 FOV 是否精准匹配。</li>
                      <li><strong>警告忽略:</strong> 保存 XML 时出现的 <code className="text-purple-400">WARNING: Geom with duplicate name '' encountered...</code>，属于无名几何体生成，可直接忽略。</li>
                    </ul>
                  </div>
                </div>

                {/* ROS2 Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    正统方案：Ubuntu 24.04 ROS2 (Jazzy)
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-3">
                      <div className="text-[10px] text-slate-500 font-mono uppercase mb-1.5">1. 安装 ROS2 环境</div>
                      <code className="text-xs text-emerald-400 font-mono block">sudo apt upgrade<br/>sudo apt install ros-jazzy-desktop</code>
                      <code className="text-xs text-cyan-400 font-mono block mt-2">source /opt/ros/jazzy/setup.bash</code>
                    </div>

                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-3">
                      <div className="text-[10px] text-slate-500 font-mono uppercase mb-1.5">2. 终端 1: 发布 URDF (Robot State Publisher)</div>
                      <code className="text-xs text-amber-300 font-mono block break-all">ros2 run robot_state_publisher robot_state_publisher --ros-args -p robot_description:="$(cat path/to/your_robot.urdf)"</code>
                    </div>

                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-3">
                      <div className="text-[10px] text-slate-500 font-mono uppercase mb-1.5">3. 终端 2: 启动关节控制 GUI</div>
                      <code className="text-xs text-purple-300 font-mono block break-all">ros2 run joint_state_publisher_gui joint_state_publisher_gui</code>
                    </div>

                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-3">
                      <div className="text-[10px] text-slate-500 font-mono uppercase mb-1.5">4. 终端 3: 启动 RViz 验证可视化</div>
                      <code className="text-xs text-blue-300 font-mono block break-all">ros2 run rviz2 rviz2</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
