// @ts-nocheck
import { useState } from 'react';
import type { AppState } from '../../store/types';
import { createUser } from '../../store';
import { validatePhone, generateOTP, playSound } from '../../utils';
import { User, Phone, Lock, Gift, CheckCircle } from 'lucide-react';

type SetState = (s: AppState | ((p: AppState) => AppState)) => void;

export function AuthScreen({ state, setState }: { state: AppState; setState: SetState }) {
  const [mode, setMode] = useState<'login' | 'register' | 'otp'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [invite, setInvite] = useState('991894225');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError('');
    if (!validatePhone(phone)) {
      setError('Enter valid 10-digit phone number');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const user = Object.values(state.users).find(u => u.phone === phone && u.password === password);
    if (!user) {
      setError('Invalid phone or password');
      return;
    }

    setLoading(true);
    playSound('click');
    setTimeout(() => {
      setState(prev => ({ ...prev, session: user.uid }));
      setLoading(false);
    }, 800);
  };

  const handleRegister = () => {
    setError('');
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!validatePhone(phone)) {
      setError('Enter valid 10-digit phone number');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!terms) {
      setError('Please accept Terms & Conditions');
      return;
    }
    if (Object.values(state.users).some(u => u.phone === phone)) {
      setError('Phone already registered');
      return;
    }

    const otpCode = generateOTP();
    setGeneratedOtp(otpCode);
    setMode('otp');
    setOtpTimer(60);
    playSound('click');

    const interval = setInterval(() => {
      setOtpTimer(t => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    setTimeout(() => {
      alert(`🔐 Your OTP is: ${otpCode}\n\n(In production, this will be sent via SMS)`);
    }, 500);
  };

  const handleVerifyOtp = () => {
    setError('');
    if (otp.length !== 6) {
      setError('Please enter 6-digit OTP');
      return;
    }
    if (otp !== generatedOtp) {
      setError('Invalid OTP');
      playSound('loss');
      return;
    }

    setLoading(true);
    playSound('fanfare');
    setTimeout(() => {
      setState(prev => createUser(prev, name, phone, password, false));
      setLoading(false);
    }, 1000);
  };

  const handleGuest = () => {
    playSound('click');
    setState(prev => createUser(prev, 'Guest User', '9999999999', 'guest123', true));
  };

  if (mode === 'otp') {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#1a0a2e] to-[#0A0A0A] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-b from-[#FFE58F] to-[#D4A017] rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-2xl font-black text-white">Verify Phone</h1>
            <p className="text-sm text-gray-400 mt-2">Enter the 6-digit OTP sent to</p>
            <p className="text-base font-bold text-[#FFC93D] mt-1">+91 {phone}</p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-xl p-3 mb-4 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="input-field text-center text-2xl tracking-[12px] mb-4"
            maxLength={6}
            autoFocus
          />

          <button
            onClick={handleVerifyOtp}
            disabled={otp.length !== 6 || loading}
            className={`w-full py-4 rounded-xl font-black text-sm uppercase ${
              otp.length === 6 && !loading ? 'btn-gold' : 'bg-gray-700 text-gray-400'
            }`}
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>

          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              Didn't receive OTP?{' '}
              <button disabled={otpTimer > 0} className={`font-bold ${otpTimer > 0 ? 'text-gray-600' : 'text-[#FFC93D]'}`}>
                {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
              </button>
            </p>
            <button onClick={() => setMode('register')} className="text-xs text-gray-500 mt-2">
              ← Change phone number
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#1a0a2e] to-[#0A0A0A] flex flex-col overflow-y-auto">
      <div className="p-6 pt-12 min-h-screen flex flex-col">
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-b from-[#FFE58F] to-[#D4A017] rounded-3xl flex items-center justify-center animate-float">
            <span className="text-5xl">👑</span>
          </div>
          <h1 className="font-logo text-3xl font-black text-gold-gradient">LEGACY WIN</h1>
          <p className="text-xs text-gray-500 mt-1">Play • Win • Enjoy</p>
        </div>

        <div className="flex bg-[#1A1A1A] rounded-2xl p-1.5 mb-6">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-3 rounded-xl text-sm font-bold ${mode === 'login' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
          >
            Login
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-3 rounded-xl text-sm font-bold ${mode === 'register' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-3 mb-4 text-red-400 text-xs">
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <div className="space-y-4 flex-1">
            <h2 className="text-xl font-black text-white">Welcome Back 👋</h2>
            <p className="text-sm text-gray-400">Login to continue playing</p>

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="input-field pl-12"
                maxLength={10}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field pl-12"
              />
            </div>

            <button onClick={handleLogin} disabled={loading} className={`w-full py-4 ${loading ? 'bg-gray-700 text-gray-400' : 'btn-gold'} rounded-xl`}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <button onClick={handleGuest} className="w-full py-4 btn-ghost rounded-xl">
              Continue as Guest
            </button>
          </div>
        ) : (
          <div className="space-y-4 flex-1">
            <h2 className="text-xl font-black text-white">Create Account 🎉</h2>
            <p className="text-sm text-gray-400">Join & get <span className="text-[#FFC93D] font-bold">₹500</span> welcome bonus!</p>

            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-field pl-12"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="input-field pl-12"
                maxLength={10}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field pl-12"
              />
            </div>

            <div className="relative">
              <Gift className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Invite Code (optional)"
                value={invite}
                onChange={e => setInvite(e.target.value)}
                className="input-field pl-12"
              />
            </div>

            <label className="flex items-start gap-2 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={terms}
                onChange={e => setTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5"
              />
              <span>I am 18+ and accept Terms & Conditions</span>
            </label>

            <button onClick={handleRegister} className="btn-gold w-full py-4">
              Create Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
