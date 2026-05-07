# QA Engineer Agent — Memory

## Project Stack
- Backend: Spring Boot 3.5.3, Java 21, JUnit 5, Mockito 5.x (built-in), `jakarta.*` imports
- Keycloak Admin Client: 24.0.4
- Build: Gradle (pickle-connect-be/build.gradle), NOT Maven
- Test command: `./gradlew test --tests "com.vnp.pickleball.connect.module.X.*"`

## Test Conventions (confirmed from AchievementServiceTest)
- `@ExtendWith(MockitoExtension.class)` cho Service tests
- `@WebMvcTest(Controller.class)` + `@MockitoBean` (NOT `@MockBean`) cho Controller tests
- Naming: `should_[Expected]_When_[Condition]()`
- Dùng `@Nested` + `@DisplayName` để nhóm test cases theo method
- AssertJ: `assertThat()`, `assertThatThrownBy()`
- KHÔNG dùng `@MockBean` — Spring Boot 3.5.x dùng `@MockitoBean` (từ `org.springframework.test.context.bean.override.mockito`)

## Keycloak Test Pattern
- Mock `KeycloakClientFactory`, `KeycloakProperties` trực tiếp
- Không mock `Keycloak` object trực tiếp — delegate qua service layer (vd: `KeycloakRoleService`)
- Keycloak resources chain: `realm → clients → get(clientUuid) → roles()`

## TDD Red Phase — bopermission module
- Tests tạo tại: `src/test/java/com/vnp/pickleball/connect/module/bopermission/`
- Production classes chưa tồn tại → 100 compilation errors → đúng RED state
- Classes cần Developer tạo:
  - `BoPermissionController` (controller package)
  - `BoPermissionService` (service package)
  - `KeycloakRoleService` (service package)
  - DTOs: `SearchBoPermissionRequest`, `CreateBoPermissionRequest`, `UpdateBoPermissionRequest`, `PermissionItem`
  - Responses: `BoPermissionDTO`, `BoPermissionDetailResponse`, `ResourceTreeNode`, `RoleDropdownItem`

## TDD Red Phase — bo-user module (T-1.7.0.1)
- Test tạo tại: `src/test/java/com/vnp/pickleball/connect/module/management/user/bo_account/constant/BoUserPermissionConstantsTest.java`
- `PermissionResource.BO_USER_PAGE` chưa tồn tại → 3 compilation errors → đúng RED state
- `PermissionScope` (VIEW, CREATE, UPDATE, LOCK, UNLOCK, RESET_PASSWORD) đã có sẵn → sẽ PASS sau khi thêm BO_USER_PAGE
- Developer cần thêm: `public static final String BO_USER_PAGE = "bo-user-page";` vào `PermissionResource.java`

## TDD Red Phase — bo-user module (T-1.7.0.2) — DTO Tests
- Test tạo tại: `src/test/java/com/vnp/pickleball/connect/module/management/user/bo_account/dto/BoUserDtoTest.java`
- 7 DTO classes chưa tồn tại → compilation errors → đúng RED state
- Developer cần tạo tại `src/main/java/.../module/management/user/bo_account/dto/`:
  - `request/SearchBoUserRequest.java` — extends `Paging` (pageNo=1, pageSize=10), 8 optional filter fields
  - `request/CreateBoUserRequest.java` — 7 fields với @NotBlank, @Email, @Pattern(^0[0-9]{9}$), @Size
  - `request/UpdateBoUserRequest.java` — 6 fields (KHÔNG có username — read-only), cùng validation với Create
  - `request/LockBoUserRequest.java` — lockReason @NotBlank @Size(max=500)
  - `response/BoUserDTO.java` — 14 fields: keycloakId, username, fullName, email, phone, position, department, roleGroup, status, lockReason, createdBy, createdAt (LocalDateTime), updatedBy, updatedAt (LocalDateTime)
  - `response/BoUserDetailDTO.java` — tương tự BoUserDTO hoặc extend
  - `response/DropdownItemDTO.java` — value (String), label (String)
- Lưu ý: `Paging` base class đã có tại `common/request/Paging.java` — SearchBoUserRequest nên extend

## DTO Test Pattern (confirmed T-1.7.0.2)
- Dùng Jakarta `Validator` (không cần Spring context) để test @NotBlank, @Email, @Pattern, @Size
- Setup: `ValidatorFactory factory = Validation.buildDefaultValidatorFactory()` trong @BeforeAll
- Kiểm tra field tồn tại: dùng reflection `getFieldFromHierarchy()` để handle superclass fields
- Kiểm tra field KHÔNG tồn tại: `getFieldFromHierarchyOrNull()` trả về null → assertThat(field).isNull()
- Test boundary: luôn test cả max-1, max, max+1 cho @Size constraints

## Constant Test Pattern
- Test constants trong `constant/` package dùng plain JUnit 5 (không cần `@ExtendWith(MockitoExtension.class)`)
- Package test mirror: `src/test/.../module/management/user/bo_account/constant/` tương ứng feature path
- Comment mapping bắt buộc: `// Covers: <path> - Rule/Story <ID>`

