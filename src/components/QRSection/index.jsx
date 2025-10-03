import React from "react";
import { PlusCircle, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

const AdminActions = () => {
  return (
    <section className="w-full mx-auto bg-white shadow-lg rounded-2xl border border-gray-200 p-6 flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 text-start mb-4">Quick Actions</h2>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Link to='/add-course' className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition w-full sm:w-auto">
            <PlusCircle size={18} />
            Add a Course
          </Link>

          <Link to="/add-student" className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition w-full sm:w-auto">
            <UserPlus size={18} />
            Register a Student
          </Link>
        </div>

        <div className="flex flex-col items-center mt-6 md:mt-0">
          <p className="text-sm text-gray-600 mb-2 text-center md:text-left">
            Scan this QR to Register a student
          </p>
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://your-portal-link.com"
            alt="QR Code"
            className="border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </section>
  );
};

export default AdminActions;
