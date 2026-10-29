const fs = require('fs');
let content = fs.readFileSync('src/components/GearGenerator/GearPreview.tsx', 'utf8');

const oldComponent = `const GearPairMesh: React.FC<{ params: GearParams }> = ({ params }) => {
  const driverRef = useRef<THREE.Mesh>(null);
  const drivenRef = useRef<THREE.Mesh>(null);
  const { mt, centerDistance } = useMemo(() => calculateGearProperties(params), [params]);

  // Generate shapes (Visual approximation)
  const shape1 = useMemo(() => createSimplifiedGearShape(params.z1, mt), [params.z1, mt]);
  const shape2 = useMemo(() => createSimplifiedGearShape(params.z2, mt), [params.z2, mt]);

  const extrudeSettings1 = useMemo(() => ({
    depth: Math.max(1, params.b1),
    bevelEnabled: false,
    curveSegments: 12,
  }), [params.b1]);

  const extrudeSettings2 = useMemo(() => ({
    depth: Math.max(1, params.b2),
    bevelEnabled: false,
    curveSegments: 12,
  }), [params.b2]);
  
  const matColor = GEAR_MATERIALS[params.materialId]?.color || "#64748b";

  // Animation frame for spinning gears
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const speed = 1.0; // rad/s for driver
    
    if (driverRef.current && drivenRef.current) {
      // Driver rotates
      const driverAngle = time * speed;
      driverRef.current.rotation.z = driverAngle;

      // Driven rotates in opposite direction, ratio = Z1/Z2
      const ratio = params.z1 / Math.max(1, params.z2);
      const drivenAngle = -driverAngle * ratio;
      
      // Phase alignment so teeth interlock properly (180 deg + half tooth pitch offset)
      const phaseOffset = Math.PI + (Math.PI / Math.max(1, params.z2));
      drivenRef.current.rotation.z = drivenAngle + phaseOffset;
    }
  });

  return (
    <group position={[-centerDistance / 2, 0, 0]}>
      {/* Driver Gear */}
      <mesh ref={driverRef} position={[0, 0, -params.b1 / 2]}>
        <extrudeGeometry args={[shape1, extrudeSettings1]} />
        <meshStandardMaterial color={matColor} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Driven Gear */}
      <mesh ref={drivenRef} position={[centerDistance, 0, -params.b2 / 2]}>
        <extrudeGeometry args={[shape2, extrudeSettings2]} />
        <meshStandardMaterial color={matColor} metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
};`;

const newComponent = `const GearPairMesh: React.FC<{ params: GearParams }> = ({ params }) => {
  const driverRef = useRef<THREE.Mesh>(null);
  const drivenRef = useRef<THREE.Mesh>(null);
  const { mt, centerDistance } = useMemo(() => calculateGearProperties(params), [params]);
  
  const matColor = GEAR_MATERIALS[params.materialId]?.color || "#64748b";

  const [geometries, setGeometries] = React.useState<{geom1: THREE.ExtrudeGeometry | null, geom2: THREE.ExtrudeGeometry | null}>({ geom1: null, geom2: null });

  React.useEffect(() => {
    const shape1 = createSimplifiedGearShape(params.z1, mt);
    const shape2 = createSimplifiedGearShape(params.z2, mt);

    const extrudeSettings1 = {
      depth: Math.max(1, params.b1),
      bevelEnabled: false,
      curveSegments: 12,
    };

    const extrudeSettings2 = {
      depth: Math.max(1, params.b2),
      bevelEnabled: false,
      curveSegments: 12,
    };

    const newGeom1 = new THREE.ExtrudeGeometry(shape1, extrudeSettings1);
    const newGeom2 = new THREE.ExtrudeGeometry(shape2, extrudeSettings2);

    setGeometries(prev => {
      if (prev.geom1) prev.geom1.dispose();
      if (prev.geom2) prev.geom2.dispose();
      return { geom1: newGeom1, geom2: newGeom2 };
    });

    return () => {
      // We don't dispose on unmount here to avoid React Strict Mode double-invoke issues
      // The geometry will be disposed on next update
    };
  }, [params.z1, params.z2, params.b1, params.b2, mt]);

  React.useEffect(() => {
    return () => {
      // Dispose on final unmount
      if (geometries.geom1) geometries.geom1.dispose();
      if (geometries.geom2) geometries.geom2.dispose();
    }
  }, [geometries]);

  // Animation frame for spinning gears
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const speed = 1.0; // rad/s for driver
    
    if (driverRef.current && drivenRef.current) {
      // Driver rotates
      const driverAngle = time * speed;
      driverRef.current.rotation.z = driverAngle;

      // Driven rotates in opposite direction, ratio = Z1/Z2
      const ratio = params.z1 / Math.max(1, params.z2);
      const drivenAngle = -driverAngle * ratio;
      
      // Phase alignment so teeth interlock properly (180 deg + half tooth pitch offset)
      const phaseOffset = Math.PI + (Math.PI / Math.max(1, params.z2));
      drivenRef.current.rotation.z = drivenAngle + phaseOffset;
    }
  });

  if (!geometries.geom1 || !geometries.geom2) return null;

  return (
    <group position={[-centerDistance / 2, 0, 0]}>
      {/* Driver Gear */}
      <mesh ref={driverRef} position={[0, 0, -params.b1 / 2]} geometry={geometries.geom1}>
        <meshStandardMaterial color={matColor} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Driven Gear */}
      <mesh ref={drivenRef} position={[centerDistance, 0, -params.b2 / 2]} geometry={geometries.geom2}>
        <meshStandardMaterial color={matColor} metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
};`;

content = content.replace(oldComponent, newComponent);
fs.writeFileSync('src/components/GearGenerator/GearPreview.tsx', content);
