import React, { useState, useEffect } from "react";
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Terminal,
  FileCheck,
  Search,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Layers,
  Cpu,
  ShieldAlert,
  Sliders,
  Cable,
  Check,
  Copy,
  Download,
  BookOpen,
  ArrowRight,
  Gauge,
  HelpCircle,
  Play,
  RotateCcw,
  Loader2,
  Package,
  Wrench,
  Radio,
  Zap,
  Lightbulb,
  Info,
  CheckCircle2,
} from "lucide-react";
import {
  ExtractedArchiveResult,
  ExtractedFileItem,
  ExtractedFolderNode,
} from "../../utils/zipExtractor";
import { analyzeCodeMechanicallyLocal } from "../../data/codeTranslatorData";
import { CodeTranslationResult } from "../../types";
import { getNoviceFileKnowledge, FileAnalysisDetails } from "../../utils/fileKnowledgeParser";

interface ZipWorkspaceExplorerProps {
  archiveResult: ExtractedArchiveResult;
  onSelectFileToMainEditor?: (file: ExtractedFileItem) => void;
  onUploadNewZipClick?: () => void;
  onCloseArchive?: () => void;
}

export const ZipWorkspaceExplorer: React.FC<ZipWorkspaceExplorerProps> = ({
  archiveResult,
  onSelectFileToMainEditor,
  onUploadNewZipClick,
  onCloseArchive,
}) => {
  // Selected file inside the archive
  const [selectedFilePath, setSelectedFilePath] = useState<string>(() => {
    // Default to the first core code/header or script file, avoid cmake_install
    const defaultFile =
      archiveResult.allFiles.find((f) => f.name.toLowerCase() === "damiao.cpp") ||
      archiveResult.allFiles.find((f) => f.name.toLowerCase() === "main.cpp") ||
      archiveResult.allFiles.find((f) => f.name.toLowerCase().includes("motor.cpp")) ||
      archiveResult.allFiles.find((f) => f.name.toLowerCase() === "damiao.h") ||
      archiveResult.allFiles.find((f) => f.category === "code") ||
      archiveResult.allFiles[0];
    return defaultFile ? defaultFile.path : "";
  });

  // Workspace View Mode: "file_viewer" (单文件代码透视) vs "project_guide" (全工程架构与编译导读)
  const [workspaceMode, setWorkspaceMode] = useState<"project_guide" | "file_viewer">("file_viewer");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  // Folder expand/collapse state
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(() => {
    // Expand all top-level folders by default
    const map: Record<string, boolean> = {};
    archiveResult.allFiles.forEach((f) => {
      const parts = f.path.split("/");
      if (parts.length > 1) {
        map[parts[0]] = true;
        if (parts.length > 2) {
          map[`${parts[0]}/${parts[1]}`] = true;
        }
      }
    });
    return map;
  });

  // AI Project-wide architecture analysis
  const [isAiProjectAnalyzing, setIsAiProjectAnalyzing] = useState<boolean>(false);
  const [aiProjectAnalysisText, setAiProjectAnalysisText] = useState<string | null>(null);

  // Single file translation state
  const activeFile = archiveResult.allFiles.find((f) => f.path === selectedFilePath);
  const [fileTranslation, setFileTranslation] = useState<CodeTranslationResult | null>(null);
  const [isAiTranslatingFile, setIsAiTranslatingFile] = useState<boolean>(false);
  const [aiFileReport, setAiFileReport] = useState<string | null>(null);

  // Novice knowledge for the active file
  const [noviceKnowledge, setNoviceKnowledge] = useState<FileAnalysisDetails | null>(null);

  // Copy feedback states
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedCommandIdx, setCopiedCommandIdx] = useState<number | null>(null);

  // Update file translation and novice knowledge whenever selected file changes
  useEffect(() => {
    if (activeFile) {
      const novice = getNoviceFileKnowledge(activeFile.name, activeFile.path, activeFile.content);
      setNoviceKnowledge(novice);

      if (
        activeFile.category === "code" ||
        activeFile.category === "script" ||
        activeFile.category === "header" ||
        activeFile.category === "build"
      ) {
        const local = analyzeCodeMechanicallyLocal(activeFile.content, activeFile.name);
        setFileTranslation(local);
        setAiFileReport(null);
      } else {
        setFileTranslation(null);
      }
    } else {
      setNoviceKnowledge(null);
      setFileTranslation(null);
    }
  }, [selectedFilePath, activeFile]);

  // Toggle folder open/close
  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderPath]: !prev[folderPath] }));
  };

  // Run AI Project Architecture Deep Analysis
  const handleRunAiProjectAnalysis = async () => {
    setIsAiProjectAnalyzing(true);
    try {
      const fileSummaryList = archiveResult.allFiles
        .map((f) => `- ${f.path} (${f.sizeFormatted}, ${f.lineCount || 0} 行, 类型: ${f.category})`)
        .join("\n");

      // Pick top 3 core files as context
      const keyFiles = archiveResult.allFiles
        .filter((f) => f.category === "code" || f.category === "script" || f.name.toLowerCase() === "readme.md")
        .slice(0, 3)
        .map((f) => `--- 文件: ${f.path} ---\n${f.content.slice(0, 2500)}`)
        .join("\n\n");

      const res = await fetch("/api/ai/project-archive-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archiveName: archiveResult.archiveName,
          fileSummaryList,
          keyFileContents: keyFiles,
          userQuestion: "我是纯机械小白！请用最直观通俗的大白话和生活比喻，手把手告诉我这个工程是干嘛的、怎么在终端跑起来、我作为机械人需要关注哪些参数，别说听不懂的晦涩黑话！",
        }),
      });

      const data = await res.json();
      if (data.text) {
        setAiProjectAnalysisText(data.text);
      }
    } catch (e) {
      console.warn("AI project analysis failed:", e);
    } finally {
      setIsAiProjectAnalyzing(false);
    }
  };

  // Run AI Single File Analysis
  const handleRunAiFileAnalysis = async () => {
    if (!activeFile) return;
    setIsAiTranslatingFile(true);
    try {
      const res = await fetch("/api/ai/code-translator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: activeFile.content,
          fileName: activeFile.name,
          language: activeFile.language,
          hardwareContext: `${archiveResult.detectedTitle} (路径: ${activeFile.path})`,
          focusQuestion: "请用最通俗的机械小白大白话，逐行解释这个文件的物理作用，不要讲枯燥的语法！",
        }),
      });
      const data = await res.json();
      if (data.text) {
        setAiFileReport(data.text);
      }
    } catch (e) {
      console.warn("AI file translation failed:", e);
    } finally {
      setIsAiTranslatingFile(false);
    }
  };

  // Copy code helper
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Copy command helper
  const handleCopyCommand = (command: string, idx: number) => {
    navigator.clipboard.writeText(command);
    setCopiedCommandIdx(idx);
    setTimeout(() => setCopiedCommandIdx(null), 2000);
  };

  // Filter files
  const filteredFiles = archiveResult.allFiles.filter((f) => {
    const matchesSearch =
      searchQuery === "" ||
      f.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategoryFilter === "all" ||
      (selectedCategoryFilter === "code" && (f.category === "code" || f.category === "header")) ||
      (selectedCategoryFilter === "script" && f.category === "script") ||
      (selectedCategoryFilter === "build" && f.category === "build") ||
      (selectedCategoryFilter === "doc" && f.category === "document");

    return matchesSearch && matchesCategory;
  });

  // Render tree node recursively
  const renderTreeNode = (node: ExtractedFolderNode | ExtractedFileItem, depth: number = 0) => {
    if (node.isFolder) {
      const folderNode = node as ExtractedFolderNode;
      const isExpanded = expandedFolders[folderNode.path] ?? true;
      return (
        <div key={folderNode.path} className="space-y-0.5 select-none">
          <div
            onClick={() => toggleFolder(folderNode.path)}
            style={{ paddingLeft: `${depth * 14 + 8}px` }}
            className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg hover:bg-slate-800/70 text-slate-300 hover:text-white cursor-pointer text-xs font-mono transition-colors group"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
            <span className="font-semibold truncate">{folderNode.name}</span>
            <span className="text-[10px] text-slate-500 ml-auto font-mono">
              {folderNode.children.length} 项
            </span>
          </div>
          {isExpanded && (
            <div className="space-y-0.5">
              {folderNode.children.map((child) => renderTreeNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    } else {
      const fileNode = node as ExtractedFileItem;
      const isSelected = selectedFilePath === fileNode.path;
      const isCoreCode =
        fileNode.name.endsWith(".cpp") ||
        fileNode.name.endsWith(".h") ||
        fileNode.name.endsWith(".sh") ||
        fileNode.name.endsWith(".py");
      const isGenerated = fileNode.path.includes("/build/") || fileNode.name.includes("cmake_install");

      const getFileBadgeColor = () => {
        if (fileNode.category === "code") return "text-cyan-400 bg-cyan-950/60 border-cyan-800/60";
        if (fileNode.category === "header") return "text-blue-400 bg-blue-950/60 border-blue-800/60";
        if (fileNode.category === "script") return "text-emerald-400 bg-emerald-950/60 border-emerald-800/60";
        if (fileNode.category === "build") return "text-amber-400 bg-amber-950/60 border-amber-800/60";
        if (fileNode.category === "document") return "text-purple-400 bg-purple-950/60 border-purple-800/60";
        return "text-slate-400 bg-slate-800 border-slate-700";
      };

      return (
        <div
          key={fileNode.path}
          onClick={() => {
            setSelectedFilePath(fileNode.path);
            setWorkspaceMode("file_viewer");
          }}
          style={{ paddingLeft: `${depth * 14 + 12}px` }}
          className={`flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg cursor-pointer text-xs font-mono transition-all ${
            isSelected
              ? "bg-cyan-950/90 border border-cyan-500 text-cyan-200 shadow-md ring-1 ring-cyan-500/30"
              : isCoreCode && !isGenerated
              ? "hover:bg-slate-800/80 text-slate-300 hover:text-white border border-transparent"
              : "hover:bg-slate-800/50 text-slate-500 hover:text-slate-300 border border-transparent"
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {fileNode.category === "code" || fileNode.category === "header" ? (
              <FileCode className={`w-3.5 h-3.5 shrink-0 ${isGenerated ? "text-slate-500" : "text-cyan-400"}`} />
            ) : fileNode.category === "script" ? (
              <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <span
              className={`truncate ${
                isSelected
                  ? "font-bold text-white"
                  : isCoreCode && !isGenerated
                  ? "text-slate-200 font-medium"
                  : "text-slate-400"
              }`}
            >
              {fileNode.name}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isGenerated ? (
              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-900 text-slate-500 border border-slate-800 font-mono">
                中间产物
              </span>
            ) : isCoreCode ? (
              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-mono font-bold">
                推荐阅读
              </span>
            ) : null}
            <span className={`text-[9px] px-1 py-0.2 rounded border font-mono ${getFileBadgeColor()}`}>
              {fileNode.extension ? `.${fileNode.extension}` : "file"}
            </span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Archive Header Status Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/80 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-cyan-400" />
              已解压项目包: {archiveResult.archiveName}
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/60">
              包含 {archiveResult.fileCount} 个文件 · {archiveResult.totalSizeFormatted}
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-sans font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {archiveResult.detectedTitle}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed pt-1">
            {archiveResult.detectedDescription}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onUploadNewZipClick && (
            <button
              onClick={onUploadNewZipClick}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重新上传压缩包</span>
            </button>
          )}

          {onCloseArchive && (
            <button
              onClick={onCloseArchive}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>关闭当前工程包</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ===================== LEFT: File Tree Sidebar (4 Cols) ===================== */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            {/* Header & Mode Switch */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>解压目录树 ({archiveResult.fileCount} 文件)</span>
              </div>
              <button
                onClick={() => setWorkspaceMode("project_guide")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors flex items-center gap-1 ${
                  workspaceMode === "project_guide"
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                    : "bg-slate-800 text-slate-300 hover:text-white"
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>全工程导读</span>
              </button>
            </div>

            {/* Beginner Quick Guide Note */}
            <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-[11px] font-sans text-cyan-200 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold text-cyan-300">💡 小白看树指南：</span>
                优先点击标记为 <span className="text-emerald-300 font-bold">「推荐阅读」</span> 的 .cpp / .h（电机控制与参数图纸）；可跳过 build 目录里的中间安装脚本。
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索文件 / 目录 (如 motor, can, .sh)..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Quick Category Filters */}
            <div className="flex flex-wrap gap-1">
              {[
                { id: "all", label: "全部" },
                { id: "code", label: "C/C++ 源码" },
                { id: "script", label: "脚本 .sh" },
                { id: "build", label: "CMake" },
                { id: "doc", label: "README" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    selectedCategoryFilter === cat.id
                      ? "bg-cyan-950 text-cyan-300 border border-cyan-700"
                      : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/80"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* File Tree List */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 max-h-[500px] overflow-y-auto space-y-1">
              {searchQuery === "" && selectedCategoryFilter === "all" ? (
                // Full Nested Hierarchy
                archiveResult.fileTree.map((node) => renderTreeNode(node, 0))
              ) : (
                // Flat Filtered Results
                filteredFiles.map((file) => (
                  <div
                    key={file.path}
                    onClick={() => {
                      setSelectedFilePath(file.path);
                      setWorkspaceMode("file_viewer");
                    }}
                    className={`p-2 rounded-lg cursor-pointer text-xs font-mono flex items-center justify-between gap-2 ${
                      selectedFilePath === file.path
                        ? "bg-cyan-950 border border-cyan-500 text-cyan-200 shadow-sm"
                        : "hover:bg-slate-800/60 text-slate-300"
                    }`}
                  >
                    <div className="truncate">
                      <span className="text-slate-500 text-[10px] block">{file.parentPath}/</span>
                      <span className="font-bold">{file.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0">{file.sizeFormatted}</span>
                  </div>
                ))
              )}
            </div>

            {/* Tip Box */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-sans flex items-start gap-2">
              <Wrench className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>点击树中任意文件，右侧立即为您透视大白话物理作用与参数！</span>
            </div>
          </div>
        </div>

        {/* ===================== RIGHT: Main Workspace View (8 Cols) ===================== */}
        <div className="lg:col-span-8 space-y-4">
          {/* Top Mode Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setWorkspaceMode("file_viewer")}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  workspaceMode === "file_viewer"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <FileCode className="w-4 h-4" />
                <span>🔍 单文件小白透视 ({activeFile ? activeFile.name : "选择文件"})</span>
              </button>

              <button
                onClick={() => setWorkspaceMode("project_guide")}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  workspaceMode === "project_guide"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>🎓 全工程白话架构 & 编译学习指南</span>
              </button>
            </div>

            {workspaceMode === "project_guide" ? (
              <button
                onClick={handleRunAiProjectAnalysis}
                disabled={isAiProjectAnalyzing}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
              >
                {isAiProjectAnalyzing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>{isAiProjectAnalyzing ? "AI 正在以小白视角剖析..." : "🤖 AI 小白专属全工程大白话导读"}</span>
              </button>
            ) : (
              <button
                onClick={handleRunAiFileAnalysis}
                disabled={isAiTranslatingFile || !activeFile}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
              >
                {isAiTranslatingFile ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                )}
                <span>{isAiTranslatingFile ? "AI 正在翻译..." : "AI 逐行白话物理翻译"}</span>
              </button>
            )}
          </div>

          {/* ==================== WORKSPACE MODE 1: PROJECT GUIDE (全工程白话导读) ==================== */}
          {workspaceMode === "project_guide" && (
            <div className="space-y-4">
              {/* AI Comprehensive Analysis Card if triggered */}
              {aiProjectAnalysisText && (
                <div className="bg-purple-950/30 border border-purple-800/60 rounded-2xl p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-purple-800/40">
                    <div className="flex items-center gap-2 text-sm font-bold text-purple-300">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>AI 机电总工 · 小白保姆级全工程导读报告</span>
                    </div>
                    <button
                      onClick={() => setAiProjectAnalysisText(null)}
                      className="text-xs text-purple-400 hover:text-purple-200 cursor-pointer"
                    >
                      收起
                    </button>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap space-y-2">
                    {aiProjectAnalysisText}
                  </div>
                </div>
              )}

              {/* 1. Step-by-Step Compilation & Run Guide */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    如何将此压缩包打入嵌入式编译器/Linux终端运行 (手把手保姆教程)
                  </h3>
                  <span className="text-[11px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-mono">
                    推荐环境: {archiveResult.compilationGuide.toolchain}
                  </span>
                </div>

                <div className="space-y-3">
                  {archiveResult.compilationGuide.steps.map((st, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-cyan-300 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-[11px] text-cyan-400">
                            {idx + 1}
                          </span>
                          {st.step}
                        </span>
                        {st.command && (
                          <button
                            onClick={() => handleCopyCommand(st.command!, idx)}
                            className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 cursor-pointer"
                          >
                            {copiedCommandIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedCommandIdx === idx ? "已复制指令" : "复制指令"}</span>
                          </button>
                        )}
                      </div>

                      {st.command && (
                        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 font-mono text-xs text-emerald-300 whitespace-pre-wrap">
                          {st.command}
                        </div>
                      )}

                      <p className="text-xs text-slate-400 leading-relaxed font-sans pl-7">
                        {st.explanation}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Safety Cautions */}
                {archiveResult.compilationGuide.cautions.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-900/50 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <ShieldAlert className="w-4 h-4" />
                      <span>上电与防撞机电安全守则：</span>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside font-sans">
                      {archiveResult.compilationGuide.cautions.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 2. Mechanical Core Takeaways */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  机械工程师最关心的三大核心要点
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {archiveResult.mechanicalTakeaways.map((item, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          {item.description}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>相关文件:</span>
                        <span className="text-cyan-400">{item.relevantFiles.join(", ")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== WORKSPACE MODE 2: SINGLE FILE VIEW & TRANSLATE (单文件透视) ==================== */}
          {workspaceMode === "file_viewer" && activeFile && (
            <div className="space-y-4">
              {/* NOVICE CALLOUT CARD: What is this file & why you care */}
              {noviceKnowledge && (
                <div
                  className={`p-4 rounded-2xl border shadow-lg space-y-3 ${
                    noviceKnowledge.isMustReadForMechanical
                      ? "bg-gradient-to-br from-cyan-950/60 to-slate-900 border-cyan-500/60 ring-1 ring-cyan-500/20"
                      : "bg-slate-900/90 border-slate-800"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                        <Lightbulb className="w-4 h-4 text-amber-400" />
                        <span>【小白白话档案】{activeFile.name} 到底是干嘛的？</span>
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                        noviceKnowledge.isMustReadForMechanical
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-600"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {noviceKnowledge.fileRole}
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                    {noviceKnowledge.plainExplanation}
                  </div>

                  {/* Analogy Box */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs font-sans text-amber-200/90 flex items-start gap-2">
                    <span className="text-base shrink-0">💡</span>
                    <div>
                      <strong className="text-amber-300">通俗生活比喻：</strong>
                      <span className="text-slate-300 ml-1">{noviceKnowledge.analogy}</span>
                    </div>
                  </div>

                  {/* Why Mechanical Cares */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-sans text-slate-300 space-y-1.5">
                    <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-cyan-400" />
                      <span>机械工程师该如何对待这份文件：</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {noviceKnowledge.whyMechanicalCares}
                    </p>

                    <div className="pt-1.5 border-t border-slate-800/60 space-y-1">
                      {noviceKnowledge.actionItems.map((item, idx) => (
                        <div key={idx} className="text-xs text-slate-200 flex items-start gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* AI Report if Available */}
              {aiFileReport && (
                <div className="bg-purple-950/30 border border-purple-800/60 rounded-2xl p-5 shadow-xl space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-purple-800/40">
                    <h4 className="text-sm font-bold text-purple-200 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      AI 针对当前文件的保姆级大白话物理动作报告
                    </h4>
                    <button
                      onClick={() => setAiFileReport(null)}
                      className="text-xs text-purple-400 hover:text-purple-200 cursor-pointer"
                    >
                      收起报告
                    </button>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                    {aiFileReport}
                  </div>
                </div>
              )}

              {/* Local Mechanical Parameter & Physical Action Breakdown */}
              {fileTranslation && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex items-start gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                    <Gauge className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-cyan-300 font-sans">
                        物理动作本质（这篇代码让机构在做什么）：
                      </h4>
                      <p className="text-xs text-slate-200 mt-1 leading-relaxed font-sans">
                        {fileTranslation.physicalActionSummary}
                      </p>
                    </div>
                  </div>

                  {fileTranslation.keyParameters.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                        <span>机械工程师重点关注的参数对照：</span>
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono border-collapse">
                          <thead>
                            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                              <th className="p-2.5">物理意义</th>
                              <th className="p-2.5">代码变量</th>
                              <th className="p-2.5">当前设定值</th>
                              <th className="p-2.5">机械影响/建议</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {fileTranslation.keyParameters.map((p, i) => (
                              <tr key={i} className="hover:bg-slate-800/40">
                                <td className="p-2.5 text-cyan-300 font-bold">{p.paramName}</td>
                                <td className="p-2.5 text-slate-400">{p.varName}</td>
                                <td className="p-2.5 text-amber-300 font-bold">{p.currentValue}</td>
                                <td className="p-2.5 text-slate-300 font-sans">{p.mechanicalImpact}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* File Code Viewer Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
                {/* Code Toolbar */}
                <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-bold text-white truncate">{activeFile.path}</span>
                    <span className="text-slate-500 text-[11px] shrink-0">
                      ({activeFile.lineCount} 行 · {activeFile.sizeFormatted})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {onSelectFileToMainEditor && (
                      <button
                        onClick={() => onSelectFileToMainEditor(activeFile)}
                        className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-[11px] font-mono border border-cyan-800 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <ArrowRight className="w-3 h-3" />
                        <span>载入单文件精细台</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleCopyCode(activeFile.content)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? "已复制" : "复制代码"}</span>
                    </button>
                  </div>
                </div>

                {/* Code Content with Line Numbers */}
                <div className="p-4 bg-slate-950 max-h-[380px] overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed border-b border-slate-800">
                  <pre className="whitespace-pre-wrap">{activeFile.content}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
