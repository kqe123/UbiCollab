package com.ubicollab.comment;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.annotations.UuidGenerator;

import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.enums.DriveItemExtension;
import com.ubicollab.driveitem.enums.DriveItemType;
import com.ubicollab.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Comment {
	// 기본키
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
		
	// URL에 노출할 UUID
	@UuidGenerator 
	@Column(nullable = false, unique = true, updatable = false, length = 50)
	private UUID publicId;
	    
	// 부모 (상위 댓글, 자기 참조)
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "parent_id")
	@OnDelete(action = OnDeleteAction.SET_NULL)
	private Comment parent;
	
    // 댓글 대상 파일
 	@ManyToOne(fetch = FetchType.LAZY)
 	@JoinColumn(name = "file_id", nullable = false)
 	@OnDelete(action = OnDeleteAction.CASCADE)
 	private DriveItem file;
	
	// 댓글 작성자 (외래키)
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	private User user;
	
	// 내용
	@Column(columnDefinition = "TEXT")
	private String content;
		
	// 댓글 작성 날짜
	@Column(nullable=false, updatable = false)
	private LocalDateTime createdDate;
	
	//생성자
	public Comment() {}
		
	public Comment(Comment parent, DriveItem file, User user,
			    		 String content, LocalDateTime createdDate) {
			this.parent = parent;
			this.file = file;
			this.user = user;
			this.content = content;
			this.createdDate = createdDate;
	}
	
	public Long getId() {
		return id;
	}

	public UUID getPublicId() {
		return publicId;
	}

	public Comment getParent() {
		return parent;
	}

	public void setParent(Comment parent) {
		this.parent = parent;
	}

	public DriveItem getFile() {
		return file;
	}

	public void setFile(DriveItem file) {
		this.file = file;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
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
}
