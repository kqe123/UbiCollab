package com.ubicollab.user.dto;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ProfileChangeDto(
	    @NotBlank(message = "닉네임을 입력해주세요.")
	    @Pattern(regexp = "^.{2,15}$", message = "닉네임 : 2자 이상 입력해주세요.")
	    String nickname,
	    MultipartFile file // 프로필 사진이 없으면 null
	) {}

