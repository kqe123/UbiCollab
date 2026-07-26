package com.ubicollab.driveitem.dto;
import com.ubicollab.driveitem.enums.DriveItemExtension;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;


public class DriveItemCreateRequest {

	@NotNull(message = "파일명은 필수입니다.")
    @NotBlank(message = "파일명은 필수입니다.")
    @Size(max = 100, message = "파일명은 100자 이하로 입력해주세요.")
    private String fileName;
    
    private String content;
    
    @NotNull(message = "확장자는 필수입니다.")
    private DriveItemExtension extension;

    // getter, setter
    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public DriveItemExtension getExtension() {
        return extension;
    }

    public void setExtension(DriveItemExtension extension) {
        this.extension = extension;
    }
}