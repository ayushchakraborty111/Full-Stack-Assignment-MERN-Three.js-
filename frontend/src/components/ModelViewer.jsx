import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useSelector } from "react-redux";

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export default function ModelViewer() {
  const { modelUrl } = useSelector((state) => state.media);
  const { backgroundColor } = useSelector((state) => state.settings);

  return (
    <Canvas
      style={{ height: "500px", background: backgroundColor }}
      camera={{ position: [0, 2, 5] }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      {modelUrl && <Model url={modelUrl} />}
      <OrbitControls />
    </Canvas>
  );
}