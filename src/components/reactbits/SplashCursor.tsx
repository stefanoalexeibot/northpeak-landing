"use client";

import { useEffect, useRef, useCallback } from "react";

interface SplashCursorProps {
    className?: string;
    SPLAT_RADIUS?: number;
}

export default function SplashCursor({
    className = "",
    SPLAT_RADIUS = 0.2,
}: SplashCursorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const initFluid = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Resize canvas
        const resize = () => {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Fluid trail effect
        const points: Array<{ x: number; y: number; age: number; vx: number; vy: number }> = [];
        let mouseX = 0;
        let mouseY = 0;
        let prevMouseX = 0;
        let prevMouseY = 0;

        const onMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            prevMouseX = mouseX;
            prevMouseY = mouseY;
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;

            const dx = mouseX - prevMouseX;
            const dy = mouseY - prevMouseY;
            const speed = Math.sqrt(dx * dx + dy * dy);

            if (speed > 1) {
                const count = Math.min(Math.floor(speed / 3), 8);
                for (let i = 0; i < count; i++) {
                    const t = i / count;
                    points.push({
                        x: prevMouseX + dx * t + (Math.random() - 0.5) * SPLAT_RADIUS * 40,
                        y: prevMouseY + dy * t + (Math.random() - 0.5) * SPLAT_RADIUS * 40,
                        age: 0,
                        vx: dx * 0.3 + (Math.random() - 0.5) * 2,
                        vy: dy * 0.3 + (Math.random() - 0.5) * 2,
                    });
                }
            }
        };

        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 0) return;
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            prevMouseX = mouseX;
            prevMouseY = mouseY;
            mouseX = touch.clientX - rect.left;
            mouseY = touch.clientY - rect.top;

            const dx = mouseX - prevMouseX;
            const dy = mouseY - prevMouseY;

            for (let i = 0; i < 3; i++) {
                points.push({
                    x: mouseX + (Math.random() - 0.5) * 20,
                    y: mouseY + (Math.random() - 0.5) * 20,
                    age: 0,
                    vx: dx * 0.2,
                    vy: dy * 0.2,
                });
            }
        };

        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("touchmove", onTouchMove, { passive: true });

        const maxAge = 80;
        let animId: number;

        const drawFrame = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = points.length - 1; i >= 0; i--) {
                const p = points[i];
                p.age++;
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.98;
                p.vy *= 0.98;

                if (p.age > maxAge) {
                    points.splice(i, 1);
                    continue;
                }

                const life = 1 - p.age / maxAge;
                const size = (SPLAT_RADIUS * 50 + 5) * life;
                const alpha = life * 0.6;

                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
                grad.addColorStop(0, `hsla(${160 + (p.age * 2) % 60}, 100%, 60%, ${alpha})`);
                grad.addColorStop(0.5, `hsla(${200 + (p.age * 3) % 40}, 80%, 50%, ${alpha * 0.5})`);
                grad.addColorStop(1, `hsla(${160 + (p.age * 2) % 60}, 100%, 40%, 0)`);

                ctx.globalCompositeOperation = "lighter";
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fill();
            }

            if (points.length > 300) points.splice(0, points.length - 300);
            animId = requestAnimationFrame(drawFrame);
        };

        drawFrame();

        return () => {
            window.removeEventListener("resize", resize);
            canvas.removeEventListener("mousemove", onMouseMove);
            canvas.removeEventListener("touchmove", onTouchMove);
            cancelAnimationFrame(animId);
        };
    }, [SPLAT_RADIUS]);

    useEffect(() => {
        const cleanup = initFluid();
        return () => cleanup?.();
    }, [initFluid]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full pointer-events-auto z-[1] ${className}`}
            style={{ mixBlendMode: "screen" }}
        />
    );
}
