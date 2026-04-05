import { useContext, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  AreaChart,
  Area,
} from "recharts";

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.abs(val));

const isThisMonth = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

const isLastMonth = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
};

const CATEGORY_COLORS = {
  Food: "#F59E0B",
  Rent: "#6366F1",
  Transport: "#22D3EE",
  Entertainment: "#A855F7",
  Shopping: "#EC4899",
  Utilities: "#10B981",
  Other: "#6B7280",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Custom Tooltips ─────────────────────────────────────────────────────────

const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900/95 border border-gray-700/60 rounded-xl px-4 py-3 shadow-2xl backdrop-blur-sm">
      <p className="text-xs text-gray-400 mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
          <span className="text-xs text-gray-300">{p.name}</span>
          <span className="text-xs font-bold text-white ml-auto pl-4">
            ₹{Number(p.value).toLocaleString("en-IN")}
          </span>
        </div>
      ))}
    </div>
  );
};

const AreaTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900/95 border border-indigo-500/30 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-base font-bold text-white">
        ₹{Number(payload[0].value).toLocaleString("en-IN")}
      </p>
    </div>
  );
};

// ─── Financial Health Score ───────────────────────────────────────────────────

const HealthScore = ({ score, label, color }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  const scoreColor =
    score >= 75 ? "#10B981" : score >= 50 ? "#F59E0B" : "#EF4444";
  const scoreBg =
    score >= 75
      ? "from-emerald-500/20 to-teal-500/10 border-emerald-500/25"
      : score >= 50
      ? "from-amber-500/20 to-yellow-500/10 border-amber-500/25"
      : "from-red-500/20 to-rose-500/10 border-red-500/25";
  const verdict =
    score >= 75 ? "Excellent" : score >= 50 ? "Moderate" : "Needs Attention";

  return (
    <div
      className={`relative rounded-2xl p-6 bg-gradient-to-br ${scoreBg} border backdrop-blur-sm flex flex-col items-center justify-center gap-4`}
    >
      <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
        Financial Health Score
      </p>

      {/* Circular progress */}
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 128 128">
          {/* Track */}
          <circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            style={{ transition: "stroke-dasharray 1s ease", filter: `drop-shadow(0 0 6px ${scoreColor}88)` }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
      </div>

      <div className="text-center">
        <p className="font-semibold text-white text-sm">{verdict}</p>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-[160px]">
          {label}
        </p>
      </div>
    </div>
  );
};

// ─── Smart Observation Card ───────────────────────────────────────────────────

const ObservationCard = ({ icon, title, body, type = "neutral" }) => {
  const styles = {
    good: "border-emerald-500/25 bg-emerald-500/5",
    warn: "border-amber-500/25 bg-amber-500/5",
    alert: "border-red-500/25 bg-red-500/5",
    neutral: "border-indigo-500/20 bg-indigo-500/5",
  };
  const iconStyles = {
    good: "bg-emerald-500/15 text-emerald-400",
    warn: "bg-amber-500/15 text-amber-400",
    alert: "bg-red-500/15 text-red-400",
    neutral: "bg-indigo-500/15 text-indigo-400",
  };

  return (
    <div className={`rounded-2xl p-4 border backdrop-blur-sm ${styles[type]} hover:-translate-y-0.5 transition-all duration-200`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl text-base flex-shrink-0 ${iconStyles[type]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-tight">{title}</p>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{body}</p>
        </div>
      </div>
    </div>
  );
};

// ─── Category Row ─────────────────────────────────────────────────────────────

const CategoryRow = ({ name, amount, total, prevAmount, rank }) => {
  const pct = total > 0 ? (amount / total) * 100 : 0;
  const change = prevAmount > 0 ? ((amount - prevAmount) / prevAmount) * 100 : null;
  const color = CATEGORY_COLORS[name] || "#6B7280";

  return (
    <div className="group flex items-center gap-4 py-3 hover:bg-gray-800/30 px-3 rounded-xl transition-all duration-150 cursor-default">
      <span className="text-xs text-gray-600 w-4 font-mono">{rank}</span>
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm text-white font-medium">{name}</span>
          <div className="flex items-center gap-3">
            {change !== null && (
              <span
                className={`text-xs font-medium ${
                  change > 0 ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {change > 0 ? "↑" : "↓"} {Math.abs(change).toFixed(0)}%
              </span>
            )}
            <span className="text-sm font-bold text-white">{fmt(amount)}</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              backgroundColor: color,
              boxShadow: `0 0 6px ${color}66`,
            }}
          />
        </div>
        <span className="text-xs text-gray-500 mt-0.5 inline-block">
          {pct.toFixed(1)}% of expenses
        </span>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Insights = () => {
  const { transactions } = useContext(AppContext);
  const [activeBar, setActiveBar] = useState(null);

  // ── Derived data ────────────────────────────────────────────────────────────

  const derived = useMemo(() => {
    // This month / last month split
    const thisMonthTx = transactions.filter((t) => isThisMonth(t.date));
    const lastMonthTx = transactions.filter((t) => isLastMonth(t.date));

    const sum = (arr, filter) =>
      arr.filter(filter).reduce((a, t) => a + Math.abs(t.amount), 0);

    const tmIncome  = sum(thisMonthTx, (t) => t.amount > 0);
    const tmExpense = sum(thisMonthTx, (t) => t.amount < 0);
    const lmIncome  = sum(lastMonthTx, (t) => t.amount > 0);
    const lmExpense = sum(lastMonthTx, (t) => t.amount < 0);

    const savingsRate = tmIncome > 0
      ? Math.round(((tmIncome - tmExpense) / tmIncome) * 100)
      : 0;

    const expenseChange = lmExpense > 0
      ? ((tmExpense - lmExpense) / lmExpense) * 100
      : 0;

    // Category breakdown — this month vs last month
    const buildCategoryMap = (txList) =>
      txList
        .filter((t) => t.amount < 0)
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
          return acc;
        }, {});

    const tmCategories = buildCategoryMap(thisMonthTx);
    const lmCategories = buildCategoryMap(lastMonthTx);

    const sortedCategories = Object.entries(tmCategories)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({
        name,
        amount,
        prevAmount: lmCategories[name] || 0,
      }));

    const topCategory = sortedCategories[0] || null;

    // Monthly comparison chart — last 6 months
    const now = new Date();
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      const monthTx = transactions.filter((t) => {
        const td = new Date(t.date);
        return td.getMonth() === month && td.getFullYear() === year;
      });
      return {
        name: MONTHS[month],
        Income: sum(monthTx, (t) => t.amount > 0),
        Expenses: sum(monthTx, (t) => t.amount < 0),
      };
    });

    // Net cash flow trend (cumulative running balance)
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    let running = 0;
    const cashFlowData = sorted.map((t) => {
      running += t.amount;
      return {
        name: new Date(t.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        balance: running,
      };
    });

    // Spending by day of week
    const daySpend = Array(7).fill(0);
    transactions.filter((t) => t.amount < 0).forEach((t) => {
      const day = new Date(t.date).getDay();
      daySpend[day] += Math.abs(t.amount);
    });
    const weekData = DAYS.map((d, i) => ({ day: d, amount: daySpend[i] }));
    const peakDay = weekData.reduce((a, b) => (a.amount > b.amount ? a : b), weekData[0]);

    // Top 5 transactions this month by absolute value
    const topTransactions = [...thisMonthTx]
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, 5);

    // Health score (simple formula)
    let score = 50;
    if (savingsRate >= 30) score += 20;
    else if (savingsRate >= 15) score += 10;
    if (expenseChange < 0) score += 15;
    if (tmIncome > tmExpense) score += 15;
    score = Math.min(100, Math.max(0, score));

    const healthLabel =
      score >= 75
        ? "Strong savings rate and controlled spending."
        : score >= 50
        ? "Decent balance, room to improve savings."
        : "Expenses are high relative to income.";

    // Smart observations
    const observations = [];

    if (expenseChange < 0) {
      observations.push({
        type: "good",
        icon: "📉",
        title: `You spent ${fmt(lmExpense - tmExpense)} less than last month`,
        body: `Expenses dropped ${Math.abs(expenseChange).toFixed(0)}% month-over-month. Keep this momentum going.`,
      });
    } else if (expenseChange > 20) {
      observations.push({
        type: "alert",
        icon: "⚠️",
        title: `Spending jumped ${expenseChange.toFixed(0)}% vs last month`,
        body: `Your expenses rose significantly. ${topCategory ? `${topCategory.name} was the biggest driver.` : "Review your recent transactions."}`,
      });
    }

    if (savingsRate >= 30) {
      observations.push({
        type: "good",
        icon: "💰",
        title: `Saving ${savingsRate}% of income — above the 30% benchmark`,
        body: "You're in the top tier of savers. Consider putting the surplus into a goal or investment.",
      });
    } else if (savingsRate < 10 && tmIncome > 0) {
      observations.push({
        type: "warn",
        icon: "💡",
        title: `Only saving ${savingsRate}% of income this month`,
        body: "Financial advisors recommend saving at least 20–30% of monthly income. Review discretionary expenses.",
      });
    }

    if (topCategory) {
      const topPct = tmExpense > 0 ? (topCategory.amount / tmExpense) * 100 : 0;
      if (topPct > 40) {
        observations.push({
          type: "warn",
          icon: "🔍",
          title: `${topCategory.name} is consuming ${topPct.toFixed(0)}% of your budget`,
          body: "A single category taking more than 40% of expenses is worth examining closely.",
        });
      }
    }

    if (peakDay && peakDay.amount > 0) {
      observations.push({
        type: "neutral",
        icon: "📅",
        title: `You spend most on ${peakDay.day}days`,
        body: "Knowing your peak spending day helps you plan ahead and avoid impulse purchases.",
      });
    }

    return {
      tmIncome, tmExpense, lmExpense,
      savingsRate, expenseChange,
      sortedCategories, topCategory,
      monthlyData, cashFlowData, weekData, peakDay,
      topTransactions, score, healthLabel,
      observations: observations.slice(0, 3),
    };
  }, [transactions]);

  const hasData = transactions.length > 0;

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl mb-4">
          📊
        </div>
        <p className="text-white font-semibold text-lg mb-2">No data to analyse yet</p>
        <p className="text-gray-400 text-sm max-w-xs">
          Add some transactions first and your insights will appear here automatically.
        </p>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Insights</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            What your data is telling you this month
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
          <span className="text-purple-400 text-xs">✦</span>
          <span className="text-xs text-purple-400 font-medium">Auto-generated</span>
        </div>
      </div>

      {/* ── Row 1: Health Score + Observations ── */}
      <div className="grid grid-cols-12 gap-4">

        {/* Health Score */}
        <div className="col-span-3">
          <HealthScore
            score={derived.score}
            label={derived.healthLabel}
          />
        </div>

        {/* Smart Observations */}
        <div className="col-span-9 flex flex-col gap-3 justify-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold px-1">
            Smart Observations
          </p>
          {derived.observations.length > 0 ? (
            derived.observations.map((obs, i) => (
              <ObservationCard key={i} {...obs} />
            ))
          ) : (
            <ObservationCard
              type="neutral"
              icon="✦"
              title="Everything looks balanced"
              body="Your income and expenses are in a healthy ratio. Keep tracking to get more detailed observations."
            />
          )}
        </div>
      </div>

      {/* ── Row 2: Monthly Income vs Expense + Cash Flow ── */}
      <div className="grid grid-cols-12 gap-4">

        {/* Monthly Comparison Bar Chart */}
        <div className="col-span-7 rounded-2xl bg-gray-900/50 border border-gray-700/40 backdrop-blur-sm p-5 hover:border-indigo-500/25 transition-all duration-300">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Income vs Expenses
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Month-over-month comparison</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
                <span className="text-xs text-gray-400">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                <span className="text-xs text-gray-400">Expenses</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={derived.monthlyData}
              barCategoryGap="30%"
              barGap={4}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#6B7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6B7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                width={42}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="Income" fill="#6366F1" radius={[4, 4, 0, 0]}>
                {derived.monthlyData.map((_, i) => (
                  <Cell
                    key={i}
                    fill="#6366F1"
                    fillOpacity={activeBar === i ? 1 : 0.75}
                    onMouseEnter={() => setActiveBar(i)}
                    onMouseLeave={() => setActiveBar(null)}
                  />
                ))}
              </Bar>
              <Bar dataKey="Expenses" fill="#F43F5E" radius={[4, 4, 0, 0]}>
                {derived.monthlyData.map((_, i) => (
                  <Cell
                    key={i}
                    fill="#F43F5E"
                    fillOpacity={activeBar === i ? 1 : 0.65}
                    onMouseEnter={() => setActiveBar(i)}
                    onMouseLeave={() => setActiveBar(null)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cash Flow Trend */}
        <div className="col-span-5 rounded-2xl bg-gray-900/50 border border-gray-700/40 backdrop-blur-sm p-5 hover:border-emerald-500/20 transition-all duration-300">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-white">Running Balance</h2>
            <p className="text-xs text-gray-500 mt-0.5">Cumulative cash flow over time</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={derived.cashFlowData}
              margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: "#6B7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                width={42}
              />
              <Tooltip content={<AreaTooltip />} cursor={{ stroke: "rgba(16,185,129,0.3)", strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#cashGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#10B981", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 3: Category Breakdown + Weekly Pattern + Top Transactions ── */}
      <div className="grid grid-cols-12 gap-4">

        {/* Category Breakdown — col-span-5 */}
        <div className="col-span-5 rounded-2xl bg-gray-900/50 border border-gray-700/40 backdrop-blur-sm p-5 hover:border-purple-500/20 transition-all duration-300">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-sm font-semibold text-white">Spending by Category</h2>
              <p className="text-xs text-gray-500 mt-0.5">This month vs last month</p>
            </div>
            {derived.topCategory && (
              <span className="text-xs px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
                🏆 {derived.topCategory.name}
              </span>
            )}
          </div>

          {derived.sortedCategories.length > 0 ? (
            <div className="mt-2">
              {derived.sortedCategories.map((cat, i) => (
                <CategoryRow
                  key={cat.name}
                  {...cat}
                  total={derived.tmExpense}
                  rank={i + 1}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-10 text-gray-500 text-sm">
              No expense data this month
            </div>
          )}
        </div>

        {/* Weekly Spending Pattern — now wider, col-span-7 */}
        <div className="col-span-7 rounded-2xl bg-gray-900/50 border border-gray-700/40 backdrop-blur-sm p-5 hover:border-cyan-500/20 transition-all duration-300">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white">Spending by Day of Week</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Peak day:{" "}
              <span className="text-cyan-400 font-medium">
                {derived.peakDay?.day || "—"}
              </span>
            </p>
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={derived.weekData}
              margin={{ top: 0, right: 0, left: -10, bottom: 0 }}
            >
              <XAxis
                dataKey="day"
                tick={{ fill: "#6B7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                hide
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-gray-900/95 border border-gray-700/60 rounded-xl px-3 py-2 shadow-xl">
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-bold text-white">
                        ₹{Number(payload[0].value).toLocaleString("en-IN")}
                      </p>
                    </div>
                  );
                }}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {derived.weekData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.day === derived.peakDay?.day
                        ? "#22D3EE"
                        : "rgba(99,102,241,0.45)"
                    }
                    style={{
                      filter:
                        entry.day === derived.peakDay?.day
                          ? "drop-shadow(0 0 6px #22D3EE66)"
                          : "none",
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {derived.weekData
              .filter((d) => d.amount > 0)
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 3)
              .map((d, i) => (
                <span
                  key={d.day}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                    i === 0
                      ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
                      : "bg-gray-700/40 text-gray-400 border border-gray-700/40"
                  }`}
                >
                  {d.day}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* ── Row 4: Biggest Transactions This Month — full width table ── */}
      <div className="rounded-2xl bg-gray-900/50 border border-gray-700/40 backdrop-blur-sm overflow-hidden">

        {/* Table Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/40">
          <div>
            <h2 className="text-sm font-semibold text-white">Biggest Transactions This Month</h2>
            <p className="text-xs text-gray-500 mt-0.5">Ranked by transaction value</p>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            {derived.topTransactions.length} transactions
          </span>
        </div>

        {/* Column Labels */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-700/30 bg-gray-800/20">
          <span className="col-span-1 text-xs uppercase tracking-wider text-gray-500 font-semibold">#</span>
          <span className="col-span-4 text-xs uppercase tracking-wider text-gray-500 font-semibold">Description</span>
          <span className="col-span-2 text-xs uppercase tracking-wider text-gray-500 font-semibold">Counterparty</span>
          <span className="col-span-2 text-xs uppercase tracking-wider text-gray-500 font-semibold">Date</span>
          <span className="col-span-2 text-xs uppercase tracking-wider text-gray-500 font-semibold">Category</span>
          <span className="col-span-1 text-xs uppercase tracking-wider text-gray-500 font-semibold text-right">Amount</span>
        </div>

        {/* Rows */}
        {derived.topTransactions.length > 0 ? (
          <div className="divide-y divide-gray-700/25">
            {derived.topTransactions.map((t, i) => {
              const isIncome = t.amount > 0;
              const initial  = (t.description?.[0] || "?").toUpperCase();
              const avatarBg = isIncome
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-indigo-500/15 text-indigo-300";

              return (
                <div
                  key={t.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-800/35 transition-all duration-150 items-center group"
                >
                  {/* Rank */}
                  <div className="col-span-1">
                    <span className="text-sm font-mono text-gray-500 group-hover:text-gray-400 transition-colors">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Description with initial avatar */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarBg}`}>
                      {initial}
                    </div>
                    <p className="text-sm font-medium text-white truncate">{t.description}</p>
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

                  {/* Category — plain text */}
                  <div className="col-span-2">
                    <p className="text-sm text-gray-400">{t.category}</p>
                  </div>

                  {/* Amount */}
                  <div className="col-span-1 text-right">
                    <span
                      className={`text-sm font-bold whitespace-nowrap ${
                        isIncome ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {isIncome ? "+" : "−"}&#8239;{fmt(t.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-800/60 border border-gray-700/40 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
              </svg>
            </div>
            <p className="text-sm text-white font-medium mb-1">No transactions this month</p>
            <p className="text-xs text-gray-500">Add transactions to see them ranked here</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Insights;