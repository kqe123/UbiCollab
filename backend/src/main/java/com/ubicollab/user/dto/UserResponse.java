package com.ubicollab.user.dto;

import java.util.UUID;

import com.ubicollab.user.User;

public record UserResponse (
	UUID publicId, // User의 PublicId
	String username, // User의 아이디
	String nickname, // User의 닉네임
	String profileUri // User의 프로필 사진 Uri
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
