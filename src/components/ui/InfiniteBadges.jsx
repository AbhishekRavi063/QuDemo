import React from "react";

const InfiniteBadges = ({ right = false }) => {
  // Logo items - you can replace these with your actual logo URLs

  const logos = [
    { name: "Customizable Plans", opacity: 0.4 },
    { name: "Smart Insights", opacity: 0.4 },
    { name: "Instant Savings", opacity: 0.7 },
    { name: "Flexible Payments", opacity: 0.4 },
    { name: "Customizable Plans", opacity: 0.5 },
    { name: "Smart Insights", opacity: 0.4 },
    { name: "Instant Savings", opacity: 0.4 },
    { name: "Customizable Plans", opacity: 0.4 },
    { name: "Smart Insights", opacity: 0.4 },
    { name: "Instant Savings", opacity: 0.7 },
    { name: "Flexible Payments", opacity: 0.4 },
    { name: "Customizable Plans", opacity: 0.5 },
    { name: "Smart Insights", opacity: 0.4 },
    { name: "Instant Savings", opacity: 0.4 },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="carousel-container max-w-5xl mx-auto w-full overflow-x-hidden">
        {/* Scrolling container with opacity mask */}
        <div className="carousel-group">
          {logos.map((logo, index) => (
            <div key={index} className="carousel-item">
              <p className="bg-grad rounded-full text-white/40 py-4 px-6 whitespace-nowrap">
                {logo.name}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="carousel-container max-w-5xl mx-auto w-full overflow-x-hidden">
        {/* Scrolling container with opacity mask */}
        <div className="carousel-group-right">
          {logos.map((logo, index) => (
            <div key={index} className="carousel-item">
              <p className="bg-grad rounded-full text-white/40 py-4 px-6 whitespace-nowrap">
                {logo.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfiniteBadges;
