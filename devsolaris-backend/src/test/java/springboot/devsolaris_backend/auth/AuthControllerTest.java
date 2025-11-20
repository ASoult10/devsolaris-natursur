package springboot.devsolaris_backend.auth;

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

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
@Transactional
@DirtiesContext(classMode = ClassMode.AFTER_EACH_TEST_METHOD)
public class AuthControllerTest {

    private final String ADMIN_EMAIL = "admin@natursur.com";
    private final String CLIENT_EMAIL = "juan.perez@example.com";
    private final String PASSWORD = "password123";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @SuppressWarnings("null")
    @Test
    public void testRegisterClient() throws Exception {
        ObjectNode request = objectMapper.createObjectNode();
        request.put("name", "Cliente Test");
        request.put("email", "cliente.test@example.com");
        request.put("phone", "600111222");
        request.put("password", PASSWORD);
        request.put("role", "CLIENT");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request.toString()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value("cliente.test@example.com"))
                .andExpect(jsonPath("$.name").value("Cliente Test"))
                .andExpect(jsonPath("$.role").value("CLIENT"))
                .andExpect(jsonPath("$.userId").isNumber());
    }

    @SuppressWarnings("null")
    @Test
    @WithUserDetails(ADMIN_EMAIL)
    public void testRegisterAdmin() throws Exception {
        ObjectNode request = objectMapper.createObjectNode();
        request.put("name", "Admin Test");
        request.put("email", "admin.test@example.com");
        request.put("phone", "600333444");
        request.put("password", PASSWORD);
        request.put("role", "ADMIN");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request.toString()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value("admin.test@example.com"))
                .andExpect(jsonPath("$.name").value("Admin Test"))
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.userId").isNumber());
    }

    @SuppressWarnings("null")
    @Test
    public void testLoginAdmin() throws Exception {
        ObjectNode request = objectMapper.createObjectNode();
        request.put("email", ADMIN_EMAIL);
        request.put("password", PASSWORD);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value(ADMIN_EMAIL))
                .andExpect(jsonPath("$.name").value("Fernando Escalona"))
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.userId").value(100));
    }

    @SuppressWarnings("null")
    @Test
    public void testLoginClient() throws Exception {
        ObjectNode request = objectMapper.createObjectNode();
        request.put("email", CLIENT_EMAIL);
        request.put("password", PASSWORD);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value(CLIENT_EMAIL))
                .andExpect(jsonPath("$.name").value("Juan Pérez"))
                .andExpect(jsonPath("$.role").value("CLIENT"))
                .andExpect(jsonPath("$.userId").value(101));
    }
    
}