import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { GameTheme, GameDifficulty } from '../types/game';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('Game');
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
      player1Name || t('player1'),
      player2Name || t('player2'),
      selectedTheme,
      selectedDifficulty
    );
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-4">
      <div className="bg-black bg-opacity-60 backdrop-blur-sm rounded-xl border-2 border-[#40CFB7] shadow-[0_0_15px_rgba(64,207,183,0.6)] w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6 relative px-6 pt-6">
          <button 
            onClick={onBack}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-[#40CFB7] hover:text-white transition-colors duration-300"
            style={{ textShadow: '0 0 10px rgba(64,207,183,0.7)' }}
          >
            ← {t('back')}
          </button>
          
          <h1 className="text-4xl font-bold tracking-wider font-orbitron" style={{
            color: '#40CFB7',
            textShadow: '0 0 10px #40CFB7, 0 0 20px rgba(208,95,59,0.8), 0 0 30px rgba(208,95,59,0.4)',
          }}>
            {t('gameSetup')}
          </h1>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Player Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Player 1 */}
            <div className="space-y-3">
              <label className="text-[#D05F3B] font-bold" style={{ textShadow: '0 0 5px rgba(208,95,59,0.5)' }}>
                {t('player1')}
              </label>
              <Input
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder="Enter name"
                className="bg-black bg-opacity-70 border-2 border-[#D05F3B] text-white rounded-lg focus:ring-[#D05F3B] focus:border-[#D05F3B] shadow-[0_0_10px_rgba(208,95,59,0.3)]"
                style={{ 
                  height: '50px',
                  fontSize: '16px'
                }}
              />
            </div>

            {/* Player 2 */}
            <div className="space-y-3">
              <label className="text-[#40CFB7] font-bold" style={{ textShadow: '0 0 5px rgba(64,207,183,0.5)' }}>
                {t('player2')}
              </label>
              <Input
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Enter name"
                className="bg-black bg-opacity-70 border-2 border-[#40CFB7] text-white rounded-lg focus:ring-[#40CFB7] focus:border-[#40CFB7] shadow-[0_0_10px_rgba(64,207,183,0.3)]"
                style={{ 
                  height: '50px',
                  fontSize: '16px'
                }}
              />
            </div>
          </div>

          {/* Theme Selection */}
          <div className="space-y-4">
            <h2 className="text-white text-xl font-bold">{t('selectTheme')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fire Theme */}
              <div 
                className={`relative cursor-pointer rounded-xl border-2 transition-all duration-500 backdrop-blur-sm bg-black bg-opacity-50 ${
                  selectedTheme === 'fire' 
                    ? 'border-[#D05F3B] shadow-[0_0_15px_rgba(208,95,59,0.7)]' 
                    : 'border-gray-700'
                }`}
                onClick={() => setSelectedTheme('fire')}
              >
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-[#D05F3B] font-bold">{t('fireTheme')}</h3>
                    <p className="text-gray-400 text-sm">{t('fireThemeDescription')}</p>
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
                className={`relative cursor-pointer rounded-xl border-2 transition-all duration-500 backdrop-blur-sm bg-black bg-opacity-50 ${
                  selectedTheme === 'water' 
                    ? 'border-[#40CFB7] shadow-[0_0_15px_rgba(64,207,183,0.7)]' 
                    : 'border-gray-700'
                }`}
                onClick={() => setSelectedTheme('water')}
              >
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-[#40CFB7] font-bold">{t('waterTheme')}</h3>
                    <p className="text-gray-400 text-sm">{t('waterThemeDescription')}</p>
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
          <div className="space-y-4">
            <h2 className="text-white text-xl font-bold">{t('selectDifficulty')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Easy */}
              <motion.div
                className={`relative cursor-pointer rounded-xl border-2 transition-all duration-300 backdrop-blur-sm bg-black bg-opacity-50 ${
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
                    {t('easy')}
                  </span>
                </div>
              </motion.div>

              {/* Medium */}
              <motion.div
                className={`relative cursor-pointer rounded-xl border-2 transition-all duration-300 backdrop-blur-sm bg-black bg-opacity-50 ${
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
                    {t('medium')}
                  </span>
                </div>
              </motion.div>

              {/* Hard */}
              <motion.div
                className={`relative cursor-pointer rounded-xl border-2 transition-all duration-300 backdrop-blur-sm bg-black bg-opacity-50 ${
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
                    {t('hard')}
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
            {t('startGame')}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default LocalGameSetup;