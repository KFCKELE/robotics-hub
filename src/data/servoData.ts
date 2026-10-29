import { ServoModelPreset, ServoChannelConfig, ServoPoseKeyframe } from "../types";

export const SERVO_MODEL_PRESETS: Record<string, ServoModelPreset> = {
  // ================= 深圳飞特 (Feetech) / Aero Hand Open 机械手总线舵机系列 =================
  feetech_sts3215: {
    id: "feetech_sts3215",
    name: "深圳飞特 STS3215 磁编串口舵机 (7.4V/19.5kg.cm)",
    brand: "Feetech (深圳飞特)",
    resolution: 4096, // 12-bit
    voltageNominal: 7.4,
    maxTorqueKgCm: 19.5,
    maxSpeedRpm: 65,
    protocol: "feetech_sts",
    defaultBaud: 1000000,
    encoderType: "12-bit非接触式磁编码器",
    description: "深圳飞特主流半双工异步串口总线舵机，支持 1Mbps 高速通信、多圈角度反馈、温度/过载电压故障回传，广泛应用于 Aero Hand Open 掌指与大扭矩关节",
  },
  amazing_hand_scs0009: {
    id: "amazing_hand_scs0009",
    name: "深圳飞特 SCS0009 9g 微型总线舵机 (6.0V/2.3kg.cm)",
    brand: "Feetech (深圳飞特)",
    resolution: 1024, // 10-bit
    voltageNominal: 6.0,
    maxTorqueKgCm: 2.3,
    maxSpeedRpm: 120,
    protocol: "feetech_sts",
    defaultBaud: 1000000,
    encoderType: "10-bit高精磁编",
    description: "超微型 9g 串口总线舵机，专为 Aero Hand Open 灵巧手掌骨狭小空间高密度排布设计",
  },
  feetech_sm80bl: {
    id: "feetech_sm80bl",
    name: "深圳飞特 SM80BL 高压无刷大扭矩舵机 (12V/80kg.cm)",
    brand: "Feetech (深圳飞特)",
    resolution: 4096,
    voltageNominal: 12.0,
    maxTorqueKgCm: 80.0,
    maxSpeedRpm: 50,
    protocol: "feetech_sts",
    defaultBaud: 1000000,
    encoderType: "12-bit磁编码器",
    description: "无刷大扭矩全金属齿轮舵机，适用于大负载重型末端执行器与重载翻转机构",
  },
  amazing_hand_coreless: {
    id: "amazing_hand_coreless",
    name: "Aero Hand Open 微型 Capstan 绞盘模组 (飞特协议)",
    brand: "TetherIA / Feetech",
    resolution: 4096, // 12-bit
    voltageNominal: 7.4,
    maxTorqueKgCm: 3.8,
    maxSpeedRpm: 180,
    protocol: "feetech_sts",
    defaultBaud: 1000000,
    encoderType: "12-bit微型磁编码器",
    description: "集成 Capstan 螺旋槽绞盘与微型行星减速器，采用飞特半双工 TTL 串口通信与 ESP32-S3 主控",
  },

  // ================= 达妙科技 (Damiao) OpenArm CAN/CAN-FD 电机系列 =================
  damiao_dm_j4310: {
    id: "damiao_dm_j4310",
    name: "达妙科技 DM-J4310-2EC 关节一体化电机 (CAN/FOC)",
    brand: "达妙科技 (Damiao)",
    resolution: 16384, // 14-bit
    voltageNominal: 24.0,
    maxTorqueKgCm: 70.0, // 7 Nm
    maxSpeedRpm: 320,
    protocol: "damiao_can",
    defaultBaud: 1000000,
    encoderType: "14-bit双绝对值磁编码器 (输入/输出双反馈)",
    description: "达妙经典一体化减速电机，内嵌超薄微型谐波减速器 (1:10) 与 FOC 矢量驱动，支持 MIT / 位置速度 / 纯力矩模式",
  },
  damiao_dm_j4340: {
    id: "damiao_dm_j4340",
    name: "达妙科技 DM-J4340-2EC 高扭矩大臂关节电机 (CAN/FOC)",
    brand: "达妙科技 (Damiao)",
    resolution: 16384,
    voltageNominal: 24.0,
    maxTorqueKgCm: 280.0, // 28 Nm
    maxSpeedRpm: 200,
    protocol: "damiao_can",
    defaultBaud: 1000000,
    encoderType: "14-bit高精双磁编",
    description: "专为 OpenArm J2大臂 / J3小臂高承载关节打造，搭载超薄高减速比微型谐波 (1:30/1:50)，超强抗冲击与抗背隙刚度",
  },
  damiao_dm_j8009: {
    id: "damiao_dm_j8009",
    name: "达妙科技 DM-J8009-2EC 重载基座力矩电机 (CAN/FOC)",
    brand: "达妙科技 (Damiao)",
    resolution: 16384,
    voltageNominal: 48.0,
    maxTorqueKgCm: 540.0, // 54 Nm
    maxSpeedRpm: 150,
    protocol: "damiao_can",
    defaultBaud: 1000000,
    encoderType: "14-bit输出端绝对值磁编",
    description: "OpenArm J1 基座回转高刚性电机，超大空心孔便于整机内部走线，承受倾覆力矩超 120Nm",
  },

  // ================= 拓展兼容其他品牌电机 (3rd-Party Extensible) =================
  unitree_go_m8010: {
    id: "unitree_go_m8010",
    name: "宇树科技 Unitree GO-M8010-6 关节电机 (CAN/RS485)",
    brand: "宇树科技 (Unitree)",
    resolution: 16384,
    voltageNominal: 24.0,
    maxTorqueKgCm: 235.0, // 23.5 Nm
    maxSpeedRpm: 300,
    protocol: "unitree_can",
    defaultBaud: 1000000,
    encoderType: "14-bit磁编码器",
    description: "四足/机械臂高动态伺服关节，轻量化机身设计，支持高速 CAN 通信与电流力矩控制",
  },
  dji_robomaster_gm6020: {
    id: "dji_robomaster_gm6020",
    name: "大疆 RoboMaster GM6020 无刷直驱电机 (CAN/PWM)",
    brand: "大疆 (DJI)",
    resolution: 8192, // 13-bit
    voltageNominal: 24.0,
    maxTorqueKgCm: 12.0, // 1.2 Nm (直驱)
    maxSpeedRpm: 320,
    protocol: "dji_can",
    defaultBaud: 1000000,
    encoderType: "13-bit磁编码器",
    description: "大疆直驱无刷力矩电机，零背隙超低噪音，常用于末端三自由度云台与轻载旋转轴",
  },
  odrive_bldc_can: {
    id: "odrive_bldc_can",
    name: "通用 ODrive BLDC 伺服电机 (SimpleCAN 协议)",
    brand: "ODrive / 通用",
    resolution: 16384,
    voltageNominal: 24.0,
    maxTorqueKgCm: 150.0,
    maxSpeedRpm: 400,
    protocol: "odrive_can",
    defaultBaud: 500000,
    encoderType: "ABI光电/增量+绝对值磁编",
    description: "开源高性能双无刷 FOC 驱动器配大扭矩无刷电机，支持 SimpleCAN 协议与实时心跳广播",
  },
  dynamixel_xm430: {
    id: "dynamixel_xm430",
    name: "ROBOTIS Dynamixel XM430-W350-R (RS485)",
    brand: "ROBOTIS",
    resolution: 4096,
    voltageNominal: 12.0,
    maxTorqueKgCm: 41.8,
    maxSpeedRpm: 46,
    protocol: "dynamixel_v2",
    defaultBaud: 1000000,
    encoderType: "12-bit非接触磁编",
    description: "工业级高可靠性执行器，支持电流闭环力矩控制、轨迹 Profile 平滑规划与双编码器反馈",
  },
};

