import { Bet, PerformanceMetric, OddsFormat } from '../types';
import { startOfDay, startOfWeek, startOfMonth, isSameDay, isSameWeek, isSameMonth, format } from 'date-fns';

// Convert between different odds formats
export const convertOdds = (odds: number, from: OddsFormat, to: OddsFormat): number => {
  // First convert to decimal as intermediate format
  let decimal: number;
  
  // Convert from source format to decimal
  switch (from) {
    case 'american':
      decimal = americanToDecimal(odds);
      break;
    case 'decimal':
      decimal = odds;
      break;
    case 'fractional':
      const [num, den] = odds.toString().split('/').map(Number);
      decimal = num / den + 1;
      break;
    default:
      decimal = odds;
  }
  
  // Convert from decimal to target format
  switch (to) {
    case 'american':
      return decimalToAmerican(decimal);
    case 'decimal':
      return decimal;
    case 'fractional':
      const fracOdds = decimal - 1;
      // Find closest simple fraction
      const den = 1;
      const num = Math.round(fracOdds * den);
      return num / den;
    default:
      return odds;
  }
};

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

// Format odds based on selected format
export const formatOdds = (odds: number, format: OddsFormat): string => {
  switch (format) {
    case 'american':
      return formatAmericanOdds(odds);
    case 'decimal':
      return odds.toFixed(2);
    case 'fractional':
      const decimal = americanToDecimal(odds) - 1;
      const den = 1;
      const num = Math.round(decimal * den);
      return `${num}/${den}`;
    default:
      return odds.toString();
  }
};

// Calculate potential winnings based on bet amount and odds
export const calculatePotentialWin = (betAmount: number, odds: number, format: OddsFormat = 'american'): number => {
  const decimalOdds = format === 'american' ? americanToDecimal(odds) : odds;
  return betAmount * (decimalOdds - 1);
};

// Calculate profit/loss based on outcome
export const calculateProfitLoss = (betAmount: number, odds: number, outcome: 'win' | 'loss' | 'pending'): number => {
  if (outcome === 'pending') return 0;
  if (outcome === 'win') return calculatePotentialWin(betAmount, odds);
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
  
  const periodStart = new Date();
  const periods: string[] = [];
  
  if (periodType === 'day') {
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      periods.push(getPeriodKey(date));
    }
  } else if (periodType === 'week') {
    for (let i = 3; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - (i * 7));
      periods.push(getPeriodKey(date));
    }
  } else if (periodType === 'month') {
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      periods.push(getPeriodKey(date));
    }
  }
  
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
  
  bets.forEach(bet => {
    const betDate = new Date(bet.date);
    let shouldInclude = false;
    let periodKey = '';
    
    switch (periodType) {
      case 'day':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        shouldInclude = betDate >= startOfDay(sevenDaysAgo);
        periodKey = getPeriodKey(betDate);
        break;
      case 'week':
        const fourWeeksAgo = new Date(today);
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
        shouldInclude = betDate >= startOfWeek(fourWeeksAgo);
        periodKey = getPeriodKey(betDate);
        break;
      case 'month':
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
  
  const result = periods.map(period => {
    const metric = metrics[period];
    
    if (metric.betsCount > 0) {
      metric.winRate = metric.winCount / metric.betsCount;
      
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