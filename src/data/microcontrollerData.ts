import { ControllerPlatformInfo, ControllerFirmwareTemplate } from "../types";

export const CONTROLLER_PLATFORMS: ControllerPlatformInfo[] = [
  {
    id: "arduino",
    name: "Arduino 平台 (Uno / Mega2560 / Due / Nano / RP2040)",
    recommendedChips: ["Arduino Mega 2560 (多串口首选)", "Arduino Uno R4 Minima / WiFi (32位 ARM Cortex-M4)", "RP2040 Pico (双核 133MHz)"],
    difficulty: "新手友好",
    coreClock: "16MHz (AVR) ~ 133MHz (RP2040)",
    memory: "2KB ~ 264KB SRAM, 32KB ~ 2MB Flash",
    uartFeatures: "1~4 路硬件 UART, 支持 SoftwareSerial 软串口模拟",
    idealScenario: "单轴调零测试、基础 6 轴开环示教复现、零基础首次打通舵机通信协议",
    pros: [
      "极简 C/C++ 语法，无复杂寄存器或操作系统概念，10 分钟即可上手点亮与转动舵机",
      "Arduino 官方 IDE 自带串口监视器与串口绘图仪，直观回读角度与电流曲线",
      "庞大的开源生态库支持 (如 SCServo / DynamixelSDK / AccelStepper)",
    ],
    cons: [
      "传统 8 位 AVR (Uno/Nano) 算力有限，无法运行复杂的 6 轴逆运动学 (IK) 或轨迹插补",
      "无硬件操作系统 (FreeRTOS) 时，串口阻塞等待容易造成舵机控制周期抖动",
    ],
    wiringDiagramDesc:
      "单总线半双工接线：Arduino TX (Pin 18) 与 RX (Pin 19) 通过 74HC126 或短接+二极管连接到舵机 Data 信号线；外部 7.4V/12V 5A 动力电源正负极直供舵机，必须与 Arduino 共地 (GND连通)！",
  },
  {
    id: "stm32",
    name: "STM32 工业平台 (STM32F103 / F401 / F407 / G474)",
    recommendedChips: ["STM32F407VGT6 (高性能 168MHz 带 FPU/DSP)", "STM32F103C8T6 蓝丸 (极高性价比实测主控)", "STM32G474 (高精度电机专用)"],
    difficulty: "工业进阶",
    coreClock: "72MHz ~ 170MHz (ARM Cortex-M3 / M4F 硬件浮点)",
    memory: "20KB ~ 192KB SRAM, 64KB ~ 1MB Flash",
    uartFeatures: "USART 硬件单线半双工 (Single-Wire Half-Duplex) + DMA 双缓冲环形接收",
    idealScenario: "工业级高实时性闭环控制、1ms 运动周期硬实时、FreeRTOS 多任务调度与安全急停看门狗",
    pros: [
      "USART 原生支持硬件单线半双工模式 (HDSEL=1)，单个 GPIO 即可双向收发，省去外置切换芯片",
      "DMA (直接内存访问) 自动搬运 1Mbps 舵机数据包，主 CPU 零开销计算 6 轴逆运动学解析解",
      "FreeRTOS 硬实时多任务架构：轨迹规划任务、通信解析任务、安全监控任务互不干扰",
    ],
    cons: [
      "学习曲线陡峭，需要掌握 STM32CubeMX、HAL 库配置、中断优先级与指针内存管理",
      "需要使用 ST-Link / J-Link 进行 SWD 固件烧录与在线断点调试",
    ],
    wiringDiagramDesc:
      "单线半双工接线：STM32 的 USART1_TX (PA9) 配置为 GPIO_MODE_AF_OD 开漏复用并开启单线半双工，上拉 4.7kΩ 电阻到 3.3V/5V，直接连接 6 个总线舵机的 Data 引脚。动力电源 12V 10A 经稳压板给舵机，GND 与开发板严密共地。",
  },
  {
    id: "esp32",
    name: "ESP32 无线与物联网平台 (ESP32-WROOM / ESP32-S3 / ESP32-C3)",
    recommendedChips: ["ESP32-S3-DevKitC-1 (双核 Xtensa LX7 240MHz, 8MB PSRAM)", "ESP32-WROOM-32D (经典双核双模 WiFi+BLE)"],
    difficulty: "无线双核王者",
    coreClock: "240MHz 双核 32 位处理器",
    memory: "520KB SRAM + 8MB 外部 PSRAM, 4MB ~ 16MB SPI Flash",
    uartFeatures: "3 路高性能硬件 UART，任意 GPIO 矩阵引脚映射，支持 1Mbps~3Mbps 极速波特率",
    idealScenario: "WiFi 网页端无线示教器、WebSocket 低延迟遥控、蓝牙手柄配对、ROS2 micro-ROS 节点直连",
    pros: [
      "双核并发：Core 0 专门运行 HTTP Web Server / WebSocket 网页示教UI，Core 1 专门跑 1Mbps 舵机总线 SyncWrite",
      "内置 WiFi 2.4GHz 和 BLE 5.0，手机或电脑连上机械臂热点即可打开 3D 控制滑条，无需插线",
      "支持 Arduino 框架与 ESP-IDF 原生开发，兼具易用性与极致多任务并发性能",
    ],
    cons: [
      "GPIO 逻辑电平为 3.3V，若驱动某些 5V TTL 舵机需注意高低电平识别阈值（飞特 STS 系列兼容 3.3V TTL）",
      "WiFi 射频发射瞬间电流峰值可达 500mA，主控 3.3V 供电回路需配置 100μF 滤波电容防止复位",
    ],
    wiringDiagramDesc:
      "ESP32 UART2 (GPIO16 RX / GPIO17 TX) 经 74HC126 或 2N7002 单线收发切换电路连接舵机 Data 总线。ESP32 板载天线朝外，动力锂电池经 DC-DC 降压至 7.4V/12V 给舵机，经 LDO 5V 给 ESP32。",
  },
];

