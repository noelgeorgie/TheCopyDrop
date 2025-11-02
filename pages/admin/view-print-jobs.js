import { Check, Clock, FileText, Printer, X } from 'lucide-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Sidebar from './Sidebar';

// Helper component for the status badge
function StatusBadge({ status }) {
  let colors = '';
  let Icon = Clock;

  switch (status) {
    case 'pending':
      colors = 'bg-yellow-500 bg-opacity-20 text-white-300';
      Icon = Clock;
      break;
    case 'completed':
      colors = 'bg-green-500 bg-opacity-20 text-white-300';
      Icon = Check;
      break;
    case 'cancelled':
      colors = 'bg-red-500 bg-opacity-20 text-white-300';
      Icon = X;
      break;
    default:
      colors = 'bg-gray-500 bg-opacity-20 text-white-300';
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center w-fit ${colors}`}>
      <Icon className="w-4 h-4 mr-1.5" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function ViewPrintJobs() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printJobs, setPrintJobs] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(null); // Tracks which job is being updated
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
      await fetchJobs();
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const fetchJobs = async () => {
    const { data, error } = await supabase.rpc('get_print_jobs_with_names');
    if (!error && data) {
      setPrintJobs(data);
    } else if (error) {
      setMessage({ type: 'error', text: `Failed to fetch jobs: ${error.message}` });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleUpdateJobStatus = async (jobId, newStatus) => {
    setSubmitting(jobId);
    setMessage({ type: '', text: '' });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch('/api/admin/update-print-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ jobId, newStatus })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update job');
      }
      
      setMessage({ type: 'success', text: 'Job updated successfully' });
      await fetchJobs(); // Refresh the list
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to update job: ${error.message}` });
    } finally {
      setSubmitting(null);
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
      <Head><title>Manage Print Jobs</title></Head>
      <div className="flex min-h-screen bg-gray-900 text-white">
        <Sidebar user={user} handleLogout={handleLogout} />

        <div className="flex-1 flex flex-col">
          <header className="bg-gray-800 p-6 border-b border-gray-700">
            <h1 className="text-xl font-bold">Manage Print Jobs</h1>
          </header>
          
          <main className="p-8 flex-1">
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <Printer className="w-6 h-6 mr-3 text-white-400" />
                <h2 className="text-2xl font-bold">All Print Jobs</h2>
              </div>

              {message.text && (
                <div className={`p-4 rounded-lg mb-4 ${
                  message.type === 'success' 
                    ? 'bg-green-500 bg-opacity-20 text-green-400 border border-green-500' 
                    : 'bg-red-500 bg-opacity-20 text-white border border-red-500'
                }`}>
                  {message.text}
                </div>
              )}
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-x-auto">
              <table className="w-full min-w-full">
                <thead className="bg-gray-750 border-b border-gray-700">
                  <tr>
                    <th className="text-left p-4 font-semibold">Requester</th>
                    <th className="text-left p-4 font-semibold">File</th>
                    <th className="text-left p-4 font-semibold">Details</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Submitted</th>
                    <th className="text-left p-4 font-semibold">Notes</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {printJobs.map((job) => (
                    <tr key={job.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="p-4 whitespace-nowrap">{job.requester_name || 'N/A'}</td>
                      <td className="p-4 whitespace-nowGrap">
                        <a 
                          
                          className="text-indigo-400 hover:underline flex items-center"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          {job.original_filename}
                        </a>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {job.copy_count} {job.copy_count > 1 ? 'copies' : 'copy'}
                        <br />
                        <span className="text-white-400">{job.is_color ? 'Color' : 'Black & White'}</span>
                      </td>
                      <td className="p-4"><StatusBadge status={job.status} /></td>
                      <td className="p-4 whitespace-nowrap">{new Date(job.created_at).toLocaleString()}</td>
                      <td className="p-4 max-w-xs truncate" title={job.notes}>{job.notes || '-'}</td>
                      <td className="p-4 whitespace-nowrap">
                        {job.status === 'pending' ? (
                          <div className="flex gap-2">
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            Handled by {job.handler_name || '...'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {printJobs.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-white-400">
                        No print jobs found.
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