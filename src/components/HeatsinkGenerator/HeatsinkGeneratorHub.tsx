import React, { useState, useEffect } from "react";
import { 
  Calculator, Download, AlertCircle, CheckCircle2, ThermometerSun, 
  Maximize, Cpu, Upload, Sparkles, Layers, Crosshair, Flame, Compass, RefreshCw
} from "lucide-react";
import { 
  HeatsinkParams, HeatsinkResult, calculateHeatsink, generateHeatsinkMesh, 
  exportToSTL, exportToFreeCADScript, HEATSINK_MATERIALS, getContactShapeLabel,
  ContactShapeType
} from "./utils";
import { HeatsinkPreview } from "./HeatsinkPreview";
import { DrawingUploadModal } from "./DrawingUploadModal";

export const HeatsinkGeneratorHub: React.FC = () => {
  const [params, setParams] = useState<HeatsinkParams>({
    baseWidth: 60,
    baseLength: 80,
    baseThickness: 3.5,
    maxHeight: 25,
    power: 35,
    maxTemp: 85,
    ambientTemp: 25,
    materialId: "AL6061",
    contactShape: "mounting_4holes",
    circleDiameter: 70,
    mountingHoles: [
      { x: -22, y: -30, diameter: 3.5, type: "counterbore" },
      { x: 22, y: -30, diameter: 3.5, type: "counterbore" },
      { x: -22, y: 30, diameter: 3.5, type: "counterbore" },
      { x: 22, y: 30, diameter: 3.5, type: "counterbore" },
    ],
    heatSourceZone: {
      width: 30,
      length: 30,
      offsetX: 0,
      offsetY: 0,
      power: 35,
    },
    finOrientation: "longitudinal",
    drawingNotes: "标准 80x60mm 4孔安装接触面，中心配置 30x30mm 35W 发热芯片。",
  });

  const [result, setResult] = useState<HeatsinkResult | null>(null);
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setResult(calculateHeatsink(params));
  }, [params]);

  const handleChange = (key: keyof HeatsinkParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyCustomDrawingParams = (newParams: Partial<HeatsinkParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  };

  const handleDownloadSTL = () => {
    if (!result) return;
    const meshGroup = generateHeatsinkMesh(params, result);
    const stlString = exportToSTL(meshGroup);
    
    const blob = new Blob([stlString], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Heatsink_${params.contactShape || "Custom"}_${params.baseWidth}x${params.baseLength}x${params.maxHeight}.stl`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadFreeCAD = () => {
    if (!result) return;
    const script = exportToFreeCADScript(params, result);
    const blob = new Blob([script], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Heatsink_Generator_FreeCAD_Macro.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header with Upload Drawing CTA */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex flex-col gap-1.5 max-w-3xl">
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <ThermometerSun className="w-6 h-6 text-amber-500" />
            热学仿真计算 & CAD 散热器生成 (Heatsink Generator)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            支持基于传热阻值理论反推最优翅片阵列，同时提供<strong>「图纸视觉识别与接触面形状定制」</strong>功能，
            无论是 4 孔定位板、圆形电机法兰、L 型避位板还是双阶梯高差板，均可一键生成 3D 实体与 FreeCAD 宏脚本。
          </p>
        </div>

        <button
          onClick={() => setIsDrawingModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 hover:shadow-cyan-500/25 shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>上传图纸 / 定制接触面形状</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input & Custom Shape Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <SlidersIcon className="w-4 h-4 text-cyan-400" />
                设计参数输入
              </h2>
              <button
                onClick={() => setIsDrawingModalOpen(true)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 hover:underline"
              >
                <Upload className="w-3 h-3" /> 图纸窗口
              </button>
            </div>

            {/* Current Contact Shape Badge */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  当前接触面形状
                </span>
                <span className="text-[11px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/60 font-mono">
                  {getContactShapeLabel(params.contactShape)}
                </span>
              </div>

              {/* Quick Shape Switcher Pills */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[
                  { id: "mounting_4holes", label: "4孔定位" },
                  { id: "rectangle", label: "标准矩形" },
                  { id: "circle", label: "圆形端盖" },
                  { id: "l_shape", label: "L型避位" },
                  { id: "stepped", label: "双台阶" },
                  { id: "hexagon", label: "六角对称" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleChange("contactShape", s.id as ContactShapeType)}
                    className={`py-1 px-1.5 rounded text-[11px] font-medium border text-center transition-all ${
                      (params.contactShape || "rectangle") === s.id
                        ? "bg-cyan-950 border-cyan-500 text-cyan-300"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {params.mountingHoles && params.mountingHoles.length > 0 && (
                <div className="text-[10px] text-emerald-400/90 flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span>包含 {params.mountingHoles.length} 个沉头安装定位孔</span>
                  <button 
                    onClick={() => setIsDrawingModalOpen(true)}
                    className="text-cyan-400 hover:underline"
                  >
                    编辑孔位
                  </button>
                </div>
              )}
            </div>

            {/* Thermal Specs */}
            <div className="space-y-3 pb-3 border-b border-slate-800">
              <h3 className="text-xs font-mono text-slate-500 uppercase">降温需求 (Thermal Specs)</h3>
              
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">制造材料 (Material)</label>
                <select
                  value={params.materialId || "AL6061"}
                  onChange={(e) => handleChange("materialId", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {Object.entries(HEATSINK_MATERIALS).map(([id, mat]) => (
                    <option key={id} value={id}>{mat.name} (k={mat.k} W/mK)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">发热功率 (W)</label>
                  <input 
                    type="number" 
                    value={params.power}
                    onChange={(e) => handleChange("power", Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">环境温度 (℃)</label>
                  <input 
                    type="number" 
                    value={params.ambientTemp}
                    onChange={(e) => handleChange("ambientTemp", Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1">芯片最高限温 (℃)</label>
                  <input 
                    type="number" 
                    value={params.maxTemp}
                    onChange={(e) => handleChange("maxTemp", Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Geometry Bounds */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono text-slate-500 uppercase">尺寸限制 (Geometry Bounds)</h3>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Compass className="w-3 h-3 text-cyan-400" />
                  <select
                    value={params.finOrientation || "longitudinal"}
                    onChange={(e) => handleChange("finOrientation", e.target.value)}
                    className="bg-slate-950 text-[10px] text-cyan-300 border border-slate-800 rounded px-1.5 py-0.5 focus:outline-none"
                  >
                    <option value="longitudinal">翅片沿长边走向</option>
                    <option value="transverse">翅片沿短边走向</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">底座宽度 W (mm)</label>
                  <input 
                    type="number" 
                    value={params.baseWidth}
                    onChange={(e) => handleChange("baseWidth", Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">底座长度 L (mm)</label>
                  <input 
                    type="number" 
                    value={params.baseLength}
                    onChange={(e) => handleChange("baseLength", Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">整体限高 H (mm)</label>
                  <input 
                    type="number" 
                    value={params.maxHeight}
                    onChange={(e) => handleChange("maxHeight", Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">底板厚度 (mm)</label>
                  <input 
                    type="number" 
                    value={params.baseThickness}
                    onChange={(e) => handleChange("baseThickness", Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Output Results */}
          {result && (
            <div className={`border rounded-2xl p-5 shadow-xl transition-colors ${result.isValid ? "bg-emerald-950/20 border-emerald-900/50" : "bg-red-950/20 border-red-900/50"}`}>
              <div className="flex items-start gap-3 mb-4">
                {result.isValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                )}
                <div>
                  <h3 className={`text-sm font-bold ${result.isValid ? "text-emerald-400" : "text-red-400"}`}>
                    传热计算与参数反推
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {result.message}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">目标热阻 (R_req)</span>
                  <span className="text-lg font-mono text-white">{result.requiredThermalRes.toFixed(2)} <span className="text-xs text-slate-400">℃/W</span></span>
                </div>
                <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">需扩展总面积</span>
                  <span className="text-lg font-mono text-white">{result.requiredArea_cm2.toFixed(1)} <span className="text-xs text-slate-400">cm²</span></span>
                </div>
                <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">扩散热阻评估</span>
                  <span className="text-lg font-mono text-white">{result.spreadingResistance.toFixed(4)} <span className="text-xs text-slate-400">℃/W</span></span>
                </div>
                <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">预估重量</span>
                  <span className="text-lg font-mono text-white">{result.weight_g.toFixed(1)} <span className="text-xs text-slate-400">g</span></span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300">生成的几何参数：</h4>
                <ul className="text-xs text-slate-400 font-mono space-y-1.5">
                  <li className="flex justify-between"><span>翅片数量:</span> <span className="text-white">{result.finCount} 片</span></li>
                  <li className="flex justify-between"><span>翅片间距:</span> <span className="text-white">{result.finGap.toFixed(2)} mm</span></li>
                  <li className="flex justify-between"><span>翅片厚度:</span> <span className="text-white">{result.finThickness.toFixed(2)} mm</span></li>
                  <li className="flex justify-between"><span>翅片净高:</span> <span className="text-white">{result.finHeight.toFixed(2)} mm</span></li>
                  <li className="flex justify-between"><span>接触面有效面积:</span> <span className="text-cyan-300">{(result.effectiveBaseArea_mm2 / 100).toFixed(1)} cm²</span></li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Right: 3D Preview & Downloads */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-xl flex-1 min-h-[440px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Maximize className="w-4 h-4 text-purple-400" />
                实时参数化 3D 预览 (支持异形与安装孔)
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsDrawingModalOpen(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  图纸上传窗口
                </button>
                <button 
                  onClick={handleDownloadSTL}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  下载 .STL 实体
                </button>
              </div>
            </div>
            
            <div className="flex-1 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
               {result && <HeatsinkPreview params={params} result={result} />}
            </div>
          </div>

          {/* FreeCAD & SolidWorks Export Info */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                导出 FreeCAD 参数化 Python 宏脚本 (.py)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                包含底座轮廓、安装定位孔布尔运算及阵列翅片实体。在 FreeCAD 中运行可直接无损输出 STEP/IGES 工业级实体。
              </p>
            </div>
            <button
              onClick={handleDownloadFreeCAD}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 border border-slate-700 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              下载 FreeCAD_Macro.py
            </button>
          </div>
        </div>
      </div>

      {/* Drawing Upload Modal */}
      <DrawingUploadModal
        isOpen={isDrawingModalOpen}
        onClose={() => setIsDrawingModalOpen(false)}
        currentParams={params}
        onApplyParams={handleApplyCustomDrawingParams}
      />
    </div>
  );
};

// Helper Icon
function SlidersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="21" y2="21" />
      <line x1="4" x2="20" y1="14" y2="14" />
      <line x1="4" x2="20" y1="7" y2="7" />
    </svg>
  );
}
