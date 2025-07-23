import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, User, Edit, Trash2, Users, DollarSign } from 'lucide-react';
import { eventsAPI } from '../services/api';

const Events = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all'); // all, my-events, enrolled
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await eventsAPI.getAll();
      console.log('API response:', res.data); // Debug API response
      const data = Array.isArray(res.data) ? res.data : [];
      setEvents(data);
    } catch (err) {
      setError('Error al cargar eventos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      try {
        await eventsAPI.delete(eventId);
        fetchEvents();
      } catch (error) {
        alert('Error al eliminar el evento');
      }
    }
  };

  const handleEnrollToggle = async (eventId, isEnrolled) => {
    try {
      if (isEnrolled) {
        await eventsAPI.unenroll(eventId);
      } else {
        await eventsAPI.enroll(eventId, {
          description: 'Inscripción al evento desde la aplicación web',
          attended: false,
          observations: 'Inscripción realizada desde la interfaz web',
          rating: 5
        });
      }
      fetchEvents();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al cambiar inscripción';
      alert(errorMessage);
    }
  };

  if (isLoading) return <div className="loading">Cargando eventos...</div>;
  if (error) return <div className="error">{error}</div>;

  console.log('Events in state:', events); // Debug events state

  const filteredEvents = events.filter(event => {
    if (filter === 'my-events') {
      return event.id_creator_user === user.id;
    }
    // Add more filters as needed
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Eventos</h1>
        <Link to="/events/new">
          <button className="btn btn-primary">Crear Nuevo Evento</button>
        </Link>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label htmlFor="filter">Filtrar eventos: </label>
        <select 
          id="filter" 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
        >
          <option value="all">Todos los eventos</option>
          <option value="my-events">Mis eventos</option>
        </select>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="card">
          <p>No hay eventos disponibles.</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {filteredEvents.map(event => {
            const isMyEvent = event.id_creator_user === user.id;
            const eventDate = new Date(event.start_date);
            const isPast = eventDate < new Date();
            
            return (
              <div key={event.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3>{event.evento_nombre}</h3>
                  {isMyEvent && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/events/${event.id}/edit`}>
                        <button className="btn" style={{ padding: '0.25rem 0.5rem' }}>
                          <Edit size={14} />
                        </button>
                      </Link>
                      <button 
                        className="btn" 
                        style={{ padding: '0.25rem 0.5rem', color: '#ff4444' }}
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                
                <p style={{ marginBottom: '0.5rem' }}>{event.description}</p>
                
                <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Calendar size={14} />
                    <span>{eventDate.toLocaleString()}</span>
                    {isPast && <span style={{ color: '#ff4444' }}>(Pasado)</span>}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <MapPin size={14} />
                    <span>{event.ubicacion_nombre}</span>
                  </div>
                  
                  {(event.price !== null && event.price !== undefined && event.price !== '') && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <DollarSign size={14} />
                      <span>${parseFloat(event.price).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={14} />
                    <span>Por: {event.first_name} {event.last_name}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
                  <Link to={`/events/${event.id}`}>
                    <button className="btn btn-secondary">Ver Detalles</button>
                  </Link>
                  
                  {!isMyEvent && !isPast && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleEnrollToggle(event.id, false)} // Simplified for now
                    >
                      <Users size={14} />
                      Inscribirse
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Events;
