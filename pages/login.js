import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import ParticlesBackground from '../components/ParticlesBackground';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        setError("Could not find your user profile. Please contact support.");
        await supabase.auth.signOut();
      } else {
        const role = profile.role;

        if (!role) {
          setError("Your account has not been assigned a role. Please contact an administrator.");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // --- Redirection Logic ---
        // This part is already correct. The router.push() function navigates
        // to a URL path, not a component file path. Next.js handles the rest.
        switch (role) {
          case 'scc-admin':
            // Correct: This navigates to the URL '/admin/dashboard'.
            // Next.js then correctly renders the page file at 'pages/admin/dashboard.js',
            // which in turn displays your component from 'components/dashboard/admin/'.
            router.push('/admin/dashboard');
            break;
          case 'staff':
            // Correct: This navigates to '/staff/dashboard'.
            router.push('/staff/dashboard');
            break;
          case 'front-office':
             // Correct: This navigates to '/office/dashboard'.
            router.push('/office/dashboard');
            break;
          default:
            setError("Your assigned role is not recognized. Please contact support.");
            await supabase.auth.signOut();
            break;
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
        <ParticlesBackground />
        <Head><title>Login // SCC Portal</title></Head>
        <div className="relative z-10 w-full max-w-md p-8 space-y-4 bg-black/20 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/10">
            <h1 className="text-3xl font-bold text-center text-white">Login</h1>
            
            {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
            
            <form onSubmit={handleLogin} className="space-y-4">
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
                <div>
                    <label className="text-sm font-bold text-gray-300 block mb-1">Password</label>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      className="w-full p-3 text-white bg-gray-800/50 rounded-md border border-gray-700 focus:border-indigo-500 focus:ring focus:ring-indigo-500/50 outline-none transition" 
                    />
                </div>
                 <div className="text-right">
                    <Link href="/forgot-password" legacyBehavior>
                        <a className="text-sm text-indigo-400 hover:underline">Forgot Password?</a>
                    </Link>
                </div>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-600 transition-colors"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p className="text-center text-gray-400 pt-2">
                Don't have an account? <Link href="/register" legacyBehavior><a className="text-indigo-400 hover:underline">Register</a></Link>
            </p>
        </div>
    </div>
  );
}

