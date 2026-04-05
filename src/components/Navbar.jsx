import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const { role, setRole } = useContext(AppContext);

  return (
    <div className="flex justify-between items-center bg-gray-800 p-4 shadow-md">
      <h1 className="text-lg font-semibold">Dashboard</h1>

      <div className="flex items-center gap-2">
        <span className="text-sm mr-2">Role:</span>
        <button
          onClick={() => setRole("viewer")}
          className={`px-3 py-1 rounded-l font-medium transition-all duration-200 ${
            role === "viewer"
              ? "bg-indigo-500 text-white shadow-lg"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Viewer
        </button>
        <button
          onClick={() => setRole("admin")}
          className={`px-3 py-1 rounded-r font-medium transition-all duration-200 ${
            role === "admin"
              ? "bg-indigo-500 text-white shadow-lg"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Admin
        </button>
      </div>
    </div>
  );
};

export default Navbar;