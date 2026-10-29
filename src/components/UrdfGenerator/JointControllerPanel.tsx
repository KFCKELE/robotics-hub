import React, { useState, useEffect, useRef } from "react";
import { RobotModel, UrdfJoint } from "./types";
import {
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Activity,
  Hand,
  Layers,
  CheckCircle2,
  Filter,
} from "lucide-react";

interface JointControllerPanelProps {
  robot: RobotModel;
  jointValues: Record<string, number>;
  onJointChange: (jointName: string, value: number) => void;
  onSetAllJoints: (values: Record<string, number>) => void;
  selectedJointName?: string | null;
  onSelectJoint?: (jointName: string | null) => void;
}

export const JointControllerPanel: React.FC<JointControllerPanelProps> = ({
  robot,
  jointValues,
  onJointChange,
  onSetAllJoints,
  selectedJointName,
  onSelectJoint,
}) => {
  const [isPlayingSineWave, setIsPlayingSineWave] = useState<boolean>(false);
  const [sineSpeed, setSineSpeed] = useState<number>(1.0);
  const [fingerFilter, setFingerFilter] = useState<string>("all");
  const [masterCurlVal, setMasterCurlVal] = useState<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  const isBionicHand = robot.category === "bionic_hand" || robot.joints.some((j) => j.name.includes("finger") || j.name.includes("thumb"));

  // Dynamic Jogger / Sine Wave Animation Loop
  useEffect(() => {
    if (!isPlayingSineWave) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const step = () => {
      timeRef.current += 0.03 * sineSpeed;
      const newVals: Record<string, number> = {};

      robot.joints.forEach((joint, idx) => {
        if (joint.type === "fixed") return;
        const mid = (joint.limits.upper + joint.limits.lower) / 2;
        const amp = (joint.limits.upper - joint.limits.lower) * 0.42;
        const phase = idx * 0.35;
        newVals[joint.name] = mid + amp * Math.sin(timeRef.current + phase);
      });

      onSetAllJoints(newVals);
      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlayingSineWave, sineSpeed, robot]);

  // Smoothly interpolate to preset pose
  const applyPresetPose = (poseValues: Record<string, number>) => {
    setIsPlayingSineWave(false);
    const startValues = { ...jointValues };
    const duration = 400; // ms
    const startTime = performance.now();

    const animateTransition = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      const currentStepValues: Record<string, number> = {};
      robot.joints.forEach((joint) => {
        const start = startValues[joint.name] ?? 0;
        const target = poseValues[joint.name] ?? 0;
        currentStepValues[joint.name] = start + (target - start) * ease;
      });

      onSetAllJoints(currentStepValues);

      if (progress < 1) {
        requestAnimationFrame(animateTransition);
      }
    };

    requestAnimationFrame(animateTransition);
  };

  const handleResetAllZero = () => {
    setIsPlayingSineWave(false);
    setMasterCurlVal(0);
    const zeroVals: Record<string, number> = {};
    robot.joints.forEach((j) => (zeroVals[j.name] = 0));
    applyPresetPose(zeroVals);
  };

  const handleRandomizePose = () => {
    setIsPlayingSineWave(false);
    const randomVals: Record<string, number> = {};
    robot.joints.forEach((j) => {
      if (j.type === "fixed") return;
      const lower = j.limits.lower;
      const upper = j.limits.upper;
      randomVals[j.name] = lower + Math.random() * (upper - lower);
    });
    applyPresetPose(randomVals);
  };

  // Master Hand Synergy Curl Slider
  const handleMasterCurlChange = (ratio: number) => {
    setIsPlayingSineWave(false);
    setMasterCurlVal(ratio);
    const newVals: Record<string, number> = { ...jointValues };

    robot.joints.forEach((j) => {
      if (j.type === "fixed") return;
      if (j.name.includes("thumb")) {
        if (j.name.includes("abduction")) newVals[j.name] = 0.4 * ratio;
        else if (j.name.includes("opposition")) newVals[j.name] = 1.0 * ratio;
        else newVals[j.name] = 1.2 * ratio;
      } else {
        // Finger joints (MCP, PIP, DIP)
        newVals[j.name] = 1.4 * ratio;
      }
    });

    onSetAllJoints(newVals);
  };

  // Filter joints based on category
  const filteredJoints = robot.joints.filter((j) => {
    if (j.type === "fixed") return false;
    if (fingerFilter === "all") return true;
    return j.name.toLowerCase().includes(fingerFilter);
  });

  const radToDeg = (rad: number) => Math.round((rad * 180) / Math.PI);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col space-y-4">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>关节运动控制器</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {robot.joints.filter((j) => j.type !== "fixed").length} 驱动轴
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              拖动滑块实时驱动 3D 动力学模型，支持五指协同与动作库
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlayingSineWave(!isPlayingSineWave)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPlayingSineWave
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
            }`}
            title="一键全关节正弦波动态自检巡航"
          >
            {isPlayingSineWave ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlayingSineWave ? "暂停巡航" : "动态自检"}</span>
          </button>

          <button
            onClick={handleResetAllZero}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer"
            title="全部关节归零 (Zero Pose)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>归零</span>
          </button>

          <button
            onClick={handleRandomizePose}
            className="px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer"
            title="随机目标姿态"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>随机</span>
          </button>
        </div>
      </div>

      {/* Hand Synergy Master Slider (When Bionic Hand) */}
      {isBionicHand && (
        <div className="bg-gradient-to-r from-slate-950 via-cyan-950/30 to-slate-950 p-3 rounded-xl border border-cyan-500/30 flex items-center gap-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <Hand className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-cyan-300">五指协同联动:</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={masterCurlVal}
            onChange={(e) => handleMasterCurlChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
          <span className="text-xs font-mono text-cyan-300 font-bold shrink-0">
            {Math.round(masterCurlVal * 100)}%
          </span>
        </div>
      )}

      {/* Preset Posture Buttons */}
      {robot.presetPoses.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Hand className="w-3 h-3 text-cyan-400" />
            <span>动作库姿态预设:</span>
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {robot.presetPoses.map((pose) => (
              <button
                key={pose.name}
                onClick={() => applyPresetPose(pose.jointValues)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 text-left transition-all group cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 block truncate">
                  {pose.name.split(" ")[0]}
                </span>
                <span className="text-[10px] text-slate-400 block truncate font-sans">
                  {pose.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Finger Group Filter Tabs (When Hand Model) */}
      {isBionicHand && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setFingerFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
              fingerFilter === "all"
                ? "bg-cyan-500 text-slate-950 font-bold"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            全部 ({robot.joints.length})
          </button>
          <button
            onClick={() => setFingerFilter("thumb")}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
              fingerFilter === "thumb"
                ? "bg-cyan-500 text-slate-950 font-bold"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            👍 拇指 (4)
          </button>
          <button
            onClick={() => setFingerFilter("index")}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
              fingerFilter === "index"
                ? "bg-cyan-500 text-slate-950 font-bold"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            ☝️ 食指 (3)
          </button>
          <button
            onClick={() => setFingerFilter("middle")}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
              fingerFilter === "middle"
                ? "bg-cyan-500 text-slate-950 font-bold"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            🖕 中指 (3)
          </button>
          <button
            onClick={() => setFingerFilter("ring")}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
              fingerFilter === "ring"
                ? "bg-cyan-500 text-slate-950 font-bold"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            🖖 无名指 (3)
          </button>
          <button
            onClick={() => setFingerFilter("pinky")}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
              fingerFilter === "pinky"
                ? "bg-cyan-500 text-slate-950 font-bold"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            🤙 小指 (3)
          </button>
        </div>
      )}

      {/* Individual Joint Sliders List */}
      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
        {filteredJoints.map((joint) => {
          const val = jointValues[joint.name] ?? joint.currentValue ?? 0;
          const isRevolute = joint.type === "revolute" || joint.type === "continuous";
          const min = joint.limits.lower;
          const max = joint.limits.upper;
          const step = isRevolute ? 0.01 : 0.001;

          const isSelected = selectedJointName === joint.name;

          return (
            <div
              key={joint.id}
              onClick={() => onSelectJoint?.(joint.name)}
              className={`p-2.5 rounded-xl border transition-all ${
                isSelected
                  ? "bg-slate-950 border-cyan-500/60 shadow-lg shadow-cyan-500/10"
                  : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              {/* Joint Header */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {joint.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    {joint.type}
                  </span>
                </div>

                {/* Value & Reset */}
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-xs font-bold text-cyan-300">
                    {isRevolute ? `${radToDeg(val)}° (${val.toFixed(2)} rad)` : `${(val * 1000).toFixed(1)} mm`}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onJointChange(joint.name, 0);
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                    title="归零"
                  >
                    0
                  </button>
                </div>
              </div>

              {/* Slider and Step buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onJointChange(joint.name, Math.max(min, val - (isRevolute ? 0.05 : 0.005)));
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors shrink-0 cursor-pointer"
                  title="递减"
                >
                  -
                </button>

                <div className="relative flex-1 flex items-center">
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={val}
                    onChange={(e) => {
                      setIsPlayingSineWave(false);
                      onJointChange(joint.name, parseFloat(e.target.value));
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
                  />
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onJointChange(joint.name, Math.min(max, val + (isRevolute ? 0.05 : 0.005)));
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors shrink-0 cursor-pointer"
                  title="递增"
                >
                  +
                </button>
              </div>

              {/* Range limit labels */}
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-1">
                <span>
                  {isRevolute ? `${radToDeg(min)}°` : `${(min * 1000).toFixed(0)}mm`}
                </span>
                <span className="text-slate-400">
                  {joint.parentLink} → {joint.childLink}
                </span>
                <span>
                  {isRevolute ? `${radToDeg(max)}°` : `${(max * 1000).toFixed(0)}mm`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
