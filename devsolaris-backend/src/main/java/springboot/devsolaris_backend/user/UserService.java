package springboot.devsolaris_backend.user;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import springboot.devsolaris_backend.auth.AuthenticationUtil;
import springboot.devsolaris_backend.auth.Role;

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
        User user = userRepository.findById(id)
            .orElseThrow(() -> new NullPointerException("Usuario con ID " + id + " no encontrado"));
        validateUserAccess(id);
        return user;
    }
    
    public User getUserByEmail(String email) {
        User user_found = userRepository.findByEmail(email)
                .orElseThrow(() -> new NullPointerException("Usuario con email " + email + " no encontrado"));
        validateUserAccess(user_found.getId());
        return user_found;
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User createUser(User user) {
        if(user.getRole() == Role.ADMIN) {
            validateAdminAccess();
        }
        
        if (existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        
        return userRepository.save(user);
    }

    public User updateUser(Integer id, User userDetails) {
        validateUserAccess(id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario con ID " + id + " no encontrado"));
        
        if (!user.getEmail().equals(userDetails.getEmail()) && 
            existsByEmail(userDetails.getEmail())) {
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
