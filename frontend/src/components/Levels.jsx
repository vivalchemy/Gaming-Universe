import React, { useState, useEffect } from 'react';
import { Star, Rocket, Trophy, Lock, Play, RefreshCw } from 'lucide-react';

const levels = [
  { id: 1, from: "Pluto", to: "Neptune", distance: 1.43e9 },
  { id: 2, from: "Neptune", to: "Uranus", distance: 1.61e9 },
  { id: 3, from: "Uranus", to: "Saturn", distance: 1.27e9 },
  { id: 4, from: "Saturn", to: "Jupiter", distance: 6.46e8 },
  { id: 5, from: "Jupiter", to: "Mars", distance: 5.50e8 },
  { id: 6, from: "Mars", to: "Earth", distance: 2.25e8 },
];

// Generate random stars for the background
const StarField = () => {
  const stars = Array(100).fill(0).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1,
    animationDelay: `${Math.random() * 3}s`
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: star.animationDelay
          }}
        />
      ))}
    </div>
  );
};

export default function SpaceGame() {
  const [currentRun, setCurrentRun] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial game state
  useEffect(() => {
    const initializeGame = async () => {
      try {
        // Try to get latest run
        const response = await fetch('/api/run/latest');
        if (!response.ok) {
          throw new Error('Failed to fetch latest run');
        }
        const data = await response.json();

        if (data && !data.error) {
          setCurrentRun(data);
        } else {
          // Create new run if none exists
          const newRunResponse = await fetch('/api/run/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          if (!newRunResponse.ok) {
            throw new Error('Failed to create new run');
          }
          const newRun = await newRunResponse.json();
          setCurrentRun(newRun);
        }

        // Fetch leaderboard
        const leaderboardResponse = await fetch('/api/leaderboard');
        if (!leaderboardResponse.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        const leaderboardData = await leaderboardResponse.json();
        setLeaderboard(leaderboardData);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    initializeGame();
  }, []);

  const handleLevelProgress = async (levelId) => {
    if (!currentRun) return;

    try {
      if (currentRun.level === levelId) {
        // Simulate progress (in a real game, this would be based on actual gameplay)
        const increment = Math.floor(Math.random() * 20) + 10; // Random progress between 10-30

        const response = await fetch('/api/run/progress', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            runId: currentRun.id,
            increment
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update progress');
        }

        const updatedRun = await response.json();
        setCurrentRun(updatedRun);

        // If level completed, update leaderboard
        if (updatedRun.level > currentRun.level) {
          const leaderboardResponse = await fetch('/api/leaderboard');
          if (!leaderboardResponse.ok) {
            throw new Error('Failed to fetch updated leaderboard');
          }
          const leaderboardData = await leaderboardResponse.json();
          setLeaderboard(leaderboardData);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const startNewRun = async () => {
    try {
      const response = await fetch('/api/run/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create new run');
      }

      const newRun = await response.json();
      setCurrentRun(newRun);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-2xl">Loading your cosmic journey...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-2xl text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-gray-900 text-white p-8 relative overflow-hidden">
      <StarField />
      <div className="max-w-7xl mx-auto relative">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Rocket className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Cosmic Journey
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-center bg-gray-800/50 backdrop-blur-sm px-6 py-3 rounded-xl border border-purple-500/20">
              <Trophy className="w-8 h-8 text-yellow-400 mb-2" />
              <div className="font-semibold text-purple-200">Current Level</div>
              <div className="text-2xl font-bold text-yellow-400">{currentRun?.level || 1}</div>
            </div>
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="bg-purple-600/50 hover:bg-purple-600/70 backdrop-blur-sm text-white font-bold py-3 px-6 rounded-xl border border-purple-500/20 transition-all duration-300 flex items-center space-x-2"
            >
              <Star className="w-5 h-5" />
              <span>{showLeaderboard ? 'Hide Leaderboard' : 'Show Leaderboard'}</span>
            </button>
          </div>
        </div>

        {showLeaderboard && (
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-purple-200">Cosmic Leaderboard</h2>
            <ul className="space-y-3">
              {leaderboard.map((player, index) => (
                <li key={player.id} className="flex justify-between items-center py-3 px-4 bg-purple-900/30 rounded-lg border border-purple-500/20">
                  <div className="flex items-center space-x-3">
                    <div className="text-yellow-400 font-bold">{index + 1}</div>
                    <span className="text-purple-200">{player.user}</span>
                  </div>
                  <span className="text-blue-400 font-bold">Level {player.level}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level) => (
            <div
              key={level.id}
              className={`bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 ${level.id > (currentRun?.level || 1) ? 'opacity-50' : ''}`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-purple-200">Level {level.id}</h2>
                  {level.id > (currentRun?.level || 1) ? (
                    <Lock className="w-6 h-6 text-gray-400" />
                  ) : (
                    <Star className="w-6 h-6 text-yellow-400" />
                  )}
                </div>
                <div className="space-y-4">
                  <p className="text-blue-300">
                    <span className="font-semibold">{level.from}</span> → <span className="font-semibold">{level.to}</span>
                  </p>
                  <p className="text-lg font-semibold text-purple-200">
                    Distance: {(level.distance / 1e6).toFixed(2)} million km
                  </p>
                  {currentRun && (
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${level.id === currentRun.level ? currentRun.progress : (level.id < currentRun.level ? 100 : 0)}%` }}
                      />
                    </div>
                  )}
                  <button
                    className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 ${level.id <= (currentRun?.level || 1)
                      ? 'bg-blue-600/50 hover:bg-blue-600/70 text-white border border-blue-500/20'
                      : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                      }`}
                    disabled={level.id > (currentRun?.level || 1)}
                    onClick={() => handleLevelProgress(level.id)}
                  >
                    {level.id <= (currentRun?.level || 1) ? (
                      <>
                        {level.id < (currentRun?.level || 1) ? (
                          <RefreshCw className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                        <span>{level.id < (currentRun?.level || 1) ? 'Replay Mission' : 'Launch Mission'}</span>
                      </>
                    ) : (
                      <span>Mission Locked</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
