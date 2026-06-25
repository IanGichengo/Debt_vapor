import api from "./api";

// ======================
// GET ALL DEBTORS
// ======================
export const getDebtors = async (params = {}) => {
  try {
    // You can now pass params like { page: 1, search: 'John' }
    const res = await api.get("/debtors", { params });
    
    // Accessing the specific path we defined in the new Controller
    return res.data?.data?.debtors || []; 
  } catch (error) {
    console.error("Failed to load debtors", error);
    return [];
  }
};

// ======================
// GET SINGLE DEBTOR BY ID
// ======================
export const getDebtorById = async (id) => {
  if (!id) throw new Error("Debtor ID is required");
  const res = await api.get(`/debtors/${id}`); // ✅ FIXED: Using parentheses instead of backticks
  return res.data?.data?.debtor || res.data?.data || res.data;
};

// ======================
// CREATE DEBTOR
// ======================
export const createDebtor = async (payload) => {
  const res = await api.post("/debtors", payload);
  return res.data;
};

// ======================
// UPDATE DEBTOR
// ======================
export const updateDebtor = async (id, payload) => {
  if (!id) throw new Error("Debtor ID is required");
  const res = await api.put(`/debtors/${id}`, payload);
  return res.data?.data?.debtor || res.data?.data || res.data;
};

// ======================
// DELETE DEBTOR
// ======================
export const deleteDebtor = async (id) => {
  if (!id) throw new Error("Debtor ID is required");
  const res = await api.delete(`/debtors/${id}`);
  return res.data;
};

// ======================
// CHAT HISTORY
// ======================
export const getChatHistory = async (debtorId) => {
  const res = await api.get(`/debtors/${debtorId}/chats`); // ✅ FIXED: Using parentheses instead of backticks
  return res.data?.data || [];
};

// ======================
// SEARCH DEBTORS
// ======================
export const searchDebtors = async (query) => {
  try {
    const res = await api.get("/debtors", { params: { search: query } });
    return res.data?.data?.debtors || [];
  } catch (error) {
    console.error("Failed to search debtors", error);
    return [];
  }
};

// ======================
// GET DEBTOR STATISTICS
// ======================
export const getDebtorStats = async () => {
  try {
    const res = await api.get("/debtors/stats");
    return res.data?.data || res.data;
  } catch (error) {
    console.error("Failed to load debtor stats", error);
    return null;
  }
};
