import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialization of Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Project Architecture & Design Proposal Endpoint
app.post("/api/ai/project-advisor", async (req: Request, res: Response) => {
  try {
    const { prompt, currentProjects, targetField, customRequirements } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY not configured. Please configure your API key in Settings > Secrets.",
      });
    }

    const systemInstruction = `你是一位拥有15年资深经验的机器人与精密机电总工程师/技术总监，同时精通中国智能制造、协作机器人、人形机器人灵巧手（绳驱/连杆/微型伺服）、开源机械臂（如OpenArm/SO-ARM100等）以及锂电/新能源自动化设备研发（如精实、擎天、恒翼能等非标产线）。

用户的履历背景：
- 2024年佛山职业技术学院毕业（新能源汽车技术专科）；
- 2024年9月升本进入广东理工学院（机械电子工程专业本科在读/毕业）；
- 2025年6月入职深圳市富喜康精密机械有限公司（非标设计，主导并攻克了精实、广州擎天、恒翼能等知名锂电/电子客户设备自动化改造，大幅提升良品率与交付效率）；
- 2026年1月入职深圳卓研智创科技有限公司（主导/参与球头连接机械手、OpenArm结构件制造与配合公差优化、协作机器人精密结构优化以提升刚度稳定性与响应速度、绳驱机械手并成功实现批量量产落地交付）。

你的任务：根据用户目标与提问，为用户定制深度硬核、具备高技术含金量、可实际落地制作并在大厂/独角兽面试（如大疆、宇树、智元、汇川、先导、比亚迪等）中作为核心王牌项目展开技术攻防的方案设计。
请输出结构清晰、包含机构原理、动力选型、材料与DFM工艺、公差配合与仿真指标、面试高频亮点提炼的专业内容，语言硬核专业，具有实战指导意义。`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `用户需求: ${prompt || "基于我现有的球头机械手、绳驱机械手、OpenArm和非标锂电设备经验，为我深度构思/扩展一个兼具学术深度与量产落地价值的个人核心研发项目方案。"}
目标方向: ${targetField || "机器人末端灵巧手 / 协作臂精密结构 / 具身智能执行器"}
现有项目基底: ${JSON.stringify(currentProjects || [])}
额外定制诉求: ${customRequirements || "突出结构创新、工程计算、DFM加工经济性、以及面试能聊透的核心难点"}`,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      success: true,
      text: response.text,
    });
  } catch (error: any) {
    console.error("Error in /api/ai/project-advisor:", error);
    res.status(500).json({ error: error.message || "Failed to generate project advice" });
  }
});

// AI Senior Interviewer Deep-Dive Simulator
app.post("/api/ai/interview-simulator", async (req: Request, res: Response) => {
  try {
    const { mode, question, userAnswer, history, topic } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY not configured.",
      });
    }

    const systemInstruction = `你是一位严格、注重机械原理底层与工程落地细节的【资深机器人机械系统专家/面试官】（曾任职于华为/大疆/汇川/人形机器人独角兽）。
你正在面试一位拥有“新能源专科 -> 专升本机电工程 -> 富喜康精密(非标锂电精实/擎天/恒翼能) -> 卓研智创(球头机械手/OpenArm/协作臂精密结构优化/绳驱机械手量产落地)”背景的机械结构/机器人研发工程师。

如果 mode === 'evaluate':
请对候选人的回答进行专业技术拆解评估：
1. 【得分评级】：（S/A/B/C/D）
2. 【亮点分析】：肯定其切中工程实际、参数量化、机理剖析到位的地方；
3. 【致命漏洞/软肋点拨】：指出回答中含糊不清、缺乏理论力学/公差配合/热变形/摩擦阻尼/寿命可靠性分析的薄弱点；
4. 【总监级满分回答范例】：给出一段采用 STAR 法则、包含具体公式/公差等级/材料选型/试验验证的教科书式应答；
5. 【致命连环追问】：提出 1~2 个更深入的连环追问（针对回答中的潜在漏洞）。

如果 mode === 'generate_question':
根据所选专题 (${topic || "绳驱机械手动力学与制造公差"})，生成一道大厂/独角兽技术一面或技术二面总监必问的硬核技术深挖题目，附带考察意图说明。`;

    const contents = mode === "evaluate"
      ? `【面试题目】: ${question}\n【候选人回答】: ${userAnswer}\n【面试专题】: ${topic}\n【上下文历史】: ${JSON.stringify(history || [])}`
      : `请针对专题 [${topic}]，结合候选人背景（锂电设备、球头机械手、OpenArm、绳驱机械手量产、协作臂优化），出一道极具区分度的高难度面试深挖题。`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    res.json({
      success: true,
      text: response.text,
    });
  } catch (error: any) {
    console.error("Error in /api/ai/interview-simulator:", error);
    res.status(500).json({ error: error.message || "Failed in interview simulator" });
  }
});

