import { UploadedCodeFile, CodeTranslationResult } from "../types";

// Empty preset files list - only user uploaded files will be present
export const PRESET_EMBEDDED_CODE_FILES: UploadedCodeFile[] = [];

/**
 * 本地智能机电代码解析器 (当离线或未配置 API Key 时作为高可用保障)
 */
export function analyzeCodeMechanicallyLocal(code: string, fileName: string): CodeTranslationResult {
  const lines = code.split("\n");
  const params: any[] = [];
  const pinouts: any[] = [];
  const troubleshooting: any[] = [];
  const cheatSheet: string[] = [];

  // 1. Regex Extraction for Mechanical parameters
  const reductionMatch = code.match(/REDUCTION[_\w]*\s+([0-9\.]+)/i);
  if (reductionMatch) {
    params.push({
      paramName: "机械减速比 (Reduction Ratio)",
      varName: "REDUCTION_RATIO",
      currentValue: `1 : ${reductionMatch[1]}`,
      physicalMeaning: `电机转子转动 ${reductionMatch[1]} 圈，机械臂关节仅转动 1 圈。`,
      mechanicalImpact: "减速比放大了电机输出力矩，但降低了末端最大转速。若实际机械结构齿轮齿数变更，必须同步修改此处！",
    });
  }

  const torqueMatch = code.match(/TORQUE[_\w]*\s+([0-9\.]+)/i);
  if (torqueMatch) {
    params.push({
      paramName: "最大力矩保护软限制 (Torque Limit)",
      varName: "TORQUE_MAX_LIMIT_NM",
      currentValue: `${torqueMatch[1]} N·m`,
      physicalMeaning: `电机输出力矩被软件硬锁死在 ${torqueMatch[1]} N·m 以内。`,
      mechanicalImpact: "防止机械臂遇障卡死时拉断 3D 打印薄壁件或使传动带崩齿脱落。",
    });
  }

  const currentMatch = code.match(/CURRENT[_\w]*\s+([0-9\.]+)/i);
  if (currentMatch) {
    params.push({
      paramName: "最大峰值电流限制 (Peak Current)",
      varName: "CURRENT_PEAK_LIMIT",
      currentValue: `${currentMatch[1]} A / mA`,
      physicalMeaning: "驱动器输出到电机线圈的最大相电流限制。",
      mechanicalImpact: "若重载平举时机械臂下垂‘趴窝’，说明此电流设定过小；若电机发烫超 60℃，应适当减小此值。",
    });
  }

  const minAngleMatch = code.match(/MIN[_\w]*ANGLE[_\w]*\s+([-\d\.]+)/i);
  const maxAngleMatch = code.match(/MAX[_\w]*ANGLE[_\w]*\s+([-\d\.]+)/i);
  if (minAngleMatch && maxAngleMatch) {
    params.push({
      paramName: "关节软件安全限位 (Soft Limits)",
      varName: "MIN / MAX ANGLE",
      currentValue: `[ ${minAngleMatch[1]}° ~ ${maxAngleMatch[1]}° ]`,
      physicalMeaning: "机械臂关节允许转动的安全物理角度区间。",
      mechanicalImpact: "必须小于机械本体的物理硬干涉限位（留 3~5° 余量），防止猛冲硬止口导致结构件开裂。",
    });
  }

  const kpMatch = code.match(/kp\s*=\s*([0-9\.]+)/i) || code.match(/Kp\s*=\s*([0-9\.]+)/i);
  if (kpMatch) {
    params.push({
      paramName: "位置刚度系数 Kp (Stiffness)",
      varName: "kp / Kp",
      currentValue: `${kpMatch[1]}`,
      physicalMeaning: "机械臂关节对外力抵抗的‘硬度’（弹簧系数）。",
      mechanicalImpact: "Kp 越大机械臂越硬、到位越准；但过大会引发 100Hz 以上高频金属振动与尖叫发烫！",
    });
  }

  // 2. Pinouts and Bus Extraction
  if (code.includes("FDCAN") || code.includes("CAN")) {
    pinouts.push({
      pinOrBus: "CAN / CAN-FD 高速差分总线",
      signalType: "双绞差分信号 (CAN_H / CAN_L)",
      connectedHardware: "连接到各关节电机驱动板 (如达妙 DM-J8009 / J4340)",
      wiringPrecautions: "两端最远节点必须并联 120Ω 终端电阻（总等效电阻 60Ω），严禁星形大分支拓扑！",
    });
  }

  if (code.includes("Serial1") || code.includes("SMS_STS") || code.includes("UART")) {
    pinouts.push({
      pinOrBus: "TTL 半双工异步串口 (UART)",
      signalType: "单线半双工 TX/RX 信号 (1.0 Mbps)",
      connectedHardware: "连接到灵巧手飞特 STS3215 / SCS0009 舵机群",
      wiringPrecautions: "供电电源 (7.4V/12V) 必须与主控板严格共地 (GND)，否则会出现丢包或舵机乱转！",
    });
  }

  // 3. Troubleshooting Matrix
  troubleshooting.push({
    symptom: "机械臂电机发出尖锐蜂鸣啸叫，几秒内迅速发烫",
    probableCodeLocation: "寻找 PID 参数定义行 (如 Kp > 50 或 Kd 阻尼过小)",
    mechanicalAction: "立刻断电！先检查机械连接是否有松动间隙，再让嵌入式同事把 Kp 下调 30%~50%。",
  });

  troubleshooting.push({
    symptom: "机械手抓握时绳驱腱绳松弛脱出绞盘槽",
    probableCodeLocation: "寻找 初始预紧力 (TENDON_PRELOAD) 或张开零位 (CAPSTAN_PULSE_OPEN)",
    mechanicalAction: "检查机械装配时是否预先张紧腱绳，并在代码中增大张开时的最小保持张力。",
  });

  troubleshooting.push({
    symptom: "机械臂运行到位时发生剧烈顿挫，震动波及整个底座",
    probableCodeLocation: "寻找 S 曲线加减速时间 (ACC_RAMP_MS) 或最大加速度 (ACC)",
    mechanicalAction: "增大加减速平滑过渡时间 (建议 300ms 以上)，平滑启停惯性冲击。",
  });

  // 4. Colleague Cheat Sheet
  cheatSheet.push(
    "“小张，我看了你代码里的软限位配置。根据我们最新的 3D 打印装配图，底座线缆在 ±130° 时会有拉扯，麻烦帮我把软限位从 ±135° 改为 ±125° 留点安全余量。”"
  );
  cheatSheet.push(
    "“小王，我们测试大臂平举时发现带载荷会有轻微下垂，能否在你的驱动里把当前关节的 Kp 从当前值微调上浮 15%，同时把最大电流保护放宽到 2.0A？”"
  );
  cheatSheet.push(
    "“老陈，我确认过我们减速箱的真实减速比是 10:1。请确认你代码里转速和脉冲换算公式已经乘了 10.0，否则实际转角会只有理论值的十分之一。”"
  );

  return {
    physicalActionSummary: `这段代码主要负责【${fileName}】所对应的电机/执行器底层闭环控制与总线通信。它通过将上位机给出的目标角度指令，转化为底层的电机驱动报文（包含位置、速度、力矩与安全限位判定），并实时反馈电机当前的物理温度与相电流，保障机械本体运动平稳且不发生碰撞损坏。`,
    motionBreakdown: [
      "1. 上电初始化：建立总线连接，向电机写入初始力矩保护与零位偏置。",
      "2. 安全校验：实时判断目标角度是否超过机械允许的软限位角度范围。",
      "3. 物理换算：根据机械减速比 (如 1:10) 将机械臂实际转动度数精确换算为电机转子脉冲/弧度。",
      "4. 闭环控制：通过三环 PID 或 MIT 阻抗算法输出相电流，驱动关节平滑到位。",
      "5. 故障保护：一旦检测到相电流超标或堵转超时，立即触发降流脱扣保护，防止拉坏机械件。",
    ],
    keyParameters: params.length > 0 ? params : [
      {
        paramName: "通信波特率 (Baudrate)",
        varName: "BAUDRATE",
        currentValue: "1,000,000 bps (1 Mbps)",
        physicalMeaning: "主控与电机之间每秒传输的数据位数。",
        mechanicalImpact: "决定了总线控制响应频率（建议 100Hz 以上以保障高刚度控制）。",
      },
    ],
    pinoutAndSignals: pinouts.length > 0 ? pinouts : [
      {
        pinOrBus: "MCU 主控通信引脚",
        signalType: "数字总线信号",
        connectedHardware: "机械臂执行器驱动板",
        wiringPrecautions: "确保地线良好连接，信号线避开大电流电机动力线以防电磁干扰。",
      },
    ],
    troubleshootingGuide: troubleshooting,
    colleagueCheatSheet: cheatSheet,
  };
}
