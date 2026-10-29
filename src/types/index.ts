export interface UserProfile {
  name: string;
  major: string;
  education: {
    juniorCollege: {
      school: string;
      major: string;
      gradYear: string;
      keyFocus: string[];
    };
    undergraduate: {
      school: string;
      major: string;
      admissionYear: string;
      keyFocus: string[];
    };
  };
  experiences: {
    id: string;
    company: string;
    period: string;
    role: string;
    clientsOrProducts: string[];
    coreAchievements: string[];
    keyTechnologies: string[];
    challengesSolved: string[];
  }[];
  competitiveAdvantages: {
    title: string;
    description: string;
  }[];
  skillsMatrix: {
    category: string;
    score: number; // 0 - 100
    details: string;
  }[];
}

export interface ProjectProposal {
  id: string;
  title: string;
  category: string;
  highlightBadge: string;
  difficulty: string;
  summary: string;
  backgroundMotivation: string;
  mechanicalArchitecture: {
    mechanismType: string;
    degreesOfFreedom: number;
    transmissionType: string;
    actuatorType: string;
    materials: string[];
    keyDimensions: string;
  };
  engineeringCalculations: {
    formulaName: string;
    formulaExpr: string;
    parameters: { name: string; value: string; unit: string; desc: string }[];
    calculationConclusion: string;
  }[];
  dfmAndManufacturing: {
    criticalTolerances: string[];
    machiningProcesses: string[];
    costOptimizationTips: string[];
    assemblyNotes: string[];
  };
  bomList: {
    partName: string;
    spec: string;
    qty: number;
    material: string;
    estimatedCost: string;
  }[];
  interviewDefensePoints: {
    question: string;
    interviewerTrap: string;
    goldenAnswer: string;
  }[];
}

export interface InterviewQuestion {
  id: string;
  topic: 
    | "微型舵机与精密微传动(Kpower专项)"
    | "绳驱与灵巧手" 
    | "球头连杆与多自由度" 
    | "协作臂精密结构" 
    | "非标锂电设备" 
    | "机械工艺与DFM" 
    | "个人经历与项目复盘";
  title: string;
  difficulty: "基础" | "中等" | "困难" | "地狱级";
  companyTag: string; // e.g. "大疆/宇树/先导"
  interviewerIntent: string;
  coreKeypoints: string[];
  recommendedStarAnswer: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  commonMistakes: string[];
  deepFollowUps: string[];
}

export interface EvaluationResult {
  score: "S" | "A" | "B" | "C" | "D";
  scoreNumber: number; // 0-100
  highlights: string[];
  flaws: string[];
  modelAnswer: string;
  followUpQuestions: string[];
  rawFeedback?: string;
}

export type ServoProtocol =
  | "feetech_sts"
  | "damiao_can"
  | "dynamixel_v2"
  | "unitree_can"
  | "dji_can"
  | "odrive_can"
  | "pwm_standard"
  | string;

export interface ServoModelPreset {
  id: string;
  name: string;
  brand: string;
  resolution: number; // e.g. 4096 counts/360deg
  voltageNominal: number; // V
  maxTorqueKgCm: number; // kg.cm
  maxSpeedRpm: number;
  protocol: ServoProtocol;
  defaultBaud: number;
  encoderType: string;
  description: string;
}

export type ActuatorConnectionStatus = "online" | "offline" | "fault" | "scanning";

export interface ServoChannelConfig {
  id: number; // 1 ~ 6
  name: string; // Joint name, e.g. "J1: 拇指展收"
  modelId: string;
  protocol: ServoProtocol;
  baudRate: number;
  connectionStatus?: ActuatorConnectionStatus;
  pingLatencyMs?: number;
  packetLossRate?: number;
  lastHeartbeatTs?: number;
  hardwareLedState?: string;
  errorFlags?: string[];
  rawEncoderTicks: number; // Current raw sensor read (0~4095)
  zeroOffsetTicks: number; // Stored zero offset ticks
  zeroOffsetDeg: number; // Computed zero offset in degrees
  invertDirection: boolean; // Normal vs Inverted
  minAngleDeg: number; // Soft limit min (e.g. -90)
  maxAngleDeg: number; // Soft limit max (e.g. +90)
  targetAngleDeg: number; // User commanding position
  currentAngleDeg: number; // Measured current physical position
  // PID gains
  kp: number; // P gain (0 ~ 255 / 1000)
  ki: number; // I gain (0 ~ 255)
  kd: number; // D gain (0 ~ 255)
  deadbandDeg: number; // Deadband in degrees
  // Operational dynamics & safety limits
  maxSpeedDegS: number; // deg/s
  accelerationDegS2: number; // deg/s^2
  torqueLimitPercent: number; // 0 - 100%
  stallProtectionMs: number; // Stall timeout
  tempLimitC: number; // Temperature protection
  voltageLimitMin: number;
  voltageLimitMax: number;
  // Real-time telemetry
  voltage: number; // Measured Volts
  currentMa: number; // Measured mA
  temperature: number; // Measured °C
  loadPercent: number; // 0 - 100%
  isTorqueEnabled: boolean;
  isLocked: boolean;
}

