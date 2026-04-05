import { createContext, useState, useEffect } from "react";
import { transactionsData } from "../data/transactions";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {

  const [transactions, setTransactions] = useState(() => {
    try {
      const stored = localStorage.getItem("transactions");
      return stored ? JSON.parse(stored) : transactionsData;
    } catch (error) {
      console.error("Error reading localStorage:", error);
      return transactionsData;
    }
  });

  const [role, setRole] = useState("viewer");

  // sync with local storage
  useEffect(() => {
    try {
      localStorage.setItem("transactions", JSON.stringify(transactions));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [transactions]);

  return (
    <AppContext.Provider
      value={{
        transactions,
        setTransactions,
        role,
        setRole,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};