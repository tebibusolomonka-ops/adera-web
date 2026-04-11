import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Bell, 
  Moon, 
  Lock, 
  HelpCircle, 
  FileText, 
  Eye, 
  LogOut, 
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { getUserProfile } from '../services/user_service';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const { isDarkMode, toggleTheme } = useTheme();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  // Password Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(profile => {
        setIsVerified(profile?.isVerified || false);
      }).catch(console.error);
    }
  }, [user]);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      try {
        if (logout) await logout();
        navigate('/login');
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
  };

  const handleChangePassword = async () => {
    setError('');
    if (!currentPassword || !newPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    if (!user || !user.email) {
      setError('You must be logged in to change your password');
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      alert('Your password has been changed successfully.');
      setModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      console.error('Change Password Error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Incorrect current password.');
      } else {
        setError(err.message || 'Failed to update password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderSectionHeader = (title: string) => (
    <h3 className="text-[13px] font-bold text-gray-400 mt-6 mb-2 ml-5 tracking-[1px] uppercase">
      {title}
    </h3>
  );

  const renderSettingItem = (
    IconComp: any, 
    label: string, 
    onPress?: () => void, 
    rightElement?: React.ReactNode,
    isDestructive = false
  ) => (
    <div 
      onClick={onPress}
      className={`flex items-center justify-between py-3 px-5 bg-surface transition-colors ${onPress ? 'cursor-pointer hover:bg-white/5' : ''}`}
    >
      <div className="flex items-center">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mr-3.5 ${isDestructive ? 'bg-red-500/20' : 'bg-[#2D3748]'}`}>
            <IconComp className={`w-5 h-5 ${isDestructive ? 'text-red-500' : 'text-[#b18cff]'}`} />
        </div>
        <span className={`text-base font-medium ${isDestructive ? 'text-red-500 font-semibold' : 'text-white'}`}>
          {label}
        </span>
      </div>
      {rightElement || <ChevronRight className="w-5 h-5 text-gray-500" />}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background pb-10">
      {/* Header */}
      <div className="flex items-center px-5 py-4 border-b border-white/5 bg-surface sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-full transition">
          <ChevronLeft className="w-7 h-7 text-white" />
        </button>
        <span className="text-lg font-bold text-white flex-1 text-center pr-8">Settings</span>
      </div>

      <div className="flex flex-col mt-2">
        {renderSectionHeader('GENERAL')}
        {renderSettingItem(
          Bell, 
          'Push Notifications', 
          undefined, 
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={notificationsEnabled}
              onChange={() => setNotificationsEnabled(!notificationsEnabled)}
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#667eea]"></div>
          </label>
        )}
        {renderSettingItem(
          Moon, 
          'Dark Mode', 
          undefined, 
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={isDarkMode}
              onChange={toggleTheme}
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#667eea]"></div>
          </label>
        )}

        {renderSectionHeader('SECURITY')}
        {renderSettingItem(Lock, 'Change Password', () => setModalVisible(true))}

        {renderSectionHeader('SUPPORT')}
        {renderSettingItem(HelpCircle, 'Help Center', () => {
            if (isVerified) {
                navigate('/contact-us');
            } else {
                navigate('/verification-required');
            }
        })}
        {renderSettingItem(FileText, 'Terms of Service', () => navigate('/terms-of-service'))}
        {renderSettingItem(Eye, 'Privacy Policy', () => navigate('/privacy-policy'))}

        {renderSectionHeader('ACCOUNT')}
        {renderSettingItem(
          LogOut, 
          'Logout', 
          handleLogout, 
          <div/>, // Empty div to remove the chevron right icon
          true // isDestructive
        )}

        <div className="text-center mt-10 text-gray-500 text-xs font-medium">
          Version 1.0.0
        </div>
      </div>

      {/* Change Password Modal */}
      {modalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-sm shadow-xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-center text-white mb-5">Change Password</h2>
            
            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-4">{error}</div>}

            <label className="block text-sm font-semibold text-gray-400 mb-2 ml-1">Current Password</label>
            <input 
              type="password" 
              className="w-full h-12 border border-[#2D3748] bg-[#1A202C] rounded-xl px-4 mb-5 text-white focus:outline-none focus:border-[#667eea] transition-colors"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <label className="block text-sm font-semibold text-gray-400 mb-2 ml-1">New Password</label>
            <input 
              type="password" 
              className="w-full h-12 border border-[#2D3748] bg-[#1A202C] rounded-xl px-4 mb-6 text-white focus:outline-none focus:border-[#667eea] transition-colors"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <div className="flex gap-3">
              <button 
                onClick={() => setModalVisible(false)}
                className="flex-1 h-12 bg-[#2D3748] hover:bg-[#4A5568] transition-colors rounded-xl text-white font-semibold flex items-center justify-center"
              >
                Cancel
              </button>
              <button 
                onClick={handleChangePassword}
                disabled={loading}
                className="flex-1 h-12 bg-[#667eea] hover:bg-[#5a6ee0] transition-colors rounded-xl text-white font-bold flex items-center justify-center disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
