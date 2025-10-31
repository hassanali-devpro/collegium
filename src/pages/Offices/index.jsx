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

  const [form, setForm] = useState({ id: null, name: "", address: "", location: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const offices =
    data?.data?.map((o) => ({
      id: o._id,
      name: o.name,
      address: o.address,
      location: o.location,
      createdAt: o.createdAt,
    })) || [];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async () => {
    if (!form.name || !form.address || !form.location) return;
    try {
      await addOffice({
        name: form.name,
        address: form.address,
        location: form.location,
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
        address: form.address,
        location: form.location,
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
    setForm({ id: null, name: "", address: "", location: "" });
    setIsEditing(false);
    setIsModalOpen(false);
  };

  if (isLoading) return <p>Loading offices...</p>;
  if (error)
    return (
      <p className="text-gray-700">
        {error.data?.message || "Error loading offices"}
      </p>
    );

  return (
    <div className="min-h-full flex items-start justify-center p-2 sm:p-6">
      <div className="bg-white shadow-md rounded-2xl p-4 sm:p-6 w-full max-w-5xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Office Management
        </h1>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              setIsEditing(false);
              setForm({ id: null, name: "", address: "", location: "" });
              setIsModalOpen(true);
            }}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
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
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-100 p-3 rounded-lg shadow-sm gap-3 sm:gap-0"
              >
                <div>
                  <p className="font-semibold text-gray-800">{office.name}</p>
                  <p className="text-sm text-gray-600">{office.address}</p>
                  <p className="text-xs text-gray-500">Created: {date}</p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3">
                  {office.location && (
                    <a
                      href={
                        office.location.startsWith("http")
                          ? office.location
                          : `https://${office.location}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 transition text-sm text-center flex-1 sm:flex-none"
                    >
                      View Location
                    </a>
                  )}
                  <button
                    onClick={() => handleEdit(office)}
                    className="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 transition text-sm text-center flex-1 sm:flex-none"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(office.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition text-sm text-center flex-1 sm:flex-none"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-2 sm:px-0">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-auto p-4 sm:p-6">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
              {isEditing ? "Edit Office" : "Add Office"}
            </h2>

            <input
              type="text"
              name="name"
              placeholder="Office Name"
              value={form.name}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />

            <input
              type="text"
              name="address"
              placeholder="Office Address"
              value={form.address}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />

            <input
              type="text"
              name="location"
              placeholder="Google Maps Link"
              value={form.location}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={resetForm}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm"
              >
                Cancel
              </button>

              {isEditing ? (
                <button
                  onClick={handleUpdate}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
                >
                  Update
                </button>
              ) : (
                <button
                  onClick={handleAdd}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
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
