import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Settings, PlusCircle } from 'lucide-react';
import useStore from '../store/betStore';
import { BankrollPoint } from '../types';
import { formatCurrency, formatDate } from '../utils/betUtils';
import InitialBankrollDialog from './InitialBankrollDialog';

const customTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(label)}</p>
        <p className="text-base font-semibold">
          Balance: {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const BankrollGraph: React.FC = () => {
  const { bankrollHistory, initialBankroll, currentBankroll } = useStore();
  const [timeRange, setTimeRange] = useState<'all' | '30d' | '7d'>('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const filteredData = useMemo(() => {
    if (timeRange === 'all') return bankrollHistory;
    
    const now = new Date();
    let cutoffDate: Date;
    
    if (timeRange === '30d') {
      cutoffDate = new Date(now.setDate(now.getDate() - 30));
    } else {
      cutoffDate = new Date(now.setDate(now.getDate() - 7));
    }
    
    return bankrollHistory.filter(point => new Date(point.date) >= cutoffDate);
  }, [bankrollHistory, timeRange]);

  const formattedData = useMemo(() => {
    // Ensure data is sorted by date
    return [...filteredData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [filteredData]);

  const minValue = useMemo(() => {
    if (!formattedData.length) return 0;
    const min = Math.min(...formattedData.map(point => point.balance));
    return min < 0 ? min * 1.1 : min * 0.9;
  }, [formattedData]);

  const maxValue = useMemo(() => {
    if (!formattedData.length) return initialBankroll * 1.5;
    const max = Math.max(...formattedData.map(point => point.balance));
    return max * 1.1;
  }, [formattedData, initialBankroll]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 h-[400px]">
      <div className="flex flex-wrap items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Bankroll History</h2>
          <div className="flex space-x-2 mt-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Current Balance: 
              <span className={`ml-1 font-semibold ${
                currentBankroll >= initialBankroll ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(currentBankroll)}
              </span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentBankroll >= initialBankroll 
                ? `+${((currentBankroll/initialBankroll - 1) * 100).toFixed(2)}%` 
                : `-${((1 - currentBankroll/initialBankroll) * 100).toFixed(2)}%`
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-1">
            <button
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === '7d' 
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-800 dark:text-white' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setTimeRange('7d')}
            >
              7D
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === '30d' 
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-800 dark:text-white' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setTimeRange('30d')}
            >
              30D
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === 'all' 
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-800 dark:text-white' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setTimeRange('all')}
            >
              All
            </button>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
      
      {formattedData.length > 1 ? (
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis 
                domain={[minValue, maxValue]}
                tickFormatter={(value) => `$${Math.round(value)}`}
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <Tooltip content={customTooltip} />
              <ReferenceLine y={initialBankroll} stroke="#6b7280" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#white' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[300px] bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <PlusCircle className="text-gray-400 mb-2" size={40} />
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Add your first bet to see your bankroll graph
          </p>
        </div>
      )}
      
      <InitialBankrollDialog 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default BankrollGraph;