// ================= OpenArm 专用 达妙 (Damiao) CAN/CAN-FD 电机通道 =================
export const OPENARM_DAMIAO_CHANNELS: ServoChannelConfig[] = [
  {
    id: 1,
    name: "1号轴: OpenArm J1 基座回转轴 (达妙 DM-J8009 CAN)",
    modelId: "damiao_dm_j8009",
    protocol: "damiao_can",
    baudRate: 1000000,
    connectionStatus: "online",
    pingLatencyMs: 1.2,
    packetLossRate: 0.0,
    lastHeartbeatTs: Date.now(),
    hardwareLedState: "绿灯常亮 (闭环使能模式)",
    errorFlags: [],
    rawEncoderTicks: 8192,
    zeroOffsetTicks: 8192,
    zeroOffsetDeg: 0.0,
    invertDirection: false,
    minAngleDeg: -175,
    maxAngleDeg: 175,
    targetAngleDeg: 0,
    currentAngleDeg: 0,
    kp: 85,
    ki: 2,
    kd: 12,
    deadbandDeg: 0.05,
    maxSpeedDegS: 150,
    accelerationDegS2: 450,
    torqueLimitPercent: 90,
    stallProtectionMs: 800,
    tempLimitC: 75,
    voltageLimitMin: 20.0,
    voltageLimitMax: 52.0,
    voltage: 48.0,
    currentMa: 320,
    temperature: 36.2,
    loadPercent: 14,
    isTorqueEnabled: true,
    isLocked: false,
  },
  {
    id: 2,
    name: "2号轴: OpenArm J2 大臂俯仰主受力轴 (达妙 DM-J4340 CAN)",
    modelId: "damiao_dm_j4340",
    protocol: "damiao_can",
    baudRate: 1000000,
    connectionStatus: "online",
    pingLatencyMs: 1.4,
    packetLossRate: 0.0,
    lastHeartbeatTs: Date.now(),
    hardwareLedState: "绿灯常亮 (闭环使能模式)",
    errorFlags: [],
    rawEncoderTicks: 8192,
    zeroOffsetTicks: 8192,
    zeroOffsetDeg: 0.0,
    invertDirection: false,
    minAngleDeg: -60,
    maxAngleDeg: 120,
    targetAngleDeg: 0,
    currentAngleDeg: 0,
    kp: 120,
    ki: 5,
    kd: 18,
    deadbandDeg: 0.05,
    maxSpeedDegS: 120,
    accelerationDegS2: 360,
    torqueLimitPercent: 95,
    stallProtectionMs: 600,
    tempLimitC: 75,
    voltageLimitMin: 20.0,
    voltageLimitMax: 28.0,
    voltage: 24.1,
    currentMa: 480,
    temperature: 39.8,
    loadPercent: 22,
    isTorqueEnabled: true,
    isLocked: false,
  },
  {
    id: 3,
    name: "3号轴: OpenArm J3 小臂肘关节 (达妙 DM-J4310 CAN)",
    modelId: "damiao_dm_j4310",
    protocol: "damiao_can",
    baudRate: 1000000,
    connectionStatus: "online",
    pingLatencyMs: 1.1,
    packetLossRate: 0.0,
    lastHeartbeatTs: Date.now(),
    hardwareLedState: "绿灯常亮 (闭环使能模式)",
    errorFlags: [],
    rawEncoderTicks: 8192,
    zeroOffsetTicks: 8192,
    zeroOffsetDeg: 0.0,
    invertDirection: false,
    minAngleDeg: -120,
    maxAngleDeg: 90,
    targetAngleDeg: 0,
    currentAngleDeg: 0,
    kp: 95,
    ki: 3,
    kd: 14,
    deadbandDeg: 0.05,
    maxSpeedDegS: 180,
    accelerationDegS2: 500,
    torqueLimitPercent: 90,
    stallProtectionMs: 600,
    tempLimitC: 70,
    voltageLimitMin: 20.0,
    voltageLimitMax: 28.0,
    voltage: 24.0,
    currentMa: 260,
    temperature: 35.1,
    loadPercent: 11,
    isTorqueEnabled: true,
    isLocked: false,
  },
  {
    id: 4,
    name: "4号轴: OpenArm J4 腕部回转偏航轴 (达妙 DM-J4310 CAN)",
    modelId: "damiao_dm_j4310",
    protocol: "damiao_can",
    baudRate: 1000000,
    connectionStatus: "online",
    pingLatencyMs: 1.3,
    packetLossRate: 0.0,
    lastHeartbeatTs: Date.now(),
    hardwareLedState: "绿灯常亮 (闭环使能模式)",
    errorFlags: [],
    rawEncoderTicks: 8192,
    zeroOffsetTicks: 8192,
    zeroOffsetDeg: 0.0,
    invertDirection: false,
    minAngleDeg: -160,
    maxAngleDeg: 160,
    targetAngleDeg: 0,
    currentAngleDeg: 0,
    kp: 80,
    ki: 2,
    kd: 10,
    deadbandDeg: 0.05,
    maxSpeedDegS: 200,
    accelerationDegS2: 600,
    torqueLimitPercent: 85,
    stallProtectionMs: 500,
    tempLimitC: 70,
    voltageLimitMin: 20.0,
    voltageLimitMax: 28.0,
    voltage: 24.0,
    currentMa: 180,
    temperature: 33.4,
    loadPercent: 8,
    isTorqueEnabled: true,
    isLocked: false,
  },
  {
    id: 5,
    name: "5号轴: OpenArm J5 腕部俯仰摆动轴 (达妙 DM-J4310 CAN)",
    modelId: "damiao_dm_j4310",
    protocol: "damiao_can",
    baudRate: 1000000,
    connectionStatus: "online",
    pingLatencyMs: 1.2,
    packetLossRate: 0.0,
    lastHeartbeatTs: Date.now(),
    hardwareLedState: "绿灯常亮 (闭环使能模式)",
    errorFlags: [],
    rawEncoderTicks: 8192,
    zeroOffsetTicks: 8192,
    zeroOffsetDeg: 0.0,
    invertDirection: false,
    minAngleDeg: -100,
    maxAngleDeg: 100,
    targetAngleDeg: 0,
    currentAngleDeg: 0,
    kp: 80,
    ki: 2,
    kd: 10,
    deadbandDeg: 0.05,
    maxSpeedDegS: 220,
    accelerationDegS2: 650,
    torqueLimitPercent: 85,
    stallProtectionMs: 500,
    tempLimitC: 70,
    voltageLimitMin: 20.0,
    voltageLimitMax: 28.0,
    voltage: 24.0,
    currentMa: 160,
    temperature: 32.8,
    loadPercent: 7,
    isTorqueEnabled: true,
    isLocked: false,
  },
  {
    id: 6,
    name: "6号轴: OpenArm J6 末端法兰工具旋转轴 (达妙 DM-J4310 CAN)",
    modelId: "damiao_dm_j4310",
    protocol: "damiao_can",
    baudRate: 1000000,
    connectionStatus: "online",
    pingLatencyMs: 1.1,
    packetLossRate: 0.0,
    lastHeartbeatTs: Date.now(),
    hardwareLedState: "绿灯常亮 (闭环使能模式)",
    errorFlags: [],
    rawEncoderTicks: 8192,
    zeroOffsetTicks: 8192,
    zeroOffsetDeg: 0.0,
    invertDirection: false,
    minAngleDeg: -180,
    maxAngleDeg: 180,
    targetAngleDeg: 0,
    currentAngleDeg: 0,
    kp: 75,
    ki: 2,
    kd: 8,
    deadbandDeg: 0.05,
    maxSpeedDegS: 250,
    accelerationDegS2: 700,
    torqueLimitPercent: 80,
    stallProtectionMs: 400,
    tempLimitC: 65,
    voltageLimitMin: 20.0,
    voltageLimitMax: 28.0,
    voltage: 24.0,
    currentMa: 140,
    temperature: 31.5,
    loadPercent: 5,
    isTorqueEnabled: true,
    isLocked: false,
  },
];

