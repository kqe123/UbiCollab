package com.ubicollab.driveitem.dto;
import com.ubicollab.driveitem.enums.DriveItemExtension;

import jakarta.validation.constraints.Size;

public class DriveItemRequest {

    @Size(max = 100, message = "파일명은 100자 이하로 입력해주세요.")
    private String fileName;

    private String content;

    private DriveItemExtension extension;

    private Boolean isInTrash;

    // Getter
    public String getFileName() {
        return fileName;
    }

    public String getContent() {
        return content;
    }

    public DriveItemExtension getExtension() {
        return extension;
    }

    public Boolean getIsInTrash() {
        return isInTrash;
    }

    // Setter
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setExtension(DriveItemExtension extension) {
        this.extension = extension;
    }

    public void setIsInTrash(Boolean isInTrash) {
        this.isInTrash = isInTrash;
    }
}