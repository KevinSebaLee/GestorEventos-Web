import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  MapPin, 
  User, 
  Edit, 
  Trash2, 
  Users, 
  UserCheck, 
  UserX, 
  DollarSign, 
  Search, 
  Tag, 
  X, 
  Filter, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { eventsAPI } from '../services/api';

const Events = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all'); // all, my-events, enrolled
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEnrollments, setUserEnrollments] = useState([]);

  // Backend filters
  const [nameFilter, setNameFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);
  
  // Filter popup state
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 20;

  const fetchEvents = async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      // Only apply the backend filters if they have values
      const apiFilters = {};
      if (nameFilter.trim()) apiFilters.nombre = nameFilter.trim();
      if (tagFilter.trim()) apiFilters.tag = tagFilter.trim();
      if (dateFilter) apiFilters.fecha_inicio = dateFilter;

      // Set isFiltering flag based on whether any filters are active
      setIsFiltering(Object.keys(apiFilters).length > 0);

      // Fetch events
      const eventsRes = await eventsAPI.getAll(apiFilters);
      const eventsData = Array.isArray(eventsRes.data) ? eventsRes.data : [];
      setEvents(eventsData);
      
      // Fetch user enrollments
      try {
        const enrollmentsRes = await eventsAPI.getUserEnrollments();
        const enrollmentsData = Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data : [];
        setUserEnrollments(enrollmentsData);
        console.log('User enrollments loaded:', enrollmentsData);
      } catch (enrollErr) {
        console.error('Error loading user enrollments:', enrollErr);
        // Don't fail the whole fetch if enrollments fail
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Error al cargar eventos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Helper function to check if user is enrolled in an event
  const isUserEnrolledInEvent = (eventId) => {
    // First try with API data if available
    if (userEnrollments && userEnrollments.length > 0) {
      return userEnrollments.some(enrollment => 
        parseInt(enrollment.id_event) === parseInt(eventId)
      );
    }
    
    // Fallback to localStorage if API data is not available
    try {
      const enrolledEvents = JSON.parse(localStorage.getItem('enrolledEvents') || '[]');
      return enrolledEvents.includes(parseInt(eventId));
    } catch (err) {
      console.error('Error checking local enrollment:', err);
      return false;
    }
  };

  // Client-side filter for "my events"
  const filteredEvents = events.filter(event => {
    if (filter === 'my-events') {
      return event.id_creator_user === user.id;
    }
    return true;
  });

  // Apply pagination
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / eventsPerPage));
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const paginatedEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, nameFilter, tagFilter, dateFilter]);

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      try {
        await eventsAPI.delete(eventId);
        fetchEvents(); // Refresh the list after deletion
      } catch (error) {
        alert('Error al eliminar el evento');
      }
    }
  };

  const handleEnrollToggle = async (eventId, isEnrolled) => {
    try {
      if (isEnrolled) {
        await eventsAPI.unenroll(eventId);
        
        // Update local storage
        const enrolledEvents = JSON.parse(localStorage.getItem('enrolledEvents') || '[]');
        localStorage.setItem('enrolledEvents', JSON.stringify(
          enrolledEvents.filter(id => id !== parseInt(eventId))
        ));
        
      } else {
        await eventsAPI.enroll(eventId, {
          description: 'Inscripción al evento desde la aplicación web',
          attended: 0,
          observations: 'Inscripción realizada desde la interfaz web',
          rating: 5
        });
        
        // Update local storage
        const enrolledEvents = JSON.parse(localStorage.getItem('enrolledEvents') || '[]');
        if (!enrolledEvents.includes(parseInt(eventId))) {
          enrolledEvents.push(parseInt(eventId));
          localStorage.setItem('enrolledEvents', JSON.stringify(enrolledEvents));
        }
      }
      
      // Refresh the enrollments data after toggling
      try {
        const enrollmentsRes = await eventsAPI.getUserEnrollments();
        const enrollmentsData = Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data : [];
        setUserEnrollments(enrollmentsData);
      } catch (err) {
        console.warn('Could not fetch user enrollments, using local data instead');
        // Force UI refresh
        setFilter(prev => prev);
      }
      
    } catch (error) {
      // If there's an error but it mentions "already enrolled", handle it gracefully
      if (error.response?.data?.message === 'User is already enrolled in this event') {
        // Update local storage to reflect enrollment
        const enrolledEvents = JSON.parse(localStorage.getItem('enrolledEvents') || '[]');
        if (!enrolledEvents.includes(parseInt(eventId))) {
          enrolledEvents.push(parseInt(eventId));
          localStorage.setItem('enrolledEvents', JSON.stringify(enrolledEvents));
        }
        // Force UI refresh
        setFilter(prev => prev);
        return;
      }
      
      const errorMessage = error.response?.data?.message || 'Error al cambiar inscripción';
      alert(errorMessage);
    }
  };

  // Handler for applying filters
  const applyFilters = (e) => {
    e.preventDefault();
    fetchEvents();
    setShowFilterPopup(false); // Close the popup after applying filters
  };

  // Handler for clearing all filters
  const clearFilters = () => {
    setNameFilter('');
    setTagFilter('');
    setDateFilter('');
    // Fetch without filters
    fetchEvents({});
    setShowFilterPopup(false); // Close the popup after clearing filters
  };

  if (isLoading) return <div className="loading">Cargando eventos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Eventos</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowFilterPopup(prev => !prev)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              position: 'relative'
            }}
          >
            <Filter size={16} />
            Filtros
            {isFiltering && (
              <span style={{ 
                position: 'absolute', 
                top: '-5px', 
                right: '-5px', 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                background: '#3B82F6' 
              }}></span>
            )}
          </button>
          
          <Link to="/events/new">
            <button className="btn btn-primary">Crear Nuevo Evento</button>
          </Link>
        </div>
      </div>

      {/* Filter popup */}
      {showFilterPopup && (
        <div style={{
          position: 'absolute',
          top: '70px',
          right: '0',
          width: '400px',
          maxWidth: '100%',
          background: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          zIndex: 100,
          border: '1px solid #e5e7eb',
          padding: '1.5rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Filtros de búsqueda</h3>
            <button 
              onClick={() => setShowFilterPopup(false)}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                color: '#6b7280',
                display: 'flex',
                padding: '0.25rem'
              }}
            >
              <X size={18} />
            </button>
          </div>
          
          <form onSubmit={applyFilters}>
            <div className="form-group" style={{ margin: '0 0 1rem 0' }}>
              <label htmlFor="nameFilter" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Search size={16} />
                Nombre del evento
              </label>
              <input
                type="text"
                id="nameFilter"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="Buscar por nombre..."
                style={{ padding: '0.5rem' }}
              />
            </div>
            
            <div className="form-group" style={{ margin: '0 0 1rem 0' }}>
              <label htmlFor="tagFilter" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Tag size={16} />
                Etiqueta
              </label>
              <input
                type="text"
                id="tagFilter"
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                placeholder="Filtrar por etiqueta..."
                style={{ padding: '0.5rem' }}
              />
            </div>
            
            <div className="form-group" style={{ margin: '0 0 1.5rem 0' }}>
              <label htmlFor="dateFilter" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Calendar size={16} />
                Fecha de inicio
              </label>
              <input
                type="date"
                id="dateFilter"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ padding: '0.5rem' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={clearFilters}
                className="btn btn-secondary"
                disabled={!nameFilter && !tagFilter && !dateFilter}
              >
                <X size={16} />
                Limpiar
              </button>
              
              <button type="submit" className="btn btn-primary">
                <Search size={16} />
                Aplicar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter notification */}
      {isFiltering && (
        <div style={{ 
          padding: '0.75rem 1rem', 
          background: '#EFF6FF', 
          borderRadius: '0.5rem', 
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontWeight: '500', color: '#1E40AF' }}>
              Resultados filtrados
            </span>
            <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#3B82F6' }}>
              {filteredEvents.length} eventos encontrados
            </span>
          </div>
          <button 
            onClick={clearFilters}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              color: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.875rem'
            }}
          >
            <X size={14} />
            Quitar filtros
          </button>
        </div>
      )}

      {paginatedEvents.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', padding: '2rem' }}>
            No hay eventos disponibles con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <div className="grid grid-2">
          {paginatedEvents.map(event => {
            const isMyEvent = event.id_creator_user === user.id;
            const eventDate = new Date(event.start_date);
            const isPast = eventDate < new Date();
            // Check if user is enrolled using the helper function
            const isEnrolled = isUserEnrolledInEvent(event.id);
            
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
                
                {/* Display tags if they exist */}
                {event.tags && event.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    {event.tags.map((tag, index) => (
                      <span 
                        key={index}
                        style={{ 
                          background: '#f3f4f6', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          color: '#4b5563',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
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
                    isEnrolled ? (
                      <button 
                        className="btn"
                        style={{ 
                          background: '#10b981', 
                          color: 'white',
                          borderColor: '#047857'
                        }}
                        onClick={() => handleEnrollToggle(event.id, true)}
                      >
                        <UserX size={14} />
                        Cancelar Inscripción
                      </button>
                    ) : (
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleEnrollToggle(event.id, false)}
                      >
                        <UserCheck size={14} />
                        Inscribirse
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination controls - Moved to bottom */}
      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          margin: '2rem 0',
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem',
          position: 'sticky',
          bottom: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'
        }}>
          <button 
            className="btn btn-secondary"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <ChevronLeft size={16} />
            Anterior
          </button>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '0 1rem',
            fontWeight: 500
          }}>
            Página {currentPage} de {totalPages}
          </div>
          
          <button 
            className="btn btn-secondary"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Events;