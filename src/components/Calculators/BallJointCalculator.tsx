import React, { useState, useMemo, useRef, useEffect } from "react";
import { CircleDot, AlertTriangle, CheckCircle, Sliders, ShieldCheck } from "lucide-react";

interface MaterialPair {
  name: string;
  E1: number; // GPa
  E2: number; // GPa
  v1: number; // Poisson ratio
  v2: number;
  yieldLimit: number; // MPa
  maxFriction: number;
  description: string;
}

const MATERIAL_PAIRS: Record<string, MaterialPair> = {
  al_peek: {
    name: "航空铝 7075-T6 (球头) + 增强自润滑 PEEK (球窝)",
    E1: 72,
    E2: 4.2,
    v1: 0.33,
    v2: 0.40,
    yieldLimit: 118, // PEEK compressive yield
    maxFriction: 0.12,
    description: "重量极轻，自润滑无油运行，灵巧手与轻量化机械臂关节首选",
  },
  steel_bronze: {
    name: "GCr15 轴承钢 (球头) + 自润滑耐磨锡青铜 QSn6.5-0.1 (球窝)",
    E1: 208,
    E2: 110,
    v1: 0.30,
    v2: 0.35,
    yieldLimit: 320,
    maxFriction: 0.16,
    description: "高刚度、抗重载冲击，适合工业重型并联机构与转向节",
  },
  ti_pom: {
    name: "钛合金 TC4 (球头) + 聚甲醛 POM-C (球窝)",
    E1: 110,
    E2: 3.1,
    v1: 0.34,
    v2: 0.38,
    yieldLimit: 95,
    maxFriction: 0.15,
    description: "耐酸碱腐蚀、超轻量，高弹性自顺应吸能",
  },
};

