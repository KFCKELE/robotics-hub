import React, { useState, useRef } from "react";
import { 
  Upload, Sparkles, Image as ImageIcon, CheckCircle2, AlertCircle, 
  X, RefreshCw, Layers, Crosshair, ArrowRight, FileText, Cpu, Eye
} from "lucide-react";
import { ContactShapeType, HeatsinkParams, MountingHole, HeatSourceZone, getContactShapeLabel } from "./utils";
import ReactMarkdown from "react-markdown";

interface DrawingUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentParams: HeatsinkParams;
  onApplyParams: (newParams: Partial<HeatsinkParams>) => void;
}

// Preset technical drawing samples for fast testing
const PRESET_DRAWINGS = [
  {
    id: "quad_hole_cpu",
    title: "标准 4孔 CPU 接触板",
    subtitle: "80×60mm 带4个M3沉头孔",
    shape: "mounting_4holes" as ContactShapeType,
    width: 60,
    length: 80,
    holes: [
      { x: -22, y: -30, diameter: 3.5, type: "counterbore" as const },
      { x: 22, y: -30, diameter: 3.5, type: "counterbore" as const },
      { x: -22, y: 30, diameter: 3.5, type: "counterbore" as const },
      { x: 22, y: 30, diameter: 3.5, type: "counterbore" as const },
    ],
    hotspot: { width: 30, length: 30, offsetX: 0, offsetY: 0, power: 45 },
    notes: "工业级工控核心板接触面，中心为 30x30mm 45W 处理器，四角配置 M3 弹簧沉头螺栓固定。",
    // Simple SVG representation data URL
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="100%" height="100%">
      <rect width="200" height="240" fill="#0f172a" />
      <rect x="25" y="20" width="150" height="200" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,2"/>
      <rect x="70" y="90" width="60" height="60" rx="4" fill="#f97316" fill-opacity="0.3" stroke="#f97316" stroke-width="2"/>
      <text x="100" y="125" fill="#fdba74" font-size="10" font-family="monospace" text-anchor="middle">CHIP 45W</text>
      <circle cx="45" cy="40" r="7" fill="#0f172a" stroke="#cbd5e1" stroke-width="2"/>
      <circle cx="155" cy="40" r="7" fill="#0f172a" stroke="#cbd5e1" stroke-width="2"/>
      <circle cx="45" cy="200" r="7" fill="#0f172a" stroke="#cbd5e1" stroke-width="2"/>
      <circle cx="155" cy="200" r="7" fill="#0f172a" stroke="#cbd5e1" stroke-width="2"/>
      <text x="100" y="235" fill="#94a3b8" font-size="9" font-family="sans-serif" text-anchor="middle">80x60mm 4-M3 Mounting</text>
    </svg>`,
  },
  {
    id: "circular_motor",
    title: "无刷电机圆盘接触面",
    subtitle: "Φ75mm 圆盘端盖 6孔分度",
    shape: "circle" as ContactShapeType,
    width: 75,
    length: 75,
    circleDiameter: 75,
    holes: [
      { x: 0, y: -26, diameter: 3.2, type: "threaded" as const },
      { x: 22.5, y: -13, diameter: 3.2, type: "threaded" as const },
      { x: 22.5, y: 13, diameter: 3.2, type: "threaded" as const },
      { x: 0, y: 26, diameter: 3.2, type: "threaded" as const },
      { x: -22.5, y: 13, diameter: 3.2, type: "threaded" as const },
      { x: -22.5, y: -13, diameter: 3.2, type: "threaded" as const },
    ],
    hotspot: { width: 35, length: 35, offsetX: 0, offsetY: 0, power: 60 },
    notes: "大功率无刷云台/关节电机端盖接触面，外径 Φ75mm，中心定子发热 60W，圆周均布 6 个 M3 固定安装孔。",
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="100%" height="100%">
      <rect width="220" height="220" fill="#0f172a" />
      <circle cx="110" cy="110" r="85" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <circle cx="110" cy="110" r="40" fill="#f97316" fill-opacity="0.3" stroke="#f97316" stroke-width="2"/>
      <text x="110" y="114" fill="#fdba74" font-size="10" font-family="monospace" text-anchor="middle">STATOR 60W</text>
      <circle cx="110" cy="50" r="5" fill="#0f172a" stroke="#cbd5e1" stroke-width="1.5"/>
      <circle cx="162" cy="80" r="5" fill="#0f172a" stroke="#cbd5e1" stroke-width="1.5"/>
      <circle cx="162" cy="140" r="5" fill="#0f172a" stroke="#cbd5e1" stroke-width="1.5"/>
      <circle cx="110" cy="170" r="5" fill="#0f172a" stroke="#cbd5e1" stroke-width="1.5"/>
      <circle cx="58" cy="140" r="5" fill="#0f172a" stroke="#cbd5e1" stroke-width="1.5"/>
      <circle cx="58" cy="80" r="5" fill="#0f172a" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="110" y="210" fill="#94a3b8" font-size="9" font-family="sans-serif" text-anchor="middle">Φ75mm Motor Flange</text>
    </svg>`,
  },
  {
    id: "l_shape_pcb",
    title: "L型转角避位接触面",
    subtitle: "70×70mm 转角避开大电容",
    shape: "l_shape" as ContactShapeType,
    width: 70,
    length: 70,
    lShapeCutout: { cutoutW: 32, cutoutL: 32 },
    holes: [
      { x: -22, y: -22, diameter: 3.2, type: "counterbore" as const },
      { x: 22, y: -22, diameter: 3.2, type: "counterbore" as const },
      { x: -22, y: 22, diameter: 3.2, type: "counterbore" as const },
    ],
    hotspot: { width: 25, length: 25, offsetX: -10, offsetY: -10, power: 35 },
    notes: "紧凑型机器人驱动板转角散热接触面，右上角开 32x32mm 缺口以避让高耸电解电容与扼流电感。",
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="100%" height="100%">
      <rect width="220" height="220" fill="#0f172a" />
      <path d="M 30,30 L 190,30 L 190,110 L 110,110 L 110,190 L 30,190 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <rect x="45" y="45" width="45" height="45" rx="4" fill="#f97316" fill-opacity="0.3" stroke="#f97316" stroke-width="1.5"/>
      <text x="67" y="72" fill="#fdba74" font-size="9" font-family="monospace" text-anchor="middle">MOSFET</text>
      <circle cx="50" cy="50" r="5" fill="#0f172a" stroke="#cbd5e1" stroke-width="1.5"/>
      <circle cx="170" cy="50" r="5" fill="#0f172a" stroke="#cbd5e1" stroke-width="1.5"/>
      <circle cx="50" cy="170" r="5" fill="#0f172a" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="150" y="150" fill="#64748b" font-size="9" font-family="sans-serif">Capacitor Notch</text>
    </svg>`,
  },
  {
    id: "stepped_dual_die",
    title: "双台阶高低差接触面",
    subtitle: "90×50mm 适应高低不同芯片",
    shape: "stepped" as ContactShapeType,
    width: 50,
    length: 90,
    steppedDetails: { stepWidth: 35, stepLength: 40, stepHeight: 2.5 },
    holes: [
      { x: -18, y: -35, diameter: 3.2, type: "counterbore" as const },
      { x: 18, y: -35, diameter: 3.2, type: "counterbore" as const },
      { x: -18, y: 35, diameter: 3.2, type: "counterbore" as const },
      { x: 18, y: 35, diameter: 3.2, type: "counterbore" as const },
    ],
    hotspot: { width: 30, length: 30, offsetX: 0, offsetY: -15, power: 50 },
    notes: "主控 SOC 与外置高速 PHY/供电芯片存在 2.5mm 高度差，底座采用阶梯双凸台直接贴合，消除厚导热垫热阻。",
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180" width="100%" height="100%">
      <rect width="240" height="180" fill="#0f172a" />
      <rect x="20" y="30" width="200" height="120" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <rect x="40" y="50" width="80" height="80" rx="4" fill="#3b82f6" fill-opacity="0.3" stroke="#60a5fa" stroke-width="1.5" stroke-dasharray="3,3"/>
      <text x="80" y="95" fill="#93c5fd" font-size="9" font-family="monospace" text-anchor="middle">Step +2.5mm</text>
      <rect x="140" y="60" width="60" height="60" rx="4" fill="#f97316" fill-opacity="0.3" stroke="#f97316" stroke-width="1.5"/>
      <text x="170" y="95" fill="#fdba74" font-size="9" font-family="monospace" text-anchor="middle">SOC 50W</text>
    </svg>`,
  },
];

