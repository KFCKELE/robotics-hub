import React, { useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
  Layers,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { OpenArmTask } from "../../types";

interface UrgentTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    title: string;
    description: string;
    estimatedMinutes: number;
    postponeDays: number;
    keyPoints?: string[];
  }) => void;
  pendingTasksCount: number;
}

export const UrgentTaskModal: React.FC<UrgentTaskModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  pendingTasksCount,
}) => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [estimatedHours, setEstimatedHours] = useState<number>(3);
  const [postponeDays, setPostponeDays] = useState<number>(1);
  const [isAiSuggesting, setIsAiSuggesting] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");

  if (!isOpen) return null;

  const presetUrgentTasks = [
    {
      title: "产线 3 号工位舵机批量异响与堵转紧急排查",
      desc: "排查 3D 打印件同轴度偏差导致的机械咬死与减速齿轮扫齿，实测工作电流并评估是否需要加大齿轮间隙或软限位。",
      hours: 4,
      days: 1,
    },
    {
      title: "配合嵌入式同事修改串口波特率与 DMA 接收中断",
      desc: "协助软件同事抓取 1Mbps 串口波形，确认单线半双工方向切换 5us 延时，联调 6 轴 SyncWrite 丢包问题。",
      hours: 3,
      days: 1,
    },
    {
      title: "机械臂大臂轻量化拓扑优化改版评审",
      desc: "紧急修改 SolidWorks J2 连杆模型，加厚关键受力肋板并重新出工程图，配合下发打样。",
      hours: 5,
      days: 2,
    },
  ];

  const handleApplyPreset = (preset: typeof presetUrgentTasks[0]) => {
    setTitle(preset.title);
    setDescription(preset.desc);
    setEstimatedHours(preset.hours);
    setPostponeDays(preset.days);
  };

  const handleRequestAiAdvice = async () => {
    if (!title.trim()) return;
    setIsAiSuggesting(true);
    setAiAnalysis("");

    try {
      const res = await fetch("/api/ai/openarm-task-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "urgent_reschedule",
          urgentTask: `${title} - ${description}`,
        }),
      });

      const data = await res.json();
      if (data.text) {
        setAiAnalysis(data.text);
      }
    } catch (e: any) {
      setAiAnalysis(`获取建议失败: ${e.message}`);
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onConfirm({
      title,
      description: description || "高优先级紧急事项，已自动顺延常规学习任务。",
      estimatedMinutes: estimatedHours * 60,
      postponeDays,
      keyPoints: [
        `加急处理事项: ${title}`,
        "处理完毕后点击【完成任务】，系统将无缝恢复常规 OpenArm 任务进度",
      ],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>插入高优先级加急事务 & 智能自动顺延</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                  PRIORITY SHIFT
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                当你有临时突发工作时，插入此任务，当前 {pendingTasksCount} 个未完成任务将自动向后顺延
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

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Quick Presets */}
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1.5">
              快速载入常见工程加急场景：
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {presetUrgentTasks.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 text-left text-xs transition-all cursor-pointer group"
                >
                  <div className="font-bold text-slate-200 group-hover:text-amber-300 line-clamp-1 mb-1">
                    {preset.title}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    预估 {preset.hours} 小时 · 顺延 {preset.days} 天
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1">
              加急事务名称 <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如: 紧急解决 J2 关节大负载下垂发烫问题"
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 font-mono outline-none focus:border-amber-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1">
              事务具体描述与排查要点 (选填)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要记录现象、涉及的机械构件或通信代码模块..."
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 font-mono outline-none focus:border-amber-400 leading-relaxed"
            />
          </div>

          {/* Sliders: Hours & Postpone Days */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  预计加急处理耗时:
                </span>
                <span className="font-bold text-amber-400">{estimatedHours} 小时</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  后续任务自动顺延天数:
                </span>
                <span className="font-bold text-cyan-400">+{postponeDays} 天</span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                value={postponeDays}
                onChange={(e) => setPostponeDays(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>

          {/* Rollover Dynamic Timeline Preview */}
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs space-y-2">
            <div className="font-bold text-amber-300 font-mono flex items-center gap-1.5">
              <ArrowRight className="w-4 h-4 text-amber-400" />
              <span>智能顺延影响预演：</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              插入后，加急任务将排在【今日优先执行】位置。现有未完成的 <strong className="text-amber-300">{pendingTasksCount} 个常规研发任务</strong> 将自动顺延 <strong className="text-cyan-300">+{postponeDays} 天</strong>，且系统会保留其所有进度与清单，待加急事务完成后无缝继续推进！
            </p>
          </div>

          {/* AI Advisor Button */}
          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={handleRequestAiAdvice}
              disabled={isAiSuggesting || !title.trim()}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 disabled:text-slate-600 cursor-pointer"
            >
              {isAiSuggesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>AI 分析加急处置思路</span>
            </button>
          </div>

          {/* AI Analysis Preview */}
          {aiAnalysis && (
            <div className="p-3.5 bg-slate-950 rounded-xl border border-cyan-900/50 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              <div className="font-bold text-cyan-300 font-mono mb-1">
                AI 应急处置与顺延评估：
              </div>
              {aiAnalysis}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>确认插队并自动顺延后续任务</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
