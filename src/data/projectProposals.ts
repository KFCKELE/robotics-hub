import { ProjectProposal } from "../types";

export const defaultProjectProposals: ProjectProposal[] = [
  {
    id: "proj-1",
    title: "Amazing Hand 仿生灵巧手：高可靠度 7-DOF 刚柔耦合仿生绳驱机械手 (带球头自适应指尖与自校准张力模块)",
    category: "Amazing Hand 灵巧手 / 飞特STS舵机 / 微型绞盘",
    highlightBadge: "王牌主打 · Amazing Hand 批量量产级架构",
    difficulty: "总监级旗舰",
    summary:
      "基于 Amazing Hand 开源灵巧手基底进行颠覆性工业重构：针对人形机器人与工业抓取中传统连杆手指体积庞大、碰撞易损、异形件抓取刚度突变的痛点，设计一款轻量化（整手重量 <380g）、高抓握力（单指峰值抓力 18N）、集成球头被动顺应指尖与微型 Capstan 绞盘在线张力自校准机构的多指仿生绳驱灵巧手。",
    backgroundMotivation:
      "基于 Amazing Hand 开源项目并结合百台级量产交付经验，将以往产品中绳索磨损、回差迟滞、关节自由度受限等痛点做二次升级，打造成大厂面试（如大疆、宇树、智元、优必选）最具竞争力的压轴作品。",
    mechanicalArchitecture: {
      mechanismType: "基于 Amazing Hand 的 N+1 欠驱动与主动混合绳驱 + 掌指球头 2-DOF 万向关节 + 35° 人体解剖学拇指对掌运动",
      degreesOfFreedom: 7,
      transmissionType: "自研微型 Capstan 双螺旋绞盘 (螺距缠绕槽防跳绳) + 进口 Dyneema 8编超高分子量聚乙烯绳 (破断拉力 450N)",
      actuatorType: "手掌内腔集成 5 组深圳飞特 (Feetech) STS3215 / SCS0009 高精度磁编码总线舵机模组 (12-bit 绝对值反馈)",
      materials: [
        "指骨骨架: 航空铝 7075-T6 (硬质阳极氧化 50μm) + 碳纤增强尼龙 PA12-CF",
        "指节关节轴套: 自润滑 PEEK + 二硫化钼耐磨复合衬套 (摩擦系数 <0.08)",
        "指尖外包覆: 双色注塑 / 浇铸液态硅胶 (邵氏硬度 30A，带微吸盘指纹摩擦纹理)",
      ],
      keyDimensions: "掌长 92mm，指全长 85mm，整机外形 1:1 贴合标准成年女性手掌轮廓，自重 360g",
    },
    engineeringCalculations: [
      {
        formulaName: "绞盘包角摩擦力损耗 (Euler-Eytelwein 公式)",
        formulaExpr: "T_out = T_in · e^(-μ · θ)",
        parameters: [
          { name: "μ (摩擦系数)", value: "0.08", unit: "-", desc: "Dyneema绳在PEEK光滑滑轮上的实测滑动摩擦系数" },
          { name: "θ (累计包角)", value: "3.14 (180°)", unit: "rad", desc: "主掌指到远指节总转向过渡包角" },
          { name: "T_in (电机端初始张力)", value: "22.5", unit: "N", desc: "绞盘输出端绳索拉力" },
        ],
        calculationConclusion: "计算得出末端指尖实际有效拉力 T_out = 17.5 N，单手总传动效率可达 77.8%，远超传统管内走绳的 45%。",
      },
      {
        formulaName: "球头万向副赫兹接触应力 (Hertz Contact Stress) 校核",
        formulaExpr: "σ_max = 0.388 · ∛[ F · E² · (1/r₁ - 1/r₂)² ]",
        parameters: [
          { name: "F (法向抓取载荷)", value: "25", unit: "N", desc: "指尖极端碰撞工况下球头受力" },
          { name: "r₁ (球头半径)", value: "4.0", unit: "mm", desc: "7075-T6 铝球外径" },
          { name: "r₂ (球窝半径)", value: "4.025", unit: "mm", desc: "配合球窝内径 (间隙配合 25μm)" },
          { name: "E (等效弹性模量)", value: "72", unit: "GPa", desc: "航空铝与POM/PEEK衬套接触综合模量" },
        ],
        calculationConclusion: "最大赫兹接触应力 σ_max = 38.4 MPa，远低于 PEEK 的抗压屈服极限 118 MPa，杜绝了长期微动磨损导致的间隙变大。",
      },
    ],
    dfmAndManufacturing: {
      criticalTolerances: [
        "绞盘缠绕微细绳槽宽度与螺距: 0.65±0.015mm, 表面粗糙度 Ra 0.4",
        "指节铰链销轴孔同轴度: ⌀0.008mm, 孔轴公差配合 H7/h6",
        "球头球面圆度: 0.005mm, 采用精密数控五轴车铣复合一次装夹成形",
      ],
      machiningProcesses: [
        "指骨外壳采用五轴高速CNC加工，内腔微型减重掏空壁厚控制在 0.8mm",
        "绳孔出绳导角全部做 R0.5 镜面抛光倒角，防止高频往复摩擦切绳",
        "掌面基座采用轻量化压铸铝/高刚性PA12-CF，后序局部精密机加工关键安装面",
      ],
      costOptimizationTips: [
        "指节滑轮统一采用微型标准深沟球轴承 (MF63ZZ) 代替非标定制件，单件成本从 ¥35 降至 ¥2.8",
        "绳索固定端取消微型螺栓压紧，改用高强度冷压铜套配合卡槽防脱，装配效率提升 60%",
      ],
      assemblyNotes: [
        "必须使用专用张力预紧工装对每根腱绳施加 15N 恒定预紧力后再压接，消除材料初期 3%~5% 的初始蠕变延伸",
        "球窝配合涂抹极压全氟聚醚(PFPE)长效微润滑脂",
      ],
    },
    bomList: [
      { partName: "掌骨主机架", spec: "AL7075-T6 CNC五轴精雕+黑色硬极", qty: 1, material: "航空铝", estimatedCost: "¥180" },
      { partName: "掌指球头万向节组件", spec: "⌀8mm 球头连杆+PEEK耐磨衬垫", qty: 5, material: "7075+PEEK", estimatedCost: "¥95" },
      { partName: "飞特总线伺服舵机", spec: "Feetech STS3215 磁编码数字总线舵机", qty: 5, material: "组合件", estimatedCost: "¥320" },
      { partName: "高分子聚乙烯腱绳", spec: "⌀0.45mm 8编 Dyneema (破断450N)", qty: 2, material: "UHMWPE", estimatedCost: "¥12" },
      { partName: "微型法兰导向轴承", spec: "MF63ZZ (3x6x2.5mm) 进口NMB", qty: 16, material: "GCr15轴承钢", estimatedCost: "¥48" },
      { partName: "仿生阻尼柔性硅胶指套", spec: "双色模注塑成型 (邵氏30A)", qty: 5, material: "液态硅胶", estimatedCost: "¥35" },
    ],
    interviewDefensePoints: [
      {
        question: "面试官深挖：Amazing Hand 采用飞特舵机与微型 Capstan 绞盘驱动，绳驱机械手最大的问题是回差滞后（Hysteresis）和绳索蠕变，你在量产交付中是如何彻底解决的？",
        interviewerTrap: "考察你是否真正做过批量落地，还是只停留在学校论文的理想状态。",
        goldenAnswer:
          "回答逻辑三步走：1. 材料级：弃用传统钢丝绳（内部股线自磨损大）和芳纶绳（易疲劳），选用预拉伸工艺处理的超高分子量聚乙烯(Dyneema)或单晶钨丝绳，其弹性伸长率 <0.5%；2. 机构级：在电机绞盘端设计了紧凑的偏心凸轮/恒张力碟簧被动补偿机构，并在掌骨内集成 14-bit 关节末端绝对值编码器，直接读取指节绝对角度，形成全闭环控制，屏蔽传动绳链的非线性滞后；3. 工艺级：量产装配导入自动化预拉伸治具，常温下施加 1.5 倍额定拉力循环老化 500 次，出厂前消除 98% 的塑性变形。",
      },
      {
        question: "面试官深挖：为什么 Amazing Hand 掌指关节采用球头结构？球头如何解决间隙磨损与受力自锁问题？",
        interviewerTrap: "考察你的理论力学分析深度与精密公差配合经验。",
        goldenAnswer:
          "传统十字万向节在微型空间内占用体积大、死角多；球头副（球面副）具有空间 3-DOF 旋转能力，不仅能实现手指的内收/外展(Abduction/Adduction)和屈曲/伸展(Flexion/Extension)，还能在指尖受到侧向意外碰撞时提供 360° 被动顺应吸能，保护内部驱动电机。针对磨损与间隙：我采用了配合公差精密控制在 15~25μm 的球窝结构，并内嵌自润滑 PEEK 衬套；球头几何中心与腱绳牵引力臂呈几何锐角布置，力学分解使合力始终将球头压紧在球窝底部，彻底避免了拉拔脱出与摩擦自锁。",
      },
    ],
  },
  {
    id: "proj-1b",
    title: "经典开源腱绳驱动灵巧手：多指滑轮差动欠驱动与远程 Bowden 缆绳自适应机械手 (基于 OpenBionics / Yale OpenHand 绳驱构型)",
    category: "开源腱绳灵巧手 / 远程Bowden传导 / 滑轮差动",
    highlightBadge: "经典绳驱 · 欠驱动滑轮网络与自适应包络",
    difficulty: "高级进阶",
    summary:
      "借鉴 OpenBionics / Yale OpenHand / DexHand 经典开源腱绳驱动架构：针对末端执行器手指重度受限、电机置于手指导致惯量大等难题，采用驱动电机后置（前臂或手掌基部）、低摩擦 Bowden 聚四氟乙烯导管与微型滑轮网络传导。引入多级欠驱动差动滑轮（Differential Pulley Network），单电机牵引即可实现五指根据物体形状自动包络贴合，实现高鲁棒性盲抓。",
    backgroundMotivation:
      "深度剖析经典开源腱绳机械手（如 OpenBionics Brunel / Yale T42 / SoftHand 绳驱系统）在机器人学术界与工业界广泛应用的力学底层，向面试官展示从多包角摩擦阻力建模、差动绳路拓扑设计到弹簧复位顺应性的完整设计能力。",
    mechanicalArchitecture: {
      mechanismType: "经典多级欠驱动滑轮差动网络 (Differential Pulley Tree) + 远端 Bowden 柔性导管传动 + 内嵌特种螺旋扭簧被动复位",
      degreesOfFreedom: 15, // 15关节/5主动驱动自由度
      transmissionType: "0.38mm 进口超高分子量聚乙烯绳 (Dyneema 12编) + 低摩擦微型深沟球轴承导向滑轮 + PTFE 内衬耐磨套管",
      actuatorType: "手掌基座/前臂集中布置 4~5 组高减速比微型金属齿轮总线伺服舵机 (带电流扭矩反馈)",
      materials: [
        "指节主体: 碳纤维复合增强 PLA-CF / PA12-CF 工业级 3D 打印 (轻量化蜂窝填充)",
        "滑轮与导向销轴: SUS304 不锈钢精密销轴 (磨削 h6, Ra 0.2) + POM 自润滑微型滑轮",
        "复位弹簧: 琴钢丝 SWP-B 高寿命内嵌扭簧 (疲劳寿命 >1,000,000 次)",
        "抓取摩擦面: 聚氨酯 TPU (邵氏 60A) 仿生阶梯抓纹防滑贴片",
      ],
      keyDimensions: "指长 78~95mm, 整手机械本体 (不含前臂驱动盒) 仅重 220g, 单指抓握闭合行程仅需 28mm 绳长拉拽",
    },
    engineeringCalculations: [
      {
        formulaName: "Bowden 柔性导管连续多曲率摩擦阻力积分计算",
        formulaExpr: "F_load = F_actuator · e^(-∫ μ · |κ(s)| ds)",
        parameters: [
          { name: "μ (PTFE套管动摩擦系数)", value: "0.04", unit: "-", desc: "Dyneema绳在特氟龙内衬管中实测摩擦" },
          { name: "∫|κ|ds (导管弯曲总曲率弧度)", value: "2.35 (135°)", unit: "rad", desc: "前臂到掌心弯折总弧度" },
          { name: "F_actuator (舵机输出拉力)", value: "30.0", unit: "N", desc: "基座舵机施加的最大拉力" },
        ],
        calculationConclusion: "经过 PTFE 柔性导管与 4 级导向滑轮后，到达手指近指节拉力为 27.3 N，整体管路传动损耗控制在 9% 以内，保障了抓握爆发力。",
      },
      {
        formulaName: "欠驱动差动滑轮平衡条件与抓取力分配",
        formulaExpr: "F_finger_i = (r_drive / r_pulley) · (T_main / 2^n)",
        parameters: [
          { name: "T_main (总主拉索张力)", value: "25.0", unit: "N", desc: "主控电机输出总张力" },
          { name: "n (差动滑轮级数)", value: "2", unit: "级", desc: "二叉树差动滑轮网络分配到 4 指" },
          { name: "r_ratio (力臂放大比)", value: "1.25", unit: "-", desc: "指节转轴偏心力臂与滑轮半径比" },
        ],
        calculationConclusion: "在单电机驱动下，食指、中指、无名指与小指可根据被抓物体表面曲率自适应平衡分流（单指约 7.8N 均匀包络力），杜绝了局部刚性过压捏碎软质物体。",
      },
    ],
    dfmAndManufacturing: {
      criticalTolerances: [
        "导向滑轮轴与轴孔间隙: 采用 H8/f7 动配合 (12~25μm)，确保滑轮自由转动无轴向偏摆",
        "腱绳穿线通道内壁: 最小曲率半径 R ≥ 3.5mm，出入口均做 45° 倒角并手工抛光",
        "弹簧安装定位槽深度与卡位公差: ±0.05mm，防止扭簧高速弹回时脱槽",
      ],
      machiningProcesses: [
        "指骨骨架采用工业级 SLS 尼龙烧结或高精度 FDM PLA-CF 打印，层纹方向严格平行于指骨受拉主应力轴",
        "滑轮销轴选用标准硬化不锈钢定位销，免去非标机加工费用",
        "手掌基底预留模块化快换螺栓法兰接口，可无缝挂接各类协作机械臂末端",
      ],
      costOptimizationTips: [
        "采用差动滑轮机构替代多电机独立控制，驱动舵机数量减少 50%，电控板尺寸缩小 60%，硬件总成本降低 45%",
        "腱绳过线孔直接 3D 打印一体成型，避免了昂贵的穿线黄铜镶件",
      ],
      assemblyNotes: [
        "穿绳装配时必须使用专用引导钢丝引线，并在套管两端注装微量干式润滑 PTFE 喷剂",
        "每根复位扭簧在装配前预扭转 15° 建立初始预紧，保证手指失电时能迅速回弹张开",
      ],
    },
    bomList: [
      { partName: "轻量化 3D 打印指节总成 (5指)", spec: "PA12-CF 工业级烧结/PLA-CF", qty: 5, material: "碳纤尼龙", estimatedCost: "¥90" },
      { partName: "低摩擦微型导向滑轮", spec: "⌀6x2.5mm POM 进口车削滑轮 (带防脱挡边)", qty: 12, material: "POM 赛钢", estimatedCost: "¥24" },
      { partName: "不锈钢微型销轴", spec: "⌀1.5x8mm SUS304 磨削销", qty: 18, material: "不锈钢", estimatedCost: "¥15" },
      { partName: "前臂总线伺服舵机组", spec: "飞特 STS3032 / 宇树微型舵机 (双滚珠轴承)", qty: 4, material: "组合件", estimatedCost: "¥260" },
      { partName: "PTFE 衬套 Bowden 导管", spec: "内径 0.8mm / 外径 1.6mm 聚四氟乙烯管", qty: 5, material: "特氟龙", estimatedCost: "¥8" },
      { partName: "高寿命指关节复位扭簧", spec: "⌀0.4mm 琴钢丝 SWP-B 右旋/左旋", qty: 15, material: "弹簧钢", estimatedCost: "¥18" },
    ],
    interviewDefensePoints: [
      {
        question: "面试官深挖：在经典开源腱绳机械手（如 OpenBionics/Yale OpenHand）中，欠驱动差动滑轮最大的优势是什么？如何解决单指被卡死时其他手指的动力分配？",
        interviewerTrap: "考察你对机器人'欠驱动 (Under-actuation)'理论以及被动机械智能（Mechanical Intelligence）的掌握程度。",
        goldenAnswer:
          "欠驱动差动滑轮网络的核心价值在于将'环境感知的计算复杂度转移给机构物理本体'：当抓取不规则物体（如水果、可乐罐、工具）时，率先接触物体的指节受阻停滞，此时拉力并不会堵转电机，而是通过差动浮动滑轮将绳索行程传递给其余未接触物体的手指，直到所有手指均完成形状包络并形成静力平衡！这使得机械手无需多轴力传感器和复杂的末端接触控制算法，就能以极高速度实现顺应抓取。针对单指卡死保护：我们在差动滑轮各支路串联了微型恒刚度弹簧脱扣器，当局部拉力超过 12N 阈值时自动限力滑移，保护腱绳不被扯断。",
      },
      {
        question: "面试官深挖：绳驱动机械手如果采用弹簧复位，抓取力与弹簧回弹力如何平衡？如何避免弹簧过强导致电机有效抓取力被大幅抵消？",
        interviewerTrap: "考察力学平衡优化与电机功率储备的精准计算。",
        goldenAnswer:
          "这是一个经典的设计权衡（Trade-off）：复位弹簧过软，机械手回弹缓慢甚至在粘滞摩擦下无法完全张开；弹簧过硬，舵机拉力有 30%~50% 被消耗在克服弹簧抗力上，导致抓取力骤降。我的优化方法是'非线性变力臂设计 + 刚度梯度匹配'：指关节上的弹簧固定点经过几何偏心优化，在手指完全张开时弹簧处于最小预紧态（仅提供约 0.5N 张开保持力），而在手指抓握闭合过程中，腱绳的驱动力臂逐渐增大，有效抵消了弹簧蓄能增加的阻力；同时近端大关节采用较硬弹簧（0.8N），远端小指节采用超柔弹簧（0.25N），确保了手指屈曲时呈现'先近端后远端'的拟人化自然弯曲时序，整手机电效率提升了 35%！",
      },
    ],
  },
  {
    id: "proj-2",
    title: "高刚度轻量化协作机器人模块化一体化关节 (集成无框力矩电机与超薄谐波减速器)",
    category: "协作臂与一体化关节",
    highlightBadge: "精密机电 · 刚度与模态优化",
    difficulty: "高级进阶",
    summary:
      "针对协作机器人在高动态启停工况下末端抖动、谐波减速器背隙累计、壳体刚度不足及热膨胀导致轴承卡滞等工程痛点，设计一款扭矩密度高达 48Nm/kg、集成中空走线、双绝对值编码器与电磁失电制动器的轻量化模块化关节。",
    backgroundMotivation:
      "结合在协作臂精密结构优化（一阶固有频率提升24%、提升响应速度）的真实战绩，向面试官展示从无框力矩电机热传导、交叉滚子轴承力矩校核到结构有限元(FEA)模态优化的全链路设计能力。",
    mechanicalArchitecture: {
      mechanismType: "同轴直驱一体化关节 (电机中空外转子 + 谐波柔轮一体化连接法兰 + 交叉滚子轴承外圈承载)",
      degreesOfFreedom: 1,
      transmissionType: "超薄型谐波减速器 (减速比 1:101, 额定输出扭矩 65 N·m, 峰值 140 N·m)",
      actuatorType: "无框力矩电机 (中空内径 ⌀28mm, 连续堵转扭矩 1.2 N·m)",
      materials: [
        "主壳体与法兰: 高强度锻造铝合金 6061-T6 / 局部 7075-T6 (T6热处理)",
        "输出轴与轴承配合轴段: 40Cr 调质处理 (HRC 28-32) + 轴颈高频淬火 (HRC 50-55)",
        "隔热与绝缘垫圈: 环氧树脂玻纤板 FR4",
      ],
      keyDimensions: "外径 ⌀95mm, 轴向总厚度 62mm, 中空过线孔径 ⌀22mm, 整机自重仅 1.35kg",
    },
    engineeringCalculations: [
      {
        formulaName: "交叉滚子轴承寿命与当量动载荷计算",
        formulaExpr: "P_c = X · F_r + Y · (F_a + 2M / d_pw)",
        parameters: [
          { name: "F_r (径向载荷)", value: "350", unit: "N", desc: "协作臂水平伸展工况径向重力" },
          { name: "F_a (轴向推拉载荷)", value: "180", unit: "N", desc: "末端推压与惯性轴向力" },
          { name: "M (倾覆力矩)", value: "85", unit: "N·m", desc: "前序连杆与负载产生的最大倾覆力矩" },
          { name: "d_pw (滚子节圆直径)", value: "70", unit: "mm", desc: "选用 CRBH7013 交叉滚子轴承" },
        ],
        calculationConclusion: "计算得出轴承额定计算寿命 L_10h > 28,500 小时（远超工业机器人 20,000 小时标准），刚度变形量 <0.012°。",
      },
      {
        formulaName: "关节扭转刚度与一阶固有共振频率校核",
        formulaExpr: "f_n = (1 / 2π) · √( K_total / J_load )",
        parameters: [
          { name: "K_total (关节综合扭转刚度)", value: "1.45e4", unit: "N·m/rad", desc: "谐波减速器与铝合金壳体串联刚度" },
          { name: "J_load (末端等效转动惯量)", value: "0.082", unit: "kg·m²", desc: "协作臂 5kg 额定负载折算到关节轴" },
        ],
        calculationConclusion: "理论一阶固有频率 f_n = 21.2 Hz，通过在壳体壁厚上添加螺旋交错加强筋，将实际模态提升至 28.6 Hz，彻底避开了伺服速度环 15~20Hz 的共振带宽。",
      },
    ],
    dfmAndManufacturing: {
      criticalTolerances: [
        "轴承安装挡肩跳动: 径向跳动 ≤0.005mm, 端面跳动 ≤0.005mm",
        "电机定子安装止口与谐波刚轮同轴度: ⌀0.010mm",
        "输出法兰平面度: 0.008mm, 保证带载后无微小偏载啃齿",
      ],
      machiningProcesses: [
        "主壳体采用数控卧加或五轴铣削，关键同轴度在一次装夹完成粗精镗孔",
        "40Cr 传动轴配合面采用高精度数控外圆磨削 (公差 h5, Ra 0.2)",
      ],
      costOptimizationTips: [
        "将原本分体式的谐波柔轮连接法兰与主输出轴合二为一，减少 1 套精密连接件和 8 颗螺钉，节省加工与装配成本 22%",
        "内部走线卡槽直接在机加工内腔拉槽成型，免去额外注塑走线支架",
      ],
      assemblyNotes: [
        "轴承压装必须使用恒速伺服压力机并实时监控压力-位移曲线 (Press-Fit Force Monitor)，杜绝敲击损伤滚道",
        "螺钉紧固必须采用定扭力扳手并交叉对角分 3 次预紧至额定力矩 (8.5 N·m)",
      ],
    },
    bomList: [
      { partName: "关节集成外壳", spec: "AL6061-T6 精密五轴加工 + 导电阳极化", qty: 1, material: "铝合金", estimatedCost: "¥320" },
      { partName: "超薄谐波减速机", spec: "CSF-17-100-2UH (或国内绿的/来福超薄)", qty: 1, material: "合金钢", estimatedCost: "¥1450" },
      { partName: "高刚度交叉滚子轴承", spec: "CRBH 7013 A (P4级精度, 负间隙预紧)", qty: 1, material: "GCr15", estimatedCost: "¥380" },
      { partName: "无框中空力矩电机", spec: "外径 70mm, 额定48V, 2800rpm", qty: 1, material: "硅钢片+铜线", estimatedCost: "¥680" },
      { partName: "微型失电电磁制动器", spec: "中空失电刹车 2.0 N·m (24V)", qty: 1, material: "电磁钢", estimatedCost: "¥260" },
      { partName: "双路绝对值磁编码器", spec: "19-bit 多圈绝对值 + 离轴中空磁环", qty: 1, material: "PCB+磁环", estimatedCost: "¥210" },
    ],
    interviewDefensePoints: [
      {
        question: "面试官深挖：在协作机器人关节中，电机发热会导致谐波减速机和轴承热膨胀，你是如何在机械结构上消除热卡滞和精度衰减的？",
        interviewerTrap: "考察你是否具备高级热-结构耦合设计思维及量产可靠性经验。",
        goldenAnswer:
          "1. 热阻隔离：在电机定子座与谐波刚轮/轴承安装座之间设计了迷宫式空气隔热槽与 FR4 高分子隔热垫圈，将电机热量优先通过外壳辐射导向外界，减少向传动核心的传导；2. 膨胀公差补偿：铝合金外壳（线膨胀系数 ~23e-6/K）与钢质轴承（~12e-6/K）膨胀不均，我在轴承轴向配合处预留了碟形弹簧浮动预紧区，允许 0.05mm 的轴向热位移而不改变预紧载荷；3. 结构测温与热补偿算法联动：在最接近谐波柔轮与轴承内圈处布置 PT1000 温度传感器，实时监控温升，当温升超过 45℃ 时动态微调编码器原点偏置补偿热漂移。",
      },
    ],
  },
  {
    id: "proj-3",
    title: "OpenArm 开源机械臂工业级重构：达妙 CAN-FD 电机+谐波减速机高刚度六轴协作机械臂 (彻底摒弃舵机)",
    category: "OpenArm 机械臂 / 达妙电机 / 谐波协作",
    highlightBadge: "OpenArm 核心 · 达妙力矩电机与谐波升级",
    difficulty: "核心实战",
    summary:
      "针对开源社区原版 OpenArm 机械臂常使用塑料件与普通舵机导致负载弱、低频抖动严重、发热易堵转的致命缺陷，全面重构为：六轴全采用达妙 (Damiao) BLDC 高扭矩无刷力矩电机 (J8009 / J4310) + 超薄微型谐波减速机 (1:50 / 1:100)、全航空铝 CNC 加工本体、FOC 矢量闭环驱动与 CAN-FD 工业总线通信。",
    backgroundMotivation:
      "基于 OpenArm 开源基底并结合机械臂结构优化经验，向面试官展示如何将低成本开源方案跃升为高重复定位精度 (±0.05mm)、支持力矩/阻抗混合控制的工业协作级机械臂。",
    mechanicalArchitecture: {
      mechanismType: "6-DOF 拟人串联机械臂 + 模块化末端快换法兰接口 (ISO 9409-1-50-4-M6)",
      degreesOfFreedom: 6,
      transmissionType: "J1~J3 关节采用达妙电机配一体化超薄谐波减速机 (1:100 / 1:50)；J4~J6 采用高精度微型行星谐波传动",
      actuatorType: "全闭环 CAN-FD 总线 FOC 达妙力矩电机 (双 14-bit 磁绝对值编码器，输入/输出端双反馈)",
      materials: [
        "臂杆与关节大臂: 6061-T6 挤压铝型材 + CNC精密加工 (工字加强筋结构)",
        "末端快换公母头: 7075-T6 铝合金硬化阳极氧化 + 钢珠气动锁紧机构",
        "传动同步带轮与齿圈: 7075铝合金硬质氧化 (齿形精铣)",
      ],
      keyDimensions: "臂展半径 650mm, 额定有效负载 1.5kg (极限负载 3.0kg), 重复定位精度从原版 ±0.8mm 提升至 ±0.05mm",
    },
    engineeringCalculations: [
      {
        formulaName: "同步带传动张力与张紧力计算",
        formulaExpr: "F_t = 2 · (P / v) + F_v + F_0",
        parameters: [
          { name: "P (电机输出功率)", value: "60", unit: "W", desc: "4/5/6 关节伺服电机额定功率" },
          { name: "v (同步带线速度)", value: "0.85", unit: "m/s", desc: "末端最大回转线速度" },
          { name: "F_0 (初张紧力)", value: "45", unit: "N", desc: "偏心张紧轮施加的基础预张紧力" },
        ],
        calculationConclusion: "带传动总紧边拉力 F_t = 186.2 N，选用 12mm 宽 HTD-3M 钢丝芯同步带，破断拉力 980N，安全系数 S = 5.26。",
      },
    ],
    dfmAndManufacturing: {
      criticalTolerances: [
        "大臂两端轴承位平行度: ≤0.015mm/100mm, 防止连杆装配产生别劲",
        "同步带轮中心距公差: 采用长腰孔偏心轮微调机构，调节范围 ±2.5mm",
        "快换法兰定位销孔尺寸与位置度: ⌀6H7, 位置度 0.01mm",
      ],
      machiningProcesses: [
        "臂杆采用标准空心矩形挤压铝管打孔铣槽，省去昂贵的大块整铝掏空加工费，成本降低 65%",
        "关节连接座采用压铸模具粗胚 + CNC关键孔精加工",
      ],
      costOptimizationTips: [
        "全臂螺栓规格缩减为 M2.5、M3、M4 三种，装配工位一把内六角批头搞定，大幅缩短产线换枪时间",
      ],
      assemblyNotes: [
        "使用声波张力计 (Sonic Tension Meter) 敲击同步带，测定固有振动频率，确保左右两侧同步带张力一致在 85±5 Hz",
      ],
    },
    bomList: [
      { partName: "主大臂/小臂铝合金结构套件", spec: "6061-T6 精密铣削 + 喷砂阳极氧化", qty: 1, material: "铝合金", estimatedCost: "¥450" },
      { partName: "前三轴达妙力矩电机模组", spec: "Damiao J8009 CAN-FD 伺服 + 1:50 谐波减速器", qty: 3, material: "组合件", estimatedCost: "¥1800" },
      { partName: "后三轴达妙紧凑电机", spec: "Damiao J4310 CAN-FD 闭环伺服 (带金属齿轮)", qty: 3, material: "组合件", estimatedCost: "¥780" },
      { partName: "气电一体快换法兰", spec: "⌀50mm 钢珠锁紧气动快换 (带6路电滑环)", qty: 1, material: "7075+轴承钢", estimatedCost: "¥280" },
      { partName: "HTD-3M 钢丝芯同步带组件", spec: "带长 210mm / 宽度 12mm", qty: 3, material: "PU+钢丝", estimatedCost: "¥45" },
    ],
    interviewDefensePoints: [
      {
        question: "面试官深挖：很多工程师把 3D 打印的开源机械臂改成金属件后，发现电机容易过载发热，装配时还严重卡死，你当时遇到了吗？怎么解决的？",
        interviewerTrap: "考察你对公差配合、累积形变以及机电选型真实工程踩坑经验的深度。",
        goldenAnswer:
          "原版 3D 打印件因材料弹性模量低（PLA/PETG 仅 2~3 GPa），结构件自身存在弹性变形，能吸收因加工同轴度不良产生的微小偏心；但换成刚度高出 25 倍的金属铝件（~70 GPa）后，任何 0.03mm 的同轴度误差都会直接转化为微米级过盈卡死，导致电机空载摩擦力矩翻倍飙升！我的解决策略：1. 在大臂轴承位引入双联薄壁角接触球轴承配合'一端固定一端游动'的浮动轴向布置，吸收温度与公差累积误差；2. 大臂加工采用同序双轴镗孔夹具，严格保证轴心平行度在 0.015mm 以内；3. 选用达妙无刷电机与谐波传动，额定扭矩储备提升 3 倍，工作温升降低 28℃。",
      },
    ],
  },
  {
    id: "proj-4",
    title: "动力锂电池软包/方形电芯高速化成分容自动化夹抱与四点精密调平机构",
    category: "锂电新能源非标自动化",
    highlightBadge: "新能源自动化实战 · 精实/恒翼能大客户背书",
    difficulty: "高级进阶",
    summary:
      "针对精实机电、广州擎天、恒翼能等客户在动力锂电池后段化成分容压床、充放电探针插拔及电芯高速搬运中常见的'电芯极耳变形受损、夹板受力不均导致内阻测试偏差、大行程机构震荡卡死'等难题，设计一套带四点气浮自调平、恒压力闭环反馈、双导向防啃死的高速柔性对中夹持机构。",
    backgroundMotivation:
      "在富喜康精密期间独立解决头部大客户自动化设备改造项目的实战结晶。不仅契合专科的新能源汽车电池专业背景，更完美连接了本科的机械电子精密机构设计能力，是展示非标自动化解决问题硬实力的王牌论据。",
    mechanicalArchitecture: {
      mechanismType: "平行双曲柄连杆对中机构 + 伺服电动缸主推 + 气动微调浮动调平副",
      degreesOfFreedom: 2,
      transmissionType: "滚珠丝杠副 (C5 级精度) + 双轴精密直线导轨 (THK SHS 系列预压滑块)",
      actuatorType: "汇川/松下 400W 交流伺服电机 + SMC 超薄气动浮动调平缸",
      materials: [
        "主受力夹板: 航空铝 7075-T6 (厚度 25mm，经去应力退火时效处理，防止加工翘曲)",
        "接触保护垫层: 导电防静电 ESD PEEK 绝缘板 (表面平面度 0.02mm)",
        "导向立柱: GCr15 轴承钢，表面高频淬火镀硬铬 (硬度 HRC 58-62)",
      ],
      keyDimensions: "行程 350mm, 夹持力范围 500N ~ 4500N (伺服扭矩闭环恒压精度 ±1.5%)，单次对中节拍 CT ≤ 1.2s",
    },
    engineeringCalculations: [
      {
        formulaName: "滚珠丝杠压杆稳定性 (欧拉临界载荷) 校核",
        formulaExpr: "F_k = (n · π² · E · I) / L²",
        parameters: [
          { name: "n (支撑方式系数)", value: "4.0", unit: "-", desc: "两端固定支撑方式" },
          { name: "E (钢材弹性模量)", value: "2.06e5", unit: "MPa", desc: "碳素合金钢" },
          { name: "I (丝杠截面惯性矩)", value: "12860", unit: "mm⁴", desc: "选用 ⌀20mm 滚珠丝杠底径" },
          { name: "L (丝杠受压最大跨距)", value: "420", unit: "mm", desc: "最远工作行程位置" },
        ],
        calculationConclusion: "临界失稳载荷 F_k = 59,200 N，实际最大夹紧推力 4500 N，安全系数 S = 13.15，彻底杜绝了高速推压过程中的丝杠弯曲共振。",
      },
    ],
    dfmAndManufacturing: {
      criticalTolerances: [
        "两侧压板相对平行度: ≤0.03mm (全行程 350mm 范围内)",
        "导向柱与直线轴承配合间隙: 采用 g6/H7 间隙配合 (8~18μm)，并加装含油铜套刮屑防尘圈",
        "探针接触面与电芯极耳贴合平面度: 0.015mm",
      ],
      machiningProcesses: [
        "大尺寸铝合金夹板在粗加工后必须安排 200℃ 恒温 4 小时去应力退火，再进行精铣，避免自然释放应力导致平面度变形",
        "导向底座采用一体式铸铁件时效处理后龙门五面体加工中心一次装夹镗铣双导轨安装槽",
      ],
      costOptimizationTips: [
        "将原本昂贵的多通道测力传感器阵列，简化为伺服电机电流扭矩观测器 + 4 组微型碟簧机械限位结构，单套机构节省电气成本 ¥4200",
      ],
      assemblyNotes: [
        "双导轨安装必须使用大理石精密方规与双百分表，以基准导轨为基准打表校准从动导轨，保证全行程平行度在 0.01mm 以内",
      ],
    },
    bomList: [
      { partName: "精密去应力对中夹板", spec: "7075-T6 25x320x220mm (双面精磨)", qty: 2, material: "航空铝", estimatedCost: "¥360" },
      { partName: "C5级精密滚珠丝杠副", spec: "⌀20 导程5mm, 行程400mm, 预压螺母", qty: 1, material: "合金钢", estimatedCost: "¥620" },
      { partName: "THK 高刚度直线导轨滑块", spec: "SHS20R 2轨4滑块 (中预压)", qty: 1, material: "轴承钢", estimatedCost: "¥780" },
      { partName: "汇川交流伺服驱动套件", spec: "400W 绝对值电机 + 伺服驱动器", qty: 1, material: "组合件", estimatedCost: "¥980" },
      { partName: "防静电ESD PEEK绝缘垫", spec: "厚度 5mm (表面电阻 10^6~10^9 Ω)", qty: 2, material: "PEEK", estimatedCost: "¥180" },
    ],
    interviewDefensePoints: [
      {
        question: "面试官深挖：在锂电池化成分容设备中，电芯充放电过程会发热产生体积膨胀（Breathing effect），如果夹持机构是死刚性，会导致电芯内部析锂损坏甚至起火；如果是纯气动，压力又不够均一。你在精实/恒翼能项目里是怎么解决这个矛盾的？",
        interviewerTrap: "极度考验你对动力电池工艺原理（不仅懂机械，还懂新能源汽车电池特性）的跨学科深度整合能力。",
        goldenAnswer:
          "这正是我专科新能源汽车背景与本科机械电子结合的核心优势所在！电芯在 0.5C/1C 充放电过程中厚度会有 1%~3% 的呼吸膨胀。传统恒刚度机构由于热应力叠加，会导致电芯局部压强超过 0.8 MPa 诱发析锂微短路；纯气动由于气压波动和气缸爬行，保压精度差。我们在富喜康为恒翼能改造时采用了'伺服初定位 + 恒刚度碟簧矩阵柔性浮动 + 电流力矩动态微跟随补偿'方案：伺服丝杠推至预定位置后，由碟簧组吸收 0.5~1.5mm 的呼吸位移，并将电芯表面压强恒定维持在 0.2~0.35 MPa 的黄金充放电区间；同时通过光栅尺位移反馈与充放电电流曲线联动，实现了保压均一性 ±2%，不仅提升了化成效率，还将电芯循环寿命测试一致性提高了 14%！",
      },
    ],
  },
];
