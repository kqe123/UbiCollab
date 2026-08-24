package com.ubicollab.permission.dto;
import java.util.List;
import java.util.UUID;
import com.ubicollab.permission.enums.PermissionType;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

// 권한 생성 DTO
public record PermissionCreateDto(
    // DriveItem의 publicId
	@NotNull(message="DriveItem의 publicId는 필수입니다!")
	UUID driveItemId,
	
	// 공유 대상
	@NotEmpty(message = "공유 대상을 한 명 이상 선택해주세요.")
	@Valid List<UserDto> userList 
) {
	//개별 유저-권한 항목 DTO (userId, type만 담당)
	public record UserDto(
	    @NotNull(message = "userId는 필수입니다.")
		UUID userId,

		@NotNull(message = "PermissionType은 필수입니다.")
		PermissionType type
	) {}
}