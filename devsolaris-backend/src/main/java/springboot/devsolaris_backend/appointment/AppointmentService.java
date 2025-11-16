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
import java.time.LocalDateTime;
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
        validateAppointmentUserAccess(request.getUserId());
        
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + request.getUserId()));

        validateAppointmentTimes(request.getStartTime(), request.getEndTime(), null);

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
        validateAppointmentUserAccess(userId);
        
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("Usuario no encontrado con ID: " + userId);
        }

        List<Appointment> appointments = appointmentRepository.findByUserIdOrderByStartTimeAsc(userId);
        return appointments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public AppointmentResponse updateAppointment(Integer appointmentId, AppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada con ID: " + appointmentId));
        
        validateAppointmentAccess(appointment);
        
        validateAppointmentUserAccess(request.getUserId());

        validateAppointmentTimes(request.getStartTime(), request.getEndTime(), appointmentId);

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
        
        validateAppointmentAccess(appointment);
        
        appointmentRepository.deleteById(appointmentId);
    }

    public AppointmentResponse getAppointmentById(Integer appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada con ID: " + appointmentId));
        
        validateAppointmentAccess(appointment);
        
        return convertToResponse(appointment);
    }

    public List<AppointmentResponse> getAllAppointments(LocalDateTime startDate, LocalDateTime endDate) {
        if (!AuthenticationUtil.isAdmin()) {
            throw new IllegalArgumentException("No tienes permisos para ver todas las citas. Solo administradores pueden acceder.");
        }
        
        List<Appointment> appointments;

        if (startDate != null && endDate != null && !startDate.isBefore(endDate)) {
            throw new IllegalArgumentException("La fecha de inicio debe ser anterior a la fecha de fin");
        }

        if (startDate != null && endDate != null) {
            appointments = appointmentRepository.findByStartTimeBetweenOrderByStartTimeAsc(startDate, endDate);
        } else if (startDate != null) {
            appointments = appointmentRepository.findByStartTimeGreaterThanEqualOrderByStartTimeAsc(startDate);
        } else if (endDate != null) {
            appointments = appointmentRepository.findByStartTimeLessThanEqualOrderByStartTimeAsc(endDate);
        } else {
            appointments = appointmentRepository.findAllByOrderByStartTimeAsc();
        }

        return appointments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private void validateAppointmentTimes(LocalDateTime startTime, LocalDateTime endTime, Integer excludeAppointmentId) {
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("La fecha de inicio debe ser anterior a la fecha de fin");
        }

        DayOfWeek dayOfWeek = startTime.getDayOfWeek();
        if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
            throw new IllegalArgumentException("Las citas solo pueden crearse de lunes a viernes");
        }

        if (!startTime.toLocalDate().equals(endTime.toLocalDate())) {
            throw new IllegalArgumentException("La cita debe comenzar y terminar el mismo día");
        }

        LocalTime startLocalTime = startTime.toLocalTime();
        LocalTime endLocalTime = endTime.toLocalTime();

        if (startLocalTime.isBefore(BUSINESS_START)) {
            throw new IllegalArgumentException("Las citas no pueden comenzar antes de las 08:00");
        }

        if (endLocalTime.isAfter(BUSINESS_END)) {
            throw new IllegalArgumentException("Las citas no pueden terminar después de las 15:00");
        }

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

    private boolean validateAppointmentAccess(Appointment appointment) {
        Integer currentUserId = AuthenticationUtil.getCurrentUserId();
        boolean isAdmin = AuthenticationUtil.isAdmin();
        
        if (!isAdmin && !currentUserId.equals(appointment.getUser().getId())) {
            throw new IllegalArgumentException("No tienes permisos para acceder a esta cita. Solo puedes acceder a tus propias citas.");
        }
        
        return true;
    }

    private boolean validateAppointmentUserAccess(Integer userId) {
        Integer currentUserId = AuthenticationUtil.getCurrentUserId();
        boolean isAdmin = AuthenticationUtil.isAdmin();
        
        if (!isAdmin && !currentUserId.equals(userId)) {
            throw new IllegalArgumentException("No tienes permisos para crear o modificar citas de otros usuarios. Solo puedes gestionar tus propias citas.");
        }
        
        return true;
    }
}
