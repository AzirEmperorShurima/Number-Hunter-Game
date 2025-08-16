import React, { useState, useEffect } from "react";

const LoadingComponent = ({ message = "Loading Game..." }) => {
  const [loadingText, setLoadingText] = useState("");
  const [progress, setProgress] = useState(0);
  const [bubbles, setBubbles] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(1);

  // Animated typing effect for loading text
  useEffect(() => {
    const fullText = message;
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index <= fullText.length) {
        setLoadingText(fullText.slice(0, index));
        index++;
      } else {
        // Reset and start over
        index = 0;
      }
    }, 150);

    return () => clearInterval(typingInterval);
  }, [message]);

  // Progress bar animation
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0; // Reset when complete
        return prev + Math.random() * 5 + 2; // Random increment
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, []);

  // Generate loading bubbles with numbers
  useEffect(() => {
    const generateBubbles = () => {
      const newBubbles = [];
      for (let i = 0; i < 20; i++) {
        newBubbles.push({
          id: i,
          number: Math.floor(Math.random() * 99) + 1,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 30 + 20,
          delay: Math.random() * 2,
          duration: Math.random() * 3 + 2,
          color: `hsl(${(i * 18) % 360}, 70%, 65%)`,
        });
      }
      setBubbles(newBubbles);
    };

    generateBubbles();
    const bubbleInterval = setInterval(generateBubbles, 5000);
    return () => clearInterval(bubbleInterval);
  }, []);

  // Counting number animation
  useEffect(() => {
    const numberInterval = setInterval(() => {
      setCurrentNumber((prev) =>
        prev >= 999 ? 1 : prev + Math.floor(Math.random() * 5) + 1
      );
    }, 200);

    return () => clearInterval(numberInterval);
  }, []);

  const getBubbleStyle = (bubble) => ({
    position: "absolute",
    left: `${bubble.x}%`,
    top: `${bubble.y}%`,
    width: `${bubble.size}px`,
    height: `${bubble.size}px`,
    backgroundColor: bubble.color,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: `${Math.max(bubble.size * 0.3, 10)}px`,
    fontWeight: "bold",
    color: "white",
    textShadow: "0 1px 3px rgba(0,0,0,0.3)",
    animation: `float-bubble ${bubble.duration}s infinite ease-in-out`,
    animationDelay: `${bubble.delay}s`,
    opacity: 0.8,
    border: "2px solid rgba(255,255,255,0.3)",
  });

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-800 flex items-center justify-center z-50 overflow-hidden">
      {/* Animated background bubbles */}
      <div className="absolute inset-0">
        {bubbles.map((bubble) => (
          <div key={bubble.id} style={getBubbleStyle(bubble)}>
            {bubble.number}
          </div>
        ))}
      </div>

      {/* Main loading content */}
      <div className="relative z-10 text-center px-6 max-w-md mx-auto">
        {/* Loading Icon */}
        <div className="mb-8">
          <div className="relative">
            {/* Spinning outer ring */}
            <div className="w-32 h-32 mx-auto rounded-full border-4 border-transparent border-t-white border-r-white animate-spin"></div>

            {/* Inner pulsing circle with number */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse shadow-2xl">
                <span className="text-2xl font-bold text-white">
                  {currentNumber}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading text with typing effect */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {loadingText}
            <span className="animate-pulse">|</span>
          </h2>
          <p className="text-gray-300 text-lg">
            Preparing your gaming experience...
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-300 mt-2">
            <span>Loading...</span>
            <span>{Math.round(Math.min(progress, 100))}%</span>
          </div>
        </div>

        {/* Fun loading messages */}
        <div className="space-y-2 text-gray-300">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <span>Generating random numbers...</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce animation-delay-200"></div>
            <span>Inflating bubbles...</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce animation-delay-400"></div>
            <span>Calibrating difficulty...</span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="mt-8 flex justify-center space-x-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float-bubble {
          0%,
          100% {
            transform: translateY(0px) scale(1) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) scale(1.1) rotate(90deg);
          }
          50% {
            transform: translateY(10px) scale(0.9) rotate(180deg);
          }
          75% {
            transform: translateY(-15px) scale(1.05) rotate(270deg);
          }
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingComponent;
