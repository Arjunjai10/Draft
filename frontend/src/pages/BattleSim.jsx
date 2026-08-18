import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { simulateBattle } from '../api/battles';
import { getDraft } from '../api/drafts';
import * as LucideIcons from 'lucide-react';
import { SettingsModal } from '../components/settings/SettingsModal';

const SPEED_MAP = { 1: 1000, 2: 500, 3: 250 };
const PHASES = { INTRO: 'INTRO', REVEAL: 'REVEAL', END: 'END' };

export const BattleSim = () => {
  const { draftId } = useParams();
  const sessionId = draftId;
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Playback state
  const [roundIdx, setRoundIdx] = useState(0);
  const [phase, setPhase] = useState(PHASES.INTRO);
  const [runningScoreA, setRunningScoreA] = useState(0);
  const [runningScoreB, setRunningScoreB] = useState(0);
  
  // Settings
  const [speed, setSpeed] = useState(1);
  const [hideStats, setHideStats] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const autoPlayTimer = useRef(null);

  useEffect(() => {
    // Generate or fetch the battle result and draft session
    Promise.all([
      simulateBattle(sessionId),
      getDraft(sessionId).catch(() => null)
    ])
      .then(([resData, sessData]) => {
        setResult(resData);
        setSession(sessData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sessionId]);

  const p1Id = session?.players[0]?.id || 'player1';
  const p2Id = session?.players[1]?.id || 'player2';
  const p1Name = session?.players[0]?.name || 'Player 1';
  const p2Name = session?.players[1]?.name || 'Player 2';

  // Recalculate running score whenever roundIdx changes
  useEffect(() => {
    if (!result) return;
    let sA = 0;
    let sB = 0;
    for (let i = 0; i < roundIdx; i++) {
      const w = result.rounds[i].winner;
      if (w === p1Id || w === 'player1') sA++;
      else if (w === p2Id || w === 'player2') sB++;
    }
    setRunningScoreA(sA);
    setRunningScoreB(sB);
  }, [roundIdx, result, p1Id, p2Id]);

  const advanceState = useCallback(() => {
    if (!result) return;
    
    setPhase(prev => {
      if (prev === PHASES.INTRO) return PHASES.REVEAL;
      if (prev === PHASES.REVEAL) {
        const currentWinner = result.rounds[roundIdx].winner;
        if (currentWinner === p1Id || currentWinner === 'player1') setRunningScoreA(s => s + 1);
        else if (currentWinner === p2Id || currentWinner === 'player2') setRunningScoreB(s => s + 1);
        return PHASES.END;
      }
      if (prev === PHASES.END) {
        if (roundIdx < result.rounds.length - 1) {
          setRoundIdx(r => r + 1);
          return PHASES.INTRO;
        } else {
          return PHASES.END;
        }
      }
      return prev;
    });
  }, [result, roundIdx, p1Id, p2Id]);

  const resetRound = useCallback(() => {
    setPhase(PHASES.INTRO);
  }, []);

  const resetBattle = useCallback(() => {
    setRoundIdx(0);
    setPhase(PHASES.INTRO);
    setIsAutoPlaying(false);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        setIsAutoPlaying(prev => !prev);
      } else if (e.key === 'Enter' || e.key === 'n' || e.key === 'N') {
        setIsAutoPlaying(false);
        advanceState();
      } else if (e.key === 'r' || e.key === 'R') {
        if (e.shiftKey) resetBattle();
        else resetRound();
      } else if (e.key === '1') setSpeed(1);
      else if (e.key === '2') setSpeed(2);
      else if (e.key === '3') setSpeed(3);
      else if (e.key === 'h' || e.key === 'H') setHideStats(prev => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [advanceState, resetRound, resetBattle]);

  // Autoplay loop
  useEffect(() => {
    if (isAutoPlaying && phase !== PHASES.END || (isAutoPlaying && roundIdx < 14)) {
      autoPlayTimer.current = setTimeout(() => {
        advanceState();
      }, SPEED_MAP[speed]);
    } else {
      clearTimeout(autoPlayTimer.current);
    }
    return () => clearTimeout(autoPlayTimer.current);
  }, [isAutoPlaying, phase, roundIdx, speed, advanceState]);

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8 text-center text-xl font-bold text-gray-400">Simulating Battle...</div>;
  if (!result) return <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8 text-center text-red-500 font-bold">Error loading simulation</div>;

  const round = result.rounds[roundIdx];
  const isBattleComplete = roundIdx === 14 && phase === PHASES.END;
  const p1Won = round.winner === p1Id || round.winner === 'player1';
  const p2Won = round.winner === p2Id || round.winner === 'player2';

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-gray-900 to-slate-900 opacity-80 z-0"></div>
      
      {/* Header / Scoreboard */}
      <div className="relative z-10 p-6 flex justify-center items-center">
        <div className="bg-gray-900 bg-opacity-70 backdrop-blur-md border border-gray-700 rounded-3xl px-12 py-4 flex items-center gap-12 shadow-2xl">
          <div className="text-right">
             <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{p1Name}</div>
             <div className="text-4xl font-black text-blue-400">{runningScoreA}</div>
          </div>
          <div className="text-gray-600 font-black italic text-2xl">VS</div>
          <div className="text-left">
             <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{p2Name}</div>
             <div className="text-4xl font-black text-red-400">{runningScoreB}</div>
          </div>
        </div>
      </div>

      {/* Main Stage */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-7xl mx-auto">
        <h2 className="absolute top-0 text-xl font-black text-gray-500 tracking-[0.2em] uppercase bg-gray-900 px-6 py-2 rounded-full border border-gray-800 shadow-md">
          Round {roundIdx + 1} • {round.role.replace('_', ' ')}
        </h2>

        <div className="flex w-full items-center justify-between px-8 mt-12">
          
          {/* Player 1 Character */}
          <div className={`flex flex-col items-center w-1/3 transition-all duration-500 ${phase === PHASES.END && p1Won ? 'scale-110 z-20' : 'scale-100 z-10'} ${phase === PHASES.END && p2Won ? 'opacity-40 grayscale' : ''}`}>
            <div className={`w-64 h-96 bg-gray-900 border-2 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden relative
                ${phase === PHASES.END && p1Won ? 'border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.3)]' : 'border-gray-800'}
              `}>
                {round.charA?.imageUrl ? (
                  <img src={round.charA.imageUrl} alt={round.charA.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600 font-black text-6xl uppercase">
                    {round.charA?.name?.substring(0, 2) || '?'}
                  </div>
                )}
            </div>
            
            <div className="mt-6 text-center">
              <h3 className="text-3xl font-black uppercase tracking-wide drop-shadow-md">{round.charA?.name || 'Missing'}</h3>
              <div className={`bg-gray-900 border border-gray-700 rounded-xl px-8 py-3 mt-4 transition-opacity duration-300 ${hideStats && phase !== PHASES.END ? 'opacity-0' : 'opacity-100'}`}>
                <span className="text-sm font-bold text-gray-500 uppercase mr-3">{round.role.replace('_', ' ')}</span>
                <span className={`text-4xl font-black ${phase === PHASES.END && p1Won ? 'text-yellow-400' : 'text-gray-300'}`}>
                  {round.statA}
                </span>
              </div>
            </div>
          </div>

          {/* VS Center */}
          <div className="flex flex-col items-center justify-center w-1/3 z-30 pointer-events-none">
            {phase === PHASES.INTRO && (
              <div className="text-8xl font-black text-gray-700 italic tracking-tighter animate-pulse opacity-50">VS</div>
            )}
            {phase === PHASES.REVEAL && (
              <div className="text-8xl font-black text-yellow-500 italic tracking-tighter scale-150 transition-transform duration-300 drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]">VS</div>
            )}
            {phase === PHASES.END && (
              <div className="flex flex-col items-center bg-gray-900 border-2 border-gray-700 px-10 py-6 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-bounce">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mb-2">Winner</span>
                <span className={`text-3xl font-black uppercase tracking-widest
                  ${p1Won ? 'text-yellow-400' : p2Won ? 'text-red-400' : 'text-gray-400'}`}>
                  {round.winner === 'tie' ? 'TIE' : (p1Won ? p1Name : p2Name)}
                </span>
              </div>
            )}
          </div>

          {/* Player 2 Character */}
          <div className={`flex flex-col items-center w-1/3 transition-all duration-500 ${phase === PHASES.END && p2Won ? 'scale-110 z-20' : 'scale-100 z-10'} ${phase === PHASES.END && p1Won ? 'opacity-40 grayscale' : ''}`}>
            <div className={`w-64 h-96 bg-gray-900 border-2 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden relative
                ${phase === PHASES.END && p2Won ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)]' : 'border-gray-800'}
              `}>
                {round.charB?.imageUrl ? (
                  <img src={round.charB.imageUrl} alt={round.charB.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600 font-black text-6xl uppercase">
                    {round.charB?.name?.substring(0, 2) || '?'}
                  </div>
                )}
            </div>
            
            <div className="mt-6 text-center">
              <h3 className="text-3xl font-black uppercase tracking-wide drop-shadow-md">{round.charB?.name || 'Missing'}</h3>
              <div className={`bg-gray-900 border border-gray-700 rounded-xl px-8 py-3 mt-4 transition-opacity duration-300 ${hideStats && phase !== PHASES.END ? 'opacity-0' : 'opacity-100'}`}>
                <span className="text-sm font-bold text-gray-500 uppercase mr-3">{round.role.replace('_', ' ')}</span>
                <span className={`text-4xl font-black ${phase === PHASES.END && p2Won ? 'text-red-400' : 'text-gray-300'}`}>
                  {round.statB}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Controls Bar */}
      <div className="relative z-20 bg-gray-900 bg-opacity-80 backdrop-blur-lg border-t border-gray-800 p-6 flex justify-between items-center">
        <div className="flex gap-4">
           <button onClick={() => setIsAutoPlaying(p => !p)} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-colors">
             {isAutoPlaying ? <LucideIcons.Pause size={16} className="text-yellow-500" /> : <LucideIcons.Play size={16} className="text-green-500" />}
             Auto (Space)
           </button>
           <button onClick={advanceState} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-colors">
             <LucideIcons.SkipForward size={16} className="text-blue-400" /> Next (N)
           </button>
           <button onClick={resetRound} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-colors">
             <LucideIcons.RefreshCcw size={16} className="text-purple-400" /> Replay Round
           </button>
        </div>
        
        <div className="flex gap-4">
           <div className="flex bg-gray-800 rounded-xl overflow-hidden border border-gray-600">
             <button onClick={() => setSpeed(1)} className={`px-4 py-3 text-xs font-black transition-colors ${speed === 1 ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>1x</button>
             <button onClick={() => setSpeed(2)} className={`px-4 py-3 text-xs font-black transition-colors border-l border-r border-gray-600 ${speed === 2 ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>2x</button>
             <button onClick={() => setSpeed(3)} className={`px-4 py-3 text-xs font-black transition-colors ${speed === 3 ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>3x</button>
           </div>
           
           <button onClick={() => setHideStats(p => !p)} className="flex items-center gap-2 text-gray-400 hover:text-white bg-gray-800 border border-gray-600 px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-colors">
             {hideStats ? <LucideIcons.EyeOff size={16} /> : <LucideIcons.Eye size={16} />}
           </button>
           
           <button onClick={resetBattle} className="flex items-center gap-2 bg-red-900/30 hover:bg-red-900/60 text-red-400 border border-red-900/50 px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-colors">
             <LucideIcons.RotateCcw size={16} /> Restart Battle
           </button>
        </div>
      </div>

      {/* Battle Complete Modal */}
      {isBattleComplete && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <h2 className="text-4xl font-black uppercase tracking-[0.3em] text-gray-400 mb-8">Simulation Complete</h2>
          <div className="text-9xl font-black font-mono flex items-center gap-12 mb-16 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <span className="text-blue-500">{runningScoreA}</span>
            <span className="text-gray-700 text-6xl">-</span>
            <span className="text-red-500">{runningScoreB}</span>
          </div>
          
          <div className="text-4xl font-black italic uppercase tracking-widest mb-16 bg-gray-900 px-16 py-8 rounded-full border-4 border-gray-800 shadow-2xl">
            {result.overallWinner === 'tie' ? (
              <span className="text-gray-300">It's a Tie!</span>
            ) : (result.overallWinner === p1Id || result.overallWinner === 'player1') ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">{p1Name} Wins!</span>
            ) : (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">{p2Name} Wins!</span>
            )}
          </div>

          <div className="flex gap-4">
            {session?.mode === 'tournament' && (
              <button onClick={() => navigate(`/tournament/${session.tournamentId}`)} className="px-10 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold uppercase tracking-widest transition-colors">
                Back to Bracket
              </button>
            )}
            <button onClick={resetBattle} className="px-10 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 border border-gray-600 transition-colors">
              <LucideIcons.RotateCcw /> Watch Replay
            </button>
            <button onClick={() => navigate('/')} className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-colors">
              <LucideIcons.Home /> Main Menu
            </button>
          </div>
        </div>
      )}

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};
