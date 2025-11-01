import { AlertTriangle, Edit2, Search, Trash2, Users, X } from 'lucide-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from './Sidebar';

// A simple, reusable modal component
function DeleteModal({ user, onCancel, onConfirm }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex items-center">
          <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
          <h2 className="text-xl font-bold text-white">Delete User</h2>
        </div>
        <p className="text-gray-300 my-4">
          Are you sure you want to delete this user? This action is permanent and cannot be undone.
        </p>
        <div className="bg-gray-700 p-3 rounded-lg border border-gray-600">
          <p className="text-white font-medium">{user.full_name}</p>
          <p className="text-gray-400 text-sm">{user.email}</p>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(user.id)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManageUsers() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null); // For modal
  const [message, setMessage] = useState({ type: '', text: '' });
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', session.user.id)
        .single();
      
      if (error || !profile || profile.role !== 'scc-admin') {
        router.push('/login');
        return;
      }
      
      setUser({ ...session.user, ...profile });
      await fetchUsers();
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const fetchUsers = async () => {
    const { data, error } = await supabase.rpc('get_profiles_data');
    if (!error && data) {
      setUsers(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // NEW handleDeleteUser - calls our API
  const handleDeleteUser = async (userId) => {
    setUserToDelete(null); // Close modal
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }
      
      setMessage({ type: 'success', text: 'User deleted successfully' });
      await fetchUsers(); // Refresh the list
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete user: ' + error.message });
    }
  };

  // NEW handleUpdateRole - calls our API
  const handleUpdateRole = async (userId, newRole) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch('/api/admin/update-user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ userId, newRole })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update role');
      }
      
      setMessage({ type: 'success', text: 'User role updated successfully' });
      setEditingUser(null);
      await fetchUsers(); // Refresh the list
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update role: ' + error.message });
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Head><title>Manage Users</title></Head>

      {/* Render the delete modal */}
      <DeleteModal 
        user={userToDelete}
        onCancel={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
      />

      <div className="flex min-h-screen bg-gray-900 text-white">
        <Sidebar user={user} handleLogout={handleLogout} />

        <div className="flex-1 flex flex-col">
          <header className="bg-gray-800 p-6 border-b border-gray-700">
            <h1 className="text-xl font-bold">Manage Users</h1>
          </header>
          
          <main className="p-8 flex-1">
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 mr-3 text-indigo-400" />
                <h2 className="text-2xl font-bold">All Users</h2>
              </div>

              {message.text && (
                <div className={`p-4 rounded-lg mb-4 ${
                  message.type === 'success' 
                    ? 'bg-green-500 bg-opacity-20 text-green-400 border border-green-500' 
                    : 'bg-red-500 bg-opacity-20 text-white border border-red-500' // Using white text for error
                }`}>
                  {message.text}
                </div>
              )}

              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Roles</option>
                  <option value="staff">Staff</option>
                  <option value="front-office">Front Office</option>
                  <option value="scc-admin">SCC Admin</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-750 border-b border-gray-700">
                  <tr>
                    <th className="text-left p-4 font-semibold">Name</th>
                    <th className="text-left p-4 font-semibold">Email</th>
                    <th className="text-left p-4 font-semibold">Role</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="p-4">{u.full_name || 'N/A'}</td>
                      <td className="p-4 text-gray-400">{u.email}</td>
                      <td className="p-4">
                        {editingUser === u.id ? (
                          <select
                            defaultValue={u.role}
                            // This now calls the API-backed function
                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                            onBlur={() => setEditingUser(null)}
                            autoFocus
                            className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="staff">Staff</option>
                            <option value="front-office">Front Office</option>
                            <option value="scc-admin">SCC Admin</option>
                          </select>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            u.role === 'scc-admin' ? 'bg-purple-500 bg-opacity-20 text-purple-300' :
                            u.role === 'staff' ? 'bg-green-500 bg-opacity-20 text-green-300' :
                            u.role === 'front-office' ? 'bg-yellow-500 bg-opacity-20 text-yellow-300' :
                            'bg-gray-500 bg-opacity-20 text-gray-300'
                          }`}>
                            {u.role || 'Unassigned'}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingUser(editingUser === u.id ? null : u.id)}
                            className="p-2 hover:bg-gray-700 rounded transition-colors"
                            title="Edit role"
                          >
                            {editingUser === u.id ? <X className="w-4 h-4 text-gray-400" /> : <Edit2 className="w-4 h-4 text-indigo-400" />}
                          </button>
                          <button
                            // This now opens the modal
                            onClick={() => setUserToDelete(u)}
                            className="p-2 hover:bg-gray-700 rounded transition-colors"
                            title="Delete user"
                            disabled={u.id === user.id}
                          >
                            <Trash2 className={`w-4 h-4 ${u.id === user.id ? 'text-gray-600' : 'text-red-400 hover:text-red-500'}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-400">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}