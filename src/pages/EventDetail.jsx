import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, User, Edit, Trash2, Users, UserCheck, UserX, DollarSign } from 'lucide-react';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventError, setEventError] = useState(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

  const fetchEvent = async () => {
    setEventLoading(true);
    setEventError(null);
    try {
      const res = await eventsAPI.getById(id);
      const eventData = Array.isArray(res.data) ? res.data[0] : res.data;
      setEvent(eventData);
    } catch (err) {
      setEventError('Error al cargar el evento');
    } finally {
      setEventLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line
  }, [id]);

  const handleDeleteEvent = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      try {
        await eventsAPI.delete(id);
        navigate('/events');
      } catch (error) {
        alert('Error al eliminar el evento');
      }
    }
  };

  const handleEnrollmentToggle = async () => {
    setEnrollmentLoading(true);
    try {
      if (event.is_enrolled) {
        await eventsAPI.unenroll(id);
      } else {
        await eventsAPI.enroll(id, {
          description: 'Inscripción al evento desde la aplicación web',
          attended: false,
          observations: 'Inscripción realizada desde la interfaz web',
          rating: 5
        });
      }
      await fetchEvent(); // Refetch event to update enrollments and is_enrolled
    } catch (error) {
      alert('Error al cambiar inscripción');
    } finally {
      setEnrollmentLoading(false);
    }
  };

  if (eventLoading) return <div className="loading">Cargando evento...</div>;
  if (eventError) return <div className="error">Error al cargar el evento</div>;
  if (!event) return <div className="error">Evento no encontrado</div>;

  const isMyEvent = event.id_creator_user === user.id;
  const eventDate = new Date(event.start_date);
  const isPast = eventDate < new Date();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1>{event.evento_nombre || event.name || 'Evento sin nombre'}</h1>
          {isPast && <span style={{ color: '#ff4444', fontSize: '0.9rem' }}>Evento pasado</span>}
        </div>
        {isMyEvent && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to={`/events/${id}/edit`}>
              <button className="btn btn-secondary">
                <Edit size={16} />
                Editar
              </button>
            </Link>
            <button 
              className="btn" 
              style={{ color: '#ff4444', borderColor: '#ff4444' }}
              onClick={handleDeleteEvent}
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2>Detalles del Evento</h2>
          <div style={{ marginBottom: '1rem' }}>
            <h3>Descripción</h3>
            <p>{event.description || 'No hay descripción disponible'}</p>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Calendar size={16} />
              <strong>Fecha y Hora:</strong>
            </div>
            <p>{eventDate.toLocaleString()}</p>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <MapPin size={16} />
              <strong>Ubicación:</strong>
            </div>
            <p>{event.ubicacion_nombre || event.location_name || 'Ubicación no especificada'}</p>
            {event.latitude && event.longitude && (
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                Coordenadas: {event.latitude}, {event.longitude}
              </p>
            )}
          </div>
          {(event.price !== null && event.price !== undefined && event.price !== '') && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <DollarSign size={16} />
                <strong>Precio:</strong>
              </div>
              <p>${parseFloat(event.price).toFixed(2)}</p>
            </div>
          )}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <User size={16} />
              <strong>Organizador:</strong>
            </div>
            <p>{(event.first_name && event.last_name) ? `${event.first_name} ${event.last_name}` : 'Organizador no especificado'}</p>
            {event.username && (
              <p style={{ fontSize: '0.9rem', color: '#666' }}>{event.username}</p>
            )}
          </div>
          {!isPast && (
            <button 
              className={`btn ${event.is_enrolled ? 'btn-success' : 'btn-primary'}`}
              onClick={handleEnrollmentToggle}
              disabled={enrollmentLoading}
              style={{ width: '100%' }}
            >
              {enrollmentLoading ? (
                'Procesando...'
              ) : event.is_enrolled ? (
                <>
                  <UserCheck size={16} />
                  Suscrito - Cancelar Inscripción
                </>
              ) : (
                <>
                  <UserCheck size={16} />
                  Inscribirse
                </>
              )}
            </button>
          )}
        </div>
        <div className="card">
          <h2>
            <Users size={20} />
            Participantes del Evento
          </h2>
          {event.enrollments && event.enrollments.length > 0 ? (
            <div>
              <div style={{
                padding: '1rem',
                backgroundColor: '#f0f9ff',
                border: '2px solid #0ea5e9',
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#0ea5e9', margin: '0 0 0.5rem 0' }}>
                  {event.enrollment_count} {event.enrollment_count === 1 ? 'Participante Inscrito' : 'Participantes Inscritos'}
                </h3>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {event.enrollments.map((enrollment, index) => (
                  <div key={index} style={{ 
                    padding: '1rem', 
                    marginBottom: '0.75rem', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    backgroundColor: enrollment.user_id === user.id ? '#f0f9ff' : '#f9fafb'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div>
                        <strong style={{ color: '#1f2937', fontSize: '1.1rem' }}>
                          {enrollment.first_name} {enrollment.last_name}
                        </strong>
                        {enrollment.user_id === user.id && (
                          <span style={{ 
                            marginLeft: '0.5rem',
                            backgroundColor: '#0ea5e9', 
                            color: 'white', 
                            padding: '0.2rem 0.6rem', 
                            borderRadius: '12px', 
                            fontSize: '0.7rem',
                            fontWeight: '600'
                          }}>
                            Tú
                          </span>
                        )}
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                          @{enrollment.username}
                        </p>
                      </div>
                      <span style={{ 
                        backgroundColor: enrollment.attended ? '#10b981' : '#f59e0b', 
                        color: 'white', 
                        padding: '0.3rem 0.8rem', 
                        borderRadius: '14px', 
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {enrollment.attended ? 'Asistió' : 'Inscrito'}
                      </span>
                    </div>
                    <div style={{ 
                      borderTop: '1px solid #e5e7eb',
                      paddingTop: '0.75rem',
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      {enrollment.description && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Descripción:</strong> {enrollment.description}
                        </div>
                      )}
                      {enrollment.observations && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Observaciones:</strong> {enrollment.observations}
                        </div>
                      )}
                      {enrollment.rating && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Valoración:</strong> 
                          <span style={{ marginLeft: '0.5rem' }}>
                            {'★'.repeat(Math.min(enrollment.rating, 5))}
                            {'☆'.repeat(Math.max(0, 5 - enrollment.rating))}
                            <span style={{ marginLeft: '0.25rem', color: '#9ca3af' }}>
                              ({enrollment.rating}/5)
                            </span>
                          </span>
                        </div>
                      )}
                      {enrollment.registration_date_time && (
                        <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                          <strong>Inscrito el:</strong> {new Date(enrollment.registration_date_time).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              padding: '2rem',
              backgroundColor: '#fef2f2',
              border: '2px solid #f87171',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Users size={18} style={{ color: '#dc2626' }} />
                <strong style={{ color: '#dc2626' }}>No hay participantes inscritos</strong>
              </div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#7f1d1d' }}>
                Este evento aún no tiene participantes inscritos
              </p>
            </div>
          )}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #e5e7eb' }}>
            <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Tu Estado de Participación</h3>
            {event.is_enrolled ? (
              <div style={{
                padding: '1rem',
                backgroundColor: '#f0f9ff',
                border: '2px solid #0ea5e9',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <UserCheck size={18} style={{ color: '#0ea5e9' }} />
                  <strong style={{ color: '#0ea5e9' }}>¡Estás inscrito en este evento!</strong>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '1rem',
                backgroundColor: '#fef2f2',
                border: '2px solid #f87171',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <UserX size={18} style={{ color: '#dc2626' }} />
                  <strong style={{ color: '#dc2626' }}>No estás inscrito en este evento</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link to="/events">
          <button className="btn btn-secondary">Volver a Eventos</button>
        </Link>
      </div>
    </div>
  );
};

export default EventDetail;
