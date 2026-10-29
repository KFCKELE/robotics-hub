import React, { useState } from "react";
import {
  Sparkles,
  X,
  Bot,
  Brain,
  ShieldCheck,
  Zap,
  TrendingDown,
  FileCheck,
  Send,
  Loader2,
  AlertTriangle,
  Lightbulb,
  Cpu,
  Layers,
} from "lucide-react";
import { FEASetupConfig, FEAResultData } from "./types";
import Markdown from "react-markdown";

interface AIAdvisorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: FEASetupConfig;
  results: FEAResultData;
}

export const AIAdvisorDrawer: React.FC<AIAdvisorDrawerProps> = ({
  isOpen,
  onClose,
  config,
  results,
}) => {
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerateAdvisor = async (customPrompt?: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/ai/fea-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelName: config.modelName,
          material: {
            name: config.material.name,
            yieldStrength: config.material.yieldStrengthMPa,
            elasticModulus: config.material.elasticModulusGPa,
            poissonRatio: config.material.poissonRatio,
          },
          loadParams: {
            forceN: config.forceMagnitudeN,
            direction: config.forceDirection,
            loadType: config.loadType,
          },
          constraintParams: {
            fixedFace: config.fixedFaceId,
            description: "基准固定约束面",
          },
          feaResults: {
            maxVonMisesStress: results.maxVonMisesStressMPa,
            yieldStrength: results.yieldStrengthMPa,
            minFOS: results.minSafetyFactor,
            maxDisplacement: results.maxDisplacementMm,
            hotspotLocation: results.hotspotNode.locationDesc,
          },
          userQuestion: customPrompt || userQuestion || "请根据当前有限元云图计算结果，给出结构轻量化减重、消除根部应力集中、以及提高抗弯刚度的专业优化改进方案！",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "AI 分析服务生成失败");
      }
      setAiReport(data.text);
    } catch (err: any) {
      setErrorMsg(err.message || "请求失败，请检查网络或 API Key");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100">AI 有限元结构力学与拓扑减重优化总监</h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono border border-cyan-500/30">
                  Gemini 3.7 FEA Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                针对 {config.modelName} 的冯·米塞斯等效应力 ({results.maxVonMisesStressMPa} MPa) 与安全系数 ({results.minSafetyFactor}) 进行深度力学诊断
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Diagnostic Metrics Bar */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">最大等效应力 σmax</span>
            <span className="text-sm font-bold text-amber-400">{results.maxVonMisesStressMPa} MPa</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">屈服极限 σy</span>
            <span className="text-sm font-bold text-slate-200">{results.yieldStrengthMPa} MPa</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">最小安全系数 FOS</span>
            <span className={`text-sm font-bold ${results.minSafetyFactor < 1.0 ? "text-rose-400" : "text-emerald-400"}`}>
              {results.minSafetyFactor} {results.minSafetyFactor < 1.0 ? "(危险失效)" : "(安全)"}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">最大形变挠度</span>
            <span className="text-sm font-bold text-cyan-400">{results.maxDisplacementMm} mm</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Prompt Presets */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              一键快速结构优化诊断方向：
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleGenerateAdvisor("请重点分析如何消除根部应力集中，并给出过渡圆角R角推荐与有限元网格收敛性验证方案。")}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer"
              >
                🎯 消除根部应力集中与倒角R推荐
              </button>
              <button
                onClick={() => handleGenerateAdvisor("请指出结构中哪些低应力区域可以掏空挖孔，进行拓扑轻量化减重30%而不损失抗弯刚度？")}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer"
              >
                🪶 拓扑轻量化减重30%打孔方案
              </button>
              <button
                onClick={() => handleGenerateAdvisor("请针对当前悬臂位移挠度，建议如何在受力轴线上增加工字或三角形加强筋 (Rib) 以提升刚度？")}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer"
              >
                📐 加强筋 (Rib) 布局与抗弯刚度倍增
              </button>
              <button
                onClick={() => handleGenerateAdvisor("对比 6061-T6 铝合金 CNC 加工 vs PA12-CF 碳纤维 3D打印制造的强度、成本与形变优缺点。")}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer"
              >
                🏭 CNC 铝合金 vs 3D打印制造可行性
              </button>
            </div>
          </div>

          {/* AI Output Content or Placeholder */}
          {loading ? (
            <div className="p-12 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-sm font-semibold text-slate-200">AI 结构总监正在进行有限元力学方程计算与拓扑优化推理...</p>
              <p className="text-xs text-slate-400">正在比对材料屈服准则、评估应力张量并生成结构改进方案...</p>
            </div>
          ) : errorMsg ? (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-700/50 text-rose-300 text-xs flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">分析生成异常</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          ) : aiReport ? (
            <div className="p-6 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm leading-relaxed prose prose-invert max-w-none">
              <div className="markdown-body">
                <Markdown>{aiReport}</Markdown>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-200">点击上方按钮或输入自定义问题，启动 AI 有限元优化诊断</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                AI 将结合当前零件的几何形状、6061-T6/45# 钢力学参数、外加载荷大小与云图极值，为您输出工业级的结构减重与防断裂优化方案。
              </p>
            </div>
          )}
        </div>

        {/* Footer Input Bar */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center gap-3">
          <input
            type="text"
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) handleGenerateAdvisor();
            }}
            placeholder="输入您对当前零件有限元分析的具体疑问（如：在 1000N 载荷下如何保证安全系数 > 2.5？）..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />

          <button
            onClick={() => handleGenerateAdvisor()}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{aiReport ? "重新诊断" : "启动 AI 优化诊断"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
