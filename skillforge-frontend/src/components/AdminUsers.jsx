import React, { useState, useEffect } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [saving, setSaving] = useState(false);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError("");
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Fetch users error:", err);
      setError("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");
      const method = editingUser ? "PATCH" : "POST";
      const endpoint = editingUser
        ? `${import.meta.env.VITE_API_URL}/api/admin/users/${editingUser._id}`
        : `${import.meta.env.VITE_API_URL}/api/admin/users`;

      const body = editingUser
        ? { name: formData.name, email: formData.email, role: formData.role }
        : formData;

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save user");
      }

      await fetchUsers();
      setShowForm(false);
      setEditingUser(null);
      setFormData({ name: "", email: "", password: "", role: "user" });
    } catch (err) {
      console.error("Save user error:", err);
      setError(err.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", role: "user" });
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      await fetchUsers();
    } catch (err) {
      console.error("Delete user error:", err);
      setError("Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 rounded-full bg-orange-600 text-white font-semibold hover:bg-orange-700 transition"
        >
          {showForm ? "Cancel" : "+ Create User"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm space-y-4"
        >
          <h3 className="text-lg font-semibold text-slate-900">
            {editingUser ? "Edit User" : "Create New User"}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="User full name"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Email*
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="user@example.com"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {!editingUser && (
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Password*
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password (min 6 characters)"
                required={!editingUser}
                minLength="6"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none"
              />
            </div>
          )}

          <div className="max-w-xs">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Role*
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-full bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-50 transition"
            >
              {saving ? "Saving..." : "Save User"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-semibold hover:border-slate-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Users Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-slate-600">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-3xl border border-orange-100 bg-white p-8 text-center">
          <p className="text-slate-600">No users found</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-orange-100 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-orange-50 border-b border-orange-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-orange-50/30 transition"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{user.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-600">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-600 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
