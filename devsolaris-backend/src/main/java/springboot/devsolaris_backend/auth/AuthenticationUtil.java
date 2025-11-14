package springboot.devsolaris_backend.auth;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import springboot.devsolaris_backend.user.User;

public class AuthenticationUtil {

    public static User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No hay usuario autenticado");
        }
        return (User) authentication.getPrincipal();
    }

    public static boolean isAdmin() {
        User user = getCurrentUser();
        return user.getRole() == Role.ADMIN;
    }

    public static Integer getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
