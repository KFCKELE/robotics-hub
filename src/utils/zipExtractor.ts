import JSZip from "jszip";

export interface ExtractedFileItem {
  id: string;
  path: string; // Full relative path, e.g. "damiao_ws/damiao_can/src/damiao_motor.cpp"
  name: string; // "damiao_motor.cpp"
  extension: string; // "cpp"
  isFolder: false;
  size: number;
  sizeFormatted: string;
  content: string; // decoded text content (for code/text files)
  category: "code" | "header" | "script" | "config" | "document" | "build" | "other";
  language: string; // "cpp" | "c" | "python" | "bash" | "markdown" | "json" | "yaml" | "text"
  parentPath: string;
  lineCount?: number;
}

export interface ExtractedFolderNode {
  name: string;
  path: string;
  isFolder: true;
  children: (ExtractedFolderNode | ExtractedFileItem)[];
  fileCount: number;
}

export interface ExtractedArchiveResult {
  archiveName: string;
  fileCount: number;
  folderCount: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
  allFiles: ExtractedFileItem[];
  fileTree: (ExtractedFolderNode | ExtractedFileItem)[];
  detectedType: "damiao_can" | "openarm_robot" | "stm32_firmware" | "ros2_ws" | "general_embedded";
  detectedTitle: string;
  detectedDescription: string;
  keyEntryFiles: string[]; // e.g. ["install.sh", "README.md", "damiao_motor.cpp"]
  mechanicalTakeaways: {
    title: string;
    description: string;
    relevantFiles: string[];
  }[];
  compilationGuide: {
    toolchain: string;
    steps: { step: string; command?: string; explanation: string }[];
    cautions: string[];
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function getFileCategory(ext: string, name: string): { category: ExtractedFileItem["category"]; language: string } {
  const lowerExt = ext.toLowerCase();
  const lowerName = name.toLowerCase();

  if (["cpp", "cc", "cxx"].includes(lowerExt)) {
    return { category: "code", language: "cpp" };
  }
  if (lowerExt === "c") {
    return { category: "code", language: "c" };
  }
  if (["hpp", "h", "hxx"].includes(lowerExt)) {
    return { category: "header", language: "cpp" };
  }
  if (["py", "pyw"].includes(lowerExt)) {
    return { category: "code", language: "python" };
  }
  if (["sh", "bash", "zsh", "bat", "ps1", "cmd"].includes(lowerExt) || lowerName.endsWith(".sh")) {
    return { category: "script", language: "bash" };
  }
  if (["md", "txt", "rst", "pdf"].includes(lowerExt) || lowerName === "readme" || lowerName === "license") {
    return { category: "document", language: "markdown" };
  }
  if (["json", "yaml", "yml", "toml", "ini", "xml", "launch", "urdf", "xacro"].includes(lowerExt)) {
    return { category: "config", language: "yaml" };
  }
  if (lowerName === "cmakelists.txt" || lowerName === "makefile" || lowerExt === "cmake" || lowerExt === "mk") {
    return { category: "build", language: "makefile" };
  }
  return { category: "other", language: "text" };
}

/**
 * Decompresses a Zip file in the browser using JSZip
 */
export async function extractZipArchive(
  fileData: File | Blob | ArrayBuffer,
  fileName: string = "uploaded_archive.zip"
): Promise<ExtractedArchiveResult> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(fileData);

  const fileItems: ExtractedFileItem[] = [];
  let totalBytes = 0;
  let folderCount = 0;

  const entries = Object.keys(loadedZip.files);

  for (const relativePath of entries) {
    const zipEntry = loadedZip.files[relativePath];
    const isFolder = zipEntry.dir;

    if (isFolder) {
      folderCount++;
      continue;
    }

    const pathParts = relativePath.split("/").filter(Boolean);
    const itemName = pathParts[pathParts.length - 1] || relativePath;
    const ext = itemName.includes(".") ? itemName.split(".").pop() || "" : "";
    const { category, language } = getFileCategory(ext, itemName);

    // Read file content
    let content = "";
    const isTextLike = [
      "c", "cpp", "h", "hpp", "py", "sh", "md", "txt", "json", "yaml", "yml",
      "cmake", "mk", "in", "launch", "urdf", "xacro", "xml", "conf", "cfg", "gitignore", "clang-format"
    ].includes(ext.toLowerCase()) || itemName.toLowerCase() === "cmakelists.txt" || itemName.toLowerCase() === "makefile";

    try {
      if (isTextLike) {
        content = await zipEntry.async("string");
      } else {
        content = `// [二进制或非文本文件: ${itemName}]`;
      }
    } catch {
      content = `// 无法直接读取文本内容: ${itemName}`;
    }

    const estimatedSize = content.length;
    totalBytes += estimatedSize;

    const parentPath = pathParts.slice(0, -1).join("/");

    fileItems.push({
      id: `file_${Math.random().toString(36).substring(2, 9)}_${itemName}`,
      path: relativePath,
      name: itemName,
      extension: ext,
      isFolder: false,
      size: estimatedSize,
      sizeFormatted: formatBytes(estimatedSize),
      content,
      category,
      language,
      parentPath,
      lineCount: content.split("\n").length,
    });
  }

  // Sort files by path
  fileItems.sort((a, b) => a.path.localeCompare(b.path));

  // Build hierarchical folder tree
  const fileTree = buildFolderTree(fileItems);

  // Auto-detect project type and characteristics
  const analysis = autoDetectProjectDetails(fileName, fileItems);

  return {
    archiveName: fileName,
    fileCount: fileItems.length,
    folderCount: folderCount,
    totalSizeBytes: totalBytes,
    totalSizeFormatted: formatBytes(totalBytes),
    allFiles: fileItems,
    fileTree,
    detectedType: analysis.detectedType,
    detectedTitle: analysis.detectedTitle,
    detectedDescription: analysis.detectedDescription,
    keyEntryFiles: analysis.keyEntryFiles,
    mechanicalTakeaways: analysis.mechanicalTakeaways,
    compilationGuide: analysis.compilationGuide,
  };
}

/**
 * Builds nested folder nodes from flat list of files
 */
function buildFolderTree(files: ExtractedFileItem[]): (ExtractedFolderNode | ExtractedFileItem)[] {
  const rootNodes: (ExtractedFolderNode | ExtractedFileItem)[] = [];
  const folderMap = new Map<string, ExtractedFolderNode>();

  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    if (parts.length === 1) {
      rootNodes.push(file);
      continue;
    }

    // Traverse or create folders
    let currentPath = "";
    let parentFolder: ExtractedFolderNode | null = null;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!folderMap.has(currentPath)) {
        const newFolder: ExtractedFolderNode = {
          name: part,
          path: currentPath,
          isFolder: true,
          children: [],
          fileCount: 0,
        };
        folderMap.set(currentPath, newFolder);

        if (parentFolder) {
          parentFolder.children.push(newFolder);
        } else {
          rootNodes.push(newFolder);
        }
      }

