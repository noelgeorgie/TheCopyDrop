import { ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { HiHome } from 'react-icons/hi';
import { supabase } from '../lib/supabaseClient'; // Make sure this import path matches your project

function ParticlesBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
    </div>
  );
}

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLinkValid, setIsLinkValid] = useState(true);
  const router = useRouter();

  // ✅ Check if link is expired or invalid
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // No session means invalid or reused link
        router.replace('/link-expired');
      }
    };
        checkSession();
  }, [router]);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // ✅ Update password through Supabase
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Your password has been updated successfully! Redirecting to login...');
        setTimeout(() => router.push('/login'), 3000);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handlePasswordUpdate(e);
  };

  if (!isLinkValid) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <ParticlesBackground />
        <Head><title>Invalid or Expired Link // SCC Portal</title></Head>
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          <div className="mb-8 text-center">
            <Link href="/" legacyBehavior>
              <a className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg hover:scale-105 transition-transform">
                <HiHome className="w-8 h-8 text-white" />
              </a>
            </Link>
          </div>
          
          <div className="w-full max-w-md">
            <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-gray-800 shadow-2xl text-center">
              <h1 className="text-2xl font-bold text-red-400 mb-4">Invalid or Expired Link</h1>
              <p className="text-gray-300 mb-6">
                This password reset link is not valid or has already been used.
              </p>
              <Link href="/forgot-password" legacyBehavior>
                <a className="inline-block font-semibold px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors">
                  Request a new link
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Valid Link UI
  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticlesBackground />
      <Head><title>Update Password // SCC Portal</title></Head>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" legacyBehavior>
            <a className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg hover:scale-105 transition-transform">
              <HiHome className="w-8 h-8 text-white" />
            </a>
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Choose New Password
          </h1>
          <p className="text-gray-400 mt-2">Enter your new password below</p>
        </div>

        {/* Form */}
        <div className="w-full max-w-md">
          <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-gray-800 shadow-2xl">
            <div className="space-y-6">
              {message && (
                <div className="p-4 bg-green-900/30 border border-green-700/50 rounded-xl">
                  <p className="text-sm text-green-400 text-center">{message}</p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-xl">
                  <p className="text-sm text-red-400 text-center">{error}</p>
                </div>
              )}

              {/* New Password */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Lock className={`w-5 h-5 ${password ? 'text-indigo-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="block w-full pl-12 pr-12 py-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading || !!message}
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 text-gray-400 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || !!message}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Lock className={`w-5 h-5 ${confirmPassword ? 'text-indigo-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="block w-full pl-12 pr-12 py-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading || !!message}
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 text-gray-400 hover:text-white transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading || !!message}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Submit */}
              <button
                type="button"
                disabled={loading || !!message}
                onClick={handlePasswordUpdate}
                className={`w-full rounded-xl py-4 px-6 font-semibold text-white transition-all shadow-lg ${
                  loading || message
                    ? 'bg-indigo-600/50 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 shadow-indigo-600/30 hover:shadow-indigo-500/40 transform hover:scale-105'
                }`}
              >
                {loading ? 'Updating...' : message ? 'Password Updated!' : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>Update Password</span>
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </button>

              {!message && (
                <div className="text-center">
                  <p className="text-gray-400">
                    <Link href="/login" legacyBehavior>
                      <a className="font-medium text-indigo-400 hover:text-purple-400 transition-colors">
                        Back to Login
                      </a>
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2025 SCC.</p>
        </div>
      </div>
    </div>
  );
}
