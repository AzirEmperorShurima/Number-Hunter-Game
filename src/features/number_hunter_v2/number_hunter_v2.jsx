import { useState, useEffect, useCallback } from "react";

const NUMBER_HUNTER_V2 = () => {
  const [targetPoints, setTargetPoints] = useState(2000);
  const [gameState, setGameState] = useState("setup"); // 'setup', 'playing', 'gameOver', 'allCleared'
  const [bubbles, setBubbles] = useState([]);
  const [currentTarget, setCurrentTarget] = useState(1);
  const [time, setTime] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [clickedBubbles, setClickedBubbles] = useState(new Set());
  const [disappearingBubbles, setDisappearingBubbles] = useState(new Set());
  const [newBubbles, setNewBubbles] = useState(new Set());
  const [score, setScore] = useState(0);

  // Generate random bubbles
  const generateBubbles = useCallback((maxNumber) => {
    const bubbleData = [];
    const containerWidth = 600;
    const containerHeight = 400;
    const bubbleSize = 35;

    // Prioritize smaller numbers to avoid unwinnable scenarios
    const numbers = [];
    for (let i = 1; i <= maxNumber; i++) {
      numbers.push(i);
    }

    // Add some random numbers to fill the grid
    const totalBubbles = Math.min(
      150,
      maxNumber + Math.floor(Math.random() * 30)
    );

    for (let i = 0; i < totalBubbles; i++) {
      let number;
      if (i < maxNumber) {
        // Ensure we have all numbers from 1 to maxNumber
        number = i + 1;
      } else {
        // Add random numbers
        number = Math.floor(Math.random() * maxNumber) + 1;
      }

      const bubble = {
        id: i,
        number: number,
        x: Math.random() * (containerWidth - bubbleSize),
        y: Math.random() * (containerHeight - bubbleSize),
        size: bubbleSize,
        hue: (number * 137.5) % 360, // Golden angle for nice color distribution
      };
      bubbleData.push(bubble);
    }

    return bubbleData;
  }, []);

  const startGame = useCallback(() => {
    const bubbleData = generateBubbles(targetPoints);
    setBubbles(bubbleData);
    setCurrentTarget(1);
    setTime(0);
    setScore(0);
    setGameState("playing");
    setClickedBubbles(new Set());
    setDisappearingBubbles(new Set());
    setNewBubbles(new Set(bubbleData.map((b) => b.id)));

    // Remove new bubble animation after delay
    setTimeout(() => {
      setNewBubbles(new Set());
    }, 1000);
  }, [targetPoints, generateBubbles]);

  const restartGame = useCallback(() => {
    setGameState("setup");
    setBubbles([]);
    setCurrentTarget(1);
    setTime(0);
    setScore(0);
    setClickedBubbles(new Set());
    setDisappearingBubbles(new Set());
    setNewBubbles(new Set());
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
      setScore((prev) => prev + bubble.number);

      // Remove bubble after animation
      setTimeout(() => {
        setDisappearingBubbles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(bubble.id);
          return newSet;
        });
        setBubbles((prev) => prev.filter((b) => b.id !== bubble.id));
      }, 600);

      if (currentTarget === targetPoints) {
        setTimeout(() => {
          setGameState("allCleared");
        }, 700);
      } else {
        setCurrentTarget((prev) => prev + 1);
      }
    } else {
      // Wrong bubble clicked - game over
      setClickedBubbles((prev) => new Set([...prev, bubble.id]));
      setTimeout(() => {
        setGameState("gameOver");
      }, 300);
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
        return "LET'S PLAY";
    }
  };

  const getTitleColor = () => {
    switch (gameState) {
      case "gameOver":
        return "text-red-600";
      case "allCleared":
        return "text-green-600";
      default:
        return "text-purple-700";
    }
  };

  const getBubbleStyle = (bubble) => {
    const isClicked = clickedBubbles.has(bubble.id);
    const isDisappearing = disappearingBubbles.has(bubble.id);
    const isNew = newBubbles.has(bubble.id);
    const isTarget = bubble.number === currentTarget && gameState === "playing";

    // Dynamic font size based on number length to prevent overflow
    const getFontSize = (number) => {
      const numStr = number.toString();
      if (numStr.length >= 4) return "10px";
      if (numStr.length >= 3) return "12px";
      if (numStr.length >= 2) return "14px";
      return "16px";
    };

    // Z-index: smaller numbers appear on top
    const zIndex = isClicked ? 1000 : Math.max(1, 10000 - bubble.number);

    // Color based on state
    let backgroundColor, borderColor, boxShadow, transform;

    if (isClicked && gameState === "gameOver") {
      backgroundColor = "#EF4444"; // Red for wrong click
      borderColor = "#DC2626";
      boxShadow = "0 0 20px rgba(239, 68, 68, 0.6)";
    } else if (isClicked) {
      backgroundColor = "#10B981"; // Green for correct click
      borderColor = "#059669";
      boxShadow = "0 0 20px rgba(16, 185, 129, 0.6)";
    } else if (isTarget) {
      backgroundColor = `hsl(${bubble.hue}, 70%, 85%)`;
      borderColor = `hsl(${bubble.hue}, 70%, 50%)`;
      boxShadow = `0 0 15px hsl(${bubble.hue}, 70%, 70%)`;
      transform = "scale(1.1)";
    } else {
      backgroundColor = `hsl(${bubble.hue}, 60%, 95%)`;
      borderColor = `hsl(${bubble.hue}, 60%, 60%)`;
      boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
    }

    return {
      position: "absolute",
      left: `${bubble.x}px`,
      top: `${bubble.y}px`,
      width: `${bubble.size}px`,
      height: `${bubble.size}px`,
      borderRadius: "50%",
      border: `3px solid ${borderColor}`,
      backgroundColor,
      boxShadow,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: gameState === "playing" ? "pointer" : "default",
      fontSize: getFontSize(bubble.number),
      fontWeight: "bold",
      color: isClicked ? "white" : "#1F2937",
      userSelect: "none",
      opacity: isDisappearing ? 0 : isNew ? 0 : 1,
      transform: isDisappearing
        ? "scale(0) rotate(180deg)"
        : isNew
        ? "scale(0)"
        : transform || "scale(1)",
      transition: isDisappearing
        ? "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
        : isNew
        ? "all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)"
        : "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      zIndex: zIndex,
      textAlign: "center",
      lineHeight: "1",
      boxSizing: "border-box",
      wordBreak: "break-all",
      overflow: "hidden",
      textShadow: isClicked ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className={`text-5xl font-bold mb-4 transition-all duration-500 ${getTitleColor()}`}
          >
            {getGameTitle()}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full"></div>
        </div>

        {/* Game Controls Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-xl shadow-lg">
              <label className="text-sm font-medium opacity-90">
                Target Points
              </label>
              <input
                type="number"
                value={targetPoints}
                onChange={(e) =>
                  setTargetPoints(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-full bg-white/20 text-white placeholder-white/70 border border-white/30 px-3 py-2 rounded-lg mt-2 text-lg font-bold"
                disabled={gameState === "playing"}
                min="1"
              />
            </div>

            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl shadow-lg">
              <span className="text-sm font-medium opacity-90">Time</span>
              <div className="text-2xl font-bold mt-2">{formatTime(time)}</div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl shadow-lg">
              <span className="text-sm font-medium opacity-90">Score</span>
              <div className="text-2xl font-bold mt-2">
                {score.toLocaleString()}
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl shadow-lg">
              <span className="text-sm font-medium opacity-90">Progress</span>
              <div className="text-2xl font-bold mt-2">
                {currentTarget - 1} / {targetPoints}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {gameState === "setup" && (
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                🚀 Start Game
              </button>
            )}

            {(gameState === "gameOver" || gameState === "allCleared") && (
              <button
                onClick={restartGame}
                className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                🔄 Play Again
              </button>
            )}

            {gameState === "playing" && (
              <>
                <button
                  onClick={() => setAutoPlay(!autoPlay)}
                  className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg transform transition-all duration-200 hover:scale-105 ${
                    autoPlay
                      ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
                      : "bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white"
                  }`}
                >
                  {autoPlay ? "⏸️ Auto OFF" : "▶️ Auto ON"}
                </button>
                <button
                  onClick={restartGame}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg transform transition-all duration-200 hover:scale-105"
                >
                  🔄 Restart
                </button>
              </>
            )}
          </div>
        </div>

        {/* Next Target Indicator */}
        {gameState === "playing" && (
          <div className="text-center mb-6">
            <div className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-xl animate-pulse">
              <div className="text-sm font-medium opacity-90">Click Number</div>
              <div className="text-4xl font-bold">{currentTarget}</div>
            </div>
          </div>
        )}

        {/* Game Board */}
        <div className="flex justify-center mb-6">
          <div
            className="relative bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-white/30 overflow-hidden"
            style={{
              height: "420px",
              width: "620px",
            }}
          >
            <div
              className="absolute inset-2"
              style={{
                height: "400px",
                width: "600px",
              }}
            >
              {bubbles.map((bubble) => (
                <div
                  key={bubble.id}
                  style={getBubbleStyle(bubble)}
                  onClick={() => handleBubbleClick(bubble)}
                  className="hover:cursor-pointer"
                >
                  {bubble.number}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Game Status Messages */}
        {gameState === "gameOver" && (
          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-red-500 to-pink-600 text-white p-6 rounded-2xl shadow-xl animate-bounce">
              <h3 className="text-2xl font-bold mb-2">💥 Game Over!</h3>
              <p className="text-lg opacity-90">
                Wrong bubble clicked. Better luck next time!
              </p>
            </div>
          </div>
        )}

        {gameState === "allCleared" && (
          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-xl animate-bounce">
              <h3 className="text-2xl font-bold mb-2">🎉 Congratulations!</h3>
              <p className="text-lg opacity-90">
                Cleared {targetPoints} points in {formatTime(time)}!
              </p>
              <p className="text-lg opacity-90">
                Final Score: {score.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NUMBER_HUNTER_V2;
