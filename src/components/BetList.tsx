import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Search, X, Edit2, Trash2, Filter } from 'lucide-react';
import useStore from '../store/betStore';
import { Bet } from '../types';
import { formatCurrency, formatDateTime, formatAmericanOdds } from '../utils/betUtils';
import BetForm from './BetForm';

const BetList: React.FC = () => {
  const { bets, deleteBet } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showPending, setShowPending] = useState(true);
  const [showWins, setShowWins] = useState(true);
  const [showLosses, setShowLosses] = useState(true);
  const [expandedBetId, setExpandedBetId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const filteredBets = useMemo(() => {
    return bets.filter(bet => {
      // Filter by search term
      const matchesSearch = 
        bet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bet.category && bet.category.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by outcome
      const matchesOutcome = 
        (bet.outcome === 'win' && showWins) ||
        (bet.outcome === 'loss' && showLosses) ||
        (bet.outcome === 'pending' && showPending);
      
      return matchesSearch && matchesOutcome;
    });
  }, [bets, searchTerm, showPending, showWins, showLosses]);

  const toggleBetExpansion = (id: string) => {
    setExpandedBetId(expandedBetId === id ? null : id);
  };

  const handleDeleteBet = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this bet?')) {
      deleteBet(id);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Bet History</h2>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search bets..."
              className="pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-2 rounded-md text-sm flex items-center ${
              isFilterOpen 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <Filter size={16} className="mr-1" />
            Filter
          </button>
        </div>
      </div>
      
      {isFilterOpen && (
        <div className="flex flex-wrap items-center mb-4 gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">Show:</span>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={showWins}
              onChange={() => setShowWins(!showWins)}
              className="rounded text-green-600 focus:ring-green-500 dark:focus:ring-green-700"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Wins</span>
          </label>
          <label className="inline-flex items-center ml-3">
            <input
              type="checkbox"
              checked={showLosses}
              onChange={() => setShowLosses(!showLosses)}
              className="rounded text-green-600 focus:ring-green-500 dark:focus:ring-green-700"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Losses</span>
          </label>
          <label className="inline-flex items-center ml-3">
            <input
              type="checkbox"
              checked={showPending}
              onChange={() => setShowPending(!showPending)}
              className="rounded text-green-600 focus:ring-green-500 dark:focus:ring-green-700"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Pending</span>
          </label>
        </div>
      )}
      
      {filteredBets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No bets found</p>
          {(searchTerm || !showWins || !showLosses || !showPending) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setShowWins(true);
                setShowLosses(true);
                setShowPending(true);
              }}
              className="mt-2 text-green-600 dark:text-green-400 text-sm hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredBets.map((bet) => (
            <li 
              key={bet.id}
              className="py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150"
              onClick={() => toggleBetExpansion(bet.id)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {expandedBetId === bet.id ? (
                    <ChevronDown size={16} className="text-gray-400 mr-2" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-400 mr-2" />
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-800 dark:text-white">{bet.description}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(bet.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="mr-4 text-right">
                    <p className={`text-sm font-semibold ${
                      bet.outcome === 'win' 
                        ? 'text-green-600 dark:text-green-400' 
                        : bet.outcome === 'loss' 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {bet.outcome === 'pending' 
                        ? 'Pending' 
                        : formatCurrency(bet.profitLoss)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatCurrency(bet.betAmount)} @ {formatAmericanOdds(bet.odds)}
                    </p>
                  </div>
                  
                  <div className="flex">
                    <button
                      onClick={(e) => handleDeleteBet(bet.id, e)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
              
              {expandedBetId === bet.id && (
                <div className="mt-3 pl-6 text-sm text-gray-600 dark:text-gray-300">
                  <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Bet Amount</p>
                      <p className="font-medium">{formatCurrency(bet.betAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Odds</p>
                      <p className="font-medium">{formatAmericanOdds(bet.odds)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Potential Win</p>
                      <p className="font-medium">{formatCurrency(calculatePotentialWin(bet.betAmount, bet.odds))}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Result</p>
                      <p className={`font-medium ${
                        bet.outcome === 'win' 
                          ? 'text-green-600 dark:text-green-400' 
                          : bet.outcome === 'loss' 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {bet.outcome.charAt(0).toUpperCase() + bet.outcome.slice(1)}
                      </p>
                    </div>
                    {bet.category && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                        <p className="font-medium">{bet.category}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BetList;