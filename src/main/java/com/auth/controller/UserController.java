package com.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class UserController {

    @GetMapping("/api/user/profile")
    public ResponseEntity<Map<String, String>> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(Map.of(
                "email", userDetails.getUsername(),
                "role", userDetails.getAuthorities().iterator().next().getAuthority(),
                "message", "Profile retrieved successfully"
        ));
    }

    @GetMapping("/api/admin/dashboard")
    public ResponseEntity<Map<String, String>> adminDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to the admin dashboard",
                "adminEmail", userDetails.getUsername()
        ));
    }
}
