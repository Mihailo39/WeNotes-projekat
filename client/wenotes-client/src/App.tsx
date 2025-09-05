import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SharedNotePage from './pages/SharedNotePage';
import ProtectedRoute from './routes/ProtectedRoute';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
};

const NotFoundPage: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#edffec]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Stranica nije pronađena</h2>
        <p className="text-gray-600 mb-6">Stranica koju tražite ne postoji.</p>
        <Link
          to={user ? "/dashboard" : "/login"}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#60cbff] hover:bg-[#4db8e6] transition-colors"
        >
          {user ? "Idi na Dashboard" : "Idi na Login"}
        </Link>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#60cbff]"></div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/login" 
          element={<PageTransition><LoginPage /></PageTransition>}
        />
        <Route 
          path="/register" 
          element={<PageTransition><RegisterPage /></PageTransition>}
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <PageTransition><DashboardPage /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <PageTransition><ProfilePage /></PageTransition>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/shared/:token" 
          element={
            <PageTransition><SharedNotePage /></PageTransition>
          } 
        />
        <Route 
          path="/" 
          element={<Navigate to="/login" replace />} 
        />
        <Route 
          path="*" 
          element={
            <PageTransition>
              <NotFoundPage />
            </PageTransition>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
