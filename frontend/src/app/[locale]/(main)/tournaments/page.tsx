"use client";

import React, { useState } from 'react';
import TournamentCreation from './components/tournament-creation';
import TournamentManager from './components/tournament-manager';
import { TournamentPlayer, GameDifficulty } from './types/tournament';
export default function TournamentsPage() {

  const [tournamentStage, setTournamentStage] = useState<  'create' | 'tournament'>('create');
  const [players, setPlayers] = useState<TournamentPlayer[]>([]);
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');

  const handleTournamentStart = (tournamentPlayers: TournamentPlayer[], gameDifficulty: GameDifficulty) => {
    setPlayers(tournamentPlayers);
    setDifficulty(gameDifficulty);
    setTournamentStage('tournament');
  };

  const handleExitTournament = () => {
    setTournamentStage('create');
  };

  return (
    <div className="w-full h-full overflow-hidden flex items-center justify-center">
      {tournamentStage === 'create' && (
        <TournamentCreation 
          onTournamentStart={handleTournamentStart} 
          setTournamentStage={setTournamentStage} 
        />
      )}
      {tournamentStage === 'tournament' && (
        <TournamentManager 
          players={players} 
          difficulty={difficulty} 
          onExit={handleExitTournament} 
        />
      )}
    </div>
  );
}
