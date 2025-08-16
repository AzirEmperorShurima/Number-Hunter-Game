import React, { useState, useEffect } from "react";

const MainApp = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoveredCard, setHoveredCard] = useState(null);
  const [particles, setParticles] = useState([]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Generate floating particles
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 1,
          speed: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.1,
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
    const particleTimer = setInterval(generateParticles, 10000);
    return () => clearInterval(particleTimer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const gameVersions = [
    {
      id: "v1",
      title: "Number Hunter Classic",
      subtitle: "Original Version",
      description:
        "The classic bubble popping experience with simple, clean gameplay. Perfect for quick sessions and learning the mechanics.",
      path: "/number-hunter",
      icon: "🎯",
      color: "from-blue-500 to-cyan-500",
      hoverColor: "from-blue-600 to-cyan-600",
      features: [
        "Clean & Simple UI",
        "Fast-paced Gameplay",
        "Basic Animations",
        "Essential Features",
      ],
      difficulty: "Beginner Friendly",
      stats: {
        version: "1.0",
        released: "2024",
      },
    },
    {
      id: "v2",
      title: "Number Hunter Deluxe",
      subtitle: "Enhanced Version",
      description:
        "Advanced version with stunning animations, enhanced UI, and premium features. The ultimate bubble hunting experience.",
      path: "/number-hunter-v2",
      icon: "🚀",
      color: "from-purple-500 to-pink-500",
      hoverColor: "from-purple-600 to-pink-600",
      features: [
        "Stunning Animations",
        "Premium UI/UX",
        "Advanced Effects",
        "Score System",
      ],
      difficulty: "Enhanced Experience",
      stats: {
        version: "2.0",
        released: "2024",
      },
    },
  ];

  const handleGameSelect = (path) => {
    // Add a small delay for visual feedback
    setTimeout(() => {
      window.location.href = path;
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-800 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animation: `float ${particle.speed * 3}s infinite ease-in-out`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="text-center pt-12 pb-8">
          <div className="mb-6">
            <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-2xl">
              🎮{" "}
              <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
                Game Hub
              </span>
            </h1>
            <div className="w-32 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto rounded-full"></div>
          </div>

          <div className="text-white/80 space-y-2">
            <div className="text-2xl font-semibold">
              {formatTime(currentTime)}
            </div>
            <div className="text-lg">{formatDate(currentTime)}</div>
          </div>
        </header>

        {/* Game Selection */}
        <main className="flex-1 px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Choose Your Adventure
              </h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Select between two amazing versions of Number Hunter. Each
                offers a unique experience tailored to different preferences and
                play styles.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {gameVersions.map((game) => (
                <div
                  key={game.id}
                  className={`relative group cursor-pointer transition-all duration-500 transform ${
                    hoveredCard === game.id ? "scale-105" : "hover:scale-102"
                  }`}
                  onMouseEnter={() => setHoveredCard(game.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => handleGameSelect(game.path)}
                >
                  {/* Card Background */}
                  <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl h-full">
                    {/* Card Header */}
                    <div className="text-center mb-6">
                      <div className="text-6xl mb-4 animate-bounce">
                        {game.icon}
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-2">
                        {game.title}
                      </h3>
                      <div
                        className={`inline-block px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${game.color}`}
                      >
                        {game.subtitle}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-white/80 text-center mb-6 leading-relaxed">
                      {game.description}
                    </p>

                    {/* Features */}
                    <div className="mb-6">
                      <h4 className="text-white font-semibold mb-3 text-center">
                        ✨ Features:
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {game.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center text-white/70 text-sm"
                          >
                            <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mr-2"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between items-center mb-6 text-sm text-white/60">
                      <span>Version: {game.stats.version}</span>
                      <span>Released: {game.stats.released}</span>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="text-center mb-6">
                      <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-white/80 text-sm">
                        {game.difficulty}
                      </span>
                    </div>

                    {/* Play Button */}
                    <div className="text-center">
                      <button
                        className={`w-full py-4 rounded-2xl font-bold text-lg text-white transition-all duration-300 transform group-hover:scale-105 bg-gradient-to-r ${
                          hoveredCard === game.id ? game.hoverColor : game.color
                        } shadow-lg hover:shadow-xl`}
                      >
                        🎮 Play Now
                      </button>
                    </div>

                    {/* Hover Glow Effect */}
                    <div
                      className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-r ${game.color} blur-xl -z-10`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="text-center mt-12">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 max-w-3xl mx-auto border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-4">
                  🎯 About Number Hunter
                </h3>
                <p className="text-white/80 leading-relaxed">
                  Number Hunter is an addictive puzzle game where you click
                  numbered bubbles in sequential order. Test your speed,
                  accuracy, and concentration as you progress through
                  increasingly challenging levels. Can you clear all the numbers
                  without making a mistake?
                </p>
                <div className="mt-4 flex justify-center space-x-6 text-sm text-white/60">
                  <span>🏆 Challenge Your Skills</span>
                  <span>⚡ Fast-Paced Action</span>
                  <span>🎨 Beautiful Graphics</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-6 text-white/50 text-sm">
          <p>
            Made with ❤️ for game enthusiasts | Choose your preferred gaming
            experience
          </p>
        </footer>
      </div>

      {/* CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(120deg);
          }
          66% {
            transform: translateY(10px) rotate(240deg);
          }
        }
      `}</style>
    </div>
  );
};

export default MainApp;
