package com.ubicollab.permission.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.enums.DriveItemExtension;
import com.ubicollab.driveitem.enums.DriveItemType;
import com.ubicollab.permission.enums.PermissionType;

public record SharedItemResponseDto(
		UUID publicId,
	    String itemName,
	    DriveItemType itemType,
	    UUID parentId,
	    UUID userId, 
	    String content,
	    DriveItemExtension extension,
	    Long size,
	    LocalDateTime createdDate,
	    Boolean isInTrash,
	    Boolean isFavorite,
	    PermissionType permissionType,
		Boolean isOwner   // 추가
	    // DriveItem Entity에는 없지만, Response에는 필요한 값
	    // isTrashRoot는 API에서만 사용하므로 제외
) {
	    public SharedItemResponseDto (DriveItem driveItem, Boolean isFavorite, PermissionType permissionType, Boolean isOwner) {
			this(	driveItem.getPublicId(),
					driveItem.getItemName(),
					driveItem.getType(),
					driveItem.getParent() == null ? null : driveItem.getParent().getPublicId(),
					driveItem.getUser().getPublicId(),
					driveItem.getContent(),
	    			driveItem.getExtension(),
	    			driveItem.getSize(),
	    			driveItem.getCreatedDate(),
	    			driveItem.getIsInTrash(),
	    			isFavorite,
	    			permissionType,
					isOwner
			);
		}
}
