import { useState, useEffect } from 'react';
import { ChevronLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/user_service';
import { useToast } from '../context/ToastContext';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('18');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(profile => {
        if (profile) {
          setFirstName(profile.firstName || '');
          setLastName(profile.lastName || '');
          setAge(profile.age || '18');
          setPhone(profile.phone || '');
          setUsername(profile.displayName || profile.email?.split('@')[0] || '');
          setBank(profile.bank || '');
          setAccountNumber(profile.accountNumber || '');
          setIsVerified(profile.isVerified || profile.verificationStatus === 'approved');
        }
      }).catch(console.error);
    }
  }, [user]);

  const handleSave = async () => {
    if (!firstName || !lastName || !username) {
      showToast('Name and Username are required.', "error");
      return;
    }

    if (!user) {
      showToast('You must be logged in.', "error");
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        phone,
        displayName: username,
        bank,
        accountNumber,
      };
      // Only include name/age if NOT verified
      if (!isVerified) {
        updateData.firstName = firstName;
        updateData.lastName = lastName;
        updateData.age = age;
      }
      await updateUserProfile(user.uid, updateData);

      showToast('Profile saved successfully!', "success");
      setTimeout(() => navigate(-1), 1000);
    } catch (error) {
      console.error("Error saving profile:", error);
      showToast('Failed to save profile. Please try again.', "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-surface sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-white/10 rounded-full transition">
          <ChevronLeft className="w-7 h-7 text-white" />
        </button>
        <span className="text-lg font-bold text-white pr-8">Edit profile</span>
        <div className="w-[1px]" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 custom-scrollbar pb-24">
        {isVerified && (
          <div className="flex items-center gap-2 mb-5 px-3 py-2.5 rounded-xl bg-[#667eea]/10 border border-[#667eea]/20">
            <Lock className="w-4 h-4 text-[#667eea] shrink-0" />
            <p className="text-[13px] text-[#667eea] font-medium">Name and age are locked after verification and cannot be changed.</p>
          </div>
        )}

        <label className="block text-sm font-semibold text-gray-400 mb-2">First Name</label>
        <div className="relative mb-4">
          <input 
            type="text" 
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isVerified}
            className={`w-full h-12 border border-[#2D3748] bg-surfaceLight rounded-xl px-4 text-white focus:outline-none focus:border-[#667eea] transition-colors ${isVerified ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
          {isVerified && <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />}
        </div>

        <label className="block text-sm font-semibold text-gray-400 mb-2">Last Name</label>
        <div className="relative mb-4">
          <input 
            type="text" 
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={isVerified}
            className={`w-full h-12 border border-[#2D3748] bg-surfaceLight rounded-xl px-4 text-white focus:outline-none focus:border-[#667eea] transition-colors ${isVerified ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
          {isVerified && <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />}
        </div>

        <div className="flex gap-3 mb-4">
          <div className="w-20 shrink-0">
            <label className="block text-sm font-semibold text-gray-400 mb-2">Age</label>
            <div className="relative">
              <input 
                type="number" 
                value={age}
                onChange={(e) => setAge(e.target.value)}
                disabled={isVerified}
                className={`w-full h-12 border border-[#2D3748] bg-surfaceLight rounded-xl px-4 text-white focus:outline-none focus:border-[#667eea] transition-colors ${isVerified ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
              {isVerified && <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />}
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-400 mb-2">Phone no</label>
            <input 
              type="tel" 
              placeholder="+251..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-12 border border-[#2D3748] bg-surfaceLight rounded-xl px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#667eea] transition-colors"
            />
          </div>
        </div>

        <label className="block text-sm font-semibold text-gray-400 mb-2">Username</label>
        <input 
          type="text" 
          placeholder="eg. @samuel"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full h-12 border border-[#2D3748] bg-surfaceLight rounded-xl px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#667eea] transition-colors mb-4"
        />

        <label className="block text-sm font-semibold text-gray-400 mb-2">Bank</label>
        <div className="flex gap-2 mb-4">
          {['CBE', 'Awash', 'Dashen'].map((b) => (
            <button
              key={b}
              onClick={() => setBank(b)}
              className={`flex-1 py-2.5 rounded-xl border font-semibold text-sm transition-colors ${
                bank === b 
                ? 'bg-[#667eea] border-[#667eea] text-white' 
                : 'bg-surfaceLight border-[#2D3748] text-gray-300 hover:bg-white/5'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        {bank && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <label className="block text-sm font-semibold text-gray-400 mb-2">Bank Account Number</label>
            <input 
              type="number" 
              placeholder="Enter account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full h-12 border border-[#2D3748] bg-surfaceLight rounded-xl px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#667eea] transition-colors mb-4"
            />
          </div>
        )}

        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full h-14 bg-[#667eea] hover:bg-[#5a6ee0] transition-colors rounded-xl text-white font-bold text-lg flex items-center justify-center mt-6 disabled:opacity-70 shadow-lg shadow-[#667eea]/20"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
