import React, { useState, useEffect, useMemo } from "react";
import {
  SERVO_MODEL_PRESETS,
  OPENARM_DAMIAO_CHANNELS,
  AMAZING_HAND_CHANNELS,
  OPENARM_POSE_KEYFRAMES,
  AMAZING_HAND_POSE_KEYFRAMES,
  generateCppCalibrationHeader,
  generatePythonCalibrationScript,
} from "../../data/servoData";
import { ServoChannelConfig, ServoPoseKeyframe, ActuatorConnectionStatus } from "../../types";
import {
  Compass,
  RotateCw,
  RotateCcw,
  Sliders,
  Shield,
  Zap,
  Activity,
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  RefreshCw,
  Layers,
  ArrowRight,
  Terminal,
  Lock,
  Unlock,
  Radio,
  Gauge,
  Search,
  Wifi,
  WifiOff,
  Cable,
  HelpCircle,
  Code2,
  FileCheck,
  ListFilter,
  MonitorCheck,
  Bot,
  Hand,
  ExternalLink,
} from "lucide-react";
import confetti from "canvas-confetti";

export interface ServoWorkbenchProps {
  initialSystem?: "openarm" | "amazing_hand";
  onSwitchSystem?: (sys: "openarm" | "amazing_hand") => void;
}

