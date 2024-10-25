import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { gsap } from 'gsap';

const PowerupTypes = {
    COIN_DOUBLER: 'coinDoubler',
    BOOSTER: 'booster',
    MAGNET: 'magnet',
    SHOOTER: 'shooter',
    SHIELD: 'shield',
    INVISIBILITY: 'invisibility'
};

const PowerupLabel = ({ type }) => {
    const label = useMemo(() => {
        switch (type) {
            case PowerupTypes.COIN_DOUBLER:
                return '2X COINS';
            case PowerupTypes.BOOSTER:
                return 'BOOST';
            case PowerupTypes.MAGNET:
                return 'MAGNET';
            case PowerupTypes.SHOOTER:
                return 'SHOOTER';
            case PowerupTypes.SHIELD:
                return 'SHIELD';
            case PowerupTypes.INVISIBILITY:
                return 'STEALTH';
            default:
                return '';
        }
    }, [type]);
    return (
        <Text
            position={[0, 0.8, 0]}
            fontSize={0.2}
            color={getPowerupColor(type)}
            anchorX="center"
            anchorY="middle"
            // Removed the font prop to use the default font
            outlineWidth={0.01}
            outlineColor="black"
        >
            {label}
        </Text>
    );
};

const PowerupVisuals = ({ type }) => {
    switch (type) {
        case PowerupTypes.COIN_DOUBLER:
            return (
                <group>
                    <mesh position={[0, 0, 0]}>
                        <torusGeometry args={[0.3, 0.1, 16, 32]} />
                        <meshStandardMaterial color="gold" />
                    </mesh>
                    <mesh position={[0.2, 0, 0]}>
                        <torusGeometry args={[0.3, 0.1, 16, 32]} />
                        <meshStandardMaterial color="gold" />
                    </mesh>
                    <PowerupLabel type={type} />
                </group>
            );
        case PowerupTypes.BOOSTER:
            return (
                <group>
                    <mesh>
                        <coneGeometry args={[0.3, 0.6, 32]} />
                        <meshStandardMaterial color="red" />
                    </mesh>
                    <mesh position={[0, -0.4, 0]} rotation={[Math.PI, 0, 0]}>
                        <coneGeometry args={[0.2, 0.3, 32]} />
                        <meshStandardMaterial color="orange" />
                    </mesh>
                    <PowerupLabel type={type} />
                </group>
            );
        case PowerupTypes.MAGNET:
            return (
                <group>
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.2, 0.2, 0.6, 32]} />
                        <meshStandardMaterial color="red" />
                    </mesh>
                    <mesh position={[0.4, 0, 0]}>
                        <boxGeometry args={[0.2, 0.4, 0.1]} />
                        <meshStandardMaterial color="silver" />
                    </mesh>
                    <mesh position={[-0.4, 0, 0]}>
                        <boxGeometry args={[0.2, 0.4, 0.1]} />
                        <meshStandardMaterial color="silver" />
                    </mesh>
                    <PowerupLabel type={type} />
                </group>
            );
        case PowerupTypes.SHOOTER:
            return (
                <group>
                    <mesh>
                        <boxGeometry args={[0.6, 0.3, 0.2]} />
                        <meshStandardMaterial color="purple" />
                    </mesh>
                    <mesh position={[0.35, 0, 0]}>
                        <cylinderGeometry args={[0.1, 0.1, 0.4, 16]} />
                        <meshStandardMaterial color="darkpurple" />
                    </mesh>
                    <PowerupLabel type={type} />
                </group>
            );
        case PowerupTypes.SHIELD:
            return (
                <group>
                    <mesh>
                        <sphereGeometry args={[0.4, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <meshStandardMaterial color="lightblue" transparent opacity={0.6} />
                    </mesh>
                    <PowerupLabel type={type} />
                </group>
            );
        case PowerupTypes.INVISIBILITY:
            return (
                <group>
                    <mesh>
                        <sphereGeometry args={[0.3, 32, 32]} />
                        <meshStandardMaterial color="white" transparent opacity={0.3} />
                    </mesh>
                    <mesh>
                        <ringGeometry args={[0.35, 0.4, 32]} />
                        <meshStandardMaterial color="cyan" transparent opacity={0.5} />
                    </mesh>
                    <PowerupLabel type={type} />
                </group>
            );
        default:
            return null;
    }
};

const Powerup = ({ type, position, onCollect }) => {
    const powerupRef = useRef();
    const startY = position[1];

    // Create a floating animation
    useFrame((state) => {
        if (powerupRef.current) {
            // Rotate the powerup
            powerupRef.current.rotation.y += 0.02;

            // Float up and down
            powerupRef.current.position.y = startY + Math.sin(state.clock.elapsedTime * 2) * 0.1;

            // Move forward
            powerupRef.current.position.z += 0.02;

            // Reset position when too far
            if (powerupRef.current.position.z > 5) {
                powerupRef.current.position.set(
                    Math.random() * 10 - 5,
                    Math.random() * 10 - 5,
                    Math.random() * -20 - 10
                );
            }
        }
    });

    // Collection animation
    const handleCollect = () => {
        if (powerupRef.current) {
            gsap.to(powerupRef.current.scale, {
                x: 0,
                y: 0,
                z: 0,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    if (onCollect) onCollect(type);
                }
            });
        }
    };

    return (
        <group
            ref={powerupRef}
            position={position}
            onClick={handleCollect}
        >
            <PowerupVisuals type={type} />
            {/* Glow effect */}
            <pointLight
                color={getPowerupColor(type)}
                intensity={0.5}
                distance={1}
            />
        </group>
    );
};

// Helper function to get powerup colors for the glow effect
const getPowerupColor = (type) => {
    switch (type) {
        case PowerupTypes.COIN_DOUBLER:
            return '#FFD700';
        case PowerupTypes.BOOSTER:
            return '#FF4444';
        case PowerupTypes.MAGNET:
            return '#FF0000';
        case PowerupTypes.SHOOTER:
            return '#800080';
        case PowerupTypes.SHIELD:
            return '#ADD8E6';
        case PowerupTypes.INVISIBILITY:
            return '#00FFFF';
        default:
            return '#FFFFFF';
    }
};

export { PowerupTypes };
export default Powerup;