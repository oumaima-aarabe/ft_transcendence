import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface GameOptionsProps {
  onSelectMode: (mode: 'local' | 'invite' | 'matchmaking') => void;
}

const GameOptions: React.FC<GameOptionsProps> = ({ onSelectMode }) => {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const options = [
    {
      id: 'local',
      title: 'Local Game',
      description: 'Play against a friend on the same device',
      theme: 'fire',
      icon: '/assets/icons/icon-pong.svg',
      clickHandler: () => onSelectMode('local')
    },
    {
      id: 'invite',
      title: 'Invite a Friend',
      description: 'Send an invitation to play remotely',
      theme: 'water',
      icon: '/assets/icons/icon-@.svg',
      clickHandler: () => onSelectMode('invite')
    },
    {
      id: 'matchmaking',
      title: 'Matchmaking',
      description: 'Find opponents and compete online',
      theme: 'fire',
      icon: '/assets/icons/icon-user.svg',
      clickHandler: () => onSelectMode('matchmaking')
    }
  ];

  return (
    <div
        className="w-full min-h-[calc(100vh-180px)] flex flex-col items-center justify-center py-8"
        style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(8, 8, 8, 0.80) 0%, rgba(0, 0, 0, 0.85) 100%)',
            backgroundSize: 'cover',
            borderRadius: '25px',
        }}
    >
    <div className="w-full max-w-5xl px-6">
        {/* Game Mode Header - moved closer to cards */}
        <div className="text-center mb-10">
        <h1 className="text-5xl font-bold mb-4 tracking-wider font-orbitron" style={{
            color: '#40CFB7',
            textShadow: '0 0 10px #40CFB7, 0 0 20px rgba(208,95,59,0.8), 0 0 30px rgba(208,95,59,0.4)',
        }}>
            GAME MODE
        </h1>
        </div>
        
        {/* Reduced gap between cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <AnimatePresence>
            {options.map((option, index) => (
            <motion.div
                key={option.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative"
                onMouseEnter={() => setHoveredOption(option.id)}
                onMouseLeave={() => setHoveredOption(null)}
            >
                {/* Neon border effect with smoother transition */}
                <div 
                className={`absolute inset-0 rounded-xl ${
                    option.theme === 'fire' 
                    ? 'border-[#D05F3B] shadow-[0_0_15px_rgba(208,95,59,0.6)]' 
                    : 'border-[#40CFB7] shadow-[0_0_15px_rgba(64,207,183,0.6)]'
                } border-2 transition-all duration-700`}
                style={{
                    boxShadow: hoveredOption === option.id 
                    ? (option.theme === 'fire' 
                        ? '0 0 25px 5px rgba(208,95,59,0.8)' 
                        : '0 0 25px 5px rgba(64,207,183,0.8)')
                    : (option.theme === 'fire'
                        ? '0 0 15px rgba(208,95,59,0.6)'
                        : '0 0 15px rgba(64,207,183,0.6)')
                }}
                ></div>
                
                <Card 
                className="relative cursor-pointer h-80 overflow-hidden rounded-xl border-0 bg-black bg-opacity-80"
                onClick={option.clickHandler}
                >
                {/* Card content with smoother transitions */}
                <div className="relative p-6 h-full flex flex-col items-center justify-center">
                    <motion.div
                    className="w-full h-full flex flex-col items-center justify-center"
                    animate={{ 
                        scale: hoveredOption === option.id ? 1.05 : 1
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                    <div className="flex flex-col items-center justify-center text-center h-full">
                        <div 
                        className={`mb-6 p-4 rounded-full transition-all duration-500 ${
                            option.theme === 'fire' 
                            ? 'bg-[#D05F3B]' 
                            : 'bg-[#40CFB7]'
                        }`}
                        style={{
                            boxShadow: hoveredOption === option.id
                            ? (option.theme === 'fire' 
                                ? '0 0 15px rgba(208,95,59,0.7)' 
                                : '0 0 15px rgba(64,207,183,0.7)')
                            : 'none'
                        }}
                        >
                        <img src={option.icon} alt={option.title} className="w-8 h-8" />
                        </div>
                        
                        <h3 className={`text-xl font-bold mb-3 transition-all duration-500 ${
                        option.theme === 'fire' ? 'text-[#D05F3B]' : 'text-[#40CFB7]'
                        }`}>
                        {option.title}
                        </h3>
                        
                        <p className="text-gray-400 mb-6 text-sm transition-all duration-500">
                        {option.description}
                        </p>
                        
                        {/* Button with smoother fade in/out */}
                        <motion.button
                        className={`mt-2 px-6 py-2 rounded-full font-bold ${
                            option.theme === 'fire' 
                            ? 'bg-[#D05F3B] text-white' 
                            : 'bg-[#40CFB7] text-white'
                        }`}
                        style={{
                            boxShadow: option.theme === 'fire' 
                            ? '0 0 15px rgba(208,95,59,0.7)' 
                            : '0 0 15px rgba(64,207,183,0.7)'
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ 
                            opacity: hoveredOption === option.id ? 1 : 0, 
                            y: hoveredOption === option.id ? 0 : 10 
                        }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        >
                        SELECT
                        </motion.button>
                    </div>
                    </motion.div>
                </div>
                </Card>
            </motion.div>
            ))}
        </AnimatePresence>
        </div>
    </div>
    </div>
  );
};

export default GameOptions;