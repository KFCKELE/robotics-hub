const fs = require('fs');
let content = fs.readFileSync('src/components/FEASimulation/FEASimulationHub.tsx', 'utf8');

const oldLabel = `<span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    固定几何体 (固定约束面 Fixed Fixture)
                  </span>`;

const newLabel = `<span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    固定几何体 (固定约束面)
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">支持六大极限端面</span>`;

content = content.replace(oldLabel, newLabel);

const oldForceLabel = `<span className="flex items-center gap-1.5 text-pink-400">
                    <span className="w-2 h-2 rounded-full bg-pink-400" />
                    受力施加面 (Force Face / Load Target)
                  </span>`;

const newForceLabel = `<span className="flex items-center gap-1.5 text-pink-400">
                    <span className="w-2 h-2 rounded-full bg-pink-400" />
                    受力施加面 (Force Face)
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">支持六大极限端面</span>`;

content = content.replace(oldForceLabel, newForceLabel);

fs.writeFileSync('src/components/FEASimulation/FEASimulationHub.tsx', content);
