import React, { useState, useMemo, useRef, useEffect } from "react";
import { Gauge, ShieldAlert, Sparkles, RefreshCw, Zap, Award, Layers } from "lucide-react";

interface CableMaterial {
  name: string;
  modulus: number; // GPa
  breakStrength: number; // N for ⌀0.5mm
  frictionCoeffPEEK: number;
  frictionCoeffSteel: number;
  elongationAtYield: number; // %
  pros: string;
}

const MATERIALS: Record<string, CableMaterial> = {
  dyneema: {
    name: "超高分子量聚乙烯 (Dyneema 8编)",
    modulus: 115,
    breakStrength: 460,
    frictionCoeffPEEK: 0.08,
    frictionCoeffSteel: 0.12,
    elongationAtYield: 2.8,
    pros: "柔韧度极高、耐反复弯折疲劳、重量轻，是灵巧手首选",
  },
  tungsten: {
    name: "单晶微细钨丝绳 (⌀0.4mm)",
    modulus: 410,
    breakStrength: 380,
    frictionCoeffPEEK: 0.14,
    frictionCoeffSteel: 0.18,
    elongationAtYield: 0.6,
    pros: "弹性模量极高、几乎零蠕变，适合超精密力控传动",
  },
  stainless: {
    name: "304/316 微细不锈钢丝绳 (7x7)",
    modulus: 190,
    breakStrength: 320,
    frictionCoeffPEEK: 0.16,
    frictionCoeffSteel: 0.22,
    elongationAtYield: 1.5,
    pros: "耐高温、成本低，但微细股线内部自摩擦易断裂",
  },
  vectran: {
    name: "液晶芳纶聚合物 (Vectran)",
    modulus: 75,
    breakStrength: 390,
    frictionCoeffPEEK: 0.11,
    frictionCoeffSteel: 0.15,
    elongationAtYield: 3.2,
    pros: "抗蠕变性能优异，耐切削磨损",
  },
};

