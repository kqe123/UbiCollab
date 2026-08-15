package com.ubicollab.driveitem.dto;
import com.ubicollab.driveitem.DriveItem;
import jakarta.validation.constraints.Size;

public record DriveItemUpdateDto (
	// 파일/폴더명 변경
	@Size(max = 100, message = "아이템 이름은 100자 이하로 입력해주세요.")
    String itemName,
    
    // 부모 변경
    Long parentId,

    // 내용 변경 (파일)
    String content,
    
    // 휴지통 상태 변경
    Boolean isInTrash
    
    // id : 변경되면 당연히 안됨.
    // type : 폴더 -> 파일, 파일 -> 폴더로 변경되는건 말이 안됨
    // user : 소유권을 변경하면 안됨
    // size : size 변경은 Service 파일에서 알아서 계산할 예정
    // createdDate : updatable = false라서 변경되면 안됨.
    // extension : 확장자를 변경한다는 건 파일이 깨질수 있기 때문에 안됨

) {}