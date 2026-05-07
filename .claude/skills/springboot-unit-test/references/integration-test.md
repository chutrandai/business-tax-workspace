# Integration Test Template

Dùng cho: Test nhiều layers cùng nhau (Controller + Service + Repository), hoặc test với real Spring context.

## Lưu ý quan trọng

`@SpringBootTest` **load toàn bộ application context** — chậm hơn, nhưng test thực tế hơn.
- Dùng khi cần test flow end-to-end (HTTP → Controller → Service → DB)
- Dùng khi test configuration, bean wiring, auto-configuration

## Template — Integration Test với Random Port

```java
package com.example;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")             // Dùng profile test (application-test.yml)
class UserIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;   // HTTP client đã cấu hình sẵn

    @Autowired
    private UserRepository userRepository;   // Có thể inject repo để verify DB state

    @Test
    void shouldCreateAndRetrieveUser() {
        // Create
        CreateUserRequest request = new CreateUserRequest("Alice", "alice@example.com");
        ResponseEntity<UserDto> createResponse = restTemplate.postForEntity(
            "/users", request, UserDto.class
        );
        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        Long userId = createResponse.getBody().getId();

        // Retrieve
        ResponseEntity<UserDto> getResponse = restTemplate.getForEntity(
            "/users/" + userId, UserDto.class
        );
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getResponse.getBody().getName()).isEqualTo("Alice");
    }
}
```

## application-test.yml — Cấu hình riêng cho test

```yaml
# src/test/resources/application-test.yml
spring:
  datasource:
    url: jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: create-drop
    database-platform: org.hibernate.dialect.H2Dialect
  redis:
    host: localhost
    port: 6379
  data:
    redis:
      repositories:
        enabled: false    # Disable Redis repositories nếu không cần trong test

# Override các config không cần thiết
mapping:
  threshold_max: 0.9
  threshold_min: 0.5
```

## Integration Test với MockMvc (nhanh hơn RANDOM_PORT)

```java
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();     // Clean DB trước mỗi test
    }

    @Test
    @Transactional                      // Rollback sau mỗi test
    void shouldCreateUserViaApi() throws Exception {
        CreateUserRequest request = new CreateUserRequest("Alice", "alice@example.com");

        mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated());

        // Verify DB state
        assertThat(userRepository.count()).isEqualTo(1);
        assertThat(userRepository.findByEmail("alice@example.com")).isPresent();
    }
}
```

## Disable Redis / External Services trong Integration Test

```java
@SpringBootTest
@ActiveProfiles("test")
class ServiceWithRedisIT {

    @MockBean                           // Override Redis bean với mock
    private RedisTemplate<String, Object> redisTemplate;

    @MockBean
    private SomeExternalApiClient externalApiClient;

    // Test chỉ với real DB, mock Redis và external API
}
```

## @TestConfiguration — Tạo beans riêng cho test

```java
@TestConfiguration
class TestConfig {
    
    @Bean
    @Primary                            // Override bean production
    public EmailService emailService() {
        return mock(EmailService.class); // Returns Mockito mock
    }
}

@SpringBootTest
@Import(TestConfig.class)
class MyIntegrationTest {
    @Autowired
    private EmailService emailService;  // Sẽ là mock
}
```

## Kiểm tra Database State sau operation

```java
@Test
@Transactional
void shouldPersistUserToDatabase() {
    // Act — call through API hoặc service
    userService.create(new CreateUserRequest("Alice", "alice@example.com"));
    
    // Flush để đảm bảo data đến DB
    entityManager.flush();
    entityManager.clear();
    
    // Verify DB state trực tiếp
    User saved = userRepository.findByEmail("alice@example.com").orElseThrow();
    assertThat(saved.getName()).isEqualTo("Alice");
    assertThat(saved.getCreatedAt()).isNotNull();
}
```

## Tips

- **Tối ưu tốc độ**: Dùng `@DirtiesContext(classMode = AFTER_CLASS)` thay vì `AFTER_EACH_TEST_METHOD` để tránh reload context nhiều lần
- **Shared context**: Nhiều Integration Test class có thể tái sử dụng cùng Spring context nếu cùng configuration
- **Profile test**: Luôn dùng `@ActiveProfiles("test")` để tách biệt config
- **Cleanup**: Dùng `@BeforeEach` để cleanup DB, hoặc `@Transactional` để rollback tự động
