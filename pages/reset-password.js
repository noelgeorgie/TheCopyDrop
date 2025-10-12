import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react'; // Import useEffect
import ParticlesBackground from '../components/ParticlesBackground';
import { supabase } from '../lib/supabaseClient';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // New state to track if the user came from a valid recovery link
  const [isVerified, setIsVerified] = useState(false);

  // This effect runs when the component mounts to check the user's auth state.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // This event ONLY fires when the user has clicked a password recovery link
      if (event === 'PASSWORD_RECOVERY') {
        setIsVerified(true); // Allow the user to see the form
      }
    });

    // Cleanup the listener when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Your password has been updated successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <ParticlesBackground />
      <Head><title>Update Password // SCC Portal</title></Head>

      {/* Conditionally render the content based on verification */}
      {isVerified ? (
        // SHOW THE FORM if the link is valid
        <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-black/20 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/10">
          <h1 className="text-3xl font-bold text-center text-white">Choose a New Password</h1>

          {message && <p className="text-center text-green-400 bg-green-900/50 p-3 rounded-md">{message}</p>}
          {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
          
          <form onSubmit={handlePasswordUpdate} className="space-y-6">
            <div>
              <label className="text-sm font-bold text-gray-300 block">New Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                minLength="6"
                className="w-full p-3 mt-1 text-white bg-gray-800/50 rounded-md border border-gray-700 focus:border-indigo-500 focus:ring focus:ring-indigo-500/50 outline-none transition" 
              />
            </div>
            
            <div>
              <label className="text-sm font-bold text-gray-300 block">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                minLength="6"
                className="w-full p-3 mt-1 text-white bg-gray-800/50 rounded-md border border-gray-700 focus:border-indigo-500 focus:ring focus:ring-indigo-500/50 outline-none transition" 
              />
            </div>

            <button type="submit" disabled={loading || message} className="w-full py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-500 transition-colors">
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          {!message && (
              <p className="text-center text-gray-400">
                  <Link href="/login" legacyBehavior><a className="text-indigo-400 hover:underline">Back to Login</a></Link>
              </p>
          )}
        </div>
      ) : (
        // SHOW AN ERROR if the link is invalid or the user came here directly
        <div className="relative z-10 w-full max-w-md p-8 text-center bg-black/20 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/10">
            <h1 className="text-2xl font-bold text-red-400">Invalid or Expired Link</h1>
            <p className="mt-4 text-gray-300">
                This password reset link is not valid. Please request a new one.
            </p>
            <Link href="/forgot-password" legacyBehavior>
                <a className="mt-6 inline-block font-semibold text-indigo-400 hover:underline">
                    Request a new link
                </a>
            </Link>
        </div>
      )}
    </div>
  );
}