import { useState, useEffect, useCallback } from 'react';

const BubblePoppingGame = () => {
  const [targetPoints, setTargetPoints] = useState(2000);
  const [gameState, setGameState] = useState('setup'); // 'setup', 'playing', 'gameOver', 'allCleared'
  const [bubbles, setBubbles] = useState([]);
  const [currentTarget, setCurrentTarget] = useState(1);
  const [time, setTime] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [clickedBubbles, setClickedBubbles] = useState(new Set());
  const [disappearingBubbles, setDisappearingBubbles] = useState(new Set());

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
    const totalBubbles = Math.min(150, maxNumber + Math.floor(Math.random() * 30));
    
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
        size: bubbleSize
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
    setGameState('playing');
    setClickedBubbles(new Set());
    setDisappearingBubbles(new Set());
  }, [targetPoints, generateBubbles]);

  const restartGame = useCallback(() => {
    setGameState('setup');
    setBubbles([]);
    setCurrentTarget(1);
    setTime(0);
    setClickedBubbles(new Set());
    setDisappearingBubbles(new Set());
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTime(prev => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Auto play effect
  useEffect(() => {
    if (autoPlay && gameState === 'playing') {
      const interval = setInterval(() => {
        const targetBubble = bubbles.find(bubble => 
          bubble.number === currentTarget && 
          !clickedBubbles.has(bubble.id) &&
          !disappearingBubbles.has(bubble.id)
        );
        
        if (targetBubble) {
          handleBubbleClick(targetBubble);
        }
      }, 200);
      
      return () => clearInterval(interval);
    }
  }, [autoPlay, gameState, bubbles, currentTarget, clickedBubbles, disappearingBubbles]);

  const handleBubbleClick = (bubble) => {
    if (gameState !== 'playing' || clickedBubbles.has(bubble.id) || disappearingBubbles.has(bubble.id)) {
      return;
    }

    if (bubble.number === currentTarget) {
      // Correct bubble clicked
      setClickedBubbles(prev => new Set([...prev, bubble.id]));
      setDisappearingBubbles(prev => new Set([...prev, bubble.id]));
      
      // Remove bubble after 0.5s
      setTimeout(() => {
        setDisappearingBubbles(prev => {
          const newSet = new Set(prev);
          newSet.delete(bubble.id);
          return newSet;
        });
        setBubbles(prev => prev.filter(b => b.id !== bubble.id));
      }, 500);
      
      if (currentTarget === targetPoints) {
        setGameState('allCleared');
      } else {
        setCurrentTarget(prev => prev + 1);
      }
    } else {
      // Wrong bubble clicked - game over
      setClickedBubbles(prev => new Set([...prev, bubble.id]));
      setGameState('gameOver');
    }
  };

  const formatTime = (time) => {
    return time.toFixed(1) + 's';
  };

  const getGameTitle = () => {
    switch (gameState) {
      case 'gameOver':
        return 'GAME OVER';
      case 'allCleared':
        return 'ALL CLEARED!';
      default:
        return "LET'S PLAY";
    }
  };

  const getTitleColor = () => {
    switch (gameState) {
      case 'gameOver':
        return 'text-red-600';
      case 'allCleared':
        return 'text-green-600';
      default:
        return 'text-gray-800';
    }
  };

  const getBubbleStyle = (bubble) => {
    const isClicked = clickedBubbles.has(bubble.id);
    const isDisappearing = disappearingBubbles.has(bubble.id);
    
    // Dynamic font size based on number length to prevent overflow
    const getFontSize = (number) => {
      const numStr = number.toString();
      if (numStr.length >= 4) return '10px';
      if (numStr.length >= 3) return '12px';
      if (numStr.length >= 2) return '14px';
      return '16px';
    };
    
    // Z-index: smaller numbers appear on top
    const zIndex = isClicked ? 1000 : Math.max(1, 10000 - bubble.number);
    
    return {
      position: 'absolute',
      left: `${bubble.x}px`,
      top: `${bubble.y}px`,
      width: `${bubble.size}px`,
      height: `${bubble.size}px`,
      borderRadius: '50%',
      border: '2px solid #8B4513',
      backgroundColor: isClicked ? '#FF7F50' : 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: gameState === 'playing' ? 'pointer' : 'default',
      fontSize: getFontSize(bubble.number),
      fontWeight: 'bold',
      color: '#333',
      userSelect: 'none',
      opacity: isDisappearing ? 0 : 1,
      transform: isDisappearing ? 'scale(0.8)' : 'scale(1)',
      transition: 'all 0.5s ease-out',
      zIndex: zIndex,
      textAlign: 'center',
      lineHeight: '1',
      boxSizing: 'border-box',
      wordBreak: 'break-all',
      overflow: 'hidden'
    };
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen ">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className={`text-3xl font-bold mb-6 ${getTitleColor()}`}>
          {getGameTitle()}
        </h1>

        <div className="mb-4 space-y-2">
          <div className="flex items-center space-x-4">
            <label className="font-semibold">Points:</label>
            <input
              type="number"
              value={targetPoints}
              onChange={(e) =>
                setTargetPoints(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="border border-gray-300 px-3 py-1 rounded w-24"
              disabled={gameState === "playing"}
              min="1"
            />
          </div>

          <div className="flex items-center space-x-4">
            <span className="font-semibold">Time:</span>
            <span className="bg-gray-100 px-3 py-1 rounded">
              {formatTime(time)}
            </span>
          </div>
        </div>

        <div className="mb-4 space-x-2">
          {gameState === "setup" && (
            <button
              onClick={startGame}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold"
            >
              Start
            </button>
          )}

          {(gameState === "gameOver" || gameState === "allCleared") && (
            <button
              onClick={restartGame}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold"
            >
              Restart
            </button>
          )}

          {gameState === "playing" && (
            <>
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className={`px-4 py-2 rounded font-semibold ${
                  autoPlay
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-500 hover:bg-gray-600 text-white"
                }`}
              >
                Auto Play {autoPlay ? "ON" : "OFF"}
              </button>
              <button
                onClick={restartGame}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-semibold"
              >
                Restart
              </button>
            </>
          )}
        </div>

        {gameState === "playing" && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <span className="text-lg font-bold text-blue-800">
              Next: {currentTarget}
            </span>
          </div>
        )}

        <div
          className="relative border-2 border-gray-400 bg-pink-50 mx-auto"
          style={{
            height: "400px",
            width: "600px",
            overflow: "hidden",
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
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <span className="text-lg font-bold text-blue-800">
              Click number: {currentTarget}
            </span>
          </div>
        )}

        {gameState === "gameOver" && (
          <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded">
            <h3 className="text-lg font-bold text-red-800">Game Over!</h3>
            <p className="text-red-700">
              You clicked the wrong bubble. Try again!
            </p>
          </div>
        )}

        {gameState === "allCleared" && (
          <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded">
            <h3 className="text-lg font-bold text-green-800">
              Congratulations!
            </h3>
            <p className="text-green-700">
              You cleared all {targetPoints} points in {formatTime(time)}!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BubblePoppingGame;