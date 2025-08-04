import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Calendar, Plus, Home, Sparkles, MapPin } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, loading } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // Format user's name - prioritize actual name over username
  const getUserDisplayName = () => {
    if (user) {
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      
      // If we have a real name, use it
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
      
      // Otherwise fall back to username or login
      return user.username || 'KevinSebaLee';
    }
    return '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="navbar-logo">
            <Sparkles size={20} color="white" />
          </div>
          <h1 className="navbar-title">EventManager</h1>
        </Link>
        
        {loading && (
          <div className="navbar-loading">
            Cargando...
          </div>
        )}
        
        {user && !loading && (
          <div className="navbar-actions">
            <div className="navbar-user">
              <span style={{ fontWeight: '600', color: '#374151' }}>
                ¡Hola, {getUserDisplayName()}! 👋
              </span>
            </div>
            
            <Link to="/dashboard">
              <button className="btn btn-secondary btn-sm">
                <Home size={16} />
                Dashboard
              </button>
            </Link>
            
            <Link to="/events">
              <button className="btn btn-secondary btn-sm">
                <Calendar size={16} />
                Eventos
              </button>
            </Link>
            
            <Link to="/locations">
              <button className="btn btn-secondary btn-sm">
                <MapPin size={16} />
                Ubicaciones
              </button>
            </Link>
            
            <Link to="/events/new">
              <button className="btn btn-primary btn-sm">
                <Plus size={16} />
                Crear Evento
              </button>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="btn btn-danger btn-sm"
            >
              <LogOut size={16} />
              Salir
            </button>
          </div>
        )}
        
        {!user && !loading && (
          <div className="navbar-actions">
            <Link to="/login">
              <button className="btn btn-primary btn-sm">
                Iniciar Sesión
              </button>
            </Link>
            <Link to="/register">
              <button className="btn btn-secondary btn-sm">
                Registrarse
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;