// AI Resume & Project Description Polisher (STAR Method)
app.post("/api/ai/resume-polisher", async (req: Request, res: Response) => {
  try {
    const { rawDescription, roleTarget, highlights } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({ error: "GEMINI_API_KEY not configured." });
    }

    const systemInstruction = `你是一位专注于机器人、机械电子、高端自动化装备领域的资深猎头与技术总监。
请将工程师的粗略项目描述或工作经历，打造成符合顶级科技公司（大疆、汇川、优必选、宇树、智元、先导智能等）标准的硬核简历条目。
要求：
- 严格遵循 STAR 法则 (Situation, Task, Action, Result)；
- 量化成果（例如：降低背隙至 <1.5弧分、绳驱传动效率提升 18%、定位精度提升至 ±0.02mm、良品率从 91.2% 提升至 99.4%、量产装配工时缩短 35%）；
- 融入高价值工程关键词：GD&T形位公差、有限元FEA模态分析、Capstan摩擦轮传动、Dyneema/钨丝绳张力预紧机构、赫兹接触应力、谐波/RV减速机选型、动平衡校正、DFM/DFA制造经济性；
- 提供“简历精修版”与“面试口述30秒话术”。`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `原始描述: ${rawDescription}\n目标岗位: ${roleTarget || "机器人机械结构工程师 / 机电一体化研发工程师"}\n重点亮点: ${highlights || "非标锂电设备、球头机械手、OpenArm、绳驱机械手量产、协作臂精密优化"}`,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    res.json({
      success: true,
      text: response.text,
    });
  } catch (error: any) {
    console.error("Error in /api/ai/resume-polisher:", error);
    res.status(500).json({ error: error.message || "Failed to polish resume" });
  }
});

// AI Servo Zero-Calibration & Parameter Tuning Advisor
app.post("/api/ai/servo-tuning-advisor", async (req: Request, res: Response) => {
  try {
    const { servoModel, scenario, currentParams, issueDescription } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({ error: "GEMINI_API_KEY not configured." });
    }

    const systemInstruction = `你是一位精通机器人总线伺服舵机（如飞特STS3215/SCS0009、Dynamixel XM430/XL330、宇树/智元无刷舵机、微型空心杯绳驱舵机）控制与机械调零标定的高级机电与控制算法工程师。
你的专长包括：
1. 舵机机械零位（Mechanical Zero）与 12/14-bit 磁编码器电子零位（Encoder Offset / Center Calibration）校准流程与防呆技巧；
2. 绳驱张力维持、刚柔耦合防抖、球头多自由度联动、快速抓取与缓停梯形/S曲线加减速算法；
3. PID 闭环参数整定（Kp, Ki, Kd, 阻尼系数, 死区 Deadband, 前馈补偿）；
4. 电流/力矩/温度保护阈值计算，防止堵转烧电机与齿轮扫齿；
5. C/C++ (Arduino/STM32 HAL)、Python、ROS2 舵机驱动与协议通信解析（如飞特SMS_STS协议、Dynamixel Protocol 2.0）。

请针对用户舵机型号、工作场景及参数或异常问题，给出专业、量化、包含具体参数建议与故障原因排查（如回差、迟滞、振荡啸叫、失步过热等）的工程解决方案。`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `舵机型号与协议: ${servoModel || "飞特 STS3215 磁编码器总线舵机"}
工作机构场景: ${scenario || "微型绳驱灵巧手手指关节 / OpenArm多轴机械臂 / 球头并联机构"}
当前工作参数: ${JSON.stringify(currentParams || {})}
遇到的调零/运行问题或优化需求: ${issueDescription || "如何精准标定安装零位并消除绳驱空行程和末端高频振荡？"}`,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    res.json({
      success: true,
      text: response.text,
    });
  } catch (error: any) {
    console.error("Error in /api/ai/servo-tuning-advisor:", error);
    res.status(500).json({ error: error.message || "Failed in servo tuning advisor" });
  }
});