// ================= Aero Hand Open (TetherIA) 专用 深圳飞特 (Feetech) 7通道舵机 =================
export const AMAZING_HAND_CHANNELS: ServoChannelConfig[] = [
  {
    id: 1,
    name: "1号轴: 拇指外展/内收对掌轴 (Abduction 0~100° · 飞特 STS3215)",
    modelId: "feetech_sts3215",
    protocol: "feetech_sts",
    baudRate: 1000000,
    connectionStatus: "online",
    pingLatencyMs: 2.1,
    packetLossRate: 0.0,
    lastHeartbeatTs: Date.now(),
    hardwareLedState: "指示灯常亮 (通信正常)",
    errorFlags: [],
    rawEncoderTicks: 2048,
    zeroOffsetTicks: 2048,
    zeroOffsetDeg: 0.0,
    invertDirection: false,
    minAngleDeg: 0,
    maxAngleDeg: 100,
    targetAngleDeg: 0,
    currentAngleDeg: 0,
    kp: 32,
    ki: 0,
    kd: 4,
    deadbandDeg: 0.2,
    maxSpeedDegS: 180,
    accelerationDegS2: 600,
    torqueLimitPercent: 85,
    stallProtectionMs: 800,
    tempLimitC: 65,
    voltageLimitMin: 6.0,
    voltageLimitMax: 8.4,
    voltage: 7.4,
    currentMa: 120,
    temperature: 34.5,
    loadPercent: 12,
    isTorqueEnabled: true,
    isLocked: false,
  },
  {
    id: 2,
    name: "2号轴: 拇指根部基节屈伸轴 (Base Flexion 0~90° · 飞特 STS3215)",
    modelId: "feetech_sts3215",
    protocol: "feetech_sts",
    baudRate: 1000000,
    connectionStatus: "online",
    pingLatencyMs: 2.2,
    packetLossRate: 0.0,
    lastHeartbeatTs: Date.now(),
    hardwareLedState: "指示灯常亮 (通信正常)",
    errorFlags: [],
    rawEncoderTicks: 2048,
    zeroOffsetTicks: 2048,
    zeroOffsetDeg: 0.0,
    invertDirection: false,
    minAngleDeg: 0,
    maxAngleDeg: 90,
    targetAngleDeg: 0,
    currentAngleDeg: 0,
    kp: 32,
    ki: 0,
    kd: 4,
    deadbandDeg: 0.2,
    maxSpeedDegS: 180,
    accelerationDegS2: 600,
    torqueLimitPercent: 85,
    stallProtectionMs: 800,
    tempLimitC: 65,
    voltageLimitMin: 6.0,
    voltageLimitMax: 8.4,
    voltage: 7.4,
    currentMa: 130,
    temperature: 35.0,
    loadPercent: 14,
    isTorqueEnabled: true,
    isLocked: false,
  },
  {
    id: 3,
    name: "3号轴: 拇指末梢弯曲卷曲轴 (Thumb Curl 0~90° · 飞特 SCS0009)",
    modelId: "amazing_hand_scs0009",
    protocol: "feetech_sts",
    baudRate: 1000000,
    connectionStatus: "online",
    pingLatencyMs: 2.3,
    packetLossRate: 0.0,
    lastHeartbeatTs: Date.now(),
    hardwareLedState: "指示灯常亮 (通信正常)",
    errorFlags: [],
    rawEncoderTicks: 512,
    zeroOffsetTicks: 512,
    zeroOffsetDeg: 0.0,
    invertDirection: false,
    minAngleDeg: 0,
    maxAngleDeg: 90,
    targetAngleDeg: 0,
    currentAngleDeg: 0,
    kp: 28,
    ki: 0,
    kd: 3,
    deadbandDeg: 0.3,
    maxSpeedDegS: 240,
    accelerationDegS2: 800,
    torqueLimitPercent: 75,
    stallProtectionMs: 500,
    tempLimitC: 60,
    voltageLimitMin: 4.8,
    voltageLimitMax: 7.4,
    voltage: 6.0,
    currentMa: 95,
    temperature: 32.0,
    loadPercent: 8,
    isTorqueEnabled: true,
    isLocked: false,
  },
  {
    id: 4,
    name: "4号轴: 食指屈伸绳驱轴 (Index Flexion 0~90° · 飞特 SCS0009)",
    modelId: "amazing_hand_scs0009",
    protocol: "feetech_sts",
    baudRate: 1000000,
    connectionStatus: "online",
    pingLatencyMs: 1.9,
    packetLossRate: 0.0,
    lastHeartbeatTs: Date.now(),
    hardwareLedState: "指示灯常亮 (通信正常)",
    errorFlags: [],
    rawEncoderTicks: 512,
    zeroOffsetTicks: 512,
    zeroOffsetDeg: 0.0,
    invertDirection: false,
    minAngleDeg: 0,
    maxAngleDeg: 90,
    targetAngleDeg: 0,
    currentAngleDeg: 0,
    kp: 28,
    ki: 0,
    kd: 3,
    deadbandDeg: 0.3,
    maxSpeedDegS: 240,
    accelerationDegS2: 800,
    torqueLimitPercent: 75,
    stallProtectionMs: 500,
    tempLimitC: 60,
    voltageLimitMin: 4.8,
    voltageLimitMax: 7.4,
    voltage: 6.0,
    currentMa: 90,
    temperature: 31.5,
    loadPercent: 7,
    isTorqueEnabled: true,
    isLocked: false,
  },
  {
    id: 5,
    name: "5号轴: 中指主抓握绞盘轴 (Middle Flexion 0~90° · Capstan 绞盘)",
    modelId: "amazing_hand_coreless",
    protocol: "feetech_sts",
    baudRate: 1000000,
    connectionStatus: "online",
    pingLatencyMs: 2.0,
    packetLossRate: 0.0,
    lastHeartbeatTs: Date.now(),
    hardwareLedState: "指示灯常亮 (通信正常)",
    errorFlags: [],
    rawEncoderTicks: 2048,
    zeroOffsetTicks: 2048,
    zeroOffsetDeg: 0.0,
    invertDirection: false,
    minAngleDeg: 0,
    maxAngleDeg: 90,
    targetAngleDeg: 0,
    currentAngleDeg: 0,
    kp: 35,
    ki: 0,
    kd: 5,
    deadbandDeg: 0.2,
    maxSpeedDegS: 200,
    accelerationDegS2: 700,
    torqueLimitPercent: 80,
    stallProtectionMs: 600,
    tempLimitC: 65,
    voltageLimitMin: 6.0,
    voltageLimitMax: 8.4,
    voltage: 7.4,
    currentMa: 110,
    temperature: 33.0,
    loadPercent: 10,
    isTorqueEnabled: true,
    isLocked: false,
  },
  {
    id: 6,
    name: "6号轴: 无名指屈伸绳驱轴 (Ring Flexion 0~90° · 飞特 SCS0009)",
    modelId: "amazing_hand_scs0009",
    protocol: "feetech_sts",
    baudRate: 1000000,
    connectionStatus: "online",
    pingLatencyMs: 2.1,
    packetLossRate: 0.0,
    lastHeartbeatTs: Date.now(),
    hardwareLedState: "指示灯常亮 (通信正常)",
    errorFlags: [],
    rawEncoderTicks: 512,
    zeroOffsetTicks: 512,
    zeroOffsetDeg: 0.0,
    invertDirection: false,
    minAngleDeg: 0,
    maxAngleDeg: 90,
    targetAngleDeg: 0,
    currentAngleDeg: 0,
    kp: 28,
    ki: 0,
    kd: 3,
    deadbandDeg: 0.3,
    maxSpeedDegS: 240,
    accelerationDegS2: 800,
    torqueLimitPercent: 75,
    stallProtectionMs: 500,
    tempLimitC: 60,
    voltageLimitMin: 4.8,
    voltageLimitMax: 7.4,
    voltage: 6.0,
    currentMa: 85,
    temperature: 31.0,
    loadPercent: 6,
    isTorqueEnabled: true,
    isLocked: false,
  },
  {
    id: 7,
    name: "7号轴: 小指屈伸绳驱轴 (Pinky Flexion 0~90° · 飞特 SCS0009)",
    modelId: "amazing_hand_scs0009",
    protocol: "feetech_sts",
    baudRate: 1000000,
    connectionStatus: "online",
    pingLatencyMs: 2.0,
    packetLossRate: 0.0,
    lastHeartbeatTs: Date.now(),
    hardwareLedState: "指示灯常亮 (通信正常)",
    errorFlags: [],
    rawEncoderTicks: 512,
    zeroOffsetTicks: 512,
    zeroOffsetDeg: 0.0,
    invertDirection: false,
    minAngleDeg: 0,
    maxAngleDeg: 90,
    targetAngleDeg: 0,
    currentAngleDeg: 0,
    kp: 28,
    ki: 0,
    kd: 3,
    deadbandDeg: 0.3,
    maxSpeedDegS: 240,
    accelerationDegS2: 800,
    torqueLimitPercent: 75,
    stallProtectionMs: 500,
    tempLimitC: 60,
    voltageLimitMin: 4.8,
    voltageLimitMax: 7.4,
    voltage: 6.0,
    currentMa: 80,
    temperature: 30.5,
    loadPercent: 5,
    isTorqueEnabled: true,
    isLocked: false,
  },
];

