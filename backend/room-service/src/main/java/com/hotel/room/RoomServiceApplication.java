package com.hotel.room;

import com.hotel.room.entity.Room;
import com.hotel.room.repository.RoomRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient
public class RoomServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RoomServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedRooms(RoomRepository roomRepository) {
        return args -> {
            if (roomRepository.count() == 0) {
                roomRepository.save(new Room("101", "Single Room", 100.0, "VACANT"));
                roomRepository.save(new Room("102", "Double Room", 150.0, "VACANT"));
                roomRepository.save(new Room("103", "Deluxe Suite", 250.0, "VACANT"));
                roomRepository.save(new Room("104", "Executive Penthouse", 500.0, "VACANT"));
                roomRepository.save(new Room("201", "Single Room", 100.0, "VACANT"));
                roomRepository.save(new Room("202", "Double Room", 150.0, "OCCUPIED"));
                roomRepository.save(new Room("203", "Deluxe Suite", 250.0, "MAINTENANCE"));
                roomRepository.save(new Room("204", "Executive Penthouse", 500.0, "VACANT"));
                System.out.println("Preloaded 8 default rooms (101-104, 201-204)");
            }
        };
    }
}
