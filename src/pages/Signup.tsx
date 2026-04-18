import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect all signup attempts to login since it's now Telegram-only
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-background items-center justify-center">
       <div className="w-8 h-8 border-4 border-[#764ba2] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Signup;
