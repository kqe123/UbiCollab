package com.ubicollab.permission;

import java.time.LocalDateTime;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.permission.enums.PermissionType;
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
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
	name = "permission",
	uniqueConstraints = {
	    @UniqueConstraint(
	        name = "uk_permission_user_item",
	        columnNames = {"user_id", "item_id"} // user + DriveItem 조합이 unique
	    )
	}
)
public class Permission {
	// 기본키
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	
	// 공유받은 대상자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;
	
    // 공유 대상 파일 또는 폴더
 	@ManyToOne(fetch = FetchType.LAZY)
 	@JoinColumn(name = "item_id")
 	@OnDelete(action = OnDeleteAction.CASCADE)
 	private DriveItem item;
 	
 	// 권한 타입(Viewer, Commentor, Editor, Manager, Owner)
 	@Enumerated(EnumType.STRING)
 	@Column(nullable=false)
 	private PermissionType type;
    
	// 생성 날짜
	@Column(nullable=false, updatable = false)
	private LocalDateTime createdDate;
	
	// 생성자
	public Permission() {}
	
	public Permission(User user, DriveItem item, PermissionType type,
					LocalDateTime createdDate) {
		this.user = user;
		this.item = item;
		this.type = type;
		this.createdDate = createdDate;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public DriveItem getItem() {
		return item;
	}

	public void setItem(DriveItem item) {
		this.item = item;
	}

	public PermissionType getType() {
		return type;
	}

	public void setType(PermissionType type) {
		this.type = type;
	}

	public LocalDateTime getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(LocalDateTime createdDate) {
		this.createdDate = createdDate;
	}
}
