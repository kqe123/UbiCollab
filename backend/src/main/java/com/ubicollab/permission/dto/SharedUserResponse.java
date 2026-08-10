package com.ubicollab.permission.dto;

import com.ubicollab.permission.enums.PermissionType;
import com.ubicollab.user.User;

public class SharedUserResponse {
	private Long id;
	private String username;
	private String nickname;
	private String profileImageKey;
	private PermissionType type;
	
	
	public SharedUserResponse(User user, PermissionType type) {
		this.id = user.getId();
		this.username = user.getUsername();
		this.nickname = user.getNickname();
		this.profileImageKey = user.getProfileImageKey();
		this.type = type;
	}
	
	public Long getId() {
		return id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getNickname() {
		return nickname;
	}

	public void setNickname(String nickname) {
		this.nickname = nickname;
	}

	public String getProfileImageKey() {
		return profileImageKey;
	}

	public void setProfileImageKey(String profileImageKey) {
		this.profileImageKey = profileImageKey;
	}

	public PermissionType getType() {
		return type;
	}

	public void setType(PermissionType type) {
		this.type = type;
	}
	
}
