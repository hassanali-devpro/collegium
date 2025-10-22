import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAddStudentMutation, useUpdateStudentMutation, useGetStudentByIdQuery } from "../../features/students/studentApi";
import { useToastContext } from "../../contexts/ToastContext";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const StudentRegistrationForm = ({ onStudentCreated, existingStudentId }) => {
  const { user } = useSelector((state) => state.auth);
  const { success, error: showError } = useToastContext();
  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    phoneNumber: "",
    countryCode: "+92",
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

  const [addStudent, { isLoading: isCreating }] = useAddStudentMutation();
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
  
  // Fetch existing student data if editing
  const { data: existingStudentData, isLoading: isLoadingStudent } = useGetStudentByIdQuery(existingStudentId, {
    skip: !existingStudentId
  });

  const navigate = useNavigate();
  const isLoading = isCreating || isUpdating;
  const isEditMode = !!existingStudentId;


  // ✅ Generate unique student ID
  const generateStudentId = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear()).slice(-2);
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `A${day}${month}${year}${hours}${minutes}`;
  };

  // Effect to set student ID
  useEffect(() => {
    if (existingStudentId) {
      // If editing existing student, don't generate new ID
      setFormData((prev) => ({
        ...prev,
        studentId: existingStudentId,
      }));
    } else {
      // If creating new student, generate new ID
      setFormData((prev) => ({
        ...prev,
        studentId: generateStudentId(),
      }));
    }
  }, [existingStudentId]);

  // Effect to load existing student data when editing
  useEffect(() => {
    if (existingStudentData?.data && isEditMode) {
      const student = existingStudentData.data;
      setFormData({
        studentId: student.studentCode || student._id,
        name: student.name || "",
        phoneNumber: student.phoneNumber || "",
        countryCode: student.countryCode || "+92",
        email: student.email || "",
        lastQualification: student.qualification || "",
        lastQualificationScore: student.score?.toString() || "",
        scorePercentage: student.percentage?.toString() || "",
        lastInstitute: student.lastInstitute || "",
        workExperience: student.experience?.replace(" years", "") || "",
        languageTest: student.test || "",
        languageTestScore: student.testScore?.toString() || "",
        boardAttestation: student.boardAttestation || "",
        ibccAttestation: student.ibccAttestation || "",
        hecAttestation: student.hecAttestation || "",
        mofaAttestation: student.mofaAttestation || "",
        apostilleAttestation: student.apostilleAttestation || "",
        country1: student.country1 || "",
        country2: student.country2 || "",
      });
    }
  }, [existingStudentData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.officeId || !user?._id) {
      showError("Missing office or user information!");
      return;
    }

    const payload = {
      studentCode: formData.studentId,
      name: formData.name,
      email: formData.email,
      countryCode: `+${formData.countryCode}`, // react-phone-input gives code without "+"
      phoneNumber: formData.phoneNumber,
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
      let result;
      if (isEditMode) {
        // Update existing student
        result = await updateStudent({ id: existingStudentId, ...payload }).unwrap();
        success(`Student Updated Successfully! ID: ${formData.studentId}`);
      } else {
        // Create new student
        result = await addStudent(payload).unwrap();
        success(`Student Registered Successfully! ID: ${formData.studentId}`);
      }
      
      // If we have a callback function, call it with the student ID
      if (onStudentCreated) {
        onStudentCreated(formData.studentId);
      } else {
        // Fallback to navigate to dashboard if no callback
        navigate("/dashboard");
      }

      // Only reset form if creating new student (not editing)
      if (!isEditMode) {
        setFormData({
          studentId: generateStudentId(),
          name: "",
          phoneNumber: "",
          countryCode: "+92",
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
      }
    } catch (err) {
      console.error("❌ Error registering student:", err);
      const errorMessage =
        err?.data?.message ||
        err?.data?.error ||
        err?.error ||
        "Failed to register student. Please try again.";
      showError(errorMessage);
    }
  };

  const inputClass = "p-2 border-b w-full focus:outline-none focus:ring-0";

  // Show loading state when fetching existing student data
  if (isEditMode && isLoadingStudent) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white  p-8 w-full space-y-10"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {isEditMode ? "Update Student Information" : "Student Registration Form"}
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

            {/* ✅ Phone Input with all countries */}
            <div>
              <PhoneInput
                country={"pk"}
                value={formData.countryCode + formData.phoneNumber}
                onChange={(phone, countryData) =>
                  setFormData({
                    ...formData,
                    countryCode: countryData.dialCode,
                    phoneNumber: phone.replace(countryData.dialCode, "").trim(),
                  })
                }
                inputStyle={{
                  width: "100%",
                  padding: "10px 50px",
                  fontSize: "16px",
                }}
                buttonStyle={{ border: "none" }}
              />
            </div>

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

        {/* Education Section (unchanged) */}
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

        <button
          type="submit"
          disabled={isLoading || isLoadingStudent}
          className="w-full bg-[#F42222] text-white py-3 rounded-lg font-semibold hover:bg-[#980b0b] transition disabled:opacity-50"
        >
          {isLoadingStudent ? "Loading..." : isLoading ? (isEditMode ? "Updating..." : "Registering...") : (isEditMode ? "Update Student" : "Register Student")}
        </button>
      </form>
    </div>
  );
};

export default StudentRegistrationForm;
