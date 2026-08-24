package com.ubicollab.user;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ubicollab.common.exception.PermissionDeniedException;
import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.DriveItemRepository;
import com.ubicollab.permission.PermissionService;
import com.ubicollab.permission.enums.PermissionType;
import com.ubicollab.user.dto.UserResponse;


@Service
public class UserService {
	private final UserRepository userRepository;
	private final DriveItemRepository driveRepository;
	private final PasswordEncoder passwordEncoder;
	private final PermissionService permissionService;


	public UserService (UserRepository userRepository,
			DriveItemRepository driveRepository,
			PasswordEncoder passwordEncoder,
			PermissionService permissionService) {
		this.userRepository = userRepository;
		this.driveRepository = driveRepository;
		this.passwordEncoder = passwordEncoder;
		this.permissionService = permissionService;

	}
	
	// User를 생성하는 메서드
	public void createUser(User user) {
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
		
		// User 저장
		userRepository.save(newUser);
	}
	
	// 중복 username 검사 메서드 
	public Boolean checkSameUsername(String username) {
	    return userRepository.findByUsername(username).isPresent();
	}
	
	// username 검색 엔진 메서드
	public List<UserResponse> searchUsers(String username, String keyword, UUID publicId) {
		List<UserResponse> result = new ArrayList<>();

		// 현재 로그인 유저
		User currentUser = userRepository.findByUsername(username).orElseThrow(
				() -> new RuntimeException("User를 찾을 수 없습니다. : " + username));

		// 현재 DriveItem
		DriveItem driveItem = driveRepository.findByPublicId(publicId).orElseThrow(
				() -> new RuntimeException("해당 아이템을 찾을 수 없습니다. publicId="+ publicId));

		// [권한 제어] 공유 대상을 검색하는 API이므로, createPermission과 동일하게 OWNER | MANAGER 권한 필요
		PermissionType permissionType = permissionService.getPermission(driveItem, currentUser);
		if (permissionType != PermissionType.OWNER && permissionType != PermissionType.MANAGER) {
			throw new PermissionDeniedException("사용자를 검색할 권한이 없습니다.");
		}

		// 해당 키워드를 기반으로 검색 결과 반환 (소유자(Owner),자기 자신 ,이미 공유중인 사용자들 제외)
		List<User> users = userRepository.searchByUsername(keyword, driveItem.getUser().getUsername(), publicId);
		for (User user : users) {
			if (username.equals(user.getUsername())) {
				continue;
			}
			result.add(new UserResponse(user));
			System.out.println("유저명 : " + user.getUsername());
		}
		return result;
	}

	
}
