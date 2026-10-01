// @ts-nocheck
// All Games - Combined file for all 5 games
import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import type { AppState } from '../../store/types';
import { getCurrentWallet, updateBalance, addBet } from '../../store';
import { playSound, formatCurrency } from '../../utils';

type SetState = (s: AppState | ((p: AppState) => AppState)) => void;

// ============ GAME 1: SLOTS ============
export function SlotsGame({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  const wallet = getCurrentWallet(state);
  const [bet, setBet] = useState(100);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState([['🍒', '🔔', '🍋'], ['🍇', '⭐', '🍒'], ['💎', '7️⃣', '🔔']]);
  const [winAmount, setWinAmount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [winningCells, setWinningCells] = useState<number[]>([]);

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
    if ((wallet?.balance || 0) < bet) { playSound('loss'); alert('Insufficient balance! Please deposit.'); return; }

    setSpinning(true);
    setShowResult(false);
    setWinAmount(0);
    setWinningCells([]);
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
      setReels([[weightedRandom(), weightedRandom(), weightedRandom()], [weightedRandom(), weightedRandom(), weightedRandom()], [weightedRandom(), weightedRandom(), weightedRandom()]]);
      playSound('tick');
      ticks++;
      if (ticks > 20) {
        clearInterval(interval);
        setReels(result);
        const midRow = [result[0][1], result[1][1], result[2][1]];
        let win = 0;
        const winningIndices: number[] = [];
        if (midRow[0] === midRow[1] && midRow[1] === midRow[2]) {
          win = bet * (payouts[midRow[0]] || 10);
          winningIndices.push(1, 4, 7);
        } else if (midRow[0] === midRow[1] || midRow[1] === midRow[2] || midRow[0] === midRow[2]) {
          win = Math.round(bet * 1.5);
          if (midRow[0] === midRow[1]) winningIndices.push(1, 4);
          if (midRow[1] === midRow[2]) winningIndices.push(4, 7);
          if (midRow[0] === midRow[2]) winningIndices.push(1, 7);
        }
        setWinningCells(winningIndices);
        if (win > 0) {
          newState = updateBalance(newState, state.session!, win);
          setWinAmount(win);
          playSound('win');
          confetti({ particleCount: win >= bet * 50 ? 150 : 30, spread: win >= bet * 50 ? 100 : 50, origin: { y: 0.5 } });
          if (win >= bet * 50) playSound('fanfare');
        } else { playSound('loss'); }
        newState = addBet(newState, { uid: state.session!, game: 'Slots', amount: bet, result: win > 0 ? 'win' : 'loss', payout: win, commission });
        setState(newState);
        setShowResult(true);
        setSpinning(false);
      }
    }, 80);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0A0A0A] to-[#1a0a2e] flex flex-col overflow-y-auto no-scrollbar">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between safe-top border-b border-[#2A2A2A]">
        <button onClick={() => navigate('home')} className="text-2xl active:scale-90 transition-transform">←</button>
        <h1 className="text-lg font-black text-gold-gradient">🎰 Joker's Fortune</h1>
        <span className="text-xs font-mono-game font-bold text-[#FFC93D] bg-[#1A1A1A] px-2 py-1 rounded-lg">{formatCurrency(wallet?.balance || 0)}</span>
      </div>
      <div className="flex-1 flex flex-col items-center px-4 pt-6 pb-8">
        <div className="w-full max-w-sm bg-gradient-to-r from-[#FFC93D] via-[#FFE58F] to-[#FFC93D] rounded-2xl py-3 text-center mb-6 shadow-lg shadow-[#FFC93D]/30 animate-pulse-gold">
          <p className="text-sm font-black text-black uppercase tracking-wider">🏆 Jackpot: {formatCurrency((wallet?.balance || 0) * 10)}</p>
        </div>
        <div className="bg-gradient-to-b from-[#2a1a4e] to-[#1a0a2e] rounded-3xl p-6 border-4 border-[#FFC93D]/50 shadow-2xl w-full max-w-sm">
          <div className="bg-[#0A0A0A] rounded-2xl p-4 border-2 border-[#FFC93D]/30">
            <div className="grid grid-cols-3 gap-3">
              {reels.flat().map((sym, i) => (
                <div key={i} className={`h-20 bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] rounded-xl flex items-center justify-center text-4xl border-2 transition-all duration-300 ${spinning ? 'animate-pulse' : ''} ${winningCells.includes(i) ? 'border-[#FFC93D] shadow-lg shadow-[#FFC93D]/50 scale-110' : 'border-[#2A2A2A]'}`}>
                  {sym}
                </div>
              ))}
            </div>
          </div>
        </div>
        {showResult && (
          <div className={`mt-6 text-center animate-bounce-in ${winAmount > 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
            <p className="text-3xl font-black font-mono-game">{winAmount > 0 ? `+${formatCurrency(winAmount)}` : 'No Win'}</p>
            {winAmount > 0 && <p className="text-sm mt-1">🎉 Congratulations!</p>}
          </div>
        )}
        <div className="mt-6 w-full max-w-sm">
          <div className="flex items-center justify-between bg-[#141414] rounded-2xl p-4 border-2 border-[#2A2A2A]">
            <button onClick={() => setBet(Math.max(10, bet - 50))} disabled={spinning} className="w-12 h-12 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-xl font-bold text-gray-400 active:scale-90 transition-transform disabled:opacity-50">-</button>
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase">Bet</p>
              <p className="text-2xl font-black font-mono-game text-white">{formatCurrency(bet)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setBet(Math.min(state.settings.maxBet, bet * 2))} disabled={spinning} className="w-12 h-12 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-sm font-bold text-[#FFC93D] active:scale-90 transition-transform disabled:opacity-50">×2</button>
              <button onClick={() => setBet(state.settings.maxBet)} disabled={spinning} className="w-12 h-12 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-[10px] font-bold text-[#FFC93D] active:scale-90 transition-transform disabled:opacity-50">MAX</button>
            </div>
          </div>
          <button onClick={spin} disabled={spinning} className={`w-full mt-4 py-5 rounded-2xl font-black text-xl uppercase shadow-xl transition-all ${spinning ? 'bg-gray-700 text-gray-400' : 'btn-green hover:scale-105 active:scale-95'}`}>
            {spinning ? '⏳ Spinning...' : '🎰 SPIN NOW'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ GAME 2: PLANE (Aviator) ============
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

  const generateCrashPoint = () => {
    const r = Math.random();
    if (r < 0.35) return 1 + Math.random();
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
    const w = canvas.width, h = canvas.height;
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, crashed ? '#1a0a0a' : '#0a0a2e');
    gradient.addColorStop(1, '#0A0A0A');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    
    // Stars
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const elapsed = Math.log(Math.max(1, m)) / 0.15;
    const points = Math.min(Math.floor(elapsed * 20), w);
    if (points > 0) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = crashed ? '#EF4444' : '#22C55E';
      ctx.beginPath();
      ctx.strokeStyle = crashed ? '#EF4444' : '#22C55E';
      ctx.lineWidth = 4;
      let lastX = 0, lastY = h;
      for (let i = 0; i <= points; i++) {
        const t = i / 20;
        const x = (i / points) * w;
        const yVal = Math.pow(Math.E, 0.15 * t);
        const y = h - (yVal / Math.max(cp, m)) * h * 0.85;
        if (i === 0) ctx.moveTo(x, Math.max(30, y));
        else ctx.lineTo(x, Math.max(30, y));
        lastX = x; lastY = Math.max(30, y);
      }
      ctx.stroke();
      ctx.lineTo(lastX, h); ctx.lineTo(0, h); ctx.closePath();
      const fillGradient = ctx.createLinearGradient(0, 0, 0, h);
      fillGradient.addColorStop(0, crashed ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)');
      fillGradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = fillGradient;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = '32px serif';
      ctx.textAlign = 'center';
      ctx.fillText('✈️', lastX, lastY - 20);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const cp = generateCrashPoint();
    setCrashPoint(cp); setPhase('waiting'); setCountdown(5);
    setCashedOut(false); setMultiplier(1.0); setBetPlaced(false);
    cashOutMultRef.current = 1;
    let count = 5;
    const countInterval = setInterval(() => {
      if (!mountedRef.current) return;
      count--; setCountdown(count);
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
            setMultiplier(cp); cashOutMultRef.current = cp;
            setPhase('crashed'); drawChart(cp, cp, true);
            playSound('explosion'); return;
          }
          setMultiplier(m); cashOutMultRef.current = m;
          drawChart(m, cp, false);
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, 1000);
    return () => { mountedRef.current = false; clearInterval(countInterval); };
  }, [round, drawChart]);

  useEffect(() => {
    if (phase === 'crashed') {
      const timer = setTimeout(() => { if (mountedRef.current) setRound(r => r + 1); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'crashed' && betPlaced && !cashedOut) {
      const commission = Math.round(bet * state.settings.commissionRate * 100) / 100;
      setState((prev: AppState) => {
        let ns = updateBalance(prev, prev.session!, -(bet + commission));
        ns = addBet(ns, { uid: prev.session!, game: 'Plane', amount: bet, result: 'loss', payout: 0, commission });
        return ns;
      });
      playSound('loss');
    }
  }, [phase]);

  const placeBet = () => {
    if ((wallet?.balance || 0) < bet) { playSound('loss'); return; }
    if (phase !== 'waiting') return;
    playSound('click'); setBetPlaced(true);
  };

  const cashOut = () => {
    if (phase !== 'flying' || cashedOut || !betPlaced) return;
    setCashedOut(true);
    const currentMult = cashOutMultRef.current;
    const win = Math.round(bet * currentMult);
    const commission = Math.round(bet * state.settings.commissionRate * 100) / 100;
    setState((prev: AppState) => {
      let ns = updateBalance(prev, prev.session!, win - bet - commission);
      ns = addBet(ns, { uid: prev.session!, game: 'Plane', amount: bet, result: 'win', payout: win, commission });
      return ns;
    });
    playSound('cashout'); confetti({ particleCount: 80, spread: 80 });
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0A0A0A] to-[#0a0a2e] flex flex-col">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between safe-top border-b border-[#2A2A2A]">
        <button onClick={() => navigate('home')} className="text-2xl active:scale-90">←</button>
        <h1 className="text-lg font-black text-blue-400">✈️ Aviator Plane</h1>
        <span className="text-xs font-mono-game font-bold text-[#FFC93D] bg-[#1A1A1A] px-2 py-1 rounded-lg">{formatCurrency(wallet?.balance || 0)}</span>
      </div>
      <div className="flex-1 flex flex-col px-4 pt-4 pb-8">
        <div className="relative bg-gradient-to-b from-[#1a1a3e] to-[#0A0A0A] rounded-3xl border-2 border-[#2A2A2A] overflow-hidden h-72 shadow-2xl">
          <canvas ref={canvasRef} width={400} height={288} className="w-full h-full" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {phase === 'waiting' && <div className="text-center"><p className="text-6xl font-black font-mono-game text-white">{countdown}s</p><p className="text-sm text-gray-400 mt-2">Next round...</p></div>}
            {phase === 'flying' && <p className={`text-7xl font-black font-mono-game ${cashedOut ? 'text-[#22C55E]' : 'text-white'}`}>{multiplier.toFixed(2)}x</p>}
            {phase === 'crashed' && <div className="text-center animate-shake"><p className="text-5xl font-black font-mono-game text-[#EF4444]">CRASHED!</p><p className="text-3xl font-mono-game text-[#EF4444]/80 mt-2">{crashPoint.toFixed(2)}x</p></div>}
          </div>
        </div>
        {cashedOut && <div className="text-center mt-4 animate-bounce-in"><p className="text-2xl font-bold text-[#22C55E]">✓ Cashed out at {multiplier.toFixed(2)}x</p><p className="text-lg font-mono-game text-[#22C55E]">+{formatCurrency(Math.round(bet * multiplier))}</p></div>}
        <div className="mt-4">
          <div className="flex items-center justify-between bg-[#141414] rounded-2xl p-4 border-2 border-[#2A2A2A]">
            <button onClick={() => setBet(Math.max(10, bet - 50))} disabled={phase !== 'waiting'} className="w-12 h-12 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-xl font-bold text-gray-400 active:scale-90 disabled:opacity-50">-</button>
            <div className="text-center"><p className="text-[10px] text-gray-500 uppercase">Bet</p><p className="text-2xl font-black font-mono-game text-white">{formatCurrency(bet)}</p></div>
            <button onClick={() => setBet(Math.min(state.settings.maxBet, bet * 2))} disabled={phase !== 'waiting'} className="w-12 h-12 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-sm font-bold text-[#FFC93D] active:scale-90 disabled:opacity-50">×2</button>
          </div>
          {phase === 'flying' && betPlaced && !cashedOut ? (
            <button onClick={cashOut} className="btn-red w-full mt-4 py-5 text-xl animate-pulse-gold">💰 CASH OUT {formatCurrency(Math.round(bet * multiplier))}</button>
          ) : phase === 'waiting' && !betPlaced ? (
            <button onClick={placeBet} className="btn-green w-full mt-4 py-5 text-xl hover:scale-105 active:scale-95 transition-transform">🎯 PLACE BET</button>
          ) : (
            <button disabled className="w-full mt-4 py-5 rounded-2xl font-black text-xl uppercase bg-gray-700 text-gray-400">
              {phase === 'flying' ? '⏳ Flying...' : phase === 'crashed' ? '💥 Crashed' : '✓ Bet Placed'}
            </button>
          )}
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
    for (let i = 0; i < gems; i++) mult *= (25 - i) / (25 - mc - i);
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
    setMines(minePositions); setGrid(Array(25).fill(null));
    setPlaying(true); setGameOver(false); setGemsFound(0); setCurrentMult(1);
  };

  const revealTile = (index: number) => {
    if (!playing || grid[index] !== null || gameOver) return;
    if (mines.includes(index)) {
      const newGrid = [...grid];
      mines.forEach(m => newGrid[m] = 'mine');
      setGrid(newGrid); setGameOver(true); setPlaying(false);
      playSound('explosion');
      const commission = Math.round(bet * state.settings.commissionRate * 100) / 100;
      setState((prev: AppState) => {
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
      setCurrentMult(calcMultiplier(newGems, mineCount));
      playSound('tick');
    }
  };

  const cashOut = () => {
    if (!playing || gemsFound === 0) return;
    const win = Math.round(bet * currentMult);
    const commission = Math.round(bet * state.settings.commissionRate * 100) / 100;
    setState((prev: AppState) => {
      let ns = updateBalance(prev, prev.session!, win - bet - commission);
      ns = addBet(ns, { uid: prev.session!, game: 'Mines', amount: bet, result: 'win', payout: win, commission });
      return ns;
    });
    setPlaying(false); playSound('cashout'); confetti({ particleCount: 60, spread: 70 });
    const newGrid = [...grid];
    mines.forEach(m => { if (newGrid[m] === null) newGrid[m] = 'mine'; });
    setGrid(newGrid);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0A0A0A] to-[#0a2e1a] flex flex-col overflow-y-auto no-scrollbar">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between safe-top border-b border-[#2A2A2A]">
        <button onClick={() => navigate('home')} className="text-2xl active:scale-90">←</button>
        <h1 className="text-lg font-black text-emerald-400">💎 Diamond Mines</h1>
        <span className="text-xs font-mono-game font-bold text-[#FFC93D] bg-[#1A1A1A] px-2 py-1 rounded-lg">{formatCurrency(wallet?.balance || 0)}</span>
      </div>
      <div className="flex-1 flex flex-col items-center px-4 pt-4 pb-8">
        {!playing && !gameOver && (
          <div className="w-full max-w-sm space-y-4 mb-4">
            <div className="flex items-center justify-between bg-[#141414] rounded-2xl p-4 border-2 border-[#2A2A2A]">
              <span className="text-sm text-gray-400 font-bold">Mines</span>
              <div className="flex gap-2">
                {[1, 3, 5, 10, 15].map(n => (
                  <button key={n} onClick={() => setMineCount(n)} className={`w-10 h-10 rounded-xl text-sm font-bold ${mineCount === n ? 'bg-[#FFC93D] text-black' : 'bg-[#1A1A1A] text-gray-400'}`}>{n}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between bg-[#141414] rounded-2xl p-4 border-2 border-[#2A2A2A]">
              <button onClick={() => setBet(Math.max(10, bet - 50))} className="w-12 h-12 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-xl font-bold text-gray-400">-</button>
              <div className="text-center"><p className="text-[10px] text-gray-500 uppercase">Bet</p><p className="text-2xl font-black font-mono-game text-white">{formatCurrency(bet)}</p></div>
              <button onClick={() => setBet(Math.min(state.settings.maxBet, bet * 2))} className="w-12 h-12 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-sm font-bold text-[#FFC93D]">×2</button>
            </div>
          </div>
        )}
        {playing && (
          <div className="flex gap-6 mb-4">
            <div className="text-center"><p className="text-2xl font-black font-mono-game text-[#FFC93D]">{currentMult.toFixed(2)}x</p><p className="text-[10px] text-gray-500">Multiplier</p></div>
            <div className="text-center"><p className="text-2xl font-black font-mono-game text-[#3B82F6]">{gemsFound}</p><p className="text-[10px] text-gray-500">Gems</p></div>
            <div className="text-center"><p className="text-2xl font-black font-mono-game text-[#22C55E]">{formatCurrency(Math.round(bet * currentMult))}</p><p className="text-[10px] text-gray-500">Potential</p></div>
          </div>
        )}
        <div className="grid grid-cols-5 gap-2 w-full max-w-sm">
          {grid.map((cell, i) => (
            <button key={i} onClick={() => revealTile(i)} className={`aspect-square rounded-xl flex items-center justify-center text-3xl transition-all ${
              cell === 'gem' ? 'bg-blue-600 border-2 border-blue-400 animate-bounce-in' :
              cell === 'mine' ? 'bg-red-600 border-2 border-red-400 animate-shake' :
              playing ? 'bg-[#141414] border-2 border-[#2A2A2A] active:scale-90 hover:border-emerald-500' :
              'bg-[#141414] border-2 border-[#2A2A2A]'
            }`}>
              {cell === 'gem' ? '💎' : cell === 'mine' ? '💣' : playing ? '' : '·'}
            </button>
          ))}
        </div>
        <div className="mt-6 w-full max-w-sm">
          {!playing ? (
            <button onClick={startGame} className="btn-green w-full py-5 text-xl hover:scale-105 active:scale-95 transition-transform">
              {gameOver ? '🔄 Play Again' : '🎮 Start Game'}
            </button>
          ) : (
            <button onClick={cashOut} disabled={gemsFound === 0} className={`w-full py-5 rounded-2xl font-black text-xl uppercase ${gemsFound === 0 ? 'bg-gray-700 text-gray-400' : 'btn-gold hover:scale-105 active:scale-95 transition-transform'}`}>
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
    setRolling(true); setResult(null); playSound('spin');
    let ticks = 0;
    const interval = setInterval(() => {
      setDice([Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)]);
      ticks++;
      if (ticks > 15) {
        clearInterval(interval);
        const finalDice = [Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)];
        setDice(finalDice);
        const sum = finalDice[0] + finalDice[1];
        let won = (choice === 'higher' && sum > 7) || (choice === 'lower' && sum < 7);
        const commission = Math.round(bet * state.settings.commissionRate * 100) / 100;
        if (won) {
          const win = bet * 2;
          setWinAmount(win); setResult('win');
          setState((prev: AppState) => {
            let ns = updateBalance(prev, prev.session!, win - bet - commission);
            ns = addBet(ns, { uid: prev.session!, game: 'Dice', amount: bet, result: 'win', payout: win, commission });
            return ns;
          });
          playSound('win'); confetti({ particleCount: 50, spread: 60 });
        } else {
          setWinAmount(0); setResult('loss');
          setState((prev: AppState) => {
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
    <div className="fixed inset-0 bg-gradient-to-b from-[#0A0A0A] to-[#2e1a0a] flex flex-col">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between safe-top border-b border-[#2A2A2A]">
        <button onClick={() => navigate('home')} className="text-2xl active:scale-90">←</button>
        <h1 className="text-lg font-black text-amber-400">🎲 Lucky Dice</h1>
        <span className="text-xs font-mono-game font-bold text-[#FFC93D] bg-[#1A1A1A] px-2 py-1 rounded-lg">{formatCurrency(wallet?.balance || 0)}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <div className="flex gap-8 mb-8">
          {dice.map((d, i) => (
            <div key={i} className={`w-28 h-28 bg-[#141414] border-4 border-[#3A3A3A] rounded-3xl flex items-center justify-center text-6xl shadow-2xl ${rolling ? 'animate-shake' : ''}`}>
              {diceFaces[d - 1]}
            </div>
          ))}
        </div>
        <div className="text-center mb-8">
          <p className="text-4xl font-black font-mono-game text-white">{dice[0] + dice[1]}</p>
          <p className="text-sm text-gray-400 mt-2">Sum (&gt;7 or &lt;7 wins 2x)</p>
        </div>
        {result && <div className={`text-center mb-6 animate-bounce-in ${result === 'win' ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}><p className="text-2xl font-black">{result === 'win' ? `+${formatCurrency(winAmount)}` : 'House Wins!'}</p></div>}
        <div className="flex gap-4 mb-8 w-full max-w-sm">
          <button onClick={() => setChoice('higher')} className={`flex-1 py-5 rounded-2xl font-bold uppercase transition-all ${choice === 'higher' ? 'bg-green-500 text-white shadow-xl scale-105' : 'bg-[#141414] border-2 border-[#2A2A2A] text-gray-400'}`}>⬆️ Higher</button>
          <button onClick={() => setChoice('lower')} className={`flex-1 py-5 rounded-2xl font-bold uppercase transition-all ${choice === 'lower' ? 'bg-red-500 text-white shadow-xl scale-105' : 'bg-[#141414] border-2 border-[#2A2A2A] text-gray-400'}`}>⬇️ Lower</button>
        </div>
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-between bg-[#141414] rounded-2xl p-4 border-2 border-[#2A2A2A]">
            <button onClick={() => setBet(Math.max(10, bet - 50))} disabled={rolling} className="w-12 h-12 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-xl font-bold text-gray-400 disabled:opacity-50">-</button>
            <div className="text-center"><p className="text-[10px] text-gray-500 uppercase">Bet</p><p className="text-2xl font-black font-mono-game text-white">{formatCurrency(bet)}</p></div>
            <button onClick={() => setBet(Math.min(state.settings.maxBet, bet * 2))} disabled={rolling} className="w-12 h-12 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-sm font-bold text-[#FFC93D] disabled:opacity-50">×2</button>
          </div>
          <button onClick={roll} disabled={rolling || !choice} className={`w-full mt-4 py-5 rounded-2xl font-black text-xl uppercase ${rolling || !choice ? 'bg-gray-700 text-gray-400' : 'btn-gold hover:scale-105 active:scale-95 transition-transform'}`}>
            {rolling ? '🎲 Rolling...' : '🎲 ROLL DICE'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ GAME 5: WHEEL ============
export function WheelGame({ state, setState, navigate }: { state: AppState; setState: SetState; navigate: (s: string) => void }) {
  const wallet = getCurrentWallet(state);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spinCost = 50;
  const segments = [
    { value: 10, color: '#3B82F6' }, { value: 20, color: '#8B3FE8' }, { value: 50, color: '#22C55E' },
    { value: 100, color: '#F59E0B' }, { value: 500, color: '#EC4899' }, { value: 50, color: '#22C55E' },
    { value: 5000, color: '#FFC93D' }, { value: 100, color: '#F59E0B' }, { value: 50, color: '#22C55E' },
    { value: 10, color: '#3B82F6' }, { value: 20, color: '#8B3FE8' }, { value: 100, color: '#F59E0B' },
  ];
  const weights = [25, 20, 20, 15, 10, 0, 3, 0, 0, 0, 0, 0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = canvas.width, center = size / 2, radius = center - 10, segAngle = (2 * Math.PI) / 12;
    ctx.clearRect(0, 0, size, size);
    for (let i = 0; i < 12; i++) {
      const startAngle = i * segAngle - Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, startAngle + segAngle);
      ctx.closePath(); ctx.fillStyle = segments[i].color; ctx.fill();
      ctx.strokeStyle = '#0A0A0A'; ctx.lineWidth = 3; ctx.stroke();
      ctx.save(); ctx.translate(center, center); ctx.rotate(startAngle + segAngle / 2);
      ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Inter';
      ctx.fillText(`₹${segments[i].value}`, radius * 0.65, 6); ctx.restore();
    }
    ctx.beginPath(); ctx.arc(center, center, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#141414'; ctx.fill(); ctx.strokeStyle = '#FFC93D'; ctx.lineWidth = 4; ctx.stroke();
  }, []);

  const spinWheel = () => {
    if (spinning) return;
    if ((wallet?.balance || 0) < spinCost) { playSound('loss'); return; }
    setSpinning(true); setResult(null); playSound('spin');
    const commission = Math.round(spinCost * state.settings.commissionRate * 100) / 100;
    const totalWeight = weights.reduce((s, w) => s + w, 0);
    let r = Math.random() * totalWeight, winIndex = 0;
    for (let i = 0; i < segments.length; i++) { r -= weights[i]; if (r <= 0) { winIndex = i; break; } }
    const segAngle = 360 / 12;
    setRotation(prev => prev + 360 * 10 + (360 - (winIndex * segAngle + segAngle / 2)));
    setTimeout(() => {
      const prize = segments[winIndex].value;
      setResult(prize);
      setState((prev: AppState) => {
        let ns = updateBalance(prev, prev.session!, prize - spinCost - commission);
        ns = addBet(ns, { uid: prev.session!, game: 'Wheel', amount: spinCost, result: prize > spinCost ? 'win' : 'loss', payout: prize, commission });
        return ns;
      });
      if (prize >= 500) { playSound('fanfare'); confetti({ particleCount: 120, spread: 90 }); }
      else { playSound('win'); confetti({ particleCount: 40, spread: 50 }); }
      setSpinning(false);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0A0A0A] to-[#2e0a2e] flex flex-col">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between safe-top border-b border-[#2A2A2A]">
        <button onClick={() => navigate('home')} className="text-2xl active:scale-90">←</button>
        <h1 className="text-lg font-black text-pink-400">🎡 Lucky Wheel</h1>
        <span className="text-xs font-mono-game font-bold text-[#FFC93D] bg-[#1A1A1A] px-2 py-1 rounded-lg">{formatCurrency(wallet?.balance || 0)}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <div className="relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 text-3xl text-[#FFC93D]">▼</div>
          <canvas ref={canvasRef} width={320} height={320} className="w-80 h-80 rounded-full border-4 border-[#FFC93D]/50 shadow-2xl" style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 4.5s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none' }} />
        </div>
        {result !== null && <div className="mt-6 text-center animate-bounce-in"><p className="text-3xl font-black text-[#FFC93D]">+{formatCurrency(result)}</p><p className="text-sm text-gray-400 mt-1">You won!</p></div>}
        <button onClick={spinWheel} disabled={spinning} className={`mt-8 w-72 py-5 rounded-2xl font-black text-xl uppercase shadow-xl ${spinning ? 'bg-gray-700 text-gray-400' : 'btn-gold hover:scale-105 active:scale-95 transition-transform'}`}>
          {spinning ? '🎡 Spinning...' : `🎡 SPIN (₹${spinCost})`}
        </button>
      </div>
    </div>
  );
}
