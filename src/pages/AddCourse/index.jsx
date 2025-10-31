import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useCreateCourseMutation,
  useUpdateCourseMutation,
} from "../../features/courses/courseApi";
import { useConfirmationModal } from "../../hooks/useConfirmationModal";
import { useGetCountriesQuery } from "../../features/meta/metaApi";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useToastContext } from "../../contexts/ToastContext";

const StudyProgramForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editProgram = location.state?.program || null;
  const { modalState, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationModal();
  const { success, error: showError } = useToastContext();

  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const { data: countriesData } = useGetCountriesQuery();
  const countries = countriesData?.data || [];

  const [formData, setFormData] = useState({
    name: "",
    university: "",
    department: "",
    country: "",
    city: "",
    intake: "",
    isPrivate: "",
    openAdmission: true,
    type: "",
    fee: "",
    timePeriod: "",
    percentageRequirement: "",
    cgpaRequirement: "",
    languageTest: "",
    minBands: "",
  });

  useEffect(() => {
    if (editProgram) {
      setFormData({ ...editProgram });
    }
  }, [editProgram]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "openAdmission") {
      setFormData({ ...formData, openAdmission: value === "Yes" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProgram) {
        await updateCourse({ id: editProgram._id, ...formData }).unwrap();
        success("Program Updated Successfully!");
      } else {
        await createCourse(formData).unwrap();
        success("Program Registered Successfully!");
      }
      navigate("/course-search");
    } catch (err) {
      console.error("Error:", err);
      showError("Something went wrong!");
    }
  };

  const handleCancel = () => {
    // Check if form has unsaved changes
    const hasChanges = Object.values(formData).some(value => value !== "");

    if (hasChanges) {
      showConfirmation({
        title: "Cancel Changes",
        message: "You have unsaved changes. Are you sure you want to cancel?",
        confirmText: "Yes, Cancel",
        cancelText: "Keep Editing",
        type: "warning",
        onConfirm: () => {
          navigate("/course-search");
        }
      });
    } else {
      navigate("/course-search");
    }
  };

  const inputClass = "w-full p-2 border-b focus:outline-none focus:ring-0";

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
          {editProgram ? "Edit Study Program" : "Register Study Program"}
        </h2>

        {/* Program Info */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b-2 pb-2">
            Program Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="name"
              placeholder="Program Name*"
              value={formData.name}
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
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">Select Country*</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

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

        {/* Intake */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b-2 pb-2">
            Intake
          </h3>
          <div className="grid grid-cols-1 gap-6">
            <select
              name="intake"
              value={formData.intake}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">Select Intake*</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
              <option value="Sep and Feb">Sep and Feb</option>

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
              name="openAdmission"
              value={formData.openAdmission ? "Yes" : "No"}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="Yes">Admission Opened</option>
              <option value="No">Admission Closed</option>
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
            <select
              name="languageTest"
              value={formData.languageTest}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select Language Test</option>
              <option value="IELTS">IELTS</option>
              <option value="TOEFL">TOEFL</option>
              <option value="PTE">PTE</option>
              <option value="Duolingo">Duolingo</option>
              <option value="Other">Other</option>
            </select>

            <input
              type="text"
              name="minBands"
              placeholder="Minimum Bands / Score"
              value={formData.minBands}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="w-full sm:w-1/3 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="w-full sm:w-2/3 bg-[#F42222] text-white py-3 rounded-lg font-semibold hover:bg-[#980b0b] transition disabled:opacity-50"
          >
            {isCreating || isUpdating
              ? "Saving..."
              : editProgram
                ? "Update Program"
                : "Register Program"}
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={hideConfirmation}
        onConfirm={handleConfirm}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        type={modalState.type}
      />
    </div>
  );
};

export default StudyProgramForm;
