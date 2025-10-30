import React, { useState, useEffect } from "react";
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
  MessageCircle,
} from "lucide-react";
import logo from "/Logo-R.png";
import PasswordResetModal from "../PasswordResetModal";
import { io } from "socket.io-client";
import { useToastContext } from "../../contexts/ToastContext";
import { 
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteAllNotificationsMutation
} from "../../features/notifications/notificationApi";

export default function Layout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { info } = useToastContext();
  
  // Fetch notifications from database
  const { data: notificationsData, refetch: refetchNotifications } = useGetNotificationsQuery();
  const [markNotificationAsRead] = useMarkNotificationAsReadMutation();
  const [markAllNotificationsAsReadMutation] = useMarkAllNotificationsAsReadMutation();
  const [deleteAllNotificationsMutation] = useDeleteAllNotificationsMutation();
  
  // console.log(user)

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    navigate("/login");
  };

  // First letter of user's name (fallback = U)
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  // Sync database notifications with state
  useEffect(() => {
    if (notificationsData?.data?.notifications) {
      const dbNotifications = notificationsData.data.notifications.map(n => {
        console.log('📋 Processing notification:', n);
        return {
          ...n,
          id: n._id,
          receivedAt: new Date(n.createdAt)
        };
      });
      setNotifications(dbNotifications);
    }
    if (notificationsData?.data?.unreadCount !== undefined) {
      setUnreadCount(notificationsData.data.unreadCount);
    }
  }, [notificationsData]);

  const handleNotificationClick = async (notification) => {
    console.log('🔔 Notification clicked:', notification);
    
    // Mark notification as read in database
    if (!notification.isRead && notification._id) {
      try {
        await markNotificationAsRead(notification._id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    
    // Update local state
    setNotifications(prev =>
      prev.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    setIsNotificationsOpen(false);
    
    // Navigate to student page with the application tab selected
    if (notification.studentId) {
      let studentIdValue;
      
      // If studentId is a string that looks like an object literal (contains "_id: new ObjectId")
      if (typeof notification.studentId === 'string' && notification.studentId.includes('ObjectId')) {
        // Extract the ObjectId from the string using regex
        const match = notification.studentId.match(/ObjectId\("([^"]+)"\)/);
        studentIdValue = match ? match[1] : null;
      } 
      // If it's an object, extract the _id or id
      else if (typeof notification.studentId === 'object') {
        studentIdValue = notification.studentId._id || notification.studentId.id;
      } 
      // Otherwise use as-is (should be a simple string ID)
      else {
        studentIdValue = notification.studentId;
      }
      
      console.log(`📍 StudentId extracted: ${studentIdValue}`);
      console.log(`📍 ApplicationId: ${notification.applicationId}`);
      console.log(`📍 Navigating to student: /student/edit/${studentIdValue}`);
      
      if (studentIdValue) {
        // Pass the applicationId in state to select it in the applications tab
        navigate(`/student/edit/${studentIdValue}`, {
          state: {
            selectedApplicationId: notification.applicationId
          }
        });
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsReadMutation();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await deleteAllNotificationsMutation();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  // Initialize Socket.IO connection for notifications
  useEffect(() => {
    if (!user?.id) return;

    const authData = JSON.parse(sessionStorage.getItem("auth")) || {};
    const token = authData.token;

    if (!token) return;

    const newSocket = io("http://localhost:5000", {
      auth: {
        token: token
      }
    });

    // Socket connection event handlers
    newSocket.on("connect", () => {
      console.log("✅ Socket.IO connected successfully");
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket.IO disconnected");
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket.IO connection error:", error);
    });

    // Listen for notifications with multiple event names
    const handleNotification = (notification) => {
      console.log("🔔 Received notification:", notification);
      
      // Refetch notifications from database to get the stored version
      refetchNotifications();
      
      // Show toast notification
      if (notification.title && notification.message) {
        info(`${notification.title}: ${notification.message}`);
      }
    };

    // Listen for both event names
    newSocket.on("notification", handleNotification);
    newSocket.on("enhanced_notification", handleNotification);

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id, info, refetchNotifications]);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Home size={18} /> },
    { name: "Students", path: "/student", icon: <User size={18} /> },
    { name: "Applications", path: "/applications", icon: <FileText size={18} /> },
    { name: "Application Tracking", path: "/application-tracking", icon: <FileText size={18} /> },
    { name: "Course Search", path: "/course-search", icon: <Search size={18} /> },
    // { name: "Student Search", path: "/student-search", icon: <Search size={18} /> },
    { name: "My Students", path: "/agent-students", icon: <User size={18} /> },
    { name: "Chats", path: "/chats", icon: <MessageCircle size={18} /> },

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
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 hover:bg-gray-100 rounded-full transition"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark all read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>

                {/* Notifications List */}
                <div>
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm text-gray-500">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification, index) => (
                      <button
                        key={notification.id || index}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition ${
                          !notification.isRead ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                            !notification.isRead ? 'bg-blue-600' : 'bg-gray-300'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title || 'Notification'}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {notification.receivedAt ? new Date(notification.receivedAt).toLocaleString() : 'Just now'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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

      {/* Click outside to close dropdowns */}
      {(isProfileDropdownOpen || isNotificationsOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setProfileDropdownOpen(false);
            setIsNotificationsOpen(false);
          }}
        />
      )}
    </div>
  );
}
