package com.ubicollab.announcement;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.annotations.UuidGenerator;

import com.ubicollab.comment.Comment;
import com.ubicollab.comment.enums.CommentAnchorType;
import com.ubicollab.driveitem.DriveItem;
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
public class Announcement {
	// 기본키
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
			
	// URL에 노출할 UUID (자동 생성)
	@UuidGenerator 
	@Column(nullable = false, unique = true, updatable = false, length = 50)
	private UUID publicId;

	// 공지 대상 파일
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "file_id", nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	private DriveItem file;
		
	// 공지 작성자 (외래키)
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	private User user;
	
	// 공지 내용
	@Column(length = 50, nullable = false)
	private String title;
	
	// 공지 내용
	@Column(length = 1000, nullable = false)
	private String content;
			
	// 공지 작성 날짜
	@Column(nullable=false, updatable = false)
	private LocalDateTime createdDate;
		
	// 공지 수정 날짜 (null O)
	private LocalDateTime updatedDate;

	//생성자
	public Announcement() {}
			
	public Announcement(DriveItem file, User user, String title,
						String content, LocalDateTime createdDate) {
		this.file = file;
		this.user = user;
		this.title = title;
		this.content = content;
		this.createdDate = createdDate;
	}
	
	// ID, publicId, File, User, createdDate는 Setter가 필요없으므로 Setter가 없음
	public Long getId() {
		return id;
	}

	public UUID getPublicId() {
		return publicId;
	}

	public DriveItem getFile() {
		return file;
	}

	public User getUser() {
		return user;
	}
	
	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
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

	public LocalDateTime getUpdatedDate() {
		return updatedDate;
	}

	public void setUpdatedDate(LocalDateTime updatedDate) {
		this.updatedDate = updatedDate;
	}
}
