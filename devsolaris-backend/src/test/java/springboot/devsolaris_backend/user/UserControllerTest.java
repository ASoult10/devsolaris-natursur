package springboot.devsolaris_backend.user;

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
public class UserControllerTest {

    private final String ADMIN_EMAIL = "admin@natursur.com";
    private final String USER_EMAIL = "juan.perez@example.com";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @SuppressWarnings("null")
    @Test
    @WithUserDetails(ADMIN_EMAIL)
    public void testGetAllUsers() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(3))));
    }

    @Test
    @WithUserDetails(USER_EMAIL)
    public void testGetUserById() throws Exception {
        mockMvc.perform(get("/api/users/101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(USER_EMAIL))
                .andExpect(jsonPath("$.id").value(101));
    }

    @Test
    @WithUserDetails(USER_EMAIL)
    public void testGetUserByEmail() throws Exception {
        mockMvc.perform(get("/api/users/email/" + USER_EMAIL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(101))
                .andExpect(jsonPath("$.email").value(USER_EMAIL));
    }

    @SuppressWarnings("null")
    @Test
    public void testCreateClientUser() throws Exception {
        ObjectNode newUser = objectMapper.createObjectNode();
        newUser.put("name", "Test User");
        newUser.put("email", "test.user@example.com");
        newUser.put("phone", "600123456");
        newUser.put("password", "password123");
        newUser.put("role", "CLIENT");

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(newUser.toString()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("test.user@example.com"))
                .andExpect(jsonPath("$.role").value("CLIENT"));
    }

    @SuppressWarnings("null")
    @Test
    @WithUserDetails(ADMIN_EMAIL)
    public void testCreateAdminUser() throws Exception {
        ObjectNode newUser = objectMapper.createObjectNode();
        newUser.put("name", "Test Admin");
        newUser.put("email", "test.admin@example.com");
        newUser.put("phone", "600123456");
        newUser.put("password", "password123");
        newUser.put("role", "ADMIN");

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(newUser.toString()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("test.admin@example.com"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @SuppressWarnings("null")
    @Test
    @WithUserDetails(USER_EMAIL)
    public void testUpdateUser() throws Exception {
        ObjectNode userDetails = objectMapper.createObjectNode();
        userDetails.put("name", "Juan P. Updated");
        userDetails.put("email", "juan.perez.updated@example.com");
        userDetails.put("phone", "600654321");

        mockMvc.perform(put("/api/users/101")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userDetails.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Juan P. Updated"))
                .andExpect(jsonPath("$.email").value("juan.perez.updated@example.com"))
                .andExpect(jsonPath("$.phone").value("600654321"));
    }

    @Test
    @WithUserDetails(USER_EMAIL)
    public void testDeleteUser() throws Exception {
        mockMvc.perform(delete("/api/users/101"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/users/101"))
                .andExpect(status().isNotFound());
    }
}