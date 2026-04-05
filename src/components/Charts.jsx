import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";

const Charts = () => {
  const { transactions } = useContext(AppContext);
  const [activeIndex, setActiveIndex] = useState(null);

  // Prepare monthly data
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  const lineData = months.map((month) => {
    // Filter transactions for this month (assuming transactions have a 'month' property)
    const monthlyTransactions = transactions.filter((t) => t.month === month);

    const income = monthlyTransactions
      .filter((t) => t.amount > 0)
      .reduce((acc, t) => acc + t.amount, 0);

    const expenses = monthlyTransactions
      .filter((t) => t.amount < 0)
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    const balance = income - expenses;
    const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

    return { name: month, income, expenses, balance, savingsRate };
  });

  const pieData = [
    { name: "Food", value: 32 },
    { name: "Rent", value: 28 },
    { name: "Transport", value: 18 },
    { name: "Entertainment", value: 12 },
    { name: "Other", value: 10 },
  ];

  const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#A855F7"];

  return (
    <div className="grid grid-cols-2 gap-6 mt-6">
      {/* Multi-line chart for monthly metrics */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="mb-4">Monthly Financial Metrics</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "none", color: "#fff" }}
            />
            <Legend />
            <Line type="monotone" dataKey="balance" stroke="#6366F1" strokeWidth={2} />
            <Line type="monotone" dataKey="income" stroke="#22C55E" strokeWidth={2} />
            <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} />
            <Line type="monotone" dataKey="savingsRate" stroke="#F59E0B" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie chart remains the same */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="mb-4">Spending Breakdown</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              innerRadius={60}
              outerRadius={100}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index]}
                  style={{
                    filter:
                      index === activeIndex
                        ? "drop-shadow(0 0 10px rgba(255,255,255,0.8))"
                        : "none",
                    transition: "all 0.3s",
                  }}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;