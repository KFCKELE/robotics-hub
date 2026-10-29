import React, { useState, useMemo } from "react";
import { Cpu, Activity, Zap, CheckCircle2, TrendingUp, AlertOctagon } from "lucide-react";

interface ReducerModel {
  name: string;
  ratio: number;
  ratedTorque: number; // N*m
  peakTorque: number; // N*m
  stiffness: number; // N*m/rad (K)
  mass: number; // kg
  cost: string;
}

const REDUCERS: Record<string, ReducerModel> = {
  csf_17_100: {
    name: "超薄谐波减速机 17型 (速比 1:100)",
    ratio: 100,
    ratedTorque: 39,
    peakTorque: 84,
    stiffness: 1.2e4,
    mass: 0.38,
    cost: "¥1,350",
  },
  csf_20_100: {
    name: "标准谐波减速机 20型 (速比 1:100)",
    ratio: 100,
    ratedTorque: 58,
    peakTorque: 125,
    stiffness: 1.8e4,
    mass: 0.58,
    cost: "¥1,600",
  },
  csf_25_120: {
    name: "重载谐波减速机 25型 (速比 1:120)",
    ratio: 120,
    ratedTorque: 95,
    peakTorque: 215,
    stiffness: 3.1e4,
    mass: 0.95,
    cost: "¥2,100",
  },
};

