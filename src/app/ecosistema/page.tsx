"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { SectionWrapper } from "@/components/ecosystem/SectionWrapper";
import { motion } from "framer-motion";
import {
    BarChart3,
    Zap,
    ShieldCheck,
    Bot
} from "lucide-react";
import ShinyText from "@/components/reactbits/ShinyText";
import GradientText from "@/components/reactbits/GradientText";

const Scene3D = dynamic(
    () => import("@/components/ecosystem/Scene3D").then((mod) => mod.Scene3D),
    { ssr: false }
);

export default function EcosystemPage() {
    const [currentSection, setCurrentSection] = useState(0);

    const sections = [
        {
            id: "hero",
            title: "Tu Ecosistema Digital Completo",
            subtitle: "De la prospección al cierre, NorthPeak automatiza tu éxito.",
            description: "No solo te damos un sitio web. Te entregamos una infraestructura completa diseñada para convertir cada visita en un cliente leal.",
            icon: <Zap className="text-blue-500 w-12 h-12" />,
            features: ["Análisis IA", "Portal del Cliente", "Chatbot 24/7"]
        },
        {
            id: "sale-process",
            title: "Proceso de Venta Inteligente",
            subtitle: "IA que trabaja para tu equipo de ventas.",
            description: "Nuestro analizador evalúa la presencia digital de tus prospectos en segundos y genera propuestas personalizadas que cierran ventas por ti.",
            icon: <BarChart3 className="text-blue-500 w-12 h-12" />,
            features: ["Reportes de Score Digital", "Cotizaciones Automáticas", "Cuestionarios de Calificación"]
        },
        {
            id: "infrastructure",
            title: "El Portal: Tu Centro de Control",
            subtitle: "Transparencia y profesionalismo total.",
            description: "Tus clientes tendrán acceso privado a su propio portal donde podrán firmar contratos, ver el avance de sus proyectos y descargar sus facturas.",
            icon: <ShieldCheck className="text-blue-500 w-12 h-12" />,
            features: ["Firma Digital de Contratos", "Gestión de Archivos", "Pipeline de Proyectos"]
        },
        {
            id: "automation",
            title: "Omnicanalidad y Automatización",
            subtitle: "Nunca pierdas un lead.",
            description: "Chatbots inteligentes integrados con WhatsApp y tu sitio web que atienden a tus clientes mientras duermes, capturando información clave.",
            icon: <Bot className="text-blue-500 w-12 h-12" />,
            features: ["Chatbot de LinkedIn/WhatsApp", "Notificaciones en Tiempo Real", "Webhooks de n8n"]
        }
    ];

    return (
        <main className="bg-black text-white selection:bg-blue-500/30 overflow-x-hidden">
            {/* 3D Visualizer Layer - Fixed */}
            <div className="fixed inset-0 z-0 pointer-events-none lg:pointer-events-auto">
                <Scene3D section={currentSection} />
            </div>

            {/* Content Layer */}
            <div className="relative z-10">
                {sections.map((section, index) => (
                    <SectionWrapper
                        key={section.id}
                        index={index}
                        onVisible={setCurrentSection}
                    >
                        <div className={`p-6 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 ${index % 2 !== 0 ? 'lg:order-last' : ''}`}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="space-y-6"
                            >
                                <div className="inline-block p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                    {section.icon}
                                </div>

                                <div>
                                    <h2 className="text-4xl lg:text-6xl font-bold tracking-tight mb-4">
                                        <GradientText
                                            colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                                            animationSpeed={3}
                                            showBorder={false}
                                            className="inline"
                                        >
                                            {section.title}
                                        </GradientText>
                                    </h2>
                                    <p className="text-xl text-blue-400 font-medium mb-4">
                                        {section.subtitle}
                                    </p>
                                    <p className="text-gray-400 text-lg leading-relaxed mb-8">
                                        {section.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {section.features.map((feature, fIndex) => (
                                        <div key={fIndex} className="flex items-center gap-3 text-gray-300">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            <span className="text-sm font-semibold tracking-wide">
                                                <ShinyText text={feature} disabled={false} speed={3} className="" />
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-8">
                                    <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25">
                                        Saber más
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* Visual spacer for 3D content in desktop */}
                        <div className="hidden lg:block h-64" />
                    </SectionWrapper>
                ))}
            </div>

            {/* Footer / Contact CTA */}
            <section className="relative z-10 py-24 px-8 border-t border-white/10 bg-black/80 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <h2 className="text-5xl font-bold">¿Listo para transformar tu infraestructura?</h2>
                    <p className="text-gray-400 text-xl">
                        Tu negocio merece tecnología de punta. NorthPeak lo hace posible.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-colors">
                            Habla con un asesor
                        </button>
                        <button className="px-10 py-5 border border-white/20 rounded-full font-bold text-lg hover:bg-white/5 transition-colors">
                            Ver Demo Gratuita
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}
