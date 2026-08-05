package com.ubicollab.user;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import java.time.LocalDateTime;

@Entity
@Table(name = "users") // PostgreSQL에서 user는 예약어(reserved keyword)이므로 users로 변경
public class User {
	// 기본키
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	
	// 필드들
	@Column(nullable=false, unique=true, length=20)
	private String username;
	
	@Column(nullable=false)
	private String password;

	@Column(nullable=false, length=15)
	private String nickname;
	
	@Column(nullable=false)
	private LocalDateTime createdDate;
	
	@Column(nullable=false)
	private String role;
	
	@Column(length=500)
	private String profileImageKey;
	
	// 기본 생성자
	public User() {}
	// 생성자
	public User(String username, String password, String nickname,
			LocalDateTime createdDate, String role, String profileImageKey) {
		this.username = username;
		this.password = password;
		this.nickname = nickname;
		this.createdDate = createdDate;
		this.role = role;
		this.profileImageKey = profileImageKey;
	}
	
	//접근자들, 설정자들
	public Long getId() {
		return id;
	}
		
	public String getUsername() {
		return username;
	}
		
	public void setUsername(String username) {
		this.username = username;
	}
	
	public String getPassword() {
		return password;
	}
	
	public void setPassword(String password) {
		this.password = password;
	}
	
	public String getNickname() {
		return nickname;
	}
	
	public void setNickname(String nickname) {
		this.nickname = nickname;
	}
	
	public LocalDateTime getCreatedDate() {
		return createdDate;
	}
	
	public void setCreatedDate(LocalDateTime createdDate) {
		this.createdDate = createdDate;
	}
	
	public String getRole() {
		return role;
	}
	
	public void setRole(String role) {
		this.role = role;
	}
	
	public String getProfileImageKey() {
		return profileImageKey;
	}
	
	public void setProfileImageKey(String profileImageKey) {
		this.profileImageKey = profileImageKey;
	}
	
}
