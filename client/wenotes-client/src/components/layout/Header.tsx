import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../ui/Button';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const isProfilePage = location.pathname === '/profile';
  const isDashboardPage = location.pathname === '/dashboard';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 
              className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-[#60cbff] transition-colors"
              onClick={handleDashboardClick}
            >
              WeNotes
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{user?.username}</span>
              {user?.role === 'premium' && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Premium
                </span>
              )}
            </div>
            
            {/* Navigation */}
            <div className="flex items-center space-x-2">
              <Button
                variant={isDashboardPage ? "primary" : "outline"}
                size="sm"
                onClick={handleDashboardClick}
              >
                Dashboard
              </Button>
              
              <Button
                variant={isProfilePage ? "primary" : "outline"}
                size="sm"
                onClick={handleProfileClick}
              >
                Profil
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              Odjavi se
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
