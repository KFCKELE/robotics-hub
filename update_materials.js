const fs = require('fs');

let content = fs.readFileSync('src/components/FEASimulation/feaEngine.ts', 'utf8');

const newMaterials = `
  {
    id: "abs_plastic",
    name: "ABS 工程塑料",
    category: "工程塑料",
    elasticModulusGPa: 2.2,
    poissonRatio: 0.35,
    yieldStrengthMPa: 40,
    tensileStrengthMPa: 45,
    densityGcm3: 1.05,
    allowableSafetyFactor: 2.5,
    colorHex: "#facc15",
    description: "常见3D打印与注塑材料，强度与刚度较低，但韧性极好。",
    application: "外壳、原型测试零件",
  },
  {
    id: "carbon_fiber_iso",
    name: "碳纤维复合材料 (各向同性近似)",
    category: "复合材料",
    elasticModulusGPa: 150.0,
    poissonRatio: 0.28,
    yieldStrengthMPa: 600,
    tensileStrengthMPa: 800,
    densityGcm3: 1.6,
    allowableSafetyFactor: 1.8,
    colorHex: "#1e293b",
    description: "超轻高强复合材料，近似各向同性属性，用于极限轻量化设计。",
    application: "无人机机架、赛车悬挂",
  },
  {
    id: "brass_c360",
    name: "黄铜 C360 (易切削)",
    category: "铜合金",
    elasticModulusGPa: 97.0,
    poissonRatio: 0.31,
    yieldStrengthMPa: 310,
    tensileStrengthMPa: 400,
    densityGcm3: 8.5,
    allowableSafetyFactor: 2.0,
    colorHex: "#eab308",
    description: "良好的切削加工性能与耐腐蚀性，摩擦系数低。",
    application: "耐磨衬套、精密仪器传动件",
  },
  {
    id: "q235",
    name: "Q235 普碳结构钢",
    category: "结构钢",
    elasticModulusGPa: 200.0,
    poissonRatio: 0.29,
    yieldStrengthMPa: 235,
    tensileStrengthMPa: 400,
    densityGcm3: 7.85,
    allowableSafetyFactor: 2.5,
    colorHex: "#64748b",
    description: "最普遍的钢材，易焊接、易加工，造价极低但屈服极限较低。",
    application: "非核心支撑架、机床外骨架",
  },
`;

content = content.replace(/export const ENGINEERING_MATERIALS: EngineeringMaterial\[\] = \[/, 'export const ENGINEERING_MATERIALS: EngineeringMaterial[] = [\n' + newMaterials);

fs.writeFileSync('src/components/FEASimulation/feaEngine.ts', content);
