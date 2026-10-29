import React, { useState } from "react";
import { RobotModel } from "./types";
import {
  generateUrdfXml,
  generateSrdf,
  generateLocalPythonEngineScript,
  exportRosPackageZip,
} from "./urdfUtils";
import {
  FileCode,
  Copy,
  Check,
  Download,
  Terminal,
  FolderArchive,
  Layers,
  Sparkles,
  CheckCircle2,
  FileText,
} from "lucide-react";

interface UrdfCodeEditorProps {
  robot: RobotModel;
}

type CodeTab = "urdf" | "srdf" | "ros2_control" | "python_engine" | "ros2_package";

export const UrdfCodeEditor: React.FC<UrdfCodeEditorProps> = ({ robot }) => {
  const [activeCodeTab, setActiveCodeTab] = useState<CodeTab>("urdf");
  const [copied, setCopied] = useState<boolean>(false);
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);

  const urdfXml = generateUrdfXml(robot);
  const srdfXml = generateSrdf(robot);
  const pythonScript = generateLocalPythonEngineScript(robot.id);

  let currentCodeText = urdfXml;
  if (activeCodeTab === "srdf") currentCodeText = srdfXml;
  else if (activeCodeTab === "python_engine") currentCodeText = pythonScript;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCodeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleFile = () => {
    let filename = `${robot.id}.urdf`;
    let mimeType = "application/xml";
    if (activeCodeTab === "srdf") filename = `${robot.id}.srdf`;
    else if (activeCodeTab === "python_engine") {
      filename = "cad2urdf_local_engine.py";
      mimeType = "text/x-python";
    }

    const blob = new Blob([currentCodeText], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadFullZip = async () => {
    setIsExportingZip(true);
    try {
      const blob = await exportRosPackageZip(robot);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${robot.id}_description_ros2.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export ROS package zip", err);
    } finally {
      setIsExportingZip(false);
    }
  };

  const totalMass = robot.links.reduce((sum, l) => sum + l.inertial.massKg, 0);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col space-y-4">
      {/* Top Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>URDF / ROS 2 源码生成器</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 border border-purple-500/30">
                W3C XML & REP-103
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              自动合成 Links、Joints、Inertial、Visual/Collision 与 ROS 2 Control 硬件接口
            </p>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
            title="复制代码"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "已复制" : "复制代码"}</span>
          </button>

          <button
            onClick={handleDownloadSingleFile}
            className="px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
            title="下载当前选中文件"
          >
            <Download className="w-3.5 h-3.5" />
            <span>下载文件</span>
          </button>

          <button
            onClick={handleDownloadFullZip}
            disabled={isExportingZip}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="一键打包下载完整 ROS 2 功能包 (含 launch、urdf、package.xml、CMakeLists.txt)"
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>{isExportingZip ? "正在打包..." : "一键打包 ROS2 功能包 ZIP"}</span>
          </button>
        </div>
      </div>

      {/* Model Spec Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-500 font-mono block">连杆总数 (Links)</span>
          <span className="text-xs font-mono font-bold text-slate-200">
            {robot.links.length} 个刚体连杆
          </span>
        </div>
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-500 font-mono block">活动关节 (Active Joints)</span>
          <span className="text-xs font-mono font-bold text-cyan-300">
            {robot.joints.filter((j) => j.type !== "fixed").length} 自由度
          </span>
        </div>
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-500 font-mono block">装配体总质量</span>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {totalMass >= 1 ? `${totalMass.toFixed(2)} kg` : `${(totalMass * 1000).toFixed(0)} g`}
          </span>
        </div>
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-500 font-mono block">坐标系规范</span>
          <span className="text-xs font-mono font-bold text-purple-300">
            REP-103 (X前 Y左 Z上)
          </span>
        </div>
      </div>

      {/* Code Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveCodeTab("urdf")}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-colors ${
            activeCodeTab === "urdf"
              ? "bg-purple-600 text-white font-bold"
              : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          {robot.id}.urdf (主描述)
        </button>

        <button
          onClick={() => setActiveCodeTab("srdf")}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-colors ${
            activeCodeTab === "srdf"
              ? "bg-purple-600 text-white font-bold"
              : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          {robot.id}.srdf (MoveIt 语义配置)
        </button>

        <button
          onClick={() => setActiveCodeTab("python_engine")}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeCodeTab === "python_engine"
              ? "bg-purple-600 text-white font-bold"
              : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <Terminal className="w-3 h-3" />
          <span>cad2urdf_local_engine.py (本地离线硬件提取脚本)</span>
        </button>
      </div>

      {/* Code Textarea / Viewer */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#070B14]">
        <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[380px] leading-relaxed select-all">
          {currentCodeText}
        </pre>
      </div>
    </div>
  );
};
