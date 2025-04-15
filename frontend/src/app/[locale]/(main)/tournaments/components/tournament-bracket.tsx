"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ChevronRight, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { TournamentMatch, TournamentState } from "../types/tournament";
import { useState } from "react";

// Common styles and constants
const COLORS = {
  fire: {
    border: "border-[#D05F3B]",
    borderFade: "border-[#D05F3B]/50",
    text: "text-[#D05F3B]",
    bg: "from-[#D05F3B]/20 via-[#D05F3B]/10 to-transparent",
    bgGradient: "from-[#D05F3B]/30 to-black",
    glow: "shadow-[0_0_15px_rgba(208,95,59,0.4)]",
    winnerGlow: "shadow-[0_0_25px_rgba(208,95,59,0.5)]"
  },
  water: {
    border: "border-[#40CFB7]",
    borderFade: "border-[#40CFB7]/50",
    text: "text-[#40CFB7]",
    bg: "from-[#40CFB7]/20 via-[#40CFB7]/10 to-transparent",
    bgGradient: "from-[#40CFB7]/30 to-black",
    glow: "shadow-[0_0_15px_rgba(64,207,183,0.4)]",
    winnerGlow: "shadow-[0_0_25px_rgba(64,207,183,0.5)]"
  },
  neutral: {
    border: "border-blue-500/30",
    finalBorder: "border-yellow-500/30",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.3)]",
    finalGlow: "shadow-[0_0_15px_rgba(234,179,8,0.3)]"
  }
};

interface TournamentBracketProps {
  tournament: TournamentState;
  onSelectMatch?: (matchId: number) => void;
}