export const INITIAL_SERVO_CHANNELS: ServoChannelConfig[] = OPENARM_DAMIAO_CHANNELS;

// ================= OpenArm 专用 预设位姿序列 =================
export const OPENARM_POSE_KEYFRAMES: ServoPoseKeyframe[] = [
  {
    id: "openarm_zero",
    name: "OpenArm 机械臂全轴机械零位 (垂直竖直参考)",
    angles: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    speed: 80,
    delayMs: 600,
  },
  {
    id: "openarm_ready",
    name: "OpenArm 待机巡检姿态 (J2: 30°, J3: -45° 肘部弯曲)",
    angles: { 1: 0, 2: 30, 3: -45, 4: 0, 5: 15, 6: 0 },
    speed: 120,
    delayMs: 800,
  },
  {
    id: "openarm_reach_forward",
    name: "OpenArm 水平向前伸展 (J2: 60°, J3: -30°, J5: -30°)",
    angles: { 1: 0, 2: 60, 3: -30, 4: 0, 5: -30, 6: 0 },
    speed: 100,
    delayMs: 1000,
  },
  {
    id: "openarm_table_pickup",
    name: "OpenArm 桌面垂直俯冲拾取位姿 (J2: 45°, J3: -75°, J5: 30°)",
    angles: { 1: 0, 2: 45, 3: -75, 4: 0, 5: 30, 6: 90 },
    speed: 100,
    delayMs: 1000,
  },
];

