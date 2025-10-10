import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAddStudentMutation } from "../../features/students/studentApi";

const StudentRegistrationForm = () => {
  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    number: "",
    email: "",
    lastQualification: "",
    lastQualificationScore: "",
    scorePercentage: "",
    lastInstitute: "",
    workExperience: "",
    languageTest: "",
    languageTestScore: "",
    boardAttestation: "",
    ibccAttestation: "",
    hecAttestation: "",
    mofaAttestation: "",
    apostilleAttestation: "",
    country1: "",
    country2: "",
  });

  const { user } = useSelector((state) => state.auth);
  const [addStudent, { isLoading }] = useAddStudentMutation();

  // ✅ Generate a unique student ID
  const generateStudentId = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear()).slice(-2);
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `A${day}${month}${year}${hours}${minutes}`;
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      studentId: generateStudentId(),
    }));
  }, []);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.officeId || !user?._id) {
      alert("Missing office or user information!");
      return;
    }

    const payload = {
      studentCode: formData.studentId,
      name: formData.name,
      email: formData.email,
      phone: formData.number,
      officeId: user.officeId,
      agentId: user._id,
      qualification: formData.lastQualification,
      score: parseFloat(formData.lastQualificationScore) || 0,
      percentage: parseFloat(formData.scorePercentage) || 0,
      lastInstitute: formData.lastInstitute,
      experience: formData.workExperience
        ? `${formData.workExperience} years`
        : "N/A",
      test: formData.languageTest,
      testScore: parseFloat(formData.languageTestScore) || 0,
      boardAttestation: formData.boardAttestation || "No",
      ibccAttestation: formData.ibccAttestation || "No",
      hecAttestation: formData.hecAttestation || "No",
      mofaAttestation: formData.mofaAttestation || "No",
      apostilleAttestation: formData.apostilleAttestation || "No",
      country1: formData.country1,
      country2: formData.country2,
    };

    try {
      await addStudent(payload).unwrap();
      alert(`✅ Student Registered Successfully! ID: ${formData.studentId}`);

      // Reset form
      setFormData({
        studentId: generateStudentId(),
        name: "",
        number: "",
        email: "",
        lastQualification: "",
        lastQualificationScore: "",
        scorePercentage: "",
        lastInstitute: "",
        workExperience: "",
        languageTest: "",
        languageTestScore: "",
        boardAttestation: "",
        ibccAttestation: "",
        hecAttestation: "",
        mofaAttestation: "",
        apostilleAttestation: "",
        country1: "",
        country2: "",
      });
    } catch (err) {
      console.error("❌ Error registering student:", err);

      // ✅ Show backend error message if available
      const errorMessage =
        err?.data?.message ||
        err?.data?.error ||
        err?.error ||
        "Failed to register student. Please try again.";

      alert(`❌ ${errorMessage}`);
    }
  };

  const inputClass = "p-2 border-b w-full focus:outline-none focus:ring-0";

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 my-10 w-full max-w-5xl space-y-10"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Student Registration Form
        </h2>

        {/* Student ID */}
        <div className="mb-6">
          <label className="block text-blue-600 font-semibold mb-2">
            Student ID
          </label>
          <input
            type="text"
            name="studentId"
            value={formData.studentId}
            readOnly
            className="p-2 w-full bg-gray-100 text-gray-700 font-bold"
          />
        </div>

        {/* Personal Information */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b-2 pb-2">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="name"
              placeholder="Full Name*"
              value={formData.name}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <input
              type="text"
              name="number"
              placeholder="Phone Number*"
              value={formData.number}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <input
              type="email"
              name="email"
              placeholder="Email*"
              value={formData.email}
              onChange={handleChange}
              required
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
              name="lastQualification"
              placeholder="Last Qualification*"
              value={formData.lastQualification}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <input
              type="text"
              name="lastQualificationScore"
              placeholder="Qualification Score (CGPA / Marks)*"
              value={formData.lastQualificationScore}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <input
              type="text"
              name="scorePercentage"
              placeholder="Score Percentage*"
              value={formData.scorePercentage}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <input
              type="text"
              name="lastInstitute"
              placeholder="Institute for last qualification*"
              value={formData.lastInstitute}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
        </section>

        {/* Work Experience */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b-2 pb-2">
            Work Experience
          </h3>
          <div>
            <input
              type="number"
              name="workExperience"
              placeholder="Work experience (Years)"
              value={formData.workExperience}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </section>

        {/* Language Test */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b-2 pb-2">
            Language Test
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <select
              name="languageTest"
              value={formData.languageTest}
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
              name="languageTestScore"
              placeholder="Language Test Score"
              value={formData.languageTestScore}
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
                <option value="">Select {attestation}</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
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
              placeholder="Country for Study 1"
              value={formData.country1}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              type="text"
              name="country2"
              placeholder="Country for Study 2"
              value={formData.country2}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </section>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#F42222] text-white py-3 rounded-lg font-semibold hover:bg-[#980b0b] transition"
        >
          {isLoading ? "Registering..." : "Register Student"}
        </button>
      </form>
    </div>
  );
};

export default StudentRegistrationForm;