// AI OpenArm Project Task & Embedded Code Mentor
app.post("/api/ai/openarm-task-planner", async (req: Request, res: Response) => {
  try {
    const { mode, userGoal, dailyHours, targetFocus, currentCode, colleagueDoubt, urgentTask } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({ error: "GEMINI_API_KEY not configured." });
    }

    const systemInstruction = `你是一位精通 OpenArm、SO-ARM100、总线舵机机械臂以及嵌入式（STM32 / ESP32 / Arduino / ROS2）工程研发的技术导师与嵌入式主管。
你擅长以【通俗易懂、直击本质、毫无废话】的语言，向零基础机电/机械背景的初学者讲解嵌入式工程师日常工作中频繁修改的代码细节、总线协议、PID算法、零点校准、定时器中断以及多任务调度。

你的目标是：
1. 帮助零基础小白快速看懂嵌入式同事在改什么代码、为什么改、改了会有什么机械/运动学影响；
2. 为 OpenArm 机械臂准备提供结构化、可落地的每日实操任务与自动顺延排程；
3. 输出结构清晰的 Markdown，包含核心原理、关键代码对比、避坑指南与实操检查清单。`;

    let prompt = "";
    if (mode === "code_explainer") {
      prompt = `【零基础代码解惑】
用户提问/困惑: ${colleagueDoubt || "为什么嵌入式同事总是频繁修改串口缓冲区、SyncWrite 同步写数据包、以及 PID 的 Kp/Kd 参数？"}
相关代码片段:
\`\`\`c
${currentCode || "// 嵌入式同事常改代码"}
\`\`\`
请详细解答：
1. 【这行/这块代码究竟在控制什么？】用最通俗的比喻解释给零基础机械/机电同学听；
2. 【同事为什么要经常修改它？】在装配机械臂、换舵机、出现抖动或丢步时，为什么必须改这里；
3. 【改大/改小会有什么灾难性后果？】（如舵机啸叫烧管、机械臂下垂软绵绵、通信超时卡死）；
4. 【小白实战修改建议与安全范围】给出标准推荐值与测试方法。`;
    } else if (mode === "urgent_task") {
      prompt = `【突发任务快速拆解】
突发紧急任务: ${urgentTask || "明天需要交付一套双臂末端夹爪闭环抓取演示，但目前夹爪抓取时发生高频振荡"}
请给出：
1. 快速止血方案（30分钟内见效的参数调整或机械微调）；
2. 根本解决排障路线（机械结构 vs 嵌入式代码协同排查）；
3. 风险预警。`;
    } else {
      prompt = `【定制学习与研发排程】
用户当前目标: ${userGoal || "从零开始掌握 OpenArm 机械臂装配、舵机调试与嵌入式联调"}
每日可投入时长: ${dailyHours || 2} 小时
攻坚重点偏好: ${targetFocus || "机械与嵌入式协同联调"}
请为用户生成未来 7~14 天的详细每日任务拆解，包含具体可执行的里程碑与防坑要点。`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    res.json({
      success: true,
      text: response.text,
    });
  } catch (error: any) {
    console.error("Error in /api/ai/openarm-task-planner:", error);
    res.status(500).json({ error: error.message || "Failed in task planner" });
  }
});

