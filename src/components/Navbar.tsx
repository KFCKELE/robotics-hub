import React from "react";
import { RoboticArmLogo } from "./RoboticArmLogo";
import {
  Compass,
  Layers,
  Calculator,
  ShieldAlert,
  FileText,
  Sparkles,
  Download,
  Radio,
  ListTodo,
  Cpu,
  Boxes,
  Sliders,
  Hand,
  Code2,
  Printer,
  Bot,
  Rotate3d,
  Cog,
  Factory,
  Activity,
} from "lucide-react";

export type NavTabType =
  | "profile"
  | "fea_simulation"
  | "openarm"
  | "openarm_motors"
  | "urdf_generator"
  | "heatsink_generator"
  | "gear_generator"
  | "manufacturing_dfm"
  | "structures"
  | "slicing_3mf"
  | "controllers"
  | "code_translator"
  | "amazing_hand_servo"
  | "servo"
  | "projects"
  | "calculators"
  | "interview"
  | "resume";

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  onOpenAIArchitect: () => void;
  onOpenExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAIArchitect,
  onOpenExport,
}) => {
  // Navigation structure strictly organized by engineering workflow: OpenArm Motor Arm, Aero Hand & AmazingHand, 3MF Slicing
  const navSections = [
    {
      groupName: "机械臂与 3D 制造",
      items: [
        { id: "fea_simulation" as NavTabType, label: "3D 有限元分析 (FEA)", icon: Activity },
        { id: "manufacturing_dfm" as NavTabType, label: "工艺路径与低成本试制", icon: Factory },
        { id: "heatsink_generator" as NavTabType, label: "热学 CAD 散热片生成", icon: Calculator },
        { id: "gear_generator" as NavTabType, label: "精密齿轮副生成器", icon: Cog },
        { id: "urdf_generator" as NavTabType, label: "urdf生成器", icon: Rotate3d },
        { id: "openarm" as NavTabType, label: "OpenArm 任务大纲", icon: ListTodo },
        { id: "openarm_motors" as NavTabType, label: "达妙电机与 CAN 监测", icon: Radio },
        { id: "code_translator" as NavTabType, label: "嵌入式代码翻译器", icon: Code2 },
        { id: "structures" as NavTabType, label: "机械结构与 STP 库", icon: Boxes },
        { id: "slicing_3mf" as NavTabType, label: "3MF 切片与 3D 打印库", icon: Printer },
        { id: "controllers" as NavTabType, label: "FOC 主控套件", icon: Cpu },
      ],
    },
    {
      groupName: "仿生灵巧手 (AmazingHand / Aero Hand)",
      items: [
        { id: "amazing_hand_servo" as NavTabType, label: "灵巧手 7-DoF 绳驱与舵机调零", icon: Sliders },
      ],
    },
    {
      groupName: "工程方案与仿真",
      items: [
        { id: "fea_simulation" as NavTabType, label: "有限元受力云图 (FEA)", icon: Activity },
        { id: "projects" as NavTabType, label: "王牌项目蓝图", icon: Layers },
        { id: "calculators" as NavTabType, label: "力学仿真计算台", icon: Calculator },
      ],
    },
    {
      groupName: "履历与面试",
      items: [
        { id: "profile" as NavTabType, label: "研发档案 & 优势", icon: Compass },
        { id: "interview" as NavTabType, label: "面试攻防题库", icon: ShieldAlert },
        { id: "resume" as NavTabType, label: "STAR 履历精修", icon: FileText },
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md text-slate-200">
      {/* Top Bar: Brand & Main Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13 border-b border-slate-800/60">
          {/* Logo & Title */}
          <div
            onClick={() => setActiveTab("profile")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <RoboticArmLogo size="md" animated={true} />

            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  机械臂结构工程师工作台
                </span>
                <span className="hidden xs:inline px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                  专业工程版
                </span>
              </div>

              <span className="hidden md:inline text-[11px] text-slate-400 font-mono">
                // 6-DoF 刚度构型 · 拓扑轻量化 · 谐波传动量产
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAIArchitect}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm shadow-cyan-500/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>AI 方案构思</span>
            </button>

            <button
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer font-mono"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>导出作品集</span>
            </button>
          </div>
        </div>

        {/* Bottom Tab Navigation Bar: Minimalist, Transparent to Semi-Transparent Hover, Gray Selected */}
        <div className="py-2 pb-2.5 overflow-x-auto flex items-center justify-between gap-3">
          <nav className="flex items-center gap-2 min-w-max">
            {navSections.map((section, sIdx) => (
              <div key={section.groupName} className="flex items-center gap-1">
                {sIdx > 0 && <div className="h-4 w-px bg-slate-800 mx-2" />}
                <span className="hidden lg:inline text-[10px] font-mono font-bold text-slate-400 px-1 select-none">
                  {section.groupName}
                </span>

                <div className="flex items-center gap-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap cursor-pointer select-none border ${
                          isActive
                            ? "bg-slate-800 text-slate-100 font-semibold border-slate-700 shadow-inner"
                            : "bg-transparent text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-slate-200 hover:border-slate-800 active:bg-slate-800 active:text-slate-100 active:scale-[0.98]"
                        }`}
                      >
                        <Icon
                          className={`w-3.5 h-3.5 transition-colors ${
                            isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-300"
                          }`}
                        />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="hidden xl:flex items-center gap-2 text-slate-400 text-[11px] font-mono shrink-0 pl-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>系统就绪</span>
          </div>
        </div>
      </div>
    </header>
  );
};
