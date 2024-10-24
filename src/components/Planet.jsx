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

export default Planet;