import * as React from "react";
import { cn } from "@/lib/utils";

export interface HolographicCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  holographicIntensity?: number;
  rotationFactor?: number;
  glowIntensity?: number;
  prismaticEffect?: boolean;
  backgroundColor?: string;
  darkBackgroundColor?: string;
  scanlineEffect?: boolean;
  refractionPattern?: "none" | "diamond" | "wave" | "circuit";
  depthEffect?: boolean;
  glitchEffect?: boolean;
  shadowColor?: string;
}

interface CSSPropertiesWithCustomVars extends React.CSSProperties {
  "--mouse-x"?: string;
  "--mouse-y"?: string;
  "--background-color-dark"?: string;
  "--refraction-pattern"?: string;
  "--refraction-pattern-dark"?: string;
  "--glow-intensity"?: number;
  "--holographic-intensity"?: number;
}

export function HolographicCard({
  children,
  className,
  holographicIntensity = 0.4,
  rotationFactor = 12,
  glowIntensity = 0.8,
  prismaticEffect = true,
  backgroundColor = "rgba(255, 255, 255, 0.1)",
  darkBackgroundColor = "rgba(20, 20, 30, 0.8)",
  scanlineEffect = false,
  refractionPattern = "none",
  depthEffect = false,
  glitchEffect = false,
  shadowColor = "rgba(0, 0, 0, 0.5)",
  ...props
}: HolographicCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);
  const [glitchOffset, setGlitchOffset] = React.useState({ x: 0, y: 0 });

  // Glitch effect
  React.useEffect(() => {
    if (!glitchEffect || !isHovered) return;

    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.92) {
        setGlitchOffset({
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10,
        });
        setTimeout(() => setGlitchOffset({ x: 0, y: 0 }), 50);
      }
    }, 100);

    return () => clearInterval(glitchInterval);
  }, [glitchEffect, isHovered]);

  React.useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Convert coordinates to percentages
      const percentX = x / rect.width;
      const percentY = y / rect.height;

      setMousePosition({ x: percentX, y: percentY });

      // Calculate rotation angles based on mouse position
      const rotateY = (percentX - 0.5) * rotationFactor;
      const rotateX = (0.5 - percentY) * rotationFactor;

      // Calculate holographic gradient angle
      const angle =
        Math.atan2(y - rect.height / 2, x - rect.width / 2) * (180 / Math.PI);

      // Apply transforms with depth effect
      const scale = isHovered ? 1.02 : 1;
      const translateZ = depthEffect ? (isHovered ? "50px" : "0px") : "0px";

      card.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(${scale})
        translateZ(${translateZ})
        translate(${glitchOffset.x}px, ${glitchOffset.y}px)
      `;

      // Update holographic effect
      if (prismaticEffect) {
        const hue = (angle + 360) % 360;
        const lightness = "60%"; // Light mode
        const darkLightness = "65%"; // Dark mode - slightly brighter
        const gradient = `
          linear-gradient(
            ${angle}deg,
            hsl(${hue}, 100%, ${lightness}) 0%,
            hsl(${(hue + 60) % 360}, 100%, ${lightness}) 50%,
            hsl(${(hue + 120) % 360}, 100%, ${lightness}) 100%
          )
        `;
        const darkGradient = `
          linear-gradient(
            ${angle}deg,
            hsl(${hue}, 100%, ${darkLightness}) 0%,
            hsl(${(hue + 60) % 360}, 100%, ${darkLightness}) 50%,
            hsl(${(hue + 120) % 360}, 100%, ${darkLightness}) 100%
          )
        `;
        card.style.setProperty("--holographic-gradient", gradient);
        card.style.setProperty("--holographic-gradient-dark", darkGradient);
      }
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
      card.style.transition = "transform 0.1s ease-out";
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setGlitchOffset({ x: 0, y: 0 });
      card.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)";
      card.style.transition = "transform 0.5s ease-out";
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [
    rotationFactor,
    holographicIntensity,
    prismaticEffect,
    depthEffect,
    isHovered,
    glitchOffset,
  ]);

  // Generate refraction pattern
  const getRefractionPattern = (isDark = false) => {
    const opacity = isDark ? "0.15" : "0.1";
    switch (refractionPattern) {
      case "diamond":
        return `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,${opacity}) 10px, rgba(255,255,255,${opacity}) 20px)`;
      case "wave":
        return `repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 20px, rgba(255,255,255,${opacity}) 20px, rgba(255,255,255,${opacity}) 40px)`;
      case "circuit":
        return `
          linear-gradient(90deg, transparent 50%, rgba(255,255,255,${opacity}) 50%),
          linear-gradient(0deg, transparent 50%, rgba(255,255,255,${opacity}) 50%)
        `;
      default:
        return "none";
    }
  };

  const customStyle: CSSPropertiesWithCustomVars = {
    "--mouse-x": `${mousePosition.x * 100}%`,
    "--mouse-y": `${mousePosition.y * 100}%`,
    backgroundColor,
    "--background-color-dark": darkBackgroundColor,
    boxShadow: `
      0 10px 30px -10px ${shadowColor},
      0 0 ${glowIntensity * 20}px ${
      glowIntensity * 5
    }px rgba(255, 255, 255, 0.1)
    `,
    "--refraction-pattern": getRefractionPattern(),
    "--refraction-pattern-dark": getRefractionPattern(true),
    "--glow-intensity": glowIntensity,
    "--holographic-intensity": holographicIntensity,
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden rounded-xl transition-all duration-200",
        "before:absolute before:inset-0 before:z-10",
        "before:bg-[var(--holographic-gradient)] dark:before:bg-[var(--holographic-gradient-dark)]",
        "before:pointer-events-none before:opacity-[0.15] before:mix-blend-overlay",
        "dark:before:opacity-[0.2] dark:before:mix-blend-overlay",
        "after:absolute after:inset-0 after:z-20",
        "after:bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.15)_0%,transparent_80%)]",
        "dark:after:bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.2)_0%,transparent_80%)]",
        "after:pointer-events-none",
        scanlineEffect && "holo-scanlines dark:holo-scanlines-dark",
        className
      )}
      style={customStyle}
      {...props}
    >
      <div
        className={cn(
          "relative z-30",
          refractionPattern !== "none" &&
            "before:absolute before:inset-0 before:z-0 before:opacity-30",
          refractionPattern !== "none" &&
            "before:bg-[var(--refraction-pattern)]",
          refractionPattern !== "none" &&
            "dark:before:bg-[var(--refraction-pattern-dark)]",
          refractionPattern !== "none" && "dark:before:opacity-40"
        )}
      >
        {children}
      </div>
      {scanlineEffect && (
        <style jsx>{`
          .holo-scanlines::before {
            content: "";
            position: absolute;
            inset: 0;
            z-index: 15;
            background: repeating-linear-gradient(
              0deg,
              transparent 0%,
              rgba(255, 255, 255, 0.05) 0.5px,
              transparent 1px
            );
            pointer-events: none;
            mix-blend-mode: overlay;
          }
          .holo-scanlines-dark::before {
            background: repeating-linear-gradient(
              0deg,
              transparent 0%,
              rgba(255, 255, 255, 0.08) 0.5px,
              transparent 1px
            );
            mix-blend-mode: overlay;
          }
          @media (prefers-color-scheme: dark) {
            div {
              background-color: var(--background-color-dark);
            }
          }
        `}</style>
      )}
    </div>
  );
}
