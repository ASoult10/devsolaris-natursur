package springboot.devsolaris_backend.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import springboot.devsolaris_backend.auth.AuthenticationUtil;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        validateAdminAccess();
        return userRepository.findAll();
    }

    public User getUserById(Integer id) {
        validateUserAccess(id);
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario con ID " + id + " no encontrado"));
    }

    public User createUser(User user) {
        validateAdminAccess();
        
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        
        return userRepository.save(user);
    }

    public User updateUser(Integer id, User userDetails) {
        validateUserAccess(id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario con ID " + id + " no encontrado"));
        
        if (!user.getEmail().equals(userDetails.getEmail()) && 
            userRepository.existsByEmail(userDetails.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        
        user.setName(userDetails.getName());
        user.setEmail(userDetails.getEmail());
        user.setPhone(userDetails.getPhone());
        
        return userRepository.save(user);
    }

    public void deleteUser(Integer id) {
        validateUserAccess(id);
        
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("Usuario con ID " + id + " no encontrado");
        }
        
        userRepository.deleteById(id);
    }

    /**
     * Valida que el usuario actual sea ADMIN
     * @throws IllegalArgumentException si no es ADMIN
     */
    private void validateAdminAccess() {
        if (!AuthenticationUtil.isAdmin()) {
            throw new IllegalArgumentException("No tienes permisos para realizar esta operación. Solo administradores pueden acceder.");
        }
    }

    private boolean validateUserAccess(Integer userId) {
        Integer currentUserId = AuthenticationUtil.getCurrentUserId();
        boolean isAdmin = AuthenticationUtil.isAdmin();
        
        if (!isAdmin && !currentUserId.equals(userId)) {
            throw new IllegalArgumentException("No tienes permisos para acceder a este recurso. Solo puedes acceder a tu propia información.");
        }
        
        return true;
    }
}
