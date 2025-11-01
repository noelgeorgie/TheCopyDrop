import Head from 'next/head';
import Link from 'next/link';
import ParticlesBackground from '../components/ParticlesBackground';

export default function LinkExpired() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <ParticlesBackground />
      <Head><title>Link Expired // SCC Portal</title></Head>
      <div className="relative z-10 w-full max-w-md p-8 space-y-4 bg-black/20 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/10">
        <h1 className="text-3xl font-bold text-center text-white">Link Expired</h1>
        <p className="text-center text-gray-300">
          The password reset link is invalid or has expired.
        </p>
        <p className="text-center text-gray-400">
          You can request a new link below.
        </p>
        <div className="flex justify-center">
          <Link href="/forgot-password" legacyBehavior>
            <a className="mt-4 inline-block px-6 py-2 bg-indigo-600 rounded-md text-white hover:bg-indigo-700 transition-colors">
              Request New Link
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
