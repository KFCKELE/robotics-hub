import React, { useState } from "react";
import {
  Code2,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Play,
  RotateCcw,
  Sliders,
  Check,
  Copy,
  FileCode,
  Terminal,
  Send,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { EMBEDDED_CODE_TEMPLATES } from "../../data/embeddedCodeData";
import { EmbeddedCodeTemplate, EmbeddedCodeHotspot } from "../../types";

export const EmbeddedCodeInspector: React.FC = () => {
  const [selectedFileId, setSelectedFileId] = useState<string>(EMBEDDED_CODE_TEMPLATES[0].id);
  const [selectedHotspot, setSelectedHotspot] = useState<EmbeddedCodeHotspot | null>(
    EMBEDDED_CODE_TEMPLATES[0].hotspots[0] || null
  );
  const [copied, setCopied] = useState<boolean>(false);

  // AI Q&A State
  const [aiQuestion, setAiQuestion] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiAnswer, setAiAnswer] = useState<string>("");

  // Interactive Parameter Sandbox State
  const [sandboxKp, setSandboxKp] = useState<number>(32);
  const [sandboxKd, setSandboxKd] = useState<number>(3.5);
  const [sandboxDeadband, setSandboxDeadband] = useState<number>(0.2);
  const [sandboxStallTimeout, setSandboxStallTimeout] = useState<number>(650);

  const currentFile = EMBEDDED_CODE_TEMPLATES.find((f) => f.id === selectedFileId) || EMBEDDED_CODE_TEMPLATES[0];

  const handleSelectFile = (file: EmbeddedCodeTemplate) => {
    setSelectedFileId(file.id);
    setSelectedHotspot(file.hotspots[0] || null);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAskAI = async (customQ?: string) => {
    const q = customQ || aiQuestion;
    if (!q.trim()) return;

    setAiLoading(true);
    setAiAnswer("");

    try {
      const res = await fetch("/api/ai/openarm-task-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "code_explainer",
          colleagueDoubt: q,
          currentCode: currentFile.code.slice(0, 1000),
        }),
      });

      const data = await res.json();
      if (data.text) {
        setAiAnswer(data.text);
      } else {
        setAiAnswer("未能获取到解答，请检查网络或稍后重试。");
      }
    } catch (e: any) {
      setAiAnswer(`解答生成失败: ${e.message || "未知错误"}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Evaluate sandbox behavior
  const getSandboxFeedback = () => {
    if (sandboxKp > 60) {
      return {
        status: "danger",
        title: "⚠️ 剧烈自激振荡 & 啸叫发烫",
        desc: `当前 Kp=${sandboxKp} 远超临界刚度！电机产生 120Hz 尖锐啸叫，持续 5 秒将拉断机械臂 3D 打印件并可能触发过温停机。`,
        color: "text-rose-400 bg-rose-950/40 border-rose-800/60",
      };
    }
    if (sandboxKp < 12) {
      return {
        status: "warning",
        title: "⚠️ 刚度严重不足 & 大臂下垂软绵绵",
        desc: `当前 Kp=${sandboxKp} 太小，机械臂无法克服重力平举，末端下垂超 15mm，到位时间超过 3 秒。`,
        color: "text-amber-400 bg-amber-950/40 border-amber-800/60",
      };
    }
    if (sandboxKd < 1.0) {
      return {
        status: "warning",
        title: "⚠️ 阻尼不足 & 停机余震超调",
        desc: `Kd=${sandboxKd} 无法吸收机械臂快速移动后的惯量冲击，到达目标位置后反复摆动 4 次才停稳。`,
        color: "text-amber-400 bg-amber-950/40 border-amber-800/60",
      };
    }
    if (sandboxDeadband < 0.05) {
      return {
        status: "warning",
        title: "⚠️ 死区过小 & 齿隙滋滋发热",
        desc: `死区仅 ${sandboxDeadband}°，机械齿隙晃动被误判为误差，舵机静止时内部不断‘滋滋’微动发烫。`,
        color: "text-amber-400 bg-amber-950/40 border-amber-800/60",
      };
    }
    return {
      status: "success",
      title: "✅ 黄金工作区间：刚劲顺滑无抖动",
      desc: `当前参数配置极其合理！位置超调量 <2%，无啸叫，停机 0.1 秒内平稳锁定，重力下垂 <1mm。`,
      color: "text-emerald-400 bg-emerald-950/40 border-emerald-800/60",
    };
  };

  const sandboxResult = getSandboxFeedback();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/30 border border-slate-700/60 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                嵌入式同事常改代码全透视 (Code Inspector)
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40">
                零基础必读 · 破解玄学代码
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-100">
              为什么嵌入式同事总在改这些代码？—— 机械与控制联动解密
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
              许多机械/机电同学在做机械臂时，常看到软件同事在改 <code>SyncWrite</code> 数组、调 <code>Kp/Kd</code> 参数、修改 <code>0x1E</code> 零点偏置或通信缓冲区。这里为你精选 6 大核心文件，带详细行级注释与故障机理解析！
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAskAI("请以最通俗的小白语言，向我总结嵌入式同事在 OpenArm 调试中每天修改频率最高的前 3 个地方及原因。")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>AI 快速总结常改点</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Code & Analysis Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: File Selector & Code Viewer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* File Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {EMBEDDED_CODE_TEMPLATES.map((file) => {
              const isSelected = file.id === currentFile.id;
              return (
                <button
                  key={file.id}
                  onClick={() => handleSelectFile(file)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-slate-800 text-cyan-300 border border-cyan-500/50 shadow-sm"
                      : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-900"
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                  <span>{file.fileName}</span>
                  <span className="text-[10px] px-1 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Code Viewer Container */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                </div>
                <span className="text-xs font-mono text-slate-300 font-bold ml-2">
                  {currentFile.fileName}
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">
                  ({currentFile.description.slice(0, 32)}...)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-mono transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
                  <span>{copied ? "已复制" : "复制代码"}</span>
                </button>
              </div>
            </div>

            {/* Code Body with Line Highlights */}
            <div className="p-4 font-mono text-xs max-h-[520px] overflow-y-auto leading-relaxed">
              <pre className="text-slate-300">
                {currentFile.code.split("\n").map((line, idx) => {
                  const lineNum = idx + 1;
                  // Check if this line is in the selected hotspot
                  const isHotspot = selectedHotspot?.lines.includes(lineNum);
                  return (
                    <div
                      key={lineNum}
                      className={`flex items-start hover:bg-slate-900/80 px-2 py-0.5 rounded transition-colors ${
                        isHotspot ? "bg-cyan-950/60 border-l-2 border-cyan-400 text-cyan-200" : ""
                      }`}
                    >
                      <span className="w-8 text-slate-600 select-none text-right pr-3 shrink-0 text-[11px]">
                        {lineNum}
                      </span>
                      <span className="flex-1 whitespace-pre-wrap break-all">{line}</span>
                    </div>
                  );
                })}
              </pre>
            </div>

            {/* Hotspots Quick Switcher in Footer */}
            {currentFile.hotspots.length > 0 && (
              <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  高频修改行速查:
                </span>
                {currentFile.hotspots.map((hs) => {
                  const isSelected = selectedHotspot?.id === hs.id;
                  return (
                    <button
                      key={hs.id}
                      onClick={() => setSelectedHotspot(hs)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                        isSelected
                          ? "bg-cyan-500 text-slate-950 font-bold shadow-xs"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                      }`}
                    >
                      第 {hs.lines[0]} 行: {hs.title}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Hotspot Deep Explanation & Interactive Sandbox (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Detailed Hotspot Explanation Card */}
          {selectedHotspot ? (
            <div className="bg-slate-900/70 rounded-2xl border border-cyan-900/50 p-5 shadow-xl space-y-4">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <HelpCircle className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">
                      第 {selectedHotspot.lines.join(", ")} 行解析：{selectedHotspot.title}
                    </h3>
                    <span className="text-[11px] font-mono text-cyan-400">
                      所属文件: {currentFile.fileName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Why Colleague Modifies */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-mono">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>为什么嵌入式同事总要改这几行？</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedHotspot.whyColleagueModifies}
                </p>
              </div>

              {/* Symptoms When Wrong */}
              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/40 space-y-1.5">
                <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5 font-mono">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>改错或配置不当时有什么机械/异常现象？</span>
                </div>
                <p className="text-xs text-rose-200/90 leading-relaxed">
                  {selectedHotspot.symptomsWhenWrong}
                </p>
              </div>

              {/* Tuning Guide */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 font-mono">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>小白实战调参指南与安全范围：</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedHotspot.tuningGuide}
                </p>
              </div>

              {/* Beginner Note */}
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-xs text-emerald-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">机械小白速记：</span>
                  <span>{selectedHotspot.beginnerNote}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 text-center text-slate-400 text-xs">
              点击左侧代码中的行或高频标签，查看为什么同事要修改这行代码！
            </div>
          )}

          {/* Interactive PID & Control Sandbox (小白调参沙盒) */}
          <div className="bg-slate-900/70 rounded-2xl border border-slate-700/50 p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> 小白调参反应模拟沙盒 (Parameter Sandbox)
              </h4>
              <button
                onClick={() => {
                  setSandboxKp(32);
                  setSandboxKd(3.5);
                  setSandboxDeadband(0.2);
                  setSandboxStallTimeout(650);
                }}
                className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> 重置为标准值
              </button>
            </div>

            <div className="space-y-3">
              {/* Kp Slider */}
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>比例增益 Kp (刚度):</span>
                  <span className="font-bold text-cyan-400">{sandboxKp}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="90"
                  value={sandboxKp}
                  onChange={(e) => setSandboxKp(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>过软 (5)</span>
                  <span>推荐 (30~35)</span>
                  <span>啸叫 (90)</span>
                </div>
              </div>

              {/* Kd Slider */}
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>微分阻尼 Kd (吸振):</span>
                  <span className="font-bold text-cyan-400">{sandboxKd.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="8.0"
                  step="0.1"
                  value={sandboxKd}
                  onChange={(e) => setSandboxKd(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>余震 (0.2)</span>
                  <span>推荐 (2.5~4.0)</span>
                  <span>超强阻尼 (8.0)</span>
                </div>
              </div>

              {/* Deadband Slider */}
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>死区 Deadband:</span>
                  <span className="font-bold text-cyan-400">{sandboxDeadband.toFixed(2)}°</span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.8"
                  step="0.02"
                  value={sandboxDeadband}
                  onChange={(e) => setSandboxDeadband(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>滋滋发热 (0.02°)</span>
                  <span>推荐 (0.15~0.25°)</span>
                  <span>粗糙 (0.8°)</span>
                </div>
              </div>

              {/* Real-time Dynamic Feedback Box */}
              <div className={`p-3.5 rounded-xl border ${sandboxResult.color} space-y-1 transition-all`}>
                <div className="font-bold text-xs font-mono flex items-center gap-1.5">
                  <span>{sandboxResult.title}</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">{sandboxResult.desc}</p>
              </div>
            </div>
          </div>

          {/* AI Embedded Code Q&A Assistant */}
          <div className="bg-slate-900/70 rounded-2xl border border-slate-700/50 p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">
                  Gemini AI 嵌入式代码随身导师
                </h4>
                <p className="text-[10px] text-slate-400">
                  零基础向 AI 提问任何代码、术语或同事口中的黑话
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="例如: 为什么总线通信要用 DMA 环形缓冲？"
                  onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
                  className="flex-1 text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono outline-none focus:border-cyan-400"
                />
                <button
                  onClick={() => handleAskAI()}
                  disabled={aiLoading || !aiQuestion.trim()}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
                >
                  {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>问AI</span>
                </button>
              </div>

              {/* Preset Quick Questions */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  "同事说的广播 SyncWrite 到底怎么发？",
                  "换了重负载夹爪大臂下垂怎么在代码里加补偿？",
                  "串口通信 1Mbps 为什么会有 5us 延时？",
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setAiQuestion(q);
                      handleAskAI(q);
                    }}
                    className="text-[10px] px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* AI Answer Output */}
              {aiAnswer && (
                <div className="p-3.5 bg-slate-950 rounded-xl border border-cyan-900/50 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  <div className="font-bold text-cyan-300 font-mono mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> AI 导师通俗解答：
                  </div>
                  {aiAnswer}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