export default function TournamentBracket({ tournament, onSelectMatch }: TournamentBracketProps) {
  const t = useTranslations('Tournaments');
  const { matches, winner } = tournament;
  const [hoveredMatch, setHoveredMatch] = useState<number | null>(null);

  // Filter matches by round
  const semifinalMatches = matches.filter(match => match.round === 1);
  const finalMatch = matches.find(match => match.round === 2);

  return (
    <div className="w-full max-w-6xl mx-auto relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(18,24,38,0)_0%,rgba(18,24,38,0.8)_2%,rgba(18,24,38,0.8)_98%,rgba(18,24,38,0)_100%)] bg-[length:100%_4px] bg-repeat-y opacity-30 z-0"></div>
      
      <div className="relative z-10 p-6">
        {/* Title */}
        <motion.h2 
          className="text-3xl font-bold mb-8 text-center font-orbitron bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-blue-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {t('tournamentBracket')}
        </motion.h2>

        <div className="flex flex-col items-center space-y-10">
          <div className="w-full max-w-5xl relative">
            {/* Bracket Connectors */}
            <BracketConnectors />

            <div className="flex justify-between items-center relative z-10">
              {/* Semifinal Column */}
              <div className="w-[30%]">
                <h3 className="text-lg font-semibold text-center font-orbitron mb-4 text-blue-400/80">
                  {t('semifinal')}
                </h3>
                <div className="space-y-[100px]">
                  {semifinalMatches.map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.2 }}
                      onMouseEnter={() => setHoveredMatch(match.id)}
                      onMouseLeave={() => setHoveredMatch(null)}
                    >
                      <MatchCard 
                        match={match} 
                        onClick={() => onSelectMatch && onSelectMatch(match.id)}
                        isClickable={!!onSelectMatch && !match.isComplete}
                        isHovered={hoveredMatch === match.id}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Final Column */}
              <div className="w-[30%]">
                <h3 className="text-lg font-semibold text-center font-orbitron mb-4 text-yellow-400/80">
                  {t('final')}
                </h3>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="transform translate-y-[50px]"
                  onMouseEnter={() => finalMatch && setHoveredMatch(finalMatch.id)}
                  onMouseLeave={() => setHoveredMatch(null)}
                >
                  {finalMatch ? (
                    <MatchCard 
                      match={finalMatch} 
                      onClick={() => onSelectMatch && onSelectMatch(finalMatch.id)} 
                      isClickable={!!onSelectMatch && !finalMatch.isComplete}
                      isFinal
                      isHovered={finalMatch && hoveredMatch === finalMatch.id}
                    />
                  ) : (
                    <EmptyCard message={t('finalWillBeHere')} />
                  )}
                </motion.div>
              </div>

              {/* Winner Column */}
              <div className="w-[30%]">
                <h3 className="text-lg font-semibold text-center font-orbitron mb-4 text-yellow-400/80">
                  {t('winner')}
                </h3>
                <AnimatePresence>
                  {winner ? (
                    <motion.div
                      key="winner"
                      initial={{ opacity: 0, y: 20, rotateY: 90 }}
                      animate={{ opacity: 1, y: 0, rotateY: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
                      className="transform translate-y-[50px]"
                    >
                      <WinnerDisplay winner={winner} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="no-winner"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.7 }}
                      className="relative transform translate-y-[50px]"
                    >
                      <EmptyCard 
                        message={t('waiting')} 
                        height="h-32" 
                        borderColor="border-yellow-500/30"
                        gradientColors="from-yellow-500/10 via-yellow-400/5 to-yellow-500/10"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Bracket connector component
function BracketConnectors() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none translate-y-[1.3rem]">
      {/* Horizontal connector to final */}
      <motion.div 
        className="absolute left-[calc(30%+16px)] top-1/2 w-[calc(40%-32px)] h-px bg-gradient-to-r from-blue-400/70 via-blue-400/50 to-yellow-400/70"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        style={{ transformOrigin: "left" }}
      />
      
      {/* Vertical connector between semifinal matches */}
      <motion.div 
        className="absolute left-[calc(30%+8px)] top-[calc(25%+72px)] h-[calc(50%-144px)] w-px bg-gradient-to-b from-blue-400/50 to-blue-400/50"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{ transformOrigin: "top" }}
      />
      
      {/* Top semifinal to vertical connector */}
      <motion.div 
        className="absolute left-[calc(30%+1px)] top-[calc(25%+72px)] w-[8px] h-px bg-blue-400/50"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.9 }}
        style={{ transformOrigin: "left" }}
      />
      
      {/* Bottom semifinal to vertical connector */}
      <motion.div 
        className="absolute left-[calc(30%+1px)] bottom-[calc(25%+72px)] w-[8px] h-px bg-blue-400/50"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 1.0 }}
        style={{ transformOrigin: "left" }}
      />
      
      {/* Final to winner connector */}
      <motion.div 
        className="absolute left-[calc(70%-16px)] top-1/2 w-[calc(1.8%)] h-px bg-gradient-to-r from-yellow-400/70 to-yellow-400/30"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        style={{ transformOrigin: "left" }}
      />
    </div>
  );
}

// Empty card placeholder
interface EmptyCardProps {
  message: string;
  height?: string;
  borderColor?: string;
  gradientColors?: string;
}

