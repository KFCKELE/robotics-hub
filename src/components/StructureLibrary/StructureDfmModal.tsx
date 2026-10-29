import React, { useState } from "react";
import { X, Sparkles, AlertTriangle, CheckCircle, Cpu, Layers, Hammer } from "lucide-react";
import { MechanicalStructureItem } from "../../types";
import ReactMarkdown from "react-markdown";

interface StructureDfmModalProps {
  structure: MechanicalStructureItem;
  isOpen: boolean;
  onClose: () => void;
}

export const StructureDfmModal: React.FC<StructureDfmModalProps> = ({ structure, isOpen, onClose }) => {
  const [userDoubt, setUserDoubt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reviewResult, setReviewResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunDfmReview = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch("/api/ai/structure-dfm-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          structureName: structure.name,
          category: structure.category,
          material: structure.material,
          process: structure.process,
          dimensions: structure.dimensionsMm,
          bearings: structure.bearingSpecs.join("; "),
          fasteners: structure.fasteners.join("; "),
          userNotes: structure.solidworksTips + " " + (structure.notes || ""),
          userDoubt: userDoubt.trim() || "如何优化该结构的 3D 打印壁厚、层纹受力走向、轴承位公差补偿以及热熔铜螺母安装防松？",
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setReviewResult(data.text);
    } catch (err: any) {
      console.error("DFM review error:", err);
      setErrorMsg(err.message || "请求 AI 评审失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                AI 机械结构 DFM 与可制造性评审
              </h3>
              <p className="text-xs text-slate-400">
                针对「{structure.name}」进行公差配合、层纹受力、轴承装配及加工工艺诊断
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
          {/* Quick Structure Specs summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block">所属部位</span>
              <span className="font-semibold text-slate-200">{structure.category}</span>
            </div>
            <div>
              <span className="text-slate-500 block">目标材料</span>
              <span className="font-semibold text-cyan-400">{structure.material}</span>
            </div>
            <div>
              <span className="text-slate-500 block">制造工艺</span>
              <span className="font-semibold text-emerald-400">{structure.process}</span>
            </div>
            <div>
              <span className="text-slate-500 block">包络尺寸</span>
              <span className="font-semibold text-slate-200">
                {structure.dimensionsMm.length}×{structure.dimensionsMm.width}×{structure.dimensionsMm.height} mm
              </span>
            </div>
          </div>

          {/* User Doubt Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              💡 自定义提问或重点排查诉求 (选填)：
            </label>
            <textarea
              value={userDoubt}
              onChange={(e) => setUserDoubt(e.target.value)}
              placeholder="例如：打印该大臂时，如果使用 PLA-CF，外壳需要几层才能承受 15N·m 冲击力矩？轴承孔需要放量多少？"
              rows={2}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Trigger Button */}
          {!reviewResult && (
            <div className="flex justify-end">
              <button
                onClick={handleRunDfmReview}
                disabled={isLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-lg font-medium text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>资深总工程师深度评审中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>开始 AI DFM 结构与工艺深度评审</span>
                  </>
                )}
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Review Report Display */}
          {reviewResult && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>专家级 DFM 评审报告已生成</span>
                </div>
                <button
                  onClick={handleRunDfmReview}
                  disabled={isLoading}
                  className="text-xs text-slate-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>重新评审</span>
                </button>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 text-xs leading-relaxed text-slate-200 prose prose-invert max-w-none">
                <ReactMarkdown>{reviewResult}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>已内置公差数据库: H7 / js6 / 3D打印内孔热收缩补偿</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          >
            关闭窗口
          </button>
        </div>
      </div>
    </div>
  );
};
