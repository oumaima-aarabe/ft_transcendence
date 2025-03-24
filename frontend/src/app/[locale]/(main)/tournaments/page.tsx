"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useTranslations } from 'next-intl';
import TournamentCreation from './components/tournament-creation';
import TournamentManager from './components/tournament-manager';
import { TournamentPlayer, GameDifficulty } from './types/tournament';

export default function TournamentsPage() {
  const [tournamentStage, setTournamentStage] = useState<  'create' | 'tournament'>('create');
  const t = useTranslations('Tournaments');
  
  // Tournament state
  const [players, setPlayers] = useState<TournamentPlayer[]>([]);
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');

  const handleSelectCreate = () => {
    setTournamentStage('create');
  };

  const handleTournamentStart = (tournamentPlayers: TournamentPlayer[], gameDifficulty: GameDifficulty) => {
    setPlayers(tournamentPlayers);
    setDifficulty(gameDifficulty);
    setTournamentStage('tournament');
  };

  const handleExitTournament = () => {
    setTournamentStage('create');
  };

  if (tournamentStage === 'create') {
    return <TournamentCreation onTournamentStart={handleTournamentStart} setTournamentStage={setTournamentStage} />;
  }

  if (tournamentStage === 'tournament') {
    return <TournamentManager 
      players={players} 
      difficulty={difficulty} 
      onExit={handleExitTournament} 
    />;
  }

  return (
    <TournamentCreation onTournamentStart={handleTournamentStart} setTournamentStage={setTournamentStage} />  
  );
}
