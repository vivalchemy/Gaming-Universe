import { useState, useEffect } from 'react';
import { Star, Rocket, Milestone, Trophy, RefreshCw, ChevronLeft, Users, Calendar, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const getRankIcon = (rank) => {
  if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
  if (rank === 2) return <Trophy className="w-6 h-6 text-gray-300" />;
  if (rank === 3) return <Trophy className="w-6 h-6 text-amber-700" />;
  return <Star className="w-4 h-4 text-blue-400" />;
};

const getRandomStars = () => {
  return Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    size: Math.random() * 2 + 1,
  }));
};

const TimeFrameButton = ({ active, value, label, icon: Icon, onClick }) => (
  <button
    onClick={() => onClick(value)}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${active
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
      }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [timeFrame, setTimeFrame] = useState('all');
  const [perPage, setPerPage] = useState('30');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const stars = getRandomStars();

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/leaderboard?page=${currentPage}&perPage=${perPage}&timeFrame=${timeFrame}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch leaderboard');

      const items = data.items.map((item) => ({
        rank: item.rank,
        username: item.expand.user.username,
        level: item.level,
        progress: item.progress,
        timeFormatted: item.timeFormatted,
      }));

      setLeaderboardData(items);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [currentPage, perPage, timeFrame]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950 via-gray-900 to-black text-white">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: star.animationDelay,
            opacity: 0.6,
          }}
        />
      ))}

      <div className="container mx-auto p-4 md:p-8 space-y-8 relative z-10">
        <button
          onClick={() => { navigate('/') }}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Mission Control</span>
        </button>

        <div className="bg-gray-900/60 backdrop-blur-lg border border-blue-500/20 rounded-lg shadow-xl">
          <div className="p-6">
            <header className="flex flex-col gap-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
                  <Award className="w-8 h-8 text-blue-400" />
                  Space Explorers Leaderboard
                </h1>

                <div className="flex items-center gap-3">
                  <select
                    value={perPage}
                    onChange={(e) => setPerPage(e.target.value)}
                    className="bg-gray-800/50 border-blue-500/30 rounded-lg px-3 py-2"
                  >
                    <option value="10">10 explorers</option>
                    <option value="30">30 explorers</option>
                    <option value="50">50 explorers</option>
                    <option value="100">100 explorers</option>
                  </select>

                  <button
                    onClick={fetchLeaderboard}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <TimeFrameButton
                  active={timeFrame === 'all'}
                  value="all"
                  label="All Time"
                  icon={Trophy}
                  onClick={setTimeFrame}
                />
                <TimeFrameButton
                  active={timeFrame === 'monthly'}
                  value="monthly"
                  label="Monthly"
                  icon={Calendar}
                  onClick={setTimeFrame}
                />
                <TimeFrameButton
                  active={timeFrame === 'weekly'}
                  value="weekly"
                  label="Weekly"
                  icon={Users}
                  onClick={setTimeFrame}
                />
                <TimeFrameButton
                  active={timeFrame === 'daily'}
                  value="daily"
                  label="Daily"
                  icon={Star}
                  onClick={setTimeFrame}
                />
              </div>
            </header>

            {error && (
              <div className="mb-6 bg-red-900/50 border border-red-500/50 text-white p-4 rounded-lg backdrop-blur-sm">
                {error}
              </div>
            )}

            <div className="bg-gray-800/50 rounded-lg overflow-hidden shadow-xl backdrop-blur-sm border border-blue-500/20">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-blue-500/20">
                    <th className="w-[100px] p-4 text-blue-300 text-left">Rank</th>
                    <th className="p-4 text-blue-300 text-left">Explorer</th>
                    <th className="p-4 text-blue-300 text-left">Level</th>
                    <th className="hidden md:table-cell p-4 text-blue-300 text-left">Progress</th>
                    <th className="p-4 text-blue-300 text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-20">
                        <div className="flex flex-col items-center gap-3">
                          <Rocket className="animate-bounce w-8 h-8 text-blue-400" />
                          <span className="text-blue-300">Scanning the cosmos...</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    leaderboardData.map((item) => (
                      <tr
                        key={item.rank}
                        className="hover:bg-blue-900/20 transition-colors duration-200 border-b border-blue-500/10"
                      >
                        <td className="p-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            {getRankIcon(item.rank)}
                            <span className={item.rank <= 3 ? 'text-2xl' : ''}>{item.rank}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3 text-white">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                              {item.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{item.username}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Milestone className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-100">{item.level}</span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell p-4">
                          <div className="space-y-2">
                            <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-blue-300">{item.progress.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="p-4 text-blue-300">{item.timeFormatted}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1 || isLoading}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${currentPage <= 1 || isLoading
                  ? 'bg-gray-800/30 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-800 hover:bg-gray-700 text-white border border-blue-500/30'
                  }`}
              >
                Previous
              </button>
              <span className="flex items-center px-4 text-white py-2 bg-gray-800/50 rounded-lg border border-blue-500/30">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages || isLoading}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${currentPage >= totalPages || isLoading
                  ? 'bg-gray-800/30 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-800 hover:bg-gray-700 text-white border border-blue-500/30'
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
