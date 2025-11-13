package springboot.devsolaris_backend.user;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    /**
     * Obtener todos los usuarios
     * GET /api/users
     */
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error al obtener los usuarios: " + e.getMessage()));
        }
    }

    /**
     * Obtener un usuario por ID
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Integer id) {
        try {
            return userRepository.findById(id)
                    .map(user -> ResponseEntity.ok((Object) user))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(createErrorResponse("Usuario con ID " + id + " no encontrado")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error al obtener el usuario: " + e.getMessage()));
        }
    }

    /**
     * Crear un nuevo usuario
     * POST /api/users
     */
    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody User user) {
        try {
            // Verificar si el email ya existe
            if (userRepository.existsByEmail(user.getEmail())) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("El email ya está registrado"));
            }
            
            User savedUser = userRepository.save(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error al crear el usuario: " + e.getMessage()));
        }
    }

    /**
     * Actualizar un usuario existente
     * PUT /api/users/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @Valid @RequestBody User userDetails) {
        try {
            return userRepository.findById(id)
                    .map(user -> {
                        // Verificar si el email ya existe para otro usuario
                        if (!user.getEmail().equals(userDetails.getEmail()) && 
                            userRepository.existsByEmail(userDetails.getEmail())) {
                            return ResponseEntity.badRequest()
                                    .body((Object) createErrorResponse("El email ya está registrado"));
                        }
                        
                        user.setName(userDetails.getName());
                        user.setEmail(userDetails.getEmail());
                        user.setPhone(userDetails.getPhone());
                        return ResponseEntity.ok((Object) userRepository.save(user));
                    })
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(createErrorResponse("Usuario con ID " + id + " no encontrado")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error al actualizar el usuario: " + e.getMessage()));
        }
    }

    /**
     * Eliminar un usuario
     * DELETE /api/users/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        try {
            return userRepository.findById(id)
                    .map(user -> {
                        userRepository.delete(user);
                        Map<String, String> response = new HashMap<>();
                        response.put("message", "Usuario eliminado exitosamente");
                        return ResponseEntity.ok((Object) response);
                    })
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(createErrorResponse("Usuario con ID " + id + " no encontrado")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error al eliminar el usuario: " + e.getMessage()));
        }
    }

    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }
}