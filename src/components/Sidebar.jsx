import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-800 p-4 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-indigo-400">FinLedger</h2>

      <ul className="space-y-4">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "block p-2 rounded bg-indigo-600 text-white"
                : "block p-2 rounded hover:bg-gray-700 transition-all"
            }
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              isActive
                ? "block p-2 rounded bg-indigo-600 text-white"
                : "block p-2 rounded hover:bg-gray-700 transition-all"
            }
          >
            Transactions
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/insights"
            className={({ isActive }) =>
              isActive
                ? "block p-2 rounded bg-indigo-600 text-white"
                : "block p-2 rounded hover:bg-gray-700 transition-all"
            }
          >
            Insights
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;