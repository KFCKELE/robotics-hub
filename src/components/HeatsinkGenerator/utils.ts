import * as THREE from "three";
import { STLExporter } from "three-stdlib";

export type ContactShapeType = "rectangle" | "circle" | "l_shape" | "stepped" | "hexagon" | "mounting_4holes";

export interface MountingHole {
  x: number; // mm from center
  y: number; // mm from center
  diameter: number; // mm
  type?: "through" | "counterbore" | "threaded";
}

export interface HeatSourceZone {
  width: number; // mm
  length: number; // mm
  offsetX: number; // mm
  offsetY: number; // mm
  power?: number; // W
}

export interface HeatsinkParams {
  baseWidth: number; // mm (bounding width)
  baseLength: number; // mm (bounding length)
  baseThickness: number; // mm
  maxHeight: number; // mm
  power: number; // W (Power Dissipation)
  maxTemp: number; // ℃ (Max Chip Temp)
  ambientTemp: number; // ℃ (Ambient Temp)
  materialId: string; // Material ID
  
  // Advanced Contact Surface & Drawing Geometry
  contactShape?: ContactShapeType;
  circleDiameter?: number; // for circular base
  lShapeCutout?: { cutoutW: number; cutoutL: number }; // for L-shape
  steppedDetails?: { stepWidth: number; stepLength: number; stepHeight: number }; // for stepped base
  mountingHoles?: MountingHole[];
  heatSourceZone?: HeatSourceZone;
  finOrientation?: "longitudinal" | "transverse";
  drawingImage?: string; // base64 preview
  drawingNotes?: string;
}

export const HEATSINK_MATERIALS: Record<string, { name: string; k: number; density: number; color: number }> = {
  AL6061: { name: "铝合金 6061 (Aluminum 6061)", k: 167, density: 2.7, color: 0x94a3b8 },
  AL1060: { name: "纯铝 1060 (Pure Al 1060)", k: 234, density: 2.7, color: 0xe2e8f0 },
  CU1100: { name: "紫铜 C1100 (Copper C1100)", k: 386, density: 8.9, color: 0xb45309 },
  CUZN39: { name: "黄铜 H62 (Brass)", k: 120, density: 8.5, color: 0xeab308 },
};

export interface HeatsinkResult {
  requiredThermalRes: number; // ℃/W
  requiredArea_cm2: number;
  actualArea_cm2: number;
  finCount: number;
  finThickness: number; // mm
  finGap: number; // mm
  finHeight: number; // mm
  isValid: boolean;
  message: string;
  weight_g: number; // grams
  spreadingResistance: number; // ℃/W
  effectiveBaseArea_mm2: number;
  heatFluxDensity_W_cm2: number;
}

