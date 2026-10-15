import React, { useState } from 'react';
import { 
  Users, 
  Activity, 
  Search, 
  UserCheck, 
  UserX, 
  Eye, 
  Trash2, 
  Calendar,
  X
} from 'lucide-react';
import { sampleUsers } from '../data/sampleUsers';
import { User } from '../types';

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);
    return matchesSearch && matchesFilter && user.role !== 'admin';
  });

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
  };

  const deleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      setSelectedUser(null);
    }
  };

  const totalUsers = users.filter(u => u.role !== 'admin').length;
  const activeUsers = users.filter(u => u.role !== 'admin' && u.isActive).length;
  const newUsersThisMonth = users.filter(u => {
    const userDate = new Date(u.createdAt);
    const now = new Date();
    return userDate.getMonth() === now.getMonth() && 
           userDate.getFullYear() === now.getFullYear() &&
           u.role !== 'admin';
  }).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold text-[#2D5A46] uppercase tracking-wider">Administrative Suite</span>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#163327] mt-1">Platform Admin Console</h2>
        <p className="text-sm text-[#4E6B5D] mt-1">
          Review community membership, active sessions, and system health.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-[#E5EDE7] shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5C7A6D]">Total Accounts</p>
              <p className="text-2xl font-bold tabular-nums text-[#163327] mt-1">{totalUsers}</p>
            </div>
            <div className="p-3 bg-[#EAF2EC] rounded-2xl text-[#2D5A46]">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#E5EDE7] shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5C7A6D]">Active Members</p>
              <p className="text-2xl font-bold tabular-nums text-[#2D5A46] mt-1">{activeUsers}</p>
            </div>
            <div className="p-3 bg-[#EAF2EC] rounded-2xl text-[#2D5A46]">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#E5EDE7] shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5C7A6D]">New This Month</p>
              <p className="text-2xl font-bold tabular-nums text-[#163327] mt-1">{newUsersThisMonth}</p>
            </div>
            <div className="p-3 bg-[#EAF2EC] rounded-2xl text-[#2D5A46]">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#E5EDE7] shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5C7A6D]">System Health</p>
              <p className="text-2xl font-bold text-[#2D5A46] mt-1">99.9%</p>
            </div>
            <div className="p-3 bg-[#EAF2EC] rounded-2xl text-[#2D5A46]">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-3xl border border-[#E5EDE7] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#F0F4F1] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-base font-bold text-[#163327]">Member Directory</h3>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-[#D8E4DC] rounded-xl text-xs bg-[#F9FAF8] focus:outline-none focus:ring-1 focus:ring-[#2D5A46]"
              />
            </div>

            <div className="flex items-center gap-1 bg-[#F4F7F5] p-1 rounded-xl text-xs">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterStatus === 'all' ? 'bg-white font-semibold text-[#163327] shadow-xs' : 'text-[#5C7A6D]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterStatus === 'active' ? 'bg-white font-semibold text-[#163327] shadow-xs' : 'text-[#5C7A6D]'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus('inactive')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterStatus === 'inactive' ? 'bg-white font-semibold text-[#163327] shadow-xs' : 'text-[#5C7A6D]'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F9FAF8] border-b border-[#F0F4F1] text-[11px] font-semibold text-[#5C7A6D] uppercase tracking-wider">
                <th className="py-3 px-6">User</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Joined Date</th>
                <th className="py-3 px-6">Last Active</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F1]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#FDFEFC] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#EAF2EC] text-[#2D5A46] font-bold flex items-center justify-center text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#163327]">{user.name}</p>
                        <p className="text-[#5C7A6D]">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                      user.isActive
                        ? 'bg-[#EAF2EC] text-[#2D5A46]'
                        : 'bg-stone-100 text-stone-600'
                    }`}>
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-[#5C7A6D] tabular-nums">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  <td className="py-4 px-6 text-[#5C7A6D] tabular-nums">
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </td>

                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="p-1.5 text-[#5C7A6D] hover:text-[#163327] hover:bg-stone-100 rounded-lg transition-colors"
                      title="Inspect User Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        user.isActive 
                          ? 'text-amber-600 hover:bg-amber-50' 
                          : 'text-[#2D5A46] hover:bg-[#EAF2EC]'
                      }`}
                      title={user.isActive ? 'Suspend User' : 'Reactivate User'}
                    >
                      {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Permanently Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal Details */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-[#163327]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FBFBF7] border border-[#D8E4DC] rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-5 right-5 p-1 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#163327]">Member Snapshot</h3>
            <div className="p-4 rounded-2xl bg-white border border-[#E5EDE7] space-y-2 text-xs">
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              <p><strong>Account ID:</strong> <span className="font-mono">{selectedUser.id}</span></p>
              <p><strong>Member Since:</strong> {selectedUser.createdAt}</p>
              <p><strong>Status:</strong> {selectedUser.isActive ? 'Active' : 'Inactive'}</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#2D5A46] hover:bg-[#234739] rounded-xl shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;