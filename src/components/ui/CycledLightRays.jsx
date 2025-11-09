import React, { useEffect, useState } from "react";
import { colors } from "../../styles/colors";

const CycledLightRays = ({ className = "", opacity = 1 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Ray configurations with continuous rotation cycles
  const rays = [
    { baseRotation: 0, opacity: 0.27, speed: 20, direction: 1 },
    { baseRotation: 25, opacity: 0.28, speed: 18, direction: -1 },
    { baseRotation: 11, opacity: 0.57, speed: 22, direction: 1 },
    { baseRotation: -12, opacity: 1, speed: 15, direction: -1 },
    { baseRotation: -24, opacity: 1, speed: 25, direction: 1 },
    { baseRotation: -18, opacity: 0.3, speed: 19, direction: -1 },
    { baseRotation: -18, opacity: 0.3, speed: 21, direction: 1 },
    { baseRotation: -18, opacity: 0.3, speed: 17, direction: -1 },
    { baseRotation: -5, opacity: 0.3, speed: 23, direction: 1 },
    { baseRotation: -5, opacity: 0.3, speed: 16, direction: -1 },
    { baseRotation: 3, opacity: 0.3, speed: 24, direction: 1 },
    { baseRotation: 3, opacity: 0.3, speed: 20, direction: -1 },
    { baseRotation: 3, opacity: 0.3, speed: 18, direction: 1 },
    { baseRotation: 3, opacity: 0.3, speed: 22, direction: -1 },
    { baseRotation: 17, opacity: 0.28, speed: 19, direction: 1 },
    { baseRotation: 22, opacity: 0.28, speed: 21, direction: -1 },
    { baseRotation: 27, opacity: 0.28, speed: 17, direction: 1 },
    { baseRotation: 32, opacity: 0.28, speed: 23, direction: -1 },
  ];

  return (
    <>
      <style>
        {rays.map(
          (ray, index) => `
          @keyframes rotateRay${index} {
            from {
              transform: rotate(${ray.baseRotation}deg);
            }
            to {
              transform: rotate(${ray.baseRotation + ray.direction * 360}deg);
            }
          }
        `
        ).join('\n')}
      </style>
      <div
        className={`absolute top-0 left-0 right-0 bottom-0 overflow-hidden pointer-events-none ${className}`}
        style={{
          transform: "rotate(-33deg)",
          opacity: isVisible ? opacity : 0.001,
          transition: "opacity 0.8s ease-out",
          WebkitMask:
            "radial-gradient(50% 109%, #000 0%, #000000f6 0%, #0000 96%)",
          mask: "radial-gradient(50% 109%, #000 0%, #000000f6 0%, #0000 96%)",
        }}
      >
        {rays.map((ray, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              background: `radial-gradient(50% 50% at 50% 50%, ${colors.primaryLight} 0%, #ababab00 100%)`,
              opacity: ray.opacity,
              width: "40px",
              height: "2072px",
              top: "-352px",
              left: "calc(50% - 20px)",
              transformOrigin: "100% 0% 0",
              willChange: "transform",
              animation: `rotateRay${index} ${ray.speed}s linear infinite`,
              animationDelay: `${index * 0.1}s`,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default CycledLightRays;
