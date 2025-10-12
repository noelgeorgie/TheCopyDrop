import { LayoutDashboard, LogOut, Users } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ManageUsersPage() {
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name, email')
        .eq('id', session.user.id)
        .single();

      if (!profile || profile.role !== 'scc-admin') {
        router.push('/login');
        return;
      }

      setUser(profile);

      // Fetch all user profiles for management
      const { data: allProfiles } = await supabase.from('profiles').select('id, full_name, role');
      if (allProfiles) setProfiles(allProfiles);

      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleRoleChange = async (profileId, newRole) => {
    await supabase.from('profiles').update({ role: newRole }).eq('id', profileId);
    // Refresh list after update
    const { data: updatedProfiles } = await supabase.from('profiles').select('id, full_name, role');
    if (updatedProfiles) setProfiles(updatedProfiles);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Verifying access...</div>;
  }

  return (
    <>
      <Head>
        <title>User Management // SCC Portal</title>
      </Head>
      <div className="flex min-h-screen bg-gray-900 text-white">
        {/* --- SIDEBAR --- */}
        <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-xl font-bold tracking-wider">SCC/ADMIN</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/admin/dashboard" legacyBehavior>
              <a className="flex items-center p-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white">
                <LayoutDashboard className="w-5 h-5 mr-3" />
                <span>Dashboard</span>
              </a>
            </Link>
            <Link href="/admin/manage-users" legacyBehavior>
              <a className="flex items-center p-3 rounded-lg bg-indigo-600 text-white">
                <Users className="w-5 h-5 mr-3" />
                <span>User Management</span>
              </a>
            </Link>
          </nav>
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold">{user?.full_name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-700">
                <LogOut className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-6">User Role Management</h1>
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <table className="w-full text-left">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Current Role</th>
                  <th className="p-4">Assign Role</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-t border-gray-700">
                    <td className="p-4">{p.full_name}</td>
                    <td className="p-4">{p.role || 'Not Assigned'}</td>
                    <td className="p-4">
                      <select
                        value={p.role || ''}
                        onChange={(e) => handleRoleChange(p.id, e.target.value)}
                        className="bg-gray-600 p-2 rounded"
                      >
                        <option value="" disabled>Select Role</option>
                        <option value="scc-admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="front-office">Front Office</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </>
  );
}