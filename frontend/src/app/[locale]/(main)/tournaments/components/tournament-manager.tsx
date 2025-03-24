"use client";

import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';
import { TournamentPlayer, TournamentMatch, TournamentState, GameDifficulty, GameTheme } from '../types/tournament';
import TournamentBracket from './tournament-bracket';
import PongGame from '@/app/[locale]/(main)/game/components/pong-game';

interface TournamentManagerProps {
  players: TournamentPlayer[];
  difficulty: GameDifficulty;
  onExit: () => void;
}

export default function TournamentManager({ players, difficulty, onExit }: TournamentManagerProps) {
  const t = useTranslations('Tournaments');
  const [tournament, setTournament] = useState<TournamentState>(() => {
    // Create initial tournament state
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    
    // Create semifinal matches
    const matches: TournamentMatch[] = [
      {
        id: 1,
        round: 1,
        player1: shuffledPlayers[0],
        player2: shuffledPlayers[1],
        winner: null,
        isComplete: false
      },
      {
        id: 2,
        round: 1,
        player1: shuffledPlayers[2],
        player2: shuffledPlayers[3],
        winner: null,
        isComplete: false
      }
    ];
    
    return {
      players: shuffledPlayers,
      matches,
      currentMatchIndex: 0,
      winner: null,
      isComplete: false,
      difficulty
    };
  });
  
  const [activeMatchId, setActiveMatchId] = useState<number | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  
  // Get current match details
  const currentMatch = tournament.matches.find(match => match.id === activeMatchId);
  
  useEffect(() => {
    // Auto-select the first match if no match is selected
    if (activeMatchId === null && tournament.matches.length > 0) {
      // Find the first non-completed match
      const nextMatch = tournament.matches.find(match => !match.isComplete);
      if (nextMatch) {
        setActiveMatchId(nextMatch.id);
      }
    }
  }, [tournament.matches, activeMatchId]);
  
  // Handle match completion
  const handleMatchComplete = (winnerId: number) => {
    setTournament(prev => {
      const updatedMatches = [...prev.matches];
      
      // Find and update the completed match
      const matchIndex = updatedMatches.findIndex(match => match.id === activeMatchId);
      if (matchIndex >= 0) {
        const match = updatedMatches[matchIndex];
        const winner = match.player1.id === winnerId 
          ? match.player1 
          : match.player2;
          
        updatedMatches[matchIndex] = {
          ...match,
          winner,
          isComplete: true
        };
        
        // Check if we need to create the final match
        const semifinalsComplete = updatedMatches
          .filter(m => m.round === 1)
          .every(m => m.isComplete);
          
        if (semifinalsComplete) {
          // Get winners from semifinals
          const semifinalWinners = updatedMatches
            .filter(m => m.round === 1)
            .map(m => m.winner) as TournamentPlayer[];
            
          // Create final match if it doesn't exist
          const finalExists = updatedMatches.some(m => m.round === 2);
          if (!finalExists && semifinalWinners.length === 2) {
            updatedMatches.push({
              id: 3,
              round: 2,
              player1: semifinalWinners[0],
              player2: semifinalWinners[1],
              winner: null,
              isComplete: false
            });
          }
        }
        
        // Check if tournament is complete
        const finalMatch = updatedMatches.find(m => m.round === 2);
        const tournamentComplete = finalMatch?.isComplete || false;
        
        return {
          ...prev,
          matches: updatedMatches,
          winner: tournamentComplete ? finalMatch?.winner || null : null,
          isComplete: tournamentComplete
        };
      }
      
      return prev;
    });
    
    // Reset the active match
    setActiveMatchId(null);
  };
  
  // Handle match selection
  const handleSelectMatch = (matchId: number) => {
    // Only allow selecting non-completed matches
    const match = tournament.matches.find(m => m.id === matchId);
    if (match && !match.isComplete) {
      setActiveMatchId(matchId);
    }
  };
  
  // Handle game completion (called from the PongGame component)
  const handleGameComplete = (player1Score: number, player2Score: number) => {
    if (!currentMatch) return;
    
    // Determine winner based on scores
    const winnerId = player1Score > player2Score 
      ? currentMatch.player1.id 
      : currentMatch.player2.id;
      
    handleMatchComplete(winnerId);
  };
  
  // Handle back to tournament view
  const handleBackToTournament = () => {
    // Reset active match to null to return to tournament bracket view
    setActiveMatchId(null);
  };
  
  if (showIntro) {
    return (
      <motion.div 
        className="rounded-xl bg-black bg-opacity-80 backdrop-blur-sm p-8 border border-gray-800 shadow-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-[#40CFB7] font-orbitron">
            {t('tournamentBeginning')}
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            {t('tournamentIntro')}
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {players.map((player) => (
              <div 
                key={player.id} 
                className={`bg-black bg-opacity-70 p-4 rounded-lg border-2 ${
                  player.color === 'fire' ? 'border-[#D05F3B]' : 'border-[#40CFB7]'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full overflow-hidden border-2 mb-2 ${
                    player.color === 'fire' ? 'border-[#D05F3B]' : 'border-[#40CFB7]'
                  }`}>
                    <img 
                      src={player.avatar} 
                      alt={player.name}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <p className={`font-bold text-lg ${
                    player.color === 'fire' ? 'text-[#D05F3B]' : 'text-[#40CFB7]'
                  }`}>
                    {player.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <Button
            onClick={() => setShowIntro(false)}
            className="bg-[#40CFB7] hover:bg-[#35b7a2] text-white px-8 py-4 text-lg shadow-[0_0_15px_rgba(64,207,183,0.5)]"
          >
            {t('startFirstMatch')}
          </Button>
        </div>
      </motion.div>
    );
  }
  
  if (currentMatch) {
    // Show the current match game
    return (
      <div className="w-full">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold mb-2 font-orbitron" style={{
            color: currentMatch.player1.color === 'fire' ? "#D05F3B" : "#40CFB7",
            textShadow: "0 0 10px " + (currentMatch.player1.color === 'fire' ? "#D05F3B" : "#40CFB7"),
          }}>
            {currentMatch.round === 1 ? t('semifinalMatch') : t('finalMatch')}
          </h2>
          <p className="text-gray-300">
            {currentMatch.player1.name} vs {currentMatch.player2.name}
          </p>
        </div>
        
        <PongGame 
          player1Name={currentMatch.player1.name}
          player2Name={currentMatch.player2.name}
          theme={currentMatch.player1.color as GameTheme}
          difficulty={tournament.difficulty}
          player1Avatar={currentMatch.player1.avatar}
          player2Avatar={currentMatch.player2.avatar}
          onBackToSetup={handleBackToTournament}
          onGameComplete={handleGameComplete}
          isTournamentMode={true}
        />
      </div>
    );
  }
  
  // Tournament view (bracket)
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        
        <h2 className="text-2xl font-bold text-[#40CFB7] font-orbitron">
          {tournament.isComplete ? t('tournamentComplete') : t('tournamentInProgress')}
        </h2>
        
        {tournament.isComplete && (
          <Button
            onClick={onExit}
            className="bg-[#40CFB7] hover:bg-[#35b7a2] text-white"
          >
            {t('newTournament')}
          </Button>
        )}
      </div>
      
      <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
        <TournamentBracket 
          tournament={tournament} 
          onSelectMatch={!tournament.isComplete ? handleSelectMatch : undefined}
        />
        
        {!tournament.isComplete && !activeMatchId && (
          <div className="text-center mt-8 mb-4">
            <p className="text-gray-300 mb-4 text-lg">
              {t('selectMatchToPlay')}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              {tournament.matches.filter(m => !m.isComplete).map(match => (
                <Button
                  key={match.id}
                  onClick={() => handleSelectMatch(match.id)}
                  className={`px-6 py-2 text-base ${
                    match.player1.color === 'fire' 
                      ? 'bg-[#D05F3B] hover:bg-[#c04f2b]' 
                      : 'bg-[#40CFB7] hover:bg-[#35b7a2]'
                  } text-white shadow-lg transition-transform hover:scale-105`}
                >
                  {match.round === 1 ? t('playSemifinal') : t('playFinal')} {match.id}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 