import { Link } from 'react-router-dom'; // 1. Import Link

const LoginPage = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-2 text-cyan-400">Welcome Back!</h1>
        <p className="text-center text-slate-400 mb-8">Sign in to access your account</p>

        <form noValidate>
          {/* Email and Password fields... */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 transition"
            />
          </div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <a href="#" className="text-sm text-cyan-400 hover:underline">
                Forgot Password?
              </a>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 transition"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-transform transform hover:scale-105"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-8">
          Don't have an account?{' '}
          {/* 2. Replace <a> with <Link> and href with to */}
          <Link to="/register" className="font-semibold text-cyan-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;