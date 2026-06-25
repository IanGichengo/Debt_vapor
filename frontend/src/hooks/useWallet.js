import { useState, useCallback } from "react";
import {
  fetchWallet,
  fetchTransactions,
  requestWithdrawal as apiRequestWithdrawal,
  fetchWithdrawals,
} from "../services/accountApi";

/**
 * useWallet
 *
 * Manages wallet state for the My Account page:
 * - loadWallet()         → balance + full transaction list
 * - loadTransactions()   → paginated ledger (for the table)
 * - submitWithdrawal()   → POST a withdrawal request
 * - loadWithdrawals()    → fetch this user's withdrawal history
 */
export function useWallet() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState(null);

  // ============================================
  // LOAD WALLET SUMMARY
  // ============================================

  const loadWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWallet();
      setWallet(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // LOAD PAGINATED TRANSACTIONS
  // ============================================

  const loadTransactions = useCallback(async (page = 1, limit = 10) => {
    setTxLoading(true);
    setError(null);
    try {
      const { transactions: rows, pagination: meta } = await fetchTransactions(
        page,
        limit
      );
      setTransactions(rows);
      setPagination(meta);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setTxLoading(false);
    }
  }, []);

  // ============================================
  // SUBMIT WITHDRAWAL REQUEST
  // ============================================

  const submitWithdrawal = useCallback(
    async ({ amount, phone, reason }) => {
      setWithdrawing(true);
      setError(null);
      try {
        const record = await apiRequestWithdrawal({ amount, phone, reason });
        // Optimistically prepend to withdrawal history
        setWithdrawals((prev) => [record, ...prev]);
        // Refresh wallet balance to reflect the pending hold
        await loadWallet();
        return { success: true };
      } catch (err) {
        const msg = err.response?.data?.message || err.message;
        setError(msg);
        return { success: false, message: msg };
      } finally {
        setWithdrawing(false);
      }
    },
    [loadWallet]
  );

  // ============================================
  // LOAD WITHDRAWAL HISTORY
  // ============================================

  const loadWithdrawals = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchWithdrawals();
      setWithdrawals(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }, []);

  return {
    wallet,
    transactions,
    pagination,
    withdrawals,
    loading,
    txLoading,
    withdrawing,
    error,
    loadWallet,
    loadTransactions,
    submitWithdrawal,
    loadWithdrawals,
  };
}
