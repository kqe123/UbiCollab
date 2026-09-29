package com.ubicollab.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

// 회원가입 DTO
public record SignupDto(
	@NotBlank(message = "아이디를 입력해주세요.")
	@Pattern(
		regexp = "^[a-z0-9_-]{5,20}$",
		message = "아이디 : 5~20자의 영문 소문자, 숫자와 특수기호(_),(-)만 사용 가능"
	)
	String username,
	
	@NotBlank(message = "비밀번호를 입력해주세요.")
	@Pattern(
	    regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]).{8,16}$",
	    message = "비밀번호: 8~16자의 영문 대/소문자, 숫자, 특수문자를 포함해야 합니다."
	)
	String password,
	
	@NotBlank(message = "닉네임을 입력해주세요.")
	@Pattern(
	    regexp = "^.{2,}$",
	    message = "닉네임 : 2자 이상 입력해주세요."
	)
	String nickname
) {}
