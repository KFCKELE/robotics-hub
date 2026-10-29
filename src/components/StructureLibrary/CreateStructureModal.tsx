import React, { useState } from "react";
import { X, Plus, Trash2, Save, Wrench, ShieldAlert } from "lucide-react";
import {
  MechanicalStructureItem,
  StructureCategory,
  MaterialType,
  ManufacturingProcess,
} from "../../types";

interface CreateStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (structure: MechanicalStructureItem) => void;
  initialData?: MechanicalStructureItem | null;
}

const CATEGORY_OPTIONS: StructureCategory[] = [
  "OpenArm J1基座",
  "OpenArm J2大臂",
  "J3小臂肘部",
  "J4腕部回转",
  "J5腕部俯仰",
  "OpenArm J6末端",
  "Aero Hand Open 机械手",
  "开源腱绳灵巧手",
  "减速与传动箱",
  "走线与张紧机构",
  "自研非标部件",
];

const MATERIAL_OPTIONS: MaterialType[] = [
  "PETG (高韧耐用)",
  "PLA-CF (碳纤增强刚性)",
  "ABS / ASA (耐温抗冲)",
  "PA12-CF (尼龙碳纤)",
  "AL6061-T6 (航空铝合金)",
  "POM 赛钢 (耐磨自润滑)",
  "3K碳纤维板",
  "高韧光固化树脂",
];

const PROCESS_OPTIONS: ManufacturingProcess[] = [
  "FDM 3D打印 (首选高性价比)",
  "CNC 数控加工 (高刚性公差)",
  "SLA / DLP 光固化打印",
  "钣金激光切割折弯",
  "注塑模具 (大批量)",
];

