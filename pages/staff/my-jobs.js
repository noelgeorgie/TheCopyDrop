import { Check, Clock, FileText, List, Trash2, X } from 'lucide-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import StaffSidebar from './Sidebar';

// Status Badge
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

// Truncate file
function truncateFileName(fileName, length = 30) {
  if (!fileName) return '';
  if (fileName.length <= length) return fileName;

  const extension = fileName.split('.').pop();
  const name = fileName.substring(0, fileName.lastIndexOf('.'));
  const start = name.substring(0, length - extension.length - 4);
  const end = name.substring(name.length - 5);

  return `${start}...${end}.${extension}`;
}

export default function MyPrintJobs() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printJobs, setPrintJobs] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const router = useRouter();

  // Auth Guard
  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', session.user.id)
        .single();

      if (error || !profile || profile.role !== 'staff') {
        await supabase.auth.signOut();
        return router.push('/login');
      }

      setUser({ ...session.user, ...profile });
      await fetchJobs();
      setLoading(false);
    };

    fetchData();
  }, [router]);

  // Fetch jobs
  const fetchJobs = async () => {
    const { data: jobs, error } = await supabase
      .from('print_jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setMessage({ type: 'error', text: `Failed to fetch jobs: ${error.message}` });
      return;
    }

    // Fix: extract object path (Supabase expects only bucket path)
    const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/print_job_files/`;

    const jobsWithUrls = await Promise.all(
      jobs.map(async job => {
        let objectPath = job.file_path;

        if (objectPath.startsWith(base)) {
          objectPath = objectPath.replace(base, '');
        }

        const { data: urlData, error: urlError } = await supabase.storage
          .from('print_job_files')
          .createSignedUrl(objectPath, 3600);

        return {
          ...job,
          downloadUrl: urlError ? null : urlData.signedUrl
        };
      })
    );

    setPrintJobs(jobsWithUrls);
  };

  // Delete job
  const handleDelete = async (id, file_path) => {
    const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/print_job_files/`;
    const objectPath = file_path.startsWith(base)
      ? file_path.replace(base, '')
      : file_path;

    const { error: storageError } = await supabase.storage
      .from('print_job_files')
      .remove([objectPath]);

    const { error: dbError } = await supabase
      .from('print_jobs')
      .delete()
      .eq('id', id);

    if (storageError || dbError) {
      setMessage({ type: 'error', text: 'Failed to delete job.' });
      return;
    }

    setPrintJobs(prev => prev.filter(job => job.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Loading Your Print Jobs...</p>
      </div>
    );
  }

  return (
    <>
      <Head><title>My Print Jobs</title></Head>
      <div className="flex min-h-screen bg-gray-900 text-white">
        <StaffSidebar user={user} handleLogout={handleLogout} />

        <div className="flex-1 flex flex-col">
          <header className="bg-gray-800 p-6 border-b border-gray-700">
            <h1 className="text-xl font-bold">My Submitted Print Jobs</h1>
          </header>

          <main className="p-8 flex-1">
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <List className="w-6 h-6 mr-3 text-indigo-400" />
                <h2 className="text-2xl font-bold">Job History</h2>
              </div>

              {message.text && (
                <div className={`p-4 rounded-lg mb-4 ${
                  message.type === 'error'
                    ? 'bg-red-500 bg-opacity-20 text-white border border-red-500'
                    : ''
                }`}>
                  {message.text}
                </div>
              )}
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-x-auto">
              <table className="w-full min-w-full">
                <thead className="bg-gray-750 border-b border-gray-700">
                  <tr>
                    <th className="text-left p-4 font-semibold">File</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Details</th>
                    <th className="text-left p-4 font-semibold">Submitted</th>
                    <th className="text-left p-4 font-semibold">Notes</th>
                    <th className="text-left p-4 font-semibold">Delete</th>
                  </tr>
                </thead>

                <tbody>
                  {printJobs.map(job => (
                    <tr key={job.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="p-4 whitespace-nowrap">
                        {job.downloadUrl ? (
                          <a
                            href={job.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-indigo-400 hover:underline"
                            title={job.original_filename}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            {truncateFileName(job.original_filename)}
                          </a>
                        ) : (
                          <span
                            className="flex items-center text-gray-500 cursor-not-allowed"
                            title="Download link expired or failed"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            {truncateFileName(job.original_filename)}
                          </span>
                        )}
                      </td>

                      <td className="p-4"><StatusBadge status={job.status} /></td>

                      <td className="p-4 whitespace-nowrap">
                        {job.copy_count} {job.copy_count > 1 ? 'copies' : 'copy'}
                        <br />
                        <span className="text-gray-400">{job.is_color ? 'Color' : 'Black & White'}</span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {new Date(job.created_at).toLocaleString()}
                      </td>

                      <td className="p-4 max-w-xs truncate" title={job.notes}>
                        {job.notes || '-'}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => handleDelete(job.id, job.file_path)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {printJobs.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-400">
                        You have not submitted any print jobs.
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
