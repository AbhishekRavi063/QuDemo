import { cn } from "../../lib/utils";
import React from "react";

export function StarBorder({
  as: Component = "button",
  className,
  color,
  speed = "3s",
  children,
  ...props
}) {
  const defaultColor = color || "hsl(var(--foreground))";

  return (
    <Component
      className={cn(
        "relative inline-block py-[1px] overflow-hidden rounded-xl",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "absolute w-[140%] h-[40%] bottom-0 right-[-70%] rounded-xl animate-star-movement-bottom z-0",
          "opacity-60 dark:opacity-90",
        )}
        style={{
          background: `radial-gradient(circle, ${defaultColor}, transparent 15%)`,
          animationDuration: speed,
        }}
      />
      <div
        className={cn(
          "absolute w-[140%] h-[40%] top-0 left-[-70%] rounded-xl animate-star-movement-top z-0",
          "opacity-60 dark:opacity-90",
        )}
        style={{
          background: `radial-gradient(circle, ${defaultColor}, transparent 15%)`,
          animationDuration: speed,
        }}
      />
      <div
        className={cn(
          "relative z-1 text-white text-center text-base h-10 px-4 rounded-xl",
          "bg-gradient-to-b from-gray-900/90 to-gray-800/90",
          "hover:from-gray-800/90 hover:to-gray-700/90 transition-all duration-200",
        )}
      >
        {children}
      </div>
    </Component>
  );
}
