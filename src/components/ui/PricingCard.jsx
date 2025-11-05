import React from "react";
import { FaCheck } from "react-icons/fa";
import SpotlightCard from "./SpotlightCard";

const PricingCard = ({
  title,
  price,
  period = "month",
  features,
  isPopular = false,
  buttonText = "Get Started",
  onButtonClick,
  customPrice = false,
  className,
}) => {
  return (
    <SpotlightCard
      className={`rounded-2xl p-8 border transition-all duration-300 h-full flex flex-col relative ${
        isPopular ? "hover:scale-[1.05] scale-[1.02]" : "hover:scale-[1.02]"
      } ${className}`}
      style={{
        background: isPopular
          ? "linear-gradient(135deg, rgba(41, 52, 255, 0.3) 0%, rgba(18, 20, 38, 0.7) 100%)"
          : "rgba(18, 20, 38, 0.6)",
        backdropFilter: "blur(16px)",
        borderColor: isPopular
          ? "rgba(138, 165, 255, 0.5)"
          : "rgba(138, 165, 255, 0.3)",
        boxShadow: isPopular
          ? "0 12px 48px rgba(41, 52, 255, 0.4)"
          : "0 8px 32px rgba(41, 52, 255, 0.2)",
      }}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
          style={{
            background:
              "linear-gradient(135deg, rgba(41, 52, 255, 0.9) 0%, rgba(138, 165, 255, 0.9) 100%)",
            boxShadow: "0 4px 16px rgba(41, 52, 255, 0.5)",
          }}
        >
          MOST POPULAR
        </div>
      )}

      {/* Title */}
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>

      {/* Price */}
      <div className="mb-6">
        {customPrice ? (
          <div className="text-4xl font-bold text-white">Custom</div>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-white">${price}</span>
              <span className="text-gray-400 text-lg">/{period}</span>
            </div>
          </>
        )}
      </div>

      {/* Features List */}
      <div className="space-y-4 mb-8 flex-grow">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                background: "rgba(41, 52, 255, 0.6)",
                boxShadow: "0 2px 8px rgba(41, 52, 255, 0.3)",
              }}
            >
              <FaCheck className="text-white text-xs" />
            </div>
            <span className="text-gray-300 text-sm leading-relaxed">
              {feature}
            </span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button
        onClick={onButtonClick}
        className="w-full py-3 rounded-xl font-semibold transition-all duration-300 mt-auto"
        style={{
          background: isPopular
            ? "linear-gradient(135deg, rgba(41, 52, 255, 0.9) 0%, rgba(138, 165, 255, 0.9) 100%)"
            : "rgba(41, 52, 255, 0.7)",
          boxShadow: isPopular
            ? "0 8px 24px rgba(41, 52, 255, 0.4)"
            : "0 4px 16px rgba(41, 52, 255, 0.2)",
          border: "1px solid rgba(138, 165, 255, 0.3)",
          color: "white",
        }}
      >
        {buttonText}
      </button>
    </SpotlightCard>
  );
};

export default PricingCard;
