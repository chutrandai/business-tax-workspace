## Tài liệu tham khảo cho Spring Boot Unit Test Skill

### version-matrix.md ⭐ (Đọc trước tiên)
**Bảng so sánh toàn diện** theo từng version Spring Boot:
- Boot 1.x → JUnit 4, `javax.*`, PowerMock
- Boot 2.0–2.1 → JUnit 4 default, JUnit 5 opt-in
- Boot 2.2–2.7 → JUnit 5 default, `javax.*`, `mockito-inline` riêng
- Boot 3.x → JUnit 5, **`jakarta.*`**, mockito-inline built-in, Java 17+
- Checklist riêng cho từng version

### service-unit-test.md
Templates cho **Service layer unit tests** sử dụng `@ExtendWith(MockitoExtension.class)`:
- Template cơ bản với `@Mock`, `@InjectMocks`
- Service có `@Value` fields → dùng `ReflectionTestUtils`
- Service có Redis/RedisTemplate → mock `ValueOperations`, `HashOperations`
- Service có WebClient (HTTP call) → dùng `MockWebServer`
- Parameterized tests với `@CsvSource`
- Async / CompletableFuture tests

### controller-test.md
Templates cho **REST Controller tests** sử dụng `@WebMvcTest`:
- Template cơ bản với `MockMvc`, `@MockBean`
- Test HTTP status codes (200, 201, 400, 404, 204)
- Test JSON response với `jsonPath()`
- Controller có Spring Security → `@WithMockUser`
- Test file upload với `MockMultipartFile`
- Test response headers

### repository-test.md
Templates cho **JPA Repository tests** sử dụng `@DataJpaTest`:
- Template cơ bản với `TestEntityManager`
- Setup test data với `persistAndFlush()`
- Test custom JPQL queries
- Load test data từ SQL files với `@Sql`
- Testcontainers cho real PostgreSQL test

### integration-test.md
Templates cho **Integration tests** sử dụng `@SpringBootTest`:
- End-to-end test với `RANDOM_PORT` + `TestRestTemplate`
- Test với `MockMvc` + `AutoConfigureMockMvc`
- Cấu hình `application-test.yml`
- Disable Redis/external services với `@MockBean`
- `@TestConfiguration` — custom beans cho test
- Verify database state sau operations

### utility-test.md
Templates cho **Utility classes và static method tests**:
- JUnit 5 thuần (không cần Spring context)
- Parameterized tests: `@CsvSource`, `@NullAndEmptySource`, `@ValueSource`
- Test similarity/math functions với tolerance (`within(0.01)`)
- Test exception handling
- Test collections
- AssertJ cheat sheet đầy đủ
