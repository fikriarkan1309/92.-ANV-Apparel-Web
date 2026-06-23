"use client";

import React from "react";
import { motion, Variants } from "motion/react";
import { cn } from "../../lib/utils";

// Props interface for the component
interface AnimatedMarqueeHeroProps {
  tagline: string;
  title: React.ReactNode;
  description: string;
  ctaText: string;
  images: string[];
  className?: string;
  onCtaClick?: () => void;
}

// Reusable Button component styled like in the image
const ActionButton = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="px-6 py-3 rounded-xl bg-orange-600 text-white font-extrabold uppercase tracking-wider text-xs md:text-sm shadow-md shadow-orange-600/20 hover:bg-orange-500 hover:shadow-orange-600/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75 cursor-pointer flex items-center justify-center gap-2"
  >
    {children}
  </motion.button>
);

// The main hero component
export const AnimatedMarqueeHero: React.FC<AnimatedMarqueeHeroProps> = ({
  tagline,
  title,
  description,
  ctaText,
  images,
  className,
  onCtaClick,
}) => {
  // Animation variants for the text content
  const FADE_IN_ANIMATION_VARIANTS: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring" as const, 
        stiffness: 100, 
        damping: 20 
      } 
    },
  };

  // Duplicate images for a seamless loop
  const duplicatedImages = [...images, ...images];

  return (
    <section
      className={cn(
        "relative w-full h-[80vh] min-h-[500px] overflow-hidden bg-neutral-950 flex flex-col items-center justify-start px-4 pt-4 md:pt-6",
        className
      )}
    >
      {/* Background radial soft orange glow */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Main core content with safe bottom padding to clear the 1/3 h marquee slider */}
      <div className="z-10 w-full max-w-7xl mx-auto px-4 md:px-8 select-none pt-4 md:pt-6 flex flex-col items-start justify-start">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 w-full items-center">
          
          {/* Left Column: Headline and Sub description */}
          <div className="md:col-span-8 flex flex-col items-start text-left">
            {/* Main Title */}
            <motion.h1
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] uppercase"
            >
              {typeof title === "string" ? (
                title.split(" ").map((word, i) => (
                  <motion.span
                    key={i}
                    variants={FADE_IN_ANIMATION_VARIANTS}
                    className="inline-block"
                  >
                    {word}&nbsp;
                  </motion.span>
                ))
              ) : (
                title
              )}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial="hidden"
              animate="show"
              variants={FADE_IN_ANIMATION_VARIANTS}
              transition={{ delay: 0.3 }}
              className="mt-3 text-xs md:text-sm text-neutral-350 font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] max-w-3xl"
            >
              {description}
            </motion.p>
          </div>

          {/* Right Column: CTA Button */}
          <div className="md:col-span-4 flex justify-start md:justify-end items-center w-full">
            <motion.div
              initial="hidden"
              animate="show"
              variants={FADE_IN_ANIMATION_VARIANTS}
              transition={{ delay: 0.4 }}
              className="w-full md:w-auto"
            >
              <ActionButton onClick={onCtaClick}>{ctaText}</ActionButton>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Animated Image Marquee */}
      <div className="absolute bottom-4 left-0 w-full h-[150px] sm:h-[180px] md:h-[240px] z-10 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] overflow-hidden pointer-events-none select-none">
        <motion.div
          className="flex gap-4 min-w-full"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            ease: "linear",
            duration: 35,
            repeat: Infinity,
          }}
        >
          {duplicatedImages.map((src, index) => (
            <div
              key={index}
              className="relative aspect-[3/4] h-24 sm:h-28 md:h-36 flex-shrink-0"
              style={{
                rotate: `${(index % 2 === 0 ? -1.5 : 2.5)}deg`,
              }}
            >
              <img
                src={src}
                alt={`Showcase image ${index + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-xl shadow-lg border border-neutral-800"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
