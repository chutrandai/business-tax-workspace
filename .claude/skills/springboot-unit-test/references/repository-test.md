# Repository Test Template

Dùng cho: JPA Repository — test database queries, custom JPQL, derived methods.

> **Trước khi viết**: Xác định Spring Boot version trong `build.gradle`/`pom.xml`.
> - Boot **2.2+ và 3.x**: dùng template JUnit 5 bên dưới
> - Boot **1.x và 2.0–2.1**: xem section **[Template JUnit 4]** cuối file
> - Boot **3.x**: `@Entity` import là `jakarta.persistence.Entity` (không phải `javax.*`)

## Dependency

```groovy
testImplementation 'org.springframework.boot:spring-boot-starter-test'
testRuntimeOnly 'com.h2database:h2'  // BẮTBUỘC cho @DataJpaTest
```

## Template cơ bản — @DataJpaTest

```java
package com.example.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
// Dùng H2 in-memory (mặc định) - không cần real DB
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;    // Helper để persist test data

    @Autowired
    private UserRepository userRepository;       // Repository đang test

    private User user1;
    private User user2;

    @BeforeEach
    void setUp() {
        user1 = entityManager.persistAndFlush(
            User.builder().name("Alice").email("alice@example.com").active(true).build()
        );
        user2 = entityManager.persistAndFlush(
            User.builder().name("Bob").email("bob@example.com").active(false).build()
        );
    }

    @Test
    @DisplayName("findByEmail trả về User khi email tồn tại")
    void shouldFindUserByEmail() {
        Optional<User> result = userRepository.findByEmail("alice@example.com");

        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Alice");
    }

    @Test
    @DisplayName("findByEmail trả về empty khi email không tồn tại")
    void shouldReturnEmptyWhenEmailNotFound() {
        Optional<User> result = userRepository.findByEmail("notfound@example.com");

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("findAllActiveUsers chỉ trả về active users")
    void shouldReturnOnlyActiveUsers() {
        List<User> activeUsers = userRepository.findAllByActiveTrue();

        assertThat(activeUsers).hasSize(1);
        assertThat(activeUsers.get(0).getName()).isEqualTo("Alice");
    }

    @Test
    @DisplayName("save tạo User mới với ID được generate")
    void shouldSaveNewUser() {
        User newUser = User.builder().name("Charlie").email("charlie@example.com").build();

        User saved = userRepository.save(newUser);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getName()).isEqualTo("Charlie");
    }

    @Test
    @DisplayName("deleteById xóa User thành công")
    void shouldDeleteUserById() {
        userRepository.deleteById(user1.getId());

        Optional<User> deleted = userRepository.findById(user1.getId());
        assertThat(deleted).isEmpty();
    }

    @Test
    @DisplayName("Custom JPQL query searchByName")
    void shouldSearchUsersByNameContaining() {
        List<User> results = userRepository.findByNameContainingIgnoreCase("ali");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getEmail()).isEqualTo("alice@example.com");
    }

    @Test
    @DisplayName("count() trả về đúng số lượng")
    void shouldCountCorrectly() {
        long count = userRepository.count();
        assertThat(count).isEqualTo(2);
    }
}
```

## Dùng @Sql để load test data từ file

```java
@DataJpaTest
@Sql(scripts = {"/test-data/users.sql"})    // Load SQL script trước mỗi test class
class UserRepositoryWithSqlTest {
    // ...
}
```

Đặt file tại: `src/test/resources/test-data/users.sql`

## Khi Repository có Native Query

```java
@Test
void shouldExecuteNativeQuery() {
    // Test custom @Query native SQL
    List<UserProjection> results = userRepository.findTopUsersByOrders(5);
    assertThat(results).isNotEmpty();
}
```

## Lưu ý quan trọng với @DataJpaTest

- **Chỉ load JPA layer**: Không load `@Service`, `@Controller`, `@Component` thông thường
- **Transaction tự rollback**: Sau mỗi test, data được rollback — test case độc lập nhau
- **H2 in-memory**: Nhanh, không cần Docker/DB thực; nhưng H2 syntax khác PostgreSQL một số trường hợp
- **Nếu cần test với DB thực**: dùng `@AutoConfigureTestDatabase(replace = NONE)` + Testcontainers

## Testcontainers (nếu cần PostgreSQL thực)

```java
// Thêm dependency:
// testImplementation 'org.testcontainers:postgresql:1.19.3'
// testImplementation 'org.testcontainers:junit-jupiter:1.19.3'

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class UserRepositoryPostgresTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldWorkWithRealPostgres() {
        // Test với real PostgreSQL
    }
}
```

---

## Template JUnit 4 (Spring Boot 1.x và 2.0–2.1)

```java
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.junit4.SpringRunner;

import javax.persistence.Entity;   // Boot 1.x/2.x dùng javax

import static org.assertj.core.api.Assertions.*;

@RunWith(SpringRunner.class)      // ← JUnit 4 runner
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
public class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    @Before
    public void setUp() {         // ← @Before thay vì @BeforeEach
        entityManager.persistAndFlush(
            new User(null, "Alice", "alice@example.com", true)
        );
    }

    @Test
    public void shouldFindUserByEmail() {   // ← method phải public
        java.util.Optional<User> result = userRepository.findByEmail("alice@example.com");
        assertThat(result).isPresent();
    }
}
```
