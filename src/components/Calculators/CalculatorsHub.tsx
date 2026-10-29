import React, { useState } from "react";
import { TendonCalculator } from "./TendonCalculator";
import { BallJointCalculator } from "./BallJointCalculator";
import { CobotJointCalculator } from "./CobotJointCalculator";
import { BatteryMechanismCalculator } from "./BatteryMechanismCalculator";
import { Calculator, Orbit, Activity, Cpu, BatteryCharging } from "lucide-react";

export const CalculatorsHub: React.FC = () => {
  const [activeCalc, setActiveCalc] = useState<"tendon" | "ball" | "cobot" | "battery">("tendon");

  const calcTabs = [
    {
      id: "tendon",
      label: "经典开源腱绳驱动灵巧手力学计算器",
      badge: "滑轮差动/Bowden管/伸长",
      icon: Orbit,
      desc: "核算开源绳驱动灵巧手的微型滑轮与Bowden导管包角摩擦损耗、Dyneema腱绳拉伸与差动分流",
    },
    {
      id: "ball",
      label: "Amazing Hand 绞盘与球头掌指应力",
      badge: "飞特舵机/球头副/赫兹应力",
      icon: Activity,
      desc: "仿真 Amazing Hand Capstan 绞盘传动、3-DOF 球头万向副极限包络空间与赫兹接触应力",
    },
    {
      id: "cobot",
      label: "OpenArm 达妙电机协作臂刚度与模态",
      badge: "达妙BLDC/谐波抗振",
      icon: Cpu,
      desc: "计算 OpenArm 达妙电机+谐波关节扭矩负载率与悬臂高速启停残余抖动",
    },
    {
      id: "battery",
      label: "锂电化成压床对中与呼吸补偿",
      badge: "精实/恒翼能公式",
      icon: BatteryCharging,
      desc: "校核滚珠丝杠欧拉失稳临界力、电芯面压与碟簧调平矩阵刚度",
    },
  ];

  return (
    <div id="calculators-hub-section" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-slate-200 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              硬核工程力学与机构设计实时交互仿真台
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              由实战真实公式与量产试验数据驱动，包含微型绳驱、球头万向副、协作臂模态刚度及锂电非标压床 4 大核心力学校核工具。
            </p>
          </div>
        </div>
      </div>

      {/* Calculator Switcher Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {calcTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeCalc === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCalc(tab.id as any)}
              className={`p-4 rounded-xl text-left border transition-all relative cursor-pointer ${
                isSelected
                  ? "bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                  : "bg-slate-900/50 hover:bg-slate-800/60 border-slate-800 text-slate-300 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div
                  className={`p-1.5 rounded-lg border ${
                    isSelected ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {tab.badge}
                </span>
              </div>

              <h4 className={`text-xs font-bold line-clamp-1 ${isSelected ? "text-cyan-300" : "text-slate-100"}`}>
                {tab.label}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {tab.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Calculator Render Area */}
      <div>
        {activeCalc === "tendon" && <TendonCalculator />}
        {activeCalc === "ball" && <BallJointCalculator />}
        {activeCalc === "cobot" && <CobotJointCalculator />}
        {activeCalc === "battery" && <BatteryMechanismCalculator />}
      </div>
    </div>
  );
};
