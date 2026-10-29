import React from "react";

interface SchematicProps {
  type: "swivel_base" | "arm_linkage" | "elbow_joint" | "wrist_roll" | "gripper_jaw" | "gearbox" | "custom_box";
  name: string;
}

export const StructureSchematicViewer: React.FC<SchematicProps> = ({ type, name }) => {
  return (
    <div id="schematic-viewer-container" className="relative w-full h-44 bg-slate-950/80 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center p-3">
      {/* Background blueprint grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-40"></div>
      
      {/* SVG Wireframe by Type */}
      {type === "swivel_base" && (
        <svg viewBox="0 0 240 140" className="w-full h-full max-h-36 stroke-cyan-400 fill-none">
          {/* Base bottom ring */}
          <ellipse cx="120" cy="110" rx="90" ry="22" strokeWidth="2" />
          <ellipse cx="120" cy="100" rx="75" ry="18" strokeWidth="1.5" strokeDasharray="3 2" className="stroke-slate-500" />
          <path d="M 30 110 L 30 90 A 90 22 0 0 1 210 90 L 210 110" strokeWidth="2" />
          {/* Central bearing seat */}
          <ellipse cx="120" cy="80" rx="45" ry="12" strokeWidth="2" className="stroke-amber-400" />
          <ellipse cx="120" cy="70" rx="30" ry="8" strokeWidth="1.5" className="stroke-amber-300" />
          {/* Through-hole center */}
          <ellipse cx="120" cy="70" rx="14" ry="4" strokeWidth="1.5" className="stroke-sky-300 fill-sky-950/40" />
          <path d="M 75 80 L 85 45 A 35 10 0 0 1 155 45 L 165 80" strokeWidth="1.5" />
          <ellipse cx="120" cy="45" rx="35" ry="10" strokeWidth="2" className="stroke-emerald-400" />
          {/* Fastener indicators */}
          <circle cx="50" cy="98" r="3" className="fill-cyan-300" />
          <circle cx="190" cy="98" r="3" className="fill-cyan-300" />
          <circle cx="120" cy="122" r="3" className="fill-cyan-300" />
          <circle cx="120" cy="88" r="3" className="fill-cyan-300" />
          {/* Dimension indicator lines */}
          <line x1="20" y1="45" x2="20" y2="110" strokeWidth="1" className="stroke-slate-500" />
          <text x="8" y="82" fill="#94a3b8" fontSize="9" textAnchor="middle" transform="rotate(-90 8,82)">H=68mm</text>
        </svg>
      )}

      {type === "arm_linkage" && (
        <svg viewBox="0 0 260 140" className="w-full h-full max-h-36 stroke-blue-400 fill-none">
          {/* Main I-beam linkage body */}
          <path d="M 45 45 L 215 30 L 225 70 L 40 95 Z" strokeWidth="2" className="stroke-blue-400 fill-blue-950/20" />
          {/* Left fork ear & bearing */}
          <circle cx="45" cy="70" r="24" strokeWidth="2" className="stroke-amber-400" />
          <circle cx="45" cy="70" r="14" strokeWidth="1.5" className="stroke-amber-300 fill-slate-900" />
          <circle cx="45" cy="70" r="6" strokeWidth="1.5" className="stroke-sky-300" />
          {/* Right end connector */}
          <circle cx="215" cy="50" r="18" strokeWidth="2" className="stroke-emerald-400" />
          <circle cx="215" cy="50" r="10" strokeWidth="1.5" className="stroke-emerald-300 fill-slate-900" />
          {/* Triangular reinforcement rib cutouts */}
          <path d="M 85 58 L 125 54 L 105 78 Z" strokeWidth="1.5" className="stroke-slate-600 fill-slate-950" />
          <path d="M 140 52 L 180 48 L 160 72 Z" strokeWidth="1.5" className="stroke-slate-600 fill-slate-950" />
          {/* Center line */}
          <line x1="45" y1="70" x2="215" y2="50" strokeWidth="1" strokeDasharray="4 2" className="stroke-cyan-500/60" />
          {/* Dimension text */}
          <text x="130" y="32" fill="#38bdf8" fontSize="9" textAnchor="middle">L=220mm (双支点工字梁)</text>
        </svg>
      )}

      {type === "elbow_joint" && (
        <svg viewBox="0 0 240 140" className="w-full h-full max-h-36 stroke-indigo-400 fill-none">
          {/* Elbow symmetric bracket */}
          <path d="M 40 40 L 110 35 L 130 65 L 80 110 L 35 90 Z" strokeWidth="2" className="stroke-indigo-400 fill-indigo-950/20" />
          <path d="M 110 35 L 200 45 L 195 85 L 130 65" strokeWidth="2" className="stroke-indigo-300" />
          {/* Coaxial dual bearings */}
          <ellipse cx="60" cy="65" rx="20" ry="20" strokeWidth="2" className="stroke-amber-400" />
          <ellipse cx="60" cy="65" rx="10" ry="10" strokeWidth="1.5" className="stroke-amber-300 fill-slate-900" />
          <ellipse cx="165" cy="65" rx="15" ry="15" strokeWidth="2" className="stroke-emerald-400" />
          <ellipse cx="165" cy="65" rx="8" ry="8" strokeWidth="1.5" className="stroke-emerald-300 fill-slate-900" />
          <line x1="30" y1="65" x2="200" y2="65" strokeWidth="1" strokeDasharray="3 3" className="stroke-slate-500" />
          <text x="120" y="125" fill="#a5b4fc" fontSize="9" textAnchor="middle">同轴双轴承回转座 (Φ32 H7)</text>
        </svg>
      )}

      {type === "wrist_roll" && (
        <svg viewBox="0 0 240 140" className="w-full h-full max-h-36 stroke-violet-400 fill-none">
          {/* Cross-axis wrist compact assembly */}
          <rect x="70" y="40" width="100" height="60" rx="8" strokeWidth="2" className="stroke-violet-400 fill-violet-950/30" />
          {/* J4 Roll flange */}
          <ellipse cx="70" cy="70" rx="12" ry="24" strokeWidth="2" className="stroke-cyan-400 fill-slate-900" />
          {/* J5 Pitch yoke */}
          <ellipse cx="170" cy="70" rx="12" ry="24" strokeWidth="2" className="stroke-emerald-400 fill-slate-900" />
          {/* Center hollow wire path */}
          <circle cx="120" cy="70" r="14" strokeWidth="2" className="stroke-amber-400 fill-amber-950/40" />
          <text x="120" y="73" fill="#fde047" fontSize="8" textAnchor="middle">过线孔</text>
          <path d="M 85 30 L 155 30" strokeWidth="1.5" className="stroke-slate-500" />
          <text x="120" y="24" fill="#cbd5e1" fontSize="9" textAnchor="middle">超紧凑正交十字轴</text>
        </svg>
      )}

      {type === "gripper_jaw" && (
        <svg viewBox="0 0 240 140" className="w-full h-full max-h-36 stroke-teal-400 fill-none">
          {/* Center Gear & Rack Gripper */}
          <circle cx="120" cy="70" r="16" strokeWidth="2" className="stroke-amber-400 fill-amber-950/40" />
          <circle cx="120" cy="70" r="6" strokeWidth="1.5" className="stroke-amber-300" />
          {/* Left rack & finger */}
          <rect x="40" y="45" width="70" height="12" rx="2" strokeWidth="1.5" className="stroke-teal-400 fill-teal-950/40" />
          <path d="M 40 45 L 25 20 L 35 20 L 50 45 Z" strokeWidth="2" className="stroke-teal-300 fill-teal-900/30" />
          {/* Right rack & finger */}
          <rect x="130" y="83" width="70" height="12" rx="2" strokeWidth="1.5" className="stroke-teal-400 fill-teal-950/40" />
          <path d="M 200 95 L 215 120 L 205 120 L 190 95 Z" strokeWidth="2" className="stroke-teal-300 fill-teal-900/30" />
          {/* Dual guide rails */}
          <line x1="30" y1="35" x2="210" y2="35" strokeWidth="1" strokeDasharray="3 2" className="stroke-slate-500" />
          <line x1="30" y1="105" x2="210" y2="105" strokeWidth="1" strokeDasharray="3 2" className="stroke-slate-500" />
          {/* Motion arrows */}
          <path d="M 60 20 L 80 20 M 75 16 L 80 20 L 75 24" strokeWidth="1.5" className="stroke-sky-400" />
          <path d="M 180 120 L 160 120 M 165 116 L 160 120 L 165 124" strokeWidth="1.5" className="stroke-sky-400" />
          <text x="120" y="132" fill="#5eead4" fontSize="9" textAnchor="middle">双向同步齿轮齿条 (开合0~60mm)</text>
        </svg>
      )}

      {type === "gearbox" && (
        <svg viewBox="0 0 240 140" className="w-full h-full max-h-36 stroke-orange-400 fill-none">
          {/* Worm and Capstan tensioner */}
          <rect x="50" y="45" width="80" height="50" rx="4" strokeWidth="2" className="stroke-orange-400 fill-orange-950/20" />
          <circle cx="155" cy="70" r="25" strokeWidth="2" className="stroke-amber-400" />
          <circle cx="155" cy="70" r="12" strokeWidth="1.5" className="stroke-amber-300" />
          {/* Steel cable path */}
          <path d="M 155 45 C 190 45 220 70 220 90" strokeWidth="1.8" className="stroke-cyan-300" />
          <circle cx="220" cy="90" r="3" className="fill-cyan-300" />
          <text x="120" y="125" fill="#fdba74" fontSize="9" textAnchor="middle">Capstan 绳轮张紧自锁机构</text>
        </svg>
      )}

      {type === "custom_box" && (
        <svg viewBox="0 0 240 140" className="w-full h-full max-h-36 stroke-sky-400 fill-none">
          {/* Isometric ISO 9409 Flange / Custom Part */}
          <polygon points="120,25 190,65 120,105 50,65" strokeWidth="2" className="stroke-sky-400 fill-sky-950/30" />
          <polygon points="120,40 165,65 120,90 75,65" strokeWidth="1.5" className="stroke-cyan-300" />
          <circle cx="120" cy="65" r="8" strokeWidth="1.5" className="stroke-amber-400 fill-slate-900" />
          {/* PCD circle dots */}
          <circle cx="100" cy="55" r="2.5" className="fill-emerald-400" />
          <circle cx="140" cy="55" r="2.5" className="fill-emerald-400" />
          <circle cx="100" cy="75" r="2.5" className="fill-emerald-400" />
          <circle cx="140" cy="75" r="2.5" className="fill-emerald-400" />
          <text x="120" y="125" fill="#7dd3fc" fontSize="9" textAnchor="middle">ISO 9409-1 标准机器人法兰</text>
        </svg>
      )}

      {/* Title tag on bottom left */}
      <div className="absolute bottom-2 left-2 text-[10px] text-slate-400 font-mono bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
        📐 机构原理线框
      </div>
    </div>
  );
};
