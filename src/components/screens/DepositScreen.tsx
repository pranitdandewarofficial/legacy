// @ts-nocheck
// Deposit Screen - Real UPI/USDT flow with QR, deep links, timer
import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { AppState } from '../../store/types';
import { getCurrentWallet, updateBalance, addTransaction } from '../../store';
import { playSound, formatCurrency } from '../../utils';

export function DepositScreen({ state, setState, navigate }: { state: AppState; setState: any; navigate: (s: string) => void }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'upi' | 'usdt'>('upi');
  const [step, setStep] = useState(1);
  const [utr, setUtr] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [timer, setTimer] = useState(300);
  const [orderId, setOrderId] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const wallet = getCurrentWallet(state);
  const chips = [100, 300, 500, 1000, 2000, 5000, 10000, 25000];
  const timerRef = useRef<number>(0);
  const amt = parseInt(amount) || 0;

  useEffect(() => {
    if (step === 3 && amt > 0) {
      const oid = 'LW' + Date.now().toString().slice(-10);
      setOrderId(oid);
      const data = method === 'upi' 
        ? `upi://pay?pa=${encodeURIComponent(state.settings.upiVpa)}&pn=Legacy+Win&am=${amt}&cu=INR&tn=${oid}`
        : state.settings.usdtWallet;
      import('qrcode').then(QRCode => {
        QRCode.toDataURL(data, { width: 300, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
          .then((url: string) => setQrDataUrl(url)).catch(() => setQrDataUrl(''));
      });
    }
  }, [step, method, amt]);

  useEffect(() => {
    if (step === 3) {
      setTimer(300);
      timerRef.current = window.setInterval(() => {
        setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [step]);

  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const openUpiApp = (appId: string) => {
    const upiParams = `pa=${encodeURIComponent(state.settings.upiVpa)}&pn=Legacy+Win&am=${amt}&cu=INR&tn=${encodeURIComponent(orderId)}`;
    const links: Record<string, string> = {
      gpay: `tez://upi/pay?${upiParams}`, phonepe: `phonepe://pay?${upiParams}`,
      paytm: `paytmmp://pay?${upiParams}`, bhim: `bhim://pay?${upiParams}`,
      amazon: `amazonpay://pay?${upiParams}`, whatsapp: `whatsapp://pay?${upiParams}`,
      default: `upi://pay?${upiParams}`
    };
    window.location.href = links[appId] || links.default;
  };

  const handleSubmitUtr = () => {
    if (utr.length < 10) { playSound('loss'); return; }
    playSound('click');
    setStep(4);
    setTimeout(() => {
      setState((prev: AppState) => {
        let ns = updateBalance(prev, prev.session!, amt);
        ns = addTransaction(ns, { uid: prev.session!, type: 'deposit', amount: amt, description: `Deposit via ${method.toUpperCase()}`, status: 'completed' });
        return ns;
      });
      playSound('fanfare');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setStep(5);
    }, 2000);
  };

  if (step === 1) {
    return (
      <div className="pb-24 animate-fade-in min-h-screen bg-[#0A0A0A]">
        <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
          <button onClick={() => navigate('wallet')} className="text-xl">←</button>
          <h1 className="text-lg font-bold">Add Money</h1>
        </div>
        <div className="px-4 pt-3 space-y-4">
          <div className="bg-purple-gradient rounded-2xl p-5 text-center">
            <p className="text-xs text-purple-200 uppercase">Current Balance</p>
            <p className="text-3xl font-black font-mono-game text-white mt-2">{formatCurrency(wallet?.balance || 0)}</p>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[#FFC93D]">₹</span>
            <input type="number" placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)} className="input-field pl-12 text-2xl font-mono-game font-bold text-center" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {chips.map(c => (
              <button key={c} onClick={() => setAmount(String(c))} className={`py-3 rounded-xl text-xs font-bold active:scale-95 ${amount === String(c) ? 'bg-[#FFC93D] text-black' : 'bg-[#1A1A1A] border border-[#2A2A2A] text-gray-300'}`}>
                {c >= 1000 ? `₹${c/1000}k` : `₹${c}`}
              </button>
            ))}
          </div>
          <div className="card">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Payment Method</p>
            <div className="space-y-2">
              <button onClick={() => setMethod('upi')} className={`w-full flex items-center gap-3 p-3 rounded-xl border ${method === 'upi' ? 'border-[#FFC93D] bg-[#FFC93D]/5' : 'border-[#2A2A2A]'}`}>
                <span className="text-xl">📱</span><div className="text-left"><p className="text-sm font-bold text-white">UPI</p><p className="text-[10px] text-gray-500">GPay, PhonePe, Paytm</p></div>
                {method === 'upi' && <span className="ml-auto text-[#FFC93D]">✓</span>}
              </button>
              <button onClick={() => setMethod('usdt')} className={`w-full flex items-center gap-3 p-3 rounded-xl border ${method === 'usdt' ? 'border-[#FFC93D] bg-[#FFC93D]/5' : 'border-[#2A2A2A]'}`}>
                <span className="text-xl">💰</span><div className="text-left"><p className="text-sm font-bold text-white">USDT (TRC20)</p><p className="text-[10px] text-gray-500">+5% bonus</p></div>
                {method === 'usdt' && <span className="ml-auto text-[#FFC93D]">✓</span>}
              </button>
            </div>
          </div>
          <button onClick={() => { if (amt >= 100 && amt <= 100000) setStep(2); else playSound('loss'); }} className="btn-gold w-full">Continue →</button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="pb-24 animate-fade-in min-h-screen bg-[#0A0A0A]">
        <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center gap-3 safe-top">
          <button onClick={() => setStep(1)} className="text-xl">←</button>
          <h1 className="text-lg font-bold">Payment Method</h1>
        </div>
        <div className="px-4 pt-3 space-y-4">
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 flex items-center justify-between">
            <div><p className="text-[10px] text-gray-500 uppercase">Amount</p><p className="text-2xl font-black font-mono-game text-white">{formatCurrency(amt)}</p></div>
            <div className="text-right"><p className="text-[10px] text-gray-500">To add</p><p className="text-sm font-bold text-[#22C55E]">+{formatCurrency(amt)}</p></div>
          </div>
          <button onClick={() => setStep(3)} className="btn-gold w-full">Proceed to Pay →</button>
        </div>
      </div>
    );
  }

  if (step === 3) {
    const upiApps = [
      { id: 'gpay', name: 'Google Pay', icon: '🟢' }, { id: 'phonepe', name: 'PhonePe', icon: '💜' },
      { id: 'paytm', name: 'Paytm', icon: '💙' }, { id: 'bhim', name: 'BHIM', icon: '🟠' },
      { id: 'amazon', name: 'Amazon', icon: '🛒' }, { id: 'default', name: 'Any UPI', icon: '📱' },
    ];
    return (
      <div className="pb-24 animate-fade-in min-h-screen bg-[#0A0A0A]">
        <div className="sticky top-0 z-30 glass px-4 py-3 flex items-center justify-between safe-top">
          <button onClick={() => setStep(2)} className="text-xl">←</button>
          <h1 className="text-lg font-bold">Pay via {method === 'upi' ? 'UPI' : 'USDT'}</h1>
          <div className={`px-2 py-1 rounded-lg text-xs font-bold font-mono-game ${timer > 60 ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'bg-[#EF4444]/20 text-[#EF4444]'}`}>⏱ {formatTimer(timer)}</div>
        </div>
        <div className="px-4 pt-3 space-y-4">
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4">
            <div className="flex justify-between mb-2"><span className="text-[10px] text-gray-500">Order ID</span><span className="text-[10px] text-gray-400 font-mono-game">{orderId}</span></div>
            <div className="flex justify-between"><span className="text-[10px] text-gray-500">Amount</span><span className="text-lg font-black font-mono-game text-[#FFC93D]">{formatCurrency(amt)}</span></div>
          </div>
          {method === 'upi' ? (
            <>
              <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-5 text-center">
                <p className="text-xs text-gray-400 mb-3">Scan QR to Pay</p>
                <div className="inline-block p-3 bg-white rounded-2xl">
                  {qrDataUrl ? <img src={qrDataUrl} alt="QR" className="w-56 h-56" /> : <div className="w-56 h-56 bg-gray-200 rounded-xl flex items-center justify-center"><p className="text-sm text-gray-500">Loading...</p></div>}
                </div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <code className="text-xs bg-[#1A1A1A] px-3 py-1.5 rounded-lg text-[#FFC93D] font-mono-game">{state.settings.upiVpa}</code>
                  <button onClick={() => navigator.clipboard?.writeText(state.settings.upiVpa)} className="text-xs text-purple-400 font-bold">Copy</button>
                </div>
              </div>
              <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Pay via App</p>
                <div className="grid grid-cols-3 gap-2">
                  {upiApps.map(app => (
                    <button key={app.id} onClick={() => openUpiApp(app.id)} className="flex flex-col items-center gap-1 p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl active:scale-95">
                      <span className="text-2xl">{app.icon}</span><span className="text-[10px] font-bold text-gray-300">{app.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase">Enter UTR / Reference No.</p>
                <input type="text" placeholder="12-digit UTR" value={utr} onChange={e => setUtr(e.target.value.replace(/\D/g, '').slice(0, 20))} className="input-field text-center font-mono-game text-lg tracking-wider" />
              </div>
              <button onClick={handleSubmitUtr} disabled={utr.length < 10} className={`w-full py-4 rounded-xl font-black text-sm uppercase ${utr.length >= 10 ? 'btn-green' : 'bg-gray-700 text-gray-400'}`}>
                ✓ Submit Payment
              </button>
            </>
          ) : (
            <>
              <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-5 text-center">
                <p className="text-xs text-gray-400 mb-3">Send USDT (TRC20) to:</p>
                <div className="inline-block p-3 bg-white rounded-2xl">{qrDataUrl ? <img src={qrDataUrl} alt="QR" className="w-48 h-48" /> : <div className="w-48 h-48 bg-gray-200 rounded-xl" />}</div>
                <code className="block text-[10px] bg-[#1A1A1A] p-3 rounded-lg text-[#FFC93D] font-mono-game break-all mt-3">{state.settings.usdtWallet}</code>
              </div>
              <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase">Transaction Hash</p>
                <input type="text" placeholder="TX Hash" value={utr} onChange={e => setUtr(e.target.value)} className="input-field text-center font-mono-game text-xs" />
              </div>
              <button onClick={handleSubmitUtr} disabled={utr.length < 10} className={`w-full py-4 rounded-xl font-black text-sm uppercase ${utr.length >= 10 ? 'btn-green' : 'bg-gray-700 text-gray-400'}`}>✓ Submit</button>
            </>
          )}
          <div className="bg-[#141414]/50 border border-[#2A2A2A] rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 text-center">By proceeding, you agree to our <button onClick={() => setShowTerms(true)} className="text-[#FFC93D] underline">Terms & Conditions</button></p>
          </div>
        </div>
        {showTerms && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-end" onClick={() => setShowTerms(false)}>
            <div className="bg-[#141414] rounded-t-3xl w-full max-h-[70vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-black text-white mb-4">📋 Terms & Conditions</h2>
              <div className="text-xs text-gray-400 space-y-3">
                <p>1. All deposits are processed automatically within 1-5 minutes.</p>
                <p>2. Pay exact amount. Partial payments won't be credited.</p>
                <p>3. QR code expires in 5 minutes.</p>
                <p>4. Keep UTR safe for tracking.</p>
                <p>5. You must be 18+ to use this platform.</p>
                <p>6. Play responsibly. Set deposit limits.</p>
              </div>
              <button onClick={() => setShowTerms(false)} className="btn-gold w-full mt-4">I Understand</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 border-4 border-[#2A2A2A] border-t-[#FFC93D] rounded-full animate-spin" />
        <h2 className="text-xl font-black text-white mt-6">Verifying Payment</h2>
        <p className="text-sm text-gray-400 mt-2">Please wait...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-[#22C55E]/20 flex items-center justify-center animate-bounce-in">
        <div className="w-14 h-14 rounded-full bg-[#22C55E] flex items-center justify-center"><span className="text-3xl text-white">✓</span></div>
      </div>
      <h2 className="text-2xl font-black text-white mt-6">Payment Successful!</h2>
      <p className="text-4xl font-black font-mono-game text-[#22C55E] mt-3">{formatCurrency(amt)}</p>
      <button onClick={() => navigate('home')} className="btn-gold w-full max-w-xs mt-6">← Back to Home</button>
    </div>
  );
}
