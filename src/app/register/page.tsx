import Link from 'next/link';

const RegisterPage = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-2 text-emerald-400">Create an Account</h1>
        <p className="text-center text-slate-400 mb-8">Get started on your journey with us</p>

        <form noValidate>
          {/* Name, Email, Password fields... */}
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="John Doe"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-transform transform hover:scale-105"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-8">
          Already have an account?{' '}
           {/* 2. Replace <a> with <Link> and href with to */}
          <Link href="/login" className="font-semibold text-cyan-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
};

export default RegisterPage;