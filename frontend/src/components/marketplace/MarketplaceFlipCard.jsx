"use client";

import { motion, easeOut } from "motion/react";
import React from "react";

export function MarketplaceFlipCard({ data }) {
  const [isFlipped, setIsFlipped] = React.useState(false);

  const isTouchDevice =
    typeof window !== "undefined" && "ontouchstart" in window;

  const handleClick = () => {
    if (isTouchDevice) setIsFlipped(!isFlipped);
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice) setIsFlipped(true);
  };

  const handleMouseLeave = () => {
    if (!isTouchDevice) setIsFlipped(false);
  };

  const cardVariants = {
    front: { rotateY: 0, transition: { duration: 0.5, ease: easeOut } },
    back: { rotateY: 180, transition: { duration: 0.5, ease: easeOut } },
  };

  return (
    <div
      className="relative w-full h-full cursor-pointer perspective-1000"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* FRONT: Game Image and Basic Info */}
      <motion.div
        className="absolute inset-0 backface-hidden rounded-xl overflow-hidden flex flex-col items-center justify-end bg-gradient-to-b from-transparent to-black/60 p-4"
        animate={isFlipped ? "back" : "front"}
        variants={cardVariants}
        style={{ transformStyle: "preserve-3d" }}
      >
        <img
          src={data.image}
          alt={data.game || data.name}
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />
        <div className="text-center z-10 text-white">
          <h3 className="text-xl md:text-2xl font-bold mb-1">
            {data.game || data.name}
          </h3>
          <p className="text-lg md:text-xl font-semibold text-primary">
            ${data.price}
          </p>
        </div>
      </motion.div>

      {/* BACK: Details */}
      <motion.div
        className="absolute inset-0 backface-hidden rounded-xl border-2 border-primary/20 px-4 py-6 flex flex-col justify-between gap-y-3 bg-gradient-to-br from-surface-container via-background to-surface-container"
        initial={{ rotateY: 180 }}
        animate={isFlipped ? "front" : "back"}
        variants={cardVariants}
        style={{ transformStyle: "preserve-3d", rotateY: 180 }}
      >
        {/* Game Name */}
        <div>
          <h4 className="text-sm font-bold text-primary mb-2">
            {data.game || data.name}
          </h4>
          <p className="text-xs text-on-surface-variant line-clamp-2">
            {data.description || "Premium gaming account ready to use"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-primary/10 rounded-lg p-2">
            <p className="text-xs text-on-surface-variant">Price</p>
            <p className="text-sm font-bold text-primary">${data.price}</p>
          </div>
          <div className="bg-secondary/10 rounded-lg p-2">
            <p className="text-xs text-on-surface-variant">Years Active</p>
            <p className="text-sm font-bold text-secondary">
              {data.yearsActive || "N/A"}
            </p>
          </div>
          <div className="bg-tertiary/10 rounded-lg p-2">
            <p className="text-xs text-on-surface-variant">Rank</p>
            <p className="text-sm font-bold text-tertiary">
              {data.rank || "Standard"}
            </p>
          </div>
          <div
            className={`rounded-lg p-2 ${
              data.isSold || !data.isActive
                ? "bg-red-500/10"
                : "bg-green-500/10"
            }`}
          >
            <p className="text-xs text-on-surface-variant">Status</p>
            <p
              className={`text-sm font-bold ${
                data.isSold || !data.isActive
                  ? "text-red-400"
                  : "text-green-500"
              }`}
            >
              {data.isSold || !data.isActive ? "Sold" : "Active"}
            </p>
          </div>
        </div>

        {/* Footer Message */}
        <p className="text-xs text-on-surface-variant/70 text-center">
          Tap to flip â€¢ Instant delivery guaranteed
        </p>
      </motion.div>
    </div>
  );
}