export function calculateHeatsink(params: HeatsinkParams): HeatsinkResult {
  // Defensive input sanitization
  const baseWidth = Math.max(5, Number(params.baseWidth) || 60);
  const baseLength = Math.max(5, Number(params.baseLength) || 80);
  const baseThickness = Math.max(0.5, Number(params.baseThickness) || 3);
  const maxHeight = Math.max(baseThickness + 1, Number(params.maxHeight) || 25);
  const power = Math.max(0.1, Number(params.power) || 30);
  const ambientTemp = Number(params.ambientTemp) ?? 25;
  const maxTemp = Math.max(ambientTemp + 1, Number(params.maxTemp) || 85);
  const materialId = params.materialId || "AL6061";
  const contactShape = params.contactShape || "rectangle";
  
  const mat = HEATSINK_MATERIALS[materialId] || HEATSINK_MATERIALS["AL6061"];

  // 1. Calculate Base Contact Surface Area based on Shape
  let effectiveBaseArea_mm2 = baseWidth * baseLength;
  if (contactShape === "circle") {
    const dia = params.circleDiameter || Math.min(baseWidth, baseLength);
    effectiveBaseArea_mm2 = Math.PI * Math.pow(dia / 2, 2);
  } else if (contactShape === "l_shape") {
    const cutW = params.lShapeCutout?.cutoutW || baseWidth * 0.4;
    const cutL = params.lShapeCutout?.cutoutL || baseLength * 0.4;
    effectiveBaseArea_mm2 = baseWidth * baseLength - cutW * cutL;
  } else if (contactShape === "hexagon") {
    const side = Math.min(baseWidth, baseLength) / 2;
    effectiveBaseArea_mm2 = (3 * Math.sqrt(3) / 2) * side * side;
  } else if (contactShape === "stepped") {
    effectiveBaseArea_mm2 = baseWidth * baseLength;
  }

  // Deduct mounting holes area
  if (params.mountingHoles && params.mountingHoles.length > 0) {
    const holesArea = params.mountingHoles.reduce(
      (acc, h) => acc + Math.PI * Math.pow((h.diameter || 3) / 2, 2),
      0
    );
    effectiveBaseArea_mm2 = Math.max(100, effectiveBaseArea_mm2 - holesArea);
  }

  // Heat flux density (W/cm²)
  const heatSourceArea_cm2 = params.heatSourceZone
    ? Math.max(0.1, (params.heatSourceZone.width * params.heatSourceZone.length) / 100)
    : Math.max(1, effectiveBaseArea_mm2 / 200);
  const heatFluxDensity_W_cm2 = power / heatSourceArea_cm2;

  // 2. Calculate Required Thermal Resistance (R_req)
  const deltaT = maxTemp - ambientTemp;
  if (deltaT <= 0) {
    return {
      requiredThermalRes: 0,
      requiredArea_cm2: 0,
      actualArea_cm2: effectiveBaseArea_mm2 / 100,
      finCount: 0,
      finThickness: 0,
      finGap: 0,
      finHeight: 0,
      isValid: false,
      message: "错误：芯片允许最高温度必须高于环境温度 (ΔT > 0)。",
      weight_g: ((effectiveBaseArea_mm2 * baseThickness) / 1000) * mat.density,
      spreadingResistance: 0,
      effectiveBaseArea_mm2,
      heatFluxDensity_W_cm2,
    };
  }

  const R_req = Math.max(0.01, deltaT / power);
  
  // Empirical natural convection formula factoring in thermal conductivity.
  const k_factor = Math.max(0.1, 200 / (mat.k || 200));
  const reqArea_cm2 = Math.pow(50 / R_req, 2) * Math.sqrt(k_factor);
  const reqArea_mm2 = reqArea_cm2 * 100;
  
  // 3. Geometry Constraints
  const finHeight = Math.max(0, maxHeight - baseThickness);
  
  // Spreading Resistance approximation: Rs = thickness / (k * Area)
  const spreadingResistance = (baseThickness / 1000) / ((mat.k || 200) * Math.max(1e-6, effectiveBaseArea_mm2 / 1000000));

  let finCount = 0;
  let finThickness = 1.2;
  let finGap = 0;
  
  // If base area alone is enough
  if (effectiveBaseArea_mm2 >= reqArea_mm2) {
    const volume_cm3 = (effectiveBaseArea_mm2 * baseThickness) / 1000;
    return {
      requiredThermalRes: R_req,
      requiredArea_cm2: reqArea_cm2,
      actualArea_cm2: effectiveBaseArea_mm2 / 100,
      finCount: 0,
      finThickness: 0,
      finGap: 0,
      finHeight: 0,
      isValid: true,
      message: "无需翅片，基础定制接触面面积已满足自然对流散热要求。",
      weight_g: volume_cm3 * mat.density,
      spreadingResistance,
      effectiveBaseArea_mm2,
      heatFluxDensity_W_cm2,
    };
  }
  
  // 4. Calculate fins
  const isTransverse = params.finOrientation === "transverse";
  const finSpan = isTransverse ? baseWidth : baseLength;
  const finSpreadWidth = isTransverse ? baseLength : baseWidth;
  
  const singleFinArea = 2 * (finSpan * finHeight) + finThickness * finSpan + 2 * (finThickness * finHeight);
  
  if (singleFinArea <= 0 || finHeight <= 0) {
    return {
      requiredThermalRes: R_req,
      requiredArea_cm2: reqArea_cm2,
      actualArea_cm2: effectiveBaseArea_mm2 / 100,
      finCount: 0,
      finThickness: 0,
      finGap: 0,
      finHeight: 0,
      isValid: false,
      message: "错误：限高小于或等于底座厚度，无垂直空间容纳翅片。",
      weight_g: ((effectiveBaseArea_mm2 * baseThickness) / 1000) * mat.density,
      spreadingResistance,
      effectiveBaseArea_mm2,
      heatFluxDensity_W_cm2,
    };
  }

  const neededAreaFromFins = reqArea_mm2 - effectiveBaseArea_mm2;
  finCount = Math.max(2, Math.min(60, Math.ceil(neededAreaFromFins / singleFinArea)));
  
  // Calculate gap
  finGap = finCount > 1 ? (finSpreadWidth - finCount * finThickness) / (finCount - 1) : 0;
  
  let isValid = true;
  let message = `计算成功：已为${getContactShapeLabel(contactShape)}定制接触面匹配最优翅片阵列。`;
  
  // Constraint checks
  if (finGap < 1.5) {
    isValid = false;
    message = "警告：翅片间距过小（< 1.5mm），自然对流边界层重叠。建议扩大接触面尺寸、提高限高或增加强制风冷。";
  }
  
  if (finHeight <= 0) {
    isValid = false;
    message = "错误：限高小于等于底座厚度，无法生成翅片。";
  }
  
  const actualArea_mm2 = effectiveBaseArea_mm2 + finCount * singleFinArea;
  
  // Calculate weight
  const baseVolume_mm3 = effectiveBaseArea_mm2 * baseThickness;
  const finsVolume_mm3 = finCount * (finThickness * finSpan * finHeight);
  const totalVolume_cm3 = (baseVolume_mm3 + finsVolume_mm3) / 1000;
  const weight_g = totalVolume_cm3 * mat.density;
  
  return {
    requiredThermalRes: R_req,
    requiredArea_cm2: reqArea_cm2,
    actualArea_cm2: actualArea_mm2 / 100,
    finCount,
    finThickness,
    finGap: Math.max(0, finGap),
    finHeight,
    isValid,
    message,
    weight_g,
    spreadingResistance,
    effectiveBaseArea_mm2,
    heatFluxDensity_W_cm2,
  };
}

