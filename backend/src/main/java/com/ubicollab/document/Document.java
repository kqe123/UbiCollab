package com.ubicollab.document;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import java.time.LocalDateTime;


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
	
	@Column(nullable=false)
	private LocalDateTime createdDate;
	
	@Column(nullable=false)
	private boolean isInTrash = false;
	
	@Column(nullable=false, length=20)
	private String extension;
	
	@Column(nullable=false)
	private Long fileSize;
	
	//생성자
	public Document() {}
	
	public Document(String fileName, String content, LocalDateTime createdDate,
					boolean isInTrash, String extension, Long fileSize) {
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
	
	public boolean getIsInTrash() {
		return isInTrash;
	}
	
	public void setIsInTrash(boolean isInTrash) {
		this.isInTrash = isInTrash;
	}
	
	public String getExtension() {
		return extension;
	}
	
	public void setExtension(String extension) {
		this.extension = extension;
	}
	
	public Long getFileSize() {
	    return fileSize;
	}

	public void setFileSize(Long fileSize) {
	    this.fileSize = fileSize;
	}
}

 