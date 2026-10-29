import React, { useState, useEffect, useRef } from "react";
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Sparkles,
  Edit,
  Trash2,
  Check,
  ShieldCheck,
  Cpu,
  Layers,
  Wrench,
  FileCode,
  Compass,
  ChevronDown,
  ChevronUp,
  Tag,
  Info,
  RotateCcw,
  Box,
  Eye,
  Activity,
  FileCheck,
  Printer,
  ExternalLink,
} from "lucide-react";
import {
  MechanicalStructureItem,
  StructureCategory,
  MaterialType,
} from "../../types";
import {
  DEFAULT_PRESET_STRUCTURES,
  loadSavedStructures,
  saveStructures,
  exportStructuresToJson,
} from "../../data/mechanicalStructureData";
import { StructureSchematicViewer } from "./StructureSchematicViewer";
import { CreateStructureModal } from "./CreateStructureModal";
import { StructureDfmModal } from "./StructureDfmModal";
import { StepUploadModal } from "./StepUploadModal";

interface StructureLibraryHubProps {
  onOpenSlicingHub?: () => void;
}

export const StructureLibraryHub: React.FC<StructureLibraryHubProps> = ({ onOpenSlicingHub }) => {
  const [structures, setStructures] = useState<MechanicalStructureItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("全部");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedStructureForDfm, setSelectedStructureForDfm] = useState<MechanicalStructureItem | null>(null);
  const [editingStructure, setEditingStructure] = useState<MechanicalStructureItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isStepUploadOpen, setIsStepUploadOpen] = useState<boolean>(false);
  const [expandedTolerances, setExpandedTolerances] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loaded = loadSavedStructures();
    setStructures(loaded);
  }, []);

  const handleSaveStructure = (newOrUpdated: MechanicalStructureItem) => {
    let updatedList: MechanicalStructureItem[];
    const exists = structures.some((s) => s.id === newOrUpdated.id);
    if (exists) {
      updatedList = structures.map((s) => (s.id === newOrUpdated.id ? newOrUpdated : s));
    } else {
      updatedList = [newOrUpdated, ...structures];
    }
    setStructures(updatedList);
    saveStructures(updatedList);
    setEditingStructure(null);
  };

  const handleDeleteStructure = (id: string, name: string) => {
    if (window.confirm(`确定要从结构库中删除「${name}」吗？`)) {
      const filtered = structures.filter((s) => s.id !== id);
      setStructures(filtered);
      saveStructures(filtered);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm("确定要恢复包含 OpenArm 与 Aero Hand Open 的全套 12 大预设结构库吗？（不会删除您自建的结构）")) {
      const customOnes = structures.filter((s) => s.isUserCustom);
      const combined = [...customOnes, ...DEFAULT_PRESET_STRUCTURES];
      setStructures(combined);
      saveStructures(combined);
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setStructures(parsed);
          saveStructures(parsed);
          alert("成功导入结构库数据！");
        }
      } catch (err) {
        alert("导入失败：JSON 格式不正确");
      }
    };
    reader.readAsText(file);
  };

  const toggleTolerances = (id: string) => {
    setExpandedTolerances((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = [
    "全部",
    "OpenArm J1基座",
    "OpenArm J2大臂",
    "J3小臂肘部",
    "J4腕部回转",
    "OpenArm J6末端",
    "Aero Hand Open 机械手",
    "开源腱绳灵巧手",
    "减速与传动箱",
    "走线与张紧机构",
    "自研非标部件",
  ];

  const filteredStructures = structures.filter((item) => {
    const matchesCategory =
      activeCategory === "全部" ||
      item.category === activeCategory ||
      (activeCategory === "自研非标部件" && item.isUserCustom);

    const matchesSearch =
      searchKeyword === "" ||
      item.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.material.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.bearingSpecs.some((b) => b.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      item.tags.some((t) => t.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      (item.cadStepFileName && item.cadStepFileName.toLowerCase().includes(searchKeyword.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const customCount = structures.filter((s) => s.isUserCustom).length;
  const openArmCount = structures.filter((s) => s.name.includes("OpenArm") || s.tags.includes("OpenArm")).length;
  const amazingHandCount = structures.filter((s) => s.name.includes("Amazing Hand") || s.tags.includes("Amazing Hand")).length;
  const tendonHandCount = structures.filter((s) => s.name.includes("腱绳") || s.category === "开源腱绳灵巧手" || s.tags.includes("开源绳驱动")).length;

  return (
    <div id="structure-library-root" className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Boxes className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
                OpenArm & 仿生机械手 (Amazing Hand / 经典开源腱绳) 结构资产库
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                全套 CAD / STP 资产归档
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
              全面收录 <strong>OpenArm 六轴达妙 CAN 电机臂（J1-J6连杆/摆线箱）</strong>、<strong>AmazingHand 飞特舵机仿生手（Pollen Robotics 开源 Capstan 绞盘/球头掌指）</strong> 与 <strong>Aero Hand Open (TetherIA 16关节/7-DoF)</strong>。支持直接上传并解析您的 <strong>.STP / .STEP / .3MF / .STL</strong> 文件并自动提取配合公差与 DFM 制造自检规范。
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="https://github.com/enactic/openarm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 transition-colors shadow-sm"
              >
                <ExternalLink className="w-3 h-3 text-cyan-400" />
                <span>OpenArm 官方开源 (enactic/openarm)</span>
              </a>

              <a
                href="https://github.com/pollen-robotics/AmazingHand"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono bg-purple-950/70 hover:bg-purple-900 text-purple-300 border border-purple-700/60 transition-colors shadow-sm"
              >
                <ExternalLink className="w-3 h-3 text-purple-400" />
                <span>AmazingHand 开源 (Pollen Robotics)</span>
              </a>

              <a
                href="https://tetheria.github.io/aero-hand-open/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono bg-blue-950/70 hover:bg-blue-900 text-blue-300 border border-blue-700/60 transition-colors shadow-sm"
              >
                <ExternalLink className="w-3 h-3 text-cyan-400" />
                <span>Aero Hand Open (TetherIA)</span>
              </a>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {onOpenSlicingHub && (
              <button
                onClick={onOpenSlicingHub}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
                title="进入 3MF 3D 打印切片与耗材管理库"
              >
                <Printer className="w-4 h-4 text-slate-950" />
                <span>3MF 切片与 3D 打印库</span>
              </button>
            )}

            {/* Primary Action: Direct STP File Upload & Parser */}
            <button
              onClick={() => setIsStepUploadOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              <Box className="w-4 h-4 text-slate-950" />
              <span>上传 STP / 3D CAD 模型</span>
            </button>

            <button
              onClick={() => {
                setEditingStructure(null);
                setIsCreateModalOpen(true);
              }}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>手动表单建档</span>
            </button>

            <button
              onClick={() => exportStructuresToJson(structures)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              title="将结构库导出为 JSON 备份文件"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>导出 JSON 库</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              title="从 JSON 导入已保存的结构库"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>导入 JSON 库</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJson}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-500 block">库内结构总数</span>
            <span className="text-lg font-bold text-slate-100">{structures.length} 个核心部件</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-500 block">OpenArm 达妙电机臂</span>
            <span className="text-lg font-bold text-cyan-400">{openArmCount} 个关节/连杆部件</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-500 block">Amazing Hand 飞特手</span>
            <span className="text-lg font-bold text-purple-300">{amazingHandCount} 个手掌/指骨模组</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-500 block">开源腱绳灵巧手</span>
            <span className="text-lg font-bold text-amber-400">{tendonHandCount} 个差动/Bowden部件</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-500 block">自研定制 / STP 导入</span>
            <span className="text-lg font-bold text-emerald-400">{customCount} 个独创结构</span>
          </div>
        </div>
      </div>

      {/* STP Quick Upload Promotion Banner */}
      <div className="bg-slate-900/60 border border-cyan-900/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              拥有自己的 .STP / .STEP 结构文件？直接拖入即刻解析与入库
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              内置 ISO-10303 解析器，自动识别 CAD 建模软件、三维外形包络尺寸、实体曲面数，并自动推荐材料、加工工艺与轴承公差。
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsStepUploadOpen(true)}
          className="px-4 py-2 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold font-mono transition-all shrink-0 cursor-pointer"
        >
          打开 3D CAD 上传解析器
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜索结构名称、轴承型号 (如 6805ZZ)、材料、STEP文件名..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Reset button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefault}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-3 py-2 bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>恢复官方 12 大预设</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat
                ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            {cat}
            {cat === "自研非标部件" && customCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-400/20 text-cyan-300">
                {customCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Structure Cards Grid */}
      {filteredStructures.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl space-y-3">
          <Boxes className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="text-slate-300 font-medium text-sm">未找到匹配的机械结构件</div>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            您可以尝试更换搜索关键词，或者点击右上角上传您的 .STP 文件直接录入新结构。
          </p>
          <button
            onClick={() => setIsStepUploadOpen(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>上传您的 STP 3D 模型</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredStructures.map((struct) => (
            <div
              key={struct.id}
              className={`bg-slate-900/70 border rounded-2xl p-6 shadow-xl transition-all hover:border-slate-700 flex flex-col justify-between space-y-5 ${
                struct.isUserCustom
                  ? "border-cyan-500/40 hover:border-cyan-500/80 shadow-cyan-950/20"
                  : "border-slate-800"
              }`}
            >
              {/* Card Top */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                        {struct.category}
                      </span>
                      {struct.isUserCustom ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center gap-1">
                          <Check className="w-3 h-3" /> 自研录入 / STP
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-800">
                          官方基底预设
                        </span>
                      )}
                      {struct.cadStepFileName && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono text-indigo-300 bg-indigo-950/60 border border-indigo-800/50">
                          {struct.cadStepFileName}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-100 tracking-tight">
                      {struct.name}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingStructure(struct);
                        setIsCreateModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="编辑结构参数"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {struct.isUserCustom && (
                      <button
                        onClick={() => handleDeleteStructure(struct.id, struct.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="删除此结构"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2D / 3D Schematic Representation */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
                  <StructureSchematicViewer
                    type={struct.schematicSvgType}
                    name={struct.name}
                  />
                </div>

                {/* Specs Pill Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">制造材料</span>
                    <span className="text-slate-300 truncate block font-sans">{struct.material.split(" ")[0]}</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">加工工艺</span>
                    <span className="text-slate-300 truncate block font-sans">{struct.process.split(" ")[0]}</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">包络尺寸</span>
                    <span className="text-cyan-400 block truncate">
                      {struct.dimensionsMm.length}×{struct.dimensionsMm.width}×{struct.dimensionsMm.height}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">估算自重 / 扭矩</span>
                    <span className="text-emerald-400 block truncate">
                      {struct.weightGrams}g / {struct.ratedTorqueNm}N·m
                    </span>
                  </div>
                </div>

                {/* Bearings & Fasteners list */}
                <div className="space-y-2 text-xs">
                  <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                    <span className="text-[10px] font-mono text-slate-500 block mb-1">配套轴承与运动副：</span>
                    <ul className="text-slate-300 font-mono text-[11px] space-y-0.5 list-disc list-inside">
                      {struct.bearingSpecs.map((b, i) => (
                        <li key={i} className="truncate">
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                    <span className="text-[10px] font-mono text-slate-500 block mb-1">标准紧固件与辅料：</span>
                    <ul className="text-slate-300 font-mono text-[11px] space-y-0.5 list-disc list-inside">
                      {struct.fasteners.map((f, i) => (
                        <li key={i} className="truncate">
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Critical Tolerances Collapsible */}
                {struct.criticalTolerances.length > 0 && (
                  <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                    <button
                      onClick={() => toggleTolerances(struct.id)}
                      className="w-full px-3 py-2 flex items-center justify-between text-xs text-slate-300 hover:bg-slate-800/60 transition-colors cursor-pointer"
                    >
                      <span className="font-mono text-cyan-400 font-semibold flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5" />
                        配合公差与止口要求 ({struct.criticalTolerances.length} 处)
                      </span>
                      {expandedTolerances[struct.id] ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </button>

                    {expandedTolerances[struct.id] && (
                      <div className="p-3 border-t border-slate-800 space-y-2 text-xs">
                        {struct.criticalTolerances.map((tol, idx) => (
                          <div key={idx} className="p-2 bg-slate-900/90 rounded-lg border border-slate-800/80 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-slate-200 font-bold">{tol.feature}</span>
                              <span className="text-emerald-400 font-bold bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/50">
                                {tol.nominalSize} {tol.toleranceSpec}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed">{tol.reason}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {struct.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      #{t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedStructureForDfm(struct)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>DFM 与装配评审</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STEP CAD File Direct Upload & 3D Parsing Modal */}
      <StepUploadModal
        isOpen={isStepUploadOpen}
        onClose={() => setIsStepUploadOpen(false)}
        onSaveStructure={handleSaveStructure}
      />

      {/* Manual Creation / Edit Modal */}
      <CreateStructureModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingStructure(null);
        }}
        onSave={handleSaveStructure}
        initialData={editingStructure}
      />

      {/* DFM & Assembly Review Modal */}
      {selectedStructureForDfm && (
        <StructureDfmModal
          structure={selectedStructureForDfm}
          isOpen={!!selectedStructureForDfm}
          onClose={() => setSelectedStructureForDfm(null)}
        />
      )}
    </div>
  );
};
