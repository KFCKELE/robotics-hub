import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three-stdlib";
import { OBJLoader } from "three-stdlib";
import { RobotModel, UrdfLink, UrdfJoint } from "./types";
import {
  Rotate3d,
  Maximize2,
  Minimize2,
  Eye,
  Crosshair,
  Box,
  Layers,
  Sparkles,
  RefreshCw,
  Compass,
  Hand,
  Cpu,
} from "lucide-react";

interface Urdf3DViewerProps {
  robot: RobotModel;
  jointValues: Record<string, number>;
  onJointChange?: (jointName: string, value: number) => void;
  selectedJointName?: string | null;
  onSelectJoint?: (jointName: string | null) => void;
}

export const Urdf3DViewer: React.FC<Urdf3DViewerProps> = ({
  robot,
  jointValues,
  onJointChange,
  selectedJointName,
  onSelectJoint,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const linkObjectsMapRef = useRef<Map<string, THREE.Group>>(new Map());
  const jointObjectsMapRef = useRef<Map<string, THREE.Group>>(new Map());
  const axesHelpersMapRef = useRef<Map<string, THREE.AxesHelper>>(new Map());
  const wireframesMapRef = useRef<Map<string, THREE.LineSegments>>(new Map());

  // Viewer options
  const [showAxes, setShowAxes] = useState<boolean>(true);
  const [showWireframe, setShowWireframe] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [endEffectorPos, setEndEffectorPos] = useState<{ x: number; y: number; z: number }>({
    x: 0,
    y: 0,
    z: 0,
  });

  // Mouse orbit state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 3, radius: 0.36 });
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0, 0.08));

  // Initialize Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.01,
      100
    );
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xf8fafc, 1.4);
    dirLight1.position.set(2, 4, 3);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.7);
    dirLight2.position.set(-2, -1, 1);
    scene.add(dirLight2);

    const dirLight3 = new THREE.DirectionalLight(0xa855f7, 0.5);
    dirLight3.position.set(0, -3, 2);
    scene.add(dirLight3);

    const pointLight = new THREE.PointLight(0x06b6d4, 1.2, 2);
    pointLight.position.set(0, 0.1, 0.15);
    scene.add(pointLight);

    // 5. Grid Helper & Floor
    const gridHelper = new THREE.GridHelper(1.0, 20, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = 0;
    gridHelper.name = "grid_helper";
    scene.add(gridHelper);

    // 6. Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && !isDraggingRef.current) {
        cameraAngleRef.current.theta += 0.005;
        updateCameraPosition();
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
      cameraAngleRef.current.radius = Math.max(
        0.1,
        Math.min(3.0, cameraAngleRef.current.radius * zoomFactor)
      );
      updateCameraPosition();
    };
    container.addEventListener("wheel", handleWheelNative, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheelNative);
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    const target = targetLookAtRef.current;

    cameraRef.current.position.x =
      target.x + radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y =
      target.y + radius * Math.cos(phi);
    cameraRef.current.position.z =
      target.z + radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.lookAt(target);
  };

  // Build Kinematic Tree from Robot Model
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear previous robot objects
    linkObjectsMapRef.current.forEach((obj) => scene.remove(obj));
    linkObjectsMapRef.current.clear();
    jointObjectsMapRef.current.clear();
    axesHelpersMapRef.current.clear();
    wireframesMapRef.current.clear();

    const linkMap = new Map<string, UrdfLink>();
    robot.links.forEach((l) => linkMap.set(l.name, l));

    // Shared high-fidelity materials
    const metallicHingeMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.2,
    });

    const screwPinMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.9,
      roughness: 0.15,
    });

    const siliconePadMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.1,
      roughness: 0.8,
    });

    // Create 3D Mesh for Link with rich mechanical features
    const createLinkMesh = (link: UrdfLink): THREE.Group => {
      const linkGroup = new THREE.Group();
      linkGroup.name = `link_${link.name}`;

      const colorHex = link.colorHex ? parseInt(link.colorHex.replace("#", "0x")) : 0xcbd5e1;
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.35,
        metalness: 0.35,
      });

      const geomType = link.visual.geometry.type;
      const d = link.visual.geometry.dimensions || { x: 0.08, y: 0.06, z: 0.03 };

      // Render User's Uploaded CAD File (STL/OBJ) if available
      if (link.visual.geometry.localFileUrl) {
        const url = link.visual.geometry.localFileUrl;
        const meshPath = link.visual.geometry.meshPath || "";
        const isObj = meshPath.toLowerCase().endsWith(".obj") || url.toLowerCase().includes(".obj");
        
        // Show loading placeholder wireframe
        const loadPlaceholderGeo = new THREE.BoxGeometry(d.x, d.y, d.z);
        const loadPlaceholderMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.5 });
        const loadPlaceholder = new THREE.Mesh(loadPlaceholderGeo, loadPlaceholderMat);
        loadPlaceholder.position.set(0, 0, d.z / 2);
        linkGroup.add(loadPlaceholder);

        const vo = link.visual.origin;
        const scale = link.visual.geometry.meshScale || { x: 0.001, y: 0.001, z: 0.001 };

        if (isObj) {
          const loader = new OBJLoader();
          loader.load(url, (object) => {
            linkGroup.remove(loadPlaceholder);
            object.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.material = baseMaterial;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
              }
            });
            object.scale.set(scale.x, scale.y, scale.z);
            object.position.set(vo.xyz.x, vo.xyz.y, vo.xyz.z);
            object.rotation.set(vo.rpy.roll, vo.rpy.pitch, vo.rpy.yaw);
            linkGroup.add(object);
          }, undefined, (err) => console.error("Error loading OBJ:", err));
        } else {
          // Default to STL
          const loader = new STLLoader();
          loader.load(url, (geometry) => {
            linkGroup.remove(loadPlaceholder);
            const mesh = new THREE.Mesh(geometry, baseMaterial);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.scale.set(scale.x, scale.y, scale.z);
            mesh.position.set(vo.xyz.x, vo.xyz.y, vo.xyz.z);
            mesh.rotation.set(vo.rpy.roll, vo.rpy.pitch, vo.rpy.yaw);
            linkGroup.add(mesh);
          }, undefined, (err) => console.error("Error loading STL:", err));
        }
      } else {
        // Fallback to Parametric Procedural Mechanical Shapes
        const isSinglePart = robot.category === "single_part";
        const isBionicHand = robot.category === "bionic_hand";
        const isPalm = isBionicHand && link.name.includes("palm");
        const isDistal = isBionicHand && link.name.includes("distal");
        const isProximal = isBionicHand && link.name.includes("proximal");
        const isIntermediate = isBionicHand && link.name.includes("intermediate");
        const isThumb = isBionicHand && link.name.includes("thumb");

        if (isSinglePart) {
        // High-Fidelity Precision CAD Component / Base Mounting Chassis
        const partBodyGeo = new THREE.BoxGeometry(d.x, d.y, d.z);
        const partMesh = new THREE.Mesh(partBodyGeo, baseMaterial);
        partMesh.castShadow = true;
        partMesh.receiveShadow = true;
        partMesh.position.set(0, 0, d.z / 2);
        linkGroup.add(partMesh);

        // Center Interface Hub / Flange Boss
        const hubGeo = new THREE.CylinderGeometry(Math.min(d.x, d.y) * 0.28, Math.min(d.x, d.y) * 0.32, d.z * 0.4, 24);
        const hubMesh = new THREE.Mesh(hubGeo, metallicHingeMat);
        hubMesh.rotation.x = Math.PI / 2;
        hubMesh.position.set(0, 0, d.z * 0.85);
        linkGroup.add(hubMesh);

        // Inner center bore hole
        const boreGeo = new THREE.CylinderGeometry(Math.min(d.x, d.y) * 0.14, Math.min(d.x, d.y) * 0.14, d.z * 0.45, 24);
        const boreMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
        const boreMesh = new THREE.Mesh(boreGeo, boreMat);
        boreMesh.rotation.x = Math.PI / 2;
        boreMesh.position.set(0, 0, d.z * 0.86);
        linkGroup.add(boreMesh);

        // 4 Precision Perimeter Socket Bolt Holes
        const holeOffsets = [
          { x: d.x * 0.38, y: d.y * 0.38 },
          { x: -d.x * 0.38, y: d.y * 0.38 },
          { x: d.x * 0.38, y: -d.y * 0.38 },
          { x: -d.x * 0.38, y: -d.y * 0.38 },
        ];
        holeOffsets.forEach(({ x, y }) => {
          const holeGeo = new THREE.CylinderGeometry(0.003, 0.003, d.z * 1.05, 16);
          const holeMesh = new THREE.Mesh(holeGeo, screwPinMat);
          holeMesh.rotation.x = Math.PI / 2;
          holeMesh.position.set(x, y, d.z / 2);
          linkGroup.add(holeMesh);
        });

        // Center of Mass (CoM) Marker (Yellow Indicator)
        const comMarkerGeo = new THREE.SphereGeometry(0.0035, 16, 16);
        const comMarkerMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xd97706,
          emissiveIntensity: 0.6,
        });
        const comMesh = new THREE.Mesh(comMarkerGeo, comMarkerMat);
        comMesh.position.set(
          link.inertial.origin.xyz.x,
          link.inertial.origin.xyz.y,
          link.inertial.origin.xyz.z
        );
        linkGroup.add(comMesh);
      } else if (isPalm) {
        // High-Fidelity Mechanical Palm Chassis
        const palmBodyGeo = new THREE.BoxGeometry(d.x, d.y, d.z);
        const palmMesh = new THREE.Mesh(palmBodyGeo, baseMaterial);
        palmMesh.castShadow = true;
        palmMesh.receiveShadow = true;
        palmMesh.position.set(0, 0, d.z / 2);
        linkGroup.add(palmMesh);

        // Palm Back Plate / Cover Shell
        const coverGeo = new THREE.BoxGeometry(d.x * 0.92, d.y * 0.3, d.z * 0.85);
        const coverMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          metalness: 0.6,
          roughness: 0.3,
        });
        const coverMesh = new THREE.Mesh(coverGeo, coverMat);
        coverMesh.position.set(0, -d.y * 0.45, d.z / 2);
        linkGroup.add(coverMesh);

        // Wrist Mount Hub (Base Flange)
        const wristHubGeo = new THREE.CylinderGeometry(0.024, 0.026, 0.015, 24);
        const wristHubMesh = new THREE.Mesh(wristHubGeo, metallicHingeMat);
        wristHubMesh.rotation.x = Math.PI / 2;
        wristHubMesh.position.set(0, 0, 0.005);
        linkGroup.add(wristHubMesh);

        // 4 Finger Mount Knuckle Brackets on top of palm
        const fingerXPositions = [-0.024, -0.008, 0.008, 0.024];
        fingerXPositions.forEach((posX) => {
          const bracketGeo = new THREE.BoxGeometry(0.012, 0.018, 0.012);
          const bracketMesh = new THREE.Mesh(bracketGeo, metallicHingeMat);
          bracketMesh.position.set(posX, 0.002, d.z);
          linkGroup.add(bracketMesh);

          // Hinge pin
          const pinGeo = new THREE.CylinderGeometry(0.0025, 0.0025, 0.016, 16);
          const pinMesh = new THREE.Mesh(pinGeo, screwPinMat);
          pinMesh.rotation.z = Math.PI / 2;
          pinMesh.position.set(posX, 0.002, d.z);
          linkGroup.add(pinMesh);
        });

        // Thumb Opposition Socket Mount
        const thumbSocketGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.018, 16);
        const thumbSocketMesh = new THREE.Mesh(thumbSocketGeo, metallicHingeMat);
        thumbSocketMesh.position.set(-0.034, 0.008, 0.025);
        linkGroup.add(thumbSocketMesh);
      } else if (isDistal) {
        // High-Fidelity Fingertip with Tactile Silicone Pad
        const fingerBoneGeo = new THREE.BoxGeometry(d.x, d.y, d.z);
        const fingerBoneMesh = new THREE.Mesh(fingerBoneGeo, baseMaterial);
        fingerBoneMesh.castShadow = true;
        fingerBoneMesh.position.set(0, 0, d.z / 2);
        linkGroup.add(fingerBoneMesh);

        // Tactile Fingertip Pad
        const padGeo = new THREE.SphereGeometry(d.x * 0.55, 16, 16);
        const padMesh = new THREE.Mesh(padGeo, siliconePadMat);
        padMesh.scale.set(1.0, 1.1, 1.2);
        padMesh.position.set(0, d.y * 0.2, d.z);
        linkGroup.add(padMesh);

        // Base knuckle hinge pin
        const hingePinGeo = new THREE.CylinderGeometry(0.0025, 0.0025, d.x * 1.3, 16);
        const hingePinMesh = new THREE.Mesh(hingePinGeo, screwPinMat);
        hingePinMesh.rotation.z = Math.PI / 2;
        hingePinMesh.position.set(0, 0, 0.002);
        linkGroup.add(hingePinMesh);
      } else if (isProximal || isIntermediate || isThumb) {
        // Articulated Phalange Linkage with Cutouts & Hinge Pins
        const fingerBoneGeo = new THREE.BoxGeometry(d.x, d.y, d.z);
        const fingerBoneMesh = new THREE.Mesh(fingerBoneGeo, baseMaterial);
        fingerBoneMesh.castShadow = true;
        fingerBoneMesh.position.set(0, 0, d.z / 2);
        linkGroup.add(fingerBoneMesh);

        // Side mechanical reinforcement ribs
        const ribGeo = new THREE.BoxGeometry(d.x * 0.6, d.y * 0.35, d.z * 0.7);
        const ribMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.4 });
        const ribMesh = new THREE.Mesh(ribGeo, ribMat);
        ribMesh.position.set(0, -d.y * 0.38, d.z / 2);
        linkGroup.add(ribMesh);

        // Bottom Hinge Pivot Pin
        const pinBottomGeo = new THREE.CylinderGeometry(0.0025, 0.0025, d.x * 1.35, 16);
        const pinBottomMesh = new THREE.Mesh(pinBottomGeo, screwPinMat);
        pinBottomMesh.rotation.z = Math.PI / 2;
        pinBottomMesh.position.set(0, 0, 0.002);
        linkGroup.add(pinBottomMesh);

        // Top Hinge Pivot Pin
        const pinTopGeo = new THREE.CylinderGeometry(0.0025, 0.0025, d.x * 1.35, 16);
        const pinTopMesh = new THREE.Mesh(pinTopGeo, screwPinMat);
        pinTopMesh.rotation.z = Math.PI / 2;
        pinTopMesh.position.set(0, 0, d.z - 0.002);
        linkGroup.add(pinTopMesh);

        // Linkage pull-rod representation (mimicking mechanical tendon pushrod)
        const pushrodGeo = new THREE.CylinderGeometry(0.0012, 0.0012, d.z * 0.9, 8);
        const pushrodMesh = new THREE.Mesh(pushrodGeo, metallicHingeMat);
        pushrodMesh.position.set(0, -d.y * 0.6, d.z / 2);
        linkGroup.add(pushrodMesh);
      } else {
        // Generic geometry fallback
        let geom: THREE.BufferGeometry;
        if (geomType === "box" && link.visual.geometry.dimensions) {
          geom = new THREE.BoxGeometry(d.x, d.y, d.z);
        } else if (geomType === "cylinder") {
          const r = link.visual.geometry.radius || 0.02;
          const l = link.visual.geometry.length || 0.06;
          geom = new THREE.CylinderGeometry(r, r, l, 24);
        } else {
          geom = new THREE.BoxGeometry(0.04, 0.04, 0.05);
        }
        const mesh = new THREE.Mesh(geom, baseMaterial);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const vo = link.visual.origin;
        mesh.position.set(vo.xyz.x, vo.xyz.y, vo.xyz.z);
        mesh.rotation.set(vo.rpy.roll, vo.rpy.pitch, vo.rpy.yaw);
        linkGroup.add(mesh);
      }
      } // End of fallback else block

      // Wireframe overlay for collision visualization
      const wireGeo = new THREE.BoxGeometry(d.x || 0.03, d.y || 0.03, d.z || 0.04);
      const wireMat = new THREE.LineBasicMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.6,
      });
      const wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(wireGeo), wireMat);
      wireframe.position.set(0, 0, (d.z || 0.04) / 2);
      wireframe.visible = showWireframe;
      linkGroup.add(wireframe);
      wireframesMapRef.current.set(link.name, wireframe);

      // Coordinate Frame (Axes Helper: Red=X, Green=Y, Blue=Z)
      const axesHelper = new THREE.AxesHelper(0.03);
      axesHelper.visible = showAxes;
      linkGroup.add(axesHelper);
      axesHelpersMapRef.current.set(link.name, axesHelper);

      return linkGroup;
    };

    // Find Root Link
    const rootLinkName = robot.rootLink || robot.links[0]?.name || "palm_base";
    const rootLink = linkMap.get(rootLinkName);
    if (!rootLink) return;

    const rootGroup = createLinkMesh(rootLink);
    scene.add(rootGroup);
    linkObjectsMapRef.current.set(rootLinkName, rootGroup);

    // Build Child Links recursively through joints
    const buildChildren = (parentName: string, parentGroup: THREE.Group) => {
      const childJoints = robot.joints.filter((j) => j.parentLink === parentName);

      for (const joint of childJoints) {
        const childLink = linkMap.get(joint.childLink);
        if (!childLink) continue;

        // Joint Transform Group
        const jointGroup = new THREE.Group();
        jointGroup.name = `joint_${joint.name}`;

        // Set joint origin relative to parent
        jointGroup.position.set(joint.origin.xyz.x, joint.origin.xyz.y, joint.origin.xyz.z);
        jointGroup.rotation.set(
          joint.origin.rpy.roll,
          joint.origin.rpy.pitch,
          joint.origin.rpy.yaw
        );

        parentGroup.add(jointGroup);
        jointObjectsMapRef.current.set(joint.name, jointGroup);

        // Child Link Group attached to joint
        const childLinkGroup = createLinkMesh(childLink);
        jointGroup.add(childLinkGroup);
        linkObjectsMapRef.current.set(childLink.name, childLinkGroup);

        // Recursively build children
        buildChildren(childLink.name, childLinkGroup);
      }
    };

    buildChildren(rootLinkName, rootGroup);

    // Adjust camera view
    if (robot.category === "robotic_arm") {
      targetLookAtRef.current.set(0, 0.15, 0.25);
      cameraAngleRef.current.radius = 1.1;
    } else {
      targetLookAtRef.current.set(0, 0.02, 0.09);
      cameraAngleRef.current.radius = 0.38;
    }
    updateCameraPosition();
  }, [robot]);

  // Apply Joint Rotations / Translations dynamically
  useEffect(() => {
    for (const joint of robot.joints) {
      const jointGroup = jointObjectsMapRef.current.get(joint.name);
      if (!jointGroup) continue;

      const val = jointValues[joint.name] ?? joint.currentValue ?? 0;
      const axis = new THREE.Vector3(joint.axis.x, joint.axis.y, joint.axis.z).normalize();

      if (joint.type === "prismatic") {
        const basePos = new THREE.Vector3(joint.origin.xyz.x, joint.origin.xyz.y, joint.origin.xyz.z);
        const trans = axis.clone().multiplyScalar(val);
        jointGroup.position.copy(basePos.clone().add(trans));
      } else if (joint.type === "revolute" || joint.type === "continuous") {
        jointGroup.rotation.set(
          joint.origin.rpy.roll,
          joint.origin.rpy.pitch,
          joint.origin.rpy.yaw
        );
        jointGroup.rotateOnAxis(axis, val);
      }
    }

    // Compute End Effector World Position
    const tipLink = robot.links.find((l) => l.name === "middle_distal") || robot.links[robot.links.length - 1];
    const tipLinkName = tipLink?.name;
    if (tipLinkName) {
      const tipGroup = linkObjectsMapRef.current.get(tipLinkName);
      if (tipGroup) {
        const worldPos = new THREE.Vector3();
        tipGroup.getWorldPosition(worldPos);
        setEndEffectorPos({
          x: Number(worldPos.x.toFixed(3)),
          y: Number(worldPos.y.toFixed(3)),
          z: Number(worldPos.z.toFixed(3)),
        });
      }
    }
  }, [jointValues, robot]);

  // Toggle Visibility helpers
  useEffect(() => {
    axesHelpersMapRef.current.forEach((helper) => (helper.visible = showAxes));
  }, [showAxes]);

  useEffect(() => {
    wireframesMapRef.current.forEach((wf) => (wf.visible = showWireframe));
  }, [showWireframe]);

  useEffect(() => {
    if (!sceneRef.current) return;
    const grid = sceneRef.current.getObjectByName("grid_helper");
    if (grid) grid.visible = showGrid;
  }, [showGrid]);

  // Mouse & Touch Orbit Event Handlers
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    isDraggingRef.current = true;
    if ('touches' in e) {
      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      previousMousePositionRef.current = { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current) return;

    let clientX, clientY, isPan = false, isOrbit = false;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      if (e.touches.length === 2) {
        isPan = true;
      } else {
        isOrbit = true;
      }
    } else {
      const mouseEvent = e as React.MouseEvent;
      clientX = mouseEvent.clientX;
      clientY = mouseEvent.clientY;
      if (mouseEvent.buttons === 2 || mouseEvent.shiftKey) isPan = true;
      if (mouseEvent.buttons === 1) isOrbit = true;
    }

    const deltaX = clientX - previousMousePositionRef.current.x;
    const deltaY = clientY - previousMousePositionRef.current.y;

    if (isOrbit) {
      // Orbit
      cameraAngleRef.current.theta -= deltaX * 0.008;
      cameraAngleRef.current.phi = Math.max(
        0.05,
        Math.min(Math.PI - 0.05, cameraAngleRef.current.phi - deltaY * 0.008)
      );
    } else if (isPan) {
      // Pan
      const panSpeed = 0.001 * cameraAngleRef.current.radius;
      targetLookAtRef.current.y += deltaY * panSpeed;
      targetLookAtRef.current.x -= deltaX * panSpeed * Math.cos(cameraAngleRef.current.theta);
    }

    previousMousePositionRef.current = { x: clientX, y: clientY };
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const setViewPreset = (view: "iso" | "front" | "top" | "side") => {
    if (view === "iso") {
      cameraAngleRef.current.theta = Math.PI / 4;
      cameraAngleRef.current.phi = Math.PI / 3;
    } else if (view === "front") {
      cameraAngleRef.current.theta = 0;
      cameraAngleRef.current.phi = Math.PI / 2;
    } else if (view === "top") {
      cameraAngleRef.current.theta = 0;
      cameraAngleRef.current.phi = 0.05;
    } else if (view === "side") {
      cameraAngleRef.current.theta = Math.PI / 2;
      cameraAngleRef.current.phi = Math.PI / 2;
    }
    updateCameraPosition();
  };

  const resetView = () => {
    targetLookAtRef.current.set(0, 0.02, 0.09);
    cameraAngleRef.current.theta = Math.PI / 4;
    cameraAngleRef.current.phi = Math.PI / 3;
    cameraAngleRef.current.radius = robot.category === "robotic_arm" ? 1.0 : 0.38;
    updateCameraPosition();
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#0A0F1D] flex flex-col ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "h-[520px] lg:h-[620px]"
      }`}
    >
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onTouchCancel={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* Robot Badge & Forward Kinematics Status */}
        <div className="pointer-events-auto flex flex-col sm:flex-row items-start sm:items-center gap-2.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-xl shadow-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-white tracking-wide">
              {robot.name}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-950/90 text-cyan-300 border border-cyan-500/40">
              {robot.dof} 自由度 (DoF)
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-400 border-l border-slate-700 pl-2.5">
            <span>中指尖 TCP:</span>
            <span className="text-cyan-300">
              X:{endEffectorPos.x} Y:{endEffectorPos.y} Z:{endEffectorPos.z}m
            </span>
          </div>
        </div>

        {/* View Tools Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-xl shadow-xl">
          <button
            onClick={() => setShowAxes(!showAxes)}
            className={`p-1.5 rounded-lg text-xs font-mono transition-colors ${
              showAxes
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="切换坐标系轴 (TF Frames RGB)"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowWireframe(!showWireframe)}
            className={`p-1.5 rounded-lg text-xs font-mono transition-colors ${
              showWireframe
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="碰撞体与线框 (Collision Hull)"
          >
            <Box className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-lg text-xs font-mono transition-colors ${
              showGrid
                ? "bg-slate-800 text-slate-200"
                : "text-slate-500 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="切换地平面网格"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-lg text-xs font-mono transition-colors ${
              autoRotate
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="自动环绕旋转"
          >
            <Rotate3d className="w-4 h-4" />
          </button>

          <button
            onClick={resetView}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="重置 3D 视角"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title={isFullscreen ? "退出全屏" : "全屏查看"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Bottom Floating Quick View Snaps */}
      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-xl shadow-xl pointer-events-auto">
        <span className="text-[10px] font-mono text-slate-400 px-1.5">视角:</span>
        <button
          onClick={() => setViewPreset("iso")}
          className="px-2 py-1 rounded-lg text-[10px] font-mono text-slate-300 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
        >
          等轴测 (ISO)
        </button>
        <button
          onClick={() => setViewPreset("front")}
          className="px-2 py-1 rounded-lg text-[10px] font-mono text-slate-300 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
        >
          正视 (Front)
        </button>
        <button
          onClick={() => setViewPreset("top")}
          className="px-2 py-1 rounded-lg text-[10px] font-mono text-slate-300 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
        >
          俯视 (Top)
        </button>
        <button
          onClick={() => setViewPreset("side")}
          className="px-2 py-1 rounded-lg text-[10px] font-mono text-slate-300 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
        >
          侧视 (Side)
        </button>
      </div>

      {/* Bottom Right Interaction Hint */}
      <div className="absolute bottom-4 right-4 hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
        <span>左键: 旋转</span>
        <span className="text-slate-600">·</span>
        <span>右键/Shift: 平移</span>
        <span className="text-slate-600">·</span>
        <span>滚轮: 缩放</span>
      </div>
    </div>
  );
};
