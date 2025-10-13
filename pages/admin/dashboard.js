import { Briefcase, ClipboardList, Users } from 'lucide-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

import Sidebar from './Sidebar';

// StatCard component remains the same
const StatCard = ({ title, count, icon: Icon, color = 'indigo' }) => (
  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col">
    <div className="flex items-start justify-between">
      <div className="flex flex-col">
        <p className="text-4xl font-bold">{count}</p>
        <h3 className="text-gray-400 mt-1">{title}</h3>
      </div>
      <div className={`p-3 rounded-lg bg-${color}-500 bg-opacity-20`}>
        <Icon size={28} className={`text-${color}-400`} />
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      // 1. Get the session, which contains auth data like email and id
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // 2. Fetch ONLY custom data from the 'profiles' table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, full_name') // ✅ REMOVED 'email' FROM HERE
        .eq('id', session.user.id)
        .single();
      
      if (error || !profile || profile.role !== 'scc-admin') {
        console.error("Access Denied or Profile Error:", error?.message);
        router.push('/login');
        return;
      }
      
      // 3. Combine the session data and profile data into one user object
      // This gives you user.email, user.id, user.full_name, user.role, etc.
      setUser({ ...session.user, ...profile }); // ✅ COMBINE OBJECTS

      // Fetch statistics (this part remains the same)
      const { data: allProfiles } = await supabase.rpc('get_profiles_data');
      if (allProfiles) {
        const roleCounts = allProfiles.reduce((acc, p) => {
          const role = p.role || 'unassigned';
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        }, {});
        roleCounts.total = allProfiles.length;
        setStats(roleCounts);
      }

      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Verifying access and loading data...</p>
      </div>
    );
  }

  return (
    <>
      <Head><title>Admin Dashboard</title></Head>
      <div className="flex min-h-screen bg-gray-900 text-white">
        {/* The Sidebar will now correctly receive the user object with the email */}
        <Sidebar user={user} handleLogout={handleLogout} />

        <div className="flex-1 flex flex-col">
          <header className="bg-gray-800 p-6 border-b border-gray-700">
            <h1 className="text-2xl font-bold">Welcome, {user?.full_name}</h1>
          </header>
          
          <main className="p-8 flex-1">
            <h2 className="text-3xl font-bold mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Users" count={stats?.total || 0} icon={Users} color="indigo" />
              <StatCard title="Staff Members" count={stats?.staff || 0} icon={Briefcase} color="green" />
              <StatCard title="Front Office Staff" count={stats?.['front-office'] || 0} icon={ClipboardList} color="yellow" />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}