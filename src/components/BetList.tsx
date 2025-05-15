import React, { useState, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  Search,
  X,
  Edit2,
  Trash2,
  Filter,
  CheckCircle,
  XCircle,
  DollarSign,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import useStore from "../store/betStore";
import { Bet } from "../types";
import {
  formatCurrency,
  formatDateTime,
  formatAmericanOdds,
  calculatePotentialWin,
} from "../utils/betUtils";

interface CashOutDialogProps {
  bet: Bet;
  isOpen: boolean;
  onClose: () => void;
  onCashOut: (amount: number) => void;
}

const CashOutDialog: React.FC<CashOutDialogProps> = ({
  bet,
  isOpen,
  onClose,
  onCashOut,
}) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cashOutAmount = parseFloat(amount);

    if (isNaN(cashOutAmount) || cashOutAmount <= 0) {
      setError(t("betForm.validAmount"));
      return;
    }

    onCashOut(cashOutAmount);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {t("common.cashOut")}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("betForm.cashOutAmount")}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">
                $
              </span>
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                className="pl-8 w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:bg-gray-700 dark:text-white"
                placeholder="0.00"
              />
            </div>
            {error && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t("betForm.originalStake")}:{" "}
                <span className="font-semibold">
                  {formatCurrency(bet.betAmount)}
                </span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t("betForm.potentialWin")}:{" "}
                <span className="font-semibold">
                  {formatCurrency(
                    calculatePotentialWin(bet.betAmount, bet.odds)
                  )}
                </span>
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              {t("betForm.cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              {t("betForm.confirm")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BetList: React.FC = () => {
  const { t } = useTranslation();
  const { bets, deleteBet, editBet } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [tipsterFilter, setTipsterFilter] = useState(""); // Nuevo estado para filtrar por tipster
  const [showPending, setShowPending] = useState(true);
  const [showWins, setShowWins] = useState(true);
  const [showLosses, setShowLosses] = useState(true);
  const [expandedBetId, setExpandedBetId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedBetForCashOut, setSelectedBetForCashOut] =
    useState<Bet | null>(null);

  const filteredBets = useMemo(() => {
    return bets.filter((bet) => {
      const matchesSearch =
        bet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bet.category &&
          bet.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTipster =
        !tipsterFilter ||
        (bet.tipster &&
          bet.tipster.toLowerCase().includes(tipsterFilter.toLowerCase()));

      const matchesOutcome =
        (bet.outcome === "win" && showWins) ||
        (bet.outcome === "loss" && showLosses) ||
        (bet.outcome === "pending" && showPending);

      return matchesSearch && matchesTipster && matchesOutcome;
    });
  }, [bets, searchTerm, tipsterFilter, showPending, showWins, showLosses]);

  const toggleBetExpansion = (id: string) => {
    setExpandedBetId(expandedBetId === id ? null : id);
  };

  const handleDeleteBet = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t("common.deleteConfirm"))) {
      deleteBet(id);
    }
  };

  const handleUpdateBetStatus = (
    bet: Bet,
    newStatus: "win" | "loss",
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const profitLoss =
      newStatus === "win"
        ? calculatePotentialWin(bet.betAmount, bet.odds, "american")
        : -bet.betAmount;

    editBet(bet.id, {
      outcome: newStatus,
      profitLoss,
    });
  };

  const handleCashOut = (amount: number) => {
    if (!selectedBetForCashOut) return;

    const originalBet = selectedBetForCashOut;
    const profitLoss = amount - originalBet.betAmount;

    editBet(originalBet.id, {
      outcome: profitLoss >= 0 ? "win" : "loss",
      profitLoss,
    });

    setSelectedBetForCashOut(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {t("common.betHistory")}
        </h2>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("common.searchBets")}
              className="pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
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
                ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            <Filter size={16} className="mr-1" />
            {t("common.filter")}
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="flex flex-wrap items-center mb-4 gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">
            {t("common.show")}:
          </span>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={showWins}
              onChange={() => setShowWins(!showWins)}
              className="rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-700"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {t("betForm.win")}
            </span>
          </label>
          <label className="inline-flex items-center ml-3">
            <input
              type="checkbox"
              checked={showLosses}
              onChange={() => setShowLosses(!showLosses)}
              className="rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-700"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {t("betForm.loss")}
            </span>
          </label>
          <label className="inline-flex items-center ml-3">
            <input
              type="checkbox"
              checked={showPending}
              onChange={() => setShowPending(!showPending)}
              className="rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-700"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {t("betForm.pending")}
            </span>
          </label>
          <div className="relative ml-3">
            <input
              type="text"
              value={tipsterFilter}
              onChange={(e) => setTipsterFilter(e.target.value)}
              placeholder={t("Tipster")}
              className="pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </div>
      )}

      {filteredBets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            {t("common.noBetsFound")}
          </p>
          {(searchTerm ||
            tipsterFilter ||
            !showWins ||
            !showLosses ||
            !showPending) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setTipsterFilter("");
                setShowWins(true);
                setShowLosses(true);
                setShowPending(true);
              }}
              className="mt-2 text-primary-600 dark:text-primary-400 text-sm hover:underline"
            >
              {t("common.clearFilters")}
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
                    <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                      {bet.description}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(bet.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="mr-4 text-right">
                    <p
                      className={`text-sm font-semibold ${
                        bet.outcome === "win"
                          ? "text-green-600 dark:text-green-400"
                          : bet.outcome === "loss"
                          ? "text-red-600 dark:text-red-400"
                          : "text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {bet.outcome === "pending"
                        ? t("betForm.pending")
                        : formatCurrency(bet.profitLoss)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatCurrency(bet.betAmount)} @{" "}
                      {formatAmericanOdds(bet.odds)}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    {bet.outcome === "pending" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBetForCashOut(bet);
                          }}
                          className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 p-1"
                          title={t("common.cashOut")}
                        >
                          <DollarSign size={16} />
                        </button>
                        <button
                          onClick={(e) => handleUpdateBetStatus(bet, "win", e)}
                          className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 p-1"
                          title={t("common.markAsWin")}
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={(e) => handleUpdateBetStatus(bet, "loss", e)}
                          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                          title={t("common.markAsLoss")}
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={(e) => handleDeleteBet(bet.id, e)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                      title={t("common.deleteBet")}
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
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t("betForm.betAmount")}
                      </p>
                      <p className="font-medium">
                        {formatCurrency(bet.betAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t("betForm.odds")}
                      </p>
                      <p className="font-medium">
                        {formatAmericanOdds(bet.odds)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t("betForm.potentialWin")}
                      </p>
                      <p className="font-medium">
                        {formatCurrency(
                          calculatePotentialWin(bet.betAmount, bet.odds)
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t("betForm.outcome")}
                      </p>
                      <p
                        className={`font-medium ${
                          bet.outcome === "win"
                            ? "text-green-600 dark:text-green-400"
                            : bet.outcome === "loss"
                            ? "text-red-600 dark:text-red-400"
                            : "text-yellow-600 dark:text-yellow-400"
                        }`}
                      >
                        {t(`betForm.${bet.outcome}`)}
                      </p>
                    </div>
                    {bet.category && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t("betForm.category")}
                        </p>
                        <p className="font-medium">{bet.category}</p>
                      </div>
                    )}
                    {bet.tipster && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t("Tipster")}
                        </p>
                        <p className="font-medium">{bet.tipster}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {selectedBetForCashOut && (
        <CashOutDialog
          bet={selectedBetForCashOut}
          isOpen={true}
          onClose={() => setSelectedBetForCashOut(null)}
          onCashOut={handleCashOut}
        />
      )}
    </div>
  );
};

export default BetList;