export function getContactShapeLabel(shape?: ContactShapeType): string {
  switch (shape) {
    case "circle":
      return "圆形电机端盖接触面";
    case "l_shape":
      return "L型转角避位接触面";
    case "stepped":
      return "阶梯双高差接触面";
    case "hexagon":
      return "六角法兰对称接触面";
    case "mounting_4holes":
      return "4孔沉头定位接触板";
    case "rectangle":
    default:
      return "标准矩形接触面";
  }
}

export function generateHeatsinkMesh(params: HeatsinkParams, result: HeatsinkResult): THREE.Group {
  const group = new THREE.Group();
  
  const baseWidth = Math.max(5, Number(params.baseWidth) || 60);
  const baseLength = Math.max(5, Number(params.baseLength) || 80);
  const baseThickness = Math.max(0.5, Number(params.baseThickness) || 3);
  const materialId = params.materialId || "AL6061";
  const contactShape = params.contactShape || "rectangle";
  const isTransverse = params.finOrientation === "transverse";

  const { finCount, finThickness, finGap, finHeight } = result;
  const matProps = HEATSINK_MATERIALS[materialId] || HEATSINK_MATERIALS["AL6061"];
  
  const material = new THREE.MeshStandardMaterial({ 
    color: matProps.color,
    metalness: 0.75,
    roughness: 0.28,
  });

  const holeAccentMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.9,
    roughness: 0.2,
  });

  const hotspotMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    emissive: 0xe11d48,
    emissiveIntensity: 0.4,
    metalness: 0.3,
    roughness: 0.4,
  });

  // 1. Build Base Shape with custom contour & holes
  const shape = new THREE.Shape();

  if (contactShape === "circle") {
    const radius = (params.circleDiameter || Math.min(baseWidth, baseLength)) / 2;
    shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
  } else if (contactShape === "l_shape") {
    const cutW = params.lShapeCutout?.cutoutW || baseWidth * 0.45;
    const cutL = params.lShapeCutout?.cutoutL || baseLength * 0.45;
    const hw = baseWidth / 2;
    const hl = baseLength / 2;

    shape.moveTo(-hw, -hl);
    shape.lineTo(hw, -hl);
    shape.lineTo(hw, hl - cutL);
    shape.lineTo(hw - cutW, hl - cutL);
    shape.lineTo(hw - cutW, hl);
    shape.lineTo(-hw, hl);
    shape.closePath();
  } else if (contactShape === "hexagon") {
    const r = Math.min(baseWidth, baseLength) / 2;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
  } else {
    // Standard rectangle or 4-holes plate
    const hw = baseWidth / 2;
    const hl = baseLength / 2;
    shape.moveTo(-hw, -hl);
    shape.lineTo(hw, -hl);
    shape.lineTo(hw, hl);
    shape.lineTo(-hw, hl);
    shape.closePath();
  }

  // Add mounting hole cutouts into the shape
  const holes = params.mountingHoles || [];
  if (holes.length > 0) {
    holes.forEach((h) => {
      const holePath = new THREE.Path();
      holePath.absarc(h.x, h.y, (h.diameter || 3.2) / 2, 0, Math.PI * 2, true);
      shape.holes.push(holePath);
    });
  }

  const extrudeSettings = {
    depth: baseThickness,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.3,
    bevelThickness: 0.3,
  };

  const baseGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  // Re-orient ExtrudeGeometry: default extrudes along Z, rotate to align properly
  const baseMesh = new THREE.Mesh(baseGeo, material);
  baseMesh.position.set(0, 0, 0);
  group.add(baseMesh);

  // Stepped feature addition (if stepped contact shape)
  if (contactShape === "stepped") {
    const stepW = params.steppedDetails?.stepWidth || baseWidth * 0.45;
    const stepL = params.steppedDetails?.stepLength || baseLength * 0.45;
    const stepH = params.steppedDetails?.stepHeight || 2.0;
    const stepGeo = new THREE.BoxGeometry(stepW, stepL, stepH);
    const stepMesh = new THREE.Mesh(stepGeo, material);
    stepMesh.position.set(0, 0, -stepH / 2);
    group.add(stepMesh);
  }

  // Add visual rings for mounting holes on top/bottom
  if (holes.length > 0) {
    holes.forEach((h) => {
      const ringGeo = new THREE.RingGeometry(
        (h.diameter || 3.2) / 2,
        (h.diameter || 3.2) / 2 + 1.2,
        24
      );
      const ringMesh = new THREE.Mesh(ringGeo, holeAccentMat);
      ringMesh.position.set(h.x, h.y, baseThickness + 0.35);
      group.add(ringMesh);

      // Bottom ring
      const bRing = new THREE.Mesh(ringGeo, holeAccentMat);
      bRing.position.set(h.x, h.y, -0.05);
      group.add(bRing);
    });
  }

  // Add Heat Source Contact Hotspot visual patch on bottom face
  if (params.heatSourceZone) {
    const hw = params.heatSourceZone.width || 30;
    const hl = params.heatSourceZone.length || 30;
    const ox = params.heatSourceZone.offsetX || 0;
    const oy = params.heatSourceZone.offsetY || 0;

    const spotGeo = new THREE.PlaneGeometry(hw, hl);
    const spotMesh = new THREE.Mesh(spotGeo, hotspotMat);
    spotMesh.position.set(ox, oy, -0.08);
    spotMesh.rotation.y = Math.PI; // Face downward
    group.add(spotMesh);
  }

  // 2. Build Fins with adaptive length/orientation
  if (finCount > 0 && finHeight > 0 && finThickness > 0) {
    if (!isTransverse) {
      // Longitudinal (fins run along Y length, arrayed along X)
      const startX = -baseWidth / 2 + finThickness / 2;
      for (let i = 0; i < finCount; i++) {
        const xPos = startX + i * (finThickness + finGap);
        
        let finLen = baseLength;
        let yOffset = 0;
        
        // Handle L-shape fin clipping
        if (contactShape === "l_shape") {
          const cutW = params.lShapeCutout?.cutoutW || baseWidth * 0.45;
          const cutL = params.lShapeCutout?.cutoutL || baseLength * 0.45;
          if (xPos > baseWidth / 2 - cutW) {
            finLen = baseLength - cutL;
            yOffset = -cutL / 2;
          }
        } else if (contactShape === "circle") {
          const r = (params.circleDiameter || Math.min(baseWidth, baseLength)) / 2;
          if (Math.abs(xPos) < r - finThickness) {
            finLen = 2 * Math.sqrt(r * r - xPos * xPos);
          } else {
            continue;
          }
        }

        const finGeo = new THREE.BoxGeometry(finThickness, Math.max(2, finLen), finHeight);
        const finMesh = new THREE.Mesh(finGeo, material);
        finMesh.position.set(xPos, yOffset, baseThickness + finHeight / 2);
        group.add(finMesh);
      }
    } else {
      // Transverse (fins run along X width, arrayed along Y)
      const startY = -baseLength / 2 + finThickness / 2;
      for (let i = 0; i < finCount; i++) {
        const yPos = startY + i * (finThickness + finGap);

        let finLen = baseWidth;
        let xOffset = 0;

        if (contactShape === "l_shape") {
          const cutW = params.lShapeCutout?.cutoutW || baseWidth * 0.45;
          const cutL = params.lShapeCutout?.cutoutL || baseLength * 0.45;
          if (yPos > baseLength / 2 - cutL) {
            finLen = baseWidth - cutW;
            xOffset = -cutW / 2;
          }
        } else if (contactShape === "circle") {
          const r = (params.circleDiameter || Math.min(baseWidth, baseLength)) / 2;
          if (Math.abs(yPos) < r - finThickness) {
            finLen = 2 * Math.sqrt(r * r - yPos * yPos);
          } else {
            continue;
          }
        }

        const finGeo = new THREE.BoxGeometry(Math.max(2, finLen), finThickness, finHeight);
        const finMesh = new THREE.Mesh(finGeo, material);
        finMesh.position.set(xOffset, yPos, baseThickness + finHeight / 2);
        group.add(finMesh);
      }
    }
  }
  
  // Center group around origin for 3D navigation
  const box = new THREE.Box3().setFromObject(group);
  if (!box.isEmpty()) {
    const center = box.getCenter(new THREE.Vector3());
    group.position.sub(center);
  }
  
  return group;
}

