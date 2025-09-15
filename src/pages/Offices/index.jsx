// src/pages/Offices.jsx
import React, { useState } from "react";
import {
  useGetOfficesQuery,
  useAddOfficeMutation,
  useUpdateOfficeMutation,
  useDeleteOfficeMutation,
} from "../../features/offices/officeApi";

export default function Offices() {
  const { data, error, isLoading } = useGetOfficesQuery({ page: 1, limit: 10 });
  const [addOffice] = useAddOfficeMutation();
  const [updateOffice] = useUpdateOfficeMutation();
  const [deleteOffice] = useDeleteOfficeMutation();

  const [form, setForm] = useState({ id: null, name: "", location: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const offices =
    data?.data?.map((o) => ({
      id: o._id,
      name: o.name,
      location: o.address,
      createdAt: o.createdAt,
    })) || [];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    if (!form.name || !form.location) return;
    try {
      await addOffice({
        name: form.name,
        address: form.location,
      }).unwrap();
      resetForm();
    } catch (err) {
      console.error("Failed to add office:", err);
    }
  };

  const handleEdit = (office) => {
    setIsEditing(true);
    setForm(office);
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await updateOffice({
        id: form.id,
        name: form.name,
        address: form.location,
      }).unwrap();
      resetForm();
    } catch (err) {
      console.error("Failed to update office:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteOffice(id).unwrap();
    } catch (err) {
      console.error("Failed to delete office:", err);
    }
  };

  const resetForm = () => {
    setForm({ id: null, name: "", location: "" });
    setIsEditing(false);
    setIsModalOpen(false);
  };

  if (isLoading) return <p>Loading offices...</p>;
  if (error)
    return (
      <p className="text-red-500">
        {error.data?.message || "Error loading offices"}
      </p>
    );

  return (
    <div className="min-h-full flex items-start justify-center">
      <div className="bg-white shadow-2xl rounded-2xl p-6 w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Office Management
        </h1>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              setIsEditing(false);
              setForm({ id: null, name: "", location: "" });
              setIsModalOpen(true);
            }}
            className="bg-[#F42222] text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            + Add Office
          </button>
        </div>

        <ul className="space-y-3">
          {offices.map((office) => {
            const date = new Date(office.createdAt).toLocaleString();
            return (
              <li
                key={office.id}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm"
              >
                <div>
                  <p className="font-semibold">{office.name}</p>
                  <p className="text-sm text-gray-600">{office.location}</p>
                  <p className="text-xs text-gray-500">Created: {date}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(office)}
                    className="bg-yellow-400 text-white px-3 py-1 rounded-lg hover:bg-yellow-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(office.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-5 p-6 relative">
            <h2 className="text-xl font-bold mb-4 text-center">
              {isEditing ? "Edit Office" : "Add Office"}
            </h2>

            <input
              type="text"
              name="name"
              placeholder="Office Name"
              value={form.name}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full mb-3"
            />

            <input
              type="text"
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-full mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={resetForm}
                className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>

              {isEditing ? (
                <button
                  onClick={handleUpdate}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Update
                </button>
              ) : (
                <button
                  onClick={handleAdd}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Add
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
