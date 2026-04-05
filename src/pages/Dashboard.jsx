import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import Charts from "../components/Charts";

const Dashboard = () => {
  const { transactions } = useContext(AppContext);

  const income = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const balance = income - expenses;
  const savingsRate =
    income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  const cards = [
    {
      label: "Total Balance",
      value: formatCurrency(balance),
      change: "+12%",
      positive: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
        </svg>
      ),
      gradient: "from-indigo-500/20 to-purple-500/10",
      border: "border-indigo-500/25",
      glow: "hover:shadow-[0_0_30px_rgba(99,102,241,0.25)]",
      iconBg: "bg-indigo-500/20 text-indigo-400",
      valueColor: "text-white",
    },
    {
      label: "Total Income",
      value: formatCurrency(income),
      change: "+9%",
      positive: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
        </svg>
      ),
      gradient: "from-emerald-500/20 to-teal-500/10",
      border: "border-emerald-500/25",
      glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]",
      iconBg: "bg-emerald-500/20 text-emerald-400",
      valueColor: "text-emerald-400",
    },
    {
      label: "Total Expenses",
      value: formatCurrency(expenses),
      change: "-23%",
      positive: false,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" />
        </svg>
      ),
      gradient: "from-red-500/20 to-rose-500/10",
      border: "border-red-500/25",
      glow: "hover:shadow-[0_0_30px_rgba(239,68,68,0.25)]",
      iconBg: "bg-red-500/20 text-red-400",
      valueColor: "text-red-400",
    },
    {
      label: "Savings Rate",
      value: `${savingsRate}%`,
      change: "of income",
      positive: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      gradient: "from-amber-500/20 to-yellow-500/10",
      border: "border-amber-500/25",
      glow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.25)]",
      iconBg: "bg-amber-500/20 text-amber-400",
      valueColor: "text-amber-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Your financial snapshot at a glance
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Live</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`
              relative overflow-hidden rounded-2xl p-5
              bg-gradient-to-br ${card.gradient}
              border ${card.border}
              backdrop-blur-sm
              transition-all duration-300 cursor-default
              ${card.glow}
              hover:-translate-y-0.5
            `}
          >
            {/* Subtle background orb */}
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/3 blur-2xl" />

            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded-xl ${card.iconBg}`}>
                {card.icon}
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  card.positive
                    ? "text-emerald-400 bg-emerald-400/10"
                    : "text-red-400 bg-red-400/10"
                }`}
              >
                {card.positive ? "↑" : "↓"} {card.change}
              </div>
            </div>

            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">
              {card.label}
            </p>
            <p className={`text-2xl font-bold tracking-tight ${card.valueColor}`}>
              {card.value}
            </p>

            {/* Bottom accent line */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r ${card.gradient} opacity-60`}
            />
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <Charts />
    </div>
  );
};

export default Dashboard;