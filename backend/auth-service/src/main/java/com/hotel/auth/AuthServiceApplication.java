package com.hotel.auth;

import com.hotel.auth.entity.User;
import com.hotel.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@EnableDiscoveryClient
public class AuthServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = User.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("Admin123!"))
                        .name("Sahil Upadhye")
                        .email("sahil.upadhye@hotel.com")
                        .countryCode("+91")
                        .mobileNumber("9999988888")
                        .address("Garima Park, Gandhinagar, Gujarat")
                        .role("ADMIN")
                        .build();
                userRepository.save(admin);
                System.out.println("Seeded admin user (username: admin, password: Admin123!)");
            }

            if (userRepository.findByUsername("customer").isEmpty()) {
                User customer = User.builder()
                        .username("customer")
                        .password(passwordEncoder.encode("Customer123!"))
                        .name("Aarav Sharma")
                        .email("aarav.sharma@example.com")
                        .countryCode("+91")
                        .mobileNumber("9876543210")
                        .address("Garima Park, Gandhinagar, Gujarat")
                        .role("CUSTOMER")
                        .build();
                userRepository.save(customer);
                System.out.println("Seeded customer user (username: customer, password: Customer123!)");
            }
        };
    }
}