// AI Microcontroller Firmware Code Generator
app.post("/api/ai/controller-code-generator", async (req: Request, res: Response) => {
  try {
    const { platform, chipModel, servoModel, baudRate, jointCount, controlMode, pinConfig, specialRequirements } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({ error: "GEMINI_API_KEY not configured." });
    }

    const systemInstruction = `你是一位精通 Arduino、STM32 (HAL/LL/FreeRTOS) 以及 ESP32 (Arduino-ESP32 / ESP-IDF) 的资深嵌入式固件架构师。
你的任务是为零基础机械/机电开发者生成【结构清晰、100%中文详细注释、直接可编译烧录、包含防呆与安全保护】的完整微控制器机器人驱动固件代码。

要求：
1. 代码必须具备完整性，不得省略关键协议打包函数或出现 "// 此处省略"；
2. 包含详尽的引脚接线注释、半双工收发使能逻辑、软限位校验、校验和 Checksum 计算；
3. 为零基础初学者附带：【编译工具链说明】、【硬件接线防呆指南】、【常见报错与排查步骤】；
4. 语言全部使用规范、友好的中文注释。`;

    const contents = `【目标主控平台】: ${platform || "arduino"} (${chipModel || "Arduino Mega 2560"})
【目标舵机型号】: ${servoModel || "飞特 STS3215 总线伺服舵机 (12-bit磁编码器)"}
【通信波特率】: ${baudRate || 1000000} bps
【控制自由度数】: ${jointCount || 6} 轴
【控制模式】: ${controlMode || "SyncWrite 同步写入 + 串口上位机回读"}
【用户自定义引脚】: ${JSON.stringify(pinConfig || {})}
【特殊功能诉求】: ${specialRequirements || "加入平滑加减速与电流堵转超时保护，附带串口命令调试接口"}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.5,
      },
    });

    res.json({
      success: true,
      text: response.text,
    });
  } catch (error: any) {
    console.error("Error in /api/ai/controller-code-generator:", error);
    res.status(500).json({ error: error.message || "Failed in controller code generator" });
  }
});

// AI Embedded Code Translator for Mechanical Engineers (机械工程师专属嵌入式代码透视镜 - 零基础保姆级大白话)
app.post("/api/ai/code-translator", async (req: Request, res: Response) => {
  try {
    const { code, fileName, language, focusQuestion, hardwareContext } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({ error: "GEMINI_API_KEY not configured. Please configure your API key in Settings > Secrets." });
    }

    const systemInstruction = `你是一位拥有10年经验、专门把复杂嵌入式代码翻译给【纯机械工程/机电一体化零基础小白】的“机械导师”。
你的沟通对象是一位机械专业同学（他只懂SolidWorks画图、齿轮箱、轴承、连杆、3D打印、减速比，对C++指针、类模板、内存管理、寄存器位运算完全是小白零基础！）。
嵌入式同事丢给他一份代码，他感觉头皮发麻、看不懂这些天书代码到底在控制机械机构干嘛。

你的绝对原则是：【严禁堆砌晦涩计算机名词】！必须用【100%大白话 + 生活机械比喻 + 直观物理图景】进行解析！

请按照以下6个模块输出（结构清晰，Markdown格式，重点加粗，语言亲切生动）：

### 💡 0. 一句话大白话直击本质（这文件到底在干嘛？）
- 用小学生都能听懂的生活比喻（例如：“这就像汽车的油门刹车踏板”、“这是电机的身份证铭牌”、“这是给机器人寄信的对讲机”）。
- 明确告诉小白：这个文件是给机械工程师看的，还是由编译器自动生成的废话文件（如果是 cmake_install.cmake 这类中间文件，直接告诉他可以放心忽略！）。

### 🎯 1. 物理动作全景（代码里的每一段逻辑，会让电机/关节怎么动？）
- 抛开编程语法，还原真实机械场景：
  - 电机是何时通电立起来的？（电机上电使能）
  - 机械臂是转动了45度，还是在用力顶住某个物体？（位置控制 vs 阻抗/力控）
  - 为什么要给电机发 8 个字节的 CAN 报文？每个字节装了什么物理东西？

### 🦾 2. 机械小白必须盯紧的【参数生死线】（对照表）
| 机械物理量 | 代码里的变量名 | 设定的数值 | 机械小白必须懂的物理影响 |
| :--- | :--- | :--- | :--- |
| 最大输出力矩 | T_MAX / max_torque | 例如 10.0 Nm | 如果你画的3D打印塑料关节只能承受 3Nm，电机一堵转就会把塑料齿轮打碎！ |
| 旋转角度限制 | P_MIN, P_MAX | 例如 -3.14 ~ +3.14 rad | 限制电机只能转半圈，防止机械臂把电线绞断或者砸到机架！ |
| 关节刚度 (弹簧硬度) | Kp | 例如 20.0 | Kp 越大，关节像硬钢筋一样硬；Kp 太大机械臂会疯狂剧烈发抖；Kp 太小大臂会软绵绵抬不起来！ |
| 关节阻尼 (减震器) | Kd | 例如 1.5 | 相当于液压阻尼器，防止机械臂在到位时来回晃荡冲过头！ |

### 🔌 3. 硬件接线与电气常识（小白防烧板指南）
- CAN_H 和 CAN_L 怎么接？
- 为什么总线末端一定要并联 120Ω 电阻？（测万用表两端阻值应为 60Ω，否则电脑会疯狂报找不到电机！）
- 电机供电电源电压（如 24V / 48V）与上电顺序。

### ⚠️ 4. 机械装配常见故障与代码排查（对症下药）
- 故障1：【机械臂疯狂剧烈抖动、啸叫发烫】→ 告诉小白代码里的哪个参数设太大了（通常是 Kp 过大或通信延迟）。
- 故障2：【关节软趴趴，挂了负载抬不起来】→ 检查代码里的力矩限幅或 Kp 是否太小。
- 故障3：【机械臂转动角度和 SolidWorks 里对不上】→ 检查代码里是不是忘记乘以机械减速比（如 10:1）。

### 💬 5. 跨专业高情商对齐话术（直接复制发给嵌入式同事）
- 给出 2~3 条机械工程师可以直接发微信/钉钉给写代码同事的话术，显得专业、有条理且不外行。`;

    const contents = `【代码文件名】: ${fileName || "embedded_driver.c"}
【编程语言】: ${language || "C / C++"}
【硬件背景】: ${hardwareContext || "机器人机械臂 / 达妙电机 / 飞特舵机 / CAN通信"}
【小白当前最困惑的问题】: ${focusQuestion || "我是纯机械小白，请用最通俗的大白话告诉我这篇代码的物理动作，不要讲晦涩的C++语法！"}

【待分析代码内容】:
\`\`\`${language || "c"}
${code ? code.slice(0, 15000) : "// 空代码"}
\`\`\``;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    res.json({
      success: true,
      text: response.text,
    });
  } catch (error: any) {
    console.error("Error in /api/ai/code-translator:", error);
    res.status(500).json({ error: error.message || "Failed in code translator" });
  }
});

