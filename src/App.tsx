import React, { useState, useEffect } from 'react';
import { PlusCircle, Moon, Sun } from 'lucide-react';
import BankrollGraph from './components/BankrollGraph';
import BetForm from './components/BetForm';
import BetList from './components/BetList';
import PerformanceMetrics from './components/PerformanceMetrics';
import useStore from './store/betStore';

function App() {
  const { isDarkMode, toggleDarkMode } = useStore();
  const [isBetFormOpen, setIsBetFormOpen] = useState(false);

  // Apply dark mode classes to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-green-600 dark:text-green-400">BetTracker</h1>
            
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BankrollGraph />
          <PerformanceMetrics />
        </div>
        
        <div className="mt-6">
          <BetList />
        </div>
      </main>
      
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsBetFormOpen(true)}
        className="fixed right-6 bottom-6 p-4 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
      >
        <PlusCircle size={24} />
      </button>
      
      {/* Bet Form Modal */}
      <BetForm isOpen={isBetFormOpen} onClose={() => setIsBetFormOpen(false)} />
    </div>
  );
}

export default App;