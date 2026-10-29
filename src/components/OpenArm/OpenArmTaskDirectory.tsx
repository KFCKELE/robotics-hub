import React, { useState, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  ListTodo,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Code2,
  CheckSquare,
  Square,
  HelpCircle,
  TrendingUp,
  Cpu,
  Layers,
  FastForward,
  ShieldCheck,
  Award,
  ExternalLink,
} from "lucide-react";
import {
  OpenArmTask,
  OpenArmTaskStageId,
} from "../../types";
import {
  OPENARM_STAGE_METAS,
  loadSavedOpenArmTasks,
  saveOpenArmTasks,
  autoRolloverUnfinishedTasks,
  insertUrgentTaskAndPostponeOthers,
  postponeAllPendingTasks,
  formatDate,
  addDaysToDateStr,
  getInitialOpenArmTasks,
} from "../../data/openarmTasksData";
import { EmbeddedCodeInspector } from "./EmbeddedCodeInspector";
import { UrgentTaskModal } from "./UrgentTaskModal";
import { AITaskPlannerModal } from "./AITaskPlannerModal";

export const OpenArmTaskDirectory: React.FC = () => {
  const [tasks, setTasks] = useState<OpenArmTask[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<"tasks" | "code_inspector">("tasks");
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "today" | "pending" | "postponed" | "urgent" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  // Modals
  const [isUrgentModalOpen, setIsUrgentModalOpen] = useState<boolean>(false);
  const [isAITaskModalOpen, setIsAITaskModalOpen] = useState<boolean>(false);
  const [rolloverNotice, setRolloverNotice] = useState<string>("");

  const todayStr = useMemo(() => formatDate(new Date()), []);

  // Initialize and auto-rollover on mount
  useEffect(() => {
    const loaded = loadSavedOpenArmTasks();
    const { updatedTasks, rolledOverCount } = autoRolloverUnfinishedTasks(loaded, todayStr);
    setTasks(updatedTasks);

    if (rolledOverCount > 0) {
      setRolloverNotice(`检测到 ${rolledOverCount} 个历史未完成任务，已自动顺延至今日排程。在您点击完成前绝不遗漏！`);
      setTimeout(() => setRolloverNotice(""), 8000);
    }
  }, [todayStr]);

  // Expand first 3 tasks by default when tasks load
  useEffect(() => {
    if (tasks.length > 0 && Object.keys(expandedTaskIds).length === 0) {
      const initialExpanded: Record<string, boolean> = {};
      tasks.slice(0, 3).forEach((t) => {
        initialExpanded[t.id] = true;
      });
      setExpandedTaskIds(initialExpanded);
    }
  }, [tasks]);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const postponed = tasks.filter((t) => t.status === "postponed" || (t.postponeCount > 0 && t.status !== "completed")).length;
    const urgent = tasks.filter((t) => t.priority === "urgent" && t.status !== "completed").length;
    const todayTasks = tasks.filter((t) => t.scheduledDate === todayStr && t.status !== "completed").length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalEstimatedHours = Math.round(tasks.reduce((acc, t) => acc + (t.estimatedMinutes || 60), 0) / 60);
    const completedHours = Math.round(
      tasks
        .filter((t) => t.status === "completed")
        .reduce((acc, t) => acc + (t.estimatedMinutes || 60), 0) / 60
    );

    return {
      total,
      completed,
      postponed,
      urgent,
      todayTasks,
      progressPercent,
      totalEstimatedHours,
      completedHours,
    };
  }, [tasks, todayStr]);

  // Toggle Task Completion
  const handleToggleTaskComplete = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextStatus = t.status === "completed" ? ("pending" as const) : ("completed" as const);
        if (nextStatus === "completed") {
          // Trigger confetti
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
            });
          } catch (_) {}
        }
        return {
          ...t,
          status: nextStatus,
          completedAt: nextStatus === "completed" ? new Date().toISOString() : undefined,
          deliverableChecklist: t.deliverableChecklist.map((c) => ({
            ...c,
            done: nextStatus === "completed" ? true : c.done,
          })),
        };
      }
      return t;
    });

    setTasks(updated);
    saveOpenArmTasks(updated);
  };

  // Toggle Single Checklist Item inside a task
  const handleToggleChecklistItem = (taskId: string, checklistId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const updatedList = t.deliverableChecklist.map((item) =>
          item.id === checklistId ? { ...item, done: !item.done } : item
        );
        const allDone = updatedList.every((item) => item.done);
        return {
          ...t,
          deliverableChecklist: updatedList,
          status: allDone ? ("completed" as const) : t.status,
        };
      }
      return t;
    });

    setTasks(updated);
    saveOpenArmTasks(updated);
  };

  // Postpone Single Task by 1 Day
  const handlePostponeSingleTask = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          scheduledDate: addDaysToDateStr(t.scheduledDate, 1),
          postponeCount: (t.postponeCount || 0) + 1,
          status: "postponed" as const,
        };
      }
      return t;
    });

    setTasks(updated);
    saveOpenArmTasks(updated);
  };

  // Postpone All Pending Tasks by 1 Day
  const handlePostponeAllPending = () => {
    const updated = postponeAllPendingTasks(tasks, 1);
    setTasks(updated);
    setRolloverNotice("已将全部未完成任务自动向后顺延 1 天！");
    setTimeout(() => setRolloverNotice(""), 5000);
  };

  // Insert Urgent Task from Modal
  const handleInsertUrgentTask = (data: {
    title: string;
    description: string;
    estimatedMinutes: number;
    postponeDays: number;
    keyPoints?: string[];
  }) => {
    const updated = insertUrgentTaskAndPostponeOthers(tasks, data);
    setTasks(updated);
    // Expand the newly inserted task
    const newTaskId = updated[0]?.id;
    if (newTaskId) {
      setExpandedTaskIds((prev) => ({ ...prev, [newTaskId]: true }));
    }
    setRolloverNotice(`已成功插入加急事务【${data.title}】，后续常规任务已自动向后顺延 ${data.postponeDays} 天！`);
    setTimeout(() => setRolloverNotice(""), 6000);
  };

  // Reset to default
  const handleResetDefaultTasks = () => {
    if (window.confirm("确定要重置 OpenArm 任务目录为系统默认推荐排程吗？（已完成进度将被重置）")) {
      const initial = getInitialOpenArmTasks();
      setTasks(initial);
      saveOpenArmTasks(initial);
      setRolloverNotice("已恢复默认 OpenArm 任务目录与标准排程！");
      setTimeout(() => setRolloverNotice(""), 5000);
    }
  };

  // Toggle expand card
  const toggleExpand = (id: string) => {
    setExpandedTaskIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Stage Filter
      if (selectedStageFilter !== "all" && t.stageId !== selectedStageFilter) {
        return false;
      }

      // Status Filter
      if (statusFilter === "today") {
        if (t.scheduledDate !== todayStr || t.status === "completed") return false;
      } else if (statusFilter === "pending") {
        if (t.status === "completed") return false;
      } else if (statusFilter === "postponed") {
        if (t.status !== "postponed" && t.postponeCount === 0) return false;
      } else if (statusFilter === "urgent") {
        if (t.priority !== "urgent") return false;
      } else if (statusFilter === "completed") {
        if (t.status !== "completed") return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchPoints = t.keyLearningPoints.some((p) => p.toLowerCase().includes(q));
        const matchCode = t.embeddedCodeReference?.colleagueModifyReason.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchPoints && !matchCode) return false;
      }

      return true;
    });
  }, [tasks, selectedStageFilter, statusFilter, searchQuery, todayStr]);

  return (
    <div className="space-y-6">
      {/* Header Banner & Stats */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-700/60 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                OpenArm 机械臂研发全栈准备
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40">
                零基础小白攻克嵌入式与结构配合
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                智能自动顺延引擎生效中
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
              OpenArm 任务目录 & 嵌入式代码协同进阶工作台
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
              为后续制作 6 自由度 OpenArm 协作臂与微型绳驱灵巧手量身打造。覆盖 <strong>3D打印配合公差、总线串口电路、嵌入式同事常改代码（协议/PID/零点）、ROS2上位机与整机排障</strong>。当你有紧急高优先级事务时，每日任务将自动顺延，直到你点击【完成任务】！
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="https://github.com/enactic/openarm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 text-xs font-mono transition-colors shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <span>OpenArm 官方开源仓库 (github.com/enactic/openarm)</span>
              </a>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400 mb-0.5">总体研发进度</div>
              <div className="text-base font-bold text-cyan-400 font-mono">
                {stats.progressPercent}%
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {stats.completed} / {stats.total} 项已完成
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400 mb-0.5">今日待办事项</div>
              <div className="text-base font-bold text-emerald-400 font-mono">
                {stats.todayTasks}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                预计 {(stats.todayTasks * 1.5).toFixed(1)} 小时
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400 mb-0.5">已顺延/待推进</div>
              <div className="text-base font-bold text-amber-400 font-mono">
                {stats.postponed}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                智能滚入今日队列
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400 mb-0.5">研发学时投入</div>
              <div className="text-base font-bold text-purple-400 font-mono">
                {stats.completedHours}h
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                目标 {stats.totalEstimatedHours}h
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.progressPercent}%` }}
            ></div>
          </div>
          <span className="text-xs font-mono text-cyan-300 font-bold shrink-0">
            {stats.completed}/{stats.total} 步
          </span>
        </div>
      </div>

      {/* Rollover Dynamic Notice Bar */}
      {rolloverNotice && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-xs text-amber-200 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 font-mono">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{rolloverNotice}</span>
          </div>
          <button
            onClick={() => setRolloverNotice("")}
            className="text-amber-400 hover:text-white text-xs underline cursor-pointer"
          >
            我知道了
          </button>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab("tasks")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              activeSubTab === "tasks"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>OpenArm 任务目录与每日排程 ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("code_inspector")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              activeSubTab === "code_inspector"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>嵌入式同事常改代码透视镜 (Code Inspector)</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUrgentModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono transition-all cursor-pointer shadow-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>⚡ 插入高优先级加急事务</span>
          </button>

          <button
            onClick={handlePostponeAllPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
            title="将未完成任务整体向后顺延 1 天"
          >
            <FastForward className="w-3.5 h-3.5 text-cyan-400" />
            <span>未完成一键顺延 +1天</span>
          </button>

          <button
            onClick={() => setIsAITaskModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800 text-xs font-mono transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI 定制排程</span>
          </button>

          <button
            onClick={handleResetDefaultTasks}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-slate-300 border border-slate-800 text-xs transition-colors cursor-pointer"
            title="恢复默认任务清单"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: TASK DIRECTORY & SCHEDULER */}
      {activeSubTab === "tasks" && (
        <div className="space-y-5">
          {/* Filter Bar & Search */}
          <div className="bg-slate-900/70 rounded-2xl border border-slate-800 p-4 space-y-3">
            {/* Status Quick Filters */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", label: "全部任务", count: tasks.length },
                  { id: "today", label: "📅 今日待办", count: stats.todayTasks },
                  { id: "pending", label: "⏳ 未完成", count: tasks.filter((t) => t.status !== "completed").length },
                  { id: "postponed", label: "⏩ 已顺延", count: stats.postponed },
                  { id: "urgent", label: "⚡ 加急/高优", count: stats.urgent },
                  { id: "completed", label: "✅ 已完成", count: stats.completed },
                ].map((st) => {
                  const isSelected = statusFilter === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => setStatusFilter(st.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-cyan-500 text-slate-950 font-bold shadow-xs"
                          : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                      }`}
                    >
                      <span>{st.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded ${
                          isSelected ? "bg-slate-900/40 text-slate-950" : "bg-slate-900 text-slate-500"
                        }`}
                      >
                        {st.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索任务/PID/协议/轴承..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Stage Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-800/80">
              <button
                onClick={() => setSelectedStageFilter("all")}
                className={`px-2.5 py-1 rounded-md text-xs font-mono whitespace-nowrap transition-colors cursor-pointer ${
                  selectedStageFilter === "all"
                    ? "bg-slate-800 text-cyan-300 font-bold border border-cyan-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                全阶段 ({tasks.length})
              </button>
              {OPENARM_STAGE_METAS.map((stage) => {
                const count = tasks.filter((t) => t.stageId === stage.id).length;
                if (count === 0 && stage.id === "stage_urgent") return null;
                const isSelected = selectedStageFilter === stage.id;
                return (
                  <button
                    key={stage.id}
                    onClick={() => setSelectedStageFilter(stage.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-slate-800 text-cyan-300 font-bold border border-cyan-500/40"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>{stage.name.split("：")[0]}</span>
                    <span className="text-[10px] text-slate-500">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Task List Render */}
          {filteredTasks.length === 0 ? (
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-10 text-center space-y-3">
              <ListTodo className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-slate-300">未找到符合当前筛选条件的任务</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                尝试切换顶部的状态筛选标签，或点击“全部任务”查看完整进阶任务列表。
              </p>
              <button
                onClick={() => {
                  setSelectedStageFilter("all");
                  setStatusFilter("all");
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-cyan-400 border border-slate-700 text-xs font-mono hover:bg-slate-700 cursor-pointer"
              >
                清除所有筛选
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task, index) => {
                const isCompleted = task.status === "completed";
                const isExpanded = !!expandedTaskIds[task.id];
                const isUrgent = task.priority === "urgent";
                const isToday = task.scheduledDate === todayStr && !isCompleted;
                const isPostponed = (task.postponeCount || 0) > 0 && !isCompleted;

                return (
                  <div
                    key={task.id}
                    className={`rounded-2xl border transition-all shadow-md overflow-hidden ${
                      isUrgent
                        ? "bg-amber-950/20 border-amber-500/50 shadow-amber-500/5"
                        : isCompleted
                        ? "bg-slate-950/40 border-slate-800/60 opacity-85"
                        : isToday
                        ? "bg-slate-900/90 border-cyan-500/50 shadow-cyan-500/5 ring-1 ring-cyan-500/20"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* Main Card Header Bar */}
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Left: Checkbox & Info */}
                      <div className="flex items-start gap-3.5 flex-1">
                        <button
                          onClick={() => handleToggleTaskComplete(task.id)}
                          className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-transform active:scale-90 cursor-pointer shrink-0"
                          title={isCompleted ? "标为未完成" : "点击完成任务"}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-500 hover:text-cyan-400" />
                          )}
                        </button>

                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Day Badge */}
                            {task.dayNumber > 0 && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                第 {task.dayNumber} 天
                              </span>
                            )}

                            {/* Scheduled Date */}
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 ${
                                isToday
                                  ? "bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold animate-pulse"
                                  : "bg-slate-950 text-slate-400 border border-slate-800"
                              }`}
                            >
                              <Calendar className="w-3 h-3" />
                              {task.scheduledDate} {isToday && "(今日待办)"}
                            </span>

                            {/* Postpone Badge */}
                            {isPostponed && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60 flex items-center gap-1">
                                <FastForward className="w-3 h-3" />
                                自动顺延 +{task.postponeCount} 次
                              </span>
                            )}

                            {/* Priority Tag */}
                            {isUrgent && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500 text-slate-950 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                加急事务
                              </span>
                            )}

                            <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {task.estimatedMinutes} 分钟
                            </span>
                          </div>

                          <h3
                            className={`text-sm sm:text-base font-bold transition-colors cursor-pointer ${
                              isCompleted
                                ? "text-slate-400 line-through"
                                : isUrgent
                                ? "text-amber-200"
                                : "text-slate-100 hover:text-cyan-300"
                            }`}
                            onClick={() => toggleExpand(task.id)}
                          >
                            {task.title}
                          </h3>

                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {!isCompleted && (
                          <button
                            onClick={() => handlePostponeSingleTask(task.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1"
                            title="顺延到明天"
                          >
                            <FastForward className="w-3 h-3 text-cyan-400" />
                            <span className="hidden sm:inline">顺延+1天</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleTaskComplete(task.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isCompleted
                              ? "bg-slate-800 text-emerald-400 border border-emerald-500/30"
                              : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm shadow-cyan-500/20"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isCompleted ? "已完成" : "点击完成"}</span>
                        </button>

                        <button
                          onClick={() => toggleExpand(task.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Detail Body */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 bg-slate-950/70 border-t border-slate-800/80 space-y-4 text-xs">
                        {/* Section A: Key Learning Points */}
                        {task.keyLearningPoints && task.keyLearningPoints.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="font-bold text-cyan-300 font-mono flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                              <span>核心要点与避坑原则 (Key Principles)：</span>
                            </div>
                            <ul className="space-y-1 pl-4 list-disc text-slate-300 leading-relaxed">
                              {task.keyLearningPoints.map((pt, pidx) => (
                                <li key={pidx}>{pt}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Section B: Embedded Colleague Code Reference */}
                        {task.embeddedCodeReference && (
                          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="font-bold text-amber-300 font-mono flex items-center gap-1.5">
                                <Code2 className="w-3.5 h-3.5 text-amber-400" />
                                <span>嵌入式同事常改代码关联点 ({task.embeddedCodeReference.fileName})：</span>
                              </div>
                              <button
                                onClick={() => setActiveSubTab("code_inspector")}
                                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                              >
                                打开代码透视镜 →
                              </button>
                            </div>

                            <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300/90 overflow-x-auto">
                              {task.embeddedCodeReference.codeSnippet}
                            </pre>

                            <div className="text-slate-400 text-[11px] leading-relaxed">
                              <strong className="text-slate-200">同事修改机理：</strong>
                              {task.embeddedCodeReference.colleagueModifyReason}
                            </div>

                            {task.embeddedCodeReference.beginnerTip && (
                              <div className="text-[11px] text-emerald-300 font-mono">
                                💡 小白实战贴士: {task.embeddedCodeReference.beginnerTip}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Section C: Deliverable Checklist */}
                        {task.deliverableChecklist && task.deliverableChecklist.length > 0 && (
                          <div className="space-y-2">
                            <div className="font-bold text-slate-200 font-mono flex items-center gap-1.5">
                              <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                              <span>实操交付与自检清单 (Checklist)：</span>
                            </div>
                            <div className="space-y-1.5">
                              {task.deliverableChecklist.map((item) => (
                                <div
                                  key={item.id}
                                  onClick={() => handleToggleChecklistItem(task.id, item.id)}
                                  className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 cursor-pointer transition-colors"
                                >
                                  {item.done ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-500 shrink-0" />
                                  )}
                                  <span
                                    className={`text-xs ${
                                      item.done ? "text-slate-400 line-through" : "text-slate-300"
                                    }`}
                                  >
                                    {item.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: EMBEDDED CODE INSPECTOR */}
      {activeSubTab === "code_inspector" && <EmbeddedCodeInspector />}

      {/* Urgent Task Modal */}
      <UrgentTaskModal
        isOpen={isUrgentModalOpen}
        onClose={() => setIsUrgentModalOpen(false)}
        onConfirm={handleInsertUrgentTask}
        pendingTasksCount={tasks.filter((t) => t.status !== "completed").length}
      />

      {/* AI Task Planner Modal */}
      <AITaskPlannerModal
        isOpen={isAITaskModalOpen}
        onClose={() => setIsAITaskModalOpen(false)}
      />
    </div>
  );
};
