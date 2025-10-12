export default function Support() {
  return (
    <section id="support" className="py-20 bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">Need Help?</h2>
        <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300 mb-8">
          If you encounter any issues or have a feature request, please don't hesitate to reach out to the IT support team.
        </p>
        <a href="mailto:support@yourcompany.com" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
          Contact IT Support
        </a>
      </div>
    </section>
  );
}