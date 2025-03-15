// Level1.jsx
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
import Powerup, { PowerupTypes } from '../Powerup';
import Spaceship from '../Spaceship';
import { useNavigate } from 'react-router-dom';

// Custom camera controller component
const CameraController = ({ isZooming, onZoomComplete }) => {
  const { camera } = useThree();

  useEffect(() => {
    if (isZooming) {
      camera.position.set(0, 15, 30);
      gsap.to(camera.position, {
        x: 0,
        y: 4.2,
        z: 6,
        duration: 3,
        ease: "power2.inOut",
        onComplete: onZoomComplete
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
  // Existing state
  const [missionStarted, setMissionStarted] = useState(false);
  const [showRules, setShowRules] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [missionComplete, setMissionComplete] = useState(false);
  const [isZooming, setIsZooming] = useState(false);

  // Powerup states
  const [activePowerups, setActivePowerups] = useState({
    coinDoubler: false,
    booster: false,
    magnet: false,
    shooter: false,
    shield: false,
    invisibility: false
  });
  const [powerupEffects, setPowerupEffects] = useState({
    speed: 1,
    coinMultiplier: 1,
    isInvulnerable: false,
    isMagnetic: false,
    hasShooter: false,
    isInvisible: false
  });

  // Refs
  const asteroidRefs = useRef(Array.from({ length: 10 }, () => useRef()));
  const coinRefs = useRef(Array.from({ length: 50 }, () => useRef()));
  const powerupRefs = useRef(Array.from({ length: Object.keys(PowerupTypes).length }, () => useRef()));
  const navigate = useNavigate();
  const audioRef = useRef(new Audio('/sounds/levels.mp3'));
  const powerupSoundRef = useRef(new Audio('/sounds/powerup.mp3')); // Add powerup sound effect

  // Distance tracking refs
  const distanceRef = useRef(1000);
  const distanceDisplayRef = useRef(1000);
  const displayUpdateTimeoutRef = useRef(null);
  const distanceElementRef = useRef(null);

  // Powerup handling
  const handlePowerupCollect = (type) => {
    // Play powerup sound
    powerupSoundRef.current.currentTime = 0;
    powerupSoundRef.current.play();

    // Update active powerups
    setActivePowerups(prev => ({
      ...prev,
      [type]: true
    }));

    // Apply powerup effects
    switch (type) {
      case PowerupTypes.COIN_DOUBLER:
        setPowerupEffects(prev => ({ ...prev, coinMultiplier: 2 }));
        break;
      case PowerupTypes.BOOSTER:
        setPowerupEffects(prev => ({ ...prev, speed: 1.5 }));
        break;
      case PowerupTypes.MAGNET:
        setPowerupEffects(prev => ({ ...prev, isMagnetic: true }));
        break;
      case PowerupTypes.SHOOTER:
        setPowerupEffects(prev => ({ ...prev, hasShooter: true }));
        break;
      case PowerupTypes.SHIELD:
        setPowerupEffects(prev => ({ ...prev, isInvulnerable: true }));
        break;
      case PowerupTypes.INVISIBILITY:
        setPowerupEffects(prev => ({ ...prev, isInvisible: true }));
        break;
      default:
        break;
    }

    // Set timeout to disable powerup
    setTimeout(() => {
      setActivePowerups(prev => ({
        ...prev,
        [type]: false
      }));

      // Reset effects
      switch (type) {
        case PowerupTypes.COIN_DOUBLER:
          setPowerupEffects(prev => ({ ...prev, coinMultiplier: 1 }));
          break;
        case PowerupTypes.BOOSTER:
          setPowerupEffects(prev => ({ ...prev, speed: 1 }));
          break;
        case PowerupTypes.MAGNET:
          setPowerupEffects(prev => ({ ...prev, isMagnetic: false }));
          break;
        case PowerupTypes.SHOOTER:
          setPowerupEffects(prev => ({ ...prev, hasShooter: false }));
          break;
        case PowerupTypes.SHIELD:
          setPowerupEffects(prev => ({ ...prev, isInvulnerable: false }));
          break;
        case PowerupTypes.INVISIBILITY:
          setPowerupEffects(prev => ({ ...prev, isInvisible: false }));
          break;
        default:
          break;
      }
    }, 10000); // 10 seconds duration
  };

  // Handle coin collection with powerup multiplier
  const handleCoinCollect = () => {
    setScore(prev => prev + powerupEffects.coinMultiplier);
  };

  // Existing useEffect for distance tracking
  useEffect(() => {
    let animationFrameId;
    let lastUpdate = performance.now();
    const updateRate = 100;

    const updateDistance = (currentTime) => {
      if (missionStarted && !gameOver && !missionComplete) {
        distanceRef.current = Math.max(0, distanceRef.current - 0.1);

        if (currentTime - lastUpdate >= updateRate) {
          distanceDisplayRef.current = Math.round(distanceRef.current);
          if (distanceElementRef.current) {
            distanceElementRef.current.textContent = `Distance to Pluto: ${distanceDisplayRef.current} km`;
          }
          lastUpdate = currentTime;

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
  }, [missionStarted, gameOver, missionComplete, navigate]);

  // Audio handling
  useEffect(() => {
    if (missionStarted) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }

    return () => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    };
  }, [missionStarted]);

  const handleBeginMission = () => {
    setIsZooming(true);
  };

  const handleZoomComplete = () => {
    setIsZooming(false);
    setMissionStarted(true);
    setShowRules(false);
  };

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
                powerupRefs={powerupRefs}
                setGameOver={setGameOver}
                setScore={setScore}
                powerupEffects={powerupEffects}
              />

              {/* Coins */}
              {coinRefs.current.map((_, index) => (
                <Coin
                  key={index}
                  position={[
                    Math.random() * 10 - 5,
                    Math.random() * 10 - 5,
                    Math.random() * -20 - 10
                  ]}
                  onCollect={handleCoinCollect}
                />
              ))}

              {/* Powerups */}
              {Object.values(PowerupTypes).map((type, index) => (
                <Powerup
                  key={type}
                  type={type}
                  position={[
                    Math.random() * 10 - 5,
                    Math.random() * 10 - 5,
                    Math.random() * -20 - 10
                  ]}
                  onCollect={() => handlePowerupCollect(type)}
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

      {/* HUD Elements */}
      {missionStarted && !gameOver && !missionComplete && (
        <>
          {/* Distance indicator */}
          <div
            ref={distanceElementRef}
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded"
          >
            Distance to Pluto: {distanceDisplayRef.current} km
          </div>

          {/* Active powerups display */}
          <div className="absolute top-16 right-4 text-white bg-black bg-opacity-50 p-2 rounded">
            <h3 className="text-sm font-bold mb-1">Active Powerups:</h3>
            <div className="flex flex-col gap-1">
              {Object.entries(activePowerups).map(([type, isActive]) => (
                isActive && (
                  <div key={type} className="text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Score display */}
          <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 p-2 rounded">
            Score: {score}
          </div>
        </>
      )}

      {/* Game state UI */}
      {!missionStarted && !isZooming && (
        <div className="intro-text absolute top-0 left-0 w-full h-full flex items-center justify-center z-10">
          <div className="bg-black bg-opacity-50 p-8 rounded-lg text-center">
            <h1 className="text-5xl font-bold mb-8 text-white">Cosmic Journey</h1>
            <div className="flex flex-col space-y-4">
              <button
                className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition-colors"
                onClick={handleBeginMission}
              >
                Begin Mission
              </button>
              <button
                className="bg-purple-500 text-white px-6 py-3 rounded hover:bg-purple-600 transition-colors"
                onClick={() => { navigate("/store") }}
              >
                Go to Space Store
              </button>
            </div>
          </div>
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

// PropTypes
Level1.propTypes = {
  position: PropTypes.array,
  color: PropTypes.string,
  speed: PropTypes.number,
  hasRings: PropTypes.bool,
};

CameraController.propTypes = {
  isZooming: PropTypes.bool.isRequired,
  onZoomComplete: PropTypes.func.isRequired,
};

export default Level1;
