package com.ubicollab.permission.dto;

import java.util.UUID;

import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.permission.enums.PermissionType;
import com.ubicollab.user.User;

public record PermissionResponseDto (
	UUID userId,
	String username,
	String nickname,
	String profileUri,
	UUID driveItemId,
	PermissionType type,
	Boolean isOwner   // 추가
) {
	
	
	public PermissionResponseDto(User user,String profileUri, DriveItem driveItem, PermissionType type) {
		this(
            user.getPublicId(), 
			user.getUsername(), 
			user.getNickname(), 
			profileUri,
            driveItem.getPublicId(), 
			type,
            driveItem.getUser().getPublicId().equals(user.getPublicId())   // 추가
        );
	}
}
