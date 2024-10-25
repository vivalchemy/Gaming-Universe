import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import PropTypes from 'prop-types';
import '../App.css'; // Add custom styles
import Sun from './Sun';
import Planet from './Planet';
import Asteroids from './Asteroids';
import Coin from './Coin';
import Spaceship from './Spaceship';

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
                <Suspense fallback={<div>Loading...</div>}>
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
