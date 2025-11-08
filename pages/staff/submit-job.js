import { FilePlus, Loader2, Paperclip } from 'lucide-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import StaffSidebar from './Sidebar';

export default function SubmitPrintJob() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [copyCount, setCopyCount] = useState(1);
  const [isColor, setIsColor] = useState(false);
  const [notes, setNotes] = useState('');

  // --- Auth Guard (still needed to get user ID) ---
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
      
      if (error || !profile || profile.role !== 'staff') {
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }
      setUser({ ...session.user, ...profile });
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file to upload.' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // 1. Create the file path. No RLS, but we still use user ID for organization.
      const filePath = `${user.id}/${Date.now()}-${file.name.replace(/ /g, '_')}`;

      // 2. Upload the file to the 'print_job_files' (public) bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('print_job_files')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // --- THIS IS THE CHANGE ---
      // 3. Get the PUBLIC URL for the file
      const { data: urlData } = supabase.storage
        .from('print_job_files')
        .getPublicUrl(uploadData.path);
      
      const publicUrl = urlData.publicUrl;
      // -------------------------

      // 4. Insert the job record. RLS is off, so this will work.
      const { error: insertError } = await supabase
        .from('print_jobs')
        .insert({
          requester_id: user.id,
          file_path: publicUrl, // <-- We now save the public URL
          original_filename: file.name,
          copy_count: copyCount,
          is_color: isColor,
          notes: notes,
          status: 'pending'
        });

      if (insertError) {
        throw insertError;
      }

      // 5. Success!
      setMessage({ type: 'success', text: 'Print job submitted successfully!' });
      setFile(null);
      setCopyCount(1);
      setIsColor(false);
      setNotes('');
      document.getElementById('file-upload').value = null;

    } catch (error) { 
      console.error('Error submitting job:', error);
      setMessage({ type: 'error', text: `Failed to submit job: ${error.message}` });
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
      <Head><title>Submit Print Job</title></Head>
      <div className="flex min-h-screen bg-gray-900 text-white">
        <StaffSidebar user={user} handleLogout={async () => {
          await supabase.auth.signOut();
          router.push('/');
        }} />
        <div className="flex-1 flex flex-col">
          <header className="bg-gray-800 p-6 border-b border-gray-700">
            <h1 className="text-xl font-bold">Submit a New Print Job</h1>
          </header>
          
          <main className="p-8 flex-1 flex justify-center items-center">
            <div className="max-w-xl w-full">
              <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* ... (rest of the form is identical) ... */}

                  {/* File Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">File Upload</label>
                    <input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0 file:text-sm file:font-semibold
                        file:bg-indigo-600 file:text-white hover:file:bg-indigo-500
                        file:cursor-pointer"
                    />
                    {file && (
                      <div className="mt-3 flex items-center text-sm text-green-400">
                        <Paperclip className="w-4 h-4 mr-2" />
                        <span>{file.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Copy Count */}
                  <div>
                    <label htmlFor="copyCount" className="block text-sm font-medium mb-2">Number of Copies</label>
                    <input
                      id="copyCount"
                      type="number"
      min="1"
                      value={copyCount}
                      onChange={(e) => setCopyCount(parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Color/B&W */}
                  <div className="flex items-center">
                    <input
                      id="isColor"
                      type="checkbox"
                      checked={isColor}
                      onChange={(e) => setIsColor(e.target.checked)}
                      className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="isColor" className="ml-3 block text-sm">
                      Print in Color?
                    </label>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium mb-2">Notes (Optional)</label>
                    <textarea
                      id="notes"
                      rows="3"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      maxLength={25} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 'Please staple top-left corner'..."
                    ></textarea>
                  </div>

                  {/* Message Display */}
                  {message.text && (
                    <div className={`p-4 rounded-lg ${
                      message.type === 'success' 
                        ? 'bg-green-500 bg-opacity-20 text-green-300 border border-green-500' 
                        : 'bg-red-500 bg-opacity-20 text-white border border-red-500'
                    }`}>
                      {message.text}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-medium transition-colors"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FilePlus className="w-5 h-5 mr-2" />
                        Submit Job
                      </>
                    )}
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