      const folder = folderMap.get(currentPath)!;
      folder.fileCount++;
      parentFolder = folder;
    }

    if (parentFolder) {
      parentFolder.children.push(file);
    }
  }

  return rootNodes;
}

/**
 * Automatically inspects the files inside the archive to detect robotic/CAN/embedded characteristics
 */
function autoDetectProjectDetails(
  archiveName: string,
  files: ExtractedFileItem[]
): {
  detectedType: ExtractedArchiveResult["detectedType"];
  detectedTitle: string;
  detectedDescription: string;
  keyEntryFiles: string[];
  mechanicalTakeaways: ExtractedArchiveResult["mechanicalTakeaways"];
  compilationGuide: ExtractedArchiveResult["compilationGuide"];
} {
  const fileNames = files.map((f) => f.name.toLowerCase());
  const filePaths = files.map((f) => f.path.toLowerCase());

  const hasDamiao = fileNames.some((n) => n.includes("damiao")) || filePaths.some((p) => p.includes("damiao"));
  const hasOpenArm = fileNames.some((n) => n.includes("openarm")) || filePaths.some((p) => p.includes("openarm") || p.includes("bridge"));
  const hasInstallSh = fileNames.includes("install.sh") || fileNames.includes("start_motor.sh");
  const hasROS = fileNames.includes("cmakelists.txt") && (fileNames.includes("package.xml") || filePaths.some((p) => p.includes("src")));

  if (hasDamiao || archiveName.toLowerCase().includes("damiao")) {
    return {
      detectedType: "damiao_can",
      detectedTitle: "达妙 (Damiao) 一体化电机 CAN 通信与 C++ 控制例程工程",
      detectedDescription:
        "检测到标准的达妙伺服电机 CAN 总线驱动工作空间。包含底层 CAN 协议封包 (damiao_can)、上层 C++ 控制例程、电机初始化与启动脚本 (install.sh / start_motor.sh)。",
      keyEntryFiles: files
        .filter((f) => ["damiao_motor.cpp", "main.cpp", "start_motor.sh", "install.sh", "readme.md"].some((k) => f.name.toLowerCase().includes(k)))
        .map((f) => f.path),
      mechanicalTakeaways: [
        {
          title: "🔌 CAN 通信波特率与终端电阻",
          description: "达妙电机通常采用 1Mbps (标准CAN) 或 5Mbps (CAN-FD)。总线首尾必须并联 120Ω 终端电阻，否则电机将频繁丢帧啸叫。",
          relevantFiles: ["damiao_can", "start_motor.sh"],
        },
        {
          title: "⚡ MIT 阻抗控制模式 (Kp/Kd) 物理刚度",
          description: "代码中定义的 Kp 为位置弹簧刚度，Kd 为阻尼。机械刚性好时可提高 Kp，若为 3D 打印件或细长杆件，需降低 Kp 防止共振发热。",
          relevantFiles: ["damiao_motor.cpp", "C++例程/main.cpp"],
        },
        {
          title: "🛑 减速比换算与零位校准",
          description: "电机内部编码器测量的是电机转子角度。必须将减速比 (如 1:10) 乘入弧度换算，并在机械安装零位时记录 Zero Offset 偏置。",
          relevantFiles: ["damiao_motor.h", "damiao_motor.cpp"],
        },
      ],
      compilationGuide: {
        toolchain: "Linux Terminal / CMake / g++ (支持 SocketCAN 与 USB-to-CAN 适配器)",
        steps: [
          {
            step: "1. 解压并进入工程目录",
            command: "cd ~/damiao_ws",
            explanation: "在 Linux 或树莓派/工控机终端中进入解压后的工程工作空间根目录。",
          },
          {
            step: "2. 赋予脚本执行权限并一键安装依赖",
            command: "chmod +x install.sh start_motor.sh\n./install.sh",
            explanation: "install.sh 会自动配置 libsocketcan 依赖与 CMake 编译环境。",
          },
          {
            step: "3. 激活并配置 CAN 总线接口 (例如 can0)",
            command: "sudo ip link set can0 up type can bitrate 1000000",
            explanation: "将 USB-to-CAN 模块的波特率设置为 1000000 (1Mbps)，确保总线亮绿灯。",
          },
          {
            step: "4. 编译 C++ 例程并启动电机",
            command: "./start_motor.sh\n# 或手动编译:\nmkdir -p build && cd build && cmake .. && make -j4",
            explanation: "编译完成后即可运行可执行文件，发送使能帧使电机进入闭环运行。",
          },
        ],
        cautions: [
          "初次上电请将电源限流设置为 1.5A ~ 2.0A，防止连线错误导致电机飞车或过流烧管。",
          "机械臂关节在初次使能前，务必保证周围 1 米无障碍物，手握急停开关。",
        ],
      },
    };
  }

  if (hasOpenArm || archiveName.toLowerCase().includes("openarm")) {
    return {
      detectedType: "openarm_robot",
      detectedTitle: "OpenArm 机械臂 VR 遥操作与嵌入式通信主工程",
      detectedDescription:
        "检测到完整的开源 OpenArm 机械臂系统工程。包含多自由度关节控制、VR 空间位姿映射桥接 (bridge)、Web 交互界面 (web-ui) 及自动化构建配置。",
      keyEntryFiles: files
        .filter((f) => ["bridge", "src", "scripts", "readme.md", "package.json", "cmakelists.txt"].some((k) => f.path.toLowerCase().includes(k)))
        .map((f) => f.path),
      mechanicalTakeaways: [
        {
          title: "🦾 关节正逆运动学与笛卡尔坐标系",
          description: "机械工程师关心的连杆长度 (D-H 参数)、末端夹爪有效载荷与法兰盘坐标系均在 bridge/src 核心模块中被实时解算。",
          relevantFiles: ["src/", "bridge/"],
        },
        {
          title: "🌐 多电机通信总线拓扑",
          description: "OpenArm 通常由基座大扭矩电机到腕部小伺服串联组成，采用高速多通道 CAN 或串口总线同步收发帧。",
          relevantFiles: ["bridge/src/", "scripts/"],
        },
      ],
      compilationGuide: {
        toolchain: "Linux ROS2 / Docker / CMake / Node.js (Web-UI)",
        steps: [
          {
            step: "1. 快速通过 Docker 容器或本地编译构建",
            command: "cd ~/openarm-vr-main\n./scripts/build_all.sh",
            explanation: "工程内置了 Docker 与 Scripts 构建脚本，无需繁琐配置环境变量。",
          },
          {
            step: "2. 启动机械臂通信桥接与电机节点",
            command: "./scripts/start_bridge.sh",
            explanation: "建立与机械臂底层各关节伺服的实时通讯循环。",
          },
        ],
        cautions: [
          "VR 遥操作模式下，注意设置工作空间软包络 (Work Envelope)，防止操作者大幅挥手使机械臂猛烈撞击桌面。",
        ],
      },
    };
  }

  return {
    detectedType: "general_embedded",
    detectedTitle: "嵌入式与机电综合工程包 (Embedded Project Archive)",
    detectedDescription: `成功解压工程包「${archiveName}」，提取出 ${files.length} 个文件。包含 C/C++ 源码、驱动头文件、构建配置及启动脚本。`,
    keyEntryFiles: files
      .filter((f) => f.category === "code" || f.category === "script" || f.category === "build")
      .slice(0, 5)
      .map((f) => f.path),
    mechanicalTakeaways: [
      {
        title: "⚙️ 源码参数与机构协同",
        description: "在左侧文件树中点击任意 .c / .cpp / .h 文件，右侧可自动进行白话物理透视与参数对照提取。",
        relevantFiles: files.slice(0, 3).map((f) => f.name),
      },
    ],
    compilationGuide: {
      toolchain: "跨平台 C/C++ / Keil / CMake / GCC",
      steps: [
        {
          step: "1. 查看工程构建入口",
          command: "ls -la",
          explanation: "根据工程中的 CMakeLists.txt、Makefile 或 .sh 脚本选择对应的编译工具链。",
        },
      ],
      cautions: ["在嵌入式开发板上烧录运行前，请先核对供电电压与引脚电气定义。"],
    },
  };
}

