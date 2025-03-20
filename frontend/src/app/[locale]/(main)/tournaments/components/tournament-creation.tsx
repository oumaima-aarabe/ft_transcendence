"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from 'next-intl';
import { GameTheme, GameDifficulty, TournamentPlayer } from '../types/tournament';
import { ChevronLeft, ChevronRight, Award, Settings, Users } from 'lucide-react';

interface TournamentCreationProps {
  onTournamentStart: (players: TournamentPlayer[], difficulty: GameDifficulty) => void;
  setTournamentStage: (stage: 'intro' | 'create' | 'tournament') => void;
}

export default function TournamentCreation({ onTournamentStart, setTournamentStage }: TournamentCreationProps) {
  const t = useTranslations('Tournaments');
  const [players, setPlayers] = useState<TournamentPlayer[]>([
    { id: 1, name: '', avatar: 'https://iili.io/2D8ByIj.png', color: 'water' },
    { id: 2, name: '', avatar: 'https://iili.io/2D8ByIj.png', color: 'fire' },
    { id: 3, name: '', avatar: 'https://iili.io/2D8ByIj.png', color: 'water' },
    { id: 4, name: '', avatar: 'https://iili.io/2D8ByIj.png', color: 'fire' },
  ]);
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');
  const [activePage, setActivePage] = useState<'settings' | 'players'>('settings');

  const handlePlayerChange = (id: number, field: keyof TournamentPlayer, value: string) => {
    setPlayers(prev => 
      prev.map(player => 
        player.id === id ? { ...player, [field]: value } : player
      )
    );
  };

  const handleStartTournament = () => {
    // Validate all players have names
    const allPlayersNamed = players.every(player => player.name.trim() !== '');
    
    if (!allPlayersNamed) {
      alert(t('allPlayersRequired'));
      return;
    }
    
    onTournamentStart(players, difficulty);
  };

  const getPlayerColor = (color: GameTheme) => {
    return color === 'fire' ? '#D05F3B' : '#40CFB7';
  };

  const pageVariants = {
    hidden: { opacity: 0, x: 10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 }
  };

  return (
    <motion.div 
      className="rounded-xl bg-black/80 backdrop-blur-lg p-8 border border-gray-800 shadow-2xl"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-4xl mx-auto"
      >
        <div className="text-center mb-10">
          <motion.h1 
            className="text-5xl font-bold tracking-wider font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-[#40CFB7] to-[#35b7a2]"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              color: "#40CFB7",
              textShadow:
                "0 0 10px #40CFB7, 0 0 20px rgba(208,95,59,0.8), 0 0 30px rgba(208,95,59,0.4)",
            }}
          >
            {t('createTournament')}
          </motion.h1>
          <motion.p 
            className="text-gray-400 mt-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            {t('enterPlayers')}
          </motion.p>
        </div>

        <div className="mb-8 relative">
          <div className="flex justify-center mb-6">
            <div className="flex bg-gray-900/50 backdrop-blur-md rounded-full p-1.5 space-x-1">
              <motion.button
                className={`px-6 py-2.5 rounded-full flex items-center justify-center space-x-2 transition-colors ${
                  activePage === 'settings' 
                    ? 'bg-gradient-to-r from-[#40CFB7]/90 to-[#35b7a2]/90 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActivePage('settings')}
                whileHover={{ scale: activePage === 'settings' ? 1 : 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Settings className="mr-2" />
                <span>{t('tournamentSettings')}</span>
              </motion.button>
              <motion.button
                className={`px-6 py-2.5 rounded-full flex items-center justify-center space-x-2 transition-colors ${
                  activePage === 'players' 
                    ? 'bg-gradient-to-r from-[#40CFB7]/90 to-[#35b7a2]/90 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActivePage('players')}
                whileHover={{ scale: activePage === 'players' ? 1 : 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Users className="mr-2" />
                <span>{t('players')}</span>
              </motion.button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activePage === 'settings' && (
              <motion.div
                key="settings"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageVariants}
                transition={{ duration: 0.3 }}
                className="bg-black/50 backdrop-blur-md p-6 rounded-xl border border-gray-800 shadow-inner"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="difficulty" className="text-white font-medium mb-2 block flex items-center">
                      <Award className="mr-2 text-[#40CFB7]" />
                      {t('difficulty')}
                    </Label>
                    <Select 
                      value={difficulty} 
                      onValueChange={(value: GameDifficulty) => setDifficulty(value)}
                    >
                      <SelectTrigger className="w-full bg-[#1A1311]/60 backdrop-blur-md border-white/20 text-white rounded-lg h-12 transition duration-300 shadow-sm hover:shadow-md focus:ring-2 focus:ring-[#40CFB7]/30 focus:border-[#40CFB7]">
                        <SelectValue placeholder={t('selectDifficulty')} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1311]/90 backdrop-blur-lg border-white/10 text-white rounded-lg shadow-xl">
                        <SelectItem value="easy" className="hover:bg-white/10 py-2 cursor-pointer">{t('easy')}</SelectItem>
                        <SelectItem value="medium" className="hover:bg-white/10 py-2 cursor-pointer">{t('medium')}</SelectItem>
                        <SelectItem value="hard" className="hover:bg-white/10 py-2 cursor-pointer">{t('hard')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}

            {activePage === 'players' && (
              <motion.div
                key="players"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageVariants}
                transition={{ duration: 0.3 }}
              >                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className="rounded-xl overflow-hidden"
                    >
                      <Card className="bg-black/50 backdrop-blur-md border-gray-800 hover:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                        <div className={`h-1.5 w-full ${player.color === 'fire' ? 'bg-[#D05F3B]' : 'bg-[#40CFB7]'}`}></div>
                        <div className="p-5">
                          <div className="flex items-center space-x-4 mb-5">
                            <div 
                              className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-lg relative
                                ${player.color === 'fire' 
                                  ? 'border-[#D05F3B] shadow-[#D05F3B]/20' 
                                  : 'border-[#40CFB7] shadow-[#40CFB7]/20'}`}
                            >
                              <span className="text-xl font-bold text-white">{index + 1}</span>
                              <motion.div 
                                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30"
                                initial={false}
                                animate={{ scale: [1, 1.08, 1], opacity: [0, 0.2, 0] }}
                                transition={{ 
                                  repeat: Infinity, 
                                  duration: 2,
                                  ease: "easeInOut"
                                }}
                                style={{ 
                                  backgroundColor: getPlayerColor(player.color)
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <Label htmlFor={`player-${player.id}-name`} className="text-white mb-1.5 block font-medium">
                                {t('playerName')} {index + 1}
                              </Label>
                              <Input
                                id={`player-${player.id}-name`}
                                value={player.name}
                                onChange={(e) => handlePlayerChange(player.id, 'name', e.target.value)}
                                placeholder={`${t('player')} ${index + 1}`}
                                className="bg-gray-900/50 backdrop-blur-sm border-gray-700 text-white rounded-lg h-11
                                hover:border-white/30 focus:border-[#40CFB7] focus:ring-2 focus:ring-[#40CFB7]/30
                                transition-all duration-300 shadow-inner"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`player-${player.id}-color`} className="text-white mb-1.5 block font-medium">
                              {t('playerColor')}
                            </Label>
                            <Select 
                              value={player.color} 
                              onValueChange={(value: GameTheme) => handlePlayerChange(player.id, 'color', value)}
                            >
                              <SelectTrigger 
                                id={`player-${player.id}-color`}
                                className="w-full bg-gray-900/50 backdrop-blur-sm border-gray-700 text-white rounded-lg h-11
                                hover:border-white/30 focus:border-[#40CFB7] focus:ring-2 focus:ring-[#40CFB7]/30
                                transition-all duration-300 shadow-inner"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#1A1311]/90 backdrop-blur-lg border-white/10 text-white rounded-lg shadow-xl">
                                <SelectItem value="fire" className="hover:bg-white/10 py-2 cursor-pointer">
                                  <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-[#D05F3B] mr-2"></div>
                                    <span className="text-[#D05F3B]">{t('fire')}</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="water" className="hover:bg-white/10 py-2 cursor-pointer">
                                  <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-[#40CFB7] mr-2"></div>
                                    <span className="text-[#40CFB7]">{t('water')}</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div 
          className="flex justify-between mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={() => setTournamentStage('intro')}
              variant="outline" 
              className="border-white/10 bg-black/40 backdrop-blur-sm hover:bg-[#A86F43]/20 hover:border-white/20 
              text-white/80 hover:text-white px-6 py-6 h-12 rounded-lg flex items-center transition-all duration-300
              hover:shadow-lg"
            >
              <ChevronLeft className="mr-2" />
              {t('back')}
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={handleStartTournament}
              className="bg-gradient-to-r from-[#40CFB7] to-[#35b7a2] hover:from-[#35b7a2] hover:to-[#2da091]
              text-white px-6 py-6 h-12 rounded-lg flex items-center transition-all duration-300
              shadow-[0_0_15px_rgba(64,207,183,0.3)] hover:shadow-[0_0_25px_rgba(64,207,183,0.5)]"
            >
              {t('startTournament')}
              <ChevronRight className="ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
} 