export const CobotJointCalculator: React.FC = () => {
  const [selectedReducerKey, setSelectedReducerKey] = useState<string>("csf_20_100");
  const [armLength, setArmLength] = useState<number>(0.45); // m (Link length)
  const [payloadMass, setPayloadMass] = useState<number>(3.5); // kg (Payload at end)
  const [linkMass, setLinkMass] = useState<number>(2.0); // kg (Arm link structure mass)
  const [maxAngularAcc, setMaxAngularAcc] = useState<number>(12); // rad/s^2 (α)
  const [maxAngularVel, setMaxAngularVel] = useState<number>(3.14); // rad/s (180 deg/s)
  const [housingRibStiffness, setHousingRibStiffness] = useState<"normal" | "reinforced">("reinforced");

  const currentReducer = REDUCERS[selectedReducerKey];

  const results = useMemo(() => {
    const L = Math.max(0.05, Number(armLength) || 0.45);
    const mPayload = Math.max(0, Number(payloadMass) || 0);
    const mLink = Math.max(0.05, Number(linkMass) || 2.0);
    const acc = Math.max(0.1, Number(maxAngularAcc) || 12);

    // 1. Equivalent Load Inertia (J_load):
    const J_link = (1 / 3) * mLink * Math.pow(L, 2);
    const J_payload = mPayload * Math.pow(L, 2);
    const J_total = Math.max(1e-5, J_link + J_payload); // kg*m^2

    // 2. Torques:
    const g = 9.81;
    const T_gravity = (mPayload * L + (mLink * L) / 2) * g; // N*m

    // Dynamic acceleration torque: T_acc = J_total * α
    const T_acc = J_total * acc; // N*m

    // Friction & safety margin (15%):
    const T_dynamic_total = (T_gravity + T_acc) * 1.15; // N*m

    // Motor required torque (at motor shaft):
    const ratio = currentReducer?.ratio || 100;
    const T_motor = T_dynamic_total / (ratio * 0.75); // 75% efficiency

    // 3. Torsional Stiffness & Natural Frequency (fn):
    const housingMultiplier = housingRibStiffness === "reinforced" ? 1.4 : 0.85;
    const K_eff = Math.max(100, (currentReducer?.stiffness || 1.8e4) * housingMultiplier); // N*m/rad

    // fn = (1 / 2π) * sqrt(K_eff / J_total)
    const naturalFrequency = Math.max(0.1, (1 / (2 * Math.PI)) * Math.sqrt(K_eff / J_total)); // Hz

    // Dynamic settling time to 2% residual vibration (assuming damping ratio ζ = 0.08):
    const zeta = 0.08;
    const settlingTime = (4 / (zeta * 2 * Math.PI * naturalFrequency)) * 1000; // ms

    // Reducer Load Ratio
    const ratedTorque = currentReducer?.ratedTorque || 58;
    const peakTorque = currentReducer?.peakTorque || 125;
    const torqueLoadRatio = (T_dynamic_total / ratedTorque) * 100;
    const isOverTorque = T_dynamic_total > peakTorque;
    const isWarningTorque = T_dynamic_total > ratedTorque;

    // Resonant band warning (usually 10-25 Hz causes severe control oscillations with servo velocity loops)
    const isResonantDanger = naturalFrequency < 22;

    return {
      J_total: J_total.toFixed(4),
      T_gravity: T_gravity.toFixed(1),
      T_acc: T_acc.toFixed(1),
      T_dynamic_total: T_dynamic_total.toFixed(1),
      T_motor: (T_motor * 1000).toFixed(0), // mN*m
      naturalFrequency: naturalFrequency.toFixed(1),
      settlingTime: settlingTime.toFixed(0),
      torqueLoadRatio: torqueLoadRatio.toFixed(0),
      isOverTorque,
      isWarningTorque,
      isResonantDanger,
    };
  }, [selectedReducerKey, armLength, payloadMass, linkMass, maxAngularAcc, housingRibStiffness, currentReducer]);

  return (
    <div id="cobot-joint-stiffness-calculator" className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">
              协作机器人关节刚度、谐波减速器选型与一阶模态动态仿真
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            核算重力矩、角加速度惯性矩、谐波刚度及关节一阶固有共振频率，精准消除机械臂启停残余抖动
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
          <TrendingUp className="w-3.5 h-3.5" /> 卓研协作臂模态优化方案复用
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <label className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-2">
              谐波减速机型号 (Harmonic Drive)
            </label>
            <div className="space-y-1.5">
              {Object.entries(REDUCERS).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setSelectedReducerKey(key)}
                  className={`w-full px-3 py-2 text-left rounded-lg text-xs transition-all cursor-pointer ${
                    selectedReducerKey === key
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm font-semibold"
                      : "bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  <div className="flex justify-between font-medium">
                    <span>{item.name}</span>
                    <span className={`font-mono ${selectedReducerKey === key ? "text-cyan-300" : "text-cyan-400"}`}>{item.cost}</span>
                  </div>
                  <div className={`text-[10px] font-mono mt-0.5 ${selectedReducerKey === key ? "text-cyan-400" : "text-slate-500"}`}>
                    额定扭矩: {item.ratedTorque} N·m | 刚度 K = {item.stiffness.toExponential(1)} N·m/rad
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>末端有效负载</span>
                  <span className="font-bold text-cyan-400">{payloadMass} kg</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={10.0}
                  step={0.5}
                  value={payloadMass}
                  onChange={(e) => setPayloadMass(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>臂杆悬臂长</span>
                  <span className="font-bold text-cyan-400">{armLength * 1000} mm</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={0.9}
                  step={0.05}
                  value={armLength}
                  onChange={(e) => setArmLength(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>角加速度</span>
                  <span className="font-bold text-slate-200">{maxAngularAcc} rad/s²</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={25}
                  step={1}
                  value={maxAngularAcc}
                  onChange={(e) => setMaxAngularAcc(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  壳体拓扑筋板刚度
                </label>
                <select
                  value={housingRibStiffness}
                  onChange={(e) => setHousingRibStiffness(e.target.value as any)}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono outline-none focus:border-cyan-400"
                >
                  <option value="reinforced">螺旋交错加强筋 (高刚度+40%)</option>
                  <option value="normal">传统圆筒等厚壁 (普通刚度)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Dashboard */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
              <div className="text-[11px] text-slate-400 font-mono">总动态峰值力矩</div>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
                {results.T_dynamic_total} <span className="text-xs font-normal text-slate-400">N·m</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                静重力矩: {results.T_gravity} N·m
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
              <div className="text-[11px] text-slate-400 font-mono">一阶固有共振频率</div>
              <div className={`text-xl font-bold font-mono mt-0.5 ${results.isResonantDanger ? "text-rose-400" : "text-emerald-400"}`}>
                {results.naturalFrequency} <span className="text-xs font-normal">Hz</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                安全带宽: &gt; 24 Hz
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
              <div className="text-[11px] text-slate-400 font-mono">残余抖动衰减时间</div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
                {results.settlingTime} <span className="text-xs font-normal text-slate-400">ms</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                转动惯量 J: {results.J_total} kg·m²
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
              <div className="text-[11px] text-slate-400 font-mono">无框电机端扭矩</div>
              <div className="text-xl font-bold font-mono text-slate-200 mt-0.5">
                {results.T_motor} <span className="text-xs font-normal text-slate-400">mN·m</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                减速比: 1:{currentReducer.ratio}
              </div>
            </div>
          </div>

          {/* Dynamic Settling Chart Simulation (SVG) */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-slate-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-mono text-cyan-400">
                关节启停末端残余振动时域衰减响应 (Step Response)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                fn = {results.naturalFrequency} Hz | 周期 = {results.settlingTime} ms
              </span>
            </div>

            <div className="relative h-28 w-full">
              <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                {/* Target line */}
                <line x1="0" y1="50" x2="400" y2="50" stroke="#475569" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="0" y1="44" x2="400" y2="44" stroke="#059669" strokeDasharray="2 2" strokeWidth="0.8" opacity="0.6" />
                <line x1="0" y1="56" x2="400" y2="56" stroke="#059669" strokeDasharray="2 2" strokeWidth="0.8" opacity="0.6" />

                {/* Oscillating curve */}
                {(() => {
                  const points: string[] = [];
                  const fn = Number(results.naturalFrequency);
                  const damping = housingRibStiffness === "reinforced" ? 0.12 : 0.06;
                  for (let x = 0; x <= 400; x += 2) {
                    const t = (x / 400) * 0.5; // 0 to 0.5 seconds
                    const amp = 40 * Math.exp(-damping * 2 * Math.PI * fn * t) * Math.cos(2 * Math.PI * fn * t);
                    const y = 50 - amp;
                    points.push(`${x},${y.toFixed(1)}`);
                  }
                  return (
                    <polyline
                      fill="none"
                      stroke={results.isResonantDanger ? "#f43f5e" : "#06b6d4"}
                      strokeWidth="2"
                      points={points.join(" ")}
                    />
                  );
                })()}
              </svg>
            </div>
          </div>

          {/* Sizing Conclusion */}
          <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-cyan-300 font-mono">协作臂结构选型结论：</span>
              {results.isOverTorque ? (
                <span className="text-rose-300 font-medium">
                  当前加速峰值力矩 ({results.T_dynamic_total} N·m) 已经超过谐波减速机的允许瞬间最大转矩 ({currentReducer.peakTorque} N·m)！必须升级至更大号减速机，否则加速时极易发生柔轮断齿！
                </span>
              ) : results.isResonantDanger ? (
                <span className="text-amber-300">
                  一阶固有频率为 {results.naturalFrequency} Hz，落入伺服速度环共振危险区 (15~22Hz)，容易引起高速启停时的剧烈啸叫。建议开启【螺旋加强筋】或对臂杆进行拓扑减重！
                </span>
              ) : (
                <span className="text-emerald-300">
                  一阶固有频率达到 {results.naturalFrequency} Hz，残余抖动在 {results.settlingTime}ms 内迅速收敛，减速机负载率仅为 {results.torqueLoadRatio}%，具备优异的抗振刚度与使用寿命！
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