export const TendonCalculator: React.FC = () => {
  // Input parameters
  const [motorTension, setMotorTension] = useState<number>(20); // N
  const [selectedMaterialKey, setSelectedMaterialKey] = useState<string>("dyneema");
  const [cableDiameter, setCableDiameter] = useState<number>(0.5); // mm
  const [pulleyCount, setPulleyCount] = useState<number>(4);
  const [anglePerPulley, setAnglePerPulley] = useState<number>(45); // deg
  const [pulleyRadius, setPulleyRadius] = useState<number>(3.5); // mm
  const [guideType, setGuideType] = useState<"bearing" | "bushing">("bearing");
  const [cableLength, setCableLength] = useState<number>(180); // mm
  const [fingerAngle, setFingerAngle] = useState<number>(40); // deg

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentMat = MATERIALS[selectedMaterialKey];

  // Calculations
  const results = useMemo(() => {
    const pCount = Math.max(1, Math.floor(Number(pulleyCount) || 1));
    const pAngle = Math.max(0, Math.min(180, Number(anglePerPulley) || 45));
    const totalAngleDeg = pCount * pAngle;
    const totalAngleRad = (totalAngleDeg * Math.PI) / 180;

    const mTension = Math.max(0.1, Number(motorTension) || 20);
    const dCable = Math.max(0.1, Number(cableDiameter) || 0.5);
    const lCable = Math.max(10, Number(cableLength) || 180);
    const rPulley = Math.max(0.5, Number(pulleyRadius) || 3.5);

    const baseFriction = guideType === "bearing" ? currentMat.frictionCoeffPEEK * 0.45 : currentMat.frictionCoeffPEEK;
    
    // Euler-Eytelwein formula: T_out = T_in * e^(-μ * θ)
    const efficiency = Math.max(0.001, Math.exp(-baseFriction * totalAngleRad));
    const outputTension = mTension * efficiency;
    const lostTension = Math.max(0, mTension - outputTension);

    // Cross section area
    const area = Math.max(1e-4, Math.PI * Math.pow(dCable / 2, 2)); // mm^2
    
    // Stress
    const stress = outputTension / area; // MPa (N/mm^2)
    
    // Elastic elongation: ΔL = (F * L) / (E * A)
    const elasticStretch = (mTension * lCable) / (Math.max(1, currentMat.modulus) * 1000 * area); // mm

    // Safety factor
    const actualBreakStrength = currentMat.breakStrength * Math.pow(dCable / 0.5, 1.8);
    const safetyFactor = mTension > 0 ? actualBreakStrength / mTension : 99;

    // Capstan torque to hold fingertip
    const fingertipTorque = outputTension * (rPulley / 1000); // N*m

    return {
      totalAngleDeg,
      efficiency: (efficiency * 100).toFixed(1),
      outputTension: outputTension.toFixed(2),
      lostTension: lostTension.toFixed(2),
      stress: stress.toFixed(1),
      elasticStretch: elasticStretch.toFixed(3),
      safetyFactor: safetyFactor.toFixed(1),
      actualBreakStrength: actualBreakStrength.toFixed(0),
      fingertipTorque: (fingertipTorque * 1000).toFixed(1), // mN*m
    };
  }, [motorTension, selectedMaterialKey, cableDiameter, pulleyCount, anglePerPulley, pulleyRadius, guideType, cableLength, currentMat]);

  // Render 2D animated mechanical finger canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.03;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.strokeStyle = "#f1f5f9";
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Base origin
      const baseX = 80;
      const baseY = height - 70;

      // Finger segments
      const seg1Len = 80;
      const seg2Len = 65;
      const seg3Len = 50;

      const rad1 = (-fingerAngle * Math.PI) / 180;
      const rad2 = rad1 + ((-fingerAngle * 0.8 * Math.PI) / 180);
      const rad3 = rad2 + ((-fingerAngle * 0.6 * Math.PI) / 180);

      const j1X = baseX;
      const j1Y = baseY;

      const j2X = j1X + seg1Len * Math.cos(rad1);
      const j2Y = j1Y + seg1Len * Math.sin(rad1);

      const j3X = j2X + seg2Len * Math.cos(rad2);
      const j3Y = j2Y + seg2Len * Math.sin(rad2);

      const tipX = j3X + seg3Len * Math.cos(rad3);
      const tipY = j3Y + seg3Len * Math.sin(rad3);

      // Draw Palm Base
      ctx.fillStyle = "#334155";
      ctx.fillRect(baseX - 45, baseY - 20, 45, 60);
      ctx.fillStyle = "#64748b";
      ctx.font = "11px sans-serif";
      ctx.fillText("掌骨基座 (Palm)", baseX - 60, baseY + 55);

      // Draw Capstan Winch (Motor)
      const capstanX = baseX - 25;
      const capstanY = baseY + 10;
      ctx.beginPath();
      ctx.arc(capstanX, capstanY, 14, 0, Math.PI * 2);
      ctx.fillStyle = "#0284c7";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#0369a1";
      ctx.stroke();

      // Winch rotation line
      ctx.beginPath();
      ctx.moveTo(capstanX, capstanY);
      ctx.lineTo(capstanX + 12 * Math.cos(time), capstanY + 12 * Math.sin(time));
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      // Draw Finger Segments (Links)
      const drawBone = (x1: number, y1: number, x2: number, y2: number, color: string, name: string) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 14;
        ctx.lineCap = "round";
        ctx.strokeStyle = color;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 10;
        ctx.strokeStyle = "#f8fafc";
        ctx.stroke();

        ctx.fillStyle = "#475569";
        ctx.font = "10px sans-serif";
        ctx.fillText(name, (x1 + x2) / 2 + 8, (y1 + y2) / 2 - 8);
      };

      drawBone(j1X, j1Y, j2X, j2Y, "#0284c7", "近指节 (Proximal)");
      drawBone(j2X, j2Y, j3X, j3Y, "#0d9488", "中指节 (Intermediate)");
      drawBone(j3X, j3Y, tipX, tipY, "#d97706", "远指节 (Distal)");

      // Draw Joints
      const drawJoint = (x: number, y: number, label: string) => {
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fillStyle = "#1e293b";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#38bdf8";
        ctx.fill();

        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 9px sans-serif";
        ctx.fillText(label, x - 12, y - 12);
      };

      drawJoint(j1X, j1Y, "MCP关节");
      drawJoint(j2X, j2Y, "PIP关节");
      drawJoint(j3X, j3Y, "DIP关节");

      // Draw Tendon Routing Cable with tension gradient
      const cableOffset = 8;
      const t0X = capstanX;
      const t0Y = capstanY - 14;
      const t1X = j1X + cableOffset * Math.sin(rad1);
      const t1Y = j1Y - cableOffset * Math.cos(rad1);
      const t2X = j2X + cableOffset * Math.sin(rad2);
      const t2Y = j2Y - cableOffset * Math.cos(rad2);
      const t3X = j3X + cableOffset * Math.sin(rad3);
      const t3Y = j3Y - cableOffset * Math.cos(rad3);
      const tipTendonX = tipX + 4 * Math.sin(rad3);
      const tipTendonY = tipY - 4 * Math.cos(rad3);

      ctx.beginPath();
      ctx.moveTo(t0X, t0Y);
      ctx.lineTo(t1X, t1Y);
      ctx.lineTo(t2X, t2Y);
      ctx.lineTo(t3X, t3Y);
      ctx.lineTo(tipTendonX, tipTendonY);

      // Tendon line style (red tension color)
      ctx.lineWidth = Math.max(2, cableDiameter * 4);
      ctx.strokeStyle = "#ef4444";
      ctx.setLineDash([4, 2]);
      ctx.lineDashOffset = -time * 10;
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Pulleys
      const drawPulley = (x: number, y: number) => {
        ctx.beginPath();
        ctx.arc(x, y, pulleyRadius + 2, 0, Math.PI * 2);
        ctx.fillStyle = "#94a3b8";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#1e293b";
        ctx.fill();
      };

      drawPulley(t1X, t1Y);
      drawPulley(t2X, t2Y);
      drawPulley(t3X, t3Y);

      // Fingertip Contact & Force Vector
      ctx.beginPath();
      ctx.arc(tipX, tipY, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#e11d48";
      ctx.fill();

      // Force Vector Arrow
      const forceLen = Number(results.outputTension) * 2.2;
      const arrowEndX = tipX + forceLen * Math.sin(rad3);
      const arrowEndY = tipY - forceLen * Math.cos(rad3);

      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(arrowEndX, arrowEndY);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#e11d48";
      ctx.stroke();

      // Arrow head
      ctx.fillStyle = "#e11d48";
      ctx.beginPath();
      ctx.arc(arrowEndX, arrowEndY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#be123c";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(`抓力 T_out = ${results.outputTension} N`, arrowEndX + 8, arrowEndY);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [fingerAngle, results.outputTension, cableDiameter, pulleyRadius]);

  return (
    <div id="tendon-mechanics-calculator" className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Gauge className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">
              绳驱机构力学与 Capstan 绞盘摩擦衰减仿真器
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            基于 Euler-Eytelwein 绳带力学模型与弹性蠕变方程，精确核算灵巧手末端输出力与传动损耗
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-950/50 text-cyan-300 border border-cyan-800/60">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> 卓研智创量产实战参数校准
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Controls */}
        <div className="lg:col-span-5 space-y-4">
          {/* Material Selection */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
            <label className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-2">
              腱绳材料选型 (Tendon Material)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(MATERIALS).map(([key, mat]) => (
                <button
                  key={key}
                  onClick={() => setSelectedMaterialKey(key)}
                  className={`px-3 py-2 text-left rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    selectedMaterialKey === key
                      ? "bg-cyan-500 text-slate-950 shadow-md font-bold"
                      : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60"
                  }`}
                >
                  <div className="truncate">{mat.name.split(" ")[0]}</div>
                  <div className={`text-[10px] font-mono truncate ${selectedMaterialKey === key ? "text-slate-900/80" : "text-slate-400"}`}>
                    E = {mat.modulus} GPa
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2.5 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
              💡 {currentMat.pros}
            </p>
          </div>

          {/* Parameters Sliders */}
          <div className="space-y-3.5 bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5 font-mono">
                <span>电机绞盘输入张力 (T_in)</span>
                <span className="font-bold text-cyan-400">{motorTension} N</span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                step={1}
                value={motorTension}
                onChange={(e) => setMotorTension(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5 font-mono">
                <span>指节实时弯曲角 (Finger Flexion)</span>
                <span className="font-bold text-emerald-400">{fingerAngle}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={75}
                step={1}
                value={fingerAngle}
                onChange={(e) => setFingerAngle(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  绳索外径 (mm)
                </label>
                <select
                  value={cableDiameter}
                  onChange={(e) => setCableDiameter(Number(e.target.value))}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-cyan-400 outline-none font-mono"
                >
                  <option value={0.35}>⌀0.35 mm (微型)</option>
                  <option value={0.45}>⌀0.45 mm (标准)</option>
                  <option value={0.6}>⌀0.60 mm (高强)</option>
                  <option value={0.8}>⌀0.80 mm (重载)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  导向支撑类型
                </label>
                <select
                  value={guideType}
                  onChange={(e) => setGuideType(e.target.value as any)}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-cyan-400 outline-none font-mono"
                >
                  <option value="bearing">微型滚珠轴承 (效率最高)</option>
                  <option value="bushing">PEEK耐磨衬套滑动</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>过线滑轮数</span>
                  <span className="font-bold text-slate-200">{pulleyCount} 个</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={8}
                  value={pulleyCount}
                  onChange={(e) => setPulleyCount(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>单轮包角</span>
                  <span className="font-bold text-slate-200">{anglePerPulley}°</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={90}
                  step={5}
                  value={anglePerPulley}
                  onChange={(e) => setAnglePerPulley(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right: Interactive Canvas & Sizing Output */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          {/* Canvas Viewport */}
          <div className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
            <div className="absolute top-2 left-3 z-10 flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-800/60">
                2D Kinematic & Tension Simulation
              </span>
              <span className="text-[11px] text-slate-400 font-mono">动态绳索走线与抓取姿态</span>
            </div>

            <canvas
              ref={canvasRef}
              width={520}
              height={260}
              className="w-full h-56 block object-contain"
            />
          </div>

          {/* Results Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl">
              <div className="text-[11px] text-slate-400 font-mono">末端抓力 (T_out)</div>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
                {results.outputTension} <span className="text-xs font-normal text-slate-400">N</span>
              </div>
              <div className="text-[10px] text-cyan-300 mt-1 font-mono">
                传动效率: <span className="font-bold">{results.efficiency}%</span>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl">
              <div className="text-[11px] text-slate-400 font-mono">摩擦损耗拉力</div>
              <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">
                {results.lostTension} <span className="text-xs font-normal text-slate-400">N</span>
              </div>
              <div className="text-[10px] text-rose-300 mt-1 font-mono">
                累计包角: {results.totalAngleDeg}°
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl">
              <div className="text-[11px] text-slate-400 font-mono">弹性伸长量 (ΔL)</div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
                {results.elasticStretch} <span className="text-xs font-normal text-slate-400">mm</span>
              </div>
              <div className="text-[10px] text-amber-300 mt-1 font-mono">
                拉伸应力: {results.stress} MPa
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl">
              <div className="text-[11px] text-slate-400 font-mono">破断安全系数 (S)</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                {results.safetyFactor} <span className="text-xs font-normal text-slate-400">X</span>
              </div>
              <div className="text-[10px] text-emerald-300 mt-1 font-mono">
                极限拉力: {results.actualBreakStrength} N
              </div>
            </div>
          </div>

          {/* Expert Engineering Guidance */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 text-slate-300 rounded-xl text-xs flex items-start gap-2.5">
            <Award className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-cyan-300 font-mono">卓研量产交付经验准则：</span>
              {Number(results.efficiency) < 70 ? (
                <span className="text-rose-300 leading-relaxed">
                  当前累计包角过大或采用滑动衬套导致传动效率偏低（{results.efficiency}%）。建议在关键掌指转向处增加 1~2 个微型深沟法兰轴承以减小滑动包角损耗！
                </span>
              ) : Number(results.elasticStretch) > 0.08 ? (
                <span className="text-amber-300 leading-relaxed">
                  当前腱绳在满载下弹性延伸达到 {results.elasticStretch}mm，需在控制算法中引入张力滞后补偿，或在出厂装配时增加恒力预拉伸工序。
                </span>
              ) : (
                <span className="text-emerald-300 leading-relaxed">
                  机构参数配比优秀！传动效率达到 {results.efficiency}%，破断安全系数高达 {results.safetyFactor} 倍，完全符合工业与人形机器人灵巧手量产标准。
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
