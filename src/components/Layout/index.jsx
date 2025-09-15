import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice"; // ✅ import logout action
import {
  Home,
  Search,
  FileText,
  Users,
  CreditCard,
  X,
  Bell,
  Menu,
} from "lucide-react";
import logo from "/Logo-R.png";

export default function Layout({ role = "user", children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const toggleProfileMenu = () => setProfileMenuOpen(!isProfileMenuOpen);

  const handleLogout = () => {
    // ✅ Clear Redux state
    dispatch(logout());

    // ✅ Clear localStorage if token is stored
    localStorage.removeItem("token");

    // ✅ Redirect to login
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Home size={18} /> },
    { name: "Course Search", path: "/course-search", icon: <Search size={18} /> },
    { name: "Application Tracking", path: "/application-tracking", icon: <FileText size={18} /> },
    { name: "Student Search", path: "/student-search", icon: <Search size={18} /> },
    role === "admin" && { name: "Manage Users", path: "/manage-users", icon: <Users size={18} /> },
    role === "admin" && { name: "Payments", path: "/payments", icon: <CreditCard size={18} /> },
    role === "admin" && { name: "Offices", path: "/offices", icon: <CreditCard size={18} /> },
  ].filter(Boolean);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ---------- Topbar ---------- */}
      <div className="w-full h-16 bg-white shadow-md flex items-center justify-between px-4 sm:px-6 relative">
        {/* Left - Logo + Menu */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            className="sm:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={toggleSidebar}
          >
            <Menu size={22} />
          </button>
          <img src={logo} alt="Logo" className="h-10 w-auto hidden sm:block" />
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-full transition">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Picture + Dropdown */}
          <div className="relative">
            <img
              src="/hassan.jpg"
              alt="Profile"
              className="h-10 w-10 rounded-full border border-gray-300 cursor-pointer"
              onClick={toggleProfileMenu}
            />

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <Link
                  to="/profile-settings"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  Profile Settings
                </Link>
                <Link
                  to="/support"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  Support
                </Link>
                <button
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    handleLogout(); // ✅ call logout
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Main Content with Sidebar ---------- */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar + Overlay for Mobile */}
        <>
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-40 z-40 sm:hidden"
              onClick={toggleSidebar}
            />
          )}

          <div
            className={`fixed sm:static top-0 left-0 h-screen w-64 bg-gray-100 text-gray-800 flex flex-col shadow-md transform transition-transform z-50
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}
          >
            {/* Mobile Top Section (Logo + Close Button) */}
            <div className="sm:hidden flex items-center justify-between p-4 border-b border-gray-300 shadow-3xl">
              <img src={logo} alt="Logo" className="h-10 w-auto" />
              <button onClick={toggleSidebar}>
                <X size={22} />
              </button>
            </div>

            {/* Sidebar Links */}
            <nav className="flex-1 p-4 mt-2 sm:mt-6">
              <ul className="space-y-2">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 p-2 rounded-lg transition ${
                        location.pathname === item.path
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
        </>

        {/* Main Page Content */}
        <div className="flex-1 p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
