package com.ubicollab.user;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ubicollab.user.dto.PresignedUrlRequest;
import com.ubicollab.user.dto.PresignedUrlResponse;
import com.ubicollab.user.dto.UserResponse;

import jakarta.validation.Valid;


@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/user")
public class UserController {
	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}
	
	
	// [회원가입] 회원가입 API (POST 'api/user')
	@PostMapping
	public ResponseEntity<UUID> createUser(@RequestBody User user) {
	    UUID userId = userService.createUser(user);
		return ResponseEntity
	            .status(HttpStatus.CREATED)
	            .body(userId);
	}
	
	// [회원가입] 프로필사진을 업로드하는 Presigned Url를 반환하는 API (POST 'api/user/s3-profile')
	@PostMapping("/s3-profile")
    public ResponseEntity<PresignedUrlResponse> getAvatarUploadUrl(
            @Valid @RequestBody PresignedUrlRequest request) {
        return ResponseEntity.ok(userService.createAvatarUploadUrl(request));
    }
	
	// [회원가입] 프로필 키를  해당 User에 업데이트하는 API (PATCH '/api/user/profileImageKey/{key}')
	@PatchMapping("/profileImageKey/{userId}")
	public ResponseEntity<String> updateProfileImageKey(@PathVariable("userId") UUID userId,
		@Valid @RequestBody Map<String, String> body) {
		
		String profileImageKey = body.get("profileImageKey");
		userService.updateProfileImageKey(profileImageKey, userId);
		return ResponseEntity.status(HttpStatus.OK).body("해당 User에 프로필 사진 URI 업데이트 완료");
	}
	
	// [회원가입] 중복 username 체크 API (GET 'api/user/check-username')
	@GetMapping("/check-username")
	public ResponseEntity<Boolean> checkUsername(
	        @RequestParam("username") String username) {
	    Boolean exists = userService.checkSameUsername(username);
	    return ResponseEntity.status(HttpStatus.OK).body(exists);
	}
	
	// [회원가입] 실시간 username 검색 결과 API (GET 'api/user/search')
	@GetMapping("/search")
	public ResponseEntity<List<UserResponse>> searchUsers(
			@RequestParam("keyword") String keyword,
			@RequestParam("publicId") UUID publicId,
			Authentication authentication) {
		String username = authentication.getName(); // 현재 로그인 username
		return ResponseEntity.status(HttpStatus.OK)
				.body(userService.searchUsers(username, keyword, publicId));
	}
	
	// 현재 로그인중인 유저 반환하는 API (GET 'api/user/currentUser')
	@GetMapping("/currentUser")
	public ResponseEntity<UserResponse> getCurrentUser(
			Authentication authentication) {
			String username = authentication.getName(); // 현재 로그인 username
			return ResponseEntity.status(HttpStatus.OK)
					.body(userService.getCurrentUser(username));
	}

	
}
