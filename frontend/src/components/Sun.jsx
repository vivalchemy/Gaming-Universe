import React, {useRef} from 'react'
import { useFrame } from '@react-three/fiber';

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

export default Sun