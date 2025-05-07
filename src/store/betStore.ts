import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Bet, BankrollPoint, PerformanceMetric } from '../types';

const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      initialBankroll: 1000,
      currentBankroll: 1000,
      bets: [],
      bankrollHistory: [{ date: new Date().toISOString(), balance: 1000 }],
      isDarkMode: false,

      // Actions
      setInitialBankroll: (amount: number) => {
        const currentState = get();
        set({
          initialBankroll: amount,
          currentBankroll: amount + (currentState.currentBankroll - currentState.initialBankroll),
          bankrollHistory: [
            { date: new Date().toISOString(), balance: amount },
            ...currentState.bankrollHistory.slice(1)
          ]
        });
      },

      addBet: (bet: Omit<Bet, 'id'>) => {
        const currentState = get();
        const newBet: Bet = {
          ...bet,
          id: crypto.randomUUID()
        };

        const newBankroll = currentState.currentBankroll + newBet.profitLoss;
        
        set({
          bets: [newBet, ...currentState.bets],
          currentBankroll: newBankroll,
          bankrollHistory: [
            ...currentState.bankrollHistory,
            { date: newBet.date, balance: newBankroll }
          ]
        });
      },

      editBet: (id: string, updatedBet: Partial<Bet>) => {
        const currentState = get();
        const oldBet = currentState.bets.find(b => b.id === id);
        
        if (!oldBet) return;
        
        const profitLossDifference = 
          (updatedBet.profitLoss !== undefined ? updatedBet.profitLoss : oldBet.profitLoss) - 
          oldBet.profitLoss;
        
        const updatedBets = currentState.bets.map(bet => 
          bet.id === id ? { ...bet, ...updatedBet } : bet
        );
        
        // Recalculate bankroll history from the bet date forward
        const betDate = updatedBet.date || oldBet.date;
        const updatedBankrollHistory = [...currentState.bankrollHistory];
        const betIndex = updatedBankrollHistory.findIndex(point => point.date >= betDate);
        
        if (betIndex >= 0) {
          for (let i = betIndex; i < updatedBankrollHistory.length; i++) {
            updatedBankrollHistory[i].balance += profitLossDifference;
          }
        }
        
        set({
          bets: updatedBets,
          currentBankroll: currentState.currentBankroll + profitLossDifference,
          bankrollHistory: updatedBankrollHistory
        });
      },

      deleteBet: (id: string) => {
        const currentState = get();
        const betToDelete = currentState.bets.find(b => b.id === id);
        
        if (!betToDelete) return;
        
        const updatedBets = currentState.bets.filter(bet => bet.id !== id);
        
        // Recalculate bankroll history from the bet date forward
        const updatedBankrollHistory = [...currentState.bankrollHistory];
        const betIndex = updatedBankrollHistory.findIndex(point => 
          point.date >= betToDelete.date
        );
        
        if (betIndex >= 0) {
          for (let i = betIndex; i < updatedBankrollHistory.length; i++) {
            updatedBankrollHistory[i].balance -= betToDelete.profitLoss;
          }
        }
        
        set({
          bets: updatedBets,
          currentBankroll: currentState.currentBankroll - betToDelete.profitLoss,
          bankrollHistory: updatedBankrollHistory
        });
      },

      toggleDarkMode: () => set(state => ({ isDarkMode: !state.isDarkMode }))
    }),
    {
      name: 'betting-tracker-storage'
    }
  )
);

export default useStore;