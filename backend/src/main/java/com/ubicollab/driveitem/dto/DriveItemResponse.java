package com.ubicollab.driveitem.dto;

import java.time.LocalDateTime;

import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.enums.DriveItemExtension;
import com.ubicollab.driveitem.enums.DriveItemType;

// DriveItem에 User, Parent는 객체 그대로 프론트에 보내면 
// 성능이 느려지고, 불필요한 정보들까지 내려올수 있으므로 parentID, userId만 내려보낸다.
public class DriveItemResponse {
    private Long id;
    private String itemName;
    private DriveItemType type;
    private Long parentId;      
    private Long userId;      
    private String content;
    private DriveItemExtension extension;
    private Long size;
    private LocalDateTime createdDate;
    private Boolean isInTrash;
    
    public DriveItemResponse(DriveItem driveItem) {
        this.id = driveItem.getId();
        this.itemName = driveItem.getItemName();
        this.type = driveItem.getType();
        this.parentId = driveItem.getParent() == null ? null : driveItem.getParent().getId();
        this.userId = driveItem.getUser().getId();
        this.content = driveItem.getContent();
        this.extension = driveItem.getExtension();
        this.size = driveItem.getSize();
        this.createdDate = driveItem.getCreatedDate();
        this.isInTrash = driveItem.getIsInTrash();
    }
    
	public Long getId() {
		return id;
	}
	public String getItemName() {
		return itemName;
	}

	public DriveItemType getType() {
		return type;
	}

	public Long getParentId() {
		return parentId;
	}

	public Long getUserId() {
		return userId;
	}

	public String getContent() {
		return content;
	}

	public DriveItemExtension getExtension() {
		return extension;
	}

	public Long getSize() {
		return size;
	}

	public LocalDateTime getCreatedDate() {
		return createdDate;
	}

	public Boolean getIsInTrash() {
		return isInTrash;
	}

}
