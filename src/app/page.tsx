
export default function DarkLandingPage() {
  return (
    // Main container with a dark gradient background
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-blue-950 text-slate-200">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[80vh]">
          {/* Left Side: Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-block mb-4 px-4 py-2 bg-slate-800 text-blue-300 rounded-full text-sm font-semibold">
              Welcome to Our Platform
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              {/* Gradient text adjusted for dark background */}
              <span className="bg-gradient-to-r from-slate-100 via-slate-300 to-slate-500 bg-clip-text text-transparent">
                Build Something
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Amazing Today
              </span>
            </h1>
            {/* Paragraph text color changed for readability */}
            <p className="text-xl md:text-2xl text-slate-400 mb-8 leading-relaxed">
              Join thousands of users who trust our platform to bring their ideas to life.
              Start your journey with a simple sign-up.
            </p>
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-left">
              <div className="flex items-start gap-3">
                <div className="bg-green-500 rounded-full p-1 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  {/* Feature text colors adjusted */}
                  <p className="font-semibold text-slate-100">Fast & Secure</p>
                  <p className="text-slate-400 text-sm">Enterprise-grade security</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-500 rounded-full p-1 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-100">Easy to Use</p>
                  <p className="text-slate-400 text-sm">Get started in minutes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-500 rounded-full p-1 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-100">24/7 Support</p>
                  <p className="text-slate-400 text-sm">We're here to help</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Replaced AuthForm with a CTA */}
          <div className="flex-1 w-full max-w-md flex flex-col items-center justify-center bg-slate-900/50 p-8 rounded-2xl shadow-2xl border border-slate-800">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start?
            </h2>
            <p className="text-slate-400 mb-8 text-center">
              Create an account in seconds.
            </p>
            <button className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-300">
              Get Started Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}