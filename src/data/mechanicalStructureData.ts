import { MechanicalStructureItem } from "../types";

const LOCAL_STORAGE_STRUCTURES_KEY = "openarm_mechanical_structures_v1";

export const DEFAULT_PRESET_STRUCTURES: MechanicalStructureItem[] = [
  // ==================== 1. OpenArm 达妙电机机械臂 6 轴核心结构件 ====================
  {
    id: "struct_j1_base_flange",
    name: "OpenArm J1 基座高刚度回转法兰 (适配 达妙 J8009 CAN电机/双轴承)",
    category: "OpenArm J1基座",
    material: "AL6061-T6 / 碳纤增强 PLA-CF",
    process: "CNC 数控加工 / 工业级 3D 打印",
    infillDensity: "100% 金属 CNC 阳极氧化 / 70% 陀螺仪网格",
    dimensionsMm: { length: 140, width: 140, height: 68 },
    weightGrams: 310,
    ratedTorqueNm: 25.0,
    bearingSpecs: [
      "6808ZZ (40x52x7mm) 薄壁深沟球轴承 x 1 (承受径向与力矩载荷)",
      "51108 (40x60x13mm) 单向推力球轴承 x 1 (承受整臂垂直重力载荷)",
    ],
    fasteners: [
      "M4x16 12.9 级高强度圆柱头内六角螺栓 x 8",
      "M4*6*6 热熔黄铜滚花螺母 / 铝合金直接攻丝螺纹 x 8",
      "M3x10 沉头内六角螺栓 x 4 (固定达妙 J8009 电机驱动法兰)",
    ],
    criticalTolerances: [
      {
        feature: "推力轴承 51108 下座圈定位止口与减速机配合面",
        nominalSize: "Φ60.0 mm",
        toleranceSpec: "+0.03 / +0.01 mm (H7精密配合)",
        reason: "保证达妙无刷电机输出轴同心度 < 0.02mm，杜绝偏心引起的高频振动与齿面异常磨损。",
      },
      {
        feature: "达妙电机中空走线孔与驱动法兰",
        nominalSize: "Φ22.0 mm",
        toleranceSpec: "+0.20 / +0.10 mm",
        reason: "为整臂 CAN-FD 动力总线、48V 电源线及编码器信号线预留走线通道，避免 360° 回转绞线。",
      },
    ],
    solidworksTips:
      "1. 底部大平面采用厚壁多筋板设计，刚度比单壁提升 4.2 倍；2. 预留中空走线过孔（Φ22mm），电机动力线与 CAN 总线直接从基座轴心穿出；3. 轴承配合面设 0.5x45° 引导倒角便于无损压装。",
    dfmReviewPoints: [
      "铝合金 CNC 粗精加工分序进行，释放内应力后再精镗轴承配合止口，防止工件自然变形导致不同心。",
      "若使用 3D 打印试制，必须沿 Z 轴垂直放置打印，使轴承环形受力面与层纹垂直，最大化抗层间剪切强度。",
      "推力轴承滚道涂抹二硫化钼极压润滑脂，降低回转摩擦阻力矩与无刷电机空载功耗。",
    ],
    isUserCustom: false,
    createdAt: "2026-01-10",
    updatedAt: "2026-03-10",
    tags: ["OpenArm", "达妙电机", "CAN总线", "双轴承", "抗倾覆", "中空走线"],
    schematicSvgType: "swivel_base",
    cadStepFileName: "OpenArm_J1_Motor_Base_Assembly_Rev4.STEP",
    notes: "经过实测，该基座承载 6 轴整臂平举 500mm（电机与臂体自重约 1.8kg + 1.0kg 负载）时，基座倾覆变形量 <0.04mm。",
  },
  {
    id: "struct_j2_bifurcated_link",
    name: "OpenArm J2 大臂高刚度双叉工字箱型连杆 (达妙 J8009/J6006 直驱+谐波)",
    category: "OpenArm J2大臂",
    material: "AL6061-T6 阳极氧化 / PLA-CF 碳纤维增强",
    process: "CNC 拓扑减重加工 / 工业 FDM",
    infillDensity: "实体 CNC 掏空加强筋 / 60% 蜂窝六边形网格",
    dimensionsMm: { length: 230, width: 68, height: 52 },
    weightGrams: 215,
    ratedTorqueNm: 35.0,
    bearingSpecs: [
      "6805ZZ (25x37x7mm) 薄壁轴承 x 2 (大臂根部副耳支承轴承，与电机减速机输出端形成双支点简支梁)",
    ],
    fasteners: [
      "M3x25 12.9 级高强度穿心杯头螺栓 x 6",
      "M3 防松自锁尼龙螺母 x 6",
      "M3*5*6 热熔黄铜螺母 x 8",
    ],
    criticalTolerances: [
      {
        feature: "大臂达妙电机/谐波减速机输出法兰配合止口",
        nominalSize: "Φ30.0 mm",
        toleranceSpec: "+0.02 / -0.00 mm (H7紧配合)",
        reason: "输出轴止口必须无隙贴合减速机刚轮，消除机械臂启停瞬态冲击产生的剪切微晃动。",
      },
      {
        feature: "大臂双叉跨距 (两耳内侧距离)",
        nominalSize: "48.2 mm",
        toleranceSpec: "+0.15 / +0.05 mm",
        reason: "装配 J1 驱动电机时留有微小间隙，通过锁紧高强度穿心螺栓消除轴向端面游隙。",
      },
    ],
    solidworksTips:
      "1. 沿大臂主弯矩方向布置 45° 拓扑工字加强筋（截面抗弯刚度提升 3.5 倍）；2. 减速机安装法兰交界处做 R5 平滑过渡圆角杜绝应力集中；3. 内部开辟隐藏式 CAN 总线走线槽。",
    dfmReviewPoints: [
      "建议使用航空铝 CNC 切削或碳纤增强材料，杨氏模量极高，彻底消除机械臂高速启停末端残余抖动。",
      "打印摆放方向：必须平放或侧卧 45°，确保层纹走向沿受力主轴方向，严禁立式打印导致脆断。",
      "配合螺栓必须涂抹乐泰 243 中强度螺纹锁固胶，防止长期 150Hz 往复加减速振动松脱。",
    ],
    isUserCustom: false,
    createdAt: "2026-01-15",
    updatedAt: "2026-03-10",
    tags: ["OpenArm", "J2大臂", "达妙电机", "工字梁", "碳纤增强", "抗振刚度"],
    schematicSvgType: "arm_linkage",
    cadStepFileName: "OpenArm_J2_Main_Arm_Link_BLDC_Rev3.STEP",
    notes: "大臂平举 90° 额定工况下，有限元静力 FEA 分析最大应力 18.5MPa，远低于材料屈服极限，安全系数 5.2。",
  },
  {
    id: "struct_j3_elbow_joint",
    name: "OpenArm J3 小臂肘关节减速壳体 (达妙 J4310 直驱/行星传动)",
    category: "J3小臂肘部",
    material: "AL6061-T6 (航空铝合金) / PETG",
    process: "CNC 数控加工 (高刚性公差)",
    infillDensity: "100% 金属 CNC / 50% 陀螺仪网格",
    dimensionsMm: { length: 110, width: 55, height: 48 },
    weightGrams: 145,
    ratedTorqueNm: 15.0,
    bearingSpecs: [
      "6804ZZ (20x32x7mm) 薄壁轴承 x 2 (肘关节旋转支撑轴承)",
    ],
    fasteners: [
      "M3x10 圆柱头内六角螺钉 x 8",
      "M2.5x6 达妙磁编码器微型定位螺钉 x 4",
    ],
    criticalTolerances: [
      {
        feature: "J3 轴承安装孔公差",
        nominalSize: "Φ32.0 mm",
        toleranceSpec: "+0.025 / +0.005 mm (过渡配合)",
        reason: "确保肘关节俯仰运动顺畅且径向跳动 < 0.015mm。",
      },
    ],
    solidworksTips:
      "在肘部转弯处设计内嵌式走线蛇形弯曲导引通道，预留 20mm 弯曲半径防止线缆反复折弯疲劳断裂。",
    dfmReviewPoints: [
      "轴承位精镗加工，保证两端同轴度在 0.01mm 以内。",
      "装配时在肘关节齿轮齿面涂抹全合成二硫化钼高温油脂。",
    ],
    isUserCustom: false,
    createdAt: "2026-01-20",
    updatedAt: "2026-03-10",
    tags: ["OpenArm", "J3肘部", "达妙电机", "薄壁轴承", "低背隙"],
    schematicSvgType: "elbow_joint",
    cadStepFileName: "OpenArm_J3_Elbow_Housing_Rev2.STEP",
    notes: "肘关节优化后自重降低 35%，响应带宽提升至 45Hz。",
  },
  {
    id: "struct_j4_wrist_roll",
    name: "OpenArm J4/J5 腕部紧凑双轴差动/回转模组 (适配 达妙 J4310)",
    category: "J4腕部回转",
    material: "AL6061-T6 (航空铝合金) / PA12-CF (尼龙碳纤)",
    process: "CNC 数控加工 (高刚性公差)",
    infillDensity: "100% 金属 / SLS 尼龙烧结",
    dimensionsMm: { length: 85, width: 48, height: 44 },
    weightGrams: 110,
    ratedTorqueNm: 7.5,
    bearingSpecs: [
      "6803ZZ (17x26x5mm) 超薄壁轴承 x 2",
      "MR128ZZ (8x12x3.5mm) 减速小齿轮支撑轴承 x 2",
    ],
    fasteners: [
      "M2.5x8 不锈钢杯头螺丝 x 12",
      "M3 锁紧螺母 x 4",
    ],
    criticalTolerances: [
      {
        feature: "差动齿轮轴间距中心距公差",
        nominalSize: "28.5 mm",
        toleranceSpec: "±0.02 mm",
        reason: "防止齿轮啮合过紧导致电机过载发热，或过松引起末端回差晃动。",
      },
    ],
    solidworksTips:
      "将 J4 回转轴线与 J5 俯仰轴线严格交于一点（球坐标手腕构型），便于逆运动学闭式解析解快速求解。",
    dfmReviewPoints: [
      "齿轮零件建议采用 40Cr 调质渗碳淬火或 POM 赛钢自润滑材料。",
    ],
    isUserCustom: false,
    createdAt: "2026-01-28",
    updatedAt: "2026-03-10",
    tags: ["OpenArm", "腕部回转", "达妙电机", "球腕结构", "高精度"],
    schematicSvgType: "wrist_roll",
    cadStepFileName: "OpenArm_J4_J5_Wrist_Assembly_Rev3.STEP",
    notes: "腕部紧凑化设计使末端惯量减小 40%，大幅提升 Amazing Hand 抓取时的动态轨迹跟踪性能。",
  },
  {
    id: "struct_j6_iso9409_flange",
    name: "OpenArm J6 ISO 9409-1 工业标准末端法兰 (挂接 Aero Hand Open 机械手)",
    category: "OpenArm J6末端",
    material: "AL6061-T6 (航空铝合金)",
    process: "CNC 数控精加工 (高刚性公差)",
    infillDensity: "100% 实体金属 CNC 阳极氧化黑",
    dimensionsMm: { length: 38, width: 38, height: 14 },
    weightGrams: 36,
    ratedTorqueNm: 8.0,
    bearingSpecs: [
      "MR148ZZ (8x14x4mm) 高精度深沟球轴承 x 1",
    ],
    fasteners: [
      "M4x8 ISO 7380 圆头螺栓 x 4 (分度圆 PCD Φ20mm)",
      "Φ3x6 淬火不锈钢精密定位销 x 1",
    ],
    criticalTolerances: [
      {
        feature: "ISO 9409-1 标准定位凸台 (Spigot)",
        nominalSize: "Φ12.5 h7",
        toleranceSpec: "+0.000 / -0.018 mm (精密级配合)",
        reason: "确保在 OpenArm 与 Aero Hand Open 之间实现高刚度无缝装配，重复安装定位精度优于 ±0.01mm。",
      },
    ],
    solidworksTips:
      "标准 PCD Φ20mm 上均布 4 个 M4 螺纹孔，并在 0° 方位开制 Φ3H7 精密销钉孔。表面倒角 0.5x45°，喷砂阳极氧化哑光黑。",
    dfmReviewPoints: [
      "末端快换配合销涂少量防咬合膏，防止长期压紧后微动咬死。",
      "预留 Aero Hand Open (TetherIA) 供电总线与 ESP32-S3 USB/串口通信快拆通道。",
    ],
    isUserCustom: false,
    createdAt: "2026-02-01",
    updatedAt: "2026-03-10",
    tags: ["OpenArm", "Aero Hand接口", "ISO9409", "快换法兰", "CNC铝合金"],
    schematicSvgType: "custom_box",
    cadStepFileName: "OpenArm_J6_To_AeroHand_Flange.STEP",
    notes: "实现 OpenArm 机械臂末端与 Aero Hand Open (TetherIA 开源灵巧手) 之间的工业级标准快换互连。",
  },
  {
    id: "struct_cycloidal_gearbox",
    name: "OpenArm 自研一体化 1:19 高减速比摆线针轮减速器 (BLDC电机专用)",
    category: "减速与传动箱",
    material: "AL7075-T6 (高强航空铝) / 40Cr 渗碳齿轮钢",
    process: "CNC 数控加工 (高刚性公差)",
    infillDensity: "100% 实体金属精密五轴加工",
    dimensionsMm: { length: 72, width: 72, height: 35 },
    weightGrams: 280,
    ratedTorqueNm: 42.0,
    bearingSpecs: [
      "CSG-14 交叉滚子轴承 x 1 (主输出承载轴承)",
      "HK1010 滚针轴承 x 2 (偏心轴承)",
    ],
    fasteners: [
      "M3x16 12.9 级高强度沉头内六角螺栓 x 8",
      "Φ3x12 淬火针齿销 x 20 (针齿壳均布)",
    ],
    criticalTolerances: [
      {
        feature: "摆线齿廓啮合等距修形量",
        nominalSize: "0.012 mm 负等距",
        toleranceSpec: "±0.003 mm",
        reason: "精确修形消除死点干涉，背隙控制在 1.5 弧分以内，传动效率达 88%。",
      },
    ],
    solidworksTips:
      "利用短幅外摆线数学公式生成理论曲线，施加 0.015mm 齿顶修缘与负等距修形，双摆线盘错位 180° 布置动平衡抵消偏心惯性力。",
    dfmReviewPoints: [
      "针齿套使用 GCr15 轴承钢硬度达 HRC60，针齿销表面超精研磨。",
    ],
    isUserCustom: false,
    createdAt: "2026-02-05",
    updatedAt: "2026-03-10",
    tags: ["OpenArm", "摆线减速器", "高扭矩", "低背隙", "机器人关节"],
    schematicSvgType: "gearbox",
    cadStepFileName: "OpenArm_Cycloidal_Gearbox_19to1.STEP",
    notes: "承载测试实测峰值扭矩可达 55N·m，满足 OpenArm J1/J2 大负载工况。",
  },

  // ==================== 2. Aero Hand Open (TetherIA) 飞特舵机仿生灵巧手核心结构件 ====================
  {
    id: "struct_amazing_hand_palm_module",
    name: "Aero Hand Open 仿生机械手掌基座与微型 Capstan 绞盘模组 (TetherIA 开源 16关节/7-DoF)",
    category: "Aero Hand Open 机械手",
    material: "AL6061-T6 / POM 赛钢 / 光固化高韧树脂",
    process: "CNC 精密五轴切削 / 模具注塑 / 3D 打印",
    infillDensity: "100% 实体轻量化切削 (<400g 整手重量)",
    dimensionsMm: { length: 95, width: 85, height: 42 },
    weightGrams: 165,
    ratedTorqueNm: 3.8,
    bearingSpecs: [
      "MR63ZZ (3x6x2.5mm) 超微型双法兰轴承 x 10 (五指 Capstan 绞盘主轴承)",
      "MR52ZZ (2x5x2.5mm) 微型导向轴承 x 10 (腱绳出绳口导向滑轮)",
    ],
    fasteners: [
      "M2x6 不锈钢圆柱头螺钉 x 20 (固定飞特微型执行器)",
      "0.35mm 超高分子量聚乙烯 Dyneema 仿生腱绳 (破断拉力 35kg)",
      "微型无损冷压铜套 (腱绳固定末端)",
    ],
    criticalTolerances: [
      {
        feature: "Capstan 微型双螺旋出绳槽节圆与出绳口圆弧",
        nominalSize: "槽宽 0.42mm, 节径 Φ8.0mm, 圆弧 R1.2mm",
        toleranceSpec: "±0.015 mm (精密级)",
        reason: "确保腱绳在多次高速收放时不产生交叉重叠与刮擦磨损，使 Aero Hand Open 寿命突破 100 万次。",
      },
      {
        feature: "飞特舵机/总线伺服模组与 ESP32-S3 安装腔尺寸",
        nominalSize: "19.8 x 12.2 mm",
        toleranceSpec: "+0.08 / +0.03 mm",
        reason: "实现手掌内飞特 STS3215/SCS0009 舵机高密度排布，免修锉快速组装。",
      },
    ],
    solidworksTips:
      "基于 TetherIA 官方 Aero Hand Open (https://tetheria.github.io/aero-hand-open/) 开源结构重构掌骨几何拓扑，优化 5 指出绳角度，使腱绳进出角始终与绞盘螺旋槽切线对齐，摩擦损耗降低 65%。",
    dfmReviewPoints: [
      "手掌出绳口必须经过镜面抛光（表面粗糙度 Ra < 0.2μm），彻底杜绝毛刺割断 Dyneema 腱绳。",
      "绳索两端采用微型冷压铜套配合拉紧螺栓，杜绝打结产生的应力集中与初伸长松弛。",
      "手掌掌心预留防滑软硅胶二次注塑包胶定位槽，大幅提升对光滑圆柱体抓握稳定性。",
    ],
    isUserCustom: false,
    createdAt: "2026-02-01",
    updatedAt: "2026-03-10",
    tags: ["Aero Hand Open", "TetherIA", "飞特舵机", "Capstan绞盘", "Dyneema绳驱", "掌指模组", "开源灵巧手"],
    schematicSvgType: "gripper_jaw",
    cadStepFileName: "Aero_Hand_Open_Palm_Assembly_Rev5.STEP",
    notes: "TetherIA 官方开源架构仿生手掌总成，实现 16 关节 / 7 主动自由度独立驱动与协同包络抓取，抓重能力达 1.5kg。",
  },
  {
    id: "struct_amazing_hand_thumb_base",
    name: "Aero Hand Open 3自由度对掌拇指旋转基座 (外展0-100°+基节屈伸0-90°+尖节卷曲)",
    category: "Aero Hand Open 机械手",
    material: "POM 赛钢 (耐磨自润滑) / AL6061-T6",
    process: "CNC 精密车铣复合 / 3D 打印",
    infillDensity: "100% 实体自润滑工程塑料",
    dimensionsMm: { length: 32, width: 28, height: 26 },
    weightGrams: 24,
    ratedTorqueNm: 2.2,
    bearingSpecs: [
      "MR74ZZ (4x7x2.5mm) 微型轴承 x 2",
    ],
    fasteners: [
      "M2x8 沉头内六角螺栓 x 4",
      "飞特舵机 25T 金属舵盘连接件 x 1",
    ],
    criticalTolerances: [
      {
        feature: "飞特舵机金属舵盘 25T 花键安装止口",
        nominalSize: "Φ5.9 mm",
        toleranceSpec: "+0.02 / -0.01 mm",
        reason: "杜绝舵盘转动回差，保证拇指对指动作定位精度达 0.2mm。",
      },
    ],
    solidworksTips:
      "将拇指基底斜向布置，复现人体解剖学掌指对掌运动轨迹 (0~100° 外展 + 0~90° 屈伸)，使拇指能与食指/中指形成完美对捏与侧捏抓取。",
    dfmReviewPoints: [
      "使用高耐磨 POM 赛钢降低磨损，运动副表面涂特氟龙干膜润滑剂。",
    ],
    isUserCustom: false,
    createdAt: "2026-02-08",
    updatedAt: "2026-03-10",
    tags: ["Aero Hand Open", "拇指3DoF", "外展对掌", "飞特舵机", "仿生抓取"],
    schematicSvgType: "swivel_base",
    cadStepFileName: "Aero_Hand_Open_Thumb_Rotary_Base_V2.STEP",
    notes: "TetherIA Aero Hand Open 拇指模组具备 3 个主动自由度，大幅提升抓取不规则物体（笔、杯子、钥匙）的灵巧度与贴合率。",
  },
  {
    id: "struct_amazing_hand_ball_finger",
    name: "Aero Hand Open 多自由度掌指关节与自润滑指骨总成 (最大屈伸 90°)",
    category: "Aero Hand Open 机械手",
    material: "PEEK (聚醚醚酮) / POM 赛钢 + 航空铝指骨",
    process: "CNC 精密车铣复合 / 高精度微米注塑",
    infillDensity: "100% 实体自润滑工程塑料",
    dimensionsMm: { length: 65, width: 16, height: 15 },
    weightGrams: 18,
    ratedTorqueNm: 1.5,
    bearingSpecs: [
      "自研微米级球头球窝自润滑滑动摩擦副 (Φ8.0mm 球头)",
    ],
    fasteners: [
      "M1.6x5 精密不锈钢梅花沉头螺钉 x 6",
      "0.35mm 破断拉力 35kg Dyneema 仿生腱绳 x 2",
    ],
    criticalTolerances: [
      {
        feature: "球头与球窝内球面间隙配合",
        nominalSize: "Φ8.0 mm",
        toleranceSpec: "+0.015 / +0.005 mm (微米动配合)",
        reason: "间隙小于 0.005mm 会因热膨胀卡死，大于 0.025mm 会产生指尖松旷晃动，影响精密捏取。",
      },
      {
        feature: "双绳对拉走线通道内壁圆弧半径",
        nominalSize: "R0.8 mm",
        toleranceSpec: "±0.02 mm",
        reason: "防止弯折处产生屈曲疲劳，保证弯曲顺应性与抓取柔顺度。",
      },
    ],
    solidworksTips:
      "在指骨内集成内嵌式双向预紧弹簧与限位防脱卡环，提供天然的无源抗冲击柔顺性，指尖受撞击时自动退避保护微型执行器。",
    dfmReviewPoints: [
      "球头表面做微弧氧化或采用自润滑 POM/PEEK，无需加注润滑油即可达到 50 万次超低摩擦运行。",
      "指尖末端集成纹理硅胶防滑软垫，静摩擦系数提升至 0.85，可轻松捏起一枚薄硬币或信用卡。",
    ],
    isUserCustom: false,
    createdAt: "2026-02-12",
    updatedAt: "2026-03-10",
    tags: ["Aero Hand Open", "球头关节", "仿生指骨", "自润滑", "绳驱顺应"],
    schematicSvgType: "elbow_joint",
    cadStepFileName: "Aero_Hand_Open_BallJoint_Finger_V3.STEP",
    notes: "TetherIA Aero Hand Open 四指屈伸最大可达 90°，在关节处集成预紧防脱落限位结构。",
  },
  {
    id: "struct_amazing_hand_capstan_pulley",
    name: "Aero Hand Open Capstan 微型双螺旋绳驱线轮 (适配 飞特 STS3215 齿轴)",
    category: "走线与张紧机构",
    material: "AL7075-T6 (高强航空铝) 阳极硬化",
    process: "CNC 精密车铣复合",
    infillDensity: "100% 实体金属",
    dimensionsMm: { length: 12, width: 12, height: 10 },
    weightGrams: 4.5,
    ratedTorqueNm: 2.5,
    bearingSpecs: [
      "MR63ZZ (3x6x2.5mm) 减摩微型轴承 x 1",
    ],
    fasteners: [
      "M2 顶丝固定螺钉 x 2",
      "0.35mm Dyneema 仿生绳",
    ],
    criticalTolerances: [
      {
        feature: "Capstan 螺旋线槽深与螺距",
        nominalSize: "槽深 0.35mm, 螺距 0.8mm",
        toleranceSpec: "±0.008 mm",
        reason: "防止线缆跳槽或重叠压线造成传动卡滞。",
      },
    ],
    solidworksTips:
      "使用螺旋扫描切除特征，出绳处做 R0.5 圆角消除尖角毛刺。",
    dfmReviewPoints: [
      "车铣后进行硬质阳极氧化处理（膜厚 >25μm），硬度达 HV400 杜绝腱绳磨损沟槽。",
    ],
    isUserCustom: false,
    createdAt: "2026-02-15",
    updatedAt: "2026-03-10",
    tags: ["Aero Hand Open", "Capstan绞盘", "线轮", "飞特舵机", "微型精密"],
    schematicSvgType: "gearbox",
    cadStepFileName: "Aero_Hand_Open_Capstan_Pulley_Rev4.STEP",
    notes: "传动线性度高达 99.4%，无间隙快速响应。",
  },
  {
    id: "struct_cable_tensioner_module",
    name: "机械手/机械臂 弹性张紧器与过载脱扣保护机构",
    category: "走线与张紧机构",
    material: "PETG (高韧耐用) / POM 赛钢",
    process: "FDM 3D打印 (首选高性价比) / CNC",
    infillDensity: "60% 陀螺仪网格",
    dimensionsMm: { length: 42, width: 22, height: 18 },
    weightGrams: 16,
    ratedTorqueNm: 4.0,
    bearingSpecs: [
      "MR52ZZ (2x5x2.5mm) 微型轴承 x 2",
    ],
    fasteners: [
      "M2.5x12 调节螺丝 x 2",
      "0.6x5x15mm 弹簧钢压缩弹簧 x 2",
    ],
    criticalTolerances: [
      {
        feature: "滑块导向滑道配合间隙",
        nominalSize: "6.0 mm",
        toleranceSpec: "+0.10 / +0.05 mm",
        reason: "保证张紧滑块在弹簧作用下滑动顺畅无卡滞。",
      },
    ],
    solidworksTips:
      "预留张紧行程视窗刻度线，方便目视评估初张紧预紧力（推荐 5N 预紧）。",
    dfmReviewPoints: [
      "弹簧接触面做平面沉头定位槽，防止受压失稳偏斜。",
    ],
    isUserCustom: false,
    createdAt: "2026-02-20",
    updatedAt: "2026-03-10",
    tags: ["张紧机构", "过载保护", "Dyneema绳驱", "3D打印", "可调节"],
    schematicSvgType: "gearbox",
    cadStepFileName: "Cable_Tensioner_Adjuster_V1.STEP",
    notes: "有效补偿绳索长期使用微伸长，保持机械手抓取刚度恒定。",
  },
  {
    id: "struct_fingertip_sensor_pad",
    name: "Aero Hand Open 仿生硅胶触觉感知防滑指尖套件",
    category: "Aero Hand Open 机械手",
    material: "TPU 95A / 邵氏 30A 液体软硅胶二次包胶",
    process: "SLA / DLP 光固化打印 / 模具注塑",
    infillDensity: "100% 弹性体实心",
    dimensionsMm: { length: 22, width: 14, height: 12 },
    weightGrams: 3.2,
    ratedTorqueNm: 0.8,
    bearingSpecs: ["无"],
    fasteners: [
      "M1.4x4 固定螺钉 x 1",
    ],
    criticalTolerances: [
      {
        feature: "指尖骨架卡槽过盈配合",
        nominalSize: "8.2 x 6.0 mm",
        toleranceSpec: "-0.15 mm (过盈紧贴)",
        reason: "防止在抓取重物滑脱剥离。",
      },
    ],
    solidworksTips:
      "指腹表面设计类似人体指纹的微米级同心圆防滑凸纹（高度 0.2mm，间距 0.4mm），排水排油抗滑移。",
    dfmReviewPoints: [
      "二次注塑前对骨架表面进行等离子清洗活化，提升硅胶粘接附着力。",
    ],
    isUserCustom: false,
    createdAt: "2026-02-25",
    updatedAt: "2026-03-10",
    tags: ["Amazing Hand", "仿生指尖", "硅胶防滑", "指纹微结构", "触觉感知"],
    schematicSvgType: "custom_box",
    cadStepFileName: "Amazing_Hand_Fingertip_Silicone_Pad.STEP",
    notes: "抓握光滑玻璃水杯测试静摩擦力提升 2.8 倍，抓取成功率达 99.8%。",
  },

  // ==================== 3. 经典开源腱绳驱动灵巧手 (Tendon-Driven Hand) 核心结构件 ====================
  {
    id: "struct_tendon_differential_pulley_block",
    name: "开源腱绳灵巧手 欠驱动二叉差动滑轮模组 (自适应包络抓握分流器)",
    category: "开源腱绳灵巧手",
    material: "POM 赛钢 (自润滑) / AL6061-T6",
    process: "CNC 精密车铣复合 / 3D 打印",
    infillDensity: "100% 实体工程塑料",
    dimensionsMm: { length: 36, width: 24, height: 16 },
    weightGrams: 14,
    ratedTorqueNm: 3.5,
    bearingSpecs: [
      "MF63ZZ (3x6x2.5mm) 微型双法兰深沟球轴承 x 6 (二叉差动滑轮转轴)",
    ],
    fasteners: [
      "⌀1.5x10mm SUS304 磨削硬化销轴 x 3",
      "0.38mm 12编 Dyneema 仿生腱绳 (破断拉力 450N)",
      "微型冷压铝套 x 4",
    ],
    criticalTolerances: [
      {
        feature: "差动浮动滑轮轴孔同轴度与间隙",
        nominalSize: "Φ3.0 mm",
        toleranceSpec: "+0.012 / +0.004 mm (H7/h6)",
        reason: "确保滑轮在微小绳拉力下即可灵敏自由偏转，实现多指毫秒级自适应分流包络。",
      },
      {
        feature: "双绳防脱挡边槽深与曲率",
        nominalSize: "槽深 0.65mm, R0.45mm",
        toleranceSpec: "±0.010 mm",
        reason: "防止高速抓取动态工况下腱绳从滑轮脱槽跳线。",
      },
    ],
    solidworksTips:
      "采用二叉树级联浮动差动轮系结构，单根主驱动拉索通过两级差动滑轮均匀分配至食指、中指、无名指与小指，实现无需多电机的自适应柔顺抓取。",
    dfmReviewPoints: [
      "滑轮轴端配 E 型卡簧定位，防止轴向窜动。",
      "滑轮边缘做镜面抛光 (Ra ≤ 0.2)，降低绳索循环疲劳磨损。",
    ],
    isUserCustom: false,
    createdAt: "2026-03-01",
    updatedAt: "2026-03-10",
    tags: ["开源绳驱动", "差动滑轮", "欠驱动", "自适应抓取", "Dyneema"],
    schematicSvgType: "gearbox",
    cadStepFileName: "Open_Tendon_Differential_Pulley_Block.STEP",
    notes: "实现单电机拉拽下 4 指自适应包裹任意形状不规则异形件，抓取稳定性大幅提升。",
  },
  {
    id: "struct_tendon_bowden_router_palm",
    name: "开源腱绳灵巧手 远程 Bowden 导管手掌支架与低摩擦走线盒",
    category: "开源腱绳灵巧手",
    material: "PA12-CF (碳纤增强尼龙) / 航空铝 6061",
    process: "工业级 SLS 尼龙烧结 / CNC",
    infillDensity: "80% 工业级高强实体",
    dimensionsMm: { length: 88, width: 80, height: 35 },
    weightGrams: 110,
    ratedTorqueNm: 4.0,
    bearingSpecs: [
      "MR52ZZ (2x5x2.5mm) 导向微型轴承 x 8 (掌心过线转向滑轮)",
    ],
    fasteners: [
      "M2.5x8 不锈钢圆柱头螺栓 x 12",
      "M3 快拧微型气动接头 / Bowden 锁紧金属衬套 x 5",
      "内径 0.8mm / 外径 1.6mm PTFE 特氟龙耐磨导管 x 5",
    ],
    criticalTolerances: [
      {
        feature: "Bowden 导管安装沉孔同心度",
        nominalSize: "Φ4.0 mm",
        toleranceSpec: "+0.05 / -0.00 mm",
        reason: "牢固卡紧 PTFE 套管，防止大拉力时导管轴向窜动引起腱绳行程损失。",
      },
    ],
    solidworksTips:
      "掌骨内部设计光滑平滑过渡 S 弯走线流道，曲率半径 R ≥ 15mm，彻底消除绳索死弯，管路传动损耗降至 8% 以下。",
    dfmReviewPoints: [
      "SLS 打印完成后必须使用高压气枪彻底吹净内腔残余粉末，并穿入 PTFE 衬管。",
    ],
    isUserCustom: false,
    createdAt: "2026-03-02",
    updatedAt: "2026-03-10",
    tags: ["开源绳驱动", "Bowden导管", "手掌支架", "低摩擦", "前臂后置驱动"],
    schematicSvgType: "gripper_jaw",
    cadStepFileName: "Open_Tendon_Bowden_Router_Palm_V2.STEP",
    notes: "支持将驱动舵机后置于前臂或固定基座，手指末端自重减轻 70%，大幅提高运动灵敏度。",
  },
  {
    id: "struct_tendon_spring_finger_phalanx",
    name: "开源腱绳灵巧手 内嵌扭簧复位顺应铰链指骨总成 (带TPU阶梯防滑指纹)",
    category: "开源腱绳灵巧手",
    material: "PLA-CF / POM 赛钢 + TPU 阶梯防滑垫",
    process: "FDM 3D打印 (首选高性价比) / CNC",
    infillDensity: "50% 陀螺仪网格, 5层外壁",
    dimensionsMm: { length: 78, width: 15, height: 14 },
    weightGrams: 16,
    ratedTorqueNm: 1.8,
    bearingSpecs: [
      "自润滑铜套或 POM 铰链转轴 (Φ2.0mm)",
    ],
    fasteners: [
      "⌀2.0x14mm 不锈钢实心销轴 x 3",
      "⌀0.4mm 琴钢丝 SWP-B 高寿命内嵌复位扭簧 x 3",
      "0.38mm Dyneema 腱绳 x 1",
    ],
    criticalTolerances: [
      {
        feature: "指节铰链销轴配合孔公差",
        nominalSize: "Φ2.0 mm",
        toleranceSpec: "+0.03 / +0.01 mm (H7动配合)",
        reason: "既保证指节弯曲自如无旷量，又防止弹簧回弹时发生卡顿阻滞。",
      },
    ],
    solidworksTips:
      "非对称偏心力臂设计：手指完全伸直时弹簧力矩最小（0.4N·m），闭合抓握时拉索力臂增大 25%，抵消弹簧反抗阻力。",
    dfmReviewPoints: [
      "销轴两端采用紧定螺钉或翻边防脱卡环，确保经过 50 万次往复屈伸不窜动脱出。",
    ],
    isUserCustom: false,
    createdAt: "2026-03-03",
    updatedAt: "2026-03-10",
    tags: ["开源绳驱动", "弹簧复位", "指骨总成", "防滑指纹", "顺应抓取"],
    schematicSvgType: "elbow_joint",
    cadStepFileName: "Open_Tendon_Spring_Finger_Phalanx.STEP",
    notes: "经典单绳主动拉拽、扭簧被动复位构型，大幅简化电控驱动通道。",
  },
];

