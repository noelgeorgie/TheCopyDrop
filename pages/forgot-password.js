import { ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { HiHome } from 'react-icons/hi';
import { supabase } from '../lib/supabaseClient';


function ParticlesBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
    </div>
  );
}

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

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`, // user lands here after clicking link
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Password reset link has been sent to your email.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticlesBackground />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link 
            href="/"
            className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg hover:scale-105 transition-transform"
          >
            <HiHome className="w-8 h-8 text-white" />
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Reset Password
          </h1>
          <p className="text-gray-400 mt-2">Enter your email to receive a reset link</p>
        </div>

        {/* Form */}
        <div className="w-full max-w-md">
          <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-gray-800 shadow-2xl">
            <div className="space-y-6">
              {/* Success Message */}
              {message && (
                <div className="p-4 bg-green-900/30 border border-green-700/50 rounded-xl">
                  <p className="text-sm text-green-400 text-center">{message}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-xl">
                  <p className="text-sm text-red-400 text-center">{error}</p>
                </div>
              )}

              {/* Email Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Mail className={`w-5 h-5 ${email ? 'text-indigo-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="block w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || !!message}
                />
              </div>

              {/* Submit Button */}
              <button
                type="button"
                disabled={loading || !!message}
                onClick={handlePasswordReset}
                className={`w-full rounded-xl py-4 px-6 font-semibold text-white transition-all shadow-lg ${
                  loading || message
                    ? 'bg-indigo-600/50 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 shadow-indigo-600/30 hover:shadow-indigo-500/40 transform hover:scale-105'
                }`}
              >
                {loading ? 'Sending...' : message ? 'Email Sent!' : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </button>

              {/* Back to Login Link */}
              <div className="text-center">
                <p className="text-gray-400">
                  Remember your password?{' '}
                  <Link
                    href="/login"
                    className="font-medium text-indigo-400 hover:text-purple-400 transition-colors"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2025 SCC.</p>
        </div>
      </div>
    </div>
  );
}