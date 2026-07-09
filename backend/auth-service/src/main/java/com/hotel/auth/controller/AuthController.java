package com.hotel.auth.controller;

import com.hotel.auth.dto.*;
import com.hotel.auth.entity.User;
import com.hotel.auth.repository.UserRepository;
import com.hotel.auth.util.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!\\-_*()\\\\\\[\\]{}|;:',.<>?/~`]).{8,30}$"
    );

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // Validate Username
        if (request.getUsername() == null || request.getUsername().length() < 5 || request.getUsername().length() > 20) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Username must be between 5 and 20 characters.");
        }

        // Validate Password
        if (request.getPassword() == null || !PASSWORD_PATTERN.matcher(request.getPassword()).matches()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Password must be 8-30 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
        }

        // Check if username exists
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Username already exists.");
        }

        // Create User (strictly customer role)
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .email(request.getEmail())
                .countryCode(request.getCountryCode() != null ? request.getCountryCode() : "+91")
                .mobileNumber(request.getMobileNumber())
                .address(request.getAddress())
                .role("CUSTOMER") // Registration forces CUSTOMER role only
                .build();

        userRepository.save(user);

        UserDto userDto = convertToDto(user);
        String token = tokenProvider.generateToken(user);

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .user(userDto)
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password.");
        }

        User user = userOpt.get();
        UserDto userDto = convertToDto(user);
        String token = tokenProvider.generateToken(user);

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .user(userDto)
                .build());
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestHeader(value = "X-User-Role", required = false) String roleHeader) {
        // Simple microservice internal protection
        if (roleHeader == null || !roleHeader.equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Admin role required.");
        }

        List<UserDto> users = userRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody RegisterRequest request,
                                         @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
                                         @RequestHeader(value = "X-User-Role", required = false) String roleHeader) {
        // Ensure user can only update their own profile (or admin)
        if (userIdHeader == null || (!userIdHeader.equals(String.valueOf(id)) && !"ADMIN".equalsIgnoreCase(roleHeader))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Unauthorized profile update.");
        }

        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }

        User user = userOpt.get();
        if (request.getName() != null) user.setName(request.getName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getCountryCode() != null) user.setCountryCode(request.getCountryCode());
        if (request.getMobileNumber() != null) user.setMobileNumber(request.getMobileNumber());
        if (request.getAddress() != null) user.setAddress(request.getAddress());

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            if (!PASSWORD_PATTERN.matcher(request.getPassword()).matches()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Password must be 8-30 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
            }
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        userRepository.save(user);
        return ResponseEntity.ok(convertToDto(user));
    }

    private UserDto convertToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .email(user.getEmail())
                .countryCode(user.getCountryCode())
                .mobileNumber(user.getMobileNumber())
                .address(user.getAddress())
                .role(user.getRole())
                .build();
    }
}
