# Controller Test Template

Dùng cho: REST Controller — test HTTP request/response, validation, status codes.

> **Trước khi viết**: Xác định Spring Boot version trong `build.gradle`/`pom.xml`.
> - Boot **2.2+ và 3.x**: dùng template bên dưới (JUnit 5, `@ExtendWith` không cần)
> - Boot **1.x và 2.0–2.1**: xem section **[Template JUnit 4]** cuối file
> - Boot **3.x**: import `jakarta.*` thay vì `javax.*` trong code đang test

## Dependency cần có

```groovy
testImplementation 'org.springframework.boot:spring-boot-starter-test'
// Nếu có Spring Security:
testImplementation 'org.springframework.security:spring-security-test'
```

## Template cơ bản — @WebMvcTest

```java
package com.example.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)           // Chỉ load MVC layer cho UserController
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;      // Có sẵn trong Spring context

    @MockBean                               // ← PHẢI dùng @MockBean (không phải @Mock)
    private UserService userService;

    @Test
    @DisplayName("GET /users/{id} → 200 OK với user data")
    void shouldReturnUserWhenFound() throws Exception {
        // Arrange
        UserDto mockUser = new UserDto(1L, "Alice", "alice@example.com");
        when(userService.findById(1L)).thenReturn(mockUser);

        // Act & Assert
        mockMvc.perform(get("/users/1")
                .contentType(MediaType.APPLICATION_JSON))
            .andDo(print())                 // In kết quả ra console khi test fail
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.name").value("Alice"))
            .andExpect(jsonPath("$.email").value("alice@example.com"));
    }

    @Test
    @DisplayName("POST /users → 201 Created")
    void shouldCreateUserSuccessfully() throws Exception {
        // Arrange
        CreateUserRequest request = new CreateUserRequest("Bob", "bob@example.com");
        UserDto createdUser = new UserDto(2L, "Bob", "bob@example.com");
        when(userService.createUser(any(CreateUserRequest.class))).thenReturn(createdUser);

        // Act & Assert
        mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(2L))
            .andExpect(header().string("Location", "/users/2"));
    }

    @Test
    @DisplayName("GET /users/{id} → 404 khi không tìm thấy")
    void shouldReturn404WhenUserNotFound() throws Exception {
        when(userService.findById(99L)).thenThrow(new ResourceNotFoundException("User not found"));

        mockMvc.perform(get("/users/99"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.message").value("User not found"));
    }

    @Test
    @DisplayName("POST /users → 400 Bad Request khi thiếu required fields")
    void shouldReturn400WhenInvalidRequest() throws Exception {
        // Gửi body rỗng — sẽ fail validation
        mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DELETE /users/{id} → 204 No Content")
    void shouldDeleteUserSuccessfully() throws Exception {
        mockMvc.perform(delete("/users/1"))
            .andExpect(status().isNoContent());

        verify(userService, times(1)).deleteById(1L);
    }
}
```

## Controller có Security (@WithMockUser)

```java
@WebMvcTest(UserController.class)
@Import(SecurityConfig.class)               // Import config security nếu cần
class SecuredControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Test
    @WithMockUser(roles = "ADMIN")          // Giả lập user đã login
    void shouldAllowAdminToDeleteUser() throws Exception {
        mockMvc.perform(delete("/users/1"))
            .andExpect(status().isNoContent());
    }

    @Test
    void shouldReturn401WhenNotAuthenticated() throws Exception {
        mockMvc.perform(delete("/users/1"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")           // User thường không có quyền
    void shouldReturn403WhenUserNotAuthorized() throws Exception {
        mockMvc.perform(delete("/users/1"))
            .andExpect(status().isForbidden());
    }
}
```

## Kiểm tra JSON Response phức tạp (List, Nested)

```java
@Test
void shouldReturnListOfUsers() throws Exception {
    List<UserDto> users = List.of(
        new UserDto(1L, "Alice", "alice@example.com"),
        new UserDto(2L, "Bob", "bob@example.com")
    );
    when(userService.findAll()).thenReturn(users);

    mockMvc.perform(get("/users"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(2))
        .andExpect(jsonPath("$[0].name").value("Alice"))
        .andExpect(jsonPath("$[1].name").value("Bob"));
}

@Test
void shouldReturnNestedObject() throws Exception {
    when(userService.findById(1L)).thenReturn(userWithAddress);

    mockMvc.perform(get("/users/1"))
        .andExpect(jsonPath("$.address.city").value("Hanoi"))
        .andExpect(jsonPath("$.address.country").value("VN"));
}
```

## Test File Upload

```java
@Test
void shouldUploadFileSuccessfully() throws Exception {
    MockMultipartFile file = new MockMultipartFile(
        "file",                             // Tên field
        "test.csv",                         // Tên file
        "text/csv",                         // Content type
        "header1,header2\nval1,val2".getBytes()
    );

    mockMvc.perform(multipart("/upload").file(file))
        .andExpect(status().isOk());
}
```

## Kiểm tra Response Headers

```java
@Test
void shouldHaveCorrectResponseHeaders() throws Exception {
    mockMvc.perform(get("/data/export"))
        .andExpect(status().isOk())
        .andExpect(header().string("Content-Type", "application/json"))
        .andExpect(header().exists("X-Request-Id"));
}
```

## Tips

- `@WebMvcTest` **fast** — chỉ load MVC slice, không load full context
- Luôn mock tất cả `@Service` và `@Repository` bằng `@MockBean`
- Dùng `.andDo(print())` để debug khi test fail
- Khi test void controller method (không trả về body), dùng `verify()` để kiểm tra service đã được gọi

---

## Template JUnit 4 (Spring Boot 1.x và 2.0–2.1)

```java
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;  // ← JUnit 4 runner cho Spring
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)          // ← dùng SpringRunner với JUnit 4 (không phải @ExtendWith)
@WebMvcTest(UserController.class)
public class UserControllerTest {     // ← class phải public

    @Autowired
    private MockMvc mockMvc;

    @MockBean                         // @MockBean vẫn dùngđược với JUnit 4 + Spring Runner
    private UserService userService;

    @Test
    public void shouldReturnUser() throws Exception {   // ← method phải public
        when(userService.findById(1L)).thenReturn(new UserDto(1L, "Alice", "alice@test.com"));

        mockMvc.perform(get("/users/1"))
            .andExpect(status().isOk());
    }
}
```
