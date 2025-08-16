import { useState, useEffect, useCallback, useRef } from "react";

const BubblePoppingGame = () => {
  const [targetPoints, setTargetPoints] = useState(2000);
  const [gameState, setGameState] = useState("setup"); // 'setup', 'playing', 'gameOver', 'allCleared'
  const [bubbles, setBubbles] = useState([]);
  const [currentTarget, setCurrentTarget] = useState(1);
  const [time, setTime] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [clickedBubbles, setClickedBubbles] = useState(new Set());
  const [disappearingBubbles, setDisappearingBubbles] = useState(new Set());
  const [clickTimes, setClickTimes] = useState(new Map());
  const gameAreaRef = useRef(null);
  const [gameAreaSize, setGameAreaSize] = useState({ width: 600, height: 400 });

  // Update game area size based on screen size
  useEffect(() => {
    const updateGameAreaSize = () => {
      if (gameAreaRef.current) {
        const containerWidth = Math.min(window.innerWidth - 40, 800);
        const containerHeight = Math.min(window.innerHeight - 300, 500);
        const minWidth = 300;
        const minHeight = 250;

        const width = Math.max(minWidth, containerWidth);
        const height = Math.max(minHeight, containerHeight);

        setGameAreaSize({ width, height });
      }
    };

    updateGameAreaSize();
    window.addEventListener("resize", updateGameAreaSize);
    return () => window.removeEventListener("resize", updateGameAreaSize);
  }, []);

  // Generate random bubbles with responsive sizing
  const generateBubbles = useCallback(
    (maxNumber) => {
      const bubbleData = [];
      const bubbleSize = Math.max(30, Math.min(45, gameAreaSize.width / 20));

      // Create exactly maxNumber bubbles (one for each number from 1 to maxNumber)
      const numbers = [];
      for (let i = 1; i <= maxNumber; i++) {
        numbers.push(i);
      }

      // Shuffle the numbers to randomize their initial positions
      for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
      }

      // Create bubbles with position collision avoidance
      const positions = [];
      const minDistance = bubbleSize + 5; // Minimum distance between bubble centers

      for (let i = 0; i < maxNumber; i++) {
        let attempts = 0;
        let validPosition = false;
        let x, y;

        // Try to find a position that doesn't overlap with existing bubbles
        while (!validPosition && attempts < 100) {
          x = Math.random() * (gameAreaSize.width - bubbleSize);
          y = Math.random() * (gameAreaSize.height - bubbleSize);

          validPosition = true;
          for (const pos of positions) {
            const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
            if (distance < minDistance) {
              validPosition = false;
              break;
            }
          }
          attempts++;
        }

        // If we can't find a non-overlapping position, just use the last generated position
        if (!validPosition) {
          x = Math.random() * (gameAreaSize.width - bubbleSize);
          y = Math.random() * (gameAreaSize.height - bubbleSize);
        }

        positions.push({ x, y });

        const bubble = {
          id: i,
          number: numbers[i],
          x: x,
          y: y,
          size: bubbleSize,
        };
        bubbleData.push(bubble);
      }

      return bubbleData;
    },
    [gameAreaSize]
  );

  const startGame = useCallback(() => {
    const bubbleData = generateBubbles(targetPoints);
    setBubbles(bubbleData);
    setCurrentTarget(1);
    setTime(0);
    setGameState("playing");
    setClickedBubbles(new Set());
    setDisappearingBubbles(new Set());
    setClickTimes(new Map());
  }, [targetPoints, generateBubbles]);

  const restartGame = useCallback(() => {
    setGameState("setup");
    setBubbles([]);
    setCurrentTarget(1);
    setTime(0);
    setClickedBubbles(new Set());
    setDisappearingBubbles(new Set());
    setClickTimes(new Map());
    setAutoPlay(false);
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameState === "playing") {
      interval = setInterval(() => {
        setTime((prev) => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Auto play effect
  useEffect(() => {
    if (autoPlay && gameState === "playing") {
      const interval = setInterval(() => {
        const targetBubble = bubbles.find(
          (bubble) =>
            bubble.number === currentTarget &&
            !clickedBubbles.has(bubble.id) &&
            !disappearingBubbles.has(bubble.id)
        );

        if (targetBubble) {
          handleBubbleClick(targetBubble);
        }
      }, 300);

      return () => clearInterval(interval);
    }
  }, [
    autoPlay,
    gameState,
    bubbles,
    currentTarget,
    clickedBubbles,
    disappearingBubbles,
  ]);

  const handleBubbleClick = (bubble) => {
    if (
      gameState !== "playing" ||
      clickedBubbles.has(bubble.id) ||
      disappearingBubbles.has(bubble.id)
    ) {
      return;
    }

    if (bubble.number === currentTarget) {
      // Correct bubble clicked
      setClickedBubbles((prev) => new Set([...prev, bubble.id]));
      setDisappearingBubbles((prev) => new Set([...prev, bubble.id]));
      setClickTimes(
        (prev) => new Map([...prev, [bubble.id, formatTime(time)]])
      );

      // Remove bubble after 1.5s to show the time
      setTimeout(() => {
        setDisappearingBubbles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(bubble.id);
          return newSet;
        });
        setBubbles((prev) => prev.filter((b) => b.id !== bubble.id));
        setClickTimes((prev) => {
          const newMap = new Map(prev);
          newMap.delete(bubble.id);
          return newMap;
        });
      }, 1500);

      if (currentTarget === targetPoints) {
        setGameState("allCleared");
      } else {
        setCurrentTarget((prev) => prev + 1);
      }
    } else {
      // Wrong bubble clicked - game over
      setClickedBubbles((prev) => new Set([...prev, bubble.id]));
      setClickTimes(
        (prev) => new Map([...prev, [bubble.id, formatTime(time)]])
      );
      setGameState("gameOver");
    }
  };

  const formatTime = (time) => {
    return time.toFixed(1) + "s";
  };

  const getGameTitle = () => {
    switch (gameState) {
      case "gameOver":
        return "GAME OVER";
      case "allCleared":
        return "ALL CLEARED!";
      default:
        return "BUBBLE POP CHALLENGE";
    }
  };

  const getTitleColor = () => {
    switch (gameState) {
      case "gameOver":
        return "text-red-500";
      case "allCleared":
        return "text-emerald-500";
      default:
        return "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent";
    }
  };

  const getBubbleStyle = (bubble) => {
    const isClicked = clickedBubbles.has(bubble.id);
    const isDisappearing = disappearingBubbles.has(bubble.id);
    const isTarget = bubble.number === currentTarget;

    // Dynamic font size based on number length and bubble size
    const getFontSize = (number, size) => {
      const numStr = number.toString();
      const baseFontSize = size / 4;
      if (numStr.length >= 4) return `${baseFontSize * 0.6}px`;
      if (numStr.length >= 3) return `${baseFontSize * 0.7}px`;
      if (numStr.length >= 2) return `${baseFontSize * 0.8}px`;
      return `${baseFontSize}px`;
    };

    // Priority z-index system: smaller numbers have higher z-index (appear on top)
    // Base z-index starts from 10000 and decreases with larger numbers
    // Clicked bubbles get even higher z-index
    // Target bubble gets the highest z-index among unclicked bubbles
    const getZIndex = () => {
      if (isClicked) return 50000 + (10000 - bubble.number); // Highest priority for clicked bubbles
      if (isTarget && gameState === "playing")
        return 40000 + (10000 - bubble.number); // High priority for target
      return 10000 - bubble.number; // Lower numbers = higher z-index
    };

    const zIndex = getZIndex();

    // Gradient colors for bubbles
    const getBackgroundColor = () => {
      if (isClicked) return "linear-gradient(135deg, #ff6b6b, #ee5a52)";
      if (isTarget && gameState === "playing")
        return "linear-gradient(135deg, #4facfe, #00f2fe)";

      // Color coding based on number ranges for better visual hierarchy
      if (bubble.number <= 10)
        return "linear-gradient(135deg, #a8edea, #fed6e3)";
      if (bubble.number <= 50)
        return "linear-gradient(135deg, #d299c2, #fef9d7)";
      if (bubble.number <= 100)
        return "linear-gradient(135deg, #89f7fe, #66a6ff)";
      if (bubble.number <= 500)
        return "linear-gradient(135deg, #667eea, #764ba2)";
      if (bubble.number <= 1000)
        return "linear-gradient(135deg, #f093fb, #f5576c)";
      return "linear-gradient(135deg, #4facfe, #00f2fe)";
    };

    return {
      position: "absolute",
      left: `${bubble.x}px`,
      top: `${bubble.y}px`,
      width: `${bubble.size}px`,
      height: `${bubble.size}px`,
      borderRadius: "50%",
      background: getBackgroundColor(),
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      cursor: gameState === "playing" ? "pointer" : "default",
      fontSize: getFontSize(bubble.number, bubble.size),
      fontWeight: "bold",
      color: bubble.number <= 100 ? "#333" : "white", // Dark text for light backgrounds
      userSelect: "none",
      opacity: isDisappearing ? 0.3 : 1,
      transform: isDisappearing
        ? "scale(0.3)"
        : isTarget && gameState === "playing"
        ? "scale(1.15)"
        : "scale(1)",
      transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
      zIndex: zIndex,
      textAlign: "center",
      lineHeight: "1",
      boxSizing: "border-box",
      wordBreak: "break-all",
      overflow: "visible", // Allow content to be visible even if it overflows slightly
      boxShadow:
        isTarget && gameState === "playing"
          ? `0 0 25px rgba(79, 172, 254, 0.9), 0 0 15px rgba(79, 172, 254, 0.6), 0 4px 8px rgba(0,0,0,0.3)`
          : bubble.number <= 50
          ? "0 6px 12px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)" // Stronger shadow for smaller numbers
          : "0 4px 8px rgba(0,0,0,0.2)",
      animation:
        isTarget && gameState === "playing" ? "pulse 1.5s infinite" : "none",
      border:
        bubble.number <= 50
          ? "2px solid rgba(255,255,255,0.8)"
          : "1px solid rgba(255,255,255,0.4)",
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-2 sm:p-4">
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1.15);
            box-shadow: 0 0 25px rgba(79, 172, 254, 0.9),
              0 0 15px rgba(79, 172, 254, 0.6);
          }
          50% {
            transform: scale(1.25);
            box-shadow: 0 0 35px rgba(79, 172, 254, 1),
              0 0 25px rgba(79, 172, 254, 0.8);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-4 sm:p-6 border border-white/20">
          <h1
            className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center ${getTitleColor()}`}
          >
            {getGameTitle()}
          </h1>

          {/* Game Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                <label className="font-semibold text-white">Points:</label>
                <input
                  type="number"
                  value={targetPoints}
                  onChange={(e) =>
                    setTargetPoints(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="bg-white/20 text-white placeholder-white/70 border border-white/30 px-3 py-1 rounded-full w-20 text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={gameState === "playing"}
                  min="1"
                />
              </div>

              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                <span className="font-semibold text-white">Time:</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-white font-mono">
                  {formatTime(time)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {gameState === "setup" && (
                <button
                  onClick={startGame}
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white px-6 py-3 rounded-full font-semibold transform transition-all hover:scale-105 shadow-lg"
                >
                  🚀 Start Game
                </button>
              )}

              {(gameState === "gameOver" || gameState === "allCleared") && (
                <button
                  onClick={restartGame}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full font-semibold transform transition-all hover:scale-105 shadow-lg"
                >
                  🔄 Play Again
                </button>
              )}

              {gameState === "playing" && (
                <>
                  <button
                    onClick={() => setAutoPlay(!autoPlay)}
                    className={`px-6 py-3 rounded-full font-semibold transform transition-all hover:scale-105 shadow-lg ${
                      autoPlay
                        ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                        : "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
                    }`}
                  >
                    {autoPlay ? "🔥 Auto ON" : "⚡ Auto OFF"}
                  </button>
                  <button
                    onClick={restartGame}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-full font-semibold transform transition-all hover:scale-105 shadow-lg"
                  >
                    🔄 Restart
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Current Target Display */}
          {gameState === "playing" && (
            <div className="mb-4 text-center">
              <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg transform animate-bounce">
                <span className="text-lg sm:text-xl font-bold">
                  🎯 Find: {currentTarget}
                </span>
              </div>
            </div>
          )}

          {/* Game Area */}
          <div className="flex justify-center mb-4">
            <div
              ref={gameAreaRef}
              className="relative border-4 border-white/30 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-2xl backdrop-blur-sm overflow-hidden shadow-inner"
              style={{
                height: `${gameAreaSize.height}px`,
                width: `${gameAreaSize.width}px`,
              }}
            >
              {bubbles.map((bubble) => (
                <div
                  key={bubble.id}
                  style={getBubbleStyle(bubble)}
                  onClick={() => handleBubbleClick(bubble)}
                  className="hover:brightness-110 active:scale-95 transition-all duration-150"
                >
                  <div>{bubble.number}</div>
                  {clickTimes.has(bubble.id) && (
                    <div
                      style={{
                        fontSize: `${bubble.size / 6}px`,
                        marginTop: "2px",
                        opacity: 0.9,
                        fontWeight: "normal",
                      }}
                    >
                      {clickTimes.get(bubble.id)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Game Status Messages */}
          {gameState === "gameOver" && (
            <div className="text-center p-6 bg-red-500/20 border-2 border-red-500/50 rounded-2xl backdrop-blur-sm">
              <h3 className="text-xl sm:text-2xl font-bold text-red-300 mb-2">
                💥 Oops!
              </h3>
              <p className="text-red-200 text-sm sm:text-base">
                Wrong bubble! The sequence was broken. Try again and follow the
                numbers in order!
              </p>
            </div>
          )}

          {gameState === "allCleared" && (
            <div className="text-center p-6 bg-emerald-500/20 border-2 border-emerald-500/50 rounded-2xl backdrop-blur-sm">
              <h3 className="text-xl sm:text-2xl font-bold text-emerald-300 mb-2">
                🎉 Amazing!
              </h3>
              <p className="text-emerald-200 text-sm sm:text-base">
                Perfect! You cleared all {targetPoints} bubbles in just{" "}
                {formatTime(time)}!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BubblePoppingGame;
