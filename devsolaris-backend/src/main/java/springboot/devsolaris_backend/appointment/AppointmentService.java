package springboot.devsolaris_backend.appointment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import springboot.devsolaris_backend.appointment.dto.AppointmentRequest;
import springboot.devsolaris_backend.appointment.dto.AppointmentResponse;
import springboot.devsolaris_backend.auth.AuthenticationUtil;
import springboot.devsolaris_backend.user.User;
import springboot.devsolaris_backend.user.UserRepository;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AppointmentService {

    private static final LocalTime BUSINESS_START = LocalTime.of(8, 0);
    private static final LocalTime BUSINESS_END = LocalTime.of(15, 0);

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    public AppointmentResponse createAppointment(AppointmentRequest request) {
        // Validar que el usuario puede crear citas para el userId especificado
        validateAppointmentUserAccess(request.getUserId());
        
        // Validar que el usuario existe
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + request.getUserId()));

        // Validar las fechas
        validateAppointmentTimes(request.getStartTime(), request.getEndTime(), null);

        // Crear la cita
        Appointment appointment = new Appointment();
        appointment.setUser(user);
        appointment.setStartTime(request.getStartTime());
        appointment.setEndTime(request.getEndTime());
        appointment.setTitle(request.getTitle());
        appointment.setDescription(request.getDescription());

        Appointment savedAppointment = appointmentRepository.save(appointment);
        return convertToResponse(savedAppointment);
    }

    public List<AppointmentResponse> getAppointmentsByUserId(Integer userId) {
        // Validar que el usuario puede ver las citas de este usuario
        validateAppointmentUserAccess(userId);
        
        // Validar que el usuario existe
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("Usuario no encontrado con ID: " + userId);
        }

        List<Appointment> appointments = appointmentRepository.findByUserIdOrderByStartTimeAsc(userId);
        return appointments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public AppointmentResponse updateAppointment(Integer appointmentId, AppointmentRequest request) {
        // Buscar la cita existente
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada con ID: " + appointmentId));
        
        // Validar que el usuario puede modificar esta cita
        validateAppointmentAccess(appointment);
        
        // Validar que el usuario puede crear citas para el nuevo userId
        validateAppointmentUserAccess(request.getUserId());

        // Validar las fechas (excluyendo esta cita de la validación de solapamiento)
        validateAppointmentTimes(request.getStartTime(), request.getEndTime(), appointmentId);

        // Actualizar la cita
        appointment.setUser(user);
        appointment.setStartTime(request.getStartTime());
        appointment.setEndTime(request.getEndTime());
        appointment.setTitle(request.getTitle());
        appointment.setDescription(request.getDescription());

        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return convertToResponse(updatedAppointment);
    }

    public void deleteAppointment(Integer appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada con ID: " + appointmentId));
        
        // Validar que el usuario puede eliminar esta cita
        validateAppointmentAccess(appointment);
        
        appointmentRepository.deleteById(appointmentId);
    }

    public AppointmentResponse getAppointmentById(Integer appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada con ID: " + appointmentId));
        
        // Validar que el usuario puede ver esta cita
        validateAppointmentAccess(appointment);
        
        return convertToResponse(appointment);
    }

    public List<AppointmentResponse> getAllAppointments(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate) {
        // Solo ADMIN puede ver todas las citas
        if (!AuthenticationUtil.isAdmin()) {
            throw new IllegalArgumentException("No tienes permisos para ver todas las citas. Solo administradores pueden acceder.");
        }
        
        List<Appointment> appointments;

        // Validar que si se proporcionan ambas fechas, startDate sea anterior a endDate
        if (startDate != null && endDate != null && !startDate.isBefore(endDate)) {
            throw new IllegalArgumentException("La fecha de inicio debe ser anterior a la fecha de fin");
        }

        // Filtrar según los parámetros proporcionados
        if (startDate != null && endDate != null) {
            // Ambas fechas: buscar citas en el intervalo
            appointments = appointmentRepository.findByStartTimeBetweenOrderByStartTimeAsc(startDate, endDate);
        } else if (startDate != null) {
            // Solo fecha inicio: buscar citas después de esta fecha
            appointments = appointmentRepository.findByStartTimeGreaterThanEqualOrderByStartTimeAsc(startDate);
        } else if (endDate != null) {
            // Solo fecha fin: buscar citas antes de esta fecha
            appointments = appointmentRepository.findByStartTimeLessThanEqualOrderByStartTimeAsc(endDate);
        } else {
            // Sin filtros: obtener todas las citas
            appointments = appointmentRepository.findAllByOrderByStartTimeAsc();
        }

        return appointments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private void validateAppointmentTimes(java.time.LocalDateTime startTime, java.time.LocalDateTime endTime, Integer excludeAppointmentId) {
        // Validar que la fecha de inicio es anterior a la fecha de fin
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("La fecha de inicio debe ser anterior a la fecha de fin");
        }

        // Validar que son días laborables (lunes a viernes)
        DayOfWeek dayOfWeek = startTime.getDayOfWeek();
        if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
            throw new IllegalArgumentException("Las citas solo pueden crearse de lunes a viernes");
        }

        // Validar que la cita termina el mismo día
        if (!startTime.toLocalDate().equals(endTime.toLocalDate())) {
            throw new IllegalArgumentException("La cita debe comenzar y terminar el mismo día");
        }

        // Validar horario de negocio (8:00 - 15:00)
        LocalTime startLocalTime = startTime.toLocalTime();
        LocalTime endLocalTime = endTime.toLocalTime();

        if (startLocalTime.isBefore(BUSINESS_START)) {
            throw new IllegalArgumentException("Las citas no pueden comenzar antes de las 08:00");
        }

        if (endLocalTime.isAfter(BUSINESS_END)) {
            throw new IllegalArgumentException("Las citas no pueden terminar después de las 15:00");
        }

        // Validar que no haya solapamiento con otras citas
        List<Appointment> overlappingAppointments;
        if (excludeAppointmentId != null) {
            overlappingAppointments = appointmentRepository.findOverlappingAppointmentsExcludingId(
                    excludeAppointmentId, startTime, endTime);
        } else {
            overlappingAppointments = appointmentRepository.findOverlappingAppointments(startTime, endTime);
        }

        if (!overlappingAppointments.isEmpty()) {
            throw new IllegalArgumentException("Ya existe una cita en ese horario. Por favor, elija otro horario.");
        }
    }

    private AppointmentResponse convertToResponse(Appointment appointment) {
        return new AppointmentResponse(
                appointment.getId(),
                appointment.getUser().getId(),
                appointment.getUser().getName(),
                appointment.getUser().getEmail(),
                appointment.getStartTime(),
                appointment.getEndTime(),
                appointment.getTitle(),
                appointment.getDescription()
        );
    }

    /**
     * Valida que el usuario actual sea ADMIN o el propietario de la cita
     * @param appointment Cita a validar
     * @return true si tiene acceso
     * @throws IllegalArgumentException si no tiene acceso
     */
    private boolean validateAppointmentAccess(Appointment appointment) {
        Integer currentUserId = AuthenticationUtil.getCurrentUserId();
        boolean isAdmin = AuthenticationUtil.isAdmin();
        
        if (!isAdmin && !currentUserId.equals(appointment.getUser().getId())) {
            throw new IllegalArgumentException("No tienes permisos para acceder a esta cita. Solo puedes acceder a tus propias citas.");
        }
        
        return true;
    }

    /**
     * Valida que el usuario actual sea ADMIN o esté creando/modificando su propia cita
     * @param userId ID del usuario de la cita
     * @return true si tiene acceso
     * @throws IllegalArgumentException si no tiene acceso
     */
    private boolean validateAppointmentUserAccess(Integer userId) {
        Integer currentUserId = AuthenticationUtil.getCurrentUserId();
        boolean isAdmin = AuthenticationUtil.isAdmin();
        
        if (!isAdmin && !currentUserId.equals(userId)) {
            throw new IllegalArgumentException("No tienes permisos para crear o modificar citas de otros usuarios. Solo puedes gestionar tus propias citas.");
        }
        
        return true;
    }
}
