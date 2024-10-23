import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import PropTypes from 'prop-types';
import '../App.css'; // Add custom styles

// Sun Component (center of attention)
const Sun = ({ isGrowing, isGameOver }) => {
    const sunRef = useRef();
    const maxScale = 3; // Define a maximum scale for the sun

    useFrame(({ clock }) => {
        if (isGrowing && !isGameOver) {
            const scale = 1 + Math.min(clock.getElapsedTime() * 0.1, maxScale - 1);
            sunRef.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <mesh ref={sunRef}>
            <sphereGeometry args={[0.5, 64, 64]} />
            <meshStandardMaterial emissive="#FFCC00" emissiveIntensity={1} />
        </mesh>
    );
};

// Planet Component (hover effect for interactivity)
const Planet = ({ position, color, speed, hasRings }) => {
    const planetRef = useRef();
    const ringRef = useRef();
    const maxScale = 3;

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime() * speed;
        planetRef.current.position.x = position[0] * Math.cos(t);
        planetRef.current.position.z = position[0] * Math.sin(t);
        planetRef.current.rotation.y += 0.01;

        if (hasRings) {
            const scale = 1 + Math.min(clock.getElapsedTime() * 0.1, maxScale - 1);
            ringRef.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <group>
            {hasRings && (
                <mesh ref={ringRef}>
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
const Asteroids = ({ asteroidRefs }) => {
    useFrame(() => {
        asteroidRefs.current.forEach((ref) => {
            if (ref.current) {
                ref.current.rotation.x += 0.01;
                ref.current.rotation.y += 0.01;
                ref.current.position.z += 0.04; // Move toward the camera

                if (ref.current.position.z > 5) {
                    ref.current.position.z = Math.random() * -20 - 10; // Reset further away in space
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
                    position={[Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * -20 - 10]} // Start further away
                >
                    <sphereGeometry args={[0.4, 8, 8]} />
                    <meshStandardMaterial color="#aaa" />
                </mesh>
            ))}
        </group>
    );
};

// Coin Component for collecting
const Coin = ({ position, onCollect }) => {
    const coinRef = useRef();

    useFrame(() => {
        coinRef.current.rotation.y += 0.05; // Rotate the coin
        coinRef.current.position.z += 0.02; // Move coin forward slowly
        // Reset position when the coin moves too far
        if (coinRef.current.position.z > 5) {
            coinRef.current.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * -20 - 10);
        }
    });

    return (
        <mesh
            ref={coinRef}
            position={position}
            onClick={onCollect}

        // Trigger onCollect when clicked
        >
            <torusGeometry args={[0.2, 0.05, 16, 100]} />
            <meshStandardMaterial color="gold" />
        </mesh>
    );
};

// Spaceship Component with interactivity and collision detection
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

// Hero Component (main game area)
const Hero = () => {
    const cameraRef = useRef();
    const [missionStarted, setMissionStarted] = useState(false); // State to track if the mission has started
    const [showRules, setShowRules] = useState(true); // State to toggle rules visibility
    const [gameOver, setGameOver] = useState(false); // State to track if the game is over
    const [score, setScore] = useState(0); // State to track the score
    const asteroidRefs = useRef(Array.from({ length: 10 }, () => useRef())); // Store asteroid refs
    const coinRefs = useRef(Array.from({ length: 5 }, () => useRef())); // Store coin refs

    useEffect(() => {
        gsap.fromTo(
            cameraRef.current.position,
            { x: 0, y: 0, z: 20 },
            { x: 0, y: 0, z: 8, duration: 2, ease: "power2.inOut" }
        );
    }, []);

    const handleBeginMission = () => {
        setMissionStarted(true); // Hide all text
        setShowRules(!showRules);
    };

    return (
        <div className="hero-container h-screen relative bg-space-background">
            <Canvas camera={{ position: [0, 0, 8], fov: 50 }} ref={cameraRef}>
                <ambientLight intensity={0.5} />
                <pointLight position={[5, 5, 5]} />
                <Stars />
                <Suspense fallback={null}>
                    <Sun isGrowing={missionStarted} isGameOver={gameOver} />
                    <Asteroids asteroidRefs={asteroidRefs} />
                    {missionStarted && !gameOver && (
                        <>
                            <Spaceship asteroidRefs={asteroidRefs} coinRefs={coinRefs} setGameOver={setGameOver} setScore={setScore} />
                            {coinRefs.current.map((_, index) => (
                                <Coin
                                    key={index}
                                    position={[Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * -20 - 10]}
                                    onCollect={() => {
                                        setCoinsCollected((prev) => prev + 1); // Increase coins collected
                                        setScore((prevScore) => prevScore + 1); // Increase score
                                    }}
                                />
                            ))}
                        </>
                    )}
                </Suspense>
                <OrbitControls />
            </Canvas>
            {!missionStarted && (
                <div className="intro-text absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col z-10 text-white">
                    <h1 className="text-5xl font-bold mb-5">NASA Space Mission</h1>
                    <button
                        className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
                        onClick={handleBeginMission}
                    >
                        Begin Mission
                    </button>
                </div>
            )}

            {missionStarted && gameOver && (
                <div className="game-over absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col z-10 text-white">
                    <h1 className="text-5xl font-bold mb-5">Game Over</h1>
                    <p className="text-2xl mb-5">Your Score: {score}</p>
                    <button
                        className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
};

// Prop Types for validation
Planet.propTypes = {
    position: PropTypes.array.isRequired,
    color: PropTypes.string.isRequired,
    speed: PropTypes.number.isRequired,
    hasRings: PropTypes.bool.isRequired,
};

Coin.propTypes = {
    position: PropTypes.array.isRequired,
    onCollect: PropTypes.func.isRequired,
};

// Default export
export default Hero;
