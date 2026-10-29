import React, { useState } from "react";
import { Sparkles, Loader2, Send, Lightbulb, Copy, Check, Shield, Wrench, Layers } from "lucide-react";
import confetti from "canvas-confetti";

interface AIProjectArchitectProps {
  initialPrompt?: string;
  onClose?: () => void;
}

const PRESET_IDEAS = [
  {
    title: "5指15自由度刚柔耦合微型仿生灵巧手 (双向微型绞盘+柔性触觉传感)",
    target: "灵巧手 / 具身智能执行器",
    desc: "融合球头被动柔顺和腱绳主动传动，掌内集成微型无刷伺服",
  },
  {
    title: "轻量化 6-DOF 协作机器人一体化关节 (集成无框力矩电机+微型双编码器)",
    target: "协作臂精密结构",
    desc: "攻关谐波减速机背隙补偿、热胀冷缩公差隔离与模态刚度优化",
  },
  {
    title: "开源 OpenArm 机械臂工业化高精度金属重构与快换法兰",
    target: "开源硬件工程化",
    desc: "从 3D 打印低精度转为 CNC 铝合金精密制造，建立全套 GD&T 图纸",
  },
  {
    title: "动力锂电方形/软包电芯高速视觉柔性抓取与四点均压化成机构",
    target: "新能源非标自动化",
    desc: "复用精实/恒翼能大客户经验，解决电芯呼吸膨胀与极耳防变形",
  },
];

export const AIProjectArchitect: React.FC<AIProjectArchitectProps> = ({ initialPrompt = "", onClose }) => {
  const [prompt, setPrompt] = useState<string>(initialPrompt);
  const [targetField, setTargetField] = useState<string>("机器人末端灵巧手 / 具身智能执行器");
  const [customRequirements, setCustomRequirements] = useState<string>(
    "突出理论力学公式计算、关键形位公差GD&T、DFM加工经济性以及大厂面试高频追问点"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerate = async (presetPrompt?: string) => {
    const finalPrompt = presetPrompt || prompt;
    if (!finalPrompt.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/project-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          targetField,
          customRequirements,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "生成方案失败");
      }

      setGeneratedPlan(data.text);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setError(err.message || "请求出错，请检查网络或配置");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedPlan) return;
    navigator.clipboard.writeText(generatedPlan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="ai-project-architect-modal" className="bg-slate-900/90 rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-950 p-6 text-slate-100 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white">AI 首席机械架构师 · 智能项目设计工坊</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              基于您的专升本学历跃迁与非标/机器人量产背景，即刻构想硬核可落地的大厂级研发方案
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Preset Inspiration Pills */}
        <div>
          <label className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> 经典高价值方向一键带入
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PRESET_IDEAS.map((idea, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(idea.title);
                  setTargetField(idea.target);
                  handleGenerate(idea.title);
                }}
                className="p-3 text-left rounded-xl border border-slate-800 bg-slate-950/60 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all text-xs group cursor-pointer"
              >
                <div className="font-bold text-slate-200 group-hover:text-cyan-300 line-clamp-1">
                  {idea.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{idea.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              您想构思的项目设想或技术挑战 (Prompt)
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例如：我想设计一款用于人形机器人的绳驱二指夹爪，要求带球头自适应顺应机构，整机重量小于200g，抓取力大于15N，请为我制定完整工程方案..."
              className="w-full text-xs p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono font-semibold text-slate-300 block mb-1">目标应用领域</label>
              <input
                type="text"
                value={targetField}
                onChange={(e) => setTargetField(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:border-cyan-400 outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-mono font-semibold text-slate-300 block mb-1">重点强化维度</label>
              <input
                type="text"
                value={customRequirements}
                onChange={(e) => setCustomRequirements(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:border-cyan-400 outline-none font-mono"
              />
            </div>
          </div>

          <button
            onClick={() => handleGenerate()}
            disabled={loading || !prompt.trim()}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer font-mono"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                正在由 AI 资深机械总监进行动力学建模与方案架构...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                生成完整工业级研发设计方案与答辩要点
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300 font-mono">
            {error}
          </div>
        )}

        {/* Generated Output */}
        {generatedPlan && (
          <div className="mt-6 border border-cyan-500/30 rounded-xl overflow-hidden bg-slate-950/80 shadow-xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                AI 首席工程架构师设计方案书
              </span>

              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "已复制到剪贴板" : "复制全文"}
              </button>
            </div>

            <div className="p-6 text-xs leading-relaxed text-slate-200 whitespace-pre-wrap font-sans max-h-[500px] overflow-y-auto space-y-2">
              {generatedPlan}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
