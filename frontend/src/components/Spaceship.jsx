import React, { Suspense, useRef, useState, useEffect } from "react";
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useGLTF } from "@react-three/drei";

const Computers = ({ isMobile }) => {
  const computer = useGLTF("/xian_spaceship/scene.gltf");

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

const Spaceship = ({ asteroidRefs, coinRefs, setGameOver, setScore }) => {
  const spaceshipRef = useRef();
  const velocity = useRef({ x: 0, y: 0 });
  const [isBurning, setIsBurning] = useState(false);

  useFrame(() => {
    spaceshipRef.current.position.x += velocity.current.x;
    spaceshipRef.current.position.y += velocity.current.y;

    spaceshipRef.current.position.x = THREE.MathUtils.clamp(spaceshipRef.current.position.x, -5, 5);
    spaceshipRef.current.position.y = THREE.MathUtils.clamp(spaceshipRef.current.position.y, -3, 3);

    // Check for collisions with asteroids
    asteroidRefs.current.forEach((asteroidRef) => {
      if (asteroidRef.current) {
        const distance = spaceshipRef.current.position.distanceTo(asteroidRef.current.position);
        if (distance < 0.5) {
          setGameOver(true); // Trigger Game Over
        }
      }
    });

    // Check for collisions with coins
    coinRefs.current.forEach((coinRef) => {
      if (coinRef.current) {
        const distance = spaceshipRef.current.position.distanceTo(coinRef.current.position);
        if (distance < 0.3) { // Collision threshold for collecting coins
          setScore((prevScore) => prevScore + 1); // Increase score
          coinRef.current.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * -20 - 10); // Move coin to a new position
        }
      }
    });
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'w':
          setIsBurning(true);
          break;
        case 'ArrowUp':
          gsap.to(velocity.current, { y: 0.1, duration: 0.1 });
          break;
        case 'ArrowDown':
          gsap.to(velocity.current, { y: -0.1, duration: 0.1 });
          break;
        case 'ArrowLeft':
          gsap.to(velocity.current, { x: -0.1, duration: 0.1 });
          break;
        case 'ArrowRight':
          gsap.to(velocity.current, { x: 0.1, duration: 0.1 });
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.key) {
        case 'w':
          setIsBurning(false);
          break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          gsap.to(velocity.current, { x: 0, y: 0, duration: 0.1 });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <group ref={spaceshipRef} position={[0, 0, 5]}>
      {/* Render the Computers component */}
      <Computers isMobile={false} /> {/* Pass appropriate props as needed */}
      {isBurning && (
        <group position={[0, -0.3, -0.5]}>
          <mesh>
            <coneGeometry args={[0.05, 0.2, 16]} />
            <meshStandardMaterial color="#FFA500" />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <coneGeometry args={[0.05, 0.2, 16]} />
            <meshStandardMaterial color="#FFA500" />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default Spaceship;

