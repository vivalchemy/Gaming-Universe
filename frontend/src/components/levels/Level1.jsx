import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import gsap from 'gsap';
import PropTypes from 'prop-types';
import '../../App.css';
import Pluto from '../Pluto';
import Planet from '../Planet';
import Asteroids from '../Asteroids';
import Coin from '../Coin';
import Spaceship from '../Spaceship';
import { useNavigate } from 'react-router-dom';

// Custom camera controller component
const CameraController = ({ isZooming, onZoomComplete }) => {
  const { camera } = useThree();

  useEffect(() => {
    if (isZooming) {
      // Start from a more distant and elevated position
      camera.position.set(0, 15, 30);

      // Create a smooth cinematic zoom
      gsap.to(camera.position, {
        x: 0,
        y: 4.2, // Slight elevation for better game view
        z: 6,
        duration: 3,
        ease: "power2.inOut",
        onComplete: () => {
          onZoomComplete();
        }
      });
    }
  }, [isZooming, camera, onZoomComplete]);

  return null;
};

const CanvasLoader = () => {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="#ffffff" wireframe />
    </mesh>
  );
};

const Level1 = () => {
  const [missionStarted, setMissionStarted] = useState(false);
  const [showRules, setShowRules] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [missionComplete, setMissionComplete] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const asteroidRefs = useRef(Array.from({ length: 10 }, () => useRef()));
  const coinRefs = useRef(Array.from({ length: 50 }, () => useRef()));
  const navigate = useNavigate();
  const audioRef = useRef(new Audio('/sounds/levels.mp3')); // Load the background music
  
  // Use refs for distance tracking to prevent re-renders
  const distanceRef = useRef(100);
  const distanceDisplayRef = useRef(100);
  const displayUpdateTimeoutRef = useRef(null);
  const distanceElementRef = useRef(null);

  // Distance reduction effect with RAF
  useEffect(() => {
    let animationFrameId;
    let lastUpdate = performance.now();
    const updateRate = 100; // Update visual display every 100ms

    const updateDistance = (currentTime) => {
      if (missionStarted && !gameOver && !missionComplete) {
        // Update internal distance
        distanceRef.current = Math.max(0, distanceRef.current - 0.1);

        // Update visual display less frequently
        if (currentTime - lastUpdate >= updateRate) {
          distanceDisplayRef.current = Math.round(distanceRef.current);
          if (distanceElementRef.current) {
            distanceElementRef.current.textContent = `Distance to Pluto: ${distanceDisplayRef.current} km`;
          }
          lastUpdate = currentTime;

          // Check for mission complete
          if (distanceRef.current <= 0) {
            setMissionComplete(true);
            navigate("/");
          }
        }

        animationFrameId = requestAnimationFrame(updateDistance);
      }
    };

    if (missionStarted && !gameOver && !missionComplete) {
      animationFrameId = requestAnimationFrame(updateDistance);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (displayUpdateTimeoutRef.current) {
        clearTimeout(displayUpdateTimeoutRef.current);
      }
    };
  }, [missionStarted, gameOver, missionComplete]);

  useEffect(() => {
    if (missionStarted) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [missionStarted]);

  const handleBeginMission = () => {
    setIsZooming(true);
  };

  const handleZoomComplete = () => {
    setIsZooming(false);
    setMissionStarted(true);
    setShowRules(false);
  };

  // Calculate scale factor based on distance
  const getPlutoScale = () => {
    const minScale = 0.5;
    const maxScale = 2.0;
    const scale = minScale + (maxScale - minScale) * (1 - distanceRef.current / 1000);
    return Math.min(maxScale, Math.max(minScale, scale));
  };

  return (
    <div className="hero-container h-screen relative bg-space-background">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 15, 30], fov: 60 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={<CanvasLoader />}>
          <CameraController
            isZooming={isZooming}
            onZoomComplete={handleZoomComplete}
          />
          
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} />
          <Stars />
          
          <Pluto 
            isGrowing={missionStarted} 
            isGameOver={gameOver}
            scale={getPlutoScale()} 
          />
          <Asteroids asteroidRefs={asteroidRefs} />
          
          {(missionStarted || isZooming) && !gameOver && !missionComplete && (
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
        <div 
          ref={distanceElementRef}
          className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded"
        >
          Distance to Pluto: {distanceDisplayRef.current} km
        </div>
      )}

      {!missionStarted && !isZooming && (
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