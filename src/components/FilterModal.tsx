import { useState } from 'react';
import { X } from 'lucide-react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: { minPrice?: number; maxPrice?: number; sortType: string }) => void;
}

const FilterModal = ({ isOpen, onClose, onApply }: FilterModalProps) => {
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedSort, setSelectedSort] = useState('recent'); // recent, price_desc, price_asc

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-md bg-surface border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden p-6 animate-in slide-in-from-bottom flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Filters</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pb-4">
          <h3 className="text-lg font-semibold text-white mb-3">Price Range (ETB)</h3>
          <div className="flex items-center gap-3 mb-6">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary-500 transition"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary-500 transition"
            />
          </div>

          <h3 className="text-lg font-semibold text-white mb-3">Sort By</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedSort('recent')}
              className={`px-4 py-2 rounded-full font-medium transition ${
                selectedSort === 'recent' ? 'bg-[#764ba2] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => setSelectedSort('price_desc')}
              className={`px-4 py-2 rounded-full font-medium transition ${
                selectedSort === 'price_desc' ? 'bg-[#764ba2] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Price: High to Low
            </button>
            <button
              onClick={() => setSelectedSort('price_asc')}
              className={`px-4 py-2 rounded-full font-medium transition ${
                selectedSort === 'price_asc' ? 'bg-[#764ba2] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Price: Low to High
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            onApply({
              minPrice: minPrice ? Number(minPrice) : undefined,
              maxPrice: maxPrice ? Number(maxPrice) : undefined,
              sortType: selectedSort,
            });
            onClose();
          }}
          className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition mt-auto"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterModal;
