package com.ubicollab.user;

import java.util.List;

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

import com.ubicollab.user.dto.UserResponse;


@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/user")
public class UserController {
	private final UserService userService;
	
	public UserController(UserService userService) {
		this.userService = userService;
	}
	
	// 회원가입 API (POST 'api/user')
	@PostMapping
	public ResponseEntity<User> createUser(@RequestBody User user) {
	    userService.createUser(user);
		return ResponseEntity
	            .status(HttpStatus.CREATED)
	            .build();
	}
	
	// 중복 username 체크 API (GET 'api/user/check-username')
	@GetMapping("/check-username")
	public ResponseEntity<Boolean> checkUsername(
	        @RequestParam("username") String username) {
	    Boolean exists = userService.checkSameUsername(username);
	    return ResponseEntity.status(HttpStatus.OK).body(exists);
	}
	
	// 실시간 username 검색 결과 API (GET 'api/user/search')
	@GetMapping("/search")
	public ResponseEntity<List<UserResponse>> searchUsers(
			@RequestParam("keyword") String keyword,
			@RequestParam("publicId") String publicId,
			Authentication authentication) {
		String username = authentication.getName(); // 현재 로그인 username
		return ResponseEntity.status(HttpStatus.OK)
				.body(userService.searchUsers(username, keyword, publicId));
	}

	
}
