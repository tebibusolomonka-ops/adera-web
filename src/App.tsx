import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';

import Buy from './pages/Buy';
import Sell from './pages/Sell';
import Profile from './pages/Profile';
import Transaction from './pages/Transaction';
import ItemDetail from './pages/ItemDetail';
import Notifications from './pages/Notifications';
import ListingList from './pages/ListingList';
import Verification from './pages/Verification';
import UploadImages from './pages/UploadImages';
import MySales from './pages/MySales';
import MyPurchases from './pages/MyPurchases';
import VerificationRequired from './pages/VerificationRequired';
import Settings from './pages/Settings';
import ContactAdmin from './pages/ContactAdmin';
import EditProfile from './pages/EditProfile';
import EditProfileVerificationRequired from './pages/EditProfileVerificationRequired';
import SellerProfile from './pages/SellerProfile';
import DetailPayment from './pages/DetailPayment';
import PaymentMethods from './pages/PaymentMethods';
import PaymentVerification from './pages/PaymentVerification';
import ViewCredentials from './pages/ViewCredentials';
import ReleaseCredentials from './pages/ReleaseCredentials';
import WaitingForConfirmation from './pages/WaitingForConfirmation';
import TransactionCompleted from './pages/TransactionCompleted';
import DisputeDetails from './pages/DisputeDetails';
import SellerDispute from './pages/SellerDispute';
import DisputeSolved from './pages/DisputeSolved';
import DisputeOutcome from './pages/DisputeOutcome';

import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// Simple wrapper to enforce authentication based on context
const PrivateWrapper = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-background"><div className="w-8 h-8 border-4 border-[#764ba2] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  if (!user) return <Navigate to="/login" replace />;
  
  // Block unverified email users
  if (!user.emailVerified) return <Navigate to="/verify-email" replace />;
  
  return <Layout />;
};

function App() {
  useEffect(() => {
    // Initialize Telegram Mini App SDK
    import('./services/telegram').then(({ initTelegramApp }) => {
      initTelegramApp();
    });
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          
          {/* Main tabs wrapper (Protected) */}
          <Route path="/" element={<PrivateWrapper />}>
            <Route index element={<Home />} />
            <Route path="buy" element={<Buy />} />
            <Route path="sell" element={<Sell />} />
            <Route path="upload-images" element={<UploadImages />} />
            <Route path="my-sales" element={<MySales />} />
            <Route path="my-purchases" element={<MyPurchases />} />
            <Route path="verification-required" element={<VerificationRequired />} />
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="edit-profile-verification-required" element={<EditProfileVerificationRequired />} />
            <Route path="settings" element={<Settings />} />
            <Route path="contact-us" element={<ContactAdmin />} />
            <Route path="transaction" element={<Transaction />} />
            <Route path="profile" element={<Profile />} />
            <Route path="seller/:sellerId" element={<SellerProfile />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="listings" element={<ListingList />} />
            <Route path="item/:id" element={<ItemDetail />} />
            <Route path="payment" element={<DetailPayment />} />
            <Route path="payment-methods" element={<PaymentMethods />} />
            <Route path="payment-verification" element={<PaymentVerification />} />
            <Route path="view-credentials" element={<ViewCredentials />} />
            <Route path="release-credentials" element={<ReleaseCredentials />} />
            <Route path="waiting-for-confirmation" element={<WaitingForConfirmation />} />
            <Route path="transaction-completed" element={<TransactionCompleted />} />
            <Route path="dispute-details" element={<DisputeDetails />} />
            <Route path="seller-dispute" element={<SellerDispute />} />
            <Route path="dispute-solved" element={<DisputeSolved />} />
            <Route path="dispute-outcome" element={<DisputeOutcome />} />
            <Route path="verify" element={<Verification />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms-of-service" element={<TermsOfService />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
