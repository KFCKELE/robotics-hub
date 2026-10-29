const fs = require('fs');
let content = fs.readFileSync('src/components/HeatsinkGenerator/HeatsinkPreview.tsx', 'utf8');

const oldMeshComp = `const HeatsinkMesh: React.FC<{ params: HeatsinkParams; result: HeatsinkResult }> = ({ params, result }) => {
  const meshGroup = React.useMemo(() => {
    return generateHeatsinkMesh(params, result);
  }, [params, result]);

  // Clean up on unmount or when meshGroup changes
  useEffect(() => {
    return () => {
      if (meshGroup) {
        meshGroup.traverse((child: any) => {
          if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((m: any) => m.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
    };
  }, [meshGroup]);

  return <primitive object={meshGroup} />;
};`;

const newMeshComp = `const HeatsinkMesh: React.FC<{ params: HeatsinkParams; result: HeatsinkResult }> = ({ params, result }) => {
  const [meshGroup, setMeshGroup] = useState<THREE.Group | null>(null);

  useEffect(() => {
    const newGroup = generateHeatsinkMesh(params, result);
    setMeshGroup(newGroup);

    return () => {
      if (newGroup) {
        newGroup.traverse((child: any) => {
          if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((m: any) => m.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
    };
  }, [params, result]);

  if (!meshGroup) return null;
  return <primitive object={meshGroup} />;
};`;

content = content.replace(oldMeshComp, newMeshComp);
fs.writeFileSync('src/components/HeatsinkGenerator/HeatsinkPreview.tsx', content);
