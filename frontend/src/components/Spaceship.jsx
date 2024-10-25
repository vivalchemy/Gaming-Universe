import { useRef, useState, useEffect } from "react";
import { useFrame } from '@react-three/fiber';
import { useGLTF } from "@react-three/drei";
import gsap from 'gsap';
import * as THREE from 'three';

const Spaceship = ({ asteroidRefs, coinRefs, setGameOver, setScore }) => {
  const spaceshipRef = useRef();
  const velocity = useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const collisionBox = useRef(new THREE.Box3());
  const tempBox = useRef(new THREE.Box3());
  
  // Load the 3D model
  const { scene } = useGLTF("/xian_spaceship/scene.gltf");

  // Function to check collisions using bounding boxes
  const checkCollision = (object1, object2, threshold = 1) => {
    if (!object1 || !object2) return false;

    // Update bounding boxes
    collisionBox.current.setFromObject(object1);
    tempBox.current.setFromObject(object2);

    // Get the centers of both boxes
    const center1 = new THREE.Vector3();
    const center2 = new THREE.Vector3();
    collisionBox.current.getCenter(center1);
    tempBox.current.getCenter(center2);

    // Calculate distance between centers
    const distance = center1.distanceTo(center2);

    // Get the average size of both objects for better threshold scaling
    const size1 = new THREE.Vector3();
    const size2 = new THREE.Vector3();
    collisionBox.current.getSize(size1);
    tempBox.current.getSize(size2);
    
    const averageSize = (
      Math.max(size1.x, size1.y, size1.z) +
      Math.max(size2.x, size2.y, size2.z)
    ) / 2;

    // Adjust threshold based on object sizes
    const adjustedThreshold = threshold * averageSize;

    return distance < adjustedThreshold;
  };

  useFrame(() => {
    if (!spaceshipRef.current) return;

    // Update position
    spaceshipRef.current.position.x += velocity.current.x;
    spaceshipRef.current.position.y += velocity.current.y;

    // Clamp position
    spaceshipRef.current.position.x = THREE.MathUtils.clamp(
      spaceshipRef.current.position.x,
      -5,
      5
    );
    spaceshipRef.current.position.y = THREE.MathUtils.clamp(
      spaceshipRef.current.position.y,
      -3,
      3
    );

    // Check asteroid collisions with improved detection
    asteroidRefs.current?.forEach((asteroidRef) => {
      if (asteroidRef.current && spaceshipRef.current) {
        if (checkCollision(spaceshipRef.current, asteroidRef.current, 0.8)) {
          setGameOver(true);
        }
      }
    });

    // Check coin collisions with improved detection
    coinRefs.current?.forEach((coinRef, index) => {
      if (coinRef.current && spaceshipRef.current) {
        if (checkCollision(spaceshipRef.current, coinRef.current, 0.5)) {
          setScore((prevScore) => prevScore + 1);
          
          // Reposition coin with some randomization
          const newPosition = new THREE.Vector3(
            Math.random() * 10 - 5,
            Math.random() * 6 - 3,
            Math.random() * -20 - 10
          );
          
          // Ensure new position isn't too close to other coins
          while (coinRefs.current.some((otherCoinRef, otherIndex) => {
            if (index === otherIndex || !otherCoinRef.current) return false;
            return newPosition.distanceTo(otherCoinRef.current.position) < 2;
          })) {
            newPosition.set(
              Math.random() * 10 - 5,
              Math.random() * 6 - 3,
              Math.random() * -20 - 10
            );
          }
          
          // Apply new position
          coinRef.current.position.copy(newPosition);
        }
      }
    });
  });

  // Key event handlers
  useEffect(() => {
    const handleKeyDown = (event) => {
      const speed = 0.15; // Slightly increased for better control
      switch (event.key) {
        case "ArrowUp":
          gsap.to(velocity.current, { y: speed, duration: 0.1 });
          break;
        case "ArrowDown":
          gsap.to(velocity.current, { y: -speed, duration: 0.1 });
          break;
        case "ArrowLeft":
          gsap.to(velocity.current, { x: -speed, duration: 0.1 });
          break;
        case "ArrowRight":
          gsap.to(velocity.current, { x: speed, duration: 0.1 });
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.key) {
        case "ArrowUp":
        case "ArrowDown":
        case "ArrowLeft":
        case "ArrowRight":
          gsap.to(velocity.current, { 
            x: 0, 
            y: 0, 
            duration: 0.2,
            ease: "power2.out" 
          });
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Mobile detection
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
    <group ref={spaceshipRef}>
      <hemisphereLight intensity={0.35} groundColor="black" />
      <directionalLight
        intensity={1.0}
        position={[5, 10, 5]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
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
        object={scene}
        scale={isMobile ? 0.55 : 0.2}
        position={isMobile ? [0, -4, -2.2] : [0, -1, 0]}
        rotation={[1, -1.6, -2]}
      />
    </group>
  );
};

export default Spaceship;