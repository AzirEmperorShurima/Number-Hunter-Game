import { useState, useEffect, useCallback, useRef } from "react";

const NUMBER_HUNTER_V2_1 = () => {
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
  const [clickTimes, setClickTimes] = useState(new Map());
  const gameAreaRef = useRef(null);
  const [gameAreaSize, setGameAreaSize] = useState({ width: 600, height: 400 });

  // Tối ưu hóa rendering - dynamic bubble count
  const [maxVisibleBubbles, setMaxVisibleBubbles] = useState(50);
  const [remainingNumbers, setRemainingNumbers] = useState([]); // Numbers còn lại chưa được tạo bubble

  // Refs để lưu trữ timeouts và intervals - QUAN TRỌNG ĐỂ FIX BUG
  const timeoutsRef = useRef(new Set());
  const intervalsRef = useRef(new Set());

  // Helper function để add timeout và track nó
  const addTimeout = useCallback((callback, delay) => {
    const timeoutId = setTimeout(() => {
      timeoutsRef.current.delete(timeoutId);
      callback();
    }, delay);
    timeoutsRef.current.add(timeoutId);
    return timeoutId;
  }, []);

  // Helper function để add interval và track nó
  const addInterval = useCallback((callback, delay) => {
    const intervalId = setInterval(callback, delay);
    intervalsRef.current.add(intervalId);
    return intervalId;
  }, []);

  // Clear tất cả timeouts và intervals
  const clearAllTimeoutsAndIntervals = useCallback(() => {
    // Clear all timeouts
    timeoutsRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    timeoutsRef.current.clear();

    // Clear all intervals
    intervalsRef.current.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    intervalsRef.current.clear();
  }, []);

  // Tính toán số bubble tối ưu - HIỂN THỊ NHIỀU HỠN VÀ ƯU TIÊN SỐ NHỎ
  const calculateOptimalBubbleCount = useCallback((points, screenArea) => {
    // Tính toán dựa trên diện tích màn hình với overlap được phép
    const bubbleArea = 40 * 40; // Bubble size trung bình
    const overlapFactor = 0.8; // Cho phép overlap 80%
    const maxByScreen = Math.floor(screenArea / (bubbleArea * overlapFactor));

    let targetBubbleCount;

    if (points <= 100) {
      // Dưới 100: hiển thị tất cả
      targetBubbleCount = points;
    } else if (points <= 500) {
      // 100-500: hiển thị tất cả, tối thiểu 500 bubbles
      targetBubbleCount = points;
    } else if (points <= 1000) {
      // 500-1000: hiển thị ít nhất 500 bubbles đầu tiên
      targetBubbleCount = Math.max(500, Math.min(points, 600));
    } else if (points <= 2000) {
      // 1000-2000: hiển thị ít nhất 500-700 bubbles đầu tiên
      targetBubbleCount = Math.max(500, Math.min(points, 700));
    } else if (points <= 5000) {
      // 2000-5000: hiển thị 700-800 bubbles
      targetBubbleCount = Math.max(700, Math.min(points, 800));
    } else {
      // Trên 5000: hiển thị 800-1000 bubbles
      targetBubbleCount = Math.max(800, Math.min(points, 1000));
    }

    // Đảm bảo không vượt quá khả năng hiển thị của màn hình
    return Math.min(targetBubbleCount, maxByScreen, 1000);
  }, []);

  // Update game area size based on screen size
  useEffect(() => {
    const updateGameAreaSize = () => {
      if (gameAreaRef.current) {
        const containerWidth = Math.min(window.innerWidth - 40, 900);
        const containerHeight = Math.min(window.innerHeight - 400, 600);
        const minWidth = 320;
        const minHeight = 300;

        const width = Math.max(minWidth, containerWidth);
        const height = Math.max(minHeight, containerHeight);

        setGameAreaSize({ width, height });

        const screenArea = width * height;
        const optimalCount = calculateOptimalBubbleCount(
          targetPoints,
          screenArea
        );
        setMaxVisibleBubbles(optimalCount);
      }
    };

    updateGameAreaSize();
    window.addEventListener("resize", updateGameAreaSize);
    return () => window.removeEventListener("resize", updateGameAreaSize);
  }, [targetPoints, calculateOptimalBubbleCount]);

  // Tạo bubble với vị trí ngẫu nhiên
  const createBubble = useCallback(
    (number, id) => {
      const bubbleSize = Math.max(25, Math.min(45, gameAreaSize.width / 18));

      return {
        id,
        number,
        x: Math.random() * (gameAreaSize.width - bubbleSize),
        y: Math.random() * (gameAreaSize.height - bubbleSize),
        size: bubbleSize,
        hue: (number * 137.5) % 360,
      };
    },
    [gameAreaSize]
  );

  // Tạo danh sách số cần hiển thị ban đầu - ƯU TIÊN SỐ NHỎ TUYỆT ĐỐI
  const generateInitialBubbles = useCallback(() => {
    const numbersToShow = [];
    const numbersToKeep = [];

    // Luôn hiển thị các số nhỏ trước, bắt đầu từ currentTarget
    let numberCount = 0;

    // Thêm các số từ currentTarget trở đi cho đến khi đủ maxVisibleBubbles
    for (
      let i = currentTarget;
      i <= targetPoints && numberCount < maxVisibleBubbles;
      i++
    ) {
      numbersToShow.push(i);
      numberCount++;
    }

    // Nếu vẫn chưa đủ và có thể thêm số từ đầu (nhỏ hơn currentTarget)
    if (numberCount < maxVisibleBubbles && currentTarget > 1) {
      for (
        let i = 1;
        i < currentTarget && numberCount < maxVisibleBubbles;
        i++
      ) {
        numbersToShow.push(i);
        numberCount++;
      }
    }

    // Các số còn lại để dùng sau (những số lớn hơn)
    for (let i = currentTarget + numberCount; i <= targetPoints; i++) {
      if (!numbersToShow.includes(i)) {
        numbersToKeep.push(i);
      }
    }

    // Sort numbersToShow để đảm bảo thứ tự
    numbersToShow.sort((a, b) => a - b);
    numbersToKeep.sort((a, b) => a - b);

    setRemainingNumbers(numbersToKeep);

    // Tạo bubbles
    const initialBubbles = numbersToShow.map((number, index) =>
      createBubble(number, `bubble_${number}_${index}`)
    );

    console.log(
      `Generated ${initialBubbles.length} bubbles for ${targetPoints} points`
    );
    console.log(
      `Numbers: ${numbersToShow.slice(0, 20).join(", ")}${
        numbersToShow.length > 20 ? "..." : ""
      }`
    );

    return initialBubbles;
  }, [currentTarget, targetPoints, maxVisibleBubbles, createBubble]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      clearAllTimeoutsAndIntervals();
    };
  }, [clearAllTimeoutsAndIntervals]);
  const getNextNumber = useCallback(() => {
    if (remainingNumbers.length === 0) return null;

    // Luôn lấy số nhỏ nhất có sẵn
    const sortedNumbers = [...remainingNumbers].sort((a, b) => a - b);
    const nextNumber = sortedNumbers[0];

    // Remove từ remaining numbers
    setRemainingNumbers((prev) => prev.filter((num) => num !== nextNumber));

    return nextNumber;
  }, [remainingNumbers]);

  const startGame = useCallback(() => {
    // Clear all existing timeouts/intervals trước khi start
    clearAllTimeoutsAndIntervals();

    const initialBubbles = generateInitialBubbles();
    setBubbles(initialBubbles);
    setCurrentTarget(1);
    setTime(0);
    setScore(0);
    setGameState("playing");
    setClickedBubbles(new Set());
    setDisappearingBubbles(new Set());
    setClickTimes(new Map());
    setNewBubbles(new Set(initialBubbles.map((b) => b.id)));

    // Remove new bubble animation after delay
    addTimeout(() => {
      setNewBubbles(new Set());
    }, 1000);
  }, [generateInitialBubbles, clearAllTimeoutsAndIntervals, addTimeout]);

  const restartGame = useCallback(() => {
    // QUAN TRỌNG: Clear tất cả timeouts/intervals khi restart
    clearAllTimeoutsAndIntervals();

    setGameState("setup");
    setBubbles([]);
    setCurrentTarget(1);
    setTime(0);
    setScore(0);
    setClickedBubbles(new Set());
    setDisappearingBubbles(new Set());
    setNewBubbles(new Set());
    setClickTimes(new Map());
    setRemainingNumbers([]);
    setAutoPlay(false); // Tắt auto play khi restart
  }, [clearAllTimeoutsAndIntervals]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameState === "playing") {
      interval = addInterval(() => {
        setTime((prev) => prev + 0.1);
      }, 100);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
        intervalsRef.current.delete(interval);
      }
    };
  }, [gameState, addInterval]);

  // Auto play effect
  useEffect(() => {
    let interval;
    if (autoPlay && gameState === "playing") {
      interval = addInterval(() => {
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
    }

    return () => {
      if (interval) {
        clearInterval(interval);
        intervalsRef.current.delete(interval);
      }
    };
  }, [
    autoPlay,
    gameState,
    bubbles,
    currentTarget,
    clickedBubbles,
    disappearingBubbles,
    addInterval,
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
      setScore((prev) => prev + bubble.number);

      // Remove bubble after animation - SỬ DỤNG addTimeout ĐỂ TRACK
      addTimeout(() => {
        setDisappearingBubbles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(bubble.id);
          return newSet;
        });

        setBubbles((prev) => {
          const filtered = prev.filter((b) => b.id !== bubble.id);

          // Thêm bubble mới nếu có số available
          const nextNumber = getNextNumber();
          if (nextNumber !== null) {
            const newBubble = createBubble(
              nextNumber,
              `bubble_${nextNumber}_${Date.now()}`
            );
            setNewBubbles((prevNew) => new Set([...prevNew, newBubble.id]));

            // Remove new bubble animation - SỬ DỤNG addTimeout ĐỂ TRACK
            addTimeout(() => {
              setNewBubbles((prevNew) => {
                const newSet = new Set(prevNew);
                newSet.delete(newBubble.id);
                return newSet;
              });
            }, 800);

            return [...filtered, newBubble];
          }

          return filtered;
        });

        setClickTimes((prev) => {
          const newMap = new Map(prev);
          newMap.delete(bubble.id);
          return newMap;
        });
      }, 1200);

      if (currentTarget === targetPoints) {
        addTimeout(() => {
          setGameState("allCleared");
        }, 1300);
      } else {
        setCurrentTarget((prev) => prev + 1);
      }
    } else {
      // Wrong bubble clicked - game over
      setClickedBubbles((prev) => new Set([...prev, bubble.id]));
      setClickTimes(
        (prev) => new Map([...prev, [bubble.id, formatTime(time)]])
      );
      addTimeout(() => {
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
        return "NUMBER HUNTER";
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
    const isNew = newBubbles.has(bubble.id);
    const isTarget = bubble.number === currentTarget && gameState === "playing";

    // Dynamic font size based on number length and bubble size
    const getFontSize = (number, size) => {
      const numStr = number.toString();
      const baseFontSize = size / 4.5;
      if (numStr.length >= 4) return `${baseFontSize * 0.6}px`;
      if (numStr.length >= 3) return `${baseFontSize * 0.7}px`;
      if (numStr.length >= 2) return `${baseFontSize * 0.8}px`;
      return `${baseFontSize}px`;
    };

    // Z-index system: SỐ NHỎ HƠN CÓ Z-INDEX CAO HƠN (ở trên)
    const getZIndex = () => {
      const baseZIndex = 100000 - bubble.number; // Số nhỏ hơn = z-index cao hơn

      if (isClicked) return baseZIndex + 50000; // Clicked bubbles on top
      if (isTarget && gameState === "playing") return baseZIndex + 30000; // Target bubbles high priority
      return baseZIndex; // Normal bubbles: số 1 = 99999, số 10 = 99990, số 11 = 99989
    };

    const zIndex = getZIndex();

    // Color based on state and number range
    let backgroundColor, borderColor, boxShadow, transform;

    if (isClicked && gameState === "gameOver") {
      backgroundColor = "#EF4444"; // Red for wrong click
      borderColor = "#DC2626";
      boxShadow = "0 0 25px rgba(239, 68, 68, 0.8)";
    } else if (isClicked) {
      backgroundColor = "#10B981"; // Green for correct click
      borderColor = "#059669";
      boxShadow = "0 0 25px rgba(16, 185, 129, 0.8)";
    } else if (isTarget) {
      backgroundColor = `hsl(${bubble.hue}, 70%, 85%)`;
      borderColor = `hsl(${bubble.hue}, 70%, 50%)`;
      boxShadow = `0 0 20px hsl(${bubble.hue}, 70%, 70%)`;
      transform = "scale(1.15)";
    } else {
      // Color coding based on number ranges for better visual hierarchy
      if (bubble.number <= 10) {
        backgroundColor = `hsl(${bubble.hue}, 60%, 95%)`;
        borderColor = `hsl(${bubble.hue}, 70%, 60%)`;
        boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
      } else if (bubble.number <= 50) {
        backgroundColor = `hsl(${bubble.hue}, 50%, 90%)`;
        borderColor = `hsl(${bubble.hue}, 60%, 55%)`;
        boxShadow = "0 3px 10px rgba(0,0,0,0.12)";
      } else {
        backgroundColor = `hsl(${bubble.hue}, 40%, 85%)`;
        borderColor = `hsl(${bubble.hue}, 50%, 50%)`;
        boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
      }
    }

    return {
      position: "absolute",
      left: `${bubble.x}px`,
      top: `${bubble.y}px`,
      width: `${bubble.size}px`,
      height: `${bubble.size}px`,
      borderRadius: "50%",
      border: `${bubble.number <= 50 ? "3px" : "2px"} solid ${borderColor}`,
      backgroundColor,
      boxShadow,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      cursor: gameState === "playing" ? "pointer" : "default",
      fontSize: getFontSize(bubble.number, bubble.size),
      fontWeight: "bold",
      color: isClicked ? "white" : bubble.number <= 100 ? "#1F2937" : "#374151",
      userSelect: "none",
      opacity: isDisappearing ? 0.6 : isNew ? 0 : 1,
      transform: isDisappearing
        ? "scale(1.3)"
        : isNew
        ? "scale(0)"
        : transform || "scale(1)",
      transition: isDisappearing
        ? "all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
        : isNew
        ? "all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)"
        : "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      zIndex: zIndex,
      textAlign: "center",
      lineHeight: "1",
      boxSizing: "border-box",
      wordBreak: "break-all",
      overflow: "visible",
      textShadow: isClicked ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
      animation:
        isTarget && gameState === "playing" ? "pulse 1.5s infinite" : "none",
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-2 sm:p-4">
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1.15);
            box-shadow: 0 0 20px hsl(var(--hue), 70%, 70%);
          }
          50% {
            transform: scale(1.25);
            box-shadow: 0 0 30px hsl(var(--hue), 70%, 60%);
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-8">
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 transition-all duration-500 ${getTitleColor()}`}
          >
            {getGameTitle()}
          </h1>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full"></div>
        </div>

        {/* Game Controls Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-6 mb-4 sm:mb-6 border border-white/20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-xl shadow-lg">
              <label className="text-xs sm:text-sm font-medium opacity-90">
                Target Points
              </label>
              <input
                type="number"
                value={targetPoints}
                onChange={(e) =>
                  setTargetPoints(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-full bg-white/20 text-white placeholder-white/70 border border-white/30 px-2 sm:px-3 py-1 sm:py-2 rounded-lg mt-1 sm:mt-2 text-sm sm:text-lg font-bold"
                disabled={gameState === "playing"}
                min="1"
              />
            </div>

            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 sm:p-4 rounded-xl shadow-lg">
              <span className="text-xs sm:text-sm font-medium opacity-90">
                Time
              </span>
              <div className="text-lg sm:text-2xl font-bold mt-1 sm:mt-2">
                {formatTime(time)}
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 sm:p-4 rounded-xl shadow-lg">
              <span className="text-xs sm:text-sm font-medium opacity-90">
                Score
              </span>
              <div className="text-lg sm:text-2xl font-bold mt-1 sm:mt-2">
                {score.toLocaleString()}
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 sm:p-4 rounded-xl shadow-lg">
              <span className="text-xs sm:text-sm font-medium opacity-90">
                Progress
              </span>
              <div className="text-lg sm:text-2xl font-bold mt-1 sm:mt-2">
                {currentTarget - 1} / {targetPoints}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {gameState === "setup" && (
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-lg shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                🚀 Start Game
              </button>
            )}

            {(gameState === "gameOver" || gameState === "allCleared") && (
              <button
                onClick={restartGame}
                className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-lg shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                🔄 Play Again
              </button>
            )}

            {gameState === "playing" && (
              <>
                <button
                  onClick={() => setAutoPlay(!autoPlay)}
                  className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-lg shadow-lg transform transition-all duration-200 hover:scale-105 ${
                    autoPlay
                      ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
                      : "bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white"
                  }`}
                >
                  {autoPlay ? "⏸️ Auto OFF" : "▶️ Auto ON"}
                </button>
                <button
                  onClick={restartGame}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-lg shadow-lg transform transition-all duration-200 hover:scale-105"
                >
                  🔄 Restart
                </button>
              </>
            )}
          </div>

          {/* Hiển thị thông tin chi tiết */}
          {gameState === "playing" && (
            <div className="mt-4 text-center">
              <div className="text-white/70 text-sm">
                Bubbles: {bubbles.length}/{maxVisibleBubbles} | Remaining:{" "}
                {remainingNumbers.length}
                <div className="mt-1">
                  <span className="text-blue-300">🎯 Smart Display Mode</span>
                  <span className="text-green-300 ml-4">
                    📊 Priority: Small Numbers First
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Next Target Indicator */}
        {gameState === "playing" && (
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-xl animate-pulse">
              <div className="text-xs sm:text-sm font-medium opacity-90">
                Click Number
              </div>
              <div className="text-2xl sm:text-4xl font-bold">
                {currentTarget}
              </div>
            </div>
          </div>
        )}

        {/* Game Board */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div
            ref={gameAreaRef}
            className="relative bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-white/30 overflow-hidden"
            style={{
              height: `${gameAreaSize.height + 20}px`,
              width: `${gameAreaSize.width + 20}px`,
            }}
          >
            <div
              className="absolute inset-2"
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
                        marginTop: "1px",
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
        </div>

        {/* Game Status Messages */}
        {gameState === "gameOver" && (
          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-red-500 to-pink-600 text-white p-4 sm:p-6 rounded-2xl shadow-xl animate-bounce">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                💥 Game Over!
              </h3>
              <p className="text-sm sm:text-lg opacity-90">
                Wrong bubble clicked. Better luck next time!
              </p>
            </div>
          </div>
        )}

        {gameState === "allCleared" && (
          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 sm:p-6 rounded-2xl shadow-xl animate-bounce">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                🎉 Congratulations!
              </h3>
              <p className="text-sm sm:text-lg opacity-90">
                Cleared {targetPoints} points in {formatTime(time)}!
              </p>
              <p className="text-sm sm:text-lg opacity-90">
                Final Score: {score.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NUMBER_HUNTER_V2_1;
