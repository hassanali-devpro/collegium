import React, { useState, useEffect } from "react";

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
    joinDate: "",
    documents: {
      profilePicture: null, 
      matricCertificate: null,
      matricMarksSheet: null,
      intermediateCertificate: null,
      intermediateMarkSheet: null,
      degree: null,
      transcript: null,
      languageCertificate: null,
      passport: null,
      experienceLetter: null,
      birthCertificate: null,
      familyRegistration: null,
      otherDocs: null,
    },
  });

  const [preview, setPreview] = useState(null);


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


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    setFormData({
      ...formData,
      documents: { ...formData.documents, [name]: file },
    });


    if (name === "profilePicture" && file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log("Student Registration Data:", formData);
    alert(`Student Registered Successfully! ID: ${formData.studentId}`);
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

        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-32 h-32 rounded-full border-4 border-blue-500 overflow-hidden shadow-md">
            {preview ? (
              <img
                src={preview}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>
          <label className="mt-4 cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700">
            Upload Profile Picture
            <input
              type="file"
              name="profilePicture"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

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
              <option value="TOFEL">TOFEL</option>
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
            <input
              type="date"
              name="joinDate"
              value={formData.joinDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </section>

        {/* Documents Upload */}
        <section>
          <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b-2 pb-2">
            Upload Documents
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(formData.documents)
              .filter((docKey) => docKey !== "profilePicture") // skip profile picture here
              .map((docKey) => (
                <div key={docKey}>
                  <label className="block text-blue-600 font-medium mb-1">
                    {docKey.replace(/([A-Z])/g, " $1")}
                  </label>
                  <input
                    type="file"
                    name={docKey}
                    onChange={handleFileChange}
                    className={inputClass}
                  />
                </div>
              ))}
          </div>
        </section>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-[#F42222] text-white py-3 rounded-lg font-semibold hover:bg-[#980b0b] transition"
        >
          Register Student
        </button>
      </form>
    </div>
  );
};

export default StudentRegistrationForm;
