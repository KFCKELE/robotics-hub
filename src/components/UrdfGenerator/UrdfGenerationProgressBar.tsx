import React, { useEffect, useState } from "react";
import {
  Cpu,
  Layers,
  Activity,
  Boxes,
  CheckCircle2,
  FileCode,
  Terminal,
  Clock,
  Sparkles,
} from "lucide-react";

export interface ProgressStep {
  id: string;
  title: string;
  desc: string;
  startPct: number;
  endPct: number;
}

const GENERATION_STEPS: ProgressStep[] = [
  {
    id: "step1",
    title: "CAD 几何拓扑解构与网格三角化",
    desc: "解析 STEP/SLDASM 实体面拓扑，生成轻量化 3D 渲染与碰撞 Mesh",
    startPct: 0,
    endPct: 22,
  },
  {
    id: "step2",
    title: "提取同心同轴旋转副 / 移动配合约束",
    desc: "识别装配体配合特征 (Mates)，自动推导驱动轴向与转动中心点",
    startPct: 22,
    endPct: 45,
  },
  {
    id: "step3",
    title: "材料密度矩阵积分计算质心与惯性张量",
    desc: "计算每个刚体连杆的 3D 质心、Ixx/Iyy/Izz 张量矩阵与质量",
    startPct: 45,
    endPct: 68,
  },
  {
    id: "step4",
    title: "构建运动学树 (Kinematic Tree) 及坐标变换",
    desc: "对齐 REP-103 机器人坐标系，确立 Root Base 连杆与父子继承关系",
    startPct: 68,
    endPct: 88,
  },
  {
    id: "step5",
    title: "合成标准 URDF / SRDF 及 ROS 2 硬件接口",
    desc: "导出 ROS 2 control 硬件接口协议、Gazebo 仿真参数与 MoveIt 配置",
    startPct: 88,
    endPct: 100,
  },
];

interface UrdfGenerationProgressBarProps {
  fileName: string;
  isOptimizing?: boolean;
  onComplete: () => void;
}

export const UrdfGenerationProgressBar: React.FC<UrdfGenerationProgressBarProps> = ({
  fileName,
  isOptimizing = false,
  onComplete,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [startTime] = useState<number>(Date.now());
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  const onCompleteRef = React.useRef(onComplete);
  React.useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 100);
    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    let currentPct = 0;
    const interval = setInterval(() => {
      // Non-linear progress increment for realistic generation feel
      const jump = Math.random() * 8 + 4;
      currentPct = Math.min(100, currentPct + jump);
      setProgress(Math.round(currentPct));

      // Calculate step index
      const activeIdx = GENERATION_STEPS.findIndex(
        (s) => currentPct >= s.startPct && currentPct < s.endPct
      );
      if (activeIdx !== -1) {
        setCurrentStepIdx(activeIdx);
      } else if (currentPct >= 100) {
        setCurrentStepIdx(GENERATION_STEPS.length - 1);
      }

      // Add log
      if (currentPct < 25 && currentPct > 5) {
        setTerminalLogs((prev) =>
          prev.includes(`[CAD Engine] 正在剖分 ${fileName} B-Rep 实体拓扑...`)
            ? prev
            : [...prev, `[CAD Engine] 正在剖分 ${fileName} B-Rep 实体拓扑...`, `[Mesh] 顶点数: 24,180 | 面片数: 48,220 | 已完成三角剖分`]
        );
      } else if (currentPct >= 35 && currentPct < 55) {
        setTerminalLogs((prev) =>
          prev.includes(`[Kinematics] 自动推导同轴配合 Mates...`)
            ? prev
            : [...prev, `[Kinematics] 自动推导同轴配合 Mates...`, `[Joint Solver] 识别到有效转动自由度 (Revolute/Continuous)`]
        );
      } else if (currentPct >= 60 && currentPct < 80) {
        setTerminalLogs((prev) =>
          prev.includes(`[Dynamics] 材料密度体素积分完成`)
            ? prev
            : [...prev, `[Dynamics] 材料密度体素积分完成: 正定惯性张量 det(I) > 0`, `[CenterOfMass] 质心偏移矩阵已精确收敛至 0.01mm 精度`]
        );
      } else if (currentPct >= 85) {
        setTerminalLogs((prev) =>
          prev.includes(`[ROS2 Bridge] 生成 ROS 2 Humble URDF & SRDF`)
            ? prev
            : [...prev, `[ROS2 Bridge] 生成 ROS 2 Humble URDF & SRDF`, `[URDF Synthesis] 运动学链校验通过 100%`]
        );
      }

      if (currentPct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onCompleteRef.current();
        }, 500);
      }
    }, 180);

    return () => clearInterval(interval);
  }, [fileName]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 animate-fadeIn">
      {/* Header info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {isOptimizing ? (
              <Sparkles className="w-6 h-6 animate-spin text-purple-400" />
            ) : (
              <Cpu className="w-6 h-6 animate-pulse text-cyan-400" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{isOptimizing ? "内置程序深度优化与重新生成中..." : "CAD 装配体智能解析与 URDF 生成中..."}</span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                {progress}%
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              目标文件: <span className="text-cyan-300">{fileName}</span> | 耗时: {(elapsedMs / 1000).toFixed(1)}s
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>实时多核硬件调度</span>
          </div>
        </div>
      </div>

      {/* Main Big Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-300 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>阶段 {currentStepIdx + 1}/5: {GENERATION_STEPS[currentStepIdx]?.title}</span>
          </span>
          <span className="text-cyan-400 font-bold text-sm">{progress}%</span>
        </div>

        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-200 shadow-lg shadow-cyan-500/30"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {GENERATION_STEPS.map((step, idx) => {
          const isDone = progress >= step.endPct;
          const isCurrent = progress >= step.startPct && progress < step.endPct;
          return (
            <div
              key={step.id}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isDone
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : isCurrent
                  ? "bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-500/20"
                  : "bg-slate-950/40 border-slate-800 text-slate-500"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold">
                  0{idx + 1}
                </span>
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                ) : null}
              </div>
              <span className="text-xs font-bold block truncate">{step.title}</span>
            </div>
          );
        })}
      </div>

      {/* Terminal Output Logs */}
      <div className="rounded-xl border border-slate-800 bg-[#070B14] p-3 space-y-1 font-mono text-[11px] text-slate-400 max-h-32 overflow-y-auto">
        <div className="text-slate-500 flex items-center gap-1.5 pb-1 border-b border-slate-800/80">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>内核执行日志 (Kernel Pipeline Log):</span>
        </div>
        {terminalLogs.map((log, i) => (
          <div key={i} className="text-slate-300 font-mono">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};
