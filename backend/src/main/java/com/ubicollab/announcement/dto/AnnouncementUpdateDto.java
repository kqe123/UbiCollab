package com.ubicollab.announcement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AnnouncementUpdateDto(
		@NotBlank(message="공지 제목은 필수입니다!")
		@Size(max = 50, message="공지 제목은 50자 이내로 작성해주세요.")
		String title,
		
		@NotBlank(message="공지 내용은 필수입니다!")
		@Size(max = 1000, message="공지 내용은 1000자 이내로 작성해주세요.")
		String content
) {}
