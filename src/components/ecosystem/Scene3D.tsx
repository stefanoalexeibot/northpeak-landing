"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
    Float,
    PerspectiveCamera,
    Environment,
    ContactShadows,
    Html
} from "@react-three/drei";
import * as THREE from "three";

function Laptop() {
    const group = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!group.current) return;
        const t = state.clock.getElapsedTime();
        // Animación de flotación suave
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, Math.cos(t / 2) / 10 + 0.25, 0.1);
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, Math.sin(t / 4) / 10, 0.1);
        group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, (1 + Math.sin(t / 1.5)) / 10, 0.1);
    });

    return (
        <group ref={group}>
            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                {/* Cuerpo de la Laptop */}
                <mesh position={[0, -0.1, 0]}>
                    <boxGeometry args={[4, 0.2, 3]} />
                    <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Pantalla (Tapa) */}
                <mesh position={[0, 1.4, -1.4]} rotation={[-0.2, 0, 0]}>
                    <boxGeometry args={[4, 2.8, 0.1]} />
                    <meshStandardMaterial color="#333" />
                    {/* Contenido de la pantalla */}
                    <mesh position={[0, 0, 0.06]}>
                        <planeGeometry args={[3.8, 2.6]} />
                        <meshStandardMaterial color="#0066ff" emissive="#0044aa" emissiveIntensity={0.5} />
                        <Html distanceFactor={3} position={[0, 0, 0.01]} transform occlude>
                            <div className="w-[380px] h-[260px] bg-blue-600 flex items-center justify-center rounded-sm overflow-hidden border-2 border-blue-400">
                                <div className="text-white text-center p-4">
                                    <h3 className="text-2xl font-bold mb-2">NorthPeak Portal</h3>
                                    <p className="text-xs">Visualiza tus ventas en tiempo real</p>
                                    <div className="mt-4 flex gap-2 justify-center">
                                        <div className="w-12 h-2 bg-blue-300 rounded" />
                                        <div className="w-12 h-2 bg-blue-300 rounded" />
                                        <div className="w-12 h-2 bg-blue-300 rounded" />
                                    </div>
                                </div>
                            </div>
                        </Html>
                    </mesh>
                </mesh>
            </Float>
        </group>
    );
}

function Smartphone() {
    const group = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!group.current) return;
        const t = state.clock.getElapsedTime();
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, Math.sin(t / 2) / 10, 0.1);
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, Math.cos(t / 4) / 10 + 0.3, 0.1);
    });

    return (
        <group ref={group}>
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                {/* Cuerpo del teléfono */}
                <mesh>
                    <boxGeometry args={[1.5, 3, 0.1]} />
                    <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
                </mesh>
                {/* Pantalla */}
                <mesh position={[0, 0, 0.06]}>
                    <planeGeometry args={[1.4, 2.9]} />
                    <meshStandardMaterial color="#000" emissive="#111" />
                    <Html distanceFactor={3} position={[0, 0, 0.01]} transform occlude>
                        <div className="w-[140px] h-[290px] bg-black flex flex-col items-center p-2 rounded-xl overflow-hidden border border-gray-800">
                            <div className="w-8 h-1 bg-gray-800 rounded-full mb-4" />
                            <div className="w-full flex-1 bg-gray-900 rounded-lg p-2 space-y-2">
                                <div className="w-full h-8 bg-blue-500/20 rounded-md border border-blue-500/30 flex items-center px-2">
                                    <div className="w-4 h-4 rounded-full bg-blue-500" />
                                </div>
                                <div className="w-full h-8 bg-gray-800 rounded-md" />
                                <div className="w-full h-8 bg-gray-800 rounded-md" />
                                <div className="w-full h-24 bg-gray-800 rounded-md flex items-end p-1">
                                    <div className="w-full h-1/2 bg-blue-500/10 rounded" />
                                </div>
                            </div>
                        </div>
                    </Html>
                </mesh>
            </Float>
        </group>
    );
}

export function Scene3D({ section = 0 }: { section?: number }) {
    return (
        <div className="w-full h-full">
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                <Environment preset="city" />

                <group position={[0, 0, 0]}>
                    {section === 0 && (
                        <group position={[0, 0, 0]}>
                            <Laptop />
                            <group position={[3.5, -1, 2]} scale={0.8} rotation={[0, -0.4, 0]}>
                                <Smartphone />
                            </group>
                        </group>
                    )}

                    {section === 1 && (
                        <group position={[-2, 0, 0]} scale={0.9}>
                            <Laptop />
                        </group>
                    )}

                    {section === 2 && (
                        <group position={[2, 0, 0]} scale={1.2}>
                            <Smartphone />
                        </group>
                    )}
                </group>

                <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={20} blur={2.5} far={4.5} />
            </Canvas>
        </div>
    );
}
