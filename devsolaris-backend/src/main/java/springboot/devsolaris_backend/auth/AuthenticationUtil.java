package springboot.devsolaris_backend.auth;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import springboot.devsolaris_backend.user.User;

public class AuthenticationUtil {

    public static User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new IllegalStateException("No hay usuario autenticado");
        }
        
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof User) {
            return (User) principal;
        }
        
        throw new IllegalStateException("Principal no es del tipo esperado: " + principal.getClass().getName());
    }

    public static boolean isAdmin() {
        try {
            User user = getCurrentUser();
            return user.getRole() == Role.ADMIN;
        } catch (IllegalStateException e) {
            return false;
        }
    }

    public static Integer getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
