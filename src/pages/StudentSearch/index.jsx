import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGetStudentByIdQuery } from "../../features/students/studentApi";

const StudentSearch = () => {
  const [searchInput, setSearchInput] = useState("");
  const [triggerSearch, setTriggerSearch] = useState(false);

  const { data, isLoading, isError, error } = useGetStudentByIdQuery(searchInput, {
    skip: !triggerSearch || !searchInput.trim(),
  });

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    setTriggerSearch(true);
  };

  const student = data?.data;

  return (
    <section className="min-h-screen bg-white flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
           Student Search
        </h2>


        <div className="flex flex-col sm:flex-row gap-3 w-full mb-8">
          <input
            type="text"
            placeholder="Enter Student ID or Phone Number"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setTriggerSearch(false);
            }}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className={`px-6 py-3 font-medium rounded-lg text-gray-800 transition ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>


        {isError && (
          <p className="text-center text-red-600 mb-4 font-medium">
            {error?.data?.message || "No student found with this ID or Phone Number."}
          </p>
        )}


        {student && (
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold text-blue-600">Student ID: </span>
                {student.studentCode}
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold text-blue-600">Name: </span>
                {student.name}
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold text-blue-600">Phone: </span>
                {student.phone}
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold text-blue-600">Email: </span>
                {student.email}
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                to={`/student/${student._id}`}
                className="inline-block px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-medium transition"
              >
                Visit Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default StudentSearch;
