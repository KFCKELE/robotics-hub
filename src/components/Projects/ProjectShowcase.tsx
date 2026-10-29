import React, { useState } from "react";
import { ProjectProposal } from "../../types";
import { defaultProjectProposals } from "../../data/projectProposals";
import {
  Layers,
  Calculator,
  Wrench,
  FileSpreadsheet,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Check,
  Tag,
  Cpu,
  BookOpen,
} from "lucide-react";

interface ProjectShowcaseProps {
  onOpenAIArchitect: (presetIdea?: string) => void;
}

export const ProjectShowcase: React.FC<ProjectShowcaseProps> = ({ onOpenAIArchitect }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(defaultProjectProposals[0].id);
  const [activeTab, setActiveTab] = useState<"arch" | "math" | "dfm" | "bom" | "interview">("arch");

  const currentProject = defaultProjectProposals.find((p) => p.id === selectedProjectId) || defaultProjectProposals[0];

  return (
    <div id="project-blueprints-section" className="space-y-6">
      {/* Category Header & AI Architect Quick Launcher */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-slate-200 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-cyan-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/50 text-cyan-400 border border-cyan-800/60 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> 核心竞争力项目库 // TOP-TIER BLUEPRINTS
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              机器人与机电研发王牌项目方案库
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              结合新能源汽车、锂电非标自动化（精实/恒翼能/擎天）、球头机械手、OpenArm结构重构与绳驱灵巧手百台量产交付实战经验，量身打造的高技术含金量工程蓝图。
            </p>
          </div>

          <button
            onClick={() => onOpenAIArchitect()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950" /> AI 智能定制全新项目方案
          </button>
        </div>
      </div>

      {/* Project Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {defaultProjectProposals.map((proj, pIdx) => {
          const isSelected = proj.id === selectedProjectId;
          return (
            <button
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`p-4 rounded-xl text-left border transition-all relative cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-slate-800/95 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                  : "bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 text-slate-300 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-bold text-slate-400">0{pIdx + 1}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                      {proj.category}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                      proj.difficulty === "总监级旗舰"
                        ? "bg-rose-950/60 text-rose-400 border border-rose-800/60"
                        : proj.difficulty === "高级进阶"
                        ? "bg-cyan-950/60 text-cyan-300 border border-cyan-800/60"
                        : "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                    }`}
                  >
                    {proj.difficulty}
                  </span>
                </div>

                <h4 className={`text-sm font-bold leading-snug line-clamp-2 ${isSelected ? "text-cyan-300" : "text-slate-100"}`}>
                  {proj.title}
                </h4>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {proj.summary}
                </p>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className={isSelected ? "font-bold text-cyan-400" : "text-slate-400"}>
                  {isSelected ? "当前选定方案" : "点击切换方案"}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? "text-cyan-400 translate-x-0.5" : "text-slate-400"} transition-transform`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Project Blueprint Card */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
        {/* Project Title Banner */}
        <div className="p-6 bg-slate-900/90 border-b border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-cyan-500 text-slate-950">
                {currentProject.highlightBadge}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                类别: {currentProject.category} | 难度: {currentProject.difficulty}
              </span>
            </div>

            <button
              onClick={() => onOpenAIArchitect(currentProject.title)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-800 border border-slate-700 text-cyan-300 hover:bg-slate-700 hover:text-cyan-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              基于此项目衍生扩展
            </button>
          </div>

          <h3 className="text-xl font-bold text-slate-100">
            {currentProject.title}
          </h3>

          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            {currentProject.summary}
          </p>

          <div className="mt-3 p-3 rounded-lg bg-cyan-950/30 border border-cyan-900/50 text-xs text-cyan-200">
            <span className="font-bold text-cyan-400">📌 背景与履历契合点：</span>
            {currentProject.backgroundMotivation}
          </div>
        </div>

        {/* Blueprint Sub-Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/70 overflow-x-auto">
          {[
            { id: "arch", label: "机构架构与动力配置", icon: Layers },
            { id: "math", label: "理论力学与工程选型计算", icon: Calculator },
            { id: "dfm", label: "制造工艺与 DFM/GD&T", icon: Wrench },
            { id: "bom", label: "详细 BOM 清单与成本", icon: FileSpreadsheet },
            { id: "interview", label: "面试高频深挖与满分话术", icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3.5 px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? "border-cyan-400 text-cyan-400 bg-cyan-950/20"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Blueprint Tab Content */}
        <div className="p-6">
          {/* TAB 1: Architecture & Actuators */}
          {activeTab === "arch" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
                    机构类型与自由度 (Kinematics & DOF)
                  </h4>
                  <div className="text-sm font-bold text-slate-100 mb-1">
                    {currentProject.mechanicalArchitecture.mechanismType}
                  </div>
                  <div className="text-xs text-cyan-400 font-mono font-semibold">
                    有效自由度: {currentProject.mechanicalArchitecture.degreesOfFreedom} DOF
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
                    传动系统与腱绳/减速机构 (Transmission)
                  </h4>
                  <div className="text-sm font-bold text-slate-100">
                    {currentProject.mechanicalArchitecture.transmissionType}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
                    执行器与传感配置 (Actuators & Sensors)
                  </h4>
                  <div className="text-sm font-bold text-slate-100">
                    {currentProject.mechanicalArchitecture.actuatorType}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
                    主要结构材料与外形包络 (Materials & Dimensions)
                  </h4>
                  <div className="text-xs text-slate-300 space-y-1 mb-2">
                    {currentProject.mechanicalArchitecture.materials.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    尺寸规格: {currentProject.mechanicalArchitecture.keyDimensions}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Engineering Calculations */}
          {activeTab === "math" && (
            <div className="space-y-6">
              {currentProject.engineeringCalculations.map((calc, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-100">
                      公式 {idx + 1}: {calc.formulaName}
                    </h4>
                    <span className="px-2.5 py-1 rounded font-mono text-xs font-bold bg-slate-900 border border-slate-700 text-cyan-400">
                      {calc.formulaExpr}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-2">
                    {calc.parameters.map((param, pIdx) => (
                      <div key={pIdx} className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                        <div className="text-[11px] font-bold text-slate-300">{param.name}</div>
                        <div className="text-sm font-mono font-bold text-cyan-400 mt-0.5">
                          {param.value} <span className="text-xs font-normal text-slate-400">{param.unit}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{param.desc}</div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-emerald-950/30 rounded-lg border border-emerald-900/50 text-xs text-emerald-300 flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">校核结论：</span>
                      {calc.calculationConclusion}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: DFM & Manufacturing */}
          {activeTab === "dfm" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-3">
                <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-cyan-400" />
                  关键形位公差 (Critical GD&T)
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {currentProject.dfmAndManufacturing.criticalTolerances.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-3">
                <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  加工工艺与表面处理 (Machining & Surface)
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {currentProject.dfmAndManufacturing.machiningProcesses.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-3">
                <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  量产成本优化技巧 (Cost Optimization)
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {currentProject.dfmAndManufacturing.costOptimizationTips.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-3">
                <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  装配与测试治具规范 (Assembly & Jigs)
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {currentProject.dfmAndManufacturing.assemblyNotes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: Detailed BOM */}
          {activeTab === "bom" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-800/80 text-slate-300 font-mono border-b border-slate-700">
                  <tr>
                    <th className="p-3">零件名称</th>
                    <th className="p-3">规格型号 / 技术参数</th>
                    <th className="p-3 text-center">数量</th>
                    <th className="p-3">主要材质</th>
                    <th className="p-3 text-right">参考单价</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                  {currentProject.bomList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-slate-200">{item.partName}</td>
                      <td className="p-3 font-mono text-slate-400">{item.spec}</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-300">{item.qty}</td>
                      <td className="p-3 text-slate-400">{item.material}</td>
                      <td className="p-3 text-right font-mono font-bold text-cyan-400">{item.estimatedCost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: Interview Defense Points */}
          {activeTab === "interview" && (
            <div className="space-y-4">
              {currentProject.interviewDefensePoints.map((item, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{item.question}</h4>
                      <div className="text-xs text-rose-400 font-mono mt-0.5">
                        ⚠️ 面试官考察陷阱：{item.interviewerTrap}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 text-xs leading-relaxed text-slate-300 space-y-1">
                    <div className="font-bold text-cyan-400 font-mono flex items-center gap-1.5 mb-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> 资深总监级教科书答辩范例 (STAR架构)：
                    </div>
                    <p className="whitespace-pre-line text-slate-300 leading-relaxed">{item.goldenAnswer}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
