import React, { useState } from "react";
import {
  Cpu,
  Zap,
  Code,
  Download,
  Copy,
  Check,
  Sparkles,
  Terminal,
  ShieldAlert,
  Layers,
  ArrowRight,
  Info,
  Radio,
  CheckCircle,
  ExternalLink,
  BookOpen,
  Activity,
} from "lucide-react";
import {
  CONTROLLER_PLATFORMS,
  CONTROLLER_TEMPLATES,
} from "../../data/microcontrollerData";
import { ControllerPlatformType } from "../../types";
import { AIControllerGenModal } from "./AIControllerGenModal";

export const MicrocontrollerHub: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<ControllerPlatformType>("arduino");
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [isAiGenModalOpen, setIsAiGenModalOpen] = useState<boolean>(false);

  const currentPlatformInfo = CONTROLLER_PLATFORMS.find((p) => p.id === selectedPlatform)!;
  const currentTemplates = CONTROLLER_TEMPLATES.filter((t) => t.platform === selectedPlatform);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleDownloadCode = (template: typeof CONTROLLER_TEMPLATES[0]) => {
    const blob = new Blob([template.code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = template.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div id="microcontroller-hub-root" className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Cpu className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
                OpenArm 主控开发与固件套件
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                三大主控生态全覆盖
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
              专为零基础小白至进阶工程师打造的 Arduino / STM32 / ESP32 机械臂主控支持中心。提供 100% 中文详细注释的 1Mbps 总线舵机驱动、DMA 环形接收、FreeRTOS 多任务调度与局域网 Web 示教器源码。
            </p>
          </div>

          {/* AI Code Generator Button */}
          <button
            onClick={() => setIsAiGenModalOpen(true)}
            className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex-shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI 主控固件代码定制生成器</span>
          </button>
        </div>

        {/* Microcontroller Selection Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
          {[
            {
              id: "arduino" as ControllerPlatformType,
              name: "Arduino 平台",
              desc: "Uno / Mega 2560 / RP2040",
              badge: "新手极简友好",
              badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/20",
              icon: "🌱",
            },
            {
              id: "stm32" as ControllerPlatformType,
              name: "STM32 工业平台",
              desc: "STM32F103 / F407 HAL + DMA + FreeRTOS",
              badge: "工业硬实时首选",
              badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
              icon: "⚙️",
            },
            {
              id: "esp32" as ControllerPlatformType,
              name: "ESP32 物联网平台",
              desc: "ESP32-S3 双核 + WiFi Web 示教器",
              badge: "无线智能王者",
              badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
              icon: "📶",
            },
          ].map((item) => {
            const isSelected = selectedPlatform === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedPlatform(item.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-bold text-slate-100 text-sm">{item.name}</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Platform Detailed Spec & Hardware Evaluation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
              SPEC
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">{currentPlatformInfo.name} 深度剖析</h2>
              <p className="text-xs text-slate-400">适合应用场景: {currentPlatformInfo.idealScenario}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">推荐选用芯片:</span>
            {currentPlatformInfo.recommendedChips.map((chip, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-slate-950 rounded text-xs font-mono text-emerald-300 border border-slate-800">
                {chip.split(" ")[0]}
              </span>
            ))}
          </div>
        </div>

        {/* 4-Column Spec Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] block">主频与核心</span>
            <span className="font-bold text-slate-200 mt-0.5 block">{currentPlatformInfo.coreClock}</span>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] block">存储器配置</span>
            <span className="font-bold text-slate-200 mt-0.5 block">{currentPlatformInfo.memory}</span>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] block">总线串口特性</span>
            <span className="font-bold text-emerald-400 mt-0.5 block truncate" title={currentPlatformInfo.uartFeatures}>
              {currentPlatformInfo.uartFeatures}
            </span>
          </div>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] block">新手上手难度</span>
            <span className="font-bold text-teal-400 mt-0.5 block">{currentPlatformInfo.difficulty}</span>
          </div>
        </div>

        {/* Pros & Cons comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-emerald-950/20 border border-emerald-800/30 p-4 rounded-xl space-y-2">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>核心研发优势 (Why Choose This)</span>
            </span>
            <ul className="space-y-1.5 text-slate-300">
              {currentPlatformInfo.pros.map((p, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-950/20 border border-amber-800/30 p-4 rounded-xl space-y-2">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>潜在注意事项与避坑指南 (Watch Out)</span>
            </span>
            <ul className="space-y-1.5 text-slate-300">
              {currentPlatformInfo.cons.map((c, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Hardware Wiring Circuit Box */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Zap className="w-4 h-4" />
            <span>硬件接线原理与供电隔离规范 (Wiring Standard)</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            {currentPlatformInfo.wiringDiagramDesc}
          </p>
          <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>⚡ 供电防烧提醒：舵机 7.4V/12V 电源正极严禁接入主控 5V/3.3V 引脚！主控与舵机只需连通 GND（共地）即可。</span>
            <span className="text-emerald-400 font-mono font-semibold">TVS 浪涌抑制 + 1000μF 滤波电容</span>
          </div>
        </div>
      </div>

      {/* Firmware Template & Source Code Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Code className="w-5 h-5 text-emerald-400" />
            <span>可直接编译运行的官方驱动固件工程 ({currentTemplates.length} 套)</span>
          </h2>
          <span className="text-xs text-slate-400">已内置 100% 中文详细注释与软限位保护</span>
        </div>

        {currentTemplates.map((tpl) => (
          <div
            key={tpl.id}
            id={`firmware-${tpl.id}`}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4"
          >
            {/* Template Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[11px] font-semibold">
                    {tpl.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    📄 {tpl.fileName}
                  </span>
                  <span className="text-xs text-slate-500">
                    🛠️ 工具链: {tpl.compileToolchain}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100">{tpl.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{tpl.description}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleCopyCode(tpl.id, tpl.code)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedCodeId === tpl.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedCodeId === tpl.id ? "已复制代码" : "复制代码"}</span>
                </button>

                <button
                  onClick={() => handleDownloadCode(tpl)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下载源码</span>
                </button>
              </div>
            </div>

            {/* Pinout Config Table */}
            <div className="px-5">
              <span className="text-xs font-semibold text-slate-300 block mb-2">
                🔌 引脚分配映射表 (Pinout Mapping):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {tpl.pinoutConfig.map((pin, pidx) => (
                  <div key={pidx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                    <span className="text-emerald-400 font-mono font-bold block">{pin.pinName}</span>
                    <span className="text-slate-200 font-semibold text-[11px] block mt-0.5">➡️ {pin.targetHardwarePin}</span>
                    <span className="text-slate-500 text-[10px] block mt-0.5">{pin.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Block with Line Numbers */}
            <div className="px-5">
              <div className="relative bg-slate-950 rounded-xl border border-slate-800/90 overflow-hidden">
                <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    <span className="ml-2 font-mono text-[11px] text-slate-300">{tpl.fileName}</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono">1Mbps SyncWrite 协议驱动</span>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[380px] overflow-y-auto leading-relaxed scrollbar-thin">
                  <code>{tpl.code}</code>
                </pre>
              </div>
            </div>

            {/* Step-by-step Flashing Instructions */}
            <div className="p-5 bg-slate-950/60 border-t border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>固件编译与下载步骤说明:</span>
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 text-[11px]">
                {tpl.flashInstructions.map((ins, iidx) => (
                  <div key={iidx} className="flex items-start gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                    <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                      {iidx + 1}
                    </span>
                    <span>{ins}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Controller Code Generator Modal */}
      <AIControllerGenModal
        isOpen={isAiGenModalOpen}
        onClose={() => setIsAiGenModalOpen(false)}
        defaultPlatform={selectedPlatform}
      />
    </div>
  );
};
