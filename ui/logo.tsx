import type { ReactNode } from "react";

import { cn } from "../lib/utils";

type LogoProps = {
    size?: string;
    glow?: string;
    className?: string;
    children?: ReactNode;
};

export default function Logo({
    size = "mini",
    glow = "disabled",
    className,
}: LogoProps) {
    const sizes: Record<string, string> = {
        mini: "text-[25px]",
        small: "text-[36px]",
        medium: "text-[50px]",
        large: "text-[65px]",
        "extra-large": "text-[80px]",
    };

    return (
        <span
            className={cn(
                "cursor-pointer font-logo text-primary",
                sizes[size] ?? sizes.mini,
                glow === "active" &&
                    "[text-shadow:0px_0px_20px_rgba(255,173,51,0.39)]",
                className,
            )}
        >
            Rate.io
        </span>
    );
}
