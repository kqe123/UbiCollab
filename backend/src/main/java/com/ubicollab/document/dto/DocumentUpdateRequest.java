package com.ubicollab.document.dto;
import com.ubicollab.document.enums.DocumentExtension;
import jakarta.validation.constraints.Size;

public class DocumentUpdateRequest {

    @Size(max = 100, message = "파일명은 100자 이하로 입력해주세요.")
    private String fileName;

    private String content;

    private DocumentExtension extension;

    private Boolean isInTrash;

    // Getter
    public String getFileName() {
        return fileName;
    }

    public String getContent() {
        return content;
    }

    public DocumentExtension getExtension() {
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

    public void setExtension(DocumentExtension extension) {
        this.extension = extension;
    }

    public void setIsInTrash(Boolean isInTrash) {
        this.isInTrash = isInTrash;
    }
}