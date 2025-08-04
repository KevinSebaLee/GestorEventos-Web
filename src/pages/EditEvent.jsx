import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { eventsAPI, eventLocationsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Info,
  Save,
  Users,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    id_event_categoria: 1,
    id_event_location: "",
    start_date: "",
    duration_in_minutes: 60,
    price: 0,
    enabled_for_enrollment: false,
    max_assistance: 50,
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch event details
        const eventRes = await eventsAPI.getById(id);
        const eventData = Array.isArray(eventRes.data)
          ? eventRes.data[0]
          : eventRes.data;

        if (!eventData) {
          throw new Error("Evento no encontrado");
        }

        // Check if user is the owner
        if (eventData.id_creator_user !== user.id) {
          navigate(`/events/${id}`);
          return;
        }

        // Format date for input
        const startDate = new Date(eventData.start_date);
        const formattedDate = startDate.toISOString().slice(0, 16);

        // CRITICAL FIX: Properly determine if enrollments are enabled
        // The issue was here - we need to properly check the enabled_for_enrollment value
        let enrollmentEnabled = false;

        // Debug the actual value to understand what we're dealing with
        console.log(
          "Raw enabled_for_enrollment value:",
          eventData.enabled_for_enrollment
        );
        console.log(
          "Type of enabled_for_enrollment:",
          typeof eventData.enabled_for_enrollment
        );

        // Handle all possible formats of "true" values
        if (
          eventData.enabled_for_enrollment === 1 ||
          eventData.enabled_for_enrollment === "1" ||
          eventData.enabled_for_enrollment === true ||
          eventData.enabled_for_enrollment === "true" ||
          eventData.enabled_for_enrollment === "yes" ||
          eventData.enabled_for_enrollment === "on"
        ) {
          enrollmentEnabled = true;
        }

        console.log("Enrollment should be enabled:", enrollmentEnabled);

        setFormData({
          name: eventData.evento_nombre || eventData.name || "",
          description: eventData.description || "",
          id_event_categoria:
            eventData.id_event_category || eventData.id_event_categoria || 1,
          id_event_location:
            eventData.id_event_location || eventData.ubicacion_id || "",
          start_date: formattedDate,
          duration_in_minutes: eventData.duration_in_minutes || 60,
          price: eventData.price || 0,
          enabled_for_enrollment: enrollmentEnabled, // Set with our properly determined value
          max_assistance: eventData.max_assistance || 50,
        });

        // Log what we're setting to verify
        console.log(
          "Setting enabled_for_enrollment in form to:",
          enrollmentEnabled
        );

        // Fetch locations
        const locationsRes = await eventLocationsAPI.getAll();
        setLocations(Array.isArray(locationsRes.data) ? locationsRes.data : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Error al cargar los datos del evento");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, user.id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "enabled_for_enrollment") {
      console.log("Checkbox changed to:", checked);
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Validate form
      if (
        !formData.name ||
        !formData.description ||
        !formData.id_event_location ||
        !formData.start_date
      ) {
        throw new Error("Por favor completa todos los campos obligatorios");
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
        enabled_for_enrollment: formData.enabled_for_enrollment ? 1 : 0,
      };

      console.log(
        "Sending event data with enrollment status:",
        eventData.enabled_for_enrollment
      );

      await eventsAPI.update(id, eventData);

      // Navigate to the event detail page
      navigate(`/events/${id}`);
    } catch (err) {
      console.error("Error updating event:", err);
      setError(
        err.message ||
          "Error al actualizar el evento. Por favor intenta de nuevo."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return <div className="loading">Cargando datos del evento...</div>;

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
              <label
                htmlFor="id_event_location"
                className="flex items-center gap-2"
              >
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
                {locations.map((location) => (
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
              <label
                htmlFor="duration_in_minutes"
                className="flex items-center gap-2"
              >
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
              <label
                htmlFor="max_assistance"
                className="flex items-center gap-2"
              >
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

          {/* Enrollment checkbox with additional debug help */}
          <div
            className="form-group"
            style={{
              padding: "1.25rem",
              background: formData.enabled_for_enrollment
                ? "#ecfdf5"
                : "#f9fafb",
              borderRadius: "0.75rem",
              border: formData.enabled_for_enrollment
                ? "2px solid #10b981"
                : "1px solid #e5e7eb",
              marginBottom: "1.5rem",
              transition: "all 0.2s ease",
            }}
          >
            <div className="flex items-center gap-3">
              <div style={{ position: "relative" }}>
                <input
                  type="checkbox"
                  id="enabled_for_enrollment"
                  name="enabled_for_enrollment"
                  checked={formData.enabled_for_enrollment}
                  onChange={handleChange}
                  style={{
                    width: "1.35rem",
                    height: "1.35rem",
                    borderRadius: "0.25rem",
                    accentColor: "#10b981",
                    cursor: "pointer",
                    border: formData.enabled_for_enrollment
                      ? "2px solid #10b981"
                      : "1px solid #d1d5db",
                  }}
                />
              </div>

              <label
                htmlFor="enabled_for_enrollment"
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  color: formData.enabled_for_enrollment
                    ? "#047857"
                    : "#374151",
                  cursor: "pointer",
                }}
              >
                Habilitar inscripciones para este evento
                {formData.enabled_for_enrollment && " ✓"}
              </label>
            </div>
            <p
              style={{
                marginTop: "0.5rem",
                fontSize: "0.875rem",
                color: formData.enabled_for_enrollment ? "#047857" : "#6b7280",
                marginLeft: "1.75rem",
              }}
            >
              {formData.enabled_for_enrollment
                ? "✓ Los usuarios podrán inscribirse a este evento"
                : "Si esta opción está activada, los usuarios podrán inscribirse al evento."}
            </p>
          </div>

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
