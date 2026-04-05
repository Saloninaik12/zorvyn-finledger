import { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";

// Category badge colors only — no icons
const CATEGORY_CONFIG = {
  Food:        "text-orange-400 bg-orange-400/10 border-orange-400/20",
  Travel:      "text-sky-400 bg-sky-400/10 border-sky-400/20",
  Utilities:   "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  Shopping:    "text-pink-400 bg-pink-400/10 border-pink-400/20",
  Income:      "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Other:       "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

const getCategoryColor = (cat) =>
  CATEGORY_CONFIG[cat] || CATEGORY_CONFIG["Other"];

// Deterministic muted color for the initial avatar based on description
const AVATAR_COLORS = [
  "bg-indigo-500/20 text-indigo-300",
  "bg-purple-500/20 text-purple-300",
  "bg-cyan-500/20 text-cyan-300",
  "bg-emerald-500/20 text-emerald-300",
  "bg-rose-500/20 text-rose-300",
  "bg-amber-500/20 text-amber-300",
];

const getAvatarColor = (str = "") => {
  const code = str.charCodeAt(0) || 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

const CATEGORIES = ["Food", "Travel", "Utilities", "Shopping", "Other"];

const inputClass =
  "w-full px-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700/60 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200";

const Transactions = () => {
  const { transactions, setTransactions, role } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // newest first

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense",
    category: "",
    date: "",
    counterparty: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("transactions");
    if (stored) setTransactions(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setFormData({ description: "", amount: "", type: "expense", category: "", date: "", counterparty: "" });
    setEditId(null);
  };

  const handleSubmit = () => {
    if (!formData.description || !formData.amount || !formData.date || !formData.category) {
      toast.error("Please fill all required fields");
      return;
    }

    const tx = {
      id: editId || Date.now(),
      description: formData.description,
      amount:
        formData.type === "expense"
          ? -Math.abs(Number(formData.amount))
          : Math.abs(Number(formData.amount)),
      category: formData.category,
      date: formData.date,
      counterparty: formData.counterparty || "—",
    };

    if (editId) {
      setTransactions(transactions.map((t) => (t.id === editId ? tx : t)));
      toast.success("Transaction updated");
    } else {
      setTransactions([tx, ...transactions]);
      toast.success("Transaction added");
    }

    resetForm();
    setShowModal(false);
  };

  const handleEdit = (t) => {
    setFormData({
      description: t.description,
      amount: Math.abs(t.amount),
      type: t.amount > 0 ? "income" : "expense",
      category: t.category,
      date: t.date,
      counterparty: t.counterparty || "",
    });
    setEditId(t.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
    toast.success("Transaction deleted");
  };

  // Filtering + sorting
  const filtered = transactions
    .filter((t) => {
      const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
        (t.counterparty || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "all" || t.category.toLowerCase() === category.toLowerCase();
      const matchType =
        type === "all" ||
        (type === "income" && t.amount > 0) ||
        (type === "expense" && t.amount < 0);

      const today = new Date();
      const tDate = new Date(t.date);
      let matchDate = true;
      if (dateFilter === "thisMonth") {
        matchDate =
          tDate.getMonth() === today.getMonth() &&
          tDate.getFullYear() === today.getFullYear();
      }
      if (dateFilter === "lastMonth") {
        const lm = new Date(today);
        lm.setMonth(today.getMonth() - 1);
        matchDate =
          tDate.getMonth() === lm.getMonth() &&
          tDate.getFullYear() === lm.getFullYear();
      }

      return matchSearch && matchCat && matchType && matchDate;
    })
    .sort((a, b) => {
      if (sortOrder === "desc") return new Date(b.date) - new Date(a.date);
      if (sortOrder === "asc") return new Date(a.date) - new Date(b.date);
      if (sortOrder === "highest") return Math.abs(b.amount) - Math.abs(a.amount);
      if (sortOrder === "lowest") return Math.abs(a.amount) - Math.abs(b.amount);
      return 0;
    });

  const selectClass =
    "px-3 py-2 rounded-xl bg-gray-800/80 border border-gray-700/50 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-200 cursor-pointer hover:border-gray-600";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        {role === "admin" && (
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white
              bg-gradient-to-r from-indigo-600 to-purple-600
              hover:from-indigo-500 hover:to-purple-500
              shadow-lg shadow-indigo-500/20
              hover:shadow-indigo-500/40
              hover:-translate-y-0.5 hover:scale-[1.02]
              active:scale-95
              transition-all duration-200 cursor-pointer"
          >
            <span className="text-lg leading-none">+</span>
            Add Transaction
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-gray-900/50 border border-gray-700/40 backdrop-blur-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-800/80 border border-gray-700/50 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-200"
          />
        </div>

        <select className={selectClass} value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
          <option value="all">All Time</option>
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
        </select>

        <select className={selectClass} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className={selectClass} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select className={selectClass} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
          <option value="highest">Highest Amount</option>
          <option value="lowest">Lowest Amount</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-gray-900/50 border border-gray-700/40 backdrop-blur-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-700/50 bg-gray-800/30">
          <span className="col-span-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">Transaction</span>
          <span className="col-span-2 text-xs uppercase tracking-wider text-gray-500 font-semibold">Counterparty</span>
          <span className="col-span-2 text-xs uppercase tracking-wider text-gray-500 font-semibold">Date</span>
          <span className="col-span-2 text-xs uppercase tracking-wider text-gray-500 font-semibold">Category</span>
          <span className="col-span-1 text-xs uppercase tracking-wider text-gray-500 font-semibold text-right">Amount</span>
          {role === "admin" && (
            <span className="col-span-1 text-xs uppercase tracking-wider text-gray-500 font-semibold text-right">Actions</span>
          )}
        </div>

        {/* Table Body */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-800/60 border border-gray-700/40 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <p className="text-white font-medium mb-1">No transactions found</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700/30">
            {filtered.map((t) => {
              const categoryColor = getCategoryColor(t.category);
              const avatarColor  = getAvatarColor(t.description);
              const initial      = (t.description?.[0] || "?").toUpperCase();
              const isIncome     = t.amount > 0;
              return (
                <div
                  key={t.id}
                  className="grid grid-cols-12 gap-4 px-5 py-4 hover:bg-gray-800/40 transition-all duration-150 group items-center"
                >
                  {/* Description */}
                  <div className="col-span-4 flex items-center gap-3">
                    {/* Initial avatar — professional, no emoji */}
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0 ${avatarColor}`}
                    >
                      {initial}
                    </div>
                    <p className="text-sm font-medium text-white leading-tight truncate">
                      {t.description}
                    </p>
                  </div>

                  {/* Counterparty */}
                  <div className="col-span-2">
                    <p className="text-sm text-gray-400 truncate">{t.counterparty || "—"}</p>
                  </div>

                  {/* Date */}
                  <div className="col-span-2">
                    <p className="text-sm text-gray-400">
                      {new Date(t.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Category — plain text, no badge */}
                  <div className="col-span-2">
                    <span className="text-sm text-gray-400">
                      {t.category}
                    </span>
                  </div>

                  {/* Amount — nowrap keeps sign and number on one line */}
                  <div className="col-span-1 text-right">
                    <span
                      className={`text-sm font-bold whitespace-nowrap ${isIncome ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {isIncome ? "+" : "−"}&#8239;₹{Math.abs(t.amount).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Admin Actions */}
                  {role === "admin" && (
                    <div className="col-span-1 flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <button
                        onClick={() => handleEdit(t)}
                        className="p-1.5 rounded-lg text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 border border-blue-400/20 transition-all duration-150"
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded-lg text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 transition-all duration-150"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => { setShowModal(false); resetForm(); }}
          />

          {/* Modal Panel */}
          <div className="relative w-full max-w-md rounded-2xl bg-gray-900 border border-gray-700/60 shadow-2xl shadow-black/50 p-6 animate-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editId ? "Edit Transaction" : "New Transaction"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editId ? "Update the transaction details" : "Fill in the details below"}
                </p>
              </div>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-150 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Description *</label>
                <input
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="e.g. Grocery run, Freelance payment"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Amount (₹) *</label>
                  <input
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    type="number"
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Type *</label>
                  <select name="type" value={formData.type} onChange={handleChange} className={inputClass}>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Category *</label>
                  <input
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g. Food, Travel, Rent, etc."
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Date *</label>
                  <input
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    type="date"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Counterparty</label>
                <input
                  name="counterparty"
                  value={formData.counterparty}
                  onChange={handleChange}
                  placeholder="e.g. Amazon, Employer Ltd"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 bg-gray-800/60 border border-gray-700/50 hover:bg-gray-700/60 transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                  bg-gradient-to-r from-indigo-600 to-purple-600
                  hover:from-indigo-500 hover:to-purple-500
                  shadow-lg shadow-indigo-500/20
                  hover:shadow-indigo-500/30
                  transition-all duration-200 cursor-pointer"
              >
                {editId ? "Update" : "Add Transaction"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;