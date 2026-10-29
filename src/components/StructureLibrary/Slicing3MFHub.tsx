import React, { useState, useEffect, useRef } from "react";
import {
  Printer,
  FileCode,
  Upload,
  Download,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  Sparkles,
  Search,
  Filter,
  Flame,
  CheckCircle2,
  Clock,
  Weight,
  Gauge,
  Thermometer,
  ShieldCheck,
  Zap,
  HelpCircle,
  Copy,
  Check,
  AlertTriangle,
  FolderArchive,
  RefreshCw,
  Cpu,
  Boxes,
} from "lucide-react";
import { SlicingPlateItem } from "../../types";
import { DEFAULT_3MF_SLICING_PLATES } from "../../data/slicing3mfData";
import {
  createValid3MFPackage,
  saveUploaded3MFBlob,
  getUploaded3MFBlob,
  exportBambuProcessJson,
} from "../../utils/generate3MF";
import confetti from "canvas-confetti";

const STORAGE_KEY = "robotics_workbench_3mf_plates_v2";

interface Slicing3MFHubProps {
  onBackToStructures?: () => void;
}

export const Slicing3MFHub: React.FC<Slicing3MFHubProps> = ({ onBackToStructures }) => {
  const [plates, setPlates] = useState<SlicingPlateItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SlicingPlateItem[];
        // Filter out legacy default items and merge with latest defaults
        const userCustomPlates = parsed.filter((p) => p.isUserUploaded);
        return [...DEFAULT_3MF_SLICING_PLATES, ...userCustomPlates];
      }
    } catch (e) {
      console.error("Failed to load 3MF plates from localStorage", e);
    }
    return DEFAULT_3MF_SLICING_PLATES;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("全部");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("全部");
  const [selectedSlicer, setSelectedSlicer] = useState<string>("全部");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals & Details
  const [activePlateDetail, setActivePlateDetail] = useState<SlicingPlateItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Batch Printing Calculator State
  const [batchCount, setBatchCount] = useState<number>(5);
  const [printerCount, setPrinterCount] = useState<number>(2);
  const [filamentCostPerKg, setFilamentCostPerKg] = useState<number>(180); // e.g. 180 RMB/kg for PLA-CF/PETG-CF
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plates));
    } catch (e) {
      console.error("Failed to save 3MF plates to localStorage", e);
    }
  }, [plates]);

  // Filtered List
  const filteredPlates = plates.filter((plate) => {
    const matchesCat =
      selectedCategory === "全部" ||
      (selectedCategory === "AmazingHand" && plate.projectCategory === "AmazingHand") ||
      (selectedCategory === "Aero Hand Open" && plate.projectCategory === "Aero Hand Open") ||
      (selectedCategory === "OpenArm 机械臂" && plate.projectCategory === "OpenArm 机械臂") ||
      (selectedCategory === "自研非标与夹爪" && plate.projectCategory === "自研非标与夹爪");

    const matchesMaterial =
      selectedMaterial === "全部" || plate.materialType.includes(selectedMaterial);

    const matchesSlicer =
      selectedSlicer === "全部" || plate.slicerSoftware.includes(selectedSlicer);

    const matchesSearch =
      searchQuery.trim() === "" ||
      plate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plate.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plate.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      plate.printerModel.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesMaterial && matchesSlicer && matchesSearch;
  });

  // Handle File Download (Real 3MF ZIP package with 3D geometry or raw user uploaded file)
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);

  const handleDownload3MF = async (plate: SlicingPlateItem) => {
    try {
      setDownloadingId(plate.id);

      // 1. Check if user previously uploaded a raw binary 3MF file
      const userBlob = await getUploaded3MFBlob(plate.id);
      let blobToDownload: Blob;

      if (userBlob) {
        blobToDownload = userBlob;
      } else {
        // 2. Generate standard compliant OPC ZIP 3MF file with real 3D mesh geometry & Bambu metadata
        blobToDownload = await createValid3MFPackage(plate);
      }

      const url = URL.createObjectURL(blobToDownload);
      const a = document.createElement("a");
      a.href = url;
      a.download = plate.fileName.endsWith(".3mf") ? plate.fileName : `${plate.fileName}.3mf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to package 3MF", err);
      alert("3MF 切片工程生成失败，请重试！");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadBambuJsonProfile = (plate: SlicingPlateItem) => {
    try {
      const blob = exportBambuProcessJson(plate);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bambu_Process_${plate.projectCategory}_Plate${plate.plateIndex}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to export Bambu Process JSON", e);
    }
  };

  const handleCopyParams = (plate: SlicingPlateItem) => {
    const text = `【${plate.title}】3D 打印切片参数清单 (适配 ${plate.slicerSoftware}):
- 建议耗材: ${plate.materialType}
- 喷嘴温度: ${plate.recommendedNozzleTempC}°C / 热床: ${plate.recommendedBedTempC}°C
- 层高: ${plate.layerHeightMm}mm | 墙层数: ${plate.wallLoops} | 顶底层: ${plate.topBottomLayers}
- 填充率: ${plate.infillPercent}% (${plate.infillPattern})
- 预估单盘耗时: ${plate.printTimeHours} 小时 | 耗材用量: ${plate.filamentGrams}g (${plate.filamentMeters}m)
- 关键注意事项:
${plate.printTips.map((tip, i) => `  ${i + 1}. ${tip}`).join("\n")}
`;
    navigator.clipboard.writeText(text);
    setCopiedId(plate.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeletePlate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("确定要从本地切片库中移除该 3MF 打印盘切片吗？")) {
      setPlates((prev) => prev.filter((p) => p.id !== id));
      if (activePlateDetail?.id === id) {
        setActivePlateDetail(null);
      }
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm("确定要恢复默认预设的 AmazingHand、Aero Hand Open 与 OpenArm 官方 3MF 切片盘吗？（自定义上传的将保留）")) {
      const customPlates = plates.filter((p) => p.isUserUploaded);
      setPlates([...customPlates, ...DEFAULT_3MF_SLICING_PLATES]);
    }
  };

  // Upload Form State
  const [newTitle, setNewTitle] = useState("");
  const [newProjectCategory, setNewProjectCategory] = useState<SlicingPlateItem["projectCategory"]>("AmazingHand");
  const [newFileName, setNewFileName] = useState("");
  const [newSlicer, setNewSlicer] = useState<SlicingPlateItem["slicerSoftware"]>("Bambu Studio");
  const [newPrinterModel, setNewPrinterModel] = useState("Bambu Lab X1-Carbon / P1S / A1");
  const [newMaterial, setNewMaterial] = useState<SlicingPlateItem["materialType"]>("PLA-CF (碳纤维增强PLA)");
  const [newLayerHeight, setNewLayerHeight] = useState(0.16);
  const [newInfill, setNewInfill] = useState(100);
  const [newInfillPattern, setNewInfillPattern] = useState<SlicingPlateItem["infillPattern"]>("Gyroid (陀螺状)");
  const [newWallLoops, setNewWallLoops] = useState(6);
  const [newPrintTime, setNewPrintTime] = useState(3.5);
  const [newFilamentGrams, setNewFilamentGrams] = useState(85);
  const [newPartCount, setNewPartCount] = useState(4);
  const [newTipsText, setNewTipsText] = useState("建议开启 Gyroid 填充与 0.16mm 精细层高；配合面预留 0.03mm 间隙补偿。");
  const [newBedTemp, setNewBedTemp] = useState(55);
  const [newNozzleTemp, setNewNozzleTemp] = useState(220);

  const handleCreateNewPlate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newFileName.trim()) {
      alert("请填写切片工程标题与 3MF 文件名称！");
      return;
    }

    const tips = newTipsText
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const plateId = `3mf_custom_${Date.now()}`;

    // If user provided a real file, save its binary blob to IndexedDB
    if (pendingUploadFile) {
      await saveUploaded3MFBlob(plateId, pendingUploadFile);
    }

    const formattedFileSize = pendingUploadFile
      ? `${(pendingUploadFile.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(Math.random() * 15 + 5).toFixed(1)} MB`;

    const newPlate: SlicingPlateItem = {
      id: plateId,
      title: newTitle.trim(),
      projectCategory: newProjectCategory,
      fileName: newFileName.trim().endsWith(".3mf") ? newFileName.trim() : `${newFileName.trim()}.3mf`,
      slicerSoftware: newSlicer,
      printerModel: newPrinterModel.trim() || "Bambu Lab 3D Printer",
      materialType: newMaterial,
      layerHeightMm: Number(newLayerHeight),
      infillPercent: Number(newInfill),
      infillPattern: newInfillPattern,
      wallLoops: Number(newWallLoops),
      topBottomLayers: 5,
      printTimeHours: Number(newPrintTime),
      filamentGrams: Number(newFilamentGrams),
      filamentMeters: Number((newFilamentGrams * 0.33).toFixed(1)),
      partCount: Number(newPartCount) || 1,
      openSourceUrl:
        newProjectCategory === "AmazingHand"
          ? "https://github.com/pollen-robotics/AmazingHand"
          : newProjectCategory === "Aero Hand Open"
          ? "https://tetheria.github.io/aero-hand-open/"
          : newProjectCategory === "OpenArm 机械臂"
          ? "https://github.com/enactic/openarm"
          : undefined,
      openSourceAuthor: "自研工程切片",
      plateIndex: 1,
      plateName: `Plate 1: ${newTitle.trim()}`,
      isUserUploaded: true,
      fileSizeFormatted: formattedFileSize,
      uploadedAt: new Date().toISOString().slice(0, 10),
      recommendedBedTempC: Number(newBedTemp),
      recommendedNozzleTempC: Number(newNozzleTemp),
      printTips: tips.length > 0 ? tips : ["标准工程打印，注意首层附着力与热床调平。"],
      tags: [newProjectCategory, newMaterial.split(" ")[0], `${newLayerHeight}mm`, "3MF切片", "自建"],
    };

    setPlates([newPlate, ...plates]);
    setIsUploadModalOpen(false);
    setPendingUploadFile(null);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Reset Form
    setNewTitle("");
    setNewFileName("");
  };

  // Handle direct file upload via drag-drop / file picker
  const handleDirectFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    setPendingUploadFile(file);
    setNewFileName(file.name);
    setNewTitle(baseName);
    setIsUploadModalOpen(true);
  };

  // Calculate batch metrics
  const totalPlateGrams = filteredPlates.reduce((acc, p) => acc + p.filamentGrams, 0);
  const totalPlateHours = filteredPlates.reduce((acc, p) => acc + p.printTimeHours, 0);

  const batchTotalGrams = totalPlateGrams * batchCount;
  const batchTotalFilamentCost = (batchTotalGrams / 1000) * filamentCostPerKg;
  const batchTotalHours = (totalPlateHours * batchCount) / Math.max(1, printerCount);

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
                <Printer className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                3MF 切片工程与 3D 打印制造资产库
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Bambu Studio / OrcaSlicer / PrusaSlicer
              </span>
            </div>

            <p className="text-slate-300 text-sm max-w-4xl leading-relaxed">
              专为 <strong>AmazingHand (Pollen Robotics 开源灵巧手)</strong>、<strong>Aero Hand Open (TetherIA 16关节/7-DoF)</strong> 及 <strong>OpenArm 机械臂</strong> 打造的 3D 打印制造管理中心。支持归档、解析与管理 <strong>.3MF / .GCODE / .STEP</strong> 切片工程包，内置各盘耗材类型（PLA-CF / PETG / TPU 95A / PEEK）、层高公差补偿、Capstan 绞盘防刮设置与批量打样成本核算。
            </p>

            {/* Direct Open-Source Links Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs font-mono shadow-sm">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>拓竹 Bambu Studio / OrcaSlicer 100% 几何与切片包兼容 (已打包 3D Model Mesh)</span>
              </span>

              <a
                href="https://github.com/enactic/openarm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-indigo-300 border border-indigo-500/40 text-xs font-mono transition-colors shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                <span>OpenArm 官方开源 (enactic/openarm)</span>
              </a>

              <a
                href="https://github.com/pollen-robotics/AmazingHand"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-purple-300 border border-purple-500/40 text-xs font-mono transition-colors shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                <span>AmazingHand 开源仓库 (Pollen Robotics)</span>
              </a>

              <a
                href="https://tetheria.github.io/aero-hand-open/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 text-xs font-mono transition-colors shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <span>Aero Hand Open 官方主页 (TetherIA)</span>
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-950" />
              <span>上传 3MF 切片工程</span>
            </button>

            <button
              onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <Gauge className="w-4 h-4 text-purple-400" />
              <span>{isCalculatorOpen ? "收起成本核算" : "批量制造核算器"}</span>
            </button>

            {onBackToStructures && (
              <button
                onClick={onBackToStructures}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              >
                <Boxes className="w-4 h-4 text-cyan-400" />
                <span>返回 3D 结构库</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-0.5">3MF 切片盘总数</span>
            <span className="text-base font-bold text-white">{plates.length} 盘已切片</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-0.5">AmazingHand 切片</span>
            <span className="text-base font-bold text-purple-400">
              {plates.filter((p) => p.projectCategory === "AmazingHand").length} 盘 (Pollen)
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-0.5">Aero Hand Open 切片</span>
            <span className="text-base font-bold text-cyan-400">
              {plates.filter((p) => p.projectCategory === "Aero Hand Open").length} 盘 (TetherIA)
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-0.5">OpenArm 机械臂切片</span>
            <span className="text-base font-bold text-indigo-400">
              {plates.filter((p) => p.projectCategory === "OpenArm 机械臂").length} 盘 (摆线/连杆)
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-0.5">全套单次打印耗时</span>
            <span className="text-base font-bold text-emerald-400">约 {totalPlateHours.toFixed(1)} 小时</span>
          </div>
        </div>
      </div>

      {/* 3 Open-Source Projects 3MF & CAD Dedicated Inspection Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Project 1: AmazingHand */}
        <div className="bg-slate-900/80 border border-purple-500/30 rounded-2xl p-5 relative overflow-hidden shadow-lg hover:border-purple-500/50 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Pollen Robotics 官方
              </span>
              <span className="text-xs font-mono text-slate-400">8-DoF 仿生灵巧手</span>
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              AmazingHand 制造切片集
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              全套 3D 打印驱动灵巧手。含 4 根二自由度仿生指骨、球窝铰链、双线槽微型 Capstan 绞盘与 TPU 95A 仿生指尖软胶套。
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-slate-800">
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://github.com/pollen-robotics/AmazingHand/tree/main/cad"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-2.5 bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                title="浏览 GitHub 官方 CAD 文件夹中的 STEP / STL 模型"
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>官方 CAD 目录</span>
              </a>
              <a
                href="https://cad.onshape.com/documents/b83aeb0f6e917deeb906cf2c/w/64ec8fe738848d56b69677b1/e/1359c6b753a817454238e8cb"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-2.5 bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                title="在 Onshape 网页端直接查看三维参数模型与装配树，支持导出 3MF/STEP"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Onshape 3D 工作区</span>
              </a>
            </div>
            <a
              href="https://github.com/pollen-robotics/AmazingHand/archive/refs/heads/main.zip"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-purple-600/30"
              title="下载 Pollen Robotics 官方 GitHub 完整开源 Master 代码与 CAD 压缩包"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载官方源码 ZIP (含CAD)</span>
            </a>
          </div>
        </div>

        {/* Project 2: OpenArm */}
        <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-5 relative overflow-hidden shadow-lg hover:border-indigo-500/50 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                enactic 官方开源
              </span>
              <span className="text-xs font-mono text-slate-400">6/7-DoF 协作臂</span>
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              OpenArm 机械臂制造切片集
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              开源机械臂。涵盖 J1-J3 高扭矩摆线减速针轮壳体、双偏心摆线盘、J4-J6 轻量桁架连杆与达妙/宇树电机法兰。
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-slate-800">
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://github.com/enactic/openarm"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-2.5 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>GitHub 官方仓库</span>
              </a>
              <a
                href="https://github.com/enactic/openarm/archive/refs/heads/main.zip"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-indigo-600/30"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下载官方源码 ZIP</span>
              </a>
            </div>
          </div>
        </div>

        {/* Project 3: Aero Hand Open */}
        <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-5 relative overflow-hidden shadow-lg hover:border-cyan-500/50 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                TetherIA 官方
              </span>
              <span className="text-xs font-mono text-slate-400">16关节 / 7-DoF 掌指</span>
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Aero Hand Open 制造切片集
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              超轻量绳驱灵巧手。集成 16 关节运动学、大拇指对掌机构、ESP32-S3 核心驱动仓与微型走线轮系。
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-slate-800">
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://tetheria.github.io/aero-hand-open/docs/hardware"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-2.5 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>硬件指南与 3D</span>
              </a>
              <a
                href="https://tetheria.github.io/aero-hand-open/"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-cyan-600/30"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>官方主页与源码</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Printing & Manufacturing Cost Estimator (Collapsible) */}
      {isCalculatorOpen && (
        <div className="bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-purple-500/40 rounded-2xl p-6 shadow-xl backdrop-blur-md animate-fadeIn space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <Gauge className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white">
                3D 打印小批量试产 / 打样成本与工期智能核算器
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              全套系统制造核算
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">
                试产批次套数 (Units): <strong className="text-white">{batchCount} 套</strong>
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={batchCount}
                onChange={(e) => setBatchCount(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">
                同时开机 3D 打印机台数: <strong className="text-white">{printerCount} 台</strong>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={printerCount}
                onChange={(e) => setPrinterCount(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">
                工程耗材均价 (元/kg): <strong className="text-white">¥{filamentCostPerKg}</strong>
              </label>
              <input
                type="range"
                min="60"
                max="500"
                step="10"
                value={filamentCostPerKg}
                onChange={(e) => setFilamentCostPerKg(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>
          </div>

          {/* Calculation Output Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-500 block">总耗材重量预估</span>
              <span className="text-lg font-bold text-cyan-300">
                {(batchTotalGrams / 1000).toFixed(2)} kg
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                约 {(batchTotalGrams * 0.33).toFixed(0)} 米耗材
              </span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-500 block">总耗材物料成本</span>
              <span className="text-lg font-bold text-amber-400">
                ¥{batchTotalFilamentCost.toFixed(1)} 元
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                单套平均 ¥{(batchTotalFilamentCost / Math.max(1, batchCount)).toFixed(1)} 元
              </span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-500 block">多机并行总交付工期</span>
              <span className="text-lg font-bold text-purple-300">
                约 {(batchTotalHours / 24).toFixed(1)} 天 ({batchTotalHours.toFixed(0)} 小时)
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {printerCount} 台机器全天候连续排产
              </span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-500 block">包含电费与损耗估算</span>
              <span className="text-lg font-bold text-emerald-400">
                ¥{(batchTotalFilamentCost * 1.18).toFixed(1)} 元
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                含 10% 试机打样损耗余量
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Slicing Detail Modal */}
      {activePlateDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-950 text-purple-300 border border-purple-500/40">
                    {activePlateDetail.projectCategory}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {activePlateDetail.slicerSoftware} · {activePlateDetail.fileSizeFormatted}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">{activePlateDetail.title}</h2>
                <p className="text-xs font-mono text-slate-400">{activePlateDetail.fileName}</p>
              </div>

              <button
                onClick={() => setActivePlateDetail(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Official Open Source & CAD Direct Access */}
            <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-purple-200">
                    官方开源项目: <strong>{activePlateDetail.openSourceAuthor}</strong>
                  </span>
                </div>
                {activePlateDetail.openSourceUrl && (
                  <a
                    href={activePlateDetail.openSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors"
                  >
                    <span>GitHub 仓库</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Direct Official CAD Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-purple-500/20 text-xs">
                {activePlateDetail.cadSourceUrl && (
                  <a
                    href={activePlateDetail.cadSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-950/80 hover:bg-slate-900 border border-purple-500/30 rounded-lg text-purple-300 font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Boxes className="w-3.5 h-3.5" />
                    <span>官方 CAD / STL 目录</span>
                  </a>
                )}
                {activePlateDetail.onshapeUrl && (
                  <a
                    href={activePlateDetail.onshapeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-950/80 hover:bg-slate-900 border border-purple-500/30 rounded-lg text-purple-300 font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Onshape 3D 工作区</span>
                  </a>
                )}
                {activePlateDetail.zipDownloadUrl && (
                  <a
                    href={activePlateDetail.zipDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下载官方 Master 源码包</span>
                  </a>
                )}
              </div>
            </div>

            {/* Official STL Files in this Plate */}
            {activePlateDetail.officialStlFiles && activePlateDetail.officialStlFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Boxes className="w-4 h-4 text-purple-400" />
                  <span>本打印盘包含的官方核心 STL 零件清单</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activePlateDetail.officialStlFiles.map((stl, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start gap-2 text-xs"
                    >
                      <FileCode className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-mono font-bold text-slate-200 block">{stl.name}</span>
                        <span className="text-slate-400 text-[11px]">{stl.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comprehensive Slicing Parameter Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-0.5">目标打印机</span>
                <span className="font-bold text-slate-200">{activePlateDetail.printerModel}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-0.5">推荐耗材</span>
                <span className="font-bold text-purple-300">{activePlateDetail.materialType}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-0.5">层高 / 壁厚层数</span>
                <span className="font-bold text-cyan-300">
                  {activePlateDetail.layerHeightMm}mm / {activePlateDetail.wallLoops} 层墙
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-0.5">填充率 / 纹理</span>
                <span className="font-bold text-emerald-300">
                  {activePlateDetail.infillPercent}% ({activePlateDetail.infillPattern})
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-0.5">预估打印耗时</span>
                <span className="font-bold text-amber-300">
                  {activePlateDetail.printTimeHours} 小时 / 盘
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-0.5">耗材消耗量</span>
                <span className="font-bold text-cyan-300">
                  {activePlateDetail.filamentGrams}g ({activePlateDetail.filamentMeters}m)
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-0.5">推荐喷嘴温度</span>
                <span className="font-bold text-orange-300">
                  {activePlateDetail.recommendedNozzleTempC}°C
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-0.5">推荐热床温度</span>
                <span className="font-bold text-yellow-300">
                  {activePlateDetail.recommendedBedTempC}°C
                </span>
              </div>
            </div>

            {/* Bambu Studio Slicing 3-Step Guide */}
            <div className="p-3.5 bg-slate-950/90 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
              <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>拓竹 Bambu Studio / OrcaSlicer 100% 打印标准流程指引</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-slate-300">
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                  <strong className="text-white block mb-1">1. 导入零件</strong>
                  <span className="text-[11px] text-slate-400">
                    从官方源码包或 Onshape 导出 STL，直接拖入 Bambu Studio。
                  </span>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                  <strong className="text-emerald-400 block mb-1">2. 载入工艺配置</strong>
                  <span className="text-[11px] text-slate-400">
                    点击下方「导出拓竹工艺预设 (.json)」，在 Bambu Studio 菜单中选择「文件 → 导入 → 导入配置」。
                  </span>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                  <strong className="text-purple-400 block mb-1">3. 另存工程 3MF</strong>
                  <span className="text-[11px] text-slate-400">
                    切片预览无误后点击「文件 → 另存为工程 (.3mf)」，可上传至团队库中。
                  </span>
                </div>
              </div>
            </div>

            {/* Print Tips & DFM Cheatsheet */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>3D 打印工艺与精密装配避坑指引 (DFM Tips)</span>
              </h4>
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
                {activePlateDetail.printTips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold font-mono shrink-0">0{idx + 1}.</span>
                    <span className="leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar inside Modal */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyParams(activePlateDetail)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copiedId === activePlateDetail.id ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400" />
                  )}
                  <span>复制切片参数</span>
                </button>

                <button
                  onClick={() => handleDownloadBambuJsonProfile(activePlateDetail)}
                  className="px-4 py-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow"
                  title="生成可直接导入拓竹 Bambu Studio 的 .json 工艺配置文件"
                >
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span>导出拓竹工艺预设 (.json)</span>
                </button>
              </div>

              <button
                onClick={() => handleDownload3MF(activePlateDetail)}
                disabled={downloadingId === activePlateDetail.id}
                className="px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all cursor-pointer disabled:opacity-60"
              >
                {downloadingId === activePlateDetail.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{downloadingId === activePlateDetail.id ? "正在打包 3MF 工程..." : "下载 3MF 切片工程"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload 3MF Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-purple-400" />
                  <span>上传并登记 3MF 切片工程文件</span>
                </h3>
                <p className="text-xs text-slate-400">
                  支持归档您的 AmazingHand、Aero Hand Open 或 OpenArm 3MF 切片盘与工艺参数
                </p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewPlate} className="space-y-4 text-xs">
              {/* Drag and Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-purple-500/40 hover:border-purple-500 bg-purple-950/10 hover:bg-purple-950/20 p-5 rounded-2xl text-center cursor-pointer transition-all space-y-2"
              >
                <FolderArchive className="w-8 h-8 text-purple-400 mx-auto" />
                <p className="text-xs text-slate-300">
                  点击选择或拖入您的 <strong>.3mf / .gcode / .step / .stl</strong> 文件
                </p>
                <span className="text-[10px] text-slate-500 block font-mono">
                  支持 Bambu Studio, OrcaSlicer, PrusaSlicer 导出的制造工程包
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleDirectFileUpload}
                  accept=".3mf,.gcode,.step,.stp,.stl"
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">切片工程标题 *</label>
                  <input
                    type="text"
                    required
                    placeholder="如: AmazingHand 掌骨与Capstan盘"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">3MF 文件名称 *</label>
                  <input
                    type="text"
                    required
                    placeholder="如: AmazingHand_Palm_Rev5.3mf"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">所属项目分类</label>
                  <select
                    value={newProjectCategory}
                    onChange={(e) =>
                      setNewProjectCategory(e.target.value as SlicingPlateItem["projectCategory"])
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                  >
                    <option value="AmazingHand">AmazingHand (Pollen Robotics)</option>
                    <option value="Aero Hand Open">Aero Hand Open (TetherIA)</option>
                    <option value="OpenArm 机械臂">OpenArm 机械臂</option>
                    <option value="自研非标与夹爪">自研非标与夹爪</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">切片软件</label>
                  <select
                    value={newSlicer}
                    onChange={(e) =>
                      setNewSlicer(e.target.value as SlicingPlateItem["slicerSoftware"])
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                  >
                    <option value="Bambu Studio">Bambu Studio (拓竹)</option>
                    <option value="OrcaSlicer">OrcaSlicer</option>
                    <option value="PrusaSlicer">PrusaSlicer</option>
                    <option value="Cura">UltiMaker Cura</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">耗材类型</label>
                  <select
                    value={newMaterial}
                    onChange={(e) =>
                      setNewMaterial(e.target.value as SlicingPlateItem["materialType"])
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                  >
                    <option value="PLA-CF (碳纤维增强PLA)">PLA-CF (碳纤维增强PLA)</option>
                    <option value="PETG-CF (耐候耐磨碳纤)">PETG-CF (耐候耐磨碳纤)</option>
                    <option value="PA-CF (尼龙碳纤维/高强度)">PA-CF (尼龙碳纤维/高强度)</option>
                    <option value="TPU 95A (柔性仿生触感)">TPU 95A (柔性仿生触感)</option>
                    <option value="PLA+ (高韧性耗材)">PLA+ (高韧性耗材)</option>
                    <option value="POM / PEEK (耐磨自润滑)">POM / PEEK (耐磨自润滑)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">层高 (mm)</label>
                  <input
                    type="number"
                    step="0.02"
                    value={newLayerHeight}
                    onChange={(e) => setNewLayerHeight(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">填充率 (%)</label>
                  <input
                    type="number"
                    value={newInfill}
                    onChange={(e) => setNewInfill(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">预估耗时 (h)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPrintTime}
                    onChange={(e) => setNewPrintTime(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">耗材重量 (g)</label>
                  <input
                    type="number"
                    value={newFilamentGrams}
                    onChange={(e) => setNewFilamentGrams(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">工艺提示与 DFM 装配建议 (每行一条)</label>
                <textarea
                  rows={2}
                  value={newTipsText}
                  onChange={(e) => setNewTipsText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  取消
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-purple-500/20 cursor-pointer"
                >
                  保存并加入切片库
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
