package com.ubicollab.permission;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ubicollab.permission.dto.SharedUserResponse;
import com.ubicollab.user.dto.UserResponse;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/permission")
public class PermissionController {
	private final PermissionService permissionService;
	
	public PermissionController (PermissionService permissionService) {
		this.permissionService = permissionService;
	}
	
	// 공유된 사용자들 목록 조회 API (GET 'api/permission/shared')
	@GetMapping("/shared")
	public Iterable<SharedUserResponse> getSharedUsers(
			@RequestParam("publicId") String publicId,
			Authentication authentication) {
		String username = authentication.getName();
		return permissionService.getSharedUsers(username, publicId);
	}
}
