function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
              🌟 Career Journal
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Your personal AI-powered companion for tracking coding progress and career growth.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition duration-300">About</a></li>
              <li><a href="#" className="hover:text-white transition duration-300">Features</a></li>
              <li><a href="#" className="hover:text-white transition duration-300">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition duration-300">Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect</h4>
            <p className="text-gray-400 mb-2">📧 sharmadivyansh067@gmail.com</p>
            <p className="text-gray-400 mb-4">🐙 GitHub: github.com/sdiv0503</p>
            <p className="text-sm text-gray-500">
              © 2025 Career Journal. Built with React & Tailwind CSS.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
