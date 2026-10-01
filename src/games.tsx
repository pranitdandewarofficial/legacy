import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  type AppState, getCurrentWallet, updateBalance, addTransaction, addBet,
  playSound, formatCurrency
} from './store';

type SetState = (s: AppState | ((p: AppState) => AppState)) => void;

// ============ GAME 1: SLOTS ============
export function SlotsGame({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  const wallet = getCurrentWallet(state);
  const [bet, setBet] = useState(100);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState([['🍒', '🔔', '🍋'], ['🍇', '⭐', '🍒'], ['💎', '7️⃣', '🔔']]);
  const [winAmount, setWinAmount] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const symbols = ['🍒', '🔔', '🍋', '🍇', '⭐', '💎', '7️⃣'];
  const weights = [25, 20, 18, 14, 12, 8, 3];
  const payouts: Record<string, number> = { '7️⃣': 500, '💎': 200, '⭐': 100, '🍇': 50, '🍋': 30, '🔔': 20, '🍒': 10 };

  const weightedRandom = () => {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < symbols.length; i++) {
      r -= weights[i];
      if (r <= 0) return symbols[i];
    }
    return symbols[0];
  };

  const spin = () => {
    if (spinning) return;
    if ((wallet?.balance || 0) < bet) { playSound('loss'); return; }

    setSpinning(true);
    setShowResult(false);
    setWinAmount(0);
    playSound('spin');

    const commission = Math.round(bet * state.settings.commissionRate * 100) / 100;
    let newState = updateBalance(state, state.session!, -(bet + commission));

    const result = [
      [weightedRandom(), weightedRandom(), weightedRandom()],
      [weightedRandom(), weightedRandom(), weightedRandom()],
      [weightedRandom(), weightedRandom(), weightedRandom()],
    ];

    let ticks = 0;
    const interval = setInterval(() => {
      setReels([
        [weightedRandom(), weightedRandom(), weightedRandom()],
        [weightedRandom(), weightedRandom(), weightedRandom()],
        [weightedRandom(), weightedRandom(), weightedRandom()],
      ]);
      ticks++;
      if (ticks > 15) {
        clearInterval(interval);
        setReels(result);
        const midRow = [result[0][1], result[1][1], result[2][1]];
        let win = 0;
        if (midRow[0] === midRow[1] && midRow[1] === midRow[2]) {
          win = bet * (payouts[midRow[0]] || 10);
        } else if (midRow[0] === midRow[1] || midRow[1] === midRow[2] || midRow[0] === midRow[2]) {
          win = Math.round(bet * 1.5);
        }

        if (win > 0) {
          newState = updateBalance(newState, state.session!, win);
          setWinAmount(win);
          playSound('win');
          if (win >= bet * 50) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
            playSound('fanfare');
          }
        } else {
          playSound('loss');
        }

        newState = addBet(newState, {
          uid: state.session!,
          game: 'Slots',
          amount: bet,
          result: win > 0 ? 'win' : 'loss',
          payout: win,
          commission,
        });
        setState(newState);
        setShowResult(true);
        setSpinning(false);
      }
    }, 80);
  };

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col overflow-y-auto no-scrollbar">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between safe-top">
        <button onClick={() => navigate('home')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">🎰 Joker's Fortune</h1>
        <span className="text-xs font-mono-game font-bold text-[#FFC93D]">{formatCurrency(wallet?.balance || 0)}</span>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 pt-4 pb-8">
        {/* Jackpot Bar */}
        <div className="w-full animate-shimmer rounded-xl py-2 text-center mb-4">
          <p className="text-xs font-black text-black uppercase">🏆 Jackpot: ₹{((wallet?.balance || 0) * 10).toLocaleString()}</p>
        </div>

        {/* Reels */}
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-4 border-2 border-[#FFC93D]/30 w-full max-w-xs">
          <div className="grid grid-cols-3 gap-2">
            {reels.map((reel, ri) => (
              <div key={ri} className="space-y-2">
                {reel.map((sym, si) => (
                  <div key={si} className={`h-16 bg-[#0A0A0A] rounded-xl flex items-center justify-center text-3xl border border-[#2A2A2A] ${
                    spinning ? 'opacity-70' : ''
                  }`}>
                    {sym}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Result */}
        {showResult && (
          <div className={`mt-4 text-center animate-bounce-in ${winAmount > 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
            <p className="text-2xl font-black font-mono-game">
              {winAmount > 0 ? `+${formatCurrency(winAmount)}` : 'No Win'}
            </p>
          </div>
        )}

        {/* Bet Control */}
        <div className="mt-6 w-full max-w-xs">
          <div className="flex items-center justify-between bg-[#141414] rounded-xl p-3 border border-[#2A2A2A]">
            <button onClick={() => setBet(Math.max(10, bet - 50))} className="w-10 h-10 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-lg font-bold text-gray-400 active:scale-95">-</button>
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase">Bet</p>
              <p className="text-xl font-black font-mono-game text-white">{formatCurrency(bet)}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setBet(Math.min(state.settings.maxBet, bet * 2))} className="w-10 h-10 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-xs font-bold text-[#FFC93D] active:scale-95">×2</button>
              <button onClick={() => setBet(state.settings.maxBet)} className="w-10 h-10 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-[10px] font-bold text-[#FFC93D] active:scale-95">MAX</button>
            </div>
          </div>
          <button onClick={spin} disabled={spinning}
            className={`w-full mt-3 py-4 rounded-xl font-black text-lg uppercase ${
              spinning ? 'bg-gray-700 text-gray-400' : 'btn-green'
            }`}>
            {spinning ? '⏳ Spinning...' : '🎰 SPIN'}
          </button>
        </div>

        {/* Paytable */}
        <div className="mt-4 w-full max-w-xs card">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Paytable (3 in middle row)</p>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(payouts).map(([sym, mult]) => (
              <div key={sym} className="flex items-center justify-between py-1 px-2 bg-[#1A1A1A] rounded-lg">
                <span className="text-sm">{sym}{sym}{sym}</span>
                <span className="text-[10px] font-bold text-[#FFC93D]">{mult}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ GAME 2: CRASH (Real Plane) ============
export function CrashGame({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  const wallet = getCurrentWallet(state);
  const [bet, setBet] = useState(100);
  const [multiplier, setMultiplier] = useState(1.0);
  const [phase, setPhase] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const [crashPoint, setCrashPoint] = useState(2.5);
  const [cashedOut, setCashedOut] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [betPlaced, setBetPlaced] = useState(false);
  const [round, setRound] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cashOutMultRef = useRef(1);
  const mountedRef = useRef(true);
  const starsRef = useRef<Array<{x: number, y: number, size: number, speed: number}>>([]);

  // Initialize stars
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 50; i++) {
      stars.push({
        x: Math.random() * 360,
        y: Math.random() * 240,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.2
      });
    }
    starsRef.current = stars;
  }, []);

  const generateCrashPoint = () => {
    const r = Math.random();
    if (r < 0.35) return 1 + Math.random() * 1;
    if (r < 0.55) return 2 + Math.random() * 3;
    if (r < 0.80) return 5 + Math.random() * 5;
    if (r < 0.95) return 10 + Math.random() * 10;
    return 20 + Math.random() * 30;
  };

  const drawChart = useCallback((m: number, cp: number, crashed: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    // Clear with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#0A0A0A');
    gradient.addColorStop(1, '#141414');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Draw stars
    starsRef.current.forEach(star => {
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      star.y += star.speed;
      if (star.y > h) {
        star.y = 0;
        star.x = Math.random() * w;
      }
    });

    // Grid lines
    ctx.strokeStyle = '#2A2A2A';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, h - (h / 5) * i);
      ctx.lineTo(w, h - (h / 5) * i);
      ctx.stroke();
    }

    // Draw curve
    const elapsed = Math.log(Math.max(1, m)) / 0.15;
    const points = Math.min(Math.floor(elapsed * 20), w);
    if (points > 0) {
      // Glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = crashed ? '#EF4444' : '#22C55E';
      
      ctx.beginPath();
      ctx.strokeStyle = crashed ? '#EF4444' : '#22C55E';
      ctx.lineWidth = 3;
      
      let lastX = 0, lastY = h;
      for (let i = 0; i <= points; i++) {
        const t = i / 20;
        const x = (i / points) * w;
        const yVal = Math.pow(Math.E, 0.15 * t);
        const y = h - (yVal / Math.max(cp, m)) * h * 0.85;
        if (i === 0) {
          ctx.moveTo(x, Math.max(20, y));
        } else {
          ctx.lineTo(x, Math.max(20, y));
        }
        lastX = x;
        lastY = Math.max(20, y);
      }
      ctx.stroke();
      
      // Fill under curve
      ctx.lineTo(lastX, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      const fillGradient = ctx.createLinearGradient(0, 0, 0, h);
      fillGradient.addColorStop(0, crashed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)');
      fillGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = fillGradient;
      ctx.fill();
      
      ctx.shadowBlur = 0;

      // Draw plane/rocket at tip
      ctx.font = '24px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✈️', lastX, lastY - 15);
    }
  }, []);

  // Game loop
  useEffect(() => {
    mountedRef.current = true;
    const cp = generateCrashPoint();
    setCrashPoint(cp);
    setPhase('waiting');
    setCountdown(5);
    setCashedOut(false);
    setMultiplier(1.0);
    setBetPlaced(false);
    cashOutMultRef.current = 1;

    let count = 5;
    const countInterval = setInterval(() => {
      if (!mountedRef.current) return;
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(countInterval);
        if (!mountedRef.current) return;
        setPhase('flying');
        const startTime = Date.now();

        const tick = () => {
          if (!mountedRef.current) return;
          const elapsed = (Date.now() - startTime) / 1000;
          const m = Math.pow(Math.E, 0.15 * elapsed);

          if (m >= cp) {
            setMultiplier(cp);
            cashOutMultRef.current = cp;
            setPhase('crashed');
            drawChart(cp, cp, true);
            playSound('explosion');
            return;
          }
          setMultiplier(m);
          cashOutMultRef.current = m;
          drawChart(m, cp, false);
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, 1000);

    return () => {
      mountedRef.current = false;
      clearInterval(countInterval);
    };
  }, [round, drawChart]);

  // Auto restart
  useEffect(() => {
    if (phase === 'crashed') {
      const timer = setTimeout(() => {
        if (mountedRef.current) setRound(r => r + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Handle loss
  useEffect(() => {
    if (phase === 'crashed' && betPlaced && !cashedOut) {
      const commission = Math.round(bet * state.settings.commissionRate * 100) / 100;
      setState(prev => {
        let ns = updateBalance(prev, prev.session!, -(bet + commission));
        ns = addBet(ns, { uid: prev.session!, game: 'Crash', amount: bet, result: 'loss', payout: 0, commission });
        return ns;
      });
      playSound('loss');
    }
  }, [phase]);

  const placeBet = () => {
    if ((wallet?.balance || 0) < bet) { playSound('loss'); return; }
    if (phase !== 'waiting') return;
    playSound('click');
    setBetPlaced(true);
  };

  const cashOut = () => {
    if (phase !== 'flying' || cashedOut || !betPlaced) return;
    setCashedOut(true);
    const currentMult = cashOutMultRef.current;
    const win = Math.round(bet * currentMult);
    const commission = Math.round(bet * state.settings.commissionRate * 100) / 100;
    setState(prev => {
      let ns = updateBalance(prev, prev.session!, win - bet - commission);
      ns = addBet(ns, { uid: prev.session!, game: 'Crash', amount: bet, result: 'win', payout: win, commission });
      return ns;
    });
    playSound('cashout');
    confetti({ particleCount: 50, spread: 60 });
  };

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between safe-top">
        <button onClick={() => navigate('home')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">✈️ Plane</h1>
        <span className="text-xs font-mono-game font-bold text-[#FFC93D]">{formatCurrency(wallet?.balance || 0)}</span>
      </div>

      <div className="flex-1 flex flex-col px-4 pt-3 pb-8">
        {/* Canvas */}
        <div className="relative bg-[#141414] rounded-2xl border border-[#2A2A2A] overflow-hidden h-64">
          <canvas ref={canvasRef} width={360} height={256} className="w-full h-full" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {phase === 'waiting' && (
              <div className="text-center">
                <p className="text-5xl font-black font-mono-game text-white">{countdown}s</p>
                <p className="text-sm text-gray-400 mt-2">Next round starting...</p>
              </div>
            )}
            {phase === 'flying' && (
              <p className={`text-6xl font-black font-mono-game ${cashedOut ? 'text-[#22C55E]' : 'text-white'}`} style={{textShadow: '0 0 20px rgba(34, 197, 94, 0.5)'}}>
                {multiplier.toFixed(2)}x
              </p>
            )}
            {phase === 'crashed' && (
              <div className="text-center animate-shake">
                <p className="text-4xl font-black font-mono-game text-[#EF4444]" style={{textShadow: '0 0 20px rgba(239, 68, 68, 0.5)'}}>CRASHED!</p>
                <p className="text-2xl font-mono-game text-[#EF4444]/60 mt-2">{crashPoint.toFixed(2)}x</p>
              </div>
            )}
          </div>
        </div>

        {cashedOut && (
          <div className="text-center mt-3 animate-bounce-in">
            <p className="text-xl font-bold text-[#22C55E]">✓ Cashed out at {multiplier.toFixed(2)}x</p>
            <p className="text-base font-mono-game text-[#22C55E]">+{formatCurrency(Math.round(bet * multiplier))}</p>
          </div>
        )}

        <div className="mt-4">
          <div className="flex items-center justify-between bg-[#141414] rounded-xl p-3 border border-[#2A2A2A]">
            <button onClick={() => setBet(Math.max(10, bet - 50))} className="w-10 h-10 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-lg font-bold text-gray-400">-</button>
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase">Bet</p>
              <p className="text-xl font-black font-mono-game text-white">{formatCurrency(bet)}</p>
            </div>
            <button onClick={() => setBet(Math.min(state.settings.maxBet, bet * 2))} className="w-10 h-10 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-xs font-bold text-[#FFC93D]">×2</button>
          </div>

          {phase === 'flying' && betPlaced && !cashedOut ? (
            <button onClick={cashOut} className="btn-red w-full mt-3 py-4 text-lg animate-pulse-gold">
              💰 CASH OUT {formatCurrency(Math.round(bet * multiplier))}
            </button>
          ) : phase === 'waiting' && !betPlaced ? (
            <button onClick={placeBet} className="btn-green w-full mt-3 py-4 text-lg">
              🎯 PLACE BET
            </button>
          ) : (
            <button disabled className="w-full mt-3 py-4 rounded-xl font-black text-lg uppercase bg-gray-700 text-gray-400">
              {phase === 'flying' ? '⏳ Flying...' : phase === 'crashed' ? '💥 Crashed' : '✓ Bet Placed'}
            </button>
          )}
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          {[1.5, 2, 3, 5, 10].map(m => (
            <button key={m} className="px-3 py-1.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full text-[10px] font-bold text-gray-400 whitespace-nowrap">
              {m}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ GAME 3: MINES ============
export function MinesGame({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  const wallet = getCurrentWallet(state);
  const [bet, setBet] = useState(100);
  const [mineCount, setMineCount] = useState(3);
  const [grid, setGrid] = useState<(null | 'gem' | 'mine')[]>(Array(25).fill(null));
  const [mines, setMines] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const [gemsFound, setGemsFound] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentMult, setCurrentMult] = useState(1);

  const calcMultiplier = (gems: number, mc: number) => {
    let mult = 0.97;
    for (let i = 0; i < gems; i++) {
      mult *= (25 - i) / (25 - mc - i);
    }
    return Math.round(mult * 100) / 100;
  };

  const startGame = () => {
    if ((wallet?.balance || 0) < bet) { playSound('loss'); return; }
    playSound('click');

    const minePositions: number[] = [];
    while (minePositions.length < mineCount) {
      const pos = Math.floor(Math.random() * 25);
      if (!minePositions.includes(pos)) minePositions.push(pos);
    }
    setMines(minePositions);
    setGrid(Array(25).fill(null));
    setPlaying(true);
    setGameOver(false);
    setGemsFound(0);
    setCurrentMult(1);
  };

  const revealTile = (index: number) => {
    if (!playing || grid[index] !== null || gameOver) return;

    if (mines.includes(index)) {
      const newGrid = [...grid];
      mines.forEach(m => newGrid[m] = 'mine');
      setGrid(newGrid);
      setGameOver(true);
      setPlaying(false);
      playSound('explosion');

      const commission = Math.round(bet * state.settings.commissionRate * 100) / 100;
      setState(prev => {
        let ns = updateBalance(prev, prev.session!, -(bet + commission));
        ns = addBet(ns, { uid: prev.session!, game: 'Mines', amount: bet, result: 'loss', payout: 0, commission });
        return ns;
      });
    } else {
      const newGrid = [...grid];
      newGrid[index] = 'gem';
      setGrid(newGrid);
      const newGems = gemsFound + 1;
      setGemsFound(newGems);
      const mult = calcMultiplier(newGems, mineCount);
      setCurrentMult(mult);
      playSound('tick');
    }
  };

  const cashOut = () => {
    if (!playing || gemsFound === 0) return;
    const win = Math.round(bet * currentMult);
    const commission = Math.round(bet * state.settings.commissionRate * 100) / 100;
    setState(prev => {
      let ns = updateBalance(prev, prev.session!, win - bet - commission);
      ns = addBet(ns, { uid: prev.session!, game: 'Mines', amount: bet, result: 'win', payout: win, commission });
      return ns;
    });
    setPlaying(false);
    playSound('cashout');
    confetti({ particleCount: 40, spread: 50 });

    const newGrid = [...grid];
    mines.forEach(m => { if (newGrid[m] === null) newGrid[m] = 'mine'; });
    setGrid(newGrid);
  };

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col overflow-y-auto no-scrollbar">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between safe-top">
        <button onClick={() => navigate('home')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">💎 Mines</h1>
        <span className="text-xs font-mono-game font-bold text-[#FFC93D]">{formatCurrency(wallet?.balance || 0)}</span>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 pt-3 pb-8">
        {/* Config */}
        {!playing && !gameOver && (
          <div className="w-full max-w-xs space-y-3 mb-4">
            <div className="flex items-center justify-between bg-[#141414] rounded-xl p-3 border border-[#2A2A2A]">
              <span className="text-xs text-gray-400">Mines</span>
              <div className="flex gap-2">
                {[1, 3, 5, 10, 15].map(n => (
                  <button key={n} onClick={() => setMineCount(n)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold ${mineCount === n ? 'bg-[#FFC93D] text-black' : 'bg-[#1A1A1A] text-gray-400'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between bg-[#141414] rounded-xl p-3 border border-[#2A2A2A]">
              <button onClick={() => setBet(Math.max(10, bet - 50))} className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-sm font-bold text-gray-400">-</button>
              <div className="text-center">
                <p className="text-[10px] text-gray-500 uppercase">Bet</p>
                <p className="text-lg font-black font-mono-game text-white">{formatCurrency(bet)}</p>
              </div>
              <button onClick={() => setBet(Math.min(state.settings.maxBet, bet * 2))} className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-xs font-bold text-[#FFC93D]">×2</button>
            </div>
          </div>
        )}

        {/* Stats */}
        {playing && (
          <div className="flex gap-4 mb-3">
            <div className="text-center">
              <p className="text-lg font-black font-mono-game text-[#FFC93D]">{currentMult.toFixed(2)}x</p>
              <p className="text-[10px] text-gray-500">Multiplier</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black font-mono-game text-[#3B82F6]">{gemsFound}</p>
              <p className="text-[10px] text-gray-500">Gems</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black font-mono-game text-[#22C55E]">{formatCurrency(Math.round(bet * currentMult))}</p>
              <p className="text-[10px] text-gray-500">Potential</p>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-5 gap-2 w-full max-w-xs">
          {grid.map((cell, i) => (
            <button key={i} onClick={() => revealTile(i)}
              className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all ${
                cell === 'gem' ? 'bg-blue-900/40 border-2 border-blue-500 animate-bounce-in' :
                cell === 'mine' ? 'bg-red-900/40 border-2 border-red-500 animate-shake' :
                playing ? 'bg-[#141414] border border-[#2A2A2A] active:scale-90 hover:border-purple-500' :
                'bg-[#141414] border border-[#2A2A2A]'
              }`}>
              {cell === 'gem' ? '💎' : cell === 'mine' ? '💣' : playing ? '' : '·'}
            </button>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-4 w-full max-w-xs">
          {!playing ? (
            <button onClick={startGame} className="btn-green w-full py-4 text-lg">
              {gameOver ? '🔄 Play Again' : '🎮 Start Game'}
            </button>
          ) : (
            <button onClick={cashOut} disabled={gemsFound === 0}
              className={`w-full py-4 rounded-xl font-black text-lg uppercase ${
                gemsFound === 0 ? 'bg-gray-700 text-gray-400' : 'btn-gold'
              }`}>
              💰 Cash Out {formatCurrency(Math.round(bet * currentMult))}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ GAME 4: DICE ============
export function DiceGame({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  const wallet = getCurrentWallet(state);
  const [bet, setBet] = useState(100);
  const [choice, setChoice] = useState<'higher' | 'lower' | null>(null);
  const [dice, setDice] = useState([1, 1]);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<'win' | 'loss' | null>(null);
  const [winAmount, setWinAmount] = useState(0);

  const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  const roll = () => {
    if (rolling || !choice) return;
    if ((wallet?.balance || 0) < bet) { playSound('loss'); return; }

    setRolling(true);
    setResult(null);
    playSound('spin');

    let ticks = 0;
    const interval = setInterval(() => {
      setDice([Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)]);
      ticks++;
      if (ticks > 10) {
        clearInterval(interval);
        const finalDice = [Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)];
        setDice(finalDice);
        const sum = finalDice[0] + finalDice[1];

        let won = false;
        if (choice === 'higher' && sum > 7) won = true;
        if (choice === 'lower' && sum < 7) won = true;

        const commission = Math.round(bet * state.settings.commissionRate * 100) / 100;
        if (won) {
          const win = bet * 2;
          setWinAmount(win);
          setResult('win');
          setState(prev => {
            let ns = updateBalance(prev, prev.session!, win - bet - commission);
            ns = addBet(ns, { uid: prev.session!, game: 'Dice', amount: bet, result: 'win', payout: win, commission });
            return ns;
          });
          playSound('win');
          confetti({ particleCount: 30, spread: 50 });
        } else {
          setWinAmount(0);
          setResult('loss');
          setState(prev => {
            let ns = updateBalance(prev, prev.session!, -(bet + commission));
            ns = addBet(ns, { uid: prev.session!, game: 'Dice', amount: bet, result: 'loss', payout: 0, commission });
            return ns;
          });
          playSound('loss');
        }
        setRolling(false);
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between safe-top">
        <button onClick={() => navigate('home')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">🎲 Lucky Dice</h1>
        <span className="text-xs font-mono-game font-bold text-[#FFC93D]">{formatCurrency(wallet?.balance || 0)}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        {/* Dice Display */}
        <div className="flex gap-6 mb-6">
          {dice.map((d, i) => (
            <div key={i} className={`w-24 h-24 bg-[#141414] border-2 border-[#3A3A3A] rounded-2xl flex items-center justify-center text-5xl ${
              rolling ? 'animate-shake' : ''
            }`}>
              {diceFaces[d - 1]}
            </div>
          ))}
        </div>

        {/* Sum */}
        <div className="text-center mb-6">
          <p className="text-3xl font-black font-mono-game text-white">{dice[0] + dice[1]}</p>
          <p className="text-xs text-gray-500">Sum (&gt;7 or &lt;7 wins 2x)</p>
        </div>

        {/* Result */}
        {result && (
          <div className={`text-center mb-4 animate-bounce-in ${result === 'win' ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
            <p className="text-xl font-black">
              {result === 'win' ? `+${formatCurrency(winAmount)}` : 'House Wins!'}
            </p>
          </div>
        )}

        {/* Choice */}
        <div className="flex gap-3 mb-6 w-full max-w-xs">
          <button onClick={() => setChoice('higher')}
            className={`flex-1 py-4 rounded-xl font-bold text-sm uppercase transition-all ${
              choice === 'higher' ? 'bg-gradient-to-b from-green-400 to-green-600 text-white shadow-lg shadow-green-500/30' : 'bg-[#141414] border border-[#2A2A2A] text-gray-400'
            }`}>
            ⬆️ Higher
          </button>
          <button onClick={() => setChoice('lower')}
            className={`flex-1 py-4 rounded-xl font-bold text-sm uppercase transition-all ${
              choice === 'lower' ? 'bg-gradient-to-b from-red-400 to-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-[#141414] border border-[#2A2A2A] text-gray-400'
            }`}>
            ⬇️ Lower
          </button>
        </div>

        {/* Bet Control */}
        <div className="w-full max-w-xs">
          <div className="flex items-center justify-between bg-[#141414] rounded-xl p-3 border border-[#2A2A2A]">
            <button onClick={() => setBet(Math.max(10, bet - 50))} className="w-10 h-10 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-lg font-bold text-gray-400">-</button>
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase">Bet</p>
              <p className="text-xl font-black font-mono-game text-white">{formatCurrency(bet)}</p>
            </div>
            <button onClick={() => setBet(Math.min(state.settings.maxBet, bet * 2))} className="w-10 h-10 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-xs font-bold text-[#FFC93D]">×2</button>
          </div>
          <button onClick={roll} disabled={rolling || !choice}
            className={`w-full mt-3 py-4 rounded-xl font-black text-lg uppercase ${
              rolling || !choice ? 'bg-gray-700 text-gray-400' : 'btn-gold'
            }`}>
            {rolling ? '🎲 Rolling...' : '🎲 ROLL'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ GAME 5: LUCKY WHEEL ============
export function WheelGame({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  const wallet = getCurrentWallet(state);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spinCost = 50;

  const segments = [
    { value: 10, color: '#3B82F6' },
    { value: 20, color: '#8B3FE8' },
    { value: 50, color: '#22C55E' },
    { value: 100, color: '#F59E0B' },
    { value: 500, color: '#EC4899' },
    { value: 50, color: '#22C55E' },
    { value: 5000, color: '#FFC93D' },
    { value: 100, color: '#F59E0B' },
    { value: 50, color: '#22C55E' },
    { value: 10, color: '#3B82F6' },
    { value: 20, color: '#8B3FE8' },
    { value: 100, color: '#F59E0B' },
  ];

  const weights = [25, 20, 20, 15, 10, 0, 3, 0, 0, 0, 0, 0];

  // Draw wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    const segAngle = (2 * Math.PI) / 12;

    ctx.clearRect(0, 0, size, size);

    for (let i = 0; i < 12; i++) {
      const startAngle = i * segAngle - Math.PI / 2;
      const endAngle = startAngle + segAngle;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segments[i].color;
      ctx.fill();
      ctx.strokeStyle = '#0A0A0A';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + segAngle / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Inter';
      ctx.fillText(`₹${segments[i].value}`, radius * 0.65, 5);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(center, center, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#141414';
    ctx.fill();
    ctx.strokeStyle = '#FFC93D';
    ctx.lineWidth = 3;
    ctx.stroke();
  }, []);

  const spinWheel = () => {
    if (spinning) return;
    if ((wallet?.balance || 0) < spinCost) { playSound('loss'); return; }

    setSpinning(true);
    setResult(null);
    playSound('spin');

    const commission = Math.round(spinCost * state.settings.commissionRate * 100) / 100;

    // Weighted random
    const totalWeight = weights.reduce((s, w) => s + w, 0);
    let r = Math.random() * totalWeight;
    let winIndex = 0;
    for (let i = 0; i < segments.length; i++) {
      r -= weights[i];
      if (r <= 0) { winIndex = i; break; }
    }

    const segAngle = 360 / 12;
    const targetAngle = 360 - (winIndex * segAngle + segAngle / 2);
    const totalRotation = 360 * 8 + targetAngle;

    setRotation(prev => prev + totalRotation);

    setTimeout(() => {
      const prize = segments[winIndex].value;
      setResult(prize);
      setState(prev => {
        let ns = updateBalance(prev, prev.session!, prize - spinCost - commission);
        ns = addBet(ns, {
          uid: prev.session!,
          game: 'Wheel',
          amount: spinCost,
          result: prize > spinCost ? 'win' : 'loss',
          payout: prize,
          commission,
        });
        return ns;
      });

      if (prize >= 500) {
        playSound('fanfare');
        confetti({ particleCount: 80, spread: 70 });
      } else {
        playSound('win');
      }
      setSpinning(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between safe-top">
        <button onClick={() => navigate('home')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">🎡 Lucky Wheel</h1>
        <span className="text-xs font-mono-game font-bold text-[#FFC93D]">{formatCurrency(wallet?.balance || 0)}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        {/* Pointer */}
        <div className="relative">
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10 text-2xl text-[#FFC93D]">▼</div>

          {/* Wheel */}
          <div className="relative w-72 h-72">
            <canvas
              ref={canvasRef}
              width={288}
              height={288}
              className="w-full h-full rounded-full border-4 border-[#FFC93D]/30"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'transform 4s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
              }}
            />
          </div>
        </div>

        {/* Result */}
        {result !== null && (
          <div className="mt-4 text-center animate-bounce-in">
            <p className="text-2xl font-black text-[#FFC93D]">+{formatCurrency(result)}</p>
            <p className="text-xs text-gray-400">You won!</p>
          </div>
        )}

        {/* Spin Button */}
        <button onClick={spinWheel} disabled={spinning}
          className={`mt-6 w-64 py-4 rounded-xl font-black text-lg uppercase ${
            spinning ? 'bg-gray-700 text-gray-400' : 'btn-gold'
          }`}>
          {spinning ? '🎡 Spinning...' : `🎡 SPIN (₹${spinCost})`}
        </button>

        {/* Prize Info */}
        <div className="mt-4 card w-full max-w-xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Prizes</p>
          <div className="grid grid-cols-3 gap-1">
            {[10, 20, 50, 100, 500, 5000].map(v => (
              <div key={v} className="text-center py-1 bg-[#1A1A1A] rounded text-[10px] font-bold text-gray-300">
                ₹{v}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
