"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, PerspectiveCamera, Html, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

// ── Floating particles ──────────────────────────────────────────────────────
function Particles({ count = 80 }: { count?: number }) {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const positions = useMemo(() => {
        const arr: THREE.Vector3[] = [];
        for (let i = 0; i < count; i++) {
            arr.push(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 18,
                    (Math.random() - 0.5) * 14,
                    (Math.random() - 0.5) * 8
                )
            );
        }
        return arr;
    }, [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        if (!mesh.current) return;
        const t = state.clock.getElapsedTime();
        positions.forEach((pos, i) => {
            const y = pos.y + Math.sin(t * 0.3 + i * 0.5) * 0.08;
            dummy.position.set(pos.x, y, pos.z);
            dummy.scale.setScalar(0.04 + Math.sin(t + i) * 0.01);
            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial
                color="#00E5A0"
                emissive="#00E5A0"
                emissiveIntensity={0.6}
                transparent
                opacity={0.5}
            />
        </instancedMesh>
    );
}

// ── WA-style chat screen ─────────────────────────────────────────────────────
function WAScreen({ visible }: { visible: boolean }) {
    const messages = [
        { from: "user", text: "Hola, ¿tienen disponibilidad esta semana?" },
        { from: "ai", text: "¡Hola! Claro que sí 🤖 ¿Qué día te queda mejor?" },
        { from: "user", text: "El miércoles en la tarde" },
        { from: "ai", text: "Perfecto ✅ Te agendo el miércoles a las 4pm. ¡Nos vemos!" },
    ];
    return (
        <div className="w-[160px] h-[300px] bg-[#0A0B10] flex flex-col overflow-hidden rounded-[20px]">
            {/* Header */}
            <div className="bg-[#075E54] px-3 py-1.5 flex items-center gap-1.5 shrink-0">
                <div className="w-5 h-5 rounded-full bg-northpeak-green/30 border border-northpeak-green/50 flex items-center justify-center text-[8px]">🤖</div>
                <div>
                    <p className="text-white text-[8px] font-bold leading-tight">IA NorthPeak</p>
                    <div className="flex items-center gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-green-400" />
                        <p className="text-white/60 text-[7px]">En línea</p>
                    </div>
                </div>
            </div>
            {/* Chat */}
            <div className="flex-1 px-2 py-2 space-y-1.5 overflow-hidden">
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                        style={{
                            opacity: visible ? 1 : 0,
                            transition: `opacity 0.4s ease ${i * 0.3}s`,
                        }}
                    >
                        <div
                            className={`text-[7px] px-2 py-1 rounded-xl max-w-[110px] leading-tight ${m.from === "user"
                                ? "bg-[#005C4B] text-white rounded-br-none"
                                : "bg-[#1F2C34] text-white/90 rounded-bl-none"
                                }`}
                        >
                            {m.text}
                        </div>
                    </div>
                ))}
            </div>
            {/* Input */}
            <div className="bg-[#1F2C34] px-2 py-1.5 flex items-center gap-1.5 shrink-0">
                <div className="flex-1 bg-[#2A3942] rounded-full px-2 py-1">
                    <p className="text-white/30 text-[7px]">Escribe...</p>
                </div>
                <div className="w-5 h-5 rounded-full bg-[#00E5A0] flex items-center justify-center text-[8px]">▶</div>
            </div>
        </div>
    );
}

