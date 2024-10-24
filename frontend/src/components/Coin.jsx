import { useRef } from "react";
import { useFrame } from '@react-three/fiber';

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

export default Coin