// AI Project Archive & Decompressed Workspace Architect Analyzer (工程包全景小白导读)
app.post("/api/ai/project-archive-analyzer", async (req: Request, res: Response) => {
  try {
    const { archiveName, fileSummaryList, keyFileContents, userQuestion } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({ error: "GEMINI_API_KEY not configured. Please configure your API key in Settings > Secrets." });
    }

    const systemInstruction = `你是一位善于用生活常识和机械直觉带零基础小白入门的资深机电导师。
用户是一位机械工程专业同学，自称【代码纯小白】。他刚上传了解压后的机器人控制工程包（内含 C++ 驱动、CMake、CAN 脚本等）。
他看到一大堆文件感到非常困惑和焦虑，不知道从何下手。

你的任务是：【像老学长带刚进实验室的学弟一样，手把手进行保姆级全工程导读】！
语言必须极具亲和力、通俗生动、彻底告别计算机科班黑话！

请按以下结构输出（结构清晰、Markdown格式、重点加粗）：

### 🧭 1. 30秒通俗全景：这个工程包到底在造什么？
- 用一两句话概括整个工程的物理功能（如“这是一个通过 CAN 总线控制 6 个达妙无刷电机组成机械臂的 C++ 控制程序”）。
- 把文件夹结构比喻成汽车或工厂的各个部门（如：include 是图纸库、src 是制造车间、scripts 是启动钥匙、build 是加工垃圾箱）。

### 🛠️ 2. 文件红黑榜：小白先看什么？可以跳过什么？
- 🟢 **必看核心文件**：列出最核心的 2~3 个 .cpp 和 .h（告诉他哪里是调角度和力矩的地方）。
- 🔴 **放心跳过的文件**：明确告诉他像 \`cmake_install.cmake\`、\`Makefile\`、\`.o\` 这些是编译器自动吐出来的中间产物，千万不要去读，不要给自己增加心理负担！

### 🚀 3. 手把手在 Linux/编译器终端跑起来（保姆级三步走）
- 给出最清晰的终端命令（附带每行命令在物理世界干了什么）：
  1. \`sudo ip link set can0 up type can bitrate 1000000\` （把对讲机调到 1Mbps 频道）
  2. \`mkdir build && cd build && cmake .. && make\` （把零散零件拼装成一个可执行程序）
  3. \`./start_motor\` （通电启动电机！）

### ⚙️ 4. 机械人必须把关的关键参数
- 提醒小白核对减速比、最大电流、软限位角度，防止撞机。

### ⚠️ 5. 小白首次上电安全防炸守则
- 必须调小可调直流电源电流（限流 1.5A）！
- 手握急停开关，机械臂周围 1 米严禁站人！

### 💬 6. 跨专业沟通小抄
- 给出 2 条可以直接复制给嵌入式同事的高情商提问。`;

    const contents = `【压缩包名称】: ${archiveName || "project_archive.zip"}
【文件结构概览】:
${fileSummaryList || "包含源码文件、头文件与构建脚本"}

【关键核心文件片段】:
${keyFileContents || "// 未提供核心片段"}

【用户特别关心的疑问】:
${userQuestion || "我是纯机械小白，请手把手告诉我这个工程包怎么看、怎么跑，哪些文件重要、哪些可以跳过！"}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    res.json({
      success: true,
      text: response.text,
    });
  } catch (error: any) {
    console.error("Error in /api/ai/project-archive-analyzer:", error);
    res.status(500).json({ error: error.message || "Failed in project archive analyzer" });
  }
});

// AI Heatsink Drawing & Contact Surface Vision Analyzer
app.post("/api/ai/heatsink-drawing-analyzer", async (req: Request, res: Response) => {
  try {
    const { imageBase64, drawingDescription, userSpecs } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({ error: "GEMINI_API_KEY not configured. Please configure your API key in Settings > Secrets." });
    }

    const systemInstruction = `你是一位精通机电热设计、流体与传热学 (CFD)、以及三维 CAD 实体建模的资深热学仿真与结构总工程师。
用户向你上传了一张【散热器接触面工程图纸、草图或 CAD 截图】，或者提供了接触面形状描述。

你的任务是：
1. 视觉解析图纸中的接触面轮廓（矩形/圆形/L型避位/阶梯双台阶/多边形/带安装孔等）、标注尺寸、安装螺丝孔位坐标与孔径、主要芯片发热区域 (Hotspot)；
2. 依据传热学模型（温差 ΔT = T_max - T_ambient，目标热阻 R_req = ΔT / P），反推散热片最优几何参数（底板厚度、翅片高度、翅片厚度、推荐翅片数、翅片走向）；
3. 必须输出一个规范的 JSON 结构块（用 \`\`\`json ... \`\`\` 包裹），以便前端直接解析并驱动 3D 视图与参数自动填充；
4. 在 JSON 块下方，给出详尽的工程评估分析（包括接触面均温性分析、扩散热阻 Spreading Resistance 评估、安装孔避空与结构干涉建议、以及推荐制造工艺：CNC / 铝挤压 / 铲齿 Skiving / 冷锻）。

JSON 输出规范格式如下（务必使用纯数值 mm / W / ℃）：
\`\`\`json
{
  "shapeType": "rectangle",
  "baseWidth": 60,
  "baseLength": 80,
  "baseThickness": 3.5,
  "maxHeight": 25,
  "circleDiameter": 70,
  "lShapeCutout": { "cutoutW": 25, "cutoutL": 35 },
  "mountingHoles": [
    { "x": -22, "y": -32, "diameter": 3.2, "type": "counterbore" },
    { "x": 22, "y": -32, "diameter": 3.2, "type": "counterbore" },
    { "x": -22, "y": 32, "diameter": 3.2, "type": "counterbore" },
    { "x": 22, "y": 32, "diameter": 3.2, "type": "counterbore" }
  ],
  "heatSourceZone": {
    "width": 30,
    "length": 30,
    "offsetX": 0,
    "offsetY": 0,
    "estimatedPower": 35
  },
  "recommendedMaterial": "AL6061",
  "finOrientation": "longitudinal",
  "power": 35,
  "maxTemp": 85,
  "ambientTemp": 25,
  "summaryTitle": "基于图纸识别的定制接触面散热器方案",
  "keyObservations": [
    "识别到底座包含4个M3沉头安装定位孔",
    "中心30x30mm热源区域热流密度较高，建议底座厚度不低于3.5mm以降低扩散热阻"
  ]
}
\`\`\``;

    const parts: any[] = [];

    if (imageBase64 && typeof imageBase64 === "string" && imageBase64.length > 50) {
      let mimeType = "image/png";
      let cleanBase64 = imageBase64;
      if (imageBase64.includes(";base64,")) {
        const split = imageBase64.split(";base64,");
        const mimeMatch = split[0].match(/:(.*?);/);
        if (mimeMatch) mimeType = mimeMatch[1];
        cleanBase64 = split[1];
      }
      parts.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
    }

    const userPrompt = `【图纸与接触面需求输入】:
${drawingDescription || "请根据我上传的图纸/草图，识别接触面几何特征、尺寸标注、安装孔及发热区域，生成满足散热需求的定制散热片。"}

【用户参考工况】:
${JSON.stringify(userSpecs || {})}`;

    parts.push({ text: userPrompt });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: parts,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    const responseText = response.text || "";

    // Parse JSON block if present
    let parsedConfig = null;
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        parsedConfig = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.warn("Failed to parse JSON from AI response:", e);
      }
    }

    res.json({
      success: true,
      text: responseText,
      config: parsedConfig,
    });
  } catch (error: any) {
    console.error("Error in /api/ai/heatsink-drawing-analyzer:", error);
    res.status(500).json({ error: error.message || "Failed to analyze heatsink drawing" });
  }
});