export const DrawingUploadModal: React.FC<DrawingUploadModalProps> = ({
  isOpen,
  onClose,
  currentParams,
  onApplyParams,
}) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(currentParams.drawingImage || null);
  const [userNotes, setUserNotes] = useState<string>(
    currentParams.drawingNotes || "底座包含4个M3固定孔，中心发热芯片35W，限高25mm，需要降低扩散热阻。"
  );
  
  // Custom contact surface interactive state
  const [selectedShape, setSelectedShape] = useState<ContactShapeType>(currentParams.contactShape || "rectangle");
  const [baseWidth, setBaseWidth] = useState<number>(currentParams.baseWidth || 60);
  const [baseLength, setBaseLength] = useState<number>(currentParams.baseLength || 80);
  const [baseThickness, setBaseThickness] = useState<number>(currentParams.baseThickness || 3.5);
  const [maxHeight, setMaxHeight] = useState<number>(currentParams.maxHeight || 25);
  const [power, setPower] = useState<number>(currentParams.power || 35);
  const [circleDiameter, setCircleDiameter] = useState<number>(currentParams.circleDiameter || 70);
  const [mountingHoles, setMountingHoles] = useState<MountingHole[]>(
    currentParams.mountingHoles || [
      { x: -22, y: -30, diameter: 3.2, type: "counterbore" },
      { x: 22, y: -30, diameter: 3.2, type: "counterbore" },
      { x: -22, y: 30, diameter: 3.2, type: "counterbore" },
      { x: 22, y: 30, diameter: 3.2, type: "counterbore" },
    ]
  );
  const [heatSource, setHeatSource] = useState<HeatSourceZone>(
    currentParams.heatSourceZone || { width: 30, length: 30, offsetX: 0, offsetY: 0, power: 35 }
  );

  // AI Scanning state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [parsedAIConfig, setParsedAIConfig] = useState<any | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedImage(dataUrl);
      setAiReport(null);
      setParsedAIConfig(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: typeof PRESET_DRAWINGS[0]) => {
    // Generate data URL from SVG
    const svgBlob = new Blob([preset.svgData], { type: "image/svg+xml" });
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(svgBlob);

    setSelectedShape(preset.shape);
    setBaseWidth(preset.width);
    setBaseLength(preset.length);
    if (preset.circleDiameter) setCircleDiameter(preset.circleDiameter);
    if (preset.holes) setMountingHoles(preset.holes);
    if (preset.hotspot) {
      setHeatSource(preset.hotspot);
      setPower(preset.hotspot.power || 35);
    }
    setUserNotes(preset.notes);
    setAiReport(null);
    setParsedAIConfig(null);
  };

  const handleRunAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAiReport(null);
    setParsedAIConfig(null);

    try {
      const response = await fetch("/api/ai/heatsink-drawing-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: uploadedImage || undefined,
          drawingDescription: userNotes,
          userSpecs: {
            selectedShape,
            baseWidth,
            baseLength,
            baseThickness,
            maxHeight,
            power,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "AI 图纸分析失败，请检查网络或后端配置。");
      }

      setAiReport(data.text);
      if (data.config) {
        setParsedAIConfig(data.config);
        
        // Auto populate fields
        if (data.config.shapeType) setSelectedShape(data.config.shapeType);
        if (data.config.baseWidth) setBaseWidth(data.config.baseWidth);
        if (data.config.baseLength) setBaseLength(data.config.baseLength);
        if (data.config.baseThickness) setBaseThickness(data.config.baseThickness);
        if (data.config.maxHeight) setMaxHeight(data.config.maxHeight);
        if (data.config.power) setPower(data.config.power);
        if (data.config.circleDiameter) setCircleDiameter(data.config.circleDiameter);
        if (data.config.mountingHoles && Array.isArray(data.config.mountingHoles)) {
          setMountingHoles(data.config.mountingHoles);
        }
        if (data.config.heatSourceZone) {
          setHeatSource(data.config.heatSourceZone);
        }
      }
    } catch (err: any) {
      console.error("AI Analysis error:", err);
      setAnalysisError(err.message || "分析图纸时出现异常");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyToGenerator = () => {
    const updated: Partial<HeatsinkParams> = {
      contactShape: selectedShape,
      baseWidth,
      baseLength,
      baseThickness,
      maxHeight,
      power,
      circleDiameter,
      mountingHoles,
      heatSourceZone: heatSource,
      drawingImage: uploadedImage || undefined,
      drawingNotes: userNotes,
    };

    if (parsedAIConfig?.recommendedMaterial) {
      updated.materialId = parsedAIConfig.recommendedMaterial;
    }
    if (parsedAIConfig?.finOrientation) {
      updated.finOrientation = parsedAIConfig.finOrientation;
    }

    onApplyParams(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl text-white shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                接触面图纸上传 & 智能散热器生成
                <span className="text-[11px] bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded-full font-mono">
                  Vision CAD AI
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                上传您的接触面工程图、草图或 CAD 截图，AI 自动提取几何轮廓、安装孔与发热核心，生成精准匹配的参数化散热片。
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Upload & Drawing Visualizer */}
            <div className="lg:col-span-6 space-y-4">
              {/* Upload Zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500/70 rounded-xl p-5 bg-slate-950/40 hover:bg-slate-950/80 transition-all cursor-pointer flex flex-col items-center justify-center text-center group min-h-[160px] relative overflow-hidden"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/png,image/jpeg,image/svg+xml,image/webp" 
                  className="hidden" 
                />
                <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform group-hover:bg-cyan-950 text-slate-400 group-hover:text-cyan-400">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-200">
                  点击或拖拽上传工程图纸 / 接触面草图
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  支持 PNG, JPG, SVG, CAD 标注截图 (最大 10MB)
                </p>
              </div>

              {/* Drawing Preview or Preset Samples */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    当前图纸视图 / 预设参考样件
                  </span>
                  {uploadedImage && (
                    <button 
                      onClick={() => setUploadedImage(null)}
                      className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> 重置图纸
                    </button>
                  )}
                </div>

                {uploadedImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center min-h-[220px] max-h-[280px]">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded Drawing" 
                      className="max-h-[260px] max-w-full object-contain"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-[10px] text-cyan-300 font-mono">
                      {getContactShapeLabel(selectedShape)} ({baseWidth}×{baseLength}mm)
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_DRAWINGS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className="text-left p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 flex items-center justify-between">
                            {preset.title}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{preset.subtitle}</div>
                        </div>
                        <span className="text-[10px] text-cyan-400 font-mono mt-2 self-end">
                          载入样张 →
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Notes / Additional Specifications */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  补充图纸尺寸 / 接触面特殊要求说明
                </label>
                <textarea
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  rows={3}
                  placeholder="例如：底座四角需要 4 个 M3 沉头孔，整体限高不超过 25mm，中心芯片发热 45W，要求加厚底板降低均温热阻..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed placeholder-slate-600"
                />
              </div>

              {/* AI Trigger Button */}
              <button
                onClick={handleRunAIAnalysis}
                disabled={isAnalyzing}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    正在视觉解析图纸并反推热学与CAD参数...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    ✨ 开始 AI 视觉图纸识别与热学反推
                  </>
                )}
              </button>

              {analysisError && (
                <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-lg text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  {analysisError}
                </div>
              )}
            </div>

            {/* Right Column: Extracted Geometry & AI Engineering Report */}
            <div className="lg:col-span-6 space-y-4">
              {/* Extracted Parameters Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-cyan-400" />
                    接触面形状与几何参数反推
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    已提取 {mountingHoles.length} 个孔位
                  </span>
                </div>

                {/* Shape Selector */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1.5">接触面轮廓类型</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "rectangle", label: "标准矩形" },
                      { id: "mounting_4holes", label: "4孔定位板" },
                      { id: "circle", label: "圆形端盖" },
                      { id: "l_shape", label: "L型避位" },
                      { id: "stepped", label: "双台阶高差" },
                      { id: "hexagon", label: "六角法兰" },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedShape(s.id as ContactShapeType)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                          selectedShape === s.id
                            ? "bg-cyan-950/80 border-cyan-500 text-cyan-300"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dimension Inputs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">包络宽 W (mm)</label>
                    <input
                      type="number"
                      value={baseWidth}
                      onChange={(e) => setBaseWidth(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">包络长 L (mm)</label>
                    <input
                      type="number"
                      value={baseLength}
                      onChange={(e) => setBaseLength(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">底板厚 T (mm)</label>
                    <input
                      type="number"
                      value={baseThickness}
                      onChange={(e) => setBaseThickness(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">总限高 H (mm)</label>
                    <input
                      type="number"
                      value={maxHeight}
                      onChange={(e) => setMaxHeight(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Hotspot & Power */}
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/60">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">发热功率 (W)</label>
                    <input
                      type="number"
                      value={power}
                      onChange={(e) => {
                        setPower(Number(e.target.value));
                        setHeatSource(prev => ({ ...prev, power: Number(e.target.value) }));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-amber-400 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">芯片尺寸 (mm)</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={heatSource.width}
                        onChange={(e) => setHeatSource(prev => ({ ...prev, width: Number(e.target.value) }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 text-center"
                        placeholder="宽"
                      />
                      <span className="text-slate-600">×</span>
                      <input
                        type="number"
                        value={heatSource.length}
                        onChange={(e) => setHeatSource(prev => ({ ...prev, length: Number(e.target.value) }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 text-center"
                        placeholder="长"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">安装孔数</label>
                    <div className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-cyan-300 font-mono">
                      {mountingHoles.length} 个沉头孔
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Report Section */}
              {aiReport ? (
                <div className="bg-slate-950 border border-cyan-800/40 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                    <Sparkles className="w-4 h-4" />
                    AI 视觉图纸工程解析报告
                  </div>
                  <div className="prose prose-invert prose-xs max-w-none max-h-[220px] overflow-y-auto pr-2 text-slate-300 text-xs leading-relaxed">
                    <ReactMarkdown>{aiReport}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-950/40 border border-slate-800/70 rounded-xl text-xs text-slate-500 flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-slate-600 shrink-0" />
                  <div>
                    <span className="text-slate-300 font-medium block">支持 CAD 接触面任意形状适配</span>
                    上传图纸后，AI 将自动识别螺丝定位孔距、芯片发热功率密度与避位缺口，并实时生成无干涉的翅片阵列。
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            取消
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              已锁定: {getContactShapeLabel(selectedShape)} ({baseWidth}×{baseLength}×{maxHeight}mm)
            </span>
            <button
              onClick={handleApplyToGenerator}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 hover:shadow-cyan-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              应用至 3D 散热器并生成实体
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
