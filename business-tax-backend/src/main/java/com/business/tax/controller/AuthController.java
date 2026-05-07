package com.business.tax.controller;

import com.business.tax.dto.ApiResponse;
import com.business.tax.dto.LoginRequest;
import com.business.tax.dto.LoginResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {
        // TODO: Implement JWT authentication with database user lookup
        // This is a placeholder that returns a mock successful response

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Email is required"));
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Password is required"));
        }

        // Placeholder token - replace with real JWT generation after User entity is created
        LoginResponse response = new LoginResponse(
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder_token",
                "Bearer",
                3600L
        );

        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // TODO: Implement token invalidation
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }
}