import React from "react";

const InfiniteScroll = ({ right = false }) => {
  // Logo items - you can replace these with your actual logo URLs
  const logos = [
    {
      name: "Opal",
      opacity: 1,
      image: "/zuna.png",
    },
    {
      name: "Dune",
      opacity: 1,
      image: "/thaklis logo.png",
    },
    {
      name: "Oasis",
      opacity: 1,
      image: "/rateup-logo-blue-text.svg",
    },
    {
      name: "Asterisk",
      opacity: 1,
      image: "/katha-logo-ignite.png",
    },
    {
      name: "Cooks",
      opacity: 1,
      image: "/dgymbook.png",
    },
    {
      name: "Opal",
      opacity: 1,
      image: "/zuna.png",
    },
    {
      name: "Dune",
      opacity: 1,
      image: "/thaklis logo.png",
    },
    {
      name: "Oasis",
      opacity: 1,
      image: "/rateup-logo-blue-text.svg",
    },
    {
      name: "Asterisk",
      opacity: 1,
      image: "/katha-logo-ignite.png",
    },
    {
      name: "Cooks",
      opacity: 1,
      image: "/dgymbook.png",
    },
    {
      name: "Opal",
      opacity: 1,
      image: "/zuna.png",
    },
  ];

  return (
    <div className="carousel-continaer max-w-5xl mx-auto w-full overflow-hidden my-10">
      {/* Scrolling container with opacity mask - hidden on mobile */}
      <div
        className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none hidden md:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 40%, transparent 100%)",
        }}
      />
      {/* Right fade overlay - hidden on mobile */}
      <div
        className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none hidden md:block"
        style={{
          background:
            "linear-gradient(-90deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 40%, transparent 100%)",
        }}
      />
      <div className={right ? "carousel-group-logos-right" : "carousel-group-logos"}>
        {logos.map((logo, index) => (
          <div
            key={index}
            className="carousel-item flex items-center"
            style={{
              opacity: logo.opacity,
            }}
          >
            <img
              decoding="auto"
              width="80"
              height="26"
              src={logo.image}
              alt=""
              style={{
                display: "block",
                maxHeight: "62px",
                margin: "0 auto",
                width: "auto",
                borderRadius: "inherit",
                objectPosition: "center center",
                objectFit: "contain",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfiniteScroll;
