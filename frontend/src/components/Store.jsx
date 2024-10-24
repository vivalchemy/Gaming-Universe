import React, { useState, useEffect, useMemo } from 'react';
import { Search, Coins, Shield, Magnet, Rocket, Target, ZapOff, Zap, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Item Card Component
const ItemCard = ({ item, onBuy, onUse }) => {
  const getItemIcon = (name) => {
    switch (name) {
      case 'coin_doubler':
        return <Coins className="w-8 h-8" />;
      case 'shield':
        return <Shield className="w-8 h-8" />;
      case 'magnet':
        return <Magnet className="w-8 h-8" />;
      case 'booster':
        return <Rocket className="w-8 h-8" />;
      case 'ammo':
        return <Target className="w-8 h-8" />;
      default:
        return <Coins className="w-8 h-8" />;
    }
  };

  const getItemName = (name) => {
    return name.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-blue-500/20 p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400">
          {getItemIcon(item.name)}
        </div>

        <h3 className="text-xl font-bold text-white">{getItemName(item.name)}</h3>

        <div className="flex items-center gap-2 text-yellow-400">
          <Coins className="w-4 h-4" />
          <span>{item.cost}</span>
        </div>

        <div className="bg-blue-900/30 px-3 py-1 rounded-full text-blue-300">
          Count: {item.count}
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={() => onBuy(item)}
            disabled={!item.canBuy}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${item.canBuy
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
          >
            {item.canBuy ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
            Buy
          </button>

          <button
            onClick={() => onUse(item)}
            disabled={item.count === 0}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${item.count > 0
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
          >
            <Rocket className="w-4 h-4" />
            Use
          </button>
        </div>
      </div>
    </div>
  );
};

// Search Bar Component
const SearchBar = ({ value, onChange }) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search items..."
      className="w-full md:w-96 pl-10 pr-4 py-2 bg-gray-800/50 border border-blue-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all duration-200"
    />
  </div>
);

// Main Store Component
const SpaceStore = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/store/get-items-with-user-info', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401) {
          navigate('/auth');
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setItems(data.items);
        setUserCoins(data.userCoins); // Assuming userCoins is managed in state
      } catch (err) {
        console.error('Failed to fetch items:', err);
        setError('Failed to fetch items');
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, [])

  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const handleBuy = async (item) => {
    try {
      const response = await fetch('/api/store/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemName: item.name }),
        credentials: 'include'
      });

      if (response.status === 401) {
        navigate('/auth');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to purchase item');
      }

      const data = await response.json();
      const { userCoins } = data;

      // Refresh items after purchase
      const updatedUserCoins = userCoins - item.cost;
      setUserCoins(updatedUserCoins);

      // Show success message
      alert('Item purchased successfully!');
    } catch (err) {
      console.error('Error purchasing item:', err);
      alert(err.message);
    }
  };

  const handleUse = async (item) => {
    try {
      const response = await fetch('/api/store/use-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({ itemName: item.name }),
        credentials: 'include'
      });

      if (response.status === 401) {
        navigate('/auth');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to use item');
      }

      // Refresh items after using
      const updatedItems = items.map(i => {
        if (i.id === item.id) {
          return { ...i, count: i.count - 1 };
        }
        return i;
      });
      setItems(updatedItems);

      // Show success message
      alert('Item used successfully!');
    } catch (err) {
      console.error('Error using item:', err);
      alert(err.message);
    }
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

  const stars = getRandomStars();

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

      <div className="container mx-auto p-4 md:p-8 relative z-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Mission Control</span>
        </button>

        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Space Station Store.<br />Coins Left: {userCoins}
            </h1>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <p className="text-xl">Loading items...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-20 text-red-400">
              <p className="text-xl">{error}</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Search className="w-12 h-12 mb-4" />
              <p className="text-xl">No items found matching your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onBuy={handleBuy}
                  onUse={handleUse}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpaceStore;
