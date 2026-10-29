export type FEAPlotType = "von_mises" | "displacement" | "safety_factor" | "strain";

export type ForceDirectionType =
  | "down_y" // 垂直向下 -Y (重力/下压)
  | "up_y" // 垂直向上 +Y (顶升/拉伸)
  | "along_x_pos" // +X 方向 (轴向推力)
  | "along_x_neg" // -X 方向 (轴向拉力)
  | "along_z_pos" // +Z 方向 (侧向剪切)
  | "along_z_neg" // -Z 方向 (侧向反推)
  | "normal" // 垂直于受力面法向
  | "custom_vector"; // 自定义 3D 向量 (Fx, Fy, Fz)

export type LoadType = "force" | "pressure" | "torque";

export interface EngineeringMaterial {
  id: string;
  name: string;
  category: string;
  elasticModulusGPa: number; // 杨氏模量 E (GPa)
  poissonRatio: number; // 泊松比 ν
  yieldStrengthMPa: number; // 屈服强度 σ_y (MPa)
  tensileStrengthMPa: number; // 抗拉极限 σ_u (MPa)
  densityGcm3: number; // 密度 (g/cm³)
  allowableSafetyFactor: number; // 建议设计安全系数 [n]
  colorHex: string;
  description: string;
  application: string;
}

export interface FEABenchmarkModel {
  id: string;
  name: string;
  category: "OpenArm 机械臂" | "仿生灵巧手" | "机器人基座/连杆" | "非标夹具";
  dimensionsMm: { x: number; y: number; z: number };
  description: string;
  defaultFixedFace: string;
  defaultForceFace: string;
  defaultForceN: number;
  defaultForceDir: ForceDirectionType;
  availableFaces: { id: string; name: string; positionDesc: string; normal: [number, number, number] }[];
}

export interface FEASetupConfig {
  modelId: string;
  modelName: string;
  isCustomUploaded: boolean;
  uploadedFileName?: string;
  material: EngineeringMaterial;
  fixedFaceId: string;
  forceFaceId: string;
  loadType: LoadType;
  forceMagnitudeN: number;
  pressureMPa?: number;
  torqueNm?: number;
  forceDirection: ForceDirectionType;
  customVector: [number, number, number];
  meshDensity: "coarse" | "standard" | "fine" | "ultra_fine";
  elementSizeMm: number;
  deformationScale: number;
  isDeformAnimationPlaying: boolean;
  isLightweightMode: boolean;
  showWireframe: boolean;
  activePlot: FEAPlotType;
  showProbe: boolean;
  sectionClipping: number; // 0 to 100%
}

export interface FEAResultData {
  maxVonMisesStressMPa: number;
  minVonMisesStressMPa: number;
  avgVonMisesStressMPa: number;
  yieldStrengthMPa: number;
  minSafetyFactor: number;
  maxDisplacementMm: number;
  maxStrainMicroStrain: number;
  totalMassGrams: number;
  totalVolumeCm3: number;
  nodesCount: number;
  elementsCount: number;
  solveTimeMs: number;
  hotspotNode: {
    x: number;
    y: number;
    z: number;
    stressMPa: number;
    locationDesc: string;
  };
  minStressNode: {
    x: number;
    y: number;
    z: number;
    stressMPa: number;
  };
  status: "safe" | "warning" | "yield_danger";
}

export interface FEAProbePoint {
  x: number;
  y: number;
  z: number;
  stressMPa: number;
  displacementMm: number;
  fos: number;
  strain: number;
  nodeIndex: number;
}
