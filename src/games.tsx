import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  type AppState, getCurrentWallet, updateBalance, addTransaction, addBet,
  playSound, formatCurrency
} from './store';

// ============ GAME 1: SLOTS ============
export function SlotsGame({ state, setState, navigate }: { state: AppState; setState: (s: AppState) => void; navigate: (s: string) => void }) {
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

    // Deduct bet + commission
    const commission = Math.round(bet * state.settings.commissionRate * 100) / 100;
    let newState = updateBalance(state, state.session!, -(bet + commission));

    // Generate result
    const result = [
      [weightedRandom(), weightedRandom(), weightedRandom()],
      [weightedRandom(), weightedRandom(), weightedRandom()],
      [weightedRandom(), weightedRandom(), weightedRandom()],
    ];

    // Animate reels
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
        // Check wins (middle row)
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
    <div className="fixed inset-0 bg-bg-root flex flex-col overflow-y-auto no-scrollbar">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between safe-top">
        <button onClick={() => navigate('home')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">🎰 Joker's Fortune</h1>
        <span className="text-xs font-mono font-bold text-gold">{formatCurrency(wallet?.balance || 0)}</span>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 pt-4">
        {/* Jackpot Bar */}
        <div className="w-full bg-jackpot rounded-xl py-2 text-center mb-4">
          <p className="text-xs font-black text-black uppercase">🏆 Jackpot: ₹{((wallet?.balance || 0) * 10).toLocaleString()}</p>
        </div>

        {/* Reels */}
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-4 border-2 border-gold/30 w-full max-w-xs">
          <div className="grid grid-cols-3 gap-2">
            {reels.map((reel, ri) => (
              <div key={ri} className="space-y-2">
                {reel.map((sym, si) => (
                  <div key={si} className={`h-16 bg-bg-root rounded-xl flex items-center justify-center text-3xl border border-border-subtle ${
                    spinning ? 'animate-pulse' : ''
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
          <div className={`mt-4 text-center animate-bounce-in ${winAmount > 0 ? 'text-success' : 'text-danger'}`}>
            <p className="text-2xl font-black font-mono">
              {winAmount > 0 ? `+${formatCurrency(winAmount)}` : 'No Win'}
            </p>
          </div>
        )}

        {/* Bet Control */}
        <div className="mt-6 w-full max-w-xs">
          <div className="flex items-center justify-between bg-bg-surface rounded-xl p-3 border border-border-subtle">
            <button onClick={() => setBet(Math.max(10, bet - 50))} className="w-10 h-10 rounded-lg bg-bg-input flex items-center justify-center text-lg font-bold text-gray-400 active:scale-95">-</button>
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase">Bet</p>
              <p className="text-xl font-black font-mono text-white">{formatCurrency(bet)}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setBet(Math.min(state.settings.maxBet, bet * 2))} className="w-10 h-10 rounded-lg bg-bg-input flex items-center justify-center text-xs font-bold text-gold active:scale-95">×2</button>
              <button onClick={() => setBet(state.settings.maxBet)} className="w-10 h-10 rounded-lg bg-bg-input flex items-center justify-center text-[10px] font-bold text-gold active:scale-95">MAX</button>
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
              <div key={sym} className="flex items-center justify-between py-1 px-2 bg-bg-input rounded-lg">
                <span className="text-sm">{sym}{sym}{sym}</span>
                <span className="text-[10px] font-bold text-gold">{mult}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ GAME 2: CRASH ============
export function CrashGame({ state, setState, navigate }: { state: AppState; setState: (s: AppState) => void; navigate: (s: string) => void }) {
  const wallet = getCurrentWallet(state);
  const [bet, setBet] = useState(100);
  const [multiplier, setMultiplier] = useState(1.0);
  const [phase, setPhase] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const [crashPoint, setCrashPoint] = useState(0);
  const [cashedOut, setCashedOut] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef(0);

  const generateCrashPoint = () => {
    const r = Math.random();
    if (r < 0.35) return 1 + Math.random() * 1; // 35% < 2x
    if (r < 0.55) return 2 + Math.random() * 3; // 20% 2-5x
    if (r < 0.80) return 5 + Math.random() * 5; // 25% 5-10x
    if (r < 0.95) return 10 + Math.random() * 10; // 15% 10-20x
    return 20 + Math.random() * 30; // 5% > 20x
  };

  const startRound = useCallback(() => {
    setPhase('waiting');
    setCountdown(5);
    setCashedOut(false);
    setMultiplier(1.0);
    const cp = generateCrashPoint();
    setCrashPoint(cp);

    let count = 5;
    const countInterval = setInterval(() => {
      count--;
      setCountdown(count);
      playSound('tick');
      if (count <= 0) {
        clearInterval(countInterval);
        setPhase('flying');
        startTimeRef.current = Date.now();
        animate(cp);
      }
    }, 1000);
  }, []);

  const animate = (cp: number) => {
    const tick = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const m = Math.pow(Math.E, 0.15 * elapsed);
      
      if (m >= cp) {
        setMultiplier(cp);
        setPhase('crashed');
        playSound('explosion');
        setTimeout(startRound, 3000);
        return;
      }
      
      setMultiplier(m);
      
      // Draw canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          ctx.clearRect(0, 0, w, h);
          
          // Grid
          ctx.strokeStyle = '#2A2A2A';
          ctx.lineWidth = 0.5;
          for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(0, h - (h / 5) * i);
            ctx.lineTo(w, h - (h / 5) * i);
            ctx.stroke();
          }
          
          // Curve
          ctx.beginPath();
          ctx.strokeStyle = phase === 'crashed' ? '#EF4444' : '#22C55E';
          ctx.lineWidth = 3;
          const points = Math.min(elapsed * 30, 200);
          for (let i = 0; i <= points; i++) {
            const t = i / 30;
            const x = (i / points) * w;
            const y = h - (Math.pow(Math.E, 0.15 * t) / cp) * h;
            if (i === 0) ctx.moveTo(x, Math.max(0, y));
            else ctx.lineTo(x, Math.max(0, y));
          }
          ctx.stroke();
          
          // Rocket at tip
          const tipX = w;
          const tipY = h - (m / cp) * h;
          ctx.font = '24px serif';
          ctx.fillText('🚀', tipX - 30, Math.max(24, tipY + 8));
        }
      }
      
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    startRound();
    return () => { cancelAnimationFrame(animRef.current); };
  }, []);

  const placeBet = () => {
    if ((wallet?.balance || 0) < bet) { playSound('loss'); return; }
    if (phase !== 'waiting') return;
    playSound('click');
  };

  const cashOut = () => {
    if (phase !== 'flying' || cashedOut) return;
    setCashedOut(true);
    const win = Math.round(bet * multiplier);
    const commission = Math.round(bet * state.settings.commissionRate * 100) / 100;
    let newState = updateBalance(state, state.session!, win - bet - commission);
    newState = addBet(newState, { uid: state.session!, game: 'Crash', amount: bet, result: 'win', payout: win, commission });
    setState(newState);
    playSound('cashout');
    confetti({ particleCount: 50, spread: 60 });
  };

  return (
    <div className="fixed inset-0 bg-bg-root flex flex-col">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between safe-top">
        <button onClick={() => navigate('home')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">🚀 Crash</h1>
        <span className="text-xs font-mono font-bold text-gold">{formatCurrency(wallet?.balance || 0)}</span>
      </div>

      <div className="flex-1 flex flex-col px-4 pt-3">
        {/* Chart */}
        <div className="relative bg-bg-surface rounded-2xl border border-border-subtle overflow-hidden h-56">
          <canvas ref={canvasRef} width={360} height={224} className="w-full h-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            {phase === 'waiting' && (
              <div className="text-center">
                <p className="text-4xl font-black font-mono text-white">{countdown}s</p>
                <p className="text-xs text-gray-400 mt-1">Next round starting...</p>
              </div>
            )}
            {phase === 'flying' && (
              <p className={`text-5xl font-black font-mono ${cashedOut ? 'text-success' : 'text-white'}`}>
                {multiplier.toFixed(2)}x
              </p>
            )}
            {phase === 'crashed' && (
              <div className="text-center animate-shake">
                <p className="text-4xl font-black font-mono text-danger">CRASHED</p>
                <p className="text-2xl font-mono text-danger/60 mt-1">{crashPoint.toFixed(2)}x</p>
              </div>
            )}
          </div>
        </div>

        {/* Cashout info */}
        {cashedOut && (
          <div className="text-center mt-2 animate-bounce-in">
            <p className="text-lg font-bold text-success">Cashed out at {multiplier.toFixed(2)}x</p>
            <p className="text-sm font-mono text-success">+{formatCurrency(Math.round(bet * multiplier))}</p>
          </div>
        )}

        {/* Bet Control */}
        <div className="mt-4">
          <div className="flex items-center justify-between bg-bg-surface rounded-xl p-3 border border-border-subtle">
            <button onClick={() => setBet(Math.max(10, bet - 50))} className="w-10 h-10 rounded-lg bg-bg-input flex items-center justify-center text-lg font-bold text-gray-400">-</button>
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase">Bet</p>
              <p className="text-xl font-black font-mono text-white">{formatCurrency(bet)}</p>
            </div>
            <button onClick={() => setBet(Math.min(state.settings.maxBet, bet * 2))} className="w-10 h-10 rounded-lg bg-bg-input flex items-center justify-center text-xs font-bold text-gold">×2</button>
          </div>
          
          {phase === 'flying' && !cashedOut ? (
            <button onClick={cashOut} className="btn-red w-full mt-3 py-4 text-lg">
              💰 CASH OUT {formatCurrency(Math.round(bet * multiplier))}
            </button>
          ) : (
            <button onClick={placeBet} className="btn-green w-full mt-3 py-4 text-lg">
              {phase === 'waiting' ? '🎯 PLACE BET' : '⏳ Wait...'}
            </button>
          )}
        </div>

        {/* Auto cashout pills */}
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          {[1.5, 2, 3, 5, 10].map(m => (
            <button key={m} className="px-3 py-1.5 bg-bg-input border border-border-subtle rounded-full text-[10px] font-bold text-gray-400 whitespace-nowrap">
              {m}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ GAME 3: MINES ============
export function MinesGame({ state, setState, navigate }: { state: AppState; setState: (s: AppState) => void; navigate: (s: string) => void }) {
  const wallet = getCurrentWallet(state);
  const [bet, setBet] = useState(100);
  const [mineCount, setMineCount] = useState(3);
  const [grid, setGrid] = useState<(null | 'gem' | 'mine')[]>(Array(25).fill(null));
  const [mines, setMines] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const [gemsFound, setGemsFound] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentMult, setCurrentMult] = useState(1);

  const calcMultiplier = (gems: number, mines: number) => {
    let mult = 0.97;
    for (let i = 0; i < gems; i++) {
      mult *= (25 - i) / (25 - mines - i);
    }
    return Math.round(mult * 100) / 100;
  };

  const startGame = () => {
    if ((wallet?.balance || 0) < bet) { playSound('loss'); return; }
    playSound('click');
    
    // Place mines
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
      // Hit mine
      const newGrid = [...grid];
      mines.forEach(m => newGrid[m] = 'mine');
      setGrid(newGrid);
      setGameOver(true);
      setPlaying(false);
      playSound('explosion');
      
      const commission = Math.round(bet * state.settings.commissionRate * 100) / 100;
      let newState = updateBalance(state, state.session!, -(bet + commission));
      newState = addBet(newState, { uid: state.session!, game: 'Mines', amount: bet, result: 'loss', payout: 0, commission });
      setState(newState);
    } else {
      // Found gem
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
    let newState = updateBalance(state, state.session!, win - bet - commission);
    newState = addBet(newState, { uid: state.session!, game: 'Mines', amount: bet, result: 'win', payout: win, commission });
    setState(newState);
    setPlaying(false);
    playSound('cashout');
    confetti({ particleCount: 40, spread: 50 });
    
    // Reveal all
    const newGrid = [...grid];
    mines.forEach(m => { if (newGrid[m] === null) newGrid[m] = 'mine'; });
    setGrid(newGrid);
  };

  return (
    <div className="fixed inset-0 bg-bg-root flex flex-col overflow-y-auto no-scrollbar">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between safe-top">
        <button onClick={() => navigate('home')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">💎 Mines</h1>
        <span className="text-xs font-mono font-bold text-gold">{formatCurrency(wallet?.balance || 0)}</span>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 pt-3">
        {/* Config */}
        {!playing && !gameOver && (
          <div className="w-full max-w-xs space-y-3 mb-4">
            <div className="flex items-center justify-between bg-bg-surface rounded-xl p-3 border border-border-subtle">
              <span className="text-xs text-gray-400">Mines</span>
              <div className="flex gap-2">
                {[1, 3, 5, 10, 15].map(n => (
                  <button key={n} onClick={() => setMineCount(n)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold ${mineCount === n ? 'bg-gold text-black' : 'bg-bg-input text-gray-400'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between bg-bg-surface rounded-xl p-3 border border-border-subtle">
              <button onClick={() => setBet(Math.max(10, bet - 50))} className="w-8 h-8 rounded-lg bg-bg-input flex items-center justify-center text-sm font-bold text-gray-400">-</button>
              <div className="text-center">
                <p className="text-[10px] text-gray-500 uppercase">Bet</p>
                <p className="text-lg font-black font-mono text-white">{formatCurrency(bet)}</p>
              </div>
              <button onClick={() => setBet(Math.min(state.settings.maxBet, bet * 2))} className="w-8 h-8 rounded-lg bg-bg-input flex items-center justify-center text-xs font-bold text-gold">×2</button>
            </div>
          </div>
        )}

        {/* Stats */}
        {playing && (
          <div className="flex gap-4 mb-3">
            <div className="text-center">
              <p className="text-lg font-black font-mono text-gold">{currentMult.toFixed(2)}x</p>
              <p className="text-[10px] text-gray-500">Multiplier</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black font-mono text-blue">{gemsFound}</p>
              <p className="text-[10px] text-gray-500">Gems</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black font-mono text-success">{formatCurrency(Math.round(bet * currentMult))}</p>
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
                playing ? 'bg-bg-surface border border-border-subtle active:scale-90 hover:border-purple-500' :
                'bg-bg-surface border border-border-subtle'
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
export function DiceGame({ state, setState, navigate }: { state: AppState; setState: (s: AppState) => void; navigate: (s: string) => void }) {
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

    // Animate dice
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
        // 7 = house wins

        const commission = Math.round(bet * state.settings.commissionRate * 100) / 100;
        if (won) {
          const win = bet * 2;
          setWinAmount(win);
          setResult('win');
          let newState = updateBalance(state, state.session!, win - bet - commission);
          newState = addBet(newState, { uid: state.session!, game: 'Dice', amount: bet, result: 'win', payout: win, commission });
          setState(newState);
          playSound('win');
          confetti({ particleCount: 30, spread: 50 });
        } else {
          setWinAmount(0);
          setResult('loss');
          let newState = updateBalance(state, state.session!, -(bet + commission));
          newState = addBet(newState, { uid: state.session!, game: 'Dice', amount: bet, result: 'loss', payout: 0, commission });
          setState(newState);
          playSound('loss');
        }
        setRolling(false);
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-bg-root flex flex-col">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between safe-top">
        <button onClick={() => navigate('home')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">🎲 Lucky Dice</h1>
        <span className="text-xs font-mono font-bold text-gold">{formatCurrency(wallet?.balance || 0)}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Dice Display */}
        <div className="flex gap-6 mb-6">
          {dice.map((d, i) => (
            <div key={i} className={`w-24 h-24 bg-bg-surface border-2 border-border-strong rounded-2xl flex items-center justify-center text-5xl ${
              rolling ? 'animate-shake' : ''
            }`}>
              {diceFaces[d - 1]}
            </div>
          ))}
        </div>

        {/* Sum */}
        <div className="text-center mb-6">
          <p className="text-3xl font-black font-mono text-white">{dice[0] + dice[1]}</p>
          <p className="text-xs text-gray-500">Sum (Higher than 7 or Lower than 7 wins 2x)</p>
        </div>

        {/* Result */}
        {result && (
          <div className={`text-center mb-4 animate-bounce-in ${result === 'win' ? 'text-success' : 'text-danger'}`}>
            <p className="text-xl font-black">
              {result === 'win' ? `+${formatCurrency(winAmount)}` : 'House Wins!'}
            </p>
          </div>
        )}

        {/* Choice */}
        <div className="flex gap-3 mb-6 w-full max-w-xs">
          <button onClick={() => setChoice('higher')}
            className={`flex-1 py-4 rounded-xl font-bold text-sm uppercase transition-all ${
              choice === 'higher' ? 'bg-gradient-to-b from-green-400 to-green-600 text-white shadow-lg shadow-green-500/30' : 'bg-bg-surface border border-border-subtle text-gray-400'
            }`}>
            ⬆️ Higher {'>'}7
          </button>
          <button onClick={() => setChoice('lower')}
            className={`flex-1 py-4 rounded-xl font-bold text-sm uppercase transition-all ${
              choice === 'lower' ? 'bg-gradient-to-b from-red-400 to-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-bg-surface border border-border-subtle text-gray-400'
            }`}>
            ⬇️ Lower {'<'}7
          </button>
        </div>

        {/* Bet Control */}
        <div className="w-full max-w-xs">
          <div className="flex items-center justify-between bg-bg-surface rounded-xl p-3 border border-border-subtle">
            <button onClick={() => setBet(Math.max(10, bet - 50))} className="w-10 h-10 rounded-lg bg-bg-input flex items-center justify-center text-lg font-bold text-gray-400">-</button>
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase">Bet</p>
              <p className="text-xl font-black font-mono text-white">{formatCurrency(bet)}</p>
            </div>
            <button onClick={() => setBet(Math.min(state.settings.maxBet, bet * 2))} className="w-10 h-10 rounded-lg bg-bg-input flex items-center justify-center text-xs font-bold text-gold">×2</button>
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
export function WheelGame({ state, setState, navigate }: { state: AppState; setState: (s: AppState) => void; navigate: (s: string) => void }) {
  const wallet = getCurrentWallet(state);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spinCost = 50;

  const segments = [
    { value: 10, color: '#3B82F6', weight: 25 },
    { value: 20, color: '#8B3FE8', weight: 20 },
    { value: 50, color: '#22C55E', weight: 20 },
    { value: 100, color: '#F59E0B', weight: 15 },
    { value: 500, color: '#EC4899', weight: 10 },
    { value: 50, color: '#22C55E', weight: 0 },
    { value: 5000, color: '#FFC93D', weight: 3 },
    { value: 100, color: '#F59E0B', weight: 0 },
    { value: 50, color: '#22C55E', weight: 0 },
    { value: 10, color: '#3B82F6', weight: 0 },
    { value: 20, color: '#8B3FE8', weight: 0 },
    { value: 100, color: '#F59E0B', weight: 0 },
  ];

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
    
    // Draw segments
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
      
      // Text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + segAngle / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Inter';
      ctx.fillText(`₹${segments[i].value}`, radius * 0.65, 5);
      ctx.restore();
    }
    
    // Center circle
    ctx.beginPath();
    ctx.arc(center, center, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#141414';
    ctx.fill();
    ctx.strokeStyle = '#FFC93D';
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [rotation]);

  const spinWheel = () => {
    if (spinning) return;
    if ((wallet?.balance || 0) < spinCost) { playSound('loss'); return; }
    
    setSpinning(true);
    setResult(null);
    playSound('spin');

    // Deduct cost
    const commission = Math.round(spinCost * state.settings.commissionRate * 100) / 100;
    let newState = updateBalance(state, state.session!, -(spinCost + commission));

    // Weighted random selection
    const totalWeight = segments.reduce((s, seg) => s + seg.weight, 0);
    let r = Math.random() * totalWeight;
    let winIndex = 0;
    for (let i = 0; i < segments.length; i++) {
      r -= segments[i].weight;
      if (r <= 0) { winIndex = i; break; }
    }

    // Calculate target rotation
    const segAngle = 360 / 12;
    const targetAngle = 360 - (winIndex * segAngle + segAngle / 2);
    const totalRotation = 360 * 8 + targetAngle; // 8 full spins + target
    
    setRotation(prev => prev + totalRotation);

    setTimeout(() => {
      const prize = segments[winIndex].value;
      setResult(prize);
      newState = updateBalance(newState, state.session!, prize);
      newState = addBet(newState, {
        uid: state.session!,
        game: 'Wheel',
        amount: spinCost,
        result: prize > spinCost ? 'win' : 'loss',
        payout: prize,
        commission,
      });
      setState(newState);
      
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
    <div className="fixed inset-0 bg-bg-root flex flex-col">
      <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between safe-top">
        <button onClick={() => navigate('home')} className="text-xl">←</button>
        <h1 className="text-lg font-bold">🎡 Lucky Wheel</h1>
        <span className="text-xs font-mono font-bold text-gold">{formatCurrency(wallet?.balance || 0)}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Pointer */}
        <div className="relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 text-2xl">▼</div>
          
          {/* Wheel */}
          <div className="relative w-72 h-72">
            <canvas
              ref={canvasRef}
              width={288}
              height={288}
              className="w-full h-full rounded-full border-4 border-gold/30"
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
            <p className="text-2xl font-black text-gold">+{formatCurrency(result)}</p>
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
              <div key={v} className="text-center py-1 bg-bg-input rounded text-[10px] font-bold text-gray-300">
                ₹{v}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
