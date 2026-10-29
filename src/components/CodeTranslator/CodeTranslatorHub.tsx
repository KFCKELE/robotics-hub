import React, { useState, useEffect, useRef } from "react";
import {
  Code2,
  FileCode,
  UploadCloud,
  FileText,
  Sparkles,
  Play,
  RotateCcw,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  MessageSquare,
  Sliders,
  Send,
  Loader2,
  Terminal,
  Layers,
  Cpu,
  Radio,
  ArrowRight,
  ShieldAlert,
  Gauge,
  Cable,
  Zap,
  Bot,
  Hand,
  Search,
  BookOpen,
  Trash2,
  RefreshCw,
  Package,
  FolderArchive,
  Upload,
} from "lucide-react";
import confetti from "canvas-confetti";
import { UploadedCodeFile, CodeTranslationResult } from "../../types";
import {
  PRESET_EMBEDDED_CODE_FILES,
  analyzeCodeMechanicallyLocal,
} from "../../data/codeTranslatorData";
import {
  extractZipArchive,
  createPresetProjectArchive,
  ExtractedArchiveResult,
  ExtractedFileItem,
} from "../../utils/zipExtractor";
import { ZipWorkspaceExplorer } from "./ZipWorkspaceExplorer";

const STORAGE_KEY_USER_CODE_FILES = "openarm_uploaded_code_files_v1";

