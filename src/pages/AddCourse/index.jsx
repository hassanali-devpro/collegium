// src/components/StudyProgramForm.jsx
import React, { useState } from "react";

const StudyProgramForm = () => {
  const [formData, setFormData] = useState({
    course: "",
    university: "",
    department: "",
    country: "",
    city: "",
    febIntake: "",
    septIntake: "",
    isPrivate: "",
    type: "",
    fee: "",
    timePeriod: "",
    percentageRequirement: "",
    cgpaRequirement: "",
    marksRequirement: "",
  });

  // handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Study Program Data:", formData);
    alert("Program Registered!");
  };

  // common input style
  const inputClass =
    "w-full p-2 border-b focus:outline-none focus:ring-0";

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 my-10 w-full max-w-4xl space-y-10"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/Logo-R.png" alt="Company Logo" className="h-16" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Register Study Program
        </h2>

        {/* Program Info */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b-2 pb-2">
            Program Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="course"
              placeholder="Course*"
              value={formData.course}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <input
              type="text"
              name="university"
              placeholder="University*"
              value={formData.university}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <input
              type="text"
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </section>

        {/* Location */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b-2 pb-2">
            Location
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="country"
              placeholder="Country*"
              value={formData.country}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <input
              type="text"
              name="city"
              placeholder="City*"
              value={formData.city}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
        </section>

        {/* Intakes */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b-2 pb-2">
            Intakes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <select
              name="febIntake"
              value={formData.febIntake}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">Feb Intake*</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            <select
              name="septIntake"
              value={formData.septIntake}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">September Intake*</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </section>

        {/* Program Details */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b-2 pb-2">
            Program Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <select
              name="isPrivate"
              value={formData.isPrivate}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">Private*</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">Program Type*</option>
              <option value="Bachelors">Bachelors</option>
              <option value="Masters">Masters</option>
              <option value="PhD">PhD</option>
            </select>
            <input
              type="number"
              name="fee"
              placeholder="Fee*"
              value={formData.fee}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <select
              name="timePeriod"
              value={formData.timePeriod}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">Select Duration*</option>
              <option value="1 Year">1 Year</option>
              <option value="2 Years">2 Years</option>
              <option value="3 Years">3 Years</option>
              <option value="4 Years">4 Years</option>
            </select>
          </div>
        </section>

        {/* Requirements */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b-2 pb-2">
            Requirements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="percentageRequirement"
              placeholder="Percentage Requirement*"
              value={formData.percentageRequirement}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <input
              type="text"
              name="cgpaRequirement"
              placeholder="CGPA Requirement"
              value={formData.cgpaRequirement}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              type="text"
              name="marksRequirement"
              placeholder="Marks Requirement"
              value={formData.marksRequirement}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </section>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-[#F42222] text-white py-3 rounded-lg font-semibold hover:bg-[#980b0b] transition"
        >
          Register Program
        </button>
      </form>
    </div>
  );
};

export default StudyProgramForm;
