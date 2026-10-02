// @ts-nocheck
// State Management
import type { AppState, User, Wallet, Transaction, Bet } from './types';

const STORAGE_KEY = 'legacy_win_v1';

const defaultState: AppState = {
  users: {},
  wallets: {},
  transactions: [],
  deposits: [],
  withdrawals: [],
  bets: [],
  attendance: {},
  redeemedCodes: {},
  session: null,
  adminSession: false,
  settings: {
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
  },
  onboarded: false,
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultState, ...parsed, settings: { ...defaultState.settings, ...parsed.settings } };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return { ...defaultState };
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export function createUser(state: AppState, name: string, phone: string, password: string, isGuest: boolean = false): AppState {
  const uid = generateUID();
  const user: User = {
    uid,
    memberId: generateMemberId(),
    name,
    phone,
    password,
    inviteCode: generateInviteCode(),
    vipLevel: 1,
    isGuest,
    createdAt: Date.now(),
    totalBets: 0,
    totalWins: 0,
    commissionPaid: 0,
  };
  const wallet: Wallet = {
    uid,
    balance: state.settings.welcomeBonus,
    totalDeposited: 0,
    totalWithdrawn: 0,
    totalBet: 0,
    totalWon: 0,
  };
  const bonusTx: Transaction = {
    id: generateId(),
    uid,
    type: 'bonus',
    amount: state.settings.welcomeBonus,
    description: 'Welcome Bonus',
    status: 'completed',
    createdAt: Date.now(),
  };
  return {
    ...state,
    users: { ...state.users, [uid]: user },
    wallets: { ...state.wallets, [uid]: wallet },
    transactions: [bonusTx, ...state.transactions],
    session: uid,
  };
}

export function updateBalance(state: AppState, uid: string, delta: number): AppState {
  const wallet = state.wallets[uid];
  if (!wallet) return state;
  return {
    ...state,
    wallets: {
      ...state.wallets,
      [uid]: { ...wallet, balance: Math.round((wallet.balance + delta) * 100) / 100 },
    },
  };
}

export function addTransaction(state: AppState, tx: Omit<Transaction, 'id' | 'createdAt'>): AppState {
  const newTx: Transaction = { ...tx, id: generateId(), createdAt: Date.now() };
  return { ...state, transactions: [newTx, ...state.transactions] };
}

export function addBet(state: AppState, bet: Omit<Bet, 'id' | 'createdAt'>): AppState {
  const newBet: Bet = { ...bet, id: generateId(), createdAt: Date.now() };
  const commission = Math.round(bet.amount * state.settings.commissionRate * 100) / 100;
  const user = state.users[bet.uid];
  const wallet = state.wallets[bet.uid];
  if (!user || !wallet) return state;

  return {
    ...state,
    bets: [newBet, ...state.bets],
    users: {
      ...state.users,
      [bet.uid]: {
        ...user,
        totalBets: user.totalBets + 1,
        totalWins: user.totalWins + (bet.result === 'win' ? 1 : 0),
        commissionPaid: user.commissionPaid + commission,
      },
    },
    wallets: {
      ...state.wallets,
      [bet.uid]: {
        ...wallet,
        totalBet: wallet.totalBet + bet.amount,
        totalWon: wallet.totalWon + bet.payout,
      },
    },
  };
}

export function getCurrentUser(state: AppState): User | null {
  if (!state.session) return null;
  return state.users[state.session] || null;
}

export function getCurrentWallet(state: AppState): Wallet | null {
  if (!state.session) return null;
  return state.wallets[state.session] || null;
}

function generateUID(): string {
  const first = Math.random() > 0.5 ? '9' : '8';
  let rest = '';
  for (let i = 0; i < 9; i++) rest += Math.floor(Math.random() * 10);
  return first + rest;
}

function generateMemberId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'MEMBER';
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function generateInviteCode(): string {
  let code = 'LW';
  for (let i = 0; i < 8; i++) code += Math.floor(Math.random() * 10);
  return code;
}

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export type { AppState, User, Wallet, Transaction, Bet };
