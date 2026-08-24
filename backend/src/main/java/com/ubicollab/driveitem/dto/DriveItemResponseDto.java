package com.ubicollab.driveitem.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.enums.DriveItemExtension;
import com.ubicollab.driveitem.enums.DriveItemType;
import com.ubicollab.permission.enums.PermissionType;

// DriveItem에 User, Parent는 객체 그대로 프론트에 보내면 
// 성능이 느려지고, 불필요한 정보들까지 내려올수 있으므로 parentID, userId만 내려보낸다.
public record DriveItemResponseDto(
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
	    Boolean isFavorite, // DriveItem Entity에는 없지만, Response에는 필요한 값
	    PermissionType permissionType // DriveItem Entity에는 없지만, Response에는 필요한 값
	    // isTrashRoot는 API에서만 사용하므로 제외
) {
    
    public DriveItemResponseDto(DriveItem driveItem, Boolean isFavorite, PermissionType permissionType ) {
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
    			permissionType
    	);
    }
}
