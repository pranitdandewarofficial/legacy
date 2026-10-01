// TypeScript Types for Legacy Win

export interface User {
  uid: string;
  memberId: string;
  name: string;
  phone: string;
  email?: string;
  password: string;
  inviteCode: string;
  vipLevel: number;
  isGuest: boolean;
  createdAt: number;
  totalBets: number;
  totalWins: number;
  commissionPaid: number;
  avatar?: string;
}

export interface Wallet {
  uid: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalBet: number;
  totalWon: number;
}

export interface Transaction {
  id: string;
  uid: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus' | 'referral' | 'commission';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'rejected';
  createdAt: number;
  meta?: Record<string, string>;
}

export interface Deposit {
  id: string;
  uid: string;
  amount: number;
  method: 'upi' | 'usdt';
  utr?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

export interface Withdrawal {
  id: string;
  uid: string;
  amount: number;
  upiId: string;
  holderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  createdAt: number;
}

export interface Bet {
  id: string;
  uid: string;
  game: string;
  amount: number;
  result: 'win' | 'loss';
  payout: number;
  commission: number;
  createdAt: number;
}

export interface AppSettings {
  soundEnabled: boolean;
  commissionRate: number;
  minDeposit: number;
  maxDeposit: number;
  minWithdraw: number;
  maxWithdraw: number;
  minBet: number;
  maxBet: number;
  welcomeBonus: number;
  referralBonus: number;
  upiVpa: string;
  usdtWallet: string;
}

export interface AppState {
  users: Record<string, User>;
  wallets: Record<string, Wallet>;
  transactions: Transaction[];
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  bets: Bet[];
  attendance: Record<string, { lastClaim: number; streak: number }>;
  redeemedCodes: Record<string, string[]>;
  session: string | null;
  adminSession: boolean;
  settings: AppSettings;
  onboarded: boolean;
}

export type SetState = (s: any) => void;
