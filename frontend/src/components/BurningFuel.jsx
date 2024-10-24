import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useFrame } from '@react-three/fiber';

const BurningFuel = ({ isActive }) => {
  const flameRefs = useRef([]);

  // Use useFrame to create an animation
  useFrame(() => {
    if (isActive) {
      flameRefs.current.forEach((flame, index) => {
        if (flame) {
          // Animate the flames with a scaling and opacity effect
          const scale = 1 + Math.sin(Date.now() * 0.002 + index) * 0.15; // Scaling animation
          const opacity = 0.8 + Math.sin(Date.now() * 0.002 + index) * 0.4; // Adjusted opacity for more vibrancy
          flame.scale.set(scale, scale, scale);
          flame.material.opacity = opacity; // Update opacity
        }
      });
    }
  });

  return (
    <group>
      {isActive && (
        <>
          <mesh ref={(el) => (flameRefs.current[0] = el)} position={[0, 0, -0.6]}>
            <coneGeometry args={[9, 0.6, 16]} /> {/* Increased radius and height */}
            <meshStandardMaterial color="orange" opacity={0.9} />
          </mesh>
          <mesh ref={(el) => (flameRefs.current[1] = el)} position={[0, 0, -0.4]}>
            <coneGeometry args={[9, 0.4, 16]} /> {/* Increased radius and height */}
            <meshStandardMaterial color="yellow" opacity={0.85} />
          </mesh>
          <mesh ref={(el) => (flameRefs.current[2] = el)} position={[0, 0, -0.2]}>
            <coneGeometry args={[9, 0.25, 16]} /> {/* Increased radius and height */}
            <meshStandardMaterial color="red" opacity={0.7} />
          </mesh>
        </>
      )}
    </group>
  );
};

// Prop validation
BurningFuel.propTypes = {
  isActive: PropTypes.bool.isRequired,
};

export default BurningFuel;