export interface ServoPoseKeyframe {
  id: string;
  name: string;
  angles: Record<number, number>; // servoId -> angleDeg
  speed: number;
  delayMs: number;
}

export type OpenArmTaskStageId =
  | "stage_mech"
  | "stage_elec"
  | "stage_embedded"
  | "stage_kinematics"
  | "stage_ros2"
  | "stage_debug"
  | "stage_urgent";

export interface OpenArmStageMeta {
  id: OpenArmTaskStageId;
  name: string;
  subtitle: string;
  badge: string;
  color: string;
  totalTasks: number;
}

export interface OpenArmTask {
  id: string;
  stageId: OpenArmTaskStageId;
  title: string;
  description: string;
  dayNumber: number; // 计划天数 (第1天, 第2天...)
  scheduledDate: string; // 当前排期日期 YYYY-MM-DD
  originalDate: string; // 初始计划日期 YYYY-MM-DD
  postponeCount: number; // 顺延累计次数
  priority: "urgent" | "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed" | "postponed";
  estimatedMinutes: number;
  completedAt?: string;
  keyLearningPoints: string[];
  embeddedCodeReference?: {
    fileName: string;
    codeSnippet: string;
    colleagueModifyReason: string;
    beginnerTip: string;
  };
  deliverableChecklist: {
    id: string;
    text: string;
    done: boolean;
  }[];
  isCustom?: boolean;
}

export interface EmbeddedCodeHotspot {
  id: string;
  title: string;
  lines: number[]; // e.g. [14, 15, 16]
  whyColleagueModifies: string;
  symptomsWhenWrong: string;
  tuningGuide: string;
  beginnerNote: string;
}

export interface EmbeddedCodeTemplate {
  id: string;
  fileName: string;
  title: string;
  category: "协议驱动" | "PID算法" | "零点校准" | "状态机与中断" | "ROS2与上位机";
  language: "c" | "cpp" | "python" | "h";
  description: string;
  code: string;
  hotspots: EmbeddedCodeHotspot[];
}

// ==================== 机械结构库 (Mechanical Structure Library) ====================
export type StructureCategory =
  | "J1基座回转"
  | "J2大臂俯仰"
  | "J3小臂肘部"
  | "J4腕部回转"
  | "J5腕部俯仰"
  | "J6末端法兰"
  | "OpenArm J1基座"
  | "OpenArm J2大臂"
  | "OpenArm J6末端"
  | "Aero Hand Open 机械手"
  | "Amazing Hand 机械手"
  | "末端执行器与夹爪"
  | "减速与传动箱"
  | "走线与张紧机构"
  | "自研非标部件"
  | string;

export type MaterialType =
  | "PETG (高韧耐用)"
  | "PLA-CF (碳纤增强刚性)"
  | "ABS / ASA (耐温抗冲)"
  | "PA12-CF (尼龙碳纤)"
  | "AL6061-T6 (航空铝合金)"
  | "AL7075-T6 (高强航空铝)"
  | "POM 赛钢 (耐磨自润滑)"
  | "PEEK (聚醚醚酮) / POM 赛钢 + 航空铝指骨"
  | "AL6061-T6 / 碳纤增强 PLA-CF"
  | "AL6061-T6 阳极氧化 / PLA-CF 碳纤维增强"
  | "AL6061-T6 / POM 赛钢 / 光固化高韧树脂"
  | "3K碳纤维板"
  | "高韧光固化树脂"
  | string;

export type ManufacturingProcess =
  | "FDM 3D打印 (首选高性价比)"
  | "CNC 数控加工 (高刚性公差)"
  | "CNC 数控精加工 (高刚性公差)"
  | "CNC 数控加工 / 工业级 3D 打印"
  | "CNC 拓扑减重加工 / 工业 FDM"
  | "CNC 精密五轴切削 / 模具注塑"
  | "CNC 精密车铣复合 / 高精度微米注塑"
  | "SLA / DLP 光固化打印"
  | "钣金激光切割折弯"
  | "注塑模具 (大批量)"
  | string;

export interface MechanicalStructureItem {
  id: string;
  name: string;
  category: StructureCategory;
  material: MaterialType;
  process: ManufacturingProcess;
  infillDensity: string; // e.g. "50% 陀螺仪网格, 4层外壁"
  dimensionsMm: {
    length: number;
    width: number;
    height: number;
  };
  weightGrams: number;
  ratedTorqueNm: number;
  bearingSpecs: string[]; // e.g. ["6806ZZ (30x42x7mm) 薄壁轴承 x 2", "51105 推力轴承 x 1"]
  fasteners: string[]; // e.g. ["M3x8 沉头螺丝 x 8", "M3*4*5 热熔黄铜螺母 x 12"]
  criticalTolerances: {
    feature: string; // 特征名称 (如: "轴承安装孔")
    nominalSize: string; // 公称尺寸 (如: "Φ42.0 mm")
    toleranceSpec: string; // 推荐公差 (如: "+0.02 / -0.00 mm (过渡配合)")
    reason: string; // 设定依据 (如: "防止轴承晃动导致末端回差放大，同时避免孔太紧撑裂3D打印件")
  }[];
  solidworksTips: string; // SolidWorks / Fusion 360 建模要点与特征设计
  dfmReviewPoints: string[]; // DFM 可制造性与装配自检要点
  isUserCustom: boolean; // 是否为用户自建保存的结构
  createdAt: string;
  updatedAt: string;
  tags: string[];
  schematicSvgType: "swivel_base" | "arm_linkage" | "elbow_joint" | "wrist_roll" | "gripper_jaw" | "gearbox" | "custom_box";
  cadStepFileName?: string;
  notes?: string;
}

// ==================== 主控开发套件 (Microcontroller Suite) ====================
export type ControllerPlatformType = "arduino" | "stm32" | "esp32";

export interface ControllerPlatformInfo {
  id: ControllerPlatformType;
  name: string;
  recommendedChips: string[];
  difficulty: "新手友好" | "工业进阶" | "无线双核王者";
  coreClock: string;
  memory: string;
  uartFeatures: string;
  idealScenario: string;
  pros: string[];
  cons: string[];
  wiringDiagramDesc: string;
}

export interface ControllerFirmwareTemplate {
  id: string;
  platform: ControllerPlatformType;
  title: string;
  fileName: string;
  language: "c" | "cpp" | "ino";
  category: "极简驱动" | "FreeRTOS多任务" | "无线遥控与网页上位机" | "硬件定时器与DMA中断";
  description: string;
  code: string;
  pinoutConfig: {
    pinName: string;
    targetHardwarePin: string;
    description: string;
  }[];
  compileToolchain: string; // e.g. "Arduino IDE / PlatformIO" or "Keil MDK / STM32CubeIDE"
  flashInstructions: string[];
}

// ==================== 嵌入式代码机电翻译器 (Code Translator for Mechanical Engineers) ====================
export interface UploadedCodeFile {
  id: string;
  fileName: string;
  language: string; // "c" | "cpp" | "python" | "arduino" | "rust" | "text"
  code: string;
  hardwareContext: string;
  fileSizeFormatted: string;
  lineCount: number;
  uploadedAt: string;
  isPreset?: boolean;
  authorNote?: string;
}

export interface CodeTranslationMechanicalParam {
  paramName: string;
  varName: string;
  currentValue: string;
  physicalMeaning: string;
  mechanicalImpact: string;
}

export interface CodeTranslationResult {
  physicalActionSummary: string;
  motionBreakdown: string[];
  keyParameters: CodeTranslationMechanicalParam[];
  pinoutAndSignals: {
    pinOrBus: string;
    signalType: string;
    connectedHardware: string;
    wiringPrecautions: string;
  }[];
  troubleshootingGuide: {
    symptom: string;
    probableCodeLocation: string;
    mechanicalAction: string;
  }[];
  colleagueCheatSheet: string[];
  rawMarkdownText?: string;
}// ==================== 3MF 3D 打印切片与制造资产 (3MF Slicing & 3D Print Library) ====================
export interface SlicingPlateItem {
  id: string;
  title: string;
  projectCategory: "AmazingHand" | "Aero Hand Open" | "OpenArm 机械臂" | "自研非标与夹爪";
  fileName: string;
  slicerSoftware: "Bambu Studio" | "OrcaSlicer" | "PrusaSlicer" | "Cura" | "Chitubox";
  printerModel: string; // e.g. "Bambu Lab X1-Carbon / P1S", "Prusa MK4 / XL", "创想三维 K1 Max"
  materialType:
    | "PLA-CF (碳纤维增强PLA)"
    | "PETG-CF (耐候耐磨碳纤)"
    | "PA-CF (尼龙碳纤维/高强度)"
    | "TPU 95A (柔性仿生触感)"
    | "PLA+ (高韧性耗材)"
    | "POM / PEEK (耐磨自润滑)"
    | "SLA 高韧光固化树脂";
  layerHeightMm: number; // e.g. 0.12, 0.16, 0.20
  infillPercent: number; // 0 - 100
  infillPattern: "Gyroid (陀螺状)" | "Grid (网格)" | "Honeycomb (蜂窝)" | "100% Solid (实体)" | "Adaptive Cubic (自适应立方)";
  wallLoops: number;
  topBottomLayers: number;
  printTimeHours: number; // e.g. 3.5
  filamentGrams: number;
  filamentMeters: number;
  partCount: number;
  openSourceUrl?: string; // e.g. "https://github.com/pollen-robotics/AmazingHand"
  openSourceAuthor?: string; // e.g. "Pollen Robotics" or "TetherIA"
  cadSourceUrl?: string; // Direct link to official CAD / STL folder or repo
  onshapeUrl?: string; // Direct Onshape 3D parametric CAD workspace
  zipDownloadUrl?: string; // Direct zip archive of upstream repo
  plateIndex: number;
  plateName: string;
  isUserUploaded?: boolean;
  fileSizeFormatted: string;
  uploadedAt: string;
  printTips: string[];
  recommendedBedTempC: number;
  recommendedNozzleTempC: number;
  tags: string[];
  officialStlFiles?: { name: string; description: string; downloadPath?: string }[];
}
