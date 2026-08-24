package com.ubicollab.driveitem.dto;
import java.time.LocalDateTime;
import java.util.UUID;

import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.enums.DriveItemExtension;
import com.ubicollab.driveitem.enums.DriveItemType;
import com.ubicollab.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;


public record DriveItemCreateDto(
	    @NotBlank(message = "아이템 이름은 필수입니다.")
	    @Size(max = 100, message = "아이템 이름은 100자 이하로 입력해주세요.")
	    String itemName,

	    @NotNull(message = "타입은 필수입니다.")
	    DriveItemType type,

	    // parent는 string | null일 수도 있으므로 검증 X
	    UUID parentPublicId,

	    // content도 null일 수도 있으므로 검증 X
	    String content,

	    // extension도 null일 수도 있으므로 검증 X
	    DriveItemExtension extension

	    // id : 자동 생성이니 필요 X
	    // createdDate : 현재 시간 기준으로 자동 생성이니 필요 X
	    // size : 파일이라면 Service안에서 계산할 것이라 지금 필요 X
	    // user : 유저는 Authorization 헤더를 통해 받고, Json으로 받지 않음.
	    // isInTrash : 기본값이 false이므로 필요 X
	    // isTrashRoot : 기본값이 false이므로 필요 X
) {}