import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAddStudentMutation, useUpdateStudentMutation, useGetStudentByIdQuery } from "../../features/students/studentApi";
import { useGetOfficesQuery } from "../../features/offices/officeApi";
import { useGetAgentsQuery } from "../../features/agents/agentApi";
import { useSearchCoursesQuery } from "../../features/courses/courseApi";
import { useCreateApplicationMutation, useGetApplicationsByStudentQuery } from "../../features/applications/applicationApi";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import DocumentsTab from "./DocumentsTab";
import ApplicationTabLayout from "../../components/ApplicationTabLayout";

const StudentForm = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const location = useLocation();
  const isEditMode = !!studentId;
  
  const { user } = useSelector((state) => state.auth);
  const [addStudent, { isLoading: isCreating }] = useAddStudentMutation();
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
  
  // Fetch existing student data if editing
  const { data: existingStudentData, isLoading: isLoadingStudent } = useGetStudentByIdQuery(studentId, {
    skip: !studentId
  });

  // Fetch offices and agents for SuperAdmin - only when needed
  // We fetch all offices and agents with a high limit, then filter agents by selected office
  // This approach is more efficient than making separate API calls for each office
  const { data: officesData, isLoading: isLoadingOffices, error: officesError } = useGetOfficesQuery(
    { page: 1, limit: 100 },
    { 
      skip: user?.role !== "SuperAdmin", // Only fetch for SuperAdmin
      keepUnusedDataFor: 300 // Cache for 5 minutes (300 seconds)
    }
  );
  const { data: agentsData, isLoading: isLoadingAgents, error: agentsError } = useGetAgentsQuery(
    { page: 1, limit: 100 },
    { 
      skip: user?.role !== "SuperAdmin", // Only fetch for SuperAdmin
      keepUnusedDataFor: 300 // Cache for 5 minutes (300 seconds)
    }
  );

  // Debug logging (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (officesData) {
        console.log("Offices data:", officesData);
      }
      if (agentsData) {
        console.log("Agents data:", agentsData);
      }
    }
  }, [officesData, agentsData]);

  // Course search state and API
  const [courseFilters, setCourseFilters] = useState({
    search: "",
    country: "",
    type: "",
    university: "",
    intake: "",
    feeSort: "", // "high-to-low" or "low-to-high"
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Debounced filters for API calls
  const [debouncedFilters, setDebouncedFilters] = useState(courseFilters);
  
  const [createApplication, { isLoading: isLinking }] = useCreateApplicationMutation();

  const [activeTab, setActiveTab] = useState(
    location.state?.selectedApplicationId ? "applications" : "profile"
  );

  // Debouncing effect for search filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(courseFilters);
      setCurrentPage(1); // Reset to first page when filters change
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [courseFilters]);

  // Course search query - moved after activeTab declaration
  const { data: coursesData, isLoading: isLoadingCourses } = useSearchCoursesQuery({
    search: debouncedFilters.search,
    country: debouncedFilters.country,
    type: debouncedFilters.type,
    university: debouncedFilters.university,
    intake: debouncedFilters.intake,
    feeSort: debouncedFilters.feeSort,
    page: currentPage,
    limit: pageSize,
  }, {
    skip: activeTab !== "course", // Only fetch when course tab is active
    keepUnusedDataFor: 180 // Cache for 3 minutes (180 seconds)
  });
  const [actualStudentId, setActualStudentId] = useState(null); // Store the real MongoDB ObjectId

  // Fetch student's applications to check which courses they've already applied to
  const { data: studentApplications } = useGetApplicationsByStudentQuery({
    studentId: actualStudentId,
    page: 1,
    limit: 100, // Get all applications to check against
    sortBy: 'applicationDate',
    sortOrder: 'desc'
  }, {
    skip: !actualStudentId || (activeTab !== "course" && activeTab !== "applications"), // Only fetch when needed
    keepUnusedDataFor: 120 // Cache for 2 minutes (120 seconds)
  });
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
    // SuperAdmin fields
    selectedOfficeId: "",
    selectedAgentId: "",
  });

  const isLoading = isCreating || isUpdating;

  // Generate unique student ID
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
    if (studentId) {
      setFormData((prev) => ({
        ...prev,
        studentId: studentId,
      }));
      // Set the actual student ID for edit mode
      setActualStudentId(studentId);
    } else {
      const generatedId = generateStudentId();
      setFormData((prev) => ({
        ...prev,
        studentId: generatedId,
      }));
    }
  }, [studentId]);

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
        selectedOfficeId: student.officeId || "",
        selectedAgentId: student.agentId || "",
      });
      // Set the actual student ID from the API response
      setActualStudentId(student._id);
    }
  }, [existingStudentData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Reset agent selection when office changes
    if (name === "selectedOfficeId") {
      setFormData({ ...formData, [name]: value, selectedAgentId: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation based on user role
    if (user?.role === "SuperAdmin") {
      // SuperAdmin must select officeId and agentId
      if (!formData.selectedOfficeId || !formData.selectedAgentId) {
        alert("Please select Office and Agent for the student!");
        return;
      }
    } else {
      // Agent/Admin must have officeId and agentId from their profile
      if (!user?.officeId || !user?._id) {
        alert("Missing office or user information!");
        return;
      }
    }

    const payload = {
      studentCode: formData.studentId,
      name: formData.name,
      email: formData.email,
      countryCode: `+${formData.countryCode}`, // react-phone-input gives code without "+"
      phoneNumber: formData.phoneNumber,
      officeId: user?.role === "SuperAdmin" ? formData.selectedOfficeId : user.officeId,
      agentId: user?.role === "SuperAdmin" ? formData.selectedAgentId : user._id,
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
        result = await updateStudent({ id: studentId, ...payload }).unwrap();
        alert(`✅ Student Updated Successfully! ID: ${formData.studentId}`);
        // Store the actual student ID for course applications
        setActualStudentId(studentId);
      } else {
        result = await addStudent(payload).unwrap();
        alert(`✅ Student Registered Successfully! ID: ${formData.studentId}`);
        // Store the actual student ID from the API response
        setActualStudentId(result.data._id);
      }
      
      // Move to documents tab after successful save
      setActiveTab("documents");
    } catch (err) {
      console.error("❌ Error saving student:", err);
      const errorMessage =
        err?.data?.message ||
        err?.data?.error ||
        err?.error ||
        "Failed to save student. Please try again.";
      alert(`❌ ${errorMessage}`);
    }
  };

  const handleNextTab = () => {
    if (activeTab === "profile") {
      setActiveTab("documents");
    } else if (activeTab === "documents") {
      setActiveTab("course");
    }
  };

  const handlePrevTab = () => {
    if (activeTab === "documents") {
      setActiveTab("profile");
    } else if (activeTab === "course") {
      setActiveTab("documents");
    }
  };

  // Helper function to check if student has already applied to a course
  const hasAppliedToCourse = (courseId) => {
    if (!studentApplications?.data) return false;
    return studentApplications.data.some(app => app.courseId?._id === courseId);
  };

  const handleApplyToCourse = async (courseId) => {
    if (!actualStudentId) {
      alert("Please complete student registration first!");
      return;
    }

    try {
      // Create application using the new Applications API
      await createApplication({
        studentId: actualStudentId,
        courseId: courseId,
        priority: "medium",
        notes: `Application submitted for ${formData.name}`
      }).unwrap();
      alert("✅ Successfully applied to course!");
      // Navigate to the application detail page
      navigate(`/application/student/${actualStudentId}`);
    } catch (err) {
      console.error("❌ Error applying to course:", err);
      const errorMessage =
        err?.data?.message ||
        err?.data?.error ||
        err?.error ||
        "Failed to apply to course. Please try again.";
      alert(`❌ ${errorMessage}`);
    }
  };

  const inputClass = "p-2 border-b w-full focus:outline-none focus:ring-0";

  // Show loading state when fetching existing student data
  if (isEditMode && isLoadingStudent) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student information...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Update Student Information" : "Add New Student"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditMode ? "Update student profile and manage applications" : "Create a new student profile and apply to courses"}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "profile", label: "Profile Information" },
                { id: "documents", label: "Documents" },
                { id: "course", label: "Apply for Course" },
                { id: "applications", label: "Applications" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "profile" && (
              <form onSubmit={handleSubmit} className="space-y-10">
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

                {/* SuperAdmin Office and Agent Selection */}
                {user?.role === "SuperAdmin" && (
                  <section>
                    <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b-2 pb-2">
                      Office & Agent Assignment
                    </h3>
                   
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-blue-600 font-semibold mb-2">
                          Office *
                        </label>
                        <select
                          name="selectedOfficeId"
                          value={formData.selectedOfficeId}
                          onChange={handleChange}
                          required
                          className={inputClass}
                          disabled={isLoadingOffices}
                        >
                          <option value="">
                            {isLoadingOffices ? "Loading offices..." : "Select Office"}
                          </option>
                          {officesData?.data?.map((office) => (
                            <option key={office._id} value={office._id}>
                              {office.name}
                            </option>
                          ))}
                        </select>
                        {officesError && (
                          <p className="text-red-500 text-sm mt-1">
                            Error loading offices: {officesError?.data?.message || officesError?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-blue-600 font-semibold mb-2">
                          Agent *
                        </label>
                        <select
                          name="selectedAgentId"
                          value={formData.selectedAgentId}
                          onChange={handleChange}
                          required
                          className={inputClass}
                          disabled={!formData.selectedOfficeId || isLoadingAgents}
                        >
                          <option value="">
                            {!formData.selectedOfficeId 
                              ? "Select Office first" 
                              : isLoadingAgents 
                                ? "Loading agents..." 
                                : "Select Agent"
                            }
                          </option>
                          {formData.selectedOfficeId && agentsData?.data?.filter(agent => 
                            agent.officeId === formData.selectedOfficeId && agent.role === "Agent"
                          ).map((agent) => (
                            <option key={agent._id} value={agent._id}>
                              {agent.name} ({agent.email})
                            </option>
                          ))}
                        </select>
                        {agentsError && (
                          <p className="text-red-500 text-sm mt-1">
                            Error loading agents: {agentsError?.data?.message || agentsError?.message}
                          </p>
                        )}
                        {formData.selectedOfficeId && agentsData?.data?.filter(agent => 
                          agent.officeId === formData.selectedOfficeId && agent.role === "Agent"
                        ).length === 0 && !isLoadingAgents && (
                          <p className="text-orange-500 text-sm mt-1">
                            No agents found for this office
                          </p>
                        )}
                      </div>
                    </div>
                  </section>
                )}

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

                    {/* Phone Input with all countries */}
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

                {/* Education Section */}
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
            )}

            {activeTab === "documents" && (
              <DocumentsTab 
                studentId={actualStudentId || formData.studentId}
                onPrev={handlePrevTab}
                onNext={handleNextTab}
              />
            )}

            {activeTab === "course" && (
              <div className="py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  Apply for Course
                </h2>
                
                {/* Course Search Filters */}
                <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-blue-600">Course Filters</h3>
                  
                  {/* First Row - Search and Country */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={courseFilters.search}
                      onChange={(e) => setCourseFilters({...courseFilters, search: e.target.value})}
                      className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={courseFilters.country}
                      onChange={(e) => setCourseFilters({...courseFilters, country: e.target.value})}
                      className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Countries</option>
                      <option value="Australia">Australia</option>
                      <option value="Canada">Canada</option>
                      <option value="Germany">Germany</option>
                      <option value="New Zealand">New Zealand</option>
                      <option value="Singapore">Singapore</option>
                      <option value="UK">UK</option>
                      <option value="USA">USA</option>
                    </select>
                  </div>

                  {/* Second Row - University, Intake, Type, Fee Sort */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      type="text"
                      placeholder="University..."
                      value={courseFilters.university}
                      onChange={(e) => setCourseFilters({...courseFilters, university: e.target.value})}
                      className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Intake..."
                      value={courseFilters.intake}
                      onChange={(e) => setCourseFilters({...courseFilters, intake: e.target.value})}
                      className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={courseFilters.type}
                      onChange={(e) => setCourseFilters({...courseFilters, type: e.target.value})}
                      className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Types</option>
                      <option value="Bachelors">Bachelors</option>
                      <option value="Masters">Masters</option>
                      <option value="PhD">PhD</option>
                    </select>
                    <select
                      value={courseFilters.feeSort}
                      onChange={(e) => setCourseFilters({...courseFilters, feeSort: e.target.value})}
                      className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Fee Sort</option>
                      <option value="high-to-low">Fee: High to Low</option>
                      <option value="low-to-high">Fee: Low to High</option>
                    </select>
                  </div>

                  {/* Clear Filters Button */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setCourseFilters({
                        search: "",
                        country: "",
                        type: "",
                        university: "",
                        intake: "",
                        feeSort: "",
                      })}
                      className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>

                {/* Course List */}
                <div className="space-y-4">
                  {isLoadingCourses ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading courses...</p>
                    </div>
                  ) : coursesData?.data?.length > 0 ? (
                    coursesData.data.map((course) => (
                      <div key={course._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{course.name}</h3>
                            <p className="text-gray-600 mb-2">{course.university}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                              <div>
                                <span className="font-medium">Country:</span> {course.country}
                              </div>
                              <div>
                                <span className="font-medium">Type:</span> {course.type}
                              </div>
                              <div>
                                <span className="font-medium">Fee:</span> {course.fee}
                              </div>
                              <div>
                                <span className="font-medium">Duration:</span> {course.timePeriod}
                              </div>
                            </div>
                            <div className="mt-3 text-sm text-gray-500">
                              <span className="font-medium">Requirements:</span> {course.percentageRequirement}% | {course.languageTest}: {course.minBands}
                            </div>
                          </div>
                          <div className="ml-4">
                            {hasAppliedToCourse(course._id) ? (
                              <button
                                disabled
                                className="px-6 py-2 bg-green-600 text-white rounded-lg cursor-not-allowed"
                              >
                                ✓ Applied
                              </button>
                            ) : (
                              <button
                                onClick={() => handleApplyToCourse(course._id)}
                                disabled={isLinking}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isLinking ? "Applying..." : "Apply to Course"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Found</h3>
                      <p className="text-gray-500 mb-6">Try adjusting your search filters to find courses.</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {coursesData?.data?.length > 0 && coursesData?.pagination && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, coursesData.pagination.total)} of {coursesData.pagination.total} courses
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, coursesData.pagination.totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, coursesData.pagination.totalPages))}
                        disabled={currentPage === coursesData.pagination.totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={handlePrevTab}
                    className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setActiveTab("applications")}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                  >
                    View Applications
                  </button>
                </div>
              </div>
            )}

            {activeTab === "applications" && (
              <ApplicationTabLayout 
                studentId={actualStudentId} 
                initialSelectedApplicationId={location.state?.selectedApplicationId}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;