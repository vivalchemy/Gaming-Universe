import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import PropTypes from 'prop-types';
import '../App.css'; // Add custom styles

// Sun Component (center of attention)
const Sun = () => (
  <mesh>
    <sphereGeometry args={[1.5, 32, 32]} />
    <meshStandardMaterial emissive="#FFCC00" emissiveIntensity={1.5} />
  </mesh>
);

// Planet Component (hover effect for interactivity)
const Planet = ({ position, color, speed, hasRings }) => {
  const planetRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    planetRef.current.position.x = position[0] * Math.cos(t);
    planetRef.current.position.z = position[0] * Math.sin(t);
    planetRef.current.rotation.y += 0.01;
  });

  return (
    <group>
      {hasRings && (
        <mesh>
          <ringGeometry args={[1.8, 2, 32]} />
          <meshStandardMaterial color="#FFA500" side={THREE.DoubleSide} />
        </mesh>
      )}
      <mesh ref={planetRef} position={[position[0], 0, position[1]]} scale={1.2}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
};

// Asteroids Component
const Asteroids = () => {
  const asteroidRefs = useRef(Array.from({ length: 10 }, () => useRef()));

  useFrame(() => {
    asteroidRefs.current.forEach((ref) => {
      if (ref.current) {
        ref.current.rotation.x += 0.01;
        ref.current.rotation.y += 0.01;
        ref.current.position.z -= 0.05;

        if (ref.current.position.z < -10) {
          ref.current.position.z = Math.random() * 20 + 10;
          ref.current.position.x = Math.random() * 10 - 5;
          ref.current.position.y = Math.random() * 10 - 5;
        }
      }
    });
  });

  return (
    <group>
      {asteroidRefs.current.map((_, i) => (
        <mesh
          key={i}
          ref={asteroidRefs.current[i]}
          position={[Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 20 + 10]}
        >
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#aaa" />
        </mesh>
      ))}
    </group>
  );
};

// Spaceship Component with interactivity
const Spaceship = () => {
  const spaceshipRef = useRef();
  const velocity = useRef({ x: 0, y: 0 });
  const [isBurning, setIsBurning] = useState(false);

  useFrame(() => {
    spaceshipRef.current.position.x += velocity.current.x;
    spaceshipRef.current.position.y += velocity.current.y;

    spaceshipRef.current.position.x = THREE.MathUtils.clamp(spaceshipRef.current.position.x, -5, 5);
    spaceshipRef.current.position.y = THREE.MathUtils.clamp(spaceshipRef.current.position.y, -3, 3);
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
      <mesh>
        <boxGeometry args={[0.4, 0.2, 0.8]} />
        <meshStandardMaterial color="#FF5733" />
      </mesh>
      <mesh position={[-0.3, 0, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="#FF5733" />
      </mesh>
      <mesh position={[0.3, 0, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="#FF5733" />
      </mesh>
      <mesh position={[0, 0, -0.5]}>
        <coneGeometry args={[0.1, 0.5, 16]} />
        <meshStandardMaterial color="#FF5733" />
      </mesh>
      {/* Burning fuel effect */}
      {isBurning && (
        <group position={[0, -0.3, -0.5]}>
          <mesh>
            <coneGeometry args={[0.1, 0.3, 16]} />
            <meshStandardMaterial color="orange" transparent opacity={0.6} />
          </mesh>
        </group>
      )}
    </group>
  );
};

// Main NASA-Themed Hero Section
const Hero = () => {
  const cameraRef = useRef();
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      cameraRef.current.position,
      { x: 0, y: 0, z: 20 },
      { x: 0, y: 0, z: 8, duration: 2, ease: "power2.inOut" }
    );
  }, []);

  return (
    <div className="hero-container h-screen relative bg-space-background"> {/* Custom NASA background */}
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} ref={cameraRef}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} />
        <Stars />
        <Suspense fallback={null}>
          <Sun />
          <Planet position={[2, 0]} color="blue" speed={0.5} />
          <Planet position={[3.5, 0]} color="red" speed={0.8} hasRings />
          <Planet position={[1, 0]} color="green" speed={0.4} />
          <Asteroids />
          <Spaceship />
        </Suspense>
        <OrbitControls />
      </Canvas>

      {/* Heading with dynamic animations */}
      <div className="absolute text-center top-1/3 w-full">
        <div className="bg-black bg-opacity-50 rounded-lg"> {/* Dimmed background */}
          <h1 className="text-6xl font-bold text-white animate-fade-in">
            🚀 Explore the Universe 🌌
          </h1>
          <p className="text-lg text-white mt-4 animate-slide-up">
            Embark on a thrilling journey through the stars ✨ and beyond the unknown 🌠
          </p>
        </div>
        <button
          className="mt-8 px-6 py-3 text-lg bg-blue-500 hover:bg-blue-700 text-white font-semibold rounded-lg animate-bounce"
          onClick={() => setShowRules(!showRules)}
        >
          {showRules ? "🚫 Close" : "🌟 Begin Mission"}
        </button>
      </div>

      {/* Overlay for mission rules */}
      {showRules && (
        <div className="absolute bottom-16 left-1/4 right-1/4 p-8 bg-black bg-opacity-80 rounded-lg shadow-lg">
          <h2 className="text-2xl text-white mb-4">Mission Control Guidelines</h2>
          <p className="text-white">
            Use the arrow keys to steer the spaceship. Avoid asteroids and navigate through planets to reach your destination.
          </p>
          <button
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-700 text-white font-semibold rounded-lg"
            onClick={() => setShowRules(false)}
          >
            Got it!
          </button>
        </div>
      )}
    </div>
  );
};

Planet.propTypes = {
  position: PropTypes.array.isRequired,
  color: PropTypes.string.isRequired,
  speed: PropTypes.number.isRequired,
  hasRings: PropTypes.bool,
};

export default Hero;