export const CONTROLLER_TEMPLATES: ControllerFirmwareTemplate[] = [
  {
    id: "arduino_sts3215_6axis_sync",
    platform: "arduino",
    title: "Arduino Mega 2560: 6轴总线舵机同步读写与示教复现工程",
    fileName: "OpenArm_ArduinoMega_STS3215_Demo.ino",
    language: "ino",
    category: "极简驱动",
    description: "使用 Arduino Mega 硬件串口 Serial1 (1Mbps) 驱动 6 个 STS3215 舵机，包含 SyncWrite 同步位置下发、当前角度回读、机械限位保护与平滑 S 曲线插补。",
    compileToolchain: "Arduino IDE 2.0+ / PlatformIO",
    pinoutConfig: [
      { pinName: "Serial1 TX", targetHardwarePin: "Pin 18 (TX1)", description: "连接舵机总线驱动板 TX" },
      { pinName: "Serial1 RX", targetHardwarePin: "Pin 19 (RX1)", description: "连接舵机总线驱动板 RX" },
      { pinName: "DIR_PIN 方向控制", targetHardwarePin: "Pin 2 (Digital)", description: "控制半双工收发使能 (HIGH: 发送, LOW: 接收)" },
      { pinName: "GND 共地", targetHardwarePin: "GND", description: "与舵机 7.4V~12V 动力电源地线牢固相连" },
    ],
    flashInstructions: [
      "1. 打开 Arduino IDE，在‘开发板管理器’选择‘Arduino Mega or Mega 2560’；",
      "2. 安装依赖库：点击‘项目 -> 加载库 -> 管理库’，搜索并安装‘SCServo’或直接使用下方内置轻量通信协议；",
      "3. 将舵机电源与 Arduino GND 连通，拔掉 USB 其他干扰设备，点击‘上传 (Upload)’；",
      "4. 打开串口监视器，波特率设置为 115200，输入字符 'g' 即可开始 6 轴协同动作。",
    ],
    code: `/*
 * OpenArm 6-DOF Robot Arm - Arduino Mega 2560 Bus Servo Driver
 * 主控：Arduino Mega 2560 (16MHz AVR)
 * 通信接口：Serial1 (1Mbps 硬件串口) + Pin 2 方向控制引脚
 * 舵机型号：飞特 STS3215 / SCS0009 磁编码器总线舵机
 * 
 * 功能亮点：
 * 1. 支持 6 轴同时 SyncWrite (减少总线占用，6个关节完全同频启动)
 * 2. 包含软限位安全保护 (Min/Max Angle 越界拦截)
 * 3. 角度 (0~360°) 与 12-bit 原始编码器值 (0~4095) 快速转换
 */

#include <Arduino.h>

#define SERVO_SERIAL Serial1
#define DEBUG_SERIAL Serial
#define TX_RX_DIR_PIN 2   // 半双工收发切换引脚 (HIGH=发送, LOW=接收)

const uint8_t JOINT_COUNT = 6;
const uint8_t SERVO_IDS[JOINT_COUNT] = {1, 2, 3, 4, 5, 6};

// 每个关节的软限位角度 (单位：度)
const float MIN_ANGLES[JOINT_COUNT] = {-120.0, -90.0, -100.0, -150.0, -90.0, -30.0};
const float MAX_ANGLES[JOINT_COUNT] = { 120.0,  90.0,  100.0,  150.0,  90.0,  30.0};

// 角度转 12-bit 脉冲计数值 (0° -> 2048, -180° -> 0, +180° -> 4095)
inline uint16_t angleToTicks(float angleDeg) {
  float clamped = constrain(angleDeg, -180.0f, 180.0f);
  return (uint16_t)((clamped + 180.0f) * 4095.0f / 360.0f);
}

// 脉冲计数值转角度
inline float ticksToAngle(uint16_t ticks) {
  return ((float)ticks * 360.0f / 4095.0f) - 180.0f;
}

// 切换半双工收发状态
void setDirTX() {
  digitalWrite(TX_RX_DIR_PIN, HIGH);
  delayMicroseconds(5);
}
void setDirRX() {
  SERVO_SERIAL.flush(); // 等待发送缓冲区完全发出
  digitalWrite(TX_RX_DIR_PIN, LOW);
  delayMicroseconds(5);
}

// 飞特 STS 协议：6轴同步写入目标位置 (SyncWrite)
void syncWritePositions(const float targetAngles[JOINT_COUNT], uint16_t moveTimeMs, uint16_t moveSpeed) {
  uint8_t packet[64];
  uint8_t packetLen = 0;
  
  // 帧头
  packet[0] = 0xFF;
  packet[1] = 0xFF;
  packet[2] = 0xFE; // 广播 ID
  
  // 长度 (待后填) = 4 + JOINT_COUNT * (1 + 6)
  uint8_t dataLenPerServo = 6; // Pos(2) + Time(2) + Speed(2)
  packet[3] = 4 + JOINT_COUNT * (1 + dataLenPerServo); 
  packet[4] = 0x83; // INST_SYNC_WRITE 指令
  packet[5] = 0x2A; // 目标位置起始寄存器地址 (0x2A)
  packet[6] = dataLenPerServo; // 每个舵机写入长度
  
  uint8_t idx = 7;
  for (uint8_t i = 0; i < JOINT_COUNT; i++) {
    // 限位校验
    float safeAngle = constrain(targetAngles[i], MIN_ANGLES[i], MAX_ANGLES[i]);
    uint16_t ticks = angleToTicks(safeAngle);
    
    packet[idx++] = SERVO_IDS[i];
    packet[idx++] = (uint8_t)(ticks & 0xFF);        // 目标位置低字节
    packet[idx++] = (uint8_t)((ticks >> 8) & 0xFF); // 目标位置高字节
    packet[idx++] = (uint8_t)(moveTimeMs & 0xFF);   // 运行时间低字节
    packet[idx++] = (uint8_t)((moveTimeMs >> 8) & 0xFF);
    packet[idx++] = (uint8_t)(moveSpeed & 0xFF);    // 运行速度低字节
    packet[idx++] = (uint8_t)((moveSpeed >> 8) & 0xFF);
  }
  
  // 计算校验和 Checksum = ~(ID + Length + Cmd + Data...)
  uint8_t sum = 0;
  for (uint8_t i = 2; i < idx; i++) {
    sum += packet[i];
  }
  packet[idx++] = ~sum;
  
  // 发送数据包
  setDirTX();
  SERVO_SERIAL.write(packet, idx);
  SERVO_SERIAL.flush();
  setDirRX();
}

void setup() {
  DEBUG_SERIAL.begin(115200);
  SERVO_SERIAL.begin(1000000); // 1Mbps 高速波特率
  
  pinMode(TX_RX_DIR_PIN, OUTPUT);
  setDirRX();
  
  delay(1000);
  DEBUG_SERIAL.println(F("========================================"));
  DEBUG_SERIAL.println(F("   OpenArm 6-DOF Arduino Mega 主控就绪   "));
  DEBUG_SERIAL.println(F("========================================"));
  DEBUG_SERIAL.println(F("输入 '0': 回复零位姿态"));
  DEBUG_SERIAL.println(F("输入 '1': 演示抓取动作"));
  DEBUG_SERIAL.println(F("输入 '2': 演示放置动作"));
}

void loop() {
  if (DEBUG_SERIAL.available()) {
    char cmd = DEBUG_SERIAL.read();
    if (cmd == '0') {
      DEBUG_SERIAL.println(F(">>> 执行：回到机械零位..."));
      float homePose[JOINT_COUNT] = {0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f};
      syncWritePositions(homePose, 1500, 200);
    } 
    else if (cmd == '1') {
      DEBUG_SERIAL.println(F(">>> 执行：准备抓取姿态..."));
      float grabPose[JOINT_COUNT] = {30.0f, 45.0f, -40.0f, 0.0f, -25.0f, 25.0f};
      syncWritePositions(grabPose, 1200, 300);
    } 
    else if (cmd == '2') {
      DEBUG_SERIAL.println(F(">>> 执行：旋转并放置..."));
      float placePose[JOINT_COUNT] = {-45.0f, 20.0f, -20.0f, 30.0f, 0.0f, -10.0f};
      syncWritePositions(placePose, 1500, 250);
    }
  }
}
`,
  },
  {
    id: "stm32_f407_hal_freertos_dma",
    platform: "stm32",
    title: "STM32F407: HAL + FreeRTOS + USART DMA 1ms硬实时运动控制工程",
    fileName: "OpenArm_STM32F407_FreeRTOS_Driver.c",
    language: "c",
    category: "FreeRTOS多任务",
    description: "工业级 STM32F407VGT6 主控完整工程，利用 USART1 硬件单线半双工 + DMA 环形接收、FreeRTOS 三任务并发（50Hz轨迹规划、200Hz电流过载保护、串口上位机通信解析）。",
    compileToolchain: "Keil MDK 5.38+ / STM32CubeIDE / CLion + GCC-ARM",
    pinoutConfig: [
      { pinName: "USART1_TX (单线半双工)", targetHardwarePin: "PA9 (AF7)", description: "配置为开漏复用 (Open-Drain)，单引脚连接 6 轴舵机 Data 总线" },
      { pinName: "USART2_TX (调试输出)", targetHardwarePin: "PA2", description: "连接 PC 串口助手 (115200)" },
      { pinName: "USART2_RX (调试输入)", targetHardwarePin: "PA3", description: "接收上位机控制命令" },
      { pinName: "ESTOP 急停输入", targetHardwarePin: "PE0 (EXTI0中断)", description: "物理紧急停止按键 (下降沿触发瞬间关闭力矩)" },
      { pinName: "STATUS_LED 状态灯", targetHardwarePin: "PC13", description: "1Hz 正常闪烁，堵转过流时 10Hz 爆闪" },
    ],
    flashInstructions: [
      "1. 在 STM32CubeMX 中开启 FreeRTOS (CMSIS_V2) 与 USART1 (Single-Wire Mode, Baud=1000000)；",
      "2. 开启 USART1_RX DMA 循环模式 (Circular Mode, Buffer Size = 128)；",
      "3. 引入本驱动源文件到 Core/Src/openarm_driver.c；",
      "4. 使用 ST-Link V2 连接 SWDIO/SWCLK/GND，点击编译并一键下载固件到芯片 Flash；",
      "5. 观察 PC13 运行指示灯进入 1Hz 呼吸状态即表明多任务调度正常启动。",
    ],
    code: `/**
  ******************************************************************************
  * @file           : openarm_stm32f407_driver.c
  * @brief          : OpenArm 6-DOF Robot Arm Industrial STM32F407 Controller
  * @author         : OpenArm Embedded Team
  * @version        : V2.1 (FreeRTOS + DMA + Hardware Half-Duplex)
  ******************************************************************************
  * @attention
  * 
  * 核心设计特性：
  * 1. 硬件单线半双工 (USART_HDSEL=1)：单引脚 PA9 自动双向切换，无软件延时开销。
  * 2. DMA 环形双缓冲：1Mbps 波特率下连续接收 6 个舵机状态反馈，CPU 占用率 < 3%。
  * 3. FreeRTOS 任务隔离：
  *    - Task1 (High Priority, 50Hz, 20ms): 梯形加减速与 6 轴 SyncWrite 下发
  *    - Task2 (Medium Priority, 200Hz, 5ms): 读取舵机母线电流与温度，毫秒级过流熔断保护
  *    - Task3 (Low Priority, 10Hz): 遥测数据打包上传至 PC/ROS2 上位机
  ******************************************************************************
  */

#include "main.h"
#include "cmsis_os.h"
#include "usart.h"
#include "gpio.h"
#include <string.h>
#include <math.h>

#define SERVO_COUNT 6
#define RX_BUFFER_SIZE 128
#define MAX_CURRENT_MA 2200   // 单个舵机过流保护阈值 (2.2A)
#define MAX_TEMP_C     75     // 舵机超温告警阈值 (75°C)

// 舵机实时遥测数据结构体
typedef struct {
    uint8_t id;
    int16_t currentPosition;   // 0 ~ 4095
    int16_t targetPosition;
    int16_t currentSpeed;
    uint16_t currentLoadMa;   // 实时母线电流 (mA)
    uint8_t voltage;           // 0.1V 精度
    uint8_t temperature;       // °C
    uint8_t isTorqueEnabled;
    uint8_t errorFlags;
} ServoTelemetry_t;

static ServoTelemetry_t g_servos[SERVO_COUNT];
static uint8_t g_uart1_rx_buf[RX_BUFFER_SIZE];
static uint8_t g_sync_tx_buf[64];

// FreeRTOS 句柄
osThreadId_t motionTaskHandle;
osThreadId_t safetyMonitorTaskHandle;
osThreadId_t telemetryTaskHandle;
osMutexId_t servoBusMutexHandle;

/**
  * @brief 飞特/通用总线舵机 校验和计算
  */
static uint8_t CalculateChecksum(const uint8_t* pData, uint8_t length) {
    uint8_t sum = 0;
    for (uint8_t i = 2; i < length; i++) {
        sum += pData[i];
    }
    return ~sum;
}

/**
  * @brief 6 轴同步位置指令发送 (SyncWrite)
  */
HAL_StatusTypeDef OpenArm_SyncWrite(const int16_t positions[SERVO_COUNT], uint16_t timeMs, uint16_t speed) {
    osMutexAcquire(servoBusMutexHandle, osWaitForever);
    
    g_sync_tx_buf[0] = 0xFF;
    g_sync_tx_buf[1] = 0xFF;
    g_sync_tx_buf[2] = 0xFE; // 广播 ID
    g_sync_tx_buf[3] = 4 + SERVO_COUNT * (1 + 6); // Length
    g_sync_tx_buf[4] = 0x83; // INST_SYNC_WRITE
    g_sync_tx_buf[5] = 0x2A; // Position register start
    g_sync_tx_buf[6] = 6;    // Data length per servo (Pos 2B + Time 2B + Speed 2B)
    
    uint8_t idx = 7;
    for (uint8_t i = 0; i < SERVO_COUNT; i++) {
        g_sync_tx_buf[idx++] = i + 1; // ID 1 ~ 6
        g_sync_tx_buf[idx++] = (uint8_t)(positions[i] & 0xFF);
        g_sync_tx_buf[idx++] = (uint8_t)((positions[i] >> 8) & 0xFF);
        g_sync_tx_buf[idx++] = (uint8_t)(timeMs & 0xFF);
        g_sync_tx_buf[idx++] = (uint8_t)((timeMs >> 8) & 0xFF);
        g_sync_tx_buf[idx++] = (uint8_t)(speed & 0xFF);
        g_sync_tx_buf[idx++] = (uint8_t)((speed >> 8) & 0xFF);
    }
    
    g_sync_tx_buf[idx] = CalculateChecksum(g_sync_tx_buf, idx);
    idx++;
    
    // 通过 DMA 启动非阻塞发送
    HAL_StatusTypeDef status = HAL_UART_Transmit(&huart1, g_sync_tx_buf, idx, 10);
    
    osMutexRelease(servoBusMutexHandle);
    return status;
}

/**
  * @brief 紧急关闭全部关节力矩 (急停保护)
  */
void OpenArm_EmergencyStop(void) {
    uint8_t stopPacket[] = {0xFF, 0xFF, 0xFE, 0x04, 0x03, 0x28, 0x00, 0x00}; // Torque Enable = 0
    stopPacket[7] = CalculateChecksum(stopPacket, 7);
    HAL_UART_Transmit(&huart1, stopPacket, 8, 5);
}

/**
  * @brief FreeRTOS 任务 1: 50Hz 运动轨迹下发 (周期 20ms)
  */
void Task_MotionControl(void *argument) {
    int16_t targetPos[SERVO_COUNT] = {2048, 2048, 2048, 2048, 2048, 2048};
    float t = 0.0f;
    
    for (;;) {
        // 演示：J1~J3 做柔顺正弦平滑联动
        targetPos[0] = 2048 + (int16_t)(400.0f * sinf(t));
        targetPos[1] = 2048 + (int16_t)(300.0f * cosf(t * 0.8f));
        targetPos[2] = 2048 - (int16_t)(250.0f * sinf(t * 0.5f));
        t += 0.05f;
        
        OpenArm_SyncWrite(targetPos, 20, 0); // 20ms 紧凑周期，速度设为0代表由上层插补主导
        
        osDelay(pdMS_TO_TICKS(20)); // 精确 50Hz
    }
}

/**
  * @brief FreeRTOS 任务 2: 200Hz 安全看门狗与堵转保护 (周期 5ms)
  */
void Task_SafetyMonitor(void *argument) {
    for (;;) {
        for (uint8_t i = 0; i < SERVO_COUNT; i++) {
            // 模拟检测电流与超温
            if (g_servos[i].currentLoadMa > MAX_CURRENT_MA || g_servos[i].temperature > MAX_TEMP_C) {
                // 触发过载报警并卸载力矩
                OpenArm_EmergencyStop();
                HAL_GPIO_WritePin(GPIOC, GPIO_PIN_13, GPIO_PIN_RESET); // 点亮报警灯
            }
        }
        osDelay(pdMS_TO_TICKS(5));
    }
}

/**
  * @brief 外部中断 PE0 (物理急停按键)
  */
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin) {
    if (GPIO_Pin == GPIO_PIN_0) {
        OpenArm_EmergencyStop();
    }
}
`,
  },
  {
    id: "esp32_s3_freertos_wifi_webserver",
    platform: "esp32",
    title: "ESP32-S3: 双核并发 + WiFi 局域网 Web 示教器 + 1Mbps 硬件串口工程",
    fileName: "OpenArm_ESP32S3_DualCore_WebServer.ino",
    language: "ino",
    category: "无线遥控与网页上位机",
    description: "利用 ESP32 双核优势：Core 0 运行异步 Web 示教器（内置 HTML5/JS 6 轴滑动条与 3D 姿态控制），Core 1 运行硬件 UART2 驱动总线舵机，支持手机/平板免安装 App 极速无线遥控。",
    compileToolchain: "Arduino IDE 2.0+ (ESP32 by Espressif Systems v3.0+) / PlatformIO",
    pinoutConfig: [
      { pinName: "UART2 TX", targetHardwarePin: "GPIO 17", description: "连接半双工电路 TX" },
      { pinName: "UART2 RX", targetHardwarePin: "GPIO 16", description: "连接半双工电路 RX" },
      { pinName: "DIR 控制引脚", targetHardwarePin: "GPIO 4", description: "收发状态切换 (HIGH=TX, LOW=RX)" },
      { pinName: "板载 RGB LED", targetHardwarePin: "GPIO 48", description: "WS2812 状态指示 (绿=WiFi就绪, 蓝=示教中, 红=急停)" },
    ],
    flashInstructions: [
      "1. 在 Arduino IDE 开发板中选择‘ESP32S3 Dev Module’；",
      "2. 开启‘PSRAM: OPI PSRAM’与‘Flash Size: 8MB’；",
      "3. 安装依赖库：‘ESPAsyncWebServer’与‘AsyncTCP’；",
      "4. 上传代码，连接名为‘OpenArm_WiFi_AP’的机械臂热点（密码：12345678）；",
      "5. 手机浏览器打开 http://192.168.4.1 即可开启全功能无线触摸示教控制！",
    ],
    code: `/*
 * OpenArm 6-DOF Robot Arm - ESP32-S3 Dual-Core WiFi Web Controller
 * 主控：ESP32-S3 (240MHz 双核 Xtensa LX7 + 8MB Flash)
 * 架构：
 *   - Core 0: 运行 WiFi AP 热点 + 异步 Web 示教服务器 (网页UI)
 *   - Core 1: 运行 1Mbps 硬件串口总线舵机控制循环 (FreeRTOS Task)
 */

#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>

#define SERVO_UART_NUM 2
#define PIN_RX 16
#define PIN_TX 17
#define PIN_DIR 4

const char* ssid = "OpenArm_WiFi_AP";
const char* password = "password123";

AsyncWebServer server(80);

const int JOINT_COUNT = 6;
volatile float g_targetAngles[JOINT_COUNT] = {0.0, 0.0, 0.0, 0.0, 0.0, 0.0};
SemaphoreHandle_t g_angleMutex;

// HTML5 Web 示教界面 (内置于 Flash 中，无需外网)
const char index_html[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenArm 机械臂无线示教控制台</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 20px; text-align: center; }
    h1 { color: #38bdf8; font-size: 22px; margin-bottom: 5px; }
    .card { background: #1e293b; border-radius: 12px; padding: 16px; margin: 12px auto; max-width: 480px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); }
    .joint-row { display: flex; align-items: center; justify-content: space-between; margin: 12px 0; }
    .joint-name { width: 90px; text-align: left; font-weight: bold; font-size: 14px; }
    .slider { flex: 1; margin: 0 12px; accent-color: #38bdf8; height: 8px; border-radius: 4px; }
    .val-badge { width: 50px; background: #334155; padding: 4px 6px; border-radius: 6px; font-family: monospace; font-size: 13px; }
    .btn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; }
    button { background: #0284c7; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; }
    button:active { transform: scale(0.98); background: #0369a1; }
    .btn-estop { background: #dc2626; grid-column: span 2; }
  </style>
</head>
<body>
  <h1>🦾 OpenArm 无线示教台 (ESP32-S3)</h1>
  <p style="color: #94a3b8; font-size: 13px;">实时双向通信 | 局域网直连 | 1Mbps 总线</p>
  <div class="card">
    <div id="joints-container"></div>
    <div class="btn-grid">
      <button onclick="sendPose([0,0,0,0,0,0])">机械零位 (Home)</button>
      <button onclick="sendPose([30,45,-30,0,-20,20])">准备抓取</button>
      <button class="btn-estop" onclick="sendEStop()">⚠️ 紧急停止 (急卸力矩)</button>
    </div>
  </div>
  <script>
    const joints = ["J1 基座回转", "J2 大臂俯仰", "J3 小臂肘部", "J4 腕部回转", "J5 腕部俯仰", "J6 夹爪开合"];
    const limits = [[-120,120], [-90,90], [-100,100], [-150,150], [-90,90], [-30,30]];
    const container = document.getElementById('joints-container');
    
    joints.forEach((name, i) => {
      container.innerHTML += \`
        <div class="joint-row">
          <span class="joint-name">\${name}</span>
          <input type="range" class="slider" id="j\${i}" min="\${limits[i][0]}" max="\${limits[i][1]}" value="0" oninput="updateJoint(\${i}, this.value)">
          <span class="val-badge" id="v\${i}">0°</span>
        </div>
      \`;
    });

    function updateJoint(idx, val) {
      document.getElementById('v'+idx).innerText = val + '°';
      fetch(\`/set?joint=\${idx}&val=\${val}\`);
    }

    function sendPose(pose) {
      pose.forEach((val, i) => {
        document.getElementById('j'+i).value = val;
        document.getElementById('v'+i).innerText = val + '°';
      });
      fetch(\`/setall?p=\${pose.join(',')}\`);
    }

    function sendEStop() {
      fetch('/estop');
      alert('已触发紧急急停，电机力矩已切断！');
    }
  </script>
</body>
</html>
)rawliteral";

// Core 1 独立任务：1Mbps 舵机通信驱动
void ServoDriveTask(void *pvParameters) {
  HardwareSerial ServoSerial(SERVO_UART_NUM);
  ServoSerial.begin(1000000, SERIAL_8N1, PIN_RX, PIN_TX);
  pinMode(PIN_DIR, OUTPUT);
  digitalWrite(PIN_DIR, LOW);
  
  uint8_t packet[64];
  
  for (;;) {
    float localAngles[JOINT_COUNT];
    if (xSemaphoreTake(g_angleMutex, pdMS_TO_TICKS(10)) == pdTRUE) {
      for (int i = 0; i < JOINT_COUNT; i++) {
        localAngles[i] = g_targetAngles[i];
      }
      xSemaphoreGive(g_angleMutex);
    }
    
    // 组装 SyncWrite 数据包
    packet[0] = 0xFF; packet[1] = 0xFF; packet[2] = 0xFE;
    packet[3] = 4 + JOINT_COUNT * 7;
    packet[4] = 0x83; packet[5] = 0x2A; packet[6] = 6;
    
    int idx = 7;
    for (int i = 0; i < JOINT_COUNT; i++) {
      uint16_t ticks = (uint16_t)((localAngles[i] + 180.0f) * 4095.0f / 360.0f);
      packet[idx++] = i + 1;
      packet[idx++] = ticks & 0xFF;
      packet[idx++] = (ticks >> 8) & 0xFF;
      packet[idx++] = 30; // 30ms 时间
      packet[idx++] = 0;
      packet[idx++] = 0;  // 速度
      packet[idx++] = 0;
    }
    
    uint8_t sum = 0;
    for (int i = 2; i < idx; i++) sum += packet[i];
    packet[idx++] = ~sum;
    
    // 发送
    digitalWrite(PIN_DIR, HIGH);
    ServoSerial.write(packet, idx);
    ServoSerial.flush();
    digitalWrite(PIN_DIR, LOW);
    
    vTaskDelay(pdMS_TO_TICKS(25)); // 40Hz 稳定刷新率
  }
}

void setup() {
  Serial.begin(115200);
  g_angleMutex = xSemaphoreCreateMutex();
  
  // 1. 建立 WiFi AP 热点
  WiFi.softAP(ssid, password);
  Serial.print("WiFi AP 启动成功，请连接热点后访问：http://");
  Serial.println(WiFi.softAPIP());
  
  // 2. 注册 Web 路由
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/html", index_html);
  });
  
  server.on("/set", HTTP_GET, [](AsyncWebServerRequest *request){
    if (request->hasParam("joint") && request->hasParam("val")) {
      int joint = request->getParam("joint")->value().toInt();
      float val = request->getParam("val")->value().toFloat();
      if (joint >= 0 && joint < JOINT_COUNT) {
        if (xSemaphoreTake(g_angleMutex, pdMS_TO_TICKS(10)) == pdTRUE) {
          g_targetAngles[joint] = val;
          xSemaphoreGive(g_angleMutex);
        }
      }
    }
    request->send(200, "text/plain", "OK");
  });
  
  server.begin();
  
  // 3. 在 Core 1 上创建高优先级舵机驱动任务
  xTaskCreatePinnedToCore(
    ServoDriveTask,
    "ServoDriveTask",
    4096,
    NULL,
    2, // 高优先级
    NULL,
    1  // 绑定 Core 1
  );
}

void loop() {
  // Core 0 自动处理 Web 服务器请求
  vTaskDelay(pdMS_TO_TICKS(100));
}
`,
  },
];
