package com.ubicollab.permission.dto;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.permission.enums.PermissionType;
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
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

// 권한 생성 DTO
public record PermissionRequestDto(
    // DriveItem의 publicId
	@NotNull(message="DriveItem의 publicId는 필수입니다!")
	String driveItemId,
	
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