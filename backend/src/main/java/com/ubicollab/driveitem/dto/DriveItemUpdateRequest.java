package com.ubicollab.driveitem.dto;
import com.ubicollab.driveitem.DriveItem;
import jakarta.validation.constraints.Size;

public class DriveItemUpdateRequest {
    @Size(max = 100, message = "아이템 이름은 100자 이하로 입력해주세요.")
    private String itemName;
    
    private DriveItem parent;

    private String content;

    private Boolean isInTrash;
    
    // id : 변경되면 당연히 안됨.
    // type : 폴더 -> 파일, 파일 -> 폴더로 변경되는건 말이 안됨
    // user : 소유권을 변경하면 안됨
    // size : size 변경은 Service 파일에서 알아서 계산할 예정
    // createdDate : updatable = false라서 변경되면 안됨.
    // extension : 확장자를 변경한다는 건 파일이 깨질수 있기 때문에 안됨
	
    // Getter, Setter
	public String getItemName() {
		return itemName;
	}

	public void setItemName(String itemName) {
		this.itemName = itemName;
	}

	public DriveItem getParent() {
		return parent;
	}

	public void setParent(DriveItem parent) {
		this.parent = parent;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public Boolean getIsInTrash() {
		return isInTrash;
	}

	public void setIsInTrash(Boolean isInTrash) {
		this.isInTrash = isInTrash;
	}
	
}