import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, AlertTriangle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getUserProfile, updateUserProfile, checkFinNumberExists } from '../services/user_service';
import { uploadToCloudinary } from '../services/cloudinary';

const Verification = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [status, setStatus] = useState<'initial' | 'pending' | 'approved' | 'rejected'>('initial');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('18');
  const [phone, setPhone] = useState('');
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [finNumber, setFinNumber] = useState('');
  const [idImage, setIdImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkVerificationStatus();
  }, [user]);

  const checkVerificationStatus = async () => {
      if (user) {
          try {
              const profile = await getUserProfile(user.uid);
              if (profile?.verificationStatus) {
                  setStatus(profile.verificationStatus);
              }
          } catch (error) {
              console.error("Failed to fetch verification status", error);
          }
      }
      setLoadingInitial(false);
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
          showToast("Image too large. Please select an image under 20MB.", "error");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!firstName || !lastName || !phone || !bank || !idImage) {
        showToast('Please fill all required fields and upload an ID.', 'error');
        return;
    }
    if (bank && !accountNumber) {
        showToast('Please enter your bank account number.', 'error');
        return;
    }

    if (!finNumber || finNumber.length !== 12 || isNaN(Number(finNumber))) {
        showToast('Please enter a valid 12-digit National ID (FIN).', 'error');
        return;
    }

    setIsSubmitting(true);

    try {
        if (user) {
            // Check uniqueness
            const exists = await checkFinNumberExists(finNumber);
            if (exists) {
                showToast('This National ID (FIN) is already linked to another account.', 'error');
                setIsSubmitting(false);
                return;
            }

            // 1. Upload ID to Cloudinary
            const idProofUrl = await uploadToCloudinary(idImage);

            // 2. Update Firestore Profile
            await updateUserProfile(user.uid, {
                verificationStatus: 'pending',
                firstName, 
                lastName,
                phone,
                age,
                bank,
                accountNumber,
                finNumber,
                idImageUrl: idProofUrl, 
                createdAt: Date.now() 
            });
            
            showToast("Verification Submitted Successfully!", "success");
            setStatus('pending');
        }
    } catch (error: any) {
        console.error("Submission failed", error);
        showToast(error.message || "Failed to submit verification.", "error");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleResubmit = () => {
      setStatus('initial');
      setIdImage(null); 
  };


  if (loadingInitial) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-background">
              <div className="w-8 h-8 border-4 border-[#764ba2] border-t-transparent rounded-full animate-spin"></div>
          </div>
      );
  }

  // Approved View
  if (status === 'approved') {
      return (
          <div className="flex flex-col min-h-screen bg-background pb-20 md:pb-8">
              <div className="flex flex-col items-center justify-center flex-1 p-10 text-center">
                  <div className="w-24 h-24 rounded-full bg-[#C6F6D5] flex items-center justify-center mb-6">
                      <CheckCircle className="w-12 h-12 text-[#22543D]" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-white mb-2">You've Been Verified!</h2>
                  <p className="text-gray-400 mb-8">Congratulations! Your account is now fully verified.</p>
                  
                  <button 
                      onClick={() => navigate('/profile')}
                      className="w-full max-w-xs bg-[#667eea] text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition"
                  >
                      Back to Profile
                  </button>
              </div>
          </div>
      );
  }

  // Rejected View
  if (status === 'rejected') {
      return (
          <div className="flex flex-col min-h-screen bg-background pb-20 md:pb-8">
               <div className="flex flex-col items-center justify-center flex-1 p-10 text-center">
                    <div className="w-24 h-24 rounded-full bg-[#FED7D7] flex items-center justify-center mb-6">
                        <AlertTriangle className="w-12 h-12 text-[#742A2A]" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-white mb-2">Verification Rejected</h2>
                    <p className="text-gray-400 mb-8">
                        We couldn't approve your verification with the details provided.
                        Please review and submit again.
                    </p>

                    <button 
                         onClick={handleResubmit}
                         className="w-full max-w-xs bg-[#667eea] text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition"
                    >
                        Fill Again
                    </button>
              </div>
          </div>
      );
  }

  // Pending View
  if (status === 'pending') {
      return (
        <div className="flex flex-col min-h-screen bg-background pb-20 md:pb-8">
             <div className="flex flex-col items-center justify-center flex-1 p-10 text-center">
                  <div className="w-16 h-16 border-4 border-[#667eea] border-t-transparent rounded-full animate-spin mb-6"></div>
                  <h2 className="text-2xl font-extrabold text-white mb-2">You will be verified soon!</h2>
                  <p className="text-gray-400 mb-8">
                    Your verification request has been submitted and is under review. This usually takes less than a minute.
                  </p>
                  
                  <div className="flex items-center bg-surfaceLight px-4 py-2 rounded-full border border-white/5 mb-10">
                      <div className="w-2 h-2 rounded-full bg-[#667eea] mr-2 animate-pulse"></div>
                      <span className="text-xs font-semibold text-gray-300">Checking for updates...</span>
                  </div>

                  <button 
                      onClick={() => navigate('/profile')}
                      className="w-full max-w-xs bg-[#667eea] text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition"
                  >
                      Back to Profile
                  </button>
             </div>
        </div>
      );
  }

  // Form View (Initial)
  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-center px-4 pt-6 pb-4 border-b border-white/5 bg-surface sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition mr-2 text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-white flex-1">Verification</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-5 overflow-y-auto">
          
          {/* Inputs Row 1 */}
          <div className="flex gap-3 mb-4">
              <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-400 mb-2">First name</label>
                  <input 
                      type="text"
                      className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#667eea] transition"
                      placeholder="eg. Samuel"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                  />
              </div>
              <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Last name</label>
                  <input 
                      type="text"
                      className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#667eea] transition"
                      placeholder="eg. Tewodros"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                  />
              </div>
          </div>

          {/* Inputs Row 2 */}
          <div className="flex gap-3 mb-4">
              <div className="w-24">
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Age</label>
                  <input 
                      type="number"
                      className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#667eea] transition"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                  />
              </div>
              <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Phone no</label>
                  <input 
                      type="tel"
                      className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#667eea] transition"
                      placeholder="+251..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                  />
              </div>
          </div>

          {/* National ID (FIN) */}
          <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-400 mb-2">National ID (FIN) *</label>
              <input 
                  type="text"
                  maxLength={12}
                  className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#667eea] transition"
                  placeholder="Enter 12-digit FIN"
                  value={finNumber}
                  onChange={(e) => setFinNumber(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">* Must be unique to you. Used for identity verification.</p>
          </div>

          {/* Bank */}
          <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-400 mb-2">Bank</label>
                <div className="flex gap-2">
                    {['CBE', 'Awash', 'Dashen'].map((b) => (
                        <button 
                            key={b}
                            onClick={() => setBank(b)}
                            className={`px-4 py-2.5 rounded-xl border font-semibold transition ${bank === b ? 'bg-[#667eea] border-[#667eea] text-white' : 'bg-surface border-white/10 text-gray-400 hover:bg-white/5'}`}
                        >
                            {b}
                        </button>
                    ))}
                </div>
          </div>

          {/* Conditional Account Number */}
          {bank !== '' && (
              <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Bank Account Number</label>
                  <input 
                      type="number"
                      className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#667eea] transition"
                      placeholder="Enter your account number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                  />
              </div>
          )}

          <h3 className="text-lg font-bold text-white mt-6 mb-4">ID Verification</h3>

          <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 rounded-2xl h-48 flex flex-col items-center justify-center bg-surface cursor-pointer hover:bg-surfaceLight transition mb-8 overflow-hidden"
          >
              {idImage ? (
                  <img src={idImage} alt="ID Preview" className="w-full h-full object-cover" />
              ) : (
                  <div className="flex flex-col items-center text-gray-400">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                      <span className="font-semibold text-sm">Upload image</span>
                  </div>
              )}
              <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImagePick} 
                  accept="image/*" 
                  className="hidden" 
              />
          </div>

          <button 
             onClick={handleSubmit}
             disabled={isSubmitting}
             className="w-full bg-[#667eea] text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition flex items-center justify-center"
          >
              {isSubmitting ? (
                  <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Submitting...
                  </>
              ) : "I've Completed"}
          </button>

      </div>
    </div>
  );
};

export default Verification;
