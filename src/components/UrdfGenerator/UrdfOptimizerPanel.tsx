import React, { useState } from "react";
import { OptimizationOptions } from "./types";
import {
  Sparkles,
  Sliders,
  RotateCcw,
  Zap,
  ShieldAlert,
  Layers,
  Cpu,
  Flame,
  CheckCircle2,
  Settings2,
  Wrench,
  Compass,
} from "lucide-react";

interface UrdfOptimizerPanelProps {
  currentOptions: OptimizationOptions;
  iterationCount: number;
  onApplyOptimization: (newOptions: OptimizationOptions) => void;
  isGenerating: boolean;
}

export const UrdfOptimizerPanel: React.FC<UrdfOptimizerPanelProps> = ({
  currentOptions,
  iterationCount,
  onApplyOptimization,
  isGenerating,
}) => {
  const [options, setOptions] = useState<OptimizationOptions>(currentOptions);
  const [customNote, setCustomNote] = useState<string>("");

  const presetModes = [
    {
      id: "comprehensive",
      name: "全项综合深度优化 (推荐)",
      desc: "质心、惯性张量、REP-103 轴向、阻尼动力学与碰撞网格全维度精细校准",
      icon: Sparkles,
      color: "text-amber-400 border-amber-500/40 bg-amber-950/30",
    },
    {
      id: "smooth_dynamics",
      name: "动力学阻尼平滑优化",
      desc: "针对电机/舵机驱动特性提升阻尼与摩擦补偿，消除仿真震荡",
      icon: Flame,
      color: "text-cyan-400 border-cyan-500/40 bg-cyan-950/30",
    },
    {
      id: "axis_rectification",
      name: "运动学转轴对齐矫正",
      desc: "自动检测奇异装配面配合，规范化 X前 Y左 Z上 标准坐标系",
      icon: Compass,
      color: "text-purple-400 border-purple-500/40 bg-purple-950/30",
    },
    {
      id: "mesh_decimation",
      name: "碰撞体凸包轻量化",
      desc: "将复杂高模转为紧凑 Convex Hull 凸包，大幅提升 Gazebo/Isaac Sim 帧率",
      icon: Layers,
      color: "text-emerald-400 border-emerald-500/40 bg-emerald-950/30",
    },
    {
      id: "soft_limit",
      name: "安全软限位保护",
      desc: "自动设置安全转动死区缓冲，防止极限位置出现物理干涉",
      icon: ShieldAlert,
      color: "text-rose-400 border-rose-500/40 bg-rose-950/30",
    },
  ];

  const handleSelectMode = (modeId: any) => {
    let updated = { ...options, optimizationMode: modeId };
    if (modeId === "smooth_dynamics") {
      updated.dampingFactor = 2.0;
      updated.frictionFactor = 1.5;
    } else if (modeId === "axis_rectification") {
      updated.autoCorrectAxes = true;
    } else if (modeId === "mesh_decimation") {
      updated.collisionType = "convex_hull";
      updated.meshSimplification = "high";
    } else if (modeId === "soft_limit") {
      updated.limitBufferDeg = 5;
    } else if (modeId === "comprehensive") {
      updated.dampingFactor = 1.2;
      updated.autoCorrectAxes = true;
      updated.enforcePositiveDefiniteInertia = true;
      updated.collisionType = "convex_hull";
      updated.limitBufferDeg = 3;
    }
    setOptions(updated);
  };

  const handleTriggerRegeneration = () => {
    onApplyOptimization({
      ...options,
      customPromptNotes: customNote,
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5">
      {/* Header & Iteration Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>内置程序优化调优引擎 (Auto-Optimizer)</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
                当前迭代: 第 {iterationCount} 轮
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              若对当前生成的 URDF 不满意，可选择优化策略或微调物理量，内置程序将持续优化至您满意为止
            </p>
          </div>
        </div>

        {/* Big Regenerate Button */}
        <button
          onClick={handleTriggerRegeneration}
          disabled={isGenerating}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isGenerating ? (
            <RotateCcw className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-300" />
          )}
          <span>{isGenerating ? "正在执行内置程序优化..." : "启动内置程序优化并重新生成"}</span>
        </button>
      </div>

      {/* Preset Optimization Strategy Cards */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
          <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>选择内置程序优化预设策略:</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {presetModes.map((mode) => {
            const isSelected = options.optimizationMode === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => handleSelectMode(mode.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                  isSelected
                    ? "bg-slate-950 border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/40"
                    : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-slate-200">
                      {mode.name}
                    </span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  {mode.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Granular Knobs & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
        {/* Material Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-slate-300 block">
            制造材料与密度
          </label>
          <select
            value={options.materialType}
            onChange={(e) =>
              setOptions({ ...options, materialType: e.target.value as any })
            }
            className="w-full bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 rounded-lg p-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="PLA-CF">PLA-CF 碳纤维 (1.25 g/cm³)</option>
            <option value="PA-CF">PA-CF 尼龙碳纤 (1.15 g/cm³)</option>
            <option value="PETG">PETG 高韧性 (1.27 g/cm³)</option>
            <option value="Aluminium 6061">6061-T6 铝合金 (2.70 g/cm³)</option>
            <option value="Titanium">TC4 钛合金 (4.51 g/cm³)</option>
            <option value="TPU">TPU 95A 软胶 (1.21 g/cm³)</option>
            <option value="Steel 304">304 不锈钢 (7.85 g/cm³)</option>
          </select>
        </div>

        {/* Damping Factor */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono text-slate-300">
            <span>动力学阻尼倍率</span>
            <span className="text-cyan-400 font-bold">{options.dampingFactor.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="4.0"
            step="0.1"
            value={options.dampingFactor}
            onChange={(e) =>
              setOptions({ ...options, dampingFactor: parseFloat(e.target.value) })
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-[10px] font-mono text-slate-500 block">
            调大阻尼可抑制关节超调与高速抖动
          </span>
        </div>

        {/* Soft Limit Buffer */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono text-slate-300">
            <span>安全软限位保护带</span>
            <span className="text-cyan-400 font-bold">{options.limitBufferDeg}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            step="1"
            value={options.limitBufferDeg}
            onChange={(e) =>
              setOptions({ ...options, limitBufferDeg: parseInt(e.target.value) })
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-[10px] font-mono text-slate-500 block">
            在 CAD 硬限位内侧自动收缩安全裕量
          </span>
        </div>

        {/* Collision Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-slate-300 block">
            碰撞体网格策略
          </label>
          <select
            value={options.collisionType}
            onChange={(e) =>
              setOptions({ ...options, collisionType: e.target.value as any })
            }
            className="w-full bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 rounded-lg p-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="convex_hull">Convex Hull 紧凑凸包 (推荐)</option>
            <option value="primitive_approx">圆柱/几何包围盒 (极速)</option>
            <option value="mesh">全精度原始网格 Mesh</option>
          </select>
        </div>
      </div>

      {/* User Custom Optimization Prompt */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
          <span>附加针对性优化要求 (可选):</span>
          <span className="text-slate-500 text-[10px]">内置程序将结合参数与自然语言深度调优</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="例如：提升拇指活动灵活性、纠正末端法兰旋转方向、将连杆质量按碳纤材质减重..."
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
          />
          <button
            onClick={handleTriggerRegeneration}
            disabled={isGenerating}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 rounded-xl text-xs font-mono transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>立即重算</span>
          </button>
        </div>
      </div>
    </div>
  );
};
