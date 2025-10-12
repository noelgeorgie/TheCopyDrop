import { motion } from 'framer-motion';
import { Server, ShieldCheck, Zap } from 'lucide-react'; // Using icons for a better look
import Head from 'next/head';
import Link from 'next/link';
import ParticlesBackground from '../components/ParticlesBackground';
import ThemeSwitcher from '../components/ThemeSwitcher';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <ParticlesBackground />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Head>
          <title>Sivadas C and Company // Internal Portal</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <header className="container mx-auto px-6 py-4 flex justify-between items-center text-gray-300">
          <motion.h1
            className="text-xl font-bold tracking-widest uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Sivadas C and Company
          </motion.h1>
          <ThemeSwitcher />
        </header>

        {/* Main content now uses a two-column layout on large screens */}
        <main className="flex-grow flex items-center p-4">
          <div className="container mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
            
            {/* Left Column: Informational Text */}
            <motion.div 
              className="lg:w-1/2 text-center lg:text-left"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.h2 
                className="text-4xl lg:text-5xl font-bold text-gray-100 leading-tight"
                variants={itemVariants}
              >
                The Central Hub for <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">Productivity</span>
              </motion.h2>
              <motion.p 
                className="mt-4 text-lg text-gray-400"
                variants={itemVariants}
              >
                Access all internal tools, resources, and applications from one secure, centralized location. Built for performance and reliability.
              </motion.p>
              
              <motion.div className="mt-8 space-y-4" variants={itemVariants}>
                <div className="flex items-center justify-center lg:justify-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-indigo-400" />
                  <Zap className="w-6 h-6 text-indigo-400" />
                  <Server className="w-6 h-6 text-indigo-400" />
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column: Login Card */}
            <motion.div
              className="w-full lg:w-1/2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div
                // The card itself no longer needs variants, its parent handles the animation
                className="text-center bg-black/40 backdrop-blur-lg p-8 md:p-12 rounded-2xl shadow-2xl border border-gray-800"
              >
                <motion.h2
                  className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500"
                  variants={itemVariants}
                >
                  Get Started
                </motion.h2>
                <motion.p
                  className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-gray-400"
                  variants={itemVariants}
                >
                  Authenticate to proceed to the internal dashboard.
                </motion.p>
                <motion.div
                  className="flex flex-col sm:flex-row justify-center gap-4"
                  variants={itemVariants}
                >
                  <Link href="/login" legacyBehavior>
                    <a className="font-semibold py-3 px-8 rounded-lg text-lg text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all duration-300 transform hover:scale-105">
                      Login
                    </a>
                  </Link>
                  <Link href="/register" legacyBehavior>
                    <a className="font-semibold py-3 px-8 rounded-lg text-lg text-gray-200 bg-gray-800/90 hover:bg-gray-700/90 border border-gray-700 shadow-lg shadow-gray-900/30 hover:shadow-gray-900/40 transition-all duration-300 transform hover:scale-105">
                      Register
                    </a>
                  </Link>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </main>
      </div>
    </div>
  );
}