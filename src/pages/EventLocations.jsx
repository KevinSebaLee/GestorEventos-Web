import React, { useState, useEffect } from 'react';
import { eventLocationsAPI } from '../services/api';
import { MapPin, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';

const EventLocations = () => {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    full_address: '',
    max_capacity: 100,
    latitude: '',
    longitude: '',
    id_location: 1
  });

  const fetchLocations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await eventLocationsAPI.getAll();
      setLocations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('Error al cargar las ubicaciones');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.name || !formData.full_address || !formData.latitude || !formData.longitude) {
        throw new Error('Por favor completa todos los campos obligatorios');
      }

      const locationData = {
        ...formData,
        max_capacity: Number(formData.max_capacity),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        id_location: Number(formData.id_location || 1)
      };

      await eventLocationsAPI.create(locationData);
      setFormData({
        name: '',
        full_address: '',
        max_capacity: 100,
        latitude: '',
        longitude: '',
        id_location: 1
      });
      setShowForm(false);
      fetchLocations();
    } catch (err) {
      console.error('Error creating location:', err);
      setError(err.message || 'Error al crear la ubicación. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Ubicaciones para Eventos</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : (
            <>
              <Plus size={16} />
              Nueva Ubicación
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="error mb-4">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {showForm && (
        <div className="card mb-4">
          <h2 className="mb-4">
            <MapPin size={20} className="mr-2" />
            Agregar Nueva Ubicación
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label htmlFor="name">Nombre *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Auditorio Principal"
                  required
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="max_capacity">Capacidad Máxima *</label>
                <input
                  type="number"
                  id="max_capacity"
                  name="max_capacity"
                  value={formData.max_capacity}
                  onChange={handleChange}
                  min="1"
                  required
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="full_address">Dirección Completa *</label>
              <input
                type="text"
                id="full_address"
                name="full_address"
                value={formData.full_address}
                onChange={handleChange}
                placeholder="Ej: Av. Siempreviva 742, Springfield"
                required
                className="form-control"
              />
            </div>
            
            <div className="grid grid-2">
              <div className="form-group">
                <label htmlFor="latitude">Latitud *</label>
                <input
                  type="text"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="Ej: -34.603722"
                  required
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="longitude">Longitud *</label>
                <input
                  type="text"
                  id="longitude"
                  name="longitude"
                  onChange={handleChange}
                  value={formData.longitude}
                  placeholder="Ej: -58.381592"
                  required
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : 'Guardar Ubicación'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && !showForm ? (
        <div className="loading">Cargando ubicaciones...</div>
      ) : locations.length === 0 ? (
        <div className="card text-center p-4">
          <p>No hay ubicaciones disponibles.</p>
          <button 
            className="btn btn-primary mt-2" 
            onClick={() => setShowForm(true)}
          >
            <Plus size={16} />
            Agregar Primera Ubicación
          </button>
        </div>
      ) : (
        <div className="grid grid-2">
          {locations.map(location => (
            <div key={location.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3>{location.name}</h3>
              </div>
              
              <p><strong>Dirección:</strong> {location.full_address}</p>
              <p><strong>Capacidad Máxima:</strong> {location.max_capacity} personas</p>
              <p>
                <strong>Coordenadas:</strong> {location.latitude}, {location.longitude}
              </p>
              
              <div className="mt-4">
                <a 
                  href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  <MapPin size={16} />
                  Ver en Mapa
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventLocations;