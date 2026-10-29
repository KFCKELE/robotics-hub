import React, { useState } from "react";
import { X, Sparkles, Cpu, Download, Copy, Check, AlertTriangle, Code, Terminal } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AIControllerGenModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlatform?: "arduino" | "stm32" | "esp32";
}

export const AIControllerGenModal: React.FC<AIControllerGenModalProps> = ({
  isOpen,
  onClose,
  defaultPlatform = "arduino",
}) => {
  const [platform, setPlatform] = useState<"arduino" | "stm32" | "esp32">(defaultPlatform);
  const [chipModel, setChipModel] = useState<string>("Arduino Mega 2560");
  const [servoModel, setServoModel] = useState<string>("飞特 STS3215 磁编码器总线舵机 (12-bit)");
  const [baudRate, setBaudRate] = useState<number>(1000000);
  const [jointCount, setJointCount] = useState<number>(6);
  const [controlMode, setControlMode] = useState<string>("SyncWrite 同步写入 + 串口回读角度与电流");
  const [specialRequirements, setSpecialRequirements] = useState<string>(
    "包含机械软限位保护、S曲线平滑加减速、堵转过流急停，附带 100% 中文详细接线与编译注释"
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePlatformChange = (p: "arduino" | "stm32" | "esp32") => {
    setPlatform(p);
    if (p === "arduino") setChipModel("Arduino Mega 2560");
    else if (p === "stm32") setChipModel("STM32F407VGT6 (HAL + FreeRTOS)");
    else if (p === "esp32") setChipModel("ESP32-S3 双核 240MHz (WiFi AP + Web 示教器)");
  };

  const handleGenerateCode = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch("/api/ai/controller-code-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          chipModel,
          servoModel,
          baudRate,
          jointCount,
          controlMode,
          pinConfig: {
            platform,
            chip: chipModel,
          },
          specialRequirements,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setGeneratedCode(data.text);
    } catch (err: any) {
      console.error("Code generation error:", err);
      setErrorMsg(err.message || "固件代码生成失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    if (!generatedCode) return;
    const ext = platform === "stm32" ? "c" : "ino";
    const filename = `OpenArm_${platform.toUpperCase()}_Firmware_${Date.now()}.${ext}`;
    const blob = new Blob([generatedCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                AI 主控固件与驱动代码定制生成器
              </h3>
              <p className="text-xs text-slate-400">
                为 Arduino / STM32 / ESP32 自动生成完整、可直接编译运行的 6 轴总线舵机控制工程
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
          {/* Platform Switcher Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              1. 选择目标硬件微控制器平台：
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "arduino", name: "Arduino 平台", sub: "Uno / Mega 2560 / Due" },
                { id: "stm32", name: "STM32 工业平台", sub: "F103 / F401 / F407 HAL+FreeRTOS" },
                { id: "esp32", name: "ESP32 物联网平台", sub: "ESP32-S3 双核 + WiFi Web示教" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePlatformChange(item.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    platform === item.id
                      ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-md shadow-emerald-500/10"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <span className="font-bold text-xs block text-slate-200">{item.name}</span>
                  <span className="text-[11px] text-slate-400">{item.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Config Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">具体主控型号</label>
              <input
                type="text"
                value={chipModel}
                onChange={(e) => setChipModel(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">总线舵机型号与协议</label>
              <input
                type="text"
                value={servoModel}
                onChange={(e) => setServoModel(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">串口波特率 (bps)</label>
              <select
                value={baudRate}
                onChange={(e) => setBaudRate(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-100 text-xs"
              >
                <option value={1000000}>1,000,000 bps (1Mbps 推荐)</option>
                <option value={500000}>500,000 bps</option>
                <option value={115200}>115,200 bps (低速稳定)</option>
              </select>
            </div>
          </div>

          {/* Special Requirements */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              💡 定制功能与特殊控制逻辑诉求：
            </label>
            <textarea
              rows={2}
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              placeholder="例如：需要支持 6 轴逆运动学求解、加入物理按键急停中断、以及通过串口 JSON 上报实时角度与母线电流..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Trigger Generate Button */}
          {!generatedCode && (
            <div className="flex justify-end">
              <button
                onClick={handleGenerateCode}
                disabled={isLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-medium text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>嵌入式固件架构师正在编写与注释代码...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>一键生成 100% 中文注释固件代码</span>
                  </>
                )}
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Generated Code Display */}
          {generatedCode && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <Code className="w-4 h-4" />
                  <span>已生成针对 {chipModel} 的完整工程固件代码</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "已复制到剪贴板" : "复制代码"}</span>
                  </button>
                  <button
                    onClick={handleDownloadFile}
                    className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下载源码文件</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs leading-relaxed text-slate-200 max-h-[450px] overflow-y-auto font-mono">
                <ReactMarkdown>{generatedCode}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>适配 Arduino IDE 2.0+ / STM32CubeIDE / Keil MDK / PlatformIO</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            关闭窗口
          </button>
        </div>
      </div>
    </div>
  );
};
