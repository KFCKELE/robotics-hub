import { OpenArmStageMeta, OpenArmTask } from "../types";

export const OPENARM_STAGE_METAS: OpenArmStageMeta[] = [
  {
    id: "stage_urgent",
    name: "加急/高优先级插队事务",
    subtitle: "紧急产线排障、突发联调、临时评审等优先处理事项",
    badge: "优先执行",
    color: "amber",
    totalTasks: 0,
  },
  {
    id: "stage_mech",
    name: "阶段一：OpenArm 与 Amazing Hand 构件选型",
    subtitle: "BLDC力矩电机法兰、谐波减速机配合公差、Amazing Hand 绞盘与碳纤件加工",
    badge: "机械与构件",
    color: "cyan",
    totalTasks: 4,
  },
  {
    id: "stage_elec",
    name: "阶段二：BLDC 无刷驱动、CAN-FD 与电气硬件底座",
    subtitle: "48V/24V大功率供电、CAN-FD 总线收发器、急停防烧保护与过流分流",
    badge: "FOC与电气",
    color: "blue",
    totalTasks: 4,
  },
  {
    id: "stage_embedded",
    name: "阶段三：嵌入式 FOC 与通信代码突击（攻克同事常改代码）",
    subtitle: "CAN-FD 报文解析、DMA环形缓冲、SimpleFOC 闭环电流环与校验和",
    badge: "嵌入式代码",
    color: "emerald",
    totalTasks: 5,
  },
  {
    id: "stage_kinematics",
    name: "阶段四：FOC 闭环调谐与 Amazing Hand 绳驱调零",
    subtitle: "双绝对值磁编零位标定、PID 刚度/阻尼整定、Amazing Hand Capstan 张力补偿",
    badge: "运动控制",
    color: "purple",
    totalTasks: 4,
  },
  {
    id: "stage_ros2",
    name: "阶段五：上位机、URDF 机械臂建模与 ROS2 节点联动",
    subtitle: "Python 串口/CAN 示教器、OpenArm 6-DOF URDF 刚体建模与 MoveIt2 轨迹规划",
    badge: "上位机/ROS2",
    color: "indigo",
    totalTasks: 4,
  },
  {
    id: "stage_debug",
    name: "阶段六：OpenArm + Amazing Hand 联调与量产排障",
    subtitle: "CAN 总线仲裁冲突排查、机械死锁软限位保护、百台量产装配治具与蠕变补偿",
    badge: "联调排障",
    color: "rose",
    totalTasks: 3,
  },
];

