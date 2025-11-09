import { useState, useEffect } from "react";

const SimpleLightRays = ({ className = "" }) => {
  // Ray configurations based on exact page.html implementation
  const [rays] = useState(() => [
    {
      width: 40,
      height: 2000,
      opacity: 0.27,
      rotation: -20,
      shouldAnimate: true,
    },
    {
      width: 35,
      height: 2000,
      opacity: 0.28,
      rotation: -10,
      shouldAnimate: true,
    },
    {
      width: 35,
      height: 2000,
      opacity: 0.57,
      rotation: 0,
      shouldAnimate: true,
    },
    {
      width: 35,
      height: 2000,
      opacity: 0.42,
      rotation: 8,
      shouldAnimate: false,
    },
    {
      width: 35,
      height: 2000,
      opacity: 0.32,
      rotation: 15,
      shouldAnimate: false,
    },
    {
      width: 50,
      height: 2000,
      opacity: 0.3,
      rotation: -15,
      shouldAnimate: true,
    },
    {
      width: 50,
      height: 2000,
      opacity: 0.3,
      rotation: -5,
      shouldAnimate: false,
    },
    {
      width: 50,
      height: 2000,
      opacity: 0.3,
      rotation: 5,
      shouldAnimate: false,
    },
    {
      width: 20,
      height: 2000,
      opacity: 0.3,
      rotation: 12,
      shouldAnimate: true,
    },
    {
      width: 20,
      height: 2000,
      opacity: 0.3,
      rotation: 18,
      shouldAnimate: false,
    },
    {
      width: 40,
      height: 2000,
      opacity: 0.5,
      rotation: -8,
      shouldAnimate: true,
    },
    {
      width: 15,
      height: 2000,
      opacity: 0.5,
      rotation: 10,
      shouldAnimate: false,
    },
    {
      width: 20,
      height: 2000,
      opacity: 0.6,
      rotation: 22,
      shouldAnimate: false,
    },
    {
      width: 20,
      height: 2000,
      opacity: 0.18,
      rotation: 28,
      shouldAnimate: false,
    },
  ]);

  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={{ filter: "blur(5px)" }}
    >
      {/* Blue glow background circles */}
      <div
        className="absolute left-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, var(--token-077104a2-d76f-4b61-ba61-73e253fa3923, #2934ff) 0%, #ababab00 100%)",
          opacity: 1,
          width: "1198px",
          left: "calc(10% - 599px)",
          top: "-0",
          bottom: "-46px",
          overflow: "hidden",
        }}
      />
      <div
        className="absolute left-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, var(--token-077104a2-d76f-4b61-ba61-73e253fa3923, #2934ff) 0%, #ababab00 100%)",
          opacity: 1,
          width: "865px",
          height: "929px",
          left: "calc(0% - 432.5px)",
          top: "-0",
          overflow: "hidden",
        }}
      />
      <div
        className="absolute left-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, var(--token-077104a2-d76f-4b61-ba61-73e253fa3923, #2934ff) 0%, #ababab00 100%)",
          opacity: 1,
          width: "778px",
          height: "639px",
          left: "calc(0% - 389px)",
          top: "-0",
          overflow: "hidden",
        }}
      />

      {/* Light rays container with rotation */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 1,
          transform: "rotate(-33deg)",
        }}
      >
        {rays.map((ray, index) => (
          <div
            key={index}
            className={ray.shouldAnimate ? "ray-animate" : ""}
            style={{
              background:
                "radial-gradient(50% 50% at 50% 50%, var(--token-6da9d50d-e927-4dcf-93ed-bf3b8039528b, #8aa5ff) 0%, #ababab00 100%)",
              opacity: ray.opacity,
              zIndex: 1,
              position: "absolute",
              width: `${ray.width}px`,
              height: `${ray.height}px`,
              top: `-1400px`,
              left: `calc(15% - ${ray.width / 2}px)`,
              overflow: "hidden",
              willChange: ray.shouldAnimate
                ? "transform, opacity"
                : "transform",
              transform: `rotate(${ray.rotation}deg)`,
              transformOrigin: "100% 0% 0",
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes rayPulse {
          0%,
          100% {
            opacity: 1;
            transform: scaleY(0.8);
          }
          50% {
            opacity: 0.6;
            transform: scaleY(1.2);
          }
        }

        .ray-animate {
          animation: rayPulse 3s ease-in-out infinite;
        }

        .ray-animate:nth-child(2) {
          animation-delay: 0.5s;
        }

        .ray-animate:nth-child(3) {
          animation-delay: 1s;
        }

        .ray-animate:nth-child(6) {
          animation-delay: 1.5s;
        }

        .ray-animate:nth-child(9) {
          animation-delay: 2s;
        }

        .ray-animate:nth-child(11) {
          animation-delay: 2.5s;
        }
      `}</style>
    </div>
  );
};

export default SimpleLightRays;
