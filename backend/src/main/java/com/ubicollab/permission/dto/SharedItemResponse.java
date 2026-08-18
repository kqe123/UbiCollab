package com.ubicollab.permission.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.enums.DriveItemExtension;
import com.ubicollab.driveitem.enums.DriveItemType;

public record SharedItemResponse(
		String publicId,
	    String itemName,
	    DriveItemType type,
	    String parentId,
	    UUID userId, 
	    String content,
	    DriveItemExtension extension,
	    Long size,
	    LocalDateTime createdDate,
	    Boolean isInTrash,
	    Boolean isFavorite // DriveItem Entity에는 없지만, Response에는 필요한 값
	    // isTrashRoot는 API에서만 사용하므로 제외
) {
	    public SharedItemResponse (DriveItem driveItem, Boolean isFavorite) {
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
	    			isFavorite
					);
		}
}