export const CreateStructureModal: React.FC<CreateStructureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [category, setCategory] = useState<StructureCategory>(initialData?.category || "J2大臂俯仰");
  const [material, setMaterial] = useState<MaterialType>(initialData?.material || "PLA-CF (碳纤增强刚性)");
  const [process, setProcess] = useState<ManufacturingProcess>(
    initialData?.process || "FDM 3D打印 (首选高性价比)"
  );
  const [infillDensity, setInfillDensity] = useState(initialData?.infillDensity || "50% 陀螺仪网格, 4层外壁");
  const [lengthMm, setLengthMm] = useState(initialData?.dimensionsMm.length || 150);
  const [widthMm, setWidthMm] = useState(initialData?.dimensionsMm.width || 50);
  const [heightMm, setHeightMm] = useState(initialData?.dimensionsMm.height || 40);
  const [weightGrams, setWeightGrams] = useState(initialData?.weightGrams || 120);
  const [ratedTorqueNm, setRatedTorqueNm] = useState(initialData?.ratedTorqueNm || 10.0);
  const [bearingSpecsText, setBearingSpecsText] = useState(
    initialData?.bearingSpecs.join("\n") || "6805ZZ (25x37x7mm) 薄壁轴承 x 2"
  );
  const [fastenersText, setFastenersText] = useState(
    initialData?.fasteners.join("\n") || "M3x12 杯头螺丝 x 8\nM3*4*5 热熔铜螺母 x 8"
  );
  const [tolerances, setTolerances] = useState(
    initialData?.criticalTolerances || [
      {
        feature: "轴承安装孔",
        nominalSize: "Φ37.0 mm",
        toleranceSpec: "+0.08 / +0.03 mm (过渡配合)",
        reason: "补偿 3D 打印材料收缩，确保轴承可手动平推压入且不松动",
      },
    ]
  );
  const [solidworksTips, setSolidworksTips] = useState(
    initialData?.solidworksTips || "沿受力方向布置工字加强筋，转角处做 R3 连续过渡圆角消除应力集中。"
  );
  const [dfmReviewPointsText, setDfmReviewPointsText] = useState(
    initialData?.dfmReviewPoints.join("\n") ||
      "打印摆放保证受力主轴平行于打印平台（层纹顺着拉力走向）。\n热熔铜螺母控温 260°C 垂直压入。"
  );
  const [cadStepFileName, setCadStepFileName] = useState(
    initialData?.cadStepFileName || "Custom_Joint_Assembly_Rev1.STEP"
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [schematicSvgType, setSchematicSvgType] = useState<
    "swivel_base" | "arm_linkage" | "elbow_joint" | "wrist_roll" | "gripper_jaw" | "gearbox" | "custom_box"
  >(initialData?.schematicSvgType || "arm_linkage");

  if (!isOpen) return null;

  const handleAddToleranceRow = () => {
    setTolerances([
      ...tolerances,
      { feature: "", nominalSize: "", toleranceSpec: "", reason: "" },
    ]);
  };

  const handleRemoveToleranceRow = (index: number) => {
    setTolerances(tolerances.filter((_, i) => i !== index));
  };

  const handleToleranceChange = (index: number, field: keyof typeof tolerances[0], value: string) => {
    const updated = [...tolerances];
    updated[index][field] = value;
    setTolerances(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const bearingSpecs = bearingSpecsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const fasteners = fastenersText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const dfmReviewPoints = dfmReviewPointsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const newStructure: MechanicalStructureItem = {
      id: initialData?.id || `custom_struct_${Date.now()}`,
      name: name.trim(),
      category,
      material,
      process,
      infillDensity: infillDensity.trim(),
      dimensionsMm: {
        length: Number(lengthMm) || 0,
        width: Number(widthMm) || 0,
        height: Number(heightMm) || 0,
      },
      weightGrams: Number(weightGrams) || 0,
      ratedTorqueNm: Number(ratedTorqueNm) || 0,
      bearingSpecs,
      fasteners,
      criticalTolerances: tolerances.filter((t) => t.feature.trim() !== ""),
      solidworksTips: solidworksTips.trim(),
      dfmReviewPoints,
      isUserCustom: true,
      createdAt: initialData?.createdAt || new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      tags: [category, material.split(" ")[0], "自研结构"],
      schematicSvgType,
      cadStepFileName: cadStepFileName.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    onSave(newStructure);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {initialData ? "编辑自研机械结构" : "存入新自研机械结构档案"}
              </h3>
              <p className="text-xs text-slate-400">
                记录自研机器人关节/连杆/夹爪尺寸、轴承配合公差、材料工艺与 SolidWorks 设计经验
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                结构件名称 <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：J2 大臂轻量化双叉连杆 (带碳纤加强筋)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                所属部位 / 机构分类 <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const val = e.target.value as StructureCategory;
                  setCategory(val);
                  if (val === "J1基座回转") setSchematicSvgType("swivel_base");
                  else if (val === "J2大臂俯仰") setSchematicSvgType("arm_linkage");
                  else if (val === "J3小臂肘部") setSchematicSvgType("elbow_joint");
                  else if (val === "J4腕部回转" || val === "J5腕部俯仰") setSchematicSvgType("wrist_roll");
                  else if (val === "末端执行器与夹爪") setSchematicSvgType("gripper_jaw");
                  else if (val === "走线与张紧机构" || val === "减速与传动箱") setSchematicSvgType("gearbox");
                  else setSchematicSvgType("custom_box");
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Material & Process */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                制造材料
              </label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value as MaterialType)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
              >
                {MATERIAL_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                加工 / 制造工艺
              </label>
              <select
                value={process}
                onChange={(e) => setProcess(e.target.value as ManufacturingProcess)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
              >
                {PROCESS_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                3D打印填充率与外壁设置
              </label>
              <input
                type="text"
                value={infillDensity}
                onChange={(e) => setInfillDensity(e.target.value)}
                placeholder="例如：50% 陀螺仪网格, 4层外壁"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>
          </div>

          {/* Dimensions, Weight, Rated Torque */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">长 (mm)</label>
              <input
                type="number"
                value={lengthMm}
                onChange={(e) => setLengthMm(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">宽 (mm)</label>
              <input
                type="number"
                value={widthMm}
                onChange={(e) => setWidthMm(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">高 (mm)</label>
              <input
                type="number"
                value={heightMm}
                onChange={(e) => setHeightMm(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">自重 (g)</label>
              <input
                type="number"
                value={weightGrams}
                onChange={(e) => setWeightGrams(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">承载力矩 (N·m)</label>
              <input
                type="number"
                step="0.1"
                value={ratedTorqueNm}
                onChange={(e) => setRatedTorqueNm(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
              />
            </div>
          </div>

          {/* Bearings & Fasteners */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                搭配轴承规格 (每行一项)
              </label>
              <textarea
                rows={3}
                value={bearingSpecsText}
                onChange={(e) => setBearingSpecsText(e.target.value)}
                placeholder="例如：&#10;6805ZZ (25x37x7mm) 薄壁轴承 x 2&#10;51105 推力球轴承 x 1"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                螺丝与紧固件清单 (每行一项)
              </label>
              <textarea
                rows={3}
                value={fastenersText}
                onChange={(e) => setFastenersText(e.target.value)}
                placeholder="例如：&#10;M3x12 12.9级杯头螺丝 x 8&#10;M3*4*5 热熔黄铜螺母 x 10"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Critical Tolerances Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>关键特征尺寸公差与装配配合 (DFM)</span>
              </label>
              <button
                type="button"
                onClick={handleAddToleranceRow}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>增加公差特征</span>
              </button>
            </div>

            <div className="space-y-2">
              {tolerances.map((tol, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800 items-center text-xs"
                >
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="特征 (如: 轴承安装孔)"
                      value={tol.feature}
                      onChange={(e) => handleToleranceChange(idx, "feature", e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="公称 (如: Φ37.0mm)"
                      value={tol.nominalSize}
                      onChange={(e) => handleToleranceChange(idx, "nominalSize", e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="公差 (如: +0.08/+0.03mm)"
                      value={tol.toleranceSpec}
                      onChange={(e) => handleToleranceChange(idx, "toleranceSpec", e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-amber-300 font-mono"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="设定依据与装配要求"
                      value={tol.reason}
                      onChange={(e) => handleToleranceChange(idx, "reason", e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-400"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveToleranceRow(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SolidWorks Tips & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                SolidWorks / 3D 建模要点与特征设计经验
              </label>
              <textarea
                rows={3}
                value={solidworksTips}
                onChange={(e) => setSolidworksTips(e.target.value)}
                placeholder="例如：转角处做 R3 连续平滑过渡圆角，螺丝沉孔加 45° 倒角免支撑打印..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                DFM 制造与装配自检要点 (每行一条)
              </label>
              <textarea
                rows={3}
                value={dfmReviewPointsText}
                onChange={(e) => setDfmReviewPointsText(e.target.value)}
                placeholder="例如：&#10;打印摆放保证受力主轴平行于打印平台&#10;热熔铜螺母控温 260°C 垂直压入"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* STEP File name & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                关联 CAD / STEP 文件名
              </label>
              <input
                type="text"
                value={cadStepFileName}
                onChange={(e) => setCadStepFileName(e.target.value)}
                placeholder="例如：OpenArm_J2_Custom_Linkage_V2.STEP"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                实测复盘与备注 (选填)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="例如：实测大臂平举 450mm 变形量仅 0.05mm，刚度非常充裕"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>保存存入机械结构库</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
