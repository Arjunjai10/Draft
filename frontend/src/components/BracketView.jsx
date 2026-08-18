import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';

export const BracketView = ({ tournament }) => {
  const navigate = useNavigate();
  const myPlayerId = localStorage.getItem(`tournament_${tournament._id}_playerId`);

  const { bracket, playerCount } = tournament;
  const qfMatches = bracket.filter(m => m.round === 1 && playerCount === 8);
  const sfMatches = bracket.filter(m => (playerCount === 8 && m.round === 2) || (playerCount === 4 && m.round === 1) || (playerCount === 3 && m.round === 1));
  const fMatch = bracket.find(m => (playerCount === 8 && m.round === 3) || (playerCount === 4 && m.round === 2) || (playerCount === 3 && m.round === 2));

  const MatchNode = ({ match }) => {
    if (!match) return <div className="h-24 w-48 opacity-0" />;
    
    // Check if I'm in this match
    const isMyMatch = myPlayerId && (match.p1?.id === myPlayerId || match.p2?.id === myPlayerId);
    
    // Determine status
    let statusText = 'Waiting';
    let statusColor = 'text-gray-500';
    let canAction = false;
    let actionText = '';
    let actionUrl = '';
    
    if (match.winnerId) {
      statusText = 'Complete';
      statusColor = 'text-green-500';
      canAction = true;
      actionText = 'View Result';
      actionUrl = `/battle/${match.draftId}`;
    } else if (match.p1 && match.p2 && match.draftId) {
      statusText = 'Live';
      statusColor = 'text-red-500 animate-pulse';
      canAction = true;
      if (isMyMatch) {
        actionText = 'Play Match';
        actionUrl = `/draft/${match.draftId}`;
      } else {
        actionText = 'Spectate';
        actionUrl = `/draft/${match.draftId}?role=spectator`;
      }
    }

    return (
      <div className={`relative flex flex-col border ${isMyMatch ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-gray-700 bg-gray-800'} rounded w-48 overflow-hidden`}>
        <div className="flex justify-between items-center bg-gray-900 px-2 py-1 text-xs">
          <span className="text-gray-400">{match.matchId}</span>
          <span className={`font-bold ${statusColor}`}>{statusText}</span>
        </div>
        
        <div className="flex flex-col p-2 gap-1 text-sm">
          <div className={`flex justify-between ${match.winnerId === match.p1?.id ? 'text-green-400 font-bold' : (match.p1 ? 'text-white' : 'text-gray-600')}`}>
            <span className="truncate">{match.p1?.name || 'TBD'}</span>
            {match.winnerId === match.p1?.id && <LucideIcons.Check size={14} />}
          </div>
          <div className="h-px bg-gray-700 w-full" />
          <div className={`flex justify-between ${match.winnerId === match.p2?.id ? 'text-green-400 font-bold' : (match.p2 ? 'text-white' : 'text-gray-600')}`}>
            <span className="truncate">{match.p2?.name || 'TBD'}</span>
            {match.winnerId === match.p2?.id && <LucideIcons.Check size={14} />}
          </div>
        </div>

        {canAction && (
          <button
            onClick={() => navigate(actionUrl)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1 transition-colors uppercase tracking-wider"
          >
            {actionText}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto py-8">
      <div className="flex items-center justify-center min-w-max px-8 gap-12">
        {/* QF Column */}
        {qfMatches.length > 0 && (
          <div className="flex flex-col gap-8 justify-around">
            {qfMatches.map(m => <MatchNode key={m.matchId} match={m} />)}
          </div>
        )}

        {/* SF Column */}
        {sfMatches.length > 0 && (
          <div className="flex flex-col gap-16 justify-around">
            {sfMatches.map(m => <MatchNode key={m.matchId} match={m} />)}
          </div>
        )}

        {/* Final Column */}
        {fMatch && (
          <div className="flex flex-col gap-0 justify-around">
            <MatchNode match={fMatch} />
          </div>
        )}
      </div>
    </div>
  );
};
