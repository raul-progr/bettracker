import React, { useState, useEffect } from "react";
import { PlusCircle, Moon, Sun, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import BankrollGraph from "./components/BankrollGraph";
import BetForm from "./components/BetForm";
import BetList from "./components/BetList";
import PerformanceMetrics from "./components/PerformanceMetrics";
import useStore from "./store/betStore";
import { OddsFormat } from "./types";
import AuthForm from "./components/AuthForm";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

function App() {
  const { t, i18n } = useTranslation();
  const {
    isDarkMode,
    toggleDarkMode,
    oddsFormat,
    setOddsFormat,
    language,
    setLanguage,
    resetHistory,
  } = useStore();

  const [isBetFormOpen, setIsBetFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Estado para usuario autenticado
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const handleReset = () => {
    if (window.confirm(t("common.resetConfirm"))) {
      resetHistory();
    }
  };

  // Mostrar loading mientras se verifica autenticación
  if (loadingAuth) {
    return <div className="text-center py-10">Cargando...</div>;
  }

  // Mostrar formulario de login si no hay usuario autenticado
  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-primary-600 dark:bg-primary-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-white">BetTracker</h1>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-full text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-primary-800"
              >
                <Settings size={20} />
              </button>

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-primary-800"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BankrollGraph />
          <PerformanceMetrics />
        </div>

        <div className="mt-6">
          <BetList />
        </div>
      </main>

      <button
        onClick={() => setIsBetFormOpen(true)}
        className="fixed right-6 bottom-6 p-4 bg-secondary-600 hover:bg-secondary-700 text-white rounded-full shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 transition-colors duration-200"
      >
        <PlusCircle size={24} />
      </button>

      <BetForm isOpen={isBetFormOpen} onClose={() => setIsBetFormOpen(false)} />

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {t("common.settings")}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("common.language")}
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:bg-gray-700 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("common.oddsFormat")}
                </label>
                <select
                  value={oddsFormat}
                  onChange={(e) => setOddsFormat(e.target.value as OddsFormat)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:bg-gray-700 dark:text-white"
                >
                  <option value="american">American (+150/-110)</option>
                  <option value="decimal">Decimal (2.50)</option>
                  <option value="fractional">Fractional (3/2)</option>
                </select>
              </div>

              <div>
                <button
                  onClick={handleReset}
                  className="w-full px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {t("common.reset")}
                </button>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-full px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {t("betForm.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
