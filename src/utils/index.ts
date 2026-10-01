// Utility functions - Audio, Helpers, Constants

// ============ CONSTANTS ============
export const COLORS = {
  bgRoot: '#0A0A0A',
  bgSurface: '#141414',
  bgElevated: '#1E1E1E',
  bgInput: '#1A1A1A',
  borderSubtle: '#2A2A2A',
  borderStrong: '#3A3A3A',
  goldLight: '#FFE58F',
  gold: '#FFC93D',
  goldDark: '#D4A017',
  success: '#22C55E',
  danger: '#EF4444',
  purple: '#8B3FE8',
  purpleDeep: '#7C3AED',
  blue: '#3B82F6',
  pink: '#EC4899',
  amber: '#F59E0B',
};

export const DEFAULT_SETTINGS = {
  soundEnabled: true,
  commissionRate: 0.02,
  minDeposit: 100,
  maxDeposit: 100000,
  minWithdraw: 110,
  maxWithdraw: 100000,
  minBet: 10,
  maxBet: 10000,
  welcomeBonus: 500,
  referralBonus: 50,
  upiVpa: 'legacywin@upi',
  usdtWallet: 'TN2Yx8kFqR3vZ5mW9pL4jH7nB6cA0dE1fG',
};

// ============ AUDIO ENGINE ============
let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    return audioCtx;
  } catch { return null; }
}

export function playSound(type: 'click' | 'win' | 'loss' | 'cashout' | 'spin' | 'tick' | 'fanfare' | 'explosion') {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.value = 0.1;

  switch (type) {
    case 'click':
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start(); osc.stop(ctx.currentTime + 0.04);
      break;
    case 'win':
      osc.frequency.value = 523;
      osc.type = 'triangle';
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
      setTimeout(() => {
        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.frequency.value = 659; o2.type = 'triangle';
        g2.gain.value = 0.1;
        g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        o2.start(); o2.stop(ctx.currentTime + 0.3);
      }, 150);
      break;
    case 'loss':
      osc.frequency.value = 400;
      osc.type = 'sawtooth';
      gain.gain.value = 0.05;
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
      break;
    case 'cashout':
      osc.frequency.value = 1000;
      osc.type = 'sine';
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
      break;
    case 'spin':
      osc.frequency.value = 1000;
      osc.type = 'sine';
      gain.gain.value = 0.05;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
      osc.start(); osc.stop(ctx.currentTime + 0.02);
      break;
    case 'tick':
      osc.frequency.value = 1200;
      osc.type = 'sine';
      gain.gain.value = 0.03;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
      osc.start(); osc.stop(ctx.currentTime + 0.02);
      break;
    case 'fanfare':
      [523, 659, 784, 1047].forEach((freq, i) => {
        setTimeout(() => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = freq; o.type = 'triangle';
          g.gain.value = 0.1;
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          o.start(); o.stop(ctx.currentTime + 0.3);
        }, i * 200);
      });
      break;
    case 'explosion':
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseGain.gain.value = 0.1;
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      noise.start(); noise.stop(ctx.currentTime + 0.5);
      break;
  }
}

// ============ HELPERS ============
export function formatCurrency(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function generateUID(): string {
  const first = Math.random() > 0.5 ? '9' : '8';
  let rest = '';
  for (let i = 0; i < 9; i++) rest += Math.floor(Math.random() * 10);
  return first + rest;
}

export function generateMemberId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'MEMBER';
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export function generateInviteCode(): string {
  let code = 'LW';
  for (let i = 0; i < 8; i++) code += Math.floor(Math.random() * 10);
  return code;
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function validatePhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

export function validateUPI(upi: string): boolean {
  return /^[a-zA-Z0-9.\-_]+@[a-zA-Z]+$/.test(upi);
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============ GAME ICONS (SVG) ============
export const GAME_ICONS = {
  slots: '🎰',
  plane: '✈️',
  mines: '💎',
  dice: '🎲',
  wheel: '🎡',
};

export const NAV_ICONS = {
  home: '🏠',
  activity: '📊',
  bonus: '🎁',
  invite: '👥',
  account: '👤',
};

export const APP_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#FFE58F"/><stop offset="100%" style="stop-color:#D4A017"/></linearGradient></defs><circle cx="50" cy="50" r="48" fill="#0A0A0A" stroke="url(#g)" stroke-width="3"/><text x="50" y="62" text-anchor="middle" font-size="40" fill="url(#g)" font-family="serif" font-weight="bold">♛</text></svg>`;
