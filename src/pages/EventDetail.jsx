import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { eventsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
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
  AlertCircle,
} from "lucide-react";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventError, setEventError] = useState(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState(null);
  const [isUserEnrolled, setIsUserEnrolled] = useState(false);
  const [allEnrollments, setAllEnrollments] = useState([]);
  const [allEnrollmentsLoading, setAllEnrollmentsLoading] = useState(true);

  // Generate mock participant data for demo purposes
  const generateMockParticipants = (includeCurrentUser = false) => {
    console.log("Generating mock participants data");

    const mockParticipants = [
      {
        user_id: 101,
        id_user: 101,
        first_name: "María",
        last_name: "González",
        username: "maria.gonzalez",
        attended: 1,
        description: "Inscripción confirmada",
        observations: "Asistió puntualmente",
        rating: 5,
        registration_date_time: "2023-07-15T14:30:00Z",
      },
      {
        user_id: 102,
        id_user: 102,
        first_name: "Carlos",
        last_name: "Rodríguez",
        username: "carlos.rodriguez",
        attended: 0,
        description: "Inscripción pendiente",
        observations: "Primera vez en el evento",
        rating: 4,
        registration_date_time: "2023-07-16T10:15:00Z",
      },
      {
        user_id: 103,
        id_user: 103,
        first_name: "Laura",
        last_name: "Martínez",
        username: "laura.martinez",
        attended: 0,
        description: "Inscripción a través de la web",
        observations: "Solicitó información adicional",
        rating: 4,
        registration_date_time: "2023-07-17T09:45:00Z",
      },
      {
        user_id: 104,
        id_user: 104,
        first_name: "Javier",
        last_name: "López",
        username: "javier.lopez",
        attended: 1,
        description: "Inscripción grupal",
        observations: "Llegó con antelación",
        rating: 5,
        registration_date_time: "2023-07-18T16:20:00Z",
      },
      {
        user_id: 105,
        id_user: 105,
        first_name: "Ana",
        last_name: "García",
        username: "ana.garcia",
        attended: 1,
        description: "Inscripción anticipada",
        observations: "Participante frecuente",
        rating: 5,
        registration_date_time: "2023-07-19T11:30:00Z",
      },
    ];

    // Add current user if required
    if (includeCurrentUser && user) {
      const currentUserEntry = {
        user_id: user.id,
        id_user: user.id,
        first_name: user.firstName || "Usuario",
        last_name: user.lastName || "Actual",
        username: user.username || user.email || "usuario",
        attended: 0,
        description: "Inscripción al evento",
        observations: "Usuario actual",
        rating: 5,
        registration_date_time: new Date().toISOString(),
      };

      // Add current user to the beginning of the array
      return [currentUserEntry, ...mockParticipants];
    }

    return mockParticipants;
  };

  // Check if user is enrolled in this event
  const checkUserEnrollment = () => {
    try {
      // Check localStorage for enrollment status
      const enrolledEvents = JSON.parse(
        localStorage.getItem("enrolledEvents") || "[]"
      );
      const enrolled = enrolledEvents.includes(parseInt(id));

      console.log(
        `User enrollment check for event ${id}:`,
        enrolled ? "ENROLLED" : "NOT ENROLLED"
      );
      setIsUserEnrolled(enrolled);

      return enrolled;
    } catch (err) {
      console.error("Error checking user enrollment:", err);
      return false;
    }
  };

  // Update localStorage with enrollment status
  const updateLocalEnrollment = (eventId, enrolled) => {
    try {
      const eventIdInt = parseInt(eventId);
      let enrolledEvents = JSON.parse(
        localStorage.getItem("enrolledEvents") || "[]"
      );

      if (enrolled) {
        if (!enrolledEvents.includes(eventIdInt)) {
          enrolledEvents.push(eventIdInt);
        }
      } else {
        enrolledEvents = enrolledEvents.filter((id) => id !== eventIdInt);
      }

      localStorage.setItem("enrolledEvents", JSON.stringify(enrolledEvents));
      console.log(
        `Updated localStorage: User is ${
          enrolled ? "now enrolled" : "no longer enrolled"
        } in event ${eventId}`
      );
    } catch (err) {
      console.error("Error updating local enrollment:", err);
    }
  };

  useEffect(() => {
    // Modify the fetchEventData function in the useEffect hook

    const fetchEventData = async () => {
      setEventLoading(true);
      setEventError(null);
      setAllEnrollmentsLoading(true);

      try {
        // Fetch event details
        const res = await eventsAPI.getById(id);
        const eventData = Array.isArray(res.data) ? res.data[0] : res.data;
        setEvent(eventData);
        console.log("Event data loaded:", eventData);

        // Check if user is enrolled in this event
        const isEnrolled = checkUserEnrollment();

        // IMPORTANT: Fetch ALL enrollments for this event
        try {
          const enrollmentsRes = await eventsAPI.getAllEnrollments(id);
          console.log("Enrollments data:", enrollmentsRes.data);

          // Make sure we're handling the data correctly
          const enrollmentsData = Array.isArray(enrollmentsRes.data)
            ? enrollmentsRes.data
            : enrollmentsRes.data?.enrollments || [];

          setAllEnrollments(enrollmentsData);
        } catch (err) {
          console.error("Error fetching enrollments:", err);
          setAllEnrollments([]);
        }
      } catch (err) {
        console.error("Error loading event:", err);
        setEventError("Error al cargar el evento");
      } finally {
        setEventLoading(false);
        setAllEnrollmentsLoading(false);
      }
    };

    if (user && id) {
      fetchEventData();
    }
  }, [id, user]);

  const handleDeleteEvent = async () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar este evento? Esta acción eliminará también todas las etiquetas e inscripciones asociadas."
      )
    ) {
      try {
        setEventLoading(true); // Show loading indicator
        const response = await eventsAPI.delete(id);
        console.log("Delete response:", response);
        navigate("/events", {
          state: { message: "Evento eliminado exitosamente" },
        });
      } catch (error) {
        console.error("Error details:", error);

        // Show a more specific error message
        let errorMessage = "Error al eliminar el evento";
        if (error.response && error.response.data) {
          errorMessage =
            error.response.data.message ||
            error.response.data.error ||
            errorMessage;
        }

        alert(`${errorMessage}. Por favor intente nuevamente.`);
        setEventLoading(false);
      }
    }
  };

  const handleEnrollmentToggle = async () => {
    setEnrollmentLoading(true);
    setEnrollmentError(null);

    try {
      if (isUserEnrolled) {
        // Unenroll
        try {
          await eventsAPI.unenroll(id);

          // Update UI state
          setIsUserEnrolled(false);

          // Remove user from enrollments list
          setAllEnrollments(
            allEnrollments.filter(
              (e) => e.id_user !== user.id && e.user_id !== user.id
            )
          );

          // Update local storage
          updateLocalEnrollment(id, false);
        } catch (error) {
          console.error("Error unenrolling:", error);
          // Even if the API fails, update the UI state
          setIsUserEnrolled(false);
          updateLocalEnrollment(id, false);

          // Remove user from the participants list
          setAllEnrollments(
            allEnrollments.filter(
              (e) => e.id_user !== user.id && e.user_id !== user.id
            )
          );
        }
      } else {
        // Enroll
        try {
          const enrollmentData = {
            description: "Inscripción al evento desde la aplicación web",
            attended: 0,
            observations: "Inscripción realizada desde la interfaz web",
            rating: 5,
          };

          await eventsAPI.enroll(id, enrollmentData);

          // Update UI state
          setIsUserEnrolled(true);

          // Update local storage
          updateLocalEnrollment(id, true);

          // Add user to enrollments list
          const newEnrollment = {
            user_id: user.id,
            id_user: user.id,
            first_name: user.firstName || "",
            last_name: user.lastName || "",
            username: user.username || user.email,
            attended: 0,
            description: enrollmentData.description,
            observations: enrollmentData.observations,
            rating: enrollmentData.rating,
            registration_date_time: new Date().toISOString(),
          };

          setAllEnrollments((prev) => [newEnrollment, ...prev]);
        } catch (error) {
          console.error("Enrollment API error:", error);

          // If the error message indicates user is already enrolled, update UI anyway
          if (
            error.response?.data?.message ===
            "User is already enrolled in this event"
          ) {
            setIsUserEnrolled(true);
            updateLocalEnrollment(id, true);

            // Add user to the participants list anyway
            const newEnrollment = {
              user_id: user.id,
              id_user: user.id,
              first_name: user.firstName || "",
              last_name: user.lastName || "",
              username: user.username || user.email,
              attended: 0,
              description: "Inscripción al evento",
              observations: "Usuario actual",
              rating: 5,
              registration_date_time: new Date().toISOString(),
            };

            setAllEnrollments((prev) => [newEnrollment, ...prev]);
            return;
          }

          // For other errors, show them to the user
          const errorMsg =
            error.response?.data?.message || "Error al inscribirse al evento";
          setEnrollmentError(errorMsg);
        }
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      setEnrollmentError(error.message || "Error al cambiar inscripción");
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

  // Date formatting helper
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);

      // Format as YYYY-MM-DD HH:MM:SS
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      const hours = String(date.getUTCHours()).padStart(2, "0");
      const minutes = String(date.getUTCMinutes()).padStart(2, "0");
      const seconds = String(date.getUTCSeconds()).padStart(2, "0");

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateString;
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1>{event.evento_nombre || event.name || "Evento sin nombre"}</h1>
          {isPast && (
            <span style={{ color: "#ff4444", fontSize: "0.9rem" }}>
              Evento pasado
            </span>
          )}
        </div>

        {isMyEvent && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link to={`/events/${id}/edit`}>
              <button className="btn btn-secondary">
                <Edit size={16} />
                Editar
              </button>
            </Link>
            <button
              className="btn"
              style={{ color: "#ff4444", borderColor: "#ff4444" }}
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

          <div style={{ marginBottom: "1rem" }}>
            <h3>Descripción</h3>
            <p>{event.description || "No hay descripción disponible"}</p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <Calendar size={16} />
              <strong>Fecha y Hora:</strong>
            </div>
            <p>{eventDate.toLocaleString()}</p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <MapPin size={16} />
              <strong>Ubicación:</strong>
            </div>
            <p>
              {event.ubicacion_nombre ||
                event.location_name ||
                "Ubicación no especificada"}
            </p>
            {event.latitude && event.longitude && (
              <p style={{ fontSize: "0.9rem", color: "#666" }}>
                Coordenadas: {event.latitude}, {event.longitude}
              </p>
            )}
          </div>

          {event.price !== null &&
            event.price !== undefined &&
            event.price !== "" && (
              <div style={{ marginBottom: "1rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <DollarSign size={16} />
                  <strong>Precio:</strong>
                </div>
                <p>${parseFloat(event.price).toFixed(2)}</p>
              </div>
            )}

          <div style={{ marginBottom: "1rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <User size={16} />
              <strong>Organizador:</strong>
            </div>
            <p>
              {event.first_name && event.last_name
                ? `${event.first_name} ${event.last_name}`
                : "Organizador no especificado"}
            </p>
            {event.username && (
              <p style={{ fontSize: "0.9rem", color: "#666" }}>
                {event.username}
              </p>
            )}
          </div>

          {enrollmentError && (
            <div className="error mb-4">
              <AlertCircle size={16} />
              {enrollmentError}
            </div>
          )}

          {!isPast && !isMyEvent && (
            <button
              className={`btn ${
                isUserEnrolled ? "btn-success" : "btn-primary"
              }`}
              onClick={handleEnrollmentToggle}
              disabled={enrollmentLoading}
              style={{
                width: "100%",
                background: isUserEnrolled ? "#10b981" : undefined,
                borderColor: isUserEnrolled ? "#047857" : undefined,
                color: "white",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.75rem 0",
                borderRadius: "0.5rem",
                fontWeight: "600",
              }}
            >
              {enrollmentLoading ? (
                <div className="flex items-center gap-2">
                  <div className="loading-spinner"></div>
                  Procesando...
                </div>
              ) : isUserEnrolled ? (
                <>
                  <UserX size={20} />
                  Cancelar inscripción
                </>
              ) : (
                <>
                  <UserCheck size={20} />
                  Inscribirme al evento
                </>
              )}
            </button>
          )}
        </div>

        <div className="card">
          <h2>
            <Users size={20} style={{ marginRight: "0.5rem" }} />
            Participantes del Evento
            <span
              style={{
                marginLeft: "0.5rem",
                fontSize: "0.875rem",
                color: "#6b7280",
                fontWeight: "normal",
              }}
            >
              {`(${allEnrollments.length} ${
                allEnrollments.length === 1 ? "participante" : "participantes"
              })`}
            </span>
          </h2>

          {allEnrollmentsLoading ? (
            <div className="loading">Cargando participantes...</div>
          ) : allEnrollments && allEnrollments.length > 0 ? (
            <div>
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#f0f9ff",
                  border: "2px solid #0ea5e9",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  textAlign: "center",
                }}
              >
                <h3 style={{ color: "#0ea5e9", margin: "0 0 0.5rem 0" }}>
                  {allEnrollments.length}{" "}
                  {allEnrollments.length === 1
                    ? "Participante Inscrito"
                    : "Participantes Inscritos"}
                </h3>

                {event.max_assistance && (
                  <div style={{ fontSize: "0.9rem", color: "#0369a1" }}>
                    {allEnrollments.length} de {event.max_assistance} plazas
                    ocupadas
                    <div
                      style={{
                        width: "100%",
                        height: "6px",
                        backgroundColor: "#e0f2fe",
                        borderRadius: "3px",
                        marginTop: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(
                            100,
                            (allEnrollments.length / event.max_assistance) * 100
                          )}%`,
                          height: "100%",
                          backgroundColor: "#0ea5e9",
                          borderRadius: "3px",
                          transition: "width 0.5s ease-in-out",
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {allEnrollments.map((enrollment, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "1rem",
                      marginBottom: "0.75rem",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      backgroundColor:
                        enrollment.user_id === user.id ||
                        enrollment.id_user === user.id
                          ? "#f0f9ff"
                          : "#f9fafb",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      cursor: "default",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <div>
                        <strong
                          style={{ color: "#1f2937", fontSize: "1.1rem" }}
                        >
                          {enrollment.first_name} {enrollment.last_name}
                        </strong>
                        {(enrollment.user_id === user.id ||
                          enrollment.id_user === user.id) && (
                          <span
                            style={{
                              marginLeft: "0.5rem",
                              backgroundColor: "#0ea5e9",
                              color: "white",
                              padding: "0.2rem 0.6rem",
                              borderRadius: "12px",
                              fontSize: "0.7rem",
                              fontWeight: "600",
                            }}
                          >
                            Tú
                          </span>
                        )}

                        {enrollment.is_creator && (
                          <span
                            style={{
                              marginLeft: "0.5rem",
                              backgroundColor: "#6366f1",
                              color: "white",
                              padding: "0.2rem 0.6rem",
                              borderRadius: "12px",
                              fontSize: "0.7rem",
                              fontWeight: "600",
                            }}
                          >
                            Creador
                          </span>
                        )}
                        <p
                          style={{
                            fontSize: "0.875rem",
                            color: "#6b7280",
                            margin: "0.25rem 0 0 0",
                          }}
                        >
                          @{enrollment.username}
                        </p>
                      </div>
                      <span
                        style={{
                          backgroundColor: enrollment.attended
                            ? "#10b981"
                            : "#f59e0b",
                          color: "white",
                          padding: "0.3rem 0.8rem",
                          borderRadius: "14px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                        }}
                      >
                        {enrollment.attended ? "Asistió" : "Inscrito"}
                      </span>
                    </div>

                    <div
                      style={{
                        borderTop: "1px solid #e5e7eb",
                        paddingTop: "0.75rem",
                        fontSize: "0.875rem",
                        color: "#6b7280",
                      }}
                    >
                      {enrollment.description && (
                        <div style={{ marginBottom: "0.5rem" }}>
                          <strong>Descripción:</strong> {enrollment.description}
                        </div>
                      )}
                      {enrollment.observations && (
                        <div style={{ marginBottom: "0.5rem" }}>
                          <strong>Observaciones:</strong>{" "}
                          {enrollment.observations}
                        </div>
                      )}
                      {enrollment.rating && (
                        <div style={{ marginBottom: "0.5rem" }}>
                          <strong>Valoración:</strong>
                          <span style={{ marginLeft: "0.5rem" }}>
                            {"★".repeat(Math.min(enrollment.rating, 5))}
                            {"☆".repeat(Math.max(0, 5 - enrollment.rating))}
                            <span
                              style={{
                                marginLeft: "0.25rem",
                                color: "#9ca3af",
                              }}
                            >
                              ({enrollment.rating}/5)
                            </span>
                          </span>
                        </div>
                      )}
                      {enrollment.registration_date_time && (
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#9ca3af",
                            marginTop: "0.5rem",
                          }}
                        >
                          <strong>Inscrito el:</strong>{" "}
                          {formatDate(enrollment.registration_date_time)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: "2rem",
                backgroundColor: "#fef2f2",
                border: "2px solid #f87171",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <Users size={18} style={{ color: "#dc2626" }} />
                <strong style={{ color: "#dc2626" }}>
                  No hay participantes inscritos
                </strong>
              </div>
              <p
                style={{
                  margin: "0.5rem 0 0 0",
                  fontSize: "0.875rem",
                  color: "#7f1d1d",
                }}
              >
                Este evento aún no tiene participantes inscritos
              </p>
              {!isMyEvent && !isPast && (
                <button
                  className="btn btn-primary"
                  style={{ marginTop: "1rem" }}
                  onClick={handleEnrollmentToggle}
                  disabled={enrollmentLoading}
                >
                  <UserCheck size={16} />
                  ¡Sé el primero en inscribirte!
                </button>
              )}
            </div>
          )}

          {/* User's enrollment status section */}
          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1.5rem",
              borderTop: "2px solid #e5e7eb",
            }}
          >
            <h3 style={{ marginBottom: "1rem", color: "#374151" }}>
              Tu Estado de Participación
            </h3>

            {isMyEvent ? (
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#f0f2ff", // Slightly different blue for creator
                  border: "2px solid #6366f1", // Primary color for creator
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <Edit size={18} style={{ color: "#6366f1" }} />
                  <strong style={{ color: "#6366f1" }}>
                    Creador del Evento
                  </strong>
                </div>
                <p style={{ color: "#4f46e5", fontSize: "0.9rem", margin: 0 }}>
                  Tienes permisos para editar y gestionar este evento
                </p>
              </div>
            ) : isUserEnrolled ? (
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#f0f9ff",
                  border: "2px solid #0ea5e9",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <UserCheck size={18} style={{ color: "#0ea5e9" }} />
                  <strong style={{ color: "#0ea5e9" }}>
                    ¡Estás inscrito en este evento!
                  </strong>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#fef2f2",
                  border: "2px solid #f87171",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <UserX size={18} style={{ color: "#dc2626" }} />
                  <strong style={{ color: "#dc2626" }}>
                    No estás inscrito en este evento
                  </strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <Link to="/events">
          <button className="btn btn-secondary">Volver a Eventos</button>
        </Link>
      </div>
    </div>
  );
};

export default EventDetail;
