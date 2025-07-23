import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Calendar, Plus, Home, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, logout, loading } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/dashboard" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            padding: '0.5rem',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={20} color="white" />
          </div>
          <h1>EventManager</h1>
        </Link>
        
        {loading && (
          <div style={{ 
            padding: '0.5rem 1rem',
            color: 'var(--text-secondary)'
          }}>
            Cargando...
          </div>
        )}
        
        {user && !loading && (
          <div className="navbar-actions">
            <div style={{ 
              background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
              padding: '0.5rem 1rem',
              borderRadius: '2rem',
              border: '1px solid #d1d5db'
            }}>
              <span style={{ fontWeight: '600', color: '#374151' }}>
                ¡Hola, {user.firstName || user.username || 'Usuario'}
                {user.lastName && ` ${user.lastName}`}! 👋
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
            
            <Link to="/events/new">
              <button className="btn btn-primary btn-sm">
                <Plus size={16} />
                Crear Evento
              </button>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="btn btn-danger btn-sm"
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                border: 'none'
              }}
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