/**
 * Generates sample preset project archives for instant demonstration
 */
export async function createPresetProjectArchive(
  type: "damiao_ws" | "openarm-vr-main"
): Promise<ExtractedArchiveResult> {
  const zip = new JSZip();

  if (type === "damiao_ws") {
    // Replicate damiao_ws directory structure from screenshot 1
    zip.file(
      "damiao_ws/README.md",
      `# 达妙科技 (Damiao) 电机 CAN 通信与 C++ 控制例程工作空间\n\n` +
      `本项目专为达妙一体化伺服电机（DM-J8009 / DM-J4310 / DM-J3510）设计。\n\n` +
      `## 目录结构说明\n` +
      `- **damiao_can/**: 底层 CAN 总线通信协议封包与 SocketCAN 接口驱动\n` +
      `- **C++例程/**: 包含 MIT 力矩混控、速度环、位置环完整应用例程\n` +
      `- **install.sh**: 依赖自动安装与编译脚本\n` +
      `- **start_motor.sh**: 快速配置 CAN 接口并启动电机使能控制\n\n` +
      `## 机械工程师必读注意事项\n` +
      `1. 减速比：本驱动默认支持外置 1:10 谐波或行星减速器。\n` +
      `2. 终端电阻：CAN 总线两端必须并接 120 欧姆电阻。\n` +
      `3. 安全限流：首次测试请将直流电源电压设定在 24V~48V，限流 1.5A。`
    );

    zip.file(
      "damiao_ws/install.sh",
      `#!/bin/bash\n# 达妙电机 CAN 驱动一键依赖安装与编译脚本\necho "=== [Damiao WS] 正在安装 SocketCAN 与 CMake 依赖 ==="\nsudo apt-get update\nsudo apt-get install -y build-essential cmake can-utils libsocketcan-dev\n\necho "=== [Damiao WS] 开始编译 C++ 例程 ==="\nmkdir -p build && cd build\ncmake ..\nmake -j4\n\necho "=== [Damiao WS] 编译成功！请使用 ./start_motor.sh 启动电机 ==="`
    );

    zip.file(
      "damiao_ws/start_motor.sh",
      `#!/bin/bash\n# 达妙电机 CAN 接口配置与启动脚本\necho "=== [Damiao] 配置 can0 波特率 1000000 (1Mbps) ==="\nsudo ip link set can0 down 2>/dev/null || true\nsudo ip link set can0 type can bitrate 1000000\nsudo ip link set can0 up\n\necho "=== [Damiao] 启动电机控制主程序 (MIT力位混控模式) ==="\n./build/damiao_motor_example`
    );

    zip.file(
      "damiao_ws/CMakeLists.txt",
      `cmake_minimum_required(VERSION 3.10)\nproject(damiao_motor_control)\n\nset(CMAKE_CXX_STANDARD 14)\n\ninclude_directories(damiao_can/include)\n\nadd_executable(damiao_motor_example\n    C++例程/main.cpp\n    damiao_can/src/damiao_motor.cpp\n)\n\ntarget_link_libraries(damiao_motor_example pthread)`
    );

    zip.file(
      "damiao_ws/damiao_can/include/damiao_motor.h",
      `/**\n * @file damiao_motor.h\n * @brief 达妙电机通信协议结构体定义\n */\n#pragma once\n#include <stdint.h>\n\n#define DM_CAN_ID_DEFAULT     0x01\n#define REDUCTION_RATIO_J1     10.0f  // 1:10 机械减速比\n#define MAX_TORQUE_LIMIT_NM    18.0f  // 最大输出力矩 18 N.m\n\ntypedef struct {\n    float p_des;   // 目标位置 (rad)\n    float v_des;   // 目标速度 (rad/s)\n    float kp;      // 刚度刚度系数 (0 ~ 500)\n    float kd;      // 阻尼系数 (0 ~ 5)\n    float t_ff;    // 前馈力矩 (N.m)\n} DamiaoMitPacket_t;\n\nclass DamiaoMotor {\npublic:\n    DamiaoMotor(uint8_t can_id = 0x01, float reduction = 10.0f);\n    bool initSocketCan(const char* ifname = "can0");\n    void enableMotor();\n    void disableMotor();\n    void setZeroPosition();\n    void sendMitCommand(float angle_deg, float kp, float kd);\n    void readFeedback(float& curr_angle_deg, float& curr_velocity, float& curr_torque);\nprivate:\n    uint8_t motor_id;\n    float reduction_ratio;\n    int socket_can_fd;\n};`
    );

    zip.file(
      "damiao_ws/damiao_can/src/damiao_motor.cpp",
      `/**\n * @file damiao_motor.cpp\n * @brief 达妙电机 SocketCAN 发送与 MIT 阻抗控制实现\n */\n#include "damiao_motor.h"\n#include <iostream>\n#include <cmath>\n\nDamiaoMotor::DamiaoMotor(uint8_t can_id, float reduction) \n    : motor_id(can_id), reduction_ratio(reduction), socket_can_fd(-1) {}\n\nbool DamiaoMotor::initSocketCan(const char* ifname) {\n    std::cout << "[Damiao] 初始化 SocketCAN 接口: " << ifname << std::endl;\n    // 绑定 Linux 网络层 SocketCAN\n    return true;\n}\n\nvoid DamiaoMotor::enableMotor() {\n    std::cout << "[Damiao Motor " << (int)motor_id << "] 发送使能帧: 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFC" << std::endl;\n}\n\nvoid DamiaoMotor::sendMitCommand(float angle_deg, float kp, float kd) {\n    // 1. 角度软限位保护 (-135° ~ +135°)\n    if (angle_deg < -135.0f) angle_deg = -135.0f;\n    if (angle_deg > 135.0f) angle_deg = 135.0f;\n\n    // 2. 机械角度换算为电机转子弧度 (乘 1:10 减速比)\n    float motor_rad = (angle_deg * 3.14159265f / 180.0f) * reduction_ratio;\n\n    std::cout << "[Damiao Motor " << (int)motor_id << "] 发送 MIT 控帧 -> 目标转角: " \n              << angle_deg << "° (转子弧度: " << motor_rad << " rad), 刚度 Kp: " << kp << ", 阻尼 Kd: " << kd << std::endl;\n}`
    );

    zip.file(
      "damiao_ws/C++例程/main.cpp",
      `/**\n * @file main.cpp\n * @brief 机械臂基座达妙电机运动控制例程\n */\n#include "damiao_motor.h"\n#include <iostream>\n#include <thread>\n#include <chrono>\n\nint main() {\n    std::cout << "=== OpenArm 达妙电机控制例程启动 ===" << std::endl;\n    DamiaoMotor motor_j1(0x01, 10.0f); // ID=1, 减速比 1:10\n\n    if (!motor_j1.initSocketCan("can0")) {\n        std::cerr << "无法打开 can0 接口，请确认已运行 ./start_motor.sh" << std::endl;\n        return -1;\n    }\n\n    motor_j1.enableMotor();\n    std::this_thread::sleep_for(std::chrono::milliseconds(500));\n\n    // 往复摆动测试：从 0° 转动到 45°，再回到 0°\n    std::cout << "[Step 1] 正向转动至 +45° (刚度 Kp=35.0, 阻尼 Kd=2.8)..." << std::endl;\n    motor_j1.sendMitCommand(45.0f, 35.0f, 2.8f);\n    std::this_thread::sleep_for(std::chrono::seconds(2));\n\n    std::cout << "[Step 2] 平稳回零位 0°..." << std::endl;\n    motor_j1.sendMitCommand(0.0f, 30.0f, 3.0f);\n    std::this_thread::sleep_for(std::chrono::seconds(2));\n\n    std::cout << "测试完成！" << std::endl;\n    return 0;\n}`
    );
  } else {
    // Replicate openarm-vr-main structure from screenshot 2
    zip.file(
      "openarm-vr-main/README.md",
      `# OpenArm VR 机械臂空间遥操作与嵌入式通信套件\n\n` +
      `## 架构说明\n` +
      `- **bridge/**: 空间位姿映射、逆运动学 (IK) 与 CAN 总线桥接\n` +
      `- **src/**: 核心 C++ 关节运动控制器\n` +
      `- **scripts/**: 构建、标定与启动脚本\n` +
      `- **web-ui/**: 机械臂 3D 实时数字孪生监控界面\n` +
      `- **.docker/**: 跨平台部署镜像定义`
    );

    zip.file(
      "openarm-vr-main/scripts/build_all.sh",
      `#!/bin/bash\necho "=== 构建 OpenArm 机械臂完整工作空间 ==="\nmkdir -p build && cd build\ncmake ..\nmake -j4`
    );

    zip.file(
      "openarm-vr-main/bridge/arm_bridge.cpp",
      `// OpenArm VR Bridge Controller\n#include <iostream>\nint main() { std::cout << "OpenArm Bridge running..." << std::endl; return 0; }`
    );

    zip.file(
      "openarm-vr-main/src/joint_controller.cpp",
      `// 6-DOF OpenArm Joint Position & Impedance Controller\n#include <iostream>\n// 机械参数：J1~J6 减速比与连杆长度\nconst float link_lengths[6] = {0.15f, 0.28f, 0.25f, 0.12f, 0.08f, 0.05f};`
    );
  }

  const zipContent = await zip.generateAsync({ type: "arraybuffer" });
  return extractZipArchive(zipContent, `${type}.zip`);
}
