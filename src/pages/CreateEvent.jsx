import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, eventLocationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, Clock, DollarSign, Info, Save, Users, AlertCircle } from 'lucide-react';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    id_event_categoria: 1,  // Default category
    id_event_location: '',
    start_date: '',
    duration_in_minutes: 60,
    price: 0,
    enabled_for_enrollment: true,
    max_assistance: 50
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await eventLocationsAPI.getAll();
        setLocations(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Error al cargar las ubicaciones');
      }
    };

    fetchLocations();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.name || !formData.description || !formData.id_event_location || !formData.start_date) {
        throw new Error('Por favor completa todos los campos obligatorios');
      }

      // Format date if needed
      const eventData = {
        ...formData,
        id_event_category: Number(formData.id_event_categoria),
        id_event_location: Number(formData.id_event_location),
        duration_in_minutes: Number(formData.duration_in_minutes),
        price: Number(formData.price),
        max_assistance: Number(formData.max_assistance),
        enabled_for_enrollment: formData.enabled_for_enrollment ? 1 : 0
      };

      const response = await eventsAPI.create(eventData);
      
      // Navigate to the event detail page
      navigate(`/events/${response.data.id}`);
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err.message || 'Error al crear el evento. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <h1 className="mb-4">Crear Nuevo Evento</h1>
      
      <div className="card">
        {error && (
          <div className="error mb-4">
            <AlertCircle size={20} />
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label htmlFor="name" className="flex items-center gap-2">
                <Info size={16} />
                Nombre del Evento *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Conferencia de Tecnología"
                required
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="id_event_location" className="flex items-center gap-2">
                <MapPin size={16} />
                Ubicación *
              </label>
              <select
                id="id_event_location"
                name="id_event_location"
                value={formData.id_event_location}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="">Selecciona una ubicación</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description" className="flex items-center gap-2">
              <Info size={16} />
              Descripción *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción detallada del evento"
              required
              rows={4}
              className="form-control"
            />
          </div>
          
          <div className="grid grid-2">
            <div className="form-group">
              <label htmlFor="start_date" className="flex items-center gap-2">
                <Calendar size={16} />
                Fecha y Hora de Inicio *
              </label>
              <input
                type="datetime-local"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="duration_in_minutes" className="flex items-center gap-2">
                <Clock size={16} />
                Duración (minutos)
              </label>
              <input
                type="number"
                id="duration_in_minutes"
                name="duration_in_minutes"
                value={formData.duration_in_minutes}
                onChange={handleChange}
                min="1"
                className="form-control"
              />
            </div>
          </div>
          
          <div className="grid grid-2">
            <div className="form-group">
              <label htmlFor="price" className="flex items-center gap-2">
                <DollarSign size={16} />
                Precio
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="max_assistance" className="flex items-center gap-2">
                <Users size={16} />
                Capacidad Máxima
              </label>
              <input
                type="number"
                id="max_assistance"
                name="max_assistance"
                value={formData.max_assistance}
                onChange={handleChange}
                min="1"
                className="form-control"
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enabled_for_enrollment"
                name="enabled_for_enrollment"
                checked={formData.enabled_for_enrollment}
                onChange={handleChange}
              />
              <label htmlFor="enabled_for_enrollment">
                Habilitar inscripciones
              </label>
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={() => navigate('/events')}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="loading-spinner"></div>
                  Creando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save size={18} />
                  Crear Evento
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;