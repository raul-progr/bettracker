import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useStore from '../store/betStore';
import { calculatePerformanceMetrics } from '../utils/betUtils';

const PerformanceMetrics: React.FC = () => {
  const { bets } = useStore();
  const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month'>('day');
  
  const metrics = useMemo(() => {
    return calculatePerformanceMetrics(bets, timeFrame);
  }, [bets, timeFrame]);

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
          <p className="text-sm font-medium">{data.period}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              Bets: <span className="font-medium">{data.betsCount}</span>
            </p>
            <p className="text-sm">
              Win Rate: <span className="font-medium">{(data.winRate * 100).toFixed(1)}%</span>
            </p>
            <p className="text-sm">
              P/L: <span className={`font-medium ${data.profitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                ${data.profitLoss.toFixed(2)}
              </span>
            </p>
            <p className="text-sm">
              ROI: <span className={`font-medium ${data.roi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {(data.roi * 100).toFixed(1)}%
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Performance</h2>
        
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-1">
          <button
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeFrame === 'day' 
                ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-800 dark:text-white' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setTimeFrame('day')}
          >
            Daily
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeFrame === 'week' 
                ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-800 dark:text-white' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setTimeFrame('week')}
          >
            Weekly
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              timeFrame === 'month' 
                ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-800 dark:text-white' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setTimeFrame('month')}
          >
            Monthly
          </button>
        </div>
      </div>
      
      <div className="w-full h-[250px]">
        {metrics.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={metrics}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="period"
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={customTooltip} />
              <Bar dataKey="profitLoss" radius={[4, 4, 0, 0]}>
                {metrics.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.profitLoss >= 0 ? '#10B981' : '#EF4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            No data available for this time period
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Bets</p>
          <p className="text-xl font-bold text-gray-800 dark:text-white mt-1">
            {metrics.reduce((sum, m) => sum + m.betsCount, 0)}
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Win Rate</p>
          <p className="text-xl font-bold text-gray-800 dark:text-white mt-1">
            {metrics.length && metrics.reduce((sum, m) => sum + m.betsCount, 0) > 0
              ? (metrics.reduce((sum, m) => sum + m.winCount, 0) / metrics.reduce((sum, m) => sum + m.betsCount, 0) * 100).toFixed(1)
              : 0}%
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total P/L</p>
          <p className={`text-xl font-bold mt-1 ${
            metrics.reduce((sum, m) => sum + m.profitLoss, 0) >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            ${metrics.reduce((sum, m) => sum + m.profitLoss, 0).toFixed(2)}
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg. ROI</p>
          <p className={`text-xl font-bold mt-1 ${
            metrics.reduce((sum, m) => sum + m.roi, 0) / (metrics.length || 1) >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {metrics.length 
              ? (metrics.reduce((sum, m) => sum + m.roi, 0) / metrics.length * 100).toFixed(1) 
              : 0}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;