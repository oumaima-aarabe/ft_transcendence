"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useTranslations } from 'next-intl';
import TournamentCreation from './components/tournament-creation';
import TournamentManager from './components/tournament-manager';
import { TournamentPlayer, GameDifficulty } from './types/tournament';

export default function TournamentsPage() {
  const [tournamentStage, setTournamentStage] = useState<'intro' | 'create' | 'tournament'>('intro');
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
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
    setTournamentStage('intro');
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
    <div className="rounded-xl bg-black bg-opacity-70 backdrop-blur-sm px-16 py-10 border border-gray-800 shadow-xl">
      <div className="w-full flex flex-col items-center justify-center">
        {/* Tournaments Mode Header */}
        <div className="text-center mb-10">
          <h1
            className="text-5xl font-bold mb-4 tracking-wider font-orbitron"
            style={{
              color: "#40CFB7",
              textShadow:
                "0 0 10px #40CFB7, 0 0 20px rgba(208,95,59,0.8), 0 0 30px rgba(208,95,59,0.4)",
            }}
          >
            {t('title')}
          </h1>
        </div>

        {/* Tournament card */}
        <div className="w-full max-w-md">
          <AnimatePresence>
            <motion.div
              key="create"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative"
              onMouseEnter={() => setHoveredOption('create')}
              onMouseLeave={() => setHoveredOption(null)}
            >
              {/* Neon border effect with smoother transition */}
              <div
                className="absolute inset-0 rounded-xl border-[#40CFB7] shadow-[0_0_15px_rgba(64,207,183,0.6)] border-2 transition-all duration-700"
                style={{
                  boxShadow:
                    hoveredOption === 'create'
                      ? "0 0 25px 5px rgba(64,207,183,0.8)"
                      : "0 0 15px rgba(64,207,183,0.6)",
                }}
              ></div>

              <Card
                className="relative cursor-pointer h-72 overflow-hidden rounded-xl border-0 bg-black bg-opacity-80"
                onClick={handleSelectCreate}
              >
                {/* Card content with smoother transitions */}
                <div className="relative p-6 h-full flex flex-col items-center justify-center">
                  <motion.div
                    className="w-full h-full flex flex-col items-center justify-center"
                    animate={{
                      scale: hoveredOption === 'create' ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <div className="flex flex-col items-center justify-center text-center h-full">
                      <div
                        className="mb-6 p-4 rounded-full transition-all duration-500 bg-[#40CFB7]"
                        style={{
                          boxShadow:
                            hoveredOption === 'create'
                              ? "0 0 15px rgba(64,207,183,0.7)"
                              : "none",
                        }}
                      >
                        <img
                          src="/assets/icons/icon-@.svg"
                          alt={t('create')}
                          className="w-8 h-8"
                        />
                      </div>

                      <h3
                        className="text-xl font-bold mb-3 transition-all duration-500 text-[#40CFB7]"
                      >
                        {t('create')}
                      </h3>

                      <p className="text-gray-400 mb-6 text-sm transition-all duration-500">
                        {t('createDescription')}
                      </p>

                      {/* Button with smoother fade in/out */}
                      <motion.button
                        className="mt-2 px-6 py-2 rounded-full font-bold bg-[#40CFB7] text-white"
                        style={{
                          boxShadow: "0 0 15px rgba(64,207,183,0.7)",
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: hoveredOption === 'create' ? 1 : 0,
                          y: hoveredOption === 'create' ? 0 : 10,
                        }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {t('select')}
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
