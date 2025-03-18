"use client";

import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from 'next-intl';
import { GameTheme, GameDifficulty, TournamentPlayer } from '../types/tournament';

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

  return (
    <div className="rounded-xl bg-black bg-opacity-70 backdrop-blur-sm p-8 border border-gray-800 shadow-xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 tracking-wider font-orbitron text-[#40CFB7]">
            {t('createTournament')}
          </h1>
          <p className="text-gray-400">
            {t('enterPlayers')}
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#40CFB7]">{t('tournamentSettings')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="difficulty" className="text-white mb-2 block">
                {t('difficulty')}
              </Label>
              <Select 
                value={difficulty} 
                onValueChange={(value: GameDifficulty) => setDifficulty(value)}
              >
                <SelectTrigger className="w-full bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder={t('selectDifficulty')} />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  <SelectItem value="easy">{t('easy')}</SelectItem>
                  <SelectItem value="medium">{t('medium')}</SelectItem>
                  <SelectItem value="hard">{t('hard')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#40CFB7] mb-4">{t('players')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {players.map((player, index) => (
              <Card key={player.id} className="p-4 bg-gray-900 border-gray-700">
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    player.color === 'fire' ? 'border-[#D05F3B]' : 'border-[#40CFB7]'
                  }`}>
                    <span className="text-xl font-bold text-white">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`player-${player.id}-name`} className="text-white mb-1 block">
                      {t('playerName')} {index + 1}
                    </Label>
                    <Input
                      id={`player-${player.id}-name`}
                      value={player.name}
                      onChange={(e) => handlePlayerChange(player.id, 'name', e.target.value)}
                      placeholder={`${t('player')} ${index + 1}`}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`player-${player.id}-color`} className="text-white mb-1 block">
                    {t('playerColor')}
                  </Label>
                  <Select 
                    value={player.color} 
                    onValueChange={(value: GameTheme) => handlePlayerChange(player.id, 'color', value)}
                  >
                    <SelectTrigger 
                      id={`player-${player.id}-color`}
                      className="w-full bg-gray-800 border-gray-700 text-white"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white">
                      <SelectItem value="fire" className="text-[#D05F3B]">{t('fire')}</SelectItem>
                      <SelectItem value="water" className="text-[#40CFB7]">{t('water')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button 
            onClick={() => {
              setTournamentStage('intro');
            }}
            variant="outline" 
            className="border-gray-700 hover:text-white hover:bg-gray-800"
          >
            {t('back')}
          </Button>
          
          <Button 
            onClick={handleStartTournament}
            className="bg-[#40CFB7] hover:bg-[#35b7a2] text-white shadow-[0_0_15px_rgba(64,207,183,0.5)]"
          >
            {t('startTournament')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
} 