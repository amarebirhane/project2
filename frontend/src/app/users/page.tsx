"use client";

import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { userService } from "@/services/userService";
import { User } from "@/types/user";
import { useToasts } from "@/components/Toast";
import Pagination from "@/components/Pagination";
import { Trash2, UserCog, Mail, Shield, Loader2, Plus, X, User as UserIcon, Lock, Save, Eye, EyeOff, Power, AlertTriangle, DownloadCloud } from "lucide-react";
import { TableSkeleton } from "@/components/Skeletons";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    pages: 0,
    size: 8
  });
  const [modalOpen, setModalOpen] = useState(false);
  // ... rest of state unchanged
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToView, setUserToView] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { addToast } = useToasts();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    password: "",
    role: "user"
  });

  const fetchUsers = async (targetPage = page) => {
    setLoading(true);
    try {
      const data = await userService.getUsers(targetPage, 8);
      setUsers(data.items);
      setPaginationInfo({
        total: data.total,
        pages: data.pages,
        size: data.size
      });
      setPage(data.page);
    } catch (error) {
      console.error("Failed to fetch users", error);
      addToast("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      setSubmitting(true);
      try {
        await userService.deleteUser(userToDelete.id);
        setUserToDelete(null);
        fetchUsers();
        addToast("User deleted successfully", "success");
      } catch (error) {
        console.error("Failed to delete user", error);
        addToast("Failed to delete user", "error");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleToggleActive = async (targetUser: User) => {
    try {
      await userService.updateUser(targetUser.id, { is_active: !targetUser.is_active });
      fetchUsers();
      addToast(`User ${targetUser.is_active ? "deactivated" : "activated"}`, "info");
    } catch (error) {
      console.error("Failed to update user status", error);
      addToast("Failed to update user status", "error");
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setShowPassword(false);
    setFormData({
      email: "",
      username: "",
      first_name: "",
      last_name: "",
      password: "",
      role: "user"
    });
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setShowPassword(false);
    setFormData({
      email: user.email,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      password: "", // Don't show password
      role: user.role
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        // Update user
        const updateData: any = { ...formData };
        if (!updateData.password) delete updateData.password;
        await userService.updateUser(editingUser.id, updateData);
      } else {
        // Create user
        await userService.createUser(formData);
      }
      setModalOpen(false);
      fetchUsers();
      addToast(editingUser ? "User updated" : "User created", "success");
    } catch (error) {
      console.error("Failed to save user", error);
      addToast("Error saving user", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-premium">System Users</h1>
            <p className="text-sm text-slate-500">Manage platform users and roles</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => userService.exportUsersCSV()}
              className="btn-primary-outline flex items-center gap-2"
            >
              <DownloadCloud size={18} /> Export CSV
            </button>
            <button 
              onClick={openCreateModal}
              className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-200"
            >
              <Plus size={18} /> Add User
            </button>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={8} />
        ) : (
          <div className="card-premium overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">User</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Joined</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold mr-3 overflow-hidden">
                          {user.first_name ? user.first_name.charAt(0) : user.username.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{user.first_name} {user.last_name}</p>
                          <p className="text-xs text-slate-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === "admin" ? "bg-red-100 text-red-700" :
                        user.role === "manager" ? "bg-amber-100 text-amber-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          title="View Details"
                          onClick={() => setUserToView(user)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all shadow-sm"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          title="Edit User"
                          onClick={() => openEditModal(user)}
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-white rounded-lg transition-all shadow-sm"
                        >
                          <UserCog className="h-4 w-4" />
                        </button>
                        <button 
                          title={user.is_active ? "Deactivate User" : "Activate User"}
                          onClick={() => handleToggleActive(user)}
                          className={`p-2 rounded-lg transition-all shadow-sm ${
                            user.is_active 
                              ? "text-slate-400 hover:text-amber-600 hover:bg-white" 
                              : "text-slate-400 hover:text-emerald-600 hover:bg-white"
                          }`}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button 
                          title="Delete User"
                          onClick={() => setUserToDelete(user)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all shadow-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <Pagination
              currentPage={page}
              totalPages={paginationInfo.pages}
              onPageChange={handlePageChange}
              pageSize={paginationInfo.size}
              totalItems={paginationInfo.total}
            />
          </div>
        )}

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  {editingUser ? <UserCog size={20} className="text-primary-600" /> : <Plus size={20} className="text-primary-600" />}
                  {editingUser ? "Edit System User" : "Add New User"}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                    <input 
                      type="text" 
                      required
                      className="input-base text-sm" 
                      value={formData.first_name}
                      onChange={e => setFormData({...formData, first_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                    <input 
                      type="text" 
                      required
                      className="input-base text-sm" 
                      value={formData.last_name}
                      onChange={e => setFormData({...formData, last_name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Username</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      className="input-base text-sm pl-10" 
                      value={formData.username}
                      onChange={e => setFormData({...formData, username: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      className="input-base text-sm pl-10" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {editingUser ? "New Password (Optional)" : "Password"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder={editingUser ? "Leave blank to keep current" : "••••••••"}
                      required={!editingUser}
                      className="input-base text-sm pl-10 pr-10" 
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Role</label>
                  <select 
                    className="input-base text-sm"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 btn-primary py-2.5 shadow-lg shadow-primary-200 flex items-center justify-center gap-2 text-sm"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {editingUser ? "Save Changes" : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {userToView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <UserIcon size={20} className="text-primary-600" />
                  User Details
                </h3>
                <button onClick={() => setUserToView(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold">
                    {userToView.first_name ? userToView.first_name.charAt(0) : userToView.username.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{userToView.first_name} {userToView.last_name}</h4>
                    <p className="text-sm text-slate-500">@{userToView.username}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">Email</span>
                    <span className="font-medium text-slate-900">{userToView.email}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">Role</span>
                    <span className="font-medium text-slate-900 capitalize">{userToView.role}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">Status</span>
                    <span className={`font-medium ${userToView.is_active ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {userToView.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">2FA Status</span>
                    <span className="font-medium text-slate-900">{userToView.is_two_factor_enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="col-span-2 border-t border-slate-100 pt-4">
                    <span className="block text-xs font-bold text-slate-500 uppercase">Account Created</span>
                    <span className="font-medium text-slate-900">{new Date(userToView.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => setUserToView(null)}
                    className="w-full px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Delete User?</h3>
                <p className="text-sm text-slate-500">
                  Are you sure you want to delete <span className="font-bold text-slate-900">{userToDelete.username}</span>? This action cannot be undone.
                </p>
                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setUserToDelete(null)}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteConfirm}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 text-sm flex justify-center items-center disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
