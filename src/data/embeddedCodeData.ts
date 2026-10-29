import { EmbeddedCodeTemplate } from "../types";

export const EMBEDDED_CODE_TEMPLATES: EmbeddedCodeTemplate[] = [
  {
    id: "servo_protocol_c",
    fileName: "servo_protocol_sts.c",
    title: "总线舵机通信协议驱动与数据包封装 (Protocol Driver)",
    category: "协议驱动",
    language: "c",
    description: "嵌入式同事写总线舵机（如飞特STS3215/SCS0009）最核心的代码。包含指令帧打包、校验和计算、写目标位置及读当前位置。",
    code: `/**
 * @file servo_protocol_sts.c
 * @brief OpenArm 6-Axis Bus Servo Half-Duplex UART Protocol Driver
 */

#include "servo_protocol_sts.h"
#include <string.h>

#define STS_HEADER_BYTE_1       0xFF
#define STS_HEADER_BYTE_2       0xFF
#define STS_BROADCAST_ID        0xFE // 广播 ID

// 舵机内存表关键寄存器地址
#define REG_ID                  0x05 // 舵机 ID
#define REG_BAUD_RATE           0x06 // 波特率
#define REG_TORQUE_ENABLE       0x28 // 力矩开关 (1: 使能, 0: 释放)
#define REG_TARGET_POSITION     0x2A // 目标位置 (2 字节: 0 ~ 4095)
#define REG_TARGET_SPEED        0x2E // 目标运行速度
#define REG_TARGET_ACCEL        0x29 // 加速度
#define REG_CURRENT_POSITION    0x38 // 当前实际物理位置 (只读 2 字节)
#define REG_CURRENT_CURRENT     0x3E // 当前工作电流 (只读 2 字节)
#define REG_CURRENT_TEMP        0x3F // 当前温度 (°C)

// 指令码定义
#define INST_PING               0x01
#define INST_READ               0x02
#define INST_WRITE              0x03
#define INST_REG_WRITE          0x04
#define INST_ACTION             0x05
#define INST_SYNC_WRITE         0x83 // 多轴同步广播写指令

/**
 * @brief 计算飞特协议校验和 (Checksum)
 * @note 公式: ~(ID + Length + Instruction + Param1 + ... + ParamN) & 0xFF
 */
uint8_t STS_CalculateChecksum(const uint8_t *buffer, uint8_t length) {
    uint16_t sum = 0;
    // 关键点：前两个 0xFF 帧头不参与 Checksum 计算！
    for (uint8_t i = 2; i < length - 1; i++) {
        sum += buffer[i];
    }
    return (uint8_t)(~sum);
}

/**
 * @brief 发送单轴目标角度指令 (0~4095 Ticks)
 */
bool STS_WritePosition(uint8_t servoId, uint16_t positionTicks, uint16_t speed, uint8_t accel) {
    uint8_t txBuf[11];
    txBuf[0] = STS_HEADER_BYTE_1;
    txBuf[1] = STS_HEADER_BYTE_2;
    txBuf[2] = servoId;
    txBuf[3] = 7; // Length = 参数个数(5) + 2
    txBuf[4] = INST_WRITE;
    txBuf[5] = REG_TARGET_ACCEL;
    txBuf[6] = accel;
    txBuf[7] = (uint8_t)(positionTicks & 0xFF);        // 低字节
    txBuf[8] = (uint8_t)((positionTicks >> 8) & 0xFF); // 高字节
    txBuf[9] = (uint8_t)(speed & 0xFF);
    txBuf[10] = STS_CalculateChecksum(txBuf, sizeof(txBuf));

    // 硬件发送
    UART_HalfDuplex_Send(txBuf, sizeof(txBuf));
    return true;
}

/**
 * @brief 6 轴机械臂同步广播写 (SyncWrite)
 * @note 仅发一条总线数据包，6 个关节同时起步，消除各轴动作时差
 */
void STS_SyncWrite6Axis(const uint16_t pos[6], const uint16_t spd[6]) {
    uint8_t syncBuf[4 + 2 + 6 * (1 + 4) + 1]; // 40 bytes
    uint8_t idx = 0;

    syncBuf[idx++] = 0xFF;
    syncBuf[idx++] = 0xFF;
    syncBuf[idx++] = STS_BROADCAST_ID; // 0xFE
    syncBuf[idx++] = (uint8_t)(sizeof(syncBuf) - 4); // Length
    syncBuf[idx++] = INST_SYNC_WRITE;  // 0x83
    syncBuf[idx++] = REG_TARGET_POSITION; // 起始寄存器
    syncBuf[idx++] = 4; // 每个舵机数据长度 (2字节位置 + 2字节速度)

    for (uint8_t id = 1; id <= 6; id++) {
        syncBuf[idx++] = id; // 舵机 ID
        syncBuf[idx++] = (uint8_t)(pos[id - 1] & 0xFF);
        syncBuf[idx++] = (uint8_t)((pos[id - 1] >> 8) & 0xFF);
        syncBuf[idx++] = (uint8_t)(spd[id - 1] & 0xFF);
        syncBuf[idx++] = (uint8_t)((spd[id - 1] >> 8) & 0xFF);
    }

    syncBuf[idx] = STS_CalculateChecksum(syncBuf, sizeof(syncBuf));
    UART_HalfDuplex_Send(syncBuf, sizeof(syncBuf));
}`,
    hotspots: [
      {
        id: "h1",
        title: "Checksum 校验和计算范围循环",
        lines: [36, 37, 38, 39, 40, 41, 42],
        whyColleagueModifies: "当给数据包增加参数（如加加速度、工作模式）或修改指令时，如果循环长度弄错 1 个字节，校验和立刻算错，舵机将完全忽略指令！同事常在此处排查‘为什么发了指令电机没反应’。",
        symptomsWhenWrong: "舵机指示灯亮但完全不动，示波器能看到波形但舵机不应答，串口调试助手返回 Checksum Error。",
        tuningGuide: "严格记住：从 index 2 (即 ID 字节) 开始循环累加，一直到 index length - 2 (最后一个数据参数)，最后取反 (~sum)。",
        beginnerNote: "前两个 0xFF 只是‘唤醒/同步包头’，千万不能加进求和里！",
      },
      {
        id: "h2",
        title: "SyncWrite 同步广播包结构",
        lines: [69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80],
        whyColleagueModifies: "如果 OpenArm 新增第 7 轴（如末端电动旋转抓手），同事必须修改此处的数组大小 `syncBuf` 及循环数量，否则末端轴收不到指令。",
        symptomsWhenWrong: "单轴运动正常，但一旦进入 6 轴联动，部分关节突然静止不动或者总线卡死。",
        tuningGuide: "广播 ID 必须是 0xFE (254)，且发送后绝对不要去等待回包（广播包禁止舵机回复以防总线冲突）。",
        beginnerNote: "机械臂各轴必须同时起步，单发 Write 会导致大臂先动、小臂后动的脱节现象，SyncWrite 是机器人多轴标配！",
      },
    ],
  },
  {
    id: "pid_controller_c",
    fileName: "pid_motion_tuning.c",
    title: "位置环 PID 刚度整定与抗抖前馈算法 (PID & Damping)",
    category: "PID算法",
    language: "c",
    description: "控制机械臂关节刚度、响应速度、消除下垂稳态误差与抑制高频振荡的核心算法。嵌入式同事每次换夹爪或工件都会微调这里！",
    code: `/**
 * @file pid_motion_tuning.c
 * @brief OpenArm Joint Position Loop PID & Anti-Resonance Damping
 */

#include "pid_motion_tuning.h"
#include <math.h>

// 各关节 PID 增益参数表 (同事常调区域)
typedef struct {
    float kp;             // 比例增益 (刚度 / 响应灵敏度)
    float ki;             // 积分增益 (消除微小稳态静差)
    float kd;             // 微分增益 (阻尼 / 抑制惯量振荡)
    float deadband_deg;   // 死区角度 (消除装配齿隙与测量噪声)
    float max_output;     // 最大输出限幅 (防过流)
    float integral_limit; // 积分抗饱和限幅
    float gravity_ff_gain;// 重力前馈系数 (mg * L * cos(theta))
} JointPIDConfig_t;

// 6 轴默认参数配置 (J1:水平回转 J2/J3:垂直重力臂 J4~J6:腕部轻载)
static JointPIDConfig_t g_joint_pids[6] = {
    // J1: 基座旋转 (纯惯量负载，无重力下垂)
    { .kp = 18.5f, .ki = 0.2f, .kd = 1.8f, .deadband_deg = 0.15f, .max_output = 100.0f, .integral_limit = 15.0f, .gravity_ff_gain = 0.0f },
    // J2: 大臂俯仰 (垂直重力负载巨大，需要大 Kp 与重力前馈)
    { .kp = 32.0f, .ki = 0.8f, .kd = 3.5f, .deadband_deg = 0.20f, .max_output = 100.0f, .integral_limit = 25.0f, .gravity_ff_gain = 18.5f },
    // J3: 小臂肘关节 (中等重力负载)
    { .kp = 26.0f, .ki = 0.5f, .kd = 2.8f, .deadband_deg = 0.18f, .max_output = 100.0f, .integral_limit = 20.0f, .gravity_ff_gain = 12.0f },
    // J4: 腕部回转
    { .kp = 14.0f, .ki = 0.1f, .kd = 1.2f, .deadband_deg = 0.10f, .max_output = 80.0f,  .integral_limit = 10.0f, .gravity_ff_gain = 0.0f },
    // J5: 腕部俯仰
    { .kp = 16.0f, .ki = 0.2f, .kd = 1.4f, .deadband_deg = 0.12f, .max_output = 80.0f,  .integral_limit = 10.0f, .gravity_ff_gain = 4.0f },
    // J6: 末端旋转 / 夹爪
    { .kp = 12.0f, .ki = 0.1f, .kd = 1.0f, .deadband_deg = 0.10f, .max_output = 70.0f,  .integral_limit = 8.0f,  .gravity_ff_gain = 0.0f },
};

/**
 * @brief 计算单轴位置环控制量 (输出 0~100% 占空比/力矩)
 */
float PID_ComputeJoint(uint8_t jointIndex, float targetDeg, float currentDeg, float dt) {
    if (jointIndex >= 6 || dt <= 0.0001f) return 0.0f;
    JointPIDConfig_t *cfg = &g_joint_pids[jointIndex];

    float error = targetDeg - currentDeg;

    // 1. 死区滤波 (在死区内不输出，避免齿隙高频微抖发热)
    if (fabsf(error) < cfg->deadband_deg) {
        error = 0.0f;
    }

    // 2. 比例项 (P)
    float p_out = cfg->kp * error;

    // 3. 积分项 (I) 带抗饱和限幅 (Anti-Windup)
    static float s_integrals[6] = {0};
    s_integrals[jointIndex] += error * dt;
    if (s_integrals[jointIndex] > cfg->integral_limit) s_integrals[jointIndex] = cfg->integral_limit;
    if (s_integrals[jointIndex] < -cfg->integral_limit) s_integrals[jointIndex] = -cfg->integral_limit;
    float i_out = cfg->ki * s_integrals[jointIndex];

    // 4. 微分项 (D) 测量值微分 (抑制设定点突变引起的微分冲击)
    static float s_prev_deg[6] = {0};
    float deg_velocity = (currentDeg - s_prev_deg[jointIndex]) / dt;
    s_prev_deg[jointIndex] = currentDeg;
    float d_out = -cfg->kd * deg_velocity;

    // 5. 重力前馈补偿 (Feed-Forward)
    // 假设关节角度水平为 0 度，重力力矩正比于 cos(angle)
    float ff_gravity = cfg->gravity_ff_gain * cosf(currentDeg * 3.14159265f / 180.0f);

    // 总输出叠加与限幅
    float total = p_out + i_out + d_out + ff_gravity;
    if (total > cfg->max_output) total = cfg->max_output;
    if (total < -cfg->max_output) total = -cfg->max_output;

    return total;
}`,
    hotspots: [
      {
        id: "pid_h1",
        title: "g_joint_pids 各轴 Kp / Kd / 重力前馈数组",
        lines: [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34],
        whyColleagueModifies: "当末端换用更重的气动夹爪或抓取 300g 物料时，大臂（J2）会明显下垂，同事必须把 J2 的 Kp 从 32 调大到 42，并增加 gravity_ff_gain；若产生 100Hz 刺耳啸叫，则需要微调 Kd。",
        symptomsWhenWrong: "Kp 太小：机械臂发软下垂，无法平举；Kp 太大：剧烈抖动、啸叫、电机发烫甚至拉断打印件。",
        tuningGuide: "调参黄金法则：先给小 Kp，逐渐增大直到机械臂刚劲且有轻微弹性；随后加大 Kd 吸收回弹晃动；最后加上重力前馈消除平举静差。",
        beginnerNote: "J1 水平旋转不受重力影响所以 gravity_ff_gain = 0；而 J2/J3 承受自重因此必须设置前馈！",
      },
      {
        id: "pid_h2",
        title: "死区滤波 deadband_deg 处理",
        lines: [46, 47, 48, 49],
        whyColleagueModifies: "机械 3D 打印件与齿轮本身有 0.1°~0.2° 的机械背隙。如果不设死区，编码器读数在齿隙间跳动，会导致电机一直‘滋滋’发声并高频来回抽动。",
        symptomsWhenWrong: "静止停机时舵机内部发烫，有高频滋滋电流声，减速齿轮快速磨损。",
        tuningGuide: "根据机械加工精度设定：金属 CNC 关节设 0.08°，3D 打印塑料关节设 0.15°~0.25°。",
        beginnerNote: "死区就是‘在这个微小误差内当作已经到位，不让电机拼命较劲’。",
      },
    ],
  },
  {
    id: "zero_calib_h",
    fileName: "zero_calibration_eeprom.h",
    title: "机械绝对零点与 EEPROM 寄存器固化头文件 (Zero Calib)",
    category: "零点校准",
    language: "h",
    description: "每次装配、换舵机或拆装连杆后，嵌入式同事必须更新的零位脉冲偏置头文件。决定机械臂是否能准确摆出垂直与归零姿态。",
    code: `/**
 * @file zero_calibration_eeprom.h
 * @brief OpenArm 6-DOF Magnetic Encoder Zero-Point Calibration Configuration
 */

#ifndef ZERO_CALIBRATION_EEPROM_H
#define ZERO_CALIBRATION_EEPROM_H

#include <stdint.h>
#include <stdbool.h>

#define ENCODER_RESOLUTION_TICKS   4096.0f // 12-Bit 磁编码器每圈脉冲数
#define TICKS_PER_DEGREE           (ENCODER_RESOLUTION_TICKS / 360.0f) // 11.3777 Ticks/°

// 单轴校准参数结构体
typedef struct {
    uint8_t servo_id;           // 舵机硬件 ID (1 ~ 6)
    const char *joint_name;     // 关节中文名称
    uint16_t zero_offset_ticks; // 机械零位对应的绝对原始脉冲数 (0 ~ 4095)
    bool invert_direction;      // 旋转极性反转 (true: 逆时针为正, false: 顺时针为正)
    float min_soft_limit_deg;   // 行程软限位下限 (防止拉断电线或绳索)
    float max_soft_limit_deg;   // 行程软限位上限
} ServoZeroConfig_t;

/**
 * @brief 6 轴机械零点与极性固化参数表 (装配完成后同事在此更新)
 */
static const ServoZeroConfig_t g_openarm_zero_configs[6] = {
    // J1: 基座水平旋转
    { .servo_id = 1, .joint_name = "J1:基座旋转", .zero_offset_ticks = 2048, .invert_direction = false, .min_soft_limit_deg = -135.0f, .max_soft_limit_deg = 135.0f },
    // J2: 大臂俯仰
    { .servo_id = 2, .joint_name = "J2:大臂俯仰", .zero_offset_ticks = 1024, .invert_direction = true,  .min_soft_limit_deg = -85.0f,  .max_soft_limit_deg = 90.0f  },
    // J3: 小臂肘关节
    { .servo_id = 3, .joint_name = "J3:小臂肘部", .zero_offset_ticks = 3120, .invert_direction = false, .min_soft_limit_deg = -110.0f, .max_soft_limit_deg = 75.0f  },
    // J4: 腕部回转
    { .servo_id = 4, .joint_name = "J4:腕部自转", .zero_offset_ticks = 2048, .invert_direction = false, .min_soft_limit_deg = -150.0f, .max_soft_limit_deg = 150.0f },
    // J5: 腕部俯仰
    { .servo_id = 5, .joint_name = "J5:腕部俯仰", .zero_offset_ticks = 1850, .invert_direction = true,  .min_soft_limit_deg = -90.0f,  .max_soft_limit_deg = 90.0f  },
    // J6: 末端夹爪开合
    { .servo_id = 6, .joint_name = "J6:末端夹爪", .zero_offset_ticks = 512,  .invert_direction = false, .min_soft_limit_deg = 0.0f,    .max_soft_limit_deg = 65.0f  },
};

/**
 * @brief 将物理实际角度转换为舵机目标 Ticks
 */
static inline uint16_t AngleDegToServoTicks(uint8_t jointIndex, float targetDeg) {
    const ServoZeroConfig_t *cfg = &g_openarm_zero_configs[jointIndex];

    // 1. 软件软限位安全截断
    if (targetDeg < cfg->min_soft_limit_deg) targetDeg = cfg->min_soft_limit_deg;
    if (targetDeg > cfg->max_soft_limit_deg) targetDeg = cfg->max_soft_limit_deg;

    // 2. 极性反转处理
    float effectiveDeg = cfg->invert_direction ? -targetDeg : targetDeg;

    // 3. 计算相对 Ticks 偏置并取模 4096
    int32_t ticks = (int32_t)(cfg->zero_offset_ticks + effectiveDeg * TICKS_PER_DEGREE);
    while (ticks < 0) ticks += 4096;
    while (ticks >= 4096) ticks -= 4096;

    return (uint16_t)ticks;
}

#endif // ZERO_CALIBRATION_EEPROM_H`,
    hotspots: [
      {
        id: "zero_h1",
        title: "zero_offset_ticks 零位脉冲偏置值",
        lines: [28, 29, 30, 31, 32, 33, 34, 35, 36, 37],
        whyColleagueModifies: "只要重新拧过舵机盘固定螺丝、或者更换了新舵机，磁铁和编码器的初始对齐位置必定变化，同事必须重新标定并把这个数字更新到此处。",
        symptomsWhenWrong: "机械臂回零时姿态歪斜、无法垂直站立，逆运动学解算出的抓取点出现数十毫米的整体坐标偏移。",
        tuningGuide: "使用本系统的【舵机调零工作台】，将机械臂固定在零位卡具上，点击‘设当前位置为绝对零点’，一键导出本头文件！",
        beginnerNote: "4096 表示一整圈 360°，1° 约等于 11.38 个 Ticks。",
      },
      {
        id: "zero_h2",
        title: "invert_direction 旋转极性反向标志",
        lines: [29, 31, 35],
        whyColleagueModifies: "机械臂镜像安装舵机（如左侧安装 vs 右侧安装）时，发送 +30° 指令电机可能反向转成了 -30°，导致机械臂往反方向撞机！",
        symptomsWhenWrong: "发指令让大臂往上抬，大臂却发了疯似地往下猛砸桌面。",
        tuningGuide: "如果给正角度机械臂朝反方向运动，直接将对应轴的 `invert_direction` 从 `false` 改为 `true` 即可。",
        beginnerNote: "右手螺旋定则：大拇指指向旋转轴正向，四指弯曲方向即为正角度方向。",
      },
    ],
  },
  {
    id: "safety_monitor_c",
    fileName: "safety_stall_monitor.c",
    title: "多轴堵转电流监控与掉电保护状态机 (Safety & Protection)",
    category: "状态机与中断",
    language: "c",
    description: "防止机械臂卡死烧电机、撞机保护与过温降额的核心安全模块。嵌入式同事常根据现场抓取工况调整超时时间与阈值。",
    code: `/**
 * @file safety_stall_monitor.c
 * @brief OpenArm Multi-Axis Current Stall & Over-Temperature Watchdog
 */

#include "safety_stall_monitor.h"

#define MAX_ALLOWABLE_CURRENT_MA    1800 // 单舵机最大允许持续电流 1.8A
#define STALL_TRIGGER_TIMEOUT_MS    650  // 连续堵转超时触发阈值 (同事常调)
#define MAX_MOTOR_TEMP_CELSIUS      68   // 最高允许温度 (°C)

typedef enum {
    STATE_NORMAL_RUNNING = 0,
    STATE_WARNING_HEAVY_LOAD,
    STATE_ALARM_STALL_PROTECTION,
    STATE_EMERGENCY_TORQUE_OFF,
} SafetyState_t;

static SafetyState_t g_system_safety_state = STATE_NORMAL_RUNNING;
static uint32_t s_stall_start_timestamps[6] = {0};

/**
 * @brief 每 20ms 定时器中断中调用的安全守护轮询函数
 */
void Safety_CheckAxisTelemetry(uint8_t jointId, uint16_t currentMa, uint8_t tempC, uint32_t nowMs) {
    if (jointId < 1 || jointId > 6) return;
    uint8_t idx = jointId - 1;

    // 1. 过温保护检查
    if (tempC >= MAX_MOTOR_TEMP_CELSIUS) {
        g_system_safety_state = STATE_EMERGENCY_TORQUE_OFF;
        STS_TorqueDisable(0xFE); // 紧急切断全部 6 轴力矩，防止退磁烧毁
        Buzzer_Alarm_Pattern(ALARM_OVERTEMP);
        return;
    }

    // 2. 堵转大电流监控
    if (currentMa > MAX_ALLOWABLE_CURRENT_MA) {
        if (s_stall_start_timestamps[idx] == 0) {
            s_stall_start_timestamps[idx] = nowMs; // 记录超流起始时间戳
        } else if (nowMs - s_stall_start_timestamps[idx] > STALL_TRIGGER_TIMEOUT_MS) {
            // 持续堵转超过阈值，判定发生机械死锁或撞机！
            g_system_safety_state = STATE_ALARM_STALL_PROTECTION;
            
            // 动作：先自动降低该轴扭矩至 30%，后退 2 度卸载机械应力
            STS_SetTorqueLimit(jointId, 30);
            STS_RelieveMechanicalStress(jointId);
            
            Buzzer_Alarm_Pattern(ALARM_STALL);
        }
    } else {
        // 电流恢复正常，重置计时器
        s_stall_start_timestamps[idx] = 0;
    }
}`,
    hotspots: [
      {
        id: "safe_h1",
        title: "STALL_TRIGGER_TIMEOUT_MS 堵转保护超时",
        lines: [8, 9, 10],
        whyColleagueModifies: "在做重载抓取（如夹起 400g 金属块）时，夹持瞬间电流会冲到 1.6A 持续 300ms。如果保护时间设得太短（如 200ms），机械臂一抓东西就会误触发报警停机；设得太长（如 3000ms），真正撞机时减速齿轮会被直接绞崩！",
        symptomsWhenWrong: "太短：正常抓取误停机；太长：撞机时不报警，冒烟烧管或齿轮扫齿。",
        tuningGuide: "微型绳驱灵巧手建议 300~500ms；OpenArm 大臂关节建议 600~900ms。",
        beginnerNote: "这是保护电机不被烧毁的‘生命线’！",
      },
    ],
  },
  {
    id: "ros2_controller_py",
    fileName: "openarm_ros2_controller.py",
    title: "ROS2 Python 上位机驱动节点与轨迹分发 (ROS2 Driver)",
    category: "ROS2与上位机",
    language: "python",
    description: "ROS2 与 OpenArm 真实串口驱动对接的桥梁。订阅 MoveIt 发布的 JointTrajectory 轨迹，并转化为串口 SyncWrite 实时下发。",
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OpenArm 6-DOF ROS2 Hardware Interface Driver Node
Subscribes to /joint_trajectory and streams sync packet via serial
"""

import rclpy
from rclpy.node import Node
from trajectory_msgs.msg import JointTrajectory
from sensor_msgs.msg import JointState
import serial
import struct
import math

class OpenArmDriverNode(Node):
    def __init__(self):
        super().__init__('openarm_driver_node')
        
        # 串口参数 (同事常根据实际硬件更改端口与波特率)
        self.declare_parameter('port', '/dev/ttyUSB0')
        self.declare_parameter('baudrate', 1000000) # 1.0 Mbps
        
        port = self.get_parameter('port').value
        baud = self.get_parameter('baudrate').value
        
        self.get_logger().info(f"Opening Serial Port: {port} @ {baud} bps")
        self.ser = serial.Serial(port, baud, timeout=0.01)
        
        # 订阅 MoveIt / 轨迹发布者
        self.sub_traj = self.create_subscription(
            JointTrajectory,
            '/openarm/joint_trajectory',
            self.trajectory_callback,
            10
        )
        
        # 50Hz 广播当前机械臂状态
        self.pub_states = self.create_publisher(JointState, '/joint_states', 10)
        self.timer = self.create_timer(0.02, self.publish_joint_states_timer)
        
        # 零点偏置脉冲表 (对应 6 个关节 0 度时的原始编码器值)
        self.zero_offsets = [2048, 1024, 3120, 2048, 1850, 512]
        self.inverts = [False, True, False, False, True, False]

    def deg_to_ticks(self, joint_idx, angle_rad):
        deg = math.degrees(angle_rad)
        if self.inverts[joint_idx]:
            deg = -deg
        ticks = int(self.zero_offsets[joint_idx] + deg * (4096.0 / 360.0))
        return max(0, min(4095, ticks))

    def trajectory_callback(self, msg: JointTrajectory):
        if not msg.points:
            return
        # 取轨迹最新目标点
        target_point = msg.points[-1]
        target_positions = target_point.positions # 弧度制
        
        # 打包 6 轴 SyncWrite 数据包
        packet = bytearray([0xFF, 0xFF, 0xFE, 38, 0x83, 0x2A, 4])
        for i in range(min(6, len(target_positions))):
            ticks = self.deg_to_ticks(i, target_positions[i])
            speed = 1500 # 默认平滑速度
            packet.extend([i + 1, ticks & 0xFF, (ticks >> 8) & 0xFF, speed & 0xFF, (speed >> 8) & 0xFF])
        
        # 计算 Checksum
        checksum = (~sum(packet[2:])) & 0xFF
        packet.append(checksum)
        
        # 串口下发
        self.ser.write(packet)

    def publish_joint_states_timer(self):
        # 周期性读取当前舵机真实位置并发布给 RViz
        pass

def main(args=None):
    rclpy.init(args=args)
    node = OpenArmDriverNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()`,
    hotspots: [
      {
        id: "ros_h1",
        title: "deg_to_ticks 弧度转舵机脉冲与零位偏置",
        lines: [40, 41, 42, 43, 44, 45, 46],
        whyColleagueModifies: "ROS2 内部所有关节角度标准单位全是【弧度 (Radians)】，而舵机只认【0~4095 Ticks】。如果零位偏置或正反转极性填反，RViz 里的模型和真实机械臂动作就会彻底相反！",
        symptomsWhenWrong: "RViz 里的机械臂向上抬起，桌子上的真机械臂却往桌面上撞。",
        tuningGuide: "公式：`deg = rad * (180 / pi)`，再叠加 `zero_offsets` 换算成 4096 脉冲。",
        beginnerNote: "记住：ROS2 是弧度制（0~3.14），单片机和上位机通常是角度制（0~360°）。",
      },
    ],
  },
];