function EmptyCard({ 
  message, 
  height = "", 
  borderColor = "border-blue-500/30",
  gradientColors = "from-blue-500/10 via-blue-400/5 to-blue-500/10"
}: EmptyCardProps) {
  return (
    <div className={`relative rounded-lg overflow-hidden backdrop-blur-sm border ${borderColor} bg-black/40 ${height}`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${gradientColors}`}></div>
      <div className="p-6 flex items-center justify-center h-full">
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
}

interface MatchCardProps {
  match: TournamentMatch;
  onClick?: () => void;
  isClickable?: boolean;
  isFinal?: boolean;
  isHovered?: boolean;
}

function MatchCard({ match, onClick, isClickable = false, isFinal = false, isHovered = false }: MatchCardProps) {
  const t = useTranslations('Tournaments');
  const { player1, player2, winner, isComplete } = match;

  const getBorderColor = () => {
    if (winner) {
      return winner.color === 'fire' ? COLORS.fire.borderFade : COLORS.water.borderFade;
    }
    return isFinal ? COLORS.neutral.finalBorder : COLORS.neutral.border;
  };

  const getGlowColor = () => {
    if (winner) {
      return winner.color === 'fire' ? COLORS.fire.glow : COLORS.water.glow;
    }
    return isFinal ? COLORS.neutral.finalGlow : COLORS.neutral.glow;
  };

  return (
    <motion.div 
      className={`relative rounded-lg overflow-hidden backdrop-blur-sm
        border ${getBorderColor()} bg-black/40
        ${isClickable ? 'cursor-pointer' : ''}
        ${getGlowColor()}
        transition-all duration-300
      `}
      whileHover={isClickable ? { scale: 1.03 } : {}}
      animate={{ scale: isHovered ? 1.03 : 1 }}
      onClick={isClickable ? onClick : undefined}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-blue-400/5 to-blue-500/10"></div>
      
      <div className="p-4 relative z-10">
        {isFinal && (
          <div className="absolute -top-1 -right-1">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
          </div>
        )}
        
        <div className="text-center mb-2">
          {isComplete ? (
            <span className="inline-block px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
              {t('matchComplete')}
            </span>
          ) : (
            <span className="inline-block px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
              {isClickable ? t('clickToPlay') : t('waiting')}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <PlayerRow 
            player={player1}
            isWinner={winner?.id === player1.id}
          />

          <div className="flex items-center justify-center">
            <div className="w-1/3 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
            <span className="mx-2 text-xs text-blue-300/70">VS</span>
            <div className="w-1/3 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
          </div>

          <PlayerRow 
            player={player2}
            isWinner={winner?.id === player2.id}
          />
        </div>
      </div>
    </motion.div>
  );
}

interface PlayerRowProps {
  player: {
    id: number;
    name: string;
    avatar: string;
    color: string;
  };
  isWinner: boolean;
}

function PlayerRow({ player, isWinner }: PlayerRowProps) {  
  const colorSet = player.color === 'fire' ? COLORS.fire : COLORS.water;
  const bgColor = !isWinner ? "bg-transparent" : `bg-gradient-to-r ${colorSet.bg}`;
  
  return (
    <div className={`flex items-center p-2 rounded-md ${bgColor}`}>
      <div className="relative flex-shrink-0">
        <div className={`w-8 h-8 rounded-full border-2 ${colorSet.border} overflow-hidden ${
          isWinner ? `ring-2 ${colorSet.border} ring-offset-1 ring-offset-black` : ""
        }`}>
          <img 
            src={player.avatar} 
            alt={player.name} 
            className="w-full h-full object-cover" 
          />
        </div>
        {isWinner && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-black flex items-center justify-center text-yellow-400">
            <Trophy className="w-3 h-3" />
          </div>
        )}
      </div>

      <span className={`ml-3 font-medium flex-1 truncate ${colorSet.text}`}>
        {player.name}
      </span>

      {isWinner && (
        <ChevronRight className="w-4 h-4 text-yellow-400 animate-pulse" />
      )}
    </div>
  );
}

interface WinnerDisplayProps {
  winner: {
    id: number;
    name: string;
    avatar: string;
    color: string;
  };
}

function WinnerDisplay({ winner }: WinnerDisplayProps) {
  const colorSet = winner.color === 'fire' ? COLORS.fire : COLORS.water;

  return (
    <div className={`relative rounded-lg overflow-hidden border ${colorSet.border} ${colorSet.winnerGlow}`}>
      <div className={`absolute inset-0 bg-gradient-to-b ${colorSet.bgGradient}`}></div>
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars-container">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-yellow-400 opacity-70"
              initial={{ 
                x: Math.random() * 100, 
                y: Math.random() * 100,
                opacity: 0
              }}
              animate={{ 
                y: [null, Math.random() * -100],
                opacity: [0, 0.8, 0]
              }}
              transition={{ 
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="relative p-5 flex flex-col items-center">
        <div className="relative mb-2">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0, -5, 0] 
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Trophy className="w-12 h-12 text-yellow-400" />
          </motion.div>
          <motion.div 
            className="absolute inset-0 rounded-full bg-yellow-400 blur-xl opacity-30"
            animate={{ 
              scale: [0.8, 1.5, 0.8],
              opacity: [0.1, 0.3, 0.1] 
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      
        <div className={`text-2xl font-bold ${colorSet.text} font-orbitron mt-2`}>
          {winner.name}
        </div>
        
        <div className="mt-2 w-20 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
      </div>
    </div>
  );
} 