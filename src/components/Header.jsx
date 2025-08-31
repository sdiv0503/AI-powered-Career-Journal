function Header({ onStartJournal }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              🌟 Career Journal
            </h1>
          </div>

          {/* Navigation Button */}
          <button
            onClick={onStartJournal}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300 transform hover:scale-105"
          >
            Start My Journal
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
