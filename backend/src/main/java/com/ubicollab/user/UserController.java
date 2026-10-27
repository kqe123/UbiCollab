package com.ubicollab.user;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ubicollab.driveitem.dto.DriveItemCreateDto;
import com.ubicollab.user.dto.ProfileChangeDto;
import com.ubicollab.user.dto.PasswordChangeDto;
import com.ubicollab.user.dto.SignupDto;
import com.ubicollab.user.dto.UserResponse;

import jakarta.validation.Valid;


@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/user")
public class UserController {
	private final UserService userService;
	private final JwtService jwtService;

	public UserController(UserService userService, JwtService jwtService) {
		this.userService = userService;
		this.jwtService = jwtService;
	}


	// [회원가입] 회원가입 API (POST 'api/user')
	// User 생성 + 프로필 사진 업로드를 한번에 수행
	// consumes = MediaType.MULTIPART_FORM_DATA_VALUE는 "이 API는 multipart 요청만 받겠다"는 조건(필터)
	// Multipart로 받는다면 @ModelAttribute로 받아야됨
	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> createUser(
			@Valid @ModelAttribute SignupDto request) {
	    userService.createUser(request);
		return ResponseEntity
				.status(HttpStatus.CREATED)
		        .build();
	}
	
	// [회원가입] 중복 username 체크 API (GET 'api/user/check-username')
	@GetMapping("/check-username")
	public ResponseEntity<Boolean> checkUsername(
	        @RequestParam("username") String username) {
	    Boolean exists = userService.checkSameUsername(username);
	    return ResponseEntity.status(HttpStatus.OK).body(exists);
	}
	
	// [공유 추가] 실시간 username 검색 결과 API (GET 'api/user/search')
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
	
	// [프로필 화면] 비밀번호 변경  API (PATCH '/api/user/change-password')
	@PatchMapping("change-password")
	public ResponseEntity<?> changePassword(Authentication authentication,
			@Valid @RequestBody PasswordChangeDto request) {
		String username = authentication.getName(); // 현재 로그인중인 유저
		userService.changePassword(username, request); // 비밀번호 변경
		return ResponseEntity.status(HttpStatus.OK).body("비밀번호 변경 성공");
	}

	// [프로필 화면] 프로필 수정 API (PATCH '/api/user/change-profile')
	@PatchMapping(value="/change-profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> changeProfile(Authentication authentication,
			@Valid @ModelAttribute ProfileChangeDto request) {
		String username = authentication.getName(); // 현재 로그인중인 유저
		userService.changeProfile(username, request); // 프로필 수정
		return ResponseEntity.status(HttpStatus.OK).body("프로필 수정 성공");
	}
	
	// [프로필 화면] 회원 탈퇴  API (DELETE '/api/user/delete')
	@DeleteMapping("/delete")
	public ResponseEntity<String> deleteUser(Authentication authentication) {
		String username = authentication.getName(); // 현재 로그인중인 유저
		userService.deleteUser(username);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}
	
}
