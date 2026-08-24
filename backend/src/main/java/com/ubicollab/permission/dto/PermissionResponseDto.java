package com.ubicollab.permission.dto;

import java.util.UUID;

import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.permission.enums.PermissionType;
import com.ubicollab.user.User;

public record PermissionResponseDto (
	UUID userId,
	String username,
	String nickname,
	String profileImageKey,
	UUID driveItemId,
	PermissionType type
) {
	
	
	public PermissionResponseDto(User user, DriveItem driveItem, PermissionType type) {
		this(
			user.getPublicId(),
			user.getUsername(),
			user.getNickname(),
			user.getProfileImageKey(),
			driveItem.getPublicId(),
			type);
	}
}