## TDD Red Phase — bo-user module (T-1.7.1.1) — KeycloakBoUserService
- Test tạo tại: `src/test/java/.../module/management/user/bo_account/service/KeycloakBoUserServiceTest.java`
- `KeycloakBoUserService` chưa tồn tại → 1 compilation error → đúng RED state
- Developer cần tạo: `src/main/java/.../module/management/user/bo_account/service/KeycloakBoUserService.java`
- Methods cần implement:
  - `searchUsers(SearchBoUserRequest)` → `Page<BoUserDTO>` — Keycloak users + filter by attributes + pagination
  - `getUserDetail(String keycloakId)` → `BoUserDTO`
  - `createUser(CreateBoUserRequest, String createdBy)` → `String keycloakId`
  - `updateUser(String keycloakId, UpdateBoUserRequest, String updatedBy)` → `void`
  - `lockUser(String keycloakId, String lockReason, String updatedBy)` → `void`
  - `unlockUser(String keycloakId, String updatedBy)` → `void`
  - `resetPassword(String keycloakId, String updatedBy)` → `void`
  - `getDepartments()` → `List<DropdownItemDTO>`
  - `getPositions()` → `List<DropdownItemDTO>`
- Keycloak chain: `keycloakClientFactory.getClient("pickle-bo") → keycloak.realm("pickle-connect-bo") → realmResource.users()/groups()`
- BR5 (self-lock/unlock/reset): check keycloakId == updatedBy → throw BusinessException

## TDD Red Phase — bo-user module (T-1.7.1.2) — Controller & Service Tests
- Tests tạo tại:
  - `src/test/java/.../module/management/user/bo_account/controller/BoUserControllerTest.java`
  - `src/test/java/.../module/management/user/bo_account/service/BoUserServiceTest.java`
- Production classes chưa tồn tại → compilation errors → đúng RED state
- Developer cần tạo:
  - `BoUserController.java` — REST controller với các endpoints: search, create, getDetail, update, lock, unlock, resetPassword, getDepartments, getPositions
  - `BoUserService.java` — Service layer, delegate qua KeycloakBoUserService
  - `KeycloakBoUserService.java` — Keycloak Admin API wrapper
- Controller test pattern:
  - `@WebMvcTest(controllers = BoUserController.class, excludeFilters = SecurityConfig.class)`
  - `@MockitoBean` cho service, JwtDecoder, ClientRegistrationRepository
  - MockMvc với `jwt()` post-processor cho authentication
  - Test các scenarios: success, empty result, forbidden (no permission), bad request (self-lock), not found
- Service test pattern:
  - `@ExtendWith(MockitoExtension.class)`
  - Mock `KeycloakBoUserService`, inject vào `BoUserService`
  - Test business logic: search filters, self-lock prevention (BR5), duplicate username (BR1), password generation (BR2)

## Frontend Test Pattern (confirmed T-1.7.1.2)
- Test files:
  - `src/services/__tests__/boUserService.test.ts` — Service layer tests
  - `src/hooks/(admin)/management/user/bo-account/__tests__/useBoUser.test.ts` — Custom hook tests
- Vitest config trong `vite.config.ts`:
  ```ts
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  }
  ```
- Scripts: `pnpm test` (watch mode), `pnpm test:run` (CI mode)
- Service test pattern:
  - Mock `@/utils/api-client` với vi.fn()
  - Test từng method: search, getDetail, create, update, lock, unlock, resetPassword, getDepartments, getPositions
  - Verify API calls với correct paths và request bodies
  - Test error propagation (duplicate username, self-lock, user not found)
- Hook test pattern:
  - Mock service, react-hook-form, notification context
  - Dùng `renderHook` và `act` dari @testing-library/react
  - Test state updates (loading, searchResponse, detail, departments, positions)
  - Test async operations và error handling

## BoUser Feature — Test Coverage Map
| Test File | Stories Covered | Business Rules |
|-----------|-----------------|----------------|
| BoUserControllerTest.java | US-1.7.1..1.7.6 | BR1, BR5, BR6, BR7, BR8 |
| BoUserServiceTest.java | US-1.7.1..1.7.6 | BR1, BR2, BR3, BR4, BR5, BR6, BR7, BR8 |
| boUserService.test.ts | US-1.7.1..1.7.6 | BR1, BR5 |
| useBoUser.test.ts | US-1.7.1..1.7.6 | BR1, BR5 |

## Keycloak Test Pattern (updated for bo-user)
- Mock full Keycloak chain: `KeycloakClientFactory → Keycloak → RealmResource → UsersResource/GroupsResource → UserResource/GroupResource`
- @BeforeEach setup: `when(keycloakClientFactory.getClient(CLIENT_KEY)).thenReturn(keycloak)` → `when(keycloak.realm(REALM)).thenReturn(realmResource)` → etc.
- `KeycloakUserManager` inject qua mock — delegate pattern, không gọi Keycloak trực tiếp
- Dùng `atLeastOnce()` khi verify các calls có thể được gọi nhiều lần (vd: joinGroup)
- `jakarta.ws.rs.NotFoundException` → catch trong service → throw `BusinessException`

## Pitfalls
- `@MockBean` deprecated → dùng `@MockitoBean` trong Spring Boot 3.5.x
- Existing test files có thể bị comment-out hoàn toàn (xem CourtPaymentServiceTest) — pattern bình thường trong project này
- Gradle build dir sử dụng `build/` không phải `target/`
- Build tool là Gradle (NOT Maven) — dùng `./gradlew`, không dùng `mvn`
