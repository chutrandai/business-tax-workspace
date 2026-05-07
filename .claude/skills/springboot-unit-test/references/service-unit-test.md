# Service Unit Test Template

Dùng cho: Service class không cần Spring context (kiểm tra logic nghiệp vụ thuần).

> **Trước khi viết**: Xác định Spring Boot version trong `build.gradle`/`pom.xml`.
> - Boot **1.x hoặc 2.0–2.1**: xem **[Template JUnit 4]** bên dưới
> - Boot **2.2+ hoặc 3.x**: xem **[Template JUnit 5]** bên dưới
> - Khác biệt import `javax.*` vs `jakarta.*` với Boot 3.x: xem `references/version-matrix.md`

## Template cơ bản — JUnit 5 (Spring Boot 2.2+ và 3.x)

```java
package com.example.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)         // ← Không cần Spring context, test nhanh
class UserServiceTest {

    @Mock
    private UserRepository userRepository;  // Mock dependency

    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserService userService;        // Class đang test — Mockito tự inject mocks

    // @BeforeEach chỉ cần nếu phải setup thêm
    @BeforeEach
    void setUp() {
        // Ví dụ: inject @Value field qua ReflectionTestUtils
        // ReflectionTestUtils.setField(userService, "maxRetry", 3);
    }

    @Test
    @DisplayName("Trả về User khi tìm thấy theo ID")
    void shouldReturnUserWhenFound() {
        // Arrange
        Long userId = 1L;
        User mockUser = User.builder().id(userId).name("Alice").build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        // Act
        User result = userService.findById(userId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Alice");
        verify(userRepository, times(1)).findById(userId);
    }

    @Test
    @DisplayName("Ném exception khi không tìm thấy User")
    void shouldThrowExceptionWhenUserNotFound() {
        // Arrange
        Long userId = 99L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> userService.findById(userId))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("User not found");
    }

    @Test
    @DisplayName("Không gọi repository khi input null")
    void shouldNotCallRepositoryWhenInputIsNull() {
        // Act & Assert
        assertThatThrownBy(() -> userService.findById(null))
            .isInstanceOf(IllegalArgumentException.class);
        
        verifyNoInteractions(userRepository);
    }
}
```

---

## Template JUnit 4 (Spring Boot 1.x và 2.0–2.1)

```java
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner; // Boot 1.x
// hoặc Boot 2.x:
// import org.mockito.junit.MockitoJUnitRunner;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)  // ← JUnit 4 runner (khác @ExtendWith)
public class UserServiceTest {      // ← class PHẢI public

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    public void shouldReturnUserWhenFound() {  // ← method PHẢI public
        User mockUser = new User(1L, "Alice");
        when(userRepository.findOne(1L)).thenReturn(mockUser);  // findOne() là Boot 1/2 API

        User result = userService.findById(1L);

        assertNotNull(result);                // JUnit 4 Assert (không phải AssertJ)
        assertEquals("Alice", result.getName());
        verify(userRepository, times(1)).findOne(1L);
    }

    @Test(expected = ResourceNotFoundException.class)  // ← JUnit 4 exception style
    public void shouldThrowWhenNotFound() {
        when(userRepository.findOne(99L)).thenReturn(null);
        userService.findById(99L);
    }

    @Before                                   // JUnit 4: @Before (không phải @BeforeEach)
    public void setUp() {
        // ReflectionTestUtils vẫn hoạt động với JUnit 4
        // ReflectionTestUtils.setField(userService, "fieldName", "value");
    }
}
```

---

## Service có @Value fields

```java
@ExtendWith(MockitoExtension.class)
class ConfigurableServiceTest {

    @InjectMocks
    private ConfigurableService service;

    @BeforeEach
    void setUp() {
        // Inject @Value fields trực tiếp
        ReflectionTestUtils.setField(service, "threshold", 0.75);
        ReflectionTestUtils.setField(service, "maxItems", 100);
    }
}
```

## Service có static dependencies / utility

```java
// Nếu service gọi static method từ class khác, dùng wrapper hoặc spy:
@ExtendWith(MockitoExtension.class)
class MyServiceTest {
    
    @Spy  // Spy giữ implementation thực, chỉ override method cần thiết
    private TextUtils textUtils = new TextUtils();
    
    @InjectMocks
    private MyService myService;
}
```

## Service có Redis (RedisTemplate)

```java
@ExtendWith(MockitoExtension.class)
class CacheServiceTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @Mock
    private HashOperations<String, Object, Object> hashOperations;

    @InjectMocks
    private CacheService cacheService;

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(redisTemplate.opsForHash()).thenReturn(hashOperations);
    }

    @Test
    void shouldCacheValueSuccessfully() {
        String key = "user:1";
        Object value = "userData";
        
        cacheService.set(key, value, 300L);
        
        verify(valueOperations).set(eq(key), eq(value), eq(300L), eq(TimeUnit.SECONDS));
    }
}
```

## Service có WebClient (gọi HTTP ra ngoài)

```java
// Thêm dependency: testImplementation 'com.squareup.okhttp3:mockwebserver:4.12.0'
@ExtendWith(MockitoExtension.class)
class HttpClientServiceTest {

    private MockWebServer mockWebServer;
    private HttpClientService service;

    @BeforeEach
    void setUp() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();
        
        WebClient webClient = WebClient.builder()
            .baseUrl(mockWebServer.url("/").toString())
            .build();
        service = new HttpClientService(webClient);
    }

    @AfterEach
    void tearDown() throws IOException {
        mockWebServer.shutdown();
    }

    @Test
    void shouldFetchDataSuccessfully() {
        // Enqueue mock response
        mockWebServer.enqueue(new MockResponse()
            .setBody("{\"id\":1,\"name\":\"Alice\"}")
            .addHeader("Content-Type", "application/json"));

        UserDto result = service.fetchUser(1L);

        assertThat(result.getName()).isEqualTo("Alice");
    }
}
```

## Parameterized Tests (test nhiều case)

```java
@ExtendWith(MockitoExtension.class)
class SimilarityServiceTest {

    @InjectMocks
    private SimilarityService service;

    @ParameterizedTest(name = "{index}: ''{0}'' vs ''{1}'' → >= {2}")
    @CsvSource({
        "hello, hello, 1.0",
        "hello, helo, 0.75",
        "abc, xyz, 0.0",
        "'', '', 1.0"
    })
    void shouldCalculateSimilarity(String s1, String s2, double expectedMin) {
        double result = service.similarity(s1, s2);
        assertThat(result).isGreaterThanOrEqualTo(expectedMin);
    }
}
```

## Async / CompletableFuture

```java
@Test
void shouldProcessAsync() throws Exception {
    CompletableFuture<String> future = service.processAsync("input");
    
    String result = future.get(5, TimeUnit.SECONDS);  // timeout để không đợi mãi
    
    assertThat(result).isEqualTo("processed:input");
}
```
