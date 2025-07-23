import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MainMenu from './pages/MainMenu';
import EventDetail from './pages/EventDetail';
import Events from './pages/Events';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Cargando...</div>;
  }
  
  return user ? children : <Navigate to="/" />;
}

function PublicRoute({ children }) {  
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Cargando...</div>;
  }
  
  return user ? <Navigate to="/dashboard" /> : children;
}

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login' || location.pathname === '/register';
  return (
    <div className="app">
      {!hideNavbar && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/events/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/" element={<MainMenu />} />
          {/* Catch-all: if not logged in, redirect to main menu */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
