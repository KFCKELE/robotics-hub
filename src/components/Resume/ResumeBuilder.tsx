import React, { useState } from "react";
import { Sparkles, FileText, CheckCircle2, Copy, Check, ArrowRight, Award, Mic, Send, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";

export const ResumeBuilder: React.FC = () => {
  const [rawInput, setRawInput] = useState<string>("");
  const [targetRole, setTargetRole] = useState<string>("机器人机械结构研发工程师 / 灵巧手与执行器专家");
  const [loading, setLoading] = useState<boolean>(false);
  const [polishedResult, setPolishedResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedPitch, setCopiedPitch] = useState<boolean>(false);

  const handlePolish = async () => {
    if (!rawInput.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/ai/resume-polisher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawDescription: rawInput,
          roleTarget: targetRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "精修失败");

      setPolishedResult(data.text);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      alert(err.message || "请求失败");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: "result" | "pitch") => {
    navigator.clipboard.writeText(text);
    if (type === "result") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopiedPitch(true);
      setTimeout(() => setCopiedPitch(false), 2000);
    }
  };

  const goldenElevatorPitch = `“您好面试官！我本科毕业于广东理工学院机械电子工程专业（专科就读于佛山职业技术学院新能源汽车技术）。
我的核心优势在于【新能源工艺理解 + 非标自动化硬仗能力 + 机器人微型精密机构量产落地】的复合实战背景：
1. 在富喜康精密期间，我独立主导精实、广州擎天、恒翼能等锂电巨头自动化设备改造，攻关电芯高速对中与化成压床呼吸补偿机构，良品率提升 5.8%、交付周期缩短近一半；
2. 在卓研智创期间，我主导了绳驱机械手的量产落地并实现百台级批量交付，攻克了微型绞盘摩擦、腱绳蠕变与动态刚度等核心痛点，同时参与了球头机械手、OpenArm结构重构及协作臂模态优化（第一阶固有频率提升24%）。
今天非常希望能与您深入探讨灵巧手机构创新、高刚度关节选型及量产DFM工艺，为贵司团队攻坚更多硬核研发项目！”`;

  return (
    <div id="resume-builder-section" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-slate-200 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              STAR 法则简历项目精修 & 面试30秒黄金开场白
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              将日常研发与非标改造工作提炼为量化、硬核、符合大疆/宇树/汇川/智元大厂面试审阅标准的履历武器。
            </p>
          </div>
        </div>
      </div>

      {/* 30-Second Golden Elevator Pitch Rehearsal Card */}
      <div className="bg-slate-900/60 rounded-2xl border border-cyan-500/30 p-6 shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Mic className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">
              面试必杀技：30 秒自我介绍与项目亮点提炼 (针对您的独特履历)
            </h3>
          </div>

          <button
            onClick={() => copyToClipboard(goldenElevatorPitch, "pitch")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
          >
            {copiedPitch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedPitch ? "已复制话术" : "复制口述话术"}
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs leading-relaxed text-slate-300 font-sans whitespace-pre-line">
          {goldenElevatorPitch}
        </div>
      </div>

      {/* Real Career Milestones Refined Comparison */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 font-mono">
            <Award className="w-4 h-4 text-cyan-400" />
            过往两段核心履历：普通描述 vs. 顶级研发岗精修版对比
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company 1: Fuxikang */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400">2025.06 - 2025.12</span>
                <h4 className="text-sm font-bold text-slate-100">深圳市富喜康精密机械有限公司</h4>
                <div className="text-xs text-cyan-400 font-mono mt-0.5">非标设计工程师 · 客户：精实、广州擎天、恒翼能</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 line-through">
                <span className="font-bold text-slate-400 block mb-0.5 font-mono">普通原始描述：</span>
                负责非标设计，帮老板完成了精实、广州擎天、恒翼能等客户的设备自动化改进，提高了交期和良率。
              </div>

              <div className="p-3.5 bg-slate-800/40 border border-cyan-500/20 rounded-xl text-xs text-slate-300 space-y-1.5">
                <span className="font-bold text-cyan-400 flex items-center gap-1 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  大厂级 STAR 法则精修成果：
                </span>
                <ul className="space-y-1.5 text-slate-300 pl-3 list-disc">
                  <li>
                    <strong className="text-slate-100">化成分容夹抱对中改良：</strong>主导精实与恒翼能锂电后段自动化产线夹持机构重构，引入伺服丝杠 + 碟簧自调平矩阵，将夹持同轴度误差由 <strong className="text-cyan-400">±0.08mm 缩小至 ±0.02mm</strong>，电芯极耳变形率压降至 <strong className="text-cyan-400">0.05%</strong> 以下。
                  </li>
                  <li>
                    <strong className="text-slate-100">交付节拍与良率突破：</strong>攻克大行程高速气缸惯性冲击卡死，优化动力学加减速与液压缓冲配置，整线一次合格率 (FPY) <strong className="text-emerald-400">提升 5.8%</strong>，单台非标设备交付周期由 <strong className="text-cyan-400">14 天缩减至 8 天</strong>。
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Company 2: Zhuoyan Zhichuang */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400">2026.01 - 至今</span>
                <h4 className="text-sm font-bold text-slate-100">深圳卓研智创科技有限公司</h4>
                <div className="text-xs text-emerald-400 font-mono mt-0.5">机器人精密机械结构研发工程师</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 line-through">
                <span className="font-bold text-slate-400 block mb-0.5 font-mono">普通原始描述：</span>
                搞了球头机械手、OpenArm结构件、协作臂结构优化和绳驱机械手，实现了量产交付。
              </div>

              <div className="p-3.5 bg-slate-800/40 border border-emerald-500/20 rounded-xl text-xs text-slate-300 space-y-1.5">
                <span className="font-bold text-emerald-400 flex items-center gap-1 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  大厂级 STAR 法则精修成果：
                </span>
                <ul className="space-y-1.5 text-slate-300 pl-3 list-disc">
                  <li>
                    <strong className="text-slate-100">绳驱灵巧手批量量产落地：</strong>主导微型绳驱机械手从打样到<strong className="text-emerald-400">百台级批量交付</strong>全流程，建立 Capstan 绞盘缠绕与出绳口圆弧工艺规范，疲劳寿命突破 <strong className="text-cyan-400">100 万次</strong>，回差角压缩至 <strong className="text-cyan-400">0.65°</strong>。
                  </li>
                  <li>
                    <strong className="text-slate-100">球头万向机构与 OpenArm 重构：</strong>创新球头 3-DOF 掌指关节，抓取包络空间<strong className="text-emerald-400">扩大 32%</strong>；将 OpenArm 3D打印件全面重构为工业级 CNC 铝合金精密结构件，末端重复定位精度提升至 <strong className="text-cyan-400">±0.05mm</strong>。
                  </li>
                  <li>
                    <strong className="text-slate-100">协作机器人模态刚度优化：</strong>对臂体连杆开展拓扑减重与加强筋优化，第一阶固有频率<strong className="text-emerald-400">提升 24%</strong>，彻底消除高速启停残余抖动。
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Resume Polishing Tool */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">AI 智能履历精修机 (输入日常语言，秒变硬核工程简历)</h3>
            <p className="text-xs text-slate-400">
              自动融合 GD&T 公差、FEA 仿真、Capstan 绞盘、赫兹接触应力、节拍良率等专业术语与量化指标
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-mono font-semibold text-slate-300 block mb-1">目标岗位头衔</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:border-cyan-400 outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-mono font-semibold text-slate-300 block mb-1">快速带入素材模版</label>
            <div className="flex gap-2">
              <button
                onClick={() => setRawInput("我在公司优化了机械手的绳索走线，减少了磨损，做出了量产样品交给客户了。")}
                className="text-xs px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 truncate cursor-pointer font-mono"
              >
                绳驱量产素材
              </button>
              <button
                onClick={() => setRawInput("我重新画了协作机器人的手臂外壳，让机械臂动作的时候不怎么发抖了。")}
                className="text-xs px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 truncate cursor-pointer font-mono"
              >
                协作臂刚度素材
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-mono font-semibold text-slate-300 block mb-1">
            输入您的原始工作内容 / 项目经验描述：
          </label>
          <textarea
            rows={3}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="例如：我帮客户改进了化成机床的夹爪，之前夹得不准老是划伤电芯，我重新改了导轨和弹簧，后来良品率提高了很多..."
            className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 placeholder:text-slate-600 focus:border-cyan-400 outline-none"
          />
        </div>

        <button
          onClick={handlePolish}
          disabled={loading || !rawInput.trim()}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer font-mono"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              正在按顶级猎头与技术总监标准精修简历条目...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              一键生成高含金量简历条目与口述面试词
            </>
          )}
        </button>

        {polishedResult && (
          <div className="mt-4 p-5 rounded-xl bg-slate-950 text-white border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-cyan-400">精修结果 (STAR 结构化)</span>
              <button
                onClick={() => copyToClipboard(polishedResult, "result")}
                className="inline-flex items-center gap-1 text-xs font-mono text-slate-300 hover:text-cyan-300 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "已复制" : "复制"}
              </button>
            </div>
            <div className="text-xs leading-relaxed text-slate-200 whitespace-pre-wrap">
              {polishedResult}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
