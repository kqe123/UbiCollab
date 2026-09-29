package com.ubicollab.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

// 비밀번호 변경 DTO
public record PasswordChangeDto(
	@NotBlank(message = "현재 비밀번호를 입력해주세요.")
	String currentPassword,
	
	@NotBlank(message = "새 비밀번호를 입력해주세요.")
	@Pattern(
	    regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]).{8,16}$",
	    message = "비밀번호: 8~16자의 영문 대/소문자, 숫자, 특수문자를 포함해야 합니다."
	)
	String newPassword
) {}
