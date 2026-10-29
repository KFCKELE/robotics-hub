import { CodeTranslationResult } from "../types";

export interface FileAnalysisDetails {
  fileRole: string; // "CMake 构建安装脚本" / "CAN 驱动底层" / "C++ 主控制循环" 等
  plainExplanation: string; // 零基础机械小白听得懂的解释
  isMustReadForMechanical: boolean; // 是否是机械小白需要关注的核心文件
  whyMechanicalCares: string; // 为什么机械工程师需要关心/不用关心
  analogy: string; // 生活比喻
  actionItems: string[]; // 小白可以采取的操作
}

/**
 * 针对各类文件（CMake, .h, .cpp, .sh, .py, .md 等）生成小白级白话大白话解读
 */
export function getNoviceFileKnowledge(fileName: string, filePath: string, content: string): FileAnalysisDetails {
  const lowerName = fileName.toLowerCase();
  const lowerPath = filePath.toLowerCase();

  // 1. cmake_install.cmake / CMakeLists.txt / Makefile / *.cmake (构建与安装脚本)
  if (lowerName.includes("cmake_install") || lowerName.endsWith(".cmake") || lowerName === "cmakelists.txt" || lowerName === "makefile") {
    const isGenerated = lowerName.includes("cmake_install") || lowerPath.includes("/build/");
    return {
      fileRole: isGenerated ? "🛠️ CMake 自动生成的中间安装脚本 (机器看的)" : "📜 CMake 工程编译蓝图 (告诉电脑怎么打包程序)",
      plainExplanation: isGenerated
        ? `【大白话】这是一份编译器自动生成的“送货清单脚本”。当同事在电脑里输入 make install 时，电脑就会按照这个文件把编译好的控制软件复制到系统的运行目录去（例如 /usr/local/bin）。`
        : `【大白话】这是整个 C++ 工程的“组装说明书”。它告诉编译器：先去 include 文件夹找零件图纸 (.h)，再去 src 找主体代码 (.cpp)，最后把它们像拼积木一样拼成一个可以直接控制电机的可执行程序。`,
      isMustReadForMechanical: false,
      whyMechanicalCares: isGenerated
        ? `🚨 小白重点提示：这个文件是电脑自动产生的，里面全是由 CMake 自动生成的语法（比如 set(CMAKE_INSTALL_PREFIX...)）。作为机械工程师，你完全不需要读懂或修改它！你可以放心跳过它，去左侧点击查看 src/ 里面的 .cpp 或 include/ 里面的 .h 文件。`
        : `如果你想在 Linux 终端里给机械臂安装第三方库，或者同事告诉你“找不到 socketcan 库”，通常才需要在这个说明书里加一行库的名字。`,
      analogy: isGenerated
        ? `就像你买了宜家家具，包装盒里附带的一张工业条形码和仓库发货清单，是给物流机器人看的，不需要你手工去改。`
        : `就像一套乐高积木的官方拼装大纲，指引工人去哪个盒子里拿零件。`,
      actionItems: isGenerated
        ? [
            "👉 机械小白建议：直接忽略此文件，去点击带有 📄 .cpp 或 📑 .h 后缀的电机驱动文件！",
            "👉 如果你是在终端里编译，只需在上一级目录运行 `cmake .. && make`，系统会自动跑这个文件。",
          ]
        : [
            "👉 想要编译项目时，在终端运行 `mkdir build && cd build && cmake .. && make` 即可。",
          ],
    };
  }

  // 2. socketcan.h / socketcan.cpp (CAN 总线通信底层)
  if (lowerName.includes("socketcan") || lowerName.includes("can_driver") || lowerName.includes("can_bridge")) {
    return {
      fileRole: "🔌 Linux SocketCAN 总线收发邮局 (负责寄信收信)",
      plainExplanation: `【大白话】这是负责在电脑主控（如工控机/树莓派/Jetson）和电机的 CAN 总线接口之间“收发快递”的代码。就像电脑的网卡驱动，它负责把你的电机控制指令打包成 CAN 报文发送给电机，再把电机的实时角度、速度、温度数据读回来。`,
      isMustReadForMechanical: true,
      whyMechanicalCares: `机械工程师不需要懂 C++ 的网络套接字（Socket），但你必须知道：达妙/宇树电机就是通过这段代码里配置的 can0 总线波特率 (通常是 1,000,000 即 1Mbps) 和电机的 CAN_H / CAN_L 双绞线通信的。如果总线末端没接 120Ω 电阻，这段代码就会狂报“通信超时”！`,
      analogy: `就像工地上的一部对讲机。这段代码负责打开对讲机频道（1Mbps）并呼叫 1 号关节电机。`,
      actionItems: [
        "🔍 检查硬件：确保工控机 USB-to-CAN 适配器连上了机械臂的 CAN_H 与 CAN_L，且首尾两端有 120Ω 终端电阻（测总线两端阻值应为 60Ω）。",
        "💻 终端命令：在 Linux 终端执行 `sudo ip link set can0 up type can bitrate 1000000` 即可激活它。",
      ],
    };
  }

  // 3. damiao.h / damiao_motor.h / motor.h (电机驱动头文件与参数字典)
  if (lowerName.includes("damiao.h") || lowerName.includes("motor.h") || (lowerName.endsWith(".h") && !lowerName.includes("socketcan"))) {
    return {
      fileRole: "📖 电机参数图纸与字典定义 (极度重要！)",
      plainExplanation: `【大白话】这是整个工程的“电机参数字典”和“协议说明书”。它里面定义了：达妙电机的最大力矩是多少牛·米 (Nm)、最大转速是多少 rad/s、位置和力矩的数据范围，以及电机发送过来的 8 个字节每一位代表什么含义（比如哪个字节是温度，哪个字节是电流）。`,
      isMustReadForMechanical: true,
      whyMechanicalCares: `⭐ 机械工程师最需要看的文件！代码里的物理量上限（比如 P_MAX=12.5rad 代表转动角度范围、T_MAX=10Nm 代表最大力矩）直接对应你的机械结构强度。如果你的机械臂关节齿轮只能承受 5Nm，而这里写了 10Nm，电机堵转时齿轮就会被打崩！`,
      analogy: `就像电机的“出厂铭牌”和“安全操作规程”。`,
      actionItems: [
        "⭐ 核心关注：查看里面的 P_MAX（最大转角）、V_MAX（最大速度）、T_MAX（最大力矩限制）。",
        "💬 配合嵌入式：如果机械减速比不是 1:1，提醒同事在计算角度时一定要乘以真实减速比！",
      ],
    };
  }

  // 4. damiao.cpp / damiao_motor.cpp / motor.cpp / main.cpp (实际控制动作)
  if (lowerName.includes("damiao.cpp") || lowerName.includes("motor.cpp") || lowerName.includes("main.cpp") || lowerName.endsWith(".cpp")) {
    return {
      fileRole: "🦾 机械臂电机核心运转控制逻辑 (动作大脑)",
      plainExplanation: `【大白话】这是真正指挥电机转动的大脑代码！它里面包含了：让电机使能上电、发送目标角度（如让 1 号关节转 45 度）、读取电机的编码器真实角度、以及采用 MIT 阻抗控制（Kp 刚度、Kd 阻尼）计算输出力矩。`,
      isMustReadForMechanical: true,
      whyMechanicalCares: `⭐ 机械小白最核心的协同战场！当你想让机械臂动起来、或者发现机械臂到位时剧烈抖动、或者关节软绵绵抬不起大臂时，全是因为这个文件里的目标角度、加减速时间或者 PID 刚度 (Kp) 设得不对。`,
      analogy: `就像驾驶员的手和脚，踩油门（给定力矩）、打方向盘（给定角度）、踩刹车（阻尼 Kd）。`,
      actionItems: [
        "🎯 找关键函数：搜索 `enable()`（电机使能上电）、`control_mit()` 或 `set_position()`（发控制动作）。",
        "⚠️ 安全警告：初次上电测试时，先把 Kp 设小（比如 5~10），手握急停开关，确保机械臂周围没人！",
      ],
    };
  }

  // 5. install.sh / start_motor.sh / *.sh (启动与脚本)
  if (lowerName.endsWith(".sh")) {
    return {
      fileRole: "⚡ 一键启动与环境配置批处理脚本 (类似双击运行图标)",
      plainExplanation: `【大白话】这是一个自动化脚本文件，相当于 Windows 里的快捷方式。同事写这个脚本是为了让你不需要在黑乎乎的终端里一条一条敲命令，只需运行它，它就会自动配置 CAN 卡波特率、编译代码、并直接启动电机。`,
      isMustReadForMechanical: true,
      whyMechanicalCares: `机械工程师在做产线装配或样机测试时，最经常用到的就是它。打开它可以一眼看清同事启动电机时用了哪个端口（如 can0）、多大波特率（1000000），以及运行了哪个生成文件。`,
      analogy: `就像汽车的一键启动按钮，按一下，油泵、点火、自检自动按顺序完成。`,
      actionItems: [
        "🚀 运行方法：在 Linux 终端输入 `chmod +x ${fileName} && ./${fileName}` 即可一键启动。",
      ],
    };
  }

  // 6. README.md / docs
  if (lowerName.endsWith(".md") || lowerName.endsWith(".txt") || lowerPath.includes("doc")) {
    return {
      fileRole: "📘 同事留下的工程使用说明书",
      plainExplanation: `【大白话】这是嵌入式同事写给人看的文档，里面通常写了接线引脚、依赖库安装方法、以及电机的测试指令。`,
      isMustReadForMechanical: true,
      whyMechanicalCares: `必看！它比任何代码都更直接地告诉你这个工程怎么用。`,
      analogy: `产品开箱说明书。`,
      actionItems: [
        "📖 优先通读一遍，按里面写的步骤在终端操作。",
      ],
    };
  }

  // 7. General fallback
  return {
    fileRole: "📄 嵌入式支持文件",
    plainExplanation: `【大白话】这是工程中的辅助支持文件，提供配置或编译支持。`,
    isMustReadForMechanical: false,
    whyMechanicalCares: `如果只是想控制电机或了解机械动作，可以先跳过，重点查看 .cpp、.h 和 .sh 脚本。`,
    analogy: `工具箱里的备用螺丝和垫片。`,
    actionItems: [
      "💡 点击左侧文件树中带有 .cpp 或 .h 的文件开始分析！",
    ],
  };
}
