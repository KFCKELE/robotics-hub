export type JointType =
  | "revolute"
  | "continuous"
  | "prismatic"
  | "fixed"
  | "floating"
  | "planar";

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Rotation3D {
  roll: number;
  pitch: number;
  yaw: number;
}

export interface InertiaMatrix {
  ixx: number;
  ixy: number;
  ixz: number;
  iyy: number;
  iyz: number;
  izz: number;
}

export interface JointLimits {
  lower: number;
  upper: number;
  effort: number;
  velocity: number;
}

export interface JointDynamics {
  damping: number;
  friction: number;
}

export interface JointMimic {
  joint: string;
  multiplier: number;
  offset: number;
}

export interface UrdfJoint {
  id: string;
  name: string;
  type: JointType;
  parentLink: string;
  childLink: string;
  origin: {
    xyz: Vector3D;
    rpy: Rotation3D;
  };
  axis: Vector3D;
  limits: JointLimits;
  dynamics?: JointDynamics;
  mimic?: JointMimic;
  actuatorType?: "servo" | "damiao_foc" | "tendon_capstan" | "stepper" | "direct_drive";
  hardwareInterface?: "hardware_interface/PositionJointInterface" | "hardware_interface/EffortJointInterface" | "hardware_interface/VelocityJointInterface";
  currentValue?: number; // Current joint position in rad or m for viewer
}

export interface GeometryShape {
  type: "box" | "cylinder" | "sphere" | "mesh";
  dimensions?: Vector3D; // For box
  radius?: number; // For cylinder/sphere
  length?: number; // For cylinder
  meshPath?: string;
  localFileUrl?: string; // Client-side object URL for live rendering
  meshScale?: Vector3D;
}

export interface LinkMaterial {
  name: string;
  colorRgba: [number, number, number, number];
  metallic?: number;
  roughness?: number;
  materialType?: "PLA-CF" | "PA-CF" | "PETG" | "Aluminium 6061" | "Titanium" | "TPU" | "Steel 304";
  densityGPerCm3?: number;
}

export interface UrdfLink {
  id: string;
  name: string;
  visual: {
    origin: {
      xyz: Vector3D;
      rpy: Rotation3D;
    };
    geometry: GeometryShape;
    material: LinkMaterial;
  };
  collision: {
    origin: {
      xyz: Vector3D;
      rpy: Rotation3D;
    };
    geometry: GeometryShape;
  };
  inertial: {
    origin: {
      xyz: Vector3D;
      rpy: Rotation3D;
    };
    massKg: number;
    inertia: InertiaMatrix;
  };
  colorHex?: string;
}

export interface RobotModel {
  id: string;
  name: string;
  category: "bionic_hand" | "robotic_arm" | "gripper" | "single_part" | "custom";
  description: string;
  dof: number;
  rootLink: string;
  links: UrdfLink[];
  joints: UrdfJoint[];
  presetPoses: {
    name: string;
    description: string;
    jointValues: Record<string, number>; // jointName -> angle in radians
  }[];
}

export interface AssemblyImportResult {
  fileName: string;
  fileSize: string;
  detectedPartsCount: number;
  detectedMatesCount: number;
  inferredChain: string[];
  totalMassKg: number;
  suggestedName: string;
}

export interface OptimizationOptions {
  optimizationMode: "smooth_dynamics" | "axis_rectification" | "mesh_decimation" | "inertia_balance" | "soft_limit" | "comprehensive";
  materialType: "PLA-CF" | "PA-CF" | "PETG" | "Aluminium 6061" | "Titanium" | "TPU" | "Steel 304";
  meshSimplification: "low" | "balanced" | "high" | "exact";
  collisionType: "mesh" | "convex_hull" | "primitive_approx";
  autoCorrectAxes: boolean;
  dampingFactor: number; // 0.1 ~ 5.0
  frictionFactor: number; // 0.1 ~ 5.0
  limitBufferDeg: number; // 0 ~ 15 deg
  enforcePositiveDefiniteInertia: boolean;
  customPromptNotes?: string;
}

export interface UrdfHistoryItem {
  id: string;
  timestamp: number;
  version: string;
  fileName: string;
  fileSize: string;
  status: "success" | "optimized" | "failed";
  qualityScore: number; // 0 - 100
  robot: RobotModel;
  optimizationOptions: OptimizationOptions;
  notes?: string;
}
