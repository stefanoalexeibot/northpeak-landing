"use client";

import Aurora from "@/components/reactbits/Aurora";

export default function HeroEffects() {
    return (
        <Aurora
            colorStops={["#00e5a0", "#0066ff", "#8b5cf6", "#00e5a0"]}
            blend="screen"
            blur="120px"
            speed={10}
            opacity={0.25}
        />
    );
}
