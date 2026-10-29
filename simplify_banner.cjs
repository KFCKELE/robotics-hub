const fs = require('fs');
let content = fs.readFileSync('src/components/FEASimulation/FEASimulationHub.tsx', 'utf8');

const oldBanner = `      {/* Top Banner & Title */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-cyan-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 shadow-sm">
                <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>SolidWorks Simulation 3D 有限元仿真工作台</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-purple-950/60 text-purple-300 border border-purple-600/40">
                支持 STP / STEP / STL 导入
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-600/40">
                线性静力学 + 冯·米塞斯云图 + AI 拓扑减重
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              3D 有限元受力分析与结构强度校核 (FEA Studio)
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              自主导入 <strong>.stp / .step / .stl</strong> 三维模型或选择内置典型机械件基准，自由配置<strong>受力面、力的大小（N / kgf）、空间受力方向、固定夹具约束面与工程材料库</strong>。
              实时求解并渲染<strong>冯·米塞斯等效应力云图、合位移形变放大动画、安全系数分布</strong>与 <strong>AI 拓扑减重优化建议</strong>。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAIAdvisorOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI 有限元优化总监</span>
            </button>
            <button
              onClick={() => setIsReportOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>生成工程分析报告</span>
            </button>
          </div>
        </div>
      </div>`;

const newBanner = `      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            FEA Studio / 3D 静力学有限元仿真
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            支持加载 STL / STEP 模型，自定义网格划分与力学边界条件实时求解。
          </p>
        </div>
      </div>`;

content = content.replace(oldBanner, newBanner);
fs.writeFileSync('src/components/FEASimulation/FEASimulationHub.tsx', content);
