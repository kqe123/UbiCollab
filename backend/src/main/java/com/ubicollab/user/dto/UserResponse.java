package com.ubicollab.user.dto;

import java.util.UUID;

import com.ubicollab.user.User;

public record UserResponse (
	Long id,
	UUID publicId,
	String username,
	String nickname,
	String profileImageKey 
) {
	public UserResponse(User user) {
		this(user.getId(),
			user.getPublicId(),
			user.getUsername(),
			user.getNickname(),
			user.getProfileImageKey()
		);
	}
		
}
