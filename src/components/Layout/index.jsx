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
  KeyRound,
  Lock,
  ChevronDown,
} from "lucide-react";
import logo from "/Logo-R.png";
import PasswordResetModal from "../PasswordResetModal";

export default function Layout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);
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

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-200 border border-gray-300 text-gray-700 font-semibold">
                {userInitial}
              </div>
              <span className="hidden sm:block font-medium text-gray-700">
                {user?.name || "User"}
              </span>
              <ChevronDown size={18} className="text-gray-600" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.name || "User"}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
                  <p className="text-xs text-gray-400 mt-1 capitalize">{user?.role || ""}</p>
                </div>
                
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsPasswordResetModalOpen(true);
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                  >
                    <KeyRound size={18} className="text-blue-600" />
                    Reset Password
                  </button>
                </div>

                <div className="border-t border-gray-200 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <Lock size={18} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
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

      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={isPasswordResetModalOpen}
        onClose={() => setIsPasswordResetModalOpen(false)}
        userId={user?._id}
      />

      {/* Click outside to close dropdown */}
      {isProfileDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setProfileDropdownOpen(false)}
        />
      )}
    </div>
  );
}
