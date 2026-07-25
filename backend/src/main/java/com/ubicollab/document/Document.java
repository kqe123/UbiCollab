package com.ubicollab.document;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import java.time.LocalDateTime;
import com.ubicollab.document.enums.DocumentExtension;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
public class Document {
	// 기본키
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	
	// 필드들 (외래키 userId, folderId는 추후 개발할 때 만들 예정)
	@Column(nullable=false,length=100)
	private String fileName;
	
	@Column(columnDefinition = "TEXT", nullable=false)
	private String content;
	
	@Column(nullable=false, updatable = false)
	private LocalDateTime createdDate;
	
	@Column(nullable=false)
	private Boolean isInTrash = false;
	
	@Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentExtension extension;
	
	@Column(nullable=false)
	private Long fileSize;
	
	//생성자
	public Document() {}
	
	public Document(String fileName, String content, LocalDateTime createdDate,
					boolean isInTrash, DocumentExtension extension, Long fileSize) {
		this.fileName = fileName;
		this.content = content;
		this.createdDate = createdDate;
		this.isInTrash = isInTrash;
		this.extension = extension;
		this.fileSize = fileSize;
	}
	
	//접근자들, 설정자들
	public Long getId() {
		return id;
	}
	
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
	
	public LocalDateTime getCreatedDate() {
		return createdDate;
	}
	
	public void setCreatedDate(LocalDateTime createdDate) {
		this.createdDate = createdDate;
	}
	
	public Boolean getIsInTrash() {
		return isInTrash;
	}
	
	public void setIsInTrash(Boolean isInTrash) {
		this.isInTrash = isInTrash;
	}
	
	public DocumentExtension getExtension() {
		return extension;
	}
	
	public void setExtension(DocumentExtension extension) {
		this.extension = extension;
	}
	
	public Long getFileSize() {
	    return fileSize;
	}

	public void setFileSize(Long fileSize) {
	    this.fileSize = fileSize;
	}
}

 