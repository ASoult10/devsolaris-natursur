package springboot.devsolaris_backend.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import springboot.devsolaris_backend.auth.dto.AuthResponse;
import springboot.devsolaris_backend.auth.dto.LoginRequest;
import springboot.devsolaris_backend.auth.dto.RegisterRequest;
import springboot.devsolaris_backend.user.User;
import springboot.devsolaris_backend.user.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }

        var user = new User(
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                passwordEncoder.encode(request.getPassword()),
                request.getRole() != null ? request.getRole() : Role.CLIENT
        );

        userRepository.save(user);
        var jwtToken = jwtService.generateToken(user);

        return new AuthResponse(jwtToken, user.getId(), user.getEmail(), user.getName(), user.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        var jwtToken = jwtService.generateToken(user);

        return new AuthResponse(jwtToken, user.getId(), user.getEmail(), user.getName(), user.getRole());
    }
}
