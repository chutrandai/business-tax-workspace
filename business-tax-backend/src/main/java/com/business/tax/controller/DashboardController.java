package com.business.tax.controller;

import com.business.tax.dto.ApiResponse;
import com.business.tax.dto.DashboardStatsResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse(
            1234L,
            "₫125.5M",
            "+8%",
            23,
            "-5%",
            156L,
            "+18%"
        );
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
