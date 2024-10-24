import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import CanvasLoader from "../3d/Loader";

const Computers = ({ isMobile }) => {
  const computer = useGLTF("./xian_spaceship/scene.gltf");

  return (
    <mesh>
      {/* Adjusting hemisphere light for softer ambient light */}
      <hemisphereLight intensity={0.35} groundColor='black' />
      
      {/* Adding a directional light for more direct lighting */}
      <directionalLight 
        intensity={1.0} 
        position={[5, 10, 5]} 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024}
        castShadow
      />

      {/* Adding spot light for highlights */}
      <spotLight
        position={[-20, 50, 10]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        castShadow
        shadow-mapSize={1024}
      />

      <pointLight intensity={1} />

      {/* Original GLTF primitive */}
      <primitive
        object={computer.scene}
        scale={isMobile ? 0.55 : 0.6}
        position={isMobile ? [0, -4, -2.2] : [-2, -1, 0]}
        rotation={[-0.01, -0.2, -0.1]}
      />
    </mesh>
  );
};

const Spaceship_Model = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 500px)");

    setIsMobile(mediaQuery.matches);

    const handleMediaQueryChange = (event) => {
      setIsMobile(event.matches);
    };

    mediaQuery.addEventListener("change", handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden">
      <Canvas
        frameloop='demand'
        shadows
        dpr={[1, 2]}
        camera={{ position: [20, 3, 5], fov: 50 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={<CanvasLoader />}>
          <OrbitControls
            enableZoom={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
          <Computers isMobile={isMobile} />
        </Suspense>

        <Preload all />
      </Canvas>
    </div>
  );
};

export default Spaceship_Model;
