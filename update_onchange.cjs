const fs = require('fs');
let content = fs.readFileSync('src/components/FEASimulation/FEASimulationHub.tsx', 'utf8');

content = content.replace(
  `                onChange={(e) => {
                  const found = ENGINEERING_MATERIALS.find((m) => m.id === e.target.value);
                  if (found) setSelectedMaterial(found);
                }}`,
  `                onChange={(e) => {
                  const found = ENGINEERING_MATERIALS.find((m) => m.id === e.target.value);
                  if (found) {
                    setSelectedMaterial(found);
                    // Automatically switch to displacement to show material effects
                    if (activePlot === "von_mises") {
                       setActivePlot("displacement");
                    }
                  }
                }}`
);

content = content.replace(
  `              </div>
            </div>
          </div>

          {/* Step 3: Fixture`,
  `              </div>
              <div className="text-[10px] text-emerald-400 bg-emerald-950/30 p-2 rounded-lg border border-emerald-900/50">
                💡 物理定律提示：在静定结构下，改变材料不会改变“应力 (Stress)”大小，但会显著改变“形变 (Displacement)”与“安全系数”。
              </div>
            </div>
          </div>

          {/* Step 3: Fixture`
);

fs.writeFileSync('src/components/FEASimulation/FEASimulationHub.tsx', content);
