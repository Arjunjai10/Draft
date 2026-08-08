import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { simulateBattle } from '../api/battles';
import * as LucideIcons from 'lucide-react';
import { SettingsModal } from '../components/settings/SettingsModal';

const SPEED_MAP = { 1: 1000, 2: 500, 3: 250 };
const PHASES = { INTRO: 'INTRO', REVEAL: 'REVEAL', END: 'END' };

export const BattleSim = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
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
    // Generate or fetch the battle result
    simulateBattle(sessionId)
      .then(setResult)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sessionId]);

  // Recalculate running score whenever roundIdx changes
  useEffect(() => {
    if (!result) return;
    let sA = 0;
    let sB = 0;
    for (let i = 0; i < roundIdx; i++) {
      const w = result.rounds[i].winner;
      if (w === 'player1') sA++;
      else if (w === 'player2') sB++;
    }
    setRunningScoreA(sA);
    setRunningScoreB(sB);
  }, [roundIdx, result]);

  const advanceState = useCallback(() => {
    if (!result) return;
    
    setPhase(prev => {
      if (prev === PHASES.INTRO) return PHASES.REVEAL;
      if (prev === PHASES.REVEAL) {
        // Update score for the current round immediately when moving to END
        const currentWinner = result.rounds[roundIdx].winner;
        if (currentWinner === 'player1') setRunningScoreA(s => s + 1);
        else if (currentWinner === 'player2') setRunningScoreB(s => s + 1);
        return PHASES.END;
      }
      if (prev === PHASES.END) {
        if (roundIdx < result.rounds.length - 1) {
          setRoundIdx(r => r + 1);
          return PHASES.INTRO;
        } else {
          return PHASES.END; // Stay at end of last round
        }
      }
      return prev;
    });
  }, [result, roundIdx]);

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
        if (e.shiftKey) {
          resetBattle();
        } else {
          resetRound();
        }
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

  if (loading) return <div className="p-8 text-center text-xl font-bold">Simulating Battle...</div>;
  if (!result) return <div className="p-8 text-center text-red-500">Error loading simulation</div>;

  const round = result.rounds[roundIdx];
  const isBattleComplete = roundIdx === 14 && phase === PHASES.END;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 overflow-hidden relative">
      {/* Header / Scoreboard */}
      <div className="bg-gray-800 p-4 border-b border-gray-700 shadow-md flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors">
            <LucideIcons.ArrowLeft />
          </button>
          <h1 className="text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Battle Sim
          </h1>
        </div>
        
        <div className="flex items-center gap-8 text-2xl font-black font-mono">
          <div className="text-blue-400">Player 1: {runningScoreA}</div>
          <div className="text-gray-500 text-lg">VS</div>
          <div className="text-red-400">CPU: {runningScoreB}</div>
        </div>
        
        <div className="flex gap-2">
           <button onClick={() => setSpeed(1)} className={`px-2 py-1 rounded font-bold ${speed === 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>1x</button>
           <button onClick={() => setSpeed(2)} className={`px-2 py-1 rounded font-bold ${speed === 2 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>2x</button>
           <button onClick={() => setSpeed(3)} className={`px-2 py-1 rounded font-bold ${speed === 3 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>3x</button>
           <button onClick={() => setShowSettings(true)} className="ml-4 text-gray-400 hover:text-white transition-colors"><LucideIcons.Settings /></button>
        </div>
      </div>

      {/* Main Stage */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <h2 className="text-3xl font-black text-gray-400 tracking-widest uppercase mb-12">
          Round {roundIdx + 1} - {round.role.replace('_', ' ')}
        </h2>

        <div className="flex w-full max-w-5xl items-center justify-between relative">
          
          {/* Player 1 Character */}
          <div className="flex flex-col items-center w-1/3">
            <div className={`w-48 h-64 bg-gray-800 border-4 rounded-xl flex items-center justify-center shadow-2xl transition-all duration-500
                ${phase === PHASES.END && round.winner === 'player1' ? 'border-blue-500 scale-105 shadow-[0_0_30px_rgba(59,130,246,0.6)]' : 'border-gray-700'}
                ${phase === PHASES.END && round.winner === 'player2' ? 'opacity-50 grayscale' : ''}
              `}>
               <span className="text-gray-500 font-bold uppercase tracking-widest">IMG</span>
            </div>
            <h3 className="text-2xl font-bold mt-4">{round.charA?.name || 'Missing'}</h3>
            <div className={`text-4xl font-black mt-2 transition-opacity duration-300 ${hideStats && phase !== PHASES.END ? 'opacity-0' : 'opacity-100'} ${phase === PHASES.END && round.winner === 'player1' ? 'text-blue-400' : 'text-gray-300'}`}>
              {round.statA}
            </div>
          </div>

          {/* VS Center */}
          <div className="flex flex-col items-center justify-center w-1/3 z-10">
            {phase === PHASES.INTRO && (
              <div className="text-6xl font-black text-gray-600 italic tracking-tighter animate-pulse">
                VS
              </div>
            )}
            {phase === PHASES.REVEAL && (
              <div className="text-6xl font-black text-yellow-500 italic tracking-tighter scale-150 transition-transform duration-300">
                VS
              </div>
            )}
            {phase === PHASES.END && (
              <div className="flex flex-col items-center bg-gray-900 border border-gray-700 px-8 py-4 rounded-full shadow-2xl animate-bounce">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Winner</span>
                <span className={`text-2xl font-black uppercase tracking-wider
                  ${round.winner === 'player1' ? 'text-blue-400' : round.winner === 'player2' ? 'text-red-400' : 'text-gray-400'}`}>
                  {round.winner === 'tie' ? 'TIE - NO POINT' : (round.winner === 'player1' ? 'Player 1' : 'CPU')}
                </span>
              </div>
            )}
          </div>

          {/* Player 2 Character */}
          <div className="flex flex-col items-center w-1/3">
            <div className={`w-48 h-64 bg-gray-800 border-4 rounded-xl flex items-center justify-center shadow-2xl transition-all duration-500
                ${phase === PHASES.END && round.winner === 'player2' ? 'border-red-500 scale-105 shadow-[0_0_30px_rgba(248,113,113,0.6)]' : 'border-gray-700'}
                ${phase === PHASES.END && round.winner === 'player1' ? 'opacity-50 grayscale' : ''}
              `}>
               <span className="text-gray-500 font-bold uppercase tracking-widest">IMG</span>
            </div>
            <h3 className="text-2xl font-bold mt-4">{round.charB?.name || 'Missing'}</h3>
            <div className={`text-4xl font-black mt-2 transition-opacity duration-300 ${hideStats && phase !== PHASES.END ? 'opacity-0' : 'opacity-100'} ${phase === PHASES.END && round.winner === 'player2' ? 'text-red-400' : 'text-gray-300'}`}>
              {round.statB}
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-gray-800 p-4 border-t border-gray-700 flex justify-between items-center z-10">
        <div className="flex gap-4">
           <button onClick={() => setIsAutoPlaying(p => !p)} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded font-bold uppercase text-sm">
             {isAutoPlaying ? <LucideIcons.Pause size={16} /> : <LucideIcons.Play size={16} />}
             Auto (Space)
           </button>
           <button onClick={advanceState} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded font-bold uppercase text-sm">
             <LucideIcons.SkipForward size={16} /> Next (N)
           </button>
           <button onClick={resetRound} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded font-bold uppercase text-sm">
             <LucideIcons.RefreshCcw size={16} /> Replay Round (R)
           </button>
        </div>
        
        <div className="flex gap-4">
           <button onClick={() => setHideStats(p => !p)} className="flex items-center gap-2 text-gray-400 hover:text-white px-4 py-2 rounded font-bold uppercase text-sm">
             {hideStats ? <LucideIcons.EyeOff size={16} /> : <LucideIcons.Eye size={16} />}
             Hide Stats (H)
           </button>
           <button onClick={resetBattle} className="flex items-center gap-2 bg-red-900/50 hover:bg-red-900 text-red-200 px-4 py-2 rounded font-bold uppercase text-sm border border-red-800">
             <LucideIcons.RotateCcw size={16} /> Restart Battle (Shift+R)
           </button>
        </div>
      </div>

      {/* Battle Complete Modal */}
      {isBattleComplete && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
          <h2 className="text-6xl font-black uppercase tracking-widest mb-4">Battle Complete</h2>
          <div className="text-8xl font-black font-mono flex items-center gap-8 mb-12">
            <span className="text-blue-500">{runningScoreA}</span>
            <span className="text-gray-600 text-4xl">-</span>
            <span className="text-red-500">{runningScoreB}</span>
          </div>
          
          <div className="text-3xl font-bold uppercase tracking-widest mb-16 bg-gray-800 px-12 py-6 rounded-full border-2 border-gray-600 shadow-2xl">
            {result.overallWinner === 'tie' ? (
              <span className="text-gray-300">It's a Tie!</span>
            ) : result.overallWinner === 'player1' ? (
              <span className="text-blue-400 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">Player 1 Wins!</span>
            ) : (
              <span className="text-red-400 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">CPU Wins!</span>
            )}
          </div>

          <div className="flex gap-6">
            <button onClick={resetBattle} className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold uppercase tracking-widest flex items-center gap-2">
              <LucideIcons.RotateCcw /> Watch Replay
            </button>
            <button onClick={() => navigate('/')} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold uppercase tracking-widest flex items-center gap-2">
              <LucideIcons.Home /> Main Menu
            </button>
          </div>
        </div>
      )}

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};