// ================= Aero Hand Open (TetherIA) 专用 预设手势序列 =================
export const AMAZING_HAND_POSE_KEYFRAMES: ServoPoseKeyframe[] = [
  {
    id: "hand_zero",
    name: "Aero Hand Open 五指中位基准 (7-DoF 零点标定)",
    angles: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
    speed: 100,
    delayMs: 500,
  },
  {
    id: "hand_open_palm",
    name: "Aero Hand Open 五指自然张开 (0° 展开待机姿态)",
    angles: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
    speed: 150,
    delayMs: 800,
  },
  {
    id: "hand_precision_pinch",
    name: "Aero Hand 拇指食指精准对捏 (0.05mm 精密抓取)",
    angles: { 1: 45, 2: 60, 3: 45, 4: 65, 5: 10, 6: 10, 7: 10 },
    speed: 180,
    delayMs: 1000,
  },
  {
    id: "hand_power_fist",
    name: "Aero Hand 五指强力握拳 (包络抓握 1.5kg)",
    angles: { 1: 60, 2: 85, 3: 85, 4: 85, 5: 85, 6: 85, 7: 85 },
    speed: 200,
    delayMs: 1200,
  },
  {
    id: "hand_point_gesture",
    name: "Aero Hand 食指单指指向 (视觉标定手势)",
    angles: { 1: 50, 2: 80, 3: 80, 4: 0, 5: 85, 6: 85, 7: 85 },
    speed: 160,
    delayMs: 800,
  },
  {
    id: "hand_ok_sign",
    name: "Aero Hand OK 手势 (拇指+食指环形闭环)",
    angles: { 1: 55, 2: 70, 3: 65, 4: 75, 5: 0, 6: 0, 7: 0 },
    speed: 160,
    delayMs: 800,
  },
];

