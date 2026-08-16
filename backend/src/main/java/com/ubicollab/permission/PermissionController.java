package com.ubicollab.permission;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ubicollab.permission.dto.PermissionCreateDto;
import com.ubicollab.permission.dto.SharedUserResponse;
import com.ubicollab.user.dto.UserResponse;

import jakarta.validation.Valid;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/permission")
public class PermissionController {
	private final PermissionService permissionService;
	
	public PermissionController (PermissionService permissionService) {
		this.permissionService = permissionService;
	}

	// 공유된 사용자들 목록 조회 API (GET 'api/permission/create')
	@PostMapping("/create")
	public ResponseEntity<Integer> createPermission(
		@Valid @RequestBody PermissionCreateDto request,
		Authentication authentication) {
		
		String username = authentication.getName();
		int permissionCount = permissionService.createPermission(username, request);
		return ResponseEntity
		        .status(HttpStatus.CREATED)
		        .body(permissionCount);
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
