package com.ubicollab.user;

import java.time.LocalDateTime;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class UserService {
	private final UserRepository repository;
	private final PasswordEncoder passwordEncoder;

	
	public UserService (UserRepository repository,
			PasswordEncoder passwordEncoder) {
		this.repository = repository;
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
		return repository.save(newUser);
	}
	
	public Boolean checkSameUsername(String username) {
	    return repository.findByUsername(username).isPresent();
	}
}
