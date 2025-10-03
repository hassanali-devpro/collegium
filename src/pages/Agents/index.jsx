import React, { useState } from "react";
import {
  useGetAgentsQuery,
  useCreateAgentMutation,
  useUpdateAgentMutation,
  useDeleteAgentMutation,
  useActivateAgentMutation,
  useDeactivateAgentMutation,
} from "../../features/agents/agentApi";
import { useGetOfficesQuery } from "../../features/offices/officeApi";

const AgentsPage = () => {
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useGetAgentsQuery({ page, limit: 10 });

  const {
    data: officesData,
    error: officesError,
    isLoading: officesLoading,
  } = useGetOfficesQuery({ page: 1, limit: 10 });

  const [createAgent] = useCreateAgentMutation();
  const [updateAgent] = useUpdateAgentMutation();
  const [deleteAgent] = useDeleteAgentMutation();
  const [activateAgent] = useActivateAgentMutation();
  const [deactivateAgent] = useDeactivateAgentMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Agent",
    phone: "",
    officeId: "",
  });

  if (isLoading) return <p className="p-4">Loading agents...</p>;
  if (error) return <p className="p-4 text-red-500">Failed to load agents.</p>;

  const agents = data?.data || [];
  const offices = officesData?.data || [];

  const openCreateModal = () => {
    setEditingAgent(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "Agent",
      phone: "",
      officeId: "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name || "",
      email: agent.email || "",
      password: "",
      role: agent.role || "Agent",
      phone: agent.phone || "",
      officeId: agent.officeId || "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      try {
        await deleteAgent(id).unwrap();
      } catch (err) {
        console.error("Failed to delete agent:", err);
      }
    }
  };

  const handleToggleStatus = async (agent) => {
    try {
      if (agent.isActive) {
        await deactivateAgent(agent._id).unwrap();
      } else {
        await activateAgent(agent._id).unwrap();
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    try {
      if (editingAgent) {
        await updateAgent({ id: editingAgent._id, ...formData }).unwrap();
      } else {
        await createAgent(formData).unwrap();
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving agent:", err);
      if (err?.data?.errors?.length > 0) {
        setFormError(err.data.errors[0].msg);
      } else if (err?.data?.message) {
        setFormError(err.data.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agents</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Create User
        </button>
      </div>


      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 border-b text-left">Name</th>
              <th className="px-4 py-2 border-b text-left">Email</th>
              <th className="px-4 py-2 border-b text-left">Phone</th>
              <th className="px-4 py-2 border-b text-left">Role</th>
              <th className="px-4 py-2 border-b text-left">Status</th>
              <th className="px-4 py-2 border-b text-left">Last Login</th>
              <th className="px-4 py-2 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{agent.name}</td>
                <td className="px-4 py-2 border-b">{agent.email}</td>
                <td className="px-4 py-2 border-b">{agent.phone}</td>
                <td className="px-4 py-2 border-b">
                  <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                    {agent.role}
                  </span>
                </td>
                <td className="px-4 py-2 border-b">
                  <button
                    onClick={() => handleToggleStatus(agent)}
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${agent.isActive
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                  >
                    {agent.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-4 py-2 border-b">
                  {agent.lastLogin
                    ? new Date(agent.lastLogin).toLocaleString()
                    : "Never"}
                </td>
                <td className="px-4 py-2 border-b text-center space-x-2">
                  <button
                    onClick={() => openEditModal(agent)}
                    className="my-1 px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(agent._id)}
                    className="my-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>


                  <div className="flex items-center justify-center mt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agent.isActive}
                        onChange={() => handleToggleStatus(agent)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-500 peer-focus:ring-2 peer-focus:ring-green-300 transition-all"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transform transition-all"></div>
                    </label>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data?.pagination?.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span>
            Page {page} of {data?.pagination?.totalPages}
          </span>

          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page === data?.pagination?.totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingAgent ? "Edit User" : "Create User"}
            </h2>

            {formError && (
              <p className="text-red-500 text-sm mb-2">{formError}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                className="w-full border p-2 rounded"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full border p-2 rounded"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
              {!editingAgent && (
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full border p-2 rounded"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              )}
              <select
                className="w-full border p-2 rounded"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="Agent">Agent</option>
                <option value="Admin">Admin</option>
                <option value="SuperAdmin">Super Admin</option>
              </select>
              <input
                type="text"
                placeholder="Phone"
                className="w-full border p-2 rounded"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />

              {/* Office Select */}
              <select
                className="w-full border p-2 rounded"
                value={formData.officeId}
                onChange={(e) =>
                  setFormData({ ...formData, officeId: e.target.value })
                }
                required
              >
                <option value="">Select Office</option>
                {offices.map((office) => (
                  <option key={office._id} value={office._id}>
                    {office.name}
                  </option>
                ))}
              </select>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingAgent ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentsPage;
