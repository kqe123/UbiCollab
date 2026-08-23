package com.ubicollab.permission.dto;

import java.util.List;
import java.util.UUID;
import com.ubicollab.permission.enums.PermissionType;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

//권한 변경 DTO
public record PermissionUpdateDto (
	// DriveItem의 publicId
	@NotNull(message="currentItemId는 필수입니다!")
	UUID currentItemId,
	
	@NotEmpty(message = "권한 변경 대상을 한 개 이상 선택해주세요.")
	@Valid List<PermissionDto> permissionList 
) {
	// 권한 정보 리스트 (DriveItemId, userId, 권한 타입)
	public record PermissionDto(
		@NotNull(message="DriveItemId는 필수입니다!")
		UUID driveItemId,	
			
		@NotNull(message = "userId는 필수입니다.")
		UUID userId,

		@NotNull(message = "PermissionType은 필수입니다.")
		PermissionType type
	) {}
}