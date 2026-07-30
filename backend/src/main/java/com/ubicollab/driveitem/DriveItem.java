package com.ubicollab.driveitem;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;
import java.time.LocalDateTime;
import com.ubicollab.driveitem.enums.DriveItemExtension;
import com.ubicollab.driveitem.enums.DriveItemType;
import com.ubicollab.user.User;

@Entity
public class DriveItem {
	// 기본키
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	
	// URL에 노출할 랜덤 ID
    @Column(nullable = false, unique = true, updatable = false, length = 21)
    private String publicId;
	
	// 아이템 이름 (폴더명/파일명)
	@Column(nullable=false,length=100)
	private String itemName;

	// 타입 (FOLDER/FILE)
	@Enumerated(EnumType.STRING)
	@Column(nullable=false)
    private DriveItemType type;
	
	// 부모 (상위 폴더 ID, 자기 참조)
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "parent_id")
    private DriveItem parent;
	
	// 만든 사람 (외래키)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
	
    // 내용 (파일이면 O, 폴더면 X)
	@Column(columnDefinition = "TEXT")
	private String content;
	
	// 확장자 (파일이면 O, 폴더면 X)
	@Enumerated(EnumType.STRING)
	private DriveItemExtension extension;
		
	// 크기 (파일이면 O, 폴더면 X)
	private Long size;
	
	// 생성 날짜
	@Column(nullable=false, updatable = false)
	private LocalDateTime createdDate;
	
	// 휴지통에 있는지 여부
	@Column(nullable=false)
	private Boolean isInTrash = false;
	
	//생성자
	public DriveItem() {}
	
	public DriveItem(String publicId, String itemName,
					DriveItemType type, DriveItem parent, User user,
		    		String content, DriveItemExtension extension, Long size,
		    		LocalDateTime createdDate, Boolean isInTrash) {
		this.publicId = publicId;
		this.itemName = itemName;
		this.type = type;
		this.parent = parent;
		this.user = user;
		this.content = content;
		this.extension = extension;
		this.size = size;
		this.createdDate = createdDate;
		this.isInTrash = isInTrash;
	}
	
	public String getPublicId() {
		return publicId;
	}

	public void setPublicId(String publicId) {
		this.publicId = publicId;
	}

	public Long getId() {
		return id;
	}

	public String getItemName() {
		return itemName;
	}

	public void setItemName(String itemName) {
		this.itemName = itemName;
	}

	public DriveItemType getType() {
		return type;
	}

	public void setType(DriveItemType type) {
		this.type = type;
	}

	public DriveItem getParent() {
		return parent;
	}

	public void setParent(DriveItem parent) {
		this.parent = parent;
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

	public DriveItemExtension getExtension() {
		return extension;
	}

	public void setExtension(DriveItemExtension extension) {
		this.extension = extension;
	}

	public Long getSize() {
		return size;
	}

	public void setSize(Long size) {
		this.size = size;
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
	
}

 