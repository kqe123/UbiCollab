package com.ubicollab.permission.dto;

import java.util.UUID;

import com.ubicollab.permission.enums.PermissionType;
import com.ubicollab.user.User;

public record SharedUserResponse (
	Long id,
	UUID publicId,
	String username,
	String nickname,
	String profileImageKey,
	PermissionType type
) {
	
	
	public SharedUserResponse(User user, PermissionType type) {
		this(user.getId(),
			user.getPublicId(),
			user.getUsername(),
			user.getNickname(),
			user.getProfileImageKey(),
			type);
	}
}
