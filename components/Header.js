export default function Header() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <a href="#" className="text-xl font-bold text-gray-900">
          Sivadas C and Company
        </a>
        <div className="hidden md:flex space-x-6">
          <a href="#services" className="text-gray-600 hover:text-blue-600 transition duration-300">Services</a>
          <a href="#about" className="text-gray-600 hover:text-blue-600 transition duration-300">About Us</a>
          <a href="#contact" className="text-gray-600 hover:text-blue-600 transition duration-300">Contact</a>
        </div>
      </nav>
    </header>
  );
}