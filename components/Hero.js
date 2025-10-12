export default function Hero() {
  return (
    <section className="bg-gray-100 dark:bg-gray-900 text-center py-24 md:py-32 px-6 transition-colors">
      <div className="container mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
          Welcome to the Internal Dashboard
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-gray-600 dark:text-gray-300">
          All your essential tools, reports, and company links in one place. Built to make your work simpler.
        </p>
        <a href="#features" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
          Explore Features
        </a>
      </div>
    </section>
  );
}