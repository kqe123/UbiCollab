package com.ubicollab.driveitem.dto;
import java.util.UUID;

import com.ubicollab.driveitem.DriveItem;
import jakarta.validation.constraints.Size;

// 파일 저장  DTO
public record FileSaveDto (
	// 파일명
	@Size(max = 100, message = "아이템 이름은 100자 이하로 입력해주세요.")
    String itemName,

    // 내용(파일)
    String content

) {}