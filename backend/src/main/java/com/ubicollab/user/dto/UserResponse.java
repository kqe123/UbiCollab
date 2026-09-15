package com.ubicollab.user.dto;

import java.util.UUID;

import com.ubicollab.user.User;

public record UserResponse (
	UUID publicId,
	String username,
	String nickname,
	String profileUri
) {
	public UserResponse(User user, String profileUri) {
		this(
			user.getPublicId(),
			user.getUsername(),
			user.getNickname(),
			profileUri
		);
	}
}
