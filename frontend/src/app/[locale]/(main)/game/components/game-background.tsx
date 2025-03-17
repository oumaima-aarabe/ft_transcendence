import React, { useEffect, useState } from "react";
import { GameTheme } from "../types/game";

interface GameBackgroundProps {
  isPlaying: boolean;
  theme: GameTheme;
}

const GameBackground: React.FC<GameBackgroundProps> = ({
  isPlaying,
  theme,
}) => {
  const [visible, setVisible] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<GameTheme>(theme);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (isPlaying) {
      // Smoother transition with a bit longer delay
      const timer = setTimeout(() => {
        setVisible(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isPlaying]);

  useEffect(() => {
    // Handle theme changes with more robust transition
    if (currentTheme !== theme && isPlaying) {
      setTransitioning(true);
      setVisible(false);

      const timer = setTimeout(() => {
        setCurrentTheme(theme);
        
        // Slight delay before making visible to ensure clean swap
        setTimeout(() => {
          setVisible(true);
        }, 100);

        // Reset transitioning state
        setTimeout(() => {
          setTransitioning(false);
        }, 700);
      }, 500);

      return () => clearTimeout(timer);
    } else if (!transitioning) {
      // Update theme immediately if not transitioning
      setCurrentTheme(theme);
    }
  }, [theme, isPlaying]);

  // Don't render anything if not playing and not visible
  if (!isPlaying && !visible) return null;

  const backgroundImage =
    currentTheme === "fire"
      ? "/assets/images/fire-game.png"
      : "/assets/images/water-game.png";

  return (
    <div
      className={`fixed inset-0 z-[5] transition-all duration-700 ease-in-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Background image with darkening filter */}
      <div className="relative w-full h-full">
        <img
          src={backgroundImage}
          alt={`${currentTheme} background`}
          className={`w-full h-full object-cover transition-all duration-700 ease-in-out transform
            ${visible ? 'scale-100 blur-0' : 'scale-105 blur-sm'}`}
        />
        
        {/* Absolute positioned dark overlay on top of the image */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-700 ease-in-out
            ${visible ? 'opacity-70' : 'opacity-0'}`}
        ></div>
      </div>
    </div>
  );
};

export default GameBackground;