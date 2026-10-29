import React, { useState } from "react";
import { RoboticArmLogo } from "./RoboticArmLogo";
import {
  Sparkles,
  Flame,
  ShieldCheck,
  Compass,
  Cpu,
  Radio,
  Layers,
  ArrowRight,
  Zap,
  CheckCircle2,
  RefreshCw,
  Award,
  Terminal,
} from "lucide-react";
import confetti from "canvas-confetti";

const ENGINEERING_CREEDS = [
  {
    highlight: "细节决定成败",
    subtitle: "极致铸就卓越 · 0.01mm 的间隙公差就是机械工程师的尊严",
    enTag: "PRECISION IN EVERY MICRON · RELIABILITY IN EVERY CYCLE",
    spiritDesc: "从行星减速箱的侧隙调校，到双绞线 CAN 总线的屏蔽接地，每一个微小的工程细节，都在定义一台机器人的生死寿命。",
  },
  {
    highlight: "细节决定成败",
    subtitle: "敢啃最硬的非标骨头 · 能打最稳的量产硬仗",
    enTag: "HARDCORE MECHATRONICS · FROM NON-STANDARD TO MASS PRODUCTION",
    spiritDesc: "哪怕历经数十版结构迭代与上千次疲劳寿命验证，也要让每一根腱绳、每一个轴承座达到军工级的可靠度。",
  },
  {
    highlight: "细节决定成败",
    subtitle: "图纸是严谨的契约 · 落地是铁血的攻坚",
    enTag: "BLUEPRINTS AS CONTRACTS · EXECUTION AS REALITY",
    spiritDesc: "把结构力学算透，把 FOC 闭环跑稳。让每一行电机指令精准输出，让每一个连杆动作充满机械美感与力量。",
  },
  {
    highlight: "细节决定成败",
    subtitle: "代码赋予神经 · 力学铸就躯干 · 匠心注入灵魂",
    enTag: "CODE AS NEURONS · MECHANICS AS SKELETON · CRAFT AS SOUL",
    spiritDesc: "向着具身智能与人形机器人的星辰大海进发，用一腔热血与毫米级严谨，造出真正能改变产业的国之重器！",
  },
];

export const FooterCreed: React.FC = () => {
  const [creedIndex, setCreedIndex] = useState<number>(0);
  const [boostCount, setBoostCount] = useState<number>(1);
  const [isSparking, setIsSparking] = useState<boolean>(false);

  const currentCreed = ENGINEERING_CREEDS[creedIndex];

  const handleBoostMorale = () => {
    setIsSparking(true);
    setBoostCount((prev) => prev + 1);
    setCreedIndex((prev) => (prev + 1) % ENGINEERING_CREEDS.length);

    // Blast celebratory golden & cyan sparks
    confetti({
      particleCount: 45,
      spread: 70,
      origin: { y: 0.92 },
      colors: ["#06b6d4", "#38bdf8", "#fbbf24", "#f59e0b", "#10b981"],
    });

    setTimeout(() => setIsSparking(false), 800);
  };

  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-gradient-to-b from-[#090D16] to-[#05070B] text-slate-300 relative overflow-hidden">
      {/* Background Precision Grid & Ambient Aura */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none opacity-60" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-24 bg-gradient-to-b from-cyan-500/10 via-cyan-500/5 to-transparent blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-7 relative z-10 space-y-6">
        {/* Main High-End Engineering Motto Centerpiece */}
        <div className="relative group p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/90 border border-slate-700/60 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/10">
          {/* Engineering CAD Precision Corner Crosshairs */}
          <div className="absolute top-2 left-2 text-cyan-500/40 text-[10px] font-mono select-none pointer-events-none">
            +
          </div>
          <div className="absolute top-2 right-2 text-cyan-500/40 text-[10px] font-mono select-none pointer-events-none">
            +
          </div>
          <div className="absolute bottom-2 left-2 text-cyan-500/40 text-[10px] font-mono select-none pointer-events-none">
            +
          </div>
          <div className="absolute bottom-2 right-2 text-cyan-500/40 text-[10px] font-mono select-none pointer-events-none">
            +
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Left: Inspiring Badge & Core Callout */}
            <div className="space-y-3 text-center lg:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono font-bold tracking-wider uppercase shadow-inner">
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>硬核机电工程师信条 · ENGINEERING MANIFESTO</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                  {currentCreed.enTag}
                </span>
              </div>

              {/* Main Golden/Cyan Typography Motto */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-baseline justify-center lg:justify-start gap-x-3 gap-y-1">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent font-serif sm:font-sans">
                    “ {currentCreed.highlight} ，
                  </h3>
                  <span className="text-base sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                    {currentCreed.subtitle} ”
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed pt-1 font-sans">
                  {currentCreed.spiritDesc}
                </p>
              </div>
            </div>

            {/* Right: Interactive Morale Injector (点燃斗志) */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-2.5 shrink-0">
              <button
                onClick={handleBoostMorale}
                className={`relative px-5 py-3 rounded-xl font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                  isSparking
                    ? "bg-amber-400 text-slate-950 scale-105 shadow-amber-500/50"
                    : "bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 shadow-cyan-500/25"
                }`}
              >
                <Flame className={`w-4 h-4 ${isSparking ? "animate-bounce text-slate-950" : "text-slate-950"}`} />
                <span>点燃研发斗志 · 切换信条</span>
                <RefreshCw className={`w-3.5 h-3.5 text-slate-900 ${isSparking ? "animate-spin" : ""}`} />
              </button>

              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>斗志充能值: <strong className="text-cyan-300 font-bold">LV.{boostCount} · 全力攻坚中</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Telemetry Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-slate-400 border-t border-slate-800/60">
          <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>智能机器人与机电工程研发工作台</span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">OpenArm 达妙 CAN + Amazing Hand 飞特总线全线就绪</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 flex-wrap justify-center">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>就绪运行 // 深圳机电硬件中心</span>
            </span>
            <span className="text-slate-400 flex items-center gap-1.5">
              <RoboticArmLogo size="xs" animated={false} />
              <span>机构工程团队: <strong className="text-cyan-300 font-bold">机械臂研发组 (2026)</strong></span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
