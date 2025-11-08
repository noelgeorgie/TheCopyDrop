import { Check, Clock, Download, Printer, X } from 'lucide-react'; // <-- Replaced FileText with Download
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import OfficeSidebar from './Sidebar';

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

export default function FrontOfficeDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printJobs, setPrintJobs] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(null);
  const router = useRouter();

  // --- Auth Guard ---
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
      
      if (error || !profile || (profile.role !== 'front-office' && profile.role !== 'scc-admin')) {
        // Allow scc-admin to view this page too
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }
      
      setUser({ ...session.user, ...profile });
      await fetchJobs();
      setLoading(false);
    };

    fetchData();
  }, [router]);

  // --- Data Fetching ---
  const fetchJobs = async () => {
    // RLS "Admins/Front-office can see all jobs" allows this.
    const { data, error } = await supabase.rpc('get_print_jobs_with_names');
    
    if (error) {
      setMessage({ type: 'error', text: `Failed to fetch jobs: ${error.message}` });
      return;
    }

    // RLS "Admins/Front-office can download all files" allows this.
    const jobsWithUrls = await Promise.all(
      data.map(async (job) => {
        const { data: urlData, error: urlError } = await supabase.storage
          .from('print_job_files')
          .createSignedUrl(job.file_path, 3600); // 1 hour link

        if (urlError) {
          console.error(`Error creating signed URL for ${job.file_path}:`, urlError.message);
          return { ...job, downloadUrl: null };
        }
        return { ...job, downloadUrl: urlData.signedUrl };
      })
    );

    setPrintJobs(jobsWithUrls);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

 // --- THIS IS THE NEW, SIMPLER UPDATE FUNCTION ---
  const handleUpdateJobStatus = async (jobId, newStatus) => {
    setSubmitting(jobId);
    setMessage({ type: '', text: '' });

    let updateData = {
      status: newStatus,
      handler_id: user.id // Set the handler to the logged-in front-office user
    };

    if (newStatus === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    try {
      // --- THIS IS THE FIX ---
      // Removed the stray underscore '_' after { error }
      const { error } = await supabase
        .from('print_jobs')
        .update(updateData)
        .eq('id', jobId);

      if (error) {
        throw error;
      }
      
      setMessage({ type: 'success', text: 'Job updated successfully' });
      await fetchJobs(); // Refresh the list
    } catch (error) {
      console.error('Error updating job:', error.message);
      setMessage({ type: 'error', text: `Failed to update job: ${error.message}` });
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Loading Front Office Dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <Head><title>Print Job Queue</title></Head>
      <div className="flex min-h-screen bg-gray-900 text-white">
        <OfficeSidebar user={user} handleLogout={handleLogout} />

        <div className="flex-1 flex flex-col">
          <header className="bg-gray-800 p-6 border-b border-gray-700">
            <h1 className="text-xl font-bold">Front Office Dashboard</h1>
          </header>
          
          <main className="p-8 flex-1">
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <Printer className="w-6 h-6 mr-3 text-indigo-400" />
                <h2 className="text-2xl font-bold">Print Job Queue</h2>
              </div>

              {message.text && (
                <div className={`p-4 rounded-lg mb-4 ${
                  message.type === 'success' 
                    ? 'bg-green-500 bg-opacity-20 text-green-400 border border-green-500' 
                    : 'bg-red-500 bg-opacity-20 text-white border border-red-500'
    _message_             }`}>
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
                    <><tr key={job.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="p-4 whitespace-nowrap">{job.requester_name || 'N/A'}</td>

                      {/* --- MODIFIED FILE CELL --- */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {/* 1. Download Button (Icon) */}
                          {job.downloadUrl ? (
                            <a
                              href={job.downloadUrl}
                              download={job.original_filename} // This forces download
                              title={`Download ${job.original_filename}`}
                              className="text-indigo-400 hover:text-indigo-300"
                              _message_>
                              <Download className="w-5 h-5" />
                            </a>
                          ) : (
                            <Download className="w-5 h-5 text-gray-600 cursor-not-allowed" />)}
                          Â                         )}

                          {/* 2. File Name (as a "View" link) */}
                          {job.downloadUrl ? (
                            <a
                              href={job.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                              title={`View ${job.original_filename}`}
                            >
                              {job.original_filename.length > 25 ? `${job.original_filename.substring(0, 25)}...` : job.original_filename}
                            </a>
                          ) : (
                            <span className="text-gray-500" title={job.original_filename}>
                              {job.original_filename.length > 25 ? `${job.original_filename.substring(0, 25)}...` : job.original_filename}
                            </span>
                          )}
                          _message_     </div>
                      </td>
                      {/* --- END OF MODIFIED CELL --- */}

                      <td className="p-4 whitespace-nowrap">
                        {job.copy_count} {job.copy_count > 1 ? 'copies' : 'copy'}
                      </span>
                      <span className="text-gray-400">{job.is_color ? 'Color' : 'Black & White'}</span>
                    </td><td className="p-4"><StatusBadge status={job.status} /></td><td className="p-4 whitespace-nowrap">{new Date(job.created_at).toLocaleString()}</td><td className="p-4 max-w-xs truncate" title={job.notes}>{job.notes || '-'}</td></>
d>
                      <td className="p-4 whitespace-nowrap">
                        {job.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateJobStatus(job.id, 'completed')}
                              disabled={submitting === job.id}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-sm font-medium disabled:bg-gray-600"
                            >
                              Complete
                            </button>
                            <button
                            s   onClick={() => handleUpdateJobStatus(job.id, 'cancelled')}
                              disabled={submitting === job.id}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm font-medium disabled:bg-gray-600"
                            >
                              Cancel
                            </button>
                      H   </div>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            Handled by {job.handler_name || '...'}
                          </span>
                        )}
S                     </td>
                    </tr>
                  ))}
        _message_           {printJobs.length === 0 && (
in                   <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-400">
S                       No pending print jobs.
                      </td>
    s               </tr>
                  )}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
  </span>
  );
}