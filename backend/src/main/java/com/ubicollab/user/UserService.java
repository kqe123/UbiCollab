package com.ubicollab.user;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.DriveItemRepository;
import com.ubicollab.user.dto.UserResponse;


@Service
public class UserService {
	private final UserRepository userRepository;
	private final DriveItemRepository driveRepository;
	private final PasswordEncoder passwordEncoder;

	
	public UserService (UserRepository userRepository,
			DriveItemRepository driveRepository,
			PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.driveRepository = driveRepository;
		this.passwordEncoder = passwordEncoder;
		
	}
	
	// User를 생성하는 메서드
	public User createUser(User user) {
		String username = user.getUsername();
		String password = user.getPassword();
		String nickname = user.getNickname();
		String profileImageKey = user.getProfileImageKey();
		
		// 유효성 검사
		if (username == null || username.isBlank()) {
	        throw new IllegalArgumentException("username은 필수입니다.");
	    }
		
		if (password == null || password.isBlank()) {
	        throw new IllegalArgumentException("password은 필수입니다.");
	    }
		
		if (nickname == null || nickname.isBlank()) {
	        throw new IllegalArgumentException("nickname은 필수입니다.");
	    }
		
		// User 객체 생성 (username, password, nickname, createdDate, role, profileImageKey)
		// password는 Bean으로 등록된 passwordEncoder를 사용해 암호화한다.
		User newUser = new User(username, passwordEncoder.encode(password), nickname,
								LocalDateTime.now(),"USER", profileImageKey);
		
		// 저장 + User 객체 반환
		return userRepository.save(newUser);
	}
	
	// 중복 username 검사 메서드
	public Boolean checkSameUsername(String username) {
	    return userRepository.findByUsername(username).isPresent();
	}
	
	// username 검색 엔진 메서드
	public Iterable<UserResponse> searchUsers(String username, String keyword) {
		List<UserResponse> result = new ArrayList<>();
		List<User> users = userRepository.searchByUsername(keyword);
		for (User user : users) {
			result.add(new UserResponse(user));
			System.out.println("유저명 : " + user.getUsername());
		}
		return result;
	}
	
	// 공유 사용자 목록 조회 메서드
	public Iterable<UserResponse> getSharedUsers(String username, String publicId) {
		List<UserResponse> result = new ArrayList<>();
		
		// result에 소유자 추가
		DriveItem driveItem = driveRepository.findByPublicId(publicId).orElseThrow(
				() -> new RuntimeException("문서를 찾을 수 없습니다. publicId="+ publicId));
		User owner = driveItem.getUser(); // 파일/폴더 소유자
		result.add(new UserResponse(owner));
		
		// result에 권한 소유자 추가
		
		return result;
	}
	
}
