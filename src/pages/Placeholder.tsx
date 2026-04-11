import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Wrench } from 'lucide-react';

const Placeholder = ({ title }: { title: string }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 md:pb-8">
      <div className="flex items-center px-4 pt-6 pb-4 border-b border-white/5 bg-surface sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition mr-2 text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-white flex-1">{title}</h1>
      </div>
      <div className="flex flex-col items-center justify-center mt-32 opacity-50 px-5 text-center">
        <Wrench className="w-20 h-20 text-gray-500 mb-6" />
        <h2 className="text-xl font-bold text-white mb-2">{title} is Coming Soon</h2>
        <p className="text-sm text-gray-400">This feature is currently under development to perfectly match the mobile app experience.</p>
      </div>
    </div>
  );
};

export default Placeholder;
