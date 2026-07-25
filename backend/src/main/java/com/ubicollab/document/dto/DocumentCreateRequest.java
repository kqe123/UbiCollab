package com.ubicollab.document.dto;
import com.ubicollab.document.enums.DocumentExtension;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;


public class DocumentCreateRequest {

	@NotNull(message = "파일명은 필수입니다.")
    @NotBlank(message = "파일명은 필수입니다.")
    @Size(max = 100, message = "파일명은 100자 이하로 입력해주세요.")
    private String fileName;
    
    private String content;
    
    @NotNull(message = "확장자는 필수입니다.")
    private DocumentExtension extension;

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

    public DocumentExtension getExtension() {
        return extension;
    }

    public void setExtension(DocumentExtension extension) {
        this.extension = extension;
    }
}