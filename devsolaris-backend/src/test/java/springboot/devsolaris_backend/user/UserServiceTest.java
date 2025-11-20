package springboot.devsolaris_backend.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithUserDetails;
import org.springframework.transaction.annotation.Transactional;

import springboot.devsolaris_backend.auth.Role;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

@SpringBootTest
@AutoConfigureTestDatabase
@Transactional
public class UserServiceTest {

    private final String ADMIN_EMAIL = "admin@natursur.com";
    private final String USER_EMAIL = "juan.perez@example.com";

    @Autowired
    private UserService userService;

    @Test
    @WithUserDetails(ADMIN_EMAIL)
    public void testGetAllUsers() {
        List<User> users = userService.getAllUsers();
        assertThat(users).hasSizeGreaterThanOrEqualTo(3);
    }

    @Test
    @WithUserDetails(USER_EMAIL)
    public void testGetUserById() {
        User user = userService.getUserById(101);
        assertThat(user).isNotNull();
        assertThat(user.getEmail()).isEqualTo(USER_EMAIL);
    }

    @Test
    @WithUserDetails(USER_EMAIL)
    public void testGetUserByEmail() {
        User user = userService.getUserByEmail(USER_EMAIL);
        assertThat(user).isNotNull();
        assertThat(user.getId()).isEqualTo(101);
    }

    @Test
    public void testCreateClientUser() {
        User newUser = new User();
        newUser.setName("Test User");
        newUser.setEmail("test.user@example.com");
        newUser.setPhone("600123456");
        newUser.setPassword("password123");
        newUser.setRole(Role.CLIENT);
        User createdUser = userService.createUser(newUser);
        assertThat(createdUser.getId()).isNotNull();
        assertThat(createdUser.getEmail()).isEqualTo("test.user@example.com");
        assertThat(createdUser.getRole()).isEqualTo(Role.CLIENT);
    }

    @Test
    @WithUserDetails(ADMIN_EMAIL)
    public void testCreateAdminUser() {
        User newUser = new User();
        newUser.setName("Test User");
        newUser.setEmail("test.user@example.com");
        newUser.setPhone("600123456");
        newUser.setPassword("password123");
        newUser.setRole(Role.ADMIN);
        User createdUser = userService.createUser(newUser);
        assertThat(createdUser.getId()).isNotNull();
        assertThat(createdUser.getEmail()).isEqualTo("test.user@example.com");
        assertThat(createdUser.getRole()).isEqualTo(Role.ADMIN);
    }

    @Test
    @WithUserDetails(USER_EMAIL)
    public void testUpdateUser() {
        User userDetails = new User();
        userDetails.setName("Juan P. Updated");
        userDetails.setEmail("juan.perez.updated@example.com");
        userDetails.setPhone("600654321");
        User updatedUser = userService.updateUser(101, userDetails);
        assertThat(updatedUser.getName()).isEqualTo("Juan P. Updated");
        assertThat(updatedUser.getEmail()).isEqualTo("juan.perez.updated@example.com");
        assertThat(updatedUser.getPhone()).isEqualTo("600654321");
    }

    @Test
    @WithUserDetails(USER_EMAIL)
    public void testDeleteUser() {
        userService.deleteUser(101);
        try {
            userService.getUserById(101);
        } catch (NullPointerException e) {
            assertThat(e.getMessage()).isEqualTo("Usuario con ID 101 no encontrado");
        }
    }

}