export const DEFAULT_POSE_KEYFRAMES: ServoPoseKeyframe[] = OPENARM_POSE_KEYFRAMES;

/**
 * Generate C/C++ Header / Arduino Driver Code for Calibration Offsets & Parameters
 */
export function generateCppCalibrationHeader(servos: ServoChannelConfig[]): string {
  const dateStr = new Date().toISOString().split("T")[0];
  return `/**
 * @file hand_actuator_calibrated_offsets.h
 * @brief Auto-generated for Amazing Hand & OpenArm Motor Actuators
 * @author Robotics & Mechatronics R&D Team (机器人与机电一体化研发)
 * @date ${dateStr}
 * @note Supports Feetech STS/SMS, Dynamixel & FOC CAN-FD Protocols
 */

#ifndef SERVO_CALIBRATED_OFFSETS_H
#define SERVO_CALIBRATED_OFFSETS_H

#include <stdint.h>
#include <stdbool.h>

#define NUM_CALIBRATED_SERVOS ${servos.length}

typedef struct {
    uint8_t  id;                // Servo Hardware ID (1~253)
    const char* joint_name;     // Functional joint description
    uint16_t zero_offset_ticks; // Raw encoder zero offset (0~4095)
    float    zero_offset_deg;   // Equivalent zero angle offset (deg)
    bool     invert_dir;        // Direction polarity (true: reverse, false: normal)
    float    min_angle_deg;     // Soft limit min (deg)
    float    max_angle_deg;     // Soft limit max (deg)
    uint8_t  kp;                // Position loop P gain
    uint8_t  ki;                // Position loop I gain
    uint8_t  kd;                // Position loop D gain
    float    deadband_deg;      // Deadband zone (deg)
    uint16_t max_speed_dps;     // Max speed (deg/s)
    uint16_t accel_dps2;        // Acceleration trajectory (deg/s^2)
    uint8_t  torque_limit_pct;  // Max torque limit (0~100%)
    uint16_t stall_timeout_ms;  // Stall protection duration (ms)
} ServoConfig_t;

static const ServoConfig_t ROBOT_SERVO_CALIBRATION_TABLE[NUM_CALIBRATED_SERVOS] = {
${servos
  .map(
    (s) => `    {
        .id = ${s.id},
        .joint_name = "${s.name}",
        .zero_offset_ticks = ${s.zeroOffsetTicks},
        .zero_offset_deg = ${s.zeroOffsetDeg.toFixed(2)}f,
        .invert_dir = ${s.invertDirection ? "true" : "false"},
        .min_angle_deg = ${s.minAngleDeg.toFixed(1)}f,
        .max_angle_deg = ${s.maxAngleDeg.toFixed(1)}f,
        .kp = ${s.kp},
        .ki = ${s.ki},
        .kd = ${s.kd},
        .deadband_deg = ${s.deadbandDeg.toFixed(2)}f,
        .max_speed_dps = ${s.maxSpeedDegS},
        .accel_dps2 = ${s.accelerationDegS2},
        .torque_limit_pct = ${s.torqueLimitPercent},
        .stall_timeout_ms = ${s.stallProtectionMs}
    }`
  )
  .join(",\n")}
};

/**
 * Convert user target physical angle (-180.0 ~ +180.0 deg) to raw servo encoder command
 * @param config Pointer to joint configuration
 * @param target_deg User desired physical angle in degrees
 * @return uint16_t Raw 12-bit encoder command ticks (0~4095 for STS3215)
 */
static inline uint16_t Servo_AngleToRawTicks(const ServoConfig_t* config, float target_deg) {
    // 1. Clamp to calibrated soft limits
    if (target_deg < config->min_angle_deg) target_deg = config->min_angle_deg;
    if (target_deg > config->max_angle_deg) target_deg = config->max_angle_deg;

    // 2. Apply direction inversion
    float effective_angle = config->invert_dir ? -target_deg : target_deg;

    // 3. Compute raw encoder ticks with zero-offset compensation (4096 ticks = 360 deg)
    int32_t ticks = (int32_t)config->zero_offset_ticks + (int32_t)((effective_angle / 360.0f) * 4096.0f);
    
    // Wrap within 0~4095
    while (ticks < 0) ticks += 4096;
    while (ticks >= 4096) ticks -= 4096;
    return (uint16_t)ticks;
}

/**
 * Convert raw encoder feedback ticks into calibrated physical angle (deg)
 */
static inline float Servo_RawTicksToAngle(const ServoConfig_t* config, uint16_t raw_ticks) {
    int32_t delta_ticks = (int32_t)raw_ticks - (int32_t)config->zero_offset_ticks;
    // Handle wrap-around
    if (delta_ticks > 2048) delta_ticks -= 4096;
    if (delta_ticks < -2048) delta_ticks += 4096;

    float angle_deg = (delta_ticks / 4096.0f) * 360.0f;
    return config->invert_dir ? -angle_deg : angle_deg;
}

#endif // SERVO_CALIBRATED_OFFSETS_H
`;
}

