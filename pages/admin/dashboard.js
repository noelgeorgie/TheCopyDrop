// components/layouts/AdminLayout.js

import { BarChart3, Users } from 'lucide-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from '../admin/Sidebar'; // Assuming you have a Sidebar component

// A new header component that sits inside the layout
function AdminHeader({ pageTitle, stats }) {
  return (
    <header className="bg-gray-800 border-b border-gray-700 p-6">
      <h1 className="text-3xl font-bold mb-4">{pageTitle}</h1>
      
      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stat Card: Total Users */}
        <div className="bg-gray-700 p-4 rounded-lg flex items-center">
          <div className="bg-indigo-600 p-3 rounded-md mr-4">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Users</p>
            <p className="text-2xl font-bold">{stats.userCount}</p>
          </div>
        </div>

        {/* You can add more stat cards here */}
        <div className="bg-gray-700 p-4 rounded-lg flex items-center">
          <div className="bg-green-600 p-3 rounded-md mr-4">
              <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
              <p className="text-sm text-gray-400">Example Stat</p>
              <p className="text-2xl font-bold">123</p>
          </div>
        </div>
      </div>
    </header>
  );
}


// This component wraps every admin page
export default function AdminLayout({ children, pageTitle }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ userCount: 0 }); // State for statistics
  const router = useRouter();

  // This security check now protects every page that uses this layout
  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', session.user.id)
          .single();
        
        if (profile && profile.role === 'scc-admin') {
          setUser({ ...session.user, ...profile });

          // --- FETCH STATISTICS ---
          // Fetch the total count of users from the 'profiles' table
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true }); // 'head: true' is efficient for just getting the count
          
          if(count) {
            setStats({ userCount: count });
          }
          // --- END OF FETCH ---

          setLoading(false);
        } else {
          router.push('/login'); // Deny access
        }
      } else {
        router.push('/login'); // Deny access
      }
    };
    checkUserRole();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <p>Verifying administrative access...</p>
        </div>
    );
  }

  return (
    <>
      <Head>
        <title>{pageTitle} // Admin Panel</title>
      </Head>
      <div className="flex min-h-screen bg-gray-900 text-white">
        {/* The Sidebar component now gets user info and logout function */}
        <Sidebar user={user} handleLogout={handleLogout} />
        
        <div className="flex-1 flex flex-col">
          {/* --- NEW HEADER COMPONENT --- */}
          <AdminHeader pageTitle={pageTitle} stats={stats} />

          {/* Main content area where the page's content will be rendered */}
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}