package springboot.devsolaris_backend.appointment;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithUserDetails;
import org.springframework.transaction.annotation.Transactional;

import springboot.devsolaris_backend.appointment.dto.AppointmentRequest;
import springboot.devsolaris_backend.appointment.dto.AppointmentResponse;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.List;

@SpringBootTest
@AutoConfigureTestDatabase
@Transactional
public class AppointmentServiceTest {

    private final String ADMIN_EMAIL = "admin@natursur.com";
    private final String USER_EMAIL = "juan.perez@example.com";
    private final Integer USER_ID = 101;

    @Autowired
    private AppointmentService appointmentService;

    @Test
    @WithUserDetails(USER_EMAIL)
    public void testCreateAppointment() {
        AppointmentRequest request = new AppointmentRequest();
        request.setUserId(USER_ID);
        request.setStartTime(LocalDateTime.of(2024, 3, 15, 10, 0));
        request.setEndTime(LocalDateTime.of(2024, 3, 15, 11, 0));
        request.setTitle("Nueva consulta");
        request.setDescription("Consulta de prueba");

        AppointmentResponse response = appointmentService.createAppointment(request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isNotNull();
        assertThat(response.getUserId()).isEqualTo(USER_ID);
        assertThat(response.getTitle()).isEqualTo("Nueva consulta");
        assertThat(response.getDescription()).isEqualTo("Consulta de prueba");
        assertThat(response.getStartTime()).isEqualTo(LocalDateTime.of(2024, 3, 15, 10, 0));
        assertThat(response.getEndTime()).isEqualTo(LocalDateTime.of(2024, 3, 15, 11, 0));
    }

    @Test
    @WithUserDetails(USER_EMAIL)
    public void testGetAppointmentsByUserId() {
        List<AppointmentResponse> appointments = appointmentService.getAppointmentsByUserId(USER_ID);

        assertThat(appointments).isNotNull();
        assertThat(appointments).hasSizeGreaterThanOrEqualTo(2);
        assertThat(appointments).allMatch(apt -> apt.getUserId().equals(USER_ID));
    }

    @Test
    @WithUserDetails(USER_EMAIL)
    public void testUpdateAppointment() {
        AppointmentRequest updateRequest = new AppointmentRequest();
        updateRequest.setUserId(USER_ID);
        updateRequest.setStartTime(LocalDateTime.of(2024, 2, 15, 11, 0));
        updateRequest.setEndTime(LocalDateTime.of(2024, 2, 15, 12, 0));
        updateRequest.setTitle("Consulta actualizada");
        updateRequest.setDescription("Descripción actualizada");

        AppointmentResponse updatedAppointment = appointmentService.updateAppointment(100, updateRequest);

        assertThat(updatedAppointment).isNotNull();
        assertThat(updatedAppointment.getId()).isEqualTo(100);
        assertThat(updatedAppointment.getTitle()).isEqualTo("Consulta actualizada");
        assertThat(updatedAppointment.getDescription()).isEqualTo("Descripción actualizada");
        assertThat(updatedAppointment.getStartTime()).isEqualTo(LocalDateTime.of(2024, 2, 15, 11, 0));
        assertThat(updatedAppointment.getEndTime()).isEqualTo(LocalDateTime.of(2024, 2, 15, 12, 0));
    }

    @Test
    @WithUserDetails(USER_EMAIL)
    public void testDeleteAppointment() {
        appointmentService.deleteAppointment(100);

        try {
            appointmentService.getAppointmentById(100);
        } catch (IllegalArgumentException e) {
            assertThat(e.getMessage()).isEqualTo("Cita no encontrada con ID: 100");
        }
    }

    @Test
    @WithUserDetails(USER_EMAIL)
    public void testGetAppointmentById() {
        AppointmentResponse appointment = appointmentService.getAppointmentById(100);

        assertThat(appointment).isNotNull();
        assertThat(appointment.getId()).isEqualTo(100);
        assertThat(appointment.getUserId()).isEqualTo(USER_ID);
        assertThat(appointment.getTitle()).isEqualTo("Consulta médica");
    }

    @Test
    @WithUserDetails(ADMIN_EMAIL)
    public void testGetAllAppointments() {
        List<AppointmentResponse> appointments = appointmentService.getAllAppointments(null, null);

        assertThat(appointments).isNotNull();
        assertThat(appointments).hasSizeGreaterThanOrEqualTo(4);
    }
}