// Helper to format Date string as YYYY-MM-DD
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper to add days to a date string
export function addDaysToDateStr(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

// Initial Raw Template for OpenArm Tasks
export function getInitialOpenArmTasks(): OpenArmTask[] {
  const today = new Date();
  
  const rawData: Array<Omit<OpenArmTask, "scheduledDate" | "originalDate" | "postponeCount" | "status">> = [
    // 阶段一：机械与构件选型准备
    {
      id: "task-mech-1",
      stageId: "stage_mech",
      dayNumber: 1,
      title: "OpenArm 关节 3D 打印件选型与切片参数设定",
      description: "理解 OpenArm 各轴受力特性，确定 PETG / PA-CF（碳纤维尼龙）打印参数（壁厚≥6层，填充率≥45%），确保大臂旋转基座与肘关节抗弯扭刚度。",
      priority: "high",
      estimatedMinutes: 90,
      keyLearningPoints: [
        "为什么不能用普通 PLA：PLA 在电机持续 50℃ 发热工况下极易软化形变导致轴孔走位",
        "层间结合力优化：封闭保温箱打印 PA-CF，喷嘴温度 270℃，热床 85℃，消除应力分层",
        "壁厚比填充率更重要：力学承载主要由外壁承担，壁厚设置 2.4mm 显著提升抗扭刚度",
      ],
      embeddedCodeReference: {
        fileName: "机械选型与力学约束",
        codeSnippet: "// 对应嵌入式中力矩限幅参数: TORQUE_LIMIT_MAX = 80%; 防止结构件塑性形变",
        colleagueModifyReason: "同事常根据机械件刚度调整电机最大扭矩限幅，若刚度不足扭矩过大会直接拉裂打印件。",
        beginnerTip: "先打印测试 J1 旋转底座件，用千分尺测量内孔收缩率。",
      },
      deliverableChecklist: [
        { id: "c1", text: "完成 OpenArm 官方 STEP/STL 模型轻量化检查与分件归类", done: false },
        { id: "c2", text: "在切片软件中配置 PA-CF / PETG 打印参数（6层壁厚+45%Gyroid螺旋填充）", done: false },
        { id: "c3", text: "输出 J1 底座与 J2 摆臂切片 G-code 文件", done: false },
      ],
    },
    {
      id: "task-mech-2",
      stageId: "stage_mech",
      dayNumber: 2,
      title: "关节轴承（薄壁轴承/深沟球）过盈与公差压配实操",
      description: "掌握机器人关节常用薄壁轴承（如 6808 / 6706）装配手法，设计热嵌铜螺母与公差过渡配合（H7/js6），杜绝轴承晃动导致的末端累积回差。",
      priority: "high",
      estimatedMinutes: 100,
      keyLearningPoints: [
        "过盈量控制：3D 打印孔建议预留 0.05~0.1mm 负公差，使用简易压床或台虎钳平推压入",
        "轴承游隙影响：双联轴承背对背安装消除轴向窜动，末端重复定位精度直接提升 5 倍",
        "热嵌铜螺母温度：电烙铁调至 260℃，垂直缓慢下压，避免塑料外溢污染轴承轨道",
      ],
      embeddedCodeReference: {
        fileName: "zero_offset_calib.h",
        codeSnippet: "#define JOINT_BACKLASH_DEADBAND_DEG 0.35f // 机械间隙与轴承晃动补偿死区",
        colleagueModifyReason: "机械配合有晃动时，同事必须在代码里加大死区补偿，否则闭环控制会剧烈自激震荡！",
        beginnerTip: "装配时用手扳动连杆，应无任何轴向虚位且阻尼顺滑均匀。",
      },
      deliverableChecklist: [
        { id: "c1", text: "准备 6704/6806 薄壁轴承与 M3 热熔铜螺母", done: false },
        { id: "c2", text: "使用恒温烙铁完成 J1~J3 关节 12 处热熔螺母埋植", done: false },
        { id: "c3", text: "测试双轴承同轴度，旋转无卡涩感", done: false },
      ],
    },
    {
      id: "task-mech-3",
      stageId: "stage_mech",
      dayNumber: 3,
      title: "绞盘绳轮/传动齿轮系预紧与防滑脱机制",
      description: "学习 OpenArm 腕部与夹爪的传动设计，使用大力马（Dyneema）编织绳或同步带轮完成绞盘缠绕，设计二次张紧滑块消除正反转背隙滞后。",
      priority: "medium",
      estimatedMinutes: 80,
      keyLearningPoints: [
        "Capstan 欧拉摩擦公式：缠绕 2.5 圈以上即可实现无滑移摩擦自锁",
        "初张力预紧标准：使用微型弹簧或偏心螺栓预紧至 8~12N，避免绳索松弛脱槽",
        "末端走线保护：出绳口导向轮选用带法兰的微型 MR52 轴承，防止割磨塑料件",
      ],
      embeddedCodeReference: {
        fileName: "capstan_stretch_comp.c",
        codeSnippet: "float compensated_target = target_angle + sign(speed) * PRE_TENSION_LAG_DEG;",
        colleagueModifyReason: "绳驱机械臂在换向时有滞后死区，嵌入式同事写了这段方向符号补偿代码来消除滞后。",
        beginnerTip: "缠绳时顺着绞盘螺旋槽排布，绳头使用金属卡珠并滴微量厌氧胶锁紧。",
      },
      deliverableChecklist: [
        { id: "c1", text: "完成 J4~J6 腕部绳轮绞盘 2.5 圈规范缠绕", done: false },
        { id: "c2", text: "调节偏心张紧螺栓，消除正反向换向空行程", done: false },
        { id: "c3", text: "手动来回旋转 50 次，确认无咬绳或跳齿现象", done: false },
      ],
    },
    {
      id: "task-mech-4",
      stageId: "stage_mech",
      dayNumber: 4,
      title: "末端执行器标准法兰与快换机械接口制作",
      description: "规范 OpenArm 腕部法兰 ISO 9409-1 接口，制作灵巧手/二指夹爪的电气转接底座，预留舵机通信与气路排线防缠绕阻尼环。",
      priority: "medium",
      estimatedMinutes: 70,
      keyLearningPoints: [
        "接口通用化：35mm PCD 分布 4×M3 安装孔，方便后续随时切换微型灵巧手与平行夹爪",
        "线束防护拖链：关节处采用蛇皮网管与硅胶特软线，防止反复弯折导致 CAN/串口断线",
      ],
      deliverableChecklist: [
        { id: "c1", text: "打印标准 ISO 9409-1 35mm PCD 快换法兰盘", done: false },
        { id: "c2", text: "装配末端二指夹爪机构与硅胶防滑指垫", done: false },
      ],
    },

    // 阶段二：总线电气与供电硬件底座
    {
      id: "task-elec-1",
      stageId: "stage_elec",
      dayNumber: 5,
      title: "24V/12V 大功率稳压供电与多轴峰值电流核算",
      description: "核算 6 个飞特 STS3215/SCS0009 舵机满载与堵转工况下的瞬态电流（单舵机堵转 2.3A，6 轴峰值可达 12A），选型适配的明纬开关电源与降压模块。",
      priority: "high",
      estimatedMinutes: 90,
      keyLearningPoints: [
        "为什么机械臂一动就重启：舵机启动瞬间有数倍浪涌电流，电源瞬态响应差会导致 MCU 掉电复位（Brown-out Reset）",
        "并联大电容滤波：在主供电总线并联 2200μF 低 ESR 电解电容 + 0.1μF 陶瓷电容吸收反峰高压",
        "线径选择：主干供电线必须使用 16AWG 特软硅胶线，禁止使用细杜邦线！",
      ],
      embeddedCodeReference: {
        fileName: "power_monitor.c",
        codeSnippet: "#define VOLTAGE_LOW_ALARM_MV 9500 // 当母线电压跌落至 9.5V 触发保护停机",
        colleagueModifyReason: "同事经常调试低压报警阈值，避免电机群大动作时直接把主控拉死掉电。",
        beginnerTip: "用万用表测舵机供电端子电压，启动最大负载抓取时压降不能超过 0.5V。",
      },
      deliverableChecklist: [
        { id: "c1", text: "计算 6 轴舵机额定/堵转总功率（建议 12V 15A 180W 裕量）", done: false },
        { id: "c2", text: "焊接主供电分配板（XT60 接口 + 2200uF 固态电容阵列）", done: false },
        { id: "c3", text: "实测各轴供电端空载与单轴加力工况电压稳定性", done: false },
      ],
    },
    {
      id: "task-elec-2",
      stageId: "stage_elec",
      dayNumber: 6,
      title: "半双工 UART / RS485 串行总线硬件拓扑与方向自动切换",
      description: "搞懂总线舵机为什么只需要一根信号线（Half-Duplex UART）：分析 74HC126 / 74HC04 / 磁耦隔离电路，掌握单线总线手拉手串联拓扑。",
      priority: "high",
      estimatedMinutes: 100,
      keyLearningPoints: [
        "全双工 vs 半双工：电脑/主控有 TX/RX 两根线，舵机只有 Data 单线，需通过硬件逻辑门或主控单线半双工模式自动收发",
        "阻抗匹配与反射：总线速率高达 1.0 Mbps 时，末端舵机需注意信号完整性，防止高频反射回波",
        "总线手拉手接法：避免星型长分支布线，严格采用菊花链（Daisy Chain）串联",
      ],
      embeddedCodeReference: {
        fileName: "uart_half_duplex.c",
        codeSnippet: "// 开启 STM32 单线半双工模式\nUSART_HalfDuplex_Enable(USART1);\n// 发送前拉高使能，发完等待 TC 标志后拉低切换为接收",
        colleagueModifyReason: "嵌入式同事写通信驱动时，最常修改的就是收发方向切换延迟延时（如等待 5us），太快丢尾字节，太慢抢不到应答！",
        beginnerTip: "初学者推荐使用专门的 Feetech URT-1 或 USB-to-TTL 总线调试转接板。",
      },
      deliverableChecklist: [
        { id: "c1", text: "绘制 6 轴总线菊花链接线拓扑图与电源独立回路", done: false },
        { id: "c2", text: "连接 USB-to-TTL 调试板与 1 号舵机，点亮指示灯", done: false },
        { id: "c3", text: "使用上位机软件成功 Ping 通舵机 ID", done: false },
      ],
    },
    {
      id: "task-elec-3",
      stageId: "stage_elec",
      dayNumber: 7,
      title: "硬件急停回路、防反接 P-MOS 与 TVS 瞬态抑制保护",
      description: "搭建可靠的安全保护板：集成物理急停红色蘑菇头按钮、反向击穿 TVS 二极管（吸收电机快速停机反电动势）与自恢复保险丝。",
      priority: "medium",
      estimatedMinutes: 80,
      keyLearningPoints: [
        "电机反电动势：机械臂由高位自由下坠时，舵机变成发电机反充母线，若无 TVS / 稳压二极管会瞬间击穿主板 MOS 管！",
        "物理急停切断逻辑：急停开关直接切断 12V 舵机动力回路，但保持 5V MCU 主控供电，以便记录报警日志",
      ],
      deliverableChecklist: [
        { id: "c1", text: "制作急停开关常闭接线回路", done: false },
        { id: "c2", text: "在总线电源输入端焊接 SMBJ15A TVS 瞬态二极管", done: false },
        { id: "c3", text: "测试急停按下瞬间舵机完全卸力脱机", done: false },
      ],
    },
    {
      id: "task-elec-4",
      stageId: "stage_elec",
      dayNumber: 8,
      title: "示波器/逻辑分析仪抓取 1.0Mbps 舵机通信波形实战",
      description: "用 20 元简易逻辑分析仪抓取 UART 1Mbps 串口数据包波形，直观观察起始位、数据位、停止位与电平上升沿，彻底告别盲调。",
      priority: "medium",
      estimatedMinutes: 90,
      keyLearningPoints: [
        "波特率误差计算：1Mbps 时每 bit 宽度仅 1μs，主控晶振频偏超过 2% 就会导致校验错误",
        "逻辑分析仪协议解析：在 PulseView 中添加 UART 解码器，波特率设 1000000 8-N-1 直接看到 0xFF 0xFF 帧头",
      ],
      deliverableChecklist: [
        { id: "c1", text: "使用逻辑分析仪抓取一次发指令与舵机回包的完整时序波形", done: false },
        { id: "c2", text: "测量发送完成到舵机回复的响应间隔（典型 150~300μs）", done: false },
      ],
    },

    // 阶段三：嵌入式代码突击（攻克同事常改代码）
    {
      id: "task-embedded-1",
      stageId: "stage_embedded",
      dayNumber: 9,
      title: "解密同事常改代码 ①：飞特/STS 舵机协议帧与 Checksum 校验",
      description: "手写标准协议帧：[0xFF, 0xFF, ID, Length, Instruction, Param1..N, Checksum]，彻底搞懂 Checksum 计算公式 `~(ID + Length + ... ) & 0xFF`。",
      priority: "high",
      estimatedMinutes: 100,
      keyLearningPoints: [
        "为什么嵌入式同事总在改结构体：不同舵机协议（飞特/Dynamixel）帧头与指令码不同，必须封装通用驱动层",
        "校验和算错的下场：舵机直接无视该数据包，机械臂在运动过程中表现为偶尔卡顿、丢指令",
        "手写 C 语言打包函数：用指针填充缓冲区，提升打包速度，减少内存拷贝",
      ],
      embeddedCodeReference: {
        fileName: "servo_protocol.c",
        codeSnippet: `// 嵌入式同事最常修改的打包函数
uint8_t CalcCheckSum(uint8_t *buf, uint8_t len) {
    uint16_t sum = 0;
    for(int i = 2; i < len - 1; i++) sum += buf[i];
    return (uint8_t)(~sum); // 取反求和
}`,
        colleagueModifyReason: "当新增参数或修改数据包长度时，Checksum 循环计算区间极易偏移 1 字节导致通信失败，所以同事经常在此处加断点排查。",
        beginnerTip: "记住：帧头的两个 0xFF 不参与 Checksum 计算！从 ID 字节开始加到最后一个参数。",
      },
      deliverableChecklist: [
        { id: "c1", text: "阅读并理解 servo_protocol.c 的帧头打包与校验函数", done: false },
        { id: "c2", text: "手算一次 ID=1 写入目标角度 2048 的完整 16 进制报文", done: false },
        { id: "c3", text: "通过串口助手手动发送该 16 进制报文，成功驱动舵机旋转", done: false },
      ],
    },
    {
      id: "task-embedded-2",
      stageId: "stage_embedded",
      dayNumber: 10,
      title: "解密同事常改代码 ②：SyncWrite 6 轴同步广播指令深度剖析",
      description: "对比单发 Write 与广播 SyncWrite：单发 6 个舵机需要 6 次往返耗时 12ms，而 SyncWrite 一条指令下发全部 6 轴目标，耗时仅 1.8ms，消除机械臂各轴起步时间差！",
      priority: "high",
      estimatedMinutes: 100,
      keyLearningPoints: [
        "机械臂卡顿/画圈不圆的罪魁祸首：如果用单个 Write 循环发 6 个舵机，J1 和 J6 收到指令的时间差会导致关节动作不同步",
        "SyncWrite 报文结构：[0xFF, 0xFF, 0xFE(广播ID), 总长度, 0x83(SyncWrite), 目标起始寄存器, 单舵机数据长度, ID1, Data1, ID2, Data2 ... Checksum]",
        "广播指令无应答特性：发送广播包后舵机不会回复，避免总线发生 6 个舵机同时回包的电气冲突（Bus Collision）",
      ],
      embeddedCodeReference: {
        fileName: "sync_write_driver.c",
        codeSnippet: `// 同步写入 6 轴角度与速度
void SyncWrite6Axis(uint16_t angles[6], uint16_t speeds[6]) {
    uint8_t txBuf[40];
    // 填充 0xFE 广播帧 ...
    UART_DMA_Send(txBuf, sizeof(txBuf));
}`,
        colleagueModifyReason: "同事修改机械臂自由度或增加末端手爪轴时，必须同步修改 txBuf 长度与数据偏移量，否则末端轴收不到指令。",
        beginnerTip: "记住广播 ID 固定为 0xFE (254)，所有总线上的舵机都会同时解析并执行！",
      },
      deliverableChecklist: [
        { id: "c1", text: "在代码库中定位 SyncWrite 同步写实现函数", done: false },
        { id: "c2", text: "编写测试脚本同时下发 6 个舵机摆动指令，观察多轴同时起步一致性", done: false },
      ],
    },
    {
      id: "task-embedded-3",
      stageId: "stage_embedded",
      dayNumber: 11,
      title: "解密同事常改代码 ③：DMA 环形缓冲区与串口丢包超时处理",
      description: "弄懂为什么嵌入式同事总在调 UART DMA 缓冲区大小与超时重试机制（Timeout Retry），掌握在丢包时如何平滑重发而不发生死锁卡死。",
      priority: "high",
      estimatedMinutes: 90,
      keyLearningPoints: [
        "阻塞式 vs 中断/DMA：阻塞式等待串口回复会导致机械臂控制主循环卡顿掉帧；DMA 可以在后台硬件自动搬运数据",
        "超时定时器设定：发送读温度/读位置指令后，开启 2ms 超时定时器，超时未回则清空接收缓冲区并重试，防止程序陷入 while(1)",
        "环形缓冲区（RingBuffer）：解决连续读取多轴遥测数据时的粘包与断包问题",
      ],
      embeddedCodeReference: {
        fileName: "uart_dma_ringbuf.c",
        codeSnippet: `#define SERVO_READ_TIMEOUT_MS 3 // 舵机读取超时阈值 (同事常根据总线负载微调)`,
        colleagueModifyReason: "总线舵机多或者波特率低时，3ms 可能刚好回完，同事调成 5ms 解决偶尔读取失败报警；但调太大又会拖慢控制帧率。",
        beginnerTip: "机械臂控制循环周期一般设为 20ms（50Hz）或 10ms（100Hz）。",
      },
      deliverableChecklist: [
        { id: "c1", text: "运行串口异步接收测试，验证多包连续读取不粘包", done: false },
        { id: "c2", text: "模拟拔掉 3 号舵机，观察主控是否能触发超时报警而不死机", done: false },
      ],
    },
    {
      id: "task-embedded-4",
      stageId: "stage_embedded",
      dayNumber: 12,
      title: "解密同事常改代码 ④：EEPROM 零点寄存器 0x1E 与只读/只写防呆保护",
      description: "学习舵机内部寄存器表（Control Table）：区分 RAM 易失寄存器（掉电重置）与 EEPROM 永久寄存器（掉电保存，写入寿命约 10 万次），避免死循环频繁写 EEPROM 烧穿芯片！",
      priority: "medium",
      estimatedMinutes: 80,
      keyLearningPoints: [
        "0x1E 零位偏置寄存器：写入当前编码器 RAW 值，舵机内部硬件硬件自动重定位为 0 度",
        "EEPROM 写入锁（Lock Register 0x37）：修改偏置前必须先向 0x37 写入 0 解锁，改完写入 1 加锁防误改",
        "千万不要在 50Hz 循环里写 EEPROM：日常控制只写 RAM 目标位置寄存器（0x2A），仅在标定时按键触发写入一次 EEPROM",
      ],
      embeddedCodeReference: {
        fileName: "zero_calibration.c",
        codeSnippet: `// 仅在标定时调用一次!
void SaveZeroOffsetToEEPROM(uint8_t id, uint16_t offsetTicks) {
    UnlockEEPROM(id);
    WriteRegister16(id, 0x1E, offsetTicks);
    LockEEPROM(id);
}`,
        colleagueModifyReason: "很多新手误把写目标角度写进了 EEPROM 寄存器地址，导致舵机寿命耗尽；同事常在此处添加断言与单次标志位保护。",
        beginnerTip: "使用本工作台的【舵机调零工作台】标签页，一键可视化读取并写入 0x1E！",
      },
      deliverableChecklist: [
        { id: "c1", text: "查阅所用舵机型号（飞特 STS3215）完整寄存器映射表（Register Map）", done: false },
        { id: "c2", text: "完成 1 号舵机手动调零并触发写入 0x1E 寄存器，断电重启后验证零位保持", done: false },
      ],
    },
    {
      id: "task-embedded-5",
      stageId: "stage_embedded",
      dayNumber: 13,
      title: "解密同事常改代码 ⑤：多轴堵转电流监控与自动脱机保护状态机",
      description: "编写保护状态机：实时轮询 6 轴电流与温度（0x3E），当单轴电流持续 >1.8A 超过 800ms 时，自动降扭矩 50% 并蜂鸣器报警，保护减速齿轮不被拉崩。",
      priority: "high",
      estimatedMinutes: 90,
      keyLearningPoints: [
        "机械臂撞机保护：遇到机械死锁时电机堵转，若不及时卸载力矩，MOSFET 会在 3 秒内烧焦冒烟",
        "状态机设计：NORMAL_RUN -> WARNING_OVERCURRENT -> AUTO_BACKOFF_TORQUE -> SAFE_STOP",
      ],
      deliverableChecklist: [
        { id: "c1", text: "在上位机中监控单轴施加外力时的实时电流曲线", done: false },
        { id: "c2", text: "验证堵转超时自动切断使能安全机制", done: false },
      ],
    },

    // 阶段四：舵机标定与运动学整定
    {
      id: "task-kinematics-1",
      stageId: "stage_kinematics",
      dayNumber: 14,
      title: "OpenArm 6 轴绝对零位物理校准与脉冲-角度转换矩阵",
      description: "将机械臂摆成标准的垂直或全伸展基准姿态（机械原点），通过软件一键记录 6 轴 12-bit 磁编脉冲（0~4095），生成 `servo_offsets.h` 固化到代码中。",
      priority: "high",
      estimatedMinutes: 90,
      keyLearningPoints: [
        "脉冲转角度公式：`Angle_deg = (RawTicks - ZeroOffset) * (360.0f / 4096.0f) * (Invert ? -1 : 1)`",
        "机械死点避开：机械限位不能正好落在编码器 0/4095 翻转过零点，否则在零点附近摆动会发生 0° 变 360° 的跳变飞车！",
      ],
      embeddedCodeReference: {
        fileName: "servo_offsets.h",
        codeSnippet: `// 6 轴机械零点固化配置
const ServoCalibConfig g_openarm_offsets[6] = {
  { .id = 1, .zeroOffset = 2048, .invert = false, .minDeg = -135, .maxDeg = 135 },
  { .id = 2, .zeroOffset = 1024, .invert = true,  .minDeg = -90,  .maxDeg = 90  },
  // ...
};`,
        colleagueModifyReason: "重新拆装过连杆或者更换舵机后，同事必须重新测一次并在头文件里更新这组 offset 数据。",
        beginnerTip: "直接使用本站【舵机调零工作台】的 C/C++ 代码一键导出功能即可自动生成！",
      },
      deliverableChecklist: [
        { id: "c1", text: "将 OpenArm 机械臂固定在标定工装台，手动调整至零位姿态", done: false },
        { id: "c2", text: "读取并记录 6 个舵机当前 rawTicks 脉冲数", done: false },
        { id: "c3", text: "导出并替换嵌入式工程中的 servo_offsets.h 配置文件", done: false },
      ],
    },
    {
      id: "task-kinematics-2",
      stageId: "stage_kinematics",
      dayNumber: 15,
      title: "位置环 PID 增益（Kp/Ki/Kd）与抗重力下垂补偿实战整定",
      description: "手把手整定 PID：先调 Kp 提高机械臂刚度，出现高频振荡啸叫时加入 Kd 微分阻尼压制，下垂有稳态误差时引入简易重力前馈补偿 `T_ff = mg * L * cos(theta)`。",
      priority: "high",
      estimatedMinutes: 100,
      keyLearningPoints: [
        "Kp 太小：机械臂像面条一样软绵绵，带载下垂严重无法到达目标点",
        "Kp 太大：机械臂产生刺耳的 100Hz 机械共振啸叫，舵机急剧发烫",
        "Kd 的作用：相当于给关节注入虚拟阻尼油，快速吸收弹性晃动能量",
      ],
      embeddedCodeReference: {
        fileName: "pid_controller.c",
        codeSnippet: `// 同事常调的位置环输出
float output = Kp * error + Kd * (error - last_error) + Gravity_FeedForward(joint_angle);`,
        colleagueModifyReason: "机械臂末端挂载不同重量的夹爪或工件时，同事必须修改 Kp/Kd 以重新平衡刚度与抗振性。",
        beginnerTip: "调参口诀：先给小 Kp 到能动，慢慢加 Kp 直到微振，加 Kd 消除微振，最后补前馈消下垂！",
      },
      deliverableChecklist: [
        { id: "c1", text: "整定 J1 基座（纯水平惯量）与 J2 大臂（垂直重力负载）两套不同的 PID", done: false },
        { id: "c2", text: "施加 500g 负载，测试机械臂平举时末端下垂量 <2mm", done: false },
      ],
    },
    {
      id: "task-kinematics-3",
      stageId: "stage_kinematics",
      dayNumber: 16,
      title: "五次多项式 / S 曲线平滑轨迹规划防抖算法",
      description: "杜绝阶跃式突变指令：在嵌入式主控内实现 S 曲线加减速插补算法，让机械臂启停时加速度平滑连续（Jerk 加加速度连续），避免剧烈甩头损伤齿轮。",
      priority: "medium",
      estimatedMinutes: 90,
      keyLearningPoints: [
        "为什么不能直接发目标角：直接发 0° 到 90° 相当于无穷大加速度冲击，会引起巨大机械晃动并触发过流",
        "插补周期：每 10ms 计算一次当前目标角插补点 `s(t) = 10*(t/T)^3 - 15*(t/T)^4 + 6*(t/T)^5`",
      ],
      deliverableChecklist: [
        { id: "c1", text: "在主控中运行平滑轨迹插补算法", done: false },
        { id: "c2", text: "对比无加减速与带 S 曲线加减速的运动平稳度", done: false },
      ],
    },
    {
      id: "task-kinematics-4",
      stageId: "stage_kinematics",
      dayNumber: 17,
      title: "OpenArm 6-DOF 正向运动学 (FK) 与逆向运动学 (IK) 极简推导",
      description: "建立 D-H 参数表或旋量坐标系，理解末端空间坐标 $(X, Y, Z, Roll, Pitch, Yaw)$ 与 6 个关节角度 $(\theta_1 \dots \theta_6)$ 之间的数学映射。",
      priority: "medium",
      estimatedMinutes: 100,
      keyLearningPoints: [
        "FK 正运动学：已知 6 个舵机角度，计算末端手爪在空间的 3D 绝对坐标",
        "IK 逆运动学：给定目标抓取点坐标 $(X=250, Y=0, Z=150)$，反解出 6 个舵机各应该转多少度",
      ],
      deliverableChecklist: [
        { id: "c1", text: "测量 OpenArm 连杆长度 $L_1, L_2, L_3$ 并填入 D-H 矩阵表", done: false },
        { id: "c2", text: "使用 Python 脚本验证给定坐标解算关节角的正确性", done: false },
      ],
    },

    // 阶段五：上位机、Python 与 ROS2 联动
    {
      id: "task-ros2-1",
      stageId: "stage_ros2",
      dayNumber: 18,
      title: "Python 串口上位机示教器开发（滑条控制与动作录制重放）",
      description: "用 Python + PySerial 编写极简图形化示教器：拖动 6 个滑条实时控制机械臂，并支持【示教录制】（释放舵机力矩，用手拉着机械臂走一遍轨迹并保存为动作组 JSON 文件）。",
      priority: "high",
      estimatedMinutes: 90,
      keyLearningPoints: [
        "拖动示教原理：将舵机力矩关闭（Torque Disable），以 20Hz 频率读取各轴当前角度并保存数组；重放时开启力矩执行该数组",
        "动作组 JSON 格式：`[{ 't': 0, 'angles': [0,0,0,0,0,0] }, { 't': 1.5, 'angles': [30,-45,60,0,0,0] }]`",
      ],
      deliverableChecklist: [
        { id: "c1", text: "运行 Python 示教器脚本，连接串口", done: false },
        { id: "c2", text: "手动拖动机械臂示教一次完整的“抓取-提升-放置”动作并成功重放", done: false },
      ],
    },
    {
      id: "task-ros2-2",
      stageId: "stage_ros2",
      dayNumber: 19,
      title: "OpenArm URDF 机器人三维模型构建与 RViz 坐标系对齐",
      description: "编写 `openarm.urdf` 描述文件：定义各连杆（Links）的惯量矩阵、碰撞体、网格模型（Mesh）与关节转动轴向（Joint Limits），在 RViz 中实现数字孪生同步。",
      priority: "medium",
      estimatedMinutes: 100,
      keyLearningPoints: [
        "坐标系右手定则：严格保证 URDF 中每个 Joint 的旋转正方向与真实舵机旋转极性完全一致",
        "碰撞体简化：使用简易圆柱与立方体作为 Collision 网格，提升物理仿真与碰撞检测帧率",
      ],
      deliverableChecklist: [
        { id: "c1", text: "在 ROS2 中 launch 启动 openarm_description", done: false },
        { id: "c2", text: "在 RViz 中拖动 joint_state_publisher 滑条，模型动作与预期一致", done: false },
      ],
    },
    {
      id: "task-ros2-3",
      stageId: "stage_ros2",
      dayNumber: 20,
      title: "ROS2 驱动节点编写与 MoveIt 2 空间轨迹规划联动",
      description: "打通 ROS2 生态：编写 `openarm_hardware_interface` 或 Python ROS 节点，订阅 `/joint_trajectory` 话题并将轨迹点分发给串口驱动，实现 MoveIt 避障轨迹规划执行。",
      priority: "high",
      estimatedMinutes: 110,
      keyLearningPoints: [
        "MoveIt 2 架构：用户在 RViz 中拖动绿色交互球，MoveIt 自动计算 OMPL 避障路径并通过 ROS2 Action 接口发送给机械臂",
      ],
      deliverableChecklist: [
        { id: "c1", text: "配置 MoveIt 2 Setup Assistant 生成 OpenArm 配置包", done: false },
        { id: "c2", text: "成功完成一次 MoveIt 空间规划并在真实机械臂上执行到位", done: false },
      ],
    },
    {
      id: "task-ros2-4",
      stageId: "stage_ros2",
      dayNumber: 21,
      title: "视觉引导抓取准备：AprilTag / 深度相机坐标变换与手眼标定",
      description: "在机械臂旁架设 RGB-D 相机，识别带 AprilTag 标定码的目标物料，通过 Eye-to-Hand 齐次变换矩阵将相机像素坐标转化为机械臂基座物理坐标。",
      priority: "medium",
      estimatedMinutes: 90,
      keyLearningPoints: [
        "手眼标定本质：求解相机坐标系到机械臂基座坐标系的固定外参矩阵 $T_{base}^{camera}$",
      ],
      deliverableChecklist: [
        { id: "c1", text: "运行 AprilTag 检测节点，输出目标物体在相机下的 $(x, y, z)$ 坐标", done: false },
        { id: "c2", text: "计算坐标转换，驱动机械臂移动到物体上方 5cm 处预备抓取", done: false },
      ],
    },

    // 阶段六：整机联调、抗死锁与量产排障
    {
      id: "task-debug-1",
      stageId: "stage_debug",
      dayNumber: 22,
      title: "全速运转 2 小时耐久性老化与温升电流压力测试",
      description: "编写连续高频往复抓取测试循环，连续运行 2 小时，监控各轴舵机温度（最高不超过 65℃）与主供电模块发热情况，排查热衰减与累积失步。",
      priority: "high",
      estimatedMinutes: 120,
      keyLearningPoints: [
        "热衰减现象：舵机马达温度超过 70℃ 后磁钢退磁力矩下降约 20%，需评估是否加装微型散热风扇",
      ],
      deliverableChecklist: [
        { id: "c1", text: "运行 500 次无故障连续循环抓放测试", done: false },
        { id: "c2", text: "记录各关节电机最高工作温度与电流波形", done: false },
      ],
    },
    {
      id: "task-debug-2",
      stageId: "stage_debug",
      dayNumber: 23,
      title: "机械死锁与极限奇异点（Singularity）防呆策略",
      description: "分析机械臂大臂与小臂共线伸直时的奇异点问题，在逆运动学代码中加入阻尼最小二乘法（DLS）或角度软限位硬夹角保护，防止机械臂在奇异点失控飞车。",
      priority: "medium",
      estimatedMinutes: 80,
      keyLearningPoints: [
        "奇异点时雅可比矩阵行列式为 0，微小的末端速度会导致关节角速度趋向无穷大",
      ],
      deliverableChecklist: [
        { id: "c1", text: "在代码中加入奇异点接近度检测（Condition Number > 50 自动限速）", done: false },
      ],
    },
    {
      id: "task-debug-3",
      stageId: "stage_debug",
      dayNumber: 24,
      title: "OpenArm 个人研发作品集整理与嵌入式协同面试亮点提炼",
      description: "将装配图纸、通信协议源码注释、PID 整定曲线对比图、老化测试视频汇总为标准化工程文档，提炼简历与面试中可展开深入攻防的王牌话题。",
      priority: "high",
      estimatedMinutes: 90,
      keyLearningPoints: [
        "面试王牌回答要点：强调自己不仅懂机械 DFM 公差装配，更能直接看懂并协同修改嵌入式驱动代码与 PID 参数，具备机电一体化全栈贯通能力！",
      ],
      deliverableChecklist: [
        { id: "c1", text: "录制一段包含调零、SyncWrite 控制与实际分拣抓取的完整展示视频", done: false },
        { id: "c2", text: "同步更新至个人研发履历与 STAR 项目蓝图库中", done: false },
      ],
    },
  ];

  return rawData.map((item, index) => {
    const scheduled = new Date(today);
    scheduled.setDate(today.getDate() + index);
    const dateStr = formatDate(scheduled);
    return {
      ...item,
      scheduledDate: dateStr,
      originalDate: dateStr,
      postponeCount: 0,
      status: "pending",
    };
  });
}

// LocalStorage Keys
const STORAGE_KEY_OPENARM_TASKS = "openarm_project_tasks_v1";

export function loadSavedOpenArmTasks(): OpenArmTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OPENARM_TASKS);
    if (!raw) {
      const initial = getInitialOpenArmTasks();
      saveOpenArmTasks(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const initial = getInitialOpenArmTasks();
    saveOpenArmTasks(initial);
    return initial;
  } catch (e) {
    console.error("Failed to load saved OpenArm tasks", e);
    return getInitialOpenArmTasks();
  }
}

