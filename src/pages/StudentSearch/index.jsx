import React, { useState } from "react";
import { Link } from "react-router-dom";

const dummyStudents = [
  {
    studentId: "A0609250417",
    name: "Ali Khan",
    number: "03001234567", 
    email: "ali.khan@example.com",
  },
  {
    studentId: "A0609250500",
    name: "Sara Ahmed",
    number: "03019876543",
    email: "sara.ahmed@example.com",
  },
  {
    studentId: "A0609250615",
    name: "John Smith",
    number: "03111234567",
    email: "john.smith@example.com",
  },
];

const StudentSearch = () => {
  const [searchInput, setSearchInput] = useState("");
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = () => {
    const found = dummyStudents.find(
      (s) =>
        s.studentId.toLowerCase() === searchInput.toLowerCase() ||
        s.number === searchInput
    );

    if (found) {
      setStudent(found);
      setError("");
    } else {
      setStudent(null);
      setError("No student found with this ID or Phone Number.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Student Search
      </h2>

      {/* Search Bar */}
      <div className="flex w-full max-w-md gap-2 mb-6">
        <input
          type="text"
          placeholder="Enter Student ID or Phone Number"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Search
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {student && (
        <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Personal Information
          </h3>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <span className="font-semibold text-blue-600">Student ID: </span>
              {student.studentId}
            </div>
            <div className="p-3 border rounded-lg">
              <span className="font-semibold text-blue-600">Name: </span>
              {student.name}
            </div>
            <div className="p-3 border rounded-lg">
              <span className="font-semibold text-blue-600">Phone: </span>
              {student.number}
            </div>
            <div className="p-3 border rounded-lg">
              <span className="font-semibold text-blue-600">Email: </span>
              {student.email}
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to={`/student/${student.studentId}`}
              className="inline-block px-6 py-2 bg-[#F42222] text-white rounded-lg font-medium hover:bg-green-700 transition"
            >
              Visit Profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSearch;
