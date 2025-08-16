import { useState, useEffect, useCallback } from "react";

const BubblePoppingGame = () => {
  const [targetPoints, setTargetPoints] = useState(20);
  const [gameState, setGameState] = useState("setup"); // 'setup', 'playing', 'gameOver', 'allCleared'
  const [bubbles, setBubbles] = useState([]);
  const [currentTarget, setCurrentTarget] = useState(1);
  const [time, setTime] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [clickedBubbles, setClickedBubbles] = useState(new Set());
  const [disappearingBubbles, setDisappearingBubbles] = useState(new Set());

  // Generate bubbles with better positioning and z-index priority
  const generateBubbles = useCallback((maxNumber) => {
    const bubbleData = [];
    const containerWidth = 600;
    const containerHeight = 400;
    const bubbleSize = 40;
    const margin = 5; // Minimum distance between bubbles

    // Create exactly maxNumber bubbles (one for each number)
    const positions = [];

    // Generate non-overlapping positions
    const generatePosition = () => {
      let attempts = 0;
      let position;

      do {
        position = {
          x: Math.random() * (containerWidth - bubbleSize),
          y: Math.random() * (containerHeight - bubbleSize),
        };
        attempts++;
      } while (
        attempts < 100 &&
        positions.some(
          (pos) =>
            Math.abs(pos.x - position.x) < bubbleSize + margin &&
            Math.abs(pos.y - position.y) < bubbleSize + margin
        )
      );

      return position;
    };

    // Create bubbles for numbers 1 to maxNumber
    for (let i = 1; i <= maxNumber; i++) {
      const position = generatePosition();
      positions.push(position);

      const bubble = {
        id: i,
        number: i,
        x: position.x,
        y: position.y,
        size: bubbleSize,
        // Z-index: smaller numbers get higher z-index (appear on top)
        // This ensures number 10 appears above number 11, etc.
        zIndex: maxNumber - i + 100,
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
    setGameState("playing");
    setClickedBubbles(new Set());
    setDisappearingBubbles(new Set());
  }, [targetPoints, generateBubbles]);

  const restartGame = useCallback(() => {
    setGameState("setup");
    setBubbles([]);
    setCurrentTarget(1);
    setTime(0);
    setClickedBubbles(new Set());
    setDisappearingBubbles(new Set());
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
        setGameState("allCleared");
      } else {
        setCurrentTarget((prev) => prev + 1);
      }
    } else {
      // Wrong bubble clicked - game over
      setClickedBubbles((prev) => new Set([...prev, bubble.id]));
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
        return "LET'S PLAY BUBBLE POPPING";
    }
  };

  const getTitleColor = () => {
    switch (gameState) {
      case "gameOver":
        return "text-red-600";
      case "allCleared":
        return "text-green-600";
      default:
        return "text-blue-700";
    }
  };

  const getBubbleStyle = (bubble) => {
    const isClicked = clickedBubbles.has(bubble.id);
    const isDisappearing = disappearingBubbles.has(bubble.id);
    const isCorrectClick =
      isClicked &&
      (bubble.number === currentTarget - 1 ||
        (gameState === "gameOver" && bubble.number !== currentTarget));
    const isWrongClick = isClicked && !isCorrectClick;

    // Dynamic font size based on number length
    const getFontSize = (number) => {
      const numStr = number.toString();
      if (numStr.length >= 4) return "11px";
      if (numStr.length >= 3) return "13px";
      if (numStr.length >= 2) return "15px";
      return "18px";
    };

    // Use the predefined z-index from bubble data
    // When clicked, increase z-index to show on top during animation
    const zIndex = isClicked ? bubble.zIndex + 1000 : bubble.zIndex;

    // All unclicked bubbles look the same
    let backgroundColor = "white";
    let borderColor = "#8B4513";
    let borderWidth = "2px";
    let boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
    let animationName = "none";

    // Different styles only AFTER clicking
    if (isCorrectClick && !isDisappearing) {
      backgroundColor = "#22C55E"; // Green for correct
      boxShadow = "0 0 20px rgba(34, 197, 94, 0.6)";
      animationName = "correctClick 0.6s ease-out";
    } else if (isWrongClick) {
      backgroundColor = "#EF4444"; // Red for wrong
      boxShadow = "0 0 25px rgba(239, 68, 68, 0.8)";
      animationName = "wrongClick 1s ease-in-out infinite";
    }

    return {
      position: "absolute",
      left: `${bubble.x}px`,
      top: `${bubble.y}px`,
      width: `${bubble.size}px`,
      height: `${bubble.size}px`,
      borderRadius: "50%",
      border: `${borderWidth} solid ${borderColor}`,
      backgroundColor: backgroundColor,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: gameState === "playing" ? "pointer" : "default",
      fontSize: getFontSize(bubble.number),
      fontWeight: "bold",
      color: "#1F2937",
      userSelect: "none",
      opacity: isDisappearing ? 0 : 1,
      transform: isDisappearing ? "scale(0.5) rotate(360deg)" : "scale(1)",
      transition: isDisappearing
        ? "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
        : "transform 0.2s ease-in-out",
      zIndex: zIndex,
      textAlign: "center",
      lineHeight: "1",
      boxSizing: "border-box",
      boxShadow: boxShadow,
      animation: animationName,
    };
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 15px rgba(37, 99, 235, 0.5); }
          50% { box-shadow: 0 0 25px rgba(37, 99, 235, 0.8); }
          100% { box-shadow: 0 0 15px rgba(37, 99, 235, 0.5); }
        }
        
        @keyframes shake {
          0% { transform: translateX(0) scale(0.9); }
          25% { transform: translateX(-10px) scale(0.95); }
          50% { transform: translateX(10px) scale(0.9); }
          75% { transform: translateX(-5px) scale(0.95); }
          100% { transform: translateX(0) scale(0.9); }
        }
        
        @keyframes wrongClick {
          0% { 
            transform: scale(0.9);
            background-color: #EF4444;
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
          }
          25% { 
            transform: scale(1.1) translateX(-8px);
            background-color: #DC2626;
            box-shadow: 0 0 25px rgba(239, 68, 68, 0.8);
          }
          50% { 
            transform: scale(0.8) translateX(8px);
            background-color: #EF4444;
            box-shadow: 0 0 30px rgba(239, 68, 68, 1);
          }
          75% { 
            transform: scale(1.05) translateX(-4px);
            background-color: #DC2626;
            box-shadow: 0 0 25px rgba(239, 68, 68, 0.8);
          }
          100% { 
            transform: scale(0.9);
            background-color: #EF4444;
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
          }
        }
        
        @keyframes correctClick {
          0% { 
            transform: scale(1);
            box-shadow: 0 0 5px rgba(34, 197, 94, 0.3);
          }
          50% { 
            transform: scale(1.3);
            box-shadow: 0 0 30px rgba(34, 197, 94, 0.8);
          }
          100% { 
            transform: scale(1.2);
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
          }
        }
        
        @keyframes winCelebration {
          0% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.1) rotate(5deg); }
          50% { transform: scale(1.2) rotate(-5deg); }
          75% { transform: scale(1.1) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        
        @keyframes gameOverShake {
          0% { transform: translateX(0) scale(1); }
          10% { transform: translateX(-10px) scale(1.02); }
          20% { transform: translateX(10px) scale(0.98); }
          30% { transform: translateX(-8px) scale(1.01); }
          40% { transform: translateX(8px) scale(0.99); }
          50% { transform: translateX(-6px) scale(1.005); }
          60% { transform: translateX(6px) scale(0.995); }
          70% { transform: translateX(-4px) scale(1.002); }
          80% { transform: translateX(4px) scale(0.998); }
          90% { transform: translateX(-2px) scale(1.001); }
          100% { transform: translateX(0) scale(1); }
        }
        
        @keyframes confetti {
          0% { 
            transform: translateY(-100vh) rotate(0deg); 
            opacity: 1; 
          }
          100% { 
            transform: translateY(100vh) rotate(720deg); 
            opacity: 0; 
          }
        }
        
        .confetti {
          position: fixed;
          width: 10px;
          height: 10px;
          background: linear-gradient(45deg, #FFD700, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FECA57);
          animation: confetti 3s ease-in-out infinite;
          z-index: 10000;
        }
        
        .win-title {
          animation: winCelebration 1s ease-in-out infinite;
        }
        
        .gameover-title {
          animation: gameOverShake 0.5s ease-in-out;
        }
      `}</style>

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-8">
        <h1
          className={`text-4xl font-bold mb-8 text-center ${getTitleColor()} ${
            gameState === "allCleared" ? "win-title" : ""
          } ${gameState === "gameOver" ? "gameover-title" : ""}`}
        >
          {getGameTitle()}
        </h1>

        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <label className="font-semibold text-gray-700">Số điểm:</label>
              <input
                type="number"
                value={targetPoints}
                onChange={(e) =>
                  setTargetPoints(
                    Math.max(1, Math.min(50, parseInt(e.target.value) || 1))
                  )
                }
                className="border-2 border-gray-300 focus:border-blue-500 px-3 py-2 rounded-lg w-20 text-center font-semibold"
                disabled={gameState === "playing"}
                min="1"
                max="50"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-700">Thời gian:</span>
              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-mono font-bold">
                {formatTime(time)}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6 flex justify-center space-x-3">
          {gameState === "setup" && (
            <button
              onClick={startGame}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-lg shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              🎮 Bắt đầu
            </button>
          )}

          {(gameState === "gameOver" || gameState === "allCleared") && (
            <button
              onClick={restartGame}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold text-lg shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              🔄 Chơi lại
            </button>
          )}

          {gameState === "playing" && (
            <>
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className={`px-6 py-3 rounded-lg font-semibold text-lg shadow-lg transition-all duration-200 transform hover:scale-105 ${
                  autoPlay
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-500 hover:bg-gray-600 text-white"
                }`}
              >
                {autoPlay ? "⏹️ Tắt Auto" : "▶️ Bật Auto"}
              </button>
              <button
                onClick={restartGame}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold text-lg shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                🔄 Khởi động lại
              </button>
            </>
          )}
        </div>

        {gameState === "playing" && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-center shadow-lg">
            <span className="text-2xl font-bold">
              🎯 Số tiếp theo: {currentTarget}
            </span>
          </div>
        )}

        <div
          className="relative border-4 border-gray-400 bg-gradient-to-br from-pink-50 to-purple-50 mx-auto rounded-xl overflow-hidden shadow-inner"
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
            >
              {bubble.number}
            </div>
          ))}
        </div>

        {gameState === "playing" && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-center shadow-lg">
            <span className="text-xl font-bold">
              👆 Nhấn số: {currentTarget}
            </span>
          </div>
        )}

        {gameState === "gameOver" && (
          <div className="mt-6 p-6 bg-red-100 border-2 border-red-300 rounded-xl shadow-lg gameover-title">
            <h3 className="text-2xl font-bold text-red-800 mb-2">
              💥 GAME OVER!
            </h3>
            <p className="text-red-700 text-lg mb-3">
              Bạn đã nhấn sai số rồi! Hãy thử lại nhé! 😅
            </p>
            <div className="text-center">
              <div className="inline-block text-6xl animate-bounce">💀</div>
            </div>
          </div>
        )}

        {gameState === "allCleared" && (
          <>
            {/* Confetti Effect */}
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}

            <div className="mt-6 p-8 bg-gradient-to-r from-green-100 to-emerald-100 border-4 border-green-300 rounded-xl shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-200/20 to-emerald-200/20 animate-pulse"></div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-green-800 mb-4 text-center win-title">
                  🎉 XUẤT SẮC! 🎉
                </h3>
                <p className="text-green-700 text-xl text-center mb-4">
                  Bạn đã hoàn thành tất cả{" "}
                  <span className="font-bold text-2xl text-green-600">
                    {targetPoints}
                  </span>{" "}
                  số
                </p>
                <p className="text-green-600 text-lg text-center mb-6">
                  trong thời gian:{" "}
                  <span className="font-mono font-bold text-2xl bg-green-200 px-3 py-1 rounded-lg">
                    {formatTime(time)}
                  </span>
                </p>
                <div className="flex justify-center space-x-4 text-4xl animate-bounce">
                  <span>🏆</span>
                  <span>✨</span>
                  <span>🎊</span>
                  <span>🌟</span>
                  <span>🎁</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BubblePoppingGame;
