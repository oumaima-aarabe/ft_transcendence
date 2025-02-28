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
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setVisible(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isPlaying]);

  useEffect(() => {
    // Handle theme changes
    if (currentTheme !== theme && isPlaying) {
      setTransitioning(true);
      setVisible(false);

      const timer = setTimeout(() => {
        setCurrentTheme(theme);
        setVisible(true);

        // Reset transitioning state
        setTimeout(() => {
          setTransitioning(false);
        }, 500);
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
      ? "/assets/images/fire-game.jpeg"
      : "/assets/images/water-game.jpeg";

  return (
    <div
      className={`fixed inset-0 z-[5] transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-black/50"></div>
      <img
        src={backgroundImage}
        alt={`${currentTheme} background`}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default GameBackground;
