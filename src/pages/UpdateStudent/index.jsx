import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetStudentByIdQuery,
  useAddStudentMutation,
  useUpdateStudentMutation,
} from "../../features/students/studentApi";

const StudentUpdateForm = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // ✅ for navigation

  // ✅ Skip fetching when creating a new student
  const { data, isLoading, isError } = useGetStudentByIdQuery(id, {
    skip: !id,
  });

  // ✅ Mutations
  const [addStudent, { isLoading: isAdding }] = useAddStudentMutation();
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    qualification: "",
    score: "",
    percentage: "",
    lastInstitute: "",
    experience: "",
    test: "",
    testScore: "",
    boardAttestation: "No",
    ibccAttestation: "No",
    hecAttestation: "No",
    mofaAttestation: "No",
    apostilleAttestation: "No",
    country1: "",
    country2: "",
  });

  // ✅ Fill form when editing an existing student
  useEffect(() => {
    if (id && data?.data) {
      const s = data.data;
      setFormData({
        name: s.name || "",
        email: s.email || "",
        phone: s.phone || "",
        qualification: s.qualification || "",
        score: s.score || "",
        percentage: s.percentage || "",
        lastInstitute: s.lastInstitute || "",
        experience: s.experience?.replace(" years", "") || "",
        test: s.test || "",
        testScore: s.testScore || "",
        boardAttestation: s.boardAttestation || "No",
        ibccAttestation: s.ibccAttestation || "No",
        hecAttestation: s.hecAttestation || "No",
        mofaAttestation: s.mofaAttestation || "No",
        apostilleAttestation: s.apostilleAttestation || "No",
        country1: s.country1 || "",
        country2: s.country2 || "",
      });
    }
  }, [id, data]);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle form submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await updateStudent({ id, ...formData }).unwrap();
        alert("✅ Student updated successfully!");
      } else {
        await addStudent(formData).unwrap();
        alert("✅ Student created successfully!");
      }

      // ✅ Navigate after success
      navigate("/dashboard");

    } catch (err) {
      console.error("Submission failed:", err);
      alert(
        err?.data?.message ||
          err?.data?.error ||
          err?.error ||
          "❌ Failed to submit student."
      );
    }
  };

  // ✅ Loading & Error states only for update mode
  if (isLoading && id)
    return <p className="text-center py-10">Loading student...</p>;
  if (isError && id)
    return <p className="text-center text-red-600">Error loading student.</p>;

  const inputClass = "p-2 border-b w-full focus:outline-none focus:ring-0";

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 my-10 w-full max-w-5xl space-y-10"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {id ? "Update Student Profile" : "Add New Student"}
        </h2>

        {/* Personal Information */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b-2 pb-2">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </section>

        {/* Education */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b-2 pb-2">
            Education
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="qualification"
              placeholder="Qualification"
              value={formData.qualification}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              type="text"
              name="score"
              placeholder="Score (CGPA/Marks)"
              value={formData.score}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              type="text"
              name="percentage"
              placeholder="Percentage"
              value={formData.percentage}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              type="text"
              name="lastInstitute"
              placeholder="Last Institute"
              value={formData.lastInstitute}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </section>

        {/* Work Experience */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b-2 pb-2">
            Work Experience
          </h3>
          <input
            type="number"
            name="experience"
            placeholder="Years of Experience"
            value={formData.experience}
            onChange={handleChange}
            className={inputClass}
          />
        </section>

        {/* Language Test */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b-2 pb-2">
            Language Test
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <select
              name="test"
              value={formData.test}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select Language Test</option>
              <option value="IELTS">IELTS</option>
              <option value="PTE">PTE</option>
              <option value="TOEFL">TOEFL</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="text"
              name="testScore"
              placeholder="Test Score"
              value={formData.testScore}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </section>

        {/* Attestations */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b-2 pb-2">
            Attestations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "boardAttestation",
              "ibccAttestation",
              "hecAttestation",
              "mofaAttestation",
              "apostilleAttestation",
            ].map((attestation) => (
              <select
                key={attestation}
                name={attestation}
                value={formData[attestation]}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            ))}
          </div>
        </section>

        {/* Study Preferences */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b-2 pb-2">
            Study Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="country1"
              placeholder="Country 1"
              value={formData.country1}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              type="text"
              name="country2"
              placeholder="Country 2"
              value={formData.country2}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </section>

        <button
          type="submit"
          disabled={isAdding || isUpdating}
          className="w-full bg-[#F42222] text-white py-3 rounded-lg font-semibold hover:bg-[#980b0b] transition"
        >
          {id
            ? isUpdating
              ? "Updating..."
              : "Update Student"
            : isAdding
            ? "Creating..."
            : "Add Student"}
        </button>
      </form>
    </div>
  );
};

export default StudentUpdateForm;
