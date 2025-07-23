import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });

    // Check password strength
    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return '#ef4444';
    if (passwordStrength <= 3) return '#f59e0b';
    return '#10b981';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Débil';
    if (passwordStrength <= 3) return 'Media';
    return 'Fuerte';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (userData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    const result = await register(userData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        minWidth: '100vw',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        zIndex: 0,
        overflow: 'auto',
        paddingTop: '6.5rem',
        paddingBottom: '2rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2.5rem',
        }}
      >
        <div
          className="card fade-in"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxWidth: '600px',
            margin: 'auto',
            padding: '2.5rem 2rem',
            borderRadius: '1.5rem',
            width: '100%',
            fontSize: '1.1rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              width: '4rem',
              height: '4rem',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <UserPlus size={32} color="white" />
            </div>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '700',
              background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem'
            }}>
              ¡Únete a nosotros!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Crea tu cuenta y comienza a gestionar eventos
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="firstName" className="flex items-center gap-2" style={{alignItems:'center'}}>
                  <User size={16} style={{verticalAlign:'middle', display:'inline-block', marginRight: '0.5rem'}} />
                  Nombre
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName" className="flex items-center gap-2" style={{alignItems:'center'}}>
                  <User size={16} style={{verticalAlign:'middle', display:'inline-block', marginRight: '0.5rem'}} />
                  Apellido
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleChange}
                  placeholder="Tu apellido"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="username" className="flex items-center gap-2" style={{alignItems:'center'}}>
                <Mail size={16} style={{verticalAlign:'middle', display:'inline-block', marginRight: '0.5rem'}} />
                Email
              </label>
              <input
                type="email"
                id="username"
                name="username"
                value={userData.username}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
                required
                style={{
                  paddingLeft: '3rem',
                  background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207'/%3E%3C/svg%3E") no-repeat 0.75rem center`,
                  backgroundSize: '1.25rem'
                }}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="flex items-center gap-2" style={{alignItems:'center'}}>
                <Lock size={16} style={{verticalAlign:'middle', display:'inline-block', marginRight: '0.5rem'}} />
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={userData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength="6"
                  style={{
                    paddingLeft: '3rem',
                    paddingRight: '3rem',
                    background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'/%3E%3C/svg%3E") no-repeat 0.75rem center`,
                    backgroundSize: '1.25rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {userData.password && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    marginBottom: '0.25rem'
                  }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Seguridad:</span>
                    <span style={{ color: getPasswordStrengthColor(), fontWeight: '600' }}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '0.25rem',
                    backgroundColor: 'var(--gray-200)',
                    borderRadius: '0.125rem',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(passwordStrength / 5) * 100}%`,
                      height: '100%',
                      backgroundColor: getPasswordStrengthColor(),
                      transition: 'all 0.3s ease'
                    }}></div>
                  </div>
                </div>
              )}
            </div>
            
            {error && (
              <div className="error" style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              className="btn btn-success btn-lg w-full"
              disabled={loading}
              style={{
                background: loading 
                  ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="loading-spinner" style={{
                    width: '1rem',
                    height: '1rem',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Creando cuenta...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} />
                  Crear Cuenta
                </div>
              )}
            </button>
          </form>
          
          <div className="text-center mt-6" style={{
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--gray-200)'
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              ¿Ya tienes cuenta?{' '}
              <Link 
                to="/login" 
                style={{ 
                  color: 'var(--primary-color)', 
                  textDecoration: 'none', 
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
