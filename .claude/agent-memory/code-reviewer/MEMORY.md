# Code Reviewer — Memory

## Lỗi phổ biến của fullstack-developer

### [DTO Layer]
1. **DRY violation — BoUserDetailDTO = BoUserDTO 100%** (T-1.7.0.2)
   - Developer tạo 2 class response giống nhau hoàn toàn (field-for-field identical).
   - Fix: Dùng 1 class duy nhất, hoặc BoUserDetailDTO extends BoUserDTO nếu có field thêm.
   - Xem chi tiết: `dto-patterns.md`

2. **Thiếu validation message** (T-1.7.0.2)
   - Constraints như @NotBlank, @Size, @Pattern không có `message` attribute.
   - Convention project: dùng tiếng Việt cho message (xem BasePlayerCreateRequest, CreatePermissionGroupRequest).
   - Fix: Thêm `message = "..."` vào mọi constraint annotation.

3. **Thiếu @Pattern cho username** (T-1.7.0.2)
   - Spec yêu cầu username "không dấu, không khoảng trắng" nhưng CreateBoUserRequest chỉ có @NotBlank + @Size.
   - Fix: Thêm `@Pattern(regexp = "^[a-zA-Z0-9._-]+$")`.

4. **Inconsistent Lombok usage** (T-1.7.0.2)
   - Một số DTOs dùng @Getter+@Setter, một số khác (existing) dùng @Data.
   - Convention project không thống nhất, nhưng management module dùng @Getter+@Setter.
   - Review cần kiểm tra consistency với module cùng domain.

5. **DropdownItemDTO không có trong Implementation Plan của spec** (T-1.7.0.2)
   - Developer thêm file DropdownItemDTO.java nằm ngoài Implementation Plan (Section 9).
   - Tuy nhiên file này hợp lý vì spec có endpoints `/departments`, `/positions`.
   - Chấp nhận được nhưng cần note trong báo cáo.

6. **SearchBoUserRequest thiếu @NoArgsConstructor** (T-1.7.0.2)
   - CreateBoUserRequest và UpdateBoUserRequest có @NoArgsConstructor.
   - SearchBoUserRequest extends Paging nên đã có default constructor, nhưng nên thống nhất.

## Project Conventions đã xác nhận

### Lombok
- `management/` module: dùng `@Getter + @Setter + @NoArgsConstructor` (không dùng @Data)
- `player/` module: dùng `@Data`
- Khi review DTO trong cùng domain → so sánh với sibling class trong cùng module

### Validation
- Mọi constraint annotation phải có `message` bằng tiếng Việt
- Tham chiếu: `BasePlayerCreateRequest.java`, `CreatePermissionGroupRequest.java`

### Base class pattern
- Project đã có tiền lệ dùng base class: `BasePlayerCreateRequest` → `PlayerCreateRequest` extends, `PlayerUpdateRequest` extends
- Khi Create và Update có nhiều field giống nhau → extract `BaseBoUserRequest` là best practice

### Test file
- Traceability comments (`// Covers: docs/...`) phải ở đầu file VÀ trên mỗi @Test
- Format: `// Covers: docs/[path] - [Section/AC description]`
- TDD Phase RED comment ở Javadoc class

## Kiến trúc module management/user/bo_account
- Path: `module/management/user/bo_account/`
- Dữ liệu nguồn: Keycloak (KHÔNG phải PostgreSQL)
- Sibling module tham khảo: `management/permission_group/`
