package com.ubicollab.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record NicknameChangeDto(
	    @NotBlank(message = "닉네임을 입력해주세요.")
	    @Pattern(regexp = "^.{2,}$", message = "닉네임 : 2자 이상 입력해주세요.")
	    String nickname
	) {}

