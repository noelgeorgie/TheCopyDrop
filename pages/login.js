import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { HiHome } from 'react-icons/hi';
import { supabase } from '../utils/supabaseClient';

function ParticlesBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
    </div>
  );
}

function ModernLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isFormFocused, setIsFormFocused] = useState(false);
  const router = useRouter(); // Initialize router

  // ✅ Supabase login with role-based redirect
  const handleLogin = useCallback(async () => {
    const validationErrors = {};
    if (!email.trim()) validationErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) validationErrors.email = 'Email is not valid.';
    if (!password) validationErrors.password = 'Password is required.';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // 1. Sign in
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // 2. Handle Sign-in Error
      if (signInError) {
        setErrors({ general: signInError.message });
        console.error('Login failed:', signInError.message);
        return; // Stop execution
      }

      // 3. Handle successful login and fetch profile
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        // 4. Handle Profile Error
        if (profileError || !profile) {
          setErrors({ general: "Could not find your user profile. Please contact support." });
          console.error('Profile fetch error:', profileError);
          await supabase.auth.signOut(); // Sign out user
          return; // Stop
        }

        // 5. We have a profile, check for role
        const role = profile.role;
        if (!role) {
          setErrors({ general: "Your account has not been assigned a role. Please contact an administrator." });
          await supabase.auth.signOut();
          return; // Stop
        }

        // 6. --- Redirection Logic ---
        switch (role) {
          case 'scc-admin':
            router.push('/admin/dashboard');
            break;
          case 'staff':
            router.push('/staff/dashboard');
            break;
          case 'front-office':
            router.push('/office/dashboard');
            break;
          default:
            setErrors({ general: "Your assigned role is not recognized. Please contact support." });
            await supabase.auth.signOut();
            break;
        }
      } else {
        // Fallback just in case user is null but no error
        setErrors({ general: 'Login successful but no user data received. Please try again.' });
      }

    } catch (err) {
      console.error('Unexpected error:', err);
      setErrors({ general: 'Something went wrong. Try again.' });
    } finally {
      setIsLoading(false);
    }
  }, [email, password, router]); // ✅ Add router to dependency array

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') handleLogin();
  }, [handleLogin]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Matching home page background */}
      <ParticlesBackground />
      <Head><title>Login // SCC Portal</title></Head>
      

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          <button className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg hover:scale-105 transition-transform">
            <Link href="/" legacyBehavior>
                
                    
                <HiHome className="w-8 h-8 text-white" />
              </Link>
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Login
          </h1>
        </div>

        {/* Login form */}
        <div className="w-full max-w-md">
          <div className="bg-black/40 backdrop-blur-lg p-8 rounded-2xl border border-gray-800 shadow-2xl">
            <div className="space-y-6">
              {/* Email */}
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
                  onKeyPress={handleKeyPress}
                />
                {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Lock className={`w-5 h-5 ${password ? 'text-indigo-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="block w-full pl-12 pr-12 py-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 text-gray-400 hover:text-white transition-colors"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password}</p>}
              </div>

              {/* General error */}
              {errors.general && <p className="text-sm text-red-400 text-center">{errors.general}</p>}

              {/* Sign In button */}
              <button
                type="button"
                disabled={isLoading}
                onClick={handleLogin}
                className={`w-full rounded-xl py-4 px-6 font-semibold text-white transition-all shadow-lg ${
                  isLoading
                    ? 'bg-indigo-600/50 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 shadow-indigo-600/30 hover:shadow-indigo-500/40 transform hover:scale-105'
                }`}
              >
                {isLoading ? 'Signing In...' : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </button>
              <div className="text-center">
                <p className="text-gray-400">
                  Forgot your Password?{' '}
                  <a
                    href="/forgot-password"
                    className="font-medium text-indigo-400 hover:text-purple-400 transition-colors"
                  >
                    Reset it here
                  </a>
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

export default ModernLoginPage;