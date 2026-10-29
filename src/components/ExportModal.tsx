import React, { useState } from "react";
import { Download, Copy, Check, X, FileText, Sparkles, Printer } from "lucide-react";
import { defaultProjectProposals } from "../data/projectProposals";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const markdownPortfolio = `# 机器人与机电研发工程师 · 硬核工程技术作品集与项目答辩手册

**作者背景**：
- 2024 佛山职业技术学院 (新能源汽车技术) → 2024-2025 广东理工学院 (机械电子工程 专升本)
- 2025.06-2025.12 深圳市富喜康精密机械 (非标自动化设计 / 精实、广州擎天、恒翼能大客户锂电设备改良)
- 2026.01-至今 深圳卓研智创科技 (机器人机械结构研发 / 球头机械手、OpenArm高精重构、协作臂模态优化、绳驱机械手百台级量产交付)

---

## 🌟 核心技术优势与差异化壁垒
1. **绳驱微型精密机构量产突破**：突破微型 Capstan 绞盘传动与出绳口抗磨损设计，实现百台级批量交付，疲劳寿命超 100 万次。
2. **多自由度空间机构与动力学**：主导球头万向副 3-DOF 掌指关节设计与赫兹接触应力校核，协作臂第一阶固有频率提升 24%。
3. **新能源工艺与非标设备爆发力**：主导精实/恒翼能锂电后段化成压床呼吸补偿与高速对中机构重构，良率提升 5.8%，交付周期缩减 40%。

---

${defaultProjectProposals
  .map(
    (p, i) => `## 项目 ${i + 1}：${p.title}
**定位**：${p.category} | **难度**：${p.difficulty} | **核心亮点**：${p.highlightBadge}

### 1. 机构架构与配置
- **机构类型**：${p.mechanicalArchitecture.mechanismType}
- **自由度**：${p.mechanicalArchitecture.degreesOfFreedom} DOF
- **传动形式**：${p.mechanicalArchitecture.transmissionType}
- **执行器配置**：${p.mechanicalArchitecture.actuatorType}
- **主要材料**：${p.mechanicalArchitecture.materials.join(", ")}

### 2. 核心力学校核公式
${p.engineeringCalculations
  .map(
    (c) => `- **${c.formulaName}** (${c.formulaExpr})
  - 核心参数：${c.parameters.map((param) => `${param.name}=${param.value}${param.unit}`).join(", ")}
  - 结论：${c.calculationConclusion}`
  )
  .join("\n")}

### 3. 制造与 DFM/GD&T 关键规范
- **关键形位公差**：
${p.dfmAndManufacturing.criticalTolerances.map((t) => `  - ${t}`).join("\n")}
- **加工工艺与装配**：
${p.dfmAndManufacturing.machiningProcesses.map((m) => `  - ${m}`).join("\n")}

### 4. 面试高频追问与 STAR 满分答辩
${p.interviewDefensePoints
  .map(
    (dp) => `> **面试官提问**：${dp.question}
> **考察陷阱**：${dp.interviewerTrap}
> **满分回答**：
${dp.goldenAnswer}
`
  )
  .join("\n")}
`
  )
  .join("\n---\n\n")}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownPortfolio);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownPortfolio], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `机器人与机电工程研发作品集_求职答辩手册.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 bg-slate-950 text-slate-100 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">导出完整工程作品集 & 答辩全书 (Markdown)</h3>
              <p className="text-xs text-slate-400">
                可直接作为技术附件、个人技术博客或求职面试作品集发送给用人单位
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed border-b border-slate-800 whitespace-pre-wrap">
          {markdownPortfolio}
        </div>

        <div className="p-4 bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-400 font-mono">
            包含 4 大完整项目蓝图、力学公式校核、GD&T 加工公差与大厂总监级答辩词
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "已复制到剪贴板" : "复制 Markdown"}
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              下载 .MD 文件
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
