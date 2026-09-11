"use client";

import ClickSpark from "@/components/reactbits/ClickSpark";

export default function ClickSparkWrapper({ children }: { children: React.ReactNode }) {
    return (
        <ClickSpark
            sparkColor="#00e5a0"
            sparkSize={8}
            sparkCount={8}
            duration={600}
        >
            {children}
        </ClickSpark>
    );
}
