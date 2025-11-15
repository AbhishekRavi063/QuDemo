import React from "react";
import { FaStar } from "react-icons/fa";
import SpotlightCard from "./SpotlightCard";
import {  FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const TestimonialCard = ({
  name,
  role,
  company,
  image,
  rating,
  testimonial,
}) => {
  return (
    <SpotlightCard>
      {/* Testimonial Text */}
      <p className="text-gray-300 text-base text-left leading-relaxedflex-grow">
        "{testimonial}"
      </p>

      <div className="flex items-center gap-1 my-4 mb-8">
  {[...Array(5)].map((_, index) => {
    const full = index + 1 <= Math.floor(rating);
    const half = !full && index < rating;

    return (
      <span key={index}>
        {full && <FaStar className="text-yellow-400" size={16} />}
        {half && <FaStarHalfAlt className="text-yellow-400" size={16} />}
        {!full && !half && <FaRegStar className="text-gray-600" size={16} />}
      </span>
    );
  })}

  {/* Rating number */}
  <span className="text-gray-400 text-sm ml-1">{rating}</span>
</div>

      {/* User Info */}
      <div className="flex items-center gap-3 mt-auto text-left mt-[60px]">
        <div
          className="w-10 h-10 rounded-full overflow-hidden"
          style={{
            borderColor: "rgba(138, 165, 255, 0.4)",
          }}
        >
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
              style={{
                background: "rgba(41, 52, 255, 0.6)",
              }}
            >
              {name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm">{name}</h4>
          <p className="text-gray-400 text-xs">
            {role} {company && `at ${company}`}
          </p>
        </div>
      </div>
    </SpotlightCard>
  );
};

export default TestimonialCard;
