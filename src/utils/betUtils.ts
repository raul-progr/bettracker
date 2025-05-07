import { Bet, PerformanceMetric } from '../types';
import { startOfDay, startOfWeek, startOfMonth, isSameDay, isSameWeek, isSameMonth, format } from 'date-fns';

// Convert American odds to decimal odds
export const americanToDecimal = (americanOdds: number): number => {
  if (americanOdds > 0) {
    return (americanOdds / 100) + 1;
  } else {
    return (100 / Math.abs(americanOdds)) + 1;
  }
};

// Convert decimal odds to American odds
export const decimalToAmerican = (decimalOdds: number): number => {
  if (decimalOdds >= 2) {
    return Math.round((decimalOdds - 1) * 100);
  } else {
    return Math.round(-100 / (decimalOdds - 1));
  }
};

// Calculate potential winnings based on bet amount and American odds
export const calculatePotentialWin = (betAmount: number, americanOdds: number): number => {
  if (americanOdds > 0) {
    return (betAmount * americanOdds) / 100;
  } else {
    return (betAmount * 100) / Math.abs(americanOdds);
  }
};

// Calculate profit/loss based on outcome
export const calculateProfitLoss = (betAmount: number, americanOdds: number, outcome: 'win' | 'loss' | 'pending'): number => {
  if (outcome === 'pending') return 0;
  if (outcome === 'win') return calculatePotentialWin(betAmount, americanOdds);
  return -betAmount;
};

// Format American odds with + or - sign
export const formatAmericanOdds = (odds: number): string => {
  return odds > 0 ? `+${odds}` : odds.toString();
};

// Format currency with sign
export const formatCurrency = (amount: number): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    signDisplay: 'always'
  });
  
  return formatter.format(amount);
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

// Format date
export const formatDate = (dateString: string): string => {
  return format(new Date(dateString), 'MMM dd, yyyy');
};

// Format time
export const formatDateTime = (dateString: string): string => {
  return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
};

// Calculate performance metrics for a given time period
export const calculatePerformanceMetrics = (bets: Bet[], periodType: 'day' | 'week' | 'month'): PerformanceMetric[] => {
  if (!bets.length) return [];
  
  const metrics: Record<string, PerformanceMetric> = {};
  const today = new Date();
  
  // Function to determine the period key based on the date
  const getPeriodKey = (date: Date): string => {
    switch (periodType) {
      case 'day':
        return format(date, 'yyyy-MM-dd');
      case 'week':
        return `Week of ${format(startOfWeek(date), 'MMM dd, yyyy')}`;
      case 'month':
        return format(date, 'MMMM yyyy');
      default:
        return '';
    }
  };
  
  // Initialize period metrics
  const periodStart = new Date();
  const periods: string[] = [];
  
  if (periodType === 'day') {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      periods.push(getPeriodKey(date));
    }
  } else if (periodType === 'week') {
    // Last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - (i * 7));
      periods.push(getPeriodKey(date));
    }
  } else if (periodType === 'month') {
    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      periods.push(getPeriodKey(date));
    }
  }
  
  // Initialize metrics for each period
  periods.forEach(period => {
    metrics[period] = {
      period,
      betsCount: 0,
      winCount: 0,
      lossCount: 0,
      winRate: 0,
      profitLoss: 0,
      roi: 0
    };
  });
  
  // Process bets and update metrics
  bets.forEach(bet => {
    const betDate = new Date(bet.date);
    let shouldInclude = false;
    let periodKey = '';
    
    switch (periodType) {
      case 'day':
        // Include bets from the last 7 days
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        shouldInclude = betDate >= startOfDay(sevenDaysAgo);
        periodKey = getPeriodKey(betDate);
        break;
      case 'week':
        // Include bets from the last 4 weeks
        const fourWeeksAgo = new Date(today);
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
        shouldInclude = betDate >= startOfWeek(fourWeeksAgo);
        periodKey = getPeriodKey(betDate);
        break;
      case 'month':
        // Include bets from the last 6 months
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        shouldInclude = betDate >= startOfMonth(sixMonthsAgo);
        periodKey = getPeriodKey(betDate);
        break;
    }
    
    if (shouldInclude && bet.outcome !== 'pending' && metrics[periodKey]) {
      metrics[periodKey].betsCount++;
      
      if (bet.outcome === 'win') {
        metrics[periodKey].winCount++;
      } else {
        metrics[periodKey].lossCount++;
      }
      
      metrics[periodKey].profitLoss += bet.profitLoss;
    }
  });
  
  // Calculate derived metrics and finalize
  const result = periods.map(period => {
    const metric = metrics[period];
    
    if (metric.betsCount > 0) {
      metric.winRate = metric.winCount / metric.betsCount;
      
      // Calculate ROI (Return on Investment)
      const totalStake = bets
        .filter(bet => {
          const betDate = new Date(bet.date);
          if (periodType === 'day') {
            return isSameDay(betDate, new Date(period));
          } else if (periodType === 'week') {
            return isSameWeek(betDate, new Date(period));
          } else if (periodType === 'month') {
            return isSameMonth(betDate, new Date(period));
          }
          return false;
        })
        .reduce((sum, bet) => sum + bet.betAmount, 0);
      
      metric.roi = totalStake > 0 ? metric.profitLoss / totalStake : 0;
    }
    
    return metric;
  });
  
  return result;
};