import React from "react";
import { initialUserProfile as userProfileData } from "../data/profileData";
import { RoboticArmLogo } from "./RoboticArmLogo";
import {
  GraduationCap,
  Briefcase,
  Award,
  Zap,
  Target,
  Sparkles,
  TrendingUp,
  Cpu,
  Layers,
  ShieldCheck,
  Building,
} from "lucide-react";

interface ProfileOverviewProps {
  onSelectProjectTab: () => void;
  onSelectCalculatorTab: () => void;
}

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  onSelectProjectTab,
  onSelectCalculatorTab,
}) => {
  return (
    <div id="profile-overview-section" className="space-y-8">
      {/* Top Banner Card - High-tech Control Deck */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 sm:p-8 text-slate-200 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-cyan-950/50 text-cyan-400 border border-cyan-800/60">
                机械臂结构工程师 · 6-DoF 刚度构型
              </span>
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-slate-800 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                百台级微型绳驱机械手量产交付验证
              </span>
            </div>

            {/* Profile Title with Integrated Robotic Arm Logo Badge */}
            <div className="flex items-center gap-4">
              <RoboticArmLogo size="xl" animated={true} />

              <div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                  <span className="text-cyan-400 italic">机械臂结构工程师</span>
                  <span className="text-slate-600 font-light text-xl sm:text-3xl">/</span>
                  <span className="text-white text-xl sm:text-3xl font-bold">
                    研发档案与工程工作台
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
                  // 运动学链 · 拓扑减重 · 谐波传动 · 非标自动化
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              从专科<strong className="text-cyan-300">新能源汽车技术</strong>，到统招本科<strong className="text-cyan-300">机械电子工程</strong>学术跃迁，先后在<strong className="text-slate-100">富喜康精密</strong>（精实/恒翼能/广州擎天锂电自动化改良）与<strong className="text-slate-100">卓研智创</strong>（球头机械手、OpenArm精密结构、协作臂刚度优化、绳驱量产落地）一线攻坚，沉淀出极其稀缺的“工艺理解 + 非标爆发力 + 机械臂精密机构量产”三位一体研发实力。
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onSelectProjectTab}
                className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>浏览 4 大王牌项目方案库</span>
                <span>→</span>
              </button>
              <button
                onClick={onSelectCalculatorTab}
                className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-slate-700 transition-all cursor-pointer font-mono"
              >
                打开工程计算器与力学仿真 →
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-950/60 backdrop-blur-md rounded-xl p-5 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Target className="w-4 h-4 text-cyan-400" /> 核心求职对标企业与薪资定位
            </h3>

            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">机器人灵巧手 / 具身智能：</span>
                <span className="font-bold text-cyan-300">大疆、宇树、智元、星动纪元</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">高端工控 / 自动化巨头：</span>
                <span className="font-bold text-emerald-300">汇川技术、先导智能、拓斯达</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">新能源主机厂与三电研发：</span>
                <span className="font-bold text-amber-300">比亚迪、宁德时代、中创新航</span>
              </div>
            </div>

            <div className="p-3 bg-cyan-950/30 rounded-lg border border-cyan-900/50 mt-2">
              <p className="text-[11px] text-cyan-200 italic leading-snug">
                “独立解决行业头部客户锂电化成与机器人精密机构瓶颈，一次良品率提升 5.8%。”
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Strategic Differentiators */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>核心技术壁垒与差异化优势</span>
            <span className="text-xs text-cyan-400 font-mono font-normal">// 核心研发支柱</span>
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-700/50 to-transparent ml-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {userProfileData.competitiveAdvantages.map((adv, idx) => (
            <div
              key={idx}
              className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50 relative overflow-hidden hover:border-cyan-500/40 transition-colors"
            >
              <div className="absolute top-0 right-0 p-3 text-4xl font-bold font-mono text-slate-700/20 select-none">
                0{idx + 1}
              </div>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold text-xs mb-3 font-mono">
                {String.fromCharCode(65 + idx)}
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-2">
                {adv.title}
              </h3>
              <p className="text-xs leading-relaxed text-slate-400">
                {adv.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Career Trajectory Timeline */}
      <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-100">
              教育背景与职业实战成长历程 (成长里程碑)
            </h2>
          </div>
          <span className="text-xs text-cyan-400 font-mono">2024-2026 履历记录</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Phase 1 */}
          <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-3xl font-bold font-mono text-slate-700/20">
              01
            </div>
            <h3 className="text-cyan-400 text-xs font-bold font-mono mb-1 uppercase">2024 年 专科毕业</h3>
            <div className="text-sm font-semibold text-slate-100 mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              佛山职业技术学院
            </div>
            <div className="text-xs font-medium text-slate-300 mb-2">新能源汽车技术专业 (专科)</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              扎实打下动力电池PACK结构、高压电控、整车线束布置与底盘机械传动基础。
            </p>
          </div>

          {/* Phase 2 */}
          <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-3xl font-bold font-mono text-slate-700/20">
              02
            </div>
            <h3 className="text-cyan-400 text-xs font-bold font-mono mb-1 uppercase">2024.09 - 2025.06</h3>
            <div className="text-sm font-semibold text-slate-100 mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              广东理工学院
            </div>
            <div className="text-xs font-medium text-slate-300 mb-2">机械电子工程专业 (统招专升本)</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              系统修习理论力学、材料力学、机械设计原理、机电传动与 3D SolidWorks/FEA 仿真设计。
            </p>
          </div>

          {/* Phase 3 */}
          <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-3xl font-bold font-mono text-slate-700/20">
              03
            </div>
            <h3 className="text-cyan-400 text-xs font-bold font-mono mb-1 uppercase">2025.06 - 2025.12</h3>
            <div className="text-sm font-semibold text-slate-100 mb-1 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-cyan-400" />
              深圳市富喜康精密机械
            </div>
            <div className="text-xs font-medium text-slate-300 mb-2">非标自动化设计工程师</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              主导精实、广州擎天、恒翼能等化成分容压床改良，一次良品率提升 5.8%，大幅缩短交付周期。
            </p>
          </div>

          {/* Phase 4 */}
          <div className="bg-slate-800/40 p-5 rounded-xl border border-cyan-500/40 relative overflow-hidden shadow-sm shadow-cyan-500/5">
            <div className="absolute top-0 right-0 p-2 text-3xl font-bold font-mono text-cyan-500/20">
              04
            </div>
            <h3 className="text-cyan-400 text-xs font-bold font-mono mb-1 uppercase">2026.01 - 至今</h3>
            <div className="text-sm font-semibold text-slate-100 mb-1 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              深圳卓研智创科技
            </div>
            <div className="text-xs font-medium text-slate-300 mb-2">机器人机械结构研发工程师</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              主导球头机械手、OpenArm精密化重构、协作臂刚度优化与绳驱机械手百台级批量交付。
            </p>
          </div>
        </div>
      </div>

      {/* Technical Skill Matrix Grid */}
      <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>全栈工程技术掌控力矩阵 (技术能力清单)</span>
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 bg-slate-800 text-[10px] rounded border border-slate-700 text-slate-300 font-mono">SolidWorks 三维建模</span>
            <span className="px-2 py-0.5 bg-slate-800 text-[10px] rounded border border-slate-700 text-slate-300 font-mono">GD&T 公差配合</span>
            <span className="px-2 py-0.5 bg-slate-800 text-[10px] rounded border border-slate-700 text-slate-300 font-mono">FEA 有限元分析</span>
            <span className="px-2 py-0.5 bg-slate-800 text-[10px] rounded border border-slate-700 text-slate-300 font-mono">Capstan 绳轮绞盘</span>
            <span className="px-2 py-0.5 bg-slate-800 text-[10px] rounded border border-slate-700 text-slate-300 font-mono">五轴 CNC 精密加工</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <span className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider block">机构学与精密传动</span>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>• Capstan 绳轮绞盘驱动与预紧设计</li>
              <li>• 球头万向副空间运动锥角与赫兹应力</li>
              <li>• 谐波/RV减速机与双编码器消隙配置</li>
              <li>• 滚珠丝杠与高刚度直线导轨选型校核</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <span className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider block">DFM / GD&T 制造工艺</span>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>• 航空铝 7075-T6 精密五轴 CNC 加工</li>
              <li>• H7/h6, H6/h5 微米级公差带配合设计</li>
              <li>• 阳极硬质氧化、微弧氧化耐磨工艺</li>
              <li>• 自润滑 PEEK / 锡青铜滑动衬套设计</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <span className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider block">力学仿真与动态分析</span>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>• 静力学强度与疲劳安全系数评估</li>
              <li>• 协作臂连杆拓扑优化与轻量化</li>
              <li>• 机械系统一阶模态共振规避</li>
              <li>• 欧拉细长杆压杆失稳极限力学计算</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <span className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider block">量产工程与供应链整合</span>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>• 非标自动化设备装配工装夹具开发</li>
              <li>• 电芯化成压床面压测试与呼吸补偿</li>
              <li>• 批量交付装配 SOP 标准化制定</li>
              <li>• 关键核心零组件国产化降本替换</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
