import React, { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useStore from '../store/betStore';
import { calculatePotentialWin, convertOdds, formatOdds } from '../utils/betUtils';

interface BetFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const BetForm: React.FC<BetFormProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { addBet, oddsFormat } = useStore();
  
  const [description, setDescription] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [odds, setOdds] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 16));
  const [outcome, setOutcome] = useState<'win' | 'loss' | 'pending'>('pending');
  const [category, setCategory] = useState('');
  
  const [potentialWin, setPotentialWin] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    calculatePotential();
  }, [betAmount, odds]);

  const calculatePotential = () => {
    const amount = parseFloat(betAmount);
    const oddsValue = parseFloat(odds);
    
    if (!isNaN(amount) && !isNaN(oddsValue) && amount > 0) {
      setPotentialWin(calculatePotentialWin(amount, oddsValue, oddsFormat));
    } else {
      setPotentialWin(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!description.trim()) {
      newErrors.description = t('betForm.descriptionRequired');
    }
    
    const amountValue = parseFloat(betAmount);
    if (isNaN(amountValue) || amountValue <= 0) {
      newErrors.betAmount = t('betForm.validAmount');
    }
    
    const oddsValue = parseFloat(odds);
    if (isNaN(oddsValue)) {
      newErrors.odds = t('betForm.validOdds');
    }
    
    if (!date) {
      newErrors.date = t('betForm.dateRequired');
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
    
    // Convert odds to American format for storage
    const americanOdds = oddsFormat === 'american' 
      ? oddsValue 
      : convertOdds(oddsValue, oddsFormat, 'american');
    
    const profitLoss = calculatePotentialWin(amountValue, americanOdds, 'american');
    
    addBet({
      description,
      betAmount: amountValue,
      odds: americanOdds,
      date: new Date(date).toISOString(),
      outcome,
      profitLoss: outcome === 'win' ? profitLoss : -amountValue,
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

  const setTimeNow = () => {
    const now = new Date();
    const localDateTime = now.toISOString().substring(0, 16);
    setDate(localDateTime);
    setShowCalendar(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('common.addBet')}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('betForm.description')}
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:bg-gray-700 dark:text-white ${
                  errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
                }`}
                placeholder="e.g., Lakers vs. Celtics - Lakers to win"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
              )}
            </div>
            
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="betAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('betForm.betAmount')}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">
                    $
                  </span>
                  <input
                    type="text"
                    id="betAmount"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className={`pl-8 w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:bg-gray-700 dark:text-white ${
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
                  {t('betForm.odds')}
                </label>
                <input
                  type="text"
                  id="odds"
                  value={odds}
                  onChange={(e) => setOdds(e.target.value)}
                  className={`w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:bg-gray-700 dark:text-white ${
                    errors.odds ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
                  }`}
                  placeholder={oddsFormat === 'american' ? '+150 or -110' : oddsFormat === 'decimal' ? '2.50' : '3/2'}
                />
                {errors.odds && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.odds}</p>
                )}
              </div>
            </div>
            
            {potentialWin !== null && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t('betForm.potentialWin')}: <span className="font-semibold text-green-600 dark:text-green-400">${potentialWin.toFixed(2)}</span>
                </p>
              </div>
            )}
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('betForm.date')}
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onClick={() => setShowCalendar(true)}
                  className={`w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:bg-gray-700 dark:text-white ${
                    errors.date ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
                  }`}
                />
                {showCalendar && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10">
                    <button
                      type="button"
                      onClick={setTimeNow}
                      className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center justify-center gap-2 transition-colors"
                    >
                      <Clock size={14} />
                      Time Now
                    </button>
                  </div>
                )}
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
              )}
            </div>
            
            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('betForm.outcome')}
              </span>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="outcome"
                    value="win"
                    checked={outcome === 'win'}
                    onChange={() => setOutcome('win')}
                    className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('betForm.win')}</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="outcome"
                    value="loss"
                    checked={outcome === 'loss'}
                    onChange={() => setOutcome('loss')}
                    className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('betForm.loss')}</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="outcome"
                    value="pending"
                    checked={outcome === 'pending'}
                    onChange={() => setOutcome('pending')}
                    className="h-4 w-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t('betForm.pending')}</span>
                </label>
              </div>
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('betForm.category')}
              </label>
              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Basketball, Football, etc."
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {t('betForm.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {t('betForm.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BetForm;