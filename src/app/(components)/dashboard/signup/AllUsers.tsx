'use client';

import React, { useEffect, useState } from 'react';

interface User {
  _id: string;
  username: string;
  role: 'user' | 'admin';
}

const AllUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/signup');
      const result = await response.json();
      if (response.ok && result.success) {
        setUsers(result.data);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to fetch users' });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setMessage({ type: 'error', text: 'Network error while fetching users' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      setDeleteLoading(id);
      const response = await fetch(`/api/users/signup?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setUsers(prev => prev.filter(user => user._id !== id));
        setMessage({ type: 'success', text: result.message || 'User deleted successfully' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to delete user' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ type: 'error', text: 'Network error while deleting user' });
    } finally {
      setDeleteLoading(null);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) return <div className="p-6 text-white">Loading users...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-white mb-4">All Users</h2>

      <input
        type="text"
        placeholder="Search by username..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full mb-6 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 text-sm"
      />

      {message && (
        <div
          className={`mb-4 p-3 rounded text-sm ${
            message.type === 'success' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {filteredUsers.length === 0 ? (
        <div className="text-gray-400 text-sm">No users found.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredUsers.map(user => (
            <div
              key={user._id}
              className="bg-gray-800 border border-gray-700 rounded p-4 text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="w-full break-words">
                <p className="text-white font-semibold">Username: {user.username}</p>
                <p className="text-gray-400">Role: {user.role}</p>
              </div>
              <button
                onClick={() => handleDelete(user._id)}
                disabled={deleteLoading === user._id}
                className={`w-full sm:w-auto px-4 py-2 rounded text-white text-sm ${
                  deleteLoading === user._id
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {deleteLoading === user._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllUsers;
