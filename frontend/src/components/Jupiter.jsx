import React, { useEffect, useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

const Jupiter = ({ isGrowing, isGameOver }) => {
  const [isMobile, setIsMobile] = useState(false);
  const maxScale = 3;
  const modelRef = useRef();
  const computer = useGLTF("./jupiter/scene.gltf");

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

  useFrame(({ clock }) => {
    if (modelRef.current && isGrowing && !isGameOver) {
      const scale = 1 + Math.min(clock.getElapsedTime() * 0.1, maxScale - 1);
      modelRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={modelRef}>
      <hemisphereLight intensity={0.35} groundColor="black" />
      <directionalLight
        intensity={1.0}
        position={[5, 10, 5]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        castShadow
      />
      <spotLight
        position={[-20, 50, 10]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        castShadow
        shadow-mapSize={1024}
      />
      <pointLight intensity={1} />
      <primitive
        object={computer.scene}
        scale={isMobile ? 1.5 : 0.15}
        position={isMobile ? [0, -2, -2.2] : [0, -3, -60]}
        rotation={[-0.01, -0.2, -0.1]}
      />
    </mesh>
  );
};

export default Jupiter;