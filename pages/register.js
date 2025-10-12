import { CheckCircle, XCircle } from 'lucide-react'; // For nice icons
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ParticlesBackground from '../components/ParticlesBackground';
import { supabase } from '../lib/supabaseClient';

// Helper component for the password criteria checklist
const PasswordRequirement = ({ met, text }) => (
  <div className={`flex items-center transition-colors duration-300 ${met ? 'text-green-400' : 'text-gray-500'}`}>
    {met ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
    <span>{text}</span>
  </div>
);

export default function Register() {
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('staff'); // New state for role, defaults to 'staff'

  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Password validation state
  const [criteria, setCriteria] = useState({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const isPasswordValid = Object.values(criteria).every(Boolean);

  useEffect(() => {
    setCriteria({
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    if (!isPasswordValid) {
      setError('Password does not meet all requirements.');
      return;
    }

    setLoading(true);

    // Pass the selected role in the options.data object
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role, // Add the selected role here
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Registration successful! Please check your email to confirm your account.');
    }
    
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
        <ParticlesBackground />
        <Head><title>Register // SCC Portal</title></Head>
        <div className="relative z-10 w-full max-w-md p-8 space-y-4 bg-black/20 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/10">
            <h1 className="text-3xl font-bold text-center text-white">Create Account</h1>
            
            {message && <p className="text-center text-green-400 bg-green-900/50 p-3 rounded-md">{message}</p>}
            {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
            
            <form onSubmit={handleRegister} className="space-y-4">
                <div>
                    <label className="text-sm font-bold text-gray-300 block mb-1">Full Name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full p-3 text-white bg-gray-800/50 rounded-md border border-gray-700 focus:border-indigo-500 focus:ring focus:ring-indigo-500/50 outline-none transition" />
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-300 block mb-1">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 text-white bg-gray-800/50 rounded-md border border-gray-700 focus:border-indigo-500 focus:ring focus:ring-indigo-500/50 outline-none transition" />
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-300 block mb-1">Role</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                        className="w-full p-3 text-white bg-gray-800/50 rounded-md border border-gray-700 focus:border-indigo-500 focus:ring focus:ring-indigo-500/50 outline-none transition"
                    >
                        
                        <option value="">Select a Role</option>
                        <option value="scc-admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="front-office">Front Office</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm font-bold text-gray-300 block mb-1">Password</label>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      className="w-full p-3 text-white bg-gray-800/50 rounded-md border border-gray-700 focus:border-indigo-500 focus:ring focus:ring-indigo-500/50 outline-none transition" />
                </div>

                {/* Real-time Password Validation Checklist */}
                <div className="text-xs space-y-1 pl-1">
                  <PasswordRequirement met={criteria.minLength} text="At least 8 characters long" />
                  <PasswordRequirement met={criteria.lowercase} text="Contains a lowercase letter (a-z)" />
                  <PasswordRequirement met={criteria.uppercase} text="Contains an uppercase letter (A-Z)" />
                  <PasswordRequirement met={criteria.number} text="Contains a number (0-9)" />
                  <PasswordRequirement met={criteria.specialChar} text="Contains a special character (!@#...)" />
                </div>

                <div>
                    <label className="text-sm font-bold text-gray-300 block mb-1">Confirm Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      required 
                      className="w-full p-3 text-white bg-gray-800/50 rounded-md border border-gray-700 focus:border-indigo-500 focus:ring focus:ring-indigo-500/50 outline-none transition" />
                </div>
                
                {/* Disable button based on loading state OR if passwords don't match OR if password is not valid */}
                <button 
                  type="submit" 
                  disabled={loading || !isPasswordValid || password !== confirmPassword} 
                  className="w-full py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                    {loading ? 'Creating Account...' : 'Register'}
                </button>
            </form>
            <p className="text-center text-gray-400 pt-2">
                Already have an account? <Link href="/login" legacyBehavior><a className="text-indigo-400 hover:underline">Login</a></Link>
            </p>
        </div>
    </div>
  );
}