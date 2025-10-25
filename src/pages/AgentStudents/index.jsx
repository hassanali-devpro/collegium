import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetAgentStudentsQuery } from "../../features/agentStudent/agentStudentApi";
import { Loader2 } from "lucide-react";

const AgentStudents = () => {
  const { user } = useSelector((state) => state.auth);
  const agentId = user?._id;
  console.log(agentId)

  const { data, isLoading, isError } = useGetAgentStudentsQuery(
    { agentId, page: 1, limit: 10 },
    { skip: !agentId } // prevents query until agentId exists
  );

  if (!agentId)
    return <p className="text-center text-gray-600 py-10">Agent not logged in.</p>;

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
      </div>
    );

  if (isError)
    return <p className="text-red-500 text-center py-10">Failed to load students.</p>;

  const students = data?.data || [];

  if (students.length === 0)
    return <p className="text-center text-gray-600 py-10">No students found.</p>;

  return (
    <div className="">
      {students.map((student) => (
        <div
          key={student._id}
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="font-semibold text-blue-600">Student ID: </span>
              {student.studentCode}
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="font-semibold text-blue-600">Name: </span>
              {student.name}
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="font-semibold text-blue-600">Phone: </span>
              {student.phoneNumber || student.phone}
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="font-semibold text-blue-600">Email: </span>
              {student.email}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to={`/student/edit/${student._id}`}
              className="inline-block px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-medium transition"
            >
              Visit Profile
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgentStudents;
