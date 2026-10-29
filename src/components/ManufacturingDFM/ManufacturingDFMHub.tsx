import React, { useState, useMemo } from "react";
import {
  Factory,
  DollarSign,
  Layers,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  TrendingDown,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Cpu,
  FileSpreadsheet,
  Download,
  Info,
  HelpCircle,
  BarChart3,
  Box,
  Flame,
  Award,
} from "lucide-react";
import { PMManufacturingGuide } from "./PMManufacturingGuide";

// Types
type StageType = "poc" | "evt" | "dvt" | "mp";
type PartCategory = "housing" | "bracket" | "gear" | "heatsink" | "finger_link" | "chassis";

interface ProcessOption {
  name: string;
  category: "3D_PRINT" | "CNC" | "CASTING" | "SHEET_METAL" | "TOOLING" | "EXTRUSION";
  toolingCost: number; // In RMB
  unitCost: (qty: number) => number;
  leadTimeDays: number;
  tolerance: string;
  materials: string[];
  pros: string[];
  cons: string[];
  recommendation: string;
  costTraps: string[];
}

export const ManufacturingDFMHub: React.FC = () => {
  // State
  const [selectedStage, setSelectedStage] = useState<StageType>("poc");
  const [partCategory, setPartCategory] = useState<PartCategory>("housing");
  const [quantity, setQuantity] = useState<number>(5);
  const [targetStrength, setTargetStrength] = useState<"low" | "medium" | "high">("medium");
  const [surfaceRequirement, setSurfaceRequirement] = useState<"rough" | "smooth" | "industrial">("smooth");
  const [activeSubTab, setActiveSubTab] = useState<"cost_calculator" | "process_matrix" | "dfm_rules" | "pm_knowledge_base" | "supplier_guide">("pm_knowledge_base");

  // Stages definition
  const STAGES = [
    {
      id: "poc" as StageType,
      name: "阶段 0: 原理验证 (PoC)",
      qtyRange: "1 ~ 5 套",
      budgetMindset: "极限省钱，快打快改，零开模费",
      coreGoal: "验证机械自由度、连杆运动学、电机扭矩，允许外观粗糙",
      mainTech: "FDM 打印 / 光敏树脂 (SLA) / 激光切割亚克力 / 标准铝型材",
    },
    {
      id: "evt" as StageType,
      name: "阶段 1: 工程样机 (EVT)",
      qtyRange: "5 ~ 20 套",
      budgetMindset: "小批量低成本，结构刚度与实机装配验证",
      coreGoal: "验证实际负载受力、散热温升、真实走线与公差配合",
      mainTech: "尼龙 SLS/MJF / 铝合金 3 轴 CNC / 硅胶复模 (小批量代开模)",
    },
    {
      id: "dvt" as StageType,
      name: "阶段 2: 设计验证 (DVT)",
      qtyRange: "20 ~ 100 套",
      budgetMindset: "简易模/软模切入，单件成本断崖式下降",
      coreGoal: "验证量产装配良率、跌落冲击可靠性、小批量客户内测",
      mainTech: "铝合金简易模 (Soft Tooling) / 钣金连续冲折 / 低压灌注 (RIM)",
    },
    {
      id: "mp" as StageType,
      name: "阶段 3: 大规模量产 (MP)",
      qtyRange: "1000+ 套",
      budgetMindset: "高初期模具投入，换取单件极致几块钱成本",
      coreGoal: "规模化效益、全自动化注塑与压铸、CPK质量控制",
      mainTech: "S136/NAK80 淬火钢注塑模 / 铝/镁压铸模 / 多工位级进冲压",
    },
  ];

  // Database of Process Options depending on part category and parameters
  const processOptions: ProcessOption[] = useMemo(() => {
    switch (partCategory) {
      case "housing":
        return [
          {
            name: "光敏树脂 3D 打印 (SLA / 8000/9000)",
            category: "3D_PRINT",
            toolingCost: 0,
            unitCost: (q) => Math.max(25, 65 - Math.log10(q) * 8),
            leadTimeDays: 1,
            tolerance: "±0.15 mm",
            materials: ["白树脂", "高韧性树脂", "耐温树脂 (75℃)"],
            pros: ["完全无需模具", "表面光洁如注塑件", "24小时极速交期", "几件起订成本极低"],
            cons: ["易老化脆化", "受力较弱", "不可长期接触超过60℃热源"],
            recommendation: "【前期首选】前期第1~5套外观壳体、主控盒盖板绝对首选，几十元搞定！",
            costTraps: ["壁厚不要超过4mm，实心过厚会按克重额外计费；薄壁维持在1.5~2.2mm最划算。"],
          },
          {
            name: "尼龙 3D 打印 (SLS / MJF 惠普多射流)",
            category: "3D_PRINT",
            toolingCost: 0,
            unitCost: (q) => Math.max(45, 110 - Math.log10(q) * 12),
            leadTimeDays: 2,
            tolerance: "±0.2 mm",
            materials: ["PA12 尼龙", "PA12+玻纤 (高刚度)"],
            pros: ["无需模具", "结构强度极高", "抗冲击、耐疲劳", "可直接当功能件拧自攻螺丝"],
            cons: ["表面呈微磨砂颗粒感", "高光外观需喷油后处理"],
            recommendation: "【工程功能首选】OpenArm 关节壳体、夹爪外骨骼在 EVT 阶段的黄金工艺！",
            costTraps: ["零件镂空后一定要留排粉孔（至少4mm），否则内部存粉会按实心收费。"],
          },
          {
            name: "硅胶复模 (Vacuum Casting / 真空灌注)",
            category: "CASTING",
            toolingCost: 600, // 硅胶软模费
            unitCost: (q) => Math.max(30, 85 - Math.log10(q) * 10),
            leadTimeDays: 4,
            tolerance: "±0.25 mm",
            materials: ["类ABS PU", "类PC PU", "类橡胶/硅胶 (邵氏A 30~80)"],
            pros: ["一套硅胶模仅数百元", "可翻制15~25件", "单件质感极度逼近真注塑", "可做软硬胶一体"],
            cons: ["单模寿命仅20件左右（会老化收缩）", "只适合5~50件试产区间"],
            recommendation: "【5~30套阶段神器】想给投资人看逼真注塑质感、但又不想花几万开钢模时的最佳解法！",
            costTraps: ["数量超过50件时，硅胶模需重复开多套，此时综合成本不如铝简易模。"],
          },
          {
            name: "铝合金 3轴/5轴 CNC 机加",
            category: "CNC",
            toolingCost: 0,
            unitCost: (q) => Math.max(80, 260 - Math.log10(q) * 45),
            leadTimeDays: 3,
            tolerance: "±0.03 mm",
            materials: ["AL6061-T6", "AL7075-T6", "POM赛钢", "PEEK"],
            pros: ["尺寸精度极高 (丝级)", "刚性无敌", "阳极氧化金属质感极佳"],
            cons: ["单件工时费高", "内部清角有R角限制", "结构复杂时装夹翻面增加费用"],
            recommendation: "【电机座/减速器端盖必备】用于轴承位、减速器法兰等高精度安装配合面。",
            costTraps: ["避免深腔内直角（刀具进不去需做电火花EDM，加工费直接翻倍），内角务必留R≥1.5mm！"],
          },
          {
            name: "铝合金简易模 (Soft Tooling 注塑)",
            category: "TOOLING",
            toolingCost: 4500, // 铝模
            unitCost: (q) => Math.max(6, 18 - Math.log10(q) * 2),
            leadTimeDays: 10,
            tolerance: "±0.1 mm",
            materials: ["ABS", "PC+ABS", "PP", "PA66"],
            pros: ["开模费仅为正式硬钢模的 15%~25%", "模具寿命 1000~5000 次", "真实注塑级性能"],
            cons: ["有初期模具费", "交期需1~2周", "结构修改不如3D打印灵活"],
            recommendation: "【50~500套试产利器】结构基本冻结、准备小批量送测时的终极省钱模具方案。",
            costTraps: ["若前期结构还会大改，切忌过早开模，每次改模烧焊修模都要几百上千元。"],
          },
          {
            name: "正式淬火钢注塑模 (S136/NAK80 Hard Tooling)",
            category: "TOOLING",
            toolingCost: 28000, // 钢模
            unitCost: (q) => Math.max(2.5, 6 - Math.log10(q) * 0.8),
            leadTimeDays: 25,
            tolerance: "±0.05 mm",
            materials: ["工程级 ABS/PC/PA66+GF/POM"],
            pros: ["寿命 30万~100万次", "单件成本仅需 2~5 元", "秒级出件，品质一致性极佳"],
            cons: ["模具费高昂 (数万元起)", "开模周期长 (3~5周)", "改模成本极高"],
            recommendation: "【千万别在开发前期选】只有年出货量确定在 2000 套以上时才启动！",
            costTraps: ["在没有用 3D 打印或硅胶复模做过 100% 实际装配验证前，严禁下单开硬模！"],
          },
        ];

      case "bracket":
        return [
          {
            name: "钣金激光落料 + CNC 数控折弯",
            category: "SHEET_METAL",
            toolingCost: 0,
            unitCost: (q) => Math.max(12, 45 - Math.log10(q) * 8),
            leadTimeDays: 2,
            tolerance: "±0.2 mm",
            materials: ["5052铝板 (1.5~3mm)", "SPCC冷轧板 (镀锌/烤漆)", "304不锈钢 (1~2mm)"],
            pros: ["零模具费", "单件只要十几元到几十元", "强度与抗扭刚度远超塑料", "自带螺纹压铆孔 (PEM)"],
            cons: ["结构受限于折弯干涉", "形状偏折线平面"],
            recommendation: "【机器人底盘与结构骨架王牌】凡是能设计成钣金折弯的支架，绝不要去CNC整块铝挖空！",
            costTraps: ["折弯内圆角 R 必须 ≥ 板厚 t；孔边距折弯线要留足 2t 以上，防止折弯拉变形。"],
          },
          {
            name: "铝合金 3轴 CNC 铣削",
            category: "CNC",
            toolingCost: 0,
            unitCost: (q) => Math.max(50, 180 - Math.log10(q) * 30),
            leadTimeDays: 3,
            tolerance: "±0.02 mm",
            materials: ["AL6061-T6"],
            pros: ["任意复杂立体特征", "精密销钉孔配合", "极佳的刚度"],
            cons: ["切削去料率高时材料浪费大", "多次装夹工时费高"],
            recommendation: "用于关键受力连接转接块、电机端面法兰。",
            costTraps: ["设计时尽量采用'单面加工'或'双面加工'，避免 4 面/5 面都需要翻转装夹找正。"],
          },
          {
            name: "尼龙 MJF 3D 打印 + 铜螺母热熔嵌件",
            category: "3D_PRINT",
            toolingCost: 0,
            unitCost: (q) => Math.max(35, 90 - Math.log10(q) * 12),
            leadTimeDays: 2,
            tolerance: "±0.2 mm",
            materials: ["PA12 尼龙 + 玻纤"],
            pros: ["一体化复杂拓扑结构（如蜂窝减重）", "零模具费", "轻量化"],
            cons: ["刚性略逊于铝合金"],
            recommendation: "轻负载轻量化连杆支架首选。",
            costTraps: ["塑料直接攻螺纹易滑丝，预留热熔孔并手工烙铁压入滚花铜螺母，成本只增 0.2 元但可靠度翻倍！"],
          },
        ];

      case "gear":
        return [
          {
            name: "POM 赛钢 CNC 滚齿 / 精密雕刻",
            category: "CNC",
            toolingCost: 0,
            unitCost: (q) => Math.max(30, 95 - Math.log10(q) * 15),
            leadTimeDays: 3,
            tolerance: "±0.03 mm",
            materials: ["POM (聚甲醛)", "45号钢", "黄铜"],
            pros: ["无需开模", "齿形精确", "静音耐磨 (POM)"],
            cons: ["单件工时费较高"],
            recommendation: "【开发前期 1~10 套齿轮黄金方案】验证传动比与中心距的最佳手段。",
            costTraps: ["若使用标准模数（如 0.5M, 0.8M, 1.0M, 1.5M），厂家可直接用现成滚刀，免收专用刀具费！"],
          },
          {
            name: "直接采购标准件 + CNC 轴孔改孔/开键槽",
            category: "CNC",
            toolingCost: 0,
            unitCost: (q) => Math.max(15, 38 - Math.log10(q) * 5),
            leadTimeDays: 1,
            tolerance: "±0.01 mm",
            materials: ["三益/米思米/淘宝标准齿轮 (45钢/POM/铝)"],
            pros: ["现成标准件仅 8~18 元/个", "齿形工业淬火质量极好", "只需车床打孔或割键槽"],
            cons: ["外形尺寸受限于标准目录"],
            recommendation: "【绝招：降本 80%】除非结构空间极度受限，前期一律优先买标准齿轮再微机加改轴孔！",
            costTraps: ["切忌前期从零全定制齿轮，买标准齿轮打顶丝孔可以把打样周期从 5 天压缩到 1 天！"],
          },
          {
            name: "粉末冶金 (Powder Metallurgy / 金属注射 MIM)",
            category: "TOOLING",
            toolingCost: 15000,
            unitCost: (q) => Math.max(3.5, 8 - Math.log10(q) * 1),
            leadTimeDays: 20,
            tolerance: "±0.04 mm",
            materials: ["铁基合金", "不锈钢", "铜基合金"],
            pros: ["高强度精密金属齿轮批量成本极低 (几块钱)", "自润滑多孔特性"],
            cons: ["模具费用高", "只适合 1000 件以上量产"],
            recommendation: "大批量精密减速齿轮箱阶段采用。",
            costTraps: ["前期研发切勿触碰，除非已有现成公模零件可直接借用。"],
          },
        ];

      case "heatsink":
        return [
          {
            name: "采购现成标准铝型材散热片 + CNC 简易铣底/打孔",
            category: "EXTRUSION",
            toolingCost: 0,
            unitCost: (q) => Math.max(8, 22 - Math.log10(q) * 3),
            leadTimeDays: 1,
            tolerance: "±0.1 mm",
            materials: ["6063-T5 阳极黑/原色铝型材"],
            pros: ["标准散热型材每米仅十几元", "截面散热齿极其密集高效", "只要按需截断打4个螺丝孔"],
            cons: ["齿形与间距固定"],
            recommendation: "【最省钱热学打样秘诀】查阅标准型材库，选最接近的型材截断，成本不到定制的 1/10！",
            costTraps: ["千万别拿一整块实心铝砖去 3D 铣出几十片散热鳍片，那会导致机加费高达 300+ 元！"],
          },
          {
            name: "定制铝合金挤压开模 (Aluminum Extrusion)",
            category: "EXTRUSION",
            toolingCost: 3500, // 挤压模非常便宜
            unitCost: (q) => Math.max(4, 12 - Math.log10(q) * 1.5),
            leadTimeDays: 10,
            tolerance: "±0.15 mm",
            materials: ["AL6063-T5 (高导热 k=201 W/mK)"],
            pros: ["开模费出奇便宜（只需 3000~5000 元）", "按米出货，单件成本极低", "可定制极密集薄壁齿"],
            cons: ["截面必须恒定（二维拉伸特征）", "有起订量 MOQ (通常 300~500kg)"],
            recommendation: "外壳集成散热鳍片、长条形机箱外壳的低成本量产利器！",
            costTraps: ["挤压齿高与齿距之比（齿高比）不要超过 8:1，否则挤压模具易断齿。"],
          },
          {
            name: "实心铝 3轴 CNC 雕刻打样",
            category: "CNC",
            toolingCost: 0,
            unitCost: (q) => Math.max(120, 320 - Math.log10(q) * 40),
            leadTimeDays: 3,
            tolerance: "±0.05 mm",
            materials: ["AL6061", "C1100 红铜"],
            pros: ["无需任何模具或起订量", "底板与鳍片一体", "完全自由尺寸定制"],
            cons: ["非常昂贵，机加工时极长"],
            recommendation: "仅在尺寸极度特殊（如贴合曲面、异形安装位）且只打样 1~2 件时使用。",
            costTraps: ["翅片厚度不要设计小于 1.0mm，否则高速铣削时刀具共振会导致翅片折弯变形。"],
          },
        ];

      case "finger_link":
        return [
          {
            name: "高韧性尼龙 3D 打印 (MJF / PA12) + PEEK 绳道衬套",
            category: "3D_PRINT",
            toolingCost: 0,
            unitCost: (q) => Math.max(18, 48 - Math.log10(q) * 6),
            leadTimeDays: 2,
            tolerance: "±0.15 mm",
            materials: ["HP PA12 / PA11 (韧性更好)"],
            pros: ["零模具费", "轻量化 (密度 1.01g/cm³)", "内嵌复杂三维光滑走绳道 (S曲面)", "跌落不断裂"],
            cons: ["高频滑动处长期耐磨需内嵌小衬套"],
            recommendation: "【AmazingHand / 灵巧手最佳工艺】灵巧手各指节与腱绳滑轮座的绝配。",
            costTraps: ["绳孔内部不要设计直角拐角，设计为 R≥2mm 的光滑圆弧过渡，防止磨断大力马线。"],
          },
          {
            name: "柔性软胶 3D 打印 (TPU 95A / 85A)",
            category: "3D_PRINT",
            toolingCost: 0,
            unitCost: (q) => Math.max(20, 55 - Math.log10(q) * 8),
            leadTimeDays: 2,
            tolerance: "±0.25 mm",
            materials: ["TPU 弹性体"],
            pros: ["柔软具备高摩擦力抓取", "自适应形变包裹异形物体", "耐磨防撞"],
            cons: ["无法作为硬支撑骨架"],
            recommendation: "用于灵巧手仿生指尖软垫、防滑抓握指腹。",
            costTraps: ["将指骨骨架(尼龙)与指尖软垫(TPU)做成卡扣/分体装配，避免昂贵复杂的双色注塑！"],
          },
          {
            name: "航空铝 7075 5轴 CNC 精密加工",
            category: "CNC",
            toolingCost: 0,
            unitCost: (q) => Math.max(90, 280 - Math.log10(q) * 40),
            leadTimeDays: 4,
            tolerance: "±0.015 mm",
            materials: ["AL7075-T6"],
            pros: ["极限强度与刚度", "微型深沟球轴承精密压装配合"],
            cons: ["成本昂贵", "微型指骨加工刀具细易断刀"],
            recommendation: "用于工业重载机械手抓夹、高精度关节连杆。",
            costTraps: ["微小零件务必合并在一个料夹上批量加工（拼料夹），否则单件找正装夹费是材料费的 5 倍！"],
          },
        ];

      case "chassis":
        return [
          {
            name: "标准欧标/国标铝型材 (2020 / 3030) + 3D 打印转角连接件",
            category: "EXTRUSION",
            toolingCost: 0,
            unitCost: (q) => Math.max(35, 80 - Math.log10(q) * 10),
            leadTimeDays: 1,
            tolerance: "±0.5 mm",
            materials: ["6063 阳极黑铝型材 + PETG/尼龙连接件"],
            pros: ["极度便宜（1米型材仅8~15元）", "随时锯切调整长宽高", "螺母滑槽无限拓展安装传感器"],
            cons: ["外观工业感强", "刚性依赖角件紧固"],
            recommendation: "【机器人底盘 & 测试机架万能王者】研发阶段机械臂台架、底盘骨架 100% 推荐！",
            costTraps: ["所有角码和封盖直接在淘宝采购冲压现货（0.5元/个），千万别自己去 CNC 定制角码。"],
          },
          {
            name: "铝板钣金一体冲压折弯底盘 + 压铆螺柱",
            category: "SHEET_METAL",
            toolingCost: 0,
            unitCost: (q) => Math.max(60, 190 - Math.log10(q) * 25),
            leadTimeDays: 2,
            tolerance: "±0.2 mm",
            materials: ["5052-H32 铝合金 2.0mm~3.0mm"],
            pros: ["高颜值整体工业设计", "自带 PCB 铜柱定位与理线卡槽", "轻量且刚性极佳"],
            cons: ["需要展开图绘制与折弯避位设计"],
            recommendation: "用于一体化机器人主控箱、移动底盘车体壳体。",
            costTraps: ["所有电路板固定螺柱采用'压铆螺柱 (PEM)'由钣金厂自动压入，杜绝手动拧双通铜柱增加装配工时。"],
          },
        ];
    }
  }, [partCategory]);

  // Calculations for current selection
  const calculatedData = useMemo(() => {
    return processOptions.map((opt) => {
      const uCost = opt.unitCost(quantity);
      const totalCost = opt.toolingCost + uCost * quantity;
      const amortizedUnitCost = totalCost / quantity;
      return {
        ...opt,
        currentUnitCost: uCost,
        totalCost,
        amortizedUnitCost,
      };
    }).sort((a, b) => a.totalCost - b.totalCost);
  }, [processOptions, quantity]);

  const bestOption = calculatedData[0];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                DFM & Agile Prototyping
              </span>
              <span className="text-xs text-slate-400 font-mono">
                // 研发低成本试制 · 模具决策 · 工艺路线导航
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Factory className="w-7 h-7 text-cyan-400" />
              结构件制造工艺路径与极限控本指南
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              针对机械臂、灵巧手、散热模组与传动机构的研发痛点：明确在<strong>不同数量阶段（1~5件 vs 20件 vs 1000件）</strong>该选择何种工艺，如何在前期<strong>免开模或低成本开模</strong>，杜绝“刚画完图就开几十万钢模结果装配干涉废弃”的灾难。
            </p>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0">
            <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-center shadow-lg">
              <span className="text-[10px] text-emerald-400 font-mono block uppercase">控本核心铁律</span>
              <span className="text-sm font-bold text-white">PoC阶段 0 模具费</span>
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-800/80 overflow-x-auto">
          {[
            { id: "pm_knowledge_base", label: "硬件 PM 制造工艺与决策体系", icon: Award },
            { id: "cost_calculator", label: "工艺选型与成本计算器", icon: DollarSign },
            { id: "process_matrix", label: "4阶段工艺路线决策全景", icon: Layers },
            { id: "dfm_rules", label: "低成本 DFM 设计避坑秘籍", icon: Lightbulb },
            { id: "supplier_guide", label: "国内敏捷供应链打样技巧", icon: FileSpreadsheet },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold"
                    : "bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: Cost Calculator & Process Matcher */}
      {activeSubTab === "cost_calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Parameters */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Box className="w-4 h-4 text-cyan-400" />
                待制零件属性与试制规划
              </h2>

              {/* Part Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">零件类别 (Component Type)</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "housing", label: "外壳 / 电机壳", desc: "保护与美观" },
                    { id: "bracket", label: "受力连杆 / 支架", desc: "高抗扭刚度" },
                    { id: "gear", label: "传动齿轮 / 同步轮", desc: "耐磨精度" },
                    { id: "heatsink", label: "散热片 / 导热板", desc: "热传导对流" },
                    { id: "finger_link", label: "仿生手绳驱指骨", desc: "轻量光滑走绳" },
                    { id: "chassis", label: "台架 / 底盘骨架", desc: "大型安装基座" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPartCategory(p.id as PartCategory)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        partCategory === p.id
                          ? "bg-cyan-950/40 border-cyan-500 text-cyan-200 shadow-sm"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-200">{p.label}</div>
                      <div className="text-[10px] text-slate-500">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Slider */}
              <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">本期试制数量</label>
                  <span className="text-sm font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-800/50">
                    {quantity} 件 (Sets)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="500"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>1件 (单品打样)</span>
                  <span>10件 (小批量测试)</span>
                  <span>50件 (软模试产)</span>
                  <span>500件 (开模量产)</span>
                </div>
              </div>

              {/* Target Strength */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">受力与机械刚度要求</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "low", label: "仅外观/轻载" },
                    { id: "medium", label: "一般功能承载" },
                    { id: "high", label: "高负荷/重载冲击" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setTargetStrength(s.id as any)}
                      className={`py-1.5 px-2 rounded-lg text-center text-xs font-medium border transition-all cursor-pointer ${
                        targetStrength === s.id
                          ? "bg-indigo-950/60 border-indigo-500 text-indigo-200 font-bold"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Surface Finish */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">表面光洁度与外观诉求</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "rough", label: "粗糙无所谓 (内构)" },
                    { id: "smooth", label: "平整光滑 (正常)" },
                    { id: "industrial", label: "商业级高光/阳极" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSurfaceRequirement(f.id as any)}
                      className={`py-1.5 px-2 rounded-lg text-center text-xs font-medium border transition-all cursor-pointer ${
                        surfaceRequirement === f.id
                          ? "bg-indigo-950/60 border-indigo-500 text-indigo-200 font-bold"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Cost Golden Ratio Banner */}
            <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" />
                当前数量下的综合最优推荐
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                在 <strong>{quantity} 件</strong> 规模下，系统推荐首选：
                <span className="text-emerald-300 font-bold ml-1">{bestOption.name}</span>
              </p>
              <div className="text-[11px] font-mono text-emerald-400/90 pt-1 border-t border-emerald-900/40 flex justify-between">
                <span>预估总投入：¥{bestOption.totalCost.toFixed(0)}</span>
                <span>折合单件：¥{bestOption.amortizedUnitCost.toFixed(1)}/件</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Process Comparison Cards */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                各种工艺路径横向对比与成本拆解 ({calculatedData.length} 种可行路径)
              </h2>
              <span className="text-xs text-slate-400 font-mono">按综合总成本由低到高排序</span>
            </div>

            <div className="space-y-3.5">
              {calculatedData.map((opt, index) => {
                const isBest = index === 0;
                return (
                  <div
                    key={opt.name}
                    className={`rounded-2xl p-5 border transition-all ${
                      isBest
                        ? "bg-slate-900/95 border-emerald-500/60 shadow-xl ring-1 ring-emerald-500/20"
                        : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                            isBest ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">{opt.name}</h3>
                            {isBest && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                极致省钱推荐
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            材料: {opt.materials.join(" / ")} | 精度: {opt.tolerance}
                          </span>
                        </div>
                      </div>

                      {/* Cost Badges */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-right">
                          <span className="text-[10px] text-slate-500 uppercase block">前期开模/制版费</span>
                          <span className="text-xs font-mono font-bold text-amber-400">
                            {opt.toolingCost === 0 ? "¥0 (免模具)" : `¥${opt.toolingCost.toLocaleString()}`}
                          </span>
                        </div>
                        <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-right">
                          <span className="text-[10px] text-slate-500 uppercase block">总支出 ({quantity}件)</span>
                          <span className="text-sm font-mono font-bold text-cyan-400">
                            ¥{opt.totalCost.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Body Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-3 text-xs">
                      <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/60">
                        <span className="text-[10px] font-mono text-slate-500 block mb-1">交期周期</span>
                        <span className="text-slate-200 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          约 {opt.leadTimeDays} 个工作日
                        </span>
                      </div>

                      <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/60 md:col-span-2">
                        <span className="text-[10px] font-mono text-emerald-400 block mb-1">工艺优势</span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {opt.pros.join(" · ")}
                        </p>
                      </div>
                    </div>

                    {/* Recommendation & Cost Traps */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/60">
                      <div className="bg-cyan-950/20 border border-cyan-900/30 rounded-lg p-2.5 text-xs text-cyan-300">
                        <strong>适用场景评语：</strong> {opt.recommendation}
                      </div>

                      {opt.costTraps.length > 0 && (
                        <div className="bg-amber-950/20 border border-amber-900/40 rounded-lg p-2.5 text-[11px] text-amber-300/90 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">避坑防超支点：</span>
                            {opt.costTraps.join("; ")}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 4-Stage Process Matrix */}
      {activeSubTab === "process_matrix" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {STAGES.map((stg) => (
              <div
                key={stg.id}
                onClick={() => setSelectedStage(stg.id)}
                className={`rounded-2xl p-5 border cursor-pointer transition-all ${
                  selectedStage === stg.id
                    ? "bg-slate-900 border-cyan-500 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                    {stg.qtyRange}
                  </span>
                  <ChevronRight className={`w-4 h-4 ${selectedStage === stg.id ? "text-cyan-400" : "text-slate-600"}`} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{stg.name}</h3>
                <p className="text-xs text-amber-400/90 font-medium mb-3">{stg.budgetMindset}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{stg.coreGoal}</p>
                <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500">
                  主力工艺：{stg.mainTech}
                </div>
              </div>
            ))}
          </div>

          {/* Deep-dive into selected stage */}
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase">Stage Strategy Deep-Dive</span>
                <h2 className="text-xl font-bold text-white">
                  {STAGES.find((s) => s.id === selectedStage)?.name} 深度执行方案与供应链配置
                </h2>
              </div>
            </div>

            {selectedStage === "poc" && (
              <div className="space-y-4">
                <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800 space-y-3">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    阶段 0 绝不能花冤枉钱的黄金法则（总预算控制在 ¥200~¥800 内）
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed">
                    <li><strong>结构件全部采用 3D 打印：</strong>非受力外壳用白树脂（SLA，约 0.12~0.18 元/克），受力件用 HP PA12 尼龙（约 0.45~0.6 元/克）。一台小型机械臂或灵巧手的整套塑料件打印费用在 <strong>¥150~¥350</strong> 即可搞定。</li>
                    <li><strong>杜绝非标加工，最大化利用标准五金：</strong>紧固件统一采用 M2.5/M3 国标圆头内六角螺丝；轴承直接买 NMB/NSK 标准微型微型深沟球轴承（淘宝几块钱一个）。</li>
                    <li><strong>连接骨架采用铝型材：</strong>底座机架直接买 2020 铝型材，配合 T 型螺母，不需要自己花钱机加底板。</li>
                    <li><strong>齿轮与传动件借用：</strong>优先从米思米或淘宝买标准模数现货，不要在第一周就定制特殊齿形。</li>
                  </ul>
                </div>
              </div>
            )}

            {selectedStage === "evt" && (
              <div className="space-y-4">
                <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800 space-y-3">
                  <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    阶段 1 (EVT 5~20套) 刚度验证与小批量降本（总预算控制在 ¥1500~¥4000）
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed">
                    <li><strong>关键高应力节点升级为 3 轴 CNC 铝合金：</strong>电机法兰座、谐波/行星减速器转接盘采用 AL6061-T6 铣削。要求加工厂直接做原色喷砂或本色阳极，省去昂贵的多次调色阳极氧化费。</li>
                    <li><strong>小批量外观件尝试“硅胶复模”：</strong>如果需要 10~20 套外观一致且具备类注塑质感的壳体，用 3D 打印打一个母模，做一套硅胶模（¥600~¥1000），可快速真空浇注出 20 套 ABS 质感外壳，单件成本比逐个 3D 打印低 40%。</li>
                    <li><strong>钣金件替代厚重机加件：</strong>平面的支撑架、底盘防护板全部转为 2mm 5052 铝板激光下料与折弯，单件成本降至 ¥25 左右。</li>
                  </ul>
                </div>
              </div>
            )}

            {selectedStage === "dvt" && (
              <div className="space-y-4">
                <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800 space-y-3">
                  <h4 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    阶段 2 (DVT 20~200套) 简易模/软模与准量产装配
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed">
                    <li><strong>铝合金简易模 (Soft Tooling)：</strong>采用 7075 铝合金替代淬火钢作为模仁，模具加工周期仅 7~10 天，开模费只要硬钢模的 1/5（约 ¥3000~¥8000/套），支持出件 1000~5000 次，足够打穿内测与天使轮样机需求！</li>
                    <li><strong>低压灌注 (RIM - Reaction Injection Molding)：</strong>对于 1 米以上的大型机器人机身外壳，开钢模需数十万，采用低压灌注模具仅需 2~3 万元，非常适合 50~200 台中大型机器人外壳。</li>
                    <li><strong>型材挤压开模：</strong>如机械臂长臂连杆、散热机箱，开一套挤压模只需 ¥3500 左右，后续按公斤买铝材，单根臂管成本直接降到 ¥15。</li>
                  </ul>
                </div>
              </div>
            )}

            {selectedStage === "mp" && (
              <div className="space-y-4">
                <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800 space-y-3">
                  <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    阶段 3 (MP 1000+套) 规模量产与单件极致控本
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed">
                    <li><strong>硬钢注塑模具 (S136/NAK80)：</strong>寿命 30万~100万模次，采用一模多穴（如 1出2 / 1出4），单件出件周期 20~40秒，单件塑料成本压低至 ¥1.5~¥4.0。</li>
                    <li><strong>压铸成型 (Die Casting)：</strong>针对高强度金属壳体，采用 ADC12 铝合金或 AZ91D 镁合金高压压铸，兼具金属强度与注塑级的批量低成本。</li>
                    <li><strong>DFMA (面向装配的设计)：</strong>合并零件数量，使用卡扣 (Snap-fit) 代替 50% 的螺丝紧固，大幅度减少产线人工装配工时费。</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DFM Golden Rules for Cost Reduction */}
      {activeSubTab === "dfm_rules" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rule 1: CNC */}
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <ShieldAlert className="w-4 h-4" />
                CNC 零件设计控本 4 禁忌 (立省 60% 机加费)
              </div>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc list-inside">
                <li><strong className="text-white">禁忌 1：内部直角清角。</strong> 旋转铣刀永远切不出直角！内拐角必须留圆角 R ≥ 1.5mm（最好是标准铣刀半径如 R1.5, R2, R3），否则必须上电火花 EDM 放电，加工费暴涨 3 倍。</li>
                <li><strong className="text-white">禁忌 2：深长窄腔（深宽比 &gt; 4:1）。</strong> 深度超过刀具直径 4 倍时，刀具容易弹刀震刀，进给速度必须极慢。尽量设计为浅腔或分体拼装。</li>
                <li><strong className="text-white">禁忌 3：过度公差标注。</strong> 非装配配合面（如外表、导角）统一标 ±0.1mm 或自由公差；仅在轴承位、销钉孔标注 ±0.01mm (H7/g6)。全图标丝级公差会被加工厂直接按精密军工件报价！</li>
                <li><strong className="text-white">禁忌 4：多方向特征导致多次翻面装夹。</strong> 尽量将特征集中在正面和背面（2次装夹），避免在侧面 45 度角打斜孔（需要额外制作专用夹具或上昂贵的 5 轴机床）。</li>
              </ul>
            </div>

            {/* Rule 2: 3D Printing */}
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Lightbulb className="w-4 h-4" />
                3D 打印试制控本 4 秘诀
              </div>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc list-inside">
                <li><strong className="text-white">秘诀 1：壁厚维持在 1.5 ~ 2.5 mm。</strong> 打印费用是按重量 (克数) 计费的。大体积实心件一定要内部抽壳（掏空），并留出排粉/排液孔。</li>
                <li><strong className="text-white">秘诀 2：塑料件预埋铜螺母。</strong> 3D 打印塑料直接攻丝拧螺丝，拆装 2 次就会滑丝报废。在 CAD 中预留内径合适的圆孔，用家用电烙铁加热压入滚花铜螺母（M3 铜螺母只需 0.05 元/颗），连接强度媲美金属。</li>
                <li><strong className="text-white">秘诀 3：巧妙拼装拆件。</strong> 超过 300mm 的大零件，在打印平台上会被加收超大件机时费。将其拆分为两段，用燕尾榫槽或定位销钉胶水粘合，费用立减一半。</li>
                <li><strong className="text-white">秘诀 4：支撑面朝向内侧。</strong> SLA/FDM 打印在剥离支撑后表面会有细小斑点，建模时将关键外观面朝上摆放，支撑打在底面或内腔。</li>
              </ul>
            </div>

            {/* Rule 3: Sheet Metal */}
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Factory className="w-4 h-4" />
                钣金件与冲折件设计 3 原则
              </div>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc list-inside">
                <li><strong className="text-white">原则 1：折弯最小内圆角 R ≥ 1.0 × 板厚。</strong> 如果强行设计为无圆角尖角折弯，折弯处材料外层会拉裂，折弯刀具易磨损。</li>
                <li><strong className="text-white">原则 2：开孔与折弯线距离 L ≥ 2.0 × 板厚 + R。</strong> 距离过近会导致折弯拉伸时圆孔被拉成椭圆，导致螺丝无法穿入。</li>
                <li><strong className="text-white">原则 3：统一板厚。</strong> 一个机构的所有钣金件尽量统一为 1.5mm 或 2.0mm 5052 铝板，这样加工厂可以拼在一整张大板材上一次性激光割完，省去换板换刀人工费。</li>
              </ul>
            </div>

            {/* Rule 4: Mold & Tooling Transition */}
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Flame className="w-4 h-4" />
                注塑模具转产前的 DFM 审查 (防废模)
              </div>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc list-inside">
                <li><strong className="text-white">检查 1：拔模斜度 (Draft Angle)。</strong> 所有垂直于分型面的侧壁必须设计 1° ~ 2° 的拔模斜度（咬花面需 3° ~ 5°），否则顶出时会拉伤零件表面导致卡模。</li>
                <li><strong className="text-white">检查 2：均匀壁厚 (Uniform Wall Thickness)。</strong> 塑料冷却收缩不均会导致表面产生凹坑（缩水）或整体翘曲。主壁厚与加强筋厚度比例维持在 1 : 0.6。</li>
                <li><strong className="text-white">检查 3：避免倒扣 (Undercut)。</strong> 侧向凸起或侧向开孔会导致模具必须做复杂的滑块 (Slider) 或斜顶 (Lifter)，每增加一个滑块，开模费增加 ¥2000~¥5000。尽量通过上下穿插对碰结构消除侧抽芯。</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Domestic Supply Chain & RFQ Strategy */}
      {activeSubTab === "supplier_guide" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase">Supplier RFQ & Sourcing Playbook</span>
              <h2 className="text-xl font-bold text-white mt-1">国内敏捷硬件供应链极速打样与询价指南</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                如何向加工厂（嘉立创、三维猴、未来工场、云工厂、东莞/昆山本地精密机械厂）规范输出文件，拿到最低真实底价。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 space-y-2">
                <div className="text-xs font-mono font-bold text-cyan-400">1. 输出文件规范</div>
                <h4 className="text-sm font-bold text-white">3D STEP + 2D PDF 组合</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  3D 模型统一导出为标准的 <code>.STP / .STEP</code> (AP214 格式)。<br />
                  关键受力件/轴承件必须附带一张 <code>.PDF</code> 2D 工程图，<strong>仅标出关键配合公差、螺纹规格（如 M3x0.5-6H）、表面处理要求</strong>。其余未注尺寸写明“未注公差按 GB/T 1804-m 级执行”。
                </p>
              </div>

              <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 space-y-2">
                <div className="text-xs font-mono font-bold text-emerald-400">2. 平台选型策略</div>
                <h4 className="text-sm font-bold text-white">线上自动化平台 vs 线下机加厂</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>1~10 件树脂/尼龙打印、简单钣金：</strong>首选嘉立创三维猴、未来工场，算法秒报价，24小时发货，单件极便宜。<br />
                  <strong>5~50 件复杂 5 轴 CNC、硅胶复模：</strong>推荐找东莞/深圳/常州本地实体样机厂，沟通工程师微信，可灵活调整刀具路径与修模。
                </p>
              </div>

              <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 space-y-2">
                <div className="text-xs font-mono font-bold text-indigo-400">3. 砍价与降期话术</div>
                <h4 className="text-sm font-bold text-white">明确试制背景</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  询价时备注：“当前为 PoC 样机验证，如装配顺利，下个月将直接追加 200 套小批量采购”。工厂通常会主动按小批量梯度价格给予首单打样折扣。
                </p>
              </div>
            </div>

            {/* Standard RFQ Checklist Table */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden">
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 text-xs font-bold text-slate-200">
                结构件对外发包询价（RFQ）核对自查清单 (Checklist)
              </div>
              <div className="divide-y divide-slate-800/80 text-xs">
                {[
                  { item: "材料牌号明确", desc: "写明具体牌号（如 AL6061-T6, 不锈钢 304, POM 赛钢, PA12 尼龙），不要只写'铝合金'或'塑料'" },
                  { item: "表面处理明确", desc: "标明是'本色喷砂阳极氧化'、'黑色硬质阳极'、'抛光'、'烤漆'还是'直接机加表面无后处理'" },
                  { item: "螺纹牙孔标注", desc: "图纸明确是贯通螺纹还是盲孔螺纹，有效螺纹深度是否充足（通常取 1.5 ~ 2.0 倍螺纹公称直径）" },
                  { item: "轴承与销钉位公差", desc: "轴承外圈装配位标注如 Φ10 (+0.015 / 0) mm，销钉过盈配合标注 Φ3 (+0.008 / +0.002) mm" },
                ].map((row, i) => (
                  <div key={i} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/40">
                    <span className="font-bold text-slate-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      {row.item}
                    </span>
                    <span className="text-slate-400 text-[11px] sm:max-w-md">{row.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Hardware PM Manufacturing Knowledge Base */}
      {activeSubTab === "pm_knowledge_base" && <PMManufacturingGuide />}
    </div>
  );
};
