"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { TournamentMatch, TournamentState } from "../types/tournament";

interface TournamentBracketProps {
  tournament: TournamentState;
  onSelectMatch?: (matchId: number) => void;
}

export default function TournamentBracket({ tournament, onSelectMatch }: TournamentBracketProps) {
  const t = useTranslations('Tournaments');
  const { matches, winner } = tournament;

  // Filter matches by round
  const semifinalMatches = matches.filter(match => match.round === 1);
  const finalMatch = matches.find(match => match.round === 2);

  return (
    <div className="py-6 w-full max-w-4xl mx-auto">
      <div className="flex flex-col items-center">
        {/* Title */}
        <h2 className="text-3xl font-bold mb-10 text-center text-white font-orbitron">
          {t('tournamentBracket')}
        </h2>

        {/* Tournament Bracket */}
        <div className="w-full relative">
          <div className="flex justify-between items-center mb-16">
            {/* Semifinal round */}
            <div className="flex flex-col space-y-16 w-5/12">
              {semifinalMatches.map((match, index) => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  onClick={() => onSelectMatch && onSelectMatch(match.id)}
                  isClickable={!!onSelectMatch && !match.isComplete}
                />
              ))}
            </div>

            {/* Connection lines */}
            <div className="flex flex-col w-2/12 items-center justify-center relative">
              <div className="h-32 w-px bg-gray-600 absolute top-8"></div>
              <div className="h-32 w-px bg-gray-600 absolute bottom-8"></div>
              <div className="w-full h-px bg-gray-600"></div>
            </div>

            {/* Final round */}
            <div className="w-5/12 flex items-center justify-center">
              {finalMatch ? (
                <MatchCard 
                  match={finalMatch} 
                  onClick={() => onSelectMatch && onSelectMatch(finalMatch.id)} 
                  isClickable={!!onSelectMatch && !finalMatch.isComplete}
                  isFinal
                />
              ) : (
                <div className="h-32 border border-dashed border-gray-600 rounded-xl w-full flex items-center justify-center">
                  <p className="text-gray-400">{t('finalWillBeHere')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Winner Display */}
          {winner && (
            <motion.div 
              className="mt-4 text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-block bg-black bg-opacity-70 rounded-xl p-6 border-2 border-yellow-500 shadow-[0_0_15px_rgba(255,215,0,0.6)]">
                <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-yellow-500 mb-1">{t('winner')}</h3>
                <div 
                  className={`text-2xl font-bold ${
                    winner.color === 'fire' ? 'text-[#D05F3B]' : 'text-[#40CFB7]'
                  }`}
                >
                  {winner.name}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

interface MatchCardProps {
  match: TournamentMatch;
  onClick?: () => void;
  isClickable?: boolean;
  isFinal?: boolean;
}

function MatchCard({ match, onClick, isClickable = false, isFinal = false }: MatchCardProps) {
  const t = useTranslations('Tournaments');
  const { player1, player2, winner, isComplete } = match;

  return (
    <div 
      className={`relative rounded-xl overflow-hidden 
        ${isClickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
        ${isFinal ? 'border-2 border-yellow-500' : 'border border-gray-700'}
      `}
      onClick={isClickable ? onClick : undefined}
    >
      <div className="bg-black bg-opacity-80 p-4">
        <div className="text-center mb-2">
          <span className="text-sm text-gray-400">
            {match.round === 1 ? t('semifinal') : t('final')}
          </span>
        </div>

        {/* Player 1 */}
        <div className={`flex items-center p-2 mb-2 rounded ${
          winner?.id === player1.id ? 
            player1.color === 'fire' ? 'bg-[#D05F3B]/20' : 'bg-[#40CFB7]/20' 
            : 'bg-transparent'
        }`}>
          <div className={`w-8 h-8 rounded-full border overflow-hidden ${
            player1.color === 'fire' ? 'border-[#D05F3B]' : 'border-[#40CFB7]'
          }`}>
            <img src={player1.avatar} alt={player1.name} className="w-full h-full object-cover" />
          </div>
          <span className={`ml-2 font-medium flex-1 ${
            player1.color === 'fire' ? 'text-[#D05F3B]' : 'text-[#40CFB7]'
          }`}>
            {player1.name}
          </span>
          {winner?.id === player1.id && isComplete && (
            <span className="text-yellow-500 text-sm">Winner</span>
          )}
        </div>

        {/* VS */}
        <div className="text-center text-xs text-gray-500 my-1">VS</div>

        {/* Player 2 */}
        <div className={`flex items-center p-2 rounded ${
          winner?.id === player2.id ? 
            player2.color === 'fire' ? 'bg-[#D05F3B]/20' : 'bg-[#40CFB7]/20' 
            : 'bg-transparent'
        }`}>
          <div className={`w-8 h-8 rounded-full border overflow-hidden ${
            player2.color === 'fire' ? 'border-[#D05F3B]' : 'border-[#40CFB7]'
          }`}>
            <img src={player2.avatar} alt={player2.name} className="w-full h-full object-cover" />
          </div>
          <span className={`ml-2 font-medium flex-1 ${
            player2.color === 'fire' ? 'text-[#D05F3B]' : 'text-[#40CFB7]'
          }`}>
            {player2.name} {" "}
            </span>
          {winner?.id === player2.id && isComplete && (
            <span className="text-yellow-500 text-sm">Winner</span>
          )}
        </div>

        {/* Status */}
        <div className="text-center mt-2">
          {isComplete ? (
            <span className="text-xs text-green-500">{t('matchComplete')}</span>
          ) : (
            <span className="text-xs text-yellow-500">{isClickable ? t('clickToPlay') : t('waiting')}</span>
          )}
        </div>
      </div>
      {/* Winner highlight glow */}
      {winner && (
        <div 
          className={`absolute inset-0 pointer-events-none opacity-20 ${
            winner.color === 'fire' ? 'bg-[#D05F3B]' : 'bg-[#40CFB7]'
          }`}
        />
      )}
    </div>

  );
} 