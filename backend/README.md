# Backend Microservice Hotel Management System

# Technology Stack

This project is a complete backend microservice-based Hotel Management System built using:

- Spring Boot
- Spring Data JPA
- Spring Security
- Swagger UI
- Netflix Eureka
- Spring Cloud Gateway
- H2 Database
- Spring Cloud OpenFeign
- Maven
- Java 17

---

# Why We Are Using These Technologies

| Technology | Purpose |
|---|---|
| Spring Boot | Rapid backend development |
| Spring Data JPA | Database operations using repositories |
| Spring Security | Authentication and authorization |
| Swagger UI | API testing and documentation |
| Netflix Eureka | Service discovery |
| Spring Cloud Gateway | Central API routing |
| H2 Database | Lightweight in-memory database |
| OpenFeign | Service-to-service communication |
| Maven | Dependency and build management |
| Java 17 | Stable LTS Java version |

---

# Complete Microservice Architecture

```text
hotel-management-system
│
├── eureka-server
├── api-gateway
├── auth-service
├── reservation-service
├── billing-service
├── complaint-service
├── room-service
└── history-service
```

---

# Architecture Flow

```text
Client
   ↓
API Gateway (8080)
   ↓
Microservices
   ↓
Database
```

---

# How Services Communicate

```text
Reservation Service
        ↓
Feign Client
        ↓
Billing Service
```

Example:

```java
@FeignClient(name = "BILLING-SERVICE")
public interface BillingClient {

    @GetMapping("/billing/{reservationId}")
    BillResponse getBill(
        @PathVariable Long reservationId);
}
```

---

# Port Mapping

| Service | Port |
|---|---|
| Eureka Server | 8761 |
| API Gateway | 8080 |
| Auth Service | 8081 |
| Reservation Service | 8082 |
| Billing Service | 8083 |
| Complaint Service | 8084 |
| Room Service | 8085 |
| History Service | 8086 |

---

# Eureka Dashboard

```text
http://localhost:8761
```

This dashboard shows:
- All registered services
- Service health
- Running instances

---

# Swagger URLs

| Service | Swagger URL |
|---|---|
| Auth Service | http://localhost:8081/swagger-ui/index.html |
| Reservation Service | http://localhost:8082/swagger-ui/index.html |
| Billing Service | http://localhost:8083/swagger-ui/index.html |
| Complaint Service | http://localhost:8084/swagger-ui/index.html |
| Room Service | http://localhost:8085/swagger-ui/index.html |
| History Service | http://localhost:8086/swagger-ui/index.html |

Swagger is used for:
- API testing
- API documentation
- Request/response visualization

---

# API Gateway URLs

Instead of calling services directly:

```text
http://localhost:8080/auth/register
http://localhost:8080/reservations
http://localhost:8080/billing/pay
```

Gateway responsibilities:
- Central routing
- Security
- Request forwarding
- Load balancing

---

# Spring Initializer Configuration

## Common Settings

| Field | Value |
|---|---|
| Project | Maven |
| Language | Java |
| Java Version | 17 |
| Packaging | Jar |
| Spring Boot | 3.5.14 |
| Group | com.hotel |

---

# Microservice Package Names

| Service | Artifact | Package Name |
|---|---|---|
| Eureka Server | eureka-server | com.hotel.eureka |
| API Gateway | api-gateway | com.hotel.gateway |
| Auth Service | auth-service | com.hotel.auth |
| Reservation Service | reservation-service | com.hotel.reservation |
| Billing Service | billing-service | com.hotel.billing |
| Complaint Service | complaint-service | com.hotel.complaint |
| Room Service | room-service | com.hotel.room |
| History Service | history-service | com.hotel.history |

---

# Dependencies Required

# 1. Eureka Server

Dependencies:
- Eureka Server
- Spring Web

Main Class:

```java
@EnableEurekaServer
@SpringBootApplication
public class EurekaServerApplication {
}
```

Port:

```yaml
server:
  port: 8761
```

---

# 2. API Gateway

Dependencies:
- Gateway
- Eureka Discovery Client

Port:

```yaml
server:
  port: 8080
```

---

# 3. Auth Service

Dependencies:
- Spring Web
- Spring Data JPA
- Validation
- Spring Security
- H2 Database
- Lombok
- Eureka Discovery Client
- OpenFeign

Port:

```yaml
server:
  port: 8081
```

---

# 4. Reservation Service

Dependencies:
- Spring Web
- Spring Data JPA
- Validation
- H2 Database
- Lombok
- OpenFeign
- Eureka Discovery Client

Port:

```yaml
server:
  port: 8082
```

---

# 5. Billing Service

Dependencies:
- Spring Web
- Spring Data JPA
- Validation
- H2 Database
- OpenFeign
- Eureka Discovery Client

Port:

```yaml
server:
  port: 8083
```

---

# 6. Complaint Service

Dependencies:
- Spring Web
- Spring Data JPA
- Validation
- H2 Database
- Eureka Discovery Client

Port:

```yaml
server:
  port: 8084
```

---

# 7. Room Service

Dependencies:
- Spring Web
- Spring Data JPA
- H2 Database
- Eureka Discovery Client

