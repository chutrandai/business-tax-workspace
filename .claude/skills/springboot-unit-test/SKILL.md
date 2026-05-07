---
name: springboot-unit-test
description: Write comprehensive unit tests and integration tests for Spring Boot applications. Use this skill whenever the user asks to write tests, unit tests, integration tests, add test coverage, test a service/controller/repository, mock dependencies, or validate Spring Boot component behavior. Triggers on "viết unit test", "tạo test", "test cho service", "mock", "test controller", "JUnit", "Mockito", "@SpringBootTest", "test coverage", or any request involving verifying Java/Spring Boot code behavior.
---

# Spring Boot Unit Test Skill

Viết unit test và integration test chất lượng cao cho Spring Boot — hỗ trợ mọi version từ 1.x đến 3.x, tự detect version từ build file và áp dụng đúng pattern.

## Quy trình làm việc

1. **Đọc build file** — detect Spring Boot version từ `build.gradle` hoặc `pom.xml`
2. **Xác định version profile** — áp dụng bảng version matrix bên dưới
3. **Phân tích class cần test** — đọc code, xác định dependencies
4. **Chọn chiến lược test** — xem bảng loại test
5. **Cấu hình dependencies** — đảm bảo đúng thư viện cho version đó
6. **Viết test** — theo template trong `references/`
7. **Chạy test và xác nhận pass**

---

## Bước 1: Detect Spring Boot Version

**Luôn đọc `build.gradle` hoặc `pom.xml` trước tiên.** Tìm dòng khai báo version:

```groovy
// Gradle
id 'org.springframework.boot' version '2.7.18'   // ← đây là version
// hoặc
springBootVersion = '3.2.0'
```

```xml
<!-- Maven -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.7.18</version>   <!-- ← đây là version -->
</parent>
```

Sau khi có version, tra bảng dưới và đọc `references/version-matrix.md` để biết chi tiết.

---

## Bảng Version Matrix — Nhanh

| Spring Boot | Java tối thiểu | JUnit | Mockito | Javax/Jakarta | Mock static |
|---|---|---|---|---|---|
| **1.x** (1.0–1.5) | Java 6+ | JUnit 4 (mặc định) | 1.x | `javax.*` | PowerMock |
| **2.0 – 2.1** | Java 8+ | JUnit 4 mặc định, JUnit 5 opt-in | 2.x | `javax.*` | mockito-inline |
| **2.2 – 2.7** | Java 8+ | **JUnit 5 mặc định** | 3.x | `javax.*` | mockito-inline |
| **3.0 – 3.x** | **Java 17+** | JUnit 5 | **4.x+** | **`jakarta.*`** | mockito-inline (built-in) |

> **Điểm khác biệt quan trọng nhất giữa 2.x và 3.x:**
> - Import thay đổi: `javax.` → `jakarta.` (toàn bộ Servlet API, Validation, Persistence)
> - Mockito baked-in: 3.x dùng `mockito-inline` built-in, không cần khai báo riêng
> - Java version: 3.x yêu cầu tối thiểu Java 17
>
> Đọc `references/version-matrix.md` để so sánh chi tiết từng version.

---

## Chiến lược chọn loại test

| Loại class | Annotation chính | File tham chiếu |
|---|---|---|
| Service thuần (không Spring context) | `@ExtendWith(MockitoExtension.class)` | `references/service-unit-test.md` |
| Controller (REST API) | `@WebMvcTest` | `references/controller-test.md` |
| Repository (JPA) | `@DataJpaTest` | `references/repository-test.md` |
| Integration (nhiều layer) | `@SpringBootTest` | `references/integration-test.md` |
| Utility / static methods | JUnit 5 (hoặc JUnit 4) thuần | `references/utility-test.md` |

---

## Bước 2: Cấu hình dependencies đúng version

### Spring Boot 2.2+ & 3.x — Gradle

```groovy
dependencies {
    // spring-boot-starter-test đã bao gồm JUnit 5, Mockito, AssertJ
    testImplementation 'org.springframework.boot:spring-boot-starter-test'

    // H2 in-memory — dùng cho @DataJpaTest
    testRuntimeOnly 'com.h2database:h2'

    // Spring Security Test (nếu project có Security)
    testImplementation 'org.springframework.security:spring-security-test'

    // WebFlux / WebClient reactive test
    testImplementation 'io.projectreactor:reactor-test'

    // Chỉ cần cho Spring Boot 2.x — mock static methods
    // Boot 3.x đã tích hợp sẵn mockito-inline, KHÔNG thêm dòng này
    // testImplementation 'org.mockito:mockito-inline:4.11.0'
}

// Bắt buộc nếu dùng JUnit 5 (Spring Boot 2.2+)
test {
    useJUnitPlatform()
}
```

### Spring Boot 2.0 – 2.1 — Cần opt-in JUnit 5

```groovy
dependencies {
    testImplementation('org.springframework.boot:spring-boot-starter-test') {
        exclude group: 'junit', module: 'junit'            // bỏ JUnit 4
        exclude group: 'org.junit.vintage', module: 'junit-vintage-engine'
    }
    testImplementation 'org.junit.jupiter:junit-jupiter-api:5.8.2'
    testImplementation 'org.junit.jupiter:junit-jupiter-params:5.8.2'
    testRuntimeOnly 'org.junit.jupiter:junit-jupiter-engine:5.8.2'
    testRuntimeOnly 'com.h2database:h2'
}
test {
    useJUnitPlatform()
}
```

