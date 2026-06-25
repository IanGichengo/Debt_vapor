import { useState } from "react";
import AddDebtorModal from "../components/debtors/AddDebtorModal";
import DebtorTable from "../components/debtors/DebtorTable";
import {
  Users,
  Search,
  Download,
  Plus,
  Filter,
} from "lucide-react";

export default function Debtors() {
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Sticky top bar — matches Reports ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-400" />
            <div>
              <h1 className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
                Debtors
              </h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Track and manage all debtor records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add debtor
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

        {/* ── Search + filters ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, email or ID…"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2.5 px-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-colors"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="overdue">Overdue</option>
                <option value="paid">Paid</option>
                <option value="upcoming">Upcoming</option>
              </select>

              <button className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Debtor table ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <DebtorTable refreshKey={refreshKey} />
        </div>

        {/* ── Tips ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Tips for debtor management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Verify contact info",
                body: "Double-check phone numbers and email addresses to ensure you can reach debtors when needed.",
              },
              {
                title: "Add national IDs",
                body: "Include national identification numbers for proper record-keeping and legal compliance.",
              },
              {
                title: "Regular status updates",
                body: "Keep debtor statuses current to reflect payment situations accurately at all times.",
              },
            ].map((tip) => (
              <div key={tip.title} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                  {tip.title}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                  {tip.body}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      <AddDebtorModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
