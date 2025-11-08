import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { colors } from "../../styles/colors";

const FramerCard = ({ children, className = "" }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className={`relative ${className}`}
      style={{
        position: "relative",
        overflow: "visible",
      }}
    >
      {/* Outer glow with gradient */}
      <div
        className="absolute"
        style={{
          aspectRatio: 1,
          width: "102%",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: "inherit",
          background: isHovered
            ? `conic-gradient(from ${mousePosition.x * 3.6}deg at ${mousePosition.x}% ${mousePosition.y}%, ${colors.primary} 0deg, transparent 60deg, transparent 300deg, ${colors.primary} 360deg)`
            : "transparent",
          willChange: "transform",
          opacity: isHovered ? 0.5625 : 0,
          transition: "opacity 0.3s ease",
          zIndex: -1,
        }}
      />

      {/* Main border frame */}
      <div
        className="absolute"
        style={{
          aspectRatio: 1,
          width: "99%",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backdropFilter: "blur(11px)",
          WebkitBackdropFilter: "blur(11px)",
          background: "linear-gradient(180deg, rgba(5, 5, 5, 0.76) 0%, rgba(13, 13, 13, 0.79) 100%)",
          borderRadius: "inherit",
          boxShadow: `
            0px 0.76px 0.69px -0.5px rgba(0, 0, 0, 0.173),
            0px 1.87px 1.68px -1px rgba(0, 0, 0, 0.17),
            0px 3.55px 3.19px -1.5px rgba(0, 0, 0, 0.166),
            0px 6.19px 5.57px -2px rgba(0, 0, 0, 0.159),
            0px 10.78px 9.7px -2.5px rgba(0, 0, 0, 0.147),
            0px 19.74px 17.76px -3px rgba(0, 0, 0, 0.124),
            0px 39px 35.1px -3.5px rgba(0, 0, 0, 0.075)
          `,
          filter: "saturate(1.17)",
          WebkitFilter: "saturate(1.17)",
          willChange: "transform",
          zIndex: 0,
          overflow: "hidden",
        }}
      />

      {/* Border inner highlight */}
      <div
        className="absolute"
        style={{
          aspectRatio: 1,
          width: "92%",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backdropFilter: "blur(11px)",
          WebkitBackdropFilter: "blur(11px)",
          background: `linear-gradient(180deg, ${colors.bgBlack} 0%, ${colors.whiteAlpha['13']} 100%)`,
          borderRadius: "inherit",
          willChange: "transform",
          zIndex: 0,
          overflow: "hidden",
        }}
      />

      {/* Inner background (color) */}
      <div
        className="absolute"
        style={{
          aspectRatio: 1,
          width: "91%",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgb(0, 1, 5)",
          borderRadius: "inherit",
          willChange: "transform",
          zIndex: 0,
          overflow: "hidden",
        }}
      />

      {/* Inner outlines */}
      <div
        className="absolute"
        style={{
          width: "91%",
          height: "92%",
          position: "absolute",
          top: "4%",
          left: "4.37%",
          overflow: "visible",
        }}
      >
        {/* Background fill */}
        <div
          style={{
            width: "100%",
            height: "0%",
            position: "absolute",
            backgroundColor: colors.whiteAlpha['01'],
            zIndex: 4,
          }}
        />

        {/* Multiple circular borders with varying opacity */}
        {[0.01, 0.01, 0.01].map((opacity, index) => (
          <div
            key={index}
            style={{
              aspectRatio: 1,
              width: "100%",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              border: `2px solid ${colors.textWhite}`,
              borderRadius: "inherit",
              opacity: opacity,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default FramerCard;
