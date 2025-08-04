import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI, eventLocationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, Clock, DollarSign, Info, Save, Users, AlertCircle, ArrowLeft } from 'lucide-react';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    id_event_categoria: 1,
    id_event_location: '',
    start_date: '',
    duration_in_minutes: 60,
    price: 0,
    enabled_for_enrollment: false,
    max_assistance: 50
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch event details
        const eventRes = await eventsAPI.getById(id);
        const eventData = Array.isArray(eventRes.data) ? eventRes.data[0] : eventRes.data;
        
        if (!eventData) {
          throw new Error('Evento no encontrado');
        }
        
        // Check if user is the owner
        if (eventData.id_creator_user !== user.id) {
          navigate(`/events/${id}`);
          return;
        }
        
        // Format date for input
        const startDate = new Date(eventData.start_date);
        const formattedDate = startDate.toISOString().slice(0, 16);
        
        // Convert enabled_for_enrollment to boolean for form display
        // This is a key fix - properly convert the database value to a boolean
        const enrollmentEnabled = eventData.enabled_for_enrollment === 1 || 
                                  eventData.enabled_for_enrollment === true || 
                                  eventData.enabled_for_enrollment === '1';
        
        console.log('Original enabled_for_enrollment value:', eventData.enabled_for_enrollment);
        console.log('Converted to boolean:', enrollmentEnabled);
        
        setFormData({
          name: eventData.evento_nombre || eventData.name || '',
          description: eventData.description || '',
          id_event_categoria: eventData.id_event_category || eventData.id_event_categoria || 1,
          id_event_location: eventData.id_event_location || eventData.ubicacion_id || '',
          start_date: formattedDate,
          duration_in_minutes: eventData.duration_in_minutes || 60,
          price: eventData.price || 0,
          enabled_for_enrollment: enrollmentEnabled,
          max_assistance: eventData.max_assistance || 50
        });
        
        // Fetch locations
        const locationsRes = await eventLocationsAPI.getAll();
        setLocations(Array.isArray(locationsRes.data) ? locationsRes.data : []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Error al cargar los datos del evento');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, user.id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // For debugging
    if (name === 'enabled_for_enrollment') {
      console.log('Checkbox changed to:', checked);
    }
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Validate form
      if (!formData.name || !formData.description || !formData.id_event_location || !formData.start_date) {
        throw new Error('Por favor completa todos los campos obligatorios');
      }

      // Format for the API
      const eventData = {
        name: formData.name,
        description: formData.description,
        id_event_category: Number(formData.id_event_categoria),
        id_event_location: Number(formData.id_event_location),
        start_date: formData.start_date,
        duration_in_minutes: Number(formData.duration_in_minutes),
        price: Number(formData.price),
        max_assistance: Number(formData.max_assistance),
        // Explicitly convert boolean to numeric (0/1) for the backend
        enabled_for_enrollment: formData.enabled_for_enrollment ? 1 : 0 
      };

      console.log('Sending event data with enrollment status:', eventData.enabled_for_enrollment);
      
      await eventsAPI.update(id, eventData);
      
      // Navigate to the event detail page
      navigate(`/events/${id}`);
    } catch (err) {
      console.error('Error updating event:', err);
      setError(err.message || 'Error al actualizar el evento. Por favor intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="loading">Cargando datos del evento...</div>;

  return (
    <div className="fade-in">
      <button 
        onClick={() => navigate(`/events/${id}`)} 
        className="btn btn-sm btn-secondary mb-4"
      >
        <ArrowLeft size={16} />
        Volver al Evento
      </button>
      
      <h1 className="mb-4">Editar Evento</h1>
      
      <div className="card">
        {error && (
          <div className="error mb-4">
            <AlertCircle size={20} />
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Other form fields remain the same */}
          
          {/* Make the enrollment checkbox more prominent */}
          <div className="form-group" style={{ 
            padding: '1rem', 
            background: '#f9fafb', 
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            marginBottom: '1.5rem'
          }}>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enabled_for_enrollment"
                name="enabled_for_enrollment"
                checked={formData.enabled_for_enrollment}
                onChange={handleChange}
                style={{ 
                  width: '1.25rem', 
                  height: '1.25rem',
                  accentColor: '#6366f1'
                }}
              />
              <label htmlFor="enabled_for_enrollment" style={{
                fontSize: '1rem',
                fontWeight: '500',
                color: '#374151'
              }}>
                Habilitar inscripciones para este evento
              </label>
            </div>
            <p style={{ 
              marginTop: '0.5rem', 
              fontSize: '0.875rem', 
              color: '#6b7280',
              marginLeft: '1.75rem'
            }}>
              Si esta opción está activada, los usuarios podrán inscribirse al evento.
            </p>
          </div>
          
          {/* Rest of your form */}
          
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={() => navigate(`/events/${id}`)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="loading-spinner"></div>
                  Guardando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save size={18} />
                  Guardar Cambios
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;