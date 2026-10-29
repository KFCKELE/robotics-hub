import React from "react";

export interface RoboticArmLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  animated?: boolean;
}

export const RoboticArmLogo: React.FC<RoboticArmLogoProps> = ({
  size = "md",
  className = "",
  animated = true,
}) => {
  const sizeMap = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
    hero: "w-32 h-32 sm:w-40 sm:h-40",
  };

  return (
    <div
      className={`relative inline-flex items-center select-none ${className}`}
      title="机械臂结构工程标识 (Robotic Arm Structural Engineering)"
    >
      <div
        className={`relative ${sizeMap[size]} flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-700/80 shadow-lg shadow-cyan-950/40 p-0.5 overflow-hidden transition-all duration-300 hover:border-cyan-500/80 hover:shadow-cyan-500/25`}
      >
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-radial from-cyan-500/15 via-transparent to-transparent pointer-events-none" />

        <svg
          viewBox="0 0 200 200"
          className={`w-full h-full ${animated ? "transition-transform duration-500 hover:rotate-1" : ""}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="armTitanium" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
              <stop stopColor="#334155" />
              <stop offset="0.5" stopColor="#1e293b" />
              <stop offset="1" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="armCyanBeam" x1="40" y1="160" x2="160" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#06b6d4" />
              <stop offset="0.5" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#67e8f9" />
            </linearGradient>

            <linearGradient id="armAmberStress" x1="60" y1="120" x2="140" y2="60" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f59e0b" />
              <stop offset="0.7" stopColor="#fbbf24" />
              <stop offset="1" stopColor="#fde68a" />
            </linearGradient>

            <linearGradient id="armGoldTrim" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="0.5" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="1" stopColor="#06b6d4" stopOpacity="0.8" />
            </linearGradient>

            <radialGradient id="armCoreAura" cx="100" cy="100" r="70" gradientUnits="userSpaceOnUse">
              <stop stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="0.8" stopColor="#0284c7" stopOpacity="0.05" />
              <stop offset="1" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Core Ambient Aura */}
          <circle cx="100" cy="100" r="82" fill="url(#armCoreAura)" />

          {/* Outer CNC Machined Octagonal Frame */}
          <polygon
            points="42,16 158,16 184,42 184,158 158,184 42,184 16,158 16,42"
            fill="url(#armTitanium)"
            stroke="url(#armGoldTrim)"
            strokeWidth="1.8"
          />

          {/* Micro-Vernier Pitch Circle & Calibration Ticks */}
          <circle cx="100" cy="100" r="82" stroke="#475569" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.6" />
          <circle cx="100" cy="100" r="74" stroke="#334155" strokeWidth="0.5" opacity="0.5" />

          {/* 4 Precision PCD Socket Head Screws */}
          {[
            { cx: 32, cy: 32 },
            { cx: 168, cy: 32 },
            { cx: 168, cy: 168 },
            { cx: 32, cy: 168 },
          ].map((screw, idx) => (
            <g key={idx} opacity="0.85">
              <circle cx={screw.cx} cy={screw.cy} r="4.5" fill="#1e293b" stroke="#64748b" strokeWidth="0.8" />
              <polygon
                points={`${screw.cx - 2.2},${screw.cy - 1.2} ${screw.cx},${screw.cy - 2.5} ${screw.cx + 2.2},${screw.cy - 1.2} ${screw.cx + 2.2},${screw.cy + 1.2} ${screw.cx},${screw.cy + 2.5} ${screw.cx - 2.2},${screw.cy + 1.2}`}
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="0.5"
              />
            </g>
          ))}

          {/* 6-DoF Axis Datum Indicators */}
          <g opacity="0.65" className="text-[7px] font-mono font-bold select-none fill-slate-400">
            <text x="100" y="27" textAnchor="middle">Z+ (J3)</text>
            <text x="175" y="103" textAnchor="middle">X+ (Reach)</text>
            <text x="100" y="179" textAnchor="middle">J1 (Turret)</text>
            <text x="25" y="103" textAnchor="middle">Y+ (Base)</text>
          </g>

          {/* Centerline Crosshairs */}
          <line x1="100" y1="28" x2="100" y2="40" stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.4" />
          <line x1="100" y1="160" x2="100" y2="172" stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.4" />
          <line x1="28" y1="100" x2="40" y2="100" stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.4" />
          <line x1="160" y1="100" x2="172" y2="100" stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.4" />

          {/* Internal Structural Triangular Truss */}
          <g opacity="0.75">
            <path d="M48 94 L152 94" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M100 52 L100 148" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M96 98 L56 142" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
            <path d="M104 98 L144 142" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
          </g>

          {/* Harmonic Gear Pitch Teeth at Elbow Joint */}
          <g opacity="0.85">
            <path d="M108 58 A 24 24 0 0 1 144 94" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3 3" />
            {[0, 18, 36, 54, 72, 90].map((deg) => {
              const rad = ((deg - 30) * Math.PI) / 180;
              const x1 = 126 + 18 * Math.cos(rad);
              const y1 = 76 + 18 * Math.sin(rad);
              const x2 = 126 + 23 * Math.cos(rad);
              const y2 = 76 + 23 * Math.sin(rad);
              return (
                <line
                  key={deg}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#fbbf24"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* Base & Shoulder Bracket (J1 -> J2) */}
          <g>
            <path
              d="M44 154 L78 154 L78 142 L58 142 L58 116 L44 116 Z"
              fill="url(#armTitanium)"
              stroke="url(#armCyanBeam)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="148" r="7" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.6" />
            <circle cx="50" cy="148" r="3" fill="#38bdf8" />
            {[0, 90, 180, 270].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <circle
                  key={i}
                  cx={50 + 5 * Math.cos(rad)}
                  cy={148 + 5 * Math.sin(rad)}
                  r="0.8"
                  fill="#f59e0b"
                />
              );
            })}
          </g>

          {/* Articulated Boom with Topology Pockets */}
          <g>
            <path
              d="M52 116 C 52 116, 68 84, 100 74 C 114 69, 130 70, 134 82 C 137 92, 126 104, 114 104 C 104 104, 98 94, 104 84"
              fill="none"
              stroke="url(#armAmberStress)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* FEA Topology Lightening Pockets */}
            <g opacity="0.9">
              <ellipse
                cx="74"
                cy="98"
                rx="6"
                ry="3.5"
                transform="rotate(-40 74 98)"
                fill="#090d16"
                stroke="#f59e0b"
                strokeWidth="1.2"
              />
              <ellipse
                cx="94"
                cy="84"
                rx="5"
                ry="3"
                transform="rotate(-25 94 84)"
                fill="#090d16"
                stroke="#f59e0b"
                strokeWidth="1.2"
              />
              <circle cx="120" cy="86" r="4" fill="#090d16" stroke="#fbbf24" strokeWidth="1.2" />
            </g>

            {/* Rotary Joints J2 and J3 */}
            <circle cx="56" cy="116" r="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
            <circle cx="56" cy="116" r="2.5" fill="#fde68a" />
            <circle cx="126" cy="76" r="7" fill="#1e293b" stroke="#06b6d4" strokeWidth="1.8" />
            <circle cx="126" cy="76" r="3.2" fill="#38bdf8" />
          </g>

          {/* Forearm & Gripper Flange */}
          <g>
            <path
              d="M126 76 L154 48 L164 58 L142 80 Z"
              fill="url(#armTitanium)"
              stroke="url(#armCyanBeam)"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            {/* Tool Flange */}
            <line x1="150" y1="44" x2="162" y2="56" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
            {/* Dual Gripper Jaws */}
            <path d="M152 42 L158 34 L164 36" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M164 54 L172 46 L170 40" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Target Datum Node */}
            <polygon
              points="164,36 168,40 164,44 160,40"
              fill="#f59e0b"
              stroke="#fef08a"
              strokeWidth="0.8"
              className={animated ? "animate-pulse" : ""}
            />
          </g>

          {/* Engineering Lab Title at Bottom - No Personal Name */}
          <g className="font-mono select-none">
            <text
              x="100"
              y="166"
              textAnchor="middle"
              className="text-[9px] tracking-[0.25em] fill-cyan-300 font-bold"
            >
              6-DOF ARM
            </text>
            <text
              x="100"
              y="174"
              textAnchor="middle"
              className="text-[5.5px] tracking-[0.18em] fill-slate-400 font-semibold"
            >
              STRUCTURAL ENG
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
