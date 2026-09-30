package com.example.backend;

import jakarta.servlet.http.HttpSession;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin
public class UserController {

    private final UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // USER REGISTRATION
    @PostMapping("/register")
    public String registerUser(@RequestBody User user) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return "Email already registered!";
        }

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        user.setRole("USER");

        userRepository.save(user);

        return "Registration successful!";
    }

    // GET CURRENT LOGGED-IN USER
    @GetMapping("/me")
    public Object getCurrentUser(HttpSession session) {

        String email =
                (String) session.getAttribute("userEmail");

        String role =
                (String) session.getAttribute("userRole");

        if (email == null || role == null) {
            return "Please login first";
        }

        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        if (user == null) {
            return "User not found";
        }

        return Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "role", user.getRole()
        );
    }

    // ADMIN ONLY - VIEW USERS
    @GetMapping
    public Object getUsers(HttpSession session) {

        String role =
                (String) session.getAttribute("userRole");

        if (role == null) {
            return "Please login first";
        }

        if (!"ADMIN".equals(role)) {
            return "Access denied. Admin only.";
        }

        return userRepository.findAll();
    }

    // ADMIN ONLY - DELETE USER
    @DeleteMapping("/{id}")
    public String deleteUser(
            @PathVariable Integer id,
            HttpSession session) {

        String role =
                (String) session.getAttribute("userRole");

        if (!"ADMIN".equals(role)) {
            return "Access denied. Admin only.";
        }

        if (!userRepository.existsById(id)) {
            return "User not found";
        }

        userRepository.deleteById(id);

        return "User deleted successfully!";
    }
}
