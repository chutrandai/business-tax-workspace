# Spring Boot Version Matrix — Test Dependencies & Patterns

So sánh chi tiết các sự khác biệt khi viết test theo từng version Spring Boot.

---

## So sánh tổng quan

| Đặc điểm | Boot 1.x | Boot 2.0–2.1 | Boot 2.2–2.7 | Boot 3.x |
|---|---|---|---|---|
| Java tối thiểu | 6 | 8 | 8 | **17** |
| JUnit mặc định | **4** | **4** (JUnit 5 opt-in) | **5** | 5 |
| Mockito version | 1.x | 2.x | 3.x | **4.x+** |
| Namespace Servlet | `javax.*` | `javax.*` | `javax.*` | **`jakarta.*`** |
| Mock static method | PowerMock | `mockito-inline` riêng | `mockito-inline` riêng | **built-in** |
| `@MockBean` | ✅ | ✅ | ✅ | ✅ |
| `@WebMvcTest` | ✅ | ✅ | ✅ | ✅ |
| `@DataJpaTest` | ✅ | ✅ | ✅ | ✅ |
| `useJUnitPlatform()` | ❌ không cần | cần nếu opt-in JUnit 5 | **✅ bắt buộc** | **✅ bắt buộc** |

---

## Spring Boot 1.x (1.0 – 1.5.x)

### Build dependencies (Gradle)
```groovy
dependencies {
    testCompile 'org.springframework.boot:spring-boot-starter-test'
    // Bao gồm: JUnit 4, Mockito 1.x, Hamcrest, Spring Test
    // JUnit 5 KHÔNG có sẵn — phải dùng JUnit 4
}
// KHÔNG dùng useJUnitPlatform()
```

### Build dependencies (Maven)
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

### Test code pattern — JUnit 4
```java
import org.junit.Test;          // JUnit 4
import org.junit.Before;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.runners.MockitoJUnitRunner;  // JUnit 4 runner

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)   // ← JUnit 4 style
public class UserServiceTest {       // ← class phải public

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    public void shouldReturnUserWhenFound() {  // ← method phải public + void
        User mockUser = new User(1L, "Alice");
        when(userRepository.findOne(1L)).thenReturn(mockUser);

        User result = userService.findById(1L);

        assertNotNull(result);
        assertEquals("Alice", result.getName());
    }

    @Test(expected = RuntimeException.class)  // ← JUnit 4 exception testing
    public void shouldThrowWhenNotFound() {
        when(userRepository.findOne(99L)).thenReturn(null);
        userService.findById(99L);
    }
}
```

### Controller test — JUnit 4 + MockMvc
```java
@RunWith(SpringRunner.class)
@WebMvcTest(UserController.class)
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Test
    public void shouldReturnUser() throws Exception {
        when(userService.findById(1L)).thenReturn(new User(1L, "Alice"));

        mockMvc.perform(MockMvcRequestBuilders.get("/users/1"))
            .andExpect(MockMvcResultMatchers.status().isOk());
    }
}
```

---

## Spring Boot 2.0 – 2.1

### Đặc điểm
- JUnit 4 vẫn là default — phải **opt-in** JUnit 5 thủ công
- Mockito 2.x: `thenReturn()`, `doReturn()` API tương đương nhưng strictness cao hơn JUnit 1.x
- Vẫn dùng `javax.*`

### Để dùng JUnit 5 (opt-in)
```groovy
dependencies {
    testImplementation('org.springframework.boot:spring-boot-starter-test') {
        exclude group: 'junit', module: 'junit'
        exclude group: 'org.junit.vintage', module: 'junit-vintage-engine'
    }
    testImplementation 'org.junit.jupiter:junit-jupiter-api:5.8.2'
    testRuntimeOnly 'org.junit.jupiter:junit-jupiter-engine:5.8.2'
    testRuntimeOnly 'com.h2database:h2'
}
test { useJUnitPlatform() }
```

---

## Spring Boot 2.2 – 2.7 (LTS phổ biến nhất)

### Đặc điểm
- **JUnit 5 là default** — không cần opt-in
- Mockito 3.x hoặc 4.x (tùy patch version)
- `mockito-inline` phải khai báo riêng nếu mock static
- Import vẫn dùng `javax.*`

### Build dependencies (Gradle)
```groovy
dependencies {
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    // Đã bao gồm: JUnit 5, Mockito 3/4, AssertJ, JsonPath, Spring Test
    
    testRuntimeOnly 'com.h2database:h2'
    
    // Nếu cần mock static method
    testImplementation 'org.mockito:mockito-inline:4.11.0'
    
    // Nếu có Security
    testImplementation 'org.springframework.security:spring-security-test'
}
test { useJUnitPlatform() }
```

