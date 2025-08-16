import React, { useState, useEffect } from "react";

const NotFoundPage = () => {
  const [floatingNumbers, setFloatingNumbers] = useState([]);
  const [glitchText, setGlitchText] = useState("404");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Generate floating numbers animation
  useEffect(() => {
    const numbers = [];
    for (let i = 0; i < 30; i++) {
      numbers.push({
        id: i,
        number: Math.floor(Math.random() * 999) + 1,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 20 + 15,
        speed: Math.random() * 3 + 2,
        opacity: Math.random() * 0.7 + 0.3,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      });
    }
    setFloatingNumbers(numbers);
  }, []);

  // Glitch effect for 404 text
  useEffect(() => {
    const glitchChars = ["4", "0", "4", "?", "#", "@", "!", "*"];
    const interval = setInterval(() => {
      let newText = "404";
      if (Math.random() < 0.3) {
        const randomIndex = Math.floor(Math.random() * 3);
        const randomChar =
          glitchChars[Math.floor(Math.random() * glitchChars.length)];
        newText = newText
          .split("")
          .map((char, index) => (index === randomIndex ? randomChar : char))
          .join("");
      }
      setGlitchText(newText);
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // Update time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handlePlayGame = (version) => {
    const path = version === "v1" ? "/number-hunter" : "/number-hunter-v2";
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
      {/* Animated Background Numbers */}
      <div className="absolute inset-0">
        {floatingNumbers.map((num) => (
          <div
            key={num.id}
            className="absolute font-bold pointer-events-none select-none animate-pulse"
            style={{
              left: `${num.x}%`,
              top: `${num.y}%`,
              fontSize: `${num.size}px`,
              color: num.color,
              opacity: num.opacity,
              animation: `float-diagonal ${num.speed * 4}s infinite linear`,
              textShadow: `0 0 10px ${num.color}50`,
            }}
          >
            {num.number}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* 404 Title with Glitch Effect */}
        <div className="mb-12">
          <h1
            className="text-9xl md:text-[12rem] font-black text-transparent bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text drop-shadow-2xl mb-4 glitch-text"
            data-text={glitchText}
          >
            {glitchText}
          </h1>
          <div className="w-48 h-2 bg-gradient-to-r from-red-500 to-purple-500 mx-auto rounded-full animate-pulse"></div>
        </div>

        {/* Error Message */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-bounce">
            🎯 Number Not Found!
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed mb-4">
            Oops! Looks like you clicked the wrong number in the sequence.
          </p>
          <p className="text-lg text-gray-400">
            The page you're looking for seems to have popped like a bubble! 💭
          </p>
        </div>

        {/* Fun Stats Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-12 border border-white/20 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-6">🎮 Game Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-red-400">404</div>
              <div className="text-sm text-gray-300">Error Code</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-400">
                {currentTime.getSeconds()}
              </div>
              <div className="text-sm text-gray-300">Seconds Wasted</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-400">∞</div>
              <div className="text-sm text-gray-300">Ways to Have Fun</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleGoHome}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              🏠 Back to Home
            </button>

            <button
              onClick={() => handlePlayGame("v2")}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white font-bold text-lg rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              🚀 Play Game Instead
            </button>
          </div>

          <div className="text-gray-400 text-sm">
            Or try these quick actions:
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handlePlayGame("v1")}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all duration-300 hover:scale-105"
            >
              🎯 Classic Game
            </button>

            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all duration-300 hover:scale-105"
            >
              ⏮️ Go Back
            </button>

            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all duration-300 hover:scale-105"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Fun Message */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-full font-bold text-lg animate-pulse">
            🎪 Don't worry, even the best bubble hunters miss sometimes!
          </div>
        </div>

        {/* Animated Arrow */}
        <div className="mt-8 animate-bounce">
          <div className="text-4xl">👆</div>
          <div className="text-gray-400 text-sm">
            Click any button above to continue your adventure!
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float-diagonal {
          0% {
            transform: translate(0, 100vh) rotate(0deg);
          }
          100% {
            transform: translate(50px, -100px) rotate(360deg);
          }
        }

        .glitch-text {
          position: relative;
          animation: glitch 1s infinite;
        }

        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .glitch-text::before {
          animation: glitch-1 0.5s infinite;
          color: #ff00ff;
          z-index: -1;
        }

        .glitch-text::after {
          animation: glitch-2 0.5s infinite;
          color: #00ffff;
          z-index: -2;
        }

        @keyframes glitch {
          0%,
          100% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
        }

        @keyframes glitch-1 {
          0%,
          100% {
            transform: translate(0);
          }
          10% {
            transform: translate(-2px, -2px);
          }
          20% {
            transform: translate(2px, 2px);
          }
          30% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(2px, -2px);
          }
        }

        @keyframes glitch-2 {
          0%,
          100% {
            transform: translate(0);
          }
          10% {
            transform: translate(2px, 2px);
          }
          20% {
            transform: translate(-2px, -2px);
          }
          30% {
            transform: translate(2px, -2px);
          }
          40% {
            transform: translate(-2px, 2px);
          }
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;
