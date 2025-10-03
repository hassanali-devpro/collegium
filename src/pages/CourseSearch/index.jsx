import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useSearchCoursesQuery,
  useDeleteCourseMutation,
} from "../../features/courses/courseApi";

const ProgramCard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // 🔎 Form state
  const [filters, setFilters] = useState({
    search: "",
    country: "",
    type: "",
  });

  // API call with filters
  const { data, error, isLoading } = useSearchCoursesQuery({
    search: filters.search,
    country: filters.country,
    type: filters.type,
    page: 1,
    limit: 10,
  });

  const [deleteCourse] = useDeleteCourseMutation();

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this course?")) {
      await deleteCourse(id);
    }
  };

  const handleEdit = (program) => {
    navigate("/add-course", { state: { program } });
  };

  return (
    <div className="space-y-6">
      {/* 🔎 Search Form */}
      <div className="p-4 bg-gray-100 rounded-lg flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search by name..."
          className="border p-2 rounded w-1/3"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <input
          type="text"
          placeholder="Country"
          className="border p-2 rounded w-1/4"
          value={filters.country}
          onChange={(e) => setFilters({ ...filters, country: e.target.value })}
        />
        <select
          className="border p-2 rounded w-1/4"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="Bachelors">Bachelors</option>
          <option value="Masters">Masters</option>
          <option value="PhD">PhD</option>
        </select>
      </div>

      {/* 🔄 Results */}
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">Failed to load courses</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data?.data?.length === 0 && (
          <p className="text-gray-500 col-span-2">No courses found.</p>
        )}

        {data?.data?.map((program) => (
          <div
            key={program._id}
            className="max-w-md w-full bg-white shadow-lg rounded-2xl p-6 border border-gray-200 relative"
          >
            {/* Title & University */}
            <div className="mb-4 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{program.name}</h2>
                <p className="text-sm text-gray-600">
                  {program.university} • {program.country}
                </p>
                {program.city && (
                  <p className="text-xs text-gray-500">{program.city}</p>
                )}
              </div>

              {user?.role === "SuperAdmin" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(program)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(program._id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Program Details */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-800">
              {program.department && (
                <div>
                  <p className="font-semibold">Department:</p>
                  <p>{program.department}</p>
                </div>
              )}
              {program.intake && (
                <div>
                  <p className="font-semibold">Intake:</p>
                  <p>{program.intake}</p>
                </div>
              )}
              {program.type && (
                <div>
                  <p className="font-semibold">Type:</p>
                  <p>{program.type}</p>
                </div>
              )}
              {program.fee && (
                <div>
                  <p className="font-semibold">Fee:</p>
                  <p>{program.fee}</p>
                </div>
              )}
              {program.timePeriod && (
                <div>
                  <p className="font-semibold">Time Period:</p>
                  <p>{program.timePeriod}</p>
                </div>
              )}
              {program.percentageRequirement && (
                <div>
                  <p className="font-semibold">Percentage Requirement:</p>
                  <p>{program.percentageRequirement}</p>
                </div>
              )}
              {program.cgpaRequirement && (
                <div>
                  <p className="font-semibold">CGPA Requirement:</p>
                  <p>{program.cgpaRequirement}</p>
                </div>
              )}
              {program.isPrivate && (
                <div>
                  <p className="font-semibold">Private:</p>
                  <p>{program.isPrivate}</p>
                </div>
              )}
              {program.languageTest && (
                <div>
                  <p className="font-semibold">Language Test:</p>
                  <p>{program.languageTest}</p>
                </div>
              )}
              {program.minBands && (
                <div>
                  <p className="font-semibold">Minimum Bands / Score:</p>
                  <p>{program.minBands}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgramCard;
