import * as React from "react";
import { cn } from "@/lib/utils";

// Add CSS animation for the blinking cursor
const cursorBlinkAnimation = `
  @keyframes text-blink {
    0%, 75%, 100% { opacity: 1; }
    75.1%, 95% { opacity: 0; }
  }
`;

export interface TypewriterHeroProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  words?: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  typingClassName?: string;
  cursorClassName?: string;
  align?: "left" | "center" | "right";
}

export function TypewriterHero({
  title = "Welcome to",
  description = "A modern and beautiful UI library for React",
  words = ["Beautiful", "Modern", "Responsive", "Accessible"],
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  className,
  titleClassName,
  descriptionClassName,
  typingClassName,
  cursorClassName,
  align = "center",
  ...props
}: TypewriterHeroProps) {
  const [currentText, setCurrentText] = React.useState("");
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isWaiting, setIsWaiting] = React.useState(false);

  React.useEffect(() => {
    const timeout = setTimeout(
      () => {
        if (isWaiting) {
          setIsWaiting(false);
          setIsDeleting(true);
          return;
        }

        if (isDeleting) {
          if (currentText === "") {
            setIsDeleting(false);
            setCurrentIndex((prev) => (prev + 1) % words.length);
          } else {
            setCurrentText((prev) => prev.slice(0, -1));
          }
        } else {
          const targetWord = words[currentIndex];
          if (currentText === targetWord) {
            setIsWaiting(true);
          } else {
            setCurrentText((prev) => targetWord.slice(0, prev.length + 1));
          }
        }
      },
      isWaiting ? pauseDuration : isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timeout);
  }, [
    currentText,
    currentIndex,
    isDeleting,
    isWaiting,
    words,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
  ]);

  return (
    <>
      <style jsx>{cursorBlinkAnimation}</style>
      <div
        className={cn(
          "relative w-full overflow-hidden py-24",
          align === "center" && "text-center",
          align === "right" && "text-right",
          className
        )}
        {...props}
      >
        <div className="relative max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
          {title && (
            <h1
              className={cn(
                "text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl",
                titleClassName
              )}
            >
              {title}{" "}
              <span
                className={cn(
                  "bg-linear-to-r from-[#FFD700] via-[#DAA520] to-[#B8860B] bg-clip-text text-transparent",
                  typingClassName
                )}
              >
                {currentText}
                <span
                  className={cn(
                    "ml-0.5 inline-block h-[1em] w-[2px] opacity-70",
                    cursorClassName
                  )}
                  style={{
                    animation: "text-blink 1.2s infinite ease-in-out",
                    backgroundColor: "currentColor", // Ensure the cursor has a color
                    width: "2px", // Ensure width is explicitly set
                    display: "inline-block", // Ensure it's displayed as a block
                  }}
                  aria-hidden="true"
                />
              </span>
            </h1>
          )}
          {description && (
            <p
              className={cn(
                "mt-6 max-w-3xl text-xl text-gray-600 dark:text-gray-400",
                align === "center" && "mx-auto",
                align === "right" && "ml-auto",
                descriptionClassName
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