// Helper to load structures from localStorage
export function loadSavedStructures(): MechanicalStructureItem[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_STRUCTURES_KEY);
    if (!saved) {
      localStorage.setItem(LOCAL_STORAGE_STRUCTURES_KEY, JSON.stringify(DEFAULT_PRESET_STRUCTURES));
      return DEFAULT_PRESET_STRUCTURES;
    }
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge with default preset structures if any are missing
      const customStructures = parsed.filter((p) => p.isUserCustom);
      const existingIds = new Set(parsed.map((p) => p.id));
      const missingPresets = DEFAULT_PRESET_STRUCTURES.filter((d) => !existingIds.has(d.id));
      if (missingPresets.length > 0) {
        const merged = [...parsed, ...missingPresets];
        localStorage.setItem(LOCAL_STORAGE_STRUCTURES_KEY, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    }
    return DEFAULT_PRESET_STRUCTURES;
  } catch (e) {
    console.error("Failed to load mechanical structures:", e);
    return DEFAULT_PRESET_STRUCTURES;
  }
}

// Helper to save structures to localStorage
export function saveStructures(structures: MechanicalStructureItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_STRUCTURES_KEY, JSON.stringify(structures));
  } catch (e) {
    console.error("Failed to save mechanical structures:", e);
  }
}

// Export structures to JSON file download
export function exportStructuresToJson(structures: MechanicalStructureItem[]): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(structures, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `OpenArm_AmazingHand_Structures_BOM_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
