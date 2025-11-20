package springboot.devsolaris_backend.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithUserDetails;
import org.springframework.transaction.annotation.Transactional;

import springboot.devsolaris_backend.auth.dto.AuthResponse;
import springboot.devsolaris_backend.auth.dto.LoginRequest;
import springboot.devsolaris_backend.auth.dto.RegisterRequest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@AutoConfigureTestDatabase
@Transactional
public class AuthServiceTest {

    private final String ADMIN_EMAIL = "admin@natursur.com";
    private final String CLIENT_EMAIL = "juan.perez@example.com";
    private final String PASSWORD = "password123";

    @Autowired
    private AuthService authService;

    @Test
    public void testRegisterClient() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Cliente Test");
        request.setEmail("cliente.test@example.com");
        request.setPhone("600111222");
        request.setPassword(PASSWORD);
        request.setRole(Role.CLIENT);

        AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isNotNull();
        assertThat(response.getEmail()).isEqualTo("cliente.test@example.com");
        assertThat(response.getName()).isEqualTo("Cliente Test");
        assertThat(response.getRole()).isEqualTo(Role.CLIENT);
        assertThat(response.getToken()).isNotNull();
    }

    @Test
    @WithUserDetails(ADMIN_EMAIL)
    public void testRegisterAdmin() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Admin Test");
        request.setEmail("admin.test@example.com");
        request.setPhone("600333444");
        request.setPassword(PASSWORD);
        request.setRole(Role.ADMIN);

        AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isNotNull();
        assertThat(response.getEmail()).isEqualTo("admin.test@example.com");
        assertThat(response.getName()).isEqualTo("Admin Test");
        assertThat(response.getRole()).isEqualTo(Role.ADMIN);
        assertThat(response.getToken()).isNotNull();
    }

    @Test
    public void testLoginAdmin() {
        LoginRequest request = new LoginRequest();
        request.setEmail(ADMIN_EMAIL);
        request.setPassword(PASSWORD);

        AuthResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isNotNull();
        assertThat(response.getEmail()).isEqualTo(ADMIN_EMAIL);
        assertThat(response.getName()).isEqualTo("Fernando Escalona");
        assertThat(response.getRole()).isEqualTo(Role.ADMIN);
        assertThat(response.getToken()).isNotNull();
    }

    @Test
    public void testLoginClient() {
        LoginRequest request = new LoginRequest();
        request.setEmail(CLIENT_EMAIL);
        request.setPassword(PASSWORD);

        AuthResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isNotNull();
        assertThat(response.getEmail()).isEqualTo(CLIENT_EMAIL);
        assertThat(response.getName()).isEqualTo("Juan Pérez");
        assertThat(response.getRole()).isEqualTo(Role.CLIENT);
        assertThat(response.getToken()).isNotNull();
    }
}