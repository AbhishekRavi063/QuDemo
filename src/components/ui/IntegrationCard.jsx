import React from "react";
import SpotlightCard from "./SpotlightCard";

const IntegrationCard = ({
  name,
  icon: Icon,
  description,
  comingSoon = false,
}) => {
  return (
    <SpotlightCard
      className={`rounded-xl p-6 transition-all duration-300 relative ${
        comingSoon ? "opacity-60" : "hover:scale-[1.05] cursor-pointer"
      }`}
    >
      {comingSoon && (
        <div
          className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            background: "rgba(138, 165, 255, 0.3)",
            color: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(8px)",
          }}
        >
          Coming Soon
        </div>
      )}

      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
          style={{
            background: comingSoon
              ? "rgba(100, 100, 100, 0.4)"
              : "rgba(41, 52, 255, 0.6)",
            boxShadow: comingSoon
              ? "0 4px 16px rgba(0, 0, 0, 0.2)"
              : "0 8px 24px rgba(41, 52, 255, 0.4)",
          }}
        >
          {Icon && <Icon className="text-white text-3xl" />}
        </div>

        {/* Name */}
        <h3 className="text-xl font-bold text-white mb-2">{name}</h3>

        {/* Description */}
        {description && <p className="text-gray-400 text-sm">{description}</p>}
      </div>
    </SpotlightCard>
  );
};

export default IntegrationCard;
