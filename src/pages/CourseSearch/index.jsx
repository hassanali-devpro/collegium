// src/components/StudyProgramSearch.jsx
import React, { useState } from "react";

const dummyPrograms = [
  {
    course: "Computer Science",
    university: "Oxford University",
    department: "Engineering",
    country: "UK",
    febIntake: "Yes",
    septIntake: "Yes",
    isPrivate: "No",
    type: "Bachelors",
    fee: "15000",
    timePeriod: "3 Years",
  },
  {
    course: "MBA",
    university: "Harvard University",
    department: "Business",
    country: "USA",
    febIntake: "No",
    septIntake: "Yes",
    isPrivate: "Yes",
    type: "Masters",
    fee: "30000",
    timePeriod: "2 Years",
  },
  {
    course: "Data Science",
    university: "Toronto University",
    department: "Computer Science",
    country: "Canada",
    febIntake: "Yes",
    septIntake: "No",
    isPrivate: "No",
    type: "PhD",
    fee: "20000",
    timePeriod: "2 Years",
  },
];

const StudyProgramSearch = () => {
  const [filters, setFilters] = useState({
    search: "",
    country: "",
    intake: "",
    isPrivate: "",
    type: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const filteredPrograms = dummyPrograms.filter((program) => {
    const matchesSearch =
      program.course.toLowerCase().includes(filters.search.toLowerCase()) ||
      program.university.toLowerCase().includes(filters.search.toLowerCase());

    const matchesCountry =
      !filters.country ||
      program.country.toLowerCase().includes(filters.country.toLowerCase());

    const matchesIntake =
      !filters.intake ||
      (filters.intake === "Feb" && program.febIntake === "Yes") ||
      (filters.intake === "Sept" && program.septIntake === "Yes");

    const matchesPrivate =
      !filters.isPrivate || program.isPrivate === filters.isPrivate;

    const matchesType = !filters.type || program.type === filters.type;

    return (
      matchesSearch &&
      matchesCountry &&
      matchesIntake &&
      matchesPrivate &&
      matchesType
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Filters Section */}
        <div className="bg-white shadow-md rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Search & Filters
          </h2>

          {/* Search Bar First */}
          <div className="mb-4">
            <input
              type="text"
              name="search"
              placeholder="Search by Course or University"
              value={filters.search}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full"
            />
          </div>

          {/* Filters Below */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              name="country"
              placeholder="Search by Country"
              value={filters.country}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full"
            />
            <select
              name="intake"
              value={filters.intake}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full"
            >
              <option value="">All Intakes</option>
              <option value="Feb">February</option>
              <option value="Sept">September</option>
            </select>
            <select
              name="isPrivate"
              value={filters.isPrivate}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full"
            >
              <option value="">Public & Private</option>
              <option value="Yes">Private</option>
              <option value="No">Public</option>
            </select>
            <select
              name="type"
              value={filters.type}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full"
            >
              <option value="">All Types</option>
              <option value="Bachelors">Bachelors</option>
              <option value="Masters">Masters</option>
              <option value="PhD">PhD</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.length > 0 ? (
            filteredPrograms.map((program, idx) => (
              <div
                key={idx}
                className="bg-white shadow-md rounded-2xl p-6 hover:shadow-xl transition"
              >
                <h3 className="text-lg font-semibold text-blue-700">
                  {program.course}
                </h3>
                <p className="text-gray-700 font-medium">
                  {program.university}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  {program.country}
                </p>

                <div className="mt-3 space-y-1 text-sm">
                  <p>
                    <span className="font-semibold">Type:</span> {program.type}
                  </p>
                  <p>
                    <span className="font-semibold">Department:</span>{" "}
                    {program.department}
                  </p>
                  <p>
                    <span className="font-semibold">Fee:</span> ${program.fee}
                  </p>
                  <p>
                    <span className="font-semibold">Duration:</span>{" "}
                    {program.timePeriod}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {program.febIntake === "Yes" && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      February Intake
                    </span>
                  )}
                  {program.septIntake === "Yes" && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      September Intake
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 col-span-full text-center">
              No programs found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyProgramSearch;
