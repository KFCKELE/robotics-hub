const fs = require('fs');
let content = fs.readFileSync('src/components/FEASimulation/FEASimulationHub.tsx', 'utf8');

const originalBlock = `{/* Uploaded Model Inspection Card */}
              {uploadedModelData && (
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs font-mono space-y-2 text-slate-200">
                  <div className="flex items-center justify-between text-emerald-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4" />
                      <span>{uploadedModelData.fileName}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/50 border border-emerald-500/50">
                      {uploadedModelData.cadSoftware || "3D CAD Solid"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1 border-t border-emerald-800/40">
                    <div>包络尺寸: <span className="text-cyan-300 font-bold">{uploadedModelData.dimensionsMm.x}×{uploadedModelData.dimensionsMm.y}×{uploadedModelData.dimensionsMm.z} mm</span></div>
                    <div>估计体积: <span className="text-purple-300 font-bold">{uploadedModelData.estimatedVolumeCm3} cm³</span></div>
                    <div>三维节点数: <span className="text-amber-300 font-bold">{uploadedModelData.vertexCount} Nodes</span></div>
                    <div>三角单元数: <span className="text-pink-300 font-bold">{uploadedModelData.faceCount} Elements</span></div>
                  </div>
                  <div className="text-[10px] text-emerald-400/90 pt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>已完成几何拓扑重建，当前所有应力云图与形变求解均基于此模型！</span>
                  </div>
                </div>
              )}`;

const newBlock = `{/* Uploaded Model Inspection Card */}
              {uploadedModelData && (
                <div className={\`p-3.5 rounded-xl \${uploadedModelData.isProxyGeometry ? "bg-amber-950/30 border-amber-500/40" : "bg-emerald-950/30 border-emerald-500/40"} border text-xs font-mono space-y-2 text-slate-200\`}>
                  <div className={\`flex items-center justify-between font-bold \${uploadedModelData.isProxyGeometry ? "text-amber-300" : "text-emerald-300"}\`}>
                    <span className="flex items-center gap-1.5">
                      {uploadedModelData.isProxyGeometry ? <TriangleAlert className="w-4 h-4" /> : <FileCheck className="w-4 h-4" />}
                      <span>{uploadedModelData.fileName}</span>
                    </span>
                    <span className={\`text-[10px] px-2 py-0.5 rounded border \${uploadedModelData.isProxyGeometry ? "bg-amber-900/50 border-amber-500/50" : "bg-emerald-900/50 border-emerald-500/50"}\`}>
                      {uploadedModelData.cadSoftware || "3D CAD Solid"}
                    </span>
                  </div>
                  <div className={\`grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1 border-t \${uploadedModelData.isProxyGeometry ? "border-amber-800/40" : "border-emerald-800/40"}\`}>
                    <div>包络尺寸: <span className="text-cyan-300 font-bold">{uploadedModelData.dimensionsMm.x}×{uploadedModelData.dimensionsMm.y}×{uploadedModelData.dimensionsMm.z} mm</span></div>
                    <div>估计体积: <span className="text-purple-300 font-bold">{uploadedModelData.estimatedVolumeCm3} cm³</span></div>
                    <div>三维节点数: <span className="text-amber-300 font-bold">{uploadedModelData.vertexCount} Nodes</span></div>
                    <div>三角单元数: <span className="text-pink-300 font-bold">{uploadedModelData.faceCount} Elements</span></div>
                  </div>
                  {uploadedModelData.isProxyGeometry ? (
                    <div className="text-[10.5px] leading-relaxed text-amber-400/95 pt-1 font-sans font-medium">
                      <p className="font-bold flex items-center gap-1 mb-1">
                        <TriangleAlert className="w-3.5 h-3.5" /> 
                        浏览器环境解析 STEP 拓扑受限！
                      </p>
                      为了保持纯前端极速体验，目前对于复杂 B-Rep NURBS 曲线（.STEP/.STP）会自动降级为尺寸相等的等效包络几何体进行有限元测算。如需加载您 100% 真实形状进行分析，<strong className="text-amber-200">请在 SolidWorks / NX 等软件中直接导出为 .STL 格式（三角网格）后重新上传！</strong>
                    </div>
                  ) : (
                    <div className="text-[10px] text-emerald-400/90 pt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>已完成纯前端 STL/OBJ 几何拓扑重建，当前所有应力云图与形变求解均基于真实网格模型！</span>
                    </div>
                  )}
                </div>
              )}`;

content = content.replace(originalBlock, newBlock);
fs.writeFileSync('src/components/FEASimulation/FEASimulationHub.tsx', content);
