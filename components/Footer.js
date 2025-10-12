export default function Footer() {
  return (
    <footer className="bg-gray-200 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 transition-colors">
      <div className="container mx-auto px-6 py-4 text-center text-gray-600 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} Your Company Name. For Internal Use Only.</p>
      </div>
    </footer>
  );
}