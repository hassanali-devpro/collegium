import React from "react";

const AgentTable = ({ agents = [] }) => {
  if (!agents || agents.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-lg shadow">
        No agents found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-sm uppercase tracking-wide">
            <th className="px-6 py-3 text-left">Name</th>
            <th className="px-6 py-3 text-left">Email</th>
            <th className="px-6 py-3 text-left">Role</th>
            <th className="px-6 py-3 text-left">Phone</th>
            <th className="px-6 py-3 text-left">Active</th>
            <th className="px-6 py-3 text-left">Last Login</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => (
            <tr
              key={agent._id}
              className="border-t hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="px-6 py-3 font-medium text-gray-900">
                {agent.name}
              </td>
              <td className="px-6 py-3 text-gray-700">{agent.email}</td>
              <td className="px-6 py-3">
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                  {agent.role}
                </span>
              </td>
              <td className="px-6 py-3 text-gray-700">{agent.phone}</td>
              <td className="px-6 py-3">
                {agent.isActive ? (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                    Inactive
                  </span>
                )}
              </td>
              <td className="px-6 py-3 text-gray-600">
                {agent.lastLogin
                  ? new Date(agent.lastLogin).toLocaleString()
                  : "Never"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AgentTable;