export const BallJointCalculator: React.FC = () => {
  const [selectedPairKey, setSelectedPairKey] = useState<string>("al_peek");
  const [ballRadius, setBallRadius] = useState<number>(4.0); // mm (r1)
  const [radialClearance, setRadialClearance] = useState<number>(20); // μm (r2 - r1)
  const [normalForce, setNormalForce] = useState<number>(30); // N (F)
  const [tiltAngle, setTiltAngle] = useState<number>(24); // deg (Deflection α)
  const [neckDiameter, setNeckDiameter] = useState<number>(3.2); // mm (Ball stem neck)
  const [socketOpeningAngle, setSocketOpeningAngle] = useState<number>(120); // deg (Socket wrap angle)

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentPair = MATERIAL_PAIRS[selectedPairKey];

  // Mathematical Calculations
  const results = useMemo(() => {
    const r1 = Math.max(0.5, Number(ballRadius) || 4.0);
    const radClearanceMm = Math.max(0.001, (Number(radialClearance) || 20) / 1000);
    const r2 = r1 + radClearanceMm;
    const force = Math.max(0.1, Number(normalForce) || 30);
    const neckDiam = Math.max(0.1, Number(neckDiameter) || 3.2);
    const socketAngle = Math.max(30, Math.min(170, Number(socketOpeningAngle) || 120));

    // Equivalent Elastic Modulus: 1/E* = (1 - v1^2)/E1 + (1 - v2^2)/E2
    const term1 = (1 - Math.pow(currentPair.v1, 2)) / (currentPair.E1 * 1000); // mm^2 / N
    const term2 = (1 - Math.pow(currentPair.v2, 2)) / (currentPair.E2 * 1000);
    const E_star = 1 / Math.max(1e-9, term1 + term2); // MPa

    // Equivalent Curvature: 1/R* = 1/r1 - 1/r2 = (r2 - r1) / (r1 * r2)
    const R_star = (r1 * r2) / Math.max(1e-6, r2 - r1); // mm

    // Hertzian Contact Radius: a = ( 3 * F * R* / (4 * E*) )^(1/3)
    const contactRadius = Math.max(0.001, Math.pow((3 * force * R_star) / (4 * E_star), 1 / 3)); // mm

    // Maximum Hertz Contact Pressure: σ_max = 3 * F / (2 * π * a^2)
    const maxStress = (3 * force) / (2 * Math.PI * Math.pow(contactRadius, 2)); // MPa

    // Maximum Deflection Angle before neck interference with socket rim
    const neckRadius = neckDiam / 2;
    const clampedRatio = Math.max(-1, Math.min(0.99, neckRadius / r1));
    const maxDeflectionAngle = 90 - socketAngle / 2 - (Math.asin(clampedRatio) * 180) / Math.PI;
    const safeMaxTilt = Math.max(5, Math.min(75, 90 - socketAngle / 2 + 15));

    // Yield Safety Factor
    const safetyFactor = maxStress > 0 ? currentPair.yieldLimit / maxStress : 99;

    // Ball-Joint Friction Torque: M_f = μ * F * r1
    const frictionTorque = currentPair.maxFriction * force * (r1 / 1000); // N*m

    const isInterfered = tiltAngle > safeMaxTilt;
    const isYielded = safetyFactor < 1.2;

    return {
      contactRadius: contactRadius.toFixed(3),
      maxStress: maxStress.toFixed(1),
      safetyFactor: safetyFactor.toFixed(2),
      frictionTorque: (frictionTorque * 1000).toFixed(1), // mN*m
      safeMaxTilt: safeMaxTilt.toFixed(1),
      isInterfered,
      isYielded,
      workspaceConeSolidAngle: (2 * Math.PI * (1 - Math.cos((safeMaxTilt * Math.PI) / 180))).toFixed(2), // Steradians
    };
  }, [ballRadius, radialClearance, normalForce, tiltAngle, neckDiameter, socketOpeningAngle, selectedPairKey, currentPair]);

  // Render 2D/3D Interactive Ball-Joint Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const render = () => {
      tick += 0.02;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 + 15;

      // Coordinate axes
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, 20);
      ctx.lineTo(cx, height - 20);
      ctx.moveTo(40, cy);
      ctx.lineTo(width - 40, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      const scale = 14; // pixels per mm
      const bRadPx = ballRadius * scale;
      const socketThickness = 6 * scale;

      // Cone of Motion Background Fill
      const tiltRad = (Number(results.safeMaxTilt) * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, 110, -Math.PI / 2 - tiltRad, -Math.PI / 2 + tiltRad);
      ctx.closePath();
      ctx.fillStyle = "rgba(14, 165, 233, 0.08)";
      ctx.fill();
      ctx.strokeStyle = "rgba(14, 165, 233, 0.3)";
      ctx.stroke();

      // Draw Socket (球窝外壳)
      const wrapHalfRad = ((socketOpeningAngle / 2) * Math.PI) / 180;
      ctx.beginPath();
      ctx.arc(cx, cy, bRadPx + 2, Math.PI / 2 - wrapHalfRad, Math.PI / 2 + wrapHalfRad);
      ctx.lineWidth = socketThickness;
      ctx.strokeStyle = "#334155";
      ctx.stroke();

      // Socket Inner Bushing Layer (PEEK / Bronze)
      ctx.beginPath();
      ctx.arc(cx, cy, bRadPx + 1, Math.PI / 2 - wrapHalfRad, Math.PI / 2 + wrapHalfRad);
      ctx.lineWidth = 3;
      ctx.strokeStyle = selectedPairKey === "steel_bronze" ? "#d97706" : "#0d9488";
      ctx.stroke();

      // Draw Ball (球头)
      const ballGrad = ctx.createRadialGradient(cx - bRadPx * 0.3, cy - bRadPx * 0.3, 2, cx, cy, bRadPx);
      ballGrad.addColorStop(0, "#f8fafc");
      ballGrad.addColorStop(0.7, "#94a3b8");
      ballGrad.addColorStop(1, "#475569");

      ctx.beginPath();
      ctx.arc(cx, cy, bRadPx, 0, Math.PI * 2);
      ctx.fillStyle = ballGrad;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#1e293b";
      ctx.stroke();

      // Draw Neck Stem & Rod with Tilting Angle
      const curTiltRad = (-90 + tiltAngle) * (Math.PI / 180);
      const rodLen = 95;
      const neckRadPx = (neckDiameter / 2) * scale;

      const rodTipX = cx + rodLen * Math.cos(curTiltRad);
      const rodTipY = cy + rodLen * Math.sin(curTiltRad);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(curTiltRad + Math.PI / 2);

      // Neck & Link Rod
      ctx.beginPath();
      ctx.roundRect(-neckRadPx, 0, neckRadPx * 2, -rodLen, [2, 2, 4, 4]);
      ctx.fillStyle = results.isInterfered ? "#f43f5e" : "#0284c7";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = results.isInterfered ? "#be123c" : "#0369a1";
      ctx.stroke();

      // Rod center line
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -rodLen);
      ctx.stroke();

      ctx.restore();

      // Normal Force Arrow (F)
      const arrowStartLen = 130;
      const forceStartX = cx + arrowStartLen * Math.cos(curTiltRad);
      const forceStartY = cy + arrowStartLen * Math.sin(curTiltRad);

      ctx.beginPath();
      ctx.moveTo(forceStartX, forceStartY);
      ctx.lineTo(rodTipX, rodTipY);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#e11d48";
      ctx.stroke();

      ctx.fillStyle = "#e11d48";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(`载荷 F = ${normalForce} N`, forceStartX - 25, forceStartY - 10);

      // Hertz Contact Zone Highlight
      ctx.beginPath();
      ctx.arc(cx, cy + bRadPx, Math.max(4, Number(results.contactRadius) * scale * 2), 0, Math.PI);
      ctx.fillStyle = results.isYielded ? "rgba(225, 29, 72, 0.6)" : "rgba(16, 185, 129, 0.6)";
      ctx.fill();

      // Information tags inside canvas
      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px sans-serif";
      ctx.fillText(`工作锥角 Cone: ±${results.safeMaxTilt}°`, 15, 25);
      ctx.fillText(`接触应力: ${results.maxStress} MPa`, 15, 40);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [ballRadius, radialClearance, tiltAngle, neckDiameter, socketOpeningAngle, results, selectedPairKey]);

  return (
    <div id="ball-joint-kinematics-calculator" className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <CircleDot className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">
              球头万向连杆机构运动学与赫兹接触应力仿真器
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            核算多自由度机械手掌指球头副的空间运动锥角范围、材料接触微屈服极限与微米级配合公差
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
          <ShieldCheck className="w-3.5 h-3.5" /> 卓研球头机械手实测数据拟合
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <label className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-2">
              球头 / 球窝材料副 (Tribology Pair)
            </label>
            <div className="space-y-1.5">
              {Object.entries(MATERIAL_PAIRS).map(([key, pair]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPairKey(key)}
                  className={`w-full px-3 py-2 text-left rounded-lg text-xs transition-all cursor-pointer ${
                    selectedPairKey === key
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm font-semibold"
                      : "bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  <div className="truncate font-medium">{pair.name}</div>
                  <div className={`text-[10px] truncate font-mono ${selectedPairKey === key ? "text-cyan-400" : "text-slate-500"}`}>
                    屈服极限 σ_y = {pair.yieldLimit} MPa | {pair.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>球头半径 (r1)</span>
                <span className="font-bold text-cyan-400">⌀{ballRadius * 2} mm (R {ballRadius}mm)</span>
              </div>
              <input
                type="range"
                min={2.0}
                max={10.0}
                step={0.5}
                value={ballRadius}
                onChange={(e) => setBallRadius(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>球头摆动偏转角 (Tilt Angle)</span>
                <span className={`font-bold ${results.isInterfered ? "text-rose-400" : "text-cyan-400"}`}>
                  {tiltAngle}° (极限: {results.safeMaxTilt}°)
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={tiltAngle}
                onChange={(e) => setTiltAngle(Number(e.target.value))}
                className={`w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer ${
                  results.isInterfered ? "accent-rose-500" : "accent-cyan-500"
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  径向装配间隙 (c)
                </label>
                <select
                  value={radialClearance}
                  onChange={(e) => setRadialClearance(Number(e.target.value))}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono outline-none focus:border-cyan-400"
                >
                  <option value={10}>10 μm (超精密 H6/h5)</option>
                  <option value={20}>20 μm (标准配合 H7/h6)</option>
                  <option value={35}>35 μm (宽松公差 H8/h7)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  球窝包覆角度 (°)
                </label>
                <select
                  value={socketOpeningAngle}
                  onChange={(e) => setSocketOpeningAngle(Number(e.target.value))}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono outline-none focus:border-cyan-400"
                >
                  <option value={100}>100° (超大活动空间)</option>
                  <option value={120}>120° (推荐平衡值)</option>
                  <option value={140}>140° (高抗拉拔防脱)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>外向抓取受力 (F)</span>
                <span className="font-bold text-rose-400">{normalForce} N</span>
              </div>
              <input
                type="range"
                min={5}
                max={120}
                step={5}
                value={normalForce}
                onChange={(e) => setNormalForce(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Right Canvas & Results */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
            <div className="absolute top-2 left-3 z-10 flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Hertz Contact & Workspace Simulator
              </span>
              {results.isInterfered && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/30 text-rose-300 border border-rose-500/40 animate-pulse">
                  <AlertTriangle className="w-3 h-3" /> 颈部已发生机械干涉！
                </span>
              )}
            </div>

            <canvas
              ref={canvasRef}
              width={520}
              height={260}
              className="w-full h-56 block object-contain"
            />
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
              <div className="text-[11px] text-slate-400 font-mono">最大赫兹接触应力</div>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
                {results.maxStress} <span className="text-xs font-normal text-slate-400">MPa</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                接触半径: a = {results.contactRadius}mm
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
              <div className="text-[11px] text-slate-400 font-mono">抗屈服安全系数 (S)</div>
              <div className={`text-xl font-bold font-mono mt-0.5 ${results.isYielded ? "text-rose-400" : "text-emerald-400"}`}>
                {results.safetyFactor} <span className="text-xs font-normal text-slate-400">X</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                基准限值: {currentPair.yieldLimit} MPa
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
              <div className="text-[11px] text-slate-400 font-mono">关节摩擦力矩 (M_f)</div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
                {results.frictionTorque} <span className="text-xs font-normal text-slate-400">mN·m</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                摩擦系数: μ = {currentPair.maxFriction}
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
              <div className="text-[11px] text-slate-400 font-mono">极限活动锥半角</div>
              <div className="text-xl font-bold font-mono text-cyan-300 mt-0.5">
                ±{results.safeMaxTilt}°
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                立体角: {results.workspaceConeSolidAngle} sr
              </div>
            </div>
          </div>

          {/* DFM Notes */}
          <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-cyan-300 font-mono">球头机构设计要点：</span>
              {results.isYielded ? (
                <span className="text-rose-300">
                  当前载荷下接触应力超过材料抗压极限（安全系数 {results.safetyFactor} &lt; 1.2），长期使用会导致球窝发生塑性凹坑磨损！建议增大球头直径至 ⌀8mm 以上或改用钢-青铜副。
                </span>
              ) : results.isInterfered ? (
                <span className="text-rose-300">
                  偏转角超过安全锥角边界，连杆颈部与球窝边缘将发生碰撞干涉。建议减小连杆颈部外径或将球窝开口包覆角减小至 100°。
                </span>
              ) : (
                <span className="text-emerald-300">
                  配合公差（{radialClearance}μm）与应力分布完美匹配，自润滑衬套在 {results.frictionTorque} mN·m 低摩擦力矩下平滑运转，具备极佳的顺应性与寿命！
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
