import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import {
  Home,
  Search,
  FileText,
  Users,
  User,
  CreditCard,
  X,
  Bell,
  Menu,
} from "lucide-react";
import logo from "/Logo-R.png";

export default function Layout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  // console.log(user)

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    navigate("/login");
  };

  // First letter of user's name (fallback = U)
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Home size={18} /> },
    { name: "Students", path: "/student", icon: <User size={18} /> },
    { name: "Applications", path: "/applications", icon: <FileText size={18} /> },
    { name: "Application Tracking", path: "/application-tracking", icon: <FileText size={18} /> },
    { name: "Course Search", path: "/course-search", icon: <Search size={18} /> },
    // { name: "Student Search", path: "/student-search", icon: <Search size={18} /> },
    { name: "My Students", path: "/agent-students", icon: <User size={18} /> },

    user?.role === "SuperAdmin" && {
      name: "Manage Users",
      path: "/manage-users",
      icon: <Users size={18} />,
    },
    user?.role === "SuperAdmin" && {
      name: "Payments",
      path: "/payments",
      icon: <CreditCard size={18} />,
    },
    user?.role === "SuperAdmin" && {
      name: "Offices",
      path: "/offices",
      icon: <CreditCard size={18} />,
    },
  ].filter(Boolean);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top Navbar */}
      <div className="w-full h-16 bg-white shadow-md flex items-center justify-between px-4 sm:px-6 relative">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={toggleSidebar}
          >
            <Menu size={22} />
          </button>
          <img src={logo} alt="Logo" className="h-10 w-auto hidden md:block" />
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <button className="relative p-2 hover:bg-gray-100 rounded-full transition">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User name and Initial Circle */}
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-200 border border-gray-300 text-gray-700 font-semibold">
              {userInitial}
            </div>
            <span className="hidden sm:block font-medium text-gray-700">
              {user?.name || "User"}
            </span>
          </div>


          {/* Logout button */}
          <button
            className="px-2 py-1 rounded-md text-md bg-[#F42222] text-white hover:bg-red-600 transition"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed md:static top-0 left-0 h-screen w-64 bg-gray-100 text-gray-800 flex flex-col shadow-md transform transition-transform z-50
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        >
          <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-300 shadow-3xl">
            <img src={logo} alt="Logo" className="h-10 w-auto" />
            <button onClick={toggleSidebar}>
              <X size={22} />
            </button>
          </div>

          <nav className="flex-1 p-4 mt-2 md:mt-6">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 p-2 rounded-lg transition ${location.pathname === item.path
                        ? "bg-gray-300 text-gray-900"
                        : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                      }`}
                    onClick={toggleSidebar}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