// AI SolidWorks FEA Simulation & Structural Optimization Advisor
app.post("/api/ai/fea-advisor", async (req: Request, res: Response) => {
  try {
    const { modelName, material, loadParams, constraintParams, feaResults, userQuestion } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({ error: "GEMINI_API_KEY not configured. Please configure your API key in Settings > Secrets." });
    }

    const systemInstruction = `你是一位拥有15年资深经验的有限元分析 (FEA / CAE) 与结构力学总工程师（精通 SolidWorks Simulation, ANSYS, Abaqus, HyperMesh）。
你擅长以严谨的工程力学理论与实战制造经验，对机械零件的有限元受力仿真结果（冯·米塞斯等效应力 von Mises Stress、总形变位移 Displacement、安全系数 FOS、应力集中点）进行深度剖析与工程优化。

你的分析要求：
1. 【强度与失效判定】：对比最大等效应力 $\\sigma_{max}$ 与材料屈服极限 $\\sigma_y$，评估当前安全系数 $FOS = \\sigma_y / \\sigma_{max}$ 是否满足工况要求（通常静载要求 $FOS \\ge 1.5\\sim 2.0$，冲击/振动载荷要求 $FOS \\ge 2.5\\sim 3.0$）；
2. 【应力集中根源与几何倒角建议】：分析最大应力发生区域（如轴肩、法兰根部、螺栓安装孔、拐角），给出具体的过渡圆角推荐半径（如从 $R1$ 增大到 $R3\\sim R4$ 降低应力集中系数 $K_t$ 30%~50%）；
3. 【拓扑轻量化与减重掏空方案】：指出哪些区域属于低应力“材料冗余死区”（$\\sigma < 0.2\\sigma_y$），指导工程师在不牺牲结构刚度的前提下进行减重挖槽或三角形镂空，预计减重百分比；
4. 【加强筋与刚度提升设计】：针对最大挠度位移偏大区域，建议如何布置纵向/工字型加强肋 (Rib)，利用截面惯性矩 $I$ 的提升来成倍抑制弯曲形变；
5. 【材料与制造工艺替代】：对比当前材料与其他备选材料（如 6061-T6 铝合金、7075-T6 航空铝、45# 钢、PA12-CF 碳纤 3D打印）在重量、成本与刚度上的权衡；
6. 输出必须包含清晰的 Markdown 标题、公式、数据对比表格与落地执行检查清单，语言专业硬核且条理分明。`;

    const prompt = `【分析模型】: ${modelName || "机械零件/支架模型"}
【所选材料】: ${JSON.stringify(material || { name: "6061-T6 铝合金", yieldStrength: 276, elasticModulus: 68.9, poissonRatio: 0.33 })}
【载荷与施力面】: ${JSON.stringify(loadParams || { forceN: 500, direction: "-Y 方向向下", loadType: "表面集中载荷" })}
【约束与固定面】: ${JSON.stringify(constraintParams || { fixedType: "完全固定约束 (U_x=U_y=U_z=0)", fixedFaces: "底面安装法兰" })}
【有限元计算结果】:
- 最大冯·米塞斯等效应力 $\\sigma_{max}$: ${feaResults?.maxVonMisesStress || "142.5"} MPa
- 材料屈服极限 $\\sigma_y$: ${feaResults?.yieldStrength || "276"} MPa
- 最小安全系数 Min FOS: ${feaResults?.minFOS || "1.94"}
- 最大合位移 $U_{max}$: ${feaResults?.maxDisplacement || "0.082"} mm
- 危险应力集中点: ${feaResults?.hotspotLocation || "悬臂根部过渡角与固定螺孔边缘"}

【用户自定义分析疑问/重点诉求】:
${userQuestion || "请根据当前有限元云图计算结果，给出结构轻量化减重、消除根部应力集中、以及提高抗弯刚度的专业优化改进方案！"}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    res.json({
      success: true,
      text: response.text,
    });
  } catch (error: any) {
    console.error("Error in /api/ai/fea-advisor:", error);
    res.status(500).json({ error: error.message || "Failed in FEA AI Advisor" });
  }
});

// Vite Middleware & Static Serving setup
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupServer();
