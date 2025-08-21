import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter as Router, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import DoctorDashboard from './components/DoctorDashboard';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import CommonPages from './components/CommonPages';
import ProtectedRoute from './components/ProtectedRoute';
import { dataStore } from './services/dataStore';

export default function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app startup
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const storedUser = localStorage.getItem('retinal_ai_user');
        const storedSession = localStorage.getItem('retinal_ai_session');
        
        if (storedUser && storedSession) {
          const userData = JSON.parse(storedUser);
          const sessionData = JSON.parse(storedSession);
          
          // Check if session is still valid (24 hours)
          const currentTime = new Date().getTime();
          const sessionExpiry = new Date(sessionData.expiresAt).getTime();
          
          if (currentTime < sessionExpiry) {
            // Verify user still exists in database
            const dbUser = dataStore.getUserById(userData.id);
            if (dbUser && dbUser.status === 'active') {
              setUser(userData);
              setUserRole(userData.role);
              
              // Update last activity
              dataStore.updateUser(userData.id, { 
                lastActivity: new Date().toISOString() 
              });
              
              console.log(`Session restored for ${userData.role}: ${userData.name}`);
            } else {
              // User not found or inactive, clear session
              clearSession();
            }
          } else {
            // Session expired, clear it
            clearSession();
            console.log('Session expired, please log in again');
          }
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const handleLogin = (userData) => {
    try {
      setUser(userData);
      setUserRole(userData.role);
      
      // Store user session in localStorage
      const sessionData = {
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        deviceInfo: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      };
      
      localStorage.setItem('retinal_ai_user', JSON.stringify(userData));
      localStorage.setItem('retinal_ai_session', JSON.stringify(sessionData));
      
      // Update user's last login in database
      dataStore.updateUser(userData.id, { 
        lastLogin: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      });
      
      console.log(`Login successful for ${userData.role}: ${userData.name}`);
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const handleLogout = () => {
    try {
      // Update user's last activity before logout
      if (user) {
        dataStore.updateUser(user.id, { 
          lastActivity: new Date().toISOString() 
        });
        console.log(`Logout for ${user.role}: ${user.name}`);
      }
      
      clearSession();
    } catch (error) {
      console.error('Error during logout:', error);
      clearSession();
    }
  };

  const clearSession = () => {
    setUser(null);
    setUserRole(null);
    localStorage.removeItem('retinal_ai_user');
    localStorage.removeItem('retinal_ai_session');
  };

  // Auto-logout on session expiry
  useEffect(() => {
    if (user) {
      const checkSessionValidity = setInterval(() => {
        const storedSession = localStorage.getItem('retinal_ai_session');
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          const currentTime = new Date().getTime();
          const sessionExpiry = new Date(sessionData.expiresAt).getTime();
          
          if (currentTime >= sessionExpiry) {
            console.log('Session expired, logging out...');
            handleLogout();
          }
        } else {
          handleLogout();
        }
      }, 60000); // Check every minute
      
      return () => clearInterval(checkSessionValidity);
    }
  }, [user]);

  // Show loading spinner while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#0A3D62] border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-[#27AE60] rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-[#0A3D62] mb-2">Retinal-AI</h2>
            <p className="text-[#6C757D]">Initializing medical platform...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route 
            path="/auth" 
            element={user ? <Navigate to="/dashboard" /> : <AuthPage onLogin={handleLogin} />} 
          />

          {/* Common Pages - accessible to all */}
          <Route path="/about" element={<CommonPages.About />} />
          <Route path="/features" element={<CommonPages.Features />} />
          <Route path="/education" element={<CommonPages.Education />} />
          <Route path="/contact" element={<CommonPages.Contact />} />
          <Route path="/chatbot" element={<CommonPages.Chatbot />} />
          
          {/* Protected Routes */}
          <Route 
            path="/doctor/*" 
            element={
              <ProtectedRoute user={user} allowedRoles={['doctor']}>
                <DoctorDashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user/*" 
            element={
              <ProtectedRoute user={user} allowedRoles={['user']}>
                <UserDashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute user={user} allowedRoles={['admin']}>
                <AdminDashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />

          {/* Role-based Dashboard Redirect */}
          <Route 
            path="/dashboard" 
            element={
              user ? (
                userRole === 'doctor' ? <Navigate to="/doctor" replace /> :
                userRole === 'admin' ? <Navigate to="/admin" replace /> :
                <Navigate to="/user" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />

          {/* Legacy and Error Routes */}
          <Route path="/preview_page.html" element={<Navigate to="/" replace />} />
          
          {/* Catch-all route */}
          <Route path="*" element={
            user ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />
          } />
        </Routes>
      </div>
    </Router>
  );
}