import React from "react";

const InfiniteScroll = ({ right = false }) => {
  // Logo items - you can replace these with your actual logo URLs
  const logos = [
    { name: "Opal", opacity: 0.4 },
    { name: "Dune", opacity: 0.4 },
    { name: "Oasis", opacity: 0.7 },
    { name: "Asterisk", opacity: 0.4 },
    { name: "Cooks", opacity: 0.5 },
    { name: "Opal", opacity: 0.4 },
    { name: "Dune", opacity: 0.4 },
    { name: "Oasis", opacity: 0.7 },
    { name: "Asterisk", opacity: 0.4 },
    { name: "Cooks", opacity: 0.5 },
    { name: "Opal", opacity: 0.3 },
  ];

  return (
    <div className="carousel-continaer max-w-5xl mx-auto w-full overflow-hidden">
      {/* Scrolling container with opacity mask */}
      <div
        className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 40%, transparent 100%)",
        }}
      />
      {/* Right fade overlay */}
      <div
        className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(-90deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 40%, transparent 100%)",
        }}
      />
      <div className={right ? "carousel-group-right" : "carousel-group"}>
        {logos.map((logo, index) => (
          <div
            key={index}
            className="carousel-item"
            style={{
              opacity: logo.opacity,
            }}
          >
            <span className="text-2xl md:text-3xl font-bold text-white whitespace-nowrap">
              {logo.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfiniteScroll;