export const CodeTranslatorHub: React.FC = () => {
  // Main Hub Mode: "zip_workspace" (工程压缩包解压与工作区) vs "single_file" (单文件代码精细翻译)
  const [hubViewMode, setHubViewMode] = useState<"zip_workspace" | "single_file">("zip_workspace");

  // Decompressed Zip Archive State
  const [archiveResult, setArchiveResult] = useState<ExtractedArchiveResult | null>(null);
  const [isUnzipping, setIsUnzipping] = useState<boolean>(false);
  const [unzipError, setUnzipError] = useState<string | null>(null);

  // Saved single files state (auto-clean legacy preset files from localStorage)
  const [customFiles, setCustomFiles] = useState<UploadedCodeFile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER_CODE_FILES);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter out any legacy preset IDs to keep the project clean
        const cleaned = Array.isArray(parsed)
          ? parsed.filter((f: UploadedCodeFile) => !f.isPreset && !f.id.startsWith("preset_"))
          : [];
        return cleaned;
      }
      return [];
    } catch {
      return [];
    }
  });

  const allFiles = customFiles;
  const [selectedFileId, setSelectedFileId] = useState<string>(() => {
    return customFiles[0]?.id || "";
  });

  const activeFile = allFiles.find((f) => f.id === selectedFileId) || allFiles[0] || null;

  // Active code buffer for editing & translating
  const [codeBuffer, setCodeBuffer] = useState<string>(() => {
    return activeFile?.code || "";
  });
  const [hardwareContext, setHardwareContext] = useState<string>(() => {
    return activeFile?.hardwareContext || "自定义嵌入式硬件环境";
  });
  const [focusQuestion, setFocusQuestion] = useState<string>("");

  // Sync buffer when selected file changes
  useEffect(() => {
    if (activeFile) {
      setCodeBuffer(activeFile.code);
      setHardwareContext(activeFile.hardwareContext);
      // Automatically trigger analysis
      handleRunTranslation(activeFile.code, activeFile.fileName, activeFile.hardwareContext, "");
    }
  }, [selectedFileId]);

  // Translation result state
  const [translationResult, setTranslationResult] = useState<CodeTranslationResult>(() =>
    analyzeCodeMechanicallyLocal(activeFile?.code || "", activeFile?.fileName || "源码文件.c")
  );
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [rawAiResponse, setRawAiResponse] = useState<string | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<
    "overview" | "parameters" | "hardware" | "troubleshoot" | "cheat_sheet" | "raw_ai"
  >("overview");

  // Interaction feedback states
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedCheatIndex, setCopiedCheatIndex] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // File upload input refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const zipInputRef = useRef<HTMLInputElement | null>(null);

  // Run AI / Local translation for single file
  const handleRunTranslation = async (
    targetCode: string,
    fileName: string,
    hwCtx: string,
    questionText: string
  ) => {
    if (!targetCode.trim()) return;

    setIsTranslating(true);

    // 1. Instantly perform local analysis as immediate feedback
    const localResult = analyzeCodeMechanicallyLocal(targetCode, fileName);
    setTranslationResult(localResult);

    // 2. Call backend Gemini AI endpoint for deep mechanical translation
    try {
      const res = await fetch("/api/ai/code-translator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: targetCode,
          fileName: fileName,
          language: activeFile?.language || "c",
          hardwareContext: hwCtx,
          focusQuestion: questionText || "请全面将这段代码翻译为机械物理直觉与参数对照表",
        }),
      });

      const data = await res.json();
      if (data.text) {
        setRawAiResponse(data.text);
      } else {
        setRawAiResponse(null);
      }
    } catch (e) {
      console.warn("AI translation call failed, relying on local mechanical parser:", e);
      setRawAiResponse(null);
    } finally {
      setIsTranslating(false);
    }
  };

  // Switch Preset Zip Archive
  const handleSwitchPresetArchive = async (type: "damiao_ws" | "openarm-vr-main") => {
    setIsUnzipping(true);
    setUnzipError(null);
    try {
      const res = await createPresetProjectArchive(type);
      setArchiveResult(res);
      setHubViewMode("zip_workspace");
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.5 } });
    } catch (err: any) {
      setUnzipError(err.message || "预设工程载入失败");
    } finally {
      setIsUnzipping(false);
    }
  };

  // Handle Zip File Upload & Decompression
  const handleZipFileUpload = async (file: File) => {
    setIsUnzipping(true);
    setUnzipError(null);
    try {
      const res = await extractZipArchive(file, file.name);
      setArchiveResult(res);
      setHubViewMode("zip_workspace");
      confetti({ particleCount: 45, spread: 65, origin: { y: 0.5 } });
    } catch (err: any) {
      console.error("Failed to unzip file:", err);
      setUnzipError(err.message || "压缩包解压失败，请确认是否为标准的 .zip 格式文件");
    } finally {
      setIsUnzipping(false);
    }
  };

  // Handle single code file drop & upload
  const handleSingleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      const ext = file.name.split(".").pop()?.toLowerCase() || "txt";
      let lang = "c";
      if (ext === "py") lang = "python";
      else if (ext === "cpp" || ext === "hpp" || ext === "cc") lang = "cpp";
      else if (ext === "ino") lang = "arduino";
      else if (ext === "h") lang = "c";

      const lines = content.split("\n").length;
      const sizeKb = (file.size / 1024).toFixed(1);

      const newUploadedFile: UploadedCodeFile = {
        id: `user_file_${Date.now()}`,
        fileName: file.name,
        language: lang,
        code: content,
        hardwareContext: "用户自定义上传嵌入式源码",
        fileSizeFormatted: `${sizeKb} KB`,
        lineCount: lines,
        uploadedAt: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        isPreset: false,
        authorNote: `由工程师于 ${new Date().toLocaleDateString("zh-CN")} 本地上传并分析`,
      };

      const updated = [newUploadedFile, ...customFiles];
      setCustomFiles(updated);
      try {
        localStorage.setItem(STORAGE_KEY_USER_CODE_FILES, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save file to localStorage:", err);
      }

      setSelectedFileId(newUploadedFile.id);
      setCodeBuffer(content);
      setHubViewMode("single_file");
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    };

    reader.readAsText(file);
  };

  // Master file dispatcher (detects if file is zip vs single code file)
  const handleIncomingFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const lowerName = file.name.toLowerCase();

    if (
      lowerName.endsWith(".zip") ||
      lowerName.endsWith(".tar") ||
      lowerName.endsWith(".gz") ||
      lowerName.endsWith(".7z") ||
      lowerName.endsWith(".rar")
    ) {
      handleZipFileUpload(file);
    } else {
      handleSingleFileUpload(file);
    }
  };

  // Transfer extracted file from zip directly to the single file editor
  const handleLoadExtractedFileToMainEditor = (fileItem: ExtractedFileItem) => {
    const newUploadedFile: UploadedCodeFile = {
      id: `extracted_${Date.now()}_${fileItem.name}`,
      fileName: fileItem.name,
      language: fileItem.language,
      code: fileItem.content,
      hardwareContext: `${archiveResult?.detectedTitle || "压缩包提取文件"} (${fileItem.path})`,
      fileSizeFormatted: fileItem.sizeFormatted,
      lineCount: fileItem.lineCount || fileItem.content.split("\n").length,
      uploadedAt: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      isPreset: false,
      authorNote: `从压缩包 ${archiveResult?.archiveName || "工程包"} 中提取: ${fileItem.path}`,
    };

    setCustomFiles((prev) => [newUploadedFile, ...prev]);
    setSelectedFileId(newUploadedFile.id);
    setCodeBuffer(fileItem.content);
    setHubViewMode("single_file");
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.6 } });
  };

  // Ref to track nested dragenter/dragleave counts and completely eliminate drag flickering (防频闪计数器)
  const dragCounter = useRef<number>(0);

  // Handle Drag Enter
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  // Handle Drag Over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle Drag Leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setDragActive(false);
    }
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleIncomingFiles(e.dataTransfer.files);
    }
  };

  // Delete custom uploaded file
  const handleDeleteCustomFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customFiles.filter((f) => f.id !== id);
    setCustomFiles(updated);
    try {
      localStorage.setItem(STORAGE_KEY_USER_CODE_FILES, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    if (selectedFileId === id) {
      const next = updated[0] || null;
      setSelectedFileId(next?.id || "");
      if (next) {
        setCodeBuffer(next.code);
        setHardwareContext(next.hardwareContext);
        handleRunTranslation(next.code, next.fileName, next.hardwareContext, "");
      } else {
        setCodeBuffer("");
        setHardwareContext("");
      }
    }
  };

  // Clear all uploaded files
  const handleClearAllFiles = () => {
    setCustomFiles([]);
    try {
      localStorage.removeItem(STORAGE_KEY_USER_CODE_FILES);
    } catch (err) {
      console.error(err);
    }
    setSelectedFileId("");
    setCodeBuffer("");
    setHardwareContext("");
  };

  // Copy code helper
  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeBuffer);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const quickQuestions = [
    "这段代码让机械臂或手爪执行了什么物理动作？",
    "机械师最关心的减速比、最大电流、软限位和PID刚度在哪几行？",
    "涉及哪些硬件引脚 (CAN / UART / PWM)？需要接120Ω终端电阻吗？",
    "如果机械臂出现剧烈发烫啸叫或下垂，我该让嵌入式同事改哪个参数？",
    "生成可以直接复制发给嵌入式同事的专业沟通小抄",
  ];

  return (
    <div
      id="code-translator-container"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`space-y-6 relative transition-all duration-150 ${
        dragActive ? "ring-4 ring-cyan-400/80 rounded-3xl bg-cyan-950/20" : ""
      }`}
    >
      {/* Top Drag Overlay if Dragging (with pointer-events-none to prevent flickering) */}
      {dragActive && (
        <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-md z-50 rounded-3xl border-2 border-dashed border-cyan-400 flex flex-col items-center justify-center text-center p-6 space-y-3 pointer-events-none select-none shadow-2xl animate-fade-in">
          <div className="p-4 rounded-2xl bg-cyan-950/90 border border-cyan-500/60 shadow-lg shadow-cyan-500/20">
            <FolderArchive className="w-12 h-12 text-cyan-400 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-wide">松开鼠标，立即上传并内置解压工程压缩包！</h3>
          <p className="text-sm text-slate-300 max-w-md leading-relaxed">
            支持 <strong>.zip / .tar.gz / .7z</strong> 等完整工程安装包，以及 <strong>.c / .cpp / .py / .sh</strong> 单源文件。
          </p>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-slate-200 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-cyan-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-cyan-950/50 text-cyan-400 border border-cyan-800/60 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                机械工程师专属 · 嵌入式代码白话透视镜
              </span>
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-slate-800 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                内置 Bandizip 引擎 · 支持 .zip 压缩包一键解压与全工程架构导读
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>嵌入式代码物理动作翻译器 & 机电跨界协同台</span>
            </h2>

            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
              专门为 <strong>机械结构与机电研发工程师</strong> 打造。可直接<strong>拖拽上传同事发送的 .zip 压缩包</strong>或源码，内置解压引擎自动解密目录树、提炼<strong>【减速比/力矩/限位对照表】</strong>、呈现<strong>【手把手终端编译与运行指令】</strong>，让软硬件联调无缝对接。
            </p>
          </div>

          {/* Quick Upload Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Upload Zip Button */}
            <button
              onClick={() => zipInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              <FolderArchive className="w-4 h-4 text-slate-950" />
              <span>上传/解压工程压缩包 (.zip)</span>
            </button>
            <input
              ref={zipInputRef}
              type="file"
              accept=".zip,.tar,.gz,.tgz,.7z,.rar"
              className="hidden"
              onChange={(e) => handleIncomingFiles(e.target.files)}
            />

            {/* Upload Single File Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-semibold transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-cyan-400" />
              <span>上传单文件 (.c/.cpp/.py)</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".c,.cpp,.h,.hpp,.py,.ino,.txt,.json,.yaml,.sh"
              className="hidden"
              onChange={(e) => handleIncomingFiles(e.target.files)}
            />
          </div>
        </div>
      </div>

      {/* Main Mode Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHubViewMode("zip_workspace")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              hubViewMode === "zip_workspace"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>📦 压缩包解压与工程透视工作区</span>
            {archiveResult && (
              <span className="bg-slate-950/80 text-cyan-300 text-[10px] px-1.5 py-0.5 rounded font-mono">
                {archiveResult.archiveName}
              </span>
            )}
          </button>

          <button
            onClick={() => setHubViewMode("single_file")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              hubViewMode === "single_file"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>📄 单文件精细翻译与编辑台</span>
            {allFiles.length > 0 && (
              <span className="bg-slate-950/80 text-cyan-300 text-[10px] px-1.5 py-0.5 rounded font-mono">
                {allFiles.length} 份文件
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => zipInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>上传工程压缩包 (.zip)</span>
          </button>
        </div>
      </div>

      {/* Unzip Loading or Error Indicator */}
      {isUnzipping && (
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm font-bold text-white font-mono">
            内置 Bandizip 引擎正在解压并解析压缩包目录结构...
          </p>
        </div>
      )}

      {unzipError && (
        <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-2xl flex items-center gap-3 text-rose-300 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{unzipError}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: ZIP DECOMPRESSION & REPOSITORY WORKSPACE */}
      {/* ========================================================================= */}
      {hubViewMode === "zip_workspace" && !isUnzipping && (
        <>
          {archiveResult ? (
            <ZipWorkspaceExplorer
              archiveResult={archiveResult}
              onSelectFileToMainEditor={handleLoadExtractedFileToMainEditor}
              onUploadNewZipClick={() => zipInputRef.current?.click()}
              onCloseArchive={() => setArchiveResult(null)}
            />
          ) : (
            <div className="p-12 rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/40 text-center space-y-4 max-w-2xl mx-auto my-4 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center mx-auto text-cyan-400 shadow-lg shadow-cyan-500/10">
                <FolderArchive className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  请拖拽或上传您的嵌入式工程压缩包 (.zip)
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  系统内置解压引擎将自动在浏览器中解压整个工程代码结构，并为您生成机械物理直觉、硬件引脚透视与编译调试指南。
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => zipInputRef.current?.click()}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono inline-flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer transition-all hover:scale-102"
                >
                  <Upload className="w-4 h-4" />
                  <span>选择本地工程压缩包上传</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: SINGLE FILE TRANSLATION BENCH */}
      {/* ========================================================================= */}
      {hubViewMode === "single_file" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ===================== LEFT COLUMN: File Library & Code Editor (5 Cols) ===================== */}
          <div className="lg:col-span-5 space-y-4">
            {/* File Selector & Drag-and-Drop Zone */}
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <span>已上传源码文件 ({allFiles.length})</span>
                </div>
                {allFiles.length > 0 && (
                  <button
                    onClick={handleClearAllFiles}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>清空全部</span>
                  </button>
                )}
              </div>

              {/* File Pill List or Empty State */}
              {allFiles.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-center space-y-2">
                  <FileCode className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-300 font-mono">暂无上传源码文件</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                    您可以点击上方「上传单文件」或将 .c / .cpp / .py 拖入，也可以直接在下方编辑器粘贴代码开始翻译。
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {allFiles.map((f) => {
                    const isSelected = f.id === selectedFileId;
                    return (
                      <div
                        key={f.id}
                        onClick={() => setSelectedFileId(f.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer relative flex items-start justify-between gap-2 ${
                          isSelected
                            ? "bg-slate-800 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/20"
                            : "bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/80 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                f.language === "c" || f.language === "cpp"
                                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                                  : f.language === "python"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                  : "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                              }`}
                            >
                              {f.language.toUpperCase()}
                            </span>
                            <span
                              className={`text-xs font-bold font-mono truncate ${
                                isSelected ? "text-slate-100" : "text-slate-300"
                              }`}
                            >
                              {f.fileName}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{f.hardwareContext}</p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono text-slate-500">{f.fileSizeFormatted}</span>
                          <button
                            onClick={(e) => handleDeleteCustomFile(f.id, e)}
                            title="删除此上传代码"
                            className="p-1 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Colleague Note Callout */}
            {activeFile?.authorNote && (
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/50 text-xs font-mono text-cyan-200 flex items-start gap-2.5">
                <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-cyan-300 block mb-0.5">文件备注：</span>
                  <span className="text-slate-300 leading-relaxed">{activeFile.authorNote}</span>
                </div>
              </div>
            )}

            {/* Code Viewer & Live Edit Panel */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
              {/* Editor Toolbar */}
              <div className="p-3 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-bold text-slate-200">{activeFile?.fileName || "代码编辑区"}</span>
                  <span className="text-[11px] text-slate-500">
                    ({codeBuffer ? codeBuffer.split("\n").length : 0} 行)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    disabled={!codeBuffer}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-[11px] font-mono transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? "已复制" : "复制代码"}</span>
                  </button>
                </div>
              </div>

              {/* Textarea Editor */}
              <div className="relative p-3 bg-slate-950">
                <textarea
                  value={codeBuffer}
                  onChange={(e) => setCodeBuffer(e.target.value)}
                  rows={16}
                  className="w-full bg-transparent font-mono text-xs text-slate-200 focus:outline-none resize-y leading-relaxed"
                  placeholder="在此直接粘贴或修改您的嵌入式源码 (例如 .c / .cpp / .py 等)..."
                />
              </div>

              {/* Footer Action Trigger */}
              <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500 font-mono">
                  支持直接在上方修改参数并重新翻译
                </span>
                <button
                  onClick={() =>
                    handleRunTranslation(
                      codeBuffer,
                      activeFile?.fileName || "源码文件.c",
                      hardwareContext,
                      focusQuestion
                    )
                  }
                  disabled={isTranslating || !codeBuffer.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer shrink-0"
                >
                  {isTranslating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-slate-950" />
                  )}
                  <span>{isTranslating ? "正在深度翻译..." : "一键机电物理翻译"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ===================== RIGHT COLUMN: Mechanical Translation & Inspection (7 Cols) ===================== */}
          <div className="lg:col-span-7 space-y-4">
            {/* Quick Focus Question Prompts */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold font-mono text-slate-200">
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  <span>机械工程师关注疑问速选：</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">点击直接带入提问</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setFocusQuestion(q);
                      handleRunTranslation(
                        codeBuffer,
                        activeFile?.fileName || "源码文件.c",
                        hardwareContext,
                        q
                      );
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-[11px] font-mono transition-all text-left cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Custom Question Bar */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={focusQuestion}
                  onChange={(e) => setFocusQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRunTranslation(
                        codeBuffer,
                        activeFile?.fileName || "源码文件.c",
                        hardwareContext,
                        focusQuestion
                      );
                    }
                  }}
                  placeholder="输入您对这段代码的具体困惑 (如: 为什么第45行要把角度乘以减速比？)..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  onClick={() =>
                    handleRunTranslation(
                      codeBuffer,
                      activeFile?.fileName || "源码文件.c",
                      hardwareContext,
                      focusQuestion
                    )
                  }
                  disabled={isTranslating || !codeBuffer.trim()}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-cyan-400 border border-slate-700 text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>提问</span>
                </button>
              </div>
            </div>

            {/* Translation Result Card with Tabs */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
              {/* View Tabs */}
              <div className="p-3 bg-slate-950/90 border-b border-slate-800/80 flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setActiveResultTab("overview")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeResultTab === "overview"
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>🎯 物理动作本质</span>
                </button>

                <button
                  onClick={() => setActiveResultTab("parameters")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeResultTab === "parameters"
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>🦾 机械参数对照表 ({translationResult.keyParameters.length})</span>
                </button>

                <button
                  onClick={() => setActiveResultTab("hardware")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeResultTab === "hardware"
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <Cable className="w-3.5 h-3.5" />
                  <span>🔌 硬件与电气引脚</span>
                </button>

                <button
                  onClick={() => setActiveResultTab("troubleshoot")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeResultTab === "troubleshoot"
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>⚠️ 机电排障指南</span>
                </button>

                <button
                  onClick={() => setActiveResultTab("cheat_sheet")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeResultTab === "cheat_sheet"
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>💬 跨专业沟通小抄</span>
                </button>

                {rawAiResponse && (
                  <button
                    onClick={() => setActiveResultTab("raw_ai")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeResultTab === "raw_ai"
                        ? "bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20"
                        : "text-purple-300 hover:text-purple-100 hover:bg-slate-800"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI 完整透视报告</span>
                  </button>
                )}
              </div>

              {/* Tab Contents */}
              <div className="p-5 space-y-4">
                {/* TAB 1: OVERVIEW */}
                {activeResultTab === "overview" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold font-mono text-cyan-400">
                        <Gauge className="w-4 h-4" />
                        <span>这段代码在物理世界中做了什么？</span>
                      </div>
                      <p className="text-slate-200 text-sm leading-relaxed">
                        {translationResult.physicalActionSummary}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                        物理运动时序拆解 (Step-by-step Motion Breakdown)：
                      </h4>
                      <div className="space-y-2 font-mono text-xs">
                        {translationResult.motionBreakdown.map((step, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 flex items-start gap-2.5"
                          >
                            <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/80 flex items-center justify-center shrink-0 text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: PARAMETERS TABLE */}
                {activeResultTab === "parameters" && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono font-bold text-slate-300">
                      机械工程师最关心的参数提取与对照表：
                    </h4>
                    <div className="overflow-x-auto border border-slate-800 rounded-xl">
                      <table className="w-full text-left text-xs font-mono border-collapse">
                        <thead>
                          <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                            <th className="p-3">物理意义 (机械关注)</th>
                            <th className="p-3">代码变量名</th>
                            <th className="p-3">当前数值</th>
                            <th className="p-3">机械影响 / 建议</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                          {translationResult.keyParameters.map((p, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/40">
                              <td className="p-3 font-bold text-cyan-300">{p.paramName}</td>
                              <td className="p-3 text-slate-400">{p.varName}</td>
                              <td className="p-3 font-bold text-amber-300">{p.currentValue}</td>
                              <td className="p-3 text-slate-300 font-sans">{p.mechanicalImpact}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 3: HARDWARE WIRING */}
                {activeResultTab === "hardware" && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono font-bold text-slate-300">
                      硬件引脚与电气总线映射：
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {translationResult.pinoutAndSignals.map((item, idx) => (
                        <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-cyan-300">{item.pinOrBus}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                              {item.signalType}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">连接对象: {item.connectedHardware}</p>
                          <p className="text-[11px] text-amber-400/90 leading-relaxed font-sans">
                            ⚠️ 注意事项: {item.wiringPrecautions}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: TROUBLESHOOT */}
                {activeResultTab === "troubleshoot" && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono font-bold text-slate-300">
                      机电软硬件联调排障指南：
                    </h4>
                    <div className="space-y-2.5">
                      {translationResult.troubleshootingGuide.map((t, idx) => (
                        <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>故障现象: {t.symptom}</span>
                          </div>
                          <p className="text-xs text-slate-400 font-mono">代码关注位置: {t.probableCodeLocation}</p>
                          <p className="text-xs text-emerald-300 font-sans">
                            🔧 机械建议与排查: {t.mechanicalAction}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 5: CHEAT SHEET */}
                {activeResultTab === "cheat_sheet" && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono font-bold text-slate-300">
                      高情商跨专业沟通小抄 (点击复制直接发给嵌入式同事)：
                    </h4>
                    <div className="space-y-2">
                      {translationResult.colleagueCheatSheet.map((text, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            navigator.clipboard.writeText(text);
                            setCopiedCheatIndex(idx);
                            setTimeout(() => setCopiedCheatIndex(null), 2000);
                          }}
                          className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs text-slate-200 flex items-center justify-between gap-3 cursor-pointer group transition-colors"
                        >
                          <span className="font-sans leading-relaxed">{text}</span>
                          <span className="shrink-0 text-cyan-400 group-hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                            {copiedCheatIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedCheatIndex === idx ? "已复制" : "复制"}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 6: RAW AI REPORT */}
                {activeResultTab === "raw_ai" && rawAiResponse && (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-sans text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {rawAiResponse}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
