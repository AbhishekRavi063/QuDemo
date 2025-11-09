import React from "react";

const InfiniteScroll = ({ right = false }) => {
  // Logo items - you can replace these with your actual logo URLs
  const logos = [
    {
      name: "Opal",
      opacity: 0.4,
      image:
        "https://framerusercontent.com/images/otv1rEDn2X7h8TFtKPCksQmAEKQ.svg?width=75&height=17",
    },
    {
      name: "Dune",
      opacity: 0.4,
      image:
        "https://framerusercontent.com/images/rrRoFs4icQtustYbIGm5r5DXREI.svg?width=50&height=17",
    },
    {
      name: "Oasis",
      opacity: 0.7,
      image:
        "https://framerusercontent.com/images/hhTRf8RciR9bakkAgIckAkEiQM.svg?width=57&height=18",
    },
    {
      name: "Asterisk",
      opacity: 0.4,
      image:
        "https://framerusercontent.com/images/1ph1389RD4RtUDEfqVhWbujyF7s.svg?width=56&height=20",
    },
    {
      name: "Cooks",
      opacity: 0.5,
      image:
        "https://framerusercontent.com/images/Yn3MOOL9rTXhK9U8MLvSnEoNP8.svg?width=45&height=14",
    },
    {
      name: "Opal",
      opacity: 0.4,
      image:
        "https://framerusercontent.com/images/otv1rEDn2X7h8TFtKPCksQmAEKQ.svg?width=75&height=17",
    },
    {
      name: "Dune",
      opacity: 0.4,
      image:
        "https://framerusercontent.com/images/rrRoFs4icQtustYbIGm5r5DXREI.svg?width=50&height=17",
    },
    {
      name: "Oasis",
      opacity: 0.7,
      image:
        "https://framerusercontent.com/images/hhTRf8RciR9bakkAgIckAkEiQM.svg?width=57&height=18",
    },
    {
      name: "Asterisk",
      opacity: 0.4,
      image:
        "https://framerusercontent.com/images/1ph1389RD4RtUDEfqVhWbujyF7s.svg?width=56&height=20",
    },
    {
      name: "Cooks",
      opacity: 0.5,
      image:
        "https://framerusercontent.com/images/Yn3MOOL9rTXhK9U8MLvSnEoNP8.svg?width=45&height=14",
    },
    {
      name: "Opal",
      opacity: 0.4,
      image:
        "https://framerusercontent.com/images/otv1rEDn2X7h8TFtKPCksQmAEKQ.svg?width=75&height=17",
    },
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
            <img
              decoding="auto"
              width="80"
              height="26"
              src={logo.image}
              alt=""
              style={{
                display: "block",
                height: "26px",
                width: "auto",
                borderRadius: "inherit",
                objectPosition: "center center",
                objectFit: "cover",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfiniteScroll;
