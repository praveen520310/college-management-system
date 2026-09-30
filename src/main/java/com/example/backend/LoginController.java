package com.example.backend;

import jakarta.servlet.http.HttpSession;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class LoginController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public LoginController(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @PostMapping("/login")
    public String login(
            @RequestBody LoginRequest request,
            HttpSession session) {

        return userRepository.findByEmail(request.getEmail())
                .map(user -> {

                    if (passwordEncoder.matches(
                            request.getPassword(),
                            user.getPassword())) {

                        session.setAttribute("userEmail", user.getEmail());
                        session.setAttribute("userRole", user.getRole());

                        return "Login successful!";
                    }

                    return "Invalid email or password";
                })
                .orElse("Invalid email or password");
    }
}
