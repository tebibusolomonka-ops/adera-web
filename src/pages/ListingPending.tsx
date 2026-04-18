import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, ShieldCheck, Home } from 'lucide-react';

const steps = [
  {
    icon: CheckCircle,
    title: 'Listing Submitted',
    desc: 'Your listing has been received by our team.',
    done: true,
  },
  {
    icon: ShieldCheck,
    title: 'Under Review',
    desc: 'Our team is verifying your listing details and images.',
    done: false,
    active: true,
  },
  {
    icon: Clock,
    title: 'Approval & Publishing',
    desc: 'Once approved, your listing will go live for buyers to see.',
    done: false,
    active: false,
  },
];

const ListingPending = () => {
  const navigate = useNavigate();
  const [dots, setDots] = useState('');

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 md:pb-8">
      {/* Gradient Header */}
      <div className="relative h-56 bg-gradient-to-br from-[#667eea] to-[#764ba2] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute -top-14 -left-14 w-52 h-52 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-white/10 blur-2xl" />

        {/* Pulsing Clock Icon */}
        <div className="relative z-10 flex items-center justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
            <Clock className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="relative z-10 text-2xl font-extrabold text-white">Listing Submitted!</h1>
        <p className="relative z-10 text-white/80 text-sm mt-1">Waiting for approval{dots}</p>
      </div>

      {/* Body */}
      <div className="px-5 -mt-6 space-y-5">

        {/* Info Card */}
        <div className="bg-surface rounded-3xl p-5 shadow-[0_10px_30px_rgba(102,126,234,0.15)] border border-white/5">
          <h2 className="text-white font-bold text-lg mb-1">What happens next?</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Our admin team will review your listing to ensure it meets our quality and safety standards. 
            This usually takes <span className="text-[#b18cff] font-semibold">a short time</span>. 
            You'll receive a notification once it's approved and live.
          </p>
        </div>

        {/* Steps */}
        <div className="bg-surface rounded-3xl p-5 border border-white/5 space-y-4">
          <h2 className="text-white font-bold text-sm uppercase tracking-wide text-[#764ba2]">Review Progress</h2>
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex items-start gap-4">
                {/* Icon Circle */}
                <div className={`mt-0.5 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all
                  ${step.done ? 'bg-green-500/20 border-2 border-green-500' :
                    step.active ? 'bg-[#764ba2]/20 border-2 border-[#764ba2] animate-pulse' :
                    'bg-white/5 border-2 border-white/10'}`}>
                  <Icon className={`w-5 h-5 ${step.done ? 'text-green-400' : step.active ? 'text-[#b18cff]' : 'text-gray-600'}`} />
                </div>

                {/* Text */}
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${step.done ? 'text-green-400' : step.active ? 'text-white' : 'text-gray-600'}`}>
                    {step.title}
                    {step.active && <span className="ml-2 text-xs bg-[#764ba2]/30 text-[#b18cff] px-2 py-0.5 rounded-full">In Progress</span>}
                    {step.done && <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">✓ Done</span>}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{step.desc}</p>
                </div>

                {/* Connector line (not last) */}
              </div>
            );
          })}
        </div>

        {/* Tip Box */}
        <div className="bg-[#764ba2]/10 border border-[#764ba2]/20 rounded-2xl p-4 flex gap-3 items-start">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-[#b18cff] font-semibold text-sm mb-0.5">Pro Tip</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              Make sure your account credentials are ready for quick transfer once your listing is approved. 
              Buyers expect a smooth handover!
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => navigate('/my-sales')}
            className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] shadow-[0_8px_20px_rgba(118,75,162,0.3)] hover:opacity-90 transition-opacity"
          >
            View My Listings
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 rounded-2xl font-bold text-gray-400 bg-surface border border-white/5 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </div>

      </div>
    </div>
  );
};

export default ListingPending;