### Test code pattern — JUnit 5
```java
import org.junit.jupiter.api.Test;                          // JUnit 5
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import javax.persistence.Entity;      // javax.* vẫn OK ở 2.x
import javax.validation.Valid;

import static org.assertj.core.api.Assertions.*;            // AssertJ thay junit Assert
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)   // JUnit 5 style (không cần @RunWith)
class UserServiceTest {               // class không cần public

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void shouldReturnUserWhenFound() { // method không cần public
        // ...
    }
}
```

---

## Spring Boot 3.x (3.0+)

### Đặc điểm chính khác biệt so với 2.x
1. **Bắt buộc Java 17+**
2. **`javax.*` → `jakarta.*`** — toàn bộ: persistence, validation, servlet, mail...
3. **Mockito 4.x+ built-in** — `mockito-inline` đã được tích hợp, không cần khai báo riêng
4. Spring Security 6, Spring Data 3, Hibernate 6

### Build dependencies (Gradle)
```groovy
dependencies {
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    // Đã bao gồm: JUnit 5, Mockito 4/5, AssertJ, JsonPath
    // mockito-inline đã được tích hợp — KHÔNG thêm riêng

    testRuntimeOnly 'com.h2database:h2'
    testImplementation 'org.springframework.security:spring-security-test'
    testImplementation 'io.projectreactor:reactor-test'
}
test { useJUnitPlatform() }
```

### Import thay đổi quan trọng
```java
// ❌ Spring Boot 2.x (javax)
import javax.persistence.Entity;
import javax.validation.Valid;
import javax.servlet.http.HttpServletRequest;
import javax.transaction.Transactional;

// ✅ Spring Boot 3.x (jakarta)
import jakarta.persistence.Entity;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
```

### Mock static method — Boot 3.x (không cần thêm dependency)
```java
@ExtendWith(MockitoExtension.class)
class MyServiceTest {
    
    @Test
    void shouldMockStaticMethod() {
        try (MockedStatic<TextUtils> mockedUtils = mockStatic(TextUtils.class)) {
            mockedUtils.when(() -> TextUtils.normalize("input")).thenReturn("output");
            
            String result = myService.process("input");
            assertThat(result).isEqualTo("expected");
        }
    }
}
```

---

## Spring Security Test — Khác biệt theo version

```java
// Spring Boot 2.x — SecurityMockMvcRequestPostProcessors
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;

mockMvc.perform(get("/admin").with(user("admin").roles("ADMIN")));

// Spring Boot 3.x — @WithMockUser vẫn hoạt động, nhưng cần Spring Security 6
@WithMockUser(username = "admin", roles = {"ADMIN"})
void testAdminEndpoint() throws Exception { ... }
```

---

## Hibernate / JPA Test — Khác biệt

```java
// Spring Boot 2.x
// Hibernate 5 — dialect: org.hibernate.dialect.PostgreSQLDialect
// spring.jpa.database-platform: org.hibernate.dialect.H2Dialect

// Spring Boot 3.x  
// Hibernate 6 — dialect: org.hibernate.dialect.PostgreSQLDialect (unchanged)
// Nhưng một số annotation JPA thay đổi:
// javax.persistence.* → jakarta.persistence.*
// @Type(type="json") → @JdbcTypeCode(SqlTypes.JSON)
```

---

## Checklist theo version

### Nếu project dùng Boot 1.x
- [ ] Dùng `@RunWith(MockitoJUnitRunner.class)` thay `@ExtendWith`
- [ ] Mọi class/method test phải `public`
- [ ] `assertNotNull`, `assertEquals` thay vì AssertJ
- [ ] Import `org.junit.Test` (JUnit 4)

### Nếu project dùng Boot 2.2–2.7
- [ ] `test { useJUnitPlatform() }` trong Gradle
- [ ] Import `org.junit.jupiter.api.Test` (JUnit 5)
- [ ] Dùng `javax.*` cho persistence/validation
- [ ] Khai báo `mockito-inline` nếu cần mock static

### Nếu project dùng Boot 3.x
- [ ] Java 17+ trong toolchain
- [ ] Import `jakarta.*` cho persistence/validation/servlet
- [ ] **KHÔNG** khai báo thêm `mockito-inline` (built-in, sẽ conflict)
- [ ] Dùng Spring Security 6 patterns nếu có Security
