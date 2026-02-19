import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { useSelector } from "react-redux";
import { Suspense, useEffect } from "react";
import * as THREE from "three";

function Model({ url }) {
  const { scene } = useGLTF(url);
  const { wireframe_mode, material_type } = useSelector((state) => state.settings);

  const getMaterialProperties = () => {
    const baseProps = {
      color: "#ffffff",
      wireframe: wireframe_mode,
    };

    switch (material_type) {
      case "metallic":
        return { ...baseProps, metalness: 1, roughness: 0.3 };
      case "plastic":
        return { ...baseProps, metalness: 0, roughness: 0.5 };
      case "leather":
        return { ...baseProps, metalness: 0, roughness: 0.8 };
      default:
        return baseProps;
    }
  };

  useEffect(() => {
    const props = getMaterialProperties();
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          ...props,
          color: child.material.color || props.color,
        });
      }
    });
  }, [scene, wireframe_mode, material_type]);

  return <primitive object={scene} />;
}

export default function ModelViewer() {
  const { modelUrl } = useSelector((state) => state.media);
  const { backgroundColor, hdri_preset } = useSelector((state) => state.settings);

  return (
    <Canvas
      style={{ height: "500px", background: backgroundColor }}
      camera={{ position: [0, 2, 5] }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Environment preset={hdri_preset} />
      <Suspense fallback={null}>
        {modelUrl && <Model url={modelUrl} />}
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}