// ── Dashboard screen ─────────────────────────────────────────────────────────
function DashboardScreen({ visible }: { visible: boolean }) {
    return (
        <div className="w-[260px] h-[160px] bg-[#05060A] rounded p-2 overflow-hidden">
            <div className="text-[8px] text-[#00E5A0] font-mono mb-1.5 opacity-80">— NorthPeak Portal</div>
            <div className="grid grid-cols-3 gap-1 mb-2">
                {[
                    { label: "Leads", val: "142", color: "#00E5A0" },
                    { label: "Citas", val: "38", color: "#60A5FA" },
                    { label: "MRR", val: "$84k", color: "#A78BFA" },
                ].map((s) => (
                    <div key={s.label} className="bg-white/5 rounded p-1.5 text-center border border-white/10"
                        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease" }}
                    >
                        <p className="text-[11px] font-bold" style={{ color: s.color }}>{s.val}</p>
                        <p className="text-[7px] text-white/40">{s.label}</p>
                    </div>
                ))}
            </div>
            {/* Mini bar chart */}
            <div className="flex items-end gap-0.5 h-8">
                {[40, 65, 80, 55, 90, 120, 142].map((v, i) => (
                    <div
                        key={i}
                        className="flex-1 rounded-sm bg-gradient-to-t from-[#00E5A0]/60 to-[#00E5A0]/20"
                        style={{
                            height: `${(v / 142) * 100}%`,
                            opacity: visible ? 1 : 0,
                            transition: `opacity 0.3s ease ${i * 0.08}s`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

// ── iPhone mockup ─────────────────────────────────────────────────────────────
function IPhoneModel({ section }: { section: number }) {
    const group = useRef<THREE.Group>(null);
    const notch = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!group.current) return;
        const t = state.clock.getElapsedTime();
        group.current.rotation.y = Math.sin(t * 0.4) * 0.18;
        group.current.rotation.x = Math.cos(t * 0.3) * 0.06 - 0.05;
        group.current.position.y = Math.sin(t * 0.8) * 0.07;
    });

    return (
        <group ref={group}>
            <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.2}>
                {/* Body */}
                <RoundedBox args={[2.2, 4.6, 0.22]} radius={0.28} smoothness={6} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#1a1a1c" metalness={0.95} roughness={0.08} />
                </RoundedBox>

                {/* Screen glass */}
                <RoundedBox args={[2.0, 4.3, 0.01]} radius={0.22} smoothness={6} position={[0, 0, 0.12]}>
                    <meshStandardMaterial color="#030305" metalness={0.1} roughness={0} opacity={0.92} transparent />
                </RoundedBox>

                {/* Dynamic island */}
                <mesh ref={notch} position={[0, 1.92, 0.14]}>
                    <capsuleGeometry args={[0.12, 0.3, 4, 8]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>

                {/* Side button */}
                <mesh position={[1.14, 0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
                    <meshStandardMaterial color="#2a2a2c" metalness={0.9} roughness={0.2} />
                </mesh>

                {/* Volume buttons */}
                {[-0.4, 0.1, 0.6].map((y, i) => (
                    <mesh key={i} position={[-1.14, y, 0]} rotation={[0, Math.PI / 2, 0]}>
                        <cylinderGeometry args={[0.035, 0.035, i === 0 ? 0.3 : 0.45, 8]} />
                        <meshStandardMaterial color="#2a2a2c" metalness={0.9} roughness={0.2} />
                    </mesh>
                ))}

                {/* Screen content */}
                <Html
                    distanceFactor={4}
                    position={[0, -0.05, 0.13]}
                    transform
                    occlude
                    style={{ pointerEvents: "none" }}
                >
                    {section === 0 && <WAScreen visible={true} />}
                    {section === 1 && <DashboardScreen visible={true} />}
                    {section === 2 && <WAScreen visible={true} />}
                    {section === 3 && <DashboardScreen visible={true} />}
                </Html>

                {/* Glow light */}
                <pointLight
                    position={[0, 0, 1]}
                    intensity={section === 0 ? 1.2 : 0.8}
                    color={section % 2 === 0 ? "#00E5A0" : "#60A5FA"}
                    distance={4}
                />
            </Float>
        </group>
    );
}

// ── Camera rig: zoom smoothly on section change ───────────────────────────────
function CameraRig({ section }: { section: number }) {
    const { camera } = useThree();

    // Each section has a different camera Z distance (zoom)
    const targetZ = [7.5, 6.5, 8, 7][section] ?? 7.5;
    const targetX = [-1.5, 1.5, -1.5, 1.5][section] ?? 0;

    useFrame(() => {
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.04);
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.04);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0, 0.04);
    });

    return null;
}

// ── Scene export ──────────────────────────────────────────────────────────────
export function Scene3D({ section = 0 }: { section?: number }) {
    return (
        <div className="w-full h-full">
            <Canvas
                shadows
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true }}
                style={{ background: "transparent" }}
            >
                <PerspectiveCamera makeDefault position={[0, 0, 7.5]} fov={45} />
                <CameraRig section={section} />

                {/* Lighting */}
                <ambientLight intensity={0.3} />
                <spotLight
                    position={[5, 8, 5]}
                    angle={0.2}
                    penumbra={1}
                    intensity={2}
                    castShadow
                    color="#ffffff"
                />
                <pointLight position={[-6, -4, -4]} intensity={0.6} color="#60A5FA" />
                <pointLight position={[6, 4, 2]} intensity={0.4} color="#00E5A0" />

                {/* Particles */}
                <Particles count={70} />

                {/* iPhone */}
                <IPhoneModel section={section} />
            </Canvas>
        </div>
    );
}
