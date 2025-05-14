import React, { useState, useEffect } from "react";
import { X, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import useStore from "../store/betStore";
import {
  calculatePotentialWin,
  convertOdds,
  formatOdds,
} from "../utils/betUtils";

// Props del componente BetForm
interface BetFormProps {
  isOpen: boolean;
  onClose: () => void;
}

// Componente principal
const BetForm: React.FC<BetFormProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { addBet, oddsFormat } = useStore();

  const [description, setDescription] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const [odds, setOdds] = useState("");
  const [date, setDate] = useState(getCurrentDateTime());
  const [outcome, setOutcome] = useState<"win" | "loss" | "pending">("pending");
  const [category, setCategory] = useState("");
  const [tipster, setTipster] = useState(""); // Nuevo estado para el campo Tipster

  const [potentialWin, setPotentialWin] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCalendar, setShowCalendar] = useState(false);

  // Calcula las ganancias potenciales cada vez que cambian el monto o las probabilidades
  useEffect(() => {
    calculatePotential();
  }, [betAmount, odds]);

  // Actualiza la fecha y hora actual cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      setDate(getCurrentDateTime());
    }
  }, [isOpen]);

  // Función auxiliar para obtener la fecha y hora actual en formato compatible
  function getCurrentDateTime(): string {
    const now = new Date();

    // Obtiene los componentes de la fecha y hora local
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Meses van de 0 a 11
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    // Formatea la fecha y hora en el formato compatible con datetime-local
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Calcula las ganancias potenciales basadas en el monto y las probabilidades
  const calculatePotential = () => {
    const amount = parseFloat(betAmount);
    const oddsValue = parseFloat(odds);

    if (!isNaN(amount) && !isNaN(oddsValue) && amount > 0) {
      setPotentialWin(calculatePotentialWin(amount, oddsValue, oddsFormat));
    } else {
      setPotentialWin(null);
    }
  };

  // Valida los campos del formulario y devuelve si es válido
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!description.trim()) {
      newErrors.description = t("betForm.descriptionRequired");
    }

    const amountValue = parseFloat(betAmount);
    if (isNaN(amountValue) || amountValue <= 0) {
      newErrors.betAmount = t("betForm.validAmount");
    }

    const oddsValue = parseFloat(odds);
    if (isNaN(oddsValue)) {
      newErrors.odds = t("betForm.validOdds");
    }

    if (!date) {
      newErrors.date = t("betForm.dateRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Maneja el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const amountValue = parseFloat(betAmount);
    const oddsValue = parseFloat(odds);

    const americanOdds =
      oddsFormat === "american"
        ? oddsValue
        : convertOdds(oddsValue, oddsFormat, "american");

    const profitLoss = calculatePotentialWin(
      amountValue,
      americanOdds,
      "american"
    );

    addBet({
      description,
      betAmount: amountValue,
      odds: americanOdds,
      date: new Date(date).toISOString(),
      outcome,
      profitLoss: outcome === "win" ? profitLoss : -amountValue,
      category: category || undefined,
      tipster: tipster || undefined, // Agrega el tipster al objeto de la apuesta
    });

    resetForm();
    onClose();
  };

  // Resetea el formulario
  const resetForm = () => {
    setDescription("");
    setBetAmount("");
    setOdds("");
    setDate(getCurrentDateTime());
    setOutcome("pending");
    setCategory("");
    setTipster(""); // Resetea el campo Tipster
    setPotentialWin(null);
  };

  // Si el formulario no está abierto, no renderiza nada
  if (!isOpen) return null;

  // Renderiza el formulario modal
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="betFormTitle"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl transform transition-all">
        {/* Encabezado del formulario */}
        <div className="flex justify-between items-center mb-4">
          <h2
            id="betFormTitle"
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            {t("common.addBet")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label={t("betForm.close")}
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Campo de Tipster */}
            <div>
              <label
                htmlFor="tipster"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Tipster
              </label>
              <input
                type="text"
                id="tipster"
                value={tipster}
                onChange={(e) => setTipster(e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., John Doe"
              />
            </div>

            {/* Campo de descripción */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t("betForm.description")}
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:bg-gray-700 dark:text-white ${
                  errors.description
                    ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                    : ""
                }`}
                placeholder="e.g., Lakers vs. Celtics - Lakers to win"
                aria-invalid={!!errors.description}
                aria-describedby="descriptionError"
              />
              {errors.description && (
                <p
                  id="descriptionError"
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {errors.description}
                </p>
              )}
            </div>

            {/* Campos de monto y probabilidades */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <label
                  htmlFor="betAmount"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t("betForm.betAmount")}
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
                      errors.betAmount
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : ""
                    }`}
                    placeholder="100.00"
                    aria-invalid={!!errors.betAmount}
                    aria-describedby="betAmountError"
                  />
                </div>
                {errors.betAmount && (
                  <p
                    id="betAmountError"
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                  >
                    {errors.betAmount}
                  </p>
                )}
              </div>

              <div className="flex-1">
                <label
                  htmlFor="odds"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t("betForm.odds")}
                </label>
                <input
                  type="text"
                  id="odds"
                  value={odds}
                  onChange={(e) => setOdds(e.target.value)}
                  className={`w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:bg-gray-700 dark:text-white ${
                    errors.odds
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                      : ""
                  }`}
                  placeholder={
                    oddsFormat === "american"
                      ? "+150 or -110"
                      : oddsFormat === "decimal"
                      ? "2.50"
                      : "3/2"
                  }
                  aria-invalid={!!errors.odds}
                  aria-describedby="oddsError"
                />
                {errors.odds && (
                  <p
                    id="oddsError"
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                  >
                    {errors.odds}
                  </p>
                )}
              </div>
            </div>

            {/* Ganancias potenciales */}
            {potentialWin !== null && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t("betForm.potentialWin")}:{" "}
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    ${potentialWin.toFixed(2)}
                  </span>
                </p>
              </div>
            )}

            {/* Campo de fecha */}
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t("betForm.date")}
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:bg-gray-700 dark:text-white ${
                    errors.date
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                      : ""
                  }`}
                  aria-invalid={!!errors.date}
                  aria-describedby="dateError"
                />
              </div>
              {errors.date && (
                <p
                  id="dateError"
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {errors.date}
                </p>
              )}
            </div>

            {/* Campo de resultado */}
            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("betForm.outcome")}
              </span>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="outcome"
                    value="win"
                    checked={outcome === "win"}
                    onChange={() => setOutcome("win")}
                    className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    aria-labelledby="winLabel"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {t("betForm.win")}
                  </span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="outcome"
                    value="loss"
                    checked={outcome === "loss"}
                    onChange={() => setOutcome("loss")}
                    className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                    aria-labelledby="lossLabel"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {t("betForm.loss")}
                  </span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="outcome"
                    value="pending"
                    checked={outcome === "pending"}
                    onChange={() => setOutcome("pending")}
                    className="h-4 w-4 text-yellow-600 border-gray-300 focus:ring-yellow-500"
                    aria-labelledby="pendingLabel"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {t("betForm.pending")}
                  </span>
                </label>
              </div>
            </div>

            {/* Campo de categoría */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t("betForm.category")}
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

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {t("betForm.cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {t("betForm.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BetForm;