Port:

```yaml
server:
  port: 8085
```

---

# 8. History Service

Dependencies:
- Spring Web
- Spring Data JPA
- Eureka Discovery Client

Port:

```yaml
server:
  port: 8086
```

---

# Swagger Dependency

Add this dependency inside every microservice pom.xml

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.5.0</version>
</dependency>
```

---

# Common application.yml

```yaml
spring:
  application:
    name: AUTH-SERVICE

  datasource:
    url: jdbc:h2:mem:testdb

  h2:
    console:
      enabled: true

  jpa:
    hibernate:
      ddl-auto: update

    show-sql: true

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka
```

---

# H2 Console URLs

| Service | H2 URL |
|---|---|
| Auth Service | http://localhost:8081/h2-console |
| Reservation Service | http://localhost:8082/h2-console |
| Billing Service | http://localhost:8083/h2-console |
| Complaint Service | http://localhost:8084/h2-console |
| Room Service | http://localhost:8085/h2-console |
| History Service | http://localhost:8086/h2-console |

---

# API Blueprint

# Auth Service APIs

| Method | API | Purpose |
|---|---|---|
| POST | /auth/register | Register user |
| POST | /auth/login | Login user |
| GET | /auth/users | Get all users |
| PUT | /auth/users/{id} | Update user |
| DELETE | /auth/users/{id} | Delete user |

---

# Reservation Service APIs

| Method | API | Purpose |
|---|---|---|
| POST | /reservations | Create reservation |
| GET | /reservations | Get all reservations |
| GET | /reservations/{id} | Get reservation by ID |
| PUT | /reservations/{id} | Update reservation |
| DELETE | /reservations/{id} | Delete reservation |

---

# Room Service APIs

| Method | API | Purpose |
|---|---|---|
| GET | /rooms | Get all rooms |
| PUT | /rooms/{id}/status | Update room status |

---

# Billing Service APIs

| Method | API | Purpose |
|---|---|---|
| GET | /billing/{reservationId} | Get bill details |
| POST | /billing/pay | Make payment |
| GET | /billing/invoice/{id} | Generate invoice |

---

# Complaint Service APIs

| Method | API | Purpose |
|---|---|---|
| POST | /complaints | Register complaint |
| GET | /complaints | View complaints |

---

# History Service APIs

| Method | API | Purpose |
|---|---|---|
| GET | /history/user/{id} | User booking history |
| GET | /history/all | All booking history |

---

# Why DTO Layer Is Important

DTO (Data Transfer Object) is used to:
- Hide entity structure
- Improve security
- Transfer only required data
- Prevent exposing database fields

---

# Why Validation Is Important

Validation prevents invalid data from entering the database.

Example:
- Invalid email
- Weak password
- Empty fields
- Wrong mobile number

---

# Why JWT Security Is Important

JWT is used for:
- Authentication
- Secure APIs
- Role-based access
- Stateless login

Flow:

```text
Login
   ↓
Generate JWT Token
   ↓
Client sends token
   ↓
Backend validates token
```

---

# Why Eureka Is Important

Without Eureka:
- Services must know exact URLs

With Eureka:
- Services discover each other automatically

Benefits:
- Scalability
- Dynamic service registration
- Better microservice management

---

# Why OpenFeign Is Important

OpenFeign simplifies REST API communication between services.

Instead of writing:
- RestTemplate
- WebClient

You directly use interfaces.

---

# Why API Gateway Is Important

Gateway acts as:
- Entry point
- Router
- Security layer
- Request manager

Benefits:
- Centralized API access
- Easier security
- Better scalability

---

# Important Enterprise Features

| Feature | Required |
|---|---|
| DTO Layer | YES |
| Global Exception Handler | YES |
| Validation | YES |
| Swagger | YES |
| JWT | YES |
| Feign Client | YES |
| API Gateway | YES |
| Eureka | YES |
| Role Based Access | YES |
| Logging | YES |

---

# Best Development Order

1. Eureka Server
2. API Gateway
3. Auth Service
4. Reservation Service
5. Room Service
6. Billing Service
7. Complaint Service
8. History Service
9. Feign Clients
10. JWT Security
11. Swagger Testing

---

# Mapping Old Console Methods to REST APIs

| Old Method | New REST API |
|---|---|
| registerUser() | POST /auth/register |
| customerLogin() | POST /auth/login |
| addReservation() | POST /reservations |
| roomStatusCustomer() | GET /rooms |
| billPayment() | POST /billing/pay |

---

# How Your Console Project Changes

| Old Project | New Microservice Architecture |
|---|---|
| ArrayLists | Database Tables |
| Console Menus | REST Controllers |
| Java Objects | JPA Entities |
| Manual Logic | Service Layer |
| Console Inputs | REST Requests |
| Local Method Calls | Feign Client Calls |

---

# Final Understanding

This project follows real enterprise microservice architecture.

Each service:
- runs independently
- has separate responsibilities
- communicates through APIs
- registers with Eureka
- can scale independently

This architecture is suitable for:
- Major projects
- Enterprise backend systems
- Resume projects
- Internship portfolios
- Microservice learning