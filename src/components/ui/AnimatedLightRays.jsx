import React from "react";
import { motion } from "framer-motion";
import { colors } from "../../styles/colors";

const AnimatedLightRays = ({ className = "", opacity = 0.001 }) => {
  // Ray configurations with animation properties from page.html
  const rays = [
    { rotation: 0, opacity: 0.27, willChange: true, initialRotation: 0 },
    { rotation: 25, opacity: 0.28, willChange: true, initialRotation: 0 },
    { rotation: 11, opacity: 0.57, willChange: true, initialRotation: 0 },
    { rotation: -12, opacity: 1, willChange: false, initialRotation: -12 },
    { rotation: -24, opacity: 1, willChange: false, initialRotation: -24 },
    { rotation: -18, opacity: 0.3, willChange: true, initialRotation: 0 },
    { rotation: -18, opacity: 0.3, willChange: true, initialRotation: 0 },
    { rotation: -18, opacity: 0.3, willChange: true, initialRotation: 0 },
    { rotation: -5, opacity: 0.3, willChange: true, initialRotation: 0 },
    { rotation: -5, opacity: 0.3, willChange: true, initialRotation: 0 },
    { rotation: 3, opacity: 0.3, willChange: true, initialRotation: 0 },
    { rotation: 3, opacity: 0.3, willChange: true, initialRotation: 0 },
    { rotation: 3, opacity: 0.3, willChange: true, initialRotation: 0 },
    { rotation: 3, opacity: 0.3, willChange: true, initialRotation: 0 },
    { rotation: 17, opacity: 0.28, willChange: true, initialRotation: 0 },
    { rotation: 22, opacity: 0.28, willChange: true, initialRotation: 0 },
    { rotation: 27, opacity: 0.28, willChange: true, initialRotation: 0 },
    { rotation: 32, opacity: 0.28, willChange: true, initialRotation: 0 },
  ];

  return (
    <motion.div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      initial={{ opacity: 0.001 }}
      whileInView={{ opacity: opacity }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{
        transform: "rotate(-33deg)",
        WebkitMask:
          "radial-gradient(50% 109%, #000 0%, #000000f6 0%, #0000 96%)",
        mask: "radial-gradient(50% 109%, #000 0%, #000000f6 0%, #0000 96%)",
      }}
    >
      {rays.map((ray, index) => (
        <motion.div
          key={index}
          className="absolute"
          initial={{
            rotate: ray.initialRotation,
            opacity: ray.opacity * 0.3,
          }}
          whileInView={{
            rotate: ray.rotation,
            opacity: ray.opacity,
          }}
          viewport={{ once: true }}
          transition={{
            duration: 1.2 + index * 0.05,
            ease: [0.4, 0, 0.2, 1],
            delay: index * 0.03,
          }}
          style={{
            background: `radial-gradient(50% 50% at 50% 50%, ${colors.primaryLight} 0%, #ababab00 100%)`,
            width: "40px",
            height: "2072px",
            top: "-352px",
            left: "calc(50% - 20px)",
            transformOrigin: "100% 0% 0",
            willChange: ray.willChange ? "transform" : undefined,
          }}
        />
      ))}
    </motion.div>
  );
};

export default AnimatedLightRays;
