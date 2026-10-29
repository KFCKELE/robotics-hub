import React, { useState } from "react";
import {
  Sparkles,
  X,
  Clock,
  Target,
  BookOpen,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  Calendar,
} from "lucide-react";

interface AITaskPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AITaskPlannerModal: React.FC<AITaskPlannerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [userGoal, setUserGoal] = useState<string>(
    "我是零基础机电背景，希望为后续制作 OpenArm 做足准备，重点攻克机械 DFM 装配配合与嵌入式同事常改的代码（通信协议、PID调参、零点标定）。"
  );
  const [dailyHours, setDailyHours] = useState<number>(2);
  const [targetFocus, setTargetFocus] = useState<string>(
    "机械公差装配 + 串口半双工协议 + PID抗振调参 + 嵌入式同事常改代码解读"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [aiPlan, setAiPlan] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGeneratePlan = async () => {
    setLoading(true);
    setAiPlan("");

    try {
      const res = await fetch("/api/ai/openarm-task-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "plan_generator",
          userGoal,
          dailyHours,
          targetFocus,
        }),
      });

      const data = await res.json();
      if (data.text) {
        setAiPlan(data.text);
      } else {
        setAiPlan("未能生成计划，请检查后台网络或配置。");
      }
    } catch (e: any) {
      setAiPlan(`计划生成失败: ${e.message || "未知错误"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(aiPlan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Gemini AI · OpenArm 零基础定制学习与研发排程</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                  AI ARCHITECT
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                根据你的每日可支配时长与攻坚重点，智能推演最适配的机械与嵌入式协同进阶路线
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                个人目标与背景描述：
              </label>
              <textarea
                rows={3}
                value={userGoal}
                onChange={(e) => setUserGoal(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 font-mono outline-none focus:border-cyan-400 leading-relaxed"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  每日可投入学习/研发时间：
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map((h) => (
                    <button
                      type="button"
                      key={h}
                      onClick={() => setDailyHours(h)}
                      className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        dailyHours === h
                          ? "bg-cyan-500 text-slate-950 shadow-sm"
                          : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                      }`}
                    >
                      {h} 小时/天
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  重点攻坚方向：
                </label>
                <input
                  type="text"
                  value={targetFocus}
                  onChange={(e) => setTargetFocus(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? "AI 深度推演学习排程中..." : "生成定制 OpenArm 任务排程"}</span>
            </button>
          </div>

          {/* AI Result Box */}
          {aiPlan && (
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/60 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 font-bold text-cyan-300 text-xs font-mono">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>AI 定制研发排程方案：</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
                  <span>{copied ? "已复制" : "复制排程"}</span>
                </button>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap max-h-72 overflow-y-auto">
                {aiPlan}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
