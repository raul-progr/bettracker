import React, { useState } from 'react';
import { X } from 'lucide-react';
import useStore from '../store/betStore';
import { calculatePotentialWin, calculateProfitLoss, formatAmericanOdds } from '../utils/betUtils';

interface BetFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const BetForm: React.FC<BetFormProps> = ({ isOpen, onClose }) => {
  const { addBet } = useStore();
  
  const [description, setDescription] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [odds, setOdds] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 16));
  const [outcome, setOutcome] = useState<'win' | 'loss' | 'pending'>('pending');
  const [category, setCategory] = useState('');
  
  const [potentialWin, setPotentialWin] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculatePotential = () => {
    const amount = parseFloat(betAmount);
    const oddsValue = parseFloat(odds);
    
    if (!isNaN(amount) && !isNaN(oddsValue) && amount > 0) {
      setPotentialWin(calculatePotentialWin(amount, oddsValue));
    } else {
      setPotentialWin(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    const amountValue = parseFloat(betAmount);
    if (isNaN(amountValue) || amountValue <= 0) {
      newErrors.betAmount = 'Enter a valid positive amount';
    }
    
    const oddsValue = parseFloat(odds);
    if (isNaN(oddsValue)) {
      newErrors.odds = 'Enter valid odds (e.g. +150 or -110)';
    }
    
    if (!date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const amountValue = parseFloat(betAmount);
    const oddsValue = parseFloat(odds);
    
    const profitLoss = calculateProfitLoss(
      amountValue,
      oddsValue,
      outcome
    );
    
    addBet({
      description,
      betAmount: amountValue,
      odds: oddsValue,
      date: new Date(date).toISOString(),
      outcome,
      profitLoss,
      category: category || undefined
    });
    
    // Reset form
    setDescription('');
    setBetAmount('');
    setOdds('');
    setDate(new Date().toISOString().substring(0, 16));
    setOutcome('pending');
    setCategory('');
    setPotentialWin(null);
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Bet</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 dark:bg-gray-700 dark:text-white dark:focus:ring-green-700 ${
                  errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
                }`}
                placeholder="e.g., Lakers vs. Celtics - Lakers to win"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
              )}
            </div>
            
            {/* Amount and Odds */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="betAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bet Amount
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">
                    $
                  </span>
                  <input
                    type="text"
                    id="betAmount"
                    value={betAmount}
                    onChange={(e) => {
                      setBetAmount(e.target.value);
                      calculatePotential();
                    }}
                    onBlur={calculatePotential}
                    className={`pl-8 w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 dark:bg-gray-700 dark:text-white dark:focus:ring-green-700 ${
                      errors.betAmount ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
                    }`}
                    placeholder="100.00"
                  />
                </div>
                {errors.betAmount && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.betAmount}</p>
                )}
              </div>
              
              <div className="flex-1">
                <label htmlFor="odds" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  American Odds
                </label>
                <input
                  type="text"
                  id="odds"
                  value={odds}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string, minus sign, and numbers
                    if (value === '' || value === '-' || /^[+-]?\d*$/.test(value)) {
                      setOdds(value);
                      calculatePotential();
                    }
                  }}
                  onBlur={calculatePotential}
                  className={`w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 dark:bg-gray-700 dark:text-white dark:focus:ring-green-700 ${
                    errors.odds ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
                  }`}
                  placeholder="+150 or -110"
                />
                {errors.odds && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.odds}</p>
                )}
              </div>
            </div>
            
            {/* Potential win display */}
            {potentialWin !== null && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Potential win: <span className="font-semibold text-green-600 dark:text-green-400">${potentialWin.toFixed(2)}</span>
                </p>
              </div>
            )}
            
            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 dark:bg-gray-700 dark:text-white dark:focus:ring-green-700 ${
                  errors.date ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
              )}
            </div>
            
            {/* Outcome */}
            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Outcome
              </span>
              <div className="flex space-x-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="outcome"
                    value="win"
                    checked={outcome === 'win'}
                    onChange={() => setOutcome('win')}
                    className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500 dark:focus:ring-green-700"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Win</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="outcome"
                    value="loss"
                    checked={outcome === 'loss'}
                    onChange={() => setOutcome('loss')}
                    className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500 dark:focus:ring-red-700"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Loss</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="outcome"
                    value="pending"
                    checked={outcome === 'pending'}
                    onChange={() => setOutcome('pending')}
                    className="h-4 w-4 text-yellow-600 border-gray-300 focus:ring-yellow-500 dark:focus:ring-yellow-700"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Pending</span>
                </label>
              </div>
            </div>
            
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category (Optional)
              </label>
              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 dark:bg-gray-700 dark:text-white dark:focus:ring-green-700"
                placeholder="e.g., Basketball, Football, etc."
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800"
            >
              Add Bet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BetForm;