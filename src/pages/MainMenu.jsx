import React from 'react';
import { Link } from 'react-router-dom';
import './MainMenu.css';

const MainMenu = () => (
  <div className="main-menu-bg">
    <div className="main-menu-card">
      <h1 className="main-menu-title">¡Bienvenido a EventManager!</h1>
      <p className="main-menu-desc">Gestiona tus eventos de manera fácil y rápida.</p>
      <div className="main-menu-actions">
        <Link to="/login" className="main-menu-btn main-menu-btn-login">Iniciar Sesión</Link>
        <Link to="/register" className="main-menu-btn main-menu-btn-register">Registrarse</Link>
      </div>
    </div>
  </div>
);

export default MainMenu; 