import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { GameTheme, GameDifficulty } from '../types/game';
import Image from 'next/image';

interface LocalGameSetupProps {
  onStart: (
    player1Name: string,
    player2Name: string,
    theme: GameTheme,
    difficulty: GameDifficulty
  ) => void;
  onBack: () => void;
  initialP1Name: string;
  initialP2Name: string;
  initialTheme: GameTheme;
  initialDifficulty: GameDifficulty;
}

const LocalGameSetup: React.FC<LocalGameSetupProps> = ({
  onStart,
  onBack,
  initialP1Name,
  initialP2Name,
  initialTheme,
  initialDifficulty
}) => {
  // Form state
  const [player1Name, setPlayer1Name] = useState(initialP1Name);
  const [player2Name, setPlayer2Name] = useState(initialP2Name);
  const [selectedTheme, setSelectedTheme] = useState<GameTheme>(initialTheme);
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>(initialDifficulty);
  const [hoveredDifficulty, setHoveredDifficulty] = useState<GameDifficulty | null>(null);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(
      player1Name || 'Player 1',
      player2Name || 'Player 2',
      selectedTheme,
      selectedDifficulty
    );
  };

  return (
    <div 
      className="w-full min-h-[calc(100vh-180px)] flex flex-col items-center justify-center py-8"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(8, 8, 8, 0.80) 0%, rgba(0, 0, 0, 0.85) 100%)',
        backgroundSize: 'cover',
        borderRadius: '25px',
      }}
    >
      <div className="w-full max-w-3xl px-6">
        {/* Header */}
        <div className="text-center mb-10 relative">
          <button 
            onClick={onBack}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-[#40CFB7] hover:text-white transition-colors duration-300"
            style={{ textShadow: '0 0 10px rgba(64,207,183,0.7)' }}
          >
            ← Back
          </button>
          
          <h1 className="text-5xl font-bold mb-4 tracking-wider font-orbitron" style={{
            color: '#40CFB7',
            textShadow: '0 0 10px #40CFB7, 0 0 20px rgba(208,95,59,0.8), 0 0 30px rgba(208,95,59,0.4)',
          }}>
            GAME SETUP
          </h1>
        </div>

        {/* Setup Form with Neon Border */}
        <div className="relative">
          {/* Neon border */}
          <div className="absolute inset-0 rounded-xl border-2 border-[#40CFB7] shadow-[0_0_15px_rgba(64,207,183,0.6)]" />
          
          <form onSubmit={handleSubmit} className="relative bg-black bg-opacity-80 rounded-xl p-8 space-y-8 z-10">
            {/* Player Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Player 1 */}
              <div className="space-y-3">
                <label className="text-[#D05F3B] font-bold" style={{ textShadow: '0 0 5px rgba(208,95,59,0.5)' }}>
                  PLAYER 1
                </label>
                <Input
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  placeholder="Enter name"
                  className="bg-black border-2 border-[#D05F3B] text-white rounded-lg focus:ring-[#D05F3B] focus:border-[#D05F3B] shadow-[0_0_10px_rgba(208,95,59,0.3)]"
                  style={{ 
                    height: '50px',
                    fontSize: '16px'
                  }}
                />
              </div>

              {/* Player 2 */}
              <div className="space-y-3">
                <label className="text-[#40CFB7] font-bold" style={{ textShadow: '0 0 5px rgba(64,207,183,0.5)' }}>
                  PLAYER 2
                </label>
                <Input
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  placeholder="Enter name"
                  className="bg-black border-2 border-[#40CFB7] text-white rounded-lg focus:ring-[#40CFB7] focus:border-[#40CFB7] shadow-[0_0_10px_rgba(64,207,183,0.3)]"
                  style={{ 
                    height: '50px',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>

            {/* Theme Selection */}
            <div className="space-y-5">
              <h2 className="text-white text-xl font-bold">SELECT THEME</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fire Theme */}
                <div 
                  className={`relative cursor-pointer rounded-xl border-2 transition-all duration-500 ${
                    selectedTheme === 'fire' 
                      ? 'border-[#D05F3B] shadow-[0_0_15px_rgba(208,95,59,0.7)]' 
                      : 'border-gray-700'
                  }`}
                  onClick={() => setSelectedTheme('fire')}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-[#D05F3B] font-bold">Fire Theme</h3>
                      <p className="text-gray-400 text-sm">Hot orange glow</p>
                    </div>
                    <div className="w-12 h-12 flex items-center justify-center">
                      <Image
                        src="/assets/icons/fire-icon.svg"
                        alt="Fire Theme"
                        width={32}
                        height={32}
                      />
                    </div>
                  </div>
                </div>

                {/* Water Theme */}
                <div 
                  className={`relative cursor-pointer rounded-xl border-2 transition-all duration-500 ${
                    selectedTheme === 'water' 
                      ? 'border-[#40CFB7] shadow-[0_0_15px_rgba(64,207,183,0.7)]' 
                      : 'border-gray-700'
                  }`}
                  onClick={() => setSelectedTheme('water')}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-[#40CFB7] font-bold">Water Theme</h3>
                      <p className="text-gray-400 text-sm">Cool teal effect</p>
                    </div>
                    <div className="w-12 h-12 flex items-center justify-center">
                      <Image
                        src="/assets/icons/water-icon.svg"
                        alt="Water Theme"
                        width={32}
                        height={32}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-5">
              <h2 className="text-white text-xl font-bold">SELECT DIFFICULTY</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Easy */}
                <motion.div
                  className={`relative cursor-pointer rounded-xl border-2 transition-all duration-300 ${
                    selectedDifficulty === 'easy' 
                      ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.7)]' 
                      : 'border-gray-700'
                  }`}
                  onClick={() => setSelectedDifficulty('easy')}
                  onMouseEnter={() => setHoveredDifficulty('easy')}
                  onMouseLeave={() => setHoveredDifficulty(null)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="p-4 flex justify-center items-center">
                    <span className={`font-bold ${selectedDifficulty === 'easy' ? 'text-green-500' : 'text-white'}`}>
                      EASY
                    </span>
                  </div>
                </motion.div>

                {/* Medium */}
                <motion.div
                  className={`relative cursor-pointer rounded-xl border-2 transition-all duration-300 ${
                    selectedDifficulty === 'medium' 
                      ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.7)]' 
                      : 'border-gray-700'
                  }`}
                  onClick={() => setSelectedDifficulty('medium')}
                  onMouseEnter={() => setHoveredDifficulty('medium')}
                  onMouseLeave={() => setHoveredDifficulty(null)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="p-4 flex justify-center items-center">
                    <span className={`font-bold ${selectedDifficulty === 'medium' ? 'text-yellow-500' : 'text-white'}`}>
                      MEDIUM
                    </span>
                  </div>
                </motion.div>

                {/* Hard */}
                <motion.div
                  className={`relative cursor-pointer rounded-xl border-2 transition-all duration-300 ${
                    selectedDifficulty === 'hard' 
                      ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)]' 
                      : 'border-gray-700'
                  }`}
                  onClick={() => setSelectedDifficulty('hard')}
                  onMouseEnter={() => setHoveredDifficulty('hard')}
                  onMouseLeave={() => setHoveredDifficulty(null)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="p-4 flex justify-center items-center">
                    <span className={`font-bold ${selectedDifficulty === 'hard' ? 'text-red-500' : 'text-white'}`}>
                      HARD
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Start Game Button */}
            <motion.button
              type="submit"
              className="w-full py-4 mt-6 rounded-xl font-bold text-white text-xl bg-gradient-to-r"
              style={{
                backgroundImage: selectedTheme === 'fire' 
                  ? 'linear-gradient(to right, #D05F3B, #E67E22)' 
                  : 'linear-gradient(to right, #40CFB7, #2DD4BF)',
                boxShadow: selectedTheme === 'fire'
                  ? '0 0 20px rgba(208,95,59,0.5)'
                  : '0 0 20px rgba(64,207,183,0.5)'
              }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: selectedTheme === 'fire'
                  ? '0 0 25px rgba(208,95,59,0.8)'
                  : '0 0 25px rgba(64,207,183,0.8)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              START GAME
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LocalGameSetup;