### Spring Boot 1.x — JUnit 4

```groovy
dependencies {
    testCompile 'org.springframework.boot:spring-boot-starter-test'
    // JUnit 4 đã có sẵn trong starter-test của 1.x
}
// KHÔNG cần useJUnitPlatform() cho JUnit 4
```

### Maven — Spring Boot 2.2+

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>test</scope>
</dependency>
```

> **Nguyên tắc vàng**: `spring-boot-starter-test` đã bao gồm JUnit, Mockito, AssertJ. **Không thêm** các dependency này riêng lẻ để tránh version conflict. Chỉ khai báo khi cần override version cụ thể.

---

## Bước 3: Áp dụng import đúng theo version

Đây là điểm hay bị nhầm khi copy code từ internet:

```java
// ✅ Spring Boot 3.x (jakarta.*)
import jakarta.persistence.Entity;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;

// ✅ Spring Boot 1.x / 2.x (javax.*)
import javax.persistence.Entity;
import javax.validation.Valid;
import javax.servlet.http.HttpServletRequest;
```

---

## Bước 4: Đọc reference template phù hợp

Dựa vào loại class, đọc file tương ứng (xem mục lục tại `references/README.md`):

- **Service layer** → `references/service-unit-test.md`
- **Controller (REST)** → `references/controller-test.md`
- **Repository (JPA)** → `references/repository-test.md`
- **Integration test** → `references/integration-test.md`
- **Utility/Static** → `references/utility-test.md`
- **Chi tiết so sánh theo version** → `references/version-matrix.md`

Mỗi reference file đều có section riêng cho từng version khi có sự khác biệt.

---

## Các lỗi phổ biến và cách xử lý

### 1. `NoSuchBeanDefinitionException` khi dùng `@WebMvcTest`
`@WebMvcTest` chỉ load MVC layer — dùng `@MockBean` cho mọi service được inject:
```java
@WebMvcTest(UserController.class)
class UserControllerTest {
    @MockBean  // ← PHẢI là @MockBean, không phải @Mock
    private UserService userService;
}
```

### 2. Conflict JUnit 4 vs JUnit 5 (thường gặp ở Boot 2.0–2.1)
```groovy
testImplementation('org.springframework.boot:spring-boot-starter-test') {
    exclude group: 'junit', module: 'junit'
    exclude group: 'org.junit.vintage', module: 'junit-vintage-engine'
}
```

### 3. Import sai `javax.*` / `jakarta.*`
Luôn kiểm tra version. Boot 3.x → `jakarta.*`. Boot 2.x → `javax.*`.

### 4. `@DataJpaTest` không tìm thấy datasource
```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class UserRepositoryTest { }
```

### 5. Lombok không compile trong test
```groovy
// Gradle
testCompileOnly 'org.projectlombok:lombok'
testAnnotationProcessor 'org.projectlombok:lombok'

// Maven
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <scope>provided</scope>
</dependency>
```

### 6. `@Value` không inject trong Unit Test (Mockito context)
```java
@BeforeEach
void setUp() {
    ReflectionTestUtils.setField(myService, "fieldName", "testValue");
}
```

### 7. WebClient mock trong unit test
Dùng `MockWebServer` thay vì mock trực tiếp:
```groovy
testImplementation 'com.squareup.okhttp3:mockwebserver:4.12.0'
```

### 8. Redis không available trong test
```java
@Mock
private RedisTemplate<String, Object> redisTemplate;
@Mock
private ValueOperations<String, Object> valueOperations;

@BeforeEach
void setUp() {
    when(redisTemplate.opsForValue()).thenReturn(valueOperations);
}
```

### 9. `mockito-inline` conflict với Boot 3.x
Spring Boot 3.x đã bao gồm `mockito-inline` internally. Nếu khai báo thêm sẽ bị conflict:
```groovy
// ❌ KHÔNG làm điều này với Boot 3.x
testImplementation 'org.mockito:mockito-inline:5.x.x'
```

---

## Chạy test

```bash
# Gradle
./gradlew test
./gradlew test --tests "com.example.UserServiceTest"
./gradlew test --tests "com.example.UserServiceTest.shouldReturnUserWhenFound"
./gradlew test --info   # verbose output

# Maven
mvn test
mvn test -Dtest=UserServiceTest
mvn test -Dtest="UserServiceTest#methodName"
```

---

## Checklist trước khi hoàn thành

- [ ] Đã đọc `build.gradle` / `pom.xml` và xác định đúng Spring Boot version
- [ ] Dùng đúng imports: `javax.*` (Boot 1/2) hoặc `jakarta.*` (Boot 3)
- [ ] Test đặt đúng trong `src/test/java/` với đúng package mirror
- [ ] Không import JUnit 4 (`org.junit.Test`) khi project dùng JUnit 5
- [ ] `build.gradle` / `pom.xml` không có duplicate Mockito/JUnit dependencies
- [ ] Test có thể chạy: `./gradlew test` hoặc `mvn test` pass
- [ ] Mỗi test method có 1 mục đích duy nhất (arrange-act-assert)
- [ ] Không dùng `@SpringBootTest` khi chỉ cần test logic đơn giản
