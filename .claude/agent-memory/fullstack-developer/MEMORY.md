# Fullstack Developer Agent Memory

## Project Build Tools
- Backend `pickle-connect-be` dùng **Gradle** (KHÔNG phải Maven)
  - Run test: `./gradlew test --tests "com.vnp.pickleball.connect.module.management.user.bo_account.dto.BoUserDtoTest"`
  - Build: `./gradlew build`
- Frontend `pickle-connect-fe` dùng npm/vite

## Backend Conventions (pickle-connect-be)

### Package Structure
- Base package: `com.vnp.pickleball.connect`
- Module path: `module.management.user.bo_account` (dùng underscore cho sub-package)
- DTO sub-packages: `.dto.request` và `.dto.response`

### Paging Base Class
- File: `com.vnp.pickleball.connect.common.request.Paging`
- Fields: `pageNo = 1` (default), `pageSize = 10` (default) — kiểu `Integer`
- Có `@Min(1)` và `@Max(100)` validation
- Search request extends `Paging` để inherit pagination

### Lombok Patterns
- Request DTOs: `@Getter @Setter @NoArgsConstructor`
- Response DTOs: `@Getter @Setter @NoArgsConstructor`
- Search Request: `@Getter @Setter` (extends Paging — Paging không có @NoArgsConstructor)

### Validation Annotations (Jakarta)
- `@NotBlank` — required string (không blank)
- `@Size(max = N)` — max length
- `@Email` — email format
- `@Pattern(regexp = "...")` — regex validation
- Import: `jakarta.validation.constraints.*`

## DTO Patterns Confirmed

### SearchRequest (dùng Paging)
```java
@Getter @Setter
public class SearchXxxRequest extends Paging {
    private String field1;
    private String field2;
    // all optional, no validation annotations
}
```

### CreateRequest (validation bắt buộc)
```java
@Getter @Setter @NoArgsConstructor
public class CreateXxxRequest {
    @NotBlank @Size(max = 50) private String username;
    @NotBlank @Email @Size(max = 150) private String email;
    @NotBlank @Pattern(regexp = "^0[0-9]{9}$") private String phone;
    @NotBlank private String otherField;
}
```

### ResponseDTO
```java
@Getter @Setter @NoArgsConstructor
public class XxxDTO {
    private String stringField;
    private LocalDateTime timestampField; // dùng LocalDateTime không phải String
}
```
