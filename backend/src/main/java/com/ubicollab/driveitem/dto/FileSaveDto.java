package com.ubicollab.driveitem.dto;
import java.util.UUID;

import com.ubicollab.driveitem.DriveItem;
import jakarta.validation.constraints.Size;

// 파일 저장  DTO (내용 변경)
public record FileSaveDto ( String content ) {}