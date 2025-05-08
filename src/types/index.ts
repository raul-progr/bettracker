export interface Bet {
  id: string;
  date: string;
  description: string;
  betAmount: number;
  odds: number;
  outcome: 'win' | 'loss' | 'pending';
  profitLoss: number;
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

export type OddsFormat = 'american' | 'decimal' | 'fractional';

export interface AppState {
  initialBankroll: number;
  currentBankroll: number;
  bets: Bet[];
  bankrollHistory: BankrollPoint[];
  isDarkMode: boolean;
  oddsFormat: OddsFormat;
  language: string;
  resetHistory: () => void;
  setOddsFormat: (format: OddsFormat) => void;
  setLanguage: (lang: string) => void;
}