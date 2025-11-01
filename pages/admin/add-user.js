import { UserPlus } from 'lucide-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from './Sidebar';

export default function AddUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);
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
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Call the API route to create user
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          role: formData.role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Failed to create user' 
        });
        return;
      }

      setMessage({ 
        type: 'success', 
        text: 'User created successfully!' 
      });
      
      setFormData({
        email: '',
        full_name: '',
        role: 'staff',
        password: ''
      });
    } catch (error) {
      console.error('Error creating user:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'An error occurred. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Head><title>Add New User</title></Head>
      <div className="flex min-h-screen bg-gray-900 text-white">
        <Sidebar user={user} handleLogout={handleLogout} />

        <div className="flex-1 flex flex-col">
          <header className="bg-gray-800 p-6 border-b border-gray-700">
            <h1 className="text-xl font-bold">Add New User</h1>
          </header>
          
          <main className="p-8 flex-1 flex justify-center items-center">
            <div className="max-w-2xl w-full">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center mb-6">
                  <UserPlus className="w-6 h-6 mr-3 text-indigo-400" />
                </div>

                {message.text && (
                  <div className={`p-4 rounded-lg mb-6 ${
                    message.type === 'success' 
                      ? 'bg-green-500 bg-opacity-20 text-white-400 border border-green-500' 
                      : 'bg-red-500 bg-opacity-20 text-white border border-red-500' // Changed text-red-400 to text-white
                  }`}>
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="user@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Minimum 6 characters"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select a role</option>
                      <option value="staff">Staff</option>
                      <option value="front-office">Front Office</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-medium transition-colors"
                  >
                    {submitting ? 'Creating User...' : 'Create User'}
                  </button>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