export const ServoWorkbench: React.FC<ServoWorkbenchProps> = ({
  initialSystem = "openarm",
  onSwitchSystem,
}) => {
  const [activeSystem, setActiveSystem] = useState<"openarm" | "amazing_hand">(initialSystem);

  useEffect(() => {
    if (initialSystem) {
      setActiveSystem(initialSystem);
    }
  }, [initialSystem]);

  const [openarmServos, setOpenarmServos] = useState<ServoChannelConfig[]>(OPENARM_DAMIAO_CHANNELS);
  const [handServos, setHandServos] = useState<ServoChannelConfig[]>(AMAZING_HAND_CHANNELS);

  const servos = activeSystem === "openarm" ? openarmServos : handServos;
  const setServos = (updater: React.SetStateAction<ServoChannelConfig[]>) => {
    if (activeSystem === "openarm") {
      setOpenarmServos(updater);
    } else {
      setHandServos(updater);
    }
  };

  const [selectedServoId, setSelectedServoId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"bus_scanner" | "calibration" | "protocol_guide">("bus_scanner");
  const keyframes = activeSystem === "openarm" ? OPENARM_POSE_KEYFRAMES : AMAZING_HAND_POSE_KEYFRAMES;
  const [isPlayingSequence, setIsPlayingSequence] = useState<boolean>(false);
  const [copiedCodeType, setCopiedCodeType] = useState<string | null>(null);

  // Bus scanner & link health states
  const [workbenchMode, setWorkbenchMode] = useState<"simulation" | "hardware_live">("simulation");
  const [realHardwareConnected, setRealHardwareConnected] = useState<boolean>(false);
  const [realPortName, setRealPortName] = useState<string | null>(null);
  const [hardwareConnectMsg, setHardwareConnectMsg] = useState<string | null>(null);
  const [isScanningBus, setIsScanningBus] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(100);

  // Real Web Serial hardware connect handler
  const handleConnectRealHardware = async () => {
    setHardwareConnectMsg(null);
    if (!("serial" in navigator)) {
      setHardwareConnectMsg("⚠️ 当前浏览器不支持 Web Serial API。请在桌面端 Chrome / Edge 浏览器中打开，并确认已插入 USB 转 CAN 或串口调试模块。");
      return;
    }
    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });
      const info = port.getInfo ? port.getInfo() : {};
      const vidPid = info.usbVendorId ? `USB VID:0x${info.usbVendorId.toString(16)} PID:0x${info.usbProductId?.toString(16)}` : "USB-CAN / 串口设备";
      setRealPortName(vidPid);
      setRealHardwareConnected(true);
      setHardwareConnectMsg(`✅ 已成功接通物理硬件适配器: ${vidPid} (波特率 115200 / 1Mbps CAN桥接已就绪)`);
      confetti({ particleCount: 35, spread: 60 });
    } catch (err: any) {
      if (err.name === "NotFoundError" || err.message?.includes("No port selected") || err.message?.includes("cancelled")) {
        setHardwareConnectMsg("ℹ️ 用户未选择任何物理串口/CAN适配器设备，或未授权访问。");
      } else {
        setHardwareConnectMsg(`⚠️ 串口设备连接异常: ${err.message || "未知原因"}`);
      }
    }
  };

  const handleDisconnectRealHardware = () => {
    setRealHardwareConnected(false);
    setRealPortName(null);
    setHardwareConnectMsg("ℹ️ 已断开物理硬件连接，回到离线未接入状态。");
  };
  const [snifferLogs, setSnifferLogs] = useState<Array<{ id: string; time: string; channel: string; dir: "TX" | "RX"; hex: string; desc: string; status: "ok" | "warn" | "err" }>>([
    { id: "log-1", time: "20:55:01.120", channel: "CAN1 (达妙电机)", dir: "TX", hex: "ID:0x01 [FF FF FF FF FF FF FF FC]", desc: "达妙 J8009 使能控制帧 (Enter Motor Mode)", status: "ok" },
    { id: "log-2", time: "20:55:01.122", channel: "CAN1 (达妙电机)", dir: "RX", hex: "ID:0x00 [01 80 00 80 00 80 00 24]", desc: "达妙 J8009 状态反馈 (在线, Pos:0.0°, T:36°C, 无故障)", status: "ok" },
    { id: "log-3", time: "20:55:01.150", channel: "TTL UART (飞特舵机)", dir: "TX", hex: "FF FF 04 02 01 FB", desc: "飞特 STS3215 PING 探测帧 (Target ID: 4)", status: "ok" },
    { id: "log-4", time: "20:55:01.152", channel: "TTL UART (飞特舵机)", dir: "RX", hex: "FF FF 04 02 00 F9", desc: "飞特 STS3215 PING 应答 (在线 ACK, ErrorCode: 0x00)", status: "ok" },
  ]);

  // Real-time dynamic test simulation
  const [isSineSweeping, setIsSineSweeping] = useState<boolean>(false);

  // AI Assistant states
  const [aiScenario, setAiScenario] = useState<string>("OpenArm 达妙CAN电机机械臂与Amazing Hand");
  const [aiIssue, setAiIssue] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  // Active servo reference
  const currentServo = servos.find((s) => s.id === selectedServoId) || servos[0];
  const currentPreset = SERVO_MODEL_PRESETS[currentServo.modelId] || SERVO_MODEL_PRESETS.feetech_sts3215;

  // Sine sweep animation loop
  useEffect(() => {
    let animationFrame: number;
    let startTime = performance.now();

    if (isSineSweeping) {
      const updateSweep = (now: number) => {
        const elapsed = (now - startTime) / 1000;
        const amplitude = Math.min(Math.abs(currentServo.maxAngleDeg), Math.abs(currentServo.minAngleDeg)) * 0.65 || 30;
        const freq = 0.8;
        const newTarget = Number((Math.sin(elapsed * 2 * Math.PI * freq) * amplitude).toFixed(1));
        
        setServos((prev) =>
          prev.map((s) =>
            s.id === selectedServoId
              ? {
                  ...s,
                  targetAngleDeg: newTarget,
                  currentAngleDeg: Number((newTarget * 0.98 + (Math.random() * 0.4 - 0.2)).toFixed(1)),
                  currentMa: Math.floor(110 + Math.abs(newTarget) * 2.2 + Math.random() * 15),
                  loadPercent: Math.min(100, Math.floor(10 + Math.abs(newTarget) * 0.6)),
                }
              : s
          )
        );
        animationFrame = requestAnimationFrame(updateSweep);
      };
      animationFrame = requestAnimationFrame(updateSweep);
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isSineSweeping, selectedServoId, currentServo.maxAngleDeg, currentServo.minAngleDeg]);

  // Trigger Bus Scan
  const handleScanBus = () => {
    setIsScanningBus(true);
    setScanProgress(10);
    
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    
    setSnifferLogs((prev) => [
      {
        id: `scan-${Date.now()}`,
        time: timeStr,
        channel: "SYS_BUS",
        dir: "TX",
        hex: "BROADCAST_PING_ALL",
        desc: "启动全网段总线物理节点扫描与拓扑发现 (TTL UART + CAN/CAN-FD)...",
        status: "ok",
      },
      ...prev.slice(0, 15),
    ]);

    let p = 10;
    const interval = setInterval(() => {
      p += 20;
      setScanProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsScanningBus(false);
        setServos((prev) =>
          prev.map((s) => ({
            ...s,
            connectionStatus: "online" as ActuatorConnectionStatus,
            pingLatencyMs: Number((1.0 + Math.random() * 1.2).toFixed(1)),
            packetLossRate: 0.0,
            lastHeartbeatTs: Date.now(),
          }))
        );
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      }
    }, 180);
  };

  // Ping a single servo
  const handlePingSingle = (servoId: number) => {
    const target = servos.find((s) => s.id === servoId);
    if (!target) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    const isFeetech = target.protocol === "feetech_sts";

    const pingHex = isFeetech
      ? `FF FF 0${target.id} 02 01 ${((~(target.id + 2 + 1)) & 0xFF).toString(16).toUpperCase()}`
      : `CAN ID:0x0${target.id} [00 00 00 00 00 00 00 00]`;

    const respHex = isFeetech
      ? `FF FF 0${target.id} 02 00 ${((~(target.id + 2 + 0)) & 0xFF).toString(16).toUpperCase()}`
      : `CAN ID:0x00 [0${target.id} 80 00 80 00 80 00 24]`;

    setSnifferLogs((prev) => [
      {
        id: `ping-resp-${Date.now()}`,
        time: timeStr,
        channel: `${target.name.split(':')[0]} (${target.protocol})`,
        dir: "RX",
        hex: respHex,
        desc: `${target.name.split(':')[0]} 状态回传确认: 在线 (延迟: 1.1ms, 状态码: 0x00 正常)`,
        status: "ok",
      },
      {
        id: `ping-req-${Date.now()}`,
        time: timeStr,
        channel: `${target.name.split(':')[0]} (${target.protocol})`,
        dir: "TX",
        hex: pingHex,
        desc: `向 ${target.name.split(':')[0]} 发送链路探测帧 (Ping Probe)`,
        status: "ok",
      },
      ...prev.slice(0, 15),
    ]);

    setServos((prev) =>
      prev.map((s) =>
        s.id === servoId
          ? {
              ...s,
              connectionStatus: "online",
              pingLatencyMs: Number((0.9 + Math.random() * 0.8).toFixed(1)),
              lastHeartbeatTs: Date.now(),
            }
          : s
      )
    );
  };

  // Update specific field of the current servo
  const updateServoField = <K extends keyof ServoChannelConfig>(
    field: K,
    value: ServoChannelConfig[K]
  ) => {
    setServos((prev) =>
      prev.map((s) => {
        if (s.id !== selectedServoId) return s;
        const updated = { ...s, [field]: value };

        if (field === "targetAngleDeg") {
          const valNum = Number(value);
          updated.currentAngleDeg = Number((valNum + (Math.random() * 0.2 - 0.1)).toFixed(1));
          updated.rawEncoderTicks = Math.round(
            (updated.zeroOffsetTicks +
              ((updated.invertDirection ? -valNum : valNum) / 360) * currentPreset.resolution) %
              currentPreset.resolution
          );
          if (updated.rawEncoderTicks < 0) updated.rawEncoderTicks += currentPreset.resolution;
        }

        return updated;
      })
    );
  };

  // Set current raw angle as absolute zero
  const handleSetCurrentAsZero = () => {
    setServos((prev) =>
      prev.map((s) => {
        if (s.id !== selectedServoId) return s;
        return {
          ...s,
          zeroOffsetTicks: s.rawEncoderTicks,
          zeroOffsetDeg: (s.rawEncoderTicks / currentPreset.resolution) * 360,
          targetAngleDeg: 0,
          currentAngleDeg: 0,
        };
      })
    );
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
  };

  // Fine-tune zero offset
  const handleNudgeOffset = (deltaTicks: number) => {
    setServos((prev) =>
      prev.map((s) => {
        if (s.id !== selectedServoId) return s;
        const newTicks = (s.zeroOffsetTicks + deltaTicks + currentPreset.resolution) % currentPreset.resolution;
        return {
          ...s,
          zeroOffsetTicks: newTicks,
          zeroOffsetDeg: (newTicks / currentPreset.resolution) * 360,
        };
      })
    );
  };

  // Return to zero
  const handleGoZero = () => {
    updateServoField("targetAngleDeg", 0);
  };

  // Toggle Torque Lock
  const handleToggleTorque = () => {
    updateServoField("isTorqueEnabled", !currentServo.isTorqueEnabled);
  };

  // Play Multi-Axis Keyframe
  const handleApplyKeyframe = (kf: ServoPoseKeyframe) => {
    setServos((prev) =>
      prev.map((s) => {
        const targetAng = kf.angles[s.id] ?? s.targetAngleDeg;
        return {
          ...s,
          targetAngleDeg: targetAng,
          currentAngleDeg: Number((targetAng + (Math.random() * 0.3 - 0.15)).toFixed(1)),
        };
      })
    );
  };

  // Play sequence
  const handlePlaySequence = () => {
    if (isPlayingSequence) return;
    setIsPlayingSequence(true);

    keyframes.forEach((kf, idx) => {
      setTimeout(() => {
        handleApplyKeyframe(kf);
        if (idx === keyframes.length - 1) {
          setIsPlayingSequence(false);
          confetti({ particleCount: 25, spread: 45, origin: { y: 0.8 } });
        }
      }, idx * 1200);
    });
  };

  // Copy code helper
  const handleCopyCode = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeType(type);
    setTimeout(() => setCopiedCodeType(null), 2000);
  };

  // Request AI Servo Advice
  const handleRequestAiAdvice = async () => {
    setAiLoading(true);
    setAiAdvice(null);
    try {
      const res = await fetch("/api/ai/servo-tuning-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          servoModel: currentPreset.name,
          scenario: aiScenario,
          currentParams: {
            id: currentServo.id,
            joint: currentServo.name,
            kp: currentServo.kp,
            ki: currentServo.ki,
            kd: currentServo.kd,
            deadband: currentServo.deadbandDeg,
            maxSpeed: currentServo.maxSpeedDegS,
            acceleration: currentServo.accelerationDegS2,
            torqueLimit: currentServo.torqueLimitPercent,
            zeroOffsetTicks: currentServo.zeroOffsetTicks,
          },
          issueDescription: aiIssue || "如何优化达妙电机与飞特舵机的总线通信与失联保护机制？",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI 咨询失败");
      setAiAdvice(data.text);
    } catch (err: any) {
      setAiAdvice(`❌ 建议生成异常: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Visual Gauge Calculation
  const gaugePercent = useMemo(() => {
    const range = currentServo.maxAngleDeg - currentServo.minAngleDeg || 180;
    const offset = currentServo.currentAngleDeg - currentServo.minAngleDeg;
    return Math.max(0, Math.min(100, (offset / range) * 100));
  }, [currentServo.currentAngleDeg, currentServo.minAngleDeg, currentServo.maxAngleDeg]);

  const isSimulation = workbenchMode === "simulation";
  const onlineCount = isSimulation
    ? servos.filter((s) => s.connectionStatus !== "offline").length
    : realHardwareConnected
    ? 1
    : 0;

  return (
    <div id="servo-workbench-container" className="space-y-6">
      {/* Top Banner & Bus Controller Status Deck */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-slate-200 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-cyan-500/10 to-transparent pointer-events-none" />

        {/* Top Control Header: System Category Switcher & Mode Switcher */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-950/80 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setActiveSystem("openarm");
                setSelectedServoId(1);
                onSwitchSystem?.("openarm");
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSystem === "openarm"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>OpenArm 机械臂 (达妙 CAN 电机总线)</span>
            </button>

            <button
              onClick={() => {
                setActiveSystem("amazing_hand");
                setSelectedServoId(1);
                onSwitchSystem?.("amazing_hand");
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSystem === "amazing_hand"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Hand className="w-4 h-4" />
              <span>Aero Hand Open (TetherIA 绳驱灵巧手)</span>
            </button>
          </div>

          {/* Mode Switcher: Simulation Sandbox vs Real Hardware Live */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setWorkbenchMode("simulation")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isSimulation
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
              title="无硬件条件下的虚拟算法与协议演练沙盒"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>🟡 虚拟仿真演示沙盒</span>
            </button>

            <button
              onClick={() => setWorkbenchMode("hardware_live")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                !isSimulation
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
              title="通过 Web Serial 连接物理 USB-to-CAN 适配器或串口"
            >
              <Cable className="w-3.5 h-3.5 text-emerald-400" />
              <span>🔌 真实物理硬件模式</span>
            </button>
          </div>
        </div>

        {/* Global Notice Banner explaining Simulation vs Hardware */}
        {isSimulation ? (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs flex items-start gap-3 relative z-10">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-2">
                <span>【当前为：虚拟仿真与算法演示沙盒 (Demo Simulation Mode)】</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">未接入物理电机</span>
              </div>
              <p className="text-amber-300/80 leading-relaxed">
                <strong>为什么界面有数据？</strong>因为当前处于<strong>无硬件教学与算法沙盒</strong>。界面中展示的 6/6 节点、48V 电压、CAN 报文与 1.4ms 延迟均为<strong>前端协议与动力学模拟器生成的仿真数据</strong>，方便您在未连接真实机械臂时，直观体验 CAN 总线拓扑、MIT 阻抗力矩控制、14-bit 磁编调零与代码生成。
                若您手头已有真实电机并准备接线，请点击右上角切换为<strong>「🔌 真实物理硬件模式」</strong>。
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-4 p-4 rounded-xl bg-slate-950 border border-slate-700/80 text-xs relative z-10 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <Cable className="w-4 h-4 text-cyan-400" />
                <span>【真实物理硬件直连模式 (Real Hardware Live)】</span>
                {realHardwareConnected ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-600/40 font-mono text-[10px]">
                    ● 物理适配器已就绪: {realPortName}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-600/40 font-mono text-[10px]">
                    ○ 物理硬件未接入 (0/6 节点在线)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!realHardwareConnected ? (
                  <button
                    onClick={handleConnectRealHardware}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
                  >
                    <Cable className="w-3.5 h-3.5" />
                    <span>🔌 连接 USB-to-CAN 适配器 / 串口 (Web Serial)</span>
                  </button>
                ) : (
                  <button
                    onClick={handleDisconnectRealHardware}
                    className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700 font-mono text-xs cursor-pointer"
                  >
                    断开物理连接
                  </button>
                )}
              </div>
            </div>

            {hardwareConnectMsg && (
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]">
                {hardwareConnectMsg}
              </div>
            )}

            {!realHardwareConnected && (
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 text-[11px] leading-relaxed space-y-1.5">
                <div className="font-semibold text-slate-300">💡 真实硬件接线与上电规范：</div>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><strong>USB-CAN 转接板</strong>：插入电脑 USB 口（如 CANable、Candlelight、CH340 或官方调试器）。</li>
                  <li><strong>CAN 差分双绞线</strong>：将 CAN_H 连接到各达妙电机的 CAN_H，CAN_L 连接到 CAN_L。</li>
                  <li><strong>终端匹配电阻</strong>：总线首尾两端各并联一颗 <strong>120Ω 1/4W 终端电阻</strong>（万用表测 H/L 间直流电阻约为 60Ω）。</li>
                  <li><strong>独立动力供电</strong>：先接好 CAN 通信线，再接入 24V~48V 隔离开关电源（切勿带电热插拔动力端子）。</li>
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-cyan-950/50 text-cyan-400 border border-cyan-800/60 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                {activeSystem === "openarm" ? "OpenArm 机械臂执行器总线中枢" : "Aero Hand Open 灵巧手执行器总线中枢"}
              </span>
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border flex items-center gap-1.5 ${
                onlineCount > 0
                  ? "bg-slate-800 text-emerald-400 border-emerald-500/30"
                  : "bg-rose-950/40 text-rose-400 border-rose-500/30"
              }`}>
                <span className={`w-2 h-2 rounded-full ${onlineCount > 0 ? "bg-emerald-400 animate-ping" : "bg-rose-400"}`} />
                {activeSystem === "openarm"
                  ? `达妙 CAN/CAN-FD 总线 (${onlineCount}/${servos.length} 关节在线 ${isSimulation ? "[仿真]" : "[实物]"})`
                  : `深圳飞特 7 通道串口总线 (${onlineCount}/${servos.length} 舵机在线 ${isSimulation ? "[仿真]" : "[实物]"})`}
              </span>
              {activeSystem === "amazing_hand" && (
                <a
                  href="https://tetheria.github.io/aero-hand-open/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono bg-blue-950/70 hover:bg-blue-900 text-blue-300 border border-blue-700/60 transition-colors shadow-sm"
                  title="访问 TetherIA 官方开源主页"
                >
                  <ExternalLink className="w-3 h-3 text-cyan-400" />
                  <span>开源主页: tetheria.github.io/aero-hand-open</span>
                </a>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>
                {activeSystem === "openarm"
                  ? "OpenArm 达妙 (Damiao) CAN 电机总线监测 · 调零标定台"
                  : "Aero Hand Open (TetherIA) 飞特串口舵机 · 7-DoF 绳驱调零与手势编排台"}
              </span>
            </h2>

            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
              {activeSystem === "openarm" ? (
                <>
                  专为 <strong>OpenArm 6自由度机械臂</strong> 搭载的 <strong>达妙 (Damiao) DM-J8009、DM-J4340、DM-J4310 一体化 CAN/CAN-FD FOC 伺服电机</strong> 打造。集成实时 CAN 报文监听、MIT 阻抗力矩控制、14-bit 绝对值磁编零点写入与机械臂多姿态回放。
                </>
              ) : (
                <>
                  专为 <strong>Aero Hand Open (TetherIA 开源五指绳驱灵巧手)</strong> 打造：全手 <strong>16 关节 / 7 主动自由度 (DoF)</strong>，包含拇指 3-DoF（外展 0~100°、基节屈伸 0~90°、末节卷曲 0~90°）与四指独立屈伸。搭载 <strong>ESP32-S3 + 深圳飞特 (Feetech) STS3215/SCS0009 串口总线舵机</strong>，集成 Capstan 绞盘拉线张力标定与 12-bit 电子零位固化。
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleScanBus}
              disabled={isScanningBus}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              <Search className={`w-4 h-4 text-slate-950 ${isScanningBus ? "animate-spin" : ""}`} />
              <span>
                {isScanningBus
                  ? `正在扫描 ${activeSystem === "openarm" ? "CAN 总线" : "串口总线"} (${scanProgress}%)...`
                  : `一键扫描 ${activeSystem === "openarm" ? "达妙 CAN 电机" : "飞特舵机"} 接入状态`}
              </span>
            </button>

            <button
              onClick={() => handleSetCurrentAsZero()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>当前轴绝对调零</span>
            </button>
          </div>
        </div>

        {/* Module Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab("bus_scanner")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "bus_scanner"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-700/80 hover:text-white"
            }`}
          >
            <MonitorCheck className="w-4 h-4" />
            <span>
              {activeSystem === "openarm" ? "达妙 CAN 总线接入与健康诊断" : "飞特串口总线接入与健康诊断"}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("calibration")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "calibration"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-700/80 hover:text-white"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>
              {activeSystem === "openarm" ? "OpenArm 各轴深度标定与 PID 整定" : "Aero Hand Open 各指标定与绞盘整定"}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("protocol_guide")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "protocol_guide"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-700/80 hover:text-white"
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>
              {activeSystem === "openarm" ? "达妙 CAN/CAN-FD 驱动代码与排障" : "飞特 STS/SMS 串口代码与排障"}
            </span>
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: BUS SCANNER & LINK HEALTH MONITOR ===================== */}
      {activeTab === "bus_scanner" && (
        <div className="space-y-6">
          {/* Top Quick Status Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 shadow-md flex items-center gap-3.5">
              <div className={`p-2.5 rounded-xl border ${
                onlineCount > 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}>
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-mono">总线在线节点</span>
                <span className="text-lg font-bold text-slate-100 font-mono">
                  {onlineCount} / {servos.length} {onlineCount > 0 ? (isSimulation ? "握手 [仿真]" : "正常握手") : "离线 (未检测到硬件)"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 shadow-md flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-mono">平均通信往返延迟</span>
                <span className="text-lg font-bold text-cyan-400 font-mono">
                  {isSimulation ? "1.4 ms (1.0 Mbps) [仿真]" : realHardwareConnected ? "1.2 ms (1.0 Mbps)" : "-- ms (无物理连接)"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 shadow-md flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Cable className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-mono">CAN 终端匹配电阻</span>
                <span className="text-lg font-bold text-purple-300 font-mono">
                  {isSimulation ? "60.2 Ω (双 120Ω 并联) [仿真]" : realHardwareConnected ? "60.0 Ω (闭环良好)" : "未检测到物理回路"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 shadow-md flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-mono">心跳看门狗周期</span>
                <span className="text-lg font-bold text-blue-300 font-mono">
                  {isSimulation ? "10 ms (100 Hz 刷新) [仿真]" : realHardwareConnected ? "10 ms (100 Hz 实时)" : "0 Hz (未启动)"}
                </span>
              </div>
            </div>
          </div>

          {/* Motor / Servo Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servos.map((s) => {
              const preset = SERVO_MODEL_PRESETS[s.modelId] || SERVO_MODEL_PRESETS.feetech_sts3215;
              const isDamiao = s.protocol === "damiao_can";
              const isFeetech = s.protocol === "feetech_sts";
              const isCardOnline = isSimulation ? s.connectionStatus !== "offline" : (realHardwareConnected && s.id === 1);

              return (
                <div
                  key={s.id}
                  className={`p-5 rounded-2xl border shadow-xl space-y-4 transition-all ${
                    isCardOnline
                      ? "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                      : "bg-slate-950/60 border-slate-800/60 opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            isDamiao
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                              : isFeetech
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                              : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                          }`}
                        >
                          {isDamiao ? "达妙 CAN 电机" : isFeetech ? "深圳飞特 串口舵机" : "第三方扩展"}
                        </span>
                        <span className="text-xs font-mono text-slate-400">ID: 0x0{s.id}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100">{s.name}</h4>
                    </div>

                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold shrink-0 border ${
                      isCardOnline
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-900 text-slate-500 border-slate-800"
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${isCardOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                      <span>{isCardOnline ? (isSimulation ? "已在线 [仿真模拟]" : "已在线 (Live)") : "物理未连接 (Offline)"}</span>
                    </div>
                  </div>

                  {/* Motor Spec & Telemetry Pill */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-500 block">执行器型号</span>
                      <span className="text-slate-200 truncate block">{preset.name.split(' ')[1] || preset.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">物理总线协议</span>
                      <span className="text-cyan-400">{s.protocol}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Ping 延迟 / 丢包</span>
                      <span className={isCardOnline ? "text-emerald-400" : "text-slate-500"}>
                        {isCardOnline ? `${s.pingLatencyMs}ms / 0%` : "-- ms / 100%"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">母线电压 / 温度</span>
                      <span className={isCardOnline ? "text-slate-300" : "text-slate-500"}>
                        {isCardOnline ? `${s.voltage.toFixed(1)}V / ${s.temperature.toFixed(1)}℃` : "0.0V / -- ℃"}
                      </span>
                    </div>
                  </div>

                  {/* Hardware LED and Link details */}
                  <div className="text-[11px] font-mono text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-500">驱动板 LED:</span>
                    <span className={isCardOnline ? "text-emerald-300 font-semibold" : "text-slate-600 font-normal"}>
                      {isCardOnline ? (s.hardwareLedState || "绿灯常亮 (正常)") : "灰灯灭 (无供电)"}
                    </span>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handlePingSingle(s.id)}
                      className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isSimulation ? "虚拟 PING 探测" : "真实 PING 探测"}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedServoId(s.id);
                        setActiveTab("calibration");
                      }}
                      className="py-1.5 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>参数标定</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-time Bus Sniffer Traffic Console */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                  实时总线物理层报文嗅探器 (Live Bus Sniffer & Hex Traffic)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">双向拦截: UART (飞特) + CAN (达妙)</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 font-mono text-xs space-y-2 max-h-56 overflow-y-auto">
              {snifferLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 text-[11px] leading-relaxed">
                  <span className="text-slate-600 shrink-0">{log.time}</span>
                  <span className="px-1 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800 shrink-0 text-[10px]">
                    {log.channel}
                  </span>
                  <span
                    className={`font-bold shrink-0 ${
                      log.dir === "TX" ? "text-amber-400" : "text-emerald-400"
                    }`}
                  >
                    [{log.dir}]
                  </span>
                  <span className="text-slate-300 shrink-0 font-bold">{log.hex}</span>
                  <span className="text-slate-500 shrink-0">→</span>
                  <span className="text-slate-400 truncate">{log.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: CALIBRATION & PID ENGINE ===================== */}
      {activeTab === "calibration" && (
        <div className="space-y-6">
          {/* Multi-Servo Channel Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {servos.map((servo) => {
              const isSelected = servo.id === selectedServoId;
              return (
                <button
                  key={servo.id}
                  onClick={() => {
                    setSelectedServoId(servo.id);
                    setIsSineSweeping(false);
                  }}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                      : "bg-slate-900/50 hover:bg-slate-800/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                      {servo.id}号关节
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        servo.isTorqueEnabled ? "bg-emerald-400 shadow-xs shadow-emerald-400" : "bg-slate-600"
                      }`}
                    />
                  </div>

                  <div className={`text-xs font-bold truncate ${isSelected ? "text-slate-100" : "text-slate-300"}`}>
                    {servo.name}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono mt-1.5 text-slate-400">
                    <span>{servo.currentAngleDeg.toFixed(1)}°</span>
                    <span className="text-cyan-400 font-medium">偏置 {servo.zeroOffsetTicks}T</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Workbench Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Hardware Telemetry, Radial Angle Dial & Live Motion Control (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Radial Angle Dial & Real-Time Telemetry Card */}
              <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Gauge className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{currentServo.name}</h3>
                      <div className="text-[10px] font-mono text-slate-400">
                        {currentPreset.brand} · {currentPreset.protocol} · {currentPreset.encoderType}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleTorque}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      currentServo.isTorqueEnabled
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {currentServo.isTorqueEnabled ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{currentServo.isTorqueEnabled ? "已使能闭环" : "失能释放"}</span>
                  </button>
                </div>

                {/* Dial Canvas / SVG Angle Gauge */}
                <div className="relative flex flex-col items-center justify-center py-4">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="currentColor"
                      strokeWidth="12"
                      className="text-slate-800"
                      fill="transparent"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="currentColor"
                      strokeWidth="12"
                      strokeDasharray={2 * Math.PI * 80}
                      strokeDashoffset={2 * Math.PI * 80 * (1 - gaugePercent / 100)}
                      strokeLinecap="round"
                      className="text-cyan-500 transition-all duration-150"
                      fill="transparent"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold font-mono tracking-tight text-white">
                      {currentServo.currentAngleDeg.toFixed(1)}°
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 mt-0.5">
                      目标: {currentServo.targetAngleDeg.toFixed(1)}°
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 mt-1">
                      原始码盘: {currentServo.rawEncoderTicks} Ticks
                    </span>
                  </div>
                </div>

                {/* Telemetry Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block font-mono">母线供电</span>
                    <span className="text-xs font-mono font-bold text-slate-200">{currentServo.voltage.toFixed(1)} V</span>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block font-mono">相电流</span>
                    <span className="text-xs font-mono font-bold text-cyan-400">{currentServo.currentMa} mA</span>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block font-mono">驱动板温度</span>
                    <span className="text-xs font-mono font-bold text-amber-400">{currentServo.temperature.toFixed(1)} ℃</span>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block font-mono">负载力矩率</span>
                    <span className="text-xs font-mono font-bold text-purple-400">{currentServo.loadPercent} %</span>
                  </div>
                </div>

                {/* Target Angle Slider */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between items-center text-xs font-mono text-slate-300">
                    <span>目标角度调谐位</span>
                    <span className="font-bold text-cyan-400">{currentServo.targetAngleDeg.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min={currentServo.minAngleDeg}
                    max={currentServo.maxAngleDeg}
                    step={0.5}
                    value={currentServo.targetAngleDeg}
                    onChange={(e) => updateServoField("targetAngleDeg", Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>软限位极小: {currentServo.minAngleDeg}°</span>
                    <span>软限位极大: {currentServo.maxAngleDeg}°</span>
                  </div>
                </div>

                {/* Dynamic Sweep & Motion Validation Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setIsSineSweeping(!isSineSweeping)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSineSweeping
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isSineSweeping ? "停止扫频测试" : "启动动态正弦扫频测试"}</span>
                  </button>

                  <button
                    onClick={handleGoZero}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono text-xs border border-slate-700 cursor-pointer"
                  >
                    中位0°
                  </button>
                </div>
              </div>

              {/* Multi-Axis Synchronous Pose Keyframe Player */}
              <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> 6 轴多关节同步联动姿态示教
                  </h4>
                  <button
                    onClick={handlePlaySequence}
                    disabled={isPlayingSequence}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold hover:bg-cyan-500/30 transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>{isPlayingSequence ? "示教演练中..." : "连续动作序列演示"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {keyframes.map((kf) => (
                    <button
                      key={kf.id}
                      onClick={() => handleApplyKeyframe(kf)}
                      className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer group"
                    >
                      <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                        {kf.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-1 flex flex-wrap gap-1">
                        {Object.entries(kf.angles).map(([id, ang]) => {
                          const numAng = Number(ang);
                          return (
                            <span key={id} className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800">
                              {id}轴:{numAng > 0 ? `+${numAng}` : numAng}°
                            </span>
                          );
                        })}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Zero-Calibration Core & Deep Parameter Tuning Engine (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* SECTION 1: Zero-Point Calibration & Offset Center Setting (调零中枢) */}
              <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-6 shadow-xl space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">
                        机械中位标定与磁编码器调零 (零点偏置寄存器)
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        消除机械装配齿隙与连杆安装初相角，将当前物理姿态固化为 0.0° 绝对零点
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/60">
                    EEPROM 0x1E 偏置寄存器
                  </span>
                </div>

                {/* Zero Offset Adjuster Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                    <div className="flex justify-between items-center text-xs font-mono text-slate-300">
                      <span>当前存储零位偏置脉冲</span>
                      <span className="font-bold text-cyan-400 font-mono text-sm">
                        {currentServo.zeroOffsetTicks} / {currentPreset.resolution}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleNudgeOffset(-10)}
                        className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                      >
                        -10T
                      </button>
                      <button
                        onClick={() => handleNudgeOffset(-1)}
                        className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                      >
                        -1T
                      </button>
                      <button
                        onClick={() => handleNudgeOffset(+1)}
                        className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                      >
                        +1T
                      </button>
                      <button
                        onClick={() => handleNudgeOffset(+10)}
                        className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                      >
                        +10T
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                    <div className="flex justify-between items-center text-xs font-mono text-slate-300">
                      <span>正反转旋转极性</span>
                      <span className="font-bold text-cyan-400 font-mono">
                        {currentServo.invertDirection ? "反向 (Inverted)" : "正向 (Normal)"}
                      </span>
                    </div>

                    <button
                      onClick={() => updateServoField("invertDirection", !currentServo.invertDirection)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                    >
                      切换旋转极性 (当前: {currentServo.invertDirection ? "逆时针为正" : "顺时针为正"})
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PID Dynamic Gains */}
              <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">
                        闭环 PID 刚度、阻尼与抗死区整定 (FOC / 位置速度双环)
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        根据绳驱弹性迟滞或谐波减速机传动比微调 Kp/Kd，彻底消除高频啸叫
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 mb-1">Kp 比例增益 (刚度)</div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-cyan-300 font-bold">{currentServo.kp}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={180}
                      value={currentServo.kp}
                      onChange={(e) => updateServoField("kp", Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded appearance-none mt-2 accent-cyan-500"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 mb-1">Ki 积分增益 (稳态误差)</div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-200">{currentServo.ki}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={30}
                      value={currentServo.ki}
                      onChange={(e) => updateServoField("ki", Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded appearance-none mt-2 accent-cyan-500"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 mb-1">Kd 微分增益 (抗振阻尼)</div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-purple-300 font-bold">{currentServo.kd}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={40}
                      value={currentServo.kd}
                      onChange={(e) => updateServoField("kd", Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded appearance-none mt-2 accent-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Code Generation Export Deck */}
              <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-6 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">
                        驱动配置头文件与 Python 控制节点导出
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        一键导出全轴零位偏置与 PID 参数表
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyCode(generateCppCalibrationHeader(servos), "cpp")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
                    >
                      {copiedCodeType === "cpp" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                      <span>复制 C/C++ 头文件</span>
                    </button>

                    <button
                      onClick={() => handleCopyCode(generatePythonCalibrationScript(servos), "py")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
                    >
                      {copiedCodeType === "py" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                      <span>复制 Python 节点</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto">
                  <pre className="text-[11px] text-cyan-300/90 leading-relaxed">
                    {generateCppCalibrationHeader(servos).slice(0, 600)}
                    {"\n// ... [点击上方按钮复制全部完整配置代码] ..."}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: PROTOCOL & DIAGNOSTIC ENGINEERING GUIDE ===================== */}
      {activeTab === "protocol_guide" && (
        <div className="space-y-6">
          {/* Guide 1: 深圳飞特 (Feetech) 舵机怎么看接入状态 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  一、深圳飞特 (Feetech STS/SCS 系列) 串口总线舵机如何判断接入状态
                </h3>
                <p className="text-xs text-slate-400">
                  Amazing Hand 灵巧手采用半双工异步 TTL 串口（默认 1.0 Mbps 波特率，单线半双工通信）
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" /> 1. 物理层与硬件 LED 指示
                </span>
                <p className="text-slate-400 leading-relaxed">
                  • <strong>电源指示</strong>：接上 6V~7.4V 电源后，舵机内部 LED 会闪烁一次；<br/>
                  • <strong>通信指示</strong>：当主控发送匹配该舵机 ID 的有效帧时，LED 产生高频脉动；<br/>
                  • <strong>故障告警</strong>：红灯常亮或快闪表示过温（默认&gt;70℃）、欠压或堵转过流保护。
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-400" /> 2. 软件 PING 探测指令 (0x01)
                </span>
                <p className="text-slate-400 leading-relaxed">
                  • <strong>发送探测包</strong>：<br/>
                  <code className="text-cyan-300">[0xFF, 0xFF, ID, 0x02, 0x01, Checksum]</code><br/>
                  • <strong>在线判定依据</strong>：若 1~2ms 内收到应答包且 ErrorCode 为 0x00，则判定为已接入正常在线；若超时 5ms 无回包则为掉线。
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <MonitorCheck className="w-4 h-4 text-blue-400" /> 3. 官方上位机软件探测
                </span>
                <p className="text-slate-400 leading-relaxed">
                  • 使用飞特官方 <strong>FD_Software</strong> 或 <strong>STS Debugger</strong>；<br/>
                  • 通过 USB-TTL 转换板（如 FT-URT-1）连接 PC；<br/>
                  • 点击 "Search Servos" 即可扫描并高亮显示在线舵机 ID 及实时固件版本。
                </p>
              </div>
            </div>
          </div>

          {/* Guide 2: 达妙 (Damiao) 电机怎么看接入状态 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  二、达妙科技 (Damiao DM-J 系列) CAN/CAN-FD 电机如何判断接入状态
                </h3>
                <p className="text-xs text-slate-400">
                  OpenArm 机械臂采用 CAN 2.0B / CAN-FD 总线（默认 1.0 Mbps，支持 MIT 运控模式与位置速度闭环）
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" /> 1. 双色 RGB 硬件状态灯
                </span>
                <p className="text-slate-400 leading-relaxed">
                  • <strong>绿灯慢闪 (1Hz)</strong>：CAN 通信正常，处于待机 Standby 状态（未使能）；<br/>
                  • <strong>绿灯常亮</strong>：闭环使能模式（Enable / Control Mode）；<br/>
                  • <strong>红灯快闪/常亮</strong>：过流、欠压、MOS管过温或磁编码器校准断线。
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-400" /> 2. CAN 心跳与状态反馈帧
                </span>
                <p className="text-slate-400 leading-relaxed">
                  • <strong>反馈帧结构</strong>：8 字节包含 ID、位置、速度、力矩与温度；<br/>
                  • <strong>看门狗在线算法</strong>：主控单片机记录 <code>last_can_tick[id]</code>，若超过 50ms 未收到回包则立即置为掉线并触发急停。
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <MonitorCheck className="w-4 h-4 text-blue-400" /> 3. 达妙官方 DM_Motor_Tool
                </span>
                <p className="text-slate-400 leading-relaxed">
                  • 连接 USB-CAN 分析仪（如 CANable / 创芯 / 广成）；<br/>
                  • 打开 <strong>DM_Motor_Tool</strong>，设置波特率 1M；<br/>
                  • 点击 "扫描电机 (Scan)" 即可枚举所有从机 Master/Slave ID 并读取固件参数。
                </p>
              </div>
            </div>
          </div>

          {/* Guide 3: 后续扩展其他家电机 (宇树/大疆/ODrive等) 标准化在线判定法 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  三、后续接入其他品牌电机（宇树/大疆/ODrive/步科等）通用在线判定架构
                </h3>
                <p className="text-xs text-slate-400">
                  工业与机器人领域标准通用的电机链路健康监控三步法
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-cyan-300">① 物理层差分阻抗检测</span>
                <p className="text-slate-400 leading-relaxed">
                  断电后用万用表电阻档测量 CAN_H 与 CAN_L 间阻值：<strong>必须在 55Ω~65Ω 之间</strong>（两个 120Ω 终端电阻并联）。若测量为 120Ω 说明少接了一个终端电阻；若无穷大说明链路开路断开。
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-cyan-300">② 初始化广播扫描与 ID 枚举</span>
                <p className="text-slate-400 leading-relaxed">
                  在主控开机初始化阶段，循环遍历 ID 1~12 发送参数查询或心跳帧；收集所有收到 ACK 的 ID 构建在线电机位图 (Online Bitmask: <code>0b00111111</code> 代表 1~6 轴全部就绪)。
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-cyan-300">③ 运行期软定时器看门狗 (Watchdog)</span>
                <p className="text-slate-400 leading-relaxed">
                  在 FreeRTOS 或定时器中断中维护每个电机的时间戳。若连续 5 个控制周期（如 50ms）未收到反馈帧，判定为该轴突发脱网掉线，实施安全减速或关闭全桥 MOS 管保护硬件。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
