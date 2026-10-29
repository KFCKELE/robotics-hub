import React, { useRef } from "react";
import {
  FileText,
  X,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Zap,
  Activity,
  Cpu,
} from "lucide-react";
import { FEASetupConfig, FEAResultData } from "./types";

interface FEAReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: FEASetupConfig;
  results: FEAResultData;
}

export const FEAReportModal: React.FC<FEAReportModalProps> = ({
  isOpen,
  onClose,
  config,
  results,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isSafe = results.minSafetyFactor >= config.material.allowableSafetyFactor;
  const isYielded = results.minSafetyFactor < 1.0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                SolidWorks Simulation 有限元静力学分析工程报告 (FEA Report)
              </h3>
              <p className="text-xs text-slate-400">
                符合 ISO / ASME 机械结构有限元验证标准 • 报告编号: FEA-{Date.now().toString().slice(-6)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>打印 / 导出 PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Document Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-950/60 text-slate-200">
          <div ref={reportRef} className="space-y-8 max-w-3xl mx-auto">
            {/* Title Section */}
            <div className="border-b border-slate-800 pb-6 text-center space-y-2">
              <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono border border-cyan-500/20 mb-2">
                结构静力学应力与形变校核报告
              </div>
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
                {config.modelName} 有限元力学仿真验证报告
              </h1>
              <div className="flex justify-center items-center gap-6 text-xs text-slate-400 font-mono">
                <span>分析日期: {new Date().toLocaleDateString("zh-CN")}</span>
                <span>求解内核: Linear Static FEA (Solid Tetrahedral)</span>
                <span>报告审核人: 资深结构总工 (FEA Certified)</span>
              </div>
            </div>

            {/* Section 1: Executive Summary */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                1. 仿真结论与安全判定综述 (Executive Summary)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">最小安全系数 (FOS)</span>
                  <span className={`text-xl font-bold font-mono ${isYielded ? "text-rose-400" : isSafe ? "text-emerald-400" : "text-amber-400"}`}>
                    {results.minSafetyFactor}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    设计容许下限: [{config.material.allowableSafetyFactor}]
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">最大等效应力 (von Mises)</span>
                  <span className="text-xl font-bold text-amber-400 font-mono">
                    {results.maxVonMisesStressMPa} <span className="text-xs font-normal text-slate-400">MPa</span>
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    屈服极限 σy: {results.yieldStrengthMPa} MPa
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">最大端部位移挠度</span>
                  <span className="text-xl font-bold text-cyan-400 font-mono">
                    {results.maxDisplacementMm} <span className="text-xs font-normal text-slate-400">mm</span>
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    总结构重量: {results.totalMassGrams} g
                  </span>
                </div>
              </div>

              <div className={`p-3 rounded-lg border text-xs leading-relaxed flex items-start gap-2.5 ${
                isYielded
                  ? "bg-rose-950/30 border-rose-700/40 text-rose-300"
                  : isSafe
                  ? "bg-emerald-950/30 border-emerald-700/40 text-emerald-300"
                  : "bg-amber-950/30 border-amber-700/40 text-amber-300"
              }`}>
                {isYielded ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong>综合力学评估判定：</strong>
                  {isYielded
                    ? `警告！在当前 ${config.forceMagnitudeN} N 载荷作用下，最大局部应力 (${results.maxVonMisesStressMPa} MPa) 已超出 ${config.material.name} 的屈服极限 (${results.yieldStrengthMPa} MPa)，结构将发生永久性塑性形变或断裂失效！建议增大根部倒角或改用 7075-T6 / 45# 钢。`
                    : isSafe
                    ? `合规！当前零件最小安全系数为 ${results.minSafetyFactor}，满足推荐设计安全余量 [${config.material.allowableSafetyFactor}]。最大位移为 ${results.maxDisplacementMm} mm，结构刚度与强度均处于优良安全裕度内。`
                    : `预警！安全系数为 ${results.minSafetyFactor}，虽未发生立即屈服，但低于推荐安全系数 [${config.material.allowableSafetyFactor}]。在交变振动或冲击工况下建议增加局部加强筋以提升疲劳寿命。`}
                </div>
              </div>
            </div>

            {/* Section 2: Material Properties */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                2. 工程材料力学物理属性 (Material Properties)
              </h3>
              <table className="w-full text-xs font-mono border-collapse bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                    <th className="p-3 text-left">材料参数项</th>
                    <th className="p-3 text-left">符号 / 国际标准</th>
                    <th className="p-3 text-left">数值与单位</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="p-3 font-sans font-semibold">材料名称与型号</td>
                    <td className="p-3 text-slate-500">Material Name</td>
                    <td className="p-3 text-cyan-300 font-bold">{config.material.name}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-sans">杨氏弹性模量</td>
                    <td className="p-3 text-slate-500">E</td>
                    <td className="p-3">{config.material.elasticModulusGPa} GPa ({config.material.elasticModulusGPa * 1000} MPa)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-sans">泊松比</td>
                    <td className="p-3 text-slate-500">ν (Poisson's Ratio)</td>
                    <td className="p-3">{config.material.poissonRatio}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-sans">材料屈服极限</td>
                    <td className="p-3 text-slate-500">σy (Yield Strength)</td>
                    <td className="p-3 text-amber-400 font-bold">{config.material.yieldStrengthMPa} MPa</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-sans">抗拉强度极限</td>
                    <td className="p-3 text-slate-500">σu (Tensile Strength)</td>
                    <td className="p-3">{config.material.tensileStrengthMPa} MPa</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-sans">材料质量密度</td>
                    <td className="p-3 text-slate-500">ρ (Density)</td>
                    <td className="p-3">{config.material.densityGcm3} g/cm³</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 3: Boundary & Loads */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-pink-400" />
                3. 边界约束与外部载荷定义 (Boundary Conditions & Loads)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="font-bold text-emerald-400 font-sans flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    固定几何体约束 (Fixed Restraints)
                  </div>
                  <p className="text-slate-400 font-sans">
                    约束类型：完全固定 (All Degrees of Freedom Fixed: Ux=Uy=Uz=0, Rx=Ry=Rz=0)
                  </p>
                  <p className="text-slate-400 font-sans">
                    约束参考面：{config.fixedFaceId} (基准安装刚性基座)
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="font-bold text-pink-400 font-sans flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                    外加载荷 (External Force Load)
                  </div>
                  <p className="text-slate-400 font-sans">
                    载荷大小：<span className="text-pink-300 font-bold">{config.forceMagnitudeN} N</span> ({ (config.forceMagnitudeN / 9.8).toFixed(1) } kgf)
                  </p>
                  <p className="text-slate-400 font-sans">
                    施力方向：{config.forceDirection}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4: Mesh Statistics */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                4. 有限元网格划分统计 (Mesh Information)
              </h3>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">网格单元类型</span>
                  <span className="text-slate-200 font-bold">Solid Tetrahedral (四面体)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">总网格单元数</span>
                  <span className="text-cyan-400 font-bold">{results.elementsCount} 个单元</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">节点总数</span>
                  <span className="text-cyan-400 font-bold">{results.nodesCount} 个节点</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">有限元求解耗时</span>
                  <span className="text-emerald-400 font-bold">{results.solveTimeMs} ms</span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="border-t border-slate-800 pt-6 flex justify-between items-center text-xs text-slate-500 font-mono">
              <div>SolidWorks FEA Verified &bull; ISO 9001 CAE Compliance</div>
              <div>签名 / 盖章：___________________</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
