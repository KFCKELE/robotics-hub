import React, { useState, useMemo } from "react";
import { 
  Download, Settings, Zap, Volume2, ShieldCheck, Clock, Activity, Cog, 
  Target, Thermometer, Layers, AlertTriangle, CheckCircle2, Sliders, FileText, Check,
  Sparkles, Cpu, Wrench, ArrowUpRight, Award, Compass, Link2, Unlink2, CheckCircle, HelpCircle
} from "lucide-react";
import { 
  GearParams, calculateGearProperties, GEAR_MATERIALS, generateFreeCADMacro, 
  MICRO_PRESETS, MicroPreset, getGearParamConstraints, GearParamConstraints 
} from "./utils";
import { GearPreview } from "./GearPreview";

export const GearGeneratorHub: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("kpower-metal-servo");
  const [smartLinkage, setSmartLinkage] = useState<boolean>(true); // 智能参数关联模式
  const [isHeightShiftLocked, setIsHeightShiftLocked] = useState<boolean>(true); // 高度变位联动锁定 (x2 = -x1)
  const [params, setParams] = useState<GearParams>({
    systemType: "Planetary",
    mode: "Spur",
    mn: 0.4,
    z1: 15,
    z2: 24,
    numPlanets: 3,
    alpha: 20.0,
    x1: 0.25,
    x2: -0.25, // Height shift (等移距变位，中心距恒定！)
    ha_star: 1.0,
    c_star: 0.25,
    rf_star: 0.38,
    backlash: 0.03, // 30um 精密级侧隙
    b1: 3.5,
    b2: 3.5,
    beta: 0,
    dir1: "Right",
    materialId: "POWDER_FE_CU",
    designTorque: 2.5, // 25 kg.cm micro servo torque
    inputSpeed: 4500,
    qualityGrade: 6,
    manufacturingProcess: "Grinding",
    heatTreatment: "Carburizing",
  });

  const [activeTab, setActiveTab] = useState<"params" | "manufacturing" | "export">("params");

  const computed = useMemo(() => calculateGearProperties(params), [params]);
  const constraints = useMemo(() => getGearParamConstraints(params), [params]);

  const handleChange = (key: keyof GearParams, value: any) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  // 智能参数关联修改逻辑
  const handleSmartChange = (key: keyof GearParams, value: any) => {
    setParams((prev) => {
      const updated = { ...prev, [key]: value };

      if (!smartLinkage) {
        // 未开启智能联动时，仅响应高度变位锁定
        if (isHeightShiftLocked && key === "x1") {
          updated.x2 = -Number(value);
        }
        return updated;
      }

      // 1. 修改模数 mn 时，自动自适应调整齿宽 b1, b2 与装配侧隙 backlash
      if (key === "mn") {
        const newMn = Math.max(0.1, Number(value));
        updated.mn = newMn;
        // 推荐齿宽约为 9 * mn
        const recFw = Number((9.0 * newMn).toFixed(1));
        updated.b1 = recFw;
        updated.b2 = recFw;
        // 推荐侧隙：微模数 0.05*mn，大模数 0.08*mn
        if (newMn <= 0.6) {
          updated.backlash = Number((0.05 * newMn).toFixed(3));
        } else {
          updated.backlash = Number((0.08 * newMn).toFixed(3));
        }
      }

      // 2. 修改标准压力角 alpha 或齿顶高系数 ha_star 时，联动防根切
      if (key === "alpha" || key === "ha_star") {
        const curAlpha = key === "alpha" ? Number(value) : prev.alpha;
        const curHa = key === "ha_star" ? Number(value) : prev.ha_star;
        const alphaRad = (curAlpha * Math.PI) / 180;
        const zMin = (2 * curHa) / Math.pow(Math.sin(alphaRad), 2);
        if (updated.z1 < zMin && updated.x1 < (curHa * (zMin - updated.z1)) / zMin) {
          const recX1 = Number(((curHa * (zMin - updated.z1)) / zMin + 0.1).toFixed(2));
          updated.x1 = recX1;
          if (isHeightShiftLocked) {
            updated.x2 = -recX1;
          }
        }
      }

      // 3. 修改太阳轮/主动轮齿数 Z1 时，防根切保护并行星排装配吸附
      if (key === "z1") {
        const newZ1 = Math.max(8, Number(value));
        updated.z1 = newZ1;
        const alphaRad = (prev.alpha * Math.PI) / 180;
        const zMin = (2 * prev.ha_star) / Math.pow(Math.sin(alphaRad), 2);
        if (newZ1 < zMin && updated.x1 < (prev.ha_star * (zMin - newZ1)) / zMin) {
          const recX1 = Number(((prev.ha_star * (zMin - newZ1)) / zMin + 0.1).toFixed(2));
          updated.x1 = recX1;
          if (isHeightShiftLocked) {
            updated.x2 = -recX1;
          }
        }
        // 行星排装配条件自适应修正 Z2
        if (prev.systemType === "Planetary") {
          const val = (2 * (newZ1 + prev.z2)) / prev.numPlanets;
          if (!Number.isInteger(val)) {
            // 找最近合法 Z2
            for (let offset = 1; offset <= prev.numPlanets; offset++) {
              if (Number.isInteger((2 * (newZ1 + prev.z2 + offset)) / prev.numPlanets)) {
                updated.z2 = prev.z2 + offset;
                break;
              } else if (prev.z2 - offset >= 8 && Number.isInteger((2 * (newZ1 + prev.z2 - offset)) / prev.numPlanets)) {
                updated.z2 = prev.z2 - offset;
                break;
              }
            }
          }
        }
      }

      // 4. 修改变位系数 x1 时，若高度变位锁定，则 x2 = -x1
      if (key === "x1") {
        const newX1 = Number(value);
        updated.x1 = newX1;
        if (isHeightShiftLocked) {
          updated.x2 = -newX1;
        }
      }

      // 5. 修改系统构型
      if (key === "systemType") {
        if (value === "Planetary") {
          // 确保行星排装配条件成立
          if ((2 * (updated.z1 + updated.z2)) % updated.numPlanets !== 0) {
            for (let offset = 1; offset <= updated.numPlanets; offset++) {
              if ((2 * (updated.z1 + updated.z2 + offset)) % updated.numPlanets === 0) {
                updated.z2 = updated.z2 + offset;
                break;
              }
            }
          }
        }
      }

      return updated;
    });
  };

  const handleApplyPreset = (preset: MicroPreset) => {
    setSelectedPresetId(preset.id);
    setParams((prev) => ({
      ...prev,
      ...preset.params,
    } as GearParams));
  };

  const handleApplyHeightShift = () => {
    // 实施高度变位（等移距变位）：x1 = +0.28, x2 = -0.28，总变位量 x1 + x2 = 0，中心距 a 恒定不变
    setIsHeightShiftLocked(true);
    setParams((prev) => ({
      ...prev,
      x1: 0.28,
      x2: -0.28,
    }));
  };

  const handleResetStandardShift = () => {
    setParams((prev) => ({
      ...prev,
      x1: 0.0,
      x2: 0.0,
    }));
  };

  const handleFixX1ToRecommended = () => {
    const rec = constraints.x1.recommended;
    setParams((prev) => ({
      ...prev,
      x1: rec,
      x2: isHeightShiftLocked ? -rec : prev.x2,
    }));
  };

  const handleFixX2ToRecommended = () => {
    const rec = constraints.x2.recommended;
    setParams((prev) => ({
      ...prev,
      x2: rec,
    }));
  };

  const handleSnapZ2 = (snapVal: number) => {
    setParams((prev) => ({
      ...prev,
      z2: snapVal,
    }));
  };

  const handleToothSystemChange = (system: "standard" | "stub") => {
    if (system === "standard") {
      setParams((prev) => ({ ...prev, ha_star: 1.0, c_star: 0.25 }));
    } else {
      setParams((prev) => ({ ...prev, ha_star: 0.8, c_star: 0.30 }));
    }
  };

  const handleDownloadScript = () => {
    const script = generateFreeCADMacro(params);
    const blob = new Blob([script], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `generate_gear_system_${params.systemType.toLowerCase()}.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadReport = () => {
    const report = `=== 精密齿轮系统生产与制造参数校验单 (GB/T 1356-2001 / ISO 53) ===
生成时间: ${new Date().toLocaleString()}
传动系统类型: ${params.systemType} (${params.mode === "Spur" ? "直齿" : "斜齿"})
材料选型: ${GEAR_MATERIALS[params.materialId]?.name}
热处理工艺: ${params.heatTreatment} | 成型工艺: ${params.manufacturingProcess}
ISO 精度等级: Grade ${params.qualityGrade}

[基本设计参数]
法向模数 mn: ${params.mn} mm
端面模数 mt: ${computed.mt.toFixed(4)} mm
标准压力角 alpha: ${params.alpha}°
螺旋角 beta: ${params.beta}°
齿顶高系数 ha*: ${params.ha_star}
顶隙系数 c*: ${params.c_star}
齿根圆角半径系数 rf*: ${params.rf_star}
装配齿侧间隙 jn: ${params.backlash} mm

[齿轮 1 (太阳轮 / 主动轮)]
齿数 Z1: ${params.z1}
变位系数 x1: ${params.x1}
分度圆直径 d1: ${computed.d1.toFixed(3)} mm
基圆直径 db1: ${computed.db1.toFixed(3)} mm
齿顶圆直径 da1: ${computed.da1.toFixed(3)} mm
齿根圆直径 df1: ${computed.df1.toFixed(3)} mm
分度圆齿厚 s1: ${computed.s1.toFixed(3)} mm
齿顶厚 sa1: ${computed.sa1.toFixed(3)} mm (制造校核: ${computed.sa1 > 0.25 * params.mn ? "通过 >= 0.25mn" : "警告: 齿顶过尖"})
齿宽 b1: ${params.b1} mm

[齿轮 2 (行星轮 / 从动轮)]
齿数 Z2: ${params.z2}
变位系数 x2: ${params.x2}
分度圆直径 d2: ${computed.d2.toFixed(3)} mm
基圆直径 db2: ${computed.db2.toFixed(3)} mm
齿顶圆直径 da2: ${computed.da2.toFixed(3)} mm
齿根圆直径 df2: ${computed.df2.toFixed(3)} mm
分度圆齿厚 s2: ${computed.s2.toFixed(3)} mm
齿顶厚 sa2: ${computed.sa2.toFixed(3)} mm
齿宽 b2: ${params.b2} mm

[安装中心距与重合度]
标准中心距 a: ${computed.centerDistance.toFixed(3)} mm
端面重合度 epsilon_alpha: ${computed.contactRatio.toFixed(3)} (>= 1.2 连续平稳传动)

${params.systemType === "Planetary" ? `[行星齿轮系统三大约束校核]
1. 同心条件: Z_ring = Z_sun + 2*Z_planet = ${computed.zRing} (分度圆: ${computed.dRing.toFixed(3)} mm, 齿顶圆: ${computed.daRing.toFixed(3)} mm, 齿根圆: ${computed.dfRing.toFixed(3)} mm)
2. 装配条件: (Z_sun + Z_ring) / N = (${params.z1} + ${computed.zRing}) / ${params.numPlanets} = ${computed.assemblyCondition.val.toFixed(2)} -> ${computed.assemblyCondition.isSatisfied ? "合格 (满足等角均布安装)" : "不满足 (会导致装配干涉错位)"}
3. 邻接条件: 行星轮齿顶圆间隙 delta = ${computed.adjacencyCondition.clearance.toFixed(2)} mm -> ${computed.adjacencyCondition.isSatisfied ? "合格 (间隙充足)" : "干涉碰撞"}` : ""}
`;
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gear_manufacturing_spec_${params.systemType.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-xl overflow-hidden relative">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
              <Cog className="w-4 h-4 animate-spin-slow" />
              GB/T 1356-2001 & ISO 53 工业生产级渐开线齿轮设计系统
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-600/40">
              精确解析渐开线 / 侧隙预留 / 落地加工
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            精密渐开线齿轮传动数字化设计与制造系统
          </h1>
          <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
            严格遵循机械工程标准渐开线极坐标方程与共轭齿廓啮合原理。具备变位系数 $x$、齿顶高系数 $h_a^*$、顶隙系数 $c^*$、装配侧隙 $j_n$ 等全套生产参数输入，自动核算行星排装配与同心约束，杜绝模型错位与干涉。
          </p>
        </div>
      </div>

      {/* Industrial Benchmark Micro Presets (东莞伟创动力 / 优必选 / 大疆 标杆微型传动模组) */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>标杆微型伺服舵机 & 机器人关节传动模组预设 (KPOWER / 优必选 / 大疆 级)</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">一键载入微小模数、精密变位与微侧隙参数</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MICRO_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`text-left p-3 rounded-xl border transition-all relative flex flex-col justify-between ${
                  isSelected 
                    ? "bg-indigo-950/70 border-indigo-500 shadow-md ring-1 ring-indigo-500/40" 
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {preset.badge}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> 当前加载
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-xs text-slate-100 mb-1">{preset.name}</div>
                  <p className="text-[11px] text-slate-400 leading-snug">{preset.description}</p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                  应用: {preset.targetCompany}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Height Shift Optimizer (不增加中心距提升承载力优化器 - 针对优必选/伟创动力面试灵魂拷问) */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/30 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Wrench className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                “中心距绝对锁死·不增加中心距提升承载力”高度变位优化器
                {computed.isHeightShift ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                    ⚡ 高度变位已激活 (x1 = -x2)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-400">
                    标准齿轮状态
                  </span>
                )}
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              针对微型伺服舵机与人形机器人关节（优必选/KPOWER标杆）：空间极度受限且中心距 a 不得更改。<br />
              采用<strong>高度变位（等移距变位，令 x1 = -x2）</strong>：中心距 a = mn·(Z1+Z2)/2 恒定不变，主动小齿轮正变位加厚危险截面齿根，抗弯疲劳强度显著提升！
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleApplyHeightShift}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-900/30"
            >
              <Sparkles className="w-4 h-4" />
              一键应用高度变位强化 (x1=+0.28, x2=-0.28)
            </button>
            <button
              onClick={handleResetStandardShift}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono transition-all border border-slate-700"
            >
              复位为标准齿轮 (x=0)
            </button>
          </div>
        </div>

        {/* Dynamic Improvement Indicator */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">中心距状态 (Center Distance)</span>
            <span className="font-mono font-bold text-cyan-300">
              a = {computed.centerDistance.toFixed(2)} mm {computed.isHeightShift && "(完全恒定锁定)"}
            </span>
          </div>
          <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">小齿轮齿根加厚量</span>
            <span className={`font-mono font-bold ${computed.rootThicknessGainPercent > 0 ? "text-emerald-400" : "text-slate-400"}`}>
              {computed.rootThicknessGainPercent > 0 ? `+${computed.rootThicknessGainPercent.toFixed(1)}%` : "0.0% (标准)"}
            </span>
          </div>
          <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">齿根抗弯疲劳承载力增益</span>
            <span className={`font-mono font-bold ${computed.bendingCapacityGainPercent > 0 ? "text-emerald-400" : "text-slate-400"}`}>
              {computed.bendingCapacityGainPercent > 0 ? `+${computed.bendingCapacityGainPercent.toFixed(1)}% (防断齿)` : "基准"}
            </span>
          </div>
          <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">梯次选材策略</span>
            <span className="text-slate-300 text-[11px] font-sans">
              前级POM降噪 + 末级金属齿抗冲击
            </span>
          </div>
        </div>
      </div>

      {/* Planetary Assembly Condition Alert (if violated) */}
      {params.systemType === "Planetary" && !computed.assemblyCondition.isSatisfied && (
        <div className="bg-amber-950/70 border-2 border-amber-500/80 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-200 text-sm flex items-center gap-2">
                行星排装配条件未满足！(Assembly Condition Warning)
              </div>
              <p className="text-xs text-amber-300/90 mt-1 leading-relaxed">
                当前参数下：(Z_sun + Z_ring) / N = ({params.z1} + {computed.zRing}) / {params.numPlanets} = <span className="font-mono font-bold underline">{computed.assemblyCondition.val.toFixed(2)}</span>（非整数）。<br />
                机械原理指出：在圆周等角度布置下，齿数和不能被行星轮数整除会导致<strong>各行星轮无法同时与太阳轮和内齿圈正确啮合</strong>，产生齿顶撞击与错位！
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {computed.assemblyCondition.recommendedZ1 && (
              <button
                onClick={() => handleChange("z1", computed.assemblyCondition.recommendedZ1)}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <Check className="w-4 h-4" />
                推荐一键修正: 太阳轮改为 {computed.assemblyCondition.recommendedZ1} 齿
              </button>
            )}
            {computed.assemblyCondition.recommendedPlanets && (
              <button
                onClick={() => handleChange("numPlanets", computed.assemblyCondition.recommendedPlanets)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-500/40 rounded-xl text-xs font-bold transition-all"
              >
                改为 {computed.assemblyCondition.recommendedPlanets} 个行星轮
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Input Parameters (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Tabs for left panel */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-700">
            <button
              onClick={() => setActiveTab("params")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "params" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Settings className="w-3.5 h-3.5" /> 齿轮工程参数
            </button>
            <button
              onClick={() => setActiveTab("manufacturing")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "manufacturing" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Thermometer className="w-3.5 h-3.5" /> 材料与工况
            </button>
          </div>

          {activeTab === "params" ? (
            <>
              {/* Section 1: System Topology */}
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-3 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                  <Layers className="w-4 h-4" /> 传动构型 (Topology)
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">传动系统构型</label>
                    <select
                      value={params.systemType}
                      onChange={(e) => handleChange("systemType", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="Planetary">行星齿轮减速排 (Planetary Gear Set - 2K-H)</option>
                      <option value="Cylindrical">平行轴圆柱齿轮副 (Cylindrical Gear Pair)</option>
                      <option value="Bevel">交错轴锥齿轮副 (Bevel Gear Pair)</option>
                    </select>
                  </div>

                  {params.systemType === "Cylindrical" && (
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">齿形类型</label>
                      <select value={params.mode} onChange={(e) => handleChange("mode", e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white">
                        <option value="Spur">标准直齿圆柱齿轮 (Spur Gear)</option>
                        <option value="Helical">斜齿圆柱齿轮 (Helical Gear)</option>
                      </select>
                    </div>
                  )}

                  {params.systemType === "Planetary" && (
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">行星轮数量 (N)</label>
                      <select value={params.numPlanets} onChange={(e) => handleChange("numPlanets", Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold">
                        <option value="2">2 个行星轮</option>
                        <option value="3">3 个行星轮 (经典高平衡)</option>
                        <option value="4">4 个行星轮 (高承载力)</option>
                        <option value="5">5 个行星轮</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Core Gear Parameters (Involute Parameters with Smart Linkage & Range Constraints) */}
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-lg space-y-4">
                {/* Header with Smart Linkage Control */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                    <Cog className="w-4 h-4" /> 渐开线齿形参数 (Involute Geometry)
                  </div>
                  
                  {/* Smart Linkage Toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSmartLinkage(!smartLinkage)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                        smartLinkage
                          ? "bg-cyan-950 text-cyan-300 border-cyan-500/80 shadow-sm shadow-cyan-950"
                          : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-300"
                      }`}
                      title={smartLinkage ? "智能参数关联已激活：自动协调模数、齿数、变位防根切与侧隙" : "自由模式：允许独立手动输入"}
                    >
                      {smartLinkage ? <Link2 className="w-3.5 h-3.5 text-cyan-400" /> : <Unlink2 className="w-3.5 h-3.5" />}
                      <span>{smartLinkage ? "参数智能关联: 开启" : "参数关联: 已关闭(自由模式)"}</span>
                    </button>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">ISO 53 标准</span>
                  </div>
                </div>

                {/* Notification Banner when Linkage is active */}
                {smartLinkage && (
                  <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-2.5 text-[11px] text-cyan-200 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">参数智能约束与物理防呆已生效：</span>
                      <span className="text-slate-300"> 调整模数将自动联动推荐齿宽与精密侧隙；调整齿数将自动校验防根切安全变位；行星轮排严格限制同装均布条件。</span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* Module & Pressure Angle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Normal Module */}
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-200">法向模数 mn (mm)</label>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                          {params.mn <= 0.6 ? "微型精密舵机" : params.mn <= 1.25 ? "轻型机器人" : "通用工业级"}
                        </span>
                      </div>
                      <input 
                        type="number" 
                        step="0.05" 
                        min="0.1" 
                        max="20" 
                        value={params.mn} 
                        onChange={(e) => handleSmartChange("mn", Number(e.target.value))} 
                        className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold" 
                      />
                      {/* Quick Standard Module Pickers (GB/T 1357 第一系列标准模数) */}
                      <div className="pt-1">
                        <span className="text-[10px] text-slate-400 block mb-1">国标推荐模数序列:</span>
                        <div className="flex flex-wrap gap-1">
                          {[0.2, 0.3, 0.4, 0.5, 0.8, 1.0, 1.5, 2.0].map((mVal) => (
                            <button
                              key={mVal}
                              onClick={() => handleSmartChange("mn", mVal)}
                              className={`px-1.5 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                                params.mn === mVal 
                                  ? "bg-cyan-900/80 border-cyan-500 text-cyan-200 font-bold" 
                                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                              }`}
                            >
                              {mVal}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Pressure Angle */}
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-200">标准压力角 α (°)</label>
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800">
                          不根切极值: Z ≥ {constraints.zMin}
                        </span>
                      </div>
                      <select
                        value={params.alpha}
                        onChange={(e) => handleSmartChange("alpha", Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold"
                      >
                        <option value="20">20.0° (国标/ISO通用标准，Zmin=17)</option>
                        <option value="14.5">14.5° (大重合度超静音/易根切，Zmin=32)</option>
                        <option value="25">25.0° (大承载高抗弯强度，Zmin=12)</option>
                      </select>
                      <p className="text-[10px] text-slate-400 leading-snug pt-1">
                        压力角直接决定基圆半径与最小齿数。切换为 14.5° 会扩大重合度但小齿数易根切；25° 齿厚更大更抗冲击。
                      </p>
                    </div>
                  </div>

                  {/* Teeth Count Z1, Z2 with Linkage and Interval Bounds */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Teeth Z1 (Sun / Driver) */}
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-amber-400">
                          {params.systemType === "Planetary" ? "太阳轮齿数 (Z_sun)" : "主动小齿轮 (Z1)"}
                        </label>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          params.z1 < constraints.zMin 
                            ? "bg-amber-950 text-amber-300 border-amber-800" 
                            : "bg-emerald-950 text-emerald-300 border-emerald-800"
                        }`}>
                          {params.z1 < constraints.zMin ? `需正变位 x1 ≥ +${constraints.x1.min.toFixed(2)}` : "天然无根切"}
                        </span>
                      </div>
                      <input 
                        type="number" 
                        min="8" 
                        max="120" 
                        value={params.z1} 
                        onChange={(e) => handleSmartChange("z1", Math.max(8, Number(e.target.value)))} 
                        className={`w-full bg-slate-900 border rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold ${
                          params.z1 < constraints.zMin ? "border-amber-500/60 focus:border-amber-400" : "border-slate-700 focus:border-cyan-500"
                        }`}
                      />
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>受限区间: 8 ~ 120 齿</span>
                        {params.z1 < constraints.zMin && (
                          <span className="text-amber-400 font-mono">已智能计算防根切变位</span>
                        )}
                      </div>
                    </div>

                    {/* Teeth Z2 (Planet / Driven) */}
                    <div className={`p-3 rounded-xl border space-y-1.5 ${
                      params.systemType === "Planetary" && !constraints.z2.isPlanetaryAssemblyValid 
                        ? "bg-rose-950/30 border-rose-500/80 shadow-lg shadow-rose-950/20" 
                        : "bg-slate-950/60 border-slate-800"
                    }`}>
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-cyan-400">
                          {params.systemType === "Planetary" ? "行星轮齿数 (Z_planet)" : "从动大齿轮 (Z2)"}
                        </label>
                        {params.systemType === "Planetary" ? (
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                            constraints.z2.isPlanetaryAssemblyValid
                              ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                              : "bg-rose-950 text-rose-300 border-rose-700 font-bold animate-pulse"
                          }`}>
                            {constraints.z2.isPlanetaryAssemblyValid ? "✓ 满足均布装配" : "❌ 装配干涉"}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            速比 i = {(params.z2 / params.z1).toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          min={constraints.z2.min} 
                          max={constraints.z2.max} 
                          value={params.z2} 
                          onChange={(e) => handleSmartChange("z2", Math.max(8, Number(e.target.value)))} 
                          className={`w-full bg-slate-900 border rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold ${
                            params.systemType === "Planetary" && !constraints.z2.isPlanetaryAssemblyValid 
                              ? "border-rose-500 text-rose-200" 
                              : "border-slate-700 focus:border-cyan-500"
                          }`}
                        />
                      </div>

                      {/* Planetary Assembly Guidance and Snap buttons */}
                      {params.systemType === "Planetary" ? (
                        <div className="pt-1">
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="text-slate-400">满足装配推荐候选:</span>
                            {!constraints.z2.isPlanetaryAssemblyValid && constraints.z2.closestValidPlanetaryZ2 && (
                              <button
                                onClick={() => handleSnapZ2(constraints.z2.closestValidPlanetaryZ2!)}
                                className="text-rose-300 bg-rose-900/60 hover:bg-rose-800/80 px-2 py-0.5 rounded font-bold transition-all border border-rose-600 flex items-center gap-1 text-[10px]"
                              >
                                一键对齐为 {constraints.z2.closestValidPlanetaryZ2}
                              </button>
                            )}
                          </div>
                          {constraints.z2.validPlanetaryCandidates && constraints.z2.validPlanetaryCandidates.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {constraints.z2.validPlanetaryCandidates.slice(0, 7).map((cVal) => (
                                <button
                                  key={cVal}
                                  onClick={() => handleSnapZ2(cVal)}
                                  className={`px-1.5 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                                    params.z2 === cVal 
                                      ? "bg-cyan-900/80 border-cyan-500 text-cyan-200 font-bold" 
                                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                                  }`}
                                >
                                  {cVal}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 pt-0.5">
                          推荐范围: {constraints.z2.min} ~ {constraints.z2.max} 齿 (速比 1.0 ~ 5.0)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile Shift Coefficients (x1, x2) with Linkage and Bounds */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-slate-200 block">变位系数 (Profile Shift x)</span>
                        <span className="text-[10px] text-slate-400">防根切·调中心距·消除干涉</span>
                      </div>
                      
                      {/* Height Shift Linkage Toggle */}
                      <button
                        onClick={() => {
                          const nextLock = !isHeightShiftLocked;
                          setIsHeightShiftLocked(nextLock);
                          if (nextLock) {
                            setParams((prev) => ({ ...prev, x2: -prev.x1 }));
                          }
                        }}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border ${
                          isHeightShiftLocked 
                            ? "bg-indigo-950 text-indigo-300 border-indigo-500/80" 
                            : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300"
                        }`}
                        title="高度变位(等移距变位): x2 锁定为 -x1，保证中心距恒定绝对不变"
                      >
                        {isHeightShiftLocked ? <Link2 className="w-3 h-3 text-indigo-400" /> : <Unlink2 className="w-3 h-3" />}
                        <span>{isHeightShiftLocked ? "高度变位锁定 (x2 = -x1，中心距恒定)" : "独立变位模式 (自由设定)"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Profile Shift x1 */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-slate-300">主动轮 x1</label>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                            constraints.x1.isUnderCut 
                              ? "bg-rose-950 text-rose-300 border-rose-800" 
                              : constraints.x1.isPointed 
                              ? "bg-amber-950 text-amber-300 border-amber-800" 
                              : "bg-emerald-950 text-emerald-300 border-emerald-800"
                          }`}>
                            {constraints.x1.isUnderCut ? "❌ 根切危险" : constraints.x1.isPointed ? "⚠️ 齿顶变尖" : "✓ 合格"}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="number" 
                            step="0.02" 
                            min={constraints.x1.min} 
                            max={constraints.x1.max} 
                            value={params.x1} 
                            onChange={(e) => handleSmartChange("x1", Number(e.target.value))} 
                            className={`w-full bg-slate-900 border rounded-lg px-2.5 py-1 text-xs text-white font-mono font-bold ${
                              constraints.x1.isUnderCut 
                                ? "border-rose-500 text-rose-200" 
                                : constraints.x1.isPointed 
                                ? "border-amber-500 text-amber-200" 
                                : "border-slate-700 focus:border-cyan-500"
                            }`} 
                          />
                          {(constraints.x1.isUnderCut || constraints.x1.isPointed) && (
                            <button
                              onClick={handleFixX1ToRecommended}
                              className="px-2 py-1 text-[10px] font-mono bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 rounded border border-indigo-600 shrink-0"
                              title={`修正至推荐值: +${constraints.x1.recommended}`}
                            >
                              修复
                            </button>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>安全区间: [{constraints.x1.min >= 0 ? "+" + constraints.x1.min.toFixed(2) : constraints.x1.min.toFixed(2)} ~ +{constraints.x1.max.toFixed(2)}]</span>
                          <button
                            onClick={handleFixX1ToRecommended}
                            className="text-cyan-400 hover:underline font-mono"
                          >
                            推荐: +{constraints.x1.recommended}
                          </button>
                        </div>
                      </div>

                      {/* Profile Shift x2 */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-slate-300">从动轮 x2</label>
                          {isHeightShiftLocked ? (
                            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 px-1.5 py-0.2 rounded border border-indigo-800">
                              锁定为 -x1 (-{params.x1})
                            </span>
                          ) : (
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                              constraints.x2.isUnderCut 
                                ? "bg-rose-950 text-rose-300 border-rose-800" 
                                : constraints.x2.isPointed 
                                ? "bg-amber-950 text-amber-300 border-amber-800" 
                                : "bg-emerald-950 text-emerald-300 border-emerald-800"
                            }`}>
                              {constraints.x2.isUnderCut ? "❌ 根切危险" : constraints.x2.isPointed ? "⚠️ 齿顶变尖" : "✓ 合格"}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <input 
                            type="number" 
                            step="0.02" 
                            disabled={isHeightShiftLocked}
                            min={constraints.x2.min} 
                            max={constraints.x2.max} 
                            value={params.x2} 
                            onChange={(e) => handleSmartChange("x2", Number(e.target.value))} 
                            className={`w-full bg-slate-900 border rounded-lg px-2.5 py-1 text-xs font-mono font-bold ${
                              isHeightShiftLocked 
                                ? "text-slate-400 border-slate-800 cursor-not-allowed bg-slate-950/80" 
                                : constraints.x2.isUnderCut 
                                ? "border-rose-500 text-rose-200" 
                                : constraints.x2.isPointed 
                                ? "border-amber-500 text-amber-200" 
                                : "border-slate-700 focus:border-cyan-500 text-white"
                            }`} 
                          />
                          {!isHeightShiftLocked && (constraints.x2.isUnderCut || constraints.x2.isPointed) && (
                            <button
                              onClick={handleFixX2ToRecommended}
                              className="px-2 py-1 text-[10px] font-mono bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 rounded border border-indigo-600 shrink-0"
                            >
                              修复
                            </button>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          {isHeightShiftLocked ? (
                            <span>总变位量: x1+x2=0 (中心距不变)</span>
                          ) : (
                            <>
                              <span>安全区间: [{constraints.x2.min >= 0 ? "+" + constraints.x2.min.toFixed(2) : constraints.x2.min.toFixed(2)} ~ +{constraints.x2.max.toFixed(2)}]</span>
                              <button onClick={handleFixX2ToRecommended} className="text-cyan-400 hover:underline font-mono">
                                推荐: {constraints.x2.recommended >= 0 ? "+" + constraints.x2.recommended : constraints.x2.recommended}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Addendum & Clearance Standard Sets */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-200">标准齿制规范 (Tooth Proportions)</label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {params.ha_star === 1.0 ? "正常齿制 (ISO/GB推荐)" : "短齿制 (航空/抗弯)"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleToothSystemChange("standard")}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          params.ha_star === 1.0 
                            ? "bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-sm" 
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        <div className="font-bold text-xs">正常齿制 (Standard)</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">ha* = 1.0, c* = 0.25</div>
                      </button>

                      <button
                        onClick={() => handleToothSystemChange("stub")}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          params.ha_star === 0.8 
                            ? "bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-sm" 
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        <div className="font-bold text-xs">短齿制 (Stub Tooth)</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">ha* = 0.8, c* = 0.30</div>
                      </button>
                    </div>
                  </div>

                  {/* Backlash (jn) with Dynamic Interval & Module Linkage */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-200">装配侧隙 jn (Backlash, mm)</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                        constraints.backlash.isTooTight 
                          ? "bg-amber-950 text-amber-300 border-amber-800" 
                          : constraints.backlash.isTooLoose 
                          ? "bg-rose-950 text-rose-300 border-rose-800" 
                          : "bg-cyan-950 text-cyan-300 border-cyan-800"
                      }`}>
                        {constraints.backlash.isTooTight 
                          ? "⚠️ 偏紧(防膨胀卡死)" 
                          : constraints.backlash.isTooLoose 
                          ? "⚠️ 偏大(防振颤)" 
                          : `${params.backlash === 0 ? "理论零侧隙" : params.backlash <= 0.04 ? "精密伺服级" : "标准工业级"}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        step="0.005" 
                        min="0" 
                        max={constraints.backlash.max} 
                        value={params.backlash} 
                        onChange={(e) => handleSmartChange("backlash", Math.max(0, Number(e.target.value)))} 
                        className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono font-bold focus:border-cyan-500" 
                      />
                      
                      {/* Dynamic Module-Linked Backlash Presets */}
                      <div className="flex gap-1 flex-1">
                        {constraints.backlash.quickPresets.map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() => handleSmartChange("backlash", preset.val)}
                            className={`flex-1 py-1 text-[10px] rounded font-mono border transition-all ${
                              Math.abs(params.backlash - preset.val) < 0.001
                                ? "bg-cyan-900/70 border-cyan-500 text-cyan-200 font-bold" 
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>当前模数推荐区间: [{constraints.backlash.precisionRec[0]} ~ {constraints.backlash.standardRec[1]}] mm</span>
                      <span className="font-mono text-slate-500">
                        换算回差: {computed.backlashArcmin.toFixed(1)} arcmin
                      </span>
                    </div>
                  </div>

                  {/* Face Width b1, b2 with Module Linkage & Range Bounds */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-200">齿宽 b (Face Width, mm)</span>
                      <button
                        onClick={() => {
                          const rec = constraints.faceWidth.recommended;
                          setParams((prev) => ({ ...prev, b1: rec, b2: rec }));
                        }}
                        className="text-[10px] font-mono text-cyan-400 hover:underline"
                      >
                        设为推荐齿宽 ({constraints.faceWidth.recommended} mm)
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">齿宽 b1 (主动轮)</label>
                        <input 
                          type="number" 
                          step="0.5" 
                          min={constraints.faceWidth.min} 
                          max={constraints.faceWidth.max * 1.5} 
                          value={params.b1} 
                          onChange={(e) => handleChange("b1", Math.max(0.5, Number(e.target.value)))} 
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono font-bold focus:border-cyan-500" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">齿宽 b2 (从动轮)</label>
                        <input 
                          type="number" 
                          step="0.5" 
                          min={constraints.faceWidth.min} 
                          max={constraints.faceWidth.max * 1.5} 
                          value={params.b2} 
                          onChange={(e) => handleChange("b2", Math.max(0.5, Number(e.target.value)))} 
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono font-bold focus:border-cyan-500" 
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>推荐齿宽区间: [{constraints.faceWidth.min} ~ {constraints.faceWidth.max}] mm (6~15mn)</span>
                      <span className="font-mono text-slate-500">
                        φm = {(params.b1 / params.mn).toFixed(1)}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

            </>
          ) : (
            <>
              {/* Materials & Working Conditions */}
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-lg space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Thermometer className="w-4 h-4" /> 工业材料与工况 (Operations)
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">齿轮工程材料</label>
                    <select value={params.materialId} onChange={(e) => handleChange("materialId", e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500">
                      {Object.entries(GEAR_MATERIALS).map(([id, mat]) => (
                        <option key={id} value={id}>{mat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">热处理强化</label>
                      <select value={params.heatTreatment} onChange={(e) => handleChange("heatTreatment", e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white">
                        <option value="Carburizing">渗碳淬火 (HRC 60+)</option>
                        <option value="Nitriding">表面氮化 (HV 800)</option>
                        <option value="Quenching">高频淬火 (HRC 50)</option>
                        <option value="Tempering">调质处理 (HB 250)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">成型工艺</label>
                      <select value={params.manufacturingProcess} onChange={(e) => handleChange("manufacturingProcess", e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white">
                        <option value="Grinding">CNC 精密磨齿 (Grinding)</option>
                        <option value="Hobbing">高速滚齿 (Hobbing)</option>
                        <option value="Shaving">剃齿 (Shaving)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">ISO 精度等级 (1328-1)</label>
                    <div className="flex items-center gap-3">
                      <input type="range" min="5" max="9" step="1" value={params.qualityGrade} onChange={(e) => handleChange("qualityGrade", Number(e.target.value))} className="flex-1 accent-emerald-500" />
                      <span className="text-xs font-bold text-emerald-400 w-12 text-center font-mono">级 {params.qualityGrade}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">输入转速 (RPM)</label>
                      <input type="number" step="100" value={params.inputSpeed} onChange={(e) => handleChange("inputSpeed", Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">设计扭矩 (N·m)</label>
                      <input type="number" step="5" value={params.designTorque} onChange={(e) => handleChange("designTorque", Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Planetary Constraints Summary Card */}
          {params.systemType === "Planetary" && (
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-lg space-y-2 text-xs">
              <div className="font-bold text-slate-200 flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-indigo-400" /> 行星排装配三大准则校核
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">1. 同心条件 (Zr = Zs + 2*Zp)</span>
                <span className="font-mono font-bold text-emerald-400">Zr = {computed.zRing} 齿 (满足)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">2. 均布装配条件 ((Zs+Zr)/N)</span>
                <span className={`font-mono font-bold ${computed.assemblyCondition.isSatisfied ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {computed.assemblyCondition.val.toFixed(2)} ({computed.assemblyCondition.isSatisfied ? "整除 合格" : "不整除 错位"})
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">3. 邻接条件 (行星轮齿顶间隙)</span>
                <span className={`font-mono font-bold ${computed.adjacencyCondition.isSatisfied ? 'text-emerald-400' : 'text-red-400'}`}>
                  δ = {computed.adjacencyCondition.clearance.toFixed(2)} mm ({computed.adjacencyCondition.isSatisfied ? "充足" : "干涉"})
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Right: 3D Visualization, Mechanical Calculations & Specification Table */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          
          {/* 3D Visualizer */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-0 shadow-xl relative min-h-[440px] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 absolute top-0 left-0 right-0 z-10 pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono text-slate-300">
                <span>标准中心距 a = <strong className="text-cyan-400">{computed.centerDistance.toFixed(2)} mm</strong></span>
                <span className="text-slate-600">|</span>
                <span>重合度 εα = <strong className="text-indigo-400">{computed.contactRatio.toFixed(2)}</strong></span>
              </div>

              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  onClick={handleDownloadReport}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
                >
                  <FileText className="w-3.5 h-3.5" /> 生产工艺单 (TXT)
                </button>
                <button
                  onClick={handleDownloadScript}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-lg shadow-indigo-900/20"
                >
                  <Download className="w-3.5 h-3.5" /> 导出 FreeCAD/SolidWorks 脚本
                </button>
              </div>
            </div>

            <div className="w-full h-[440px] relative">
              <GearPreview params={params} />
            </div>

            {/* Bottom Involute Status Legend */}
            <div className="bg-slate-950/90 border-t border-slate-800 px-4 py-2 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 太阳轮 (Zs={params.z1}, x1={params.x1})</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> 行星轮 (Zp={params.z2}, x2={params.x2})</span>
                {params.systemType === "Planetary" && (
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-600" /> 内齿圈 (Zr={computed.zRing})</span>
                )}
              </div>
              <div className="font-mono text-[10px] text-slate-400">
                极坐标渐开线方程: ψ(R) = s/d + inv(α) - inv(α_R)
              </div>
            </div>
          </div>

          {/* Gear Manufacturing Dimension Data Sheet (生产落地几何参数表) */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                机械加工制造几何尺寸表 (Machining Dimensions)
              </h3>
              <span className="text-xs text-slate-400 font-mono">单位: mm</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                    <th className="py-2 px-3">齿轮部件</th>
                    <th className="py-2 px-3">齿数 Z</th>
                    <th className="py-2 px-3">分度圆 d</th>
                    <th className="py-2 px-3">基圆 db</th>
                    <th className="py-2 px-3">齿顶圆 da</th>
                    <th className="py-2 px-3">齿根圆 df</th>
                    <th className="py-2 px-3">分度圆齿厚 s</th>
                    <th className="py-2 px-3">齿顶厚 sa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-bold text-amber-400">
                      {params.systemType === "Planetary" ? "太阳轮 (Sun)" : "主动轮 (Gear 1)"}
                    </td>
                    <td className="py-2.5 px-3">{params.z1}</td>
                    <td className="py-2.5 px-3">{computed.d1.toFixed(3)}</td>
                    <td className="py-2.5 px-3">{computed.db1.toFixed(3)}</td>
                    <td className="py-2.5 px-3 text-cyan-300 font-bold">{computed.da1.toFixed(3)}</td>
                    <td className="py-2.5 px-3">{computed.df1.toFixed(3)}</td>
                    <td className="py-2.5 px-3">{computed.s1.toFixed(3)}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{computed.sa1.toFixed(3)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-bold text-sky-400">
                      {params.systemType === "Planetary" ? "行星轮 (Planet)" : "从动轮 (Gear 2)"}
                    </td>
                    <td className="py-2.5 px-3">{params.z2}</td>
                    <td className="py-2.5 px-3">{computed.d2.toFixed(3)}</td>
                    <td className="py-2.5 px-3">{computed.db2.toFixed(3)}</td>
                    <td className="py-2.5 px-3 text-cyan-300 font-bold">{computed.da2.toFixed(3)}</td>
                    <td className="py-2.5 px-3">{computed.df2.toFixed(3)}</td>
                    <td className="py-2.5 px-3">{computed.s2.toFixed(3)}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{computed.sa2.toFixed(3)}</td>
                  </tr>
                  {params.systemType === "Planetary" && (
                    <tr>
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-400">内齿圈 (Ring)</td>
                      <td className="py-2.5 px-3">{computed.zRing}</td>
                      <td className="py-2.5 px-3">{computed.dRing.toFixed(3)}</td>
                      <td className="py-2.5 px-3">{computed.dbRing.toFixed(3)}</td>
                      <td className="py-2.5 px-3 text-cyan-300 font-bold">{computed.daRing.toFixed(3)}</td>
                      <td className="py-2.5 px-3">{computed.dfRing.toFixed(3)}</td>
                      <td className="py-2.5 px-3">-</td>
                      <td className="py-2.5 px-3">-</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
              <div>
                提示: 齿顶厚校核 sa ≥ 0.25mn ({0.25 * params.mn} mm) 保证轮齿淬火与切削不崩刃变尖。
              </div>
              <div className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 制造侧隙已补偿: {params.backlash} mm
              </div>
            </div>
          </div>

          {/* Performance Dashboard */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              工况受力与综合寿命仿真 (Fatigue & Mechanics)
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1"><Clock className="w-3.5 h-3.5"/> 理论疲劳寿命 L10h</div>
                <div className="text-xl font-bold text-emerald-400 font-mono">
                  {computed.lifeH > 99000 ? ">> 10,000" : computed.lifeH.toFixed(0)} <span className="text-xs font-normal">h</span>
                </div>
              </div>
              <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1"><Zap className="w-3.5 h-3.5"/> 传动效率预估</div>
                <div className="text-xl font-bold text-cyan-400 font-mono">
                  {(computed.efficiency * 100).toFixed(1)} <span className="text-xs font-normal">%</span>
                </div>
              </div>
              <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1"><Volume2 className="w-3.5 h-3.5"/> 噪声与振动评估</div>
                <div className={`text-xl font-bold font-mono ${computed.noiseDB > 75 ? 'text-red-400' : 'text-purple-400'}`}>
                  {computed.noiseDB.toFixed(1)} <span className="text-xs font-normal">dB</span>
                </div>
              </div>
              <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1"><Target className="w-3.5 h-3.5"/> 传动速比 i</div>
                <div className="text-xl font-bold text-indigo-400 font-mono">
                  {computed.transmissionRatio.toFixed(3)}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="block text-[10px] font-sans text-slate-500 mb-0.5">齿面接触应力 / 许用</span>
                <div className="text-slate-200">{computed.contactStress.toFixed(1)} / {computed.allowableContact.toFixed(1)} MPa</div>
                <div className={`text-[10px] font-bold ${computed.safetyFactorContact >= 1.2 ? 'text-emerald-500' : 'text-red-400'}`}>安全系数: {computed.safetyFactorContact.toFixed(2)}</div>
              </div>
              <div>
                <span className="block text-[10px] font-sans text-slate-500 mb-0.5">齿根弯曲应力 / 许用</span>
                <div className="text-slate-200">{computed.bendingStress.toFixed(1)} / {computed.allowableBending.toFixed(1)} MPa</div>
                <div className={`text-[10px] font-bold ${computed.safetyFactorBending >= 1.5 ? 'text-emerald-500' : 'text-red-400'}`}>安全系数: {computed.safetyFactorBending.toFixed(2)}</div>
              </div>
              <div>
                <span className="block text-[10px] font-sans text-slate-500 mb-0.5">切向周向分力 Ft</span>
                <div className="text-slate-200">{computed.Ft.toFixed(1)} N</div>
              </div>
              <div>
                <span className="block text-[10px] font-sans text-slate-500 mb-0.5">制造精度标准</span>
                <div className="text-slate-300 text-[11px]">{computed.toleranceStandard}</div>
              </div>
            </div>

          </div>

          {/* Micro Servo Backlash & Precision GD&T Tolerance Chain (针对 KPOWER / 大疆 / 优必选 量产把控) */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  微型舵机出轴回差 (Backlash) 与大厂量产尺寸链 (GD&T) 管控
                </h3>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800">
                东莞伟创动力 (KPOWER) / 大疆 / 优必选 供应链标准
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Backlash in Arcminutes */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">输出端综合回差 (Backlash)</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      computed.backlashArcmin <= 18 ? "bg-emerald-950 text-emerald-400 border border-emerald-700" :
                      computed.backlashArcmin <= 35 ? "bg-cyan-950 text-cyan-400 border border-cyan-700" :
                      "bg-amber-950 text-amber-400 border border-amber-700"
                    }`}>
                      {computed.backlashArcmin <= 18 ? "高精防抖级" : computed.backlashArcmin <= 35 ? "工业舵机级" : "需调紧侧隙"}
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-cyan-300">
                    {computed.backlashArcmin.toFixed(1)} <span className="text-sm font-normal text-slate-400">arcmin (角分)</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  当前装配侧隙 jn={params.backlash}mm。在机械臂/云台应用中，低于 20 arcmin 可有效防止末端抖动与视觉振纹。
                </p>
              </div>

              {/* Material & Thermal Strategy */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-slate-400 mb-1 font-bold">材料妥协与微型化工艺</div>
                  <div className="text-sm font-bold text-slate-200">
                    {GEAR_MATERIALS[params.materialId]?.name || "工程合金"}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  微型齿轮多用 POM/PEEK 或粉末冶金。注塑模具需预留 1.8%~2.0% 各向异性收缩补偿；高速输入级建议使用 POM 降噪，末级采用粉末冶金抗大堵转扭矩。
                </p>
              </div>

              {/* Production SOP & GD&T Chain */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-slate-400 mb-1 font-bold">量产良率把控与 SOP</div>
                  <div className="text-sm font-bold text-emerald-400">
                    SOP 定量注脂 (0.08g ±0.01g)
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  壳体中心距公差严控在 ±0.012mm，轴跳动 ≤0.008mm。微型齿轮箱严禁盲目多涂油（会导致发热阻力剧增），需采用气动定量点胶。
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
