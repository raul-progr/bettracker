import React, { useState } from "react";
import useStore from "../store/betStore";

// Props del componente InitialBankrollDialog
interface InitialBankrollDialogProps {
  isOpen: boolean; // Indica si el diálogo está abierto
  onClose: () => void; // Función para cerrar el diálogo
}

// Componente principal
const InitialBankrollDialog: React.FC<InitialBankrollDialogProps> = ({
  isOpen,
  onClose,
}) => {
  // Acceso al estado global para el bankroll inicial
  const { initialBankroll, setInitialBankroll } = useStore();

  // Estado local para manejar el monto ingresado y los errores
  const [amount, setAmount] = useState(initialBankroll.toString());
  const [error, setError] = useState("");

  // Maneja el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Intenta convertir el monto ingresado a un número
    const parsedAmount = parseFloat(amount);

    // Validación: verifica que el monto sea un número positivo
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid positive amount");
      return;
    }

    // Actualiza el bankroll inicial en el estado global
    setInitialBankroll(parsedAmount);

    // Cierra el diálogo
    onClose();
  };

  // Si el diálogo no está abierto, no renderiza nada
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="initialBankrollTitle"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl transform transition-all">
        {/* Título del diálogo */}
        <h2
          id="initialBankrollTitle"
          className="text-2xl font-bold mb-4 text-gray-900 dark:text-white"
        >
          Set Initial Bankroll
        </h2>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {/* Campo para ingresar el monto */}
          <div className="mb-4">
            <label
              htmlFor="bankroll"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Initial Bankroll Amount
            </label>
            <div className="relative">
              {/* Símbolo de dólar */}
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">
                $
              </span>
              <input
                type="text"
                id="bankroll"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value); // Actualiza el monto ingresado
                  setError(""); // Limpia el error al cambiar el valor
                }}
                className={`pl-8 w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 dark:bg-gray-700 dark:text-white dark:focus:ring-green-700 ${
                  error ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="1000.00"
                aria-invalid={!!error}
                aria-describedby="bankrollError"
              />
            </div>
            {/* Mensaje de error */}
            {error && (
              <p
                id="bankrollError"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              >
                {error}
              </p>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 mt-6">
            {/* Botón para cancelar */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800"
            >
              Cancel
            </button>
            {/* Botón para guardar */}
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InitialBankrollDialog;
