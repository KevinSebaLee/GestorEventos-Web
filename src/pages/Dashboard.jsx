import React from 'react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { eventsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  TrendingUp, 
  Clock, 
  Star,
  BarChart3,
  Activity
} from 'lucide-react';
import '../App.css';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    eventsAPI.getAll()
      .then(res => {
        // Handle both direct array and wrapped response
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setEvents(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError('Error al cargar eventos');
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div className="loading">Cargando eventos...</div>;
  if (error) return <div className="error">{error}</div>;

  const myEvents = events.filter(event => event.id_creator_user === user.id);
  const upcomingEvents = events.filter(event => new Date(event.start_date) > new Date());
  const pastEvents = events.filter(event => new Date(event.start_date) < new Date());

  const stats = [
    {
      title: 'Total de Eventos',
      value: events.length,
      icon: Calendar,
      color: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      bgColor: 'rgba(99, 102, 241, 0.1)'
    },
    {
      title: 'Mis Eventos',
      value: myEvents.length,
      icon: Star,
      color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      title: 'Próximos Eventos',
      value: upcomingEvents.length,
      icon: TrendingUp,
      color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      title: 'Eventos Pasados',
      value: pastEvents.length,
      icon: Clock,
      color: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      bgColor: 'rgba(107, 114, 128, 0.1)'
    }
  ];

  return (
    <div className="fade-in">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1>¡Bienvenido de vuelta, {user.firstName}! 🎉</h1>
          <p>Gestiona tus eventos y descubre nuevas oportunidades</p>
          
          <Link to="/events/new">
            <button 
              className="dashboard-btn"
            >
              <Plus size={20} />
              Crear Nuevo Evento
            </button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-4 mb-8">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div 
              key={index}
              className="dashboard-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p>
                    {stat.title}
                  </p>
                  <h3>
                    {stat.value}
                  </h3>
                </div>
                <div style={{
                  background: stat.color,
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IconComponent size={24} color="white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-2">
        {/* My Events */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)'
              }}>
                <Star size={20} color="white" />
              </div>
              <h2 style={{ margin: 0 }}>Mis Eventos</h2>
            </div>
            <Link to="/events">
              <button className="btn btn-sm btn-secondary">Ver todos</button>
            </Link>
          </div>
          
          {myEvents.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem',
              color: 'var(--text-secondary)'
            }}>
              <Activity size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No has creado ningún evento aún.</p>
              <Link to="/events/new">
                <button className="btn btn-primary mt-2">
                  <Plus size={16} />
                  Crear tu primer evento
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myEvents.slice(0, 3).map(event => (
                <Link 
                  key={event.id} 
                  to={`/events/${event.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{ 
                    padding: '1rem', 
                    border: '1px solid var(--gray-200)', 
                    borderRadius: 'var(--radius-md)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = 'var(--primary-color)';
                    e.target.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = 'var(--gray-200)';
                    e.target.style.boxShadow = 'none';
                  }}
                  >
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                      {event.evento_nombre}
                    </h4>
                    <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(event.start_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        {event.ubicacion_nombre}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)'
              }}>
                <TrendingUp size={20} color="white" />
              </div>
              <h2 style={{ margin: 0 }}>Próximos Eventos</h2>
            </div>
            <Link to="/events">
              <button className="btn btn-sm btn-secondary">Ver todos</button>
            </Link>
          </div>
          
          {upcomingEvents.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem',
              color: 'var(--text-secondary)'
            }}>
              <Clock size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No hay eventos próximos programados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 3).map(event => (
                <Link 
                  key={event.id} 
                  to={`/events/${event.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{ 
                    padding: '1rem', 
                    border: '1px solid var(--gray-200)', 
                    borderRadius: 'var(--radius-md)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = 'var(--primary-color)';
                    e.target.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = 'var(--gray-200)';
                    e.target.style.boxShadow = 'none';
                  }}
                  >
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                      {event.evento_nombre}
                    </h4>
                    <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(event.start_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        {event.ubicacion_nombre}
                      </div>
                    </div>
                    <p style={{ 
                      fontSize: '0.875rem', 
                      color: 'var(--text-secondary)',
                      margin: '0.5rem 0 0 0'
                    }}>
                      Por: {event.first_name} {event.last_name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mt-6">
        <h2 className="flex items-center gap-2 mb-4">
          <BarChart3 size={24} />
          Acciones Rápidas
        </h2>
        <div className="grid grid-3">
          <Link to="/events/new">
            <button className="btn btn-primary w-full">
              <Plus size={18} />
              Crear Evento
            </button>
          </Link>
          <Link to="/events">
            <button className="btn btn-secondary w-full">
              <Calendar size={18} />
              Ver Todos los Eventos
            </button>
          </Link>
          <Link to="/test">
            <button className="btn btn-secondary w-full">
              <Activity size={18} />
              Probar Conexión
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
