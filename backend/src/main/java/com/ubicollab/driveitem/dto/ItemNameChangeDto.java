package com.ubicollab.driveitem.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

//파일/폴더 이름 변경 DTO
public record ItemNameChangeDto(
	// 파일/폴더명 
	@NotBlank(message = "아이템명은 필수입니다.")
	@Size(max = 100, message = "아이템 이름은 100자 이하로 입력해주세요.")
	String itemName
) {}

