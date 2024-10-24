import { useFrame } from '@react-three/fiber';

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

export default Asteroids;