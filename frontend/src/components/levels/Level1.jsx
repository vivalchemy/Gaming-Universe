import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import gsap from 'gsap';
import PropTypes from 'prop-types';
import '../../App.css';
import Pluto from '../Pluto';
import Planet from '../Planet';
import Asteroids from '../Asteroids';
import Coin from '../Coin';
import Spaceship from '../Spaceship';

const CanvasLoader = () => {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="#ffffff" wireframe />
    </mesh>
  );
};

const Level1 = () => {
  const cameraRef = useRef();
  const [missionStarted, setMissionStarted] = useState(false);
  const [showRules, setShowRules] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(1000); // Initial distance to Pluto
  const [missionComplete, setMissionComplete] = useState(false);
  const asteroidRefs = useRef(Array.from({ length: 10 }, () => useRef()));
  const coinRefs = useRef(Array.from({ length: 50 }, () => useRef()));
  
  // Distance reduction effect
  useEffect(() => {
    let distanceInterval;
    if (missionStarted && !gameOver && !missionComplete) {
      distanceInterval = setInterval(() => {
        setDistance((prevDistance) => {
          const newDistance = prevDistance - 1;
          if (newDistance <= 0) {
            clearInterval(distanceInterval);
            setMissionComplete(true);
            return 0;
          }
          return newDistance;
        });
      }, 100); // Adjust speed by changing interval
    }
    return () => clearInterval(distanceInterval);
  }, [missionStarted, gameOver, missionComplete]);

  useEffect(() => {
    if (cameraRef.current) {
      gsap.fromTo(
        cameraRef.current.position,
        { x: 0, y: 0, z: 20 },
        { x: 0, y: 0, z: 8, duration: 2, ease: "power2.inOut" }
      );
    }
  }, []);

  const handleBeginMission = () => {
    setMissionStarted(true);
    setShowRules(false);
  };

  // Calculate scale factor based on distance
  const getPlutoScale = () => {
    // Start from scale 0.5 and grow to 2.0 as distance decreases
    const minScale = 0.5;
    const maxScale = 2.0;
    const scale = minScale + (maxScale - minScale) * (1 - distance / 1000);
    return Math.min(maxScale, Math.max(minScale, scale));
  };

  return (
    <div className="hero-container h-screen relative bg-space-background">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={<CanvasLoader />}>
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} />
          <Stars />
          
          <Pluto 
            isGrowing={missionStarted} 
            isGameOver={gameOver}
            scale={getPlutoScale()} 
          />
          <Asteroids asteroidRefs={asteroidRefs} />
          
          {missionStarted && !gameOver && !missionComplete && (
            <>
              <Spaceship
                asteroidRefs={asteroidRefs}
                coinRefs={coinRefs}
                setGameOver={setGameOver}
                setScore={setScore}
              />
              {coinRefs.current.map((_, index) => (
                <Coin
                  key={index}
                  position={[
                    Math.random() * 10 - 5,
                    Math.random() * 10 - 5,
                    Math.random() * -20 - 10
                  ]}
                  onCollect={() => {
                    setScore((prevScore) => prevScore + 1);
                  }}
                />
              ))}
            </>
          )}
          
          <OrbitControls
            enableZoom={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>

      {/* Distance indicator */}
      {missionStarted && !gameOver && !missionComplete && (
        <div className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded">
          Distance to Pluto: {distance} km
        </div>
      )}

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

      {missionComplete && (
        <div className="mission-complete absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col z-10 text-white">
          <h1 className="text-5xl font-bold mb-5">Mission Complete!</h1>
          <p className="text-2xl mb-5">Successfully reached Pluto</p>
          <p className="text-xl mb-5">Final Score: {score}</p>
          <button
            className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600"
            onClick={() => window.location.reload()}
          >
            Play Again
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
  hasRings: PropTypes.bool.isRequired,
};

Coin.propTypes = {
  position: PropTypes.array.isRequired,
  onCollect: PropTypes.func.isRequired,
};

export default Level1;