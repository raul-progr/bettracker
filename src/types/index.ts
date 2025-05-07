export interface Bet {
  id: string;
  date: string;
  description: string;
  betAmount: number;
  odds: number; // American odds
  outcome: 'win' | 'loss' | 'pending';
  profitLoss: number; // Positive for win, negative for loss
  category?: string;
}

export interface BankrollPoint {
  date: string;
  balance: number;
}

export interface PerformanceMetric {
  period: string;
  betsCount: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  profitLoss: number;
  roi: number;
}

export interface AppState {
  initialBankroll: number;
  currentBankroll: number;
  bets: Bet[];
  bankrollHistory: BankrollPoint[];
  isDarkMode: boolean;
}