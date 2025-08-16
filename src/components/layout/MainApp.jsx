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
      for (let i = 0; i < 30; i++) {
        // Reduced particles for mobile performance
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          speed: Math.random() * 2 + 1,
          opacity: Math.random() * 0.4 + 0.1,
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
        released: "2025",
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
        released: "2025",
      },
    },
    {
      id: "v2.1",
      title: "Number Hunter Deluxe Pro",
      subtitle: "Optimized Performance",
      description:
        "Latest optimized version of Deluxe with intelligent rendering system and advanced performance optimizations. Smooth gameplay even with large numbers of points without lag!",
      path: "/number-hunter-v2.1",
      icon: "⚡",
      color: "from-orange-500 to-red-500",
      hoverColor: "from-orange-600 to-red-600",
      features: [
        "Smart Rendering System",
        "Anti-Lag Technology",
        "Optimized Performance",
        "Smooth Large Datasets",
      ],
      difficulty: "Performance Optimized",
      stats: {
        version: "2.1",
        released: "2025",
      },
      isNew: true,
      badge: "OPTIMIZED",
    },
    {
      id: "v3",
      title: "Number Hunter Ultimate",
      subtitle: "Latest Version",
      description:
        "The most advanced version featuring cutting-edge animations, spectacular visual effects, and revolutionary gameplay mechanics. Experience the future of bubble hunting!",
      path: "/number-hunter-v3",
      icon: "⭐",
      color: "from-emerald-500 to-teal-500",
      hoverColor: "from-emerald-600 to-teal-600",
      features: [
        "Revolutionary UI",
        "Spectacular Effects",
        "Advanced Physics",
        "Premium Experience",
      ],
      difficulty: "Ultimate Challenge",
      stats: {
        version: "3.0",
        released: "2025",
      },
    },
  ];

  const handleGameSelect = (path) => {
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
            className="absolute rounded-full bg-white animate-pulse hidden sm:block"
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
        <header className="text-center pt-8 sm:pt-12 pb-6 sm:pb-8 px-4">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2 sm:mb-4 drop-shadow-2xl">
              🎮{" "}
              <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
                Game Hub
              </span>
            </h1>
            <div className="w-24 sm:w-32 h-1.5 sm:h-2 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto rounded-full"></div>
          </div>

          <div className="text-white/80 space-y-1 sm:space-y-2">
            <div className="text-xl sm:text-2xl font-semibold">
              {formatTime(currentTime)}
            </div>
            <div className="text-base sm:text-lg">
              {formatDate(currentTime)}
            </div>
          </div>
        </header>

        {/* Game Selection */}
        <main className="flex-1 px-4 sm:px-6 pb-8 sm:pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
                Choose Your Adventure
              </h2>
              <p className="text-base sm:text-xl text-white/70 max-w-2xl mx-auto px-4">
                Select between four amazing versions of Number Hunter. Each
                offers a unique experience tailored to different preferences and
                play styles.
              </p>
            </div>

            {/* Mobile: Single Column, Tablet: 2 Columns, Desktop: 4 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-8xl mx-auto">
              {gameVersions.map((game) => (
                <div
                  key={game.id}
                  className={`relative group cursor-pointer transition-all duration-500 transform ${
                    hoveredCard === game.id ? "scale-105" : "hover:scale-102"
                  } h-full`}
                  onMouseEnter={() => setHoveredCard(game.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => handleGameSelect(game.path)}
                >
                  {/* New/Optimized Badge */}
                  {(game.isNew || game.badge) && (
                    <div className="absolute -top-3 -right-3 z-20">
                      <div
                        className={`text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse ${
                          game.badge === "OPTIMIZED"
                            ? "bg-gradient-to-r from-orange-500 to-red-500"
                            : "bg-gradient-to-r from-red-500 to-pink-500"
                        }`}
                      >
                        {game.badge || "NEW!"}
                      </div>
                    </div>
                  )}

                  {/* Card Background - Using flexbox for equal height */}
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/20 shadow-2xl h-full flex flex-col">
                    {/* Card Header */}
                    <div className="text-center mb-4 sm:mb-6">
                      <div className="text-4xl sm:text-5xl lg:text-6xl mb-2 sm:mb-4 animate-bounce">
                        {game.icon}
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                        {game.title}
                      </h3>
                      <div
                        className={`inline-block px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r ${game.color}`}
                      >
                        {game.subtitle}
                      </div>
                    </div>

                    {/* Description - Fixed height to ensure consistency */}
                    <div className="flex-1 flex flex-col">
                      <p className="text-white/80 text-center mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base min-h-[120px] flex items-center justify-center">
                        {game.description}
                      </p>

                      {/* Features - Fixed height container */}
                      <div className="mb-4 sm:mb-6 min-h-[140px]">
                        <h4 className="text-white font-semibold mb-2 sm:mb-3 text-center text-sm sm:text-base">
                          ✨ Features:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                          {game.features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center text-white/70 text-xs sm:text-sm"
                            >
                              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mr-2 flex-shrink-0"></div>
                              <span className="truncate">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex justify-between items-center mb-4 sm:mb-6 text-xs sm:text-sm text-white/60">
                        <span>Version: {game.stats.version}</span>
                        <span>Released: {game.stats.released}</span>
                      </div>

                      {/* Difficulty Badge */}
                      <div className="text-center mb-4 sm:mb-6">
                        <span className="inline-block px-2 sm:px-3 py-1 bg-white/20 rounded-full text-white/80 text-xs sm:text-sm">
                          {game.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Play Button - Always at bottom */}
                    <div className="text-center mt-auto">
                      <button
                        className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg text-white transition-all duration-300 transform group-hover:scale-105 bg-gradient-to-r ${
                          hoveredCard === game.id ? game.hoverColor : game.color
                        } shadow-lg hover:shadow-xl`}
                      >
                        🎮 Play Now
                      </button>
                    </div>

                    {/* Hover Glow Effect */}
                    <div
                      className={`absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-r ${game.color} blur-xl -z-10`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="text-center mt-8 sm:mt-12">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-4xl mx-auto border border-white/20">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                  🎯 About Number Hunter
                </h3>
                <p className="text-white/80 leading-relaxed text-sm sm:text-base mb-4">
                  Number Hunter is an addictive puzzle game where you click
                  numbered bubbles in sequential order. Test your speed,
                  accuracy, and concentration as you progress through
                  increasingly challenging levels. Can you clear all the numbers
                  without making a mistake?
                </p>

                {/* New Performance Note */}
                <div className="bg-orange-500/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 mb-4 border border-orange-400/30">
                  <div className="flex items-center justify-center space-x-2 text-orange-200 font-semibold mb-2">
                    <span>⚡</span>
                    <span className="text-sm sm:text-base">
                      Performance Update!
                    </span>
                  </div>
                  <p className="text-orange-100/80 text-xs sm:text-sm">
                    Try the new Number Hunter Deluxe Pro v2.1 featuring
                    intelligent rendering and advanced anti-lag technology for
                    smooth gameplay even with massive datasets!
                  </p>
                </div>

                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-white/60">
                  <span>🏆 Challenge Your Skills</span>
                  <span>⚡ Fast-Paced Action</span>
                  <span>🎨 Beautiful Graphics</span>
                  <span>🚀 Optimized Performance</span>
                </div>
              </div>
            </div>

            {/* Secret 404 Button */}
            <div className="text-center mt-8 sm:mt-12">
              <div className="group relative inline-block">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                <button
                  onClick={() => handleGameSelect("/404")}
                  className="relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-gray-800 via-gray-900 to-black rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 border border-red-500/30 shadow-2xl group-hover:shadow-red-500/30"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl animate-spin group-hover:animate-bounce">
                      💀
                    </span>
                    <div className="text-left">
                      <div className="text-lg font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                        Secret Portal
                      </div>
                      <div className="text-xs text-gray-400 group-hover:text-red-300 transition-colors">
                        Enter if you dare...
                      </div>
                    </div>
                    <span className="text-xl group-hover:animate-pulse">
                      🚪
                    </span>
                  </div>

                  {/* Glitch Effect */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="absolute inset-0 bg-red-500/10 rounded-xl animate-ping"></div>
                  </div>
                </button>

                {/* Floating particles around button */}
                <div className="absolute -top-2 -left-2 w-2 h-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                <div
                  className="absolute -top-1 -right-3 w-1.5 h-1.5 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 animate-ping"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="absolute -bottom-2 -left-3 w-1 h-1 bg-pink-500 rounded-full opacity-0 group-hover:opacity-100 animate-ping"
                  style={{ animationDelay: "0.4s" }}
                ></div>
                <div
                  className="absolute -bottom-1 -right-2 w-2 h-2 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping"
                  style={{ animationDelay: "0.6s" }}
                ></div>
              </div>

              {/* Warning text */}
              <p className="mt-3 text-xs text-white/40 group-hover:text-red-300/60 transition-colors duration-300">
                ⚠️ This leads to the mysterious 404 dimension
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-4 sm:py-6 text-white/50 text-xs sm:text-sm px-4">
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

        /* Hide scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default MainApp;
