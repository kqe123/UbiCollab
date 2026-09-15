package com.ubicollab.permission;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ubicollab.driveitem.dto.DriveItemResponseDto;
import com.ubicollab.permission.dto.PermissionCreateDto;
import com.ubicollab.permission.dto.PermissionResponseDto;
import com.ubicollab.permission.dto.PermissionUpdateDto;
import com.ubicollab.permission.dto.SharedItemResponseDto;

import jakarta.validation.Valid;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/permission")
public class PermissionController {
	private final PermissionService permissionService;
	
	public PermissionController (PermissionService permissionService) {
		this.permissionService = permissionService;
	}

	// [공유 추가 메뉴] 공유된 사용자들 목록 조회 API (GET 'api/permission/create')
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
	
	// [권한 관리 메뉴] 권한 업데이트 API (PATCH 'api/permission/update')
	@PatchMapping("/update") 
	public ResponseEntity<Integer> updatePermission(
			@Valid @RequestBody PermissionUpdateDto request,
			Authentication authentication) {
		String username = authentication.getName();
		int permissionCount = permissionService.updatePermission(username, request);
		return ResponseEntity
		        .status(HttpStatus.OK)
		        .body(permissionCount);
	}
		
	
	// [권한 관리 메뉴] 공유된 사용자들 목록 조회 API (GET 'api/permission/sharedUser')
	@GetMapping("/sharedUser")
	public ResponseEntity<List<PermissionResponseDto>> getSharedUsers(
			@RequestParam("publicId") UUID publicId,
			Authentication authentication) {
		String username = authentication.getName();
		return ResponseEntity.status(HttpStatus.OK)
				.body(permissionService.getSharedUsers(username, publicId));
	}
	
	// [공유 문서] 공유된 디렉토리 조회 API (GET 'api/permission/sharedItems')
	@GetMapping("/sharedItems")
	public ResponseEntity<List<SharedItemResponseDto>> getSharedDriveItems(
			@RequestParam(value = "parentId", required = false) UUID parentId,
			Authentication authentication) {
			String username = authentication.getName();
			return ResponseEntity.status(HttpStatus.OK)
				.body(permissionService.getSharedDriveItems(username, parentId));
	}
	
	// [공유 문서] 현재 경로 가져오기 API (GET '/api/permission/path/{id}')
	@GetMapping("/path/{foldId}")
	public ResponseEntity<List<DriveItemResponseDto>> getDrivePath(@PathVariable("foldId") UUID foldId,
			Authentication authentication) {
		String username = authentication.getName();
		return ResponseEntity.status(HttpStatus.OK)
				.body(permissionService.getDrivePath(foldId, username));
	}
	
	// [권한 관리 메뉴] 권한 삭제  API (DELETE '/api/permission/delete/{userId}/{driveItemId}')
		@DeleteMapping("/delete/{userId}/{driveItemId}")
		public ResponseEntity<String> deletePermission(@PathVariable("userId") UUID userId,
				@PathVariable("driveItemId") UUID driveItemId,
				Authentication authentication) {
			String username = authentication.getName();
			permissionService.deletePermission(userId, driveItemId, username);
			return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}
	

}
