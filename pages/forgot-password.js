import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import ParticlesBackground from '../components/ParticlesBackground';
import { supabase } from '../lib/supabaseClient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset link has been sent to your email.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <ParticlesBackground />
      <Head><title>Forgot Password // SCC Portal</title></Head>
      <div className="relative z-10 w-full max-w-md p-8 space-y-4 bg-black/20 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/10">
        <h1 className="text-3xl font-bold text-center text-white">Reset Password</h1>

        {message && <p className="text-center text-green-400 bg-green-900/50 p-3 rounded-md">{message}</p>}
        {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}

        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-300 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 text-white bg-gray-800/50 rounded-md border border-gray-700 focus:border-indigo-500 focus:ring focus:ring-indigo-500/50 outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading || message}
            className="w-full py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-600 transition-colors"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <p className="text-center text-gray-400 pt-2">
          Remember your password? <Link href="/login" legacyBehavior><a className="text-indigo-400 hover:underline">Login</a></Link>
        </p>
      </div>
    </div>
  );
}
