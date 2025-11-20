package springboot.devsolaris_backend.util;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashTest {
    
    @Test
    public void generatePasswordHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "password123";
        String hash = encoder.encode(password);
        
        System.out.println("\n=================================");
        System.out.println("Password: " + password);
        System.out.println("Hash: " + hash);
        System.out.println("=================================\n");
        
        // Verificar
        System.out.println("Matches: " + encoder.matches(password, hash));
    }
}
