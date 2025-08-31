function Features() {
  const features = [
    {
      icon: "📝",
      title: "Daily Progress Logging",
      description: "Track your coding activities, challenges, and achievements every day"
    },
    {
      icon: "🤖",
      title: "AI-Powered Analysis",
      description: "Get intelligent insights and recommendations powered by OpenAI"
    },
    {
      icon: "📊",
      title: "Progress Visualization",
      description: "See your growth through interactive charts and progress tracking"
    },
    {
      icon: "🎯",
      title: "Skill Gap Identification",
      description: "Discover areas for improvement and get personalized learning paths"
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Your Growth
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to track, analyze, and accelerate your coding career
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 hover:shadow-lg transition duration-300 transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Features;