export function saveOpenArmTasks(tasks: OpenArmTask[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_OPENARM_TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error("Failed to save OpenArm tasks", e);
  }
}

// Smart Auto-Rollover Logic:
// If any task is scheduled on or before referenceDate (default today) and is NOT completed,
// it should be marked as "postponed" if its scheduledDate is earlier than today, and its scheduledDate rolled over to today.
export function autoRolloverUnfinishedTasks(tasks: OpenArmTask[], referenceDateStr?: string): {
  updatedTasks: OpenArmTask[];
  rolledOverCount: number;
} {
  const todayStr = referenceDateStr || formatDate(new Date());
  let rolledOverCount = 0;

  const updatedTasks = tasks.map((task) => {
    if (task.status === "completed") {
      return task;
    }

    // If task was scheduled before today and is not completed
    if (task.scheduledDate < todayStr) {
      rolledOverCount++;
      return {
        ...task,
        scheduledDate: todayStr,
        postponeCount: (task.postponeCount || 0) + 1,
        status: "postponed" as const,
      };
    }

    return task;
  });

  if (rolledOverCount > 0) {
    saveOpenArmTasks(updatedTasks);
  }

  return { updatedTasks, rolledOverCount };
}

// Insert High-Priority Emergency / Ad-hoc Task and automatically postpone remaining unfinished tasks
export function insertUrgentTaskAndPostponeOthers(
  tasks: OpenArmTask[],
  urgentTaskData: {
    title: string;
    description: string;
    estimatedMinutes: number;
    postponeDays: number;
    keyPoints?: string[];
  }
): OpenArmTask[] {
  const todayStr = formatDate(new Date());
  const newTaskId = `urgent-${Date.now()}`;

  const newTask: OpenArmTask = {
    id: newTaskId,
    stageId: "stage_urgent",
    dayNumber: 0,
    title: `[加急事务] ${urgentTaskData.title}`,
    description: urgentTaskData.description,
    scheduledDate: todayStr,
    originalDate: todayStr,
    postponeCount: 0,
    priority: "urgent",
    status: "in_progress",
    estimatedMinutes: urgentTaskData.estimatedMinutes || 120,
    keyLearningPoints: urgentTaskData.keyPoints || [
      "紧急事务需记录排查过程与根因，避免后续重复发生",
      "配合嵌入式或产线同事时注意明确输入输出信号与接口定义",
    ],
    deliverableChecklist: [
      { id: "u1", text: `完成加急处理: ${urgentTaskData.title}`, done: false },
      { id: "u2", text: "记录关键解决结论与参数变更", done: false },
    ],
    isCustom: true,
  };

  const daysToShift = Math.max(1, urgentTaskData.postponeDays || 1);

  // Shift all non-completed standard tasks forward by daysToShift
  const shiftedTasks = tasks.map((task) => {
    if (task.status === "completed") {
      return task;
    }

    const nextDate = addDaysToDateStr(task.scheduledDate, daysToShift);
    return {
      ...task,
      scheduledDate: nextDate,
      postponeCount: task.postponeCount + 1,
      status: task.status === "pending" ? ("postponed" as const) : task.status,
    };
  });

  const finalTasks = [newTask, ...shiftedTasks];
  saveOpenArmTasks(finalTasks);
  return finalTasks;
}

// Postpone all pending tasks by N days
export function postponeAllPendingTasks(tasks: OpenArmTask[], days: number = 1): OpenArmTask[] {
  const updated = tasks.map((task) => {
    if (task.status === "completed") {
      return task;
    }
    return {
      ...task,
      scheduledDate: addDaysToDateStr(task.scheduledDate, days),
      postponeCount: task.postponeCount + 1,
      status: "postponed" as const,
    };
  });
  saveOpenArmTasks(updated);
  return updated;
}
