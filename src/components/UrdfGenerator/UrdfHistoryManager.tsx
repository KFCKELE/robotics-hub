import React from "react";
import { UrdfHistoryItem } from "./types";
import {
  History,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

interface UrdfHistoryManagerProps {
  history: UrdfHistoryItem[];
  activeHistoryId: string | null;
  onSelectHistoryItem: (item: UrdfHistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearFailedHistory: () => void;
}

export const UrdfHistoryManager: React.FC<UrdfHistoryManagerProps> = ({
  history,
  activeHistoryId,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onClearFailedHistory,
}) => {
  const failedCount = history.filter((h) => h.status === "failed").length;

  if (history.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 space-y-2">
        <History className="w-8 h-8 mx-auto text-slate-600 mb-2" />
        <h4 className="text-sm font-bold text-slate-300">暂无 URDF 生成历史</h4>
        <p className="text-xs text-slate-500 font-mono">
          上传 CAD 装配体或执行重新优化后，每次生成与迭代记录将自动保存在此处
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>URDF 生成与迭代历史库</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                共 {history.length} 条记录
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              可随时切换不同历史版本，一键删除失败或不满意记录，保留满意的黄金版本
            </p>
          </div>
        </div>

        {failedCount > 0 && (
          <button
            onClick={onClearFailedHistory}
            className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/40 rounded-xl text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            title="一键清理所有标注为失败/不通过的版本"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>清理所有未通过版本 ({failedCount})</span>
          </button>
        )}
      </div>

      {/* History Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto pr-1">
        {history.map((item) => {
          const isActive = item.id === activeHistoryId;
          const totalMass = item.robot.links.reduce((s, l) => s + l.inertial.massKg, 0);
          const timeStr = new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          return (
            <div
              key={item.id}
              onClick={() => onSelectHistoryItem(item)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative group ${
                isActive
                  ? "bg-slate-950 border-cyan-500/80 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/40"
                  : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              {/* Top status line */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-500/30">
                    {item.version}
                  </span>
                  {item.status === "success" || item.status === "optimized" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{item.status === "optimized" ? "优化通过" : "生成成功"}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-red-400 bg-red-950/50 px-2 py-0.5 rounded-md border border-red-500/30">
                      <AlertTriangle className="w-3 h-3" />
                      <span>未通过/待调优</span>
                    </span>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteHistoryItem(item.id);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-950 text-slate-400 hover:text-red-300 border border-transparent hover:border-red-500/40 transition-colors"
                  title="删除此条不满意记录"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Title & filename */}
              <div>
                <h4 className="text-xs font-bold text-slate-100 line-clamp-1 group-hover:text-cyan-300 transition-colors">
                  {item.fileName}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 font-sans">
                  {item.notes || item.robot.description}
                </p>
              </div>

              {/* Specs & Metrics */}
              <div className="grid grid-cols-3 gap-1.5 py-1.5 border-t border-b border-slate-800/70 text-[10px] font-mono">
                <div className="text-slate-400">
                  <span className="block text-slate-500">自由度</span>
                  <span className="font-bold text-cyan-300">{item.robot.dof} DoF</span>
                </div>
                <div className="text-slate-400">
                  <span className="block text-slate-500">刚体连杆</span>
                  <span className="font-bold text-slate-200">{item.robot.links.length} Links</span>
                </div>
                <div className="text-slate-400">
                  <span className="block text-slate-500">总质量</span>
                  <span className="font-bold text-emerald-400">
                    {totalMass >= 1 ? `${totalMass.toFixed(2)}kg` : `${(totalMass * 1000).toFixed(0)}g`}
                  </span>
                </div>
              </div>

              {/* Bottom footer */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>生成时间: {timeStr}</span>
                <span className="flex items-center gap-1 text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                  <span>{isActive ? "当前载入中" : "载入此版本"}</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