export function exportToSTL(group: THREE.Group): string {
  const exporter = new STLExporter();
  const stlString = exporter.parse(group);
  return stlString;
}

export function exportToFreeCADScript(params: HeatsinkParams, result: HeatsinkResult): string {
  const holes = params.mountingHoles || [];
  const holesPython = holes.map((h, i) => `
    # Mounting Hole ${i + 1}
    hole_${i} = Part.makeCylinder(${(h.diameter || 3.2) / 2}, T_base + 1)
    hole_${i}.translate(App.Vector(${h.x}, ${h.y}, -0.5))
    base_shape = base_shape.cut(hole_${i})
  `).join("\n");

  return `
import FreeCAD as App
import FreeCADGui as Gui
import Part

# ==========================================================
# Parametric Heatsink Generator FreeCAD Python Script
# Contact Face Shape: ${params.contactShape || "rectangle"}
# Generated by AI Studio Mechanical & Thermal Hub
# ==========================================================

W = ${params.baseWidth}
L = ${params.baseLength}
T_base = ${params.baseThickness}
H_fin = ${result.finHeight}
t_fin = ${result.finThickness}
gap = ${result.finGap}
n_fins = ${result.finCount}
shape_type = "${params.contactShape || "rectangle"}"

# Create document
doc = App.newDocument("Custom_Contact_Heatsink")

# --- 1. Generate Base Shape ---
if shape_type == "circle":
    dia = ${params.circleDiameter || Math.min(params.baseWidth, params.baseLength)}
    base_shape = Part.makeCylinder(dia / 2.0, T_base)
elif shape_type == "l_shape":
    cutW = ${params.lShapeCutout?.cutoutW || params.baseWidth * 0.4}
    cutL = ${params.lShapeCutout?.cutoutL || params.baseLength * 0.4}
    p1 = App.Vector(-W/2, -L/2, 0)
    p2 = App.Vector(W/2, -L/2, 0)
    p3 = App.Vector(W/2, L/2 - cutL, 0)
    p4 = App.Vector(W/2 - cutW, L/2 - cutL, 0)
    p5 = App.Vector(W/2 - cutW, L/2, 0)
    p6 = App.Vector(-W/2, L/2, 0)
    poly = Part.makePolygon([p1, p2, p3, p4, p5, p6, p1])
    face = Part.Face(poly)
    base_shape = face.extrude(App.Vector(0, 0, T_base))
else:
    base_shape = Part.makeBox(W, L, T_base)
    base_shape.translate(App.Vector(-W/2, -L/2, 0))

# --- 2. Cut Mounting Holes ---
${holesPython}

# --- 3. Generate Fins ---
fins = []
start_x = -W/2 + t_fin/2
for i in range(n_fins):
    fin = Part.makeBox(t_fin, L, H_fin)
    fin.translate(App.Vector(start_x + i * (t_fin + gap), -L/2, T_base))
    fins.append(fin)

if len(fins) > 0:
    all_fins = fins[0]
    for f in fins[1:]:
        all_fins = all_fins.fuse(f)
    result_shape = base_shape.fuse(all_fins)
else:
    result_shape = base_shape

# Add to document
obj = doc.addObject("Part::Feature", "Custom_Heatsink_Solid")
obj.Shape = result_shape
doc.recompute()
Gui.SendMsgToActiveView("ViewFit")
  `;
}
