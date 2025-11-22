package springboot.devsolaris_backend.appointment;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithUserDetails;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
@Transactional
@DirtiesContext(classMode = ClassMode.AFTER_EACH_TEST_METHOD)
public class AppointmentControllerTest {

    private final String ADMIN_EMAIL = "admin@natursur.com";
    private final String USER_EMAIL = "juan.perez@example.com";
    private final Integer USER_ID = 101;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @SuppressWarnings("null")
    @Test
    @WithUserDetails(USER_EMAIL)
    public void testCreateAppointment() throws Exception {
        ObjectNode request = objectMapper.createObjectNode();
        request.put("userId", USER_ID);
        request.put("startTime", "2024-03-15T10:00:00");
        request.put("endTime", "2024-03-15T11:00:00");
        request.put("title", "Nueva consulta");
        request.put("description", "Consulta de prueba");

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request.toString()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(USER_ID))
                .andExpect(jsonPath("$.title").value("Nueva consulta"))
                .andExpect(jsonPath("$.description").value("Consulta de prueba"))
                .andExpect(jsonPath("$.startTime").value("2024-03-15T10:00:00"))
                .andExpect(jsonPath("$.endTime").value("2024-03-15T11:00:00"));
    }

    @SuppressWarnings("null")
    @Test
    @WithUserDetails(USER_EMAIL)
    public void testGetAppointmentsByUserId() throws Exception {
        mockMvc.perform(get("/api/appointments/user/" + USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))))
                .andExpect(jsonPath("$[*].userId", everyItem(is(USER_ID))));
    }

    @Test
    @WithUserDetails(USER_EMAIL)
    public void testGetAppointmentById() throws Exception {
        mockMvc.perform(get("/api/appointments/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.userId").value(USER_ID))
                .andExpect(jsonPath("$.title").value("Consulta médica"));
    }

    @SuppressWarnings("null")
    @Test
    @WithUserDetails(ADMIN_EMAIL)
    public void testGetAllAppointments() throws Exception {
        mockMvc.perform(get("/api/appointments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(4))));
    }

    @SuppressWarnings("null")
    @Test
    @WithUserDetails(USER_EMAIL)
    public void testUpdateAppointment() throws Exception {
        ObjectNode request = objectMapper.createObjectNode();
        request.put("userId", USER_ID);
        request.put("startTime", "2024-02-15T11:00:00");
        request.put("endTime", "2024-02-15T12:00:00");
        request.put("title", "Consulta actualizada");
        request.put("description", "Descripción actualizada");

        mockMvc.perform(put("/api/appointments/100")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.title").value("Consulta actualizada"))
                .andExpect(jsonPath("$.description").value("Descripción actualizada"))
                .andExpect(jsonPath("$.startTime").value("2024-02-15T11:00:00"))
                .andExpect(jsonPath("$.endTime").value("2024-02-15T12:00:00"));
    }

    @Test
    @WithUserDetails(USER_EMAIL)
    public void testDeleteAppointment() throws Exception {
        mockMvc.perform(delete("/api/appointments/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Cita eliminada exitosamente"));

        mockMvc.perform(get("/api/appointments/100"))
                .andExpect(status().isNotFound());
    }
}
