const fs = require('fs');

let content = fs.readFileSync('src/components/FEASimulation/feaEngine.ts', 'utf8');

const newMaterialsArray = `export const ENGINEERING_MATERIALS: EngineeringMaterial[] = [
  // ================= 碳钢及合金钢 (Carbon & Alloy Steels) =================
  {
    id: "steel_1020", name: "1020 低碳钢 / Q235 (AISI 1020)", category: "碳钢及合金钢",
    elasticModulusGPa: 200.0, poissonRatio: 0.29, yieldStrengthMPa: 295, tensileStrengthMPa: 420, densityGcm3: 7.87, allowableSafetyFactor: 2.0, colorHex: "#64748b",
    description: "最常用的低碳结构钢，塑性好，易焊接，常用于机架、钣金折弯件、非核心承力连杆。",
    application: "设备外壳机架、安装底板、焊接结构件",
  },
  {
    id: "steel_1045", name: "1045 中碳钢 / 45#钢 (AISI 1045)", category: "碳钢及合金钢",
    elasticModulusGPa: 206.0, poissonRatio: 0.29, yieldStrengthMPa: 310, tensileStrengthMPa: 565, densityGcm3: 7.85, allowableSafetyFactor: 2.0, colorHex: "#475569",
    description: "最常用的中碳调质钢，强度与切削加工性平衡，机械装备中的“万金油”。",
    application: "传动主轴、齿轮轴、销钉、高受力结构件",
  },
  {
    id: "steel_4140", name: "4140 铬钼合金钢 / 42CrMo", category: "碳钢及合金钢",
    elasticModulusGPa: 205.0, poissonRatio: 0.29, yieldStrengthMPa: 655, tensileStrengthMPa: 850, densityGcm3: 7.85, allowableSafetyFactor: 1.8, colorHex: "#334155",
    description: "极高的抗疲劳和抗冲击能力，淬透性好，用于重载与恶劣工况。",
    application: "重载减速机输出轴、机器人承力主关节轴、精密丝杠",
  },
  {
    id: "tool_steel_d2", name: "D2 工具钢 / Cr12MoV", category: "碳钢及合金钢",
    elasticModulusGPa: 210.0, poissonRatio: 0.30, yieldStrengthMPa: 1650, tensileStrengthMPa: 1850, densityGcm3: 7.70, allowableSafetyFactor: 2.5, colorHex: "#1e293b",
    description: "极高硬度与耐磨性，属于冷作模具钢，抗变形能力极强但韧性偏低（易脆）。",
    application: "冲压模具、耐磨剪切刀口、精密滑动导轨",
  },

  // ================= 不锈钢 (Stainless Steels) =================
  {
    id: "ss_304", name: "304 奥氏体不锈钢 (AISI 304)", category: "不锈钢",
    elasticModulusGPa: 193.0, poissonRatio: 0.29, yieldStrengthMPa: 215, tensileStrengthMPa: 505, densityGcm3: 8.00, allowableSafetyFactor: 2.0, colorHex: "#94a3b8",
    description: "综合防腐蚀与加工性能最佳，食品级，无磁性，但屈服强度相对普通碳钢更低。",
    application: "医疗器械外壳、水下机器人结构件、食品机械臂",
  },
  {
    id: "ss_316L", name: "316L 超低碳不锈钢 (AISI 316L)", category: "不锈钢",
    elasticModulusGPa: 193.0, poissonRatio: 0.28, yieldStrengthMPa: 170, tensileStrengthMPa: 485, densityGcm3: 8.00, allowableSafetyFactor: 2.0, colorHex: "#cbd5e1",
    description: "耐强酸强碱，抗氯离子腐蚀能力极强，延展性好。",
    application: "化工防腐传感器支架、深海机器人密封舱",
  },
  {
    id: "ss_17_4_ph", name: "17-4 PH 沉淀硬化不锈钢", category: "不锈钢",
    elasticModulusGPa: 196.0, poissonRatio: 0.27, yieldStrengthMPa: 1000, tensileStrengthMPa: 1070, densityGcm3: 7.80, allowableSafetyFactor: 1.8, colorHex: "#64748b",
    description: "兼具极高的强度（可与合金钢媲美）和优秀的抗腐蚀能力，常用于高性能场景。",
    application: "航空航天推杆、六维力传感器弹性体核心",
  },
  
  // ================= 铝合金 (Aluminum Alloys) =================
  {
    id: "al_6061_t6", name: "6061-T6 铝合金", category: "铝合金",
    elasticModulusGPa: 68.9, poissonRatio: 0.33, yieldStrengthMPa: 276, tensileStrengthMPa: 310, densityGcm3: 2.70, allowableSafetyFactor: 1.5, colorHex: "#38bdf8",
    description: "机电/机器人领域“标配”轻量化金属，易于CNC加工、阳极氧化，综合性能完美。",
    application: "机械臂连杆、电机法兰、轻量化承力箱体",
  },
  {
    id: "al_7075_t6", name: "7075-T6 航空铝合金", category: "铝合金",
    elasticModulusGPa: 71.7, poissonRatio: 0.33, yieldStrengthMPa: 503, tensileStrengthMPa: 572, densityGcm3: 2.81, allowableSafetyFactor: 1.5, colorHex: "#0284c7",
    description: "强度赶超普通低碳钢，轻量化极致之选，但不可焊接，抗腐蚀性略逊于6061。",
    application: "人形机器人高应力关节支架、无人机主悬挂臂",
  },
  {
    id: "al_2024_t4", name: "2024-T4 硬铝 (铜铝合金)", category: "铝合金",
    elasticModulusGPa: 73.1, poissonRatio: 0.33, yieldStrengthMPa: 324, tensileStrengthMPa: 469, densityGcm3: 2.78, allowableSafetyFactor: 1.6, colorHex: "#7dd3fc",
    description: "抗疲劳性能出色，主要用于承受交变载荷的航空结构件。",
    application: "交变载荷下的连杆机构、高频振动筛",
  },
  {
    id: "al_5052_h32", name: "5052-H32 铝镁合金", category: "铝合金",
    elasticModulusGPa: 70.3, poissonRatio: 0.33, yieldStrengthMPa: 193, tensileStrengthMPa: 228, densityGcm3: 2.68, allowableSafetyFactor: 2.0, colorHex: "#bae6fd",
    description: "极好的成形性与抗腐蚀性（特别是防海水），不可热处理强化，适合折弯钣金。",
    application: "电子设备外壳、防护罩、船用结构件",
  },

  // ================= 铸铁与铸钢 (Cast Irons) =================
  {
    id: "cast_iron_ht200", name: "HT200 灰铸铁 (Gray Cast Iron)", category: "铸铁与铸钢",
    elasticModulusGPa: 110.0, poissonRatio: 0.26, yieldStrengthMPa: 150, tensileStrengthMPa: 200, densityGcm3: 7.20, allowableSafetyFactor: 3.0, colorHex: "#525252",
    description: "优异的减震性与耐磨性，吸音能力强，但极其脆，抗拉强度低。",
    application: "重型机床床身、减速机箱体、泵壳",
  },
  {
    id: "ductile_iron_qt450", name: "QT450-10 球墨铸铁 (Ductile Iron)", category: "铸铁与铸钢",
    elasticModulusGPa: 169.0, poissonRatio: 0.28, yieldStrengthMPa: 310, tensileStrengthMPa: 450, densityGcm3: 7.10, allowableSafetyFactor: 2.2, colorHex: "#737373",
    description: "内部石墨呈球状，强度远高于灰铸铁，同时保留了一定的减震性。",
    application: "重载大齿轮、大型机器人基座、曲轴",
  },

  // ================= 铜合金 (Copper Alloys) =================
  {
    id: "brass_c360", name: "C36000 易切削黄铜 (Brass)", category: "铜合金",
    elasticModulusGPa: 97.0, poissonRatio: 0.31, yieldStrengthMPa: 310, tensileStrengthMPa: 400, densityGcm3: 8.50, allowableSafetyFactor: 2.0, colorHex: "#eab308",
    description: "切削性能的基准（100%），导热导电良好，具备自润滑减摩特性。",
    application: "精密蜗轮、自润滑滑动轴承衬套、阀门组件",
  },
  {
    id: "bronze_pb", name: "ZCuSn10Pb1 锡青铜", category: "铜合金",
    elasticModulusGPa: 100.0, poissonRatio: 0.33, yieldStrengthMPa: 150, tensileStrengthMPa: 280, densityGcm3: 8.80, allowableSafetyFactor: 2.0, colorHex: "#d97706",
    description: "极致的耐磨性与抗咬合性，承载能力强。",
    application: "高负载低速滑动轴承、重载蜗轮圈",
  },
  {
    id: "pure_copper_c110", name: "C11000 紫铜/纯铜 (Pitch Copper)", category: "铜合金",
    elasticModulusGPa: 117.0, poissonRatio: 0.33, yieldStrengthMPa: 69, tensileStrengthMPa: 220, densityGcm3: 8.89, allowableSafetyFactor: 2.5, colorHex: "#f59e0b",
    description: "纯铜，极高的电导率和热导率，但非常软，结构强度极低。",
    application: "大功率电机散热底座、汇流排、精密导热管",
  },

  // ================= 钛合金 & 高端合金 (Titanium & Superalloys) =================
  {
    id: "titanium_tc4", name: "TC4 / Ti-6Al-4V 钛合金", category: "钛合金及高温合金",
    elasticModulusGPa: 114.0, poissonRatio: 0.34, yieldStrengthMPa: 880, tensileStrengthMPa: 950, densityGcm3: 4.43, allowableSafetyFactor: 1.5, colorHex: "#6366f1",
    description: "航空航天主力材料，密度仅为钢的 60%，却拥有超越钢的强度，生物相容性极佳。",
    application: "极轻高强人形机器人骨骼、外骨骼装甲、航天关节",
  },
  {
    id: "inconel_718", name: "Inconel 718 镍基高温合金", category: "钛合金及高温合金",
    elasticModulusGPa: 200.0, poissonRatio: 0.29, yieldStrengthMPa: 1034, tensileStrengthMPa: 1240, densityGcm3: 8.19, allowableSafetyFactor: 1.8, colorHex: "#818cf8",
    description: "在高达 700°C 环境下仍能保持高屈服强度，耐蠕变抗氧化，但极难加工。",
    application: "航空发动机涡轮叶片、高温执行器隔热支架",
  },

  // ================= 工程塑料与树脂 (Engineering Plastics) =================
  {
    id: "plastic_pom", name: "POM 聚甲醛 / 赛钢 (Delrin)", category: "工程塑料",
    elasticModulusGPa: 3.1, poissonRatio: 0.35, yieldStrengthMPa: 65, tensileStrengthMPa: 70, densityGcm3: 1.42, allowableSafetyFactor: 2.5, colorHex: "#fde047",
    description: "被誉为“赛钢”，表面光滑摩擦系数极低，弹性恢复力好，尺寸稳定性佳。",
    application: "限位缓冲垫块、低扭矩齿轮、非标自润滑滑块",
  },
  {
    id: "plastic_pc", name: "PC 聚碳酸酯 (Polycarbonate)", category: "工程塑料",
    elasticModulusGPa: 2.4, poissonRatio: 0.37, yieldStrengthMPa: 62, tensileStrengthMPa: 65, densityGcm3: 1.20, allowableSafetyFactor: 2.5, colorHex: "#fef08a",
    description: "高透明度，抗冲击强度是防弹玻璃的级别，但容易产生应力开裂。",
    application: "机器人透明防护罩、防爆视窗、指示灯面板",
  },
  {
    id: "plastic_abs", name: "ABS 工程塑料", category: "工程塑料",
    elasticModulusGPa: 2.2, poissonRatio: 0.35, yieldStrengthMPa: 40, tensileStrengthMPa: 45, densityGcm3: 1.05, allowableSafetyFactor: 3.0, colorHex: "#facc15",
    description: "最常见的消费电子外壳材料与 3D 打印材料，综合力学性能居中。",
    application: "打印机外壳、概念验证 (PoC) 原型、结构外衣",
  },
  {
    id: "plastic_peek", name: "PEEK 聚醚醚酮 (特种塑料)", category: "工程塑料",
    elasticModulusGPa: 3.6, poissonRatio: 0.38, yieldStrengthMPa: 100, tensileStrengthMPa: 110, densityGcm3: 1.32, allowableSafetyFactor: 2.0, colorHex: "#fef9c3",
    description: "特种塑料之王，兼具超高强度、耐高温(260℃长期工作)和耐化学性，但价格极其昂贵。",
    application: "真空无油工况齿轮、医疗内植入级支架、半导体晶圆吸盘",
  },
  {
    id: "plastic_nylon66", name: "PA66 尼龙66 (Nylon 66)", category: "工程塑料",
    elasticModulusGPa: 2.8, poissonRatio: 0.39, yieldStrengthMPa: 82, tensileStrengthMPa: 85, densityGcm3: 1.14, allowableSafetyFactor: 2.5, colorHex: "#fef08a",
    description: "优秀的耐磨损性和抗疲劳性，但极易吸水导致尺寸膨胀与刚度下降。",
    application: "理线器、耐磨滑轮、绝缘垫圈",
  },

  // ================= 复合材料 (Composites) =================
  {
    id: "comp_carbon_iso", name: "碳纤维复材 (CFRP 近似各向同性)", category: "复合材料",
    elasticModulusGPa: 70.0, poissonRatio: 0.30, yieldStrengthMPa: 550, tensileStrengthMPa: 600, densityGcm3: 1.55, allowableSafetyFactor: 2.0, colorHex: "#171717",
    description: "采用编织碳布+环氧树脂层压，平面内具备极高的比刚度与比强度，抗疲劳性完美。",
    application: "极速四轴飞行器主板、高速Delta机器人碳纤臂",
  },
  {
    id: "comp_fr4_g10", name: "FR4 / G10 玻纤环氧板", category: "复合材料",
    elasticModulusGPa: 24.0, poissonRatio: 0.15, yieldStrengthMPa: 310, tensileStrengthMPa: 350, densityGcm3: 1.85, allowableSafetyFactor: 2.5, colorHex: "#bbf7d0",
    description: "PCB 核心基材，极好的电气绝缘性、防潮性，同时拥有较高的机械强度。",
    application: "PCB 结构混用载板、高压绝缘支撑件、隔热板",
  }
];`;

const regex = /export const ENGINEERING_MATERIALS: EngineeringMaterial\[\] = \[\s*\{[\s\S]*?\}\s*\];/;
content = content.replace(regex, newMaterialsArray);

fs.writeFileSync('src/components/FEASimulation/feaEngine.ts', content);
