import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GameTheme, GameDifficulty } from '../types/game';
import { Flame, Waves, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface GamePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (theme: GameTheme, difficulty: GameDifficulty) => void;
  initialTheme: GameTheme;
  initialDifficulty: GameDifficulty;
}

const GamePreferencesModal: React.FC<GamePreferencesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTheme,
  initialDifficulty
}) => {
  const [selectedTheme, setSelectedTheme] = useState<GameTheme>(initialTheme);
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>(initialDifficulty);
  const [isSaving, setIsSaving] = useState(false);
  const t = useTranslations('Game');

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Update server preferences through the onSave prop
      onSave(selectedTheme, selectedDifficulty);
      
      // brief delay to show saving state
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 300);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-black bg-opacity-80 rounded-xl border-2 border-gray-700 shadow-xl w-full max-w-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gray-900 p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">{t('gamePreferences')}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Theme Selection */}
          <div className="space-y-4">
            <h3 className="text-xl text-white">{t('selectTheme')}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <Flame className="text-[#D05F3B]" size={32} />
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
                    <Waves className="text-[#40CFB7]" size={32} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-4">
            <h3 className="text-xl text-white">{t('selectDifficulty')}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Easy */}
              <motion.div
                className={`relative cursor-pointer rounded-xl border-2 transition-all duration-300 backdrop-blur-sm bg-black bg-opacity-50 ${
                  selectedDifficulty === 'easy' 
                    ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.7)]' 
                    : 'border-gray-700'
                }`}
                onClick={() => setSelectedDifficulty('easy')}
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
        </div>

        {/* Footer with buttons */}
        <div className="border-t border-gray-700 p-6 flex justify-end space-x-4">
          <Button
            onClick={onClose}
            className="bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className={`text-white hover:opacity-90`}
            style={{ 
              backgroundColor: selectedTheme === 'fire' ? '#D05F3B' : '#40CFB7'
            }}
          >
            {isSaving ? (
              <div className="flex items-center">
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                {t('saving')}
              </div>
            ) : (
              t('savePreferences')
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default GamePreferencesModal;