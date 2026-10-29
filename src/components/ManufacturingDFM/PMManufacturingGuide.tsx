import React, { useState } from "react";
import {
  Layers,
  BookOpen,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ShieldAlert,
  Flame,
  Award,
  Cpu,
  Boxes,
  Workflow,
  Wrench,
  Zap,
  Tag,
  Palette,
  Eye,
  Sliders,
} from "lucide-react";

export const PMManufacturingGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState<
    "npi_lifecycle" | "processes_deep" | "cmf_surface" | "cost_vave" | "supplier_signoff"
  >("npi_lifecycle");

  // Interactive BOM Calculator State
  const [targetVolume, setTargetVolume] = useState<number>(5000);
  const [rawMaterialCost, setRawMaterialCost] = useState<number>(12); // RMB
  const [cycleTimeSeconds, setCycleTimeSeconds] = useState<number>(25); // Seconds
  const [machineHourlyRate, setMachineHourlyRate] = useState<number>(85); // RMB/hour
  const [toolingTotalCost, setToolingTotalCost] = useState<number>(45000); // Tooling RMB
  const [surfaceTreatmentCost, setSurfaceTreatmentCost] = useState<number>(3.5); // RMB
  const [laborAssemblySeconds, setLaborAssemblySeconds] = useState<number>(40); // Seconds
  const [laborHourlyRate, setLaborHourlyRate] = useState<number>(35); // RMB/hour
  const [scrapYieldRate, setScrapYieldRate] = useState<number>(96); // % yield

  // Calculations
  const machineCostPerUnit = (cycleTimeSeconds / 3600) * machineHourlyRate;
  const amortizedToolingCost = toolingTotalCost / Math.max(1, targetVolume);
  const laborCostPerUnit = (laborAssemblySeconds / 3600) * laborHourlyRate;
  const subtotalBeforeScrap =
    rawMaterialCost + machineCostPerUnit + amortizedToolingCost + surfaceTreatmentCost + laborCostPerUnit;
  const scrapLossCost = subtotalBeforeScrap * (1 - scrapYieldRate / 100);
  const totalBOMUnitCost = subtotalBeforeScrap + scrapLossCost;

  return (
    <div className="space-y-6">
      {/* Top PM Role Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Hardware PM Strategy & Encyclopedia
              </span>
              <span className="text-xs text-slate-400 font-mono">
                // 硬件产品经理 (PM) 制造工艺全解析与成本把控
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Award className="w-6 h-6 text-indigo-400" />
              硬件产品经理的制造工艺与成本决策体系
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              作为硬件与机器人产品经理（PM），制造工艺不仅是“结构实现手段”，更是<strong>商业闭环、毛利率（BOM Cost）、量产良率（CPK）、交付风险与产品质感（CMF）</strong>的核心支柱。在项目各阶段做出最优工艺权衡（Trade-off），是顶级硬件 PM 的核心护城河。
            </p>
          </div>

          <div className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-3.5 shrink-0 text-center shadow-lg">
            <span className="text-[10px] text-indigo-400 font-mono block uppercase">PM 核心思维模型</span>
            <span className="text-xs font-bold text-white block mt-0.5">功能 × 外观 × 成本 × 工期</span>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800/80 overflow-x-auto">
          {[
            { id: "npi_lifecycle", label: "1. NPI 阶段门径与 PM 决策", icon: Workflow },
            { id: "processes_deep", label: "2. 四大成型工艺深度解析", icon: Boxes },
            { id: "cmf_surface", label: "3. CMF 表面处理全景矩阵", icon: Palette },
            { id: "cost_vave", label: "4. BOM 成本模型与 VAVE 降本", icon: DollarSign },
            { id: "supplier_signoff", label: "5. 试模签样与防坑实战", icon: ShieldAlert },
          ].map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                    : "bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {sec.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: NPI Lifecycle & Stage Gates */}
      {activeSection === "npi_lifecycle" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Workflow className="w-4 h-4 text-indigo-400" />
              NPI (New Product Introduction) 硬件研发全生命周期与产品经理决策卡点
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              硬件不同于纯软件，具有<strong>“改模成本极高、物理制造周期长、沉没成本不可逆”</strong>的物理属性。PM 必须在每个 Gate（阶段门径）严格把关输出物与开模预算。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 pt-2">
              {[
                {
                  stage: "PoC / 概念阶段",
                  sub: "Proof of Concept",
                  qty: "1 ~ 5 台",
                  pmFocus: "可行性评估与 PRD 边界",
                  toolingRule: "【绝对禁止开模】",
                  tech: "3D打印 / 现成标准件 / 激光割板",
                  gatePass: "机械自由度正常，核心物理指标可达",
                  badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
                },
                {
                  stage: "EVT / 工程验证",
                  sub: "Engineering Verification",
                  qty: "5 ~ 20 台",
                  pmFocus: "功能、结构强度与走线配合",
                  toolingRule: "【免模具 / 仅硅胶软模】",
                  tech: "PA12 尼龙 / 3轴 CNC 铝 / 硅胶复模",
                  gatePass: "整机通过连续运动与带载温升测试",
                  badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
                },
                {
                  stage: "DVT / 设计验证",
                  sub: "Design Verification",
                  qty: "50 ~ 200 台",
                  pmFocus: "模具正式签样与严苛环测",
                  toolingRule: "【正式开模 / 铝简易模】",
                  tech: "正式注塑/压铸模 (T0/T1试模)",
                  gatePass: "跌落/高低温/寿命/EMC 认证测试通过",
                  badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
                },
                {
                  stage: "PVT / 生产验证",
                  sub: "Production Verification",
                  qty: "100 ~ 500 台",
                  pmFocus: "产线直通率与作业节拍 UPPH",
                  toolingRule: "【模具微调，工装治具齐备】",
                  tech: "批量注塑 + 自动化装配治具",
                  gatePass: "产线直通率 FPY ≥ 95%，CPK ≥ 1.33",
                  badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
                },
                {
                  stage: "MP / 大规模量产",
                  sub: "Mass Production",
                  qty: "1000+ 台 / 批",
                  pmFocus: "供应链交付、良率与 VAVE 降本",
                  toolingRule: "【一模多穴硬钢模 / 自动化】",
                  tech: "高效率注塑 / 压铸 / 级进冲压",
                  gatePass: "持续准时交付，客退率 (RMA) < 0.5%",
                  badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${item.badgeColor}`}>
                      Gate {idx}: {item.stage}
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono mt-1">{item.sub}</div>
                    <div className="text-xs font-bold text-white mt-1">试制规模：{item.qty}</div>
                  </div>

                  <div className="space-y-1.5 text-[11px] border-t border-slate-800/80 pt-2 text-slate-300">
                    <div>
                      <span className="text-slate-500">PM 核心关卡：</span>
                      <p className="font-semibold text-slate-200">{item.pmFocus}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">模具决策：</span>
                      <p className="font-bold text-amber-400 text-[10px]">{item.toolingRule}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">主力工艺：</span>
                      <p className="text-slate-400 text-[10px]">{item.tech}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">放行通过标准：</span>
                      <p className="text-emerald-400 text-[10px] font-medium">{item.gatePass}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PM Key Mindset Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                硬件 PM 最致命的 3 个时间与成本陷阱
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed list-disc list-inside">
                <li><strong>过早开模：</strong>在 EVT 阶段未做充分实装前就付数十万开注塑钢模，一旦改结构，模具直接报废。</li>
                <li><strong>忽视长交期物料 (LTA)：</strong>未把控注塑模具制造（25~35天）、特殊表面阳极调色（7天）的周期，导致整机发布延期。</li>
                <li><strong>盲目追求严苛公差：</strong>未区分配合面与自由面，导致整机加工机时费暴涨 200%。</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                PM 控制模具投资回报率 (ROI) 的法则
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>模具摊销公式：</strong> 单件分摊 = 模具总费 / 全生命周期预期销量。<br />
                - 若年销量仅 <strong>300 件</strong>，开 6 万元钢模，单件分摊高达 <strong>¥200</strong>，还不如直接 CNC 或硅胶复模！<br />
                - 若年销量达 <strong>20,000 件</strong>，开模费分摊仅 <strong>¥3/件</strong>，注塑材料费只要 ¥2，综合降本 90%。
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                跨部门协同话术 (PM 破局法)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                - 对 <strong>ID (外观设计)</strong>：“这处圆弧造型会导致模具必须做三向斜顶滑块，若微调 1.5°，开模费可降 ¥15,000，且完全不影响视觉正面线条。”<br />
                - 对 <strong>MD (结构设计)</strong>：“我们优先选用统一规格的 M3 压铆铜螺母和标准轴承，减少 BOM SKU 数量，装配线工人不易拿错料。”
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: 4 Core Processes Deep-Dive */}
      {activeSection === "processes_deep" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Process 1: Injection Molding */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                    01
                  </span>
                  <h3 className="text-sm font-bold text-white">注塑成型 (Injection Molding)</h3>
                </div>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/40">
                  塑料结构件之王 (批量 &gt; 500)
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <p><strong>原理机制：</strong> 将热塑性塑料颗粒（ABS/PC/PA66/POM/PP）加热熔融，通过高压螺杆注入模具型腔中，经保压冷却后由顶针顶出成型。单模周期仅需 15~45 秒。</p>
                <p><strong>常用材料矩阵：</strong>
                  <br />• <strong>ABS：</strong> 综合刚性好、易电镀喷油、流动性好、性价比极高（家用机壳首选）；
                  <br />• <strong>PC / PC+ABS：</strong> 高抗冲击韧性、耐摔、耐温、阻燃级别高（工业机器人壳体标配）；
                  <br />• <strong>PA66 + 30%GF (玻纤)：</strong> 极高抗弯曲刚度与耐磨性（机械齿轮、传动连杆）；
                  <br />• <strong>POM (赛钢)：</strong> 自润滑、耐疲劳、耐磨性极佳（精密减速箱齿轮、滑块）；
                </p>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-amber-400">PM 必须懂的 6 大注塑缺陷及对策：</span>
                  <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-0.5">
                    <li><strong className="text-slate-200">缩水 (Sink Mark)：</strong> 胶位过厚（筋位厚度 &gt; 主壁厚的 60%）导致内部收缩凹陷。对策：减胶掏空、增加背面晒纹掩盖。</li>
                    <li><strong className="text-slate-200">飞边/披锋 (Flash)：</strong> 锁模力不足或模具分型面磨损溢胶。对策：调大注塑机锁模吨位、修配模具。</li>
                    <li><strong className="text-slate-200">熔接痕 (Weld Line)：</strong> 两股熔融塑料汇聚未充分熔融留下的细线（强度薄弱）。对策：优化浇口位置、提高模温。</li>
                    <li><strong className="text-slate-200">顶白/顶伤 (Ejector Mark)：</strong> 拔模斜度不足或保压过紧，顶针强行顶出导致发白。对策：加大拔模角、增大顶针面积。</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Process 2: Die Casting */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    02
                  </span>
                  <h3 className="text-sm font-bold text-white">金属压铸 (Die Casting)</h3>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
                  高强金属批量化 (铝/镁/锌)
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <p><strong>原理机制：</strong> 将熔化的铝合金（ADC12 / A380）、镁合金（AZ91D）或锌合金（Zamak 3）在高压（数百兆帕）下高速压入高耐热钢模（H13 / 8407）型腔中，快速成型复杂金属外壳。</p>
                <p><strong>合金选型要点：</strong>
                  <br />• <strong>ADC12 铝合金：</strong> 铸造流动性极佳、导热散热好、轻量高强（机器人减速机关节壳体、大功率电机座）；
                  <br />• <strong>AZ91D 镁合金：</strong> 密度仅为铝的 2/3，吸振减震与电磁屏蔽性顶级（轻量化外骨骼、无人机机架）；
                  <br />• <strong>锌合金：</strong> 熔点低（400℃），模具寿命长达百万模，表面电镀附着力极强（高端精密小五金、铰链轴承）。
                </p>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-400">PM 关键成本考量：</span>
                  <p className="text-[11px] text-slate-400">
                    压铸件从模具出来后通常带有披锋飞边，需要<strong>“去水口 + 抛丸/喷砂 + 关键配合位二次 CNC 精修（打轴承孔/攻牙）”</strong>。PM 核算成本时必须加上二次机加费与去毛刺工时。
                  </p>
                </div>
              </div>
            </div>

            {/* Process 3: Sheet Metal & Stamping */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    03
                  </span>
                  <h3 className="text-sm font-bold text-white">钣金与冲压 (Sheet Metal & Stamping)</h3>
                </div>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/40">
                  小批量柔性 vs 大批量秒出
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <p><strong>两种不同规模路径：</strong>
                  <br />• <strong>小批量柔性钣金 (1~500件)：</strong> 激光光纤切割落料 + 数控折弯机折弯。<strong>零模具费</strong>，图纸展开即可加工，交期仅 1~2 天。
                  <br />• <strong>大批量连续级进模 (10,000+件)：</strong> 一套冲压模集成“冲孔-切边-折弯-压凸包-切断”多工位，每分钟冲压 60~200 次，单件成本压至几毛钱。
                </p>
                <p><strong>常用材料：</strong> 5052-H32 铝板（易折弯不裂）、SPCC 冷轧板（需电泳/喷粉防锈）、SECC 镀锌板（耐腐蚀免烤漆）、304 不锈钢（高刚度耐刮）。</p>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[11px] font-bold text-indigo-400">PM 结构合并秘诀：</span>
                  <p className="text-[11px] text-slate-400">
                    充分利用<strong>“压铆螺柱 (PEM Nut)”</strong>与<strong>“加强筋 (Ribs)”</strong>：通过钣金上压出一道 1.5mm 的凸筋，可使薄板抗弯刚度提升 300%，避免使用昂贵的厚板材。
                  </p>
                </div>
              </div>
            </div>

            {/* Process 4: CNC & MIM & Extrusion */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                    04
                  </span>
                  <h3 className="text-sm font-bold text-white">CNC 机加 / 挤压 / MIM 金属注射</h3>
                </div>
                <span className="text-xs font-mono text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800/40">
                  精密加工与特种成型
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <p>• <strong>CNC 数控机加 (3轴/5轴)：</strong> 减材制造，精度达 ±0.005mm（丝级）。主要成本在于<strong>“机时费（通常 60~120元/小时）+ 装夹人工”</strong>。适合高精度旋转轴承位、减速机法兰盘与打样阶段。</p>
                <p>• <strong>铝合金挤压成型 (Extrusion)：</strong> 将加热的 6063 铝棒从截面模具中挤出（拉伸成恒定截面长条）。<strong>模具费极其便宜（仅 ¥3000~¥5000）</strong>，适用于长条形外壳、机械臂大臂连杆、散热器。</p>
                <p>• <strong>MIM (金属粉末注射成型)：</strong> 类似注塑，将微米级金属粉末（不锈钢 316L / 17-4PH）与粘结剂混合注射成型，再高温脱脂烧结。适用于<strong>小指头大小、形状极度复杂的微型精密高硬度金属零件</strong>（如折叠屏铰链、机械手微型指骨节），批量单件仅需几块钱！</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: CMF & Surface Treatments */}
      {activeSection === "cmf_surface" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-400" />
                CMF (Color, Material, Finish) 表面处理全景矩阵与 PM 质感把控
              </h3>
              <span className="text-xs text-slate-400 font-mono">外观决定产品定位与用户第一触觉</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              表面处理不仅能带来高端科技质感，还承担着<strong>耐磨损、抗指纹、耐盐雾腐蚀、绝缘/导电屏蔽</strong>等核心可靠性功能。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* CMF 1: Anodizing */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-cyan-400">阳极氧化 (Anodizing)</h4>
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800/40">铝合金专属</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>原理：</strong> 铝在电解液中作为阳极，通过电化学反应在表面生成致密多孔的 Al2O3 氧化膜（厚度 8~25μm），并可通过染料吸附染出深空灰、科技黑、香槟金等高端金属色。
                </p>
                <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-800/60">
                  <div>• <strong>本色/喷砂阳极：</strong> 表面先用 120#~180# 陶瓷砂喷砂消除刀纹，再做阳极氧化，质感细腻如苹果 MacBook。</div>
                  <div>• <strong>硬质阳极氧化 (Hard Anodizing)：</strong> 膜厚达 30~50μm，硬度极高（HV 400+），耐磨耐刮，专用于机械臂关节受力摩擦部位。</div>
                </div>
              </div>

              {/* CMF 2: Spraying & Coating */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-400">喷涂工艺 (Spraying)</h4>
                  <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800/40">塑料 & 金属通用</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>常用喷涂类型：</strong>
                  <br />• <strong>PU 烤漆 / 双组分漆：</strong> 附着力好，可调任意潘通色 (Pantone)，光泽度从全哑光 (0°~10°) 到高光 (80°+) 自由设定；
                  <br />• <strong>手感漆 (Rubber Paint)：</strong> 赋予塑料如婴儿肌肤般的微弹性温润触感，但长期耐紫外线老化与抗刮性较弱；
                  <br />• <strong>粉末静电喷涂 (Powder Coating)：</strong> 用于大型机箱钣金，涂层厚（60~100μm），耐候耐刮耐摔，极其环保且成本低。
                </p>
              </div>

              {/* CMF 3: PVD & Plating */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-purple-400">真空镀 PVD / NCVM</h4>
                  <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800/40">镜面金属光泽</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>原理与应用：</strong>
                  <br />• <strong>PVD (物理气相沉积)：</strong> 在真空腔体中将金属靶材离子化沉积于零件表面，硬度极高（如钛金、炫彩渐变色），用于高端手表、智能手环按键；
                  <br />• <strong>NCVM (不导电真空电镀)：</strong> 在塑料壳体表面镀出逼真的亮银金属镜面质感，但<strong>完全不阻挡 5G / Wi-Fi / 蓝牙无线射频信号</strong>，天线区域机壳首选。
                </p>
              </div>
            </div>

            {/* Graphics & Text Process Comparison */}
            <div className="border border-slate-800 rounded-xl overflow-hidden mt-4">
              <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 text-xs font-bold text-slate-200">
                机壳图文字符印刷工艺对比 (Logo / 接口标识 / 警示标)
              </div>
              <div className="divide-y divide-slate-800/80 text-xs">
                {[
                  {
                    tech: "激光镭雕 (Laser Etching)",
                    cost: "¥0.2~¥0.5 / 处",
                    pros: "无需菲林制版，软件随改随雕，永不脱落磨损，线条极细",
                    cons: "只能雕出单色（材料基底本色），无法做多色彩色",
                    recommendation: "用于产品序列号 (SN)、接口 Type-C 标识、铭牌规格参数",
                  },
                  {
                    tech: "丝网印刷 (Screen Printing)",
                    cost: "制版费 ¥80 + ¥0.5/色",
                    pros: "墨层厚实、遮盖力强、色彩鲜艳饱满、成本低",
                    cons: "只能在平整表面印刷，曲面上容易变形漏墨",
                    recommendation: "用于机箱正面的大面积品牌 Logo、彩色警示标识",
                  },
                  {
                    tech: "移印 (Pad Printing)",
                    cost: "钢板制版 ¥150 + ¥0.6/件",
                    pros: "采用硅胶软胶头，可在复杂三维曲面、凹凸不平的侧面精准套印",
                    cons: "墨层相对较薄",
                    recommendation: "用于鼠标按键侧面、机械臂圆柱形关节外壳上的小图标",
                  },
                  {
                    tech: "模具咬花 / 晒纹 (Mold-Tech)",
                    cost: "模具费一次性增加 ¥1500~¥3000",
                    pros: "直接在注塑模具钢材上做化学蚀刻。注塑出来的零件自带细腻微磨砂颗粒，零单件印刷成本！",
                    cons: "模具晒纹后如果想改光面需要重新抛光",
                    recommendation: "【量产神器】手握部位、外壳大面做 MT-11010/MT-11020 纹理，既防滑又能掩盖内部缩水",
                  },
                ].map((row, i) => (
                  <div key={i} className="p-3 grid grid-cols-1 md:grid-cols-4 gap-2 bg-slate-900/40">
                    <span className="font-bold text-slate-200">{row.tech}</span>
                    <span className="font-mono text-cyan-400">{row.cost}</span>
                    <span className="text-slate-300 md:col-span-2 text-[11px]">
                      <strong>优缺点：</strong> {row.pros}（{row.cons}）
                      <br />
                      <strong className="text-indigo-400">推荐场景：</strong> {row.recommendation}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: Cost Breakdown & VAVE */}
      {activeSection === "cost_vave" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Interactive Cost Simulator */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                硬件 PM 结构件全要素单件 BOM 成本动态模拟器
              </h3>

              <div className="space-y-3 text-xs">
                {/* Volume slider */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">全寿命预计销量 (Target Volume)</span>
                    <span className="font-mono font-bold text-emerald-400">{targetVolume.toLocaleString()} 件</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="50000"
                    step="100"
                    value={targetVolume}
                    onChange={(e) => setTargetVolume(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Tooling cost input */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <label className="text-[11px] text-slate-400">模具与工装费 (Tooling RMB)</label>
                    <input
                      type="number"
                      value={toolingTotalCost}
                      onChange={(e) => setToolingTotalCost(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <label className="text-[11px] text-slate-400">原材料净费 (Raw Material RMB)</label>
                    <input
                      type="number"
                      value={rawMaterialCost}
                      onChange={(e) => setRawMaterialCost(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* Cycle time & hourly rate */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <label className="text-[11px] text-slate-400">单件成型节拍 (Cycle Time 秒)</label>
                    <input
                      type="number"
                      value={cycleTimeSeconds}
                      onChange={(e) => setCycleTimeSeconds(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <label className="text-[11px] text-slate-400">成型设备机时单价 (RMB/小时)</label>
                    <input
                      type="number"
                      value={machineHourlyRate}
                      onChange={(e) => setMachineHourlyRate(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* Surface & Assembly */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <label className="text-[11px] text-slate-400">表面处理费 (CMF RMB/件)</label>
                    <input
                      type="number"
                      value={surfaceTreatmentCost}
                      onChange={(e) => setSurfaceTreatmentCost(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <label className="text-[11px] text-slate-400">综合生产良品率 (% Yield)</label>
                    <input
                      type="number"
                      value={scrapYieldRate}
                      onChange={(e) => setScrapYieldRate(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Calculated Result Card */}
              <div className="bg-slate-950 rounded-xl p-4 border border-emerald-500/40 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">核算单件结构件总 BOM 成本：</span>
                  <span className="text-xl font-mono font-extrabold text-emerald-400">
                    ¥{totalBOMUnitCost.toFixed(2)} / 件
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                  <div>材料费: ¥{rawMaterialCost.toFixed(1)}</div>
                  <div>机时费: ¥{machineCostPerUnit.toFixed(2)}</div>
                  <div>模具分摊: ¥{amortizedToolingCost.toFixed(2)}</div>
                  <div>表面处理: ¥{surfaceTreatmentCost.toFixed(1)}</div>
                  <div>人工组装: ¥{laborCostPerUnit.toFixed(2)}</div>
                  <div className="text-amber-400">报废损耗: ¥{scrapLossCost.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Right: VAVE 5 Levers for Cost Reduction */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-cyan-400" />
                  硬件 PM 必须掌握的 VAVE 降本 5 大杠杆 (价值工程分析)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  在保证产品核心体验与性能不变的前提下，通过结构优化与工艺替代挖掘毛利空间：
                </p>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      杠杆 1：零件合并与一体化注塑 (DFMA)
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      将原先由“上盖 + 支架 + 限位块”3 个零件组装的结构，合并为一个带自限位特征的注塑件。不仅减少 2 套模具费，还能消灭 4 颗螺丝与产线人工锁螺丝工时。
                    </p>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-cyan-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      杠杆 2：消除倒扣，将侧滑块转为对碰插穿
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      外壳侧面的卡扣或散热孔通常需要模具制作昂贵的“侧向行位/滑块 (Slider)”。通过在分型面上设计上下公母模对碰插穿孔，模具结构回归简单的“前后开合”，模具费立省 25%~40%。
                    </p>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-indigo-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      杠杆 3：模具晒纹代替二次喷漆
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      喷涂一次不仅增加 ¥3~¥8/件 的喷涂加工费，良品率还会因环境灰尘颗粒掉落降低 5%~10%。直接在模具上做 MT-11020 晒纹，出模即具备高级磨砂质感，零二次加工费。
                    </p>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-purple-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      杠杆 4：紧固件与螺丝规格统一化 (Standardization)
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      整机螺丝严格限制为不超过 2 种规格（如全机只有 M2.5×6 和 M3×8 黑锌杯头螺丝）。产线工人不需要中途换电批批头，避免装配时混用长螺丝顶破内部 PCB 电路板。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: Supplier Sign-off & Defense */}
      {activeSection === "supplier_signoff" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              模具试模签样流程与供应商谈判防坑指南 (T0 ~ T3 试模体系)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              模具不是一开出来就是完美的，经历多次试模修模是工程常态。PM 必须掌握试模各阶段的标准，避免被模具厂“忽悠签样入库”。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 pt-2">
              {[
                {
                  phase: "T0 试模 (首件出样)",
                  target: "检验模具能否正常打饱与脱模",
                  standard: "通常使用黑色或原料胶粒试打。允许表面有轻微缩水或划伤，重点核验装配大尺寸干涉。",
                  pmAction: "带上 3D 打印件或 PCB 主板做实物落位干涉初测。",
                },
                {
                  phase: "T1 试模 (全尺寸送检 FAI)",
                  target: "尺寸修正与公差收敛",
                  standard: "模具厂根据 T0 反馈修模后出件。必须提供三坐标 (CMM) FAI 全尺寸测量报告，关键公差合规率 ≥ 90%。",
                  pmAction: "组织结构与硬件工程师召开 T1 评审会，锁定未达标尺寸。",
                },
                {
                  phase: "T2 试模 (CMF 与外观确认)",
                  target: "颜色、光泽度与表面纹理锁定",
                  standard: "使用正式量产色母打样，完成模具晒纹咬花。色差仪测量色差 ΔE ≤ 1.0 (潘通色号一致)。",
                  pmAction: "ID 外观设计师与 PM 共同签核【外观限度样品 (Golden Sample)】。",
                },
                {
                  phase: "T3 试模 / 试产 (小批量连续打)",
                  target: "连续生产稳定性与节拍验证",
                  standard: "连续注塑 300~500 模，测试模具热平衡状态下的尺寸稳定性，统计制程能力 CPK ≥ 1.33。",
                  pmAction: "确认合格后签署《模具验收报告》，结算模具尾款，移交量产产线。",
                },
              ].map((t, idx) => (
                <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <span className="text-xs font-bold text-amber-400 font-mono block">
                    {t.phase}
                  </span>
                  <div className="text-[11px] font-semibold text-slate-200">目标：{t.target}</div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    <strong>标准：</strong>{t.standard}
                  </p>
                  <div className="text-[10px] text-indigo-300 bg-indigo-950/40 p-2 rounded border border-indigo-900/40 mt-2">
                    <strong>PM 实战动作：</strong>{t.pmAction}
                  </div>
                </div>
              ))}
            </div>

            {/* PM Golden Sign-off Rules */}
            <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4 space-y-2 mt-4">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                签样黄金铁律：三级限度样件制度 (Limit Samples)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                在量产验收时，PM 绝不能只依赖主观“肉眼看好不好看”，必须与模具厂和供应商共同制作封存<strong>【三级限度样件】</strong>，双方签字盖章封样：
                <br />1. <strong>黄金标准样 (Golden Sample)：</strong> 完美理想样件，作为基准参照；
                <br />2. <strong>上限接收样 (Upper Limit)：</strong> 颜色略偏亮/毛刺最大可容忍临界点；
                <br />3. <strong>下限接收样 (Lower Limit)：</strong> 颜色略偏暗/缩水微弱临界点。凡是超出上下限范围的来料，品质 QC 直接拒收退货！
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
