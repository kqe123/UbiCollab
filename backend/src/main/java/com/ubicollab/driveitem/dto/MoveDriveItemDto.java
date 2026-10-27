package com.ubicollab.driveitem.dto;
import java.util.UUID;

// 파일/폴더 이동 DTO
public record MoveDriveItemDto(
		// 부모 publicId
		UUID parentId
) {}
