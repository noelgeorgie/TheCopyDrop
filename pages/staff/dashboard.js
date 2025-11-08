import { CheckCircle, Clock } from 'lucide-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient'; // Use the same client
import StaffSidebar from './Sidebar'; // Import the new sidebar

// Create a map for Tailwind classes so they are not purged
const colorClasses = {
  indigo: {
    bg: 'bg-indigo-500',
    text: 'text-indigo-400',
  },
  yellow: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-400',
  },
  green: {
    bg: 'bg-green-500',
    text: 'text-green-400',
  },
};

// A simple stat card component
const StatCard = ({ title, count, icon: Icon, color = 'indigo' }) => {
  // Look up the classes from our map
  const colors = colorClasses[color] || colorClasses.indigo;

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <p className="text-4xl font-bold">{count}</p>
          <h3 className="text-gray-400 mt-1">{title}</h3>
        </div>
        {/* Use the full class names from the map */}
        <div className={`p-3 rounded-lg ${colors.bg} bg-opacity-20`}>
          <Icon size={28} className={colors.text} />
        </div>
      </div>
    </div>
  );
};

export default function StaffDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, completed: 0 });
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      // 1. Get session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // 2. Fetch user's profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', session.user.id)
        .single();
      
      // 3. Auth Guard: Check for errors or wrong role
      if (error || !profile || profile.role !== 'staff') {
        // If not 'staff', sign out and send to login
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }
      
      // 4. Set user
      setUser({ ...session.user, ...profile });
      
      // 5. FIXED: Fetch real stats efficiently
      const { count: pendingCount, error: pendingError } = await supabase
        .from('print_jobs')
        .select('*', { count: 'exact', head: true }) // 'head: true' only returns the count
        .eq('requester_id', session.user.id)
        .eq('status', 'pending');

      const { count: completedCount, error: completedError } = await supabase
        .from('print_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('requester_id', session.user.id)
        .eq('status', 'completed');
      
      if (pendingError || completedError) {
        console.error('Error fetching stats:', pendingError || completedError);
      } else {
        // Update the state with the counts from the database
        setStats({ 
          pending: pendingCount || 0, 
          completed: completedCount || 0 
        });
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
        <p>Loading Staff Dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <Head><title>Staff Dashboard</title></Head>
      <div className="flex min-h-screen bg-gray-900 text-white">
        <StaffSidebar user={user} handleLogout={handleLogout} />

        <div className="flex-1 flex flex-col">
          <header className="bg-gray-800 p-6 border-b border-gray-700">
            <h1 className="text-xl font-bold">Welcome, {user?.full_name}</h1>
          </header>
          
          <main className="p-8 flex-1">
            <h2 className="text-3xl font-bold mb-6">My Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <StatCard 
                title="Total no: of Print Job Submitted" 
                count={stats.pending} 
                icon={Clock} 
                color="yellow" 
              />
              <StatCard 
                title="Total no: of Print Jobs Completed" 
                count={stats.completed} 
                icon={CheckCircle} 
                color="green" 
              />
              
            </div>
          </main>
        </div>
      </div>
    </>
  );
}