/**
 * Generate Python / ROS2 Joint Calibration Node
 */
export function generatePythonCalibrationScript(servos: ServoChannelConfig[]): string {
  return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RoboCraft Servo Calibration & Multi-Axis Telemetry Node
Compatible with Feetech STS3215 / SCS0009 & ROS2 JointState Publisher
"""

import time
import math
from dataclasses import dataclass
from typing import Dict, List

@dataclass
class ServoJoint:
    id: int
    name: str
    zero_offset_ticks: int
    invert_dir: bool
    min_angle: float
    max_angle: float
    kp: int
    ki: int
    kd: int
    max_speed_dps: int
    torque_limit_pct: int

# Calibrated Joint Parameter Table
JOINTS: List[ServoJoint] = [
${servos
  .map(
    (s) => `    ServoJoint(
        id=${s.id},
        name="${s.name}",
        zero_offset_ticks=${s.zeroOffsetTicks},
        invert_dir=${s.invertDirection ? "True" : "False"},
        min_angle=${s.minAngleDeg},
        max_angle=${s.maxAngleDeg},
        kp=${s.kp},
        ki=${s.ki},
        kd=${s.kd},
        max_speed_dps=${s.maxSpeedDegS},
        torque_limit_pct=${s.torqueLimitPercent}
    )`
  )
  .join(",\n")}
]

class ServoController:
    def __init__(self, port="/dev/ttyUSB0", baudrate=1000000):
        self.port = port
        self.baudrate = baudrate
        self.joints = {j.id: j for j in JOINTS}
        print(f"[*] Initialized Servo Controller on {port} @ {baudrate} bps")

    def angle_to_ticks(self, joint_id: int, angle_deg: float) -> int:
        joint = self.joints[joint_id]
        clamped = max(joint.min_angle, min(joint.max_angle, angle_deg))
        effective = -clamped if joint.invert_dir else clamped
        ticks = int(joint.zero_offset_ticks + (effective / 360.0) * 4096.0) % 4096
        return ticks

    def ticks_to_angle(self, joint_id: int, raw_ticks: int) -> float:
        joint = self.joints[joint_id]
        delta = raw_ticks - joint.zero_offset_ticks
        if delta > 2048:
            delta -= 4096
        elif delta < -2048:
            delta += 4096
        deg = (delta / 4096.0) * 360.0
        return -deg if joint.invert_dir else deg

    def send_pose(self, target_angles: Dict[int, float], speed_dps: int = 150):
        print(f"[CMD] Dispatching Synchronous Pose Command:")
        for jid, angle in target_angles.items():
            ticks = self.angle_to_ticks(jid, angle)
            print(f"  -> Joint {jid} ({self.joints[jid].name}): Target={angle:+.1f} deg -> Raw Ticks={ticks}")

if __name__ == "__main__":
    controller = ServoController()
    # Test Homed Zero Pose
    controller.send_pose({1: 0.0, 2: 0.0, 3: 0.0, 4: 0.0, 5: 0.0, 6: 0